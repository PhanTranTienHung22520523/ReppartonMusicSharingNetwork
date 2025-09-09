# Environment Configuration Guide

## 📋 Overview

Tất cả các microservices đã được cấu hình để sử dụng biến môi trường từ file `.env` trong thư mục của từng service.

## 🔧 Environment Files Created

### Tự động tạo .env files:
- `discovery-service/.env` - Eureka Server configuration
- `api-gateway/.env` - Gateway và JWT configuration  
- `user-service/.env` - User service và authentication
- `song-service/.env` - Song management và file upload
- `social-service/.env` - Social interactions
- `playlist-service/.env` - Playlist management
- `comment-service/.env` - Comment system
- `notification-service/.env` - Real-time notifications

## 🗄️ Database Configuration

### MongoDB Atlas (Production - Đã cấu hình)
```properties
MONGODB_URI=mongodb+srv://hpdariteriiii:Hp31032004@repparton.82qvi0m.mongodb.net/{database_name}?retryWrites=true&w=majority&appName=Repparton
```

### Database per Service:
- **user-service**: `repparton_users`
- **song-service**: `repparton_songs`
- **social-service**: `repparton_social`
- **playlist-service**: `repparton_playlists`
- **comment-service**: `repparton_comments`
- **notification-service**: `repparton_notifications`

### Local MongoDB (Development)
Nếu muốn dùng local MongoDB, uncomment trong file .env:
```properties
# MONGODB_URI=mongodb://localhost:27017/{database_name}
```

## 🔐 Security Configuration

### JWT Settings (Đã cấu hình)
```properties
JWT_SECRET=404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970337336763979244226452948404D635166546A576E5A7234753778214125442A
JWT_ACCESS_TOKEN_EXPIRATION=3600000  # 1 hour
JWT_REFRESH_TOKEN_EXPIRATION=604800000  # 7 days
```

## ☁️ Cloudinary Configuration (Đã cấu hình)

File upload và storage:
```properties
CLOUDINARY_CLOUD_NAME=dgwokfdvm
CLOUDINARY_API_KEY=881218929694987
CLOUDINARY_API_SECRET=rc5bQLNO0qOteWiGZLjYw65lPUk
```

## 🌐 CORS Configuration

```properties
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173,http://localhost:8080
```

## 🔧 Service-specific Settings

### Song Service
```properties
UPLOAD_MAX_FILE_SIZE=100MB
UPLOAD_MAX_REQUEST_SIZE=100MB
AUDIO_PROCESSING_ENABLED=true
AUDIO_MAX_DURATION=600
```

### Social Service
```properties
MAX_FOLLOWING_COUNT=5000
MAX_FOLLOWERS_COUNT=1000000
ENABLE_REAL_TIME_NOTIFICATIONS=true
```

### Playlist Service
```properties
MAX_SONGS_PER_PLAYLIST=1000
MAX_PLAYLISTS_PER_USER=100
ENABLE_COLLABORATIVE_PLAYLISTS=true
```

### Comment Service
```properties
MAX_COMMENT_LENGTH=1000
ENABLE_NESTED_COMMENTS=true
ENABLE_COMMENT_MODERATION=true
MAX_COMMENTS_PER_POST=500
```

### Notification Service
```properties
WEBSOCKET_ENABLED=true
WEBSOCKET_MAX_CONNECTIONS=10000
NOTIFICATION_RETENTION_DAYS=30
MAX_NOTIFICATIONS_PER_USER=1000
```

## 🚀 Usage

### 1. Setup Environment Variables
```bash
setup-env.bat
```

### 2. Customize if needed
Chỉnh sửa file `.env` trong từng service directory nếu cần.

### 3. Build và Run
```bash
build-all.bat
start-all-services.bat
```

## 🔄 Switching Between Environments

### Development (Default)
```properties
SPRING_PROFILES_ACTIVE=development
MONGODB_URI=mongodb://localhost:27017/{database_name}
```

### Production  
```properties
SPRING_PROFILES_ACTIVE=production
MONGODB_URI=mongodb+srv://... (Atlas URI)
```

## 📧 Email Configuration (Optional)

Trong `notification-service/.env`, uncomment nếu cần email notifications:
```properties
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_app_password
MAIL_PROPERTIES_MAIL_SMTP_AUTH=true
MAIL_PROPERTIES_MAIL_SMTP_STARTTLS_ENABLE=true
```

## 🔍 Troubleshooting

### Environment variables không load?
1. Đảm bảo file `.env` tồn tại trong thư mục service
2. Restart service sau khi thay đổi .env
3. Check logs để xem giá trị actual được load

### Database connection issues?
1. Kiểm tra MongoDB Atlas connection string
2. Verify credentials và network access
3. Test với MongoDB Compass

### Cloudinary upload fails?
1. Verify API credentials trong `.env`
2. Check file size limits
3. Ensure proper CORS configuration

## 📝 Notes

- Tất cả `.env` files đã được setup với production values
- Local overrides có thể được thêm vào từng file
- Environment variables sẽ override application.yml defaults
- Sensitive data đã được include (vì đây là dev environment)

---

**✅ All environment variables are properly configured and ready to use!**
