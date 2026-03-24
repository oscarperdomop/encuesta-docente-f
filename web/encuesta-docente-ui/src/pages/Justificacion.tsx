// src/pages/Justificacion.tsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import USCOHeader from "@/components/USCOHeader";
import { useUser } from "@/contexts/UserContext";

export default function Justificacion() {
  const nav = useNavigate();
  const { user } = useUser();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const nombre = user?.nombre || user?.email || "Usuario";

  return (
    <USCOHeader
      subtitle="Evaluación Docente de la Licenciatura en Matemáticas - Justificación"
      containerClass="max-w-6xl"
    >
      <div className="min-h-[calc(100vh-5rem)]">
        <div className="mb-5 rounded-2xl bg-white border border-usco-primary/15 shadow-card p-5 md:p-6">
          <p className="text-sm text-gray-600">Estimado/a</p>
          <h1 className="text-2xl md:text-3xl font-bold text-usco-primary mt-1">
            {nombre}
          </h1>
          <p className="text-gray-700 mt-2 leading-relaxed">
            Tu participación en la Encuesta Docente de la Licenciatura en
            Matemáticas, vigencia 2025-2, aporta evidencia real para fortalecer
            el proceso formativo del programa.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <section className="rounded-2xl border border-usco-primary/15 bg-white shadow-card p-5 md:p-6">
            <h2 className="text-lg font-semibold text-usco-primary mb-3">
              Programa de Licenciatura en Matemáticas - USCO
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <InfoChip label="SNIES" value="10658" />
              <InfoChip
                label="Acreditación"
                value="Alta Calidad (Res. 012700/2023)"
              />
              <InfoChip label="Duración" value="9 semestres" />
              <InfoChip label="Créditos" value="165" />
              <InfoChip label="Modalidad" value="Presencial" />
              <InfoChip label="Sede" value="Neiva (jornada diurna)" />
            </div>

            <div className="mt-5 rounded-xl bg-[#f8f5ef] border border-[#e9ddc9] p-4">
              <h3 className="font-semibold text-gray-800 mb-2">
                Importancia del programa
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                El programa forma licenciados con base disciplinar, pedagógica
                y didáctica para responder a necesidades educativas de la
                región surcolombiana, con enfoque en calidad humana,
                innovación curricular e investigación formativa.
              </p>
            </div>

            <p className="mt-4 text-xs text-gray-600">
              Fuente institucional:
              <a
                className="ml-1 text-usco-primary hover:underline"
                href="https://www.usco.edu.co/es/estudia-en-la-usco/programas-pregrado/licenciatura-en-matematicas/"
                target="_blank"
                rel="noreferrer"
              >
                Licenciatura en Matemáticas - USCO
              </a>
            </p>
          </section>

          <section className="rounded-2xl border border-usco-primary/15 bg-white shadow-card p-5 md:p-6">
            <h2 className="text-lg font-semibold text-usco-primary mb-3">
              Cómo esta evaluación ayuda a tomar mejores decisiones
            </h2>

            <ul className="space-y-3 text-sm text-gray-700 leading-relaxed">
              <li className="flex gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-usco-primary" />
                Permite identificar fortalezas y oportunidades de mejora en
                prácticas de aula, didáctica y evaluación.
              </li>
              <li className="flex gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-usco-primary" />
                Orienta decisiones académicas sobre acompañamiento docente,
                actualización curricular y planes de mejoramiento.
              </li>
              <li className="flex gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-usco-primary" />
                Consolida información colectiva para que las decisiones
                institucionales se basen en evidencia y no en percepciones
                aisladas.
              </li>
            </ul>

            <div className="mt-5 rounded-xl bg-usco-primary text-white p-4">
              <p className="text-sm leading-relaxed">
                Cada calificación cuenta. Tu aporte, junto al de toda la
                comunidad estudiantil, fortalece la calidad del programa y su
                impacto en la formación de futuros licenciados en matemáticas.
              </p>
            </div>
          </section>
        </div>

        <div className="mt-6 rounded-2xl bg-white border border-gray-200 shadow-card p-5 md:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <p className="text-sm text-gray-700">
            Si estás listo/a, continúa para pasar a la selección de docentes e
            iniciar la evaluación.
          </p>

          <div className="flex gap-3">
            <button
              type="button"
              className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200"
              onClick={() => nav("/intro")}
            >
              Regresar
            </button>
            <button
              className="px-5 py-2 rounded-xl bg-usco-primary text-white hover:bg-usco-primary/90"
              onClick={() => nav("/docentes")}
            >
              Continuar
            </button>
          </div>
        </div>

        <p className="text-center text-gray-500 mt-8 text-sm">
          USCO - Sistema de Evaluación Docente - Licenciatura en Matemáticas
        </p>
      </div>
    </USCOHeader>
  );
}

function InfoChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
      <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
      <p className="text-sm font-semibold text-gray-800 mt-1">{value}</p>
    </div>
  );
}
