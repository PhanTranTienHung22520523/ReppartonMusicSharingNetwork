#!/bin/bash

###############################################
### REPPARTON API AUTOMATED TEST SCRIPT
### Facebook + SoundCloud Platform Testing
###############################################

# Configuration
BASE_URL="http://localhost:8080/api"
TEST_EMAIL="test.user@example.com"
TEST_PASSWORD="testpassword123"
ARTIST_EMAIL="test.artist@example.com"
ARTIST_PASSWORD="artistpassword123"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Global variables
AUTH_TOKEN=""
USER_ID=""
ARTIST_ID=""
SONG_ID=""
POST_ID=""

# Helper functions
print_step() {
    echo -e "${BLUE}>>> $1${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# Test API endpoint
test_endpoint() {
    local method=$1
    local endpoint=$2
    local data=$3
    local expected_status=${4:-200}
    local description=$5

    print_step "Testing: $description"

    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" -H "Authorization: Bearer $AUTH_TOKEN" "$BASE_URL$endpoint")
    elif [ "$method" = "POST" ] && [ -n "$data" ]; then
        response=$(curl -s -w "\n%{http_code}" -X POST -H "Content-Type: application/json" -H "Authorization: Bearer $AUTH_TOKEN" -d "$data" "$BASE_URL$endpoint")
    elif [ "$method" = "PUT" ] && [ -n "$data" ]; then
        response=$(curl -s -w "\n%{http_code}" -X PUT -H "Content-Type: application/json" -H "Authorization: Bearer $AUTH_TOKEN" -d "$data" "$BASE_URL$endpoint")
    elif [ "$method" = "DELETE" ]; then
        response=$(curl -s -w "\n%{http_code}" -X DELETE -H "Authorization: Bearer $AUTH_TOKEN" "$BASE_URL$endpoint")
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" -H "Authorization: Bearer $AUTH_TOKEN" "$BASE_URL$endpoint")
    fi

    http_code=$(echo "$response" | tail -n1)
    response_body=$(echo "$response" | sed '$d')

    if [ "$http_code" -eq "$expected_status" ]; then
        print_success "$description - Status: $http_code"
        echo "$response_body" | jq . 2>/dev/null || echo "$response_body"
        return 0
    else
        print_error "$description - Expected: $expected_status, Got: $http_code"
        echo "$response_body"
        return 1
    fi
}

# Authentication tests
test_authentication() {
    print_step "=== AUTHENTICATION TESTS ==="

    # Register user
    register_data='{
        "username": "testuser",
        "email": "'$TEST_EMAIL'",
        "password": "'$TEST_PASSWORD'",
        "confirmPassword": "'$TEST_PASSWORD'",
        "bio": "Test user for automated testing"
    }'

    response=$(curl -s -w "\n%{http_code}" -X POST -H "Content-Type: application/json" -d "$register_data" "$BASE_URL/users/register")
    http_code=$(echo "$response" | tail -n1)

    if [ "$http_code" -eq 200 ]; then
        print_success "User registration successful"
        USER_ID=$(echo "$response" | sed '$d' | jq -r '.user.id' 2>/dev/null)
    else
        print_warning "User might already exist, proceeding with login"
    fi

    # Login user
    login_data='{
        "email": "'$TEST_EMAIL'",
        "password": "'$TEST_PASSWORD'"
    }'

    response=$(curl -s -w "\n%{http_code}" -X POST -H "Content-Type: application/json" -d "$login_data" "$BASE_URL/users/login")
    http_code=$(echo "$response" | tail -n1)
    response_body=$(echo "$response" | sed '$d')

    if [ "$http_code" -eq 200 ]; then
        AUTH_TOKEN=$(echo "$response_body" | jq -r '.token' 2>/dev/null)
        if [ -z "$USER_ID" ]; then
            USER_ID=$(echo "$response_body" | jq -r '.user.id' 2>/dev/null)
        fi
        print_success "Login successful - Token acquired"
    else
        print_error "Login failed"
        exit 1
    fi
}

# User management tests
test_user_management() {
    print_step "=== USER MANAGEMENT TESTS ==="

    # Get user profile
    test_endpoint "GET" "/users/$USER_ID/profile" "" 200 "Get user profile"

    # Update profile
    update_data='{
        "username": "testuser_updated",
        "bio": "Updated bio for testing"
    }'
    test_endpoint "PUT" "/users/$USER_ID/profile" "$update_data" 200 "Update user profile"

    # Apply to be artist
    test_endpoint "POST" "/users/$USER_ID/apply-artist" "" 200 "Apply to be artist"

    # Search users
    test_endpoint "GET" "/users/search?query=test" "" 200 "Search users"
}

