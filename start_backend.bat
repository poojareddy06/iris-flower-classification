@echo off
title Iris ML Backend
echo Starting Iris ML Classification Backend Server on http://127.0.0.1:8000...
cd /d "%~dp0backend"
if exist "..\.venv\Scripts\python.exe" (
    ..\.venv\Scripts\python.exe run.py
) else (
    python run.py
)
pause
