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
      await refetch();
      nav("/intro", { replace: true });
    } catch (e: any) {
      const status = e?.response?.status;
      const detail =
        e?.response?.data?.detail || e?.response?.data?.message || e?.message;

      if (status === 403) {
        setBlockedMsg(
          detail ||
            "Ya no tienes turnos para responder la encuesta, contacta con el administrador de la encuesta.",
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
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8f5ef_0%,#f2ece0_100%)] flex flex-col">
      <LoginHeader subtitle="Encuesta Docente de la Licenciatura en Matemáticas - Vigencia 2025-2" />

      <main className="flex-1 py-8 md:py-12">
        <div className="max-w-6xl mx-auto px-4 md:px-6 grid grid-cols-1 lg:grid-cols-5 gap-6 items-stretch">
          <section className="lg:col-span-2 rounded-2xl overflow-hidden shadow-card border border-usco-primary/15">
            <div className="h-full bg-[linear-gradient(155deg,#8a1c1c_0%,#6f1414_60%,#4f0f0f_100%)] text-white p-7 md:p-8">
              <span className="inline-flex items-center rounded-full bg-[#f7d27a] text-[#4f0f0f] px-3 py-1 text-xs font-semibold tracking-wide">
                Vigencia académica 2025-2
              </span>

              <h1 className="mt-4 text-2xl md:text-3xl font-bold leading-tight">
                Bienvenido a la Encuesta Docente de la Licenciatura en Matemáticas
              </h1>

              <p className="mt-3 text-sm md:text-base text-white/90 leading-relaxed">
                La encuesta permite valorar el desarrollo de tus cursos para
                fortalecer la calidad académica en la USCO.
              </p>

              <div className="mt-6 rounded-xl bg-white/10 border border-white/20 p-4">
                <p className="text-sm font-semibold mb-2">Qué se realizará:</p>
                <ol className="space-y-2 text-sm text-white/90 list-decimal list-inside">
                  <li>Seleccionarás los docentes a evaluar en el semestre.</li>
                  <li>
                    Responderás preguntas de valoración y observaciones finales.
                  </li>
                  <li>Revisarás el resumen y cerrarás el turno de encuesta.</li>
                </ol>
              </div>

              <p className="mt-6 text-xs text-white/80">
                Tu participación es confidencial y aporta al mejoramiento
                institucional.
              </p>
            </div>
          </section>

          <section className="lg:col-span-3">
            <form
              onSubmit={onSubmit}
              className="bg-white p-7 md:p-8 rounded-2xl shadow-card border border-gray-200"
            >
              <div className="border-l-4 border-usco-primary pl-4 mb-6">
                <h2 className="text-2xl font-bold text-usco-primary">
                  Iniciar sesión
                </h2>
                <p className="text-gray-600 mt-1">
                  Ingresa con tu correo institucional para continuar con la
                  encuesta docente de la Licenciatura en Matemáticas.
                </p>
              </div>

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

            <p className="text-center text-gray-600 mt-6 text-sm">
              USCO - Sistema de Evaluación Docente - Licenciatura en Matemáticas
            </p>
          </section>
        </div>
      </main>

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
