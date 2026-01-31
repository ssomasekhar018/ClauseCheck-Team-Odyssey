# Simple script to start just the backend
# Usage: .\start-backend.ps1

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $root

Write-Host "Starting backend server..." -ForegroundColor Cyan
Write-Host "Project root: $root"

# Load .env if present
$envFile = Join-Path $root ".env"
if (Test-Path $envFile) {
    Write-Host "Loading .env file..."
    Get-Content $envFile | ForEach-Object {
        if ($_ -match '^\s*#') { return }
        if ($_ -match '^\s*$') { return }
        if ($_ -match '^\s*([^=]+)=(.*)$') {
            $name = $matches[1].Trim()
            $value = $matches[2].Trim()
            if ($name -eq 'GEMINI_API_KEY' -and $value) {
                $env:GEMINI_API_KEY = $value
                Write-Host "GEMINI_API_KEY loaded from .env"
            }
        }
    }
}

$env:PYTHONPATH = $root

# Use the system Python so we don't depend on a broken venv path
$pythonCmd = "python"

Write-Host "Backend will be available at: http://127.0.0.1:8100" -ForegroundColor Green
Write-Host "API docs will be at: http://127.0.0.1:8100/docs" -ForegroundColor Green
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

& $pythonCmd -m uvicorn backend_main:app --reload --host 127.0.0.1 --port 8100
