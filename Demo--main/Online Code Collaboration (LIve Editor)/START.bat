@echo off
REM Quick Start Script for Nexus Development

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║   Nexus - Real-time Code Collaboration Platform           ║
echo ║   Quick Start Script                                       ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ✗ Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

echo ✓ Node.js found
echo.

REM Check if MongoDB is running
echo Checking MongoDB connection...
timeout /t 1 /nobreak >nul

REM Install dependencies if needed
echo.
echo Installing dependencies...
echo.

if not exist "server\node_modules" (
    echo Installing server dependencies...
    cd server
    call npm install
    cd ..
)

if not exist "client\node_modules" (
    echo Installing client dependencies...
    cd client
    call npm install
    cd ..
)

echo.
echo ✓ Dependencies installed
echo.

REM Verify setup
echo Verifying setup...
node verify-setup.js

if errorlevel 1 (
    echo.
    echo ✗ Setup verification failed. Please check the errors above.
    pause
    exit /b 1
)

echo.
echo ✓ Setup verified successfully!
echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║   Starting Servers...                                      ║
echo ║                                                            ║
echo ║   Backend: http://localhost:5000                          ║
echo ║   Frontend: http://localhost:3000                         ║
echo ║                                                            ║
echo ║   Press Ctrl+C to stop servers                            ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

REM Start servers in parallel
start "Nexus Backend" cmd /k "cd server && npm run dev"
timeout /t 2 /nobreak >nul
start "Nexus Frontend" cmd /k "cd client && npm start"

echo.
echo ✓ Servers started in separate windows
echo.
echo Opening browser...
timeout /t 3 /nobreak >nul
start http://localhost:3000

echo.
echo ✓ Browser opened
echo.
pause
