@echo off
echo Building all microservices...

echo.
echo Building shared-common module...
cd shared-common
call mvn clean install
if %errorlevel% neq 0 (
    echo Failed to build shared-common
    pause
    exit /b 1
)
cd ..

echo.
echo Building discovery-service...
cd discovery-service
call mvn clean package -DskipTests
if %errorlevel% neq 0 (
    echo Failed to build discovery-service
    pause
    exit /b 1
)
cd ..

echo.
echo Building api-gateway...
cd api-gateway
call mvn clean package -DskipTests
if %errorlevel% neq 0 (
    echo Failed to build api-gateway
    pause
    exit /b 1
)
cd ..

echo.
echo Building user-service...
cd user-service
call mvn clean package -DskipTests
if %errorlevel% neq 0 (
    echo Failed to build user-service
    pause
    exit /b 1
)
cd ..

echo.
echo Building song-service...
cd song-service
call mvn clean package -DskipTests
if %errorlevel% neq 0 (
    echo Failed to build song-service
    pause
    exit /b 1
)
cd ..

echo.
echo Building social-service...
cd social-service
call mvn clean package -DskipTests
if %errorlevel% neq 0 (
    echo Failed to build social-service
    pause
    exit /b 1
)
cd ..

echo.
echo Building playlist-service...
cd playlist-service
call mvn clean package -DskipTests
if %errorlevel% neq 0 (
    echo Failed to build playlist-service
    pause
    exit /b 1
)
cd ..

echo.
echo Building comment-service...
cd comment-service
call mvn clean package -DskipTests
if %errorlevel% neq 0 (
    echo Failed to build comment-service
    pause
    exit /b 1
)
cd ..

echo.
echo Building notification-service...
cd notification-service
call mvn clean package -DskipTests
if %errorlevel% neq 0 (
    echo Failed to build notification-service
    pause
    exit /b 1
)
cd ..

echo.
echo All services built successfully!
echo You can now run start-all-services.bat to start the microservices.
pause
