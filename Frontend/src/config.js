const configuredApiUrl = import.meta.env.VITE_API_URL?.trim();

// Use the local Flask server only in development. Production can set
// VITE_API_URL for a separate backend, or use same-origin API proxying.
export const API_URL = configuredApiUrl || (
  import.meta.env.DEV ? "http://127.0.0.1:5000" : window.location.origin
);
