# 🌟 Mạng Xã Hội Hỏi Đáp & Chia Sẻ Video (Social Network & Forum)

## 📖 Miêu Tả (Description)
Dự án là một nền tảng mạng xã hội kết hợp giữa diễn đàn hỏi đáp (Q&A) và chia sẻ video ngắn. Hệ thống cho phép người dùng đăng tải các câu hỏi, chia sẻ kiến thức, trả lời thắc mắc, cũng như đăng bán và tải lên các đoạn video. Hệ thống tích hợp các tính năng tương tác thời gian thực như nhắn tin, bình luận trực tiếp, thông báo, chức năng theo dõi người dùng, hệ thống đánh giá (vote), và tính năng quản trị hệ thống.

## 🏗️ Cấu Trúc Dự Án (Project Structure)
Dự án được ứng dụng mô hình kiến trúc Client-Server, phân tách rõ ràng thành 2 phần: Frontend (React.js) và Backend (Node.js).

```text
project_nodejs/
├── backend/                   # ⚙️ Node.js / Express Server
│   ├── controllers/           # Nơi xử lý logic cho các API endpoints
│   ├── middlewares/           # Middleware xác thực (auth), phân quyền admin, upload
│   ├── models/                # Các schema database MongoDB qua Mongoose
│   ├── routes/                # Định nghĩa các routes (RESTful API), liên kết với logic
│   ├── services/              # Các dịch vụ xử lý logic và tương tác realtime Socket.io
│   ├── utils/                 # Chức năng hỗ trợ tiện ích
│   ├── server.js              # File entry point, cấu hình Express ứng dụng & Socket.io
│   └── package.json           # Danh sách các thư viện phụ thuộc phía Backend
│
└── frontend/                  # 🎨 React.js / Vite Client
    ├── public/                # Chức các tệp tin tĩnh
    ├── src/
    │   ├── assets/            # Tài nguyên hệ thống (hình ảnh, icon...)
    │   ├── components/        # Các UI Components được chia nhỏ để tái sử dụng
    │   ├── context/           # Trạng thái toàn cục React Context (Auth, Socket...)
    │   ├── hooks/             # Các custom hook React
    │   ├── pages/             # Các trang giao diện xử lý chính (Camera, Upload, Home...)
    │   ├── router/            # Cấu hình luồng định tuyến (React Router DOM)
    │   ├── services/          # Định nghĩa kết nối gọi xuống Backend APIs (Axios)
    │   ├── utils/             # Các hàm chức năng tiện dụng bổ trợ
    │   ├── socket.js          # Khởi tạo kết nối Socket.io ở Client
    │   ├── main.jsx           # Entry point của ứng dụng React.js
    │   └── App.jsx            # Cấu trúc Root component
    ├── tailwind.config.js     # Tùy chỉnh thiết lập cho Tailwind CSS
    ├── vite.config.js         # Settings cho quy trình Build & Dev Vite
    └── package.json           # Các package thư viện phụ thuộc phía Frontend
```

## 🔄 Luồng Hoạt Động (Workflow / Activities)

1. **Xác Thực & Quản Lý Người Dùng:** 
   - Đăng nhập, đăng ký sử dụng Token JSON Web (JWT). Access token được cấp và lưu trữ tại client để xác thực request lên server.
   - Thao tác thay đổi thông tin (Profile), thống kê tài khoản (Followers, Chuyên mục, Các câu hỏi).

2. **Hệ Thống Diễn Đàn & Câu Hỏi (Q&A):** 
   - Người dùng đăng tải câu hỏi (Question), đính kèm hastag để phân phối nội dung, các thành viên khác tiến hành bình luận, gửi câu trả lời (Answer).
   - Hệ thống hỗ trợ upvote/downvote xác định câu trả lời có ích hay không.

3. **Chức Năng Video (Bắt Chước TikTok/Reels):** 
   - Cung cấp giao diện trực quan quay video/upload video thông qua Cloudinary. Video có hỗ trợ chế độ tương tác theo luồng phân tách rõ ràng qua video room riêng.

4. **Tương Tác Real-Time (Thời Gian Thực):**
   - Tích hợp **Socket.io** thông tin và các hoạt động đẩy nhanh diễn ra lập tức: bình luận, phát thông báo (notifications), báo hiệu typing và giao tiếp qua phần trò chuyện cá nhân (Conversations và Message).  

5. **Khu Vực Quản Trị (Admin Dashboard):**
   - Admin kiểm soát nền tảng thông qua các API chuyên biệt: theo dõi chỉ số nền tảng (Statistics), kiểm soát Hashtag, cấm/cho phép người truy cập, và lọc từ ngữ nhạy cảm (Filtered Words) qua tính năng moderation.

## 🚀 Cách Cài Đặt Môi Trường Từ Git Và Chạy Dự Án

### 1. Clone Source Code (Mã Nguồn) Từ Git Về Máy
Mở Terminal / Command Prompt và chạy lệnh dưới để tải mã nguồn dự án:
```bash
git clone <đường-link-git-repository-của-bạn>
cd project_nodejs
```

### 2. Thiết Lập Hệ Thống Backend (Server)
```bash
# Di chuyển tới phía server
cd backend

# Cài đặt các thư viện Node.js dựa theo package.json
npm install

# Setup tệp biến môi trường
# Bạn hãy copy file `.env.example` và thiết lập lại thành file mới tên `.env` 
# Sau đó điền các khóa như MONGO_URI, CLOUDINARY thông tin, JWT_SECRET, PORT...
cp .env.example .env

# Mở kết nối Database MongoDB tại máy/công khai và tiến hành chạy local
npm run dev
```

### 3. Thiết Lập Frontend (Client)
Quay ra thư mục gốc qua tab terminal khác và chạy các lệnh:
```bash
# Di chuyển vào folder frontend
cd frontend

# Set up module phụ thuộc cho project react
npm install

# Khởi động công cụ build vite cho Frontend UI
npm run dev
```

### 4. Truy Cập Sử Dụng
Hãy truy cập đường dẫn mặc định Vite báo chạy thành công thông qua browser:
**(Thường là URL: http://localhost:5173)**


## 📬 Thông Tin Liên Hệ Chủ Project
Nếu bạn gặp vấn đề hoặc có các ý tưởng về dự án hay cần giải đáp:
- **Tác giả:** Nhut Cuong Le
- **Email/Contact:** (Thay thế địa chỉ E-mail của bạn tại đây)
- **GitHub:** [https://github.com/nhutcuongle](https://github.com/nhutcuongle)