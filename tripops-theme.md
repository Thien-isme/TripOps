# TripOps Design System & Color Tokens (Quiet Luxury & Minimalist Edition)

## 1. Core Brand Palette (> 25 tuổi - Elegant & High-End)
TripOps định hướng là nền tảng quản lý và đặt tour du lịch cao cấp, bền vững và cá nhân hoá dành cho du khách trưởng thành (> 25 tuổi). Hệ màu này thay thế bảng màu cũ nhằm mang lại trải nghiệm thị giác tĩnh lặng, sang trọng (Quiet Luxury) và thanh thoát:

- **Primary Brand (Obsidian Forest):** `#15291E`
  - *Sử dụng:* Nhận diện thương hiệu cốt lõi, Header/Navigation, tiêu đề lớn (H1, H2), viền cấu trúc quan trọng, nút hành động chính cấp doanh nghiệp.
  - *Hover/Focus state:* `#0E1B14`
- **Accent / Call To Action (Warm Muted Terracotta):** `#BD5E38`
  - *Sử dụng:* Nút chuyển đổi (Book Now, Đặt tour, Tìm kiếm nhanh), badge điểm nhấn, giá trị nổi bật, hover link.
  - *Hover state:* `#A34C2A`
- **Background / Canvas Light (Sandstone Warm White):** `#FBF9F5`
  - *Sử dụng:* Màu nền toàn bộ website (canvas), tạo chiều sâu ấm áp và cảm giác dễ chịu hơn màu trắng tinh khôi thông thường.
- **Surface / Card Background:** `#FFFFFF`
  - *Sử dụng:* Container thẻ tour, form tìm kiếm thông minh, modal popup, menu dropdown.
- **Base Text & Foreground (Deep Espresso):** `#191A19`
  - *Sử dụng:* Tiêu đề, văn bản chính, chữ số giá trị.
- **Muted Text / Border:**
  - *Muted Text:* `#686C67` (màu xám tro ấm cho metadata: thời lượng, địa điểm, số khách).
  - *Border / Divider:* `#E8E4DC` (đường viền hairline tinh xảo, thanh mảnh).

## 2. Quy tắc ứng dụng màu (60-30-10 Rule)
- **60% Base & Background:** Nền trang chủ đạo `#FBF9F5` phối hợp thẻ `#FFFFFF` thoáng đãng, nhiều khoảng trắng để hình ảnh phong cảnh chất lượng cao tự tỏa sáng.
- **30% Structure & Contrast:** Sử dụng `#15291E` cho các khối điều hướng, typography chính và các divider thanh lịch.
- **10% Accent Focus:** Giữ màu `#BD5E38` độc quyền cho các điểm chốt hành vi (CTA buttons, highlight giá, trạng thái active). Tuyệt đối không lạm dụng làm nền mảng lớn.

---

## 3. Tailwind CSS Configuration (v3 / v4 compatible)
Cấu hình màu mở rộng cho Tailwind CSS:

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#15291E',
          'primary-hover': '#0E1B14',
          accent: '#BD5E38',
          'accent-hover': '#A34C2A',
        },
        surface: {
          canvas: '#FBF9F5',
          card: '#FFFFFF',
          text: '#191A19',
          muted: '#686C67',
          border: '#E8E4DC',
        }
      }
    }
  }
}
```
