@echo off
echo ========================================================
echo Starting Chat App (Backend + Frontend)
echo ========================================================

echo [1/2] Starting Backend Server on http://localhost:5000 ...
start "Chat App - Backend" cmd /k "cd /d %~dp0backend && node server.js"

echo [2/2] Starting Frontend App on http://localhost:3000 ...
start "Chat App - Frontend" cmd /k "cd /d %~dp0frontend && npm start"

echo.
echo Both servers are launching in separate windows!
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:3000
echo.
pause
