# BẢN ĐĂNG KÝ ĐỀ TÀI TỐT NGHIỆP (CAPSTONE PROJECT REGISTER)

* **Thời gian thực hiện:** Từ 09/2026 đến 03/2027  
* **Ngành:** Kỹ thuật Phần mềm (Software Engineering) — **Chuyên ngành:** SE  
* **Đối tượng đăng ký:** Sinh viên  

---

### 1. Thông tin Giảng viên hướng dẫn
* **Họ và tên:** Nguyễn Trí Thông  
* **Email:** thongnt@fpt.edu.vn  
* **Chức danh:** Giảng viên  

---

### 2. Thông tin Nhóm sinh viên thực hiện
| STT | Họ và tên | Mã sinh viên | Số điện thoại | Email | Vai trò trong nhóm |
| :---: | :--- | :---: | :---: | :--- | :---: |
| 1 | **Nguyễn Viết Hoàng** | SE193892 | 0905053272 | viethoang032005@gmail.com | Trưởng nhóm (Leader) |
| 2 | **Nguyễn Xuân Hiệp** | SE194087 | 0365482281 | hipnguyendut25@gmail.com | Thành viên |
| 3 | **Hoàng Tùng Lâm** | SE182395 | 0982684703 | lamhtse182395@fpt.edu.vn | Thành viên |
| 4 | **Lại Thành Nhật Thiên** | SE182117 | 0939626055 | thienltnse182117@fpt.edu.vn | Thành viên |

---

### 3. Nội dung Đề tài Capstone Project

#### 3.1. Tên đề tài Capstone Project:
* **Tên tiếng Anh:** Group Travel Planning and Operations Management Platform for Businesses.  
* **Tên tiếng Việt:** Nền tảng Quản lý Lập kế hoạch và Điều hành Du lịch Đoàn cho Doanh nghiệp.  
* **Tên thương mại sản phẩm:** **TripOps**  
* **Mô hình hoạt động:** **Nền tảng Sàn Du lịch B2B2C (Business-to-Business-to-Consumer)** kết hợp **Liên minh Doanh nghiệp (B2B Alliance / Co-Hosting)**.

---

#### 3.2. Nội dung đề xuất chính (Bao gồm kết quả và sản phẩm):

##### a) Bối cảnh đề tài (Context):
Thị trường du lịch đoàn cho doanh nghiệp (Company Trip, Team-building, Gala, sự kiện dã ngoại) ngày càng phát triển mạnh mẽ và đòi hỏi chất lượng dịch vụ chuyên nghiệp, tính minh bạch tài chính cũng như khả năng tùy biến lịch trình linh hoạt. Trong chuỗi giá trị du lịch, các hoạt động đang kết nối theo **mô hình B2B2C**: các Nhà cung cấp dịch vụ địa phương (**B**usiness - Provider) cung ứng dịch vụ thành phần cho Công ty Lữ hành (**B**usiness - Tour Company) đóng gói, và Công ty lữ hành phân phối trực tiếp đến Khách hàng Doanh nghiệp cùng người đi tour cuối cùng (**C**onsumer). 

