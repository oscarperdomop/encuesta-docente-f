# Guía de Integración: Frontend ↔ Backend

## 📍 Ubicaciones de los Proyectos

- **Frontend**: `C:\Users\osdo-\Documents\encuesta-docente-f\web\encuesta-docente-ui`
- **Backend**: `C:\Users\osdo-\Documents\Enuesta\encuesta-docente\backend\api`

## 🔗 Configuración de Conexión

### 1. Variables de Entorno del Frontend

Crea o actualiza el archivo `.env` en el frontend:

```env
# Frontend: web/encuesta-docente-ui/.env
VITE_API_URL=http://localhost:8000/api/v1
VITE_API_TIMEOUT=10000
VITE_TEACHERS_VARIANT=B
```

### 2. Iniciar el Backend

```bash
cd C:\Users\osdo-\Documents\Enuesta\encuesta-docente\backend\api

# Activar entorno virtual (si existe)
.venv\Scripts\activate

# Instalar dependencias (primera vez)
pip install -r requirements.txt

# Iniciar servidor FastAPI
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

El backend estará disponible en: `http://localhost:8000`

### 3. Iniciar el Frontend

```bash
cd C:\Users\osdo-\Documents\encuesta-docente-f\web\encuesta-docente-ui

# Instalar dependencias (primera vez)
npm install

# Iniciar servidor de desarrollo
npm run dev
```

El frontend estará disponible en: `http://localhost:5173` (Vite default)

## 🔄 Mapeo de Endpoints: Frontend ↔ Backend

### **Autenticación**

| Frontend (`src/services/auth.ts`) | Backend | Descripción |
|-----------------------------------|---------|-------------|
| `login(email)` → `POST /auth/login` | ✅ `auth.py:19` | Login con correo @usco.edu.co |
| `me()` → `GET /auth/me` | ✅ `auth.py:59` | Obtener usuario actual |
| `logout()` → `POST /sessions/turno/close` | ✅ `sessions.py:160` | Cerrar turno |

**Esquemas Backend:**
- **Request**: `LoginIn` → `{ email: EmailStr }`
- **Response**: `TokenOut` → `{ access_token: str, token_type: str }`
- **Me Response**: `MeOut` → `{ id: UUID, email: str, nombre: str, roles: list[str] }`

### **Catálogos**

| Frontend (`src/services/catalogs.ts`) | Backend | Descripción |
|---------------------------------------|---------|-------------|
| `getActiveSurveys()` → `GET /surveys/activas` | ✅ `catalogs.py:15` | Lista encuestas activas |
| `getSurveyQuestions(surveyId)` → `GET /surveys/{id}/questions` | ✅ `catalogs.py:37` | Preguntas de encuesta |
| `getSurveyTeachers(surveyId, opts)` → `GET /surveys/{id}/teachers` | ✅ `catalogs.py:62` | Docentes asignados |

**Parámetros clave de `getSurveyTeachers`:**
- `q` (string): Búsqueda por nombre/identificador/programa
- `limit` (number): Límite de resultados
- `offset` (number): Paginación
- `hide_evaluated` (boolean): Ocultar docentes ya evaluados
- `include_state` (boolean): Incluir campo `evaluated`

### **Turnos (Sesiones)**

| Frontend | Backend | Descripción |
|----------|---------|-------------|
| `ensureTurnoOpen()` | `GET /sessions/turno/current` + `POST /sessions/turno/open` | Handshake de turno |
| Header `X-Turno-Id` | Validación en `require_turno_open()` | Verificar turno abierto |

**Endpoints de turno:**
- `GET /sessions/turno/current` → `{ turno_id: str | null, remaining: int }`
- `POST /sessions/turno/open` → `{ turno_id: str, remaining: int }`
- `POST /sessions/turno/close` → `{ ok: bool }` (requiere header `X-Turno-Id`)
- `GET /sessions/turno/quota` → `{ used: int, limit: int, remaining: int }`

### **Intentos (Attempts)**

