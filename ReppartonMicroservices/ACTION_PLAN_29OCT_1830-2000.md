# ⏱️ ACTION PLAN - 1.5 GIỜ SPRINT
**Ngày:** 29/10/2025 (Thứ 3)  
**Thời gian:** 18:30 - 20:00 (90 phút)  
**Mục tiêu:** Complete AI Integration + Start PostgreSQL Migration  
**Target:** Week 5-6 từ 65% → 85%

---

## 🎯 TIMELINE CHI TIẾT (PHÚT-BY-PHÚT)

### **18:30 - 18:35 (5 phút) - SETUP & PREP** ⚙️

**Actions:**
```powershell
# 1. Open VS Code (1 min)
cd C:\Users\phant\Downloads\DA2\ReppartonMicroservices

# 2. Check AI Service status (1 min)
netstat -ano | findstr :5000
# Nếu không chạy:
Start-Process python -ArgumentList "C:\Users\phant\Downloads\DA2\ReppartonMicroservices\ai-service\quick_test.py" -WindowStyle Minimized

# 3. Check MongoDB running (1 min)
Get-Service MongoDB*

# 4. Open Postman & load collection (1 min)

# 5. Review checklist này (1 min)
```

**Deliverables:**
- ✅ AI Service running on port 5000
- ✅ MongoDB running
- ✅ Postman ready
- ✅ VS Code open to project

---

### **18:35 - 18:50 (15 phút) - TEST AI-JAVA INTEGRATION** 🧪

#### **18:35 - 18:40 (5 min) - Start Services**
```powershell
# Terminal 1: Discovery Service
cd discovery-service
mvn spring-boot:run
# Wait for: "Tomcat started on port(s): 8761"

# Terminal 2 (after 30s): API Gateway
cd api-gateway
mvn spring-boot:run
# Wait for: "Tomcat started on port(s): 8080"

# Terminal 3 (after 30s): Song Service
cd song-service
mvn spring-boot:run
# Wait for: "Tomcat started on port(s): 8082"
```

**Success Check:**
- http://localhost:8761 - Eureka UP
- http://localhost:8080/actuator/health - Gateway UP
- http://localhost:5000/health - AI Service UP

#### **18:40 - 18:50 (10 min) - Postman Testing**

**Test Sequence:**
1. **Health Checks (2 min)**
   ```http
   GET http://localhost:5000/health
   Expected: {"status": "healthy"}
   
   GET http://localhost:5000/test
   Expected: {"flask_working": true}
   ```

2. **Create Song without AI (2 min)**
   ```http
   POST http://localhost:8080/api/songs
   Content-Type: application/json
   
   {
     "title": "Test Song AI Integration",
     "artist": "Test Artist",
     "genre": "Pop",
     "fileUrl": "https://example.com/test.mp3",
     "isPublic": true
   }
   ```
   **Expected:** Song created, AI analysis called (check logs)

3. **Verify in MongoDB (2 min)**
   ```javascript
   // MongoDB Compass or shell
   use repparton_songs
   db.songs.find({title: "Test Song AI Integration"}).pretty()
   
   // Check for AI fields:
   // - aiAnalysis.tempo
   // - aiAnalysis.key
   // - aiAnalysis.mood
   ```

4. **Check Logs (2 min)**
   ```
   Song Service logs should show:
   "Calling AI Service to analyze song"
   "AI Analysis successful"
   OR
   "AI Service is not available, using mock analysis"
   ```

5. **Screenshot Results (2 min)**
   - Postman response
   - MongoDB document
   - Service logs

**Deliverables:**
- ✅ Song created successfully
- ✅ AI integration tested (real or fallback)
- ✅ MongoDB has AI fields
- ✅ Screenshots saved

---

### **18:50 - 19:00 (10 phút) - INSTALL POSTGRESQL** 🐘

#### **Option A: PostgreSQL Already Installed** (2 min)
```powershell
# Check if installed
psql --version
# If shows version: SKIP to 19:00
```

#### **Option B: Quick Install** (10 min)
```powershell
# 1. Download (3 min)
# Open browser: https://www.enterprisedb.com/downloads/postgres-postgresql-downloads
# Download: postgresql-16.6-1-windows-x64.exe

# 2. Install (5 min)
# Run installer
# Password: postgres123
# Port: 5432
# Click Next → Next → Install

# 3. Add to PATH (1 min)
# Add: C:\Program Files\PostgreSQL\16\bin

# 4. Verify (1 min)
psql --version
```

