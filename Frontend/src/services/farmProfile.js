export const FARM_PROFILE_KEY = "krishi_farm_profile_v2";

export function readFarmProfile() {
  try {
    return JSON.parse(localStorage.getItem(FARM_PROFILE_KEY) || "null");
  } catch {
    return null;
  }
}

export function getFarmCrop(profile = readFarmProfile()) {
  if (profile?.farmingStatus === "active") return profile.activeFarming?.cropName || "";
  return profile?.planningFarming?.primaryCrop
    || profile?.planningFarming?.interestedCrops?.[0]
    || profile?.planningFarming?.cropRecommendation?.recommended_crop
    || "";
}

export function getFarmLocationLabel(profile = readFarmProfile()) {
  return [profile?.farmLocation?.village, profile?.farmLocation?.district, profile?.farmLocation?.state]
    .filter(Boolean)
    .join(", ");
}
