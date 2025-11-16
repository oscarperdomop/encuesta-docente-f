# ✅ Checklist de Integración y Pruebas

## 🎯 Pre-requisitos

### Instalación y Configuración Inicial

- [ ] **Python 3.11+** instalado
- [ ] **Node.js 18+** y npm instalados
- [ ] **PostgreSQL** instalado y corriendo
- [ ] **Git** instalado (para control de versiones)
- [ ] **Editor de código** (VSCode recomendado)

### Backend Setup

- [ ] Clonar/acceder al repositorio backend
- [ ] Crear entorno virtual Python: `python -m venv .venv`
- [ ] Activar entorno virtual: `.venv\Scripts\activate`
- [ ] Instalar dependencias: `pip install -r requirements.txt`
- [ ] Crear archivo `.env` con las variables necesarias
- [ ] Configurar `DATABASE_URL` en `.env`
- [ ] Configurar `JWT_SECRET` en `.env`
- [ ] Crear base de datos PostgreSQL
- [ ] Aplicar migraciones: `alembic upgrade head`

### Frontend Setup

- [ ] Clonar/acceder al repositorio frontend
- [ ] Instalar dependencias: `npm install`
- [ ] Crear archivo `.env` con `VITE_API_URL`
- [ ] Verificar que TailwindCSS está configurado
- [ ] Verificar que el puerto 5173 está disponible

## 🔧 Configuración

### Variables de Entorno Backend

- [ ] `DATABASE_URL` apunta a PostgreSQL correcto
- [ ] `JWT_SECRET` es único y seguro (no usar "change-me" en prod)
- [ ] `JWT_ALGORITHM=HS256`
- [ ] `JWT_EXPIRE_MINUTES=60` (o tu preferencia)
- [ ] `MAX_TURNOS=2` (o tu límite)
- [ ] `CORS_ORIGINS=*` (dev) o URL específica (prod)

### Variables de Entorno Frontend

- [ ] `VITE_API_URL=http://localhost:8000/api/v1`
- [ ] `VITE_API_TIMEOUT=10000`
- [ ] `VITE_TEACHERS_VARIANT=B`

## 🗄️ Base de Datos

### Migraciones

- [ ] Tabla `users` creada
- [ ] Tabla `roles` creada
- [ ] Tabla `user_roles` creada
- [ ] Tabla `teachers` creada
- [ ] Tabla `surveys` creada
- [ ] Tabla `survey_sections` creada
- [ ] Tabla `questions` creada
- [ ] Tabla `survey_teacher_assignments` creada
- [ ] Tabla `attempts` creada
- [ ] Tabla `responses` creada
- [ ] Tabla `attempt_limits` creada
- [ ] Tabla `turnos` creada
- [ ] Tabla `audit_logs` creada

### Datos Iniciales (Seed)

- [ ] Al menos 1 rol "admin" existe
- [ ] Al menos 1 usuario con email @usco.edu.co existe
- [ ] Usuario admin tiene rol asignado
- [ ] Al menos 1 encuesta "activa" existe
- [ ] Encuesta tiene secciones configuradas
- [ ] Encuesta tiene 16 preguntas (Q1-Q15 Likert + Q16 texto)
- [ ] Al menos 1 docente existe
- [ ] Docente está asignado a la encuesta

### Verificación SQL

```sql
-- Verificar usuarios
SELECT email, nombre, estado FROM users;

-- Verificar roles
SELECT u.email, r.nombre 
FROM users u 
JOIN user_roles ur ON u.id = ur.user_id
JOIN roles r ON r.id = ur.role_id;

-- Verificar encuestas activas
SELECT codigo, nombre, estado FROM surveys WHERE estado = 'activa';

-- Verificar preguntas
SELECT codigo, enunciado, tipo, orden FROM questions WHERE survey_id = '...';

-- Verificar asignaciones
SELECT s.nombre AS encuesta, t.nombre AS docente
FROM survey_teacher_assignments sta
JOIN surveys s ON s.id = sta.survey_id
JOIN teachers t ON t.id = sta.teacher_id;
```

## 🚀 Iniciar Servidores

### Backend

- [ ] Abrir terminal en `C:\Users\osdo-\Documents\Enuesta\encuesta-docente\backend\api`
- [ ] Activar entorno virtual
- [ ] Ejecutar: `uvicorn app.main:app --reload --host 0.0.0.0 --port 8000`
- [ ] Verificar: `http://localhost:8000/health` devuelve `{"status": "ok"}`
- [ ] Verificar: `http://localhost:8000/docs` muestra Swagger UI
- [ ] Verificar: `http://localhost:8000/api/v1/health/db` devuelve `{"db": "ok"}`