Tuy nhiên, chuỗi cung ứng B2B2C truyền thống này hiện đang gặp phải rất nhiều thách thức thực tế:
* **Dữ liệu dịch vụ B2B phân mảnh:** Các công ty lữ hành (B) gặp nhiều khó khăn và mất nhiều thời gian trong việc tìm kiếm, thẩm định, tổng hợp các dịch vụ thành phần (lưu trú, nhà hàng ăn uống, vé tham quan, trải nghiệm, hỗ trợ sự kiện) từ các nhà cung cấp địa phương (B).
* **Khó khăn trong tư vấn và lập lịch trình tour:** Khách hàng doanh nghiệp và người đi tour (C) tốn nhiều công sức để tìm kiếm tour phù hợp với ngân sách và quy mô đoàn; trong khi nhân viên kinh doanh của các công ty lữ hành (B) mất hàng giờ đồng hồ để tự thiết kế và soạn thảo lịch trình tour mới một cách thủ công.
* **Thiếu cơ chế liên minh B2B khi dẫn tour đa chặng:** Khi tổ chức các tour liên tỉnh, đa chặng (ví dụ: chặng TP.HCM – Đà Lạt – Nha Trang), một công ty lữ hành đơn lẻ khó có thể tự mình đảm bảo chất lượng dịch vụ và nhân sự ở tất cả các địa phương nếu không có cơ chế hợp tác, chia sẻ chặng và phân chia quyền lợi minh bạch với các công ty đối tác bản địa (B2B Co-Hosting).
* **Tùy biến lịch trình tour kém linh hoạt:** Khách hàng (C) thường xuyên có nhu cầu nâng/hạ sao khách sạn, đổi nhà hàng hoặc điều chỉnh điểm tham quan. Việc tính toán thủ công độ bù trừ chênh lệch giá thường mất nhiều thời gian, dễ nhầm lẫn và thiếu lịch sử lưu vết phiên bản (versioning).
* **Tác nghiệp hiện trường thủ công của Hướng dẫn viên:** Hướng dẫn viên (HDV) ngoài thực địa vẫn chủ yếu kiểm diện danh sách đoàn bằng sổ tay hoặc giấy in, thiếu ứng dụng di động chuyên dụng để check-in bằng chứng và báo cáo sự cố tức thời về cho trung tâm điều hành.
* **Rủi ro tài chính và thanh toán hai đầu:** Khách hàng (C) lo ngại thanh toán trực tiếp cho đơn vị lữ hành thiếu tên tuổi, trong khi doanh nghiệp lữ hành (B) gặp rủi ro bị bùng cọc hoặc khó khăn trong việc đôn đốc thanh toán theo từng mốc tiến độ hợp đồng.

##### b) Giải pháp đề xuất (Proposed Solutions):
Nền tảng **TripOps** được thiết kế như một **Nền tảng Sàn Du lịch B2B2C (Business-to-Business-to-Consumer)** tập trung, kết nối thông suốt chuỗi giá trị giữa 5 đối tượng cốt lõi:
1. **Business 1 (Service Provider):** Các nhà cung cấp dịch vụ địa phương (Khách sạn, Nhà hàng, Nhà xe, Điểm tham quan).
2. **Business 2 (Tour Company):** Các công ty lữ hành khai thác tài nguyên dịch vụ, thiết kế tour, liên minh B2B và điều hành.
3. **Consumer (Corporate Client & Travelers):** Khách hàng doanh nghiệp, trưởng đoàn và hành khách trực tiếp tùy biến, đặt tour và trải nghiệm.
4. **Tour Guide:** Nhân sự dẫn tour tác nghiệp trực tiếp ngoài hiện trường.
5. **Platform Admin:** Đơn vị vận hành sàn, kiểm duyệt chất lượng 2 chiều và bảo đảm tài chính ký quỹ.

Hệ thống kết hợp kiến trúc đa nền tảng: **Web Portal** (dành cho Admin, Công ty lữ hành, Provider, Khách hàng) và **Ứng dụng Di động chuyên biệt** (Mobile App dành riêng cho Hướng dẫn viên).

Nền tảng mang đến các giải pháp đột phá và thực tế:
* **Mô hình Kinh doanh B2B2C Hoàn chỉnh:** Kết nối trực tiếp nguồn cung ứng dịch vụ B2B (Provider) với các công ty lữ hành B2B (Tour Company) để tạo nên các sản phẩm tour hoàn chỉnh, đồng thời mở cổng cho khách hàng doanh nghiệp và người tiêu dùng (Consumer) trực tiếp đặt chỗ và tùy biến tour.
* **Tích hợp Trợ lý Trí tuệ Nhân tạo (AI-Powered Assistant):** AI đóng vai trò trợ lý hai chiều:
  1. *Tư vấn cho Khách hàng (C):* Gợi ý tour tối ưu dựa trên ngân sách, số khách, thời gian và sở thích đoàn;
  2. *Hỗ trợ Công ty Lữ hành (B):* Tự động sinh bản nháp lịch trình tour (Itinerary Draft) chi tiết từ nguồn tài nguyên dịch vụ sẵn có trên sàn, giúp rút ngắn thời gian thiết kế tour.
