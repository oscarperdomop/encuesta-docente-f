# Endpoints de Admin - Mapeo Backend Real

## ✅ Resumen

El backend **YA TIENE** todos los endpoints necesarios para el panel de administración. Están bajo la ruta `/reports` en lugar de `/admin/stats`.

## 🔗 Mapeo: Frontend ↔ Backend

| Frontend Esperaba | Backend Real | Estado |
|------------------|--------------|--------|
| `/admin/stats/preguntas` | `/admin/reports/questions` | ✅ **Existe** |
| `/admin/stats/docentes` | `/admin/reports/teachers` | ✅ **Existe** |
| `/admin/stats/promedios` | `/admin/reports/summary` | ✅ **Existe** |
| `/admin/stats/heatmap` | `/admin/reports/teachers/matrix` | ✅ **Existe** |

**Nota**: Todos los endpoints están bajo `/api/v1/admin/reports/...` (no solo `/api/v1/reports/...`)

## 📊 Endpoints Disponibles (Completo)

### 1. **Resumen General**

```http
GET /api/v1/admin/reports/summary?survey_id={survey_id}
```

**Respuesta**:
```json
{
  "enviados": 150,
  "en_progreso": 5,
  "pendientes": 20,
  "completion_rate": 0.75,
  "score_global": 4.2,
  "secciones": [
    {
      "section_id": "uuid",
      "titulo": "Sección 1",
      "score": 4.5
    }
  ]
}
```

---

### 2. **Estadísticas por Pregunta**

```http
GET /api/v1/reports/questions?survey_id={survey_id}
```

**Respuesta** (Array):
```json
[
  {
    "question_id": "uuid",
    "codigo": "Q1",
    "enunciado": "Texto de la pregunta",
    "orden": 1,
    "section": "Sección 1",
    "n": 150,
    "mean": 4.2,
    "median": 4.0,
    "stddev": 0.8,
    "min": 1,
    "max": 5,
    "c1": 5,
    "c2": 10,
    "c3": 25,
    "c4": 60,
    "c5": 50
  }
]
```

---

### 3. **Ranking de Docentes**

```http
GET /api/v1/reports/teachers?survey_id={survey_id}&page=1&page_size=50&q=busqueda
```

**Respuesta** (Array):
```json
[
  {
    "teacher_id": "uuid",
    "teacher_nombre": "Juan Pérez",
    "programa": "Ingeniería",
    "n_respuestas": 25,
    "promedio": 4.5,
    "peor_question_id": "uuid",
    "peor_codigo": "Q7",
    "peor_enunciado": "Pregunta con menor puntaje",
    "peor_promedio": 3.2
  }
]
```

---

### 4. **Mapa de Calor**

```http
GET /api/v1/reports/teachers/matrix?survey_id={survey_id}&programa=Ingenieria&min_n=1
```

**Respuesta**:
```json
{
  "columns": ["Q1", "Q2", "Q3", "Q4", "Q5"],
  "rows": [
    {
      "teacher_id": "uuid",
      "teacher_nombre": "Juan Pérez",
      "programa": "Ingeniería",
      "n_respuestas": 25,
      "values": [4.5, 4.2, 4.8, 3.9, 4.1]
    }
  ]
}
```

---

### 5. **Top & Bottom Preguntas**

```http
GET /api/v1/reports/questions/top-bottom?survey_id={survey_id}&limit=5&min_n=10
```

**Respuesta**:
```json
{
  "top": [
    {
      "question_id": "uuid",
      "codigo": "Q3",
      "enunciado": "Mejor pregunta",
      "section": "Sección 1",
      "n": 150,
      "avg": 4.8
    }
  ],
  "bottom": [
    {
      "question_id": "uuid",
      "codigo": "Q7",
      "enunciado": "Pregunta con menor puntaje",
      "section": "Sección 2",
      "n": 148,
      "avg": 3.2
    }
  ]
}
```

---

### 6. **Detalle de Pregunta**

```http
GET /api/v1/reports/questions/{question_id}?survey_id={survey_id}&by=teacher
```

**Respuesta**:
```json
{
  "question_id": "uuid",
  "codigo": "Q1",
  "enunciado": "Texto de la pregunta",
  "section": "Sección 1",
  "global": {
    "n": 150,
    "avg": 4.2,
    "dist": {"1": 5, "2": 10, "3": 25, "4": 60, "5": 50}
  },
  "by_teacher": [
    {
      "teacher_id": "uuid",
      "teacher_nombre": "Juan Pérez",
      "n": 3,
      "avg": 4.5
    }
  ]
}
```

---

### 7. **Detalle de Docente**

```http
GET /api/v1/reports/teachers/{teacher_id}?survey_id={survey_id}
```

**Respuesta**:
```json
{
  "teacher_id": "uuid",
  "teacher_nombre": "Juan Pérez",
  "programa": "Ingeniería",
  "n_respuestas": 25,
  "promedio": 4.5,
  "preguntas": [
    {
      "question_id": "uuid",
      "codigo": "Q1",
      "enunciado": "Pregunta 1",
      "section": "Sección 1",
      "n": 3,
      "mean": 4.7,
      "c1": 0, "c2": 0, "c3": 0, "c4": 1, "c5": 2
    }
  ],
  "comentarios": [
    {
      "attempt_id": "uuid",
      "creado_en": "2025-11-10 20:30:00",
      "positivos": "Excelente docente",
      "mejorar": "Más ejemplos",
      "comentarios": "Muy claro"
    }
  ]
}
```

