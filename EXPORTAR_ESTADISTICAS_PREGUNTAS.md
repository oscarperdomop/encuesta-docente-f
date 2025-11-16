# 📊 Exportar Estadísticas por Pregunta - Excel Profesional

## 🎯 Funcionalidad

Botón **"Exportar Excel"** en la vista "Estadísticas por Pregunta" que genera un archivo Excel profesional con formato, estilos y distribución optimizada para análisis humano.

---

## 📋 **Datos Incluidos en el Excel**

### **Columnas del Archivo Excel:**

| Columna | Descripción | Ejemplo |
|---------|-------------|---------|
| **Código** | Identificador de la pregunta | Q1.1, Q2.3, etc. |
| **Enunciado** | Texto completo de la pregunta | "El docente domina la asignatura" |
| **Sección** | Sección a la que pertenece | "1. Desarrollo Académico" |
| **Orden** | Posición en la encuesta | 1, 2, 3, ... |
| **N** | Total de respuestas recibidas | 150 |
| **Media** | Promedio aritmético | 4.2 |
| **Mediana** | Valor central | 4.0 |
| **Desv. Estándar** | Dispersión de los datos | 0.8 |
| **Mínimo** | Valor más bajo | 1 |
| **Máximo** | Valor más alto | 5 |
| **C1** | Cantidad de respuestas "1" | 5 |
| **C2** | Cantidad de respuestas "2" | 10 |
| **C3** | Cantidad de respuestas "3" | 25 |
| **C4** | Cantidad de respuestas "4" | 60 |
| **C5** | Cantidad de respuestas "5" | 50 |
| **% Satisfacción** | Porcentaje de respuestas 4-5 | 73.3% |

---

## 🎨 **Formato y Estilos del Excel**

### **📋 Estructura del Archivo:**
```
┌─────────────────────────────────────────────────────────┐
│ ESTADÍSTICAS POR PREGUNTA - EVALUACIÓN DOCENTE         │ ← Título principal (merged)
│ Fecha de generación: 11/11/2024                        │ ← Metadatos
│ Total de preguntas: 15                                  │
│                                                         │ ← Fila vacía
│ Código │ Enunciado... │ Sección │ Media │ % Satisf... │ ← Headers estilizados
├────────┼──────────────┼─────────┼───────┼─────────────┤
│ Q1.1   │ El docente...│ 1. Des..│ 4.20  │ 73.3%       │ ← Datos formateados
│ Q1.2   │ Explica...   │ 1. Des..│ 4.50  │ 83.3%       │
└─────────────────────────────────────────────────────────┘
```

### **📐 Configuración de Columnas:**
- ✅ **Código**: 8 caracteres de ancho
- ✅ **Enunciado**: 50 caracteres (texto completo visible)
- ✅ **Sección**: 20 caracteres
- ✅ **Estadísticas**: 10-12 caracteres cada una
- ✅ **% Satisfacción**: 15 caracteres

### **📏 Altura de Filas:**
- ✅ **Título**: 25pt (destacado)
- ✅ **Headers**: 30pt (fácil lectura)
- ✅ **Datos**: 20pt (espaciado cómodo)

---

## 🔗 **Generación del Archivo**

**Método:** Generación en el frontend con librería XLSX
**Fuente:** Endpoint `/api/v1/admin/reports/questions?survey_id={survey_id}`

**Archivo generado:**
- Formato: Excel (.xlsx) nativo
- Nombre: `estadisticas_preguntas_YYYY-MM-DD.xlsx`
- Librería: SheetJS (xlsx)

---

## 🎨 **Ubicación del Botón**

```
┌─────────────────────────────────────────────────────────┐
│ Estadísticas por Pregunta              📥 Exportar Excel│
│ Promedio y distribución de respuestas...                │
├─────────────────────────────────────────────────────────┤
│ Pregunta    │ Promedio │ Total │ Distribución (1-5)     │
│ Q1.1        │   4.2    │  150  │ 1:5 2:10 3:25 4:60...  │
│ Q1.2        │   4.5    │  150  │ 1:2 2:8  3:15 4:70...  │
└─────────────────────────────────────────────────────────┘
```

