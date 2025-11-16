# Endpoints de Admin Requeridos para Reportes

## 📊 Resumen

El frontend de reportes avanzados está preparado para consumir los siguientes endpoints. Estos deben implementarse en el backend para habilitar todas las funcionalidades.

## 🔗 Endpoints a Implementar

### 1. **Estadísticas por Pregunta**

```http
GET /api/v1/admin/stats/preguntas?survey_id={survey_id}
```

**Parámetros**:
- `survey_id` (UUID, required): ID de la encuesta

**Respuesta esperada**:
```json
{
  "preguntas": [
    {
      "codigo": "Q1",
      "enunciado": "Texto de la pregunta",
      "promedio": 4.2,
      "total_respuestas": 150,
      "distribucion": {
        "1": 5,
        "2": 10,
        "3": 25,
        "4": 60,
        "5": 50
      }
    },
    ...
  ]
}
```

**SQL Ejemplo**:
```sql
SELECT 
  q.codigo,
  q.enunciado,
  AVG(r.value) as promedio,
  COUNT(r.id) as total_respuestas,
  COUNT(CASE WHEN r.value = 1 THEN 1 END) as dist_1,
  COUNT(CASE WHEN r.value = 2 THEN 1 END) as dist_2,
  COUNT(CASE WHEN r.value = 3 THEN 1 END) as dist_3,
  COUNT(CASE WHEN r.value = 4 THEN 1 END) as dist_4,
  COUNT(CASE WHEN r.value = 5 THEN 1 END) as dist_5
FROM questions q
JOIN responses r ON r.question_id = q.id
JOIN attempts a ON a.id = r.attempt_id
WHERE a.survey_id = :survey_id
  AND a.estado = 'enviado'
  AND q.tipo = 'likert'
GROUP BY q.id, q.codigo, q.enunciado
ORDER BY q.orden
```

---

### 2. **Estadísticas por Docente**

```http
GET /api/v1/admin/stats/docentes?survey_id={survey_id}
```

**Parámetros**:
- `survey_id` (UUID, required): ID de la encuesta

**Respuesta esperada**:
```json
{
  "docentes": [
    {
      "id": "uuid-docente",
      "identificador": "12345",
      "nombre": "Juan Pérez",
      "promedio_general": 4.5,
      "total_evaluaciones": 25,
      "promedio_por_seccion": {
        "Seccion1": 4.3,
        "Seccion2": 4.7
      }
    },
    ...
  ]
}
```

**SQL Ejemplo**:
```sql
SELECT 
  t.id,
  t.identificador,
  t.nombre,
  COUNT(DISTINCT a.id) as total_evaluaciones,
  AVG(r.value) as promedio_general
FROM teachers t
JOIN attempts a ON a.teacher_id = t.id
JOIN responses r ON r.attempt_id = a.id
WHERE a.survey_id = :survey_id
  AND a.estado = 'enviado'
GROUP BY t.id, t.identificador, t.nombre
ORDER BY promedio_general DESC
```

---

### 3. **Promedios Generales**

```http
GET /api/v1/admin/stats/promedios?survey_id={survey_id}
```

**Parámetros**:
- `survey_id` (UUID, required): ID de la encuesta

**Respuesta esperada**:
```json
{
  "promedio_general": 4.3,
  "total_respuestas": 1500,
  "total_evaluaciones": 100,
  "por_seccion": [
    {
      "seccion": "Sección 1: Competencias Pedagógicas",
      "promedio": 4.5,
      "total_respuestas": 500
    },
    {
      "seccion": "Sección 2: Competencias Profesionales",
      "promedio": 4.1,
      "total_respuestas": 1000
    }
  ]
}
```

**SQL Ejemplo**:
```sql
-- Promedio General
SELECT AVG(r.value) as promedio_general
FROM responses r
JOIN attempts a ON a.id = r.attempt_id
WHERE a.survey_id = :survey_id
  AND a.estado = 'enviado';

-- Por Sección
SELECT 
  ss.titulo as seccion,
  AVG(r.value) as promedio,
  COUNT(r.id) as total_respuestas
FROM survey_sections ss
JOIN questions q ON q.section_id = ss.id
JOIN responses r ON r.question_id = q.id
JOIN attempts a ON a.id = r.attempt_id
WHERE a.survey_id = :survey_id
  AND a.estado = 'enviado'
  AND q.tipo = 'likert'
GROUP BY ss.id, ss.titulo, ss.orden
ORDER BY ss.orden
```

---

### 4. **Mapa de Calor (Heatmap)**

```http
GET /api/v1/admin/stats/heatmap?survey_id={survey_id}
```

**Parámetros**:
- `survey_id` (UUID, required): ID de la encuesta

**Respuesta esperada**:
```json
{
  "preguntas": ["Q1", "Q2", "Q3", "Q4", "Q5"],
  "docentes": [
    "Juan Pérez",
    "María García",
    "Carlos López"
  ],
  "matriz": [
    [4.5, 4.2, 4.8, 3.9, 4.1],  // Juan Pérez
    [4.0, 4.5, 4.3, 4.6, 4.2],  // María García
    [3.8, 4.1, 4.0, 4.4, 3.9]   // Carlos López
  ]
}
```

