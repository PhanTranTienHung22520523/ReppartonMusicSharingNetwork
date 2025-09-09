@echo off
echo ===============================================
echo Installing and Starting Infrastructure Services
echo ===============================================

echo.
echo 1. Installing Chocolatey (if not installed)...
powershell -Command "if (!(Get-Command choco -ErrorAction SilentlyContinue)) { Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1')) }"

echo.
echo 2. Installing Redis...
choco install redis-64 -y

echo.
echo 3. Installing RabbitMQ...
choco install rabbitmq -y

echo.
echo 4. Installing Kafka...
choco install apache-kafka -y

echo.
echo 5. Starting Redis Server...
start "Redis Server" redis-server

echo.
echo 6. Starting RabbitMQ Server...
start "RabbitMQ Server" cmd /c "rabbitmq-server"

echo.
echo 7. Starting Zookeeper (required for Kafka)...
start "Zookeeper" cmd /c "cd C:\tools\kafka && bin\windows\zookeeper-server-start.bat config\zookeeper.properties"

timeout /t 10 /nobreak >nul

echo.
echo 8. Starting Kafka Server...
start "Kafka Server" cmd /c "cd C:\tools\kafka && bin\windows\kafka-server-start.bat config\server.properties"

echo.
echo ===============================================
echo Infrastructure Services Started!
echo ===============================================
echo Redis: localhost:6379
echo RabbitMQ: localhost:5672 (Management UI: http://localhost:15672)
echo Kafka: localhost:9092
echo ===============================================
echo.
echo Waiting 30 seconds for services to fully start...
timeout /t 30 /nobreak >nul

echo.
echo Services are ready! You can now start the microservices.
pause
