@echo off
cd /d "%~dp0"
where node >nul 2>nul || (echo Node.js non trovato. Installalo da https://nodejs.org e riprova. & pause & exit /b)
if not exist node_modules ( call npm install --omit=dev )
node server.js --open
pause
