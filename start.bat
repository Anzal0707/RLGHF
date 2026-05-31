@echo off
echo Starting RLG Complaint System...

:: Start Django Server in a new window
echo Starting Django Backend...
start "Django Backend" cmd /k ".\venv\Scripts\activate && python manage.py runserver"

:: Start Next.js Frontend in a new window
echo Starting Next.js Frontend...
start "Next.js Frontend" cmd /k "cd frontend && npm run dev"

echo Both servers are starting!
