@echo off
echo ===========================================
echo  ENVIRONMENT VARIABLES VALIDATION SCRIPT
echo ===========================================
echo.

REM Check if .env file exists
if not exist ".env" (
    echo ERROR: .env file not found in current directory
    echo Please copy .env.template to .env and fill in the values
    pause
    exit /b 1
)

echo Checking required environment variables...
echo.

REM Required Variables Check
set MISSING_VARS=

REM Database Configuration
if "%MONGODB_URI%"=="" (
    set MISSING_VARS=%MISSING_VARS% MONGODB_URI
)

if "%POSTGRES_HOST%"=="" (
    set MISSING_VARS=%MISSING_VARS% POSTGRES_HOST
)

if "%POSTGRES_DB%"=="" (
    set MISSING_VARS=%MISSING_VARS% POSTGRES_DB
)

if "%POSTGRES_USER%"=="" (
    set MISSING_VARS=%MISSING_VARS% POSTGRES_USER
)

if "%POSTGRES_PASSWORD%"=="" (
    set MISSING_VARS=%MISSING_VARS% POSTGRES_PASSWORD
)

REM Security Configuration
if "%JWT_SECRET%"=="" (
    set MISSING_VARS=%MISSING_VARS% JWT_SECRET
)

REM Cloudinary Configuration
if "%CLOUDINARY_CLOUD_NAME%"=="" (
    set MISSING_VARS=%MISSING_VARS% CLOUDINARY_CLOUD_NAME
)

if "%CLOUDINARY_API_KEY%"=="" (
    set MISSING_VARS=%MISSING_VARS% CLOUDINARY_API_KEY
)

if "%CLOUDINARY_API_SECRET%"=="" (
    set MISSING_VARS=%MISSING_VARS% CLOUDINARY_API_SECRET
)

REM Service Discovery
if "%EUREKA_SERVER_URL%"=="" (
    set MISSING_VARS=%MISSING_VARS% EUREKA_SERVER_URL
)

REM Check for missing variables
if not "%MISSING_VARS%"=="" (
    echo ❌ MISSING REQUIRED VARIABLES:
    echo %MISSING_VARS%
    echo.
    echo Please set these variables in your .env file or environment
    echo.
    pause
    exit /b 1
)

echo ✅ All required variables are set!
echo.

REM Optional validations
echo Checking optional configurations...
echo.

REM JWT Secret length check
if defined JWT_SECRET (
    REM Get length of JWT_SECRET (approximate)
    set "JWT_LEN=0"
    set "JWT_STR=%JWT_SECRET%"
    for /l %%i in (0,1,100) do if defined JWT_STR (
        set "JWT_STR=!JWT_STR:~1!"
        set /a "JWT_LEN+=1"
    )
    if !JWT_LEN! lss 64 (
        echo ⚠️  WARNING: JWT_SECRET should be at least 64 characters (256-bit)
        echo Current length: !JWT_LEN!
    ) else (
        echo ✅ JWT_SECRET length is adequate
    )
)

REM Database connectivity check (if tools available)
where mongo >nul 2>&1
if %errorlevel% equ 0 (
    echo Testing MongoDB connection...
    mongo --eval "db.stats()" --quiet >nul 2>&1
    if %errorlevel% equ 0 (
        echo ✅ MongoDB connection successful
    ) else (
        echo ⚠️  MongoDB connection failed - check MONGODB_URI
    )
) else (
    echo ℹ️  MongoDB client not found - skipping connection test
)

REM PostgreSQL check (if psql available)
where psql >nul 2>&1
if %errorlevel% equ 0 (
    echo Testing PostgreSQL connection...
    echo SELECT 1; | psql -h %POSTGRES_HOST% -U %POSTGRES_USER% -d %POSTGRES_DB% -w >nul 2>&1
    if %errorlevel% equ 0 (
        echo ✅ PostgreSQL connection successful
    ) else (
        echo ⚠️  PostgreSQL connection failed - check POSTGRES_* variables
    )
) else (
    echo ℹ️  PostgreSQL client not found - skipping connection test
)

REM Cloudinary check (basic validation)
if defined CLOUDINARY_CLOUD_NAME (
    if "%CLOUDINARY_CLOUD_NAME%"=="your_cloudinary_cloud_name" (
        echo ⚠️  WARNING: CLOUDINARY_CLOUD_NAME is still default value
    ) else (
        echo ✅ CLOUDINARY_CLOUD_NAME is configured
    )
)

echo.
echo ===========================================
echo VALIDATION COMPLETE
echo ===========================================
echo.
echo If all checks passed, your environment is ready!
echo You can now start the services.
echo.
pause