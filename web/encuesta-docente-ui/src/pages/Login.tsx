// src/pages/Login.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "@/services/auth";
import { useUser } from "@/contexts/UserContext";
import LoginHeader from "@/components/LoginHeader";

export default function Login() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [blockedMsg, setBlockedMsg] = useState<string | null>(null);

  const nav = useNavigate();
  const { refetch } = useUser();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBlockedMsg(null);
    setLoading(true);
    try {
      await login(email.trim().toLowerCase());
      await refetch(); // Refresca el contexto de usuario
      nav("/intro", { replace: true });
    } catch (e: any) {
      const status = e?.response?.status;
      const detail =
        e?.response?.data?.detail || e?.response?.data?.message || e?.message;

      if (status === 403) {
        setBlockedMsg(
          detail ||
            "Ya no tienes turnos para responder la encuesta, contacta con el administrador de la encuesta."
        );
        localStorage.removeItem("token");
      } else {
        setError(detail || "Correo no autorizado");
        localStorage.removeItem("token");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f8f5ef] flex flex-col">
      <LoginHeader />

      <main className="flex-1">
        <div className="max-w-xl mx-auto pt-10 px-4">
          <form
            onSubmit={onSubmit}
            className="bg-white p-8 rounded-2xl shadow-card"
          >
            <h1 className="text-2xl font-bold mb-2">Iniciar sesión</h1>
            <p className="text-gray-600 mb-6">
              Acceso con correo institucional <b>u2XX@usco.edu.co</b>
            </p>

            <label className="text-sm font-medium" htmlFor="email">
              Correo institucional
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              className="mt-1 w-full border rounded-xl p-3 outline-none focus:ring-2 focus:ring-usco-primary/30 focus:border-usco-primary"
              placeholder="u2xxxx@usco.edu.co o uxx.ixx@usco.edu.co"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            {error && <div className="text-red-600 mt-2">{error}</div>}

            <div className="flex gap-3 justify-end mt-6">
              <button
                type="button"
                className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200"
                onClick={() => setEmail("")}
              >
                Cancelar
              </button>
              <button
                disabled={loading}
                className="px-5 py-2 rounded-xl bg-usco-primary text-white hover:bg-usco-primary/90 disabled:opacity-60"
              >
                {loading ? "Entrando..." : "Entrar"}
              </button>
            </div>
          </form>

          <p className="text-center text-gray-500 mt-8 text-sm">
            © USCO — Prototipo para demostración
          </p>
        </div>
      </main>

      {/* MODAL: sin turnos disponibles */}
      {blockedMsg && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4"
        >
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-lg font-semibold mb-2 text-usco-primary">
              Sin turnos disponibles
            </h2>
            <p className="text-sm text-gray-700">{blockedMsg}</p>
            <div className="mt-4 text-right">
              <button
                onClick={() => setBlockedMsg(null)}
                className="px-4 py-2 rounded-xl bg-usco-primary text-white"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
