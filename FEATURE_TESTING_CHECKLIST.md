# 🧪 Checklist Kiểm Tra Tính Năng API

## 📋 Tổng Quan
Checklist này giúp kiểm tra từng API và chức năng đã được tích hợp vào Repparton Music Platform.

---

## ✅ Checklist Kiểm Tra Hệ Thống

### 🚀 Khởi Động Ứng Dụng
- [ ] **Backend khởi động thành công** (`localhost:8080`)
- [ ] **Frontend khởi động thành công** (`localhost:5173`)
- [ ] **H2 Database kết nối** (`localhost:8080/h2-console`)
- [ ] **Sample data được load** (admin, users, songs, posts)
- [ ] **Không có lỗi compilation** ở console

### 🔐 Xác Thực (Authentication)
- [ ] **Đăng nhập thành công** với tài khoản admin
- [ ] **Đăng nhập thành công** với tài khoản nghệ sĩ (taylor@repparton.com)
- [ ] **Đăng nhập thành công** với tài khoản user (sarah@example.com)
- [ ] **Đăng ký tài khoản mới** thành công
- [ ] **JWT token được lưu** và persist sau refresh
- [ ] **Đăng xuất** xóa token và redirect đúng
- [ ] **Protected routes** redirect đến login khi chưa đăng nhập

---

## 🔍 API Tìm Kiếm (Search)

### Backend API Tests
```http
# Test trong Repparton/API_Tests.http
GET http://localhost:8080/api/search?query=taylor&type=all
GET http://localhost:8080/api/search?query=love&type=songs
GET http://localhost:8080/api/search?query=sarah&type=users
```

### Frontend Tests
- [ ] **Gõ vào search box** ở header hiển thị suggestions
- [ ] **Click vào suggestion** navigate đến kết quả đúng
- [ ] **Search songs** hiển thị danh sách bài hát
- [ ] **Search users** hiển thị danh sách người dùng
- [ ] **Search trong Discover page** hoạt động
- [ ] **Filter theo genre** hoạt động đúng

---

## 📋 API Playlist

### Backend API Tests
```http
# Test playlist APIs
GET http://localhost:8080/api/playlists/user/1
POST http://localhost:8080/api/playlists
PUT http://localhost:8080/api/playlists/1
DELETE http://localhost:8080/api/playlists/1
POST http://localhost:8080/api/playlists/1/songs/1
DELETE http://localhost:8080/api/playlists/1/songs/1
```

### Frontend Tests
- [ ] **Tạo playlist mới** thành công
- [ ] **Xem danh sách playlist** của user
- [ ] **Thêm bài hát vào playlist** từ SongCard
- [ ] **Xóa bài hát khỏi playlist**
- [ ] **Đổi tên playlist**
- [ ] **Xóa playlist**
- [ ] **Phát playlist** (tất cả bài hát)
- [ ] **Chia sẻ playlist** với user khác

---

## 💝 API Like

### Backend API Tests
```http
# Test like APIs
POST http://localhost:8080/api/likes/song/1
DELETE http://localhost:8080/api/likes/song/1
POST http://localhost:8080/api/likes/post/1
DELETE http://localhost:8080/api/likes/post/1
GET http://localhost:8080/api/likes/user/1/songs
```

### Frontend Tests
- [ ] **Like bài hát** - icon chuyển màu đỏ
- [ ] **Unlike bài hát** - icon về màu xám
- [ ] **Like post** - số like tăng
- [ ] **Unlike post** - số like giảm
- [ ] **Xem danh sách bài hát đã like** trong profile
- [ ] **Real-time update** số like khi có người like

---

## 👥 API Follow

### Backend API Tests
```http
# Test follow APIs
POST http://localhost:8080/api/follow/2
DELETE http://localhost:8080/api/follow/2
GET http://localhost:8080/api/follow/1/following
GET http://localhost:8080/api/follow/1/followers
```

### Frontend Tests
- [ ] **Follow user** từ profile page
- [ ] **Unfollow user** từ profile page
- [ ] **Xem danh sách Following** trong profile
- [ ] **Xem danh sách Followers** trong profile
- [ ] **Số following/followers** cập nhật đúng
- [ ] **Follow button** đổi text "Follow" ↔ "Following"

---

## 💬 API Comment

### Backend API Tests
```http
# Test comment APIs
GET http://localhost:8080/api/comments/post/1
POST http://localhost:8080/api/comments/post/1
PUT http://localhost:8080/api/comments/1
DELETE http://localhost:8080/api/comments/1
```

### Frontend Tests
- [ ] **Xem comments** của post
- [ ] **Thêm comment mới** vào post
- [ ] **Edit comment** của chính mình
- [ ] **Xóa comment** của chính mình
- [ ] **Comment hiển thị đúng** tác giả và thời gian
- [ ] **Real-time update** khi có comment mới

---

## 📝 API Story

### Backend API Tests
```http
# Test story APIs
GET http://localhost:8080/api/stories/active
POST http://localhost:8080/api/stories
GET http://localhost:8080/api/stories/user/1
DELETE http://localhost:8080/api/stories/1
```

### Frontend Tests
- [ ] **Tạo story mới** với ảnh
- [ ] **Xem story** của user khác
- [ ] **Story tự động chuyển** sau vài giây
- [ ] **Xóa story** của chính mình
- [ ] **Story expire** sau 24 giờ
- [ ] **Story indicator** hiển thị đúng (có/không có story mới)

---

## 📰 API Post

### Backend API Tests
```http
# Test post APIs
GET http://localhost:8080/api/posts/feed
GET http://localhost:8080/api/posts/public
POST http://localhost:8080/api/posts
PUT http://localhost:8080/api/posts/1
DELETE http://localhost:8080/api/posts/1
```

