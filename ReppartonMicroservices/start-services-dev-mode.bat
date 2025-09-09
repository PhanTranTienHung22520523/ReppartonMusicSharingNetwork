@echo off
echo ===============================================
echo Repparton Microservices - Development Mode
echo ===============================================
echo.
echo Starting microservices without external infrastructure
echo (Using in-memory alternatives for development)
echo.
echo NOTE: 
echo - Redis: Using in-memory cache
echo - RabbitMQ: Events will be logged only
echo - Kafka: Events will be logged only
echo.

echo.
echo Starting Discovery Service (Eureka Server)...
start "Discovery Service" cmd /k "cd discovery-service && mvn spring-boot:run -Dspring-boot.run.profiles=dev"

timeout /t 30 /nobreak >nul

echo.
echo Starting User Service...
start "User Service" cmd /k "cd user-service && mvn spring-boot:run -Dspring-boot.run.profiles=dev"

echo.
echo Starting Song Service...
start "Song Service" cmd /k "cd song-service && mvn spring-boot:run -Dspring-boot.run.profiles=dev"

echo.
echo Starting Social Service...
start "Social Service" cmd /k "cd social-service && mvn spring-boot:run -Dspring-boot.run.profiles=dev"

echo.
echo Starting Playlist Service...
start "Playlist Service" cmd /k "cd playlist-service && mvn spring-boot:run -Dspring-boot.run.profiles=dev"

echo.
echo Starting Comment Service...
start "Comment Service" cmd /k "cd comment-service && mvn spring-boot:run -Dspring-boot.run.profiles=dev"

echo.
echo Starting Notification Service...
start "Notification Service" cmd /k "cd notification-service && mvn spring-boot:run -Dspring-boot.run.profiles=dev"

timeout /t 10 /nobreak >nul

echo.
echo Starting API Gateway...
start "API Gateway" cmd /k "cd api-gateway && mvn spring-boot:run -Dspring-boot.run.profiles=dev"

echo.
echo All services are starting up in DEVELOPMENT MODE...
echo Infrastructure services are DISABLED.
echo.
echo Service URLs:
echo - Discovery Service (Eureka): http://localhost:8761
echo - API Gateway: http://localhost:8080
echo - User Service: http://localhost:8081
echo - Song Service: http://localhost:8082
echo - Social Service: http://localhost:8083
echo - Playlist Service: http://localhost:8084
echo - Comment Service: http://localhost:8085
echo - Notification Service: http://localhost:8086
echo.
echo Event Service is DISABLED in development mode.
echo.
pause