### Frontend

- [ ] Abrir terminal en `C:\Users\osdo-\Documents\encuesta-docente-f\web\encuesta-docente-ui`
- [ ] Ejecutar: `npm run dev`
- [ ] Verificar: Terminal muestra URL local (ej: `http://localhost:5173`)
- [ ] Verificar: Navegador abre automáticamente o abrir manualmente
- [ ] Verificar: No hay errores en consola del navegador

## 🧪 Pruebas de Integración

### 1. Autenticación

- [ ] **Login con email válido**
  - [ ] Ir a `http://localhost:5173/login`
  - [ ] Ingresar email que existe en BD con @usco.edu.co
  - [ ] Click en "Entrar"
  - [ ] Debe redirigir a `/intro` sin errores
  - [ ] DevTools Network: `POST /api/v1/auth/login` retorna 200
  - [ ] LocalStorage tiene `token`

- [ ] **Login con email inválido**
  - [ ] Intentar con email sin @usco.edu.co
  - [ ] Debe mostrar error "Correo no autorizado"
  - [ ] No debe guardar token

- [ ] **Login con email no existente**
  - [ ] Intentar con email @usco.edu.co que no existe en BD
  - [ ] Debe mostrar error "Usuario no encontrado"

- [ ] **Límite de turnos**
  - [ ] Con usuario que ya consumió 2 turnos
  - [ ] Debe mostrar error 403 "Ya no tienes turnos"
  - [ ] Debe mostrar modal de bloqueo

- [ ] **Obtener usuario actual**
  - [ ] Después de login exitoso
  - [ ] DevTools Network: `GET /api/v1/auth/me` retorna 200
  - [ ] Respuesta incluye `id`, `email`, `nombre`, `roles`

### 2. Flujo de Presentación

- [ ] **Intro**
  - [ ] Página `/intro` se carga correctamente
  - [ ] Muestra header con logo USCO
  - [ ] Botón "Continuar" visible
  - [ ] Click en "Continuar" navega a `/justificacion`

- [ ] **Justificación**
  - [ ] Página `/justificacion` se carga correctamente
  - [ ] Muestra contenido explicativo
  - [ ] Botón "Continuar" visible
  - [ ] Click en "Continuar" navega a `/docentes`

### 3. Sistema de Turnos

- [ ] **Apertura de turno**
  - [ ] Al llegar a `/docentes`, se ejecuta handshake de turno
  - [ ] DevTools Network: `GET /api/v1/sessions/turno/current` o `POST /api/v1/sessions/turno/open`
  - [ ] SessionStorage tiene `turnoId`
  - [ ] Respuesta incluye `remaining` (turnos restantes)

- [ ] **Turno existente**
  - [ ] Si ya hay turno abierto, reutilizar
  - [ ] No crear turno duplicado

- [ ] **Límite alcanzado**
  - [ ] Con usuario que ya tiene 2 turnos
  - [ ] Debe mostrar error y redirigir

### 4. Selección de Docentes

- [ ] **Cargar encuestas activas**
  - [ ] DevTools Network: `GET /api/v1/surveys/activas` retorna 200
  - [ ] Se selecciona automáticamente la primera encuesta activa

- [ ] **Cargar docentes**
  - [ ] DevTools Network: `GET /api/v1/surveys/{id}/teachers?include_state=true` retorna 200
  - [ ] Grid de 2 columnas se muestra correctamente
  - [ ] Cada docente tiene checkbox
  - [ ] Campo de búsqueda funciona

- [ ] **Búsqueda de docentes**
  - [ ] Escribir en campo de búsqueda
  - [ ] DevTools Network: Nueva petición con `?q=...`
  - [ ] Resultados se filtran correctamente

- [ ] **Seleccionar docentes**
  - [ ] Marcar 1 o más checkboxes
  - [ ] Contador muestra cantidad seleccionada
  - [ ] Botón "Iniciar" se habilita

- [ ] **Crear intentos**
  - [ ] Click en "Iniciar"
  - [ ] DevTools Network: `POST /api/v1/attempts` con array de `teacher_ids`
  - [ ] Respuesta incluye array de attempts creados
  - [ ] Redirige a primer intento

### 5. Encuesta - Paso 1

