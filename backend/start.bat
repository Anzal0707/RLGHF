@echo off
setlocal EnableExtensions
cd /d "%~dp0"

echo Starting RLG Complaint System (local network)...
echo.

:: Detect a likely LAN IPv4 for mobile testing hints
set "LAN_IP="
for /f "usebackq delims=" %%i in (`powershell -NoProfile -Command "$ip = Get-NetIPAddress -AddressFamily IPv4 -ErrorAction SilentlyContinue | Where-Object { $_.IPAddress -notlike '127.*' -and $_.PrefixOrigin -ne 'WellKnown' } | Select-Object -First 1 -ExpandProperty IPAddress; if ($ip) { Write-Output $ip }"`) do set "LAN_IP=%%i"

if defined LAN_IP (
  echo Detected LAN IP: %LAN_IP%
  echo   Frontend on phone: http://%LAN_IP%:3000
  echo   Django API:        http://%LAN_IP%:8000/api
  echo.
  echo Ensure backend\frontend\.env.local contains:
  echo   NEXT_PUBLIC_API_URL=http://%LAN_IP%:8000/api
  echo   NEXT_ALLOWED_DEV_ORIGINS=%LAN_IP%
  echo.
) else (
  echo Could not detect LAN IP. Use ipconfig and set backend\frontend\.env.local manually.
  echo   NEXT_PUBLIC_API_URL=http://YOUR_LAN_IP:8000/api
  echo.
)

echo Starting Django on 0.0.0.0:8000...
echo NOTE: localhost:8000 serves the last React BUILD. After UI/CSS changes run:
echo   sync-frontend.bat
echo   or: python manage.py sync_frontend
echo Use localhost:3000 for live dev, or start-django-ui.bat to rebuild then serve on 8000.
echo.
start "Django Backend" cmd /k "cd /d %~dp0 && .\venv\Scripts\activate && python manage.py runserver 0.0.0.0:8000"

echo Starting Next.js on 0.0.0.0:3000...
start "Next.js Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo Both servers are starting from: %~dp0
echo Phone and PC must be on the same Wi-Fi.
echo If Next.js crashes with Turbopack cache errors, run: clean-frontend-dev.bat
echo See MOBILE_DEV.md for full setup steps.
endlocal
