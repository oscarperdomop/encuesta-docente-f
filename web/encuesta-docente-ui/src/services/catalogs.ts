// src/services/catalogs.ts
import api from "@/services/api";

export type SurveyActiva = {
  id: string;
  codigo: string;
  nombre: string;
  estado: "activa" | "inactiva";
  fecha_inicio?: string | null;
  fecha_fin?: string | null;
};

export type TeacherRow = {
  id: string;
  identificador: string;
  nombre: string;
  programa?: string | null;
  estado: "activo" | "inactivo";
  /** Presente cuando include_state=true en el endpoint */
  evaluated?: boolean;
};

export type QuestionRow = {
  id: string;
  codigo: string;
  enunciado: string;
  orden: number;
  tipo: "likert" | "texto";
  peso: number;
  section: string; // viene del JOIN en tu API
};

export async function getActiveSurveys() {
  const { data } = await api.get<SurveyActiva[]>("/surveys/activas");
  return data;
}

// Trae todas las preguntas de la encuesta
export async function getSurveyQuestions(surveyId: string) {
  const { data } = await api.get<QuestionRow[]>(
    `/surveys/${surveyId}/questions`
  );
  return data;
}

/**
 * Lista los docentes asignados a una encuesta.
 * - hideEvaluated: si true, NO devuelve docentes ya evaluados por el usuario actual (A).
 * - includeState: si true (default), agrega el booleano `evaluated` por fila (B).
 * - q: texto a buscar (nombre, identificador, programa)
 * - limit/offset: paginación
 */
export async function getSurveyTeachers(
  surveyId: string,
  opts: {
    q?: string;
    limit?: number;
    offset?: number;
    hideEvaluated?: boolean;
    includeState?: boolean; // default true
  } = {}
): Promise<TeacherRow[]> {
  const params: Record<string, string | number | boolean> = {};

  if (opts.q) params.q = opts.q;
  if (typeof opts.limit === "number") params.limit = opts.limit;
  if (typeof opts.offset === "number") params.offset = opts.offset;
  if (opts.hideEvaluated) params.hide_evaluated = "true";
  // Por defecto pedimos el estado evaluated desde el backend
  params.include_state = opts.includeState === false ? "false" : "true";

  const { data } = await api.get<TeacherRow[]>(
    `/surveys/${surveyId}/teachers`,
    { params }
  );
  return data;
}

/** Alias histórico (si en algún punto se usó este nombre) */
export async function getQuestions(surveyId: string) {
  return getSurveyQuestions(surveyId);
}
