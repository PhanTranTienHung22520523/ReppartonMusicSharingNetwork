@echo off
echo ====================================
echo Building All 9 New Services
echo ====================================
echo.

cd %~dp0

echo [1/9] Building Story Service...
cd story-service
call mvn clean install -DskipTests
if %errorlevel% neq 0 (
    echo ERROR: Story Service build failed!
    pause
    exit /b 1
)
cd ..

echo.
echo [2/9] Building Message Service...
cd message-service
call mvn clean install -DskipTests
if %errorlevel% neq 0 (
    echo ERROR: Message Service build failed!
    pause
    exit /b 1
)
cd ..

echo.
echo [3/9] Building Analytics Service...
cd analytics-service
call mvn clean install -DskipTests
if %errorlevel% neq 0 (
    echo ERROR: Analytics Service build failed!
    pause
    exit /b 1
)
cd ..

echo.
echo [4/9] Building Genre Service...
cd genre-service
call mvn clean install -DskipTests
if %errorlevel% neq 0 (
    echo ERROR: Genre Service build failed!
    pause
    exit /b 1
)
cd ..

echo.
echo [5/9] Building Post Service...
cd post-service
call mvn clean install -DskipTests
if %errorlevel% neq 0 (
    echo ERROR: Post Service build failed!
    pause
    exit /b 1
)
cd ..

echo.
echo [6/9] Building Report Service...
cd report-service
call mvn clean install -DskipTests
if %errorlevel% neq 0 (
    echo ERROR: Report Service build failed!
    pause
    exit /b 1
)
cd ..

echo.
echo [7/9] Building Search Service...
cd search-service
call mvn clean install -DskipTests
if %errorlevel% neq 0 (
    echo ERROR: Search Service build failed!
    pause
    exit /b 1
)
cd ..

echo.
echo [8/9] Building Recommendation Service...
cd recommendation-service
call mvn clean install -DskipTests
if %errorlevel% neq 0 (
    echo ERROR: Recommendation Service build failed!
    pause
    exit /b 1
)
cd ..

echo.
echo [9/9] Building File Storage Service...
cd file-storage-service
call mvn clean install -DskipTests
if %errorlevel% neq 0 (
    echo ERROR: File Storage Service build failed!
    pause
    exit /b 1
)
cd ..

echo.
echo ====================================
echo ✅ ALL 9 SERVICES BUILT SUCCESSFULLY!
echo ====================================
echo.
pause
