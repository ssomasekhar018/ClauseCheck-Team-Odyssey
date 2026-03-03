# Test script to verify backend is working
# Usage: .\test-backend.ps1

Write-Host "Testing backend connection..." -ForegroundColor Cyan

try {
    $health = Invoke-RestMethod -Uri "http://127.0.0.1:8100/health" -Method Get
    Write-Host "✓ Backend health check: OK" -ForegroundColor Green
    Write-Host "  Response: $($health | ConvertTo-Json)"
} catch {
    Write-Host "✗ Backend health check failed!" -ForegroundColor Red
    Write-Host "  Error: $_"
    Write-Host ""
    Write-Host "Make sure the backend is running:" -ForegroundColor Yellow
    Write-Host "  .\start-backend.ps1"
    exit 1
}

Write-Host ""
Write-Host "Testing API endpoints..." -ForegroundColor Cyan

# Test text analysis endpoint
try {
    $testPayload = @{
        text = "This is a test contract. Payment terms: $1000 per month."
        source_name = "test.txt"
    } | ConvertTo-Json

    $result = Invoke-RestMethod -Uri "http://127.0.0.1:8100/api/analyze/text" -Method Post -Body $testPayload -ContentType "application/json"
    Write-Host "✓ Text analysis endpoint: OK" -ForegroundColor Green
    Write-Host "  Found $($result.clauses.Count) clauses"
    Write-Host "  Found $($result.risks.Count) risks"
} catch {
    Write-Host "✗ Text analysis endpoint failed!" -ForegroundColor Red
    Write-Host "  Error: $_"
    exit 1
}

Write-Host ""
Write-Host "All tests passed! Backend is working correctly." -ForegroundColor Green
