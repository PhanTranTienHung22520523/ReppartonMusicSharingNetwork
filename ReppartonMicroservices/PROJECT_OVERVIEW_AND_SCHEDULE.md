# Repparton Microservices Project Overview & 3-Month Development Schedule
## 1. Giới thiệu đề tài khóa luận tốt nghiệp

### Tên đề tài
Thiết kế và xây dựng hệ thống nền tảng mạng xã hội âm nhạc phân tán sử dụng kiến trúc microservices, tích hợp AI và các công nghệ hiện đại.

### Mục tiêu nghiên cứu
- Xây dựng hệ thống backend microservices cho nền tảng mạng xã hội âm nhạc, hỗ trợ các tính năng social, nhắn tin, chia sẻ, nghe nhạc, quản lý playlist, sự kiện, v.v.
- Tích hợp các công nghệ hiện đại: AI recommendation, event streaming (Kafka), message queue (RabbitMQ), caching (Redis), bảo mật JWT, API Gateway, Discovery Service.
- Đề xuất và thực hiện chuyển đổi mô hình lưu trữ dữ liệu sang kết hợp PostgreSQL và MongoDB 4 để tối ưu quản lý, hiệu năng và khả năng mở rộng.
- Xây dựng quy trình triển khai, kiểm thử, tài liệu hóa và đánh giá hiệu quả hệ thống.

### Ý nghĩa thực tiễn
- Giải quyết bài toán mở rộng, tối ưu hóa hiệu năng cho các hệ thống social hiện đại.
- Đề xuất mô hình kết hợp database phù hợp cho các hệ thống vừa có dữ liệu quan hệ vừa có dữ liệu phi cấu trúc.
- Tích hợp AI vào quy trình vận hành thực tế (gợi ý, phân tích, duyệt nội dung).
- Cung cấp tài liệu, quy trình triển khai thực tế cho các dự án tương tự.

### Phạm vi đề tài
- Thiết kế, xây dựng và kiểm thử hệ thống backend microservices.
- Tích hợp các công nghệ AI, message queue, event streaming, caching, bảo mật.
- Đề xuất và thực hiện migration sang PostgreSQL + MongoDB 4.
- Xây dựng tài liệu hướng dẫn triển khai, vận hành, kiểm thử.

### Phương pháp thực hiện
- Nghiên cứu lý thuyết về microservices, các công nghệ liên quan.
- Phân tích, thiết kế kiến trúc hệ thống, lựa chọn công nghệ phù hợp.
- Triển khai từng thành phần, kiểm thử, đánh giá hiệu năng.
- Viết migration script, thực hiện chuyển đổi dữ liệu.
- Tổng hợp kết quả, đánh giá, viết báo cáo.

### Kết quả mong đợi
- Hệ thống backend microservices hoàn chỉnh, có thể mở rộng, dễ quản lý.
- Tích hợp thành công các công nghệ AI, message queue, event streaming, caching, bảo mật.
- Quy trình migration database rõ ràng, hiệu quả.
- Bộ tài liệu hướng dẫn triển khai, vận hành, kiểm thử, đánh giá hệ thống.

### Kiến trúc tổng thể
- **Microservices Architecture**: Tách biệt các chức năng thành các service độc lập, giao tiếp qua API Gateway và message queue.
- **Service Discovery**: Sử dụng Eureka để tự động đăng ký và phát hiện các service.
- **API Gateway**: Spring Cloud Gateway, xác thực JWT, routing, CORS.
- **Event-driven**: Sử dụng RabbitMQ và Kafka cho các sự kiện nội bộ và phân tích real-time.
- **Distributed Cache**: Redis cho caching và session management.
- **Database**: MongoDB Atlas, mỗi service một database riêng biệt.
- **Frontend**: React/Vite, sẽ được ghép với backend sau khi hoàn thiện API.

### Các công nghệ sử dụng
- **Spring Boot 3.2.x**
- **Spring Cloud 2023.0.x**
- **MongoDB Atlas**
- **Redis**
- **RabbitMQ**
- **Kafka**
- **JWT Authentication**
- **Cloudinary** (lưu trữ file)
- **Lombok, MapStruct, JJWT, Spring DotEnv**
- **ReactJS, Vite** (frontend)
- **Docker Compose** (tùy chọn cho dev/test)

