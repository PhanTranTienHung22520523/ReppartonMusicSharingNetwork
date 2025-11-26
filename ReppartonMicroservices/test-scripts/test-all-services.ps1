# TEST ALL SERVICES - Quick Health Check
# Checks if all services are running and responsive

Write-Host "=== TESTING ALL MICROSERVICES ===" -ForegroundColor Cyan
Write-Host ""

$services = @(
    @{Name="Discovery Service"; Port=8761; Url="http://localhost:8761/actuator/health"},
    @{Name="API Gateway"; Port=8080; Url="http://localhost:8080/actuator/health"},
    @{Name="User Service"; Port=8081; Url="http://localhost:8081/actuator/health"},
    @{Name="Song Service"; Port=8082; Url="http://localhost:8082/actuator/health"},
    @{Name="Social Service"; Port=8083; Url="http://localhost:8083/actuator/health"},
    @{Name="Playlist Service"; Port=8084; Url="http://localhost:8084/actuator/health"},
    @{Name="Comment Service"; Port=8085; Url="http://localhost:8085/actuator/health"},
    @{Name="Notification Service"; Port=8086; Url="http://localhost:8086/actuator/health"},
    @{Name="Post Service"; Port=8087; Url="http://localhost:8087/actuator/health"},
    @{Name="Message Service"; Port=8088; Url="http://localhost:8088/actuator/health"},
    @{Name="Event Service"; Port=8089; Url="http://localhost:8089/actuator/health"}
)

$runningCount = 0
$totalCount = $services.Count

foreach ($service in $services) {
    Write-Host "Testing $($service.Name) (Port $($service.Port))..." -NoNewline
    
    try {
        $health = Invoke-RestMethod -Uri $service.Url -Method GET -TimeoutSec 3 -ErrorAction Stop
        if ($health.status -eq "UP") {
            Write-Host " ✅ UP" -ForegroundColor Green
            $runningCount++
        } else {
            Write-Host " ⚠️ $($health.status)" -ForegroundColor Yellow
        }
    } catch {
        Write-Host " ❌ DOWN" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "=== SUMMARY ===" -ForegroundColor Cyan
Write-Host "Running: $runningCount / $totalCount services" -ForegroundColor $(if($runningCount -eq $totalCount){"Green"}else{"Yellow"})
Write-Host ""

if ($runningCount -lt $totalCount) {
    Write-Host "⚠️ Some services are not running. Start them with:" -ForegroundColor Yellow
    Write-Host "  cd ReppartonMicroservices" -ForegroundColor Cyan
    Write-Host "  .\start-all-services.bat" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Or start individual services:" -ForegroundColor Yellow
    foreach ($service in $services) {
        try {
            $result = Test-NetConnection -ComputerName localhost -Port $service.Port -InformationLevel Quiet -WarningAction SilentlyContinue
            if (-not $result) {
                $serviceName = $service.Name.Replace(" Service", "").Replace(" ", "-").ToLower()
                Write-Host "  cd $serviceName; mvn spring-boot:run" -ForegroundColor Cyan
            }
        } catch {}
    }
}

Write-Host ""
Write-Host "To test individual services, run:" -ForegroundColor Yellow
Write-Host "  .\test-user-service.ps1" -ForegroundColor Cyan
Write-Host "  .\test-song-service.ps1" -ForegroundColor Cyan
Write-Host "  .\test-social-service.ps1" -ForegroundColor Cyan
Write-Host "  .\test-playlist-service.ps1" -ForegroundColor Cyan
