# Rentify — Hệ thống quản lý và đặt phòng cho thuê

Ứng dụng SPA phục vụ đồ án Kỹ năng lập trình nâng cao:

- **Backend:** Java 17, Spring Boot 3, Spring Security, JWT, Spring Data JPA, MySQL.
- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, React Router, Axios.
- **Kiến trúc:** REST API theo layered architecture; DTO tách biệt dữ liệu API và entity.

## Yêu cầu môi trường

- JDK 17 trở lên
- Maven 3.8 trở lên
- Node.js 20 trở lên và npm
- Docker Desktop (cách chạy MySQL được khuyến nghị) hoặc MySQL 8.0+

## Khởi chạy nhanh

1. Khởi tạo database:

   ```powershell
   docker compose up -d mysql
   ```

2. Chạy API tại thư mục gốc:

   ```powershell
   mvn spring-boot:run
   ```

   API mặc định ở `http://localhost:8080`; giao diện Swagger ở
   `http://localhost:8080/swagger-ui.html`.

3. Chạy SPA:

   ```powershell
   cd frontend
   Copy-Item .env.example .env
   npm install
   npm run dev
   ```

   Mở `http://localhost:5173`.

### Chạy xem thử không cần cài MySQL

Có thể chạy backend bằng cơ sở dữ liệu H2 trong bộ nhớ và dữ liệu phòng mẫu:

```powershell
powershell -ExecutionPolicy Bypass -File .\run-demo.ps1
```

Chế độ này tạo một chủ nhà và một số phòng mẫu khi khởi động; dữ liệu sẽ bị xóa khi
backend dừng. Tài khoản chủ nhà mẫu: `chunha@rentify.local` / `Landlord123!`.
Script dùng đường dẫn junction tạm thời để hỗ trợ thư mục dự án có ký tự `;`, tránh
ký tự này bị Maven hiểu nhầm là dấu phân tách classpath trên Windows.

Frontend đọc URL API từ `VITE_API_URL`. Backend nhận kết nối trình duyệt từ
`http://localhost:5173`; có thể đổi `APP_CORS_ALLOWED_ORIGINS` thành danh sách origin
phân cách bằng dấu phẩy khi triển khai.

## Cấu hình và tài khoản khởi tạo

Các giá trị mặc định trong `application.yml` chỉ dành cho phát triển cục bộ.
Trước khi chia sẻ hoặc triển khai, hãy cấu hình biến môi trường:

| Biến | Mặc định phát triển | Ý nghĩa |
|---|---|---|
| `DB_URL` | `jdbc:mysql://localhost:3306/rentify?...` | JDBC URL |
| `DB_USERNAME` | `rentify` | Tài khoản database |
| `DB_PASSWORD` | `rentify` | Mật khẩu database |
| `JWT_SECRET` | bắt buộc khi chạy profile mặc định | Khóa ký JWT, tối thiểu 32 byte |
| `JWT_EXPIRATION_MS` | `86400000` | Thời hạn token |
| `ADMIN_EMAIL` | `admin@rentify.local` | Email admin khởi tạo |
| `ADMIN_PASSWORD` | `Admin123!ChangeMe` | Mật khẩu admin khởi tạo |
| `APP_CORS_ALLOWED_ORIGINS` | `http://localhost:5173` | Origin frontend được phép |

Admin được tạo tự động khi ứng dụng khởi động nếu email cấu hình chưa tồn tại.
Profile demo có khóa JWT và tài khoản mẫu riêng để chạy cục bộ; không dùng thông tin demo
hoặc `ddl-auto: update` trong môi trường production. `ddl-auto: update` được bật để thuận tiện cho đồ án.

Đăng ký tenant được duyệt tự động. Đăng ký landlord tạo tài khoản chờ duyệt; chỉ sau khi
admin duyệt tài khoản, chủ nhà mới có thể đăng nhập.

## Vai trò và nghiệp vụ

- **ADMIN:** xem thống kê, doanh thu hóa đơn đã thanh toán, danh sách chủ nhà chờ duyệt
  và duyệt tài khoản.
