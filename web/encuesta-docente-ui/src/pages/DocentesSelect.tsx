// src/pages/DocentesSelect.tsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import USCOHeader from "@/components/USCOHeader";
import { me } from "@/services/auth";
import {
  getActiveSurveys,
  getSurveyTeachers,
  TeacherRow,
} from "@/services/catalogs";
import {
  getAttemptsSummary,
  AttemptsSummary,
  createAttempts,
  getNextAttempt,
} from "@/services/attempts";
import { useSelection } from "@/store/selection";

export default function DocentesSelect() {
  const nav = useNavigate();
  const { surveyId, setSurveyId, selected, toggle, clear } = useSelection();

  const [userNombre, setUserNombre] = useState("Usuario");
  const [loading, setLoading] = useState(true);
  const [teachers, setTeachers] = useState<TeacherRow[]>([]);
  const [q, setQ] = useState("");
  const [evaluatedIds, setEvaluatedIds] = useState<Set<string>>(new Set());

  // sesión
  useEffect(() => {
    me()
      .then((u) => setUserNombre(u?.nombre || u?.email || "Usuario"))
      .catch(() => {
        localStorage.removeItem("token");
        nav("/login", { replace: true });
      });
  }, [nav]);

  // datos + estados enviados
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        let sid = surveyId;
        if (!sid) {
          const activas = await getActiveSurveys();
          if (!activas.length) throw new Error("No hay encuestas activas.");
          sid = activas[0].id;
          setSurveyId(sid);
        }

        const rows = await getSurveyTeachers(sid!);
        setTeachers(rows);

        const sent = new Set<string>();

        // A) si teachers ya trae estado, úsalo
        for (const t of rows) {
          // @ts-expect-error: algunos backends envían estado
          if (t?.estado === "enviado") sent.add(t.id);
        }

        // B) intenta summary del backend
        try {
          const summary = await getAttemptsSummary(sid!);
          for (const it of (summary?.items ?? []) as AttemptsSummary["items"]) {
            if (it?.estado === "enviado" && it?.teacher_id) {
              sent.add(it.teacher_id);
            }
          }
        } catch {
          // ignora error: seguiremos con fallback local
        }

        // C) fallback local storage
        const raw = localStorage.getItem(`sent:${sid}`);
        const localSent = raw ? (JSON.parse(raw) as string[]) : [];
        localSent.forEach((id) => sent.add(id));

        setEvaluatedIds(sent);
      } catch (e) {
        console.error("[DocentesSelect] carga:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, [surveyId, setSurveyId]);

  // filtro
  const filtered = useMemo(() => {
    const k = q.trim().toLowerCase();
    if (!k) return teachers;
    return teachers.filter((t) => {
      const nom = t.nombre?.toLowerCase() || "";
      const ide = t.identificador?.toLowerCase() || "";
      const pro = t.programa?.toLowerCase() || "";
      return nom.includes(k) || ide.includes(k) || pro.includes(k);
    });
  }, [teachers, q]);

  const totalSelected = useMemo(
    () =>
      Object.entries(selected).filter(([id, v]) => v && !evaluatedIds.has(id))
        .length,
    [selected, evaluatedIds]
  );

  async function onStart() {
    const tids = Object.entries(selected)
      .filter(([, v]) => v)
      .map(([id]) => id)
      .filter((id) => !evaluatedIds.has(id));

    if (!tids.length || !surveyId) return;

    try {
      setLoading(true);
      await createAttempts(surveyId, tids);
      const next = await getNextAttempt(surveyId);
      if (!next) {
        alert("No hay intento en progreso.");
        return;
      }
      nav(`/encuesta/${next.attempt_id}/step1`, { replace: true });
    } catch (e: any) {
      const detail = e?.response?.data?.detail || e?.message;
      alert(detail || "No se pudo iniciar la encuesta.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <USCOHeader
      subtitle="Encuesta Docente · Selección de docentes"
      containerClass="max-w-5xl"
    >
      {/* Encabezado contextual */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-gray-700">
          Hola, <b>{userNombre}</b>
        </div>
        <div className="text-sm text-gray-500">
          {totalSelected} seleccionados
        </div>
      </div>

      {/* Controles */}
      <div className="bg-white rounded-2xl shadow-card p-4 md:p-6 mb-5">
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
          <input
            type="text"
            className="w-full sm:max-w-md border rounded-xl p-3 outline-none focus:ring-2 focus:ring-usco-primary/30 focus:border-usco-primary"
            placeholder="Buscar docente por nombre, identificador o programa…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label="Buscar docente"
          />
          <div className="flex gap-2">
            <button
              type="button"
              className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200"
              onClick={() => setQ("")}
            >
              Limpiar búsqueda
            </button>
            <button
              type="button"
              className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200"
              onClick={() => clear()}
            >
              Limpiar selección
            </button>
          </div>
        </div>
      </div>

      {/* Grid docentes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <div className="col-span-full text-center text-gray-500 py-8">
            Cargando…
          </div>
        ) : filtered.length ? (
          filtered.map((t) => {
            const isEvaluated = evaluatedIds.has(t.id);
            return (
              <label
                key={t.id}
                className={[
                  "rounded-2xl shadow-card p-4 flex items-center gap-4 cursor-pointer transition",
                  isEvaluated
                    ? "bg-gray-100 opacity-70 cursor-not-allowed"
                    : "bg-white hover:shadow-md",
                ].join(" ")}
                aria-checked={!!selected[t.id]}
                role="checkbox"
                tabIndex={isEvaluated ? -1 : 0}
                aria-disabled={isEvaluated}
                onKeyDown={(ev) => {
                  if (isEvaluated) return;
                  if (ev.key === " " || ev.key === "Enter") {
                    ev.preventDefault();
                    toggle(t.id);
                  }
                }}
              >
                <div className="w-12 h-12 rounded-full bg-gray-100 grid place-items-center font-semibold select-none">
                  {iniciales(t.nombre)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-medium truncate">{t.nombre}</div>
                  <div className="text-sm text-gray-500 truncate">
                    {t.programa || "—"}
                  </div>
                  {isEvaluated && (
                    <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                      Ya enviado
                    </span>
                  )}
                </div>
                <input
                  type="checkbox"
                  checked={!!selected[t.id] && !isEvaluated}
                  onChange={() => {
                    if (!isEvaluated) toggle(t.id);
                  }}
                  disabled={isEvaluated}
                  className="w-5 h-5"
                  aria-label={
                    isEvaluated
                      ? `${t.nombre} ya evaluado`
                      : `Seleccionar a ${t.nombre}`
                  }
                  title={isEvaluated ? "Ya evaluado" : undefined}
                />
              </label>
            );
          })
        ) : (
          <div className="col-span-full text-center text-gray-500 py-8">
            No hay docentes disponibles.
          </div>
        )}
      </div>

      {/* Footer flotante */}
      <div className="sticky bottom-0 mt-6 py-4 bg-usco-bg/80 backdrop-blur supports-[backdrop-filter]:backdrop-blur">
        <div className="max-w-5xl mx-auto px-4 md:px-6 flex items-center justify-end gap-3">
          <button
            type="button"
            className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200"
            onClick={() => nav("/justificacion")}
          >
            Regresar
          </button>
          <button
            type="button"
            disabled={!totalSelected || loading}
            className="px-5 py-2 rounded-xl bg-usco-primary text-white disabled:opacity-60"
            onClick={onStart}
          >
            {loading
              ? "Iniciando…"
              : `Iniciar encuesta (${totalSelected || 0})`}
          </button>
        </div>
      </div>
    </USCOHeader>
  );
}

function iniciales(nombre: string) {
  const parts = (nombre || "").trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase()).join("");
}