* **Cơ chế Ký quỹ An toàn B2B2C (Escrow Payment):** Khách hàng (C) thanh toán qua tài khoản trung gian của Sàn tích hợp mã VietQR tự động. Tiền được Sàn bảo đảm an toàn và chỉ thực hiện quyết toán giải ngân cho Công ty lữ hành (B) sau khi chuyến đi đã hoàn thành tốt đẹp.
* **Mô hình Liên minh Đa Công ty dẫn Tour (B2B Co-Hosting):** Cho phép các công ty lữ hành cùng phối hợp tổ chức một tour liên tỉnh, đa chặng. Hệ thống tự động hóa thỏa thuận giá chặng (Net price hoặc khoán chặng), tự tính tỷ lệ chia sẻ doanh thu và thiết lập thông tin bàn giao đoàn giữa các đội ngũ hướng dẫn viên.
* **Tùy biến Tour Linh hoạt kèm Snapshot Phiên bản (Tour Customization & Versioning):** Cho phép khách hàng tự do đổi khách sạn, đổi nhà hàng hoặc điểm đến với công thức tự động bù trừ chênh lệch giá (+/- VNĐ) tức thì. Mọi thay đổi của công ty lữ hành đều được lưu trữ dưới dạng snapshot phiên bản (v1, v2...), có thể so sánh và khôi phục khi cần.
* **Quản lý & Thêm bổ sung Hành khách vào Booking:** Cho phép cả Khách hàng và Công ty lữ hành dễ dàng bổ sung, điều chỉnh thông tin hành khách vào danh sách booking trước ngày khởi hành (hỗ trợ nhập file Excel cho đoàn đông người).
* **Kiểm duyệt Chất lượng 2 Cấp (Two-tier Quality Moderation):** Sàn thẩm định hồ sơ pháp lý của Công ty lữ hành và Provider; đồng thời kiểm duyệt nội dung của từng bài dịch vụ và từng tour đăng bán trước khi chính thức mở bán công khai.
* **Ứng dụng Di động Chuyên biệt cho HDV (Dedicated Mobile App):** Trang bị ứng dụng di động riêng biệt cho Hướng dẫn viên ngoài hiện trường: check-in điểm đến bằng camera/toạ độ, điểm danh nhanh quân số đoàn duy nhất tại thời điểm xuất phát khởi hành tour, và gửi báo cáo sự cố khẩn cấp tức thời về cho công ty điều hành.

---

##### c) Yêu cầu Chức năng theo từng Vai trò (Functional Requirements):

###### 1. Phân hệ Quản trị viên Sàn (Platform Admin — Web Portal):
* **Kiểm duyệt Đối tác B2B:** Thẩm định giấy phép kinh doanh lữ hành, MST của Công ty lữ hành (Duyệt / Từ chối / Đình chỉ); thẩm định thông tin pháp lý của Nhà cung cấp dịch vụ (Provider).
* **Phê duyệt Tour đăng bán (Tour Moderation):** Tiếp nhận tour do Công ty gửi lên sàn, xem xét tính hợp lệ của lịch trình, giá bán, chính sách hoàn hủy trước khi Phê duyệt (Approved) hoặc Từ chối (Rejected kèm lý do chỉnh sửa).
* **Kiểm duyệt Dịch vụ lẻ của Provider:** Duyệt nội dung, giá cả và hình ảnh các bài đăng dịch vụ (phòng, món ăn, vé tham quan, xe, trải nghiệm) trước khi đưa vào kho tài nguyên dùng chung.
* **Quản lý Tài chính & Ký quỹ (Escrow Settlement):** Cấu hình tài khoản ngân hàng sàn (VietQR) và tỷ lệ phí hoa hồng sàn (mặc định 8%). Theo dõi dòng tiền ký quỹ; thực hiện lệnh quyết toán giải ngân tiền cho Công ty lữ hành (và phân bổ cho đối tác liên minh) sau khi tour kết thúc.
* **Quản trị Toàn sàn & Khiếu nại:** Theo dõi danh sách booking, tour đang vận hành trên toàn hệ thống; quản lý khóa/mở tài khoản người dùng; tiếp nhận và xử lý khiếu nại giữa khách hàng và công ty lữ hành.

