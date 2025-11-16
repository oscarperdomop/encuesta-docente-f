// src/pages/DocentesSelect.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import USCOHeader from "@/components/USCOHeader";
import api from "@/services/api";
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

// Lee variante desde .env (A = ocultar evaluados, B = mostrar con flag)
const TEACHERS_VARIANT = (import.meta.env.VITE_TEACHERS_VARIANT || "B")
  .toString()
  .toUpperCase() as "A" | "B";

export default function DocentesSelect() {
  const nav = useNavigate();
  const openedRef = useRef(false); // evita doble montaje
  const retryRef = useRef(false); // evita reintentos infinitos en onStart

  const { surveyId, setSurveyId, selected, toggle, clear } = useSelection();

  const [userNombre, setUserNombre] = useState("Usuario");
  const [loading, setLoading] = useState(true);
  const [teachers, setTeachers] = useState<TeacherRow[]>([]);
  const [q, setQ] = useState("");
  const [evaluatedIds, setEvaluatedIds] = useState<Set<string>>(new Set());
  const [turnoReady, setTurnoReady] = useState(false);

  // --- util: handshake de turno ---
  async function ensureTurnoOpen(): Promise<string> {
    try {
      const { data: cur } = await api.get("/sessions/turno/current");
      if (cur?.turno_id) {
        sessionStorage.setItem("turnoId", cur.turno_id);
        return cur.turno_id as string;
      }
      sessionStorage.removeItem("turnoId");
    } catch {
      sessionStorage.removeItem("turnoId");
    }

    const { data } = await api.post("/sessions/turno/open");
    const tid = data?.turno_id as string;
    if (!tid) throw new Error("No se obtuvo turno_id");
    sessionStorage.setItem("turnoId", tid);
    return tid;
  }

  // Scroll to top al montar
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // 1) Sesión (obtiene nombre o expulsa al login)
  useEffect(() => {
    me()
      .then((u) => setUserNombre(u?.nombre || u?.email || "Usuario"))
      .catch(() => {
        localStorage.removeItem("token");
        nav("/login", { replace: true });
      });
  }, [nav]);

  // 2) TURNO: handshake idempotente al montar
  useEffect(() => {
    if (openedRef.current) return;
    openedRef.current = true;

    (async () => {
      try {
        await ensureTurnoOpen();
        setTurnoReady(true); // Marca turno como listo
      } catch (e: any) {
        const msg =
          e?.response?.data?.detail ||
          e?.message ||
          "Has alcanzado el límite de turnos.";
        alert(msg);
        nav("/intro", { replace: true });
      }
    })();
  }, [nav]);

  // 3) Datos + estados (evaluados) - ESPERA a que turno esté listo
  useEffect(() => {
    if (!turnoReady) return; // Espera a que el turno esté abierto

    (async () => {
      setLoading(true);
      try {
        // Asegura surveyId
        let sid = surveyId;
        if (!sid) {
          const activas = await getActiveSurveys();
          if (!activas.length) throw new Error("No hay encuestas activas.");
          sid = activas[0].id;
          setSurveyId(sid);
        }

        // Pide docentes según variante
        const rows = await getSurveyTeachers(sid!, {
          hideEvaluated: TEACHERS_VARIANT === "A",
          includeState: true, // en B devuelve evaluated; en A igual no molesta
        });
        setTeachers(rows);

        // Construye set de "evaluados"
        const sent = new Set<string>();

        // Variante B: el backend marca cada fila con `evaluated: true`
        if (TEACHERS_VARIANT === "B") {
          for (const t of rows) {
            if ((t as any)?.evaluated) sent.add(t.id);
          }
        }

        // Variante A o fallback: complementa con summary si necesario
        // Solo llamar si hay turnoId y no estamos en variante B
        if (TEACHERS_VARIANT === "A" && sessionStorage.getItem("turnoId")) {
          try {
            const summary = await getAttemptsSummary(sid!);
            for (const it of (summary?.items ?? []) as AttemptsSummary["items"]) {
              if (it?.estado === "enviado" && it?.teacher_id) {
                sent.add(it.teacher_id);
              }
            }
          } catch {
            // ignorar errores de summary
          }
        }

        // Fallback local (por si usabas almacenamiento local antes)
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
  }, [turnoReady, surveyId, setSurveyId]); // Depende de turnoReady

  // 4) Filtro
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

  // Usa tanto el set como el flag por fila
  const isRowEvaluated = (t: TeacherRow) =>
    evaluatedIds.has(t.id) || (t as any)?.evaluated === true;

  const totalSelected = useMemo(
    () =>
      Object.entries(selected).filter(([id, v]) => v && !evaluatedIds.has(id))
        .length,
    [selected, evaluatedIds]
  );

  // 5) Iniciar encuesta (usa X-Turno-Id del interceptor)
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
      const detail = e?.response?.data?.detail || e?.message || "";
      if (!retryRef.current && /Turno inválido o cerrado/i.test(detail || "")) {
        retryRef.current = true;
        try {
          await ensureTurnoOpen();
          await createAttempts(surveyId!, tids);
          const next = await getNextAttempt(surveyId!);
          if (next)
            nav(`/encuesta/${next.attempt_id}/step1`, { replace: true });
          return;
        } catch (e2: any) {
          const d2 = e2?.response?.data?.detail || e2?.message;
          alert(d2 || "No se pudo iniciar la encuesta.");
        } finally {
          setLoading(false);
        }
      } else {
        alert(detail || "No se pudo iniciar la encuesta.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <USCOHeader subtitle="Encuesta Docente · Selección de docentes">
      {/* Mantén el alto mínimo descontando ~altura del header (5rem) */}
      <div className="min-h-[calc(100vh-5rem)] bg-usco-bg">
        <main className="max-w-5xl mx-auto px-4 md:px-6 py-6">
          {/* Encabezado contextual */}
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <div className="text-sm text-gray-700">
              Bienvenido, <b>{userNombre}</b>
              <p className="w-full text-sm text-gray-601">
                Selecciona los Docentes que en el actual semestre toma cursos
                con ellos.
              </p>
            </div>

            <div className="text-sm text-gray-500">
              {totalSelected} seleccionados
            </div>
          </div>

          {/* Controles */}
          <div className="bg-white rounded-2xl shadow-card p-4 md:p-6 mb-5">
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
              <input
                type="search"
                name="search"
                autoComplete="off"
                className="w-full sm:max-w-md border rounded-xl p-3 outline-none focus:ring-2 focus:ring-usco-primary/30 focus:border-usco-primary"
                placeholder="Buscar docente…"
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
                <img
                  src="https://www.usco.edu.co/imagen-institucional/logo/precarga-usco2.gif"
                  alt="Cargando..."
                  width={80}
                  height={90}
                  className="mx-auto"
                />
              </div>
            ) : filtered.length ? (
              filtered.map((t) => {
                const isEvaluated = isRowEvaluated(t);
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
                      {/*<div className="text-sm text-gray-500 truncate">
                        {t.programa || "—"}   
                      </div>*/}
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
              {/*<button
                type="button"
                className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200"
                onClick={() => nav("/justificacion")}
              >
                Regresar
              </button>*/}
              <button
                type="button"
                disabled={!totalSelected || loading}
                className="px-5 py-2 rounded-xl bg-usco-primary text-white hover:bg-usco-primary/90 disabled:opacity-60"
                onClick={onStart}
              >
                {loading
                  ? "Iniciando…"
                  : `Iniciar encuesta (${totalSelected || 0})`}
              </button>
            </div>
          </div>

          <p className="text-center text-gray-500 mt-6 text-sm">
            © USCO — Prototipo para demostración
          </p>
        </main>
      </div>
    </USCOHeader>
  );
}

function iniciales(nombre: string) {
  const parts = (nombre || "").trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase()).join("");
}
