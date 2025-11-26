# TEST SOCIAL SERVICE APIs
# Port: 8083
# Endpoints: Follow, Unfollow, Get Followers, Get Following

$baseUrl = "http://localhost:8083"

Write-Host "=== SOCIAL SERVICE API TESTS ===" -ForegroundColor Cyan
Write-Host ""

# Prompt for JWT token
Write-Host "Enter JWT token (from user-service login):" -ForegroundColor Yellow
$token = Read-Host
if (-not $token) {
    Write-Host "❌ Token required! Run test-user-service.ps1 first." -ForegroundColor Red
    exit
}

$headers = @{
    "Authorization" = "Bearer $token"
}

# Test 1: Health Check
Write-Host "1. Testing Health Check..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "$baseUrl/actuator/health" -Method GET -ErrorAction Stop
    Write-Host "✅ Health: $($health.status)" -ForegroundColor Green
} catch {
    Write-Host "❌ Health check failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 2: Get My Followers
Write-Host "2. Testing Get My Followers..." -ForegroundColor Yellow
try {
    $followers = Invoke-RestMethod -Uri "$baseUrl/api/social/followers" `
        -Method GET `
        -Headers $headers `
        -ErrorAction Stop
    Write-Host "✅ Retrieved followers!" -ForegroundColor Green
    Write-Host "Total followers: $($followers.Count)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Get followers failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 3: Get My Following
Write-Host "3. Testing Get My Following..." -ForegroundColor Yellow
try {
    $following = Invoke-RestMethod -Uri "$baseUrl/api/social/following" `
        -Method GET `
        -Headers $headers `
        -ErrorAction Stop
    Write-Host "✅ Retrieved following!" -ForegroundColor Green
    Write-Host "Total following: $($following.Count)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Get following failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 4: Follow a User
Write-Host "4. Testing Follow User..." -ForegroundColor Yellow
Write-Host "Enter user ID to follow (or press Enter to skip):" -ForegroundColor Yellow
$targetUserId = Read-Host
if ($targetUserId) {
    try {
        $followResult = Invoke-RestMethod -Uri "$baseUrl/api/social/follow/$targetUserId" `
            -Method POST `
            -Headers $headers `
            -ErrorAction Stop
        Write-Host "✅ Followed user!" -ForegroundColor Green
    } catch {
        Write-Host "❌ Follow failed: $($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "⚠️ Skipped" -ForegroundColor Yellow
}
Write-Host ""

# Test 5: Get Follow Stats
Write-Host "5. Testing Get Follow Stats..." -ForegroundColor Yellow
try {
    $stats = Invoke-RestMethod -Uri "$baseUrl/api/social/stats" `
        -Method GET `
        -Headers $headers `
        -ErrorAction Stop
    Write-Host "✅ Retrieved stats!" -ForegroundColor Green
    Write-Host "Followers: $($stats.followersCount)" -ForegroundColor Cyan
    Write-Host "Following: $($stats.followingCount)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Get stats failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

Write-Host "=== SOCIAL SERVICE TESTS COMPLETED ===" -ForegroundColor Cyan
