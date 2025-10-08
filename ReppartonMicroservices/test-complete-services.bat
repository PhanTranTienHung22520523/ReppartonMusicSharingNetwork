@echo off
echo ====================================
echo Testing All 9 New Services
echo ====================================
echo.

echo Testing Story Service (8087)...
curl -s http://localhost:8087/api/stories/health
echo.

echo Testing Message Service (8088)...
curl -s http://localhost:8088/api/messages/health
echo.

echo Testing Analytics Service (8089)...
curl -s http://localhost:8089/api/analytics/health
echo.

echo Testing Genre Service (8090)...
curl -s http://localhost:8090/api/genres/health
echo.

echo Testing Post Service (8091)...
curl -s http://localhost:8091/api/posts/health
echo.

echo Testing Report Service (8092)...
curl -s http://localhost:8092/api/reports/health
echo.

echo Testing Search Service (8093)...
curl -s http://localhost:8093/api/search/health
echo.

echo Testing Recommendation Service (8094)...
curl -s http://localhost:8094/api/recommendations/health
echo.

echo Testing File Storage Service (8095)...
curl -s http://localhost:8095/api/files/health
echo.

echo.
echo ====================================
echo ✅ Health Check Complete!
echo ====================================
echo.
echo Check Eureka Dashboard for registration status:
echo http://localhost:8761
echo.
pause
