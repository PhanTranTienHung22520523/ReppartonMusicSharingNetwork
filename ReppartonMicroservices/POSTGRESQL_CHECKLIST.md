# ✅ POSTGRESQL SETUP CHECKLIST

## 📋 PRE-SETUP (5 phút)

- [ ] **Download PostgreSQL**
  - URL: https://www.enterprisedb.com/downloads/postgres-postgresql-downloads
  - Version: PostgreSQL 16.x (Windows x64)
  - File size: ~350MB

- [ ] **Install PostgreSQL**
  - Run installer
  - Password for postgres: `postgres123` ⚠️ **GHI NHỚ**
  - Port: `5432` (default)
  - Locale: Default

- [ ] **Add to PATH**
  - Add: `C:\Program Files\PostgreSQL\16\bin`
  - Restart PowerShell

- [ ] **Verify Installation**
  ```powershell
  psql --version
  # Expected: psql (PostgreSQL) 16.x
  ```

---

## 🗄️ DATABASE SETUP (3 phút)

- [ ] **Run Setup Script**
  ```powershell
  cd ReppartonMicroservices
  .\setup-postgresql.bat
  ```

- [ ] **Verify Databases Created**
  ```powershell
  psql -U postgres -c "\l"
  ```
  Expected databases:
  - ✅ repparton_users
  - ✅ repparton_songs
  - ✅ repparton_playlists
  - ✅ repparton_social
  - ✅ repparton_events

---

## 🔧 SERVICE MIGRATION (30-45 phút)

### **User Service (8081)**

- [ ] **Update pom.xml**
  ```xml
  <!-- Add PostgreSQL -->
  <dependency>
      <groupId>org.postgresql</groupId>
      <artifactId>postgresql</artifactId>
      <scope>runtime</scope>
  </dependency>
  <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-data-jpa</artifactId>
  </dependency>
  ```

- [ ] **Update application.yml**
  ```yaml
  spring:
    datasource:
      url: jdbc:postgresql://localhost:5432/repparton_users
      username: repparton
      password: repparton123
    jpa:
      hibernate:
        ddl-auto: update
      show-sql: true
  ```

- [ ] **Update User Entity**
  - Change `@Document` → `@Entity`
  - Add `@Table`, `@Id`, `@GeneratedValue`
  - Add indexes với `@Index`

- [ ] **Update UserRepository**
  - Extends `JpaRepository` thay vì `MongoRepository`

- [ ] **Build & Test**
  ```powershell
  cd user-service
  mvn clean install
  mvn spring-boot:run
  ```

- [ ] **Verify Tables Created**
  ```sql
  \c repparton_users
  \dt
  -- Expected: users, user_roles
  ```

### **Song Service (8082)**

- [ ] **Update pom.xml** (same as User Service)
- [ ] **Update application.yml**
  ```yaml
  spring:
    datasource:
      url: jdbc:postgresql://localhost:5432/repparton_songs
  ```
- [ ] **Update Song Entity** (`@Entity`, `@Table`)
- [ ] **Update SongRepository** (JpaRepository)
- [ ] **Build & Test**
- [ ] **Verify Tables**
  ```sql
  \c repparton_songs
  \dt
  -- Expected: songs
  ```

### **Playlist Service (8084)**

- [ ] **Update pom.xml**
- [ ] **Update application.yml**
  ```yaml
  spring:
    datasource:
      url: jdbc:postgresql://localhost:5432/repparton_playlists
  ```
- [ ] **Update Playlist Entity**
- [ ] **Build & Test**
- [ ] **Verify Tables**
  ```sql
  \c repparton_playlists
  \dt
  -- Expected: playlists, playlist_songs
  ```

### **Social Service (8083)**

- [ ] **Update pom.xml**
- [ ] **Update application.yml**
  ```yaml
  spring:
    datasource:
      url: jdbc:postgresql://localhost:5432/repparton_social
  ```
- [ ] **Update Entities** (Follow, Like, Share)
- [ ] **Build & Test**
- [ ] **Verify Tables**
  ```sql
  \c repparton_social
  \dt
  -- Expected: follows, likes, shares
  ```

---

## 🚀 START SERVICES (5 phút)

- [ ] **Start Infrastructure**
  ```powershell
  cd discovery-service
  start mvn spring-boot:run
  timeout /t 10
  
  cd api-gateway
  start mvn spring-boot:run
  timeout /t 10
  ```

- [ ] **Start Business Services**
  ```powershell
  cd user-service
  start mvn spring-boot:run
  
  cd song-service
  start mvn spring-boot:run
  
  cd playlist-service
  start mvn spring-boot:run
  
  cd social-service
  start mvn spring-boot:run
  ```

- [ ] **Check Service Health**
  ```powershell
  curl http://localhost:8081/actuator/health
  curl http://localhost:8082/actuator/health
  curl http://localhost:8084/actuator/health
  curl http://localhost:8083/actuator/health
  ```

---

## ✅ VERIFICATION (10 phút)

- [ ] **Run PostgreSQL Verification Script**
  ```powershell
  psql -U postgres -f verify-postgresql.sql > postgres-verification.txt
  ```

- [ ] **Check Tables Created**
  ```sql
  \c repparton_users
  \dt
  
  \c repparton_songs
  \dt
  
  \c repparton_playlists
  \dt
  
  \c repparton_social
  \dt
  ```

- [ ] **Check Indexes**
  ```sql
  \c repparton_users
  \di
  ```

