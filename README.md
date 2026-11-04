# Mây Spa — Landing peel da

Bản tĩnh HTML/CSS/JS, không cần npm/build, không có thư viện CDN. Logo chữ và hình SVG minh họa; không phải logo chính thức/ảnh kết quả. Giá 950.000đ là tham chiếu menu, cần chủ spa xác nhận trước phát hành.

## Upload GitHub
1. Tạo repository `may-spa-peel`, nhánh `main`.
2. Giải nén và upload **nội dung bên trong** thư mục này vào gốc repo. Giữ `.github/workflows/pages.yml`.
3. Settings → Pages → Source: GitHub Actions. Workflow sẽ đưa riêng file public lên Pages; không đưa backend lên website.
4. Có thể chạy xem tại máy bằng `python3 -m http.server 8000`, rồi mở localhost:8000. Đường dẫn tương đối hỗ trợ GitHub Pages dưới thư mục repo.

## Nhận lịch qua Google Sheet
1. Dùng bản template peel đã sao chép từ CRM nặn mụn: https://docs.google.com/spreadsheets/d/1n5YVQfGeqozJfuJ8VA3KDO_e-NjTaynkjuav-XOV8OE/edit . Giữ nguyên 5 tab và 26 cột LICH_HEN. Mở Extensions → Apps Script, dán `backend/Code.gs`.
2. Project Settings: chọn timezone Asia/Ho_Chi_Minh. Script Properties: đặt SPREADSHEET_ID bằng ID của bảng lịch.
3. Deploy → New deployment → Web app: execute as tài khoản quản lý lịch; quyền truy cập phù hợp cho khách không đăng nhập (Anyone nếu tài khoản cho phép). Không chia sẻ bảng lịch công khai.
4. Copy URL `/exec` vào `bookingEndpoint` trong config.js. Không dùng URL `/dev`.
5. Kiểm thử trực tiếp từ URL Pages: có dòng Sheet mới, phản hồi JSON đọc được, popup chỉ sau khi lưu; retry cùng request_id chỉ một dòng. Nếu môi trường chặn CORS/redirect, cần proxy cùng origin; không đổi sang no-cors vì không xác minh được kết quả.
6. Endpoint công khai không có cơ chế xác thực mạnh hoặc rate limit theo IP. Honeypot và khóa ghi trùng chỉ giảm lỗi, không thay thế chống spam. Theo dõi quota Apps Script; nếu có spam, dùng proxy kèm Turnstile kiểm chứng server-side trước chạy Ads quy mô lớn.

## Đo lường
Mặc định tắt analytics. `analyticsEnabled:true` chỉ đẩy dataLayer, không tự tải GTM/GA4. Cài tag thật và kiểm thử trước khi bật.
- booking_request_submit: sau backend xác nhận; dữ liệu chỉ landing_page/cta_position.
- phone_click: click tel, không đồng nghĩa gọi thành công.
- directions_click: click chỉ đường.
Không nhập đồng thời event auto form_submit và booking_request_submit thành hai conversion chính cho một lead. Không cấu hình tag đọc nội dung form. Không gửi tên, số điện thoại hoặc tình trạng da qua GA4. Bộ code không lưu dữ liệu form vào localStorage.

## Trước khi public / chạy Ads
- Xác nhận giá, phạm vi dịch vụ, địa chỉ, giờ nhận lịch và chính sách bảo mật/lưu giữ dữ liệu.
- Thay logo chữ/ảnh minh họa bằng tài sản thương hiệu nếu có. Không thêm đánh giá, ca kết quả hay số lượt chưa xác minh.
- Bản hiện tại có noindex ở hai trang. Khi chốt domain chính thức, bỏ noindex trang index, thêm canonical tuyệt đối, og:url, og:image thật, sitemap.xml và robots.txt phù hợp. Không canonical về domain giả. Privacy có thể tiếp tục noindex.
- Nếu dùng domain riêng, cấu hình Pages Custom domain và DNS theo nhà cung cấp. Không có CNAME giả trong repo.
- Form hiện nhận yêu cầu đặt lịch, chưa giữ chỗ theo sức chứa KTV. Nhân viên liên hệ xác nhận.
- Kiểm tra mobile 360/390px, bàn phím, ngày quá hạn/quá 30 ngày, khung giờ 09:00–19:30, mất mạng, gửi lặp, nguồn UTM và conversion thật.
- Apps Script xác thực server và khóa ghi; lưu số điện thoại dạng chuỗi, chặn công thức trong các trường text. Giới hạn quyền xem Sheet.

## Cấu trúc
index.html: nội dung; style.css: responsive; app.js: form/tracking; config.js: endpoint; privacy.html: bảo mật; backend/Code.gs: server nhận lịch; .github/workflows/pages.yml: deploy.

Không thay đổi landing nặn mụn đang chạy. Chưa cấu hình endpoint, tag đo lường, domain hoặc kết nối GitHub thật trong gói này.

## Đồng bộ CRM 04/11/2026
Giữ 5 tab LICH_HEN / TRANG_THAI / DANH_MUC / HUONG_DAN / BAO_CAO. Backend ghi đúng A:Z, nguồn landing_peel, trạng thái cho_xac_nhan, dịch vụ Peel da. Mã lịch dùng MAY-PEEL- + request_id để retry không trùng. Danh sách 10 mã trạng thái giống mẫu. Không sao chép dữ liệu khách nặn mụn sang lịch peel.
onEdit ghi lần cập nhật và mốc xác nhận/khách đến khi nhân viên chỉnh trạng thái. Chỉ có tác dụng khi script gắn đúng sheet; cần thử nghiệm thực tế.
Sheet nguồn dùng Asia/Saigon (cùng giờ Việt Nam). Báo cáo khách đã tới bao gồm da_den, dang_phuc_vu, hoan_tat. Sự kiện lead của bộ peel chỉ sau backend lưu; mã nặn mụn đang đọc có booking_request_submit trước xác nhận và generate_lead sau lưu. Cần chọn một conversion chính theo cấu hình Ads thật.
Chưa có quyền đọc/deploy Apps Script đang chạy thông qua connector hiện tại. Không khẳng định sao chép được deployment/trigger chỉ từ bản copy spreadsheet. Apps Script mới cần chủ sở hữu cấp quyền và deploy /exec.
