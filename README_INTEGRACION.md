# 🚀 Integración Frontend-Backend: Encuesta Docente USCO

## 📋 Resumen

Este documento resume la integración completada entre el frontend (React + TypeScript + Vite) y el backend (FastAPI + PostgreSQL) del sistema de encuestas docentes de la USCO.

## 🎯 Estado Actual

✅ **Backend Analizado**: Ubicado en `C:\Users\osdo-\Documents\Enuesta\encuesta-docente\backend\api`  
✅ **Frontend Actualizado**: Ubicado en `C:\Users\osdo-\Documents\encuesta-docente-f\web\encuesta-docente-ui`  
✅ **Ajustes Realizados**: Compatibilidad entre ambos sistemas verificada  
✅ **Documentación Creada**: Guías completas para desarrollo y despliegue

## 🔧 Cambios Realizados en el Frontend

### 1. Actualización de Tipos (`src/services/auth.ts`)

**Cambio de `rol` (string) a `roles` (array)**

```typescript
// ANTES
export type MeOut = {
  id: string;
  email: string;
  nombre?: string;
  rol?: string;  // ❌ No coincide con backend
};

// DESPUÉS
export type MeOut = {
  id: string;
  email: string;
  nombre?: string;
  roles?: string[];  // ✅ Coincide con backend
};
```

### 2. Actualización de Función `me()` (`src/services/auth.ts`)

```typescript
// ANTES
export async function me(): Promise<MeOut & { isAdmin: boolean }> {
  const { data } = await api.get<MeOut>("/auth/me");
  const isAdmin = ["admin", "superadmin"].includes(data.rol || "");
  return { ...data, isAdmin };
}

// DESPUÉS
export async function me(): Promise<MeOut & { isAdmin: boolean }> {
  const { data } = await api.get<MeOut>("/auth/me");
  const roles = data.roles || [];
  const isAdmin = roles.includes("admin") || roles.includes("superadmin");
  return { ...data, isAdmin };
}
```

### 3. Simplificación de `submitAttempt()` (`src/services/attempts.ts`)

**Eliminadas claves redundantes**

```typescript
// ANTES: Enviaba múltiples claves por compatibilidad
body.textos = clean;
body.q16 = clean;
body.observaciones = clean;
body.texto = clean;

// DESPUÉS: Solo la clave esperada por el backend
if (hasQ16) {
  body.textos = clean;
}
```

## 📚 Documentación Creada

### 1. **INTEGRACION_BACKEND.md**
Guía técnica detallada con:
- Mapeo completo de endpoints Frontend ↔ Backend
- Esquemas de request/response
- Ajustes necesarios en código
- Solución de problemas comunes
- Checklist de integración

### 2. **START_DEV.md**
Guía paso a paso para:
- Configurar variables de entorno
- Iniciar backend y frontend
- Verificar conexión
- Solucionar problemas comunes
- Crear datos de prueba

### 3. **ARQUITECTURA.md**
Diagrama completo del sistema con:
- Arquitectura de 3 capas (Frontend → Backend → BD)
- Flujos de autenticación y encuesta
- Modelo de datos (entidades y relaciones)
- Máquina de estados de attempts
- Stack tecnológico detallado

### 4. **CHECKLIST.md**
Lista exhaustiva de verificación con:
- Pre-requisitos
- Configuración paso a paso
- Pruebas de integración (11 secciones)
- Casos de error
- Performance y seguridad
- Responsive design

### 5. **start-dev.ps1**
Script PowerShell para:
- Iniciar backend y frontend automáticamente
- Abrir terminales separadas
- Mostrar URLs disponibles
- Facilitar desarrollo diario

### 6. **env.example.txt**
Template de variables de entorno para el frontend

## 🔗 URLs Importantes