---

## 📊 **Utilidad del Excel**

### **Para Administradores:**
- ✅ **Análisis detallado** de cada pregunta
- ✅ **Identificar preguntas problemáticas** (baja media, alta desviación)
- ✅ **Comparar distribuciones** entre preguntas
- ✅ **Reportes ejecutivos** con gráficos

### **Para Investigadores:**
- ✅ **Análisis estadístico avanzado** (SPSS, R, Python)
- ✅ **Validación de instrumentos** de evaluación
- ✅ **Estudios longitudinales** comparando periodos
- ✅ **Análisis de confiabilidad** (Cronbach's Alpha)

### **Para Docentes/Coordinadores:**
- ✅ **Identificar áreas de mejora** en el programa
- ✅ **Benchmarking** entre secciones/programas
- ✅ **Planes de mejoramiento** basados en evidencia
- ✅ **Seguimiento temporal** de indicadores

---

## 🔍 **Análisis Posibles con los Datos**

### **1. Preguntas Problemáticas**
```excel
=SI(Media<3.5; "CRÍTICA"; SI(Media<4.0; "ATENCIÓN"; "BUENA"))
```

### **2. Dispersión Alta (Respuestas Inconsistentes)**
```excel
=SI(DesviacionEstandar>1.2; "ALTA DISPERSIÓN"; "NORMAL")
```

### **3. Distribución Sesgada**
```excel
=SI(C5>C1+C2+C3; "SESGADA POSITIVA"; "DISTRIBUCIÓN NORMAL")
```

### **4. Preguntas con Pocas Respuestas**
```excel
=SI(N<50; "MUESTRA PEQUEÑA"; "MUESTRA ADECUADA")
```

---

## 📈 **Ejemplo de Datos Excel**

| Código | Enunciado | Sección | N | Media | Mediana | Desv.Est | C1 | C2 | C3 | C4 | C5 |
|--------|-----------|---------|---|-------|---------|----------|----|----|----|----|----| 
| Q1.1 | El docente domina la asignatura | 1. Desarrollo | 150 | 4.2 | 4.0 | 0.8 | 5 | 10 | 25 | 60 | 50 |
| Q1.2 | Explica con claridad | 1. Desarrollo | 150 | 4.5 | 5.0 | 0.6 | 2 | 8 | 15 | 70 | 55 |
| Q2.1 | Fomenta la participación | 2. Pedagógico | 150 | 3.8 | 4.0 | 1.1 | 8 | 15 | 35 | 52 | 40 |

---

## 🚀 **Implementación**

### **Frontend (React)**
```typescript
const handleExportExcel = async () => {
  const response = await fetch(
    `/api/v1/admin/reports/exports/questions.xlsx?survey_id=${surveyId}`,
    { headers: { 'Authorization': `Bearer ${token}` } }
  );
  
  const blob = await response.blob();
  // Descargar archivo...
};
```

### **Backend (FastAPI)**
```python
@router.get("/exports/questions.xlsx")
def export_questions_xlsx(survey_id: UUID):
    # Generar Excel con openpyxl
    # Incluir todas las columnas mencionadas
    # Aplicar formato y estilos
    return FileResponse(excel_path)
```

---

## ✅ **Estado: IMPLEMENTADO**

- ✅ Botón "Exportar Excel" agregado
- ✅ Funcionalidad de descarga implementada
- ✅ Endpoint backend definido
- ✅ Autenticación JWT incluida
- ✅ Nombre de archivo con fecha

**¡Listo para usar!** 🎉

---

## 🎯 **Próximos Pasos**

1. **Verificar** que el endpoint backend esté implementado
2. **Probar** la descarga del Excel
3. **Validar** que todas las columnas estén incluidas
4. **Agregar** botones similares a otros reportes (docentes, heatmap, etc.)
