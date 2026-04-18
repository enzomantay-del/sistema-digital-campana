# Subir la propuesta a GitHub (Windows PowerShell)
# Uso: clic derecho → "Ejecutar con PowerShell" o en terminal: .\publicar-en-github.ps1
# Requisitos: Git instalado, cuenta GitHub, repo vacío creado en la web

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

Write-Host ""
Write-Host "=== Publicar propuesta en GitHub ===" -ForegroundColor Cyan
Write-Host ""

$usuario = Read-Host "Tu usuario de GitHub (el que va en github.com/TU_USUARIO)"
if ([string]::IsNullOrWhiteSpace($usuario)) {
  Write-Host "Cancelado." -ForegroundColor Red
  exit 1
}

$repo = Read-Host "Nombre del repositorio [propuesta-kozlowski-tienda]"
if ([string]::IsNullOrWhiteSpace($repo)) {
  $repo = "propuesta-kozlowski-tienda"
}

$url = "https://github.com/$usuario/$repo.git"

Write-Host ""
Write-Host "Antes de seguir:" -ForegroundColor Yellow
Write-Host "  1. Entrá a https://github.com/new"
Write-Host "  2. Repository name: $repo"
Write-Host "  3. Dejá el repo VACÍO: sin README, sin .gitignore, sin licencia."
Write-Host "  4. Create repository."
Write-Host ""
Read-Host "Cuando esté creado, presioná Enter para subir el código"

git remote remove origin 2>$null
git remote add origin $url

Write-Host ""
Write-Host "Enviando a $url ..." -ForegroundColor Green
git push -u origin main

if ($LASTEXITCODE -eq 0) {
  Write-Host ""
  Write-Host "Listo. Activá GitHub Pages: Repo → Settings → Pages → Branch main, folder /docs" -ForegroundColor Green
  Write-Host "Tu sitio será: https://$usuario.github.io/$repo/" -ForegroundColor Cyan
} else {
  Write-Host ""
  Write-Host "Si pidió usuario/contraseña: en GitHub la contraseña es un Personal Access Token (no la de la web)." -ForegroundColor Yellow
  Write-Host "Creá uno en: GitHub → Settings → Developer settings → Personal access tokens" -ForegroundColor Yellow
}

Write-Host ""
Read-Host "Enter para salir"
