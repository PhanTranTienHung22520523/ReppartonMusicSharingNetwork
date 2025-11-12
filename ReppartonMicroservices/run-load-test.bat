@echo off
echo ========================================
echo 🎯 SONG SERVICE LOAD & STRESS TESTING
echo ========================================
echo.

REM Check if Java is available
java -version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Java is not installed or not in PATH
    echo Please install Java and try again
    pause
    exit /b 1
)

echo ✅ Java found
echo.

REM Check if Song Service is running
echo 🔍 Checking if Song Service is running on port 8082...
curl -s http://localhost:8082/actuator/health >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Song Service is not running on port 8082
    echo Please start the Song Service first
    echo.
    echo You can start it with:
    echo cd ReppartonMicroservices
    echo start-services-dev-mode.bat
    pause
    exit /b 1
)

echo ✅ Song Service is running
echo.

REM Ask user which test to run
echo Select test type:
echo 1. Load Test (quick performance check)
echo 2. Stress Test (advanced, takes longer)
echo 3. Both tests
echo.
set /p choice="Enter choice (1-3): "

if "%choice%"=="1" goto loadtest
if "%choice%"=="2" goto stresstest
if "%choice%"=="3" goto both
goto invalid

:loadtest
echo.
echo 🚀 Running Load Test...
cd /d "%~dp0\song-service"
if not exist "target\classes" (
    echo Building project first...
    mvn compile -q
)
java -cp target/classes com.DA2.songservice.loadtest.LoadTester
goto end

:stresstest
echo.
echo 🔥 Running Stress Test (this may take several minutes)...
echo Press Ctrl+C to stop early if needed
echo.
cd /d "%~dp0\song-service"
if not exist "target\classes" (
    echo Building project first...
    mvn compile -q
)
java -cp target/classes com.DA2.songservice.loadtest.StressTester
goto end

:both
echo.
echo 🚀 Running Load Test first...
cd /d "%~dp0\song-service"
if not exist "target\classes" (
    echo Building project first...
    mvn compile -q
)
java -cp target/classes com.DA2.songservice.loadtest.LoadTester
echo.
echo ========================================
echo 🔥 Now running Stress Test...
echo ========================================
java -cp target/classes com.DA2.songservice.loadtest.StressTester
goto end

:invalid
echo ❌ Invalid choice. Please run again and select 1, 2, or 3.
pause
exit /b 1

:end
echo.
echo ========================================
echo 📊 TESTING COMPLETED
echo ========================================
echo.
echo Check the results above for performance metrics
echo.
echo For detailed analysis, check the console output above.
echo.
pause