###### 2. Phân hệ Công ty Lữ hành (Tour Company / Company Admin — Web Portal):
* **Trợ lý AI Lập Lịch trình Tour (AI-assisted Itinerary Planner):** Nhập thông tin điểm đến, số ngày, loại hình tour ➔ AI tự động sinh khung lịch trình nháp chi tiết từng ngày, gợi ý phân bổ thời gian hợp lý; nhân viên có thể chỉnh sửa và hoàn thiện thành tour chính thức.
* **Quản lý Tour Trọn gói:** Khởi tạo, chỉnh sửa, nhân bản (`duplicate`), xóa tour; thiết lập lịch trình chi tiết từng ngày, điểm tham quan, bảng giá phân theo độ tuổi (người lớn, trẻ em 2–11 tuổi, trẻ dưới 2 tuổi).
* **Cấu hình Dịch vụ Thay thế:** Thiết lập danh sách khách sạn dự phòng (`alternativeHotels`) và nhà hàng thay thế (`alternativeMeals`) kèm giá bù trừ chênh lệch (+/- VNĐ).
* **Quản lý Phiên bản Tour (Tour Versioning):** Tự động lưu snapshot phiên bản tour (v1, v2, v3...) mỗi khi có thay đổi; cho phép xem lại lịch sử chỉnh sửa và khôi phục (restore) về phiên bản cũ bất cứ lúc nào.
* **Quy trình Xuất bản Tour:** Quản lý vòng đời tour từ Lưu bản nháp (Draft) ➔ Gửi Admin sàn duyệt (Pending Approval) ➔ Mở bán công khai (Published) ➔ Tạm ẩn/Đóng tour (Hidden).
* **Hợp tác Liên minh Đa Công ty (B2B Co-Hosting):** Gửi và nhận lời mời liên minh dẫn tour đa chặng; phân chia ngày và chặng phụ trách; thỏa thuận chi phí chặng (báo giá Net price/khách hoặc khoán cố định); tự động tính tỷ lệ % chia sẻ doanh thu; thiết lập thông tin bàn giao đoàn (thời gian, địa điểm, ghi chú HDV).
* **Xử lý Yêu cầu Tour riêng (`CustomTourRequest`):** Tiếp nhận yêu cầu thiết kế tour riêng từ doanh nghiệp; thiết kế tour gắn với yêu cầu (`designedTourId`); gửi báo giá và phản hồi cho khách hàng.
* **Quản lý Đội ngũ Hướng dẫn viên:** Thêm mới HDV nội bộ vào công ty (cấp tài khoản email/mật khẩu để HDV đăng nhập Mobile App); quản lý hồ sơ HDV (số thẻ HDV, hạn thẻ, ngoại ngữ sở trường, số điện thoại); phân công HDV phụ trách cho từng Booking cụ thể.
* **Quản lý Booking & Thêm Hành khách:** Tiếp nhận đơn đặt tour, duyệt/từ chối booking; điều chỉnh giá tổng có ghi chú giải trình; thêm/cập nhật thông tin hành khách vào booking; phát hành các đợt yêu cầu thanh toán (`PaymentRequest`: tiền cọc, các đợt trung gian, tất toán).

