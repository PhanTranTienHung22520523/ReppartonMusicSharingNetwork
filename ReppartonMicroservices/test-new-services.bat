@echo off
echo ===============================================
echo     TESTING ALL NEW SERVICES
echo ===============================================
echo.

echo Testing Story Service (Port 8087)...
curl http://localhost:8087/api/health
echo.

echo Testing Message Service (Port 8088)...
curl http://localhost:8088/api/health
echo.

echo Testing Analytics Service (Port 8089)...
curl http://localhost:8089/api/health
echo.

echo Testing Genre Service (Port 8090)...
curl http://localhost:8090/api/health
echo.

echo ===============================================
echo     TESTING COMPLETE!
echo ===============================================
pause