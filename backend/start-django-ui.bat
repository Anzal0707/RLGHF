@echo off
setlocal EnableExtensions
cd /d "%~dp0"

echo Starting Django with latest React production build on port 8000 ...
echo.

if not exist ".\venv\Scripts\python.exe" (
  echo ERROR: venv not found in %~dp0
  exit /b 1
)

.\venv\Scripts\python.exe manage.py sync_frontend
if errorlevel 1 exit /b 1

echo.
echo Starting Django on 0.0.0.0:8000 (serves synced UI + /api + /admin) ...
.\venv\Scripts\python.exe manage.py runserver 0.0.0.0:8000
endlocal
