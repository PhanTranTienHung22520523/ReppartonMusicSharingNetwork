@echo off
echo Testing Microservices Architecture...
echo.

REM Check if MongoDB is running
echo Checking MongoDB connection...
mongosh --eval "db.adminCommand('ping')" --quiet > nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: MongoDB is not running or not accessible!
    echo Please start MongoDB first: mongod --dbpath C:\data\db
    pause
    exit /b 1
)
echo MongoDB is running ✓

echo.
echo Testing service builds...

echo Building shared-common...
cd shared-common
call mvn clean install -q
if %errorlevel% neq 0 (
    echo FAILED: shared-common build
    cd ..
    pause
    exit /b 1
)
echo shared-common build ✓
cd ..

echo Building discovery-service...
cd discovery-service
call mvn clean package -DskipTests -q
if %errorlevel% neq 0 (
    echo FAILED: discovery-service build
    cd ..
    pause
    exit /b 1
)
echo discovery-service build ✓
cd ..

echo Building api-gateway...
cd api-gateway
call mvn clean package -DskipTests -q
if %errorlevel% neq 0 (
    echo FAILED: api-gateway build
    cd ..
    pause
    exit /b 1
)
echo api-gateway build ✓
cd ..

echo Building user-service...
cd user-service
call mvn clean package -DskipTests -q
if %errorlevel% neq 0 (
    echo FAILED: user-service build
    cd ..
    pause
    exit /b 1
)
echo user-service build ✓
cd ..

echo Building song-service...
cd song-service
call mvn clean package -DskipTests -q
if %errorlevel% neq 0 (
    echo FAILED: song-service build
    cd ..
    pause
    exit /b 1
)
echo song-service build ✓
cd ..

echo Building social-service...
cd social-service
call mvn clean package -DskipTests -q
if %errorlevel% neq 0 (
    echo FAILED: social-service build
    cd ..
    pause
    exit /b 1
)
echo social-service build ✓
cd ..

echo Building playlist-service...
cd playlist-service
call mvn clean package -DskipTests -q
if %errorlevel% neq 0 (
    echo FAILED: playlist-service build
    cd ..
    pause
    exit /b 1
)
echo playlist-service build ✓
cd ..

echo Building comment-service...
cd comment-service
call mvn clean package -DskipTests -q
if %errorlevel% neq 0 (
    echo FAILED: comment-service build
    cd ..
    pause
    exit /b 1
)
echo comment-service build ✓
cd ..

echo Building notification-service...
cd notification-service
call mvn clean package -DskipTests -q
if %errorlevel% neq 0 (
    echo FAILED: notification-service build
    cd ..
    pause
    exit /b 1
)
echo notification-service build ✓
cd ..

echo.
echo ========================================
echo All services built successfully! ✓
echo ========================================
echo.
echo Next steps:
echo 1. Start MongoDB: mongod --dbpath C:\data\db
echo 2. Run: start-all-services.bat
echo 3. Wait for all services to start
echo 4. Test with: test-api-endpoints.bat
echo.
pause