**Success Check:**
```powershell
psql --version
# Expected: psql (PostgreSQL) 16.x
```

---

### **19:00 - 19:15 (15 phút) - CREATE POSTGRESQL DATABASES** 📊

#### **19:00 - 19:03 (3 min) - Create User & Databases**
```powershell
# 1. Connect as postgres
psql -U postgres
# Enter password: postgres123

# 2. Create repparton user
CREATE USER repparton WITH PASSWORD 'repparton123';
ALTER USER repparton CREATEDB;
ALTER USER repparton WITH SUPERUSER;

# 3. Create databases
CREATE DATABASE repparton_users;
CREATE DATABASE repparton_songs;
CREATE DATABASE repparton_playlists;
CREATE DATABASE repparton_social;

# 4. Grant permissions
GRANT ALL PRIVILEGES ON DATABASE repparton_users TO repparton;
GRANT ALL PRIVILEGES ON DATABASE repparton_songs TO repparton;
GRANT ALL PRIVILEGES ON DATABASE repparton_playlists TO repparton;
GRANT ALL PRIVILEGES ON DATABASE repparton_social TO repparton;

# 5. Verify
\l
# Should see 4 repparton_* databases

# 6. Exit
\q
```

**Success Check:**
```powershell
psql -U repparton -d repparton_users -c "SELECT version();"
# Should connect without error
```

#### **19:03 - 19:15 (12 min) - Update User Service for PostgreSQL**

**1. Update pom.xml (3 min)**
```powershell
cd user-service
# Open pom.xml in VS Code
```

Add dependencies:
```xml
<!-- Add BEFORE </dependencies> -->
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

**2. Update application.yml (3 min)**
```yaml
# Add AFTER spring.data.mongodb:

  # PostgreSQL Configuration
  datasource:
    url: jdbc:postgresql://localhost:5432/repparton_users
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

**3. Update User Entity (4 min)**
```java
// Change from:
@Document(collection = "users")
// To:
@Entity
@Table(name = "users")

// Change ID:
@Id
@GeneratedValue(strategy = GenerationType.UUID)
private String id;

// Add timestamps:
@PrePersist
protected void onCreate() {
    createdAt = LocalDateTime.now();
}

@PreUpdate
protected void onUpdate() {
    updatedAt = LocalDateTime.now();
}
```

**4. Build (2 min)**
```powershell
mvn clean install -DskipTests
```

**Success Check:**
```
[INFO] BUILD SUCCESS
```

**Deliverables:**
- ✅ PostgreSQL installed & running
- ✅ 4 databases created
- ✅ User Service updated for PostgreSQL
- ✅ Build successful

---

### **19:15 - 19:30 (15 phút) - TEST POSTGRESQL INTEGRATION** ✅

#### **19:15 - 19:20 (5 min) - Start User Service with PostgreSQL**
```powershell
# Stop old User Service (Ctrl+C in terminal)

# Start new one
cd user-service
mvn spring-boot:run

# Watch logs for:
# "HHH000204: Processing PersistenceUnitInfo [name: default]"
# "Hibernate: create table users (...)"
# "Tomcat started on port(s): 8081"
```

**Success Check:**
```sql
-- Connect to PostgreSQL
psql -U repparton -d repparton_users

-- Check tables created
\dt

-- Expected:
-- public | users      | table | repparton
-- public | user_roles | table | repparton
```

#### **19:20 - 19:30 (10 min) - Test User Registration**

**1. Register User (3 min)**
```http
POST http://localhost:8080/api/auth/register
Content-Type: application/json

{
  "username": "testuser_pg",
  "email": "test_pg@example.com",
  "password": "Test123!",
  "firstName": "PostgreSQL",
  "lastName": "Test"
}
```

**Expected Response:**
```json
{
  "id": "uuid-here",
  "username": "testuser_pg",
  "email": "test_pg@example.com",
  "message": "User registered successfully"
}
```

**2. Verify in PostgreSQL (2 min)**
```sql
psql -U repparton -d repparton_users

SELECT id, username, email, first_name, last_name, created_at 
FROM users 
WHERE username = 'testuser_pg';
```

**Expected:** User data visible in table

