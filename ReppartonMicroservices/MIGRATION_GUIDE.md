# Hướng dẫn Migration từ Monolith sang Microservices

## Bước 1: Chuẩn bị môi trường

### Prerequisites
- Java 17
- Maven 3.6+
- MongoDB chạy trên localhost:27017
- Git (để quản lý source code)

### Cài đặt MongoDB
1. Tải và cài đặt MongoDB Community Edition
2. Khởi động MongoDB service:
   ```bash
   mongod --dbpath C:\data\db
   ```

## Bước 2: Clone và setup project mới

1. **Build tất cả services:**
   ```bash
   cd ReppartonMicroservices
   build-all.bat
   ```

2. **Khởi động các services:**
   ```bash
   start-all-services.bat
   ```

## Bước 3: Thứ tự khởi động services

**Quan trọng:** Phải khởi động theo thứ tự sau:

1. **Discovery Service** (8761) - Chờ 30 giây
2. **User Service** (8081)
3. **Song Service** (8082) 
4. **Social Service** (8083)
5. **Playlist Service** (8084)
6. **Comment Service** (8085)
7. **Notification Service** (8086)
8. **API Gateway** (8080) - Khởi động cuối cùng

## Bước 4: Migration Data

### Tạo các database mới:
```javascript
// Trong MongoDB shell
use repparton_users
use repparton_songs
use repparton_social
use repparton_playlists
use repparton_comments
use repparton_notifications
```

### Export/Import data từ monolith:
```bash
# Export từ database cũ
mongoexport --db repparton --collection users --out users.json
mongoexport --db repparton --collection songs --out songs.json
mongoexport --db repparton --collection playlists --out playlists.json

# Import vào database mới
mongoimport --db repparton_users --collection users --file users.json
mongoimport --db repparton_songs --collection songs --file songs.json
mongoimport --db repparton_playlists --collection playlists --file playlists.json
```

## Bước 5: Update Frontend

### Thay đổi API endpoints trong frontend:
```javascript
// Từ:
const API_BASE_URL = 'http://localhost:8080/api';

// Thành:
const API_BASE_URL = 'http://localhost:8080/api'; // Vẫn giữ nguyên, API Gateway sẽ route
```

### Endpoints vẫn giữ nguyên:
- `/api/auth/*` → User Service
- `/api/users/*` → User Service  
- `/api/songs/*` → Song Service
- `/api/social/*` → Social Service
- `/api/playlists/*` → Playlist Service
- `/api/comments/*` → Comment Service
- `/api/notifications/*` → Notification Service

## Bước 6: Testing Migration

### 1. Test service discovery:
```bash
curl http://localhost:8761/eureka/apps
```

### 2. Test API Gateway routing:
```bash
# Test user endpoints
curl http://localhost:8080/api/auth/login

# Test song endpoints  
curl http://localhost:8080/api/songs
```

### 3. Test individual services:
```bash
# Direct service calls
curl http://localhost:8081/api/users
curl http://localhost:8082/api/songs
```

## Bước 7: Monitoring và Troubleshooting

### Health Checks:
- Discovery Service: http://localhost:8761
- User Service: http://localhost:8081/actuator/health
- Song Service: http://localhost:8082/actuator/health
- API Gateway: http://localhost:8080/actuator/health

### Logs:
Mỗi service sẽ có log riêng trong terminal window của nó.

### Common Issues:

1. **Service không register với Eureka:**
   - Kiểm tra Discovery Service đã chạy chưa
   - Kiểm tra port conflicts

2. **API Gateway không route được:**
   - Kiểm tra services đã register với Eureka
   - Kiểm tra routes trong application.yml

3. **Database connection issues:**
   - Kiểm tra MongoDB đang chạy
   - Kiểm tra connection strings trong application.yml

## Bước 8: Rollback Plan

Nếu cần rollback về monolith:
1. Stop tất cả microservices
2. Start lại monolith application  
3. Update frontend API endpoint về monolith
4. Restore database nếu cần

## Lợi ích của Microservices Architecture

1. **Scalability:** Có thể scale từng service độc lập
2. **Technology Diversity:** Mỗi service có thể dùng tech stack khác nhau
3. **Fault Isolation:** Lỗi ở 1 service không ảnh hưởng toàn bộ system
4. **Team Independence:** Team có thể develop/deploy độc lập
5. **Database per Service:** Mỗi service có database riêng

## Next Steps

1. Implement Circuit Breaker pattern
2. Add distributed tracing
3. Implement API rate limiting
4. Add service mesh (Istio) 
5. Containerization với Docker (khi có thể)
6. Orchestration với Kubernetes