**Descripción**:
- Matriz donde cada fila es un docente y cada columna es una pregunta
- Los valores son los promedios de las respuestas Likert (1-5)

**SQL Ejemplo**:
```sql
SELECT 
  t.nombre as docente,
  q.codigo as pregunta,
  AVG(r.value) as promedio
FROM teachers t
JOIN attempts a ON a.teacher_id = t.id
JOIN responses r ON r.attempt_id = a.id
JOIN questions q ON q.id = r.question_id
WHERE a.survey_id = :survey_id
  AND a.estado = 'enviado'
  AND q.tipo = 'likert'
GROUP BY t.id, t.nombre, q.id, q.codigo
ORDER BY t.nombre, q.orden
```

Luego transformar en matriz en el backend.

---

### 5. **Exportación CSV**

```http
GET /api/v1/admin/reportes/export/csv?survey_id={survey_id}&tipo={tipo}
```

**Parámetros**:
- `survey_id` (UUID, required): ID de la encuesta
- `tipo` (string, optional): Tipo de reporte (preguntas, docentes, promedios, heatmap)

**Respuesta**:
- `Content-Type: text/csv`
- Archivo CSV descargable

**Ejemplo CSV para "preguntas"**:
```csv
Código,Pregunta,Promedio,Total Respuestas,Dist 1,Dist 2,Dist 3,Dist 4,Dist 5
Q1,"Pregunta 1",4.2,150,5,10,25,60,50
Q2,"Pregunta 2",4.5,150,2,5,20,70,53
```

---

### 6. **Exportación Excel** (Opcional)

```http
GET /api/v1/admin/reportes/export/excel?survey_id={survey_id}&tipo={tipo}
```

**Parámetros**:
- `survey_id` (UUID, required): ID de la encuesta
- `tipo` (string, optional): Tipo de reporte

**Respuesta**:
- `Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- Archivo Excel (.xlsx) descargable

**Librerías sugeridas**:
- Python: `openpyxl` o `pandas`
- Node.js: `exceljs`

---

## 🔐 Seguridad

Todos estos endpoints deben:
- Requerir autenticación (JWT)
- Verificar rol `admin` o `superadmin`
- Validar que `survey_id` existe
- Manejar errores 404 si no hay datos

**Ejemplo de decorador FastAPI**:
```python
from app.api.deps import require_admin

@router.get("/admin/stats/preguntas")
def get_stats_por_pregunta(
    survey_id: UUID,
    current_user: User = Depends(get_current_user),
    _: None = Depends(require_admin)
):
    # Implementación
    pass
```

---

## 📊 Frontend - Cómo se Consumen

El frontend ya está preparado para consumir estos endpoints en:

**Archivo**: `src/pages/admin/ReportesAvanzados.tsx`

```typescript
// El usuario selecciona:
// 1. Una encuesta (de /surveys/activas)
// 2. Un tipo de reporte (resumen, preguntas, docentes, promedios, heatmap)

// Luego el frontend llama al endpoint correspondiente:
switch (tipoReporte) {
  case "preguntas":
    await getEstadisticasPorPregunta(surveyId);
    break;
  case "docentes":
    await getEstadisticasPorDocente(surveyId);
    break;
  // ...
}
```

**Servicios en**: `src/services/admin.ts`

---

## ✅ Checklist de Implementación

### Backend:
- [ ] Endpoint `/admin/stats/preguntas`
- [ ] Endpoint `/admin/stats/docentes`
- [ ] Endpoint `/admin/stats/promedios`
- [ ] Endpoint `/admin/stats/heatmap`
- [ ] Endpoint `/admin/reportes/export/csv`
- [ ] Endpoint `/admin/reportes/export/excel` (opcional)
- [ ] Protección con rol admin
- [ ] Tests unitarios
- [ ] Documentación en Swagger

### Frontend:
- [x] Página de Reportes Avanzados
- [x] Selector de tipo de reporte
- [x] Visualizaciones para cada tipo
- [x] Servicios API
- [x] Manejo de estados (loading, error, empty)
- [ ] Integración con endpoints reales
- [ ] Tests de UI

---

## 🎨 Ejemplo Visual de Salida

### Mapa de Calor:
```
           Q1    Q2    Q3    Q4    Q5
Juan      4.5   4.2   4.8   3.9   4.1   🟢🟢🟢🟡🟢
María     4.0   4.5   4.3   4.6   4.2   🟢🟢🟢🟢🟢
Carlos    3.8   4.1   4.0   4.4   3.9   🟡🟢🟢🟢🟡
```

Colores:
- 🔴 Rojo: 1.0 - 2.4 (Bajo)
- 🟠 Naranja: 2.5 - 2.9 (Medio-Bajo)
- 🟡 Amarillo: 3.0 - 3.4 (Medio)
- 🟢 Verde claro: 3.5 - 4.4 (Medio-Alto)
- 🟢 Verde oscuro: 4.5 - 5.0 (Alto)

---

**Última actualización**: 2025-11-10  
**Versión**: 1.0.0
