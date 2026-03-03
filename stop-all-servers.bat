@echo off
echo Stopping all Legal Tech servers...

echo Stopping Python processes (FastAPI servers)...
taskkill /f /im python.exe >nul 2>&1

echo Stopping Node.js processes (Express servers)...
taskkill /f /im node.exe >nul 2>&1

echo Stopping npm processes...
taskkill /f /im npm.cmd >nul 2>&1

echo Stopping Vite dev servers...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5175 ^| findstr LISTENING') do taskkill /PID %%a /F >nul 2>&1
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5174 ^| findstr LISTENING') do taskkill /PID %%a /F >nul 2>&1
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000 ^| findstr LISTENING') do taskkill /PID %%a /F >nul 2>&1

echo All servers stopped.
pause