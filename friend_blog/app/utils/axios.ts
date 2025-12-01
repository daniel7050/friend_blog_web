import axios from "axios";

const instance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000",
  withCredentials: true,
});

// Attach Authorization header from localStorage (token-based auth)
instance.interceptors.request.use(
  (config) => {
    try {
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("token");
        if (token) {
          config.headers = config.headers || {};
          (config.headers as Record<string, string>)[
            "Authorization"
          ] = `Bearer ${token}`;
        }
      }
    } catch {
      // ignore
    }
    return config;
  },
  (err) => Promise.reject(err)
);

export default instance;
