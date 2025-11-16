# 👨‍🏫 Perfil Detallado de Docente - Documentación

## 📋 Descripción

Sistema de visualización completo del perfil de un docente con estadísticas detalladas, promedios por sección, mapa de calor general y mapa de calor por estudiante.

---

## 🎯 Funcionalidad Implementada

### 1. **Acceso desde Lista de Docentes**
- En `/admin/reportes` → Seleccionar "📊 Estadísticas por Docente"
- Hacer clic en el **nombre del docente** para abrir su perfil
- La URL será: `/admin/docentes/{teacher_id}?survey_id={survey_id}`

### 2. **Componentes del Perfil**

#### a) **Estadísticas Generales**
```typescript
- Promedio General (calculado desde secciones)
- Estudiantes que Evaluaron (número de encuestas completadas)
- Programa académico
```

#### b) **Promedios por Sección**
```typescript
- Lista de todas las secciones
- Promedio de cada sección
- Número de respuestas por sección
- Barra de progreso visual (0-5)
```

#### c) **Mapa de Calor General por Pregunta**
```typescript
- Tabla con todas las preguntas
- Código y enunciado
- N respuestas
- Promedio con color (rojo → amarillo → verde)
- Distribución detallada (1, 2, 3, 4, 5)
```

#### d) **Mapa de Calor de Estudiantes**
```typescript
- Cada fila = un estudiante (attempt)
- Columnas = preguntas (códigos)
- Celdas con valores coloreados
- Email del estudiante
- Fecha de respuesta
- Promedio por estudiante
```

#### e) **Peor Pregunta**
```typescript
- Alerta visual con la pregunta de menor calificación
- Código, enunciado y promedio
```

---

## 🔗 Endpoints Consumidos

### 1. **Detalle del Docente**
```http
GET /api/v1/admin/reports/teachers/{teacher_id}?survey_id={survey_id}
```

**Respuesta**:
```json
{
  "teacher_id": "uuid",
  "teacher_nombre": "ALEXANDER PAREDES MARTINEZ",
  "programa": "Ingeniería de Sistemas",
  "n_enviadas": 25,
  "n_respuestas": 375,
  "promedio_general": 4.3,
  "peor_pregunta": {
    "codigo": "Q1.2",
    "enunciado": "...",
    "promedio": 3.1
  },
  "preguntas_breakdown": [
    {
      "codigo": "Q1.1",
      "enunciado": "...",
      "n": 25,
      "promedio": 4.5,
      "c1": 0,
      "c2": 1,
      "c3": 3,
      "c4": 8,
      "c5": 13
    }
  ]
}
```

### 2. **Promedios por Sección**
```http
GET /api/v1/admin/reports/teachers/{teacher_id}/sections?survey_id={survey_id}
```

**Respuesta**:
```json
{
  "teacher_id": "uuid",
  "teacher_nombre": "ALEXANDER PAREDES MARTINEZ",
  "sections": [
    {
      "section_id": "uuid",
      "titulo": "1. Desarrollo Académico",
      "n_respuestas": 125,
      "promedio": 4.2
    },
    {
      "section_id": "uuid",
      "titulo": "2. Compromiso Pedagógico",
      "n_respuestas": 125,
      "promedio": 4.5
    }
  ]
}
```

### 3. **Mapa de Calor de Estudiantes**
```http
GET /api/v1/admin/reports/teachers/{teacher_id}/students-heatmap?survey_id={survey_id}
```

**Respuesta**:
```json
{
  "teacher_id": "uuid",
  "teacher_nombre": "ALEXANDER PAREDES MARTINEZ",
  "columns": ["Q1.1", "Q1.2", "Q1.3", "Q2.1", ...],
  "rows": [
    {
      "attempt_id": "uuid",
      "user_email": "estudiante@usco.edu.co",
      "created_at": "2024-11-11 03:30:00",
      "n_respuestas": 15,
      "promedio": 4.3,
      "values": [5, 4, 5, 3, 4, 5, 4, 5, 4, 3, 5, 4, 5, 4, 5]
    },
    {
      "attempt_id": "uuid",
      "user_email": "otro@usco.edu.co",
      "created_at": "2024-11-11 02:15:00",
      "n_respuestas": 15,
      "promedio": 3.8,
      "values": [4, 3, 4, 3, 3, 4, 3, 4, 4, 3, 4, 3, 4, 3, 4]
    }
  ]
}
```

