@echo off
REM ================================================
REM POSTGRESQL QUICK SETUP SCRIPT
REM Repparton Microservices
REM ================================================

echo.
echo ================================================
echo POSTGRESQL SETUP FOR REPPARTON
echo ================================================
echo.

REM Check if PostgreSQL is installed
psql --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] PostgreSQL is not installed or not in PATH!
    echo.
    echo Please follow these steps:
    echo 1. Download PostgreSQL from: https://www.postgresql.org/download/windows/
    echo 2. Install PostgreSQL 16.x
    echo 3. Add PostgreSQL bin to PATH: C:\Program Files\PostgreSQL\16\bin
    echo 4. Restart PowerShell and run this script again
    echo.
    pause
    exit /b 1
)

echo [OK] PostgreSQL is installed
psql --version
echo.

REM Check if postgres user can connect
echo Checking PostgreSQL connection...
psql -U postgres -c "SELECT version();" >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARNING] Cannot connect to PostgreSQL
    echo Please ensure PostgreSQL service is running
    echo.
    pause
)

echo.
echo ================================================
echo STEP 1: CREATE REPPARTON USER
echo ================================================
echo.

echo Creating user 'repparton'...
psql -U postgres -c "CREATE USER repparton WITH PASSWORD 'repparton123';" 2>nul
psql -U postgres -c "ALTER USER repparton CREATEDB;"
psql -U postgres -c "ALTER USER repparton WITH SUPERUSER;"

echo [OK] User 'repparton' created/updated
echo.

echo.
echo ================================================
echo STEP 2: CREATE DATABASES
echo ================================================
echo.

echo Creating repparton_users...
psql -U postgres -c "DROP DATABASE IF EXISTS repparton_users;" 2>nul
psql -U postgres -c "CREATE DATABASE repparton_users;"
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE repparton_users TO repparton;"

echo Creating repparton_songs...
psql -U postgres -c "DROP DATABASE IF EXISTS repparton_songs;" 2>nul
psql -U postgres -c "CREATE DATABASE repparton_songs;"
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE repparton_songs TO repparton;"

echo Creating repparton_playlists...
psql -U postgres -c "DROP DATABASE IF EXISTS repparton_playlists;" 2>nul
psql -U postgres -c "CREATE DATABASE repparton_playlists;"
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE repparton_playlists TO repparton;"

echo Creating repparton_social...
psql -U postgres -c "DROP DATABASE IF EXISTS repparton_social;" 2>nul
psql -U postgres -c "CREATE DATABASE repparton_social;"
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE repparton_social TO repparton;"

echo Creating repparton_events...
psql -U postgres -c "DROP DATABASE IF EXISTS repparton_events;" 2>nul
psql -U postgres -c "CREATE DATABASE repparton_events;"
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE repparton_events TO repparton;"

echo.
echo [OK] All databases created
echo.

echo.
echo ================================================
echo STEP 3: VERIFY DATABASES
echo ================================================
echo.

psql -U postgres -c "SELECT datname FROM pg_database WHERE datname LIKE 'repparton%%' ORDER BY datname;"

echo.
echo ================================================
echo STEP 4: UPDATE SERVICE CONFIGURATIONS
echo ================================================
echo.

echo Updating User Service application.yml...
REM TODO: Add logic to update application.yml files

echo Updating Song Service application.yml...
REM TODO: Add logic to update application.yml files

echo.
echo [INFO] You need to manually update application.yml files for each service
echo See POSTGRESQL_SETUP_GUIDE.md for details
echo.

echo.
echo ================================================
echo SETUP COMPLETE!
echo ================================================
echo.
echo Databases created:
echo   - repparton_users (User Service - Port 8081)
echo   - repparton_songs (Song Service - Port 8082)
echo   - repparton_playlists (Playlist Service - Port 8084)
echo   - repparton_social (Social Service - Port 8083)
echo   - repparton_events (Event Service - Port 8090)
echo.
echo Database User: repparton
echo Database Password: repparton123
echo.
echo Next steps:
echo 1. Update application.yml in each service (see POSTGRESQL_SETUP_GUIDE.md)
echo 2. Add PostgreSQL dependencies to pom.xml
echo 3. Update Entity classes for JPA
echo 4. Build services: build-all.bat
echo 5. Start services: start-all-services.bat
echo 6. Verify tables: psql -U postgres -f verify-postgresql.sql
echo 7. Test APIs with Postman collection: Repparton_PostgreSQL_Tests.postman_collection.json
echo.
echo Documentation:
echo   - POSTGRESQL_SETUP_GUIDE.md (complete setup guide)
echo   - verify-postgresql.sql (verification script)
echo   - Repparton_PostgreSQL_Tests.postman_collection.json (API tests)
echo.
pause
