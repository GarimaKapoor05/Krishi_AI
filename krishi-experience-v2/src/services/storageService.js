/**
 * Storage & Synchronization Service for Krishi AI V2
 * 
 * Manages client persistence and cross-component reactive synchronization:
 * - Profile: krishi_farm_profile_v2
 * - Task State: krishi_task_state_v2
 * - Market Settings: krishi_market_settings_v2
 */

const PROFILE_KEY = "krishi_farm_profile_v2";
const TASKS_KEY = "krishi_task_state_v2";
const MARKET_KEY = "krishi_market_settings_v2";

const listeners = new Set();

function notifyListeners(event, data) {
  listeners.forEach((cb) => {
    try { cb(event, data); } catch (e) { console.error(e); }
  });
}

export const storageService = {
  subscribe(callback) {
    listeners.add(callback);
    return () => listeners.delete(callback);
  },

  getProfile() {
    try {
      const raw = localStorage.getItem(PROFILE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  saveProfile(profile) {
    try {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
      notifyListeners("profile_updated", profile);
    } catch (e) {
      console.warn("Storage save error", e);
    }
  },

  getTaskState() {
    try {
      const raw = localStorage.getItem(TASKS_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  },

  saveTaskState(taskState) {
    try {
      localStorage.setItem(TASKS_KEY, JSON.stringify(taskState));
      notifyListeners("tasks_updated", taskState);
    } catch (e) {
      console.warn("Storage save error", e);
    }
  },

  toggleTask(taskId, isCompleted, note = "") {
    const current = this.getTaskState();
    const existing = current[taskId] || {};
    
    current[taskId] = {
      ...existing,
      completed: isCompleted,
      completedAt: isCompleted ? new Date().toISOString() : null,
      notes: note || existing.notes || ""
    };

    this.saveTaskState(current);
    return current;
  },

  rescheduleTask(taskId, newDateStr, reasonNote = "") {
    const current = this.getTaskState();
    const existing = current[taskId] || {};

    current[taskId] = {
      ...existing,
      rescheduledDate: newDateStr,
      notes: reasonNote ? `${existing.notes ? existing.notes + " | " : ""}Rescheduled: ${reasonNote}` : existing.notes
    };

    this.saveTaskState(current);
    return current;
  },

  updateTaskNote(taskId, note) {
    const current = this.getTaskState();
    const existing = current[taskId] || {};

    current[taskId] = {
      ...existing,
      notes: note
    };

    this.saveTaskState(current);
    return current;
  },

  getMarketSettings() {
    try {
      const raw = localStorage.getItem(MARKET_KEY);
      return raw ? JSON.parse(raw) : { selectedCrop: "Wheat", selectedMandi: "punjab_khanna" };
    } catch {
      return { selectedCrop: "Wheat", selectedMandi: "punjab_khanna" };
    }
  },

  saveMarketSettings(settings) {
    try {
      localStorage.setItem(MARKET_KEY, JSON.stringify(settings));
      notifyListeners("market_settings_updated", settings);
    } catch (e) {
      console.warn("Storage save error", e);
    }
  }
};
