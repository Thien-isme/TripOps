import { Booking } from "@/app/types";
import { getMockTourById } from "./mockData";

export function createStatusMatrixBookings(): Booking[] {
  return [
    // ==========================================================================
    // 1. [Pending + Unpaid] - CHỜ XỬ LÝ / CHỜ CỌC
    // Đơn mới gửi, Agency chưa duyệt, chưa thanh toán (0đ)
    // -> Bấm Hủy -> HỦY TRỰC TIẾP NGAY LẬP TỨC (0đ, không cần qua Admin)
    // ==========================================================================
    {
      id: "pending-unpaid",
      tourId: "tour-6",
      tour: getMockTourById("tour-6"),
      userId: "user-1",
      userName: "Phạm Hải Đăng",
      userEmail: "khachhang.fpt@gmail.com",
      contactName: "Phạm Hải Đăng",
      contactPhone: "0933 888 999",
      contactEmail: "khachhang.fpt@gmail.com",
      contactAddress: "Tòa nhà FPT, Cầu Giấy, Hà Nội",
      numberOfGuests: 2,
      totalPrice: 14400000,
      originalTotalPrice: 14400000,
      depositAmount: 0,
      depositPaid: false,
      paymentStatus: "unpaid",
      status: "pending",
      bookingDate: "2026-10-24",
      tourStartDate: "2026-11-15",
      companyId: "company-1",
      companyName: "Fiditour",
      bookingNotes:
        "Case 1 (Pending + Unpaid): Đơn mới gửi, chưa thanh toán cọc. Bấm hủy sẽ hủy ngay lập tức không mất phí.",
      passengers: [
        { id: "p-m1-1", fullName: "Phạm Hải Đăng", ageGroup: "adult", price: 7200000 },
        { id: "p-m1-2", fullName: "Nguyễn Thu Thảo", ageGroup: "adult", price: 7200000 },
      ],
    },

    // ==========================================================================
    // 2. [Deposited + PartiallyPaid] - ĐÃ ĐẶT CỌC
    // Khách đã đóng cọc 15.000.000đ (>= 30%). Đã giữ chỗ chắc chắn.
    // -> Bấm Hủy -> KÍCH HOẠT FORM HOÀN TIỀN CỌC (15.000.000đ) QUA ADMIN
    // ==========================================================================
    {
      id: "pending-deposit",
      tourId: "tour-2",
      tour: getMockTourById("tour-2"),
      userId: "user-1",
      userName: "Phạm Hải Đăng",
      userEmail: "khachhang.fpt@gmail.com",
      contactName: "Phạm Hải Đăng",
      contactPhone: "0933 888 999",
      contactEmail: "khachhang.fpt@gmail.com",
      contactAddress: "Tòa nhà FPT, Cầu Giấy, Hà Nội",
      numberOfGuests: 5,
      totalPrice: 35000000,
      originalTotalPrice: 35000000,
      depositAmount: 15000000,
      depositPaid: true,
      remainingAmount: 20000000,
      paymentStatus: "partially_paid",
      status: "deposited",
      bookingDate: "2026-10-23",
      tourStartDate: "2026-11-25", // Còn 31 ngày >= 7 ngày
      companyId: "company-2",
      companyName: "Hà Giang Discovery Travel",
      bookingNotes:
        "Case 2 (Deposited + PartiallyPaid): Khách đã đóng cọc 15.000.000đ. Trạng thái đơn là Đã đặt cọc. Khi hủy sẽ kích hoạt hoàn tiền cọc.",
    },

    // ==========================================================================
    // 3. [Confirmed + Unpaid] - ĐÃ XÁC NHẬN (CHƯA THANH TOÁN)
    // Agency duyệt đơn cho thanh toán sau / lên xe trả tiền (0đ)
    // -> Bấm Hủy -> HỦY TRỰC TIẾP NGAY LẬP TỨC (Không mất phí)
    // ==========================================================================
    {
      id: "confirmed-unpaid",
      tourId: "tour-5",
      tour: getMockTourById("tour-5"),
      userId: "user-1",
      userName: "Phạm Hải Đăng",
      userEmail: "khachhang.fpt@gmail.com",
      contactName: "Phạm Hải Đăng",
      contactPhone: "0933 888 999",
      contactEmail: "khachhang.fpt@gmail.com",
      numberOfGuests: 2,
      totalPrice: 14600000,
      originalTotalPrice: 14600000,
      depositAmount: 0,
      depositPaid: false,
      paymentStatus: "unpaid",
      status: "confirmed",
      bookingDate: "2026-10-20",
      tourStartDate: "2026-11-10",
      companyId: "company-4",
      companyName: "Hà Giang Discovery",
      bookingNotes:
        "Case 3 (Confirmed + Unpaid): Agency đã duyệt nhưng khách chưa thanh toán tiền. Khi hủy sẽ hủy trực tiếp 0đ.",
    },

    // ==========================================================================
    // 4. [Confirmed + PartiallyPaid] - ĐÃ XÁC NHẬN (ĐÃ CỌC MỘT PHẦN)
    // Agency đã duyệt & Khách đã đóng cọc 12.000.000đ
    // -> Bấm Hủy -> Mở form hoàn tiền cọc theo chính sách sàn
    // ==========================================================================
    {
      id: "confirmed-deposit",
      tourId: "tour-4",
      tour: getMockTourById("tour-4"),
      userId: "user-1",
      userName: "Phạm Hải Đăng",
      userEmail: "khachhang.fpt@gmail.com",
      contactName: "Phạm Hải Đăng",
      contactPhone: "0933 888 999",
      contactEmail: "khachhang.fpt@gmail.com",
      numberOfGuests: 4,
      totalPrice: 24000000,
      originalTotalPrice: 24000000,
      depositAmount: 12000000,
      depositPaid: true,
      remainingAmount: 12000000,
      paymentStatus: "partially_paid",
      status: "confirmed",
      bookingDate: "2026-10-21",
      tourStartDate: "2026-11-28", // Còn 34 ngày >= 7 ngày
      companyId: "company-1",
      companyName: "Viettravel",
      bookingNotes:
        "Case 4 (Confirmed + PartiallyPaid): Agency đã duyệt và khách đã cọc 12.000.000đ. Khi hủy sẽ mở hoàn tiền cọc.",
    },

    // ==========================================================================
    // 5. [Paid + Paid] - ĐÃ THANH TOÁN ĐỦ 100% (HỦY TRƯỚC >= 7 NGÀY -> HOÀN 100%)
    // Đã thanh toán 16.500.000đ. Khởi hành 20/11/2026 (Còn 26 ngày >= 7 ngày)
    // -> Bấm Hủy -> Tự động tính hoàn 100% (16.500.000đ, phí hủy 0đ)
    // ==========================================================================
    {
      id: "confirmed-paid-100",
      tourId: "tour-1",
      tour: getMockTourById("tour-1"),
      userId: "user-1",
      userName: "Phạm Hải Đăng",
      userEmail: "khachhang.fpt@gmail.com",
      contactName: "Phạm Hải Đăng",
      contactPhone: "0933 888 999",
      contactEmail: "khachhang.fpt@gmail.com",
      contactAddress: "Tòa nhà FPT, Cầu Giấy, Hà Nội",
      numberOfGuests: 3,
      totalPrice: 16500000,
      originalTotalPrice: 16500000,
      depositAmount: 16500000,
      depositPaid: true,
      paymentStatus: "paid",
      status: "paid", // Trạng thái đơn mới: Paid (Đã thanh toán đủ)
      bookingDate: "2026-10-18",
      tourStartDate: "2026-11-20", // Còn 26 ngày >= 7 ngày -> Hoàn 100%
      companyId: "company-1",
      companyName: "Viettravel",
      bookingNotes:
        "Case 5 (Paid + Paid): Đã thanh toán 100%, trạng thái đơn là Đã thanh toán đủ. Hủy trước 26 ngày -> Hoàn 100%.",
    },

    // ==========================================================================
    // 6. [Paid + Paid] - ĐÃ THANH TOÁN ĐỦ 100% (HỦY TRƯỚC 3-6 NGÀY -> HOÀN 50%)
    // Đã thanh toán 18.000.000đ. Khởi hành 30/10/2026 (Còn 5 ngày -> khung 3-6 ngày)
    // -> Bấm Hủy -> Tự động tính hoàn 50% (9.000.000đ, phí phạt 50%)
    // ==========================================================================
    {
      id: "confirmed-paid-50",
      tourId: "tour-2",
      tour: getMockTourById("tour-2"),
      userId: "user-1",
      userName: "Phạm Hải Đăng",
      userEmail: "khachhang.fpt@gmail.com",
      contactName: "Phạm Hải Đăng",
      contactPhone: "0933 888 999",
      contactEmail: "khachhang.fpt@gmail.com",
      numberOfGuests: 3,
      totalPrice: 18000000,
      originalTotalPrice: 18000000,
      depositAmount: 18000000,
      depositPaid: true,
      paymentStatus: "paid",
      status: "paid", // Trạng thái đơn mới: Paid (Đã thanh toán đủ)
      bookingDate: "2026-10-15",
      tourStartDate: "2026-10-30", // Còn 5 ngày (khung 3-6 ngày) -> Hoàn 50%
      companyId: "company-2",
      companyName: "Phú Quốc Discovery",
      bookingNotes:
        "Case 6 (Paid + Paid): Hủy trước 5 ngày khởi hành -> Tự tính hoàn 50% (9.000.000đ).",
    },

    // ==========================================================================
    // 7. [Paid + Paid] - ĐÃ THANH TOÁN ĐỦ 100% (HỦY CẬN NGÀY < 3 NGÀY -> HOÀN 0%)
    // Đã thanh toán 9.200.000đ. Khởi hành 26/10/2026 (Còn 1 ngày < 3 ngày)
    // -> Bấm Hủy -> Cảnh báo hoàn 0%, phí giữ lại 100%
    // ==========================================================================
    {
      id: "confirmed-paid-0",
      tourId: "tour-5",
      tour: getMockTourById("tour-5"),
      userId: "user-1",
      userName: "Phạm Hải Đăng",
      userEmail: "khachhang.fpt@gmail.com",
      contactName: "Phạm Hải Đăng",
      contactPhone: "0933 888 999",
      contactEmail: "khachhang.fpt@gmail.com",
      numberOfGuests: 2,
      totalPrice: 9200000,
      originalTotalPrice: 9200000,
      depositAmount: 9200000,
      depositPaid: true,
      paymentStatus: "paid",
      status: "paid", // Trạng thái đơn mới: Paid (Đã thanh toán đủ)
      bookingDate: "2026-10-10",
      tourStartDate: "2026-10-26", // Còn 1 ngày (< 3 ngày) -> Hoàn 0%
      companyId: "company-4",
      companyName: "Sapa Eco Travel",
      bookingNotes:
        "Case 7 (Paid + Paid): Hủy sát ngày khởi hành (< 3 ngày). Cảnh báo quy định không hoàn tiền (0%).",
    },

    // ==========================================================================
    // 8. [InProgress + Paid] - TOUR ĐANG DIỄN RA
    // Đoàn đang di chuyển trên lộ trình, HDV đang check-in
    // -> Không hiển thị nút hủy trên ứng dụng
    // ==========================================================================
    {
      id: "inprogress-tour",
      tourId: "tour-4",
      tour: getMockTourById("tour-4"),
      userId: "user-1",
      userName: "Phạm Hải Đăng",
      userEmail: "khachhang.fpt@gmail.com",
      contactName: "Phạm Hải Đăng",
      contactPhone: "0933 888 999",
      contactEmail: "khachhang.fpt@gmail.com",
      numberOfGuests: 2,
      totalPrice: 11800000,
      originalTotalPrice: 11800000,
      depositAmount: 11800000,
      depositPaid: true,
      paymentStatus: "paid",
      status: "in_progress", // Trạng thái đơn mới: InProgress (Đang diễn ra)
      bookingDate: "2026-10-12",
      tourStartDate: "2026-10-24", // Đang diễn ra
      companyId: "company-1",
      companyName: "Viettravel",
      bookingNotes: "Case 8 (InProgress + Paid): Tour đang diễn ra, HDV đang hướng dẫn đoàn.",
    },

    // ==========================================================================
    // 9. [Completed + Paid] - TOUR ĐÃ HOÀN THÀNH
    // Đã kết thúc toàn bộ lộ trình thành công
    // ==========================================================================
    {
      id: "completed-tour",
      tourId: "tour-3",
      tour: getMockTourById("tour-3"),
      userId: "user-1",
      userName: "Phạm Hải Đăng",
      userEmail: "khachhang.fpt@gmail.com",
      contactName: "Phạm Hải Đăng",
      contactPhone: "0933 888 999",
      contactEmail: "khachhang.fpt@gmail.com",
      numberOfGuests: 2,
      totalPrice: 8400000,
      originalTotalPrice: 8400000,
      depositAmount: 8400000,
      depositPaid: true,
      paymentStatus: "paid",
      status: "completed",
      bookingDate: "2026-09-25",
      tourStartDate: "2026-10-10",
      companyId: "company-1",
      companyName: "Viettravel",
      bookingNotes: "Case 9 (Completed + Paid): Tour đã hoàn thành viên mãn.",
    },

    // ==========================================================================
    // 10. [Cancelled + Refunded] - ĐÃ HỦY & ĐÃ HOÀN TIỀN
    // Admin đã giải ngân hoàn tất về STK Vietcombank của khách
    // ==========================================================================
    {
      id: "cancelled-refunded",
      tourId: "tour-3",
      tour: getMockTourById("tour-3"),
      userId: "user-1",
      userName: "Phạm Hải Đăng",
      userEmail: "khachhang.fpt@gmail.com",
      contactName: "Phạm Hải Đăng",
      contactPhone: "0933 888 999",
      contactEmail: "khachhang.fpt@gmail.com",
      numberOfGuests: 2,
      totalPrice: 12500000,
      originalTotalPrice: 12500000,
      paymentStatus: "refunded",
      status: "cancelled",
      bookingDate: "2026-09-20",
      tourStartDate: "2026-10-15",
      cancellationReason:
        "[Yêu cầu hoàn tiền 100%]: Khách hủy trước 15 ngày. Admin đã giải ngân hoàn tất về Vietcombank (Mã GD: VCB202610239988).",
      companyId: "company-1",
      companyName: "Viettravel",
    },

    // ==========================================================================
    // 11. [Cancelled + Unpaid] - ĐÃ HỦY TRỰC TIẾP
    // Khách đã hủy ngay lúc chưa thanh toán
    // ==========================================================================
    {
      id: "cancelled-unpaid",
      tourId: "tour-5",
      tour: getMockTourById("tour-5"),
      userId: "user-1",
      userName: "Phạm Hải Đăng",
      userEmail: "khachhang.fpt@gmail.com",
      contactName: "Phạm Hải Đăng",
      contactPhone: "0933 888 999",
      contactEmail: "khachhang.fpt@gmail.com",
      numberOfGuests: 1,
      totalPrice: 6200000,
      originalTotalPrice: 6200000,
      paymentStatus: "unpaid",
      status: "cancelled",
      bookingDate: "2026-10-18",
      tourStartDate: "2026-11-05",
      cancellationReason: "Khách bận lịch công tác, đã hủy trực tiếp khi đơn chưa thanh toán.",
      companyId: "company-4",
      companyName: "Hà Giang Discovery",
    },

    // ==========================================================================
    // 12. [Rejected + Unpaid] - BỊ TỪ CHỐI
    // Agency từ chối tiếp nhận đơn
    // ==========================================================================
    {
      id: "rejected-unpaid",
      tourId: "tour-1",
      tour: getMockTourById("tour-1"),
      userId: "user-1",
      userName: "Phạm Hải Đăng",
      userEmail: "khachhang.fpt@gmail.com",
      contactName: "Phạm Hải Đăng",
      contactPhone: "0933 888 999",
      contactEmail: "khachhang.fpt@gmail.com",
      numberOfGuests: 6,
      totalPrice: 48000000,
      originalTotalPrice: 48000000,
      paymentStatus: "unpaid",
      status: "rejected",
      bookingDate: "2026-10-14",
      tourStartDate: "2026-11-01",
      rejectionReason:
        "Agency từ chối nhận đơn: Đã hết phòng khách sạn đối tác tiêu chuẩn 4 sao trong giai đoạn cao điểm này.",
      companyId: "company-1",
      companyName: "Viettravel",
    },
  ];
}
