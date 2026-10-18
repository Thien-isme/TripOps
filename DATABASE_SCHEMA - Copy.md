Table users {
  id varchar(36) [pk, note: 'UUID định danh duy nhất người dùng']
  name varchar(150) [not null, note: 'Họ và tên hiển thị']
  email varchar(191) [unique, not null, note: 'Email chính đăng nhập']
  phone varchar(30) [note: 'Số điện thoại liên hệ']
  password_hash varchar(255) [note: 'Mật khẩu đã băm bcrypt/argon2']
  role user_role_enum [not null, default: 'user', note: 'Vai trò người dùng trong hệ thống']
  avatar varchar(500) [note: 'Đường dẫn ảnh đại diện']
  is_verified boolean [not null, default: true]
  status varchar(30) [not null, default: 'active', note: 'active, inactive, banned']
  created_at timestamp [not null, default: `now()` ]
  updated_at timestamp [not null, default: `now()` ]
}

Table business_profiles {
  id int [pk, increment]
  user_id int [unique] // hoặc gắn reference: > users.id
  business_name varchar(255)
  tax_code varchar(50)
  business_address text
  business_license_url text
  description text
  status varchar(50)
  rejection_reason text
  approved_at timestamp
  created_at timestamp [default: `now()`]
  updated_at timestamp [default: `now()`]
}

Table tours {
  id int [pk, increment]
  agency_id int // Khóa ngoại FK liên kết tới bảng agency/business tương ứng
  tour_code varchar(50)
  name varchar(255)
  destination text
  thoigian1 text
  thoigianhoatdongcuatour1 text
  duration_days int
  duration_nights int
  baseprice text
  min_participants int
  max_participants int
  diemnoibat text
  inclusions text
  exclusions text
  dieukienluuy1 text
  loinhan1 text
  thumbnail_urls text // hoặc json/text[] tùy hệ cơ sở dữ liệu
  image_urls text     // hoặc json/text[]
  status varchar(50)
  visibility varchar(50)
  is_request boolean [default: false] // tour thiết kế riêng
  version int [default: 1, note: 'Số phiên bản hiện tại đang áp dụng (v1, v2, v3...)']
  change_note text [note: 'Ghi chú tóm tắt lý do hoặc nội dung cập nhật của phiên bản hiện tại']
  custom_request_id int [note: 'FK tới tour_custom_requests.id']
  is_shared_to_customer boolean [default: false, note: 'Chỉ Host bật true khi sẵn sàng cho khách xem']
  is_ai_generated boolean [default: false]
  created_at timestamp [default: `now()`]
  updated_at timestamp [default: `now()`]
}



Table tour_pricing_tiers {
  id int [pk, increment]
  tour_id int // FK tham chiếu tới tours.id
  tier_name varchar(100)
  min_age int
  max_age int
  price decimal(12, 2)
  display_order int [default: 0]
}

Table tour_timeline {
  id int [pk, increment]
  tour_id int // FK tham chiếu tới tours.id
  day_number int
  title varchar(255)
  description text
}

Table tourist_attractions {
  id int [pk, increment]
  tour_timeline_id int
  name_location text
  agency_id varchar(36) [note: 'FK tới users.id - Agency phụ trách điểm đến này']
}


// 2. Bữa ăn của tour (Gồm tất cả các options món/nhà hàng của bữa đó)
Table tour_meals {
  id int [pk, increment]
  tour_timeline_id int [not null]
  meal_type varchar(20) [not null, note: 'breakfast, lunch, dinner']
  restaurant_name text [not null]
  description text
  is_default boolean [default: false, note: 'true: Phương án chuẩn theo tour gốc']
  price_difference decimal(12, 2) [default: 0, note: '0đ: Suất chuẩn theo tour | > 0: Option đổi món/nhà hàng']
  agency_id varchar(36)
  created_at timestamp [default: `now()`]
  updated_at timestamp [default: `now()`]
}

