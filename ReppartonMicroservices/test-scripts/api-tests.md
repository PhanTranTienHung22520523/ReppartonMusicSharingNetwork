# Test Scripts for Microservices

## Authentication Tests

### Register new user
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User"
  }'
```

### Login
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "usernameOrEmail": "testuser",
    "password": "password123"
  }'
```

## Service Health Checks

### Check all services health
```bash
# Discovery Service
curl http://localhost:8761/actuator/health

# API Gateway
curl http://localhost:8080/actuator/health

# User Service
curl http://localhost:8081/actuator/health

# Song Service  
curl http://localhost:8082/actuator/health

# Social Service
curl http://localhost:8083/actuator/health

# Playlist Service
curl http://localhost:8084/actuator/health

# Comment Service
curl http://localhost:8085/actuator/health

# Notification Service
curl http://localhost:8086/actuator/health
```

## Service Discovery Tests

### List all registered services
```bash
curl http://localhost:8761/eureka/apps
```

### Check specific service registration
```bash
curl http://localhost:8761/eureka/apps/USER-SERVICE
curl http://localhost:8761/eureka/apps/SONG-SERVICE
```

## API Gateway Routing Tests

### Test routing to User Service
```bash
# Through API Gateway
curl http://localhost:8080/api/users/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Direct to User Service  
curl http://localhost:8081/api/users/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Test routing to Song Service
```bash
# Through API Gateway
curl http://localhost:8080/api/songs

# Direct to Song Service
curl http://localhost:8082/api/songs
```

## Load Testing

### Simple load test with multiple requests
```bash
# Windows PowerShell
for ($i=1; $i -le 10; $i++) {
    Invoke-RestMethod -Uri "http://localhost:8080/actuator/health" -Method GET
}
```

## Database Connectivity Tests

### Check MongoDB connections
```javascript
// In MongoDB shell
show dbs
use repparton_users
db.users.count()

use repparton_songs  
db.songs.count()

use repparton_social
db.follows.count()
```

## Performance Tests

### Response time test
```bash
# Measure response time
curl -w "@curl-format.txt" -o /dev/null -s http://localhost:8080/api/users/profile
```

Create `curl-format.txt`:
```
     time_namelookup:  %{time_namelookup}s\n
        time_connect:  %{time_connect}s\n
     time_appconnect:  %{time_appconnect}s\n
    time_pretransfer:  %{time_pretransfer}s\n
       time_redirect:  %{time_redirect}s\n
  time_starttransfer:  %{time_starttransfer}s\n
                     ----------\n
          time_total:  %{time_total}s\n
```
