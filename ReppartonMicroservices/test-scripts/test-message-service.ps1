# TEST MESSAGE SERVICE - Port 8088
# Tests direct messaging and conversations

$baseUrl = "http://localhost:8088"

Write-Host "=== MESSAGE SERVICE API TESTS ===" -ForegroundColor Cyan
Write-Host ""

# Test 1: Health Check
Write-Host "Test 1: Health Check" -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "$baseUrl/actuator/health" -Method GET -ErrorAction Stop
    Write-Host "✅ Service is healthy: $($health.status)" -ForegroundColor Green
} catch {
    Write-Host "❌ Health check failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Please start message-service first:" -ForegroundColor Yellow
    Write-Host "  cd ReppartonMicroservices\message-service" -ForegroundColor Cyan
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

# Test 2: Get My Conversations
Write-Host "Test 2: Get My Conversations" -ForegroundColor Yellow
try {
    $conversations = Invoke-RestMethod -Uri "$baseUrl/api/messages/conversations?page=0&size=10" `
        -Method GET `
        -Headers $headers `
        -ErrorAction Stop
    Write-Host "✅ Retrieved conversations successfully" -ForegroundColor Green
    Write-Host "   Total conversations: $($conversations.totalElements)" -ForegroundColor Cyan
    if ($conversations.content.Count -gt 0) {
        $global:conversationId = $conversations.content[0].id
    }
} catch {
    Write-Host "❌ Failed to get conversations: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 3: Send Message to Test User
Write-Host "Test 3: Send Message" -ForegroundColor Yellow
Write-Host "Enter recipient user ID (or press Enter to skip):" -ForegroundColor Yellow
$recipientId = Read-Host
if ($recipientId) {
    $sendMessageBody = @{
        recipientId = $recipientId
        content = "Test message sent at $(Get-Date -Format 'HH:mm:ss')"
        messageType = "TEXT"
    } | ConvertTo-Json

    try {
        $message = Invoke-RestMethod -Uri "$baseUrl/api/messages/send" `
            -Method POST `
            -Headers $headers `
            -ContentType "application/json" `
            -Body $sendMessageBody `
            -ErrorAction Stop
        Write-Host "✅ Message sent successfully" -ForegroundColor Green
        Write-Host "   Message ID: $($message.id)" -ForegroundColor Cyan
        $global:messageId = $message.id
        $global:conversationId = $message.conversationId
    } catch {
        Write-Host "❌ Failed to send message: $($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "⚠️  Skipped - No recipient ID provided" -ForegroundColor Yellow
}
Write-Host ""

# Test 4: Get Messages in Conversation
Write-Host "Test 4: Get Messages in Conversation" -ForegroundColor Yellow
if ($global:conversationId) {
    try {
        $messages = Invoke-RestMethod -Uri "$baseUrl/api/messages/conversation/$global:conversationId?page=0&size=20" `
            -Method GET `
            -Headers $headers `
            -ErrorAction Stop
        Write-Host "✅ Retrieved messages successfully" -ForegroundColor Green
        Write-Host "   Total messages: $($messages.totalElements)" -ForegroundColor Cyan
    } catch {
        Write-Host "❌ Failed to get messages: $($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "⚠️  Skipped - No conversation ID available" -ForegroundColor Yellow
}
Write-Host ""

# Test 5: Mark Conversation as Read
Write-Host "Test 5: Mark Conversation as Read" -ForegroundColor Yellow
if ($global:conversationId) {
    try {
        Invoke-RestMethod -Uri "$baseUrl/api/messages/conversation/$global:conversationId/read" `
            -Method PUT `
            -Headers $headers `
            -ErrorAction Stop
        Write-Host "✅ Marked conversation as read" -ForegroundColor Green
    } catch {
        Write-Host "❌ Failed to mark as read: $($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "⚠️  Skipped - No conversation ID available" -ForegroundColor Yellow
}
Write-Host ""

Write-Host "=== MESSAGE SERVICE TESTS COMPLETED ===" -ForegroundColor Cyan
