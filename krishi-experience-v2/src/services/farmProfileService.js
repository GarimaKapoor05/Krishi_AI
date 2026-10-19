/**
 * Phase 1 farm-profile storage.
 *
 * The Flask backend has no endpoint for the full farm profile yet. Keep the
 * completed profile in this browser as an explicitly local development fixture;
 * do not send it to an unverified route.
 */

const STORAGE_KEY = "krishi_farm_profile_v2";

function removeCredentials(profileData) {
  const sanitized = JSON.parse(JSON.stringify(profileData));
  if (sanitized.account) {
    delete sanitized.account.password;
    delete sanitized.account.confirmPassword;
  }
  return sanitized;
}

export const farmProfileService = {
  async saveProfile(profileData) {
    const sanitized = removeCredentials(profileData);
    sanitized.meta = {
      ...sanitized.meta,
      completedAt: new Date().toISOString(),
      isDraft: false,
      persistence: "browser_local_storage"
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized));
    } catch {
      throw new Error("Your browser could not save this profile. Check available storage and try again.");
    }

    return {
      success: true,
      source: "local_storage_fixture",
      data: sanitized,
      note: "Farm profile is saved in this browser only. Backend farm-profile storage is not implemented."
    };
  },

  getProfile() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  clearProfile() {
    localStorage.removeItem(STORAGE_KEY);
  }
};
