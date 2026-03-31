# TariffIQ - Unified Infrastructure Launcher
# This script starts both the Next.js frontend and the FastAPI backend concurrently.

Write-Host "Launching TariffIQ Unified Prototype..." -ForegroundColor Cyan

# 1. Check for concurrently (dependency for running both tasks in one window)
if (-not (Test-Path "node_modules/concurrently")) {
    Write-Host "Installing concurrently (one-time setup)..." -ForegroundColor Yellow
    npm install --save-dev concurrently --silent
}

# 2. Run the unified development command
npm run dev
