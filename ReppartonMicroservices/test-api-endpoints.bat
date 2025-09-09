@echo off
echo Testing API Endpoints...
echo.

REM Wait for user to confirm services are running
echo Make sure all services are running first!
echo Press any key when all services are started...
pause

echo.
echo Testing Discovery Service (Eureka)...
curl -s http://localhost:8761/actuator/health | findstr "UP" > nul
if %errorlevel% equ 0 (
    echo Discovery Service: ✓ HEALTHY
) else (
    echo Discovery Service: ✗ DOWN
)

echo.
echo Testing API Gateway...
curl -s http://localhost:8080/actuator/health | findstr "UP" > nul
if %errorlevel% equ 0 (
    echo API Gateway: ✓ HEALTHY
) else (
    echo API Gateway: ✗ DOWN
)

echo.
echo Testing User Service...
curl -s http://localhost:8081/actuator/health | findstr "UP" > nul
if %errorlevel% equ 0 (
    echo User Service: ✓ HEALTHY
) else (
    echo User Service: ✗ DOWN
)

echo.
echo Testing Song Service...
curl -s http://localhost:8082/actuator/health | findstr "UP" > nul
if %errorlevel% equ 0 (
    echo Song Service: ✓ HEALTHY
) else (
    echo Song Service: ✗ DOWN
)

echo.
echo Testing Social Service...
curl -s http://localhost:8083/actuator/health | findstr "UP" > nul
if %errorlevel% equ 0 (
    echo Social Service: ✓ HEALTHY
) else (
    echo Social Service: ✗ DOWN
)

echo.
echo Testing Playlist Service...
curl -s http://localhost:8084/actuator/health | findstr "UP" > nul
if %errorlevel% equ 0 (
    echo Playlist Service: ✓ HEALTHY
) else (
    echo Playlist Service: ✗ DOWN
)

echo.
echo Testing Comment Service...
curl -s http://localhost:8085/actuator/health | findstr "UP" > nul
if %errorlevel% equ 0 (
    echo Comment Service: ✓ HEALTHY
) else (
    echo Comment Service: ✗ DOWN
)

echo.
echo Testing Notification Service...
curl -s http://localhost:8086/actuator/health | findstr "UP" > nul
if %errorlevel% equ 0 (
    echo Notification Service: ✓ HEALTHY
) else (
    echo Notification Service: ✗ DOWN
)

echo.
echo ========================================
echo Service Registration Check
echo ========================================
echo.
echo Checking services registered with Eureka...
curl -s http://localhost:8761/eureka/apps | findstr "USER-SERVICE" > nul
if %errorlevel% equ 0 (
    echo USER-SERVICE: ✓ REGISTERED
) else (
    echo USER-SERVICE: ✗ NOT REGISTERED
)

curl -s http://localhost:8761/eureka/apps | findstr "SONG-SERVICE" > nul
if %errorlevel% equ 0 (
    echo SONG-SERVICE: ✓ REGISTERED
) else (
    echo SONG-SERVICE: ✗ NOT REGISTERED
)

curl -s http://localhost:8761/eureka/apps | findstr "SOCIAL-SERVICE" > nul
if %errorlevel% equ 0 (
    echo SOCIAL-SERVICE: ✓ REGISTERED
) else (
    echo SOCIAL-SERVICE: ✗ NOT REGISTERED
)

echo.
echo ========================================
echo API Gateway Routing Test
echo ========================================
echo.

echo Testing authentication endpoint routing...
curl -X POST http://localhost:8080/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"usernameOrEmail\":\"test\",\"password\":\"test123\"}" ^
  -w "Response Code: %%{http_code}\n" ^
  -o response.txt 2>nul

echo Response saved to response.txt
echo.

echo ========================================
echo Testing Complete!
echo ========================================
echo.
echo Check the results above to ensure all services are working.
echo If any service shows as DOWN, check the service logs.
echo.
pause
