@echo off
echo ========================================
echo Starting Infrastructure Only
echo ========================================
echo.

echo [1/2] Starting Discovery Service (Port 8761)...
cd discovery-service
start "Discovery Service" cmd /k "mvn spring-boot:run"
cd ..

echo Waiting for Discovery Service to start (30 seconds)...
timeout /t 30 /nobreak

echo.
echo [2/2] Starting API Gateway (Port 8080)...
cd api-gateway
start "API Gateway" cmd /k "mvn spring-boot:run"
cd ..

echo.
echo ========================================
echo Infrastructure Started!
echo ========================================
echo.
echo   - Eureka Dashboard: http://localhost:8761
echo   - API Gateway: http://localhost:8080/actuator/health
echo.
echo You can now start individual services manually
echo.
pause
