# 🚀 Guía Rápida para Iniciar el Proyecto en Desarrollo

## Prerrequisitos

- ✅ Python 3.11+ instalado
- ✅ Node.js 18+ y npm instalados
- ✅ PostgreSQL configurado y corriendo
- ✅ Git Bash o terminal compatible

## 📋 Paso a Paso

### 1. Configurar Variables de Entorno

#### Backend (.env)
```bash
cd C:\Users\osdo-\Documents\Enuesta\encuesta-docente\backend\api
```

Crea o verifica el archivo `.env` con:
```env
# Database
DATABASE_URL=postgresql://usuario:password@localhost:5432/encuesta_docente

# JWT
JWT_SECRET=tu-secreto-super-seguro-cambiar-en-produccion
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=60

# Turnos
MAX_TURNOS=2

# CORS (en dev: * es aceptable)
CORS_ORIGINS=*

# App
APP_NAME=Encuesta Docente API
ENV=dev
```

#### Frontend (.env)
```bash
cd C:\Users\osdo-\Documents\encuesta-docente-f\web\encuesta-docente-ui
```

Crea el archivo `.env` (basado en `env.example.txt`):
```env
VITE_API_URL=http://localhost:8000/api/v1
VITE_API_TIMEOUT=10000
VITE_TEACHERS_VARIANT=B
```

### 2. Iniciar Backend (Terminal 1)

```bash
# Navegar al backend
cd C:\Users\osdo-\Documents\Enuesta\encuesta-docente\backend\api

# Activar entorno virtual (si existe)
.venv\Scripts\activate

# Instalar dependencias (solo primera vez)
pip install -r requirements.txt

# Aplicar migraciones (solo primera vez o cuando haya cambios)
alembic upgrade head

# Iniciar servidor
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

✅ Backend disponible en: **http://localhost:8000**
📚 Documentación API: **http://localhost:8000/docs**

### 3. Iniciar Frontend (Terminal 2)

```bash
# Navegar al frontend
cd C:\Users\osdo-\Documents\encuesta-docente-f\web\encuesta-docente-ui

# Instalar dependencias (solo primera vez)
npm install

# Iniciar servidor de desarrollo
npm run dev
```

✅ Frontend disponible en: **http://localhost:5173** (puerto por defecto de Vite)

### 4. Verificar Conexión

1. Abre el navegador en `http://localhost:5173`
2. Abre las DevTools (F12) → Console
3. Deberías ver: `[API] baseURL = http://localhost:8000/api/v1`
4. Ve a la página de Login
5. Intenta iniciar sesión con un correo @usco.edu.co existente en la BD

## 🐛 Solución de Problemas

### Backend no inicia

**Error: "DATABASE_URL no definida"**
- Verifica que `.env` existe en `backend/api/`
- Verifica que `DATABASE_URL` está correctamente configurada

**Error: "No module named 'app'"**
```bash
# Asegúrate de estar en la carpeta correcta
cd C:\Users\osdo-\Documents\Enuesta\encuesta-docente\backend\api
# Y ejecutar desde ahí
uvicorn app.main:app --reload
```

**Error de conexión a PostgreSQL**
- Verifica que PostgreSQL está corriendo
- Verifica usuario/password/host/puerto en `DATABASE_URL`

### Frontend no conecta con Backend

**Error: "Network Error" o CORS**
- Verifica que el backend está corriendo en `http://localhost:8000`
- Verifica `VITE_API_URL` en el `.env` del frontend
- Reinicia el servidor de Vite después de cambiar `.env`

**Error 401: Unauthorized**
- Verifica que el usuario existe en la BD
- Verifica que el email termina en `@usco.edu.co`
- Verifica que el usuario está `activo`

**Error 403: TURN_LIMIT_REACHED**
- El usuario ya consumió sus 2 turnos
- Un admin debe otorgar un intento extra desde el panel

### Migraciones de Base de Datos

**Crear nueva migración** (después de cambios en modelos):
```bash
cd C:\Users\osdo-\Documents\Enuesta\encuesta-docente\backend\api
alembic revision --autogenerate -m "Descripción del cambio"
```

**Aplicar migraciones**:
```bash
alembic upgrade head
```

**Revertir última migración**:
```bash
alembic downgrade -1
```

## 📝 Datos de Prueba

Para crear usuarios de prueba, puedes usar el endpoint de importación o insertar directamente en la BD:

```sql
-- Usuario estudiante de prueba
INSERT INTO users (id, email, nombre, estado)
VALUES (
  gen_random_uuid(),
  'u20201234567@usco.edu.co',
  'Estudiante Prueba',
  'activo'
);

-- Usuario admin de prueba
INSERT INTO users (id, email, nombre, estado)
VALUES (
  gen_random_uuid(),
  'admin@usco.edu.co',
  'Administrador Prueba',
  'activo'
);

-- Asignar rol admin
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u, roles r
WHERE u.email = 'admin@usco.edu.co'
  AND r.nombre = 'admin';
```

## 🎯 Flujo de Prueba Completo

1. **Login**: Usar correo @usco.edu.co existente
2. **Presentación**: Click en "Continuar"
3. **Justificación**: Click en "Continuar"
4. **Selección**: Marcar 1 o más docentes → "Iniciar"
5. **Encuesta Paso 1**: Responder Q1-Q9 → "Siguiente"
6. **Encuesta Paso 2**: Responder Q10-Q15 → Opcional Q16 → "Enviar"
7. **Confirmación**: "Sí, enviar encuesta"
8. **Siguiente docente**: Repetir o ir a Resumen
9. **Resumen**: Verificar todos "Enviado" → "Finalizar turno"
10. **Logout**: Confirmar cierre de sesión

## 📊 Monitoreo

### Ver logs del Backend
El backend con `--reload` muestra logs en tiempo real en la terminal.

### Ver network requests del Frontend
1. Abre DevTools (F12)
2. Ve a la pestaña Network
3. Filtra por "XHR" para ver solo las peticiones API

## 🔧 Comandos Útiles

### Backend
```bash
# Ver rutas disponibles
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Formatear código
black .

# Ordenar imports
isort .

# Ejecutar tests
pytest
```

### Frontend
```bash
# Build para producción
npm run build

# Preview del build
npm run preview

# Linting
npm run lint

# Ver bundle size
npm run build -- --analyze
```

## 🌐 Acceso desde Otros Dispositivos (misma red)

Para probar en móvil o tablet en la misma red local:

1. Encuentra tu IP local:
   ```bash
   ipconfig
   # Busca "IPv4 Address" de tu adaptador de red
   # Ejemplo: 192.168.1.100
   ```

2. Inicia el backend con `--host 0.0.0.0` (ya lo hace el comando por defecto)

3. Actualiza `.env` del frontend:
   ```env
   VITE_API_URL=http://192.168.1.100:8000/api/v1
   ```

4. Accede desde el otro dispositivo:
   - Frontend: `http://192.168.1.100:5173`
   - Backend API: `http://192.168.1.100:8000`

---

**¿Necesitas ayuda?** Revisa el archivo `INTEGRACION_BACKEND.md` para más detalles técnicos.
