import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true); // true while checking localStorage on mount

  // On app load — restore session from localStorage if it exists
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch {
        // Corrupted data — clear it
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }

    setLoading(false);
  }, []);

  // Protected API calls can discover an expired token after the app has
  // restored it from storage. Keep the UI session in sync with that response.
  useEffect(() => {
    const handleExpiredSession = () => {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setToken(null);
      setUser(null);
    };
    window.addEventListener("krishi:auth-expired", handleExpiredSession);
    return () => window.removeEventListener("krishi:auth-expired", handleExpiredSession);
  }, []);

  // Call this after a successful login API response
  const login = (accessToken, userData) => {
    localStorage.setItem("token", accessToken);
    localStorage.setItem("user", JSON.stringify(userData));
    setToken(accessToken);
    setUser(userData);
  };

  // Call this on logout
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  };

  const isLoggedIn = !!token;

  return (
    <AuthContext.Provider value={{ user, token, isLoggedIn, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook — use this in any component instead of useContext(AuthContext)
export function useAuth() {
  return useContext(AuthContext);
}
