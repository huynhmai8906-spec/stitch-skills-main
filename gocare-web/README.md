# GoCare 5-Star Healthcare & Luxury Geriatric Clinic Platform

> Nền tảng Y khoa & Viện Dưỡng Lão 5 Sao GoCare (Phát triển từ dự án Stitch: **Interactive Image Click Animations**).

---

## 🌟 Tổng Quan Dự Án

Dự án cung cấp giải pháp Fullstack hoàn chỉnh cho hệ thống y tế GoCare:
- **Backend (Node.js & Express REST API)**: Cung cấp API điều phối bác sĩ/điều dưỡng, thuật toán tìm đường ngắn nhất **Dijkstra / A\*** cho cấp cứu y tế, bệnh án điện tử (EHR) theo dõi sinh hiệu thời gian thực, quản lý đơn thuốc & kho dược phẩm (liên kết Long Châu, An Khang), và **Trợ lý Sức Khỏe AI 24/7**.
- **Frontend (Vite, Vanilla JS & Tailwind/Design Tokens)**: Giao diện thẩm mỹ cao cấp theo đúng chuẩn thiết kế Stitch (font Playfair Display & Plus Jakarta Sans, bảng màu phong cách Editorial Luxury & Medical Sanctuary), tích hợp đầy đủ **Interactive Image Click Animations** (hiệu ứng phóng to Lightbox, pop click, ripple waves, radar quét vệ tinh).

---

## 📁 Cấu Trúc Thư Mục

```
gocare-web/
├── server/                                # Backend REST API Server (Port 4000)
│   ├── algorithms/
│   │   └── dijkstra.js                    # Thuật toán Dijkstra & A* điều phối y tế
│   ├── data/
│   │   ├── caregivers.json                # Hồ sơ Bác sĩ & Điều dưỡng có CCHN
│   │   ├── ehr.json                       # Bệnh án điện tử & chỉ số sinh hiệu (BP, SpO2, HeartRate)
│   │   ├── pharmacy.json                  # Dược phẩm & liên kết Long Châu / An Khang
│   │   ├── bookings.json                  # Danh sách lịch đặt ca trực
│   │   └── reviews.json                   # Đánh giá lâm sàng
│   ├── index.js                           # Express App & các routes
│   └── package.json
│
├── client/                                # Frontend Web Application (Port 5173)
│   ├── src/
│   │   ├── css/
│   │   │   └── style.css                  # Design tokens, Animation & Keyframes
│   │   └── js/
│   │       ├── api.js                     # API Client kết nối Backend
│   │       ├── dijkstra-radar.js          # Điều khiển mô phỏng Radar & Dijkstra
│   │       ├── ai-chat.js                 # Trợ lý AI Care Assistant 24/7
│   │       ├── ehr.js                     # Cổng bệnh nhân & ghi nhận sinh hiệu
│   │       ├── booking.js                 # Xử lý Modal đặt lịch & Đánh giá
│   │       └── app.js                     # Main App Coordinator
│   ├── index.html                         # Giao diện đơn nhất 4 Tab chuyên sâu
│   ├── vite.config.js                     # Cấu hình Vite & API Reverse Proxy
│   └── package.json
│
├── package.json                           # Điều phối chạy đồng thời Client & Server
└── README.md
```

---

## 🚀 Hướng Dẫn Khởi Chạy

### 1. Khởi chạy Backend Server (Port 4000)
```bash
cd server
npm start
```
*Backend sẽ lắng nghe tại: `http://localhost:4000` (Kiểm tra sức khỏe tại `http://localhost:4000/api/health`)*

### 2. Khởi chạy Frontend Client (Port 5173)
Mở một cửa sổ dòng lệnh khác:
```bash
cd client
npm run dev
```
*Mở trình duyệt truy cập: `http://localhost:5173`*

---

## ⚡ Các Tính Năng Trọng Tâm

1. **4 Tab Chức Năng Hoàn Chỉnh**:
   - **Tab 1: Trang Chủ & Không Gian Y Khoa**: Kiến trúc trị liệu, phòng Suite Tổng Thống, bảng giá dịch vụ Ngoại trú - Bán trú - Nội trú.
   - **Tab 2: Đội Ngũ Có CCHN & Radar GPS (Dijkstra / A\*)**: Lọc theo chuyên khoa, khu vực, khung ca trực (4h, 8h, 12h, 24h). Bản đồ radar cho phép chọn điểm xuất phát & điểm bệnh nhân để chạy thuật toán Dijkstra tính toán khoảng cách và thời gian tối ưu.
   - **Tab 3: Wellness & Nhà Thuốc (Long Châu & An Khang)**: Cung cấp thiết bị y tế thông minh Omron, sữa y học Fortimel, băng gạc chống loét và đông trùng hạ thảo.
   - **Tab 4: Cổng Bệnh Nhân (EHR Telemetry)**: Bệnh án điện tử bảo mật chuẩn HIPAA/HL7, cập nhật chỉ số sinh tồn (huyết áp, nhịp tim, SpO2, đường huyết) và lịch uống thuốc theo thời gian thực.

2. **Interactive Image Click Animations**:
   - Nhấp vào bất kỳ ảnh nào để kích hoạt hiệu ứng pop và mở Lightbox xem chi tiết phóng to chất lượng cao.
   - Hiệu ứng sóng nước (Ripple waves) khi bấm nút tương tác.
   - Hiệu ứng quét radar thời gian thực và xung nhịp chuyển động tuyến đường tối ưu.

3. **Trợ Lý Y Tế AI 24/7**:
   - Widget chat thông minh nổi ở góc phải màn hình, hỗ trợ tư vấn xử lý triệu chứng (như huyết áp 145/90 mmHg), nhắc lịch uống thuốc, hướng dẫn bài thở 4-7-8, kích hoạt điều phối khẩn cấp và mô phỏng nhận diện giọng nói.
