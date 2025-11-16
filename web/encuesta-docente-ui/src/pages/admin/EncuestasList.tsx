import { useEffect, useMemo, useState } from "react";
import { getActiveSurveys, type SurveyActiva } from "@/services/catalogs";

export default function EncuestasList() {
  const [loading, setLoading] = useState(true);
  const [onlyActive, setOnlyActive] = useState(true); // futuro: alternar a “todas”
  const [rows, setRows] = useState<SurveyActiva[]>([]);
  const [q, setQ] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        // Por ahora usamos sólo ACTIVAS; cuando el back esté listo,
        // aquí podríamos llamar getAllSurveysAdmin() si !onlyActive.
        const data = await getActiveSurveys();
        if (!alive) return;
        setRows(data);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [onlyActive]);

  const filtered = useMemo(() => {
    const k = q.trim().toLowerCase();
    if (!k) return rows;
    return rows.filter(
      (r) =>
        (r.nombre || "").toLowerCase().includes(k) ||
        (r.codigo || "").toLowerCase().includes(k)
    );
  }, [rows, q]);

  return (
    <div className="bg-white rounded-2xl shadow-card p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <h1 className="text-xl font-semibold">Encuestas</h1>
        <div className="flex gap-2">
          <input
            type="search"
            name="search"
            autoComplete="off"
            className="border rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-usco-primary/30"
            placeholder="Buscar por nombre o código…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          {/* Toggle “sólo activas” (en el futuro activará llamado admin/all) */}
          <label className="inline-flex items-center gap-2 text-sm px-3 py-2 rounded-xl border">
            <input
              type="checkbox"
              checked={onlyActive}
              onChange={(e) => setOnlyActive(e.target.checked)}
            />
            Sólo activas
          </label>
          {/* Acciones futuras */}
          <button
            type="button"
            className="px-3 py-2 rounded-xl bg-gray-100 text-gray-500 cursor-not-allowed"
            title="Próximamente"
          >
            + Nueva encuesta
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center text-gray-500 py-8">Cargando…</div>
      ) : filtered.length === 0 ? (
        <div className="text-center text-gray-600 py-10">
          No hay encuestas para mostrar.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2 pr-2">Nombre</th>
                <th className="py-2 px-2">Código</th>
                <th className="py-2 px-2">Estado</th>
                <th className="py-2 px-2">Vigencia</th>
                <th className="py-2 pl-2 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id} className="border-b last:border-b-0">
                  <td className="py-2 pr-2 font-medium">{s.nombre}</td>
                  <td className="py-2 px-2">{s.codigo}</td>
                  <td className="py-2 px-2">
                    <span
                      className={[
                        "px-2 py-1 rounded-full text-xs",
                        s.estado === "activa"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-700",
                      ].join(" ")}
                    >
                      {s.estado}
                    </span>
                  </td>
                  <td className="py-2 px-2">
                    {s.fecha_inicio || "—"} – {s.fecha_fin || "—"}
                  </td>
                  <td className="py-2 pl-2">
                    <div className="flex items-center gap-2 justify-end">
                      <button
                        className="px-3 py-1.5 rounded-lg border text-xs text-gray-600 cursor-not-allowed"
                        title="Próximamente"
                      >
                        Editar
                      </button>
                      <button
                        className="px-3 py-1.5 rounded-lg border text-xs text-gray-600 cursor-not-allowed"
                        title="Próximamente"
                      >
                        Activar / Inactivar
                      </button>
                      <button
                        className="px-3 py-1.5 rounded-lg border text-xs text-gray-600 cursor-not-allowed"
                        title="Próximamente"
                      >
                        Detalle
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
