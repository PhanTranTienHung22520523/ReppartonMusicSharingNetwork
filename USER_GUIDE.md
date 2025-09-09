# 🎵 Hướng Dẫn Sử Dụng Repparton Music Platform

## 📖 Mục Lục
1. [Khởi Động Ứng Dụng](#khởi-động-ứng-dụng)
2. [Đăng Nhập và Đăng Ký](#đăng-nhập-và-đăng-ký)
3. [Tìm Kiếm Âm Nhạc và Người Dùng](#tìm-kiếm-âm-nhạc-và-người-dùng)
4. [Quản Lý Playlist](#quản-lý-playlist)
5. [Tương Tác Xã Hội](#tương-tác-xã-hội)
6. [Đăng Bài và Story](#đăng-bài-và-story)
7. [Phát Nhạc](#phát-nhạc)
8. [Quản Lý Hồ Sơ](#quản-lý-hồ-sơ)
9. [Tin Nhắn](#tin-nhắn)
10. [Thông Báo](#thông-báo)

---

## 🚀 Khởi Động Ứng Dụng

### Cách 1: Sử dụng Script Tự Động (Khuyến nghị)
1. **Mở thư mục dự án** `DA2`
2. **Double-click** vào file `START_APP.bat` 
3. **Chờ** backend khởi động (khoảng 30-60 giây)
4. **Mở trình duyệt** và truy cập `http://localhost:5173`

### Cách 2: Khởi Động Thủ Công
```powershell
# Terminal 1 - Backend
cd Repparton
.\mvnw.cmd spring-boot:run

# Terminal 2 - Frontend (terminal mới)
cd frontend
npm install
npm run dev
```

### ✅ Kiểm Tra Ứng Dụng Đã Sẵn Sàng
- **Backend:** `http://localhost:8080` - Sẽ hiển thị trang Spring Boot
- **Frontend:** `http://localhost:5173` - Hiển thị trang chủ Repparton
- **Database:** `http://localhost:8080/h2-console` - Console quản lý database

---

## 🔐 Đăng Nhập và Đăng Ký

### Tài Khoản Mẫu Có Sẵn

#### 👑 Tài Khoản Admin
- **Email:** `admin@repparton.com`
- **Mật khẩu:** `admin123`

#### 🎵 Tài Khoản Nghệ Sĩ
| Nghệ sĩ | Email | Mật khẩu |
|---------|-------|----------|
| Taylor Swift | `taylor@repparton.com` | `password123` |
| Ed Sheeran | `ed@repparton.com` | `password123` |
| Billie Eilish | `billie@repparton.com` | `password123` |
| The Weeknd | `weeknd@repparton.com` | `password123` |

#### 👤 Tài Khoản Người Dùng Thường
| Tên | Email | Mật khẩu |
|-----|-------|----------|
| Sarah | `sarah@example.com` | `password123` |
| Alex | `alex@example.com` | `password123` |
| Mike | `mike@example.com` | `password123` |

### Cách Đăng Nhập
1. **Truy cập** `http://localhost:5173`
2. **Click** nút "Đăng Nhập" ở góc phải header
3. **Nhập** email và mật khẩu từ bảng trên
4. **Click** "Đăng Nhập"
5. **Kiểm tra** tên người dùng xuất hiện ở header

### Cách Đăng Ký Tài Khoản Mới
1. **Click** "Đăng Ký" từ trang đăng nhập
2. **Điền** thông tin:
   - Tên đầy đủ
   - Email (phải chưa được sử dụng)
   - Tên người dùng (duy nhất)
   - Mật khẩu (tối thiểu 6 ký tự)
   - Xác nhận mật khẩu
3. **Chọn** vai trò: Người dùng hoặc Nghệ sĩ
4. **Click** "Đăng Ký"
5. **Tự động đăng nhập** sau khi đăng ký thành công

---

## 🔍 Tìm Kiếm Âm Nhạc và Người Dùng

### Tìm Kiếm Từ Header
1. **Click** vào ô tìm kiếm ở header
2. **Gõ** từ khóa (tên bài hát, nghệ sĩ, người dùng)
3. **Xem** gợi ý tìm kiếm xuất hiện
4. **Click** vào kết quả hoặc nhấn Enter

### Tìm Kiếm Chi Tiết
1. **Truy cập** trang "Khám Phá" (Discover) từ sidebar
2. **Sử dụng** thanh tìm kiếm ở đầu trang
3. **Lọc** theo thể loại nhạc:
   - Pop
   - Rock
   - Hip-Hop
   - Electronic
   - Classical
   - Jazz
   - Country
   - R&B

### Kết Quả Tìm Kiếm
- **Bài hát:** Click để phát nhạc
- **Nghệ sĩ:** Click để xem profile
- **Người dùng:** Click để xem profile và follow
- **Playlist:** Click để xem và nghe

---

## 📋 Quản Lý Playlist

### Tạo Playlist Mới
1. **Đăng nhập** vào tài khoản
2. **Truy cập** trang "Playlist" từ sidebar
3. **Click** "Tạo Playlist Mới"
4. **Điền** thông tin:
   - Tên playlist
   - Mô tả (tùy chọn)
   - Chế độ: Công khai/Riêng tư
5. **Click** "Tạo"

### Thêm Bài Hát Vào Playlist
1. **Tìm** bài hát muốn thêm
2. **Click** icon "+" hoặc "Thêm vào Playlist"
3. **Chọn** playlist từ danh sách
4. **Xác nhận** thêm

### Quản Lý Playlist
1. **Truy cập** trang Playlist
2. **Click** vào playlist muốn chỉnh sửa
3. **Các thao tác có thể:**
   - Đổi tên playlist
   - Chỉnh sửa mô tả
   - Xóa bài hát khỏi playlist
   - Thay đổi thứ tự bài hát
   - Chia sẻ playlist
   - Xóa playlist

### Phát Playlist
1. **Click** vào tên playlist
2. **Click** nút "Phát Tất Cả"
3. **Hoặc** click vào bài hát cụ thể để phát

---

## 💝 Tương Tác Xã Hội

### Follow/Unfollow Người Dùng
1. **Tìm** người dùng muốn follow
2. **Truy cập** profile của họ
3. **Click** nút "Follow" (màu xanh)
4. **Để unfollow:** Click "Following" → "Unfollow"

### Like Bài Hát và Bài Đăng
1. **Tìm** bài hát/bài đăng muốn like
2. **Click** icon ❤️ (trái tim)
3. **Icon chuyển màu đỏ** khi đã like
4. **Click lại** để unlike

### Bình Luận (Comment)
1. **Tìm** bài đăng muốn comment
2. **Click** icon 💬 (comment)
3. **Gõ** nội dung bình luận
4. **Click** "Đăng" hoặc nhấn Enter
5. **Xem** các comment khác ở phía dưới

### Xem Danh Sách Following/Followers
1. **Truy cập** profile (của bạn hoặc người khác)
2. **Click** vào số "Following" hoặc "Followers"
3. **Xem** danh sách và có thể follow thêm

---

## 📝 Đăng Bài và Story

### Đăng Bài Mới (Post)
1. **Truy cập** trang "Trang Chủ"
2. **Tìm** ô "Đang nghĩ gì?" hoặc "Tạo bài đăng"
3. **Gõ** nội dung bài đăng
4. **Tùy chọn:**
   - Thêm ảnh
   - Tag bài hát
   - Chọn chế độ: Công khai/Chỉ Followers
5. **Click** "Đăng"

### Đăng Story
1. **Click** icon "+" ở phần Story (header hoặc sidebar)
2. **Chọn** ảnh/video từ máy tính
3. **Thêm** text, sticker nếu muốn
4. **Chọn** thời gian hiển thị (24 giờ mặc định)
5. **Click** "Đăng Story"

### Xem Story
1. **Click** vào avatar có viền màu ở phần Story
2. **Story tự động phát**
3. **Click** để chuyển story tiếp theo
4. **Swipe/Click** để xem story người khác

### Quản Lý Bài Đăng
1. **Truy cập** profile của bạn
2. **Xem** tất cả bài đăng đã đăng
3. **Click** "..." ở góc bài đăng để:
   - Chỉnh sửa
   - Xóa
   - Chia sẻ

---

## 🎧 Phát Nhạc

### Phát Bài Hát
1. **Tìm** bài hát muốn nghe
2. **Click** vào tên bài hát hoặc nút Play ▶️
3. **Music Player Bar** xuất hiện ở dưới cùng
4. **Bài hát tự động phát**

### Điều Khiển Music Player
- **Play/Pause:** Click nút ⏯️ giữa
- **Tiếp theo:** Click nút ⏭️
- **Quay lại:** Click nút ⏮️
- **Âm lượng:** Kéo thanh Volume
- **Thời gian:** Kéo thanh Progress

### Tạo Queue Phát Nhạc
1. **Phát** bài hát đầu tiên
2. **Click** "Thêm vào Queue" ở bài hát khác
3. **Hoặc** phát một playlist
4. **Xem Queue:** Click icon danh sách ở Music Player

### Chế Độ Phát
- **Phát tuần tự:** Mặc định
- **Phát ngẫu nhiên:** Click icon shuffle 🔀
- **Lặp lại:** Click icon repeat 🔁
  - 1 lần: Lặp tất cả
  - 2 lần: Lặp bài hiện tại

---

## 👤 Quản Lý Hồ Sơ

### Xem Profile
1. **Click** vào tên/avatar của bạn ở header
2. **Hoặc** truy cập sidebar → "Hồ Sơ"
3. **Xem** thông tin:
   - Ảnh đại diện
   - Tên và username
   - Bio/Mô tả
   - Số follower/following
   - Bài đăng đã đăng
   - Bài hát đã upload (nếu là nghệ sĩ)

### Chỉnh Sửa Profile
1. **Truy cập** Profile của bạn
2. **Click** "Chỉnh Sửa Profile"
3. **Cập nhật** thông tin:
   - Ảnh đại diện
   - Ảnh bìa
   - Tên hiển thị
   - Bio/Mô tả
   - Thông tin liên hệ
4. **Click** "Lưu Thay Đổi"

### Cài Đặt Tài Khoản
1. **Truy cập** sidebar → "Cài Đặt"
2. **Các tùy chọn:**
   - Thay đổi mật khẩu
   - Cài đặt riêng tư
   - Thông báo
   - Ngôn ngữ
   - Chế độ tối/sáng
3. **Lưu** thay đổi

---

## 💬 Tin Nhắn

### Gửi Tin Nhắn Mới
1. **Truy cập** trang "Tin Nhắn" từ sidebar
2. **Click** "Tin Nhắn Mới"
3. **Tìm** người muốn nhắn tin
4. **Click** vào tên họ
5. **Gõ** tin nhắn và nhấn Enter

### Trả Lời Tin Nhắn
1. **Truy cập** trang Tin Nhắn
2. **Click** vào cuộc trò chuyện
3. **Gõ** tin nhắn ở ô dưới cùng
4. **Nhấn Enter** để gửi

### Tính Năng Tin Nhắn
- **Gửi emoji:** Click icon 😊
- **Gửi file:** Click icon 📎
- **Chia sẻ bài hát:** Kéo thả từ Music Player
- **Tin nhắn nhóm:** Thêm nhiều người vào cuộc trò chuyện

---

## 🔔 Thông Báo

### Xem Thông Báo
1. **Click** icon 🔔 ở header
2. **Xem** danh sách thông báo mới
3. **Click** vào thông báo để xem chi tiết

### Loại Thông Báo
- **Like:** Ai đó like bài đăng/bài hát của bạn
- **Comment:** Ai đó comment bài đăng của bạn
- **Follow:** Ai đó follow bạn
- **Tin nhắn:** Tin nhắn mới
- **Playlist:** Ai đó thêm bài hát vào playlist công khai

### Cài Đặt Thông Báo
1. **Truy cập** Cài Đặt → Thông Báo
2. **Bật/tắt** các loại thông báo:
   - Email notifications
   - Push notifications
   - In-app notifications
3. **Lưu** cài đặt

---

## 🎤 Chức Năng Nghệ Sĩ

### Upload Bài Hát (Dành cho Nghệ Sĩ)
1. **Đăng nhập** bằng tài khoản nghệ sĩ
2. **Truy cập** "Upload" từ sidebar
3. **Điền** thông tin:
   - Tên bài hát
   - File audio (.mp3, .wav, .m4a)
   - Ảnh bìa
   - Thể loại
   - Lời bài hát (tùy chọn)
4. **Click** "Upload"

### Quản Lý Bài Hát
1. **Truy cập** Profile → Tab "Bài Hát"
2. **Xem** tất cả bài hát đã upload
3. **Click** "..." để:
   - Chỉnh sửa thông tin
   - Xóa bài hát
   - Xem thống kê

---

## 🛠️ Xử Lý Sự Cố

### Không Thể Đăng Nhập
1. **Kiểm tra** email/mật khẩu chính xác
2. **Thử** tài khoản mẫu: `admin@repparton.com` / `admin123`
3. **Refresh** trang và thử lại
4. **Kiểm tra** backend đang chạy ở `localhost:8080`

### Không Nghe Được Nhạc
1. **Kiểm tra** âm lượng máy tính
2. **Kiểm tra** âm lượng trong Music Player
3. **Thử** bài hát khác
4. **Refresh** trang

### Lỗi Kết Nối API
1. **Kiểm tra** backend đang chạy
2. **Mở** Browser Console (F12) xem lỗi
3. **Restart** backend và frontend
4. **Kiểm tra** port 8080 và 5173 không bị chiếm

### Upload File Thất Bại
1. **Kiểm tra** kích thước file < 10MB
2. **Kiểm tra** định dạng file được hỗ trợ
3. **Kiểm tra** kết nối internet
4. **Thử** file khác

---

## 📞 Hỗ Trợ

### Liên Hệ
- **Email:** support@repparton.com
- **GitHub Issues:** [Repository Issues](https://github.com/your-repo/issues)

### Tài Liệu Kỹ Thuật
- **API Documentation:** `Repparton/API_Tests.http`
- **Testing Guide:** `TESTING_GUIDE.md`
- **Architecture:** `Repparton/API_ARCHITECTURE.md`

### Thông Tin Phát Triển
- **Frontend:** React 18 + Vite
- **Backend:** Spring Boot 3.2+
- **Database:** H2 (in-memory)
- **Authentication:** JWT

---

## 🎯 Tips và Tricks

### Shortcuts
- **Spacebar:** Play/Pause nhạc
- **Ctrl + K:** Mở tìm kiếm nhanh
- **Esc:** Đóng modal
- **Enter:** Gửi comment/tin nhắn

### Hiệu Suất Tốt Nhất
- **Sử dụng Chrome/Firefox** mới nhất
- **Đóng** các tab không cần thiết
- **Clear cache** nếu gặp lỗi hiển thị
- **Restart** ứng dụng nếu chậm

### Bảo Mật
- **Không chia sẻ** mật khẩu
- **Đăng xuất** sau khi sử dụng
- **Cập nhật** thông tin profile thường xuyên
- **Báo cáo** nội dung không phù hợp

---

*🎵 Chúc bạn có trải nghiệm tuyệt vời với Repparton Music Platform! 🎵*