###### 3. Phân hệ Hướng dẫn viên (Tour Guide — Ứng dụng Di động Chuyên biệt Mobile App):
* **Cấu trúc 2 Phân hệ Chính (Bottom Navigation):** Được tinh gọn thành 2 tab lớn: **"Lịch tour"** (quản lý lịch phân công tổng quan) và **"Điều hành tour"** (không gian tác nghiệp trực tiếp cho tour đang dẫn).
* **Lịch Phân công Tour Trực quan (Calendar Schedule View):** Hiển thị lịch phân công dẫn tour dạng lịch tháng trực quan; các ngày có lịch nhận tour được **làm nổi bật rõ rệt** (highlight); HDV bấm vào ngày để tra cứu chi tiết thông tin tour (tên tour, điểm đến, trưởng đoàn, số lượng khách) và bấm nút **"Vào điều hành tour này"** để chuyển thẳng sang không gian tác nghiệp.
* **Không gian "Điều hành tour" tích hợp 4 Tab chức năng chuyên biệt:**
  * **1. Lộ trình Check-in Điểm đến:** Giao diện tối giản **chỉ hiển thị tên địa điểm** (đã loại bỏ khung giờ cố định); HDV bấm nút **Check-in** 1 chạm là hoàn tất ghi nhận tiến độ (chụp ảnh/ghi chú là tùy chọn). Mỗi địa điểm có nút bấm **"Báo sự cố tại địa điểm này"** (tự động điền vị trí vào biểu mẫu báo cáo). Đặc biệt, nút **"Báo Cáo Hoàn Thành & Kết Thúc Tour"** chỉ hiển thị tại **địa điểm cuối cùng** của hành trình và khi **tất cả các địa điểm trên toàn bộ tour đã được check-in đầy đủ**.
  * **2. Điểm danh Khởi hành (Departure Roll Call):** Danh sách hành khách hiển thị tinh gọn: **chỉ hiện Họ tên và Số điện thoại** (có nút gọi nhanh); **bên phải là ô Checkbox** để HDV tích chọn báo có mặt; bên dưới mỗi hành khách có **ô nhập Ghi chú riêng biệt** (để ghi chú đi trễ, hẹn điểm đón khác...).
  * **3. Sổ tay Ghi chép Nhanh:** Giữ lại tính năng ghi chú tự do tinh gọn duy nhất để HDV nhập nhanh thông tin quan trọng thực địa: số điện thoại bác tài, biển số xe, lưu ý khách ăn chay/lớn tuổi, giờ giấc tập trung và các phát sinh.
  * **4. Quản lý Báo cáo Sự cố:** Tab riêng biệt tập trung lưu vết toàn bộ các đợt báo cáo sự cố (y tế, giao thông, thời tiết, đối tác) trong suốt chuyến đi kèm thời gian, địa điểm, mức độ khẩn cấp và trạng thái xử lý từ trung tâm điều hành.
* **Đường dây nóng Khẩn cấp SOS:** Nút gọi SOS tích hợp trên đầu màn hình để tra cứu và bấm gọi nhanh 24/7 (Điều hành tour, Cấp cứu 115, Cảnh sát 113, Cứu nạn 114) bất cứ lúc nào. *(Hệ thống không sử dụng tính năng đánh giá/chấm điểm sao đối với HDV)*.

###### 4. Phân hệ Nhà cung cấp Dịch vụ (Service Provider — Web Portal):
* **Hồ sơ Doanh nghiệp B2B & Định vị GPS:** Đăng ký tài khoản doanh nghiệp; khai báo MST, thông tin liên hệ, địa chỉ chuẩn 2 cấp (Tỉnh/Thành phố, Phường/Xã) và toạ độ GPS chính xác qua bản đồ Google Map (chờ Admin duyệt).
* **Đăng tải & Quản lý Bài đăng Dịch vụ B2B (`ServicePostManagement`):** Đăng tải bài giới thiệu dịch vụ thuộc các nhóm: Lưu trú (`accommodation`), Ăn uống (`fnb`), Điểm tham quan (`attraction`), Trải nghiệm (`adventure`), Dịch vụ hỗ trợ (`support`). Cung cấp đầy đủ hình ảnh, giá, mô tả, tiện ích, thực đơn/hạng phòng.
* **Quản lý Trạng thái Dịch vụ:** Theo dõi tình trạng kiểm duyệt bài đăng: Chờ duyệt (Pending), Đã duyệt hiển thị (Approved), Bị từ chối (Rejected kèm lý do cần bổ sung).
* **Tích hợp vào Kho Tài nguyên Sàn B2B2C:** Các dịch vụ sau khi được duyệt sẽ hiển thị trong kho tài nguyên chung để các Công ty lữ hành lựa chọn đưa vào tour và Khách hàng tìm thấy để nâng cấp/thay thế dịch vụ khi tùy biến tour.

