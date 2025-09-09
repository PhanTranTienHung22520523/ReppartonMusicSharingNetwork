@echo off
echo ===============================================
echo Manual Infrastructure Setup (No Docker Required)
echo ===============================================

echo.
echo This script will guide you through manual installation of:
echo - Redis (Memurai as Redis alternative for Windows)
echo - RabbitMQ 
echo - Apache Kafka
echo.
echo Please follow the instructions below:
echo.

echo ===============================================
echo 1. REDIS INSTALLATION (using Memurai)
echo ===============================================
echo.
echo Option A: Download and install Memurai (Redis-compatible):
echo 1. Go to: https://www.memurai.com/get-memurai
echo 2. Download Memurai Developer Edition (Free)
echo 3. Install and start the service
echo 4. Default port: 6379
echo.
echo Option B: Use Redis for Windows (unofficial):
echo 1. Go to: https://github.com/tporadowski/redis/releases
echo 2. Download Redis-x64-*.zip
echo 3. Extract to C:\redis
echo 4. Run: redis-server.exe
echo.

echo ===============================================
echo 2. RABBITMQ INSTALLATION
echo ===============================================
echo.
echo 1. Install Erlang first:
echo    - Go to: https://www.erlang.org/downloads
echo    - Download and install OTP 26.x for Windows
echo.
echo 2. Install RabbitMQ:
echo    - Go to: https://www.rabbitmq.com/install-windows.html
echo    - Download RabbitMQ Server installer
echo    - Install and start RabbitMQ service
echo    - Enable management plugin: rabbitmq-plugins enable rabbitmq_management
echo    - Management UI: http://localhost:15672 (guest/guest)
echo.

echo ===============================================
echo 3. APACHE KAFKA INSTALLATION
echo ===============================================
echo.
echo 1. Install Java 11+ if not already installed:
echo    - Go to: https://adoptium.net/
echo    - Download and install OpenJDK 17
echo.
echo 2. Download Kafka:
echo    - Go to: https://kafka.apache.org/downloads
echo    - Download Kafka 2.13-3.6.0.tgz (Binary downloads)
echo    - Extract to C:\kafka
echo.
echo 3. Start Kafka:
echo    - Open Command Prompt as Administrator
echo    - cd C:\kafka
echo    - Start Zookeeper: bin\windows\zookeeper-server-start.bat config\zookeeper.properties
echo    - Start Kafka: bin\windows\kafka-server-start.bat config\server.properties
echo.

echo ===============================================
echo 4. ALTERNATIVE: USE DOCKER DESKTOP (Recommended)
echo ===============================================
echo.
echo If you can install Docker Desktop:
echo 1. Install Docker Desktop for Windows
echo 2. Use the docker-compose.yml file we'll create
echo.

echo ===============================================
echo 5. LIGHTWEIGHT ALTERNATIVES
echo ===============================================
echo.
echo For development/testing only:
echo - Redis: Use In-Memory cache (already configured in Spring)
echo - RabbitMQ: Use RabbitMQ CloudAMQP (free tier)
echo - Kafka: Use Confluent Cloud (free tier)
echo.

pause
echo.
echo ===============================================
echo Creating Docker Compose file for easy setup...
echo ===============================================