| Frontend (`src/services/attempts.ts`) | Backend | Descripción |
|---------------------------------------|---------|-------------|
| `createAttempts(surveyId, teacherIds)` → `POST /attempts` | ✅ `attempts.py` | Crear intentos |
| `getNextAttempt(surveyId)` → `GET /attempts/next` | ✅ `attempts.py` | Siguiente intento pendiente |
| `getAttempt(attemptId)` → `GET /attempts/{id}` | ✅ `attempts.py` | Detalle de intento |
| `saveProgress(attemptId, payload)` → `PATCH /attempts/{id}` | ✅ `attempts.py` | Autosave |
| `submitAttempt(attemptId, answers, textos)` → `POST /attempts/{id}/submit` | ✅ `attempts.py` | Envío final |
| `getAttemptsSummary(surveyId)` → `GET /attempts/summary` | ✅ `attempts.py` | Resumen de turno |

**Esquemas importantes:**

#### Submit Request (`SubmitIn`):
```typescript
{
  answers: Array<{
    question_id: string,
    value: number  // 1-5 para Likert
  }>,
  textos?: {
    positivos?: string,
    mejorar?: string,
    comentarios?: string
  }
}
```

#### Submit Response (`SubmitOut`):
```typescript
{
  estado: "enviado",
  scores: {
    total: number | null,
    secciones: Array<{
      section_id: string,
      titulo: string,
      score: number
    }>
  }
}
```

## ⚠️ Ajustes Necesarios en el Frontend

### 1. **Actualizar `auth.ts` - Manejo de Roles**

El backend devuelve `roles: list[str]` en `/auth/me`, pero el frontend espera `rol: string`.

**Archivo**: `src/services/auth.ts:25-29`

```typescript
// ANTES (líneas 25-29)
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

### 2. **Actualizar Tipo `MeOut`**

**Archivo**: `src/services/auth.ts:12-17`

```typescript
// ANTES
export type MeOut = {
  id: string;
  email: string;
  nombre?: string;
  rol?: string;  // ❌ Backend devuelve 'roles' (array)
};

