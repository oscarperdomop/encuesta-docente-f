// src/pages/admin/ReportesAvanzados.tsx
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

// Nota: XLSX se importa dinámicamente para evitar errores de tipos
import { getActiveSurveys, type SurveyActiva } from "@/services/catalogs";
import { getAttemptsSummary, type AttemptsSummary } from "@/services/attempts";
import {
  getEstadisticasPorPregunta,
  getEstadisticasPorDocente,
  getPromediosGenerales,
  getMapaDeCalor,
  downloadBlob,
} from "@/services/admin";

type TipoReporte = "resumen" | "preguntas" | "docentes" | "promedios" | "heatmap";

export default function ReportesAvanzados() {
  const [searchParams] = useSearchParams();
  const [surveys, setSurveys] = useState<SurveyActiva[]>([]);
  const [selectedSurvey, setSelectedSurvey] = useState<string>("");
  const [tipoReporte, setTipoReporte] = useState<TipoReporte>("resumen");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Datos de diferentes tipos de reportes
  const [resumen, setResumen] = useState<AttemptsSummary | null>(null);
  const [statsPorPregunta, setStatsPorPregunta] = useState<any>(null);
  const [statsPorDocente, setStatsPorDocente] = useState<any>(null);
  const [promedios, setPromedios] = useState<any>(null);
  const [heatmap, setHeatmap] = useState<any>(null);

  // Cargar encuestas disponibles
  useEffect(() => {
    (async () => {
      try {
        const data = await getActiveSurveys();
        setSurveys(data);
        
        // Verificar si hay parámetros URL para restaurar estado
        const urlSurveyId = searchParams.get('selected_survey');
        const urlTipo = searchParams.get('tipo') as TipoReporte;
        
        if (urlSurveyId && data.some(s => s.id === urlSurveyId)) {
          setSelectedSurvey(urlSurveyId);
        } else if (data.length > 0) {
          setSelectedSurvey(data[0].id);
        }
        
        if (urlTipo && ['resumen', 'preguntas', 'docentes', 'promedios', 'heatmap'].includes(urlTipo)) {
          setTipoReporte(urlTipo);
        }
      } catch (error) {
        console.error("[Reportes] Error loading surveys:", error);
      }
    })();
  }, [searchParams]);

  // Cargar datos cuando cambia la encuesta o el tipo de reporte
  useEffect(() => {
    if (!selectedSurvey) return;

    (async () => {
      setLoading(true);
      setError(null); // Limpiar errores previos
      
      try {
        switch (tipoReporte) {
          case "resumen":
            // Este endpoint SÍ existe
            const resumenData = await getAttemptsSummary(selectedSurvey);
            setResumen(resumenData);
            break;
          case "preguntas":
            // Endpoint aún no implementado en backend
            const preguntasData = await getEstadisticasPorPregunta(selectedSurvey);
            setStatsPorPregunta(preguntasData);
            break;
          case "docentes":
            // Endpoint aún no implementado en backend
            const docentesData = await getEstadisticasPorDocente(selectedSurvey);
            setStatsPorDocente(docentesData);
            break;
          case "promedios":
            // Endpoint aún no implementado en backend
            const promediosData = await getPromediosGenerales(selectedSurvey);
            setPromedios(promediosData);
            break;
          case "heatmap":
            // Endpoint aún no implementado en backend
            const heatmapData = await getMapaDeCalor(selectedSurvey);
            setHeatmap(heatmapData);
            break;
        }
      } catch (err: any) {
        console.error(`[Reportes] Error loading ${tipoReporte}:`, err);
        
        // Mostrar mensaje amigable según el tipo de error
        if (err?.response?.status === 404) {
          setError(`Este tipo de reporte aún no está disponible. El endpoint del backend no ha sido implementado.`);
          console.warn(`⚠️ Endpoint no implementado para tipo: ${tipoReporte}`);
        } else {
          setError(`Error al cargar los datos: ${err?.message || 'Error desconocido'}`);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [selectedSurvey, tipoReporte]);

  const handleExport = async (format: "csv" | "excel") => {
    if (!selectedSurvey) return;
    
    try {
      // TODO: Implementar según el tipo de reporte seleccionado
      alert(`Exportación de ${tipoReporte} a ${format.toUpperCase()} - Próximamente`);
    } catch (error) {
      console.error("[Reportes] Error exporting:", error);
      alert("Error al exportar");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-semibold">Reportes y Estadísticas</h1>
      </div>

      {/* Selectores */}
      <div className="bg-white rounded-xl shadow-card p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Selector de Encuesta */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Encuesta
            </label>
            <select
              value={selectedSurvey}
              onChange={(e) => setSelectedSurvey(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-usco-primary"
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

          {/* Selector de Tipo de Reporte */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Reporte
            </label>
            <select
              value={tipoReporte}
              onChange={(e) => setTipoReporte(e.target.value as TipoReporte)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-usco-primary"
            >
              <option value="resumen">📋 Resumen General</option>
              <option value="preguntas">❓ Estadísticas por Pregunta</option>
              <option value="docentes">👨‍🏫 Estadísticas por Docente</option>
              <option value="promedios">📊 Promedios Generales</option>
              <option value="heatmap">🔥 Mapa de Calor</option>
            </select>
          </div>
        </div>
      </div>

      {/* Mensaje de Error */}
      {error && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <strong>Endpoint no disponible:</strong> {error}
              </p>
              <p className="text-xs text-yellow-600 mt-1">
                Por favor, implementa el endpoint correspondiente en el backend. Consulta <code className="bg-yellow-100 px-1 rounded">ENDPOINTS_ADMIN_REQUERIDOS.md</code>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Contenido según tipo de reporte */}
      {loading ? (
        <div className="text-center text-gray-500 py-12">
          <div className="animate-spin inline-block w-8 h-8 border-4 border-usco-primary border-t-transparent rounded-full mb-2"></div>
          <div>Cargando datos...</div>
        </div>
      ) : error ? (
        <div className="bg-gray-50 rounded-xl p-12 text-center text-gray-500">
          <div className="text-4xl mb-4">⚠️</div>
          <div className="text-lg font-medium mb-2">Funcionalidad en desarrollo</div>
          <div className="text-sm">Selecciona "📋 Resumen General" para ver datos disponibles</div>
        </div>
      ) : (
        <>
          {tipoReporte === "resumen" && <VistaResumen data={resumen} />}
          {tipoReporte === "preguntas" && <VistaPorPregunta data={statsPorPregunta} surveyId={selectedSurvey} />}
          {tipoReporte === "docentes" && <VistaPorDocente data={statsPorDocente} surveyId={selectedSurvey} />}
          {tipoReporte === "promedios" && <VistaPromedios data={promedios} />}
          {tipoReporte === "heatmap" && <VistaMapaCalor data={heatmap} />}
        </>
      )}
    </div>
  );
}

/* ========== VISTAS POR TIPO DE REPORTE ========== */

function VistaResumen({ data }: { data: AttemptsSummary | null }) {
  if (!data) {
    return <EmptyState message="No hay datos de resumen disponibles" />;
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Enviadas"
          value={data.enviados}
          color="bg-green-50 text-green-700"
          icon="✅"
        />
        <StatCard
          title="En Progreso"
          value={data.en_progreso}
          color="bg-yellow-50 text-yellow-700"
          icon="⏳"
        />
        <StatCard
          title="Pendientes"
          value={data.pendientes}
          color="bg-gray-50 text-gray-700"
          icon="📝"
        />
      </div>

      <div className="bg-white rounded-xl shadow-card overflow-hidden">
        <div className="p-5 border-b">
          <h2 className="text-lg font-semibold">Detalle de Intentos</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Docente
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Estado
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {data.items.length === 0 ? (
                <tr>
                  <td colSpan={2} className="px-4 py-8 text-center text-gray-500">
                    No hay datos disponibles
                  </td>
                </tr>
              ) : (
                data.items.map((item) => (
                  <tr key={item.teacher_id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-medium">{item.teacher_nombre}</div>
                      <div className="text-sm text-gray-500">{item.teacher_id}</div>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge estado={item.estado} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function VistaPorPregunta({ data, surveyId }: { data: any; surveyId: string }) {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return <EmptyState message="No hay estadísticas por pregunta disponibles" />;
  }

  // Backend devuelve: Array<{codigo, enunciado, section, n, mean, c1-c5, ...}>
  
  const handleExportExcel = () => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      alert('No hay datos para exportar');
      return;
    }
    
    try {
      // Crear contenido HTML que Excel puede interpretar con estilos
      const htmlContent = `
        <html>
          <head>
            <meta charset="UTF-8">
            <style>
              body { font-family: Arial, sans-serif; }
              .title { font-size: 16px; font-weight: bold; text-align: center; background-color: #4472C4; color: white; padding: 10px; }
              .meta { font-size: 12px; padding: 5px; background-color: #F2F2F2; }
              .header { font-size: 12px; font-weight: bold; background-color: #D9E1F2; padding: 8px; text-align: center; border: 1px solid #B4C6E7; }
              .data { font-size: 11px; padding: 6px; border: 1px solid #D9D9D9; text-align: center; }
              .data-text { text-align: left; }
              table { border-collapse: collapse; width: 100%; }
              .satisfaccion-alta { background-color: #C6EFCE; }
              .satisfaccion-media { background-color: #FFEB9C; }
              .satisfaccion-baja { background-color: #FFC7CE; }
            </style>
          </head>
          <body>
            <table>
              <tr><td colspan="16" class="title">ESTADÍSTICAS POR PREGUNTA - EVALUACIÓN DOCENTE</td></tr>
              <tr><td colspan="16" class="meta">Fecha de generación: ${new Date().toLocaleDateString('es-CO')}</td></tr>
              <tr><td colspan="16" class="meta">Total de preguntas: ${data.length}</td></tr>
              <tr><td colspan="16">&nbsp;</td></tr>
              <tr>
                <td class="header">Código</td>
                <td class="header" style="width: 300px;">Enunciado de la Pregunta</td>
                <td class="header">Sección</td>
                <td class="header">Orden</td>
                <td class="header">N° Respuestas</td>
                <td class="header">Media</td>
                <td class="header">Mediana</td>
                <td class="header">Desv. Estándar</td>
                <td class="header">Mínimo</td>
                <td class="header">Máximo</td>
                <td class="header">Resp. "1"</td>
                <td class="header">Resp. "2"</td>
                <td class="header">Resp. "3"</td>
                <td class="header">Resp. "4"</td>
                <td class="header">Resp. "5"</td>
                <td class="header">% Satisfacción (4-5)</td>
              </tr>
              ${data.map((pregunta: any) => {
                // Calcular satisfacción: solo respuestas 4 y 5 son satisfactorias
                const c1 = pregunta.c1 || 0;
                const c2 = pregunta.c2 || 0;
                const c3 = pregunta.c3 || 0;
                const c4 = pregunta.c4 || 0;
                const c5 = pregunta.c5 || 0;
                const total = c1 + c2 + c3 + c4 + c5;
                const satisfactorias = c4 + c5; // Solo 4 y 5 son satisfactorias
                const satisfaccionNum = total > 0 ? (satisfactorias / total * 100) : 0;
                const satisfaccion = satisfaccionNum.toFixed(1) + '%';
                
                // Determinar color inline (Excel interpreta mejor los estilos inline)
                let backgroundColor = '#FFC7CE'; // Rojo por defecto (baja)
                let textColor = '#9C0006';
                if (satisfaccionNum >= 80) {
                  backgroundColor = '#C6EFCE'; // Verde (alta)
                  textColor = '#006100';
                } else if (satisfaccionNum >= 60) {
                  backgroundColor = '#FFEB9C'; // Amarillo (media)
                  textColor = '#9C6500';
                }
                
                console.log(`Pregunta ${pregunta.codigo}: C1=${c1}, C2=${c2}, C3=${c3}, C4=${c4}, C5=${c5}, Total=${total}, Satisfactorias=${satisfactorias}, %=${satisfaccionNum.toFixed(1)}`);
                
                return `
                  <tr>
                    <td class="data">${pregunta.codigo || ''}</td>
                    <td class="data data-text">${(pregunta.enunciado || '').replace(/"/g, '&quot;')}</td>
                    <td class="data data-text">${(pregunta.section || '').replace(/"/g, '&quot;')}</td>
                    <td class="data">${pregunta.orden || ''}</td>
                    <td class="data">${pregunta.n || 0}</td>
                    <td class="data">${pregunta.mean ? pregunta.mean.toFixed(2) : ''}</td>
                    <td class="data">${pregunta.median ? pregunta.median.toFixed(2) : ''}</td>
                    <td class="data">${pregunta.stddev ? pregunta.stddev.toFixed(2) : ''}</td>
                    <td class="data">${pregunta.min || ''}</td>
                    <td class="data">${pregunta.max || ''}</td>
                    <td class="data">${c1}</td>
                    <td class="data">${c2}</td>
                    <td class="data">${c3}</td>
                    <td class="data">${c4}</td>
                    <td class="data">${c5}</td>
                    <td class="data" style="background-color: ${backgroundColor}; color: ${textColor}; font-weight: bold;">${satisfaccion}</td>
                  </tr>
                `;
              }).join('')}
            </table>
          </body>
        </html>
      `;
      
      // Crear y descargar archivo HTML que Excel puede abrir con formato
      const blob = new Blob([htmlContent], { 
        type: 'application/vnd.ms-excel;charset=utf-8' 
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `estadisticas_preguntas_${new Date().toISOString().split('T')[0]}.xls`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      console.log('✅ Archivo Excel con formato exportado exitosamente');
    } catch (err) {
      console.error('Error al exportar:', err);
      alert('Error al generar el archivo de exportación.');
    }
  };
  
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header superior con navegación */}
      <div className="px-8 py-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">Estadísticas por Pregunta</h2>
              <p className="text-sm text-gray-500 mt-1">
                Promedio y distribución de respuestas para cada pregunta
              </p>
            </div>
          </div>
          <button
            onClick={handleExportExcel}
            className="px-6 py-3 bg-green-600 text-white rounded-2xl hover:bg-green-700 shadow-lg hover:shadow-xl transition-all duration-200 inline-flex items-center font-medium"
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
      </div>
      
      {/* Contenido de la tabla */}
      <div className="p-8">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 uppercase tracking-wider">
                  Pregunta
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 uppercase tracking-wider">
                  Promedio
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 uppercase tracking-wider">
                  Total Respuestas
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 uppercase tracking-wider">
                  Distribución (1-5)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.map((pregunta: any, idx: number) => (
                <tr key={idx} className="hover:bg-gray-50 transition-colors duration-150">
                  <td className="px-6 py-6">
                    <div className="font-semibold text-gray-900 mb-2">{pregunta.codigo}</div>
                    <div className="text-sm text-gray-600 leading-relaxed line-clamp-3 mb-2">{pregunta.enunciado}</div>
                    <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                      {pregunta.section}
                    </div>
                  </td>
                  <td className="px-6 py-6 text-center">
                    <div className="inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-gray-400 text-white">
                      <span className="text-sm font-bold">
                        {pregunta.mean?.toFixed(1) || "—"}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-6 text-center">
                    <span className="text-lg font-semibold text-gray-900">
                      {pregunta.n || 0}
                    </span>
                    <div className="text-xs text-gray-500 mt-1">respuestas</div>
                  </td>
                  <td className="px-6 py-6">
                    <div className="grid grid-cols-5 gap-2">
                      {[1, 2, 3, 4, 5].map(num => (
                        <div key={num} className="flex flex-col items-center">
                          <div className="text-xs font-medium text-gray-500 mb-1 text-center w-full">{num}</div>
                          <div className="bg-gray-100 rounded-lg px-2 py-1 w-full flex justify-center">
                            <span className="text-sm font-semibold text-gray-900">
                              {pregunta[`c${num}`] || 0}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function VistaPorDocente({ data, surveyId }: { data: any; surveyId: string }) {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return <EmptyState message="No hay estadísticas por docente disponibles" />;
  }

  // Backend devuelve: Array<{teacher_id, teacher_nombre, programa, n_respuestas, promedio, peor_codigo, peor_enunciado, peor_promedio}>

  return (
    <div className="bg-white rounded-xl shadow-card overflow-hidden">
      <div className="p-5 border-b">
        <h2 className="text-lg font-semibold">Ranking de Docentes</h2>
        <p className="text-sm text-gray-600 mt-1">
          Promedio general y pregunta con menor puntaje por docente. Haz clic en el nombre para ver el perfil completo.
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Docente
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                Programa
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                Promedio
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                Evaluaciones
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Pregunta más baja
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {data.map((docente: any, idx: number) => (
              <tr key={docente.teacher_id || idx} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <Link
                    to={`/admin/docentes/${docente.teacher_id}?survey_id=${surveyId}`}
                    className="font-medium text-usco-primary hover:underline"
                  >
                    {docente.teacher_nombre}
                  </Link>
                </td>
                <td className="px-4 py-3 text-center text-sm text-gray-600">
                  {docente.programa || "—"}
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="text-2xl font-bold text-usco-primary">
                    {docente.promedio?.toFixed(2) || "—"}
                  </span>
                </td>
                <td className="px-4 py-3 text-center text-gray-600">
                  {docente.n_respuestas || 0}
                </td>
                <td className="px-4 py-3">
                  {docente.peor_codigo ? (
                    <div>
                      <div className="font-medium text-sm">{docente.peor_codigo}: {docente.peor_promedio?.toFixed(2)}</div>
                      <div className="text-xs text-gray-500 line-clamp-1">{docente.peor_enunciado}</div>
                    </div>
                  ) : (
                    <span className="text-gray-400 text-sm">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function VistaPromedios({ data }: { data: any }) {
  if (!data) {
    return <EmptyState message="No hay datos de promedios disponibles" />;
  }

  // Backend devuelve: {enviados, en_progreso, pendientes, completion_rate, score_global, secciones: [{section_id, titulo, score}]}

  return (
    <div className="space-y-6">
      {/* Promedio General */}
      <div className="bg-gradient-to-br from-usco-primary to-red-700 rounded-xl shadow-card p-8 text-white text-center">
        <div className="text-sm uppercase tracking-wide opacity-90 mb-2">
          Promedio General
        </div>
        <div className="text-6xl font-bold">
          {data.score_global?.toFixed(2) || "—"}
        </div>
        <div className="text-sm mt-2 opacity-90">
          Escala de 1 a 5
        </div>
      </div>

      {/* Estadísticas Rápidas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Enviadas"
          value={data.enviados || 0}
          color="bg-green-50 text-green-700"
          icon="✅"
        />
        <StatCard
          title="En Progreso"
          value={data.en_progreso || 0}
          color="bg-yellow-50 text-yellow-700"
          icon="⏳"
        />
        <StatCard
          title="Pendientes"
          value={data.pendientes || 0}
          color="bg-gray-50 text-gray-700"
          icon="📝"
        />
      </div>

      {/* Por Sección */}
      {data.secciones && data.secciones.length > 0 && (
        <div className="bg-white rounded-xl shadow-card overflow-hidden">
          <div className="p-5 border-b">
            <h2 className="text-lg font-semibold">Promedios por Sección</h2>
          </div>
          <div className="p-5 space-y-4">
            {data.secciones.map((seccion: any, idx: number) => (
              <div key={idx}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{seccion.titulo}</span>
                  <span className="text-2xl font-bold text-usco-primary">
                    {seccion.score?.toFixed(2) || "—"}
                  </span>
                </div>
                {seccion.score && (
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-usco-primary h-3 rounded-full transition-all"
                      style={{ width: `${(seccion.score / 5) * 100}%` }}
                    ></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function VistaMapaCalor({ data }: { data: any }) {
  if (!data || !data.columns || !data.rows) {
    return <EmptyState message="No hay datos de mapa de calor disponibles" />;
  }

  // Backend devuelve: {columns: ["Q1", "Q2"...], rows: [{teacher_nombre, programa, n_respuestas, values: [4.5, 3.2, ...]}]}
  
  return (
    <div className="bg-white rounded-xl shadow-card overflow-hidden">
      <div className="p-5 border-b">
        <h2 className="text-lg font-semibold">Mapa de Calor</h2>
        <p className="text-sm text-gray-600 mt-1">
          Matriz: Docentes (filas) × Preguntas (columnas) con promedios
        </p>
        <div className="flex gap-2 mt-3 text-xs">
          <span className="flex items-center gap-1">
            <div className="w-4 h-4 rounded" style={{backgroundColor: "#ef4444"}}></div>
            1.0-2.4 Bajo
          </span>
          <span className="flex items-center gap-1">
            <div className="w-4 h-4 rounded" style={{backgroundColor: "#f87171"}}></div>
            2.5-2.9
          </span>
          <span className="flex items-center gap-1">
            <div className="w-4 h-4 rounded" style={{backgroundColor: "#fb923c"}}></div>
            3.0-3.4
          </span>
          <span className="flex items-center gap-1">
            <div className="w-4 h-4 rounded" style={{backgroundColor: "#fbbf24"}}></div>
            3.5-3.9
          </span>
          <span className="flex items-center gap-1">
            <div className="w-4 h-4 rounded" style={{backgroundColor: "#34d399"}}></div>
            4.0-4.4
          </span>
          <span className="flex items-center gap-1">
            <div className="w-4 h-4 rounded" style={{backgroundColor: "#10b981"}}></div>
            4.5-5.0 Alto
          </span>
        </div>
      </div>
      <div className="p-5 overflow-x-auto">
        <div className="inline-block min-w-full">
          <table className="border-collapse">
            <thead>
              <tr>
                <th className="border px-3 py-2 bg-gray-50 text-xs sticky left-0 z-10 bg-gray-50">Docente</th>
                <th className="border px-3 py-2 bg-gray-50 text-xs">Programa</th>
                <th className="border px-3 py-2 bg-gray-50 text-xs">N</th>
                {data.columns?.map((codigo: string, idx: number) => (
                  <th key={idx} className="border px-3 py-2 bg-gray-50 text-xs">
                    {codigo}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.rows?.map((row: any, rIdx: number) => (
                <tr key={rIdx}>
                  <td className="border px-3 py-2 bg-gray-50 text-xs font-medium sticky left-0 z-10 bg-gray-50 max-w-[150px]">
                    <div className="line-clamp-2">{row.teacher_nombre}</div>
                  </td>
                  <td className="border px-3 py-2 bg-gray-50 text-xs text-center">
                    {row.programa || "—"}
                  </td>
                  <td className="border px-3 py-2 bg-gray-50 text-xs text-center font-medium">
                    {row.n_respuestas}
                  </td>
                  {row.values?.map((valor: number | null, vIdx: number) => (
                    <td
                      key={vIdx}
                      className="border px-3 py-2 text-center"
                      style={{
                        backgroundColor: getHeatmapColor(valor),
                      }}
                    >
                      <span className="text-xs font-medium">
                        {valor !== null ? valor.toFixed(1) : "—"}
                      </span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ========== COMPONENTES AUXILIARES ========== */

function StatCard({
  title,
  value,
  color,
  icon,
}: {
  title: string;
  value: number;
  color: string;
  icon: string;
}) {
  return (
    <div className="bg-white rounded-xl shadow-card p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-600">{title}</span>
        <span className={`text-2xl ${color} rounded-lg p-2`}>{icon}</span>
      </div>
      <div className="text-3xl font-bold">{value}</div>
    </div>
  );
}

function StatusBadge({ estado }: { estado: string }) {
  const styles: Record<string, string> = {
    enviado: "bg-green-100 text-green-800",
    en_progreso: "bg-yellow-100 text-yellow-800",
    pendiente: "bg-gray-100 text-gray-800",
  };

  const labels: Record<string, string> = {
    enviado: "Enviado",
    en_progreso: "En progreso",
    pendiente: "Pendiente",
  };

  return (
    <span
      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
        styles[estado] || "bg-gray-100 text-gray-800"
      }`}
    >
      {labels[estado] || estado}
    </span>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="bg-gray-50 rounded-xl p-12 text-center text-gray-500">
      <div className="text-4xl mb-4">📊</div>
      <div>{message}</div>
    </div>
  );
}

function getHeatmapColor(value: number | null): string {
  if (!value || value === null) return "#f3f4f6"; // gray-100
  
  // Escala de colores de rojo (bajo) a verde (alto)
  if (value >= 4.5) return "#10b981"; // green-500
  if (value >= 4.0) return "#34d399"; // green-400
  if (value >= 3.5) return "#fbbf24"; // yellow-400
  if (value >= 3.0) return "#fb923c"; // orange-400
  if (value >= 2.5) return "#f87171"; // red-400
  return "#ef4444"; // red-500
}