**3. Login Test (2 min)**
```http
POST http://localhost:8080/api/auth/login
Content-Type: application/json

{
  "usernameOrEmail": "testuser_pg",
  "password": "Test123!"
}
```

**Expected:** JWT token returned

**4. Get User Profile (2 min)**
```http
GET http://localhost:8080/api/users/{{user_id}}
Authorization: Bearer {{jwt_token}}
```

**Expected:** User profile returned from PostgreSQL

**5. Screenshot (1 min)**
- Postman responses
- PostgreSQL query results

**Deliverables:**
- ✅ User Service using PostgreSQL
- ✅ User registration working
- ✅ Login working
- ✅ Data in PostgreSQL verified
- ✅ Screenshots saved

---

### **19:30 - 19:50 (20 phút) - MIGRATE SONG SERVICE TO POSTGRESQL** 🎵

#### **19:30 - 19:35 (5 min) - Update Song Service Config**

**1. pom.xml** (Same as User Service)
```xml
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

**2. application.yml**
```yaml
spring:
  # Keep existing MongoDB config
  
  # Add PostgreSQL
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

#### **19:35 - 19:45 (10 min) - Update Song Entity**

**Changes needed:**
```java
// 1. Change annotation
@Entity
@Table(name = "songs")
// Remove: @Document

// 2. Add JPA annotations
@Id
@GeneratedValue(strategy = GenerationType.UUID)
private String id;

// 3. AI Analysis as embedded JSON (temporary)
@Column(name = "ai_analysis", columnDefinition = "TEXT")
private String aiAnalysisJson; // Store as JSON string

// Or separate columns:
@Column(name = "ai_tempo")
private Integer aiTempo;

@Column(name = "ai_key")
private String aiKey;

@Column(name = "ai_mood")
private String aiMood;

@Column(name = "ai_energy")
private Double aiEnergy;

// 4. Add lifecycle hooks
@PrePersist
protected void onCreate() {
    createdAt = LocalDateTime.now();
    updatedAt = LocalDateTime.now();
}
```

#### **19:45 - 19:50 (5 min) - Build & Start**
```powershell
cd song-service
mvn clean install -DskipTests

# Stop old Song Service
# Start new one
mvn spring-boot:run
```

**Success Check:**
```sql
psql -U repparton -d repparton_songs
\dt
-- Should see: songs table
```

**Deliverables:**
- ✅ Song Service using PostgreSQL
- ✅ Build successful
- ✅ Tables auto-created
- ✅ Service running

---

### **19:50 - 20:00 (10 phút) - FINAL TESTING & SUMMARY** 📋

#### **19:50 - 19:55 (5 min) - End-to-End Test**

**Complete User Journey:**
1. Register user (PostgreSQL) ✅
2. Login (get JWT) ✅
3. Create song (PostgreSQL + AI analysis) ✅
4. Get song (verify AI fields) ✅

**Quick Test:**
```http
# 1. Already have user from earlier
# 2. Already have JWT token

# 3. Create song
POST http://localhost:8080/api/songs
Authorization: Bearer {{jwt_token}}
Content-Type: application/json

{
  "title": "PostgreSQL AI Song",
  "artist": "Test Artist",
  "genre": "Electronic",
  "fileUrl": "https://example.com/test2.mp3",
  "isPublic": true
}

# 4. Verify in PostgreSQL
psql -U repparton -d repparton_songs
SELECT id, title, ai_tempo, ai_key, ai_mood, created_at FROM songs;
```

**Expected:**
- Song in PostgreSQL ✅
- AI fields populated ✅

#### **19:55 - 20:00 (5 min) - Update Progress & Commit**

**1. Update Progress Report (2 min)**
```markdown
# PROGRESS_REPORT_WEEK5-6.md

## Updated: 29/10/2025 19:55

### Completed Today (1.5 hours):
- ✅ AI-Java Integration Tested
- ✅ PostgreSQL Installed
- ✅ User Service → PostgreSQL (DONE)
- ✅ Song Service → PostgreSQL (DONE)
- ✅ End-to-end test successful

### Week 5-6 Progress:
- **Before:** 65%
- **After:** 85% (+20% in 90 minutes!)

### Services Migrated:
1. ✅ User Service (PostgreSQL)
2. ✅ Song Service (PostgreSQL + AI)
3. ⏳ Playlist Service (tomorrow)
4. ⏳ Social Service (tomorrow)
```

