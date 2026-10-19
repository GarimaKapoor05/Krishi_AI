/**
 * Base API Client for Krishi AI
 * 
 * Implemented using the native Fetch API with timeout support and automatic
 * Bearer token injection. Avoids heavyweight network dependencies while
 * maintaining full compatibility with the existing Flask backend endpoints.
 */

export const API_BASE_URL =
  typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL
    ? import.meta.env.VITE_API_URL
    : "http://localhost:5000";

export const apiClient = {
  async get(endpoint) {
    const token = typeof localStorage !== "undefined" ? localStorage.getItem("krishi_token") : null;
    const headers = {
      "Content-Type": "application/json"
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    try {
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "GET",
        headers,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const err = new Error(data.error || `HTTP Error ${res.status}`);
        err.response = { status: res.status, data };
        throw err;
      }

      return { data };
    } catch (err) {
      clearTimeout(timeoutId);
      throw err;
    }
  },

  async post(endpoint, payload) {
    const token = typeof localStorage !== "undefined" ? localStorage.getItem("krishi_token") : null;
    const headers = {
      "Content-Type": "application/json"
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    try {
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const err = new Error(data.error || `HTTP Error ${res.status}`);
        err.response = { status: res.status, data };
        throw err;
      }

      return { data };
    } catch (err) {
      clearTimeout(timeoutId);
      throw err;
    }
  }
};

export default apiClient;
