@echo off
echo 🚀 Starting Repparton Application
echo =================================

echo.
echo 📋 Startup Checklist:
echo 1. Make sure Java 17+ is installed
echo 2. Make sure Node.js 18+ is installed
echo 3. Close any applications using ports 8080 or 5173

echo.
echo 🔄 Starting Backend (Spring Boot)...
echo ------------------------------------
cd "%~dp0\Repparton"
echo Current directory: %CD%
echo Starting Spring Boot application on port 8080...

start "Repparton Backend" cmd /k ".\mvnw.cmd spring-boot:run"

echo.
echo ⏳ Waiting 30 seconds for backend to start...
timeout /t 30 /nobreak > nul

echo.
echo 🔄 Starting Frontend (Vite React)...
echo ------------------------------------
cd "%~dp0\frontend"
echo Current directory: %CD%

REM Check if node_modules exists, if not run npm install
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    npm install
    if %errorlevel% neq 0 (
        echo ❌ Failed to install dependencies
        pause
        exit /b 1
    )
)

echo Starting Vite development server on port 5173...
start "Repparton Frontend" cmd /k "npm run dev"

echo.
echo ✅ Both services are starting!
echo ==============================
echo Backend: http://localhost:8080
echo Frontend: http://localhost:5173
echo H2 Console: http://localhost:8080/h2-console

echo.
echo 🔍 Sample Login Credentials:
echo ---------------------------
echo Admin: admin@repparton.com / admin123
echo Taylor Swift: taylor@repparton.com / password123
echo Sarah: sarah@example.com / password123

echo.
echo 📝 Next Steps:
echo 1. Wait for both services to fully start
echo 2. Open http://localhost:5173 in your browser
echo 3. Test login with sample credentials
echo 4. Run TESTING_GUIDE.bat for complete testing

echo.
echo Press any key to open browser...
pause > nul

start http://localhost:5173

echo.
echo 🎉 Application Started Successfully!
echo ===================================
echo Both terminal windows will remain open.
echo Close them when you're done testing.

pause
