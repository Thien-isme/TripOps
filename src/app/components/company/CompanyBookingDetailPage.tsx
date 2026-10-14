import { useState } from "react";
import { Booking, User, PaymentRequest, TourContract, CustomLocationChange, CustomHotelChange, CustomMealChange } from "@/app/types";
import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  UserCheck,
  Users,
  Phone,
  Mail,
  MapPin,
  FileText,
  CreditCard,
  Plus,
  AlertTriangle,
  Info,
  Check,
  Building2,
  Utensils,
  ArrowRight,
  Printer,
  Sparkles,
  Home,
  Star,
  ChevronDown,
  ChevronUp,
  Sun,
  UtensilsCrossed,
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/dialog";
import { Textarea } from "@/app/components/ui/textarea";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";

interface CompanyBookingDetailPageProps {
  booking: Booking;
  guides: User[];
  companyName: string;
  onBack: () => void;
  onApproveBooking: (bookingId: string) => void;
  onRejectBooking: (bookingId: string, reason?: string) => void;
  onAssignGuide: (bookingId: string, guideId: string) => void;
  onCreatePaymentRequest: (bookingId: string, request: Omit<PaymentRequest, "id" | "bookingId" | "createdAt" | "status">) => void;
  onMarkDepositPaid?: (bookingId: string) => void;
  onMarkFullyPaid?: (bookingId: string) => void;
}