---

### 8. **Comentarios (Q16)**

```http
GET /api/v1/reports/comments?survey_id={survey_id}&teacher_id={teacher_id}&q=busqueda&limit=50&offset=0
```

**Respuesta**:
```json
{
  "total": 150,
  "items": [
    {
      "attempt_id": "uuid",
      "teacher_id": "uuid",
      "teacher_nombre": "Juan Pérez",
      "created_at": "2025-11-10 20:30:00",
      "positivos": "Excelente",
      "mejorar": "Más ejemplos",
      "comentarios": "Muy claro"
    }
  ]
}
```

---

### 9. **Progreso Diario**

```http
GET /api/v1/reports/progress/daily?survey_id={survey_id}&from=2025-01-01&to=2025-12-31
```

**Respuesta**:
```json
{
  "series": [
    {
      "day": "2025-11-10",
      "sent": 25
    }
  ]
}
```

---

### 10. **Resumen por Sección**

```http
GET /api/v1/reports/sections/summary?survey_id={survey_id}
```

**Respuesta** (Array):
```json
[
  {
    "section_id": "uuid",
    "titulo": "Sección 1",
    "n_preguntas": 5,
    "n_respuestas": 750,
    "promedio": 4.5,
    "mejor_question_id": "uuid",
    "mejor_codigo": "Q3",
    "mejor_enunciado": "Mejor pregunta",
    "mejor_promedio": 4.8,
    "peor_question_id": "uuid",
    "peor_codigo": "Q7",
    "peor_enunciado": "Pregunta más baja",
    "peor_promedio": 3.9
  }
]
```

---

### 11. **Filtros Disponibles**

```http
GET /api/v1/reports/teachers/filters?survey_id={survey_id}&tz=America/Bogota
```

**Respuesta**:
```json
{
  "programas": ["Ingeniería", "Medicina", "Derecho"],
  "teachers": [
    {
      "id": "uuid",
      "nombre": "Juan Pérez",
      "programa": "Ingeniería"
    }
  ],
  "sections": [
    {
      "id": "uuid",
      "titulo": "Sección 1",
      "n_preguntas": 5
    }
  ],
  "questions": [
    {
      "id": "uuid",
      "codigo": "Q1",
      "enunciado": "Pregunta 1",
      "section": "Sección 1"
    }
  ],
  "date_range": {
    "min": "2025-01-01",
    "max": "2025-12-31"
  }
}
```

---

## 📥 Endpoints de Exportación

### CSV - Preguntas
```http
GET /api/v1/reports/exports/questions-stats.csv?survey_id={id}&min_n=1&include_ids=false
```

### CSV - Docentes
```http
GET /api/v1/reports/exports/teachers-stats.csv?survey_id={id}&q=busqueda&include_ids=false
```

### CSV - Matriz
```http
GET /api/v1/reports/exports/matrix.csv?survey_id={id}&programa=Ingenieria&min_n=1&include_ids=false
```

### CSV - Docentes Completo
```http
GET /api/v1/reports/exports/survey/{survey_id}/teachers.csv?min_n=1&include_ids=false&programa=Ingenieria
```

### CSV - Comentarios
```http
GET /api/v1/reports/exports/survey/{survey_id}/comments.csv?tz=America/Bogota&include_ids=false
```

### CSV - Respuestas (Crudo)
```http
GET /api/v1/reports/exports/survey/{survey_id}/responses.csv
```

### CSV - Respuestas (Pretty)
```http
GET /api/v1/reports/exports/survey/{survey_id}/responses-pretty.csv?tz=America/Bogota&include_ids=false
```

### CSV - Preguntas
```http
GET /api/v1/reports/exports/survey/{survey_id}/questions.csv?include_stats=true
```

### Excel - Completo
```http
GET /api/v1/reports/exports/survey/{survey_id}.xlsx?tz=America/Bogota&min_n=1&programa=Ingenieria
```

---

## 🔐 Autenticación

Todos los endpoints requieren:
- **Header**: `Authorization: Bearer <JWT_TOKEN>`
- **Rol**: `admin` o `superadmin`
- **Dependency**: `require_admin` aplicado en cada endpoint

---

## ✅ Estado de Integración

| Componente | Estado |
|-----------|--------|
| Backend Endpoints | ✅ **Implementados** |
| Frontend Services | ✅ **Actualizados** |
| Frontend Views | ✅ **Adaptadas** |
| Documentación | ✅ **Completa** |

---

## 🚀 Próximos Pasos

1. **Probar cada tipo de reporte** en `/admin/reportes`
2. **Verificar con datos reales** del backend
3. **Ajustar formatos** si es necesario
4. **Implementar exportación** cuando sea requerido

---

**Última actualización**: 2025-11-10  
**Versión**: 2.0.0 (Integración Completa)
