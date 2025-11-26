# TEST EVENT SERVICE - Port 8089
# Tests event streaming and real-time notifications

$baseUrl = "http://localhost:8089"

Write-Host "=== EVENT SERVICE API TESTS ===" -ForegroundColor Cyan
Write-Host ""

# Test 1: Health Check
Write-Host "Test 1: Health Check" -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "$baseUrl/actuator/health" -Method GET -ErrorAction Stop
    Write-Host "✅ Service is healthy: $($health.status)" -ForegroundColor Green
} catch {
    Write-Host "❌ Health check failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Please start event-service first:" -ForegroundColor Yellow
    Write-Host "  cd ReppartonMicroservices\event-service" -ForegroundColor Cyan
    Write-Host "  mvn spring-boot:run" -ForegroundColor Cyan
    exit
}
Write-Host ""

# Get JWT Token
Write-Host "Please enter JWT token (from user-service login):" -ForegroundColor Yellow
$token = Read-Host
$headers = @{
    "Authorization" = "Bearer $token"
}

# Test 2: Publish Test Event
Write-Host "Test 2: Publish Test Event" -ForegroundColor Yellow
$eventBody = @{
    eventType = "USER_ACTION"
    entityType = "TEST"
    entityId = "test-$(Get-Random -Maximum 9999)"
    userId = "test-user"
    data = @{
        action = "test"
        timestamp = (Get-Date).ToString("o")
    }
} | ConvertTo-Json

try {
    $event = Invoke-RestMethod -Uri "$baseUrl/api/events/publish" `
        -Method POST `
        -Headers $headers `
        -ContentType "application/json" `
        -Body $eventBody `
        -ErrorAction Stop
    Write-Host "✅ Event published successfully" -ForegroundColor Green
    Write-Host "   Event ID: $($event.id)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Failed to publish event: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 3: Get Event Statistics
Write-Host "Test 3: Get Event Statistics" -ForegroundColor Yellow
try {
    $stats = Invoke-RestMethod -Uri "$baseUrl/api/events/stats" `
        -Method GET `
        -Headers $headers `
        -ErrorAction Stop
    Write-Host "✅ Retrieved event statistics" -ForegroundColor Green
    Write-Host "   Total events: $($stats.totalEvents)" -ForegroundColor Cyan
    Write-Host "   Events today: $($stats.eventsToday)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Failed to get statistics: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 4: Get Recent Events
Write-Host "Test 4: Get Recent Events" -ForegroundColor Yellow
try {
    $events = Invoke-RestMethod -Uri "$baseUrl/api/events/recent?page=0&size=10" `
        -Method GET `
        -Headers $headers `
        -ErrorAction Stop
    Write-Host "✅ Retrieved recent events" -ForegroundColor Green
    Write-Host "   Events count: $($events.totalElements)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Failed to get events: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 5: Check Event Stream Connection
Write-Host "Test 5: Check SSE (Server-Sent Events) Endpoint" -ForegroundColor Yellow
Write-Host "Note: SSE requires WebSocket/streaming connection" -ForegroundColor Yellow
Write-Host "SSE endpoint available at: $baseUrl/api/events/stream" -ForegroundColor Cyan
Write-Host "⚠️  Cannot test SSE with REST client - requires special WebSocket client" -ForegroundColor Yellow
Write-Host ""

Write-Host "=== EVENT SERVICE TESTS COMPLETED ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Note: For full event streaming tests, use WebSocket client or frontend app" -ForegroundColor Yellow
