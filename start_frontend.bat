@echo off
title Iris ML Frontend
echo Starting Iris ML Platform Frontend on http://localhost:5173...
cd /d "%~dp0frontend"
npm.cmd run dev
pause