# Song management tests
test_songs() {
    print_step "=== SONG MANAGEMENT TESTS ==="

    # Get public songs
    test_endpoint "GET" "/songs/public?page=0&size=5" "" 200 "Get public songs"

    # Get trending songs
    test_endpoint "GET" "/songs/trending?limit=5" "" 200 "Get trending songs"

    # Get recommendations
    test_endpoint "GET" "/songs/recommendations?limit=5" "" 200 "Get recommended songs"

    # Search songs
    test_endpoint "GET" "/songs/search?title=test&page=0&size=5" "" 200 "Search songs"
}

# Social media tests
test_social_features() {
    print_step "=== SOCIAL MEDIA TESTS ==="

    # Note: Creating posts with file upload requires multipart/form-data
    # This would need a more complex implementation for automated testing

    # Get all posts
    test_endpoint "GET" "/posts?page=0&size=5" "" 200 "Get all posts"

    # Get user feed
    test_endpoint "GET" "/posts/feed?page=0&size=5" "" 200 "Get user feed"

    # Get trending posts
    test_endpoint "GET" "/posts/trending?limit=5" "" 200 "Get trending posts"

    # Search posts
    test_endpoint "GET" "/posts/search?query=music&page=0&size=5" "" 200 "Search posts"
}

# Like system tests
test_likes() {
    print_step "=== LIKE SYSTEM TESTS ==="

    # These tests would need actual song/post IDs
    # For now, we'll test with placeholder IDs
    if [ -n "$SONG_ID" ]; then
        test_endpoint "POST" "/likes/song/$SONG_ID" "" 200 "Like song"
        test_endpoint "GET" "/likes/song/$SONG_ID/check" "" 200 "Check song like status"
    else
        print_warning "No song ID available for like tests"
    fi
}

# Follow system tests
test_follows() {
    print_step "=== FOLLOW SYSTEM TESTS ==="

    if [ -n "$ARTIST_ID" ] && [ "$ARTIST_ID" != "$USER_ID" ]; then
        test_endpoint "POST" "/follow/$ARTIST_ID" "" 200 "Follow user"
        test_endpoint "GET" "/follow/$ARTIST_ID/check" "" 200 "Check follow status"
        test_endpoint "DELETE" "/follow/$ARTIST_ID" "" 200 "Unfollow user"
    else
        print_warning "No artist ID available for follow tests"
    fi
}

# Performance test
test_performance() {
    print_step "=== PERFORMANCE TESTS ==="

    start_time=$(date +%s%N)
    test_endpoint "GET" "/songs/public?page=0&size=20" "" 200 "Performance test - Get songs"
    end_time=$(date +%s%N)

    duration=$((($end_time - $start_time) / 1000000))
    echo "Response time: ${duration}ms"

    if [ $duration -lt 1000 ]; then
        print_success "Performance test passed (< 1000ms)"
    else
        print_warning "Performance test slow (>= 1000ms)"
    fi
}

# Error handling tests
test_error_handling() {
    print_step "=== ERROR HANDLING TESTS ==="

    # Test invalid endpoints
    test_endpoint "GET" "/invalid-endpoint" "" 404 "Invalid endpoint test"

    # Test unauthorized access (without token)
    AUTH_TOKEN=""
    test_endpoint "GET" "/users/$USER_ID/profile" "" 401 "Unauthorized access test"

    # Restore token
    test_authentication
}

# Main test execution
main() {
    echo -e "${BLUE}"
    echo "=================================================="
    echo "    REPPARTON API AUTOMATED TEST SUITE"
    echo "    Facebook + SoundCloud Platform Testing"
    echo "=================================================="
    echo -e "${NC}"

    # Check if server is running
    if ! curl -s "$BASE_URL/users/search?query=test" > /dev/null 2>&1; then
        print_error "Server is not running at $BASE_URL"
        echo "Please start your Spring Boot application first."
        exit 1
    fi

    print_success "Server is running at $BASE_URL"

    # Run all tests
    test_authentication
    test_user_management
    test_songs
    test_social_features
    test_likes
    test_follows
    test_performance
    test_error_handling

    echo -e "${BLUE}"
    echo "=================================================="
    echo "              TEST SUITE COMPLETED"
    echo "=================================================="
    echo -e "${NC}"
}

# Run the main function
main "$@"
