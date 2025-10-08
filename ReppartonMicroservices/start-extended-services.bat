@echo off
title Repparton Microservices - Extended Version

echo ===============================================
echo     STARTING EXTENDED MICROSERVICES
echo ===============================================
echo.

echo Starting Discovery Service...
start "Discovery Service" cmd /k "cd discovery-service && mvn spring-boot:run"
timeout /t 15

echo Starting API Gateway...
start "API Gateway" cmd /k "cd api-gateway && mvn spring-boot:run"
timeout /t 10

echo Starting User Service...
start "User Service" cmd /k "cd user-service && mvn spring-boot:run"
timeout /t 5

echo Starting Song Service...
start "Song Service" cmd /k "cd song-service && mvn spring-boot:run"
timeout /t 5

echo Starting Social Service...
start "Social Service" cmd /k "cd social-service && mvn spring-boot:run"
timeout /t 5

echo Starting Playlist Service...
start "Playlist Service" cmd /k "cd playlist-service && mvn spring-boot:run"
timeout /t 5

echo Starting Comment Service...
start "Comment Service" cmd /k "cd comment-service && mvn spring-boot:run"
timeout /t 5

echo Starting Notification Service...
start "Notification Service" cmd /k "cd notification-service && mvn spring-boot:run"
timeout /t 5

echo Starting Event Service...
start "Event Service" cmd /k "cd event-service && mvn spring-boot:run"
timeout /t 5

echo Starting Story Service...
start "Story Service" cmd /k "cd story-service && mvn spring-boot:run"
timeout /t 5

echo Starting Message Service...
start "Message Service" cmd /k "cd message-service && mvn spring-boot:run"
timeout /t 5

echo.
echo ===============================================
echo     ALL SERVICES STARTED!
echo ===============================================
echo.
echo Services are running on:
echo - Discovery Service: http://localhost:8761
echo - API Gateway: http://localhost:8080
echo - User Service: http://localhost:8081
echo - Song Service: http://localhost:8082
echo - Social Service: http://localhost:8083
echo - Playlist Service: http://localhost:8084
echo - Comment Service: http://localhost:8085
echo - Notification Service: http://localhost:8086
echo - Event Service: http://localhost:8090
echo - Story Service: http://localhost:8087
echo - Message Service: http://localhost:8088
echo.
echo Press any key to close this window...
pause