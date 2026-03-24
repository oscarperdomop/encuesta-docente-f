// src/pages/Intro.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { me, logout } from "@/services/auth";
import USCOHeader from "@/components/USCOHeader";

export default function Intro() {
  const [nombre, setNombre] = useState("");
  const nav = useNavigate();

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
      "¿Estás seguro de que deseas finalizar este turno? Se cerrará tu sesión."
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
      subtitle="Encuesta Docente de la Licenciatura en Matemáticas - Introducción"
      onLogout={handleLogout}
      containerClass="max-w-6xl"
    >
      <div className="min-h-[calc(100vh-5rem)]">
        <section className="rounded-2xl border border-usco-primary/15 bg-white shadow-card p-6 md:p-7">
          <h1 className="text-2xl md:text-3xl font-bold text-usco-primary">
            Bienvenido/a {nombre || "Usuario"}
          </h1>
          <p className="text-gray-700 mt-3 leading-relaxed">
            Esta es una guía breve de la prueba de Evaluación Docente de la
            Licenciatura en Matemáticas, vigencia 2025-2. En las siguientes
            pantallas podrás seleccionar docentes, responder la encuesta y
            finalizar tu turno.
          </p>
        </section>

        <section className="mt-5 rounded-2xl border border-usco-primary/15 bg-white shadow-card p-6 md:p-7">
          <h2 className="text-lg font-semibold text-usco-primary mb-4">
            Pantallas que verás en la prueba
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <StepCard
              step="1"
              title="Introducción"
              text="Vista inicial con el resumen del proceso y recomendaciones para responder la encuesta."
            />
            <StepCard
              step="2"
              title="Justificación"
              text="Contexto académico de la evaluación y propósito institucional de mejora continua."
            />
            <StepCard
              step="3"
              title="Selección de docentes"
              text="Elige los docentes que deseas evaluar en este semestre y luego inicia el proceso."
            />
            <StepCard
              step="4"
              title="Evaluación docente"
              text="Responde las preguntas en dos pasos: valoración tipo Likert y observaciones finales."
            />
            <StepCard
              step="5"
              title="Resumen y cierre"
              text="Revisa el estado de tus respuestas y finaliza la encuesta del turno actual."
            />
            <div className="rounded-xl border border-[#e9ddc9] bg-[#f8f5ef] p-4">
              <p className="text-sm font-semibold text-gray-800">Recomendación</p>
              <p className="text-sm text-gray-700 mt-1 leading-relaxed">
                Ten a mano los nombres de tus docentes y responde cada
                pregunta con criterio objetivo.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-5 rounded-2xl border border-gray-200 bg-white shadow-card p-5 md:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <p className="text-sm text-gray-700">
            Cuando estés listo/a, continúa para conocer la justificación y
            pasar a la selección de docentes.
          </p>

          <button
            className="px-6 py-2.5 rounded-xl bg-usco-primary text-white hover:bg-usco-primary/90"
            onClick={() => nav("/justificacion")}
          >
            Continuar
          </button>
        </section>

        <p className="text-center text-gray-500 mt-8 text-sm">
          USCO - Sistema de Evaluación Docente - Licenciatura en Matemáticas
        </p>
      </div>
    </USCOHeader>
  );
}

function StepCard({
  step,
  title,
  text,
}: {
  step: string;
  title: string;
  text: string;
}) {
  return (
    <article className="rounded-xl border border-gray-200 bg-gray-50 p-4">
      <div className="flex items-center gap-3 mb-2">
        <span className="h-7 w-7 rounded-full bg-usco-primary text-white text-sm font-bold grid place-items-center">
          {step}
        </span>
        <h3 className="font-semibold text-gray-800">{title}</h3>
      </div>
      <p className="text-sm text-gray-700 leading-relaxed">{text}</p>
    </article>
  );
}

