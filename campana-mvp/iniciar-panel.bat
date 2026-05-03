@echo off
chcp 65001 >nul
title Plataforma campaña - MVP
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo No se encontró Node.js. Instalalo desde https://nodejs.org ^(versión LTS^) y volvé a intentar.
  pause
  exit /b 1
)

if not exist ".env" (
  if exist ".env.example" copy /Y ".env.example" ".env" >nul
)

if not exist "node_modules\" (
  echo Instalando dependencias ^(solo la primera vez, puede tardar varios minutos^)...
  call npm install
  if errorlevel 1 pause & exit /b 1
)

echo Aplicando migraciones de la base de datos...
call npx prisma migrate deploy
if errorlevel 1 pause & exit /b 1

echo.
echo Abriendo el panel en http://localhost:3000
echo Para cerrar el servidor: Ctrl+C en esta ventana.
echo.

start "" "http://localhost:3000"
call npm run dev

pause
