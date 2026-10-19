import api from "./api";

const PROFILE_KEY = "krishi_farm_profile_v2";

export async function createOnboardingAccount({ account, farmLocation }) {
  const email = account.email.trim().toLowerCase();
  const usernameBase = (email.split("@")[0] || "farmer").replace(/[^a-z0-9_]/g, "").slice(0, 32);
  const username = `${usernameBase || "farmer"}_${Date.now().toString(36)}`;

  try {
    const response = await api.post("/auth/register", {
      username,
      email,
      password: account.password,
      farm_size: farmLocation.farmSize ? Number(farmLocation.farmSize) : null,
      location: [farmLocation.village, farmLocation.district].filter(Boolean).join(", ") || "India"
    });
    return { source: "backend", data: response.data };
  } catch (error) {
    const serverMessage = error.response?.data?.error || error.response?.data?.message;
    if (serverMessage) throw new Error(serverMessage);

    if (import.meta.env.DEV) {
      return {
        source: "development_preview",
        message: "The backend could not be reached. You can preview onboarding, but this account was not created."
      };
    }
    throw new Error("Account creation is unavailable right now. Please try again when the server is reachable.");
  }
}

export function saveFarmProfileLocally(profile) {
  const sanitized = JSON.parse(JSON.stringify(profile));
  if (sanitized.account) {
    delete sanitized.account.password;
    delete sanitized.account.confirmPassword;
  }
  if (sanitized.planningFarming?.soilPhoto) {
    const { name, size, type } = sanitized.planningFarming.soilPhoto;
    sanitized.planningFarming.soilPhoto = { name, size, type };
  }
  sanitized.meta = {
    ...sanitized.meta,
    completedAt: new Date().toISOString(),
    isDraft: false,
    persistence: "browser_local_storage"
  };

  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(sanitized));
  } catch {
    throw new Error("Your browser could not save this profile. Check available storage and try again.");
  }

  return {
    source: "local_storage_fixture",
    note: "Farm profile saved in this browser only. The backend does not yet store the full farm profile; the optional soil photo is neither uploaded nor analyzed."
  };
}
