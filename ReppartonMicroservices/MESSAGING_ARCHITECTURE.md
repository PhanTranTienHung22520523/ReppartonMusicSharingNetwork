# Repparton Microservices with Messaging & Caching

## 🚀 Architecture Overview

### Core Services
- **Discovery Service** (Eureka) - Service registration and discovery
- **API Gateway** - Single entry point with JWT authentication
- **User Service** - User management and authentication
- **Song Service** - Music management and streaming
- **Social Service** - Social features and interactions
- **Playlist Service** - Playlist management
- **Comment Service** - Comments and reviews
- **Notification Service** - Real-time notifications
- **Event Service** - Event processing and messaging

### Infrastructure Services
- **Redis** - Distributed caching and session storage
- **RabbitMQ** - Message queue for async communication
- **Kafka** - Event streaming for analytics and real-time data
- **MongoDB Atlas** - Distributed database

## 🛠️ Installation Guide

### Prerequisites
- Java 17+
- Maven 3.6+
- Windows PowerShell (for setup scripts)

### Step 1: Setup Infrastructure Services

Run the infrastructure setup script:
```bash
cd ReppartonMicroservices
.\setup-infrastructure.bat
```

This will install and start:
- Redis Server (localhost:6379)
- RabbitMQ Server (localhost:5672)
- Kafka + Zookeeper (localhost:9092)

### Step 2: Build All Services

```bash
mvn clean install -DskipTests
```

### Step 3: Start All Services

```bash
.\start-all-services.bat
```

## 📊 Service Ports

| Service | Port | URL |
|---------|------|-----|
| Discovery Service | 8761 | http://localhost:8761 |
| API Gateway | 8080 | http://localhost:8080 |
| User Service | 8081 | http://localhost:8081 |
| Song Service | 8082 | http://localhost:8082 |
| Social Service | 8083 | http://localhost:8083 |
| Playlist Service | 8084 | http://localhost:8084 |
| Comment Service | 8085 | http://localhost:8085 |
| Notification Service | 8086 | http://localhost:8086 |
| Event Service | 8087 | http://localhost:8087 |

## 🔧 Infrastructure Services

| Service | Port | Management UI |
|---------|------|---------------|
| Redis | 6379 | - |
| RabbitMQ | 5672 | http://localhost:15672 |
| Kafka | 9092 | - |

## 📡 Event-Driven Architecture

### Message Flow

1. **User Registration Flow**:
   ```
   User registers → User Service → Event Service → RabbitMQ → Notification Service
                                              → Kafka → Analytics
   ```

2. **Song Play Flow**:
   ```
   Song played → Song Service → Event Service → RabbitMQ → Recommendation updates
                                            → Kafka → Analytics & Trending
                                            → Redis → Cache play counts
   ```

3. **Notification Flow**:
   ```
   Event triggered → Event Service → RabbitMQ → Notification Service → Push/Email
                                  → Kafka → Event logging
   ```

### Kafka Topics
- `user-events` - User-related events
- `song-events` - Music playback events
- `notification-events` - Notification events
- `analytics-events` - Analytics and reporting events

### RabbitMQ Queues
- `user.registered.queue` - New user registrations
- `song.played.queue` - Song playback events
- `notification.queue` - Notification delivery

## 🚀 API Testing

### 1. Health Check
```bash
curl http://localhost:8080/actuator/health
```

### 2. User Registration
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123",
    "displayName": "Test User"
  }'
```

### 3. Publish Event
```bash
curl -X POST http://localhost:8080/api/events/song/played \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "userId": "user123",
    "songId": "song456",
    "songTitle": "Test Song",
    "artistName": "Test Artist",
    "playCount": 1
  }'
```

### 4. Check Redis Cache
```bash
curl http://localhost:8080/api/events/cache/song-plays/song456 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🔍 Monitoring

### Service Discovery
- Eureka Dashboard: http://localhost:8761

### RabbitMQ Management
- URL: http://localhost:15672
- Username: guest
- Password: guest

### Service Health
- Gateway: http://localhost:8080/actuator/health
- Event Service: http://localhost:8087/api/events/health

## 📈 Performance Benefits

### With Redis Caching:
- **Faster data retrieval** - Cached user sessions and frequent data
- **Reduced database load** - Cache hit ratio improves performance
- **Distributed sessions** - Scalable across multiple instances

### With RabbitMQ:
- **Async processing** - Non-blocking service communication
- **Reliable delivery** - Message persistence and acknowledgments
- **Decoupled services** - Services can work independently

### With Kafka:
- **Real-time analytics** - Stream processing for insights
- **Event sourcing** - Complete audit trail of all events
- **High throughput** - Handle thousands of events per second

## 🛡️ Security

- **JWT Authentication** on all protected endpoints
- **CORS Configuration** for cross-origin requests
- **Service-to-service** communication through service discovery
- **Environment-based** configuration for sensitive data

## 🔧 Development

### Adding New Events

1. Create event class in `shared-common/src/main/java/com/DA2/shared/events/`
2. Add handler in `EventListener.java`
3. Add publisher method in `EventPublisherService.java`
4. Add REST endpoint in `EventController.java`

### Environment Variables

Each service uses `.env` files for configuration:
- Database connections
- Redis/RabbitMQ/Kafka settings
- JWT secrets
- Service ports

## 🐛 Troubleshooting

### Common Issues

1. **Services not registering with Eureka**
   - Check Discovery Service is running
   - Verify EUREKA_SERVER environment variable

2. **Redis/RabbitMQ/Kafka connection errors**
   - Ensure infrastructure services are running
   - Check ports are not occupied
   - Verify environment variables

3. **JWT Authentication issues**
   - Check JWT_SECRET is consistent across services
   - Verify token format and expiration

### Logs
Each service logs to console with detailed information about:
- Service startup
- Event processing
- Error handling
- Performance metrics
