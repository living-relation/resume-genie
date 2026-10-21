@echo off
setlocal EnableExtensions
rem Launch Resume Genie locally: API (pnpm dev:api, port 8080) and web UI (pnpm dev:web, port 5173).
rem Lives in the repo's scripts folder; the repo root is found relative to this file.
rem PORT is set per window: the API's dotenv load does not override an existing PORT,
rem so a PORT in .env cannot pull the API onto Vite's port.
for %%I in ("%~dp0..") do set "APP=%%~fI"

if not exist "%APP%\package.json" (
  echo Could not find Resume Genie package.json at "%APP%".
  pause
  exit /b 1
)

where pnpm >nul 2>&1
if errorlevel 1 (
  echo pnpm not on PATH.
  pause
  exit /b 1
)

echo Using: %APP%
cd /d "%APP%"

set "PORT=8080"
start "resume-genie api" /d "%APP%" cmd /k pnpm dev:api
timeout /t 2 /nobreak >nul
set "PORT=5173"
start "resume-genie web" /d "%APP%" cmd /k pnpm dev:web
timeout /t 3 /nobreak >nul
start "" "http://localhost:5173"
echo Opened http://localhost:5173
endlocal