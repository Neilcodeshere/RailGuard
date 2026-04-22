@echo off
echo ==========================================
echo   RailGuard AI - Manual Control Panel
echo ==========================================
echo 1. Start All Services (Live)
echo 2. Stop All Services (Offline)
echo 3. Mock ESP32 Online Status
echo 4. Seed Database with Sample Data
echo 5. Exit
echo ==========================================
set /p choice="Enter choice (1-5): "

if "%choice%"=="1" (
    echo Starting Backend...
    start cmd /k "cd server && npm run dev"
    echo Starting Frontend...
    start cmd /k "cd client && npm run dev"
    timeout /t 5
    start http://localhost:5173
)

if "%choice%"=="2" (
    echo Stopping Node processes...
    taskkill /F /IM node.exe
    echo System Offline.
    pause
)

if "%choice%"=="3" (
    echo Mocking ESP32 Connection...
    cd server && node mock-esp32.js
    pause
)

if "%choice%"=="4" (
    echo Seeding Database...
    cd server && node seed.js
    pause
)

if "%choice%"=="5" exit
./run_control.bat