**2. Git Commit (2 min)**
```powershell
git add .
git commit -m "feat: AI-Java integration + PostgreSQL migration (User + Song services)"
git push origin master
```

**3. Screenshot Dashboard (1 min)**
- Services running
- PostgreSQL tables
- Test results

---

## 📊 EXPECTED DELIVERABLES (20:00)

### **Code Changes:**
- ✅ User Service: MongoDB → PostgreSQL
- ✅ Song Service: MongoDB → PostgreSQL + AI integration
- ✅ 2 services fully migrated

### **Infrastructure:**
- ✅ PostgreSQL 16 installed
- ✅ 4 databases created
- ✅ AI Service operational
- ✅ All services running

### **Testing:**
- ✅ 5+ API tests passed
- ✅ PostgreSQL data verified
- ✅ AI integration confirmed
- ✅ Screenshots saved

### **Progress:**
- **Week 5-6:** 65% → **85%** 🎯
- **Services migrated:** 2/4 (50%)
- **AI Integration:** 90% → 100%
- **PostgreSQL Migration:** 20% → 50%

---

## 🎯 SUCCESS METRICS

### **Must Have (Critical):**
- [x] AI Service running
- [x] PostgreSQL installed
- [x] User Service on PostgreSQL
- [x] Song Service on PostgreSQL
- [x] At least 1 end-to-end test passing

### **Should Have (Important):**
- [x] AI-Java integration tested
- [x] MongoDB → PostgreSQL migration working
- [x] Data verified in both databases
- [x] Code committed to Git

### **Nice to Have (Optional):**
- [ ] All 4 services migrated (only 2 required)
- [ ] Performance testing
- [ ] Documentation updated

---

## ⚠️ RISK MITIGATION

### **If PostgreSQL Install Takes >10 min:**
- Skip install, use MongoDB only
- Focus on AI testing
- Install PostgreSQL later

### **If Song Service Won't Build:**
- Keep MongoDB for Song Service
- Only migrate User Service
- Fix Song Service tomorrow

### **If Running Behind Schedule:**

**Priority 1 (Must do):**
1. AI-Java integration test (15 min)
2. PostgreSQL install (10 min)
3. User Service migration (15 min)
**Total: 40 minutes**

**Priority 2 (Should do):**
4. Song Service migration (20 min)
**Total: 60 minutes**

**Priority 3 (Nice to have):**
5. End-to-end testing (10 min)
6. Git commit (5 min)
**Total: 75 minutes**

---

## 📱 QUICK REFERENCE

### **Ports:**
- 8761: Discovery Service
- 8080: API Gateway
- 8081: User Service
- 8082: Song Service
- 5000: AI Service
- 5432: PostgreSQL
- 27017: MongoDB

### **Credentials:**
```
PostgreSQL:
  User: repparton
  Password: repparton123
  Databases: repparton_users, repparton_songs, repparton_playlists, repparton_social

MongoDB:
  URI: mongodb://localhost:27017
```

### **Commands Cheat Sheet:**
```powershell
# Check services
netstat -ano | findstr ":8080 :5000 :5432"

# PostgreSQL connect
psql -U repparton -d repparton_users

# PostgreSQL list tables
\dt

# MongoDB connect
mongosh
use repparton_songs
db.songs.find().pretty()

# Build service
mvn clean install -DskipTests

# Run service
mvn spring-boot:run
```

---

## 🎉 END STATE (20:00)

**Architecture:**
```
User Browser
     │
     ▼
API Gateway (8080)
     │
     ├─→ User Service (8081) ──→ PostgreSQL (repparton_users)
     │
     ├─→ Song Service (8082) ──→ PostgreSQL (repparton_songs)
     │                      └──→ AI Service (5000)
     │
     └─→ Other Services ──────→ MongoDB
```

**Progress:**
- Week 5-6: **85%** complete
- AI Integration: **100%** complete
- PostgreSQL Migration: **50%** complete (2/4 services)
- Overall Project: **60%** complete

**Status:** **ON TRACK** for Week 7-8 goals! 🚀

---

**Created:** October 28, 2025 - 22:40  
**For:** October 29, 2025 - 18:30-20:00  
**Author:** GitHub Copilot  
**Target:** Transform 1.5 hours into maximum productivity 💪
