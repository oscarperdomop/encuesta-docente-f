// src/services/admin.ts
import api from "./api";

/* ========== TIPOS ========== */

export type StatsOverview = {
  total_usuarios: number;
  total_encuestas: number;
  total_respuestas: number;
  tasa_completitud: number; // % de encuestas completadas
  encuestas_activas: number;
};

export type ReporteItem = {
  user_id: string;
  user_email: string;
  user_nombre?: string;
  teacher_id: string;
  teacher_nombre: string;
  survey_id: string;
  survey_nombre: string;
  attempt_id: string;
  estado: string;
  fecha_creacion: string;
  fecha_envio?: string;
  respuestas?: {
    question_id: string;
    question_codigo: string;
    question_enunciado: string;
    value: number;
  }[];
  textos?: {
    positivos?: string;
    mejorar?: string;
    comentarios?: string;
  };
};

export type ReporteParams = {
  survey_id?: string;
  teacher_id?: string;
  user_id?: string;
  estado?: "enviado" | "en_progreso" | "pendiente";
  fecha_desde?: string; // YYYY-MM-DD
  fecha_hasta?: string; // YYYY-MM-DD
  page?: number;
  per_page?: number;
};

export type ReporteResponse = {
  items: ReporteItem[];
  total: number;
  page: number;
  per_page: number;
  pages: number;
};

/* ========== ESTADÍSTICAS ========== */

/**
 * Obtiene estadísticas generales del sistema
 */
export async function getStatsOverview(): Promise<StatsOverview> {
  const { data } = await api.get<StatsOverview>("/admin/reports/stats/overview");
  return data;
}

/**
 * Obtiene estadísticas por encuesta
 */
export async function getStatsBySurvey(surveyId: string) {
  const { data } = await api.get(`/admin/stats/survey/${surveyId}`);
  return data;
}

/* ========== REPORTES ========== */

/**
 * Obtiene un listado de intentos/respuestas con filtros
 */
export async function getReportes(
  params: ReporteParams = {}
): Promise<ReporteResponse> {
  const { data } = await api.get<ReporteResponse>("/admin/reportes", {
    params,
  });
  return data;
}

/**
 * Obtiene estadísticas por pregunta
 * Backend: /admin/reports/questions
 */
export async function getEstadisticasPorPregunta(surveyId: string) {
  const { data } = await api.get(`/admin/reports/questions`, {
    params: { survey_id: surveyId },
    timeout: 60000, // 60 segundos para conexiones lentas
  });
  return data;
}

/**
 * Obtiene estadísticas por docente (ranking + peor pregunta)
 * Backend: /admin/reports/teachers
 */
export async function getEstadisticasPorDocente(surveyId: string) {
  const { data } = await api.get(`/admin/reports/teachers`, {
    params: { survey_id: surveyId },
    timeout: 60000, // 60 segundos para conexiones lentas
  });
  return data;
}

/**
 * Obtiene promedios generales y por sección
 * Backend: /admin/reports/summary
 */
export async function getPromediosGenerales(surveyId: string) {
  const { data } = await api.get(`/admin/reports/summary`, {
    params: { survey_id: surveyId },
  });
  return data;
}

/**
 * Obtiene mapa de calor de docentes vs preguntas
 * Backend: /admin/reports/teachers/matrix
 */
export async function getMapaDeCalor(surveyId: string) {
  const { data } = await api.get(`/admin/reports/teachers/matrix`, {
    params: { survey_id: surveyId },
    timeout: 60000, // 60 segundos para conexiones lentas
  });
  return data;
}

/**
 * Exporta reportes a CSV
 */
export async function exportReportesCSV(
  params: ReporteParams = {}
): Promise<Blob> {
  const { data } = await api.get("/admin/reportes/export/csv", {
    params,
    responseType: "blob",
  });
  return data;
}

/**
 * Exporta reportes a Excel
 */
export async function exportReportesExcel(
  params: ReporteParams = {}
): Promise<Blob> {
  const { data } = await api.get("/admin/reportes/export/excel", {
    params,
    responseType: "blob",
  });
  return data;
}

/* ========== DOCENTES ========== */

export type DocenteAdmin = {
  id: string;
  identificador: string;
  nombre: string;
  programa?: string;
  total_asignaciones: number;
  total_evaluaciones: number;
};

/**
 * Lista todos los docentes
 */
export async function getDocentes(params?: {
  search?: string;
  page?: number;
  per_page?: number;
}) {
  const { data } = await api.get("/admin/docentes", { params });
  return data;
}

// Nota: El endpoint /admin/reports/teachers/{teacher_id} no existe en el backend
// Los datos del detalle se construyen a partir de sections y heatmap

/**
 * Obtiene promedios por sección para un docente
 * Backend: /admin/reports/teachers/{teacher_id}/sections
 */
export async function getDocenteSections(teacherId: string, surveyId: string) {
  const { data } = await api.get(`/admin/reports/teachers/${teacherId}/sections`, {
    params: { survey_id: surveyId },
    timeout: 60000, // 60 segundos para conexiones lentas
  });
  return data;
}

/**
 * Obtiene mapa de calor de estudiantes para un docente
 * Backend: /admin/reports/teachers/{teacher_id}/students-heatmap
 */
export async function getDocenteStudentsHeatmap(teacherId: string, surveyId: string) {
  const { data } = await api.get(`/admin/reports/teachers/${teacherId}/students-heatmap`, {
    params: { survey_id: surveyId },
    timeout: 60000, // 60 segundos para conexiones lentas
  });
  return data;
}

/* ========== USUARIOS ========== */

export type UsuarioAdmin = {
  id: string;
  email: string;
  nombre?: string;
  roles: string[];
  estado: string;
  turnos_usados: number;
  fecha_creacion: string;
};

/**
 * Lista todos los usuarios
 */
export async function getUsuarios(params?: {
  search?: string;
  rol?: string;
  estado?: string;
  page?: number;
  per_page?: number;
}) {
  const { data } = await api.get("/admin/usuarios", { params });
  return data;
}

/**
 * Actualiza un usuario
 */
export async function updateUsuario(userId: string, updates: Partial<UsuarioAdmin>) {
  const { data } = await api.patch(`/admin/usuarios/${userId}`, updates);
  return data;
}

/* ========== HELPERS ========== */

/**
 * Descarga un blob como archivo
 */
export function downloadBlob(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}
