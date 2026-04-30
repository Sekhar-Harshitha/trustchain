@echo off
title TrustChain - Full Stack Launch
color 0A
echo.
echo  ████████╗██████╗ ██╗   ██╗███████╗████████╗
echo  ╚══██╔══╝██╔══██╗██║   ██║██╔════╝╚══██╔══╝
echo     ██║   ██████╔╝██║   ██║███████╗   ██║
echo     ██║   ██╔══██╗██║   ██║╚════██║   ██║
echo     ██║   ██║  ██║╚██████╔╝███████║   ██║
echo     ╚═╝   ╚═╝  ╚═╝ ╚═════╝ ╚══════╝   ╚═╝
echo.
echo  TrustChain - AI Return Fraud Detection Platform
echo  ================================================
echo.

echo [1/3] Starting ML Service (Python, port 5001)...
cd /d "%~dp0ml"
start "ML Service - Port 5001" cmd /k "pip install -r requirements.txt -q && python app.py"
timeout /t 5 /nobreak > nul

echo [2/3] Starting Node.js Server (port 5000)...
cd /d "%~dp0server"
start "Node Server - Port 5000" cmd /k "node server.js"
timeout /t 3 /nobreak > nul

echo [3/3] Starting React Frontend (port 5173)...
cd /d "%~dp0client"
start "React Client - Port 5173" cmd /k "npm run dev"

echo.
echo  ============================================
echo  All services launching...
echo.
echo  ML Model:   http://localhost:5001
echo  API Server: http://localhost:5000
echo  Frontend:   http://localhost:5173
echo.
echo  Admin Panel: http://localhost:5173/admin
echo  Password: admin123
echo.
echo  Demo Login:
echo    Aadhaar: 234567890123  (OTP: 123456)
echo  ============================================
echo.
timeout /t 4 /nobreak > nul
start http://localhost:5173
