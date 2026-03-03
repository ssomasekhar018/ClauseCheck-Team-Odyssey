# Simple script to start just the frontend
# Usage: .\start-frontend.ps1

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location (Join-Path $root "frontend")

Write-Host "Starting frontend dev server..." -ForegroundColor Cyan
Write-Host "Frontend will be available at: http://localhost:5173" -ForegroundColor Green
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

npm run dev
