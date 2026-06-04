@echo off
setlocal EnableExtensions
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
  echo Ensure frontend/.env.local contains:
  echo   NEXT_PUBLIC_API_URL=http://%LAN_IP%:8000/api
  echo   NEXT_ALLOWED_DEV_ORIGINS=%LAN_IP%
  echo.
) else (
  echo Could not detect LAN IP. Use ipconfig and set frontend/.env.local manually.
  echo   NEXT_PUBLIC_API_URL=http://YOUR_LAN_IP:8000/api
  echo.
)

echo Starting Django on 0.0.0.0:8000...
start "Django Backend" cmd /k ".\venv\Scripts\activate && python manage.py runserver 0.0.0.0:8000"

echo Starting Next.js on 0.0.0.0:3000...
start "Next.js Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo Both servers are starting. Phone and PC must be on the same Wi-Fi.
echo See MOBILE_DEV.md for full setup steps.