### Các service chính
- **Discovery Service**: Eureka Server
- **API Gateway**: Routing, Auth, CORS
- **User Service**: Đăng ký, đăng nhập, quản lý người dùng
- **Song Service**: Quản lý bài hát, upload, play, like
- **Social Service**: Follow, like, share, story
- **Playlist Service**: Quản lý playlist
- **Comment Service**: Bình luận bài hát, post
- **Notification Service**: Thông báo real-time
- **Event Service**: Xử lý sự kiện, AI, phân tích

### Tính năng đã có
- Đăng ký/đăng nhập, xác thực JWT
- Quản lý bài hát, playlist, story, comment
- Notification real-time
- API Gateway routing
- Service discovery
- Caching, message queue, event streaming
- Hệ thống phân quyền nghệ sĩ/người dùng

---

## 2. Lịch trình phát triển & hoàn thiện (3 tháng)

### **Tháng 1: Hoàn thiện nền tảng & các tính năng bảo mật, social**

## Database Migration Plan

Dự định chuyển đổi hệ thống database sang sử dụng kết hợp PostgreSQL (cho các dữ liệu quan hệ, giao dịch, quản lý user, playlist, v.v.) và MongoDB 4 (cho các dữ liệu phi cấu trúc, lưu trữ sự kiện, log, metadata, v.v.) để dễ quản lý, mở rộng và tối ưu hiệu năng.

### Lý do chuyển đổi
- PostgreSQL: Quản lý dữ liệu quan hệ, hỗ trợ ACID, dễ tích hợp các công cụ phân tích, báo cáo, backup.
- MongoDB 4: Lưu trữ dữ liệu phi cấu trúc, hỗ trợ event sourcing, log, metadata, dễ mở rộng theo chiều ngang.

### Kế hoạch thực hiện
1. Đánh giá các schema hiện tại, xác định dữ liệu phù hợp chuyển sang PostgreSQL và dữ liệu giữ lại ở MongoDB.
2. Thiết kế lại các service để hỗ trợ cả hai loại database (Spring Data JPA cho PostgreSQL, Spring Data MongoDB cho MongoDB 4).
3. Viết migration script chuyển dữ liệu từ MongoDB Atlas sang PostgreSQL (nếu cần).
4. Cập nhật tài liệu, hướng dẫn triển khai, backup, restore cho cả hai hệ thống.
5. Kiểm thử toàn bộ hệ thống sau khi chuyển đổi.

### Thời gian dự kiến
Thời gian thực hiện migration sẽ được lồng ghép vào các tuần phát triển tương ứng:
- Tuần 1-2: Phân tích, thiết kế lại schema, xác định dữ liệu chuyển đổi, chuẩn bị migration script.
- Tuần 5-6: Thực hiện migration, kiểm thử dữ liệu, tối ưu hóa truy vấn và backup/restore.
Việc chuyển đổi này giúp hệ thống dễ quản lý, mở rộng, và tối ưu chi phí vận hành về lâu dài.
### **Tháng 2: Tích hợp AI & các tính năng nâng cao**
Trong tháng 2, các công việc trọng tâm gồm:

- Tích hợp AI recommendation (gợi ý bài hát) vào Event Service và Song Service.
- Tích hợp AI phân tích bài hát khi upload (key, tempo, bản quyền) vào Song Service.
- Tích hợp AI duyệt nghệ sĩ vào User Service.
- Viết test cho các tính năng AI, kiểm thử hiệu năng và độ chính xác.
- Thực hiện migration database: chuyển đổi dữ liệu phù hợp sang PostgreSQL, kiểm thử tính toàn vẹn dữ liệu.
- Tối ưu hóa event streaming (Kafka), caching (Redis), kiểm thử tải lớn.
- Viết tài liệu mô tả thuật toán AI, hướng dẫn migration, tài liệu API cho frontend.