// 1. Chỗ ở của tour (Gồm tất cả các options mà công ty cung cấp)
Table tour_accommodations {
  id int [pk, increment]
  tour_id int [not null]
  destination_name varchar(255) [not null]
  hotel_name varchar(255) [not null]
  star_rating int [default: 3]
  nights_count int [default: 1]
  is_default boolean [default: false, note: 'true: Phương án chuẩn theo tour gốc']
  price_difference decimal(12, 2) [default: 0, note: '0đ: Phương án chuẩn theo giá tour | > 0: Option phụ thu']
  address_notes text
  agency_id varchar(36)
  created_at timestamp [default: `now()`]
  updated_at timestamp [default: `now()`]
}


Table tour_custom_requests {
  id int [pk, increment]
  
  // 1. CHỌN CÔNG TY DU LỊCH (Agency/Business Profile nhận yêu cầu)
  user_id varchar(36) // FK trỏ tới users.id (người dùng gửi form, có thể null nếu cho phép khách vãng lai)

  // 2. ĐẠI DIỆN ĐẶT TOUR
  contact_name varchar(150) [not null] // Người liên hệ, đại diện đặt tour (*)
  contact_email varchar(191) [not null] // Email cá nhân người đại diện (*)
  contact_phone varchar(30) [not null] // Hotline người liên hệ (*)

  // 3. THÔNG TIN THIẾT KẾ TOUR
  destination varchar(255) [not null] // Điểm đến mong muốn (*)
  departure_date date [not null] // Ngày khởi hành dự kiến
  return_date date // Ngày về
  number_of_participants int // Số người tham gia
  budget_per_person decimal(12, 2) // Chi phí dự kiến cho 1 người (VNĐ)
  hotel_rating_requirement varchar(50) // Khách sạn lưu trú (vd: 3 sao, 4 sao, 5 sao, resort...)

  // 4. THÔNG TIN BỔ SUNG THÊM
  special_requirements text // Các điểm tham quan, hoạt động tour, lửa trại... hay ghi chú khác

  // 5. TRẠNG THÁI XỬ LÝ CỦA HỆ THỐNG
  status varchar(50) [default: 'PENDING'] // PENDING, CONTACTED, QUOTED, ACCEPTED, CANCELLED
  created_at timestamp [default: `now()`]
  updated_at timestamp [default: `now()`]
}

// ============================================================================
// LỊCH SỬ PHIÊN BẢN & SAO LƯU TOUR (VERSION CONTROL & ROLLBACK)
// ============================================================================
Table tour_versions {
  id int [pk, increment]
  tour_id int [not null, note: 'FK tới tours.id']
  version int [not null, note: 'Số thứ tự phiên bản: 1, 2, 3...']
  change_note text [note: 'Ghi chú lý do thay đổi: VD: Nâng cấp Terracotta 4 sao và bổ sung Gala Dinner VIP...']
  price decimal(12, 2) [note: 'Giá tour tại thời điểm của phiên bản này']
  tour_snapshot json [not null, note: 'Bản sao snapshot toàn bộ cấu hình tour (lộ trình, khách sạn, ẩm thực, số khách) để khôi phục (rollback)']
  created_by varchar(36) [note: 'FK tới users.id - Nhân viên công ty thực hiện cập nhật/lưu bản sao']
  created_at timestamp [default: `now()`, note: 'Thời điểm tạo bản sao lưu']

  indexes {
    (tour_id, version) [unique, note: 'Mỗi tour chỉ có 1 bản ghi duy nhất cho mỗi số version']
  }
}

Ref: tour_versions.tour_id > tours.id
Ref: tour_versions.created_by > users.id

// 2. Bảng trung gian gán nhiều công ty cho 1 đơn
Table tour_custom_request_agencies {
  id int [pk, increment]
  request_id int [not null]
  agency_id int [not null]
  is_host boolean [default: false]          // true: Công ty chủ trì (Host), false: Đối tác được mời (Invitee)
  
  // Thông tin từ Form mời đối tác liên minh
  stage_area varchar(255)          // Chặng/Khu vực mời đối tác phối hợp
  suggested_budget decimal(12, 2)           // Ngân sách gợi ý cho chặng của đối tác (VNĐ/khách)
  communication_notes text              // Nội dung đã trao đổi ngoài hệ thống (Zalo / Điện thoại)
  
  // Trạng thái & Báo giá
  status varchar(50) [default: 'PENDING']   // PENDING, ACCEPTED, REJECTED, QUOTED
  assigned_at timestamp [default: `now()`]
  responded_at timestamp

  indexes {
    (request_id, agency_id) [unique]        // Mỗi công ty chỉ xuất hiện 1 lần trong 1 yêu cầu tour
  }
}


