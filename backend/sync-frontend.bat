@echo off
setlocal EnableExtensions
cd /d "%~dp0"

set PYTHONUNBUFFERED=1
if not defined NEXT_PUBLIC_API_URL set "NEXT_PUBLIC_API_URL=/api"

echo Syncing React build into Django static/frontend ...
echo.

if not exist ".\venv\Scripts\python.exe" (
  echo ERROR: venv not found. From backend folder run:
  echo   python -m venv venv
  echo   venv\Scripts\activate
  echo   pip install -r requirements.txt
  exit /b 1
)

if not exist ".\frontend\package.json" (
  echo ERROR: frontend\package.json not found. Run this script from the backend folder.
  exit /b 1
)

if not exist ".\frontend\node_modules" (
  echo ERROR: frontend\node_modules not found.
  echo Run once in backend\frontend: npm ci
  echo Dependencies are installed at deploy time via railway.toml / CI.
  exit /b 1
)

where npm >nul 2>&1
if errorlevel 1 (
  echo ERROR: npm not found in PATH. Install Node.js 20+ and reopen the terminal.
  exit /b 1
)

.\venv\Scripts\python.exe scripts\sync_frontend.py %*
if errorlevel 1 (
  echo.
  echo ERROR: Frontend sync failed.
  exit /b 1
)

echo.
echo Done. Hard-refresh http://localhost:8000 (Ctrl+Shift+R) if runserver is already running.
endlocal
