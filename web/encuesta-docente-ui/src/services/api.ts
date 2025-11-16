// src/services/api.ts
import axios, { AxiosHeaders } from "axios";

const BASE =
  (import.meta as any).env?.VITE_API_URL || "http://localhost:8000/api/v1";

const api = axios.create({
  baseURL: BASE,
  timeout: Number((import.meta as any).env?.VITE_API_TIMEOUT || 30000), // 30 segundos
});

// Asegura JSON por defecto en envíos
(api.defaults.headers.post as any) = new AxiosHeaders({
  "Content-Type": "application/json",
});
(api.defaults.headers.put as any) = new AxiosHeaders({
  "Content-Type": "application/json",
});

api.interceptors.request.use((config) => {
  // Normaliza headers a AxiosHeaders para evitar problemas de tipos
  const headers = new AxiosHeaders(config.headers || {});

  // Token
  const t = localStorage.getItem("token");
  if (t) headers.set("Authorization", `Bearer ${t}`);

  // Id de turno (si existe)
  const turnoId = sessionStorage.getItem("turnoId");
  if (turnoId) headers.set("X-Turno-Id", turnoId);

  config.headers = headers;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    const status = err?.response?.status;

    // Límite de turnos alcanzado
    if (status === 403) {
      const code = err?.response?.data?.code || "";
      const detail =
        err?.response?.data?.detail || "Has alcanzado el límite de turnos.";
      if (code === "TURN_LIMIT_REACHED" || /l(i|í)mite.*turn/i.test(detail)) {
        alert(detail);
        sessionStorage.removeItem("turnoId");
        // Vuelve a la intro para cerrar el flujo
        location.assign("/intro");
        return Promise.reject(err);
      }
    }

    // Token vencido / inválido
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

// Log cortito en dev
if (typeof window !== "undefined" && location.hostname === "localhost") {
  // eslint-disable-next-line no-console
  console.info("[API] baseURL =", api.defaults.baseURL);
}

export default api;
