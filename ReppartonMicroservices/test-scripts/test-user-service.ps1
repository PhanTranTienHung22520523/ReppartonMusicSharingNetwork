# TEST USER SERVICE APIs
# Port: 8081
# Endpoints: Register, Login, Profile, Follow

$baseUrl = "http://localhost:8081"

Write-Host "=== USER SERVICE API TESTS ===" -ForegroundColor Cyan
Write-Host ""

# Test 1: Health Check
Write-Host "1. Testing Health Check..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "$baseUrl/actuator/health" -Method GET -ErrorAction Stop
    Write-Host "✅ Health: $($health.status)" -ForegroundColor Green
} catch {
    Write-Host "❌ Health check failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 2: Register User
Write-Host "2. Testing User Registration..." -ForegroundColor Yellow
$registerBody = @{
    username = "testuser_$(Get-Random -Maximum 9999)"
    email = "test$(Get-Random -Maximum 9999)@example.com"
    password = "Test123456"
    fullName = "Test User"
} | ConvertTo-Json

try {
    $registerResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/register" `
        -Method POST `
        -ContentType "application/json" `
        -Body $registerBody `
        -ErrorAction Stop
    Write-Host "✅ Registration successful!" -ForegroundColor Green
    Write-Host "User ID: $($registerResponse.id)" -ForegroundColor Cyan
    Write-Host "Username: $($registerResponse.username)" -ForegroundColor Cyan
    $global:testUserId = $registerResponse.id
    $global:testUsername = $registerResponse.username
} catch {
    Write-Host "❌ Registration failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 3: Login
Write-Host "3. Testing User Login..." -ForegroundColor Yellow
$loginBody = @{
    usernameOrEmail = $global:testUsername
    password = "Test123456"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" `
        -Method POST `
        -ContentType "application/json" `
        -Body $loginBody `
        -ErrorAction Stop
    Write-Host "✅ Login successful!" -ForegroundColor Green
    Write-Host "Access Token: $($loginResponse.accessToken.Substring(0,20))..." -ForegroundColor Cyan
    $global:accessToken = $loginResponse.accessToken
} catch {
    Write-Host "❌ Login failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 4: Get Profile
Write-Host "4. Testing Get User Profile..." -ForegroundColor Yellow
if ($global:accessToken) {
    try {
        $headers = @{
            "Authorization" = "Bearer $($global:accessToken)"
        }
        $profile = Invoke-RestMethod -Uri "$baseUrl/api/users/profile" `
            -Method GET `
            -Headers $headers `
            -ErrorAction Stop
        Write-Host "✅ Profile retrieved!" -ForegroundColor Green
        Write-Host "Username: $($profile.username)" -ForegroundColor Cyan
        Write-Host "Email: $($profile.email)" -ForegroundColor Cyan
    } catch {
        Write-Host "❌ Get profile failed: $($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "⚠️ Skipped (no access token)" -ForegroundColor Yellow
}
Write-Host ""

# Test 5: Update Profile
Write-Host "5. Testing Update Profile..." -ForegroundColor Yellow
if ($global:accessToken) {
    $updateBody = @{
        fullName = "Updated Test User"
        bio = "This is my test bio"
    } | ConvertTo-Json
    
    try {
        $headers = @{
            "Authorization" = "Bearer $($global:accessToken)"
        }
        $updated = Invoke-RestMethod -Uri "$baseUrl/api/users/profile" `
            -Method PUT `
            -Headers $headers `
            -ContentType "application/json" `
            -Body $updateBody `
            -ErrorAction Stop
        Write-Host "✅ Profile updated!" -ForegroundColor Green
        Write-Host "Full Name: $($updated.fullName)" -ForegroundColor Cyan
    } catch {
        Write-Host "❌ Update profile failed: $($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "⚠️ Skipped (no access token)" -ForegroundColor Yellow
}
Write-Host ""

Write-Host "=== USER SERVICE TESTS COMPLETED ===" -ForegroundColor Cyan
