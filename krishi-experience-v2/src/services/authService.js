import apiClient from "./api";

/**
 * Authentication Service
 * 
 * Interacts with the backend's existing auth routes:
 * - POST /auth/register (username, email, password, phone, farm_size, location)
 * - POST /auth/login (email, password)
 * - GET /health
 * 
 * If the backend is unreachable or returns a network error, it provides a transparent
 * simulated dev response so the onboarding flow remains fully testable locally while
 * clearly indicating the connectivity status.
 */

export const authService = {
  /**
   * Health check for Krishi AI backend
   */
  async checkHealth() {
    try {
      const response = await apiClient.get("/health");
      return { isOnline: true, data: response.data };
    } catch (error) {
      return {
        isOnline: false,
        message: "Backend server (Flask:5000) not responding. Running in Local Development Fixture mode."
      };
    }
  },

  /**
   * Register farmer account
   * Maps V2 account fields to existing backend /auth/register schema
   */
  async register({ firstName, lastName, email, password, farmSize, location }) {
    const username = `${firstName.trim().toLowerCase()}_${lastName.trim().toLowerCase()}`.replace(/\s+/g, "");

    const payload = {
      username: username || email.split("@")[0],
      email: email.trim().toLowerCase(),
      password,
      farm_size: farmSize ? parseFloat(farmSize) : null,
      location: location || "India"
    };

    try {
      const response = await apiClient.post("/auth/register", payload);
      if (response.data?.access_token) {
        localStorage.setItem("krishi_token", response.data.access_token);
        localStorage.setItem("krishi_user", JSON.stringify(response.data.user));
      }
      return {
        success: true,
        source: "backend",
        data: response.data
      };
    } catch (error) {
      // If backend responded with 400 (e.g. User already exists)
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }

      // If backend is offline / unreachable (Network Error or CORS pre-flight)
      console.warn(
        "[Krishi AI V2 Auth] Backend server not reachable. Utilizing verified Development Mode Mock.",
        error.message
      );

      const mockUser = {
        id: `mock_${Date.now()}`,
        username: payload.username,
        email: payload.email,
        farm_size: payload.farm_size,
        location: payload.location,
        created_at: new Date().toISOString()
      };
      const mockToken = `mock_jwt_token_${Date.now()}`;
      localStorage.setItem("krishi_token", mockToken);
      localStorage.setItem("krishi_user", JSON.stringify(mockUser));

      return {
        success: true,
        source: "dev_mock_fixture",
        user: mockUser,
        token: mockToken,
        note: "Simulated response: Backend was offline or unreachable."
      };
    }
  },

  /**
   * Login farmer account
   */
  async login(email, password) {
    try {
      const response = await apiClient.post("/auth/login", { email, password });
      if (response.data?.access_token) {
        localStorage.setItem("krishi_token", response.data.access_token);
        localStorage.setItem("krishi_user", JSON.stringify(response.data.user));
      }
      return { success: true, source: "backend", data: response.data };
    } catch (error) {
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }

      console.warn(
        "[Krishi AI V2 Auth] Backend login not reachable. Checking mock dev session.",
        error.message
      );

      // Dev mode fallback
      const storedUser = localStorage.getItem("krishi_user");
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        if (parsed.email === email.trim().toLowerCase()) {
          return {
            success: true,
            source: "dev_mock_fixture",
            data: { user: parsed, access_token: "mock_jwt_token" }
          };
        }
      }

      throw new Error("Invalid credentials or backend offline. Please verify email and password.");
    }
  },

  logout() {
    localStorage.removeItem("krishi_token");
    localStorage.removeItem("krishi_user");
  },

  getCurrentUser() {
    try {
      const user = localStorage.getItem("krishi_user");
      return user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
  }
};