###### 5. Phân hệ Khách hàng / Doanh nghiệp (User / Corporate Client — Web Portal):
* **Trợ lý AI Tư vấn & Chọn Tour (AI Tour Recommender):** Khách hàng trò chuyện hoặc nhập yêu cầu (ngân sách, số khách, thời gian, sở thích trải nghiệm) ➔ AI tự động phân tích và gợi ý các tour phù hợp nhất đang có trên sàn hoặc hướng dẫn gửi yêu cầu thiết kế tour riêng.
* **Khám phá & Tùy biến Tour Linh hoạt:** Xem danh mục tour công khai, lịch trình chi tiết và bảng giá theo độ tuổi. Sử dụng tab **Lịch trình tùy chỉnh (Custom Tab)** để đổi khách sạn (nâng/hạ sao), đổi nhà hàng hoặc đổi điểm đến; hệ thống tính toán và hiển thị giá chênh lệch ngay lập tức.
* **Gửi Yêu cầu Tour riêng (`CustomTourRequest`):** Gửi yêu cầu thiết kế tour riêng cho cơ quan/đoàn thể: điểm đến, ngày đi/về, số lượng đoàn, ngân sách dự kiến/khách, tiêu chuẩn sao khách sạn, thông tin doanh nghiệp.
* **Quản lý & Thêm Hành khách vào Booking:** Nhập danh sách hành khách đi tour khi đặt chỗ hoặc bổ sung sau trước ngày khởi hành (hỗ trợ nhập file Excel cho các đoàn đông người); xem danh sách chi tiết các hành khách đã được xác nhận trong tour.
* **Ký Hợp đồng & Thanh toán Ký quỹ:** Xem hợp đồng tour điện tử (`TourContract`); nhận thông báo các đợt thanh toán (`PaymentRequest`); quét mã VietQR chuyển khoản vào tài khoản ký quỹ sàn.
* **Đánh giá & Khiếu nại/Hủy tour:** Đánh giá, chấm điểm sau khi hoàn thành tour; gửi yêu cầu hủy booking và đề nghị hoàn tiền theo chính sách quy định của tour.

---

##### d) Yêu cầu Phi chức năng (Non-Functional Requirements):
* **Tính khả dụng (Usability):** Giao diện Web Portal hiện đại, trực quan cho các vai trò quản trị (Admin, Công ty, Provider, Khách hàng). Ứng dụng Mobile App cho HDV được tối ưu thao tác bằng một tay, nút bấm lớn, tích hợp camera tiện lợi và hiển thị rõ ràng ngoài trời.
* **Hiệu năng (Performance):** Thời gian phản hồi các thao tác tra cứu, tính toán chênh lệch giá và check-in dưới 2 giây. Thời gian AI sinh phản hồi và gợi ý lịch trình không quá 5 giây.
* **Bảo mật & Phân quyền (Security & RBAC):** Kiểm soát truy cập nghiêm ngặt dựa trên vai trò (Role-Based Access Control) cho 5 nhóm người dùng trong mô hình B2B2C. Mã hóa mật khẩu an toàn, áp dụng JWT Authentication và bảo vệ các giao dịch tài chính ký quỹ.
* **Độ tin cậy (Reliability):** Sử dụng cơ chế lưu trữ snapshot phiên bản dữ liệu tour (`TourVersion`) đảm bảo không bị mất mát thông tin khi chỉnh sửa; cơ chế giao dịch ký quỹ tài chính đảm bảo tính toàn vẹn (ACID transactions).
* **Khả năng mở rộng & Bảo trì (Maintainability):** Mã nguồn xây dựng theo mô hình kiến trúc phân tầng sạch (Clean Architecture), tuân thủ nguyên lý SOLID, phân tách rõ ràng giữa tầng hiển thị, nghiệp vụ và truy xuất dữ liệu.

---

##### e) Cơ sở lý thuyết & Công nghệ áp dụng (Theory & Technologies):
* **Cơ sở lý thuyết:** Kỹ thuật thu thập và phân tích yêu cầu phần mềm, mô hình hóa luồng nghiệp vụ B2B2C (UML/BPMN), thiết kế máy trạng thái (State Machine cho Tour/Booking), thiết kế kiến trúc Clean Architecture, quy trình phát triển Agile/Scrum.
* **Công nghệ Web Portal (Client-side):** React, TypeScript, Vite, Tailwind CSS, Lucide React, Shadcn UI, Google Maps API Picker (cho Admin, Công ty lữ hành, Provider và Khách hàng).
* **Công nghệ Mobile App (Dành riêng cho HDV):** Ứng dụng di động (Flutter / React Native) dành riêng cho Hướng dẫn viên, tích hợp Camera chụp ảnh check-in thực tế và gọi điện khẩn cấp.
* **Công nghệ Trí tuệ Nhân tạo (AI Module):** Tích hợp Large Language Model API (OpenAI API / Gemini API) với cấu trúc prompt định dạng đầu ra chuẩn JSON, áp dụng cơ chế xác thực dữ liệu chặt chẽ trước khi đưa vào hệ thống.
* **Công nghệ Server-side (Backend dự kiến):** ASP.NET Core Web API (.NET 8), Entity Framework Core, SQL Server, SignalR (thông báo thời gian thực), JWT Authentication, Docker container.