Kết quả mong đợi:
- Các tính năng AI hoạt động ổn định, kết quả kiểm thử đạt yêu cầu.
- Migration database hoàn tất, dữ liệu nhất quán.
- Event streaming/caching tối ưu, tài liệu frontend và AI đầy đủ.
### **Tháng 3: Ghép frontend, kiểm thử, deploy**
 - Ghép frontend React với các API microservices
 - Viết test end-to-end, kiểm thử UI/UX
 - Tối ưu hóa performance, bảo mật, logging
 - Chuẩn bị CI/CD pipeline (Github Actions, Jenkins, v.v.)
 - Deploy thử nghiệm lên cloud (AWS, Azure, hoặc VPS)
 - Viết tài liệu hướng dẫn sử dụng, vận hành

---

## 3. Phân chia công việc chi tiết

### Tháng 1: Hoàn thiện nền tảng & các tính năng bảo mật, social
**Tuần 1-2:**
- Phân tích yêu cầu, thiết kế chi tiết API cho các tính năng social & bảo mật (device login, checkin, story music/tag, group chat/post, call).
- Thiết kế sơ đồ ERD, luồng dữ liệu, phân quyền cho từng service.
- Phát triển backend cho các tính năng social & bảo mật, triển khai các controller, service, repository tương ứng.
- Viết unit test cho các service mới, đảm bảo độ phủ code >80%.
- Chuẩn bị migration script, xác định dữ liệu cần chuyển đổi.

**Tuần 3-4:**
- Hoàn thiện các API social & bảo mật, kiểm thử chức năng.
- Viết tài liệu API, test report.
- Bắt đầu tích hợp AI recommendation, AI phân tích bài hát, AI duyệt nghệ sĩ.

### Tháng 2: Tích hợp AI & các tính năng nâng cao
**Tuần 5-6:**
- Tích hợp AI recommendation (gợi ý bài hát) vào Event Service và Song Service.
- Tích hợp AI phân tích bài hát khi upload (key, tempo, bản quyền) vào Song Service.
- Tích hợp AI duyệt nghệ sĩ vào User Service.
- Thực hiện migration database: chuyển đổi dữ liệu phù hợp sang PostgreSQL, kiểm thử tính toàn vẹn dữ liệu.
- Tối ưu hóa event streaming (Kafka), caching (Redis), kiểm thử tải lớn.

**Tuần 7-8:**
- Phát triển lyric API, bổ sung giao diện nghe nhạc hiển thị lyric.
- Viết test cho các tính năng AI, kiểm thử hiệu năng và độ chính xác.
- Viết tài liệu mô tả thuật toán AI, hướng dẫn migration, tài liệu API cho frontend.

### Tháng 3: Ghép frontend, kiểm thử, deploy
**Tuần 9-10:**
- Tích hợp frontend React với các API microservices, kiểm thử chức năng end-to-end.
- Viết test UI/UX, kiểm thử trải nghiệm người dùng, phát hiện và sửa lỗi giao diện.
- Tối ưu hóa performance, bảo mật, logging cho toàn bộ hệ thống.
- Chuẩn bị CI/CD pipeline (Github Actions/Jenkins), viết script deploy tự động.
- Deploy thử nghiệm lên cloud (AWS/Azure/VPS), kiểm thử tải thực tế.

**Tuần 11-12:**
- Viết tài liệu hướng dẫn sử dụng, vận hành, backup/restore, migration database.
- Tổng kết, đánh giá kết quả thực nghiệm, hoàn thiện báo cáo khóa luận.

---

## 4. Ghi chú
- Ưu tiên phát triển từng service độc lập, có thể deploy riêng lẻ
- Tích hợp AI sử dụng Python (FastAPI, Tensorflow/PyTorch) hoặc dịch vụ cloud AI
- Sử dụng Kafka/RabbitMQ cho các event lớn, real-time
- Đảm bảo bảo mật, logging, monitoring xuyên suốt
- Tài liệu hóa đầy đủ để dễ dàng chuyển giao

---

**Dự án sẽ hoàn thiện, sẵn sàng production và mở rộng AI, social, real-time trong 3 tháng tới!**