- [ ] **Cargar preguntas**
  - [ ] DevTools Network: `GET /api/v1/surveys/{id}/questions` retorna 200
  - [ ] Se muestran Q1-Q9

- [ ] **Obtener siguiente intento**
  - [ ] DevTools Network: `GET /api/v1/attempts/next?survey_id={id}` retorna 200
  - [ ] Respuesta incluye `attempt_id`, `teacher_nombre`, `expires_at`
  - [ ] Header muestra nombre del docente

- [ ] **Timer visible**
  - [ ] Timer muestra 30:00 y comienza a contar regresivo
  - [ ] Alerta a los 5:00 restantes

- [ ] **Responder preguntas**
  - [ ] Cada pregunta Q1-Q9 tiene select con opciones 1-5
  - [ ] Seleccionar una opción funciona

- [ ] **Autosave**
  - [ ] Al cambiar una respuesta, se ejecuta autosave
  - [ ] DevTools Network: `PATCH /api/v1/attempts/{id}` (puede ser debounced)
  - [ ] LocalStorage/Zustand guarda progreso

- [ ] **Validación Paso 1**
  - [ ] Si faltan respuestas, botón "Siguiente" deshabilitado
  - [ ] Con todas las respuestas 1-5, botón "Siguiente" habilitado

- [ ] **Navegación a Paso 2**
  - [ ] Click en "Siguiente"
  - [ ] Navega a `/encuesta/{attemptId}/step2`

### 6. Encuesta - Paso 2

- [ ] **Cargar preguntas**
  - [ ] Se muestran Q10-Q15 (Likert)
  - [ ] Se muestra Q16 (texto con 3 campos)

- [ ] **Responder Q10-Q15**
  - [ ] Cada pregunta tiene select 1-5
  - [ ] Seleccionar opciones funciona
  - [ ] Autosave se ejecuta

- [ ] **Responder Q16 (opcional)**
  - [ ] Campo "Aspectos positivos" (textarea)
  - [ ] Campo "Aspectos a mejorar" (textarea)
  - [ ] Campo "Comentarios adicionales" (textarea)
  - [ ] Puede dejarse en blanco

- [ ] **Validación Paso 2**
  - [ ] Si faltan Q10-Q15, botón "Enviar" deshabilitado
  - [ ] Con Q10-Q15 completas, botón "Enviar" habilitado (Q16 opcional)

- [ ] **Botón Regresar**
  - [ ] Click en "Regresar"
  - [ ] Navega a `/encuesta/{attemptId}/step1`
  - [ ] Respuestas guardadas persisten

### 7. Envío de Encuesta

- [ ] **Confirmación**
  - [ ] Click en "Enviar"
  - [ ] Modal de confirmación aparece
  - [ ] "¿Desea terminar la encuesta?"

- [ ] **Envío al backend**
  - [ ] Click en "Sí"
  - [ ] DevTools Network: `POST /api/v1/attempts/{id}/submit`
  - [ ] Body incluye `answers` (15 items) y `textos` (si Q16 respondida)
  - [ ] Respuesta incluye `estado: "enviado"` y `scores`

- [ ] **Toast de éxito**
  - [ ] Mensaje "Encuesta enviada correctamente"
  - [ ] LocalStorage/Zustand limpia borrador de este attempt

### 8. Cola de Docentes

- [ ] **Siguiente docente**
  - [ ] Después de enviar, busca siguiente docente pendiente
  - [ ] DevTools Network: `GET /api/v1/attempts/next?survey_id={id}`
  - [ ] Si hay más, navega a nuevo attempt
  - [ ] Si no hay más, navega a `/resumen`

- [ ] **Progreso visible**
  - [ ] Header o indicador muestra "2 de 3 completados" (ejemplo)

### 9. Resumen de Turno

- [ ] **Cargar resumen**
  - [ ] DevTools Network: `GET /api/v1/attempts/summary?survey_id={id}` retorna 200
  - [ ] Respuesta incluye `enviados`, `en_progreso`, `pendientes`, `items`, `can_finish`

- [ ] **Visualización**
  - [ ] Tabla o lista muestra cada docente con su estado
  - [ ] Estados: "Enviado" (verde), "En progreso" (amarillo), "Pendiente" (gris)

- [ ] **Botón Finalizar Turno**
  - [ ] Solo habilitado si `can_finish: true` (todos enviados)
  - [ ] Muestra contador: "X de Y completados"

### 10. Cierre de Turno