---

##### f) Sản phẩm dự kiến bàn giao (Expected Deliverables):
1. **Responsive Web Portal B2B2C:** Phục vụ Platform Admin, Tour Company, Service Provider và Corporate Client, tích hợp module Trợ lý AI.
2. **Mobile Application chuyên dụng:** Dành riêng cho Hướng dẫn viên (Tour Guide Mobile App) phục vụ check-in, điểm danh khởi hành và báo cáo sự cố hiện trường.
3. **Bộ mã nguồn hoàn chỉnh (Source Code):** Mã nguồn Web, Mobile và Backend được cấu trúc chuẩn mực, tài liệu hướng dẫn cài đặt và triển khai.
4. **Bộ Tài liệu Kỹ thuật Phần mềm (Software Engineering Documentation):** URD, SRS, Thiết kế Kiến trúc, ERD, Swagger API Specification, Test Plan & Test Report, User Manual cho từng vai trò.

---

##### g) Phân chia các Gói công việc (Proposed Task Packages):
* **Gói 1 — Phân tích Yêu cầu & Kiến trúc Hệ thống B2B2C:** Hoàn thiện đặc tả 5 Actor, luồng nghiệp vụ B2B2C, sơ đồ Use Case, ERD, máy trạng thái của Tour & Booking trên cả Web và Mobile.
* **Gói 2 — Phân hệ Nhà cung cấp, Kiểm duyệt Sàn & Module AI (Web):** Hoàn thiện đăng ký Provider kèm toạ độ GPS; đăng bài dịch vụ; phân hệ Admin duyệt công ty, duyệt provider, duyệt bài dịch vụ và phê duyệt tour mở bán (`Admin Tour Moderation`); tích hợp Trợ lý AI gợi ý tour cho khách và AI sinh lịch trình nháp cho công ty.
* **Gói 3 — Quản lý Tour, Phiên bản & Liên minh Co-Hosting (Web):** Hoàn thiện CRUD tour; cấu hình dịch vụ thay thế; Tour Versioning & snapshot; tính năng mời và thiết lập liên minh đa công ty dẫn tour (B2B Co-Hosting).
* **Gói 4 — Phát triển Ứng dụng Di động cho HDV (Tour Guide Mobile App):** Xây dựng ứng dụng di động chuyên dụng cho Hướng dẫn viên: đăng nhập, xem lịch trình, camera check-in bằng ảnh, điểm danh đoàn viên lúc xuất phát và gửi báo cáo sự cố tức thời.
* **Gói 5 — Đặt tour, Thêm Hành khách, Ký quỹ Escrow & Đóng gói:** Hoàn thiện tùy biến tour (tự động tính chênh lệch giá); tính năng thêm/quản lý hành khách trong booking; ký hợp đồng; thanh toán VietQR ký quỹ sàn; quyết toán giải ngân tài chính; kiểm thử toàn diện và đóng gói hồ sơ bảo vệ.

---

### 4. Ý kiến khác (Other comments)
*(Để trống hoặc bổ sung các đề xuất liên quan khi cần thiết)*  
............................................................................................................................................................  
............................................................................................................................................................  

---

| **Giảng viên hướng dẫn (Supervisor)** | **Đại diện nhóm sinh viên (On behalf of Registers)** |
| :---: | :---: |
| *(Ký và ghi rõ họ tên)* | *(Ký và ghi rõ họ tên)* |
| <br><br><br> | <br><br><br> |
| **Nguyễn Trí Thông** | **Nguyễn Viết Hoàng** |
