# 🚀 Repparton Microservices Setup Guide

## 📋 Setup Options

You have **3 options** to run the microservices system:

### Option 1: 🐳 Docker Setup (Recommended)
**Best for: Full-featured development & testing**

```bash
# Prerequisites: Docker Desktop installed
.\start-infrastructure-docker.bat
.\start-all-services.bat
```

**✅ Includes:**
- Redis for caching
- RabbitMQ for messaging  
- Kafka for event streaming
- All 9 microservices

### Option 2: 🛠️ Manual Setup
**Best for: Production-like environment**

```bash
.\setup-infrastructure-manual.bat
# Follow manual installation instructions
.\start-all-services.bat
```

**📝 Manual Installation Required:**
- Redis/Memurai
- RabbitMQ + Erlang
- Apache Kafka + Java

### Option 3: 💻 Development Mode (No Infrastructure)
**Best for: Quick testing & development**

```bash
.\start-services-dev-mode.bat
```

**✅ Features:**
- All core microservices
- In-memory caching
- Event logging (no external messaging)
- No external dependencies

---

## 🎯 Quick Start (Development Mode)

For immediate testing without infrastructure setup:

1. **Build the project:**
   ```bash
   mvn clean install -DskipTests
   ```

2. **Start development mode:**
   ```bash
   .\start-services-dev-mode.bat
   ```

3. **Test the system:**
   - Eureka: http://localhost:8761
   - API Gateway: http://localhost:8080
   - Health Check: http://localhost:8080/actuator/health

---

## 🌐 Service Architecture

### Core Services
| Service | Port | Description |
|---------|------|-------------|
| Discovery Service | 8761 | Service registry (Eureka) |
| API Gateway | 8080 | Entry point + Authentication |
| User Service | 8081 | User management |
| Song Service | 8082 | Music management |
| Social Service | 8083 | Social features |
| Playlist Service | 8084 | Playlist management |
| Comment Service | 8085 | Comments & reviews |
| Notification Service | 8086 | Notifications |
| Event Service | 8087 | Event processing (full mode only) |

### Infrastructure Services (Docker/Manual only)
| Service | Port | UI |
|---------|------|-----|
| Redis | 6379 | - |
| RabbitMQ | 5672 | http://localhost:15672 |
| Kafka | 9092 | http://localhost:8089 |

---

## 🧪 Testing the System

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

### 3. User Login
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "password123"
  }'
```

---

## 🔧 Configuration

### Environment Variables
Each service uses `.env` files for configuration:
- MongoDB Atlas connection
- JWT secrets
- External service URLs
- Port configurations

### Development vs Production
- **Development Mode**: Simplified setup, in-memory alternatives
- **Full Mode**: Complete infrastructure with Redis, RabbitMQ, Kafka

---

## 🐛 Troubleshooting

### Common Issues

1. **Port conflicts**: Check if ports 8080-8087 are available
2. **Java version**: Ensure Java 17+ is installed
3. **Maven issues**: Run `mvn clean install` first
4. **Docker issues**: Ensure Docker Desktop is running

### Getting Help

1. Check service logs in console windows
2. Check Eureka dashboard: http://localhost:8761
3. Verify service registration and health status

---

## 📚 Next Steps

1. **Start with Development Mode** for quick testing
2. **Upgrade to Docker Setup** for full features
3. **Check MESSAGING_ARCHITECTURE.md** for detailed documentation
4. **Explore the API** using the provided curl examples

---

**Happy coding! 🎵🎶**
