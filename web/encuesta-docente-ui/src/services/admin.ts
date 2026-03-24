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

export type UsuariosListResponse = {
  items: UsuarioAdmin[];
  total: number;
  page: number;
  per_page: number;
  pages: number;
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
}): Promise<UsuariosListResponse> {
  const { data } = await api.get<UsuariosListResponse>("/admin/usuarios", { params });
  return data;
}

/**
 * Actualiza un usuario
 */
export async function updateUsuario(userId: string, updates: Partial<UsuarioAdmin>) {
  const { data } = await api.patch(`/admin/usuarios/${userId}`, updates);
  return data;
}

export async function getAvailableRoles(): Promise<string[]> {
  const { data } = await api.get<{ roles: string[] }>("/admin/roles/available");
  return Array.isArray(data?.roles) ? data.roles : [];
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

/* ========== IMPORTS DOCENTES ========== */

export type TeachersImportResponse = {
  summary: {
    inserted: number;
    updated: number;
    skipped: number;
  };
  errors: Array<{
    row: number;
    message: string;
  }>;
  assignment?: {
    survey_id: string;
    applied: boolean;
    requested: number;
    assigned_new: number;
    already_assigned: number;
    total_assigned: number;
  } | null;
};

export async function downloadTeachersTemplateCSV(): Promise<Blob> {
  const { data } = await api.get("/admin/imports/teachers/template.csv", {
    responseType: "blob",
  });
  return data;
}

export async function importTeachersCSV(
  file: File,
  opts: { dryRun?: boolean; surveyId?: string } = {}
): Promise<TeachersImportResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const params: Record<string, string | boolean> = {};
  if (typeof opts.dryRun === "boolean") params.dry_run = opts.dryRun;
  if (opts.surveyId) params.survey_id = opts.surveyId;

  const { data } = await api.post<TeachersImportResponse>(
    "/admin/imports/teachers",
    formData,
    {
      params,
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 120000,
    }
  );
  return data;
}

/* ========== IMPORTS USUARIOS ========== */

export type UsersImportResponse = {
  summary: {
    inserted: number;
    updated: number;
    skipped: number;
    roles_granted: number;
    roles_existing: number;
  };
  errors: Array<{
    row: number;
    message: string;
  }>;
};

export async function downloadUsersTemplateCSV(): Promise<Blob> {
  const { data } = await api.get("/admin/imports/users/template.csv", {
    responseType: "blob",
  });
  return data;
}

export async function importUsersCSV(
  file: File,
  opts: { dryRun?: boolean; replaceRoles?: boolean } = {}
): Promise<UsersImportResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const params: Record<string, boolean> = {};
  if (typeof opts.dryRun === "boolean") params.dry_run = opts.dryRun;
  if (typeof opts.replaceRoles === "boolean") params.replace_roles = opts.replaceRoles;

  const { data } = await api.post<UsersImportResponse>("/admin/imports/users", formData, {
    params,
    headers: { "Content-Type": "multipart/form-data" },
    timeout: 120000,
  });
  return data;
}

export type AssignTeachersOut = {
  survey_id: string;
  mode: "add" | "remove" | "set";
  before: number;
  after: number;
  added: number;
  removed: number;
  unchanged: number;
};

export async function assignTeachersToSurvey(
  surveyId: string,
  teacherIds: string[],
  mode: "add" | "remove" | "set" = "add"
): Promise<AssignTeachersOut> {
  const { data } = await api.post<AssignTeachersOut>(
    `/admin/surveys/${surveyId}/teachers/assign`,
    { teacher_ids: teacherIds, mode }
  );
  return data;
}
