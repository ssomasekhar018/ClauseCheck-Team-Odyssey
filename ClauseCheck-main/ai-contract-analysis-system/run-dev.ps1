# Run both backend (FastAPI) and frontend (Vite React) for development
# Usage (from this folder):
#   .\run-dev.ps1
#   or
#   ./run-dev.ps1

$ErrorActionPreference = "Stop"

# Resolve project root (where this script lives)
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $root

Write-Host "[run-dev] Project root:" $root

# Load GEMINI_API_KEY from .env if present (simple KEY=VALUE parser)
$envFile = Join-Path $root ".env"
if (Test-Path $envFile) {
    Write-Host "[run-dev] Loading environment from .env"
    Get-Content $envFile | ForEach-Object {
        if ($_ -match '^\s*#') { return }
        if ($_ -match '^\s*$') { return }
        if ($_ -match '^\s*([^=]+)=(.*)$') {
            $name = $matches[1].Trim()
            $value = $matches[2].Trim()
            if ($name -eq 'GEMINI_API_KEY' -and $value) {
                $env:GEMINI_API_KEY = $value
                Write-Host "[run-dev] GEMINI_API_KEY loaded from .env"
            }
        }
    }
} else {
    Write-Host "[run-dev] No .env file found. Backend will run without GEMINI_API_KEY unless it is already set."
}

# Start backend as a background job
Write-Host "[run-dev] Starting backend on http://localhost:8100 ..."

# Set PYTHONPATH for the job
$env:PYTHONPATH = $root

$backendJob = Start-Job -ScriptBlock {
    param($projRoot)
    $env:PYTHONPATH = $projRoot
    Set-Location $projRoot
    python -m uvicorn backend_main:app --reload --host 127.0.0.1 --port 8100
} -ArgumentList $root

# Wait for backend to be ready
Write-Host "[run-dev] Waiting for backend to start..."
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
            Write-Host "[run-dev] Backend is ready!" -ForegroundColor Green
        }
    } catch {
        # Backend not ready yet, continue waiting
        if ($attempt % 5 -eq 0) {
            Write-Host "[run-dev] Still waiting for backend... (attempt $attempt/$maxAttempts)"
        }
    }
}

if (-not $backendReady) {
    Write-Host "[run-dev] WARNING: Backend did not start properly. Check the job output." -ForegroundColor Yellow
    Write-Host "[run-dev] You can check backend status with: Receive-Job $($backendJob.Id)"
}

# Start frontend in this terminal
Write-Host "[run-dev] Starting frontend dev server (Vite)..."
Set-Location (Join-Path $root "frontend")

npm run dev

# When the frontend server exits, stop the backend job
Write-Host "[run-dev] Frontend stopped, stopping backend job..."
if ($backendJob -and $backendJob.State -eq 'Running') {
    Stop-Job $backendJob | Out-Null
    Remove-Job $backendJob | Out-Null
}

Write-Host "[run-dev] Done."