import api from "./api";

export async function login(email: string) {
  const { data } = await api.post("/auth/login", { email });
  // servidor devuelve { access_token, token_type } y/o me
  const token = data?.access_token || data?.token || data;
  if (!token) throw new Error("Token no recibido");
  localStorage.setItem("token", token);
  return token;
}

export type MeOut = {
  id: string;
  email: string;
  nombre?: string;
  rol?: string;
};

export async function me(): Promise<MeOut> {
  const { data } = await api.get<MeOut>("/auth/me");
  return data;
}

/** Cierre de sesión robusto + broadcast a otras pestañas. */
export async function logout(opts?: {
  server?: boolean;
  closeTurno?: boolean;
}) {
  // 1) Cerrar turno abierto (idempotente en backend)
  try {
    const turnoId = sessionStorage.getItem("turnoId");
    if (opts?.closeTurno !== false && turnoId) {
      await api.post("/sessions/turno/close", null, {
        headers: { "X-Turno-Id": turnoId },
      });
    }
  } catch {
    // ignorar: si ya estaba cerrado/no existe, no bloquea el logout
  }

  // 2) (Opcional) logout de servidor si tienes endpoint dedicado
  try {
    if (opts?.server) {
      await api.post("/auth/logout");
    }
  } catch {
    // sin bloquear el cierre local
  }

  // 3) Limpieza local + broadcast a otras pestañas
  try {
    localStorage.removeItem("token");
    sessionStorage.clear(); // también elimina turnoId y cualquier cache de página
    localStorage.setItem("__logout__", String(Date.now())); // trigger storage event
    localStorage.removeItem("__logout__");
  } catch {
    // noop
  }
}
