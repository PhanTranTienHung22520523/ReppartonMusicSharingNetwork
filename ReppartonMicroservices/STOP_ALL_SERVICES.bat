@echo off
echo ========================================
echo Stopping All Microservices
echo ========================================
echo.

echo Finding and stopping all Spring Boot processes...

for /f "tokens=2" %%a in ('tasklist /FI "WINDOWTITLE eq Discovery Service*" ^| findstr "cmd.exe"') do (
    echo Stopping Discovery Service (PID: %%a)
    taskkill /F /PID %%a >nul 2>&1
)

for /f "tokens=2" %%a in ('tasklist /FI "WINDOWTITLE eq API Gateway*" ^| findstr "cmd.exe"') do (
    echo Stopping API Gateway (PID: %%a)
    taskkill /F /PID %%a >nul 2>&1
)

for /f "tokens=2" %%a in ('tasklist /FI "WINDOWTITLE eq User Service*" ^| findstr "cmd.exe"') do (
    echo Stopping User Service (PID: %%a)
    taskkill /F /PID %%a >nul 2>&1
)

for /f "tokens=2" %%a in ('tasklist /FI "WINDOWTITLE eq Song Service*" ^| findstr "cmd.exe"') do (
    echo Stopping Song Service (PID: %%a)
    taskkill /F /PID %%a >nul 2>&1
)

for /f "tokens=2" %%a in ('tasklist /FI "WINDOWTITLE eq Social Service*" ^| findstr "cmd.exe"') do (
    echo Stopping Social Service (PID: %%a)
    taskkill /F /PID %%a >nul 2>&1
)

for /f "tokens=2" %%a in ('tasklist /FI "WINDOWTITLE eq Playlist Service*" ^| findstr "cmd.exe"') do (
    echo Stopping Playlist Service (PID: %%a)
    taskkill /F /PID %%a >nul 2>&1
)

for /f "tokens=2" %%a in ('tasklist /FI "WINDOWTITLE eq Comment Service*" ^| findstr "cmd.exe"') do (
    echo Stopping Comment Service (PID: %%a)
    taskkill /F /PID %%a >nul 2>&1
)

for /f "tokens=2" %%a in ('tasklist /FI "WINDOWTITLE eq Notification Service*" ^| findstr "cmd.exe"') do (
    echo Stopping Notification Service (PID: %%a)
    taskkill /F /PID %%a >nul 2>&1
)

for /f "tokens=2" %%a in ('tasklist /FI "WINDOWTITLE eq Event Service*" ^| findstr "cmd.exe"') do (
    echo Stopping Event Service (PID: %%a)
    taskkill /F /PID %%a >nul 2>&1
)

for /f "tokens=2" %%a in ('tasklist /FI "WINDOWTITLE eq Story Service*" ^| findstr "cmd.exe"') do (
    echo Stopping Story Service (PID: %%a)
    taskkill /F /PID %%a >nul 2>&1
)

for /f "tokens=2" %%a in ('tasklist /FI "WINDOWTITLE eq Message Service*" ^| findstr "cmd.exe"') do (
    echo Stopping Message Service (PID: %%a)
    taskkill /F /PID %%a >nul 2>&1
)

for /f "tokens=2" %%a in ('tasklist /FI "WINDOWTITLE eq Analytics Service*" ^| findstr "cmd.exe"') do (
    echo Stopping Analytics Service (PID: %%a)
    taskkill /F /PID %%a >nul 2>&1
)

for /f "tokens=2" %%a in ('tasklist /FI "WINDOWTITLE eq Genre Service*" ^| findstr "cmd.exe"') do (
    echo Stopping Genre Service (PID: %%a)
    taskkill /F /PID %%a >nul 2>&1
)

for /f "tokens=2" %%a in ('tasklist /FI "WINDOWTITLE eq Post Service*" ^| findstr "cmd.exe"') do (
    echo Stopping Post Service (PID: %%a)
    taskkill /F /PID %%a >nul 2>&1
)

for /f "tokens=2" %%a in ('tasklist /FI "WINDOWTITLE eq Recommendation Service*" ^| findstr "cmd.exe"') do (
    echo Stopping Recommendation Service (PID: %%a)
    taskkill /F /PID %%a >nul 2>&1
)

for /f "tokens=2" %%a in ('tasklist /FI "WINDOWTITLE eq Search Service*" ^| findstr "cmd.exe"') do (
    echo Stopping Search Service (PID: %%a)
    taskkill /F /PID %%a >nul 2>&1
)

for /f "tokens=2" %%a in ('tasklist /FI "WINDOWTITLE eq Report Service*" ^| findstr "cmd.exe"') do (
    echo Stopping Report Service (PID: %%a)
    taskkill /F /PID %%a >nul 2>&1
)

for /f "tokens=2" %%a in ('tasklist /FI "WINDOWTITLE eq File Storage Service*" ^| findstr "cmd.exe"') do (
    echo Stopping File Storage Service (PID: %%a)
    taskkill /F /PID %%a >nul 2>&1
)

echo.
echo Stopping all java.exe processes (Maven)...
taskkill /F /IM java.exe >nul 2>&1

echo.
echo ========================================
echo All services stopped!
echo ========================================
pause
