# TEST SONG SERVICE APIs
# Port: 8082
# Endpoints: Create Song, Get Songs, Search, Like

$baseUrl = "http://localhost:8082"

Write-Host "=== SONG SERVICE API TESTS ===" -ForegroundColor Cyan
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

# Test 2: Get All Songs
Write-Host "2. Testing Get All Songs..." -ForegroundColor Yellow
try {
    $songs = Invoke-RestMethod -Uri "$baseUrl/api/songs?page=0&size=10" -Method GET -ErrorAction Stop
    Write-Host "✅ Retrieved songs!" -ForegroundColor Green
    Write-Host "Total songs: $($songs.totalElements)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Get songs failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 3: Search Songs
Write-Host "3. Testing Search Songs..." -ForegroundColor Yellow
try {
    $searchResults = Invoke-RestMethod -Uri "$baseUrl/api/songs/search?query=love&page=0&size=5" -Method GET -ErrorAction Stop
    Write-Host "✅ Search completed!" -ForegroundColor Green
    Write-Host "Found: $($searchResults.totalElements) songs" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Search failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 4: Get Songs by Genre
Write-Host "4. Testing Get Songs by Genre..." -ForegroundColor Yellow
try {
    $genreSongs = Invoke-RestMethod -Uri "$baseUrl/api/songs/genre/pop?page=0&size=5" -Method GET -ErrorAction Stop
    Write-Host "✅ Genre search completed!" -ForegroundColor Green
    Write-Host "Found: $($genreSongs.totalElements) pop songs" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Genre search failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 5: Get Trending Songs
Write-Host "5. Testing Get Trending Songs..." -ForegroundColor Yellow
try {
    $trending = Invoke-RestMethod -Uri "$baseUrl/api/songs/trending?limit=10" -Method GET -ErrorAction Stop
    Write-Host "✅ Trending songs retrieved!" -ForegroundColor Green
    Write-Host "Count: $($trending.Count)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Get trending failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

Write-Host "=== SONG SERVICE TESTS COMPLETED ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "NOTE: To test Create/Update/Delete, you need:" -ForegroundColor Yellow
Write-Host "  - Valid JWT token from user-service" -ForegroundColor Yellow
Write-Host "  - Run: .\test-user-service.ps1 first to get token" -ForegroundColor Yellow
