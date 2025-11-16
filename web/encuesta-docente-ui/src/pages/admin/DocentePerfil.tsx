// src/pages/admin/DocentePerfil.tsx
import { useEffect, useState } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import {
  getDocenteSections,
  getDocenteStudentsHeatmap,
} from "@/services/admin";

export default function DocentePerfil() {
  const { teacherId } = useParams<{ teacherId: string }>();
  const [searchParams] = useSearchParams();
  const surveyId = searchParams.get("survey_id");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Datos del docente
  const [detalle, setDetalle] = useState<any>(null);
  const [sections, setSections] = useState<any>(null);
  const [heatmap, setHeatmap] = useState<any>(null);

  // Función para exportar a Excel
  const handleExportExcel = async () => {
    if (!teacherId || !surveyId) return;
    
    try {
      // Crear URL del endpoint de exportación
      const exportUrl = `/api/v1/admin/reports/exports/teacher/${teacherId}.xlsx?survey_id=${surveyId}`;
      
      // Abrir en nueva ventana para descargar
      const link = document.createElement('a');
      link.href = `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'}${exportUrl.replace('/api/v1', '')}`;
      link.download = `docente_${detalle?.teacher_nombre || teacherId}_${new Date().toISOString().split('T')[0]}.xlsx`;
      
      // Agregar token de autorización si existe
      const token = localStorage.getItem('token');
      if (token) {
        // Para descargas, usamos fetch con blob
        const response = await fetch(link.href, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          link.href = url;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        } else {
          throw new Error('Error al descargar el archivo');
        }
      } else {
        // Sin token, intentar descarga directa
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (err) {
      console.error('Error al exportar:', err);
      alert('Error al exportar el archivo. Verifica que el backend esté disponible.');
    }
  };

  useEffect(() => {
    if (!teacherId || !surveyId) {
      setError("Faltan parámetros requeridos (teacherId o surveyId)");
      setLoading(false);
      return;
    }

    (async () => {
      setLoading(true);
      setError(null);

      try {
        // Cargar datos disponibles (sin el endpoint de detalle que no existe)
        const [sectionsData, heatmapData] = await Promise.all([
          getDocenteSections(teacherId, surveyId),
          getDocenteStudentsHeatmap(teacherId, surveyId),
        ]);

        // Construir datos del detalle a partir de sections y heatmap
        const detalleData = {
          teacher_id: teacherId,
          teacher_nombre: sectionsData?.teacher_nombre || heatmapData?.teacher_nombre || "Docente",
          programa: null, // No disponible en estos endpoints
          promedio_general: calculateGeneralAverage(sectionsData?.sections || []),
          n_estudiantes: heatmapData?.rows?.length || 0, // Cantidad de estudiantes que evaluaron
          n_enviadas: heatmapData?.rows?.length || 0,
        };

        console.log("[DocentePerfil] Datos construidos:", {
          detalle: detalleData,
          sections: sectionsData,
          heatmap: heatmapData
        });
        
        setDetalle(detalleData);
        setSections(sectionsData);
        setHeatmap(heatmapData);
      } catch (err: any) {
        console.error("[DocentePerfil] Error:", err);
        setError(err?.response?.data?.detail || "Error al cargar el perfil del docente");
      } finally {
        setLoading(false);
      }
    })();
  }, [teacherId, surveyId]);

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-usco-primary"></div>
        <p className="mt-4 text-gray-600">Cargando perfil del docente...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <p className="text-red-700">{error}</p>
        <Link
          to="/admin/reportes"
          className="mt-4 inline-block text-usco-primary hover:underline"
        >
          ← Volver a reportes
        </Link>
      </div>
    );
  }

  if (!detalle) {
    return (
      <div className="text-center py-12 text-gray-500">
        No se encontró información del docente
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con información del docente */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header superior con navegación */}
        <div className="px-8 py-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <Link
              to={`/admin/reportes?selected_survey=${surveyId}&tipo=docentes`}
              className="inline-flex items-center gap-2 text-red-600 hover:text-red-700 font-medium"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Volver
            </Link>
            <h1 className="text-2xl font-semibold text-gray-900">Perfil del Docente</h1>
            <div></div> {/* Spacer para centrar el título */}
          </div>
        </div>

        {/* Contenido del perfil */}
        <div className="px-8 py-8">
          {/* Etiqueta y Nombre */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">DOCENTE</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900">{detalle.teacher_nombre}</h2>
          </div>

          {/* Departamento y Programa */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <div className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">DEPARTAMENTO</div>
              <div className="text-lg text-gray-900 font-medium">{sections?.departamento || "Ciencias Exactas"}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">PROGRAMA</div>
              <div className="text-lg text-gray-900 font-medium">{sections?.programa || "Lic. En Matemáticas"}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Estadísticas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Promedio General */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
              <div className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">PROMEDIO GENERAL</div>
              <div className="text-4xl font-bold text-gray-900 mb-2">{detalle.promedio_general?.toFixed(2) || "—"}</div>
              <div className="text-sm text-gray-500">sobre 5.0</div>
            </div>
          </div>
        </div>

        {/* Estudiantes que Evaluaron */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
              </div>
              <div className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">ESTUDIANTES QUE EVALUARON</div>
              <div className="text-4xl font-bold text-gray-900 mb-2">{detalle.n_estudiantes || 0}</div>
              <div className="text-sm text-gray-500">respuestas recibidas</div>
            </div>
          </div>
        </div>
      </div>

      {/* Botón de Exportar - Flotante */}
      <div className="fixed bottom-8 right-8 z-50">
        <button
          onClick={() => handleExportExcel()}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-3 font-medium"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Exportar Excel
        </button>
      </div>

      {/* Promedios por sección */}
      {sections && sections.sections && sections.sections.length > 0 && (
        <div className="bg-white rounded-xl shadow-card p-6">
          <h2 className="text-lg font-semibold mb-4">Promedios por Sección</h2>
          <div className="space-y-3">
            {sections.sections.map((sec: any) => (
              <div key={sec.section_id} className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="font-medium text-sm">{sec.titulo}</div>
                  <div className="text-xs text-gray-500">
                    {sec.n_respuestas} respuestas
                  </div>
                </div>
                <div className="w-32">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{
                          width: `${((sec.promedio || 0) / 5) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="text-sm font-semibold w-10 text-right">
                      {sec.promedio?.toFixed(2) || "—"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mapa de calor general (de preguntas por el docente) */}
      {detalle.preguntas_breakdown && detalle.preguntas_breakdown.length > 0 && (
        <div className="bg-white rounded-xl shadow-card p-6">
          <h2 className="text-lg font-semibold mb-4">Mapa de Calor por Pregunta</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left">Código</th>
                    <th className="px-3 py-2 text-left">Pregunta</th>
                    <th className="px-3 py-2 text-center">N</th>
                    <th className="px-3 py-2 text-center">Promedio</th>
                    <th className="px-3 py-2 text-left">Distribución</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {detalle.preguntas_breakdown.map((q: any) => (
                    <tr key={q.codigo} className="hover:bg-gray-50">
                      <td className="px-3 py-2 font-mono text-xs">{q.codigo}</td>
                      <td className="px-3 py-2">{q.enunciado}</td>
                      <td className="px-3 py-2 text-center">{q.n}</td>
                      <td className="px-3 py-2 text-center">
                        <span
                          className="inline-block px-2 py-1 rounded text-white font-semibold"
                          style={{
                            backgroundColor: getHeatmapColor(q.promedio),
                          }}
                        >
                          {q.promedio?.toFixed(2) || "—"}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex gap-1 text-xs">
                          {[1, 2, 3, 4, 5].map((val) => (
                            <span key={val} className="text-gray-600">
                              {val}: {q[`c${val}`] || 0}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      {/* Mapa de calor de estudiantes */}
      {heatmap && heatmap.rows && heatmap.rows.length > 0 && (
        <div className="bg-white rounded-xl shadow-card p-6">
          <h2 className="text-lg font-semibold mb-4">
            Mapa de Calor de Respuestas por Estudiante
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Cada fila representa las respuestas de un estudiante a todas las preguntas
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-2 py-2 text-left sticky left-0 bg-gray-50 z-10">
                    Estudiante
                  </th>
                  <th className="px-2 py-2 text-center">N</th>
                  <th className="px-2 py-2 text-center">Prom.</th>
                  {heatmap.columns.map((code: string) => (
                    <th
                      key={code}
                      className="px-2 py-2 text-center font-mono"
                      title={code}
                    >
                      {code}
                    </th>
                  ))}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {heatmap.rows.map((row: any) => (
                    <tr key={row.attempt_id} className="hover:bg-gray-50">
                      <td className="px-2 py-2 sticky left-0 bg-white">
                        <div className="text-xs truncate max-w-[150px]">
                          {row.user_email || "Anónimo"}
                        </div>
                        <div className="text-[10px] text-gray-500">
                          {row.created_at}
                        </div>
                      </td>
                      <td className="px-2 py-2 text-center text-gray-600">
                        {row.n_respuestas}
                      </td>
                      <td className="px-2 py-2 text-center font-semibold">
                        {row.promedio?.toFixed(2) || "—"}
                      </td>
                      {row.values.map((val: number | null, idx: number) => (
                        <td
                          key={idx}
                          className="px-2 py-2 text-center"
                          style={{
                            backgroundColor: val !== null ? getHeatmapColor(val) : "#f3f4f6",
                          }}
                        >
                          <span className={val !== null ? "text-white font-semibold" : "text-gray-400"}>
                            {val !== null ? val : "—"}
                          </span>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      {/* Peor pregunta */}
      {detalle.peor_pregunta && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <h3 className="font-semibold text-yellow-800 mb-2">
            ⚠️ Pregunta con menor calificación
          </h3>
          <div className="text-sm">
            <span className="font-mono text-xs bg-yellow-100 px-2 py-1 rounded">
              {detalle.peor_pregunta.codigo}
            </span>
            <span className="ml-2">{detalle.peor_pregunta.enunciado}</span>
            <span className="ml-2 font-semibold text-yellow-700">
              Promedio: {detalle.peor_pregunta.promedio?.toFixed(2)}
            </span>
          </div>
        </div>
      )}

    </div>
  );
}

/* ========== FUNCIONES AUXILIARES ========== */

function calculateGeneralAverage(sections: any[]): number | null {
  if (!sections || sections.length === 0) return null;
  
  let totalSum = 0;
  let totalResponses = 0;
  
  for (const section of sections) {
    if (section.promedio && section.n_respuestas) {
      totalSum += section.promedio * section.n_respuestas;
      totalResponses += section.n_respuestas;
    }
  }
  
  return totalResponses > 0 ? totalSum / totalResponses : null;
}

/* ========== COMPONENTES AUXILIARES ========== */

function StatCard({
  label,
  value,
  color,
  icon,
}: {
  label: string;
  value: string | number;
  color: string;
  icon: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="text-3xl">{icon}</div>
      <div>
        <div className="text-sm text-gray-600">{label}</div>
        <div className={`text-2xl font-bold ${color}`}>{value}</div>
      </div>
    </div>
  );
}

function getHeatmapColor(value: number | null): string {
  if (value === null || value === undefined) return "#e5e7eb";
  
  // Escala de rojo (bajo) a verde (alto)
  if (value >= 4.5) return "#10b981"; // verde oscuro
  if (value >= 4.0) return "#34d399"; // verde
  if (value >= 3.5) return "#fbbf24"; // amarillo
  if (value >= 3.0) return "#fb923c"; // naranja
  if (value >= 2.0) return "#f87171"; // rojo claro
  return "#ef4444"; // rojo
}
