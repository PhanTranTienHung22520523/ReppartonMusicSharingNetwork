# HƯỚNG DẪN HOÀN THIỆN HỆ THỐNG MICROSERVICES

## 📊 TỔNG QUAN CÁC SERVICE ĐÃ TẠO

### ✅ Services đã hoàn thiện:
1. **Story Service** (Port 8087) - Hoàn chỉnh 100%
2. **Message Service** (Port 8088) - Hoàn chỉnh 100%

### 🔧 Services đã tạo cấu trúc (cần bổ sung code):
3. **Analytics Service** (Port 8089)
4. **Genre Service** (Port 8090)
5. **Post Service** (Port 8091)
6. **Report Service** (Port 8092)
7. **Search Service** (Port 8093)
8. **Recommendation Service** (Port 8094)
9. **File Storage Service** (Port 8095)

## 📁 CẤU TRÚC ĐÃ TẠO

Mỗi service đã có:
- ✅ pom.xml với đầy đủ dependencies
- ✅ Cấu trúc thư mục chuẩn
- ⏳ Cần bổ sung: Main Application, Config, Entities, Repositories, Services, Controllers

## 🚀 CÁC BƯỚC THỰC HIỆN

### Bước 1: Build các services đã hoàn thiện
```bash
cd ReppartonMicroservices
mvn clean install -DskipTests
```

### Bước 2: Khởi động MongoDB
Đảm bảo MongoDB đang chạy trên localhost:27017

### Bước 3: Khởi động các services cơ bản
```bash
# Terminal 1 - Discovery Service
cd discovery-service
mvn spring-boot:run

# Terminal 2 - API Gateway  
cd api-gateway
mvn spring-boot:run

# Terminal 3 - User Service
cd user-service
mvn spring-boot:run

# Terminal 4 - Song Service
cd song-service
mvn spring-boot:run
```

### Bước 4: Khởi động các services mới
```bash
# Terminal 5 - Story Service
cd story-service
mvn spring-boot:run

# Terminal 6 - Message Service
cd message-service
mvn spring-boot:run
```

## 📝 TEMPLATE CHO CÁC SERVICE CÒN THIẾU

### Analytics Service

#### 1. Main Application Class
```java
package com.DA2.analyticsservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableDiscoveryClient
@EnableFeignClients
@EnableCaching
@EnableScheduling
public class AnalyticsServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(AnalyticsServiceApplication.class, args);
    }
}
```

#### 2. application.yml
```yaml
spring:
  application:
    name: analytics-service
  data:
    mongodb:
      uri: mongodb://localhost:27017/analyticsdb
  cache:
    type: simple

server:
  port: 8089

eureka:
  client:
    service-url:
      defaultZone: http://localhost:8761/eureka/
    fetch-registry: true
    register-with-eureka: true
  instance:
    prefer-ip-address: true

logging:
  level:
    com.DA2.analyticsservice: DEBUG
```

#### 3. Entities

**ListenHistory.java:**
```java
package com.DA2.analyticsservice.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "listen_history")
public class ListenHistory {
    @Id
    private String id;
    private String userId;
    private String songId;
    private LocalDateTime createdAt;

    public ListenHistory() {
        this.createdAt = LocalDateTime.now();
    }

    public ListenHistory(String userId, String songId) {
        this.userId = userId;
        this.songId = songId;
        this.createdAt = LocalDateTime.now();
    }

    // Getters and Setters
    // ... (tự động generate bằng IDE)
}
```

**SearchHistory.java:**
```java
package com.DA2.analyticsservice.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "search_history")
public class SearchHistory {
    @Id
    private String id;
    private String userId;
    private String searchQuery;
    private LocalDateTime searchedAt;

    public SearchHistory() {
        this.searchedAt = LocalDateTime.now();
    }

    public SearchHistory(String userId, String searchQuery) {
        this.userId = userId;
        this.searchQuery = searchQuery;
        this.searchedAt = LocalDateTime.now();
    }

    // Getters and Setters
    // ... (tự động generate bằng IDE)
}
```

#### 4. Repositories

**ListenHistoryRepository.java:**
```java
package com.DA2.analyticsservice.repository;

import com.DA2.analyticsservice.entity.ListenHistory;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ListenHistoryRepository extends MongoRepository<ListenHistory, String> {
    List<ListenHistory> findByUserIdOrderByCreatedAtDesc(String userId);
    List<ListenHistory> findBySongId(String songId);
    
    @Query("{ 'createdAt': { $gte: ?0, $lte: ?1 } }")
    List<ListenHistory> findByDateRange(LocalDateTime start, LocalDateTime end);
    
    long countBySongId(String songId);
    long countByUserId(String userId);
}
```