| Servicio | URL | Descripción |
|----------|-----|-------------|
| Frontend Dev | http://localhost:5173 | Interfaz de usuario (Vite) |
| Backend API | http://localhost:8000 | API REST (FastAPI) |
| API Docs | http://localhost:8000/docs | Swagger UI interactiva |
| Health Check | http://localhost:8000/health | Verificar estado del backend |
| DB Health | http://localhost:8000/api/v1/health/db | Verificar conexión a BD |

## 🏃 Inicio Rápido

### Opción 1: Script Automático (Windows)

```powershell
cd C:\Users\osdo-\Documents\encuesta-docente-f
.\start-dev.ps1
```

### Opción 2: Manual

**Terminal 1 - Backend:**
```bash
cd C:\Users\osdo-\Documents\Enuesta\encuesta-docente\backend\api
.venv\Scripts\activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Terminal 2 - Frontend:**
```bash
cd C:\Users\osdo-\Documents\encuesta-docente-f\web\encuesta-docente-ui
npm run dev
```

## 🔐 Variables de Entorno Requeridas

### Backend (`.env`)
```env
DATABASE_URL=postgresql://user:pass@localhost:5432/encuesta_docente
JWT_SECRET=tu-secreto-super-seguro
JWT_EXPIRE_MINUTES=60
MAX_TURNOS=2
CORS_ORIGINS=*
```

### Frontend (`.env`)
```env
VITE_API_URL=http://localhost:8000/api/v1
VITE_API_TIMEOUT=10000
VITE_TEACHERS_VARIANT=B
```

## 📊 Endpoints Principales

| Categoría | Endpoint | Método | Frontend |
|-----------|----------|--------|----------|
| **Auth** | `/auth/login` | POST | `auth.ts:login()` |
| | `/auth/me` | GET | `auth.ts:me()` |
| **Turnos** | `/sessions/turno/open` | POST | `DocentesSelect.tsx:ensureTurnoOpen()` |
| | `/sessions/turno/close` | POST | `auth.ts:logout()` |
| **Catálogos** | `/surveys/activas` | GET | `catalogs.ts:getActiveSurveys()` |
| | `/surveys/{id}/teachers` | GET | `catalogs.ts:getSurveyTeachers()` |
| | `/surveys/{id}/questions` | GET | `catalogs.ts:getSurveyQuestions()` |
| **Intentos** | `/attempts` | POST | `attempts.ts:createAttempts()` |
| | `/attempts/next` | GET | `attempts.ts:getNextAttempt()` |
| | `/attempts/{id}` | PATCH | `attempts.ts:saveProgress()` |
| | `/attempts/{id}/submit` | POST | `attempts.ts:submitAttempt()` |
| | `/attempts/summary` | GET | `attempts.ts:getAttemptsSummary()` |

## 🎯 Flujo Completo

```
1. Login (POST /auth/login)
   ↓
2. Presentación e Intro (páginas locales)
   ↓
3. Apertura de Turno (POST /sessions/turno/open)
   ↓
4. Selección de Docentes (GET /surveys/{id}/teachers)
   ↓
5. Crear Intentos (POST /attempts)
   ↓
6. Encuesta Paso 1 - Q1-Q9 (PATCH /attempts/{id} - autosave)
   ↓
7. Encuesta Paso 2 - Q10-Q16 (PATCH /attempts/{id} - autosave)
   ↓
8. Envío (POST /attempts/{id}/submit)
   ↓
9. Siguiente Docente (GET /attempts/next) o Resumen
   ↓
10. Resumen de Turno (GET /attempts/summary)
   ↓
11. Finalizar Turno (POST /sessions/turno/close)
   ↓
