# 🧪 **REPPARTON API TESTING GUIDE**
## Complete Testing Suite for Facebook + SoundCloud Platform

---

## 📋 **Testing Files Overview**

### 1. **API_Tests.http** - REST Client Testing
- **50+ API endpoints** organized by category
- Compatible with **VS Code REST Client extension**, **IntelliJ HTTP Client**
- Variables for easy token and ID management
- Complete CRUD operations for all features

### 2. **test_api.sh** - Linux/Mac Automated Testing
- **Bash script** for automated API testing
- Authentication flow testing
- Performance monitoring
- Error handling validation
- JSON response parsing

### 3. **test_api.bat** - Windows Automated Testing
- **Windows batch script** equivalent
- Cross-platform compatibility
- Simplified testing for Windows users
- Temporary file management

### 4. **Postman Collection** - Interactive Testing
- **Repparton_API_Collection.postman_collection.json**
- Environment variables setup
- Request/response examples
- Test scripts and assertions

---

## 🚀 **How to Test Your APIs**

### **Method 1: VS Code REST Client (Recommended)**

1. **Install VS Code REST Client Extension**
   ```
   ext install humao.rest-client
   ```

2. **Open API_Tests.http file in VS Code**

3. **Update Variables Section**
   ```http
   @baseUrl = http://localhost:8080/api
   @authToken = your-jwt-token-here  # Update after login
   @userId = user-id-here           # Update after registration
   ```

4. **Run Tests Step by Step**
   - Click "Send Request" above each test
   - Copy tokens/IDs from responses
   - Update variables as needed

### **Method 2: Automated Script Testing**

#### **For Linux/Mac Users:**
```bash
# Make script executable
chmod +x test_api.sh

# Run the test suite
./test_api.sh
```

#### **For Windows Users:**
```cmd
# Run the batch script
test_api.bat
```

### **Method 3: Postman Testing**

1. **Import Collection**
   - Open Postman
   - Click "Import"
   - Select `Repparton_API_Collection.postman_collection.json`

2. **Set Environment Variables**
   - Create new environment
   - Add variables: `base_url`, `auth_token`, `user_id`

3. **Run Collection**
   - Use Collection Runner for automated testing
   - Or run requests individually

---

## 🔧 **Pre-Testing Setup**

### **1. Start Your Application**
```bash
cd C:\Users\phant\Downloads\DA2\Repparton
mvn spring-boot:run
```

### **2. Verify Server is Running**
```bash
curl http://localhost:8080/api/users/search?query=test
```

### **3. Check Database Connection**
- Ensure MongoDB is running
- Verify connection in `application.properties`

---

## 📊 **Test Categories & Coverage**

### **🔐 Authentication (4 tests)**
- ✅ User Registration
- ✅ User Login  
- ✅ Token Generation
- ✅ JWT Validation

### **👤 User Management (7 tests)**
- ✅ Get User Profile
- ✅ Update Profile
- ✅ Apply to be Artist
- ✅ Search Users
- ✅ Artist Approval (Admin)
- ✅ Pending Requests
- ✅ Role Management

### **🎵 Music Streaming (13 tests)**
- ✅ Song Upload (with file)
- ✅ Get Public Songs
- ✅ Search Songs
- ✅ Trending Songs
- ✅ Recommendations
- ✅ Play Song (Views)
- ✅ Song Approval
- ✅ Artist Songs
- ✅ Genre Filtering
- ✅ Song Management
- ✅ File Validation
- ✅ Privacy Settings
- ✅ Admin Moderation

### **📱 Social Media (10 tests)**
- ✅ Create Posts
- ✅ Upload Media
- ✅ Get User Feed
- ✅ Trending Posts
- ✅ Post Search
- ✅ Update Posts
- ✅ Delete Posts
- ✅ User Posts
- ✅ Post Analytics
- ✅ Content Moderation

### **❤️ Engagement (6 tests)**
- ✅ Like/Unlike Songs
- ✅ Like/Unlike Posts
- ✅ Check Like Status
- ✅ Like Counts
- ✅ Engagement Analytics
- ✅ Real-time Updates

### **👥 Social Features (3 tests)**
- ✅ Follow/Unfollow Users
- ✅ Check Follow Status
- ✅ Follower Counts

### **⚡ Performance (3 tests)**
- ✅ Response Time Monitoring
- ✅ Pagination Testing
- ✅ Load Testing

### **🔍 Error Handling (3 tests)**
- ✅ Invalid Endpoints
- ✅ Unauthorized Access
- ✅ Validation Errors

---

## 📈 **Expected Test Results**

### **Success Scenarios**
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {...}
}
```

### **Authentication Success**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzUxMiJ9...",
  "user": {
    "id": "user123",
    "username": "john_doe",
    "role": "user"
  }
}
```

### **Error Responses**
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error info"
}
```

---

## 🎯 **Testing Workflow**

### **Complete User Journey Test**
1. **Register** → Get user ID
2. **Login** → Get auth token  
3. **Update Profile** → Test authentication
4. **Apply for Artist** → Test role system
5. **Upload Song** → Test file upload
6. **Create Post** → Test social features
7. **Like Content** → Test engagement
8. **Follow Users** → Test social network

### **Artist Workflow Test**
1. **Register** as artist
2. **Upload Songs** → Test content creation
3. **Wait for Approval** → Test moderation
4. **Create Posts** → Test artist features
5. **Get Analytics** → Test artist metrics

### **Admin Workflow Test**
1. **Login** as admin
2. **Approve Songs** → Test moderation
3. **Approve Artists** → Test user management
4. **Monitor Content** → Test admin features

---

## 🐛 **Troubleshooting**

### **Common Issues**

1. **401 Unauthorized**
   - Check if auth token is valid
   - Login again to get fresh token
   - Verify token format: `Bearer your-token-here`

2. **500 Internal Server Error**
   - Check server logs
   - Verify database connection
   - Check entity relationships

3. **File Upload Issues**
   - Use multipart/form-data
   - Check file size limits
   - Verify file formats

4. **Database Errors**
   - Check MongoDB connection
   - Verify collection names
   - Check field mappings

---

## 📞 **Support & Next Steps**

### **After Testing**
1. **Review Results** in response files
2. **Fix any failing tests** in your code
3. **Optimize performance** based on metrics
4. **Add more test cases** as needed

### **Production Readiness**
- ✅ All tests passing
- ✅ Performance under 1000ms
- ✅ Error handling working
- ✅ Security validations active
- ✅ File uploads functioning
- ✅ Real-time features working

---

**🎉 Your platform now has enterprise-level testing coverage!**
