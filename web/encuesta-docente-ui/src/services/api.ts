// src/services/api.ts
import axios, { AxiosHeaders } from "axios";

const BASE =
  (import.meta as any).env?.VITE_API_URL || "http://localhost:8000/api/v1";

const api = axios.create({
  baseURL: BASE,
  timeout: Number((import.meta as any).env?.VITE_API_TIMEOUT || 10000),
});

api.interceptors.request.use((config) => {
  const t = localStorage.getItem("token");
  if (t) {
    // Asegura un objeto headers compatible con Axios v1 (AxiosHeaders)
    if (!config.headers) {
      config.headers = new AxiosHeaders() as any;
    }
    (config.headers as any).Authorization = `Bearer ${t}`;
  }
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    const status = err?.response?.status;
    if (status === 401 || status === 419 || status === 440) {
      try {
        localStorage.removeItem("token");
        sessionStorage.clear();
      } finally {
        if (location.pathname !== "/login") location.replace("/login");
      }
    }
    return Promise.reject(err);
  }
);

export default api;
