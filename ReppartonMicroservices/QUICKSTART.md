# 🚀 QUICK START GUIDE - REPPARTON MICROSERVICES

## ✅ ĐÃ HOÀN THÀNH

Hệ thống microservices đã bổ sung thêm **4 services mới**:

1. **Story Service** (Port 8087) - Quản lý stories giống Instagram
2. **Message Service** (Port 8088) - Nhắn tin trực tiếp giữa users
3. **Analytics Service** (Port 8089) - Thống kê lượt nghe và tìm kiếm
4. **Genre Service** (Port 8090) - Quản lý thể loại nhạc

Tất cả đều **đã code đầy đủ và sẵn sàng chạy!**

---

## 📋 YÊU CẦU HỆ THỐNG

- ✅ Java 17
- ✅ Maven 3.6+
- ✅ MongoDB (running on localhost:27017)
- ✅ Windows (do sử dụng .bat scripts)

---

## 🎯 CÁCH CHẠY NHANH (3 BƯỚC)

### Bước 1: Đảm bảo MongoDB đang chạy
```bash
# Kiểm tra MongoDB
mongod --version

# Nếu chưa chạy, khởi động MongoDB
mongod
```

### Bước 2: Build tất cả services
```bash
cd C:\Users\phant\Downloads\DA2\ReppartonMicroservices
build-all-services.bat
```
⏱️ Thời gian: ~5-10 phút

### Bước 3: Khởi động tất cả services
```bash
start-extended-services.bat
```
⏱️ Thời gian: ~2-3 phút cho tất cả services khởi động

---

## 🧪 KIỂM TRA HỆ THỐNG

### Option 1: Dùng script tự động
```bash
test-new-services.bat
```

### Option 2: Kiểm tra thủ công

**Eureka Dashboard:**
```
http://localhost:8761
```
Xem tất cả services đã đăng ký

**Health Check từng service:**
```bash
curl http://localhost:8087/api/health  # Story Service
curl http://localhost:8088/api/health  # Message Service
curl http://localhost:8089/api/health  # Analytics Service
curl http://localhost:8090/api/health  # Genre Service
```

---

## 📊 DANH SÁCH TẤT CẢ SERVICES

| Service | Port | Status | Database |
|---------|------|--------|----------|
| Discovery Service | 8761 | ✅ Running | - |
| API Gateway | 8080 | ✅ Running | - |
| User Service | 8081 | ✅ Running | userdb |
| Song Service | 8082 | ✅ Running | songdb |
| Social Service | 8083 | ✅ Running | socialdb |
| Playlist Service | 8084 | ✅ Running | playlistdb |
| Comment Service | 8085 | ✅ Running | commentdb |
| Notification Service | 8086 | ✅ Running | notificationdb |
| **Story Service** | **8087** | **✅ NEW** | **storydb** |
| **Message Service** | **8088** | **✅ NEW** | **messagedb** |
| **Analytics Service** | **8089** | **✅ NEW** | **analyticsdb** |
| **Genre Service** | **8090** | **✅ NEW** | **genredb** |
| Event Service | 8091 | ✅ Running | eventdb |

---

## 📱 API EXAMPLES

### Story Service
```bash
# Tạo story mới
POST http://localhost:8087/api/stories
{
  "userId": "user123",
  "type": "TEXT",
  "content": "Hello World!",
  "isPrivate": false
}

# Lấy stories của user
GET http://localhost:8087/api/stories/user/user123

# Like story
POST http://localhost:8087/api/stories/{storyId}/like?userId=user456
```

### Message Service
```bash
# Gửi tin nhắn
POST http://localhost:8088/api/messages/send
{
  "senderId": "user1",
  "receiverId": "user2",
  "content": "Hi there!"
}

# Lấy conversations
GET http://localhost:8088/api/messages/user/user1/conversations
```

### Analytics Service
```bash
# Ghi lịch sử nghe nhạc
POST http://localhost:8089/api/analytics/listen-history?userId=user1&songId=song123

# Xem thống kê
GET http://localhost:8089/api/analytics/listen-history/song/song123/count
```