---

## 📮 POSTMAN TESTING (15-20 phút)

### **Setup**

- [ ] **Import Collection**
  - File: `Repparton_PostgreSQL_Tests.postman_collection.json`
  - Import vào Postman

- [ ] **Set Environment**
  ```json
  {
    "base_url": "http://localhost:8080",
    "jwt_token": "",
    "user_id": "",
    "song_id": "",
    "playlist_id": ""
  }
  ```

### **Test Sequence**

- [ ] **1. Register User**
  - Request: `POST /api/auth/register`
  - Expected: 200 OK, user_id returned
  - Verify PostgreSQL:
    ```sql
    \c repparton_users
    SELECT * FROM users;
    ```

- [ ] **2. Login**
  - Request: `POST /api/auth/login`
  - Expected: 200 OK, JWT token returned
  - Save token to environment

- [ ] **3. Create Song**
  - Request: `POST /api/songs`
  - Expected: 200 OK, song_id returned
  - Verify PostgreSQL:
    ```sql
    \c repparton_songs
    SELECT * FROM songs;
    ```

- [ ] **4. Get All Songs**
  - Request: `GET /api/songs`
  - Expected: 200 OK, array of songs

- [ ] **5. Search Songs**
  - Request: `GET /api/songs/search?query=PostgreSQL`
  - Expected: 200 OK, filtered results

- [ ] **6. Create Playlist**
  - Request: `POST /api/playlists`
  - Expected: 200 OK, playlist_id returned
  - Verify PostgreSQL:
    ```sql
    \c repparton_playlists
    SELECT * FROM playlists;
    ```

- [ ] **7. Add Song to Playlist**
  - Request: `POST /api/playlists/{id}/songs/{songId}`
  - Expected: 200 OK
  - Verify PostgreSQL:
    ```sql
    \c repparton_playlists
    SELECT * FROM playlist_songs;
    ```

- [ ] **8. Like Song**
  - Request: `POST /api/social/like/song/{songId}`
  - Expected: 200 OK
  - Verify PostgreSQL:
    ```sql
    \c repparton_social
    SELECT * FROM likes WHERE target_type = 'SONG';
    ```

- [ ] **9. Follow User**
  - Request: `POST /api/social/follow/{userId}`
  - Expected: 200 OK
  - Verify PostgreSQL:
    ```sql
    \c repparton_social
    SELECT * FROM follows;
    ```

- [ ] **10. Get User Profile**
  - Request: `GET /api/users/{userId}`
  - Expected: 200 OK, user data

---

## 📊 DATA VERIFICATION (5 phút)

- [ ] **Count Records**
  ```sql
  -- Users
  \c repparton_users
  SELECT COUNT(*) FROM users;
  
  -- Songs
  \c repparton_songs
  SELECT COUNT(*) FROM songs;
  
  -- Playlists
  \c repparton_playlists
  SELECT COUNT(*) FROM playlists;
  
  -- Social
  \c repparton_social
  SELECT COUNT(*) FROM follows;
  SELECT COUNT(*) FROM likes;
  ```

- [ ] **Check Data Integrity**
  ```sql
  -- Songs have valid artist_id (from users)
  \c repparton_songs
  SELECT s.title, s.artist_id 
  FROM songs s 
  WHERE NOT EXISTS (
    SELECT 1 FROM repparton_users.users u 
    WHERE u.id = s.artist_id
  );
  -- Should return 0 rows
  ```

- [ ] **Check Indexes Performance**
  ```sql
  \c repparton_users
  EXPLAIN ANALYZE SELECT * FROM users WHERE username = 'testuser_pg';
  -- Should use index scan, not sequential scan
  ```

---

## 🎯 PERFORMANCE TESTING (Optional)

- [ ] **Load Test**
  - Use Postman Runner
  - Run "Bulk Create Songs" 100 times
  - Check response times

- [ ] **Database Performance**
  ```sql
  -- Check query performance
  \c repparton_songs
  EXPLAIN ANALYZE SELECT * FROM songs WHERE genre = 'Pop';
  
  -- Check table bloat
  SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename))
  FROM pg_tables
  WHERE schemaname = 'public';
  ```

---

## ✅ FINAL CHECKLIST

- [ ] All services running
- [ ] All databases created
- [ ] All tables created with correct schema
- [ ] All indexes created
- [ ] Postman tests passing (10/10)
- [ ] Data saved correctly in PostgreSQL
- [ ] No errors in service logs
- [ ] Health endpoints returning UP
- [ ] PostgreSQL connections working

---

## 📝 DOCUMENTATION

- [ ] Update `TIEN_DO_THUC_HIEN.md`
  - Mark "Database Migration" as complete
  - Update progress to 65%

- [ ] Document any issues encountered
- [ ] Take screenshots of:
  - PostgreSQL databases
  - Tables with data
  - Postman test results
  - Service health checks

---

## 🎉 SUCCESS CRITERIA

✅ **MIGRATION COMPLETE khi:**
1. 5 PostgreSQL databases created
2. All services start without errors
3. Tables auto-created by Hibernate
4. All 10 Postman tests pass
5. Data visible in PostgreSQL via psql
6. Indexes working correctly
7. Service health checks return UP

---

**Estimated Total Time:** 1-1.5 hours

**Difficulty:** Medium

**Status:** Ready to start ⏳

---

**Last Updated:** October 16, 2025  
**Author:** Phan Trần Tiến Hưng - 22520523
