// src/services/api.ts
import axios, { type AxiosRequestHeaders } from "axios";

const BASE =
  (import.meta as any).env?.VITE_API_URL || "http://localhost:8000/api/v1";

const api = axios.create({
  baseURL: BASE,
  timeout: Number((import.meta as any).env?.VITE_API_TIMEOUT || 10000),
});

api.interceptors.request.use((config) => {
  const t = localStorage.getItem("token");
  if (t) {
    const headers = (config.headers ?? {}) as AxiosRequestHeaders;
    headers.Authorization = `Bearer ${t}`;
    config.headers = headers;
  }
  return config;
});

// Expira sesión si el backend devuelve 401/419/440
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

console.info("[API] baseURL =", api.defaults.baseURL);
export default api;
