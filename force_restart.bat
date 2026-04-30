@echo off
echo Killing old frozen processes...
taskkill /F /IM python.exe >nul 2>&1
taskkill /F /IM py.exe >nul 2>&1
taskkill /F /IM node.exe >nul 2>&1

echo Starting fresh...
start "TrustChain Backend" cmd /k "cd backend && pip install -r requirements.txt && py app.py"
start "TrustChain Frontend" cmd /k "cd client && npm install && npm run dev"
echo Done!