### Genre Service
```bash
# Tạo genre
POST http://localhost:8090/api/genres
{
  "name": "Pop",
  "description": "Popular music"
}

# Lấy tất cả genres
GET http://localhost:8090/api/genres
```

---

## 🔧 TROUBLESHOOTING

### Lỗi: Port already in use
**Giải pháp:**
```bash
# Kiểm tra process đang dùng port
netstat -ano | findstr :<PORT_NUMBER>

# Kill process
taskkill /PID <PID> /F
```

### Lỗi: MongoDB connection refused
**Giải pháp:**
```bash
# Khởi động MongoDB
mongod

# Hoặc start MongoDB service
net start MongoDB
```

### Lỗi: Service không đăng ký với Eureka
**Giải pháp:**
- Đợi 30-60 giây sau khi start service
- Kiểm tra Discovery Service đã chạy chưa
- Refresh Eureka Dashboard: http://localhost:8761

### Lỗi build
**Giải pháp:**
```bash
# Clean và build lại
mvn clean install -U -DskipTests

# Nếu vẫn lỗi, build từng module
cd shared-common
mvn clean install -DskipTests
cd ..
```

---

## 📁 CẤU TRÚC PROJECT

```
ReppartonMicroservices/
├── discovery-service/          # Eureka Server
├── api-gateway/                # API Gateway
├── shared-common/              # Shared utilities
├── user-service/               # User management
├── song-service/               # Song management
├── social-service/             # Social features
├── playlist-service/           # Playlist management
├── comment-service/            # Comments
├── notification-service/       # Notifications
├── event-service/              # Event processing
├── story-service/              # ✨ NEW - Stories
├── message-service/            # ✨ NEW - Messaging
├── analytics-service/          # ✨ NEW - Analytics
├── genre-service/              # ✨ NEW - Genres
├── build-all-services.bat      # Build script
├── start-extended-services.bat # Start script
├── test-new-services.bat       # Test script
└── README.md
```

---

## 📚 TÀI LIỆU THAM KHẢO

- 📄 **SERVICES_COMPLETION_STATUS.md** - Trạng thái chi tiết từng service
- 📄 **IMPLEMENTATION_GUIDE.md** - Hướng dẫn implementation cho services còn thiếu
- 📄 **MICROSERVICES_ARCHITECTURE.md** - Kiến trúc tổng quan
- 📄 **README.md** - Tài liệu chính

---

## 🎉 THÀNH CÔNG!

Nếu bạn thấy tất cả services xuất hiện trên Eureka Dashboard (http://localhost:8761), 
nghĩa là hệ thống đã chạy thành công! 🚀

### Các bước tiếp theo:
1. ✅ Tích hợp Frontend với các API mới
2. ✅ Test các tính năng mới
3. ✅ Deploy lên production (nếu cần)
4. 🔧 Hoàn thiện 5 services còn lại (Post, Report, Search, Recommendation, File Storage)

---

## 💡 MẸO HỮU ÍCH

### Start nhanh chỉ services mới
```bash
# Terminal 1
cd story-service && mvn spring-boot:run

# Terminal 2  
cd message-service && mvn spring-boot:run

# Terminal 3
cd analytics-service && mvn spring-boot:run

# Terminal 4
cd genre-service && mvn spring-boot:run
```

### Xem logs
```bash
# Logs được in ra terminal của từng service
# Hoặc check trong target/*.log files
```

### Stop tất cả services
```
Ctrl + C trong từng terminal
Hoặc đóng tất cả Command Prompt windows
```

---

## 📞 HỖ TRỢ

Nếu gặp vấn đề:
1. Kiểm tra MongoDB đang chạy
2. Kiểm tra các ports không bị conflict
3. Kiểm tra Java version (phải là 17)
4. Xem logs trong terminal của service bị lỗi
5. Tham khảo **SERVICES_COMPLETION_STATUS.md** để biết chi tiết

---

**Happy Coding! 🎵🎶**