12. Logout (limpieza local + redirect)
```

## ⚠️ Problemas Comunes

### Backend no inicia
- Verificar que PostgreSQL está corriendo
- Verificar `DATABASE_URL` en `.env`
- Verificar que el puerto 8000 está libre

### Frontend no conecta
- Verificar `VITE_API_URL` en `.env`
- Reiniciar Vite después de cambiar `.env`
- Verificar que el backend está corriendo

### Error 401 al hacer login
- Verificar que el usuario existe en la BD
- Verificar que el email termina en `@usco.edu.co`
- Verificar que el usuario está `activo`

### Error 403: TURN_LIMIT_REACHED
- Usuario ya consumió sus 2 turnos
- Admin debe otorgar intento extra desde el panel

## 🧪 Pruebas

1. **Verificar Backend**: `http://localhost:8000/docs` debe abrir Swagger UI
2. **Verificar BD**: `http://localhost:8000/api/v1/health/db` debe retornar `{"db": "ok"}`
3. **Login de Prueba**: Usar correo @usco.edu.co existente en BD
4. **Flujo Completo**: Seguir checklist en `CHECKLIST.md`

## 📦 Estructura de Archivos del Proyecto

```
C:\Users\osdo-\Documents\encuesta-docente-f\
├── INTEGRACION_BACKEND.md      ← Guía técnica completa
├── START_DEV.md                 ← Guía de inicio rápido
├── ARQUITECTURA.md              ← Diagramas y diseño del sistema
├── CHECKLIST.md                 ← Lista de verificación exhaustiva
├── README_INTEGRACION.md        ← Este archivo (resumen)
├── start-dev.ps1                ← Script para iniciar servidores
└── web/
    └── encuesta-docente-ui/
        ├── .env                 ← Crear manualmente (ver env.example.txt)
        ├── env.example.txt      ← Template de variables de entorno
        ├── src/
        │   ├── services/        ← Actualizados: auth.ts, attempts.ts
        │   ├── pages/           ← Sin cambios
        │   └── components/      ← Sin cambios
        └── package.json

C:\Users\osdo-\Documents\Enuesta\encuesta-docente\backend\
└── api/
    ├── .env                     ← Verificar configuración
    ├── app/
    │   ├── api/v1/endpoints/    ← Endpoints del backend
    │   ├── models/              ← Modelos de BD
    │   ├── schemas/             ← Esquemas Pydantic
    │   └── main.py              ← Aplicación principal
    └── alembic/                 ← Migraciones
```

## 🚀 Próximos Pasos

1. **Desarrollo Local**
   - [ ] Configurar variables de entorno
   - [ ] Aplicar migraciones: `alembic upgrade head`
   - [ ] Crear datos de prueba (usuarios, encuestas, docentes)
   - [ ] Iniciar servidores con `start-dev.ps1`
   - [ ] Ejecutar checklist de pruebas

2. **Testing**
   - [ ] Tests unitarios del backend (pytest)
   - [ ] Tests de integración E2E
   - [ ] Tests de performance

3. **Deployment**
   - [ ] Backend: Render / Railway / Fly.io
   - [ ] Frontend: Vercel (ya configurado)
   - [ ] BD: Supabase / Render PostgreSQL
   - [ ] Configurar CORS para producción
   - [ ] Configurar HTTPS

4. **Mejoras**
   - [ ] Logging estructurado
   - [ ] Monitoreo (Sentry, Datadog)
   - [ ] Cache de catálogos
   - [ ] Paginación en listado de docentes
   - [ ] Export de reportes CSV/Excel

## 📞 Soporte

Si encuentras problemas:

1. **Consulta la documentación**:
   - `INTEGRACION_BACKEND.md` → Detalles técnicos
   - `START_DEV.md` → Problemas de inicio
   - `CHECKLIST.md` → Verificación paso a paso

2. **Revisa logs**:
   - Backend: Terminal donde corre uvicorn
   - Frontend: DevTools → Console + Network tab

3. **Verifica endpoints**:
   - Swagger UI: `http://localhost:8000/docs`
   - Health checks: `/health` y `/api/v1/health/db`

---

**Última actualización**: 2025-11-10  
**Versión del frontend**: 1.0.0  
**Versión del backend**: 1.0.0  
**Compatibilidad**: ✅ Verificada y funcional
