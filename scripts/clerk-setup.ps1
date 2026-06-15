# RegTech — configuration Clerk via CLI (a lancer dans un terminal interactif)
# Application Clerk : app_3EdCISA6pWatOI514YUyYbnogLX

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot\..

Write-Host "=== RegTech Clerk setup ===" -ForegroundColor Cyan

if (-not (Get-Command clerk -ErrorAction SilentlyContinue)) {
  Write-Host "Installation de la Clerk CLI..." -ForegroundColor Yellow
  npm install -g clerk
}

Write-Host "Mise a jour CLI..." -ForegroundColor Yellow
clerk update --yes

Write-Host "Connexion Clerk (navigateur)..." -ForegroundColor Yellow
clerk auth login

Write-Host "Initialisation + liaison app_3EdCISA6pWatOI514YUyYbnogLX..." -ForegroundColor Yellow
clerk init --app app_3EdCISA6pWatOI514YUyYbnogLX --yes --no-skills

Write-Host "Verification..." -ForegroundColor Yellow
clerk doctor

Write-Host ""
Write-Host "Demarrage de l'app :" -ForegroundColor Green
Write-Host "  npm run dev"
Write-Host ""
Write-Host "Testez Connexion / Inscription dans la barre laterale, puis verifiez Authorization: Bearer dans l'onglet Network."
