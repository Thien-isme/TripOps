import { useState } from "react";
import { Booking, PaymentRequest, TourContract, CustomLocationChange, CustomHotelChange, CustomMealChange, SystemBankAccount } from "@/app/types";
import { defaultSystemBankAccount } from "@/app/data/mockData";
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
  AlertTriangle,
  Info,
  Check,
  Building2,
  Utensils,
  ArrowRight,
  Printer,
  Sparkles,
  Star,
  ChevronDown,
  ChevronUp,
  Sun,
  UtensilsCrossed,
  Copy,
  QrCode,
  Landmark,
  CheckCircle2,
  ShieldCheck,
  Handshake,
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/dialog";
import { CancelTourModal } from "./CancelTourModal";

interface UserBookingDetailPageProps {
  booking: Booking;
  systemBank?: SystemBankAccount;
  onBack: () => void;
  onCancelBooking: (bookingId: string, reason: string) => void;
  onPayPaymentRequest?: (bookingId: string, paymentRequestId: string) => void;
}

const statusMap: Record<string, { label: string; color: string }> = {
  pending: { label: "Chờ xác nhận & chốt giá", color: "bg-amber-100 text-amber-800 border-amber-300" },
  confirmed: { label: "Đã xác nhận", color: "bg-emerald-100 text-emerald-800 border-emerald-300" },
  cancelled: { label: "Đã hủy", color: "bg-red-100 text-red-800 border-red-300" },
  completed: { label: "Đã hoàn thành", color: "bg-blue-100 text-blue-800 border-blue-300" },
  rejected: { label: "Đã từ chối", color: "bg-gray-100 text-gray-800 border-gray-300" },
};

const paymentStatusMap: Record<string, { label: string; color: string }> = {
  unpaid: { label: "Chưa thanh toán (Thanh toán sau)", color: "bg-amber-50 text-amber-800 border-amber-200" },
  deposit_paid: { label: "Đã đặt cọc 50%", color: "bg-blue-50 text-blue-800 border-blue-200" },
  paid: { label: "Đã thanh toán đủ 100%", color: "bg-emerald-50 text-emerald-800 border-emerald-200" },
  refunded: { label: "Đã hoàn tiền", color: "bg-purple-50 text-purple-800 border-purple-200" },
};

function formatVND(n: number) {
  return n.toLocaleString("vi-VN") + "đ";
}

function calculateAge(dobStr?: string, refDateStr?: string): number | null {
  if (!dobStr) return null;
  const parts = dobStr.includes("-") ? dobStr.split("-") : dobStr.split("/");
  let birthDate: Date;
  if (parts.length === 3) {
    if (parts[0].length === 4) {
      birthDate = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    } else {
      birthDate = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
    }
  } else {
    birthDate = new Date(dobStr);
  }
  if (isNaN(birthDate.getTime())) return null;

  const targetDate = refDateStr ? new Date(refDateStr) : new Date();
  if (isNaN(targetDate.getTime())) return null;

  let age = targetDate.getFullYear() - birthDate.getFullYear();
  const m = targetDate.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && targetDate.getDate() < birthDate.getDate())) {
    age--;
  }
  return age >= 0 ? age : 0;
}

