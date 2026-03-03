@echo off
REM Start all three legal tech projects (backends + frontends)
REM Law Simulation (law_dev) + Case File Library (case_library) + AI Contract Analysis System

echo Starting all projects in separate command windows...

REM === Landing Page (Home) ===
start "Landing Page" cmd /c "cd /d %~dp0landing && python -m http.server 8080"

REM === AI Contract Analysis System ===
start "AI Backend" cmd /c "cd /d %~dp0ai_contract_analysis_system && python -m uvicorn backend_main:app --host 127.0.0.1 --port 8100"
timeout /t 2 /nobreak > nul
start "AI Frontend" cmd /c "cd /d %~dp0ai_contract_analysis_system\frontend && npm run dev"

REM === Case File Library (case_library) ===
start "Case Backend" cmd /c "cd /d %~dp0case_library\server && node index.js"
timeout /t 2 /nobreak > nul
start "Case Frontend" cmd /c "cd /d %~dp0case_library\client && npm run dev"

REM === Law Simulation (Courtroom) ===
start "Court Backend" cmd /c "cd /d "%~dp0law_dev\backend" && python -m uvicorn app.main:app --host 127.0.0.1 --port 8000"
timeout /t 2 /nobreak > nul
start "Court Frontend" cmd /c "cd /d "%~dp0law_dev\frontend" && npm run dev"

echo.
echo All start commands issued.
echo.
echo URLs:
echo   Landing Page (Home): http://localhost:8080
echo   AI Contract Analysis: http://localhost:5175
echo   Case File Library: http://localhost:3000
echo   Courtroom Simulation: http://localhost:5174
echo.
echo Use Ctrl+C in each window to stop individual servers.
echo.
pause


echo.
echo All start commands issued.
echo.
echo URLs:
echo   Landing Page (Home): http://localhost:8080
echo   AI Contract Analysis: http://localhost:5175
echo   Case File Library: http://localhost:3000
echo   Courtroom Simulation: http://localhost:5174
echo.
echo Use Ctrl+C in each window to stop individual servers.
echo.
pause

