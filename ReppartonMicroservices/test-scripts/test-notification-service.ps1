# TEST NOTIFICATION SERVICE - Port 8086
# Tests notification retrieval, marking as read, and preferences

$baseUrl = "http://localhost:8086"

Write-Host "=== NOTIFICATION SERVICE API TESTS ===" -ForegroundColor Cyan
Write-Host ""

# Test 1: Health Check
Write-Host "Test 1: Health Check" -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "$baseUrl/actuator/health" -Method GET -ErrorAction Stop
    Write-Host "✅ Service is healthy: $($health.status)" -ForegroundColor Green
} catch {
    Write-Host "❌ Health check failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Please start notification-service first:" -ForegroundColor Yellow
    Write-Host "  cd ReppartonMicroservices\notification-service" -ForegroundColor Cyan
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

# Test 2: Get My Notifications
Write-Host "Test 2: Get My Notifications" -ForegroundColor Yellow
try {
    $notifications = Invoke-RestMethod -Uri "$baseUrl/api/notifications/my?page=0&size=10" `
        -Method GET `
        -Headers $headers `
        -ErrorAction Stop
    Write-Host "✅ Retrieved notifications successfully" -ForegroundColor Green
    Write-Host "   Total notifications: $($notifications.totalElements)" -ForegroundColor Cyan
    Write-Host "   Unread count: $($notifications.content | Where-Object { -not $_.read } | Measure-Object | Select-Object -ExpandProperty Count)" -ForegroundColor Cyan
    if ($notifications.content.Count -gt 0) {
        $global:notificationId = $notifications.content[0].id
    }
} catch {
    Write-Host "❌ Failed to get notifications: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 3: Get Unread Count
Write-Host "Test 3: Get Unread Notifications Count" -ForegroundColor Yellow
try {
    $unreadCount = Invoke-RestMethod -Uri "$baseUrl/api/notifications/unread-count" `
        -Method GET `
        -Headers $headers `
        -ErrorAction Stop
    Write-Host "✅ Retrieved unread count successfully" -ForegroundColor Green
    Write-Host "   Unread notifications: $unreadCount" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Failed to get unread count: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 4: Mark Notification as Read
Write-Host "Test 4: Mark Notification as Read" -ForegroundColor Yellow
if ($global:notificationId) {
    try {
        Invoke-RestMethod -Uri "$baseUrl/api/notifications/$global:notificationId/read" `
            -Method PUT `
            -Headers $headers `
            -ErrorAction Stop
        Write-Host "✅ Marked notification as read" -ForegroundColor Green
    } catch {
        Write-Host "❌ Failed to mark as read: $($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "⚠️  No notifications available to mark as read" -ForegroundColor Yellow
}
Write-Host ""

# Test 5: Mark All as Read
Write-Host "Test 5: Mark All Notifications as Read" -ForegroundColor Yellow
try {
    Invoke-RestMethod -Uri "$baseUrl/api/notifications/read-all" `
        -Method PUT `
        -Headers $headers `
        -ErrorAction Stop
    Write-Host "✅ Marked all notifications as read" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to mark all as read: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

Write-Host "=== NOTIFICATION SERVICE TESTS COMPLETED ===" -ForegroundColor Cyan
