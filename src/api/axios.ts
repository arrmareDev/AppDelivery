import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Interceptor — agregar token automáticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("motorizado_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor — manejar 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("motorizado_token");
      localStorage.removeItem("motorizado_user");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  },
);

export default api;
