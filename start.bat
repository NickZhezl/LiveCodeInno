@echo off
echo ========================================
echo   LiveCodeInno - Local Development
echo ========================================
echo.

REM Check if Docker is running
docker info >nul 2>&1
if %errorlevel% equ 0 (
    echo [1/3] Starting PostgreSQL with Docker...
    docker run -d --name livecode-postgres -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=livecodeinno -p 5432:5432 postgres:15-alpine 2>nul || echo PostgreSQL already running or Docker issue
    timeout /t 3 >nul
) else (
    echo [!] Docker not running. Please start Docker Desktop or install PostgreSQL locally.
    echo.
    echo To install PostgreSQL locally:
    echo   1. Download from https://www.postgresql.org/download/windows/
    echo   2. Create database: CREATE DATABASE livecodeinno;
    echo.
)

echo.
echo [2/3] Starting Backend (FastAPI)...
echo.
cd /d "%~dp0backend"
if exist ".venv\Scripts\python.exe" (
    echo Using virtual environment...
    call .venv\Scripts\activate.bat
) else (
    echo Creating virtual environment...
    python -m venv .venv
    call .venv\Scripts\activate.bat
    pip install -r requirements.txt
)

start "LiveCodeInno Backend" cmd /k "python run_server.py"

echo.
echo [3/3] Starting Frontend (Vite)...
echo.
cd /d "%~dp0frontend"
start "LiveCodeInno Frontend" cmd /k "npm run dev"

echo.
echo ========================================
echo   Services starting...
echo ========================================
echo.
echo   Backend:  http://localhost:8000
echo   Frontend: http://localhost:5173
echo   API Docs: http://localhost:8000/docs
echo.
echo   Press any key to exit this window...
pause >nul