- [ ] **Finalizar turno**
  - [ ] Click en "Finalizar turno"
  - [ ] Modal de confirmación
  - [ ] DevTools Network: `POST /api/v1/sessions/turno/close` con header `X-Turno-Id`
  - [ ] Respuesta incluye contadores finales

- [ ] **Logout**
  - [ ] LocalStorage: `token` eliminado
  - [ ] SessionStorage: `turnoId` eliminado
  - [ ] Redirige a `/login`

- [ ] **Broadcast a otras pestañas**
  - [ ] Si hay otras pestañas abiertas, también se cierran sesiones

### 11. Admin (Opcional)

- [ ] **Acceso al panel**
  - [ ] Usuario con rol "admin" ve botón "Panel admin" en header
  - [ ] Click navega a `/admin`

- [ ] **Lista de encuestas**
  - [ ] `/admin/encuestas` muestra encuestas disponibles

- [ ] **Otorgar intento extra**
  - [ ] Desde panel admin
  - [ ] Seleccionar usuario
  - [ ] Incrementar intentos permitidos

## 🐛 Casos de Error

### Errores de Red

- [ ] **Backend no disponible**
  - [ ] Detener backend
  - [ ] Intentar login desde frontend
  - [ ] Debe mostrar error de conexión

- [ ] **Token expirado**
  - [ ] Esperar 60+ minutos (o forzar expiración)
  - [ ] Intentar hacer request
  - [ ] Debe redirigir a `/login` automáticamente

### Errores de Validación

- [ ] **Intento ya enviado**
  - [ ] Intentar enviar mismo attempt dos veces
  - [ ] Backend debe rechazar con 409

- [ ] **Docente ya evaluado**
  - [ ] Intentar crear attempt para docente ya evaluado
  - [ ] Backend debe rechazar o marcar como "evaluated"

- [ ] **Timer expirado**
  - [ ] Dejar pasar 30 minutos sin enviar
  - [ ] Al intentar enviar, debe rechazar
  - [ ] Estado debe cambiar a "expirado"

### Errores de Turnos

- [ ] **Sin turnos disponibles**
  - [ ] Usuario con 2 turnos cerrados
  - [ ] Login debe fallar con 403

- [ ] **Turno cerrado**
  - [ ] Intentar hacer request sin `X-Turno-Id`
  - [ ] Debe rechazar con 403

## 📊 Performance

- [ ] **Carga inicial < 2s**
  - [ ] Medir en DevTools Network tab
  - [ ] TTI (Time to Interactive) < 2s

- [ ] **API Response Times**
  - [ ] GET /auth/me < 300ms
  - [ ] GET /surveys/activas < 300ms
  - [ ] GET /surveys/{id}/teachers < 500ms
  - [ ] POST /attempts/{id}/submit < 1s

- [ ] **Autosave no bloquea UI**
  - [ ] Usuario puede seguir escribiendo mientras autosave se ejecuta

## 🔒 Seguridad

- [ ] **JWT en Authorization header**
  - [ ] DevTools Network: Verificar que todas las requests tienen `Authorization: Bearer ...`

- [ ] **CORS configurado**
  - [ ] No hay errores de CORS en consola

- [ ] **Validación de email**
  - [ ] Solo @usco.edu.co permitidos

- [ ] **Validación de intentos**
  - [ ] Máximo 2 turnos por defecto

- [ ] **Headers de seguridad**
  - [ ] `X-Turno-Id` se envía en requests protegidos

## 📱 Responsive Design

- [ ] **Mobile (< 768px)**
  - [ ] Grid de docentes se adapta a 1 columna
  - [ ] Header se colapsa correctamente
  - [ ] Botones son táctiles (mín 44px)

- [ ] **Tablet (768px - 1024px)**
  - [ ] Layout se ajusta apropiadamente

- [ ] **Desktop (> 1024px)**
  - [ ] Max-width container respetado

## ✅ Checklist Final

- [ ] Todos los tests de integración pasados
- [ ] No hay errores en consola del navegador
- [ ] No hay errores en terminal del backend
- [ ] No hay warnings de React en consola
- [ ] Código TypeScript sin errores (`npm run build`)
- [ ] Linting pasado (`npm run lint`)
- [ ] Variables de entorno documentadas
- [ ] README actualizado
- [ ] Guía de integración revisada

---

**Estado**: ☐ En progreso | ☑ Completado  
**Fecha de última prueba**: _________  
**Probado por**: _________
