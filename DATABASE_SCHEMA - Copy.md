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


Table tour_meals {
  id int [pk, increment]
  tour_timeline_id int
  meal_type varchar(20) // 'breakfast', 'lunch', 'dinner' 
  restaurant_name text
  description text
  agency_id varchar(36) [note: 'FK tới users.id - Agency phụ trách bữa ăn này']
}

Table tour_meal_options {
  id int [pk, increment]
  tour_meal_id int [not null, note: 'FK tới tour_meals.id']
  restaurant_name varchar(255) [not null, note: 'Tên nhà hàng đổi món / nâng cấp']
  price_difference decimal(12, 2) [default: 0, note: 'Giá chênh lệch / người (VNĐ)']
  description text [note: 'Mô tả thực đơn, không gian,...']
  created_at timestamp [default: `now()`]
  updated_at timestamp [default: `now()`]
}

Ref: tour_meal_options.tour_meal_id > tour_meals.id
// 1. Chỗ lưu trú mặc định của Tour
Table tour_accommodations {
  id int [pk, increment]
  tour_id int [not null] // FK trỏ tới tours.id
  hotel_name varchar(255) [not null] // Tên khách sạn / Resort mặc định của tour
  destination_name varchar(255) // Điểm đến / Khu vực lưu trú
  nights_count int [default: 1] // Số đêm lưu trú
  star_rating int // Số sao của khách sạn (1 - 5)
  address_notes text // Địa chỉ / Ghi chú phòng
  agency_id varchar(36) [note: 'FK tới users.id - Agency phụ trách chỗ lưu trú này']
  created_at timestamp [default: `now()`]
  updated_at timestamp [default: `now()`]
}

// 2. Danh sách khách sạn nâng cấp / đổi hạng cho khách chọn
Table tour_accommodation_options {
  id int [pk, increment]
  tour_accommodation_id int [not null] // FK trỏ tới tour_accommodations.id
  hotel_name varchar(255) [not null] // Tên khách sạn đổi hạng / nâng cấp
  star_rating int // Số sao (1 - 5)
  price_difference decimal(12, 2) [default: 0] // Giá chênh lệch (VNĐ)
  address_notes text // Địa chỉ / Ghi chú phòng
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
  total_price decimal(12, 2) [not null]
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
Ref: tour_accommodation_options.tour_accommodation_id > tour_accommodations.id

// 3. Quan hệ (References)
Ref: tour_custom_requests.user_id > users.id
Ref: tour_custom_request_agencies.request_id > tour_custom_requests.id
Ref: tour_custom_request_agencies.agency_id > users.id



Ref: tours.custom_request_id > tour_custom_requests.id





