const statusMap: Record<string, { label: string; color: string }> = {
  pending: { label: "Chờ duyệt", color: "bg-amber-100 text-amber-800 border-amber-200" },
  confirmed: { label: "Đã xác nhận", color: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  cancelled: { label: "Đã hủy", color: "bg-red-100 text-red-800 border-red-200" },
  completed: { label: "Hoàn thành", color: "bg-blue-100 text-blue-800 border-blue-200" },
  rejected: { label: "Từ chối", color: "bg-gray-100 text-gray-800 border-gray-200" },
};

const paymentStatusMap: Record<string, { label: string; color: string }> = {
  unpaid: { label: "Chưa thanh toán", color: "bg-red-50 text-red-700 border-red-200" },
  deposit_paid: { label: "Đã đặt cọc 50%", color: "bg-amber-50 text-amber-700 border-amber-200" },
  paid: { label: "Đã thanh toán đủ 100%", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  refunded: { label: "Đã hoàn tiền", color: "bg-purple-50 text-purple-700 border-purple-200" },
};

const MEAL_LABELS: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  breakfast: { label: "Sáng", icon: Sun, color: "text-amber-700 bg-amber-50 border-amber-200" },
  lunch: { label: "Trưa", icon: Utensils, color: "text-emerald-700 bg-emerald-50 border-emerald-200" },
  dinner: { label: "Tối", icon: UtensilsCrossed, color: "text-purple-700 bg-purple-50 border-purple-200" },
};

function formatVND(n: number) {
  return n.toLocaleString("vi-VN") + "đ";
}

export function CompanyBookingDetailPage({
  booking,
  guides,
  companyName,
  onBack,
  onApproveBooking,
  onRejectBooking,
  onAssignGuide,
  onCreatePaymentRequest,
  onMarkDepositPaid,
  onMarkFullyPaid,
}: CompanyBookingDetailPageProps) {
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [contractModalOpen, setContractModalOpen] = useState(false);


  // Payment form state
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentDescription, setPaymentDescription] = useState("");
  const [paymentDueDate, setPaymentDueDate] = useState("");

  const st = statusMap[booking.status] ?? { label: booking.status, color: "bg-gray-100 text-gray-700" };
  const pst = paymentStatusMap[booking.paymentStatus ?? "unpaid"];

  // Default contract number
  const contractNo = `HD-${booking.id.replace("booking-", "").toUpperCase()}`;
  const today = new Date().toLocaleDateString("vi-VN");

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Header & Actions Bar */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <button
              onClick={onBack}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Quay lại danh sách booking
            </button>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-gray-900">
                Chi tiết Booking #{booking.id}
              </h1>
              <span className={`text-xs px-3 py-1 rounded-full font-bold border ${st.color}`}>
                {st.label}
              </span>
              <span className={`text-xs px-3 py-1 rounded-full font-bold border ${pst.color}`}>
                {pst.label}
              </span>
              {booking.hasLocationCustomization && (
                <span className="text-xs px-3 py-1 rounded-full font-bold bg-purple-100 text-purple-800 border border-purple-200 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  Có tùy chỉnh lịch trình
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500">
              Ngày đặt: <strong>{booking.bookingDate}</strong> · Khách hàng: <strong>{booking.contactName || booking.userName}</strong>
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            {booking.status === "pending" && (
              <>
                <Button
                  onClick={() => onApproveBooking(booking.id)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 shadow-sm text-sm"
                >
                  <CheckCircle className="w-4 h-4" />
                  Duyệt Booking
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setRejectModalOpen(true)}
                  className="border-red-300 text-red-600 hover:bg-red-50 gap-1.5 text-sm"
                >
                  <XCircle className="w-4 h-4" />
                  Từ chối
                </Button>
              </>
            )}

            <Button
              variant="outline"
              onClick={() => setAssignModalOpen(true)}
              className="border-gray-300 text-gray-700 hover:bg-gray-50 gap-1.5 text-sm"
            >
              <UserCheck className="w-4 h-4 text-blue-600" />
              {booking.guideName ? "Đổi HDV" : "Giao HDV"}
            </Button>

            <Button
              variant="outline"
              onClick={() => setPaymentModalOpen(true)}
              className="border-gray-300 text-gray-700 hover:bg-gray-50 gap-1.5 text-sm"
            >
              <CreditCard className="w-4 h-4 text-emerald-600" />
              Tạo yêu cầu thanh toán
            </Button>

            <Button
              variant="outline"
              onClick={() => setContractModalOpen(true)}
              className="border-gray-300 text-gray-700 hover:bg-gray-50 gap-1.5 text-sm"
            >
              <FileText className="w-4 h-4 text-blue-600" />
              Xem Hợp đồng
            </Button>
          </div>
        </div>
      </div>

      {/* Provider Price Verification Notice for Pending Bookings */}
      {booking.status === "pending" && (
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 sm:p-5 mb-6 flex items-start gap-3.5 shadow-2xs">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs">
            <p className="font-bold text-sm text-amber-950 flex items-center gap-2">
              Lưu ý đối soát dịch vụ &amp; Chốt giá ngoài hệ thống:
              <span className="bg-amber-200 text-amber-900 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                Khách không thanh toán liền
              </span>
            </p>
            <p className="text-amber-800 leading-relaxed">
              Khách hàng đặt tour này <strong>không thanh toán ngay</strong>. Vì các dịch vụ như khách sạn lưu trú và chỗ ăn uống có thể có giá khác nhau theo thời điểm thực tế, nhân viên công ty cần chủ động liên hệ trực tiếp với các nhà cung ứng đối tác (provider) ở ngoài hệ thống để hỏi và chốt mức giá thực tế cho đoàn {booking.numberOfGuests} người.
            </p>
            <p className="font-semibold text-amber-900 pt-1">
              → Sau khi chốt giá và kiểm tra chỗ thành công, bấm <span className="text-emerald-700 font-bold">Duyệt Booking</span> và sử dụng tính năng <span className="text-blue-700 font-bold">Tạo yêu cầu thanh toán</span> để gửi thông tin thanh toán cho khách hàng.
            </p>
          </div>
        </div>
      )}

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (Main Details & Customization Breakdown) */}
        <div className="lg:col-span-2 space-y-6">
          {/* TOUR OVERVIEW CARD */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <CompassIcon className="w-4 h-4 text-blue-600" />
              Thông tin Tour cơ bản
            </h2>
            <div className="flex flex-col sm:flex-row gap-5 items-start">
              <img
                src={booking.tour.image}
                alt={booking.tour.name}
                className="w-full sm:w-44 h-32 object-cover rounded-xl flex-shrink-0 shadow-sm"
              />
              <div className="space-y-2 flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-700 font-bold">
                    {booking.tour.tourCode}
                  </span>
                  <span className="text-xs text-gray-500">Đơn vị tổ chức: <strong>{booking.companyName || companyName}</strong></span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 leading-snug">
                  {booking.tour.name}
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs pt-1">
                  <div className="bg-gray-50 p-2 rounded-lg">
                    <span className="text-gray-400 block">Ngày khởi hành</span>
                    <span className="font-bold text-teal-800 text-sm flex items-center gap-1 mt-0.5">
                      <Calendar className="w-3.5 h-3.5 text-teal-600" />
                      {booking.tourStartDate || "Chưa xác định"}
                    </span>
                  </div>
                  <div className="bg-gray-50 p-2 rounded-lg">
                    <span className="text-gray-400 block">Thời gian</span>
                    <span className="font-semibold text-gray-800 text-sm mt-0.5 block">{booking.tour.duration}</span>
                  </div>
                  <div className="bg-gray-50 p-2 rounded-lg">
                    <span className="text-gray-400 block">Thời gian hoạt động</span>
                    <span className="font-semibold text-gray-800 text-sm mt-0.5 block">{booking.tour.operationPeriod || "Quanh năm"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* CUSTOMIZATION SECTION: SO SÁNH TRƯỚC VÀ SAU KHI THAY ĐỔI */}
          {/* ======================================================== */}
          <div className={`rounded-2xl border p-6 shadow-sm ${
            booking.hasLocationCustomization
              ? "bg-purple-50/40 border-purple-200"
              : "bg-white border-gray-200"
          }`}>
            <div className="flex items-center justify-between gap-3 mb-4 border-b pb-3 border-gray-200">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <h2 className="text-base font-bold text-gray-900">
                  Lịch trình & Dịch vụ khách đã đặt (Chi tiết tùy chỉnh)
                </h2>
              </div>
              {booking.hasLocationCustomization ? (
                <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-purple-100 text-purple-800 border border-purple-300">
                  Có yêu cầu thay đổi
                </span>
              ) : (
                <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-gray-100 text-gray-700">
                  Lịch trình tiêu chuẩn gốc
                </span>
              )}
            </div>

            {booking.hasLocationCustomization ? (
              <div className="space-y-6">
                {/* 1. CHỖ Ở / KHÁCH SẠN TÙY CHỈNH */}
                <div>
                  <h3 className="text-xs font-bold text-purple-900 uppercase tracking-wide flex items-center gap-2 mb-3">
                    <Home className="w-4 h-4 text-purple-600" />
                    1. Thay đổi chỗ ở / Khách sạn lưu trú
                  </h3>

                  {booking.customHotelChanges && booking.customHotelChanges.length > 0 ? (
                    <div className="space-y-3">
                      {booking.customHotelChanges.map((hc, idx) => (
                        <div key={idx} className="bg-white rounded-xl border border-purple-200 p-4 shadow-sm">
                          <p className="text-xs font-bold text-gray-500 uppercase mb-2">
                            Khu vực / Điểm đến: <span className="text-gray-900 font-bold">{hc.destination}</span>
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                              <span className="text-[11px] font-bold text-gray-400 block mb-1">KHÁCH SẠN GỐC BAN ĐẦU:</span>
                              <p className="font-semibold text-gray-400 line-through text-sm">{hc.originalHotelName || "Khách sạn mặc định của tour"}</p>
                              <span className="text-[10px] text-gray-400 mt-1 inline-block">Đã thay thế</span>
                            </div>
                            <div className="bg-purple-50 rounded-lg p-3 border border-purple-300">
                              <span className="text-[11px] font-bold text-purple-700 block mb-1 flex items-center gap-1">
                                <ArrowRight className="w-3.5 h-3.5" />
                                KHÁCH SẠN MỚI ĐƯỢC YÊU CẦU:
                              </span>
                              <p className="font-bold text-purple-900 text-sm">{hc.newHotelName}</p>
                              {hc.mode === "system" ? (
                                <div className="mt-1 space-y-0.5">
                                  <span className="inline-block bg-purple-200 text-purple-800 px-1.5 py-0.5 rounded text-[10px] font-bold">
                                    Chọn từ hệ thống ({hc.stars}★)
                                  </span>
                                </div>
                              ) : (
                                <div className="mt-1 space-y-0.5">
                                  <span className="inline-block bg-amber-200 text-amber-800 px-1.5 py-0.5 rounded text-[10px] font-bold">
                                    Khách tự nhập (Chờ công ty xác nhận)
                                  </span>
                                  {hc.address && <p className="text-gray-600 mt-1">Địa chỉ: {hc.address}</p>}
                                  {hc.note && <p className="text-gray-600 italic">Ghi chú: {hc.note}</p>}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    // Default mockup if specific array not yet built
                    <div className="bg-white rounded-xl border border-purple-200 p-4 shadow-sm">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                          <span className="text-[11px] font-bold text-gray-400 block mb-1">KHÁCH SẠN GỐC BAN ĐẦU:</span>
                          <p className="font-semibold text-gray-400 line-through text-sm">Khách sạn Đà Lạt Palace (4★)</p>
                          <span className="text-[10px] text-gray-400 mt-1 inline-block">Đã thay thế</span>
                        </div>
                        <div className="bg-purple-50 rounded-lg p-3 border border-purple-300">
                          <span className="text-[11px] font-bold text-purple-700 block mb-1 flex items-center gap-1">
                            <ArrowRight className="w-3.5 h-3.5" />
                            KHÁCH SẠN MỚI KHÁCH CHỌN:
                          </span>
                          <p className="font-bold text-purple-900 text-sm">Dalat Edensee Resort (5★ Resort view hồ)</p>
                          <span className="inline-block bg-purple-200 text-purple-800 px-1.5 py-0.5 rounded text-[10px] font-bold mt-1">
                            Chọn từ hệ thống (5★)
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. ĐỊA ĐIỂM THAM QUAN TÙY CHỈNH TỪNG NGÀY */}
                <div>
                  <h3 className="text-xs font-bold text-purple-900 uppercase tracking-wide flex items-center gap-2 mb-3">
                    <MapPin className="w-4 h-4 text-purple-600" />
                    2. Thay đổi địa điểm tham quan theo ngày
                  </h3>

                  {booking.locationChanges && booking.locationChanges.length > 0 ? (
                    <div className="space-y-3">
                      {booking.locationChanges.map((lc) => (
                        <div key={lc.dayId} className="bg-white rounded-xl border border-purple-200 p-4 shadow-sm">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-bold text-sm text-purple-900">
                              Ngày {lc.dayNumber}
                            </span>
                            <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-medium">
                              Yêu cầu thay đổi lộ trình
                            </span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                              <span className="text-[11px] font-bold text-gray-400 block mb-1">ĐỊA ĐIỂM TRƯỚC ĐÓ (GỐC):</span>
                              <div className="space-y-1">
                                {lc.originalLocations && lc.originalLocations.length > 0 ? (
                                  lc.originalLocations.map((loc, i) => (
                                    <div key={i} className="flex items-center gap-1.5 text-gray-700">
                                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                                      <span>{loc}</span>
                                    </div>
                                  ))
                                ) : (
                                  <p className="text-gray-600">Điểm đến theo lộ trình tiêu chuẩn</p>
                                )}
                              </div>
                            </div>
                            <div className="bg-amber-50 rounded-lg p-3 border border-amber-300">
                              <span className="text-[11px] font-bold text-amber-800 block mb-1 flex items-center gap-1">
                                <ArrowRight className="w-3.5 h-3.5" />
                                ĐỊA ĐIỂM MỚI KHÁCH YÊU CẦU:
                              </span>
                              <p className="font-bold text-amber-950 text-sm leading-relaxed">
                                {lc.requestedLocations}
                              </p>
                              {lc.note && (
                                <p className="text-xs text-amber-700 mt-1 italic">
                                  Lý do/Ghi chú: {lc.note}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-white rounded-xl border border-purple-200 p-4 shadow-sm text-xs">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                          <span className="text-[11px] font-bold text-gray-400 block mb-1">ĐỊA ĐIỂM TRƯỚC ĐÓ (GỐC):</span>
                          <p className="text-gray-800">Thung lũng Tình Yêu, Đồi Mộng Mơ</p>
                        </div>
                        <div className="bg-amber-50 rounded-lg p-3 border border-amber-300">
                          <span className="text-[11px] font-bold text-amber-800 block mb-1">ĐỊA ĐIỂM MỚI KHÁCH YÊU CẦU:</span>
                          <p className="font-bold text-amber-950">Vườn hoa thành phố Đà Lạt, Ga Đà Lạt</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. BỮA ĂN TÙY CHỈNH (NẾU CÓ) */}
                {booking.customMealChanges && booking.customMealChanges.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold text-purple-900 uppercase tracking-wide flex items-center gap-2 mb-3">
                      <Utensils className="w-4 h-4 text-purple-600" />
                      3. Thay đổi nhà hàng / Thực đơn bữa ăn
                    </h3>
                    <div className="space-y-2">
                      {booking.customMealChanges.map((mc, idx) => (
                        <div key={idx} className="bg-white rounded-xl border border-purple-200 p-3 flex items-center justify-between text-xs">
                          <div>
                            <span className="font-bold text-purple-900">Ngày {mc.dayNumber} · {mc.mealType === "lunch" ? "Ăn trưa" : "Ăn tối"}</span>
                            <p className="text-gray-500">Gốc: {mc.originalMealName || "Nhà hàng mặc định"}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-purple-900">{mc.newMealName}</p>
                            <span className="text-[10px] text-purple-700 bg-purple-100 px-2 py-0.5 rounded font-semibold">Đã đổi</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3 text-xs text-gray-600">
                <p>Khách hàng lựa chọn đi tour theo toàn bộ chương trình và dịch vụ khách sạn / ăn uống tiêu chuẩn của công ty phát hành, không có yêu cầu điều chỉnh riêng.</p>
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 flex items-center gap-3">
                  <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Áp dụng đúng biểu phí, khách sạn và thực đơn có sẵn theo hợp đồng dịch vụ.</span>
                </div>
              </div>
            )}
          </div>

          {/* PASSENGER LIST CARD */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              Danh sách hành khách tham gia ({booking.passengers?.length || booking.numberOfGuests} người)
            </h2>
            {booking.passengers && booking.passengers.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-gray-100 text-gray-700 font-bold uppercase text-[11px]">
                      <th className="px-3 py-2.5 text-left rounded-l-lg">#</th>
                      <th className="px-3 py-2.5 text-left">Họ & Tên</th>
                      <th className="px-3 py-2.5 text-left">Ngày sinh</th>
                      <th className="px-3 py-2.5 text-left">Giới tính</th>
                      <th className="px-3 py-2.5 text-left">Phân loại</th>
                      <th className="px-3 py-2.5 text-right rounded-r-lg">Giá vé áp dụng</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {booking.passengers.map((p, i) => (
                      <tr key={p.id} className="hover:bg-gray-50">
                        <td className="px-3 py-2.5 text-gray-400">{i + 1}</td>
                        <td className="px-3 py-2.5 font-bold text-gray-900">{p.fullName}</td>
                        <td className="px-3 py-2.5 text-gray-600">{p.dateOfBirth}</td>
                        <td className="px-3 py-2.5 text-gray-600">{p.gender === "male" ? "Nam" : "Nữ"}</td>
                        <td className="px-3 py-2.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            p.ageGroup === "adult"
                              ? "bg-blue-50 text-blue-700"
                              : "bg-emerald-50 text-emerald-700"
                          }`}>
                            {p.ageGroup === "adult" ? "Người lớn" : p.ageGroup === "child_2_11" ? "Trẻ em (2–11t)" : "Em bé (<2t)"}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-right font-bold text-blue-700">
                          {p.price === 0 ? "Miễn phí" : formatVND(p.price)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-50 font-bold border-t border-gray-200">
                      <td colSpan={5} className="px-3 py-2.5 text-right text-gray-700">Tổng cộng tiền vé ({booking.passengers.length} khách):</td>
                      <td className="px-3 py-2.5 text-right text-blue-700 text-sm font-extrabold">{formatVND(booking.totalPrice)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-4 text-xs text-gray-600">
                Khách đặt chỗ theo số lượng đoàn: <strong>{booking.numberOfGuests} người</strong> (Đại diện đặt: {booking.contactName || booking.userName}).
              </div>
            )}
          </div>

          {/* TOUR FULL ITINERARY (MATCHING chitietlichtrinh.png & TourDetailPage.tsx) */}
          {booking.tour.itinerary && booking.tour.itinerary.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 shadow-xs space-y-4">
              <div className="border-b border-gray-100 pb-3">
                <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-purple-600" />
                  Lịch trình chi tiết (Lộ trình tham quan cơ bản của công ty)
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Lộ trình các điểm tham quan do công ty thiết lập theo thông tin đơn đặt tour của khách hàng.
                </p>
              </div>

              <div className="space-y-4">
                {booking.tour.itinerary.map((day) => {
                  const dayLocChange = booking.locationChanges?.find(
                    (lc) => lc.dayNumber === day.day || lc.dayId === day.id
                  );
                  const dayDest = day.destinationCity || booking.tour.destination;
                  const dayHotelChange = booking.customHotelChanges?.find(
                    (hc) => hc.destination === dayDest || booking.tour.itinerary.length === 1
                  );
                  const dayMealChanges = booking.customMealChanges?.filter(
                    (mc) => mc.dayNumber === day.day
                  );

                  const dayHasChanges = Boolean(dayLocChange || dayHotelChange || (dayMealChanges && dayMealChanges.length > 0));

                  return (
                    <div
                      key={day.id}
                      className={`rounded-xl border overflow-hidden ${
                        dayHasChanges ? "border-amber-300" : "border-gray-200"
                      }`}
                    >
                      {/* Day header */}
                      <div
                        className={`px-4 py-3 flex items-center justify-between ${
                          dayHasChanges ? "bg-amber-50" : "bg-gray-50"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 shadow-xs">
                            {day.day}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 text-sm">
                              Ngày {day.day}: {day.title}
                              {day.meals && day.meals.length > 0 && (
                                <span className="text-xs text-gray-400 font-normal ml-1.5">
                                  (Ăn {day.meals.map((m) => m.type === "breakfast" ? "sáng" : m.type === "lunch" ? "trưa" : "tối").join(", ")})
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {dayLocChange && (
                            <span className="text-xs bg-amber-100 text-amber-700 px-2.5 py-0.5 rounded-full font-medium border border-amber-300">
                              Đổi điểm tham quan
                            </span>
                          )}
                          {dayHotelChange && (
                            <span className="text-xs bg-purple-100 text-purple-700 px-2.5 py-0.5 rounded-full font-medium border border-purple-300">
                              Đổi khách sạn
                            </span>
                          )}
                          {dayMealChanges && dayMealChanges.length > 0 && (
                            <span className="text-xs bg-emerald-100 text-emerald-700 px-2.5 py-0.5 rounded-full font-medium border border-emerald-300">
                              Đổi bữa ăn
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Day description & Sightseeing locations */}
                      <div className="px-4 py-3.5 space-y-3 bg-white">
                        {day.description && (
                          <p className="text-xs text-gray-600 leading-relaxed bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                            {day.description}
                          </p>
                        )}

                        {/* Locations timeline */}
                        <div className="relative pl-1">
                          <div className="absolute left-3.5 top-2 bottom-2 w-0.5 bg-gray-200" />

                          <div className="space-y-2.5">
                            {day.locations && day.locations.length > 0 ? (
                              day.locations.map((loc, lIdx) => {
                                const isLocChanged = Boolean(dayLocChange);
                                return (
                                  <div key={loc.id || lIdx} className="relative flex items-center gap-3">
                                    {/* Dot */}
                                    <div
                                      className={`relative z-10 flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center border-2 ${
                                        isLocChanged
                                          ? "bg-amber-400 border-amber-400 text-white"
                                          : "bg-white border-blue-400 text-blue-500"
                                      }`}
                                    >
                                      <MapPin className="w-3.5 h-3.5" />
                                    </div>

                                    {/* Content card */}
                                    <div
                                      className={`flex-1 rounded-xl border p-3 ${
                                        isLocChanged ? "border-amber-200 bg-amber-50" : "border-gray-200 bg-white"
                                      }`}
                                    >
                                      <div className="flex items-center justify-between gap-2">
                                        <div className="flex-1 min-w-0">
                                          {isLocChanged ? (
                                            <>
                                              <p className="text-xs text-gray-400 line-through">{loc.name}</p>
                                              <p className="text-sm font-medium text-amber-800 mt-0.5">
                                                → {dayLocChange?.requestedLocations}
                                              </p>
                                              {dayLocChange?.note && (
                                                <p className="text-xs text-amber-700 italic mt-0.5">
                                                  Ghi chú của khách: {dayLocChange.note}
                                                </p>
                                              )}
                                            </>
                                          ) : (
                                            <p className="font-medium text-gray-900 text-sm">{loc.name}</p>
                                          )}
                                        </div>
                                        <span
                                          className={`flex-shrink-0 text-xs px-2.5 py-1 rounded-lg font-medium transition-all ${
                                            isLocChanged
                                              ? "bg-amber-100 text-amber-700 border border-amber-300"
                                              : "bg-gray-100 text-gray-600"
                                          }`}
                                        >
                                          {isLocChanged ? "Đã đổi" : "Theo tour"}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })
                            ) : (
                              <p className="text-xs text-gray-500 italic pl-8">
                                Hoạt động tự do hoặc di chuyển theo lịch trình tour.
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Day Meals Section */}
                        {day.meals && day.meals.length > 0 && (
                          <div className="pt-3 border-t border-gray-100 space-y-2.5">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-gray-800 uppercase tracking-wide flex items-center gap-1.5">
                                <Utensils className="w-3.5 h-3.5 text-emerald-600" />
                                Chế độ ẩm thực &amp; Bữa ăn Ngày {day.day}
                              </span>
                              <span className="text-[11px] text-gray-400">
                                (Thực đơn &amp; nhà hàng phục vụ)
                              </span>
                            </div>

                            <div className="space-y-2">
                              {day.meals.map((defaultMeal, mIdx) => {
                                const mealType = defaultMeal.type as "breakfast" | "lunch" | "dinner";
                                const mealChange = dayMealChanges?.find((mc) => mc.mealType === mealType);
                                const isChanged = Boolean(mealChange);
                                const mealLabel =
                                  mealType === "breakfast" ? "Bữa sáng" : mealType === "lunch" ? "Bữa trưa" : "Bữa tối";

                                return (
                                  <div
                                    key={mIdx}
                                    className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-2xs"
                                  >
                                    <div
                                      className={`w-full flex items-center justify-between px-3.5 py-2.5 transition-colors text-left ${
                                        mealType === "breakfast"
                                          ? "bg-amber-50/60"
                                          : mealType === "lunch"
                                          ? "bg-emerald-50/60"
                                          : "bg-purple-50/60"
                                      }`}
                                    >
                                      <div className="flex items-center gap-2.5 min-w-0">
                                        <div
                                          className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                                            mealType === "breakfast"
                                              ? "bg-amber-100 text-amber-700"
                                              : mealType === "lunch"
                                              ? "bg-emerald-100 text-emerald-700"
                                              : "bg-purple-100 text-purple-700"
                                          }`}
                                        >
                                          {mealType === "breakfast" ? (
                                            <Sun className="w-4 h-4" />
                                          ) : mealType === "dinner" ? (
                                            <UtensilsCrossed className="w-4 h-4" />
                                          ) : (
                                            <Utensils className="w-4 h-4" />
                                          )}
                                        </div>
                                        <div className="min-w-0">
                                          <p className="text-xs sm:text-sm font-semibold text-gray-900">
                                            {mealLabel}:{" "}
                                            <span className="font-bold text-gray-900">
                                              {isChanged
                                                ? mealChange?.newMealName
                                                : defaultMeal.serviceName || "Nhà hàng theo tour"}
                                            </span>
                                          </p>
                                          <p className="text-[11px] text-gray-500">
                                            Mặc định: {defaultMeal.serviceName || "Nhà hàng địa phương"}
                                          </p>
                                        </div>
                                      </div>

                                      <div className="flex items-center gap-2 flex-shrink-0">
                                        <div className="border border-gray-200 bg-white px-3 py-1 rounded-md text-xs text-gray-500 flex items-center gap-1.5 shadow-2xs">
                                          {isChanged ? (
                                            <span className="text-[10px] text-emerald-800 font-bold">
                                              Đã đổi {mealChange?.priceDifference ? `(+${formatVND(mealChange.priceDifference)})` : ""}
                                            </span>
                                          ) : (
                                            <span>Theo tour (0đ)</span>
                                          )}
                                          <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Hotel / Accommodation */}
                        {(day.hotel || dayHotelChange) && (
                          <div className="pt-3 border-t border-gray-100">
                            <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-xl flex items-center justify-between gap-3 text-xs">
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0">
                                  <Building2 className="w-4 h-4" />
                                </div>
                                <div className="min-w-0">
                                  <p className="font-semibold text-gray-900 text-xs sm:text-sm">
                                    Khách sạn lưu trú:{" "}
                                    <span className="font-bold text-blue-900">
                                      {dayHotelChange ? dayHotelChange.newHotelName : day.hotel?.name}
                                    </span>
                                    {(dayHotelChange?.stars || day.hotel?.stars) && (
                                      <span className="text-amber-500 font-bold ml-1">
                                        {"★".repeat(dayHotelChange?.stars || day.hotel?.stars || 0)}
                                      </span>
                                    )}
                                  </p>
                                  <p className="text-[11px] text-gray-500">
                                    {dayHotelChange?.originalHotelName ? `Gốc: ${dayHotelChange.originalHotelName} • ` : ""}
                                    Khu vực: {day.destinationCity || booking.tour.destination}
                                  </p>
                                </div>
                              </div>
                              {dayHotelChange ? (
                                <span className="text-[10px] bg-purple-100 text-purple-800 px-2.5 py-1 rounded-lg font-bold border border-purple-200 flex-shrink-0">
                                  Đã nâng cấp
                                </span>
                              ) : (
                                <span className="text-[10px] text-gray-500 bg-white px-2.5 py-1 rounded-lg border border-gray-200 flex-shrink-0 font-medium">
                                  Theo tour
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar (Contact, Finance, Guide, Contract) */}
        <div className="space-y-6">
          {/* CONTACT INFO CARD */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              Thông tin Người đại diện
            </h3>
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-gray-400 block text-[11px]">Họ & Tên</span>
                <span className="font-bold text-gray-900 text-sm">{booking.contactName || booking.userName}</span>
              </div>
              <div>
                <span className="text-gray-400 block text-[11px]">Số điện thoại liên hệ</span>
                <span className="font-semibold text-blue-700 flex items-center gap-1 mt-0.5">
                  <Phone className="w-3.5 h-3.5 text-gray-400" />
                  {booking.contactPhone || "—"}
                </span>
              </div>
              <div>
                <span className="text-gray-400 block text-[11px]">Email</span>
                <span className="font-medium text-gray-800 flex items-center gap-1 mt-0.5">
                  <Mail className="w-3.5 h-3.5 text-gray-400" />
                  {booking.contactEmail || booking.userEmail}
                </span>
              </div>
              {booking.contactAddress && (
                <div>
                  <span className="text-gray-400 block text-[11px]">Địa chỉ liên lạc</span>
                  <span className="text-gray-700 flex items-start gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 mt-0.5" />
                    {booking.contactAddress}
                  </span>
                </div>
              )}
              {booking.bookingNotes && (
                <div className="bg-amber-50 rounded-xl p-3 border border-amber-200 text-amber-900 mt-2">
                  <span className="font-bold block mb-1">Ghi chú từ khách hàng:</span>
                  <p className="leading-relaxed">{booking.bookingNotes}</p>
                </div>
              )}
            </div>
          </div>

          {/* FINANCE & PAYMENT STATUS CARD */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-blue-600" />
                Tài chính & Thanh toán
              </h3>
              <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold border ${pst.color}`}>
                {pst.label}
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-gray-100">
                <span className="text-gray-500">Tổng giá trị đơn ({booking.numberOfGuests} khách):</span>
                <span className="font-extrabold text-gray-900 text-base">{formatVND(booking.totalPrice)}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-gray-100">
                <span className="text-gray-500">Trạng thái thanh toán:</span>
                <span className={`font-bold ${booking.paymentStatus === "paid" ? "text-emerald-700" : booking.paymentStatus === "deposit_paid" ? "text-blue-700" : "text-amber-700"}`}>
                  {booking.paymentStatus === "paid"
                    ? "Đã thanh toán 100%"
                    : booking.paymentStatus === "deposit_paid"
                    ? "Đã thanh toán tiền cọc"
                    : "Chưa thanh toán (Thanh toán sau)"}
                </span>
              </div>
              {booking.paymentStatus === "unpaid" && (
                <div className="bg-blue-50/70 p-2.5 rounded-lg border border-blue-200 text-blue-900 text-[11px] leading-relaxed">
                  💡 <strong>Quy định:</strong> Khách không phải thanh toán liền khi booking. Công ty du lịch sẽ liên hệ với các nhà cung cấp bên ngoài để chốt giá thực tế, sau đó gửi yêu cầu thanh toán cho khách.
                </div>
              )}
              {booking.depositPaid && (
                <div className="flex justify-between items-center py-1 border-b border-gray-100">
                  <span className="text-gray-500">Đã cọc:</span>
                  <span className="font-bold text-emerald-700">{formatVND(booking.depositAmount ?? 0)}</span>
                </div>
              )}
              <div className="flex justify-between items-center py-1 border-b border-gray-100">
                <span className="text-gray-500">Số tiền còn phải thu:</span>
                <span className="font-bold text-red-600 text-sm">
                  {formatVND(booking.remainingAmount ?? (booking.depositPaid ? booking.totalPrice - (booking.depositAmount ?? 0) : booking.totalPrice))}
                </span>
              </div>
            </div>

            {/* Quick Payment Action Buttons */}
            <div className="space-y-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setPaymentModalOpen(true)}
                className="w-full text-xs h-9 gap-1.5 border-blue-400 text-blue-700 hover:bg-blue-50 font-bold"
              >
                <CreditCard className="w-3.5 h-3.5" />
                Tạo yêu cầu thanh toán gửi khách
              </Button>
              {!booking.depositPaid && onMarkDepositPaid && (
                <Button
                  onClick={() => onMarkDepositPaid(booking.id)}
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white text-xs h-9 gap-1.5 font-bold shadow-sm"
                >
                  <Check className="w-4 h-4" />
                  Xác nhận đã thu tiền cọc ({formatVND(booking.depositAmount ?? Math.ceil(booking.totalPrice * 0.5))})
                </Button>
              )}
              {booking.paymentStatus !== "paid" && onMarkFullyPaid && (
                <Button
                  onClick={() => onMarkFullyPaid(booking.id)}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-9 gap-1.5 font-bold shadow-sm"
                >
                  <Check className="w-4 h-4" />
                  Xác nhận đã thanh toán đủ 100%
                </Button>
              )}
            </div>

            {/* Existing Payment Requests List */}
            {booking.paymentRequests && booking.paymentRequests.length > 0 && (
              <div className="pt-3 border-t border-gray-100 space-y-2">
                <span className="text-xs font-bold text-gray-700 block">Các yêu cầu thanh toán đã tạo:</span>
                <div className="space-y-2">
                  {booking.paymentRequests.map((pr) => (
                    <div key={pr.id} className="bg-gray-50 rounded-xl p-3 border border-gray-200 text-xs space-y-1">
                      <div className="flex justify-between items-start">
                        <p className="font-semibold text-gray-800">{pr.description}</p>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          pr.status === "paid" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                        }`}>
                          {pr.status === "paid" ? "Đã nộp" : "Chờ nộp"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-gray-500 pt-1">
                        <span>Hạn: {pr.dueDate}</span>
                        <span className="font-bold text-blue-700 text-sm">{formatVND(pr.amount)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ASSIGNED GUIDE CARD */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-blue-600" />
              Hướng dẫn viên phụ trách
            </h3>
            {booking.guideName ? (
              <div className="bg-blue-50/60 rounded-xl p-3 border border-blue-100 flex items-center gap-3">
                {booking.guideAvatar ? (
                  <img
                    src={booking.guideAvatar}
                    alt={booking.guideName}
                    className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center">
                    {booking.guideName[0]}
                  </div>
                )}
                <div className="flex-1 min-w-0 text-xs">
                  <p className="font-bold text-gray-900 text-sm">{booking.guideName}</p>
                  {booking.guidePhone && (
                    <p className="text-blue-700 flex items-center gap-1 mt-0.5">
                      <Phone className="w-3 h-3" />
                      {booking.guidePhone}
                    </p>
                  )}
                  <button
                    onClick={() => setAssignModalOpen(true)}
                    className="text-xs text-blue-600 hover:underline font-medium mt-1 block"
                  >
                    Thay đổi HDV
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-amber-50 rounded-xl p-3 border border-amber-200 text-center space-y-2">
                <p className="text-xs text-amber-800">Chưa có hướng dẫn viên được chỉ định cho đoàn này.</p>
                <Button
                  size="sm"
                  onClick={() => setAssignModalOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-8"
                >
                  <UserCheck className="w-3.5 h-3.5 mr-1" />
                  Giao hướng dẫn viên
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL: TỪ CHỐI BOOKING */}
      <Dialog open={rejectModalOpen} onOpenChange={setRejectModalOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Từ chối Đặt tour</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            <Label className="text-xs">Lý do từ chối gửi đến khách hàng <span className="text-red-500">*</span></Label>
            <Textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="VD: Không đủ chỗ, lịch trình yêu cầu không khả thi trong mùa này..."
              rows={3}
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setRejectModalOpen(false)}>Hủy</Button>
              <Button
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={() => {
                  onRejectBooking(booking.id, rejectReason);
                  setRejectModalOpen(false);
                }}
              >
                Xác nhận từ chối
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* MODAL: GIAO HƯỚNG DẪN VIÊN */}
      <Dialog open={assignModalOpen} onOpenChange={setAssignModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Giao Hướng dẫn viên cho đoàn</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            {guides.length === 0 ? (
              <p className="text-xs text-gray-500">Công ty chưa có hướng dẫn viên trực thuộc nào.</p>
            ) : (
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {guides.map((g) => (
                  <button
                    key={g.id}
                    onClick={() => {
                      onAssignGuide(booking.id, g.id);
                      setAssignModalOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                      booking.guideId === g.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                    }`}
                  >
                    {g.avatar ? (
                      <img src={g.avatar} alt={g.name} className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center">
                        {g.name[0]}
                      </div>
                    )}
                    <div className="flex-1 min-w-0 text-xs">
                      <p className="font-bold text-gray-900 text-sm">{g.name}</p>
                      <p className="text-gray-500">{g.email}</p>
                      {g.phone && <p className="text-blue-600">{g.phone}</p>}
                    </div>
                    {booking.guideId === g.id && (
                      <span className="text-xs font-bold text-blue-700">Đang gán</span>
                    )}
                  </button>
                ))}
              </div>
            )}
            <div className="flex justify-end pt-2">
              <Button variant="outline" onClick={() => setAssignModalOpen(false)}>Đóng</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* MODAL: TẠO YÊU CẦU THANH TOÁN */}
      <Dialog open={paymentModalOpen} onOpenChange={setPaymentModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Tạo Yêu cầu Thanh toán Đợt tiếp theo</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-2 text-xs">
            <div className="bg-gray-50 rounded-lg p-3 space-y-1">
              <p className="text-gray-600">Đơn hàng: <strong>#{booking.id}</strong></p>
              <p className="text-gray-600">Tổng tiền tour: <strong className="text-blue-700">{formatVND(booking.totalPrice)}</strong></p>
              <p className="text-gray-600">Số tiền còn lại phải thu: <strong className="text-red-600">{formatVND(booking.remainingAmount ?? 0)}</strong></p>
            </div>
            <div>
              <Label className="text-xs">Số tiền yêu cầu (VNĐ) *</Label>
              <Input
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                placeholder={booking.remainingAmount?.toString() ?? "0"}
                className="mt-1 text-xs"
              />
            </div>
            <div>
              <Label className="text-xs">Nội dung đợt thanh toán *</Label>
              <Input
                value={paymentDescription}
                onChange={(e) => setPaymentDescription(e.target.value)}
                placeholder="VD: Thanh toán đợt 2 - Số tiền còn lại trước khởi hành"
                className="mt-1 text-xs"
              />
            </div>
            <div>
              <Label className="text-xs">Hạn chót thanh toán *</Label>
              <Input
                type="date"
                value={paymentDueDate}
                onChange={(e) => setPaymentDueDate(e.target.value)}
                className="mt-1 text-xs"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setPaymentModalOpen(false)}>Hủy</Button>
              <Button
                disabled={!paymentAmount || !paymentDescription || !paymentDueDate}
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => {
                  onCreatePaymentRequest(booking.id, {
                    amount: parseInt(paymentAmount),
                    description: paymentDescription,
                    dueDate: paymentDueDate,
                  });
                  setPaymentModalOpen(false);
                  setPaymentAmount("");
                  setPaymentDescription("");
                  setPaymentDueDate("");
                }}
              >
                Gửi yêu cầu
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* MODAL: HỢP ĐỒNG ĐIỆN TỬ */}
      <Dialog open={contractModalOpen} onOpenChange={setContractModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Hợp đồng Dịch vụ Du lịch – {contractNo}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 text-xs text-gray-700 pt-2">
            <div className="text-center border-b pb-3">
              <p className="font-bold text-sm text-gray-900 uppercase">{companyName}</p>
              <p className="text-xs text-gray-500">Giấy phép kinh doanh lữ hành quốc tế</p>
              <p className="text-base font-bold mt-2 text-blue-800">HỢP ĐỒNG DỊCH VỤ LỮ HÀNH</p>
              <p className="text-[11px] text-gray-400">Số: {contractNo} – Ngày lập: {today}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 p-2.5 rounded-lg border">
                <p className="font-bold text-gray-900 mb-1">BÊN A (CÔNG TY DU LỊCH):</p>
                <p>Tên: <strong>{companyName}</strong></p>
              </div>
              <div className="bg-gray-50 p-2.5 rounded-lg border">
                <p className="font-bold text-gray-900 mb-1">BÊN B (KHÁCH HÀNG):</p>
                <p>Đại diện: <strong>{booking.contactName || booking.userName}</strong></p>
                <p>SĐT: {booking.contactPhone || "—"}</p>
              </div>
            </div>

            <div>
              <p className="font-bold text-gray-900 mb-1">ĐIỀU 1: NỘI DUNG VÀ THỜI GIAN</p>
              <p>Tour: <strong>{booking.tour.name}</strong> ({booking.tour.tourCode})</p>
              <p>Khởi hành: <strong>{booking.tourStartDate || "Theo thỏa thuận"}</strong> · Thời gian: {booking.tour.duration}</p>
              <p>Số lượng khách: <strong>{booking.numberOfGuests} người</strong></p>
            </div>

            <div>
              <p className="font-bold text-gray-900 mb-1">ĐIỀU 2: GIÁ TRỊ VÀ PHƯƠNG THỨC THANH TOÁN</p>
              <p>Tổng giá trị hợp đồng: <strong className="text-blue-700">{formatVND(booking.totalPrice)}</strong></p>
              <p>Đã đặt cọc: <strong>{formatVND(booking.depositAmount ?? Math.ceil(booking.totalPrice * 0.5))}</strong> ({booking.depositPaid ? "Đã thu" : "Chưa thu"})</p>
              <p>Số tiền còn lại: <strong>{formatVND(booking.remainingAmount ?? 0)}</strong></p>
            </div>

            {booking.hasLocationCustomization && (
              <div className="bg-purple-50 p-2.5 rounded-lg border border-purple-200">
                <p className="font-bold text-purple-900 mb-1">ĐIỀU KHOẢN TÙY CHỈNH LỊCH TRÌNH:</p>
                <p>Các điều chỉnh về khách sạn và điểm đến theo thỏa thuận đính kèm trong phụ lục booking.</p>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t">
            <Button variant="outline" onClick={() => setContractModalOpen(false)}>Đóng</Button>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5" onClick={() => window.print()}>
              <Printer className="w-4 h-4" />
              In hợp đồng
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CompassIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
    </svg>
  );
}