---

## 🎨 Visualización

### **Escala de Colores del Heatmap**
```
5.0 - 4.5  →  🟢 Verde oscuro  (#10b981)
4.5 - 4.0  →  🟢 Verde         (#34d399)
4.0 - 3.5  →  🟡 Amarillo      (#fbbf24)
3.5 - 3.0  →  🟠 Naranja       (#fb923c)
3.0 - 2.0  →  🔴 Rojo claro    (#f87171)
< 2.0      →  🔴 Rojo          (#ef4444)
null/--    →  ⚪ Gris          (#e5e7eb)
```

---

## 📂 Archivos Modificados/Creados

### **Nuevos Archivos**
```
✅ src/pages/admin/DocentePerfil.tsx
✅ PERFIL_DOCENTE.md
```

### **Archivos Modificados**
```
✅ src/services/admin.ts
   - getDocenteDetalle()
   - getDocenteSections()
   - getDocenteStudentsHeatmap()

✅ src/pages/admin/ReportesAvanzados.tsx
   - VistaPorDocente ahora acepta surveyId
   - Nombres de docentes son clickeables (Link)

✅ src/router.tsx
   - Nueva ruta: /admin/docentes/:teacherId
```

---

## 🚀 Flujo de Usuario

1. **Navegar a Reportes**
   ```
   /admin/reportes
   ```

2. **Seleccionar Encuesta y Tipo**
   ```
   - Encuesta: "Evaluación Docente Lic. en Matemáticas"
   - Tipo: "📊 Estadísticas por Docente"
   ```

3. **Ver Lista de Docentes**
   ```
   Se muestra tabla con:
   - Nombre (clickeable)
   - Programa
   - Promedio
   - Evaluaciones
   - Pregunta más baja
   ```

4. **Hacer Clic en Nombre**
   ```
   Ejemplo: "ALEXANDER PAREDES MARTINEZ"
   → Redirige a: /admin/docentes/{id}?survey_id={id}
   ```

5. **Ver Perfil Completo**
   ```
   ✅ Estadísticas generales (tarjetas)
   ✅ Promedios por sección (barras)
   ✅ Mapa de calor por pregunta (tabla coloreada)
   ✅ Mapa de calor por estudiante (matriz completa)
   ✅ Peor pregunta (alerta amarilla)
   ```

6. **Volver a Reportes**
   ```
   Botón "← Volver" en la parte superior
   ```

---

## 🔍 Casos Especiales

### **Sin datos**
```typescript
- Muestra mensaje: "No se encontró información del docente"
- Botón para volver a reportes
```

### **Error de carga**
```typescript
- Muestra mensaje de error específico
- Opción de volver a reportes
```

### **Docente sin evaluaciones enviadas**
```typescript
- n_enviadas: 0
- Muestra "—" en promedios
- Secciones y heatmaps vacíos
```

### **Respuestas null**
```typescript
- Celdas del heatmap con fondo gris
- Muestra "—" en lugar de número
```

---

## 🎯 Filtros Backend

Los endpoints filtran automáticamente:
- ✅ Solo respuestas con `estado = 'enviado'`
- ✅ Solo preguntas de tipo `likert` (no texto)
- ✅ Solo valores `valor_likert IS NOT NULL`
- ✅ Solo asignaciones activas del docente a la encuesta

---

## 📊 Ejemplo de Datos Completos

```json
{
  "teacher_id": "550e8400-e29b-41d4-a716-446655440000",
  "teacher_nombre": "ALEXANDER PAREDES MARTINEZ",
  "programa": "Ingeniería de Sistemas",
  "n_enviadas": 25,
  "n_respuestas": 375,
  "promedio_general": 4.32,
  "peor_pregunta": {
    "codigo": "Q2.3",
    "enunciado": "El docente fomenta la participación activa",
    "promedio": 3.84
  },
  "preguntas_breakdown": [
    {
      "codigo": "Q1.1",
      "enunciado": "Dominio de la asignatura",
      "n": 25,
      "promedio": 4.72,
      "c1": 0, "c2": 0, "c3": 2, "c4": 5, "c5": 18
    }
  ]
}
```

---

## ✅ Estado: **COMPLETAMENTE FUNCIONAL**

Todo está implementado y listo para usar! 🎉
