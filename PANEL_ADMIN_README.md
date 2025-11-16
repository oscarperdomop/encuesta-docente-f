# Panel de Administración - Frontend

## 📊 Resumen

Se implementó el panel de administración del frontend utilizando los **endpoints existentes del backend**.

## ✅ Páginas Implementadas

### 1. **Dashboard** (`/admin`)
**Archivo**: `src/pages/admin/AdminHome.tsx`

**Funcionalidades**:
- Estadísticas generales (preparado para endpoint `/admin/stats/overview`)
- 4 tarjetas de métricas: Usuarios, Encuestas, Respuestas, Completitud
- Accesos rápidos a todas las secciones

**Estado**: ⚠️ Muestra advertencia porque el endpoint `/admin/stats/overview` no existe aún en el backend

---

### 2. **Encuestas** (`/admin/encuestas`)
**Archivo**: `src/pages/admin/EncuestasList.tsx`

**Funcionalidades**:
- Lista de encuestas activas e inactivas
- Búsqueda por nombre/código
- Filtro por estado (activa/inactiva)

**Endpoint usado**: `GET /surveys/activas`

**Estado**: ✅ Funcional

---

### 3. **Reportes** (`/admin/reportes`)
**Archivo**: `src/pages/admin/Reportes.tsx`

**Funcionalidades**:
- Selector de encuesta
- Estadísticas: Enviadas, En Progreso, Pendientes
- Tabla de intentos con estado por docente
- Botones de exportación (CSV/Excel) - Preparados para cuando existan los endpoints

**Endpoints usados**:
- `GET /surveys/activas` - Listar encuestas
- `GET /attempts/summary?survey_id={id}` - Resumen de intentos

**Estado**: ✅ Funcional (exportación pendiente de endpoints)

---

### 4. **Docentes** (`/admin/docentes`)
**Archivo**: `src/pages/admin/Docentes.tsx`

**Funcionalidades**:
- Selector de encuesta
- Estadísticas: Total, Evaluados, Pendientes
- Buscador por nombre/identificador/programa
- Tabla con todos los docentes asignados
- Estado: Evaluado/Pendiente

**Endpoints usados**:
- `GET /surveys/activas` - Listar encuestas
- `GET /surveys/{id}/teachers?includeState=true&limit=1000` - Docentes asignados

**Estado**: ✅ Funcional

---

## 🚀 Rutas Configuradas

```typescript
/admin                → Dashboard
/admin/encuestas      → Lista de encuestas
/admin/reportes       → Reportes y estadísticas
/admin/docentes       → Gestión de docentes
/admin/asignaciones   → ⏳ Próximamente
/admin/usuarios       → ⏳ Próximamente
```

## 📁 Estructura de Archivos

```
src/
├── pages/admin/
│   ├── AdminHome.tsx        ← Dashboard
│   ├── AdminLayout.tsx      ← Layout con sidebar
│   ├── EncuestasList.tsx    ← Gestión de encuestas
│   ├── Reportes.tsx         ← Reportes y exportación
│   └── Docentes.tsx         ← Gestión de docentes
├── components/admin/
│   └── AdminSidebar.tsx     ← Navegación lateral
├── services/
│   └── admin.ts             ← Servicios de API para admin
└── routes/
    └── AdminRoute.tsx       ← Protección de rutas admin
```

## 🔌 Servicios API Creados

**Archivo**: `src/services/admin.ts`

### Endpoints Implementados:
```typescript
// Estadísticas
getStatsOverview()              → GET /admin/stats/overview
getStatsBySurvey(surveyId)      → GET /admin/stats/survey/{id}

// Reportes
getReportes(params)             → GET /admin/reportes
exportReportesCSV(params)       → GET /admin/reportes/export/csv
exportReportesExcel(params)     → GET /admin/reportes/export/excel

// Docentes
getDocentes(params)             → GET /admin/docentes

// Usuarios
getUsuarios(params)             → GET /admin/usuarios
updateUsuario(userId, updates)  → PATCH /admin/usuarios/{id}

// Helper
downloadBlob(blob, filename)    → Descarga archivos
```

⚠️ **Nota**: Estos endpoints están **preparados** pero muchos no existen aún en el backend.

## 📊 Endpoints que SÍ Funcionan (Backend Existente)

Basado en la documentación del backend, estas son las funciones que **ya están operativas**:

| Función | Endpoint Usado | Estado |
|---------|----------------|--------|
| Dashboard | `/admin/stats/overview` | ❌ No existe |
| Encuestas | `/surveys/activas` | ✅ Funciona |
| Reportes - Resumen | `/attempts/summary` | ✅ Funciona |
| Reportes - Exportar | `/admin/reportes/export/*` | ❌ No existe |
| Docentes - Lista | `/surveys/{id}/teachers` | ✅ Funciona |

## 🔧 Endpoints Faltantes en el Backend

Para completar todas las funcionalidades del panel de admin, el backend necesita estos endpoints:

### 1. **Estadísticas Generales**
```python
GET /admin/stats/overview
Response: {
  total_usuarios: int,
  total_encuestas: int,
  total_respuestas: int,
  tasa_completitud: float,
  encuestas_activas: int
}
```

### 2. **Reportes Detallados**
```python
GET /admin/reportes?survey_id=...&teacher_id=...&estado=...
Response: {
  items: [...],
  total: int,
  page: int,
  per_page: int
}
```

### 3. **Exportación**
```python
GET /admin/reportes/export/csv?survey_id=...
GET /admin/reportes/export/excel?survey_id=...
Response: Archivo binario (Blob)
```

### 4. **Gestión de Docentes** (opcional)
```python
GET /admin/docentes?search=...&page=...
POST /admin/docentes
PATCH /admin/docentes/{id}
DELETE /admin/docentes/{id}
```

### 5. **Gestión de Usuarios** (opcional)
```python
GET /admin/usuarios?search=...&rol=...&estado=...
PATCH /admin/usuarios/{id}
```

## 🎨 Diseño y UX

- **Colores**: Paleta USCO (primario: rojo)
- **Iconos**: Emojis para iconografía rápida
- **Responsive**: Mobile-first con TailwindCSS
- **Estados**: Loading, error, empty states
- **Feedback**: Mensajes claros y warnings

## 🔐 Seguridad

- **Protección de rutas**: Solo usuarios con rol `admin` pueden acceder
- **Validación de token**: Automática en cada request
- **Context de usuario**: Compartido para evitar múltiples llamadas

## 📝 Próximos Pasos

### Corto Plazo:
1. ✅ Implementar endpoints faltantes en el backend
2. Habilitar exportación CSV/Excel
3. Agregar gráficos (Chart.js o Recharts)

### Mediano Plazo:
4. Página de Asignaciones (asignar docentes a encuestas)
5. Página de Usuarios (gestión completa)
6. Dashboard con métricas en tiempo real

### Largo Plazo:
7. Reportes avanzados con filtros múltiples
8. Análisis de sentimiento en Q16
9. Comparativas entre períodos

## 🐛 Problemas Conocidos

- **Dashboard**: Muestra advertencia porque `/admin/stats/overview` no existe
- **Exportación**: Botones preparados pero sin endpoint backend
- **Usuarios**: Página no implementada aún

## 📚 Documentación Relacionada

- `INTEGRACION_BACKEND.md` - Guía de integración frontend-backend
- `ARQUITECTURA.md` - Arquitectura del proyecto
- `CHECKLIST.md` - Checklist de verificación

---

**Última actualización**: 2025-11-10  
**Versión**: 1.0.0
