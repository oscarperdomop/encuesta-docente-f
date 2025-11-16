// src/pages/Intro.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { me, logout } from "@/services/auth";
import USCOHeader from "@/components/USCOHeader";

export default function Intro() {
  const [nombre, setNombre] = useState("");
  const nav = useNavigate();

  // Scroll to top al montar
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    me()
      .then((u) => setNombre(u?.nombre || u?.email || "Usuario"))
      .catch(() => {
        localStorage.removeItem("token");
        nav("/login", { replace: true });
      });
  }, [nav]);

  async function handleLogout() {
    const ok = window.confirm(
      "¿Estás seguro que deseas finalizar este turno? Se cerrará tu sesión."
    );
    if (!ok) return;
    try {
      await logout({ server: false, closeTurno: true });
    } finally {
      nav("/login", { replace: true });
    }
  }

  return (
    <USCOHeader
      subtitle="Evaluación Docente · Presentación"
      onLogout={handleLogout}
    >
      <div className="min-h-[calc(100vh-5rem)] grid place-items-center">
        {/* ajusta 5rem si cambias la altura del header */}
        <div className="w-full max-w-xl">
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-card">
            <h1 className="text-2xl font-bold mb-3">
              Bienvenido/a {nombre || "—"}.
            </h1>
            <p className="text-gray-700 leading-relaxed">
              Facultad de Educación — Programa Lic. en Matemáticas.
              <br />
              <span className="font-semibold">
                Evaluación Docente (periodo vigente)
              </span>
              .
            </p>
            <p className="text-gray-600 mt-4">
              A continuación encontrarás la justificación y el propósito de la
              evaluación. Presiona <b>Continuar</b> para avanzar.
            </p>
            <div className="flex justify-end gap-3 mt-8">
              {/* <button
                type="button"
                className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200"
                onClick={handleLogout}
              >
                Cambiar de usuario
              </button>*/}
              <button
                className="px-5 py-2 rounded-xl bg-usco-primary text-white hover:bg-usco-primary/90"
                onClick={() => nav("/justificacion")}
              >
                Continuar
              </button>
            </div>
          </div>
          <p className="text-center text-gray-500 mt-8 text-sm">
            © USCO — Prototipo para demostración
          </p>
        </div>
      </div>
    </USCOHeader>
  );
}
