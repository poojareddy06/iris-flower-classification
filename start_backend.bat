@echo off
title Iris ML Backend
set "PATH=C:\Users\pooja\AppData\Local\Microsoft\WindowsApps;%PATH%"
echo Starting Iris ML Classification Backend Server on http://127.0.0.1:8000...
cd backend
python run.py
pause
