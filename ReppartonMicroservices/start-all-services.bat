@echo off
echo Starting Repparton Microservices...

echo.
echo Starting Discovery Service (Eureka Server)...
start "Discovery Service" cmd /k "cd discovery-service && mvn spring-boot:run"

timeout /t 30 /nobreak >nul

echo.
echo Starting User Service...
start "User Service" cmd /k "cd user-service && mvn spring-boot:run"

echo.
echo Starting Song Service...
start "Song Service" cmd /k "cd song-service && mvn spring-boot:run"

echo.
echo Starting Social Service...
start "Social Service" cmd /k "cd social-service && mvn spring-boot:run"

echo.
echo Starting Playlist Service...
start "Playlist Service" cmd /k "cd playlist-service && mvn spring-boot:run"

echo.
echo Starting Comment Service...
start "Comment Service" cmd /k "cd comment-service && mvn spring-boot:run"

echo.
echo Starting Notification Service...
start "Notification Service" cmd /k "cd notification-service && mvn spring-boot:run"

echo.
echo Starting Event Service...
start "Event Service" cmd /k "cd event-service && mvn spring-boot:run"

timeout /t 10 /nobreak >nul

echo.
echo Starting API Gateway...
start "API Gateway" cmd /k "cd api-gateway && mvn spring-boot:run"

echo.
echo All services are starting up...
echo Please wait for all services to initialize before testing.
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
echo - Event Service: http://localhost:8087
echo.
echo Infrastructure Services:
echo - Redis: localhost:6379
echo - RabbitMQ: localhost:5672 (Management: http://localhost:15672)
echo - Kafka: localhost:9092
echo.
echo Frontend can connect to: http://localhost:8080 (API Gateway)
pause
