@echo off
setlocal EnableExtensions
cd /d "%~dp0"

echo Clearing Next.js / Turbopack dev cache...
echo.

if not exist ".\frontend\package.json" (
  echo ERROR: backend\frontend not found. Run from the backend folder.
  exit /b 1
)

pushd frontend
call npm run clean:cache
set "CLEAN_EXIT=%ERRORLEVEL%"
popd

if not "%CLEAN_EXIT%"=="0" (
  echo.
  echo ERROR: Cache clean failed. Close all terminals running npm/node, then retry.
  exit /b 1
)

echo.
echo Start dev server again:
echo   cd backend\frontend
echo   npm run dev
endlocal
