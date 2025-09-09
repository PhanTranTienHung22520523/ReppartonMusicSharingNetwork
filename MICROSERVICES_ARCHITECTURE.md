# Microservices Architecture Design for Repparton

## Overview
Converting the current monolithic Spring Boot application to a microservices architecture.

## Current Monolithic Structure Analysis
- **Frontend**: React.js application
- **Backend**: Single Spring Boot application with all services
- **Database**: MongoDB (single database)

## Proposed Microservices Architecture

### 1. API Gateway Service
- **Purpose**: Entry point for all client requests, routing, authentication, rate limiting
- **Technology**: Spring Cloud Gateway
- **Port**: 8080
- **Responsibilities**:
  - Request routing to appropriate microservices
  - Authentication/Authorization (JWT validation)
  - Rate limiting
  - CORS handling
  - Request/Response logging

### 2. User Service
- **Purpose**: User management, authentication, profiles
- **Port**: 8081
- **Database**: MongoDB (users collection)
- **Endpoints**:
  - `/api/users/*` - User CRUD operations
  - `/api/auth/*` - Authentication (login, register, refresh)
  - `/api/profiles/*` - User profiles and settings

### 3. Song Service
- **Purpose**: Song management, uploads, metadata
- **Port**: 8082
- **Database**: MongoDB (songs collection)
- **External**: Cloudinary for file storage
- **Endpoints**:
  - `/api/songs/*` - Song CRUD operations
  - `/api/songs/upload` - Song uploads
  - `/api/songs/search` - Song search

### 4. Social Service
- **Purpose**: Social interactions (follows, likes, shares)
- **Port**: 8083
- **Database**: MongoDB (follows, likes, shares collections)
- **Endpoints**:
  - `/api/social/follow/*` - Follow/unfollow operations
  - `/api/social/like/*` - Like/unlike operations
  - `/api/social/share/*` - Share operations

### 5. Playlist Service
- **Purpose**: Playlist management
- **Port**: 8084
- **Database**: MongoDB (playlists collection)
- **Endpoints**:
  - `/api/playlists/*` - Playlist CRUD operations
  - `/api/playlists/{id}/songs` - Playlist song management

### 6. Comment Service
- **Purpose**: Comment system for songs, posts, playlists
- **Port**: 8085
- **Database**: MongoDB (comments collection)
- **Endpoints**:
  - `/api/comments/*` - Comment CRUD operations
  - `/api/comments/song/{id}` - Song comments
  - `/api/comments/playlist/{id}` - Playlist comments

### 7. Notification Service
- **Purpose**: Real-time notifications
- **Port**: 8086
- **Database**: MongoDB (notifications collection)
- **Technology**: WebSocket support
- **Endpoints**:
  - `/api/notifications/*` - Notification management
  - `/ws/notifications` - WebSocket endpoint

### 8. Discovery Service
- **Purpose**: Service registration and discovery
- **Technology**: Eureka Server
- **Port**: 8761

### 9. Config Service
- **Purpose**: Centralized configuration management
- **Technology**: Spring Cloud Config
- **Port**: 8888

## Service Communication
- **Synchronous**: REST APIs via API Gateway
- **Asynchronous**: RabbitMQ for event-driven communication
- **Service Discovery**: Eureka
- **Load Balancing**: Spring Cloud LoadBalancer

## Database Strategy
- **Per-Service Database**: Each service has its own MongoDB database
- **Shared Data**: Handle via API calls or events
- **Data Consistency**: Eventual consistency with compensation patterns

## Security
- **JWT**: Centralized authentication via User Service
- **API Gateway**: Token validation and routing
- **Service-to-Service**: Internal JWT or API keys

## Deployment
- **Containerization**: Docker containers for each service
- **Orchestration**: Docker Compose for development
- **Production**: Kubernetes (future consideration)

## Migration Strategy
1. **Phase 1**: Extract User Service and API Gateway
2. **Phase 2**: Extract Song Service and Social Service
3. **Phase 3**: Extract Playlist and Comment Services
4. **Phase 4**: Add Notification Service
5. **Phase 5**: Optimize and monitor

## Inter-Service Communication Patterns
- **User Service** → publishes events: UserCreated, UserUpdated
- **Song Service** → publishes events: SongUploaded, SongLiked
- **Social Service** → subscribes to: UserCreated, SongUploaded
- **Notification Service** → subscribes to: all events for notifications

## Development Environment Setup
- **Local Development**: Docker Compose
- **Service Ports**: 8080-8090 range
- **Database**: Separate MongoDB containers
- **Message Queue**: RabbitMQ container
