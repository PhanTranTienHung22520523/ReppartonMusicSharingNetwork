@echo off
echo ===============================================
echo     BUILDING ALL SERVICES
echo ===============================================
echo.

echo Building parent POM...
call mvn clean install -N -DskipTests
if %ERRORLEVEL% neq 0 (
    echo FAILED to build parent POM!
    pause
    exit /b 1
)

echo.
echo Building shared-common...
cd shared-common
call mvn clean install -DskipTests
if %ERRORLEVEL% neq 0 (
    echo FAILED to build shared-common!
    pause
    exit /b 1
)
cd ..

echo.
echo Building Discovery Service...
cd discovery-service
call mvn clean compile -DskipTests
cd ..

echo.
echo Building API Gateway...
cd api-gateway
call mvn clean compile -DskipTests
cd ..

echo.
echo Building User Service...
cd user-service
call mvn clean compile -DskipTests
cd ..

echo.
echo Building Song Service...
cd song-service
call mvn clean compile -DskipTests
cd ..

echo.
echo Building Social Service...
cd social-service
call mvn clean compile -DskipTests
cd ..

echo.
echo Building Playlist Service...
cd playlist-service
call mvn clean compile -DskipTests
cd ..

echo.
echo Building Comment Service...
cd comment-service
call mvn clean compile -DskipTests
cd ..

echo.
echo Building Notification Service...
cd notification-service
call mvn clean compile -DskipTests
cd ..

echo.
echo Building Event Service...
cd event-service
call mvn clean compile -DskipTests
cd ..

echo.
echo ===============================================
echo     BUILDING NEW SERVICES
echo ===============================================

echo.
echo Building Story Service...
cd story-service
call mvn clean compile -DskipTests
if %ERRORLEVEL% neq 0 (
    echo FAILED to build Story Service!
    pause
    exit /b 1
)
cd ..

echo.
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
echo Building Analytics Service...
cd analytics-service
call mvn clean compile -DskipTests
if %ERRORLEVEL% neq 0 (
    echo FAILED to build Analytics Service!
    pause
    exit /b 1
)
cd ..

echo.
echo Building Genre Service...
cd genre-service
call mvn clean compile -DskipTests
if %ERRORLEVEL% neq 0 (
    echo FAILED to build Genre Service!
    pause
    exit /b 1
)
cd ..

echo.
echo ===============================================
echo     ALL SERVICES BUILT SUCCESSFULLY!
echo ===============================================
echo.
echo Next steps:
echo 1. Start MongoDB (if not running)
echo 2. Run: start-extended-services.bat
echo 3. Test: test-new-services.bat
echo.
pause