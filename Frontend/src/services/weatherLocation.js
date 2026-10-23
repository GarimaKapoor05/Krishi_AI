import { marketIntelWeather } from "./marketIntel";

const normalize = (value = "") => value.toLocaleLowerCase().replace(/[^a-z]/g, "");
const climateCache = new Map();
const LOCATION_ALIASES = {
  bangalore: "bengaluru",
  gurgaon: "gurugram",
  allahabad: "prayagraj",
  faizabad: "ayodhya",
  newdelhi: "delhi",
  nctofdelhi: "delhi",
  nationalcapitalterritoryofdelhi: "delhi",
  andamannicobarislands: "andamanandnicobarislands",
  jammukashmir: "jammuandkashmir",
  dadranagarhavelianddamanddiu: "dadraandnagarhavelianddamanddiu",
  pondicherry: "puducherry",
};
const canonicalLocation = (value = "") => {
  const cleaned = normalize(value).replace(/(district|city)$/g, "");
  return LOCATION_ALIASES[cleaned] || cleaned;
};

async function resolveFarmCoordinates(location) {
  const hasPinnedCoordinates = location?.latitude !== null && location?.latitude !== undefined && location?.latitude !== ""
    && location?.longitude !== null && location?.longitude !== undefined && location?.longitude !== "";
  const latitude = hasPinnedCoordinates ? Number(location.latitude) : Number.NaN;
  const longitude = hasPinnedCoordinates ? Number(location.longitude) : Number.NaN;
  if (Number.isFinite(latitude) && latitude >= -90 && latitude <= 90
    && Number.isFinite(longitude) && longitude >= -180 && longitude <= 180) {
    return {
      latitude,
      longitude,
      name: location.village || location.district || "Pinned farm",
      admin1: location.state || "India",
      country_code: "IN",
      isFarmPin: true,
    };
  }
  if (!location?.district || !location?.state) {
    throw new Error("Add your district and state in your farm profile to get local weather.");
  }

  const params = new URLSearchParams({ name: location.district, count: "10", language: "en", format: "json", countryCode: "IN" });
  let response;
  try {
    response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?${params}`, {
      signal: AbortSignal.timeout(10000),
    });
  } catch {
    throw new Error("The location service could not be reached. Check your connection and try again.");
  }
  if (!response.ok) throw new Error("Could not look up this farm location for weather.");

  const result = await response.json();
  const matches = result.results || [];
  const state = canonicalLocation(location.state);
  const district = canonicalLocation(location.district);
  const match = matches.find((item) => {
    if (item.country_code !== "IN" || !item.admin1 || !item.name) return false;
    const resultState = canonicalLocation(item.admin1);
    const resultDistrict = canonicalLocation(item.name);
    const delhiNames = new Set(["delhi", "nationalcapitalterritoryofdelhi"]);
    const stateMatches = resultState === state || (delhiNames.has(resultState) && delhiNames.has(state));
    const districtMatches = resultDistrict === district;
    return stateMatches && districtMatches;
  });
  if (!match) throw new Error(`We couldn't verify ${location.district} in ${location.state}. Check both fields before requesting local data.`);
  return match;
}

export async function getFarmWeather(location) {
  const match = await resolveFarmCoordinates(location);

  const locationName = match.isFarmPin
    ? [location.village, location.district, location.state].filter(Boolean).join(", ") || "Pinned farm location"
    : [match.name, match.admin1].filter(Boolean).join(", ");
  try {
    const weatherResponse = await marketIntelWeather({ lat: match.latitude, lon: match.longitude });
    const data = weatherResponse.data;
    const hasCompleteForecast = Array.isArray(data?.days) && data.days.filter(hasClimateValues).length >= 5;
    if (hasCompleteForecast && data?.current?.temperature_2m != null) return { ...data, locationName };
  } catch {
    // Older or temporarily unavailable backend weather routes are recovered below.
  }

  // Direct Open-Meteo fallback also supports deployments whose backend does not
  // yet return hourly humidity in its weather response.
  const forecastParams = new URLSearchParams({
    latitude: String(match.latitude),
    longitude: String(match.longitude),
    current: "temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,weather_code",
    daily: "temperature_2m_max,temperature_2m_min,precipitation_sum,et0_fao_evapotranspiration",
    hourly: "relative_humidity_2m",
    timezone: "Asia/Kolkata",
    forecast_days: "7",
  });
  let forecastResponse;
  try {
    forecastResponse = await fetch(`https://api.open-meteo.com/v1/forecast?${forecastParams}`, {
      signal: AbortSignal.timeout(12000),
    });
  } catch {
    throw new Error("Local weather is temporarily unreachable. Please check your connection and try again.");
  }
  if (!forecastResponse.ok) throw new Error("Local weather is temporarily unavailable. Please try again shortly.");

  const forecast = await forecastResponse.json();
  const humidityByDate = new Map();
  (forecast.hourly?.time || []).forEach((timestamp, index) => {
    const humidity = forecast.hourly?.relative_humidity_2m?.[index];
    if (humidity == null || !Number.isFinite(Number(humidity))) return;
    const date = timestamp.split("T", 1)[0];
    const values = humidityByDate.get(date) || [];
    values.push(Number(humidity));
    humidityByDate.set(date, values);
  });
  const days = (forecast.daily?.time || []).map((date, index) => {
    const humidity = humidityByDate.get(date) || [];
    return {
      date,
      temp_max_c: forecast.daily?.temperature_2m_max?.[index] ?? null,
      temp_min_c: forecast.daily?.temperature_2m_min?.[index] ?? null,
      rainfall_mm: forecast.daily?.precipitation_sum?.[index] ?? null,
      et0_mm: forecast.daily?.et0_fao_evapotranspiration?.[index] ?? null,
      humidity_percent: humidity.length ? Math.round(humidity.reduce((sum, value) => sum + value, 0) / humidity.length * 10) / 10 : null,
    };
  });
  if (days.filter(hasClimateValues).length < 5) {
    throw new Error("The weather service returned incomplete local data. Please try again later.");
  }
  return {
    latitude: match.latitude,
    longitude: match.longitude,
    current: forecast.current || null,
    days,
    locationName,
    meta: { source: "Open-Meteo", is_live: true, fetched_at: new Date().toISOString() },
  };
}

const SEASON_MONTHS = {
  kharif: new Set([6, 7, 8, 9, 10]),
  rabi: new Set([10, 11, 12, 1, 2, 3]),
  zaid: new Set([3, 4, 5, 6]),
};

/**
 * Builds a typical in-season climate snapshot from the previous ten complete
 * years of daily historical weather. This deliberately does not use the
 * seven-day forecast for a seasonal crop shortlist.
 */
export async function getFarmSeasonalClimate(location, season) {
  const months = SEASON_MONTHS[season];
  if (!months) throw new Error("Choose Kharif, Rabi, or Zaid to use seasonal crop suggestions.");
  const match = await resolveFarmCoordinates(location);
  const cacheKey = `${match.latitude}|${match.longitude}|${season}`;
  if (climateCache.has(cacheKey)) return climateCache.get(cacheKey);

  const endYear = new Date().getFullYear() - 1;
  const startYear = endYear - 9;
  const params = new URLSearchParams({
    latitude: String(match.latitude),
    longitude: String(match.longitude),
    start_date: `${startYear}-01-01`,
    end_date: `${endYear}-12-31`,
    daily: "temperature_2m_mean,precipitation_sum",
    hourly: "relative_humidity_2m",
    timezone: "Asia/Kolkata",
    // ERA5 includes precipitation as well as temperature and humidity.
    // ERA5-Land does not provide precipitation on this API endpoint.
    models: "era5",
  });
  let response;
  try {
    response = await fetch(`https://archive-api.open-meteo.com/v1/archive?${params}`, {
      signal: AbortSignal.timeout(20000),
    });
  } catch {
    throw new Error("Historical seasonal weather could not be reached. Check your connection and try again.");
  }
  if (!response.ok) throw new Error("Historical seasonal weather is unavailable right now. Try again later.");
  const payload = await response.json();
  const daily = payload.daily || {};
  const humidityByDate = new Map();
  (payload.hourly?.time || []).forEach((timestamp, index) => {
    const humidity = payload.hourly?.relative_humidity_2m?.[index];
    if (humidity == null || !Number.isFinite(Number(humidity))) return;
    const date = timestamp.slice(0, 10);
    const values = humidityByDate.get(date) || [];
    values.push(Number(humidity));
    humidityByDate.set(date, values);
  });
  const groups = new Map();
  (daily.time || []).forEach((date, index) => {
    const month = Number(date.slice(5, 7));
    if (!months.has(month)) return;
    const temperature = daily.temperature_2m_mean?.[index];
    const humidityValues = humidityByDate.get(date) || [];
    const humidity = humidityValues.length
      ? humidityValues.reduce((sum, value) => sum + value, 0) / humidityValues.length
      : null;
    const rainfall = daily.precipitation_sum?.[index];
    if (![temperature, humidity, rainfall].every((value) => value != null && Number.isFinite(Number(value)))) return;
    const year = Number(date.slice(0, 4));
    const seasonYear = season === "rabi" && month >= 10 ? year + 1 : year;
    const values = groups.get(String(seasonYear)) || { temperature: [], humidity: [], rainfall: 0, days: 0 };
    values.temperature.push(Number(temperature));
    values.humidity.push(Number(humidity));
    values.rainfall += Number(rainfall);
    values.days += 1;
    groups.set(String(seasonYear), values);
  });
  const minimumDays = season === "year_round" ? 300 : 120;
  const seasons = [...groups.values()].filter((item) => item.days >= minimumDays);
  if (seasons.length < 5) throw new Error("Not enough historical weather was returned to estimate this season. Please try again later.");
  const totalDays = seasons.reduce((sum, item) => sum + item.days, 0);
  const climate = {
    temperature: seasons.reduce((sum, item) => sum + item.temperature.reduce((a, b) => a + b, 0), 0) / totalDays,
    humidity: seasons.reduce((sum, item) => sum + item.humidity.reduce((a, b) => a + b, 0), 0) / totalDays,
    rainfall: seasons.reduce((sum, item) => sum + item.rainfall, 0) / seasons.length,
    locationName: [match.name, match.admin1].filter(Boolean).join(", "),
    source: "Open-Meteo historical weather (ERA5)",
    seasonsUsed: seasons.length,
  };
  climateCache.set(cacheKey, climate);
  return climate;
}

function hasClimateValues(day) {
  return [day?.temp_max_c, day?.temp_min_c, day?.humidity_percent, day?.rainfall_mm]
    .every((value) => value != null && Number.isFinite(Number(value)));
}
