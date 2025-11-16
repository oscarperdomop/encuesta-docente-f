# Script para iniciar Backend y Frontend en desarrollo
# Ejecutar: .\start-dev.ps1

Write-Host "🚀 Iniciando Encuesta Docente - Modo Desarrollo" -ForegroundColor Cyan
Write-Host ""

# Rutas de los proyectos
$backendPath = "C:\Users\osdo-\Documents\Enuesta\encuesta-docente\backend\api"
$frontendPath = "C:\Users\osdo-\Documents\encuesta-docente-f\web\encuesta-docente-ui"

# Verificar que las carpetas existen
if (-not (Test-Path $backendPath)) {
    Write-Host "❌ Error: No se encuentra la carpeta del backend en: $backendPath" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $frontendPath)) {
    Write-Host "❌ Error: No se encuentra la carpeta del frontend en: $frontendPath" -ForegroundColor Red
    exit 1
}

# Función para iniciar el backend
function Start-Backend {
    Write-Host "📦 Iniciando Backend (FastAPI)..." -ForegroundColor Green
    Start-Process powershell -ArgumentList @"
        -NoExit
        -Command "
            Write-Host '🐍 Backend - FastAPI' -ForegroundColor Yellow;
            cd '$backendPath';
            if (Test-Path '.venv\Scripts\Activate.ps1') {
                Write-Host 'Activando entorno virtual...' -ForegroundColor Cyan;
                .\.venv\Scripts\Activate.ps1;
            }
            Write-Host 'Iniciando servidor en http://localhost:8000' -ForegroundColor Green;
            Write-Host 'Documentación en http://localhost:8000/docs' -ForegroundColor Cyan;
            uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
        "
"@
}

# Función para iniciar el frontend
function Start-Frontend {
    Write-Host "⚛️  Iniciando Frontend (React + Vite)..." -ForegroundColor Green
    Start-Sleep -Seconds 3  # Esperar a que el backend inicie primero
    Start-Process powershell -ArgumentList @"
        -NoExit
        -Command "
            Write-Host '⚛️  Frontend - React + Vite' -ForegroundColor Yellow;
            cd '$frontendPath';
            Write-Host 'Iniciando servidor en http://localhost:5173' -ForegroundColor Green;
            npm run dev
        "
"@
}

# Iniciar ambos servidores
Start-Backend
Start-Frontend

Write-Host ""
Write-Host "✅ Servidores iniciándose..." -ForegroundColor Green
Write-Host ""
Write-Host "📍 URLs disponibles:" -ForegroundColor Cyan
Write-Host "   Frontend:  http://localhost:5173" -ForegroundColor White
Write-Host "   Backend:   http://localhost:8000" -ForegroundColor White
Write-Host "   API Docs:  http://localhost:8000/docs" -ForegroundColor White
Write-Host ""
Write-Host "💡 Tip: Para detener, cierra las ventanas de PowerShell que se abrieron" -ForegroundColor Yellow
Write-Host ""
