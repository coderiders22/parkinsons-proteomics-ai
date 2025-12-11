# Parkinson's Proteomics AI - Startup Script for Windows
# Run this in PowerShell

Write-Host "🧠 Starting Parkinson's Proteomics AI Backend..." -ForegroundColor Cyan
Write-Host "================================================"

# Navigate to backend directory
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location "$ScriptDir\backend"

# Check if virtual environment exists
if (-not (Test-Path "venv")) {
    Write-Host "Creating virtual environment..."
    python -m venv venv
}

# Activate virtual environment
& .\venv\Scripts\Activate.ps1

# Install dependencies
Write-Host "Installing dependencies..."
pip install -r requirements.txt -q

# Run Django migrations
Write-Host "Running Django migrations..."
python manage.py migrate --run-syncdb

# Start servers
Write-Host ""
Write-Host "Starting servers..." -ForegroundColor Green

# Start FastAPI in new window
Start-Process -FilePath "powershell" -ArgumentList "-Command", "cd '$PWD'; .\venv\Scripts\Activate.ps1; uvicorn api.main:app --host 0.0.0.0 --port 8000 --reload" -WindowStyle Normal

# Start Django in new window
Start-Process -FilePath "powershell" -ArgumentList "-Command", "cd '$PWD'; .\venv\Scripts\Activate.ps1; python manage.py runserver 0.0.0.0:8001" -WindowStyle Normal

Write-Host ""
Write-Host "================================================" -ForegroundColor Green
Write-Host "FastAPI running at: http://localhost:8000" -ForegroundColor Green
Write-Host "  API Docs: http://localhost:8000/docs"
Write-Host "Django running at: http://localhost:8001" -ForegroundColor Blue
Write-Host "  Admin: http://localhost:8001/admin"
Write-Host "================================================"
Write-Host ""
Write-Host "Close the terminal windows to stop the servers."
