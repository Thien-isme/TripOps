import { useState } from "react";
import { Tour, BookingPassenger, TourPriceRow, CustomHotelChange, CustomLocationChange, CustomMealChange } from "@/app/types";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  X,
  Plus,
  Trash2,
  User,
  MapPin,
  Phone,
  Mail,
  FileText,
  Info,
  AlertTriangle,
  Building2,
  Utensils,
  Clock,
  Calendar,
  Sparkles,
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";

interface BookingFormPageProps {
  tour: Tour;
  currentUser: { id: string; name: string; email: string; phone?: string } | null;
  hasLocationCustomization?: boolean;
  customHotelChanges?: CustomHotelChange[];
  customMealChanges?: CustomMealChange[];
  locationChanges?: CustomLocationChange[];
  onBack: () => void;
  onSubmit: (data: BookingSubmitData) => void;
  onGoHome?: () => void;
  onViewMyBookings?: () => void;
}

export interface BookingSubmitData {
  tourId: string;
  tourStartDate: string;
  passengers: BookingPassenger[];
  contactName: string;
  contactAddress: string;
  contactPhone: string;
  contactEmail: string;
  bookingNotes: string;
  totalPrice: number;
  depositAmount: number;
  hasLocationCustomization: boolean;
  requiresDepositNow: boolean;
  customHotelChanges?: CustomHotelChange[];
  customMealChanges?: CustomMealChange[];
  locationChanges?: CustomLocationChange[];
}

type Step = 1 | 2 | 3 | 4;

const STEPS = [
  { id: 1, label: "Chọn tour" },
  { id: 2, label: "Đăng ký tour" },
  { id: 3, label: "Xác nhận thông tin" },
  { id: 4, label: "Hoàn thành" },
];

const AGE_GROUPS: Array<{ value: BookingPassenger["ageGroup"]; label: string; ageRange: string }> = [
  { value: "adult", label: "Người lớn", ageRange: "Từ 11 tuổi trở lên" },
  { value: "child_2_11", label: "Trẻ em (2–11 tuổi)", ageRange: "Từ 2 đến dưới 11 tuổi" },
  { value: "child_under_2", label: "Trẻ em (dưới 2 tuổi)", ageRange: "Dưới 2 tuổi" },
];

function formatVND(n: number) {
  return n.toLocaleString("vi-VN") + "đ";
}

function getPriceForAgeGroup(tour: Tour, ageGroup: BookingPassenger["ageGroup"]): number {
  if (!tour.priceTable) return tour.price;
  const row = tour.priceTable.find((r) => r.ageGroup === ageGroup);
  return row?.price ?? tour.price;
}

function newPassenger(id: string, tour: Tour): BookingPassenger {
  return {
    id,
    fullName: "",
    dateOfBirth: "",
    gender: "male",
    ageGroup: "adult",
    price: getPriceForAgeGroup(tour, "adult"),
  };
}

