// src/pages/admin/Docentes.tsx
import { useEffect, useState } from "react";
import { getActiveSurveys, getSurveyTeachers, type SurveyActiva, type TeacherRow } from "@/services/catalogs";

export default function Docentes() {
  const [surveys, setSurveys] = useState<SurveyActiva[]>([]);
  const [selectedSurvey, setSelectedSurvey] = useState<string>("");
  const [teachers, setTeachers] = useState<TeacherRow[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  // Cargar encuestas disponibles
  useEffect(() => {
    (async () => {
      try {
        const data = await getActiveSurveys();
        setSurveys(data);
        if (data.length > 0) {
          setSelectedSurvey(data[0].id);
        }
      } catch (error) {
        console.error("[Docentes] Error loading surveys:", error);
      }
    })();
  }, []);

  // Cargar docentes cuando se selecciona una encuesta
  useEffect(() => {
    if (!selectedSurvey) return;

    (async () => {
      setLoading(true);
      try {
        const data = await getSurveyTeachers(selectedSurvey, {
          limit: 1000,
          includeState: true,
        });
        setTeachers(data);
      } catch (error) {
        console.error("[Docentes] Error loading teachers:", error);
        setTeachers([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [selectedSurvey]);

  // Filtrar docentes por búsqueda
  const filteredTeachers = teachers.filter((t) => {
    const query = searchQuery.toLowerCase();
    return (
      t.nombre.toLowerCase().includes(query) ||
      t.identificador?.toLowerCase().includes(query) ||
      t.programa?.toLowerCase().includes(query)
    );
  });

  const stats = {
    total: teachers.length,
    evaluados: teachers.filter((t) => t.evaluated).length,
    pendientes: teachers.filter((t) => !t.evaluated).length,
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Gestión de Docentes</h1>

      {/* Selector de Encuesta */}
      <div className="bg-white rounded-xl shadow-card p-5">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Encuesta
        </label>
        <select
          value={selectedSurvey}
          onChange={(e) => setSelectedSurvey(e.target.value)}
          className="w-full max-w-md px-4 py-2 border rounded-lg focus:ring-2 focus:ring-usco-primary"
        >
          {surveys.length === 0 ? (
            <option>No hay encuestas disponibles</option>
          ) : (
            surveys.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nombre} ({s.estado})
              </option>
            ))
          )}
        </select>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Total" value={stats.total} color="bg-blue-50 text-blue-700" />
        <StatCard title="Evaluados" value={stats.evaluados} color="bg-green-50 text-green-700" />
        <StatCard title="Pendientes" value={stats.pendientes} color="bg-orange-50 text-orange-700" />
      </div>

      {/* Buscador y Tabla */}
      <div className="bg-white rounded-xl shadow-card overflow-hidden">
        <div className="p-5 border-b">
          <input
            type="search"
            placeholder="Buscar por nombre, identificador o programa..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-usco-primary"
            autoComplete="off"
          />
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-500">Cargando docentes...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Identificador
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Nombre
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Programa
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredTeachers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                      {searchQuery
                        ? "No se encontraron docentes con ese criterio"
                        : "No hay docentes asignados a esta encuesta"}
                    </td>
                  </tr>
                ) : (
                  filteredTeachers.map((teacher) => (
                    <tr key={teacher.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <span className="font-mono text-sm">{teacher.identificador}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium">{teacher.nombre}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-600">{teacher.programa || "—"}</span>
                      </td>
                      <td className="px-4 py-3">
                        {teacher.evaluated ? (
                          <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                            Evaluado
                          </span>
                        ) : (
                          <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                            Pendiente
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer con contador */}
        {filteredTeachers.length > 0 && (
          <div className="px-4 py-3 bg-gray-50 border-t text-sm text-gray-600">
            Mostrando {filteredTeachers.length} de {teachers.length} docentes
          </div>
        )}
      </div>
    </div>
  );
}

/* ========== COMPONENTES AUXILIARES ========== */

function StatCard({
  title,
  value,
  color,
}: {
  title: string;
  value: number;
  color: string;
}) {
  return (
    <div className="bg-white rounded-xl shadow-card p-4">
      <div className="text-sm text-gray-600 mb-1">{title}</div>
      <div className={`text-3xl font-bold ${color}`}>{value}</div>
    </div>
  );
}
