# TEST PLAYLIST SERVICE APIs
# Port: 8084
# Endpoints: Create, Get, Update, Delete Playlist

$baseUrl = "http://localhost:8084"

Write-Host "=== PLAYLIST SERVICE API TESTS ===" -ForegroundColor Cyan
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
    "Content-Type" = "application/json"
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

# Test 2: Create Playlist
Write-Host "2. Testing Create Playlist..." -ForegroundColor Yellow
$createBody = @{
    name = "My Test Playlist $(Get-Random -Maximum 999)"
    description = "This is a test playlist"
    isPublic = $true
} | ConvertTo-Json

try {
    $playlist = Invoke-RestMethod -Uri "$baseUrl/api/playlists" `
        -Method POST `
        -Headers $headers `
        -Body $createBody `
        -ErrorAction Stop
    Write-Host "✅ Playlist created!" -ForegroundColor Green
    Write-Host "Playlist ID: $($playlist.id)" -ForegroundColor Cyan
    Write-Host "Name: $($playlist.name)" -ForegroundColor Cyan
    $global:testPlaylistId = $playlist.id
} catch {
    Write-Host "❌ Create playlist failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 3: Get My Playlists
Write-Host "3. Testing Get My Playlists..." -ForegroundColor Yellow
try {
    $playlists = Invoke-RestMethod -Uri "$baseUrl/api/playlists/my" `
        -Method GET `
        -Headers $headers `
        -ErrorAction Stop
    Write-Host "✅ Retrieved playlists!" -ForegroundColor Green
    Write-Host "Total: $($playlists.Count)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Get playlists failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 4: Get Playlist by ID
Write-Host "4. Testing Get Playlist by ID..." -ForegroundColor Yellow
if ($global:testPlaylistId) {
    try {
        $details = Invoke-RestMethod -Uri "$baseUrl/api/playlists/$($global:testPlaylistId)" `
            -Method GET `
            -Headers $headers `
            -ErrorAction Stop
        Write-Host "✅ Playlist details retrieved!" -ForegroundColor Green
        Write-Host "Name: $($details.name)" -ForegroundColor Cyan
        Write-Host "Songs: $($details.songCount)" -ForegroundColor Cyan
    } catch {
        Write-Host "❌ Get playlist failed: $($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "⚠️ Skipped (no playlist created)" -ForegroundColor Yellow
}
Write-Host ""

# Test 5: Update Playlist
Write-Host "5. Testing Update Playlist..." -ForegroundColor Yellow
if ($global:testPlaylistId) {
    $updateBody = @{
        name = "Updated Test Playlist"
        description = "This playlist has been updated"
        isPublic = $false
    } | ConvertTo-Json
    
    try {
        $updated = Invoke-RestMethod -Uri "$baseUrl/api/playlists/$($global:testPlaylistId)" `
            -Method PUT `
            -Headers $headers `
            -Body $updateBody `
            -ErrorAction Stop
        Write-Host "✅ Playlist updated!" -ForegroundColor Green
        Write-Host "New name: $($updated.name)" -ForegroundColor Cyan
    } catch {
        Write-Host "❌ Update playlist failed: $($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "⚠️ Skipped (no playlist created)" -ForegroundColor Yellow
}
Write-Host ""

Write-Host "=== PLAYLIST SERVICE TESTS COMPLETED ===" -ForegroundColor Cyan
