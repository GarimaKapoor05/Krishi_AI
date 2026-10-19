import { marketIntelWeather } from "./marketIntel";

const normalize = (value = "") => value.toLocaleLowerCase().replace(/[^a-z]/g, "");

export async function getFarmWeather(location) {
  if (!location?.district || !location?.state) {
    throw new Error("Add your district and state in your farm profile to get local weather.");
  }

  const params = new URLSearchParams({ name: location.district, count: "10", language: "en", format: "json", countryCode: "IN" });
  const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?${params}`, {
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) throw new Error("Could not look up this farm location for weather.");

  const result = await response.json();
  const matches = result.results || [];
  const state = normalize(location.state);
  const match = matches.find((item) => {
    if (item.country_code !== "IN" || !item.admin1) return false;
    const resultState = normalize(item.admin1);
    return resultState === state || resultState.includes(state) || state.includes(resultState);
  });
  if (!match) throw new Error(`No weather location was found for ${location.district}, ${location.state}. Check the district and state in your profile.`);

  const locationName = [match.name, match.admin1].filter(Boolean).join(", ");
  try {
    const weatherResponse = await marketIntelWeather({ lat: match.latitude, lon: match.longitude });
    const data = weatherResponse.data;
    const hasCompleteForecast = Array.isArray(data?.days) && data.days.filter(hasClimateValues).length >= 5;
    if (hasCompleteForecast) return { ...data, locationName };
  } catch {
    // Older or temporarily unavailable backend weather routes are recovered below.
  }

  // Direct Open-Meteo fallback also supports deployments whose backend does not
  // yet return hourly humidity in its weather response.
  const forecastParams = new URLSearchParams({
    latitude: String(match.latitude),
    longitude: String(match.longitude),
    daily: "temperature_2m_max,temperature_2m_min,precipitation_sum",
    hourly: "relative_humidity_2m",
    timezone: "Asia/Kolkata",
    forecast_days: "7",
  });
  const forecastResponse = await fetch(`https://api.open-meteo.com/v1/forecast?${forecastParams}`, {
    signal: AbortSignal.timeout(12000),
  });
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
      humidity_percent: humidity.length ? Math.round(humidity.reduce((sum, value) => sum + value, 0) / humidity.length * 10) / 10 : null,
    };
  });
  if (days.filter(hasClimateValues).length < 5) {
    throw new Error("The weather service returned incomplete local data. Please try again later.");
  }
  return {
    latitude: match.latitude,
    longitude: match.longitude,
    days,
    locationName,
    meta: { source: "Open-Meteo", is_live: true, fetched_at: new Date().toISOString() },
  };
}

function hasClimateValues(day) {
  return [day?.temp_max_c, day?.temp_min_c, day?.humidity_percent, day?.rainfall_mm]
    .every((value) => value != null && Number.isFinite(Number(value)));
}
