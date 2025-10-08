@echo off
echo ===============================================
echo     BUILDING NEW MICROSERVICES
echo ===============================================

echo Building Story Service...
cd story-service
call mvn clean compile -DskipTests
if %ERRORLEVEL% neq 0 (
    echo FAILED to build Story Service!
    pause
    exit /b 1
)
cd ..

echo Building Message Service...
cd message-service
call mvn clean compile -DskipTests
if %ERRORLEVEL% neq 0 (
    echo FAILED to build Message Service!
    pause
    exit /b 1
)
cd ..

echo.
echo ===============================================
echo     ALL NEW SERVICES BUILT SUCCESSFULLY!
echo ===============================================
pause