// DESPUÉS
export type MeOut = {
  id: string;
  email: string;
  nombre?: string;
  roles?: string[];  // ✅ Coincide con backend
};
```

### 3. **Verificar Envío de Q16 en `submitAttempt`**

El frontend ya envía correctamente la clave `textos`, pero también incluye compatibilidad con otras claves. El backend espera **exclusivamente** `textos`.

**Archivo**: `src/services/attempts.ts:103-138`

El código actual está **correcto**, pero podemos simplificarlo:

```typescript
export async function submitAttempt(
  attemptId: string,
  answers: LikertAnswer[],
  textos?: Q16Text
) {
  const clean = {
    positivos: textos?.positivos?.trim() || undefined,
    mejorar: textos?.mejorar?.trim() || undefined,
    comentarios: textos?.comentarios?.trim() || undefined,
  };
  const hasQ16 = !!clean.positivos || !!clean.mejorar || !!clean.comentarios;

  const body: any = {
    answers: answers.map((a) => ({
      question_id: a.question_id,
      value: a.value,
    })),
  };

  // El backend espera 'textos' únicamente
  if (hasQ16) {
    body.textos = clean;
  }

  const { data } = await api.post<SubmitOut>(
    `/attempts/${attemptId}/submit`,
    body
  );
  return data;
}
```

### 4. **Sistema de Turnos en `DocentesSelect.tsx`**

El frontend ya implementa el handshake de turnos correctamente. Solo verificar:

**Archivo**: `src/pages/DocentesSelect.tsx:40-57`

```typescript
async function ensureTurnoOpen(): Promise<string> {
  try {
    const { data: cur } = await api.get("/sessions/turno/current");
    if (cur?.turno_id) {
      sessionStorage.setItem("turnoId", cur.turno_id);
      return cur.turno_id as string;
    }
    sessionStorage.removeItem("turnoId");
  } catch {
    sessionStorage.removeItem("turnoId");
  }

  const { data } = await api.post("/sessions/turno/open");
  const tid = data?.turno_id as string;
  if (!tid) throw new Error("No se obtuvo turno_id");
  sessionStorage.setItem("turnoId", tid);
  return tid;
}
```

✅ **Esto ya está correcto**.

## 🚀 Flujo Completo de Usuario

### 1. **Login**
```
Usuario ingresa email → POST /auth/login
↓
Backend valida @usco.edu.co + existencia en BD + límite de turnos
↓
Devuelve JWT → Frontend guarda en localStorage
```

### 2. **Presentación → Justificación**
```
Frontend navega /intro → /justificacion (páginas locales)
```

### 3. **Selección de Docentes**
```
GET /sessions/turno/current (o POST /sessions/turno/open)
↓
GET /surveys/activas → Obtener encuesta activa
↓
GET /surveys/{id}/teachers?include_state=true
↓
Usuario selecciona docentes → POST /attempts { survey_id, teacher_ids[] }
```

### 4. **Encuesta (2 Pasos)**
```
GET /attempts/next → Obtener siguiente docente pendiente
↓
Frontend muestra preguntas Q1-Q9 (Paso 1)
↓
Usuario responde → PATCH /attempts/{id} (autosave)
↓
Frontend muestra Q10-Q15 + Q16 (Paso 2)
↓
Usuario responde → PATCH /attempts/{id} (autosave)
↓
Usuario envía → POST /attempts/{id}/submit
```

### 5. **Resumen y Cierre**
```
GET /attempts/summary?survey_id=...
↓
Frontend verifica que todos estén "enviado"
↓
POST /sessions/close?survey_id=... (o /sessions/turno/close)
↓
Logout → Frontend limpia localStorage + sessionStorage
```

## 🐛 Problemas Comunes y Soluciones

### **Error 401: Unauthorized**
- **Causa**: Token JWT expirado o inválido
- **Solución**: El interceptor de Axios redirige automáticamente a `/login`

### **Error 403: TURN_LIMIT_REACHED**
- **Causa**: Usuario alcanzó el límite de 2 turnos
- **Solución**: Admin debe otorgar un intento extra desde el panel admin

### **Error 409: Conflicts (turno con intentos en progreso)**
- **Causa**: Usuario intenta cerrar turno con docentes pendientes
- **Solución**: Finalizar todos los intentos antes de cerrar

### **CORS Errors**
- **Causa**: Frontend en puerto diferente al backend
- **Solución**: Backend ya tiene `allow_origins=["*"]` en desarrollo

### **Header `X-Turno-Id` faltante**
- **Causa**: El frontend no envía el header
- **Solución**: Verificar que `sessionStorage.getItem("turnoId")` existe y se envía en `api.ts:29`

## ✅ Checklist de Integración

- [ ] Backend corriendo en `http://localhost:8000`
- [ ] Frontend corriendo en `http://localhost:5173` (o el puerto de Vite)
- [ ] Variable `VITE_API_URL=http://localhost:8000/api/v1` configurada
- [ ] Actualizar tipo `MeOut.roles` en `auth.ts`
- [ ] Actualizar función `me()` para usar `data.roles` (array)
- [ ] Verificar que `X-Turno-Id` se envíe en requests
- [ ] Probar login con correo @usco.edu.co existente en BD
- [ ] Verificar límite de turnos (MAX_TURNOS=2)
- [ ] Probar flujo completo: login → selección → encuesta → envío → resumen → cierre

## 📊 Base de Datos

El backend requiere PostgreSQL con las siguientes tablas principales:
- `users` (usuarios autenticados)
- `roles` y `user_roles`
- `teachers` (docentes)
- `surveys`, `survey_sections`, `questions`
- `survey_teacher_assignments`
- `attempts`, `responses`
- `attempt_limits`
- `turnos`
- `audit_logs`

**Verificar que las migraciones de Alembic estén aplicadas**:
```bash
cd C:\Users\osdo-\Documents\Enuesta\encuesta-docente\backend\api
alembic upgrade head
```

## 🔐 Seguridad

- JWT secret debe configurarse en `.env` del backend: `JWT_SECRET=tu-secreto-seguro`
- CORS debe restringirse en producción: `CORS_ORIGINS=https://tu-dominio.vercel.app`
- HTTPS obligatorio en producción
- Rate limiting configurado en endpoints sensibles

## 📝 Notas Adicionales

1. **Límite de turnos**: Se controla tanto en login como en apertura de turno
2. **Timer de 30 minutos**: Se gestiona por `expires_at` en la tabla `attempts`
3. **Autosave**: El frontend envía `PATCH /attempts/{id}` cada vez que cambia una respuesta
4. **Q16 (texto)**: Es opcional, pero si se envía debe tener al menos uno de los 3 campos

---

**Última actualización**: 2025-11-10  
**Versión**: 1.0.0
