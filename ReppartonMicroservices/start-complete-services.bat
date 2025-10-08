@echo off
echo ====================================
echo Starting All 9 New Services
echo ====================================
echo.
echo Make sure MongoDB is running on localhost:27017
echo Make sure Discovery Service (8761) is running
echo Make sure API Gateway (8080) is running
echo.
pause

cd %~dp0

echo Starting Story Service on port 8087...
start "Story Service" cmd /k "cd story-service && mvn spring-boot:run"
timeout /t 5

echo Starting Message Service on port 8088...
start "Message Service" cmd /k "cd message-service && mvn spring-boot:run"
timeout /t 5

echo Starting Analytics Service on port 8089...
start "Analytics Service" cmd /k "cd analytics-service && mvn spring-boot:run"
timeout /t 5

echo Starting Genre Service on port 8090...
start "Genre Service" cmd /k "cd genre-service && mvn spring-boot:run"
timeout /t 5

echo Starting Post Service on port 8091...
start "Post Service" cmd /k "cd post-service && mvn spring-boot:run"
timeout /t 5

echo Starting Report Service on port 8092...
start "Report Service" cmd /k "cd report-service && mvn spring-boot:run"
timeout /t 5

echo Starting Search Service on port 8093...
start "Search Service" cmd /k "cd search-service && mvn spring-boot:run"
timeout /t 5

echo Starting Recommendation Service on port 8094...
start "Recommendation Service" cmd /k "cd recommendation-service && mvn spring-boot:run"
timeout /t 5

echo Starting File Storage Service on port 8095...
start "File Storage Service" cmd /k "cd file-storage-service && mvn spring-boot:run"

echo.
echo ====================================
echo ✅ ALL 9 SERVICES ARE STARTING...
echo ====================================
echo.
echo Check Eureka Dashboard: http://localhost:8761
echo.
echo Services will be available on:
echo - Story Service: http://localhost:8087
echo - Message Service: http://localhost:8088
echo - Analytics Service: http://localhost:8089
echo - Genre Service: http://localhost:8090
echo - Post Service: http://localhost:8091
echo - Report Service: http://localhost:8092
echo - Search Service: http://localhost:8093
echo - Recommendation Service: http://localhost:8094
echo - File Storage Service: http://localhost:8095
echo.
pause