Table bookings {
  id int [pk, increment]
  booking_code varchar(50) [unique, not null]
  customer_id varchar(36) // FK tới users.id
  tour_id int // FK tới tours.id
  design_request_id int // FK tới tour_custom_requests.id (nếu đặt từ tour thiết kế riêng)
  departure_date date [not null]
  contact_full_name varchar(150) [not null]
  contact_phone varchar(30) [not null]
  contact_email varchar(191) [not null]
  contact_note text

  // --- BỔ SUNG CÁC TRƯỜNG QUẢN LÝ TÙY BIẾN & GIÁ CHỐT ---
  payment_status varchar(30) [default: 'unpaid', note: 'status: pending, confirmed, completed...) và trạng thái tiền (unpaid - chưa thanh toán, partially_paid - đã trả 1 phần/cọc, paid - đã trả đủ 100%, refunded - đã hoàn tiền)']
  has_customization boolean [default: false, note: 'true: có tùy biến khách sạn/ăn uống/điểm đến']
  original_total_price decimal(12, 2) [note: 'Tổng tiền gốc ban đầu trước khi công ty duyệt phụ thu/giảm trừ']
  total_price decimal(12, 2) [not null, note: 'Tổng tiền thực tế cuối cùng cần thanh toán']
  price_adjustment_note text [note: 'Ghi chú của công ty: Phụ thu nâng cấp phòng 450k + đổi bữa tối 60k...']
  price_adjusted_at timestamp [note: 'Thời điểm công ty chốt lại giá']

  status varchar(20) [default: 'pending', note: 'pending, confirmed, completed, cancelled, rejected']
  cancel_reason text
  cancelled_at timestamp
  created_at timestamp [default: `now()`]
  updated_at timestamp [default: `now()`]
}




Table booking_participants {
  id int [pk, increment]
  booking_id int [not null] // FK trỏ tới bookings.id
  full_name varchar(150) [not null]
  date_of_birth date
  gender varchar(20) // MALE, FEMALE, OTHER
  identity_card_number varchar(50) // CCCD / CMND / Hộ chiếu
  price double 
  note text // bị dị ứng / ăn chay /
  attendance_status varchar(50) [default: 'PENDING'] // PENDING, CHECKED_IN, ABSENT
  checked_by varchar(36) // FK trỏ tới users.id (người thực hiện điểm danh)
  checked_at timestamp
}

// ============================================================================
// 1. TỪNG NGÀY LỊCH TRÌNH CỦA ĐƠN BOOKING (Snapshot ngày & tiêu đề)
// ============================================================================
Table booking_timelines {
  id int [pk, increment]
  booking_id int [not null, note: 'FK tới bookings.id']
  day_number int [not null, note: 'Ngày 1, Ngày 2...']
  title varchar(255) [not null, note: 'VD: Ngày 1: Đón đoàn – Check-in Vinpearl Resort...']
  description text [note: 'VD: Xe đón khách tại sân bay Cam Ranh về bến cảng...']
  created_at timestamp [default: `now()`]
}

// ============================================================================
// 2. ĐIỂM THAM QUAN (Lưu cả điểm gốc & điểm đổi)
// ============================================================================
Table booking_timeline_attractions {
  id int [pk, increment]
  booking_timeline_id int [not null, note: 'FK tới booking_timelines.id']
  
  // ĐIỂM GỐC THEO TOUR BAN ĐẦU
  original_location_name varchar(255) [not null, note: 'Điểm gốc của tour (VD: Đảo Hòn Mun, Chợ đêm Đà Lạt)']
  
  // ĐIỂM MỚI NẾU KHÁCH ĐỀ XUẤT ĐỔI (NULL nếu đi theo tour)
  customized_location_name varchar(255) [note: 'Điểm mới khách muốn đi (VD: Hòn Tằm & Tắm bùn khoáng)']
  
  is_customized boolean [default: false, note: 'false: Đi theo tour mặc định | true: Có đổi điểm']
  customer_note text [note: 'Lý do hoặc mong muốn của khách khi đổi']
  price_difference decimal(12, 2) [default: 0, note: 'Phụ thu vé phát sinh (nếu có)']
  status varchar(30) [default: 'approved', note: 'pending (chờ duyệt), approved (đồng ý), rejected (từ chối)']
}

