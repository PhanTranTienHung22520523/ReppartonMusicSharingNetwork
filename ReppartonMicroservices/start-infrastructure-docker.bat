@echo off
echo ===============================================
echo Starting Infrastructure Services with Docker
echo ===============================================

echo.
echo Checking if Docker is installed...
docker --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Docker is not installed or not in PATH
    echo Please install Docker Desktop from: https://www.docker.com/products/docker-desktop
    echo Or use the manual setup: setup-infrastructure-manual.bat
    pause
    exit /b 1
)

echo Docker found! Starting infrastructure services...
echo.

echo Starting Redis, RabbitMQ, Kafka, and Zookeeper...
docker-compose up -d

echo.
echo Waiting for services to start...
timeout /t 30 /nobreak >nul

echo.
echo ===============================================
echo Infrastructure Services Status
echo ===============================================
docker-compose ps

echo.
echo ===============================================
echo Service URLs:
echo ===============================================
echo Redis: localhost:6379
echo RabbitMQ: localhost:5672
echo RabbitMQ Management: http://localhost:15672 (admin/admin123)
echo Kafka: localhost:9092
echo Kafka UI: http://localhost:8089
echo Zookeeper: localhost:2181
echo ===============================================

echo.
echo Testing connectivity...
echo.

echo Testing Redis...
docker exec repparton-redis redis-cli ping

echo.
echo Infrastructure services are ready!
echo You can now start the microservices with: start-all-services.bat
echo.

pause
