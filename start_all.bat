@echo off
title Iris ML Studio Launcher
echo ===================================================================
echo Launching Iris Flower Species Classification & Analysis Platform
echo Supervised Machine Learning with Decision Trees
echo ===================================================================

start "Iris Backend (FastAPI)" cmd /k "set PATH=C:\Users\pooja\AppData\Local\Microsoft\WindowsApps;%%PATH%% && cd backend && python run.py"
timeout /t 2 /nobreak >nul
start "Iris Frontend (Vite React)" cmd /k "set PATH=C:\Users\pooja\AppData\Local\Programs\nodejs;%%PATH%% && cd frontend && npm.cmd run dev"

echo Both services launched!
echo - Backend API:  http://127.0.0.1:8000 (Swagger docs: http://127.0.0.1:8000/docs)
echo - Frontend App: http://localhost:5173
pause