**SearchHistoryRepository.java:**
```java
package com.DA2.analyticsservice.repository;

import com.DA2.analyticsservice.entity.SearchHistory;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface SearchHistoryRepository extends MongoRepository<SearchHistory, String> {
    List<SearchHistory> findByUserIdOrderBySearchedAtDesc(String userId);
    
    @Query("{ 'searchedAt': { $gte: ?0, $lte: ?1 } }")
    List<SearchHistory> findByDateRange(LocalDateTime start, LocalDateTime end);
    
    @Query("{ 'searchQuery': { $regex: ?0, $options: 'i' } }")
    List<SearchHistory> findByQueryContaining(String keyword);
}
```

#### 5. Services

**ListenHistoryService.java:**
```java
package com.DA2.analyticsservice.service;

import com.DA2.analyticsservice.entity.ListenHistory;
import com.DA2.analyticsservice.repository.ListenHistoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class ListenHistoryService {
    @Autowired
    private ListenHistoryRepository repository;

    public ListenHistory addListenHistory(String userId, String songId) {
        ListenHistory history = new ListenHistory(userId, songId);
        return repository.save(history);
    }

    public List<ListenHistory> getUserHistory(String userId) {
        return repository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public List<ListenHistory> getSongHistory(String songId) {
        return repository.findBySongId(songId);
    }

    public long getSongPlayCount(String songId) {
        return repository.countBySongId(songId);
    }

    public long getUserListenCount(String userId) {
        return repository.countByUserId(userId);
    }

    public List<ListenHistory> getHistoryByDateRange(LocalDateTime start, LocalDateTime end) {
        return repository.findByDateRange(start, end);
    }
}
```

**SearchHistoryService.java:**
```java
package com.DA2.analyticsservice.service;

import com.DA2.analyticsservice.entity.SearchHistory;
import com.DA2.analyticsservice.repository.SearchHistoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class SearchHistoryService {
    @Autowired
    private SearchHistoryRepository repository;

    public SearchHistory addSearchHistory(String userId, String query) {
        SearchHistory history = new SearchHistory(userId, query);
        return repository.save(history);
    }

    public List<SearchHistory> getUserSearchHistory(String userId) {
        return repository.findByUserIdOrderBySearchedAtDesc(userId);
    }

    public List<SearchHistory> getSearchesByDateRange(LocalDateTime start, LocalDateTime end) {
        return repository.findByDateRange(start, end);
    }

    public List<SearchHistory> findByKeyword(String keyword) {
        return repository.findByQueryContaining(keyword);
    }
}
```

#### 6. Controllers

**ListenHistoryController.java:**
```java
package com.DA2.analyticsservice.controller;

import com.DA2.analyticsservice.entity.ListenHistory;
import com.DA2.analyticsservice.service.ListenHistoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/analytics/listen-history")
@CrossOrigin(origins = "*")
public class ListenHistoryController {

    @Autowired
    private ListenHistoryService service;

    @PostMapping
    public ResponseEntity<ListenHistory> addHistory(@RequestParam String userId, 
                                                     @RequestParam String songId) {
        ListenHistory history = service.addListenHistory(userId, songId);
        return ResponseEntity.ok(history);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<ListenHistory>> getUserHistory(@PathVariable String userId) {
        return ResponseEntity.ok(service.getUserHistory(userId));
    }

    @GetMapping("/song/{songId}")
    public ResponseEntity<List<ListenHistory>> getSongHistory(@PathVariable String songId) {
        return ResponseEntity.ok(service.getSongHistory(songId));
    }

    @GetMapping("/song/{songId}/count")
    public ResponseEntity<Long> getSongPlayCount(@PathVariable String songId) {
        return ResponseEntity.ok(service.getSongPlayCount(songId));
    }

    @GetMapping("/user/{userId}/count")
    public ResponseEntity<Long> getUserListenCount(@PathVariable String userId) {
        return ResponseEntity.ok(service.getUserListenCount(userId));
    }
}
```