### Frontend Tests
- [ ] **Tạo post mới** từ Home page
- [ ] **Xem feed** hiển thị posts từ người đã follow
- [ ] **Xem public posts** ở Discover
- [ ] **Edit post** của chính mình
- [ ] **Xóa post** của chính mình
- [ ] **Share post** của người khác
- [ ] **Post với media** (ảnh, video)

---

## 🎵 API Âm Nhạc

### Backend API Tests
```http
# Test song APIs
GET http://localhost:8080/api/songs/trending
GET http://localhost:8080/api/songs/public
POST http://localhost:8080/api/songs/upload
GET http://localhost:8080/api/songs/user/1
DELETE http://localhost:8080/api/songs/1
```

### Frontend Tests
- [ ] **Phát nhạc** từ SongCard
- [ ] **Music Player** hiển thị đúng thông tin
- [ ] **Play/Pause** hoạt động
- [ ] **Next/Previous** chuyển bài đúng
- [ ] **Volume control** hoạt động
- [ ] **Progress bar** cập nhật real-time
- [ ] **Upload song** (nghệ sĩ) thành công
- [ ] **Queue management** hoạt động

---

## 👤 API User Profile

### Backend API Tests
```http
# Test user APIs
GET http://localhost:8080/api/users/profile
PUT http://localhost:8080/api/users/profile
GET http://localhost:8080/api/users/1
PUT http://localhost:8080/api/users/1/avatar
```

### Frontend Tests
- [ ] **Xem profile** hiển thị đúng thông tin
- [ ] **Edit profile** cập nhật thành công
- [ ] **Upload avatar** thay đổi ảnh đại diện
- [ ] **Upload cover photo** thay đổi ảnh bìa
- [ ] **View other user profile** hoạt động
- [ ] **Profile stats** (followers, following, posts) đúng

---

## 💬 API Messages

### Backend API Tests
```http
# Test message APIs
GET http://localhost:8080/api/messages/conversations
GET http://localhost:8080/api/messages/conversation/2
POST http://localhost:8080/api/messages/send
PUT http://localhost:8080/api/messages/1/read
```

### Frontend Tests
- [ ] **Xem danh sách conversations**
- [ ] **Gửi tin nhắn mới** 
- [ ] **Nhận tin nhắn** real-time
- [ ] **Mark as read** khi xem tin nhắn
- [ ] **Send media** (ảnh, file)
- [ ] **Message timestamp** hiển thị đúng

---

## 🔔 API Notifications

### Backend API Tests
```http
# Test notification APIs
GET http://localhost:8080/api/notifications
PUT http://localhost:8080/api/notifications/1/read
PUT http://localhost:8080/api/notifications/mark-all-read
DELETE http://localhost:8080/api/notifications/1
```

### Frontend Tests
- [ ] **Notification icon** hiển thị số thông báo chưa đọc
- [ ] **Click notification** đi đến nội dung liên quan
- [ ] **Mark as read** khi click vào thông báo
- [ ] **Mark all as read** hoạt động
- [ ] **Delete notification** hoạt động
- [ ] **Real-time notifications** khi có tương tác

---

## 🎨 UI/UX Tests

### Responsive Design
- [ ] **Desktop** (1920x1080) hiển thị đúng
- [ ] **Tablet** (768x1024) responsive
- [ ] **Mobile** (375x667) responsive
- [ ] **Navigation** hoạt động trên mọi device

### Loading States
- [ ] **Loading spinners** hiển thị khi fetch data
- [ ] **Skeleton screens** cho content loading
- [ ] **Button disabled** khi đang submit
- [ ] **Error boundaries** bắt lỗi React

### Error Handling
- [ ] **Network errors** hiển thị message rõ ràng
- [ ] **401 Unauthorized** redirect đến login
- [ ] **404 Not Found** hiển thị trang 404
- [ ] **500 Server Error** hiển thị error page
- [ ] **Form validation** hiển thị lỗi đúng field

---

## 🔧 Performance Tests

### API Response Time
- [ ] **Login** < 2 giây
- [ ] **Load feed** < 3 giây
- [ ] **Search** < 1 giây
- [ ] **Play music** < 1 giây response

### Frontend Performance
- [ ] **Page load** < 3 giây
- [ ] **Navigation** mượt mà
- [ ] **Scroll performance** không lag
- [ ] **Memory usage** ổn định

---

## 🚀 Deployment Tests

### Production Build
- [ ] **Frontend build** không lỗi
- [ ] **Backend package** thành công
- [ ] **Environment variables** configure đúng
- [ ] **Database migration** (nếu cần)

### Cross-Browser Testing
- [ ] **Chrome** (latest)
- [ ] **Firefox** (latest)
- [ ] **Safari** (latest)
- [ ] **Edge** (latest)

---

## 📊 Kết Quả Kiểm Tra

### ✅ Completed Features
- API Authentication ✅
- API Search ✅
- API Playlist ✅
- API Like ✅
- API Follow ✅
- API Comment ✅
- API Story ✅
- API Post ✅
- API Music Player ✅
- API User Profile ✅

### 🔄 In Progress
- [ ] API Messages
- [ ] API Notifications
- [ ] Real-time features
- [ ] File upload optimization

### 🆘 Issues Found
- [ ] Ghi chú các bug phát hiện ở đây
- [ ] Link đến GitHub Issues (nếu có)

---

## 📝 Notes
```
Ghi chú kết quả kiểm tra chi tiết:
- Thời gian test: 
- Tester: 
- Browser: 
- Device: 
- Issues: 
```

---

*Hoàn thành checklist này đảm bảo tất cả API integration hoạt động ổn định! 🎯*