// ============================================================================
// 3. BỮA ĂN (Lưu nhà hàng gốc & nhà hàng mới - Hiển thị chữ "Mặc định")
// ============================================================================
Table booking_timeline_meals {
  id int [pk, increment]
  booking_timeline_id int [not null, note: 'FK tới booking_timelines.id']
  meal_type varchar(20) [not null, note: 'breakfast, lunch, dinner']
  
  // NHÀ HÀNG GỐC THEO TOUR (Hiện ở dòng "Mặc định: ...")
  original_restaurant_name varchar(255) [not null, note: 'VD: Nhà hàng Yến Sào Cam Ranh']
  
  // NHÀ HÀNG MỚI KHÁCH CHỌN ĐỔI (NULL nếu đi theo tour)
  customized_restaurant_name varchar(255) [note: 'VD: Nhà hàng Hải Sản Biển Xanh']
  
  price_difference decimal(12, 2) [default: 0, note: 'Chênh lệch giá (VD: 0đ nếu theo tour, +60.000đ nếu đổi)']
  is_customized boolean [default: false, note: 'false: Theo tour (0đ) | true: Đã đổi món/nhà hàng']
  customer_note text
  status varchar(30) [default: 'approved', note: 'pending, approved, rejected']
}

// ============================================================================
// 4. KHÁCH SẠN LƯU TRÚ (Lưu khách sạn gốc & khách sạn đổi)
// ============================================================================
Table booking_accommodations {
  id int [pk, increment]
  booking_id int [not null, note: 'FK tới bookings.id']
  destination varchar(100) [not null, note: 'Khu vực: Nha Trang, Đà Lạt...']
  
  // KHÁCH SẠN GỐC THEO TOUR
  original_hotel_name varchar(255) [not null, note: 'VD: Vinpearl Resort & Spa Nha Trang Bay']
  original_stars int [default: 5]
  
  // KHÁCH SẠN MỚI NẾU ĐỔI HẠNG / NÂNG CẤP (NULL nếu giữ nguyên)
  customized_hotel_name varchar(255) [note: 'VD: InterContinental Nha Trang']
  customized_stars int
  
  nights_count int [default: 1]
  price_difference decimal(12, 2) [default: 0, note: 'Chênh lệch (+450.000đ)']
  is_customized boolean [default: false, note: 'false: Theo tour | true: Đổi khách sạn']
  customer_note text
  status varchar(30) [default: 'approved', note: 'pending, approved, rejected']
}

// ============================================================================
// 1. CÁC ĐỢT YÊU CẦU THANH TOÁN (PAYMENT MILESTONES)
// ============================================================================
Table payment_requests {
  id int [pk, increment]
  booking_id int [not null, note: 'FK tới bookings.id']
  description varchar(255) [not null, note: 'Khớp 100% với ô nhập "Nội dung yêu cầu" trên Modal (công ty có thể gõ tự do: "Cọc đợt 1 (50%)", "Thanh toán đợt 2", "Phụ thu đổi khách sạn"...).'] 
  amount decimal(12, 2) [not null, note: 'Số tiền cần thu']
  due_date date [note: 'Hạn chót thanh toán']
  status varchar(30) [default: 'PENDING', note: 'PENDING, PAID, OVERDUE, CANCELLED']
  created_by varchar(36) [note: 'FK tới users.id']
  created_at timestamp [default: `now()`]
  paid_at timestamp
}

