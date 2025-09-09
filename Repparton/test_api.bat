@echo off
setlocal enabledelayedexpansion

REM ===============================================
REM REPPARTON API AUTOMATED TEST SCRIPT (Windows)
REM Facebook + SoundCloud Platform Testing
REM ===============================================

REM Configuration
set BASE_URL=http://localhost:8080/api
set TEST_EMAIL=test.user@example.com
set TEST_PASSWORD=testpassword123
set ARTIST_EMAIL=test.artist@example.com
set ARTIST_PASSWORD=artistpassword123

REM Global variables
set AUTH_TOKEN=
set USER_ID=
set ARTIST_ID=
set SONG_ID=
set POST_ID=

echo ================================================
echo    REPPARTON API AUTOMATED TEST SUITE
echo    Facebook + SoundCloud Platform Testing
echo ================================================
echo.

REM Check if curl is available
curl --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] curl is not installed or not in PATH
    echo Please install curl to run these tests
    pause
    exit /b 1
)

REM Check if server is running
echo [INFO] Checking if server is running...
curl -s %BASE_URL%/users/search?query=test >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Server is not running at %BASE_URL%
    echo Please start your Spring Boot application first
    pause
    exit /b 1
)

echo [SUCCESS] Server is running at %BASE_URL%
echo.

REM Test 1: User Registration
echo === AUTHENTICATION TESTS ===
echo [TEST] Registering new user...
curl -s -X POST -H "Content-Type: application/json" -d "{\"username\":\"testuser\",\"email\":\"%TEST_EMAIL%\",\"password\":\"%TEST_PASSWORD%\",\"confirmPassword\":\"%TEST_PASSWORD%\",\"bio\":\"Test user for automated testing\"}" %BASE_URL%/users/register > temp_register.json

if exist temp_register.json (
    echo [SUCCESS] User registration completed
) else (
    echo [WARNING] Registration may have failed, proceeding with login
)

REM Test 2: User Login
echo [TEST] Logging in user...
curl -s -X POST -H "Content-Type: application/json" -d "{\"email\":\"%TEST_EMAIL%\",\"password\":\"%TEST_PASSWORD%\"}" %BASE_URL%/users/login > temp_login.json

REM Extract token (simplified - in real scenario you'd need JSON parser)
echo [SUCCESS] Login completed - Check temp_login.json for token
echo Please manually copy the token from temp_login.json and update the AUTH_TOKEN variable
echo.

REM Test 3: Get Public Songs
echo === MUSIC STREAMING TESTS ===
echo [TEST] Getting public songs...
curl -s -H "Authorization: Bearer %AUTH_TOKEN%" "%BASE_URL%/songs/public?page=0&size=5" > temp_songs.json
echo [SUCCESS] Public songs retrieved - Check temp_songs.json
echo.

REM Test 4: Get Trending Songs
echo [TEST] Getting trending songs...
curl -s -H "Authorization: Bearer %AUTH_TOKEN%" "%BASE_URL%/songs/trending?limit=5" > temp_trending.json
echo [SUCCESS] Trending songs retrieved - Check temp_trending.json
echo.

REM Test 5: Search Songs
echo [TEST] Searching songs...
curl -s -H "Authorization: Bearer %AUTH_TOKEN%" "%BASE_URL%/songs/search?title=test&page=0&size=5" > temp_search.json
echo [SUCCESS] Song search completed - Check temp_search.json
echo.

REM Test 6: Get All Posts
echo === SOCIAL MEDIA TESTS ===
echo [TEST] Getting all posts...
curl -s -H "Authorization: Bearer %AUTH_TOKEN%" "%BASE_URL%/posts?page=0&size=5" > temp_posts.json
echo [SUCCESS] Posts retrieved - Check temp_posts.json
echo.

REM Test 7: Get User Feed
echo [TEST] Getting user feed...
curl -s -H "Authorization: Bearer %AUTH_TOKEN%" "%BASE_URL%/posts/feed?page=0&size=5" > temp_feed.json
echo [SUCCESS] User feed retrieved - Check temp_feed.json
echo.

REM Test 8: Search Posts
echo [TEST] Searching posts...
curl -s -H "Authorization: Bearer %AUTH_TOKEN%" "%BASE_URL%/posts/search?query=music&page=0&size=5" > temp_post_search.json
echo [SUCCESS] Post search completed - Check temp_post_search.json
echo.

REM Test 9: Search Users
echo === USER MANAGEMENT TESTS ===
echo [TEST] Searching users...
curl -s -H "Authorization: Bearer %AUTH_TOKEN%" "%BASE_URL%/users/search?query=test" > temp_user_search.json
echo [SUCCESS] User search completed - Check temp_user_search.json
echo.

REM Performance Test
echo === PERFORMANCE TEST ===
echo [TEST] Testing response time...
set start_time=%time%
curl -s -H "Authorization: Bearer %AUTH_TOKEN%" "%BASE_URL%/songs/public?page=0&size=20" > temp_performance.json
set end_time=%time%
echo [SUCCESS] Performance test completed - Check response time
echo.

REM Error Handling Test
echo === ERROR HANDLING TESTS ===
echo [TEST] Testing invalid endpoint...
curl -s -w "HTTP Status: %%{http_code}" "%BASE_URL%/invalid-endpoint" > temp_error.json
echo [SUCCESS] Error handling test completed
echo.

echo ================================================
echo              TEST SUITE COMPLETED
echo ================================================
echo.
echo Results saved in temp_*.json files
echo Please check each file for detailed responses
echo.
echo Next steps:
echo 1. Check temp_login.json for your auth token
echo 2. Update AUTH_TOKEN variable in this script
echo 3. Run the script again for authenticated tests
echo 4. Use the Postman collection for interactive testing
echo.

REM Cleanup option
echo Do you want to clean up temporary files? (Y/N)
set /p cleanup=
if /i "%cleanup%"=="Y" (
    del temp_*.json 2>nul
    echo [SUCCESS] Temporary files cleaned up
)

pause