export function UserBookingDetailPage({
  booking,
  systemBank = defaultSystemBankAccount,
  onBack,
  onCancelBooking,
  onPayPaymentRequest,
}: UserBookingDetailPageProps) {
  const [contractModalOpen, setContractModalOpen] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedPaymentRequest, setSelectedPaymentRequest] = useState<PaymentRequest | null>(null);
  const [copiedAccount, setCopiedAccount] = useState(false);
  const [copiedContent, setCopiedContent] = useState(false);
  const [paymentSuccessToast, setPaymentSuccessToast] = useState(false);

  // Collapsible itinerary days (expanded by default)
  const [expandedDays, setExpandedDays] = useState<Set<string>>(
    new Set(booking.tour.itinerary ? booking.tour.itinerary.map((d) => d.id) : [])
  );

  const toggleDay = (id: string) => {
    setExpandedDays((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAllDays = () => {
    if (!booking.tour.itinerary) return;
    if (expandedDays.size === booking.tour.itinerary.length) {
      setExpandedDays(new Set());
    } else {
      setExpandedDays(new Set(booking.tour.itinerary.map((d) => d.id)));
    }
  };

  const st = statusMap[booking.status] ?? { label: booking.status, color: "bg-gray-100 text-gray-700" };
  const pst = paymentStatusMap[booking.paymentStatus ?? "unpaid"];

  const contractNo = `HD-${booking.id.replace("booking-", "").toUpperCase()}`;
  const today = new Date().toLocaleDateString("vi-VN");
  const canCancel = booking.status === "pending" || booking.status === "confirmed";

  // Multi-company co-hosting logic
  const isCoHosted = Boolean(booking.isCoHosted || booking.tour?.isCoHosted);
  const coHosts = (booking.coHosts && booking.coHosts.length > 0)
    ? booking.coHosts
    : (booking.tour?.coHosts && booking.tour.coHosts.length > 0)
    ? booking.tour.coHosts
    : [];
  const leadCoHost = coHosts.find((c) => c.role === "lead");
  const partnerCoHosts = coHosts.filter((c) => c.role !== "lead");

  return (
    <div className="min-h-screen bg-gray-50/70 py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 pb-16">
        {/* PAYMENT SUCCESS TOAST */}
        {paymentSuccessToast && (
          <div className="bg-emerald-600 text-white px-5 py-4 rounded-2xl shadow-lg flex items-center justify-between text-sm animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 flex-shrink-0" />
              <div>
                <p className="font-bold text-base">Thanh toán đợt thành công!</p>
                <p className="text-xs text-emerald-100">
                  Hệ thống đã nhận được tiền vào Tài khoản an toàn (Escrow) và tự động cập nhật trạng thái đã thanh toán cho Công ty lữ hành.
                </p>
              </div>
            </div>
            <button
              onClick={() => setPaymentSuccessToast(false)}
              className="text-white hover:text-emerald-100 text-xs underline ml-4"
            >
              Đóng
            </button>
          </div>
        )}

        {/* Top Header & Breadcrumb */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2">
              <button
                type="button"
                onClick={onBack}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal-700 hover:text-teal-900 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Quay lại danh sách tour đã đặt
              </button>

              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                  Chi tiết đơn đặt tour #{booking.id}
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
                    Có tùy chỉnh theo yêu cầu
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Button
                variant="outline"
                onClick={() => setContractModalOpen(true)}
                className="text-xs h-9 gap-1.5 border-gray-300 hover:bg-gray-100 font-semibold"
              >
                <FileText className="w-4 h-4 text-blue-600" />
                Xem hợp đồng dịch vụ
              </Button>

              {canCancel && (
                <Button
                  variant="outline"
                  onClick={() => setShowCancelModal(true)}
                  className="text-xs h-9 gap-1.5 border-rose-300 text-rose-700 hover:bg-rose-50 font-semibold"
                >
                  <XCircle className="w-4 h-4 text-rose-600" />
                  Yêu cầu hủy tour
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* 2-Columns Main Layout (Similar to Company Booking Detail Page) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT 2 COLUMNS: TOUR SUMMARY, PASSENGERS, TIMELINE */}
          <div className="lg:col-span-2 space-y-6">
            {/* TOUR OVERVIEW CARD */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 shadow-xs">
              <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center">
                <img
                  src={booking.tour.image}
                  alt={booking.tour.name}
                  className="w-full sm:w-44 h-32 rounded-xl object-cover flex-shrink-0 shadow-2xs"
                />
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono font-bold bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full">
                      {booking.tour.tourCode}
                    </span>
                    {isCoHosted ? (
                      <span className="text-xs font-bold text-amber-900 bg-amber-100 border border-amber-300 px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
                        <Handshake className="w-3.5 h-3.5 text-amber-700" />
                        🤝 Tour Liên Minh Đồng Dẫn ({coHosts.map((c) => c.companyName).join(" & ") || "2 Công Ty Phối Hợp"})
                      </span>
                    ) : booking.tour.companyName ? (
                      <span className="text-xs font-medium text-gray-600 flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-gray-400" />
                        {booking.tour.companyName}
                      </span>
                    ) : null}
                  </div>

                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 leading-snug">
                    {booking.tour.name}
                  </h2>

                  <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-gray-600 pt-1">
                    <span className="flex items-center gap-1 font-semibold text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-md border border-teal-200">
                      <Calendar className="w-3.5 h-3.5 text-teal-600" />
                      Khởi hành: {booking.tourStartDate || "Theo thỏa thuận"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      Thời gian: {booking.tour.duration}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-gray-400" />
                      Điểm đến: {booking.tour.destination}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* CO-HOSTING ALLIANCE BREAKDOWN CARD FOR CUSTOMER */}
            {isCoHosted && coHosts.length > 0 && (
              <div className="bg-gradient-to-br from-amber-50/80 via-purple-50/50 to-blue-50/50 rounded-2xl border-2 border-amber-300 p-5 sm:p-6 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-200/80 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800 flex-shrink-0 shadow-2xs">
                      <Handshake className="w-5 h-5 text-amber-700" />
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-amber-950 flex items-center gap-2 flex-wrap">
                        🤝 Tour Liên Minh Đồng Dẫn – 2 Công Ty Lữ Hành Cùng Phục Vụ
                        <span className="text-[11px] font-bold bg-amber-200 text-amber-900 px-2.5 py-0.5 rounded-full border border-amber-300">
                          Đã thống nhất phân công
                        </span>
                      </h3>
                      <p className="text-xs text-amber-800 mt-0.5">
                        Chuyến đi của quý khách được đồng phối hợp thực hiện bởi 2 công ty du lịch uy tín nhằm đảm bảo chất lượng phục vụ chuyên sâu và trải nghiệm địa phương xuất sắc nhất.
                      </p>
                    </div>
                  </div>
                </div>

                {/* 2 Companies Participation Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {coHosts.map((ch) => {
                    const isLead = ch.role === "lead";
                    return (
                      <div
                        key={ch.id}
                        className={`rounded-xl p-4 border transition-all ${
                          isLead
                            ? "bg-white border-blue-200 shadow-xs"
                            : "bg-white border-purple-200 shadow-xs"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span
                            className={`text-[11px] font-bold px-2.5 py-0.5 rounded-md uppercase tracking-wider ${
                              isLead
                                ? "bg-blue-100 text-blue-800 border border-blue-200"
                                : "bg-purple-100 text-purple-800 border border-purple-200"
                            }`}
                          >
                            {isLead ? "🏢 Đơn vị Chủ trì (Điều hành chính)" : "🤝 Đối tác Địa phương (Chuyên tuyến)"}
                          </span>
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            ✓ Đã xác nhận đồng hành
                          </span>
                        </div>

                        <div className="flex items-center gap-3 mb-2.5">
                          {ch.companyLogo ? (
                            <img
                              src={ch.companyLogo}
                              alt={ch.companyName}
                              className="w-10 h-10 rounded-xl object-cover border border-gray-200 flex-shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 font-bold text-sm">
                              {ch.companyName.charAt(0)}
                            </div>
                          )}
                          <div className="min-w-0">
                            <h4 className="font-bold text-gray-900 text-sm truncate">{ch.companyName}</h4>
                            <p className="text-xs text-gray-500 line-clamp-1">
                              {isLead
                                ? "Chịu trách nhiệm hợp đồng, bảo hiểm & xe đưa đón"
                                : "Chịu trách nhiệm HDV bản địa & dịch vụ tại chỗ"}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-1.5 text-xs bg-gray-50 rounded-lg p-2.5 border border-gray-100">
                          <div>
                            <span className="text-gray-400 block text-[10px] font-semibold uppercase">
                              Phần chặng / Dịch vụ phụ trách:
                            </span>
                            <span className="font-bold text-gray-800">
                              {ch.assignedSegments || (isLead ? "Chặng khởi hành & Quản lý chung" : "Chặng trải nghiệm địa phương")}
                            </span>
                          </div>

                          {ch.notes && (
                            <p className="text-gray-600 italic text-[11px] pt-1 border-t border-gray-200">
                              "{ch.notes}"
                            </p>
                          )}
                        </div>

                        {/* Direct Contact info for customer */}
                        <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-600 flex-wrap gap-2">
                          {ch.companyPhone ? (
                            <a
                              href={`tel:${ch.companyPhone.replace(/\s+/g, "")}`}
                              className="flex items-center gap-1 font-semibold text-teal-700 hover:text-teal-800"
                            >
                              <Phone className="w-3 h-3 text-teal-600" />
                              Hotline: {ch.companyPhone}
                            </a>
                          ) : (
                            <span className="text-[11px] text-gray-400">Hotline: Cập nhật sau</span>
                          )}
                          {ch.companyEmail && (
                            <span className="flex items-center gap-1 text-[11px] text-gray-500">
                              <Mail className="w-3 h-3 text-gray-400" />
                              {ch.companyEmail}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Escrow Guarantee Box */}
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-start gap-2.5 text-xs text-emerald-900">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block text-emerald-950">
                      Bảo chứng an toàn thanh toán Ký quỹ (Escrow Protection):
                    </span>
                    <p className="text-emerald-800 mt-0.5 leading-relaxed text-[11px]">
                      Quý khách thanh toán 100% vào tài khoản trung gian của Sàn Du Lịch. Cả 2 công ty liên minh đều chịu sự giám sát chất lượng từ Sàn. Sàn chỉ quyết toán tiền cho các công ty sau khi tour hoàn thành tốt đẹp theo đúng cam kết lịch trình.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* CUSTOM REQUESTS SUMMARY (IF ANY) */}
            {((booking.customHotelChanges && booking.customHotelChanges.length > 0) ||
              (booking.locationChanges && booking.locationChanges.length > 0) ||
              (booking.customMealChanges && booking.customMealChanges.length > 0)) && (
              <div className="bg-purple-50/60 rounded-2xl border border-purple-200 p-5 sm:p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-purple-200/80 pb-3">
                  <h3 className="text-sm font-bold text-purple-900 uppercase tracking-wide flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    Lịch trình tùy chỉnh theo yêu cầu của bạn
                  </h3>
                  <span className="text-xs bg-purple-200 text-purple-800 font-bold px-2 py-0.5 rounded">
                    Đã ghi nhận vào hợp đồng
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  {/* Hotel change */}
                  {booking.customHotelChanges && booking.customHotelChanges.length > 0 && (
                    <div className="bg-white rounded-xl p-3.5 border border-purple-200 space-y-1.5">
                      <p className="font-bold text-purple-900 flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-purple-600" />
                        Chỗ ở / Khách sạn yêu cầu:
                      </p>
                      {booking.customHotelChanges.map((hc, idx) => (
                        <div key={idx} className="pl-5 space-y-0.5">
                          <p className="font-bold text-gray-900 flex items-center gap-1.5 flex-wrap">
                            <span>{hc.destination}:</span>
                            <span className="text-purple-700">{hc.newHotelName}</span>
                            {hc.stars && (
                              <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                                {hc.stars} ★
                              </span>
                            )}
                          </p>
                          <p className="text-gray-400 line-through">
                            Gốc: {hc.originalHotelName} • ({hc.mode === "custom" ? "Tự nhập – Chờ công ty chốt giá" : "Từ hệ thống"})
                          </p>
                          {hc.note && <p className="text-purple-600 italic">Ghi chú: {hc.note}</p>}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Location changes */}
                  {booking.locationChanges && booking.locationChanges.length > 0 && (
                    <div className="bg-white rounded-xl p-3.5 border border-purple-200 space-y-1.5">
                      <p className="font-bold text-purple-900 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-purple-600" />
                        Thay đổi điểm tham quan:
                      </p>
                      {booking.locationChanges.map((lc, idx) => (
                        <div key={idx} className="pl-5 space-y-0.5">
                          <p className="font-bold text-gray-900">
                            Ngày {lc.dayNumber}: <span className="text-amber-800 font-bold">→ {lc.requestedLocations}</span>
                          </p>
                          {lc.originalLocationName ? (
                            <p className="text-gray-400 line-through">
                              Gốc: {lc.originalLocationName}
                            </p>
                          ) : lc.originalLocations && (
                            <p className="text-gray-400 line-through">
                              Gốc: {lc.originalLocations.join(", ")}
                            </p>
                          )}
                          {lc.note && <p className="text-gray-500 italic">Lý do/Ghi chú: {lc.note}</p>}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Meal changes */}
                  {booking.customMealChanges && booking.customMealChanges.length > 0 && (
                    <div className="bg-white rounded-xl p-3.5 border border-purple-200 space-y-1.5">
                      <p className="font-bold text-purple-900 flex items-center gap-1.5">
                        <Utensils className="w-3.5 h-3.5 text-purple-600" />
                        Thay đổi thực đơn / Nhà hàng:
                      </p>
                      {booking.customMealChanges.map((mc, idx) => (
                        <div key={idx} className="pl-5 space-y-0.5">
                          <p className="font-bold text-gray-900">
                            Ngày {mc.dayNumber} ({mc.mealType === "breakfast" ? "Bữa sáng" : mc.mealType === "lunch" ? "Bữa trưa" : "Bữa tối"}):{" "}
                            <span className="text-purple-700 font-bold">{mc.newMealName}</span>
                          </p>
                          <p className="text-gray-400 line-through">
                            Gốc: {mc.originalMealName || "Nhà hàng theo tour"}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* PASSENGER LIST CARD */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide flex items-center gap-2">
                  <Users className="w-4 h-4 text-teal-600" />
                  Danh sách hành khách tham gia ({booking.passengers?.length || booking.numberOfGuests} người)
                </h3>
                <span className="text-xs font-semibold text-gray-500">
                  {booking.numberOfGuests} vé
                </span>
              </div>

              {booking.passengers && booking.passengers.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-gray-100 text-gray-600 font-semibold">
                        <th className="px-3 py-2.5 text-left rounded-l-lg">#</th>
                        <th className="px-3 py-2.5 text-left">Họ &amp; Tên</th>
                        <th className="px-3 py-2.5 text-left">Ngày sinh</th>
                        <th className="px-3 py-2.5 text-left">Giới tính</th>
                        <th className="px-3 py-2.5 text-left">Loại khách</th>
                        <th className="px-3 py-2.5 text-right rounded-r-lg">Giá vé</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {booking.passengers.map((p, idx) => (
                        <tr key={p.id} className="hover:bg-gray-50">
                          <td className="px-3 py-2.5 text-gray-400 font-mono">{idx + 1}</td>
                          <td className="px-3 py-2.5 font-bold text-gray-900">{p.fullName}</td>
                          <td className="px-3 py-2.5 text-gray-600">
                            <span>{p.dateOfBirth || "—"}</span>
                            {(() => {
                              const age = calculateAge(p.dateOfBirth, booking.tourStartDate || booking.createdAt);
                              return age !== null ? (
                                <span className="ml-1.5 text-xs text-teal-700 font-semibold bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200">
                                  {age} tuổi
                                </span>
                              ) : null;
                            })()}
                          </td>
                          <td className="px-3 py-2.5 text-gray-600">{p.gender === "male" ? "Nam" : "Nữ"}</td>
                          <td className="px-3 py-2.5">
                            <span className={`px-2 py-0.5 rounded-full font-medium text-[11px] ${
                              p.ageGroup === "adult"
                                ? "bg-teal-50 text-teal-700"
                                : p.ageGroup === "child_2_11"
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
                      <tr className="bg-gray-50 font-bold border-t-2 border-gray-200">
                        <td colSpan={5} className="px-3 py-2.5 text-right text-gray-700">
                          Tổng cộng ({booking.passengers.length} khách):
                        </td>
                        <td className="px-3 py-2.5 text-right text-blue-700 text-sm font-extrabold">
                          {formatVND(booking.totalPrice)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-xl p-4 text-xs text-gray-600">
                  Đăng ký <strong>{booking.numberOfGuests} khách</strong> theo đại diện {booking.contactName || booking.userName}.
                </div>
              )}
            </div>

            {/* FULL ITINERARY VERTICAL TIMELINE (MATCHING chitietlichtrinh.png & TourDetailPage) */}
            {booking.tour.itinerary && booking.tour.itinerary.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 shadow-xs space-y-4">
                <div className="border-b border-gray-100 pb-3">
                  <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-purple-600" />
                    Lịch trình chi tiết (Lộ trình tham quan cơ bản của công ty)
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Lộ trình các điểm tham quan do công ty thiết lập theo thông tin đơn đặt tour của bạn.
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
                                  const locChange = booking.locationChanges?.find(
                                    (lc) =>
                                      (lc.dayId === day.id || lc.dayNumber === day.day) &&
                                      (lc.locationId === loc.id ||
                                        (lc.originalLocationName && lc.originalLocationName.toLowerCase() === loc.name.toLowerCase()) ||
                                        (lc.originalLocations && lc.originalLocations.some((orig) => orig.toLowerCase() === loc.name.toLowerCase())))
                                  );
                                  const isLocChanged = Boolean(locChange);

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
                                                  → {locChange?.requestedLocations}
                                                </p>
                                                {locChange?.note && (
                                                  <p className="text-xs text-amber-700 italic mt-0.5">
                                                    Ghi chú: {locChange.note}
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
                                  (Có thể đổi nhà hàng hoặc yêu cầu riêng)
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

          {/* RIGHT SIDEBAR: CONTACT, FINANCE, GUIDE, CONTRACT, ACTIONS */}
          <div className="space-y-6">
            {/* CONTACT INFO CARD */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-3">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <Users className="w-4 h-4 text-teal-600" />
                Thông tin người đại diện đặt tour
              </h3>
              <div className="space-y-2.5 text-xs">
                <div>
                  <span className="text-gray-400 block text-[11px]">Họ và tên</span>
                  <span className="font-bold text-gray-900 text-sm">
                    {booking.contactName || booking.userName}
                  </span>
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
                    <span className="font-bold block mb-1">Ghi chú của bạn:</span>
                    <p className="leading-relaxed">{booking.bookingNotes}</p>
                  </div>
                )}
              </div>
            </div>

            {/* FINANCE & PAYMENT STATUS CARD */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-teal-600" />
                  Tài chính &amp; Thanh toán
                </h3>
                <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold border ${pst.color}`}>
                  {pst.label}
                </span>
              </div>

              <div className="space-y-2.5 text-xs">
                {/* Total Price and adjustments */}
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 font-medium">Tổng giá trị tour ({booking.numberOfGuests} khách):</span>
                    <span className="font-extrabold text-blue-700 text-base">{formatVND(booking.totalPrice)}</span>
                  </div>

                  {booking.originalTotalPrice && booking.originalTotalPrice !== booking.totalPrice && (
                    <div className="flex items-center gap-2 text-[11px] pt-0.5">
                      <span className="text-gray-400 line-through">Giá ban đầu: {formatVND(booking.originalTotalPrice)}</span>
                      <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-bold text-[10px]">
                        Công ty đã điều chỉnh ({booking.totalPrice > booking.originalTotalPrice ? "+" : ""}{formatVND(booking.totalPrice - booking.originalTotalPrice)})
                      </span>
                    </div>
                  )}

                  {booking.priceAdjustmentNote && (
                    <p className="text-[11px] text-gray-700 bg-white p-2 rounded border border-gray-200 mt-1">
                      💡 <strong>Ghi chú từ công ty:</strong> {booking.priceAdjustmentNote}
                    </p>
                  )}
                </div>

                {/* Progress breakdown */}
                {(() => {
                  const totalPaidIntoSystem = (booking.paymentRequests ?? [])
                    .filter((pr) => pr.status === "paid")
                    .reduce((sum, pr) => sum + pr.amount, 0);
                  const remainingToPay = Math.max(0, booking.totalPrice - totalPaidIntoSystem);

                  return (
                    <div className="space-y-1.5 py-1">
                      <div className="flex justify-between items-center py-1 border-b border-gray-100">
                        <span className="text-gray-500">Đã thanh toán vào TK Hệ thống:</span>
                        <span className="font-bold text-emerald-700">{formatVND(totalPaidIntoSystem)}</span>
                      </div>
                      <div className="flex justify-between items-center py-1 border-b border-gray-100">
                        <span className="text-gray-500">Số tiền còn lại cần thanh toán:</span>
                        <span className="font-bold text-red-600 text-sm">{formatVND(remainingToPay)}</span>
                      </div>
                    </div>
                  );
                })()}

                {booking.paymentStatus === "unpaid" && (
                  <div className="bg-teal-50 p-3 rounded-xl border border-teal-200 text-teal-900 text-xs leading-relaxed">
                    💡 <strong>Chính sách thanh toán sau:</strong> Bạn chưa cần thanh toán ngay lúc này. Công ty lữ hành sẽ liên hệ với các bên dịch vụ bên ngoài để chốt giá chính thức cho đoàn và gửi thông báo thanh toán cho bạn.
                  </div>
                )}

                <div className="bg-emerald-50/80 p-2.5 rounded-lg border border-emerald-200 text-emerald-900 text-[11px] leading-relaxed flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Bảo chứng thanh toán (Escrow):</strong> Tiền thanh toán của bạn sẽ được giữ an toàn tại Tài khoản Hệ thống và chỉ chuyển giao cho Công ty du lịch sau khi kết thúc tour.
                  </span>
                </div>
              </div>

              {/* Payment Requests from Tour Company */}
              {booking.paymentRequests && booking.paymentRequests.length > 0 && (
                <div className="pt-3 border-t border-gray-100 space-y-2.5">
                  <span className="text-xs font-bold text-gray-800 block">Các đợt thanh toán từ công ty lữ hành:</span>
                  <div className="space-y-2.5">
                    {booking.paymentRequests.map((pr) => {
                      const isPaid = pr.status === "paid";
                      return (
                        <div key={pr.id} className="bg-gray-50 rounded-xl p-3.5 border border-gray-200 text-xs space-y-1.5 shadow-2xs">
                          <div className="flex justify-between items-start gap-2">
                            <p className="font-bold text-gray-900">{pr.description}</p>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border flex-shrink-0 ${
                              isPaid
                                ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                                : pr.status === "overdue"
                                ? "bg-red-100 text-red-800 border-red-200"
                                : "bg-amber-100 text-amber-800 border-amber-200"
                            }`}>
                              {isPaid ? "Đã nộp vào TK Hệ thống" : pr.status === "overdue" ? "Quá hạn" : "Chờ thanh toán"}
                            </span>
                          </div>

                          <div className="flex justify-between items-center text-gray-500 pt-0.5">
                            <span>Hạn chót: <strong>{pr.dueDate}</strong></span>
                            <span className="font-extrabold text-blue-700 text-sm">{formatVND(pr.amount)}</span>
                          </div>

                          {isPaid ? (
                            <p className="text-[10px] text-emerald-700 font-medium flex items-center gap-1 pt-1 border-t border-gray-200/60">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              Đã chuyển khoản an toàn vào TK Hệ thống ({pr.paidAt})
                            </p>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => setSelectedPaymentRequest(pr)}
                              className="w-full mt-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs h-8 gap-1.5 shadow-xs"
                            >
                              <CreditCard className="w-3.5 h-3.5" />
                              Thanh toán đợt này ({formatVND(pr.amount)})
                            </Button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* ASSIGNED TOUR GUIDE CARD */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-3">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-teal-600" />
                Hướng dẫn viên đồng hành
              </h3>
              {booking.guideName ? (
                <div className="bg-blue-50/70 rounded-xl p-3.5 border border-blue-100 flex items-center gap-3">
                  {booking.guideAvatar ? (
                    <img
                      src={booking.guideAvatar}
                      alt={booking.guideName}
                      className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-xs"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center shadow-xs">
                      {booking.guideName[0]}
                    </div>
                  )}
                  <div className="flex-1 min-w-0 text-xs">
                    <span className="text-[10px] font-bold text-blue-700 uppercase block">HDV phụ trách đoàn</span>
                    <p className="font-bold text-gray-900 text-sm">{booking.guideName}</p>
                    {booking.guidePhone && (
                      <p className="text-blue-700 font-semibold flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3 text-blue-600" />
                        {booking.guidePhone}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-xl p-3.5 border border-gray-200 text-xs text-gray-600">
                  <p className="font-semibold text-gray-800">Đang sắp xếp hướng dẫn viên</p>
                  <p className="text-gray-500 mt-0.5">
                    Công ty lữ hành sẽ gán hướng dẫn viên phù hợp và cập nhật thông tin liên hệ cho bạn trước ngày khởi hành.
                  </p>
                </div>
              )}
            </div>

            {/* CONTRACT & ACTIONS CARD */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-3">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-teal-600" />
                Hợp đồng &amp; Thao tác
              </h3>
              <div className="space-y-2">
                <Button
                  onClick={() => setContractModalOpen(true)}
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white text-xs h-9 font-semibold gap-2 shadow-xs"
                >
                  <FileText className="w-4 h-4" />
                  Xem hợp đồng dịch vụ lữ hành
                </Button>
                {canCancel && (
                  <Button
                    variant="outline"
                    onClick={() => setShowCancelModal(true)}
                    className="w-full border-rose-300 text-rose-700 hover:bg-rose-50 text-xs h-9 font-semibold gap-2"
                  >
                    <XCircle className="w-4 h-4 text-rose-600" />
                    Hủy đơn đặt tour này
                  </Button>
                )}
              </div>
            </div>

            {/* DEDICATED SUPPORT HOTLINES CARD */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-3">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <Phone className="w-4 h-4 text-teal-600" />
                Đường dây nóng hỗ trợ đoàn
              </h3>

              <div className="space-y-2.5 text-xs">
                {isCoHosted && coHosts.length > 0 ? (
                  coHosts.map((ch) => (
                    <div
                      key={ch.id}
                      className="p-2.5 rounded-xl border border-gray-200 bg-gray-50/70 flex items-center justify-between"
                    >
                      <div className="min-w-0 pr-2">
                        <p className="font-bold text-gray-900 text-xs truncate">{ch.companyName}</p>
                        <p className="text-[10px] text-gray-500">
                          {ch.role === "lead" ? "Đơn vị chủ trì" : "Đối tác địa phương"}
                        </p>
                      </div>
                      <a
                        href={`tel:${(ch.companyPhone || "19001234").replace(/\s+/g, "")}`}
                        className="font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200 hover:bg-teal-100 flex items-center gap-1 text-xs flex-shrink-0"
                      >
                        <Phone className="w-3 h-3 text-teal-600" />
                        {ch.companyPhone || "1900 1234"}
                      </a>
                    </div>
                  ))
                ) : (
                  <div className="p-2.5 rounded-xl border border-gray-200 bg-gray-50/70 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-gray-900 text-xs">
                        {booking.tour.companyName || "Công ty lữ hành"}
                      </p>
                      <p className="text-[10px] text-gray-500">Đơn vị tổ chức tour</p>
                    </div>
                    <span className="font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200 flex items-center gap-1 text-xs">
                      <Phone className="w-3 h-3 text-teal-600" />
                      1900 1234
                    </span>
                  </div>
                )}

                <div className="p-2.5 rounded-xl border border-blue-200 bg-blue-50/60 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-blue-950 text-xs">Sàn Du Lịch Việt Nam</p>
                    <p className="text-[10px] text-blue-700">Tổng đài bảo vệ & Ký quỹ 24/7</p>
                  </div>
                  <a
                    href="tel:19006868"
                    className="font-bold text-blue-800 bg-blue-100/80 px-2.5 py-1 rounded-lg border border-blue-300 hover:bg-blue-200 flex items-center gap-1 text-xs flex-shrink-0"
                  >
                    <Phone className="w-3 h-3 text-blue-600" />
                    1900 6868
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CANCEL MODAL */}
      {showCancelModal && (
        <CancelTourModal
          bookingId={booking.id}
          tourName={booking.tour.name}
          onCancel={() => setShowCancelModal(false)}
          onConfirm={(reason) => {
            onCancelBooking(booking.id, reason);
            setShowCancelModal(false);
          }}
        />
      )}

      {/* ELECTRONIC CONTRACT MODAL */}
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
              <p className="font-bold text-sm text-gray-900 uppercase">
                {isCoHosted && leadCoHost
                  ? `${leadCoHost.companyName} & ${partnerCoHosts.map((c) => c.companyName).join(", ")}`
                  : booking.companyName || booking.tour.companyName || "CÔNG TY DU LỊCH"}
              </p>
              <p className="text-xs text-gray-500">
                {isCoHosted ? "Liên minh Doanh nghiệp Lữ hành & Đối tác Chuyên tuyến" : "Giấy phép kinh doanh lữ hành"}
              </p>
              <p className="text-base font-bold mt-2 text-blue-800">HỢP ĐỒNG DỊCH VỤ LỮ HÀNH</p>
              <p className="text-[11px] text-gray-400">Số: {contractNo} – Ngày lập: {today}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 p-2.5 rounded-lg border">
                <p className="font-bold text-gray-900 mb-1">BÊN A (CÔNG TY LỮ HÀNH):</p>
                <p>Đơn vị chủ trì: <strong>{leadCoHost?.companyName || booking.companyName || booking.tour.companyName || "Đơn vị tổ chức tour"}</strong></p>
                {isCoHosted && partnerCoHosts.length > 0 && (
                  <p className="mt-1 text-purple-800">
                    Đồng tổ chức liên minh: <strong>{partnerCoHosts.map((c) => c.companyName).join(", ")}</strong>
                  </p>
                )}
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
              <p>Số tiền còn lại: <strong>{formatVND(booking.remainingAmount ?? (booking.depositPaid ? booking.totalPrice - (booking.depositAmount ?? 0) : booking.totalPrice))}</strong></p>
            </div>

            {isCoHosted && (
              <div className="bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                <p className="font-bold text-amber-900 mb-1">ĐIỀU KHOẢN LIÊN MINH &amp; BẢO CHỨNG KÝ QUỸ (ESCROW):</p>
                <p className="leading-relaxed">
                  Tour được thực hiện theo cơ chế liên minh giữa <strong>{leadCoHost?.companyName || booking.companyName}</strong> và <strong>{partnerCoHosts.map((c) => c.companyName).join(", ")}</strong>. Tiền tour của Bên B được ký quỹ an toàn tại Tài khoản trung gian của Sàn Du Lịch ({systemBank.bankName} – STK: {systemBank.accountNumber}), và chỉ được giải ngân cho các đơn vị sau khi hoàn thành toàn bộ chương trình tour.
                </p>
              </div>
            )}

            {booking.hasLocationCustomization && (
              <div className="bg-purple-50 p-2.5 rounded-lg border border-purple-200">
                <p className="font-bold text-purple-900 mb-1">ĐIỀU KHOẢN TÙY CHỈNH LỊCH TRÌNH:</p>
                <p>Các điều chỉnh về khách sạn, địa điểm tham quan và thực đơn theo thỏa thuận phụ lục booking.</p>
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

      {/* MODAL: THANH TOÁN QUA TÀI KHOẢN HỆ THỐNG */}
      <Dialog
        open={Boolean(selectedPaymentRequest)}
        onOpenChange={(open) => !open && setSelectedPaymentRequest(null)}
      >
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          {selectedPaymentRequest && (
            <div className="space-y-4 pt-1 text-xs text-gray-700">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-base text-gray-900">
                  <Landmark className="w-5 h-5 text-blue-600" />
                  Thanh toán qua Tài khoản Hệ thống
                </DialogTitle>
              </DialogHeader>

              {/* Booking & Stage Summary */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-200 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-blue-700 tracking-wide block">
                      Đơn hàng #{booking.id}
                    </span>
                    <p className="font-bold text-gray-900 text-sm">{booking.tour.name}</p>
                  </div>
                  <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    Hạn: {selectedPaymentRequest.dueDate}
                  </span>
                </div>

                <div className="pt-2 border-t border-blue-200/60 flex justify-between items-center">
                  <span className="font-medium text-gray-700">Mục đích: <strong>{selectedPaymentRequest.description}</strong></span>
                  <span className="text-base font-extrabold text-blue-700">{formatVND(selectedPaymentRequest.amount)}</span>
                </div>
              </div>

              {/* Escrow Guarantee Banner */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-[11px] text-emerald-950 flex items-start gap-2.5 leading-relaxed">
                <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-emerald-900">Cơ chế Bảo chứng Thanh toán (Escrow):</p>
                  <p className="text-gray-700">
                    Tiền của bạn được chuyển vào <strong>Tài khoản trung gian của Hệ thống Sàn Du lịch</strong>. Hệ thống chỉ quyết toán chuyển trả cho Công ty Du lịch sau khi bạn đã hoàn thành tour an toàn và hài lòng.
                  </p>
                </div>
              </div>

              {/* Bank Account Info Card */}
              <div className="bg-slate-900 text-white rounded-2xl p-4 space-y-3 relative overflow-hidden shadow-md">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] text-blue-300 font-bold uppercase tracking-wider block">
                      Tài khoản thụ hưởng Sàn Du lịch
                    </span>
                    <p className="text-xs font-bold text-white mt-0.5">{systemBank.bankName}</p>
                  </div>
                  <CreditCard className="w-5 h-5 text-blue-300" />
                </div>

                <div className="pt-1 flex items-center justify-between bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
                  <div>
                    <span className="text-[10px] text-gray-400 block">Số tài khoản</span>
                    <span className="font-mono text-base font-extrabold text-amber-300 tracking-wider">
                      {systemBank.accountNumber}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(systemBank.accountNumber);
                      setCopiedAccount(true);
                      setTimeout(() => setCopiedAccount(false), 2000);
                    }}
                    className="flex items-center gap-1 text-[11px] bg-blue-600 hover:bg-blue-500 text-white px-2.5 py-1 rounded-lg font-medium transition-colors"
                  >
                    {copiedAccount ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedAccount ? "Đã chép" : "Sao chép"}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-gray-400 block">Chủ tài khoản</span>
                    <span className="font-bold text-white text-[11px] uppercase truncate block">
                      {systemBank.accountHolder}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 block">Chi nhánh</span>
                    <span className="text-gray-200 text-[11px] truncate block">{systemBank.branch || "Hội sở"}</span>
                  </div>
                </div>

                {/* Transfer Content */}
                <div className="flex items-center justify-between bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
                  <div>
                    <span className="text-[10px] text-gray-400 block">Nội dung chuyển khoản chuẩn</span>
                    <span className="font-mono font-bold text-emerald-400 text-xs">
                      TT {booking.id} {selectedPaymentRequest.id}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(`TT ${booking.id} ${selectedPaymentRequest.id}`);
                      setCopiedContent(true);
                      setTimeout(() => setCopiedContent(false), 2000);
                    }}
                    className="flex items-center gap-1 text-[11px] bg-blue-600 hover:bg-blue-500 text-white px-2.5 py-1 rounded-lg font-medium transition-colors"
                  >
                    {copiedContent ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedContent ? "Đã chép" : "Sao chép"}
                  </button>
                </div>
              </div>

              {/* VietQR Code Display */}
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 text-center space-y-2">
                <p className="font-bold text-gray-800 flex items-center justify-center gap-1.5">
                  <QrCode className="w-4 h-4 text-blue-600" />
                  Quét mã VietQR chuyển khoản nhanh:
                </p>
                <div className="inline-block p-2 bg-white rounded-xl border border-gray-200 shadow-xs">
                  <img
                    src={`https://img.vietqr.io/image/VCB-${systemBank.accountNumber}-compact2.png?amount=${selectedPaymentRequest.amount}&addInfo=TT%20${booking.id}%20${selectedPaymentRequest.id}&accountName=${encodeURIComponent(systemBank.accountHolder)}`}
                    alt="Mã VietQR"
                    className="w-44 h-44 object-contain mx-auto"
                  />
                </div>
                <p className="text-[10px] text-gray-500">
                  Mở ứng dụng ngân hàng bất kỳ để quét mã (Số tiền &amp; Nội dung đã được điền sẵn)
                </p>
              </div>

              {/* DEMO NOTICE FOR TEACHER */}
              <div className="bg-amber-50 border border-amber-300 rounded-2xl p-3.5 space-y-2 text-[11px] text-amber-950">
                <p className="font-bold flex items-center gap-1.5 text-amber-900">
                  <Sparkles className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  Cơ chế Tự động hóa Thực tế vs Nút Demo:
                </p>
                <ul className="list-disc pl-4 space-y-1 text-gray-700 leading-relaxed">
                  <li>
                    <strong>Trong thực tế triển khai:</strong> Sau khi khách quét mã VietQR và xác nhận chuyển tiền trên App ngân hàng, hệ thống webhook của cổng thanh toán / ngân hàng sẽ tự động gửi thông báo IPN. Máy chủ tự động nhận diện và cập nhật trạng thái đợt này sang <strong>"Đã thanh toán"</strong> cho Công ty du lịch ngay tức thì mà không cần thao tác bấm xác nhận thủ công.
                  </li>
                  <li>
                    <strong>Phiên bản Demo:</strong> Bấm nút xác nhận bên dưới để mô phỏng tín hiệu webhook ngân hàng báo về chuyển khoản thành công.
                  </li>
                </ul>

                <Button
                  onClick={() => {
                    if (onPayPaymentRequest) {
                      onPayPaymentRequest(booking.id, selectedPaymentRequest.id);
                    }
                    setSelectedPaymentRequest(null);
                    setPaymentSuccessToast(true);
                    setTimeout(() => setPaymentSuccessToast(false), 4000);
                  }}
                  className="w-full mt-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-10 gap-2 shadow-sm"
                >
                  <Check className="w-4 h-4" />
                  [DEMO] Mô phỏng Khách đã quét QR &amp; Chuyển khoản thành công
                </Button>
              </div>

              <div className="flex justify-end pt-1">
                <Button variant="outline" onClick={() => setSelectedPaymentRequest(null)}>
                  Đóng lại
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
