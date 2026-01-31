# Comprehensive startup script for the AI Contract Analysis System
# This script will:
# 1. Kill any existing processes on ports 8100 and 5175
# 2. Start the backend server
# 3. Wait for backend to be ready
# 4. Start the frontend server
# Usage: .\start-project.ps1

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $root

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "AI Contract Analysis System - Startup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Clean up existing processes
Write-Host "[1/4] Cleaning up existing processes..." -ForegroundColor Yellow

# Kill processes on port 8100 (backend)
try {
    $processes8100 = Get-NetTCPConnection -LocalPort 8100 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
    if ($processes8100) {
        foreach ($pid in $processes8100) {
            Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
            Write-Host "  Stopped process $pid on port 8100"
        }
        Start-Sleep -Seconds 1
    }
} catch {
    Write-Host "  No processes found on port 8000"
}

# Kill processes on port 5175 (frontend)
try {
    $processes5175 = Get-NetTCPConnection -LocalPort 5175 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
    if ($processes5175) {
        foreach ($pid in $processes5175) {
            Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
            Write-Host "  Stopped process $pid on port 5175"
        }
        Start-Sleep -Seconds 1
    }
} catch {
    Write-Host "  No processes found on port 5173"
}

Write-Host ""

# Step 2: Load environment variables
Write-Host "[2/4] Loading environment variables..." -ForegroundColor Yellow
$envFile = Join-Path $root ".env"
if (Test-Path $envFile) {
    Write-Host "  Loading .env file..."
    Get-Content $envFile | ForEach-Object {
        if ($_ -match '^\s*#') { return }
        if ($_ -match '^\s*$') { return }
        if ($_ -match '^\s*([^=]+)=(.*)$') {
            $name = $matches[1].Trim()
            $value = $matches[2].Trim()
            if ($name -eq 'GEMINI_API_KEY' -and $value) {
                $env:GEMINI_API_KEY = $value
                Write-Host "  [OK] GEMINI_API_KEY loaded"
            }
        }
    }
} else {
    Write-Host "  No .env file found (optional)"
}

Write-Host ""

# Step 3: Start backend
Write-Host "[3/4] Starting backend server..." -ForegroundColor Yellow

$env:PYTHONPATH = $root

# Start backend in a new window using the existing start-backend.ps1 script
$backendScript = Join-Path $root "start-backend.ps1"
Start-Process powershell -ArgumentList "-NoExit", "-File", $backendScript

Write-Host "  Backend starting in new window..."
Write-Host "  Waiting for backend to be ready..."

# Wait for backend
$maxAttempts = 30
$attempt = 0
$backendReady = $false

while ($attempt -lt $maxAttempts -and -not $backendReady) {
    Start-Sleep -Seconds 1
    $attempt++
    try {
        $response = Invoke-WebRequest -Uri "http://127.0.0.1:8100/health" -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            $backendReady = $true
            Write-Host "  [OK] Backend is ready!" -ForegroundColor Green
        }
    } catch {
        if ($attempt % 5 -eq 0) {
            Write-Host "  Still waiting... ($attempt/$maxAttempts)"
        }
    }
}

if (-not $backendReady) {
    Write-Host "  [WARNING] Backend did not start in time" -ForegroundColor Red
    Write-Host "  Check the backend window for errors"
} else {
    Write-Host "  Backend API: http://127.0.0.1:8100" -ForegroundColor Green
    Write-Host "  API Docs: http://127.0.0.1:8100/docs" -ForegroundColor Green
}

Write-Host ""

# Step 4: Start frontend
Write-Host "[4/4] Starting frontend server..." -ForegroundColor Yellow
Set-Location (Join-Path $root "frontend")

if (-not (Test-Path "package.json")) {
    Write-Host "  [ERROR] Frontend directory not found or package.json missing" -ForegroundColor Red
    exit 1
}

Write-Host "  Frontend will be available at: http://localhost:5175" -ForegroundColor Green
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Setup complete! Opening frontend..." -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Backend: http://127.0.0.1:8100" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:5175" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop the frontend server" -ForegroundColor Yellow
Write-Host ""

# Start frontend (this will block)
npm run dev