export function BookingFormPage({
  tour,
  currentUser,
  hasLocationCustomization = false,
  customHotelChanges = [],
  customMealChanges = [],
  locationChanges = [],
  onBack,
  onSubmit,
  onGoHome,
  onViewMyBookings,
}: BookingFormPageProps) {
  const [step, setStep] = useState<Step>(2);

  // Step 2 state
  const initialStartDate =
    tour.departureDates && tour.departureDates.length > 0
      ? tour.departureDates[0].date
      : new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0];
  const [tourStartDate, setTourStartDate] = useState(initialStartDate);

  const [passengers, setPassengers] = useState<BookingPassenger[]>([
    newPassenger("p1", tour),
  ]);
  const [contactName, setContactName] = useState(currentUser?.name ?? "");
  const [contactAddress, setContactAddress] = useState("");
  const [contactPhone, setContactPhone] = useState(currentUser?.phone ?? "");
  const [contactEmail, setContactEmail] = useState(currentUser?.email ?? "");
  const [bookingNotes, setBookingNotes] = useState("");

  const isCustomized =
    hasLocationCustomization ||
    (customHotelChanges && customHotelChanges.length > 0) ||
    (customMealChanges && customMealChanges.length > 0) ||
    (locationChanges && locationChanges.length > 0);

  // Computed
  const totalPrice = passengers.reduce((s, p) => s + p.price, 0);
  const depositAmount = 0;
  const requiresDepositNow = false;

  const addPassenger = () => {
    setPassengers([...passengers, newPassenger(`p${Date.now()}`, tour)]);
  };

  const removePassenger = (id: string) => {
    if (passengers.length <= 1) return;
    setPassengers(passengers.filter((p) => p.id !== id));
  };

  const updatePassenger = (id: string, update: Partial<BookingPassenger>) => {
    setPassengers(
      passengers.map((p) => {
        if (p.id !== id) return p;
        const updated = { ...p, ...update };
        if (update.ageGroup) {
          updated.price = getPriceForAgeGroup(tour, updated.ageGroup);
        }
        return updated;
      }),
    );
  };

  const isStep2Valid =
    tourStartDate.trim() &&
    passengers.every((p) => p.fullName.trim() && p.dateOfBirth) &&
    contactName.trim() &&
    contactPhone.trim() &&
    contactEmail.trim();

  const handleConfirm = () => {
    onSubmit({
      tourId: tour.id,
      tourStartDate,
      passengers,
      contactName,
      contactAddress,
      contactPhone,
      contactEmail,
      bookingNotes,
      totalPrice,
      depositAmount: 0,
      hasLocationCustomization: isCustomized,
      requiresDepositNow: false,
      customHotelChanges,
      customMealChanges,
      locationChanges,
    });
    setStep(4);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="font-bold text-gray-900">Đăng ký Tour</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Step indicator */}
        <div className="flex items-center gap-0">
          {STEPS.map((s, idx) => {
            const done = s.id < step;
            const active = s.id === step;
            return (
              <div key={s.id} className="flex items-center flex-1 last:flex-none">
                <div className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-all ${
                  done ? "bg-teal-600 text-white" : active ? "bg-teal-600 text-white" : "bg-gray-200 text-gray-500"
                }`}>
                  {done ? <CheckCircle className="w-4 h-4" /> : <span className="w-4 h-4 flex items-center justify-center">{s.id}</span>}
                  <span className="hidden sm:inline">{s.label}</span>
                </div>
                {idx < STEPS.length - 1 && (
                  <div className={`h-0.5 flex-1 mx-1 ${done ? "bg-teal-600" : "bg-gray-200"}`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Step 2: Registration form */}
        {step === 2 && (
          <div className="space-y-6">
            {/* Tour info */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="text-base font-bold text-teal-700 border-b border-gray-200 pb-2 mb-4">
                Thông tin tour & Ngày khởi hành
              </h2>
              <div className="space-y-2 text-sm text-gray-700 mb-4">
                <p className="font-semibold text-gray-900">{tour.name}</p>
                <p><span className="text-gray-400">Mã tour:</span> {tour.tourCode}</p>
                <p><span className="text-gray-400">Thời gian:</span> {tour.duration}</p>
                {tour.operationPeriod && (
                  <p><span className="text-gray-400">Mùa tour / Thời gian hoạt động:</span> {tour.operationPeriod}</p>
                )}
              </div>

              {/* Departure date selection */}
              <div className="pt-3 border-t border-gray-100 space-y-3">
                <Label className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-teal-600" />
                  Ngày khởi hành mong muốn <span className="text-red-500">*</span>
                </Label>

                {/* Direct date picker allowing user to freely pick their desired departure date */}
                <div className="bg-teal-50/60 border border-teal-200 rounded-xl p-3.5 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="flex-1">
                      <Label htmlFor="custom-start-date" className="text-xs font-semibold text-teal-900 mb-1 block">
                        Chọn ngày khởi hành theo kế hoạch của bạn:
                      </Label>
                      <Input
                        id="custom-start-date"
                        type="date"
                        value={tourStartDate}
                        min={new Date().toISOString().split("T")[0]}
                        onChange={(e) => setTourStartDate(e.target.value)}
                        className="bg-white border-teal-300 focus:ring-teal-500 max-w-sm font-medium text-gray-900"
                      />
                    </div>
                    {tourStartDate && (
                      <div className="sm:self-end pb-1 text-xs text-teal-800">
                        Ngày đã chọn: <strong className="text-teal-950 font-bold">{tourStartDate}</strong>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-teal-700">
                    Bạn có thể chọn bất kỳ ngày nào thuận tiện cho chuyến đi. Công ty du lịch sẽ tiếp nhận và sắp xếp lịch khởi hành theo ngày này.
                  </p>
                </div>

                {/* Quick-pick from scheduled departure dates if available */}
                {tour.departureDates && tour.departureDates.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <p className="text-xs font-medium text-gray-600">
                      Hoặc bấm chọn nhanh từ các đợt khởi hành định kỳ của tour:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                      {tour.departureDates.map((d) => {
                        const isSelected = tourStartDate === d.date;
                        return (
                          <button
                            type="button"
                            key={d.date}
                            onClick={() => setTourStartDate(d.date)}
                            className={`p-2.5 rounded-xl border text-left transition-all ${
                              isSelected
                                ? "border-teal-600 bg-teal-50 text-teal-900 ring-2 ring-teal-500 shadow-sm"
                                : "border-gray-200 hover:border-teal-300 bg-white text-gray-700 hover:bg-teal-50/30"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <p className="font-bold text-sm text-gray-900">{d.date}</p>
                              {isSelected && (
                                <span className="text-[10px] bg-teal-600 text-white font-bold px-1.5 py-0.5 rounded">
                                  Đang chọn
                                </span>
                              )}
                            </div>
                            {d.label && <p className="text-xs text-gray-500 mt-0.5">{d.label}</p>}
                            {d.seatsAvailable !== undefined && (
                              <p className="text-xs text-teal-700 font-medium mt-0.5">Còn {d.seatsAvailable} chỗ</p>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Price table */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="text-base font-bold text-teal-700 border-b border-gray-200 pb-2 mb-4">
                Giá tour
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 font-semibold text-gray-600">Loại khách</th>
                      <th className="text-right py-2 font-semibold text-gray-600">Giá</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {tour.priceTable ? (
                      tour.priceTable.map((row, i) => (
                        <tr key={i}>
                          <td className="py-2.5">
                            <p className="font-medium text-gray-800">{row.ageGroupLabel ?? row.ageGroup}</p>
                            {row.ageRange && <p className="text-xs text-gray-400">{row.ageRange}</p>}
                          </td>
                          <td className="py-2.5 text-right font-semibold text-blue-700">
                            {row.price === 0 ? "Miễn phí" : formatVND(row.price)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td className="py-2.5 font-medium text-gray-800">Người lớn</td>
                        <td className="py-2.5 text-right font-semibold text-blue-700">{formatVND(tour.price)}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Contact info */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="text-base font-bold text-teal-700 border-b border-gray-200 pb-2 mb-4">
                Thông tin liên lạc
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <Label className="text-sm font-medium">
                    Họ &amp; Tên <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="Nguyễn Văn A"
                    className="mt-1"
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label className="text-sm font-medium">
                    Địa chỉ <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    value={contactAddress}
                    onChange={(e) => setContactAddress(e.target.value)}
                    placeholder="Số nhà, đường, quận, thành phố"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium">
                    Điện thoại <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="0901 234 567"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium">
                    Email <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="mt-1"
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label className="text-sm font-medium">Ghi chú</Label>
                  <textarea
                    value={bookingNotes}
                    onChange={(e) => setBookingNotes(e.target.value)}
                    placeholder="Yêu cầu đặc biệt, dị ứng thức ăn, …"
                    className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-teal-400"
                    rows={3}
                  />
                </div>
              </div>
            </div>

            {/* Passenger list */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="flex items-center justify-between border-b border-gray-200 pb-2 mb-4">
                <h2 className="text-base font-bold text-teal-700">
                  Danh sách khách hàng đi tour
                </h2>
                <button
                  onClick={addPassenger}
                  className="flex items-center gap-1.5 text-sm text-teal-700 hover:text-teal-900 font-medium"
                >
                  <Plus className="w-4 h-4" />
                  Thêm khách
                </button>
              </div>

              <div className="space-y-4">
                {passengers.map((p, idx) => (
                  <div key={p.id} className="border border-gray-200 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <User className="w-4 h-4 text-teal-600" />
                        Khách {idx + 1}
                      </p>
                      {passengers.length > 1 && (
                        <button
                          onClick={() => removePassenger(p.id)}
                          className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="sm:col-span-2">
                        <Label className="text-xs text-gray-500">
                          Họ tên <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          value={p.fullName}
                          onChange={(e) => updatePassenger(p.id, { fullName: e.target.value })}
                          placeholder="Nguyễn Văn A"
                          className="mt-1 text-sm"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500">
                          Ngày sinh <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          type="date"
                          value={p.dateOfBirth}
                          onChange={(e) => updatePassenger(p.id, { dateOfBirth: e.target.value })}
                          className="mt-1 text-sm"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500">Giới tính</Label>
                        <select
                          value={p.gender}
                          onChange={(e) => updatePassenger(p.id, { gender: e.target.value as "male" | "female" })}
                          className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
                        >
                          <option value="male">Nam</option>
                          <option value="female">Nữ</option>
                        </select>
                      </div>
                      <div className="sm:col-span-2">
                        <Label className="text-xs text-gray-500">Loại khách</Label>
                        <select
                          value={p.ageGroup}
                          onChange={(e) => updatePassenger(p.id, { ageGroup: e.target.value as BookingPassenger["ageGroup"] })}
                          className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
                        >
                          {AGE_GROUPS.map((g) => (
                            <option key={g.value} value={g.value}>
                              {g.label} ({g.ageRange})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="flex items-center justify-between bg-blue-50 rounded-lg px-3 py-2 text-sm">
                      <span className="text-gray-600">Giá vé</span>
                      <span className="font-bold text-blue-700">
                        {p.price === 0 ? "Miễn phí" : formatVND(p.price)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total Price & Payment Policy */}
              <div className="mt-4 pt-4 border-t border-gray-200 space-y-3 text-sm">
                <div className="flex justify-between items-center text-gray-700">
                  <span className="font-medium">Tổng giá tour dự kiến ({passengers.length} khách):</span>
                  <span className="font-bold text-blue-700 text-base">{formatVND(totalPrice)}</span>
                </div>

                <div className="bg-teal-50 border border-teal-200 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-teal-900">
                  <Info className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block text-teal-950 mb-0.5">Không cần thanh toán ngay khi đặt:</span>
                    <span>
                      Sau khi đăng ký, công ty du lịch sẽ liên hệ với các đơn vị cung cấp đối tác (khách sạn, nhà hàng, địa điểm) ngoài hệ thống để đối soát và chốt giá chính thức cho bạn trước khi thanh toán.
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                disabled={!isStep2Valid}
                onClick={() => setStep(3)}
                className="bg-teal-600 hover:bg-teal-700 text-white gap-2 px-8"
              >
                Tiếp theo
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Confirmation */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
              <h2 className="text-lg font-bold text-gray-900">Xác nhận thông tin đăng ký</h2>

              {/* Tour summary */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-start gap-4">
                  <img src={tour.image} alt={tour.name} className="w-20 h-16 rounded-lg object-cover flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900">{tour.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">Mã: {tour.tourCode}</p>
                    <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-600">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{tour.duration}</span>
                      <span className="flex items-center gap-1 font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded"><Calendar className="w-3.5 h-3.5" />Khởi hành: {tourStartDate}</span>
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{tour.destination}</span>
                      {tour.companyName && <span className="flex items-center gap-1"><Building2 className="w-3 h-3" />{tour.companyName}</span>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact info */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Người đại diện liên lạc</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-700"><User className="w-4 h-4 text-gray-400" />{contactName}</div>
                  <div className="flex items-center gap-2 text-gray-700"><Phone className="w-4 h-4 text-gray-400" />{contactPhone}</div>
                  <div className="flex items-center gap-2 text-gray-700 col-span-2"><Mail className="w-4 h-4 text-gray-400" />{contactEmail}</div>
                  {contactAddress && <div className="flex items-center gap-2 text-gray-700 col-span-2"><MapPin className="w-4 h-4 text-gray-400" />{contactAddress}</div>}
                </div>
              </div>

              {/* Passenger list */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Danh sách khách ({passengers.length} người)</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="px-3 py-2 text-left font-medium text-gray-600">#</th>
                        <th className="px-3 py-2 text-left font-medium text-gray-600">Họ tên</th>
                        <th className="px-3 py-2 text-left font-medium text-gray-600">Ngày sinh</th>
                        <th className="px-3 py-2 text-left font-medium text-gray-600">Giới tính</th>
                        <th className="px-3 py-2 text-left font-medium text-gray-600">Loại khách</th>
                        <th className="px-3 py-2 text-right font-medium text-gray-600">Giá theo người</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {passengers.map((p, idx) => {
                        const grp = AGE_GROUPS.find((g) => g.value === p.ageGroup);
                        return (
                          <tr key={p.id}>
                            <td className="px-3 py-2 text-gray-500">{idx + 1}</td>
                            <td className="px-3 py-2 font-medium text-gray-900">{p.fullName}</td>
                            <td className="px-3 py-2 text-gray-600">{p.dateOfBirth}</td>
                            <td className="px-3 py-2 text-gray-600">{p.gender === "male" ? "Nam" : "Nữ"}</td>
                            <td className="px-3 py-2 text-gray-600">{grp?.label ?? p.ageGroup}</td>
                            <td className="px-3 py-2 text-right font-semibold text-blue-700">
                              {p.price === 0 ? "Miễn phí" : formatVND(p.price)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-gray-200 bg-gray-50">
                        <td colSpan={5} className="px-3 py-2 font-bold text-gray-700">Tổng cộng ({passengers.length} khách):</td>
                        <td className="px-3 py-2 text-right font-bold text-blue-700 text-base">{formatVND(totalPrice)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Customized details if any */}
              {((customHotelChanges && customHotelChanges.length > 0) || (customMealChanges && customMealChanges.length > 0) || (locationChanges && locationChanges.length > 0)) && (
                <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 space-y-3">
                  <h3 className="text-sm font-bold text-purple-900 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    Lịch trình tùy chỉnh theo yêu cầu của bạn
                  </h3>

                  {/* Hotel customizations */}
                  {customHotelChanges && customHotelChanges.length > 0 && (
                    <div className="space-y-1.5 text-xs">
                      <p className="font-semibold text-purple-800 flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-purple-600" />
                        Chỗ ở / Khách sạn yêu cầu:
                      </p>
                      {customHotelChanges.map((hc, idx) => (
                        <div key={idx} className="bg-white rounded-lg p-2.5 border border-purple-200 text-xs">
                          <p className="font-semibold text-gray-900">
                            {hc.destination}: <span className="text-purple-700 font-bold">{hc.newHotelName}</span>
                          </p>
                          <p className="text-gray-500 mt-0.5">
                            (Gốc: {hc.originalHotelName} • {hc.mode === "custom" ? "Tự nhập – Chờ công ty hỏi giá" : "Từ hệ thống"})
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Meal customizations */}
                  {customMealChanges && customMealChanges.length > 0 && (
                    <div className="space-y-1.5 text-xs">
                      <p className="font-semibold text-purple-800 flex items-center gap-1">
                        <Utensils className="w-3.5 h-3.5 text-purple-600" />
                        Nhà hàng / Bữa ăn yêu cầu (Chỗ ăn):
                      </p>
                      {customMealChanges.map((mc, idx) => (
                        <div key={idx} className="bg-white rounded-lg p-2.5 border border-purple-200 text-xs">
                          <p className="font-semibold text-gray-900">
                            Ngày {mc.dayNumber} ({mc.mealType === "lunch" ? "Bữa trưa" : "Bữa tối"}):{" "}
                            <span className="text-purple-700 font-bold">{mc.newMealName}</span>
                          </p>
                          <p className="text-gray-500 mt-0.5">
                            (Gốc: {mc.originalMealName || "Nhà hàng theo tour"} • {mc.mode === "custom" ? "Tự nhập – Chờ công ty hỏi giá" : "Từ hệ thống"})
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Location customizations */}
                  {locationChanges && locationChanges.length > 0 && (
                    <div className="space-y-1.5 text-xs">
                      <p className="font-semibold text-purple-800 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-purple-600" />
                        Địa điểm tham quan yêu cầu thay đổi:
                      </p>
                      {locationChanges.map((lc, idx) => (
                        <div key={idx} className="bg-white rounded-lg p-2.5 border border-purple-200 text-xs">
                          <p className="font-semibold text-gray-900">Ngày {lc.dayNumber}:</p>
                          <p className="text-amber-800 font-medium mt-0.5">→ {lc.requestedLocations}</p>
                          {lc.originalLocations && (
                            <p className="text-gray-400 mt-0.5 line-through">
                              Gốc: {lc.originalLocations.join(", ")}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Payment & Provider Verification info */}
              <div className="rounded-xl p-4.5 border bg-teal-50/80 border-teal-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-teal-950 flex items-center gap-1.5">
                    <Info className="w-4 h-4 text-teal-700" />
                    Chính sách đặt chỗ & Thanh toán sau
                  </h3>
                  <span className="text-xs bg-teal-200 text-teal-900 font-bold px-2.5 py-0.5 rounded-full">
                    Chưa cần thanh toán
                  </span>
                </div>

                <div className="space-y-2 text-xs text-teal-900">
                  <div className="flex justify-between items-center py-1 border-b border-teal-200/60 font-semibold">
                    <span>Tổng giá tour tạm tính ({passengers.length} người):</span>
                    <span className="text-sm font-bold text-blue-700">{formatVND(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between items-center font-bold text-emerald-800">
                    <span>Số tiền cần thanh toán ngay lúc này:</span>
                    <span className="text-sm">0đ</span>
                  </div>
                  <p className="text-xs text-teal-800 leading-relaxed bg-white/70 p-3 rounded-lg border border-teal-200/70">
                    💡 <strong>Lưu ý quan trọng:</strong> Vì các dịch vụ như khách sạn và chỗ ăn uống có thể có giá thay đổi theo thời điểm thực tế, công ty du lịch sẽ liên hệ trực tiếp với các đơn vị cung cấp đối tác ở ngoài hệ thống để hỏi và chốt giá chính thức cho đoàn của bạn. Sau khi công ty du lịch xác nhận lại thông tin và chốt giá, bạn mới tiến hành thanh toán.
                  </p>
                </div>
              </div>

              {bookingNotes && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-1">Ghi chú của bạn</h3>
                  <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">{bookingNotes}</p>
                </div>
              )}
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(2)} className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Quay lại
              </Button>
              <Button
                onClick={handleConfirm}
                className="bg-teal-600 hover:bg-teal-700 text-white gap-2 px-8 shadow-sm text-sm font-bold"
              >
                Gửi yêu cầu đặt tour (Thanh toán sau)
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Done */}
        {step === 4 && (
          <div className="bg-white rounded-2xl border border-gray-200 p-8 sm:p-10 text-center space-y-6">
            <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle className="w-10 h-10 text-teal-600" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-gray-900">Gửi yêu cầu đặt tour thành công!</h2>
              <p className="text-gray-600 max-w-lg mx-auto text-sm leading-relaxed">
                Yêu cầu đặt tour của bạn đã được chuyển tới công ty du lịch <strong>{tour.companyName || "đơn vị tổ chức"}</strong>.
              </p>
            </div>

            {/* Status card */}
            <div className="bg-teal-50 border border-teal-200 rounded-2xl p-5 max-w-lg mx-auto text-left space-y-3">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-teal-700 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-bold text-teal-950 text-sm">
                    Trạng thái: Chờ công ty du lịch xác nhận &amp; chốt giá
                  </p>
                  <p className="text-xs text-teal-800 mt-1 leading-relaxed">
                    Công ty du lịch đang liên hệ với các bên cung cấp (khách sạn, nhà hàng, phương tiện) ở ngoài hệ thống để kiểm tra tình trạng dịch vụ và chốt giá chính thức cho bạn.
                  </p>
                </div>
              </div>

              <div className="border-t border-teal-200/80 pt-3 space-y-1.5 text-xs text-teal-900">
                <div className="flex justify-between">
                  <span className="text-gray-600">Số lượng khách:</span>
                  <span className="font-bold text-gray-900">{passengers.length} người</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tổng giá tour tạm tính:</span>
                  <span className="font-bold text-blue-700 text-sm">{formatVND(totalPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Số tiền cần thanh toán ngay:</span>
                  <span className="font-bold text-emerald-700">0đ (Thanh toán sau khi duyệt)</span>
                </div>
              </div>
            </div>

            <p className="text-xs text-gray-500 max-w-md mx-auto">
              Nhân viên tư vấn sẽ liên hệ với bạn qua số điện thoại <strong>{contactPhone}</strong> hoặc email <strong>{contactEmail}</strong> trong vòng 24 giờ để xác nhận và gửi hướng dẫn thanh toán.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Button
                onClick={() => onViewMyBookings ? onViewMyBookings() : onBack()}
                className="bg-teal-600 hover:bg-teal-700 text-white gap-2 font-medium"
              >
                <FileText className="w-4 h-4" />
                Xem tour đã đặt của tôi
              </Button>
              <Button
                onClick={() => onGoHome ? onGoHome() : onBack()}
                variant="outline"
                className="gap-2"
              >
                Về trang chủ
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
