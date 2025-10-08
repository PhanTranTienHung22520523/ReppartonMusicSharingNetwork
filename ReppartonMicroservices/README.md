# Repparton Microservices Architecture

## Overview
This project converts the monolithic Repparton application into a microservices architecture without Docker containerization.

## Architecture

### Core Services
- **API Gateway Service** (Port 8080) - Entry point and routing
- **Discovery Service** (Port 8761) - Service registration with Eureka

### Business Services
- **User Service** (Port 8081) - User management and authentication
- **Song Service** (Port 8082) - Song management and file uploads
- **Social Service** (Port 8083) - Social interactions (follows, likes, shares)
- **Playlist Service** (Port 8084) - Playlist management
- **Comment Service** (Port 8085) - Comment system
- **Notification Service** (Port 8086) - Real-time notifications
- **Event Service** (Port 8090) - Event processing and messaging

### New Services (Recently Added)
- **Story Service** (Port 8087) - Instagram-like stories feature ✅
- **Message Service** (Port 8088) - Direct messaging between users ✅
- **Analytics Service** (Port 8089) - Listen and search history tracking ✅
- **Genre Service** (Port 8090) - Music genre management ✅

## Technologies
- Spring Boot 3.5.3
- Spring Cloud 2023.0.0
- Java 17
- MongoDB (separate databases per service)
- Spring Cloud Gateway
- Eureka Service Discovery
- JWT Authentication

## Getting Started

### Prerequisites
- Java 17
- Maven 3.6+
- MongoDB running on localhost:27017

### Running the Services

1. **Start Discovery Service first:**
   ```bash
   cd discovery-service
   mvn spring-boot:run
   ```

2. **Start other services in any order:**
   ```bash
   cd user-service
   mvn spring-boot:run
   
   cd song-service
   mvn spring-boot:run
   
   # ... and so on
   ```

3. **Start API Gateway last:**
   ```bash
   cd api-gateway
   mvn spring-boot:run
   ```

### Service Ports
- Discovery Service: http://localhost:8761
- API Gateway: http://localhost:8080
- User Service: http://localhost:8081
- Song Service: http://localhost:8082
- Social Service: http://localhost:8083
- Playlist Service: http://localhost:8084
- Comment Service: http://localhost:8085
- Notification Service: http://localhost:8086

## Database Configuration
Each service uses its own MongoDB database:
- user-service: `repparton_users`
- song-service: `repparton_songs`
- social-service: `repparton_social`
- playlist-service: `repparton_playlists`
- comment-service: `repparton_comments`
- notification-service: `repparton_notifications`

## API Documentation
Each service exposes its own Swagger UI at `/swagger-ui.html`

## Testing
Use the provided test scripts in the `test-scripts/` directory to test individual services.
