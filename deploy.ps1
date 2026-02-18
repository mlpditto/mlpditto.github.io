# Git Deployment Script for FKB-Front-Kanban
$ErrorActionPreference = "Stop"

Write-Host "Starting Deployment Process..." -ForegroundColor Cyan

# 1. Get Commit Message
$msg = Read-Host "Enter commit message (Leave blank for 'Auto-update + Timestamp')"
if ([string]::IsNullOrWhiteSpace($msg)) {
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm"
    $msg = "Update: $timestamp"
}

try {
    # 4. Push to Git
    Write-Host "Adding changes..." -ForegroundColor Yellow
    git add .
    Write-Host "Committing changes: $msg" -ForegroundColor Yellow
    git commit -m "$msg"
    Write-Host "Pushing to repository..." -ForegroundColor Yellow
    git push

    # 5. Deploy to Firebase
    Write-Host "Hosting: Deploying to Firebase..." -ForegroundColor Cyan
    firebase deploy --only hosting

    Write-Host "Deployment Successful!" -ForegroundColor Green
}
catch {
    Write-Host "Error occurred during deployment:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}

Write-Host "Press any key to exit..."
pause
