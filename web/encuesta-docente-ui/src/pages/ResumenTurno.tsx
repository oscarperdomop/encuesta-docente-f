// src/pages/ResumenTurno.tsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import USCOHeader from "@/components/USCOHeader";
import { me, logout } from "@/services/auth";
import {
  getNextAttempt,
  getAttemptsSummary,
  AttemptsSummary,
} from "@/services/attempts";
import { useSelection } from "@/store/selection";
import api from "@/services/api";
import { getSurveyTeachers } from "@/services/catalogs";

export default function ResumenTurno() {
  const nav = useNavigate();
  const { surveyId } = useSelection();

  const [userNombre, setUserNombre] = useState("Usuario");
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<AttemptsSummary | null>(null);
  const [hasNext, setHasNext] = useState(false);

  // NEW: límite de turnos del backend (MAX_TURNOS)
  const [turnoLimit, setTurnoLimit] = useState<number | null>(null);

  // NEW: total de docentes asignados (para calcular "pendientes")
  const [totalDocentes, setTotalDocentes] = useState<number>(0);

  // sesión
  useEffect(() => {
    me()
      .then((u) => setUserNombre(u?.nombre || u?.email || "Usuario"))
      .catch(() => {
        localStorage.removeItem("token");
        nav("/login", { replace: true });
      });
  }, [nav]);

  // datos
  useEffect(() => {
    (async () => {
      if (!surveyId) return;
      setLoading(true);
      try {
        // 1) Summary + siguiente intento
        const s = await getAttemptsSummary(surveyId);
        setSummary(s);

        const next = await getNextAttempt(surveyId);
        setHasNext(!!next);

        // 2) Quota de turnos (para mostrar/ocultar "Volver a la lista")
        try {
          const { data: quota } = await api.get("/sessions/turno/quota");
          setTurnoLimit(typeof quota?.limit === "number" ? quota.limit : null);
        } catch {
          setTurnoLimit(null);
        }

        // 3) Total de docentes asignados (para calcular "pendientes")
        try {
          const docentes = await getSurveyTeachers(surveyId, {
            // no ocultes evaluados, necesitamos el total
            hideEvaluated: false,
            // no es necesario estado por docente aquí
            includeState: false,
          });
          setTotalDocentes(Array.isArray(docentes) ? docentes.length : 0);
        } catch {
          setTotalDocentes(0);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [surveyId]);

  // contadores
  const counts = useMemo(() => {
    // base
    let enviados = 0;
    let en_progreso = 0;
    let pendientes = 0;

    if (!summary) {
      return { enviados, en_progreso, pendientes };
    }

    // A) backend nuevo: summary.estados
    const estados = (summary as any)?.estados;
    if (estados && typeof estados === "object") {
      enviados = Number(estados.enviado || 0);
      en_progreso = Number(estados.en_progreso || 0);
      // "pendientes" = totalDocentes - enviados - en_progreso
      pendientes = Math.max(0, (totalDocentes || 0) - enviados - en_progreso);
      return { enviados, en_progreso, pendientes };
    }

    // B) backend antiguo: campos planos
    if (
      typeof (summary as any).enviados === "number" ||
      typeof (summary as any).en_progreso === "number" ||
      typeof (summary as any).pendientes === "number"
    ) {
      enviados = Number((summary as any).enviados || 0);
      en_progreso = Number((summary as any).en_progreso || 0);
      // si "pendientes" plano no viene, lo derivamos
      if (typeof (summary as any).pendientes === "number") {
        pendientes = Number((summary as any).pendientes || 0);
      } else {
        pendientes = Math.max(0, (totalDocentes || 0) - enviados - en_progreso);
      }
      return { enviados, en_progreso, pendientes };
    }

    // C) ultra-compatibilidad: si llegaran items, contamos por estado
    if (Array.isArray((summary as any).items)) {
      const items = (summary as any).items as Array<{ estado?: string }>;
      enviados = items.filter((it) => it.estado === "enviado").length;
      en_progreso = items.filter((it) => it.estado === "en_progreso").length;
      pendientes = items.filter(
        (it) => it.estado !== "enviado" && it.estado !== "en_progreso"
      ).length;
      return { enviados, en_progreso, pendientes };
    }

    // fallback
    return { enviados, en_progreso, pendientes };
  }, [summary, totalDocentes]);

  async function onFinish() {
    try {
      await api
        .post("/sessions/close", { survey_id: surveyId })
        .catch(() => {});
    } finally {
      await logout({ server: true });
      location.replace("/login");
    }
  }

  const canFinish = useMemo(() => {
    if (!summary) return !hasNext;
    if (typeof (summary as any).can_finish === "boolean")
      return (summary as any).can_finish;
    return counts.pendientes === 0 && counts.en_progreso === 0;
  }, [summary, hasNext, counts]);

  // mostrar “Volver a la lista” solo si limit <= 1
  const showBackToList = turnoLimit !== null && turnoLimit <= 1;

  return (
    <USCOHeader
      subtitle="Encuesta Docente · Resumen de turno"
      containerClass="max-w-5xl"
    >
      <div className="min-h-[calc(100vh-5rem)]">
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-gray-700">
            <b>{userNombre}</b>
          </div>
          <div className="text-sm text-gray-700">
            Enviados: <b>{counts.enviados}</b> · En progreso:{" "}
            <b>{counts.en_progreso}</b> · Pendientes: <b>{counts.pendientes}</b>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-card p-5">
          {loading ? (
            <div className="text-center text-gray-500 py-8">Cargando…</div>
          ) : (summary as any)?.items && (summary as any).items.length > 0 ? (
            <ul className="space-y-2">
              {(summary as any).items.map((it: any) => (
                <li
                  key={it.teacher_id}
                  className="flex items-center justify-between p-3 rounded-xl bg-gray-50"
                >
                  <span className="font-medium">{it.teacher_nombre}</span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      it.estado === "enviado"
                        ? "bg-green-100 text-green-700"
                        : it.estado === "en_progreso"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {it.estado}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center text-gray-600">
              No hay más docentes en la cola. ¡Has terminado!
            </div>
          )}

          <div className="flex justify-end gap-3 mt-6">
            {hasNext && (
              <button
                className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200"
                onClick={() => nav(-1)}
              >
                Ir al siguiente pendiente
              </button>
            )}

            {showBackToList && (
              <button
                className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200"
                onClick={() => nav("/docentes")}
              >
                Volver a la lista
              </button>
            )}

            <button
              disabled={!canFinish}
              className="px-5 py-2 rounded-xl bg-usco-primary text-white disabled:opacity-60"
              onClick={onFinish}
            >
              Finalizar turno
            </button>
          </div>
        </div>
      </div>
    </USCOHeader>
  );
}
