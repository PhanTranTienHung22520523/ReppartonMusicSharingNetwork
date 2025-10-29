# 🐘 PostgreSQL Setup Guide - Repparton Microservices

## 📋 Mục lục
1. [Cài đặt PostgreSQL](#1-cài-đặt-postgresql)
2. [Cấu hình PostgreSQL](#2-cấu-hình-postgresql)
3. [Tạo Databases](#3-tạo-databases)
4. [Migration từ MongoDB sang PostgreSQL](#4-migration-từ-mongodb-sang-postgresql)
5. [Cập nhật Services](#5-cập-nhật-services)
6. [Test với Postman](#6-test-với-postman)

---

## 1. Cài đặt PostgreSQL

### Option 1: Cài PostgreSQL trực tiếp (Recommended)

#### Bước 1: Download PostgreSQL
```
URL: https://www.postgresql.org/download/windows/
Version: PostgreSQL 16.x (latest stable)
```

**Download link trực tiếp:**
- https://www.enterprisedb.com/downloads/postgres-postgresql-downloads

#### Bước 2: Cài đặt
1. Chạy file installer (postgresql-16.x-windows-x64.exe)
2. **Installation Directory:** `C:\Program Files\PostgreSQL\16`
3. **Components:** Chọn tất cả (PostgreSQL Server, pgAdmin 4, Command Line Tools)
4. **Data Directory:** `C:\Program Files\PostgreSQL\16\data`
5. **Password for postgres user:** Nhập password (ví dụ: `postgres123`)
   - ⚠️ **GHI NHỚ PASSWORD NÀY!**
6. **Port:** `5433` (default)
7. **Locale:** `Default locale`
8. Click **Next** → **Install** → **Finish**

#### Bước 3: Thêm PostgreSQL vào PATH
1. Mở **Environment Variables**
2. Thêm vào **Path**: `C:\Program Files\PostgreSQL\16\bin`
3. **Restart PowerShell**

#### Bước 4: Verify Installation
```powershell
psql --version
# Expected: psql (PostgreSQL) 16.x
```

### Option 2: Cài PostgreSQL qua Docker (Alternative)

```powershell
# Pull PostgreSQL image
docker pull postgres:16

# Run PostgreSQL container
docker run --name repparton-postgres `
  -e POSTGRES_PASSWORD=postgres123 `
  -e POSTGRES_USER=postgres `
  -p 5432:5432 `
  -d postgres:16

# Verify
docker ps
```

---

## 2. Cấu hình PostgreSQL

### Bước 1: Kết nối PostgreSQL
```powershell
# Connect với user postgres
psql -U postgres

# Hoặc với pgAdmin 4 (GUI)
# Start Menu → pgAdmin 4
```

### Bước 2: Tạo User cho Repparton
```sql
-- Tạo user repparton
CREATE USER repparton WITH PASSWORD 'repparton123';

-- Grant privileges
ALTER USER repparton CREATEDB;
ALTER USER repparton WITH SUPERUSER;

-- Verify
\du
```

### Bước 3: Cấu hình pg_hba.conf (nếu cần)
```powershell
# File location: C:\Program Files\PostgreSQL\16\data\pg_hba.conf

# Thêm dòng này để cho phép local connections:
# host    all             all             127.0.0.1/32            md5
# host    all             all             ::1/128                 md5
```

---

## 3. Tạo Databases

### Strategy: Hybrid Database Approach
- **PostgreSQL:** Dữ liệu quan hệ (Users, Songs metadata, Playlists)
- **MongoDB:** Dữ liệu phi cấu trúc (Comments, Messages, Logs, Analytics)

### Tạo PostgreSQL Databases

```sql
-- Connect as postgres user
psql -U postgres

-- Create databases
CREATE DATABASE repparton_users;
CREATE DATABASE repparton_songs;
CREATE DATABASE repparton_playlists;
CREATE DATABASE repparton_social;
CREATE DATABASE repparton_events;

-- Grant permissions to repparton user
GRANT ALL PRIVILEGES ON DATABASE repparton_users TO repparton;
GRANT ALL PRIVILEGES ON DATABASE repparton_songs TO repparton;
GRANT ALL PRIVILEGES ON DATABASE repparton_playlists TO repparton;
GRANT ALL PRIVILEGES ON DATABASE repparton_social TO repparton;
GRANT ALL PRIVILEGES ON DATABASE repparton_events TO repparton;

-- List databases
\l

-- Exit
\q
```

### MongoDB Databases (Keep existing)
```javascript
// MongoDB sẽ giữ cho các collection:
- repparton_comments (phi cấu trúc, nested comments)
- repparton_messages (real-time chat, high volume)
- repparton_notifications (temporary data)
- repparton_analytics (logs, metrics)
- repparton_stories (temporary content)
- repparton_posts (social media posts)
```

---

## 4. Migration từ MongoDB sang PostgreSQL

### 4.1. User Service Migration

#### Bước 1: Update pom.xml
```xml
<!-- Add PostgreSQL dependency -->
<dependency>
    <groupId>org.postgresql</groupId>
    <artifactId>postgresql</artifactId>
    <scope>runtime</scope>
</dependency>

<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-jpa</artifactId>
</dependency>

<!-- Keep MongoDB for some features -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-mongodb</artifactId>
</dependency>
```

#### Bước 2: Update application.yml
```yaml
spring:
  application:
    name: user-service
  
  # PostgreSQL Configuration
  datasource:
    url: jdbc:postgresql://localhost:5432/repparton_users
    username: repparton
    password: repparton123
    driver-class-name: org.postgresql.Driver
  
  jpa:
    hibernate:
      ddl-auto: update  # Create tables automatically
    show-sql: true
    properties:
      hibernate:
        dialect: org.hibernate.dialect.PostgreSQLDialect
        format_sql: true
    database-platform: org.hibernate.dialect.PostgreSQLDialect
  
  # MongoDB (for logs, sessions)
  data:
    mongodb:
      uri: mongodb://localhost:27017/repparton_users_logs
```

#### Bước 3: Update Entity (User.java)
```java
package com.DA2.userservice.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.Set;

@Entity
@Table(name = "users", indexes = {
    @Index(name = "idx_username", columnList = "username"),
    @Index(name = "idx_email", columnList = "email")
})
@Data
public class User {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", length = 36)
    private String id;
    
    @Column(nullable = false, unique = true, length = 50)
    private String username;
    
    @Column(nullable = false, unique = true, length = 100)
    private String email;
    
    @Column(nullable = false)
    private String password;
    
    @Column(name = "first_name", length = 50)
    private String firstName;
    
    @Column(name = "last_name", length = 50)
    private String lastName;
    
    @Column(length = 500)
    private String bio;
    
    @Column(name = "profile_image_url", length = 500)
    private String profileImageUrl;
    
    @Column(name = "cover_image_url", length = 500)
    private String coverImageUrl;
    
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "user_roles", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "role")
    private Set<String> roles;
    
    @Column(name = "is_verified")
    private Boolean isVerified = false;
    
    @Column(name = "is_artist")
    private Boolean isArtist = false;
    
    @Column(name = "artist_verification_status")
    private String artistVerificationStatus; // PENDING, APPROVED, REJECTED
    
    @Column(name = "followers_count")
    private Long followersCount = 0L;
    
    @Column(name = "following_count")
    private Long followingCount = 0L;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
```

#### Bước 4: Update Repository
```java
package com.DA2.userservice.repository;

import com.DA2.userservice.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, String> {
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    Optional<User> findByUsernameOrEmail(String username, String email);
    Boolean existsByUsername(String username);
    Boolean existsByEmail(String email);
}
```

### 4.2. Song Service Migration

#### application.yml
```yaml
spring:
  application:
    name: song-service
  
  datasource:
    url: jdbc:postgresql://localhost:5432/repparton_songs
    username: repparton
    password: repparton123
    driver-class-name: org.postgresql.Driver
  
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: true
    properties:
      hibernate:
        dialect: org.hibernate.dialect.PostgreSQLDialect
```

#### Song Entity
```java
@Entity
@Table(name = "songs", indexes = {
    @Index(name = "idx_title", columnList = "title"),
    @Index(name = "idx_artist_id", columnList = "artist_id"),
    @Index(name = "idx_genre", columnList = "genre")
})
@Data
public class Song {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    
    @Column(nullable = false, length = 200)
    private String title;
    
    @Column(name = "artist_id", nullable = false)
    private String artistId;
    
    @Column(name = "artist_name", length = 100)
    private String artistName;
    
    @Column(length = 100)
    private String album;
    
    @Column(length = 50)
    private String genre;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(name = "audio_url", length = 500)
    private String audioUrl;
    
    @Column(name = "cover_image_url", length = 500)
    private String coverImageUrl;
    
    @Column(name = "duration_seconds")
    private Integer durationSeconds;
    
    @Column(name = "file_size")
    private Long fileSize;
    
    // AI Analysis results
    @Column(name = "ai_tempo")
    private Double aiTempo;
    
    @Column(name = "ai_key", length = 10)
    private String aiKey;
    
    @Column(name = "ai_mood", length = 50)
    private String aiMood;
    
    @Column(name = "ai_energy")
    private Double aiEnergy;
    
    @Column(name = "ai_danceability")
    private Double aiDanceability;
    
    // Counters
    @Column(name = "play_count")
    private Long playCount = 0L;
    
    @Column(name = "like_count")
    private Long likeCount = 0L;
    
    @Column(name = "share_count")
    private Long shareCount = 0L;
    
    @Column(name = "is_public")
    private Boolean isPublic = true;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
```

### 4.3. Playlist Service Migration

#### application.yml
```yaml
spring:
  application:
    name: playlist-service
  
  datasource:
    url: jdbc:postgresql://localhost:5432/repparton_playlists
    username: repparton
    password: repparton123
    driver-class-name: org.postgresql.Driver
  
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: true
```

#### Playlist Entity
```java
@Entity
@Table(name = "playlists")
@Data
public class Playlist {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    
    @Column(nullable = false)
    private String name;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(name = "user_id", nullable = false)
    private String userId;
    
    @Column(name = "cover_image_url")
    private String coverImageUrl;
    
    @ElementCollection
    @CollectionTable(name = "playlist_songs", joinColumns = @JoinColumn(name = "playlist_id"))
    @Column(name = "song_id")
    @OrderColumn(name = "position")
    private List<String> songIds = new ArrayList<>();
    
    @Column(name = "is_public")
    private Boolean isPublic = true;
    
    @Column(name = "followers_count")
    private Long followersCount = 0L;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
```

### 4.4. Social Service Migration

#### application.yml
```yaml
spring:
  application:
    name: social-service
  
  datasource:
    url: jdbc:postgresql://localhost:5432/repparton_social
    username: repparton
    password: repparton123
```

#### Follow Entity
```java
@Entity
@Table(name = "follows", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"follower_id", "following_id"})
})
@Data
public class Follow {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    
    @Column(name = "follower_id", nullable = false)
    private String followerId;
    
    @Column(name = "following_id", nullable = false)
    private String followingId;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
}
```

#### Like Entity
```java
@Entity
@Table(name = "likes", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "target_type", "target_id"})
})
@Data
public class Like {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    
    @Column(name = "user_id", nullable = false)
    private String userId;
    
    @Column(name = "target_type", nullable = false)
    private String targetType; // SONG, POST, COMMENT
    
    @Column(name = "target_id", nullable = false)
    private String targetId;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
}
```

---

## 5. Cập nhật Services

### 5.1. Tạo Migration Script

Tạo file: `ReppartonMicroservices/migration-scripts/migrate-to-postgres.bat`

```batch
@echo off
echo ========================================
echo PostgreSQL Migration Script
echo ========================================
echo.

echo Step 1: Stopping all services...
call taskkill /F /IM java.exe /T 2>nul
timeout /t 3

echo.
echo Step 2: Creating PostgreSQL databases...
psql -U postgres -c "CREATE DATABASE repparton_users;"
psql -U postgres -c "CREATE DATABASE repparton_songs;"
psql -U postgres -c "CREATE DATABASE repparton_playlists;"
psql -U postgres -c "CREATE DATABASE repparton_social;"
psql -U postgres -c "CREATE DATABASE repparton_events;"

echo.
echo Step 3: Granting permissions...
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE repparton_users TO repparton;"
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE repparton_songs TO repparton;"
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE repparton_playlists TO repparton;"
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE repparton_social TO repparton;"
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE repparton_events TO repparton;"

echo.
echo Step 4: Building services with PostgreSQL support...
cd user-service
call mvn clean install -DskipTests
cd ..

cd song-service
call mvn clean install -DskipTests
cd ..

cd playlist-service
call mvn clean install -DskipTests
cd ..

cd social-service
call mvn clean install -DskipTests
cd ..

echo.
echo ========================================
echo Migration completed!
echo ========================================
echo.
echo Next steps:
echo 1. Start services: start-all-services.bat
echo 2. Services will auto-create tables
echo 3. Test with Postman
echo.
pause
```

### 5.2. Start Services với PostgreSQL

```batch
# Start infrastructure
cd discovery-service
start mvn spring-boot:run
timeout /t 10

cd api-gateway
start mvn spring-boot:run
timeout /t 10

# Start business services với PostgreSQL
cd user-service
start mvn spring-boot:run

cd song-service
start mvn spring-boot:run

cd playlist-service
start mvn spring-boot:run

cd social-service
start mvn spring-boot:run
```

---

## 6. Test với Postman

### 6.1. Verify PostgreSQL Tables Created

```sql
-- Connect to each database
\c repparton_users
\dt  -- List tables

\c repparton_songs
\dt

\c repparton_playlists
\dt

\c repparton_social
\dt
```

Expected tables:
- **repparton_users:** users, user_roles
- **repparton_songs:** songs
- **repparton_playlists:** playlists, playlist_songs
- **repparton_social:** follows, likes, shares

### 6.2. Postman Collection - PostgreSQL Testing

#### Collection: Repparton PostgreSQL Tests

**Environment Variables:**
```json
{
  "base_url": "http://localhost:8080",
  "jwt_token": ""
}
```

#### Test 1: Register User (PostgreSQL)
```http
POST {{base_url}}/api/auth/register
Content-Type: application/json

{
  "username": "testuser_pg",
  "email": "test_pg@example.com",
  "password": "password123",
  "firstName": "Test",
  "lastName": "PostgreSQL"
}
```

**Verify in PostgreSQL:**
```sql
\c repparton_users
SELECT * FROM users WHERE username = 'testuser_pg';
```

#### Test 2: Login (Get JWT)
```http
POST {{base_url}}/api/auth/login
Content-Type: application/json

{
  "usernameOrEmail": "testuser_pg",
  "password": "password123"
}
```

**Save JWT token to environment variable**

#### Test 3: Create Song (PostgreSQL)
```http
POST {{base_url}}/api/songs
Authorization: Bearer {{jwt_token}}
Content-Type: application/json

{
  "title": "PostgreSQL Test Song",
  "artistName": "Test Artist",
  "genre": "Pop",
  "description": "Testing PostgreSQL integration",
  "audioUrl": "https://example.com/song.mp3",
  "coverImageUrl": "https://example.com/cover.jpg",
  "durationSeconds": 180,
  "isPublic": true
}
```

**Verify in PostgreSQL:**
```sql
\c repparton_songs
SELECT id, title, artist_name, genre, created_at FROM songs;
```

#### Test 4: Create Playlist (PostgreSQL)
```http
POST {{base_url}}/api/playlists
Authorization: Bearer {{jwt_token}}
Content-Type: application/json

{
  "name": "My PostgreSQL Playlist",
  "description": "Testing playlist in PostgreSQL",
  "isPublic": true
}
```

**Verify:**
```sql
\c repparton_playlists
SELECT * FROM playlists;
```

#### Test 5: Add Song to Playlist
```http
POST {{base_url}}/api/playlists/{{playlist_id}}/songs/{{song_id}}
Authorization: Bearer {{jwt_token}}
```

**Verify:**
```sql
\c repparton_playlists
SELECT * FROM playlist_songs;
```

#### Test 6: Follow User (PostgreSQL)
```http
POST {{base_url}}/api/social/follow/{{user_id}}
Authorization: Bearer {{jwt_token}}
```

**Verify:**
```sql
\c repparton_social
SELECT * FROM follows;
```

#### Test 7: Like Song (PostgreSQL)
```http
POST {{base_url}}/api/social/like/song/{{song_id}}
Authorization: Bearer {{jwt_token}}
```

**Verify:**
```sql
\c repparton_social
SELECT * FROM likes WHERE target_type = 'SONG';
```

#### Test 8: Search Songs (PostgreSQL)
```http
GET {{base_url}}/api/songs/search?query=PostgreSQL
Authorization: Bearer {{jwt_token}}
```

#### Test 9: Get User Profile (PostgreSQL)
```http
GET {{base_url}}/api/users/{{user_id}}
Authorization: Bearer {{jwt_token}}
```

#### Test 10: Update User Profile (PostgreSQL)
```http
PUT {{base_url}}/api/users/{{user_id}}
Authorization: Bearer {{jwt_token}}
Content-Type: application/json

{
  "firstName": "Updated",
  "lastName": "User",
  "bio": "Testing PostgreSQL update"
}
```

**Verify:**
```sql
\c repparton_users
SELECT id, first_name, last_name, bio, updated_at FROM users;
```

### 6.3. Performance Testing

#### Test Concurrent Requests
```javascript
// Postman Pre-request Script
pm.sendRequest({
    url: pm.environment.get("base_url") + "/api/songs",
    method: 'GET',
    header: {
        'Authorization': 'Bearer ' + pm.environment.get("jwt_token")
    }
}, function (err, response) {
    console.log(response.json());
});
```

#### Test PostgreSQL Connection Pooling
```sql
-- Check active connections
SELECT count(*) FROM pg_stat_activity 
WHERE datname IN ('repparton_users', 'repparton_songs', 'repparton_playlists', 'repparton_social');
```

### 6.4. Integration Tests

#### Test Workflow: User Journey
1. **Register** → PostgreSQL users table
2. **Login** → JWT token
3. **Upload Song** → PostgreSQL songs table
4. **Create Playlist** → PostgreSQL playlists table
5. **Add Song to Playlist** → PostgreSQL playlist_songs table
6. **Like Song** → PostgreSQL likes table
7. **Follow Artist** → PostgreSQL follows table
8. **Search Songs** → PostgreSQL full-text search
9. **Get Recommendations** → Query from PostgreSQL + AI Service

---

## 7. Monitoring & Troubleshooting

### Check PostgreSQL Status
```powershell
# Windows Service
Get-Service postgresql*

# Connection test
psql -U postgres -c "SELECT version();"
```

### View Logs
```powershell
# PostgreSQL logs
Get-Content "C:\Program Files\PostgreSQL\16\data\log\*.log" -Tail 50
```

### Common Issues

#### Issue 1: Connection refused
```yaml
# Check application.yml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/repparton_users  # Check port
    username: repparton  # Check username
    password: repparton123  # Check password
```

#### Issue 2: Tables not created
```yaml
spring:
  jpa:
    hibernate:
      ddl-auto: update  # Change to 'create' for first run, then back to 'update'
```

#### Issue 3: Permission denied
```sql
-- Grant all permissions
GRANT ALL PRIVILEGES ON DATABASE repparton_users TO repparton;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO repparton;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO repparton;
```

---

## 8. Next Steps

### 8.1. Performance Optimization
- [ ] Add database indexes
- [ ] Configure connection pooling (HikariCP)
- [ ] Enable query caching
- [ ] Setup read replicas

### 8.2. Data Migration from MongoDB
- [ ] Export existing MongoDB data
- [ ] Transform to PostgreSQL format
- [ ] Import to PostgreSQL
- [ ] Verify data integrity

### 8.3. Hybrid Database Strategy
- [ ] Keep MongoDB for: Comments, Messages, Notifications, Analytics
- [ ] Use PostgreSQL for: Users, Songs, Playlists, Social
- [ ] Implement data sync mechanisms

### 8.4. Backup & Recovery
- [ ] Setup automatic backups
- [ ] Test restore procedures
- [ ] Configure point-in-time recovery

---

## 📚 Resources

- PostgreSQL Documentation: https://www.postgresql.org/docs/
- Spring Data JPA: https://spring.io/projects/spring-data-jpa
- pgAdmin 4: https://www.pgadmin.org/
- PostgreSQL Performance Tuning: https://wiki.postgresql.org/wiki/Performance_Optimization

---

**Created:** October 16, 2025  
**Author:** Phan Trần Tiến Hưng - 22520523  
**Project:** Repparton Music Sharing Network