**SearchHistoryController.java:**
```java
package com.DA2.analyticsservice.controller;

import com.DA2.analyticsservice.entity.SearchHistory;
import com.DA2.analyticsservice.service.SearchHistoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/analytics/search-history")
@CrossOrigin(origins = "*")
public class SearchHistoryController {

    @Autowired
    private SearchHistoryService service;

    @PostMapping
    public ResponseEntity<SearchHistory> addHistory(@RequestParam String userId, 
                                                     @RequestParam String query) {
        SearchHistory history = service.addSearchHistory(userId, query);
        return ResponseEntity.ok(history);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<SearchHistory>> getUserSearchHistory(@PathVariable String userId) {
        return ResponseEntity.ok(service.getUserSearchHistory(userId));
    }

    @GetMapping("/search")
    public ResponseEntity<List<SearchHistory>> searchByKeyword(@RequestParam String keyword) {
        return ResponseEntity.ok(service.findByKeyword(keyword));
    }
}
```

**HealthController.java:**
```java
package com.DA2.analyticsservice.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/health")
public class HealthController {

    @GetMapping
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Analytics Service is running!");
    }
}
```

---

## 🎵 GENRE SERVICE - Template tương tự

Áp dụng cùng pattern cho Genre Service với:
- Entity: Genre (id, name, description)
- Repository: GenreRepository
- Service: GenreService (CRUD operations)
- Controller: GenreController (REST endpoints)

---

## 📝 POST SERVICE - Template tương tự

Áp dụng cùng pattern với:
- Entity: Post (id, userId, content, mediaUrl, mediaType, isPrivate, likes, shares, createdAt, updatedAt)
- Repository: PostRepository
- Service: PostService
- Controller: PostController

---

## ⚠️ REPORT SERVICE - Template tương tự

Áp dụng cùng pattern với:
- Entity: Report (id, reporterId, itemId, itemType, reason, status, createdAt)
- Repository: ReportRepository
- Service: ReportService
- Controller: ReportController

---

## 🔍 SEARCH SERVICE

Service này tổng hợp tìm kiếm từ nhiều service khác thông qua Feign Client.

---

## 🤖 RECOMMENDATION SERVICE

Service này phân tích dữ liệu từ Analytics Service để đưa ra gợi ý.

---

## ☁️ FILE STORAGE SERVICE

Service này tích hợp Cloudinary để upload/quản lý files.

---

## 📊 PORTS SUMMARY

| Service | Port | Database | Status |
|---------|------|----------|--------|
| Discovery Service | 8761 | - | ✅ Running |
| API Gateway | 8080 | - | ✅ Running |
| User Service | 8081 | userdb | ✅ Running |
| Song Service | 8082 | songdb | ✅ Running |
| Social Service | 8083 | socialdb | ✅ Running |
| Playlist Service | 8084 | playlistdb | ✅ Running |
| Comment Service | 8085 | commentdb | ✅ Running |
| Notification Service | 8086 | notificationdb | ✅ Running |
| Story Service | 8087 | storydb | ✅ Complete |
| Message Service | 8088 | messagedb | ✅ Complete |
| Analytics Service | 8089 | analyticsdb | 🔧 Template Ready |
| Genre Service | 8090 | genredb | 🔧 Template Ready |
| Post Service | 8091 | postdb | 🔧 Template Ready |
| Report Service | 8092 | reportdb | 🔧 Template Ready |
| Search Service | 8093 | searchdb | 🔧 Template Ready |
| Recommendation Service | 8094 | recommendationdb | 🔧 Template Ready |
| File Storage Service | 8095 | - | 🔧 Template Ready |

---

## 🎯 LƯU Ý QUAN TRỌNG

1. **Không sử dụng Docker**: Tất cả services chạy trực tiếp với Maven
2. **MongoDB**: Cần cài đặt và chạy local
3. **Dependencies**: Mỗi service độc lập với database riêng
4. **Service Discovery**: Tất cả đăng ký với Eureka
5. **API Gateway**: Entry point duy nhất cho frontend

---

## 🚀 CÁCH SỬ DỤNG NHANH

### Option 1: Sử dụng script đã tạo
```bash
start-extended-services.bat
```

### Option 2: Build từng service
```bash
cd analytics-service
mvn clean compile
mvn spring-boot:run
```

### Option 3: Build toàn bộ
```bash
mvn clean install -DskipTests
```

---

## 📞 TESTING

Test Story Service:
```bash
curl http://localhost:8087/api/health
```

Test Message Service:
```bash
curl http://localhost:8088/api/health
```

Test Analytics Service (sau khi tạo xong):
```bash
curl http://localhost:8089/api/health
```

---

**Lưu ý**: Document này cung cấp template đầy đủ để bạn có thể tạo các services còn lại theo cùng pattern đã được áp dụng cho Story và Message Service.