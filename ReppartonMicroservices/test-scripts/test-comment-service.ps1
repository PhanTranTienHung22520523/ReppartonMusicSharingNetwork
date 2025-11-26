# TEST COMMENT SERVICE - Port 8085
# Tests comment creation, retrieval, update, and deletion

$baseUrl = "http://localhost:8085"

Write-Host "=== COMMENT SERVICE API TESTS ===" -ForegroundColor Cyan
Write-Host ""

# Test 1: Health Check
Write-Host "Test 1: Health Check" -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "$baseUrl/actuator/health" -Method GET -ErrorAction Stop
    Write-Host "✅ Service is healthy: $($health.status)" -ForegroundColor Green
} catch {
    Write-Host "❌ Health check failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Please start comment-service first:" -ForegroundColor Yellow
    Write-Host "  cd ReppartonMicroservices\comment-service" -ForegroundColor Cyan
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

# Test 2: Create Comment on Post
Write-Host "Test 2: Create Comment on Post" -ForegroundColor Yellow
$createCommentBody = @{
    entityId = "test-post-$(Get-Random -Maximum 9999)"
    entityType = "POST"
    content = "This is a test comment from API test"
    parentCommentId = $null
} | ConvertTo-Json

try {
    $comment = Invoke-RestMethod -Uri "$baseUrl/api/comments" `
        -Method POST `
        -Headers $headers `
        -ContentType "application/json" `
        -Body $createCommentBody `
        -ErrorAction Stop
    Write-Host "✅ Comment created successfully" -ForegroundColor Green
    Write-Host "   Comment ID: $($comment.id)" -ForegroundColor Cyan
    Write-Host "   Content: $($comment.content)" -ForegroundColor Cyan
    $global:commentId = $comment.id
} catch {
    Write-Host "❌ Failed to create comment: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 3: Get Comments for Entity
Write-Host "Test 3: Get Comments for Post" -ForegroundColor Yellow
if ($global:commentId) {
    try {
        $comments = Invoke-RestMethod -Uri "$baseUrl/api/comments/entity/POST/$($comment.entityId)?page=0&size=10" `
            -Method GET `
            -ErrorAction Stop
        Write-Host "✅ Retrieved comments successfully" -ForegroundColor Green
        Write-Host "   Total comments: $($comments.totalElements)" -ForegroundColor Cyan
    } catch {
        Write-Host "❌ Failed to get comments: $($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "⚠️  Skipped - No comment ID available" -ForegroundColor Yellow
}
Write-Host ""

# Test 4: Update Comment
Write-Host "Test 4: Update Comment" -ForegroundColor Yellow
if ($global:commentId) {
    $updateCommentBody = @{
        content = "Updated comment content - $(Get-Date -Format 'HH:mm:ss')"
    } | ConvertTo-Json

    try {
        $updated = Invoke-RestMethod -Uri "$baseUrl/api/comments/$global:commentId" `
            -Method PUT `
            -Headers $headers `
            -ContentType "application/json" `
            -Body $updateCommentBody `
            -ErrorAction Stop
        Write-Host "✅ Comment updated successfully" -ForegroundColor Green
        Write-Host "   New content: $($updated.content)" -ForegroundColor Cyan
    } catch {
        Write-Host "❌ Failed to update comment: $($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "⚠️  Skipped - No comment ID available" -ForegroundColor Yellow
}
Write-Host ""

# Test 5: Delete Comment
Write-Host "Test 5: Delete Comment" -ForegroundColor Yellow
if ($global:commentId) {
    try {
        Invoke-RestMethod -Uri "$baseUrl/api/comments/$global:commentId" `
            -Method DELETE `
            -Headers $headers `
            -ErrorAction Stop
        Write-Host "✅ Comment deleted successfully" -ForegroundColor Green
    } catch {
        Write-Host "❌ Failed to delete comment: $($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "⚠️  Skipped - No comment ID available" -ForegroundColor Yellow
}
Write-Host ""

Write-Host "=== COMMENT SERVICE TESTS COMPLETED ===" -ForegroundColor Cyan
