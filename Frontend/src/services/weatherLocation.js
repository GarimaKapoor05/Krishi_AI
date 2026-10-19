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
  const match = matches.find((item) => item.country_code === "IN" && normalize(item.admin1).includes(state))
    || matches.find((item) => item.country_code === "IN");
  if (!match) throw new Error(`No weather location was found for ${location.district}, ${location.state}. Check the district and state in your profile.`);

  const weatherResponse = await marketIntelWeather({ lat: match.latitude, lon: match.longitude });
  return { ...weatherResponse.data, locationName: [match.name, match.admin1].filter(Boolean).join(", ") };
}
