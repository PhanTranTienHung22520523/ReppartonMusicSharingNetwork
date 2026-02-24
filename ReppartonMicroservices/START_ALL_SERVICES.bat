@echo off
setlocal EnableExtensions EnableDelayedExpansion
echo ========================================
echo Starting Repparton Microservices System
echo ========================================
echo.

echo [0/4] Installing shared-common (ensures latest shared security/config)...
cd shared-common
call mvn -DskipTests install
cd ..
echo.

REM Load environment variables from .env (so mvn spring-boot:run picks up MongoDB URIs, JWT, etc.)
if exist ".env" (
	echo Loading environment variables from .env...
	for /f "usebackq delims=" %%L in (".env") do (
		set "line=%%L"
		if not "!line!"=="" if not "!line:~0,1!"=="#" (
			for /f "tokens=1* delims==" %%A in ("!line!") do (
				if not "%%A"=="" set "%%A=%%B"
			)
		)
	)
) else (
	echo WARNING: .env not found. Services will use default config values.
)
echo.

echo [1/4] Starting Discovery Service (Port 8761)...
cd discovery-service
start "Discovery Service" cmd /k "mvn spring-boot:run"
cd ..
echo Waiting for Eureka to be ready (may take 15-60s)...
powershell -NoProfile -Command "for($i=0;$i -lt 60;$i++){ try { $r = Invoke-WebRequest -UseBasicParsing 'http://localhost:8761/eureka/apps' -TimeoutSec 2; if($r.StatusCode -eq 200){ Write-Host 'Eureka is ready.'; exit 0 } } catch {} ; Start-Sleep -Seconds 1 } ; Write-Host 'WARNING: Timed out waiting for Eureka. Continuing anyway.'; exit 0"

echo.
echo [2/4] Starting API Gateway (Port 8090)...
cd api-gateway
start "API Gateway" cmd /k "mvn spring-boot:run"
cd ..
timeout /t 8 /nobreak

echo.
echo [3/4] Starting Core Services...

echo   - User Service (Port 8081)...
cd user-service
start "User Service" cmd /k "mvn spring-boot:run"
cd ..
timeout /t 5 /nobreak

echo   - Song Service (Port 8082)...
cd song-service
start "Song Service" cmd /k "mvn spring-boot:run"
cd ..
timeout /t 5 /nobreak

echo   - Social Service (Port 8083)...
cd social-service
start "Social Service" cmd /k "mvn spring-boot:run"
cd ..
timeout /t 5 /nobreak

echo   - Playlist Service (Port 8084)...
cd playlist-service
start "Playlist Service" cmd /k "mvn spring-boot:run"
cd ..
timeout /t 5 /nobreak

echo   - Comment Service (Port 8085)...
cd comment-service
start "Comment Service" cmd /k "mvn spring-boot:run"
cd ..
timeout /t 5 /nobreak

echo   - Notification Service (Port 8086)...
cd notification-service
start "Notification Service" cmd /k "mvn spring-boot:run"
cd ..
timeout /t 5 /nobreak

echo   - Event Service (Port 8101)...
cd event-service
start "Event Service" cmd /k "mvn spring-boot:run"
cd ..
timeout /t 5 /nobreak

echo.
echo [4/4] Starting Additional Services...

echo   - Story Service (Port 8088)...
cd story-service
start "Story Service" cmd /k "mvn spring-boot:run"
cd ..
timeout /t 3 /nobreak

echo   - Message Service (Port 8089)...
cd message-service
start "Message Service" cmd /k "mvn spring-boot:run"
cd ..
timeout /t 3 /nobreak

echo   - Analytics Service (Port 8102)...
cd analytics-service
start "Analytics Service" cmd /k "mvn spring-boot:run"
cd ..
timeout /t 3 /nobreak

echo   - Genre Service (Port 8091)...
cd genre-service
start "Genre Service" cmd /k "mvn spring-boot:run"
cd ..
timeout /t 3 /nobreak

echo   - Post Service (Port 8092)...
cd post-service
start "Post Service" cmd /k "mvn spring-boot:run"
cd ..
timeout /t 3 /nobreak

echo Waiting for Post Service to be UP in Eureka (to avoid 503 on /api/posts/**)...
powershell -NoProfile -Command "for($i=0;$i -lt 60;$i++){ try { $r = Invoke-WebRequest -UseBasicParsing 'http://localhost:8761/eureka/apps/POST-SERVICE' -Headers @{Accept='application/json'} -TimeoutSec 2; if($r.StatusCode -eq 200 -and $r.Content -match '""status""\s*:\s*""UP""'){ Write-Host 'Post Service is UP in Eureka.'; exit 0 } } catch {} ; Start-Sleep -Seconds 2 } ; Write-Host 'WARNING: Timed out waiting for Post Service registration. You may see temporary 503s.'; exit 0"

echo   - Recommendation Service (Port 8093)...
cd recommendation-service
start "Recommendation Service" cmd /k "mvn spring-boot:run"
cd ..
timeout /t 3 /nobreak

echo   - Search Service (Port 8094)...
cd search-service
start "Search Service" cmd /k "mvn spring-boot:run"
cd ..
timeout /t 3 /nobreak

echo   - Report Service (Port 8095)...
cd report-service
start "Report Service" cmd /k "mvn spring-boot:run"
cd ..
timeout /t 3 /nobreak

echo   - File Storage Service (Port 8096)...
cd file-storage-service
start "File Storage Service" cmd /k "mvn spring-boot:run"
cd ..
timeout /t 3 /nobreak

echo   - AI Service (Port 5000 - Python Flask)...
cd ai-service
start "AI Service" cmd /k "venv\Scripts\activate && python src/app.py"
cd ..

echo.
echo ========================================
echo All services are starting!
echo ========================================
echo.
echo Infrastructure:
echo   - Eureka Dashboard: http://localhost:8761
echo   - API Gateway: http://localhost:8090
echo.
echo Core Services (8081-8087):
echo   - User Service: http://localhost:8081/api/auth/health
echo   - Song Service: http://localhost:8082/api/songs
echo   - Social Service: http://localhost:8083/api/social/health
echo   - Playlist Service: http://localhost:8084/api/playlists/health
echo   - Comment Service: http://localhost:8085/api/comments/health
echo   - Notification Service: http://localhost:8086/api/notifications/health
echo   - Event Service: http://localhost:8101/api/events/health
echo.
echo Additional Services (8088-8096):
echo   - Story Service: http://localhost:8088
echo   - Message Service: http://localhost:8089
echo   - Analytics Service: http://localhost:8102
echo   - Genre Service: http://localhost:8091
echo   - Post Service: http://localhost:8092
echo   - Recommendation Service: http://localhost:8093
echo   - Search Service: http://localhost:8094
echo   - Report Service: http://localhost:8095
echo   - File Storage Service: http://localhost:8096
echo.
echo AI Services:
echo   - AI Service (Python Flask): http://localhost:5000/health
echo   - AI Music Analysis: http://localhost:5000/api/ai/music/analyze
echo.
echo Note: Wait 2-3 minutes for all services to fully start
echo Check Eureka Dashboard to see registered services
echo.
pause