// ============================================================================
// 2. LỊCH SỬ GIAO DỊCH TIỀN NỘP VÀO HỆ THỐNG
// ============================================================================
Table payment_transactions {
  id int [pk, increment]
  booking_id int [not null, note: 'FK tới bookings.id']
  payment_request_id int [note: 'FK tới payment_requests.id']
  transaction_code varchar(100) [unique, not null, note: 'Mã GD ngân hàng/cổng thanh toán']
  payment_method varchar(50) [not null, note: 'BANK_TRANSFER, VNPAY, MOMO, CASH']
  amount decimal(12, 2) [not null, note: 'Số tiền thực nộp']
  status varchar(30) [default: 'SUCCESS', note: 'SUCCESS, PENDING, FAILED, REFUNDED']
  payer_name varchar(150)
  payment_proof_url text [note: 'Ảnh chụp bill']
  paid_at timestamp [default: `now()`]
}

// ============================================================================
// 3. NHẬT KÝ ĐIỀU CHỈNH TĂNG / GIẢM GIÁ TOUR DO PHÁT SINH
// ============================================================================
Table booking_price_adjustments {
  id int [pk, increment]
  booking_id int [not null, note: 'FK tới bookings.id']
  adjusted_by varchar(36) [not null, note: 'FK tới users.id - Người sửa giá']
  previous_total_price decimal(12, 2) [not null, note: 'Giá trước khi sửa']
  adjustment_amount decimal(12, 2) [not null, note: 'Chênh lệch (+ tăng, - giảm)']
  new_total_price decimal(12, 2) [not null, note: 'Giá mới sau khi sửa']
  reason text [not null, note: 'Lý do đổi giá theo trao đổi với khách']
  created_at timestamp [default: `now()`]
}

// Các liên kết khóa ngoại
Ref: payment_requests.booking_id > bookings.id
Ref: payment_requests.created_by > users.id
Ref: payment_transactions.booking_id > bookings.id
Ref: payment_transactions.payment_request_id > payment_requests.id
Ref: booking_price_adjustments.booking_id > bookings.id
Ref: booking_price_adjustments.adjusted_by > users.id



















// ============================================================================
// CÁC KHÓA NGOẠI REFS
// ============================================================================
Ref: booking_timelines.booking_id > bookings.id
Ref: booking_timeline_attractions.booking_timeline_id > booking_timelines.id
Ref: booking_timeline_meals.booking_timeline_id > booking_timelines.id
Ref: booking_accommodations.booking_id > bookings.id

// Các liên kết khóa ngoại (Refs)
Ref: booking_participants.booking_id > bookings.id
Ref: booking_participants.checked_by > users.id

// Các liên kết khóa ngoại (Refs)
Ref: bookings.customer_id > users.id
Ref: bookings.tour_id > tours.id
Ref: bookings.design_request_id > tour_custom_requests.id


























// 1. Nhiều mốc timeline thuộc về 1 tour (tours -> tour_timeline)
Ref: tour_timeline.tour_id > tours.id

// 2. Nhiều mức giá thuộc về 1 tour (tours -> tour_pricing_tiers)
Ref: tour_pricing_tiers.tour_id > tours.id

// 3. Nhiều địa điểm tham quan thuộc về 1 mốc timeline (tour_timeline -> tourist_attractions)
Ref: tourist_attractions.tour_timeline_id > tour_timeline.id

// 4. Nhiều bữa ăn thuộc về 1 mốc timeline (tour_timeline -> tour_meals)
Ref: tour_meals.tour_timeline_id > tour_timeline.id

// 1. Một doanh nghiệp/agency tạo được nhiều tour (business_profiles -> tours)
Ref: tours.agency_id > users.id

// 2. Một user có một hồ sơ doanh nghiệp (users -> business_profiles)
Ref: business_profiles.user_id - users.id


Ref: tour_accommodations.tour_id > tours.id

// 3. Quan hệ (References)
Ref: tour_custom_requests.user_id > users.id
Ref: tour_custom_request_agencies.request_id > tour_custom_requests.id
Ref: tour_custom_request_agencies.agency_id > users.id



Ref: tours.custom_request_id > tour_custom_requests.id





















