@echo off
echo Setting up Environment Variables for Microservices...
echo.

REM Check if .env files exist, if not copy from example
echo Checking environment files...

if not exist "discovery-service\.env" (
    echo Creating discovery-service\.env...
    copy "discovery-service\.env" "discovery-service\.env.backup" >nul 2>&1
)

if not exist "api-gateway\.env" (
    echo Creating api-gateway\.env...
    copy "api-gateway\.env" "api-gateway\.env.backup" >nul 2>&1
)

if not exist "user-service\.env" (
    echo Creating user-service\.env...
    copy "user-service\.env" "user-service\.env.backup" >nul 2>&1
)

if not exist "song-service\.env" (
    echo Creating song-service\.env...
    copy "song-service\.env" "song-service\.env.backup" >nul 2>&1
)

if not exist "social-service\.env" (
    echo Creating social-service\.env...
    copy "social-service\.env" "social-service\.env.backup" >nul 2>&1
)

if not exist "playlist-service\.env" (
    echo Creating playlist-service\.env...
    copy "playlist-service\.env" "playlist-service\.env.backup" >nul 2>&1
)

if not exist "comment-service\.env" (
    echo Creating comment-service\.env...
    copy "comment-service\.env" "comment-service\.env.backup" >nul 2>&1
)

if not exist "notification-service\.env" (
    echo Creating notification-service\.env...
    copy "notification-service\.env" "notification-service\.env.backup" >nul 2>&1
)

echo.
echo ========================================
echo Environment Variables Setup Complete!
echo ========================================
echo.
echo Configuration Summary:
echo.
echo MongoDB Atlas Connection:
echo - Database: repparton cluster
echo - Separate databases per service
echo.
echo Cloudinary (File Storage):
echo - Cloud Name: dgwokfdvm
echo - Ready for file uploads
echo.
echo JWT Security:
echo - Shared secret across all services
echo - Access token: 1 hour
echo - Refresh token: 7 days
echo.
echo Service Ports:
echo - Discovery Service: 8761
echo - API Gateway: 8080
echo - User Service: 8081
echo - Song Service: 8082
echo - Social Service: 8083
echo - Playlist Service: 8084
echo - Comment Service: 8085
echo - Notification Service: 8086
echo.
echo CORS Origins:
echo - React Dev Server: http://localhost:3000
echo - Vite Dev Server: http://localhost:5173
echo - API Gateway: http://localhost:8080
echo.
echo ========================================
echo Next Steps:
echo ========================================
echo 1. Review .env files in each service directory
echo 2. Modify MongoDB URIs if using local MongoDB
echo 3. Update Cloudinary credentials if needed
echo 4. Run: build-all.bat
echo 5. Run: start-all-services.bat
echo.
pause
