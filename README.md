# Repparton Music Platform

A modern music social platform built with Spring Boot (backend) and React (frontend).

## 🚀 Quick Start

### Option 1: Use the Startup Script (Recommended)
```powershell
# Double-click START_APP.bat or run in PowerShell:
.\START_APP.bat
```

### Option 2: Manual Start
```powershell
# Terminal 1 - Start Backend
cd Repparton
.\mvnw.cmd spring-boot:run

# Terminal 2 - Start Frontend  
cd frontend
npm install
npm run dev
```

## 🔐 Sample Login Credentials

The application comes with pre-loaded sample users for testing:

### 👑 Admin Account
- **Email:** `admin@repparton.com`
- **Password:** `admin123`

### 🎵 Artist Accounts
| Artist | Email | Password |
|--------|-------|----------|
| Taylor Swift | `taylor@repparton.com` | `password123` |
| Ed Sheeran | `ed@repparton.com` | `password123` |
| Billie Eilish | `billie@repparton.com` | `password123` |
| The Weeknd | `weeknd@repparton.com` | `password123` |

### 👤 Regular User Accounts
| User | Email | Password | Notes |
|------|-------|----------|-------|
| Sarah | `sarah@example.com` | `password123` | Music enthusiast |
| Alex | `alex@example.com` | `password123` | DJ (Artist pending) |
| Mike | `mike@example.com` | `password123` | Indie rock guitarist |

## 🧪 Testing

1. **Start Application:** Run `START_APP.bat`
2. **Open Browser:** Go to `http://localhost:5173`
3. **Test Guest Features:** Browse home and discover pages
4. **Test Login:** Use any sample account above
5. **Test User Features:** Follow, like, comment, create playlists
6. **Run Full Tests:** Execute `TESTING_GUIDE.bat`

## 📚 Documentation

- **[USER_GUIDE.md](USER_GUIDE.md)** - 🇻🇳 Hướng dẫn chi tiết sử dụng từng chức năng (Vietnamese)
- **[USAGE.md](USAGE.md)** - Comprehensive usage guide and API documentation (English)
- **[FEATURE_TESTING_CHECKLIST.md](FEATURE_TESTING_CHECKLIST.md)** - 🧪 Checklist kiểm tra tất cả tính năng API
- **[TESTING_GUIDE.bat](TESTING_GUIDE.bat)** - Step-by-step testing instructions
- **[API_Tests.http](Repparton/API_Tests.http)** - API endpoint tests for VS Code

## 🌐 Application URLs

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:8080
- **H2 Database Console:** http://localhost:8080/h2-console
  - JDBC URL: `jdbc:h2:mem:testdb`
  - Username: `sa`
  - Password: (empty)

## ✨ Key Features

- **🎵 Music Streaming** - Play and discover music
- **👥 Social Features** - Follow users, like posts, comment
- **📱 Responsive Design** - Works on desktop and mobile
- **🎨 Modern UI** - Clean, intuitive interface
- **🔐 Secure Auth** - JWT-based authentication
- **📊 Real-time Data** - Live updates and notifications

## 🛠️ Tech Stack

### Frontend
- React 18 + Vite
- React Router for navigation
- Context API for state management
- Axios for API calls
- React Icons for UI

### Backend
- Spring Boot 3.2+
- Spring Security with JWT
- H2 Database (in-memory)
- Spring Data JPA
- Cloudinary for file uploads

## 🐛 Troubleshooting

### Common Issues
- **Port conflicts:** Stop other apps on ports 8080/5173
- **Database errors:** Restart backend to reset H2 database
- **CORS errors:** Check SecurityConfig.java allows frontend origin
- **Login issues:** Verify backend is running and credentials are correct

### Getting Help
1. Check browser console for errors
2. Check terminal output for backend errors
3. Verify both services are running
4. Try different sample login credentials

## 📝 Development Notes

- Sample data is automatically loaded on first startup
- All passwords are encrypted using bcrypt
- JWT tokens expire after 24 hours
- File uploads use Cloudinary (configure in application.properties)

## 🎯 Next Steps

1. **Test Everything:** Run through all user flows
2. **Customize:** Modify sample data in DataInitializer.java
3. **Deploy:** Configure for production environment
4. **Extend:** Add new features and improvements
