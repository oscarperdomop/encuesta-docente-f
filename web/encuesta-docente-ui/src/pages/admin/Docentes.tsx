// src/pages/admin/Docentes.tsx
import { useEffect, useState } from "react";
import {
  getActiveSurveys,
  getSurveyTeachers,
  type SurveyActiva,
  type TeacherRow,
} from "@/services/catalogs";
import {
  downloadBlob,
  downloadTeachersTemplateCSV,
  importTeachersCSV,
  type TeachersImportResponse,
} from "@/services/admin";

export default function Docentes() {
  const [surveys, setSurveys] = useState<SurveyActiva[]>([]);
  const [selectedSurvey, setSelectedSurvey] = useState<string>("");
  const [teachers, setTeachers] = useState<TeacherRow[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  // Carga masiva
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<TeachersImportResponse | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  const loadTeachers = async (surveyId: string) => {
    if (!surveyId) return;
    setLoading(true);
    try {
      const data = await getSurveyTeachers(surveyId, {
        limit: 200,
        includeState: true,
      });
      setTeachers(data);
    } catch (error) {
      console.error("[Docentes] Error loading teachers:", error);
      setTeachers([]);
    } finally {
      setLoading(false);
    }
  };

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
    loadTeachers(selectedSurvey);
  }, [selectedSurvey]);

  // Filtrar docentes por busqueda
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
    evaluados: teachers.filter((t) => t.evaluated === true).length,
    pendientes: teachers.filter((t) => t.evaluated !== true).length,
  };

  const onDownloadTemplate = async () => {
    try {
      setImportError(null);
      const blob = await downloadTeachersTemplateCSV();
      downloadBlob(blob, "plantilla_docentes.csv");
    } catch (error: any) {
      console.error("[Docentes] Error downloading template:", error);
      setImportError("No se pudo descargar la plantilla CSV.");
    }
  };

  const onImport = async (mode: "dry-run" | "import-only" | "import-and-assign") => {
    if (!csvFile) {
      setImportError("Selecciona un archivo CSV antes de continuar.");
      return;
    }

    if (!selectedSurvey && mode === "import-and-assign") {
      setImportError("Selecciona una encuesta activa para asociar docentes.");
      return;
    }

    try {
      setImporting(true);
      setImportError(null);
      setImportResult(null);

      const response = await importTeachersCSV(csvFile, {
        dryRun: mode === "dry-run",
        surveyId: mode === "import-and-assign" ? selectedSurvey : undefined,
      });
      setImportResult(response);

      if (mode !== "dry-run") {
        await loadTeachers(selectedSurvey);
      }
    } catch (error: any) {
      console.error("[Docentes] Error importing CSV:", error);
      const detail =
        error?.response?.data?.detail ||
        "No se pudo procesar el archivo CSV. Verifica formato y permisos.";
      setImportError(String(detail));
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Gestion de Docentes</h1>

      {/* Selector de Encuesta */}
      <div className="bg-white rounded-xl shadow-card p-5">
        <label className="block text-sm font-medium text-gray-700 mb-2">Encuesta</label>
        <select
          value={selectedSurvey}
          onChange={(e) => setSelectedSurvey(e.target.value)}
          className="w-full max-w-md px-4 py-2 border rounded-lg focus:ring-2 focus:ring-usco-primary"
        >
          {surveys.length === 0 ? (
            <option>No hay encuestas activas disponibles</option>
          ) : (
            surveys.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nombre} ({s.estado})
              </option>
            ))
          )}
        </select>
      </div>

      {/* Carga masiva CSV */}
      <div className="bg-white rounded-xl shadow-card p-5 space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-lg font-semibold">Carga masiva y asignacion</h2>
          <button
            type="button"
            onClick={onDownloadTemplate}
            className="px-3 py-2 border rounded-lg text-sm hover:bg-gray-50"
          >
            Descargar plantilla CSV
          </button>
        </div>

        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <input
            type="file"
            accept=".csv,text/csv"
            onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
            className="block w-full text-sm text-gray-700 file:mr-3 file:px-3 file:py-2 file:border-0 file:rounded-lg file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
          />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onImport("dry-run")}
              disabled={!csvFile || importing}
              className="px-3 py-2 rounded-lg border text-sm hover:bg-gray-50 disabled:opacity-50"
            >
              Validar CSV
            </button>
            <button
              type="button"
              onClick={() => onImport("import-only")}
              disabled={!csvFile || importing}
              className="px-3 py-2 rounded-lg border text-sm hover:bg-gray-50 disabled:opacity-50"
            >
              Importar sin asociar
            </button>
            <button
              type="button"
              onClick={() => onImport("import-and-assign")}
              disabled={!csvFile || importing || !selectedSurvey}
              className="px-3 py-2 rounded-lg text-sm bg-usco-primary text-white hover:opacity-95 disabled:opacity-50"
            >
              Importar y asociar a encuesta
            </button>
          </div>
        </div>

        {csvFile && (
          <p className="text-sm text-gray-600">
            Archivo seleccionado: <span className="font-medium">{csvFile.name}</span>
          </p>
        )}

        {importError && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {importError}
          </div>
        )}

        {importResult && (
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 space-y-2 text-sm">
            <div className="font-medium">Resultado de importacion</div>
            <div>
              Insertados: <b>{importResult.summary.inserted}</b> | Actualizados:{" "}
              <b>{importResult.summary.updated}</b> | Omitidos:{" "}
              <b>{importResult.summary.skipped}</b>
            </div>
            {importResult.assignment && (
              <div>
                Asociacion: nuevos <b>{importResult.assignment.assigned_new}</b> | ya asignados{" "}
                <b>{importResult.assignment.already_assigned}</b> | total en encuesta{" "}
                <b>{importResult.assignment.total_assigned}</b>
              </div>
            )}
            {importResult.errors.length > 0 && (
              <div className="text-amber-700">
                {importResult.errors.slice(0, 5).map((e, idx) => (
                  <div key={`${e.row}-${idx}`}>
                    Fila {e.row}: {e.message}
                  </div>
                ))}
                {importResult.errors.length > 5 && (
                  <div>... y {importResult.errors.length - 5} errores mas.</div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Estadisticas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Total" value={stats.total} color="text-blue-700" />
        <StatCard title="Evaluados" value={stats.evaluados} color="text-green-700" />
        <StatCard title="Pendientes" value={stats.pendientes} color="text-orange-700" />
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
                        <span className="text-sm text-gray-600">{teacher.programa || "-"}</span>
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

        {filteredTeachers.length > 0 && (
          <div className="px-4 py-3 bg-gray-50 border-t text-sm text-gray-600">
            Mostrando {filteredTeachers.length} de {teachers.length} docentes
          </div>
        )}
      </div>
    </div>
  );
}

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
