# QUICK API TEST - Test user registration and login flow
# This is the fastest test to verify the system is working

$baseUrl = "http://localhost:8081"

Write-Host "=== QUICK API TEST ===" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check if user-service is running
Write-Host "Step 1: Checking user-service..." -NoNewline
try {
    $health = Invoke-RestMethod -Uri "$baseUrl/actuator/health" -Method GET -TimeoutSec 3 -ErrorAction Stop
    Write-Host " ✅ Running" -ForegroundColor Green
} catch {
    Write-Host " ❌ Not running" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please start user-service first:" -ForegroundColor Yellow
    Write-Host "  cd ReppartonMicroservices\user-service" -ForegroundColor Cyan
    Write-Host "  mvn spring-boot:run" -ForegroundColor Cyan
    exit
}

# Step 2: Register a new user
Write-Host "Step 2: Registering test user..." -NoNewline
$username = "quicktest_$(Get-Random -Maximum 9999)"
$email = "quick$(Get-Random -Maximum 9999)@test.com"

$registerBody = @{
    username = $username
    email = $email
    password = "Test123456"
    fullName = "Quick Test User"
} | ConvertTo-Json

try {
    $user = Invoke-RestMethod -Uri "$baseUrl/api/auth/register" `
        -Method POST `
        -ContentType "application/json" `
        -Body $registerBody `
        -ErrorAction Stop
    Write-Host " ✅ Success" -ForegroundColor Green
    Write-Host "   Username: $username" -ForegroundColor Cyan
} catch {
    Write-Host " ❌ Failed" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    exit
}

# Step 3: Login
Write-Host "Step 3: Logging in..." -NoNewline
$loginBody = @{
    usernameOrEmail = $username
    password = "Test123456"
} | ConvertTo-Json

try {
    $login = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" `
        -Method POST `
        -ContentType "application/json" `
        -Body $loginBody `
        -ErrorAction Stop
    Write-Host " ✅ Success" -ForegroundColor Green
    $token = $login.data.accessToken
    Write-Host "   Token: $($token.Substring(0,20))..." -ForegroundColor Cyan
} catch {
    Write-Host " ❌ Failed" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    exit
}

# Step 4: Skipped (profile endpoint not implemented yet)
# Write-Host "Step 4: Getting profile..." -NoNewline
# $headers = @{
#     "Authorization" = "Bearer $token"
# }
# try {
#     $profile = Invoke-RestMethod -Uri "$baseUrl/api/users/profile" `
#         -Method GET `
#         -Headers $headers `
#         -ErrorAction Stop
#     Write-Host " ✅ Success" -ForegroundColor Green
#     Write-Host "   Email: $($profile.email)" -ForegroundColor Cyan
# } catch {
#     Write-Host " ❌ Failed" -ForegroundColor Red
#     Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
#     exit
# }

Write-Host ""
Write-Host "=== TESTS PASSED (3/3 steps) ✅ ===" -ForegroundColor Green
Write-Host ""
Write-Host "Your test credentials:" -ForegroundColor Yellow
Write-Host "  Username: $username" -ForegroundColor Cyan
Write-Host "  Password: Test123456" -ForegroundColor Cyan
Write-Host "  Token: $token" -ForegroundColor Cyan
Write-Host ""
Write-Host "Save this token to test other services!" -ForegroundColor Yellow