- **LANDLORD:** tạo/sửa/xóa phòng của mình, quản lý trạng thái khả dụng/bảo trì, duyệt
  hoặc từ chối yêu cầu, kết thúc lượt thuê và lập hóa đơn tháng.
- **TENANT:** tìm phòng theo khu vực/địa chỉ, khoảng giá, diện tích; gửi/hủy yêu cầu,
  xem lịch sử đặt phòng và hóa đơn của mình.

Quy trình đặt phòng: tenant gửi yêu cầu `PENDING`; landlord chấp nhận hoặc từ chối.
Khi chấp nhận, phòng chuyển sang `RENTED`; kết thúc lượt thuê sẽ trả phòng về `AVAILABLE`.
Không thể xóa phòng đã có lịch sử đặt hoặc hóa đơn. Mỗi phòng/tenant chỉ có một hóa đơn
trong một tháng.

## API chính

Tất cả API bắt đầu bằng `/api`; endpoint quản trị và nghiệp vụ yêu cầu
`Authorization: Bearer <JWT>`.

| Method | Endpoint | Quyền | Mục đích |
|---|---|---|---|
| POST | `/auth/register` | Public | Đăng ký tenant/landlord |
| POST | `/auth/login` | Public | Đăng nhập và nhận JWT |
| GET | `/rooms` | Public | Tìm kiếm, lọc và phân trang |
| GET | `/rooms/{id}` | Public | Xem chi tiết phòng |
| GET/POST | `/rooms/mine`, `/rooms` | LANDLORD | Xem phòng của tôi / đăng phòng |
| PUT/DELETE | `/rooms/{id}` | LANDLORD | Sửa / xóa phòng của mình |
| POST | `/bookings` | TENANT | Gửi yêu cầu đặt phòng |
| GET | `/bookings/mine` | TENANT | Lịch sử đặt phòng |
| GET | `/bookings/landlord` | LANDLORD | Yêu cầu gửi tới chủ nhà |
| PATCH | `/bookings/{id}/decision` | LANDLORD | Duyệt hoặc từ chối |
| PATCH | `/bookings/{id}/cancel` | TENANT | Hủy yêu cầu đang chờ |
| PATCH | `/bookings/{id}/complete` | LANDLORD | Kết thúc lượt thuê |
| POST | `/invoices` | LANDLORD | Lập hóa đơn điện/nước/dịch vụ |
| GET | `/invoices/mine` | TENANT | Xem hóa đơn cá nhân |
| GET | `/invoices/landlord` | LANDLORD | Xem hóa đơn đã lập |
| PATCH | `/invoices/{id}/paid` | TENANT | Đánh dấu hóa đơn đã thanh toán (demo) |
| GET | `/admin/stats` | ADMIN | Thống kê hệ thống |
| GET | `/admin/users`, `/admin/rooms` | ADMIN | Danh sách tài khoản / phòng toàn hệ thống |
| GET | `/admin/landlords/pending` | ADMIN | Chủ nhà chờ duyệt |
| PATCH | `/admin/landlords/{id}/approval` | ADMIN | Duyệt/thu hồi duyệt |

Ví dụ truy vấn tìm phòng:

```text
GET /api/rooms?area=Quan%201&minPrice=2000000&maxPrice=8000000&minArea=15&maxArea=50&page=0&size=12&sortBy=monthlyRent&direction=asc
```

Lỗi validation và nghiệp vụ trả JSON thống nhất gồm `timestamp`, `status`, `error`,
`message`, `path` và `validationErrors`.

## Cấu trúc dự án

```text
src/main/java/vn/rentify/
  config/       CORS và tạo admin ban đầu
  controller/   REST endpoints
  dto/          Request/response DTO
  entity/       JPA entities và enum
  exception/    Lỗi nghiệp vụ và global handler
  repository/   Spring Data JPA
  security/     JWT filter, user details, Spring Security
  service/      Nghiệp vụ ứng dụng
frontend/src/
  components/   Navbar, route protection, room card, trạng thái
  pages/        Login, Register, TenantHome, RoomDetail, dashboards
  routes/       Điều hướng được cấu hình trong App.tsx
  services/     Axios, authentication, API
```
