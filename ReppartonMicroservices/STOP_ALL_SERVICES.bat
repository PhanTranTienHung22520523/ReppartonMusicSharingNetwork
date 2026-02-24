@echo off
echo ========================================
echo Stopping Repparton Microservices System
echo (by killing processes listening on ports)
echo ========================================
echo.

setlocal EnableExtensions EnableDelayedExpansion

REM Ports used by the system (from START_ALL_SERVICES.bat)
set PORTS=5000 8090 8761 8081 8082 8083 8084 8085 8086 8088 8089 8091 8092 8093 8094 8095 8096 8101 8102

for %%P in (%PORTS%) do (
  call :KillPort %%P
)

echo.
echo Done. If something is still running, check Task Manager for stray java.exe/python.exe.
pause
exit /b 0

:KillPort
set PORT=%1
set FOUND=
for /f "tokens=5" %%A in ('netstat -ano ^| findstr /R /C":%PORT%" ^| findstr /I LISTENING') do (
  set FOUND=1
  echo Killing PID %%A on port %PORT%...
  taskkill /F /PID %%A >nul 2>&1
)
if not defined FOUND (
  echo Port %PORT%: not listening
)
exit /b 0
