import { useState } from "react";
import { Booking, PaymentRequest, TourContract, CustomLocationChange, CustomHotelChange, CustomMealChange } from "@/app/types";
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
  onBack: () => void;
  onCancelBooking: (bookingId: string, reason: string) => void;
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

export function UserBookingDetailPage({
  booking,
  onBack,
  onCancelBooking,
}: UserBookingDetailPageProps) {
  const [contractModalOpen, setContractModalOpen] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

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

  return (
    <div className="min-h-screen bg-gray-50/70 py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 pb-16">
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
                    {booking.tour.companyName && (
                      <span className="text-xs font-medium text-gray-600 flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-gray-400" />
                        {booking.tour.companyName}
                      </span>
                    )}
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
                          <p className="font-bold text-gray-900">
                            {hc.destination}: <span className="text-purple-700">{hc.newHotelName}</span>
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
                          {lc.originalLocations && (
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
                          <td className="px-3 py-2.5 text-gray-600">{p.dateOfBirth}</td>
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
                                                    Ghi chú: {dayLocChange.note}
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
                <div className="flex justify-between items-center py-1 border-b border-gray-100">
                  <span className="text-gray-500">Tổng giá trị tour ({booking.numberOfGuests} khách):</span>
                  <span className="font-extrabold text-blue-700 text-base">{formatVND(booking.totalPrice)}</span>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-gray-100">
                  <span className="text-gray-500">Tiền đặt cọc:</span>
                  <span className={`font-bold ${booking.depositPaid ? "text-emerald-700" : "text-amber-600"}`}>
                    {booking.depositPaid
                      ? `Đã cọc ${formatVND(booking.depositAmount ?? Math.ceil(booking.totalPrice * 0.5))}`
                      : "Chưa nộp tiền cọc"}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-gray-100">
                  <span className="text-gray-500">Số tiền còn lại cần thanh toán:</span>
                  <span className="font-bold text-red-600 text-sm">
                    {formatVND(
                      booking.remainingAmount ??
                        (booking.depositPaid
                          ? booking.totalPrice - (booking.depositAmount ?? 0)
                          : booking.totalPrice),
                    )}
                  </span>
                </div>

                {booking.paymentStatus === "unpaid" && (
                  <div className="bg-teal-50 p-3 rounded-xl border border-teal-200 text-teal-900 text-xs leading-relaxed">
                    💡 <strong>Chính sách thanh toán sau:</strong> Bạn chưa cần thanh toán ngay lúc này. Công ty lữ hành sẽ liên hệ với các bên dịch vụ bên ngoài để chốt giá chính thức cho đoàn và gửi thông báo thanh toán cho bạn.
                  </div>
                )}
              </div>

              {/* Payment Requests from Tour Company */}
              {booking.paymentRequests && booking.paymentRequests.length > 0 && (
                <div className="pt-3 border-t border-gray-100 space-y-2">
                  <span className="text-xs font-bold text-gray-800 block">Các đợt thanh toán từ công ty lữ hành:</span>
                  <div className="space-y-2">
                    {booking.paymentRequests.map((pr) => (
                      <div key={pr.id} className="bg-gray-50 rounded-xl p-3 border border-gray-200 text-xs space-y-1">
                        <div className="flex justify-between items-start">
                          <p className="font-semibold text-gray-800">{pr.description}</p>
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            pr.status === "paid"
                              ? "bg-emerald-100 text-emerald-800"
                              : pr.status === "overdue"
                              ? "bg-red-100 text-red-800"
                              : "bg-amber-100 text-amber-800"
                          }`}>
                            {pr.status === "paid" ? "Đã nộp" : pr.status === "overdue" ? "Quá hạn" : "Chờ thanh toán"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-gray-500 pt-1">
                          <span>Hạn chót: {pr.dueDate}</span>
                          <span className="font-bold text-blue-700 text-sm">{formatVND(pr.amount)}</span>
                        </div>
                      </div>
                    ))}
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
              <p className="font-bold text-sm text-gray-900 uppercase">{booking.companyName || booking.tour.companyName || "CÔNG TY DU LỊCH"}</p>
              <p className="text-xs text-gray-500">Giấy phép kinh doanh lữ hành</p>
              <p className="text-base font-bold mt-2 text-blue-800">HỢP ĐỒNG DỊCH VỤ LỮ HÀNH</p>
              <p className="text-[11px] text-gray-400">Số: {contractNo} – Ngày lập: {today}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 p-2.5 rounded-lg border">
                <p className="font-bold text-gray-900 mb-1">BÊN A (CÔNG TY LỮ HÀNH):</p>
                <p>Tên: <strong>{booking.companyName || booking.tour.companyName || "Đơn vị tổ chức tour"}</strong></p>
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
    </div>
  );
}
