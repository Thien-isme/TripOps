import { useState, useRef } from "react";
import * as XLSX from "xlsx";
import { Tour, BookingPassenger, TourPriceRow, CustomHotelChange, CustomLocationChange, CustomMealChange } from "@/app/types";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  X,
  Plus,
  Trash2,
  User,
  Users,
  MapPin,
  Phone,
  Mail,
  FileText,
  Info,
  AlertTriangle,
  Building2,
  Utensils,
  Sun,
  UtensilsCrossed,
  ChevronDown,
  Clock,
  Calendar,
  Sparkles,
  Download,
  FileSpreadsheet,
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

/**
 * Parse various date formats: YYYY-MM-DD, DD/MM/YYYY, DD-MM-YYYY, or Excel date number
 */
export function parseDateString(dateStr: string): string | null {
  if (!dateStr) return null;
  const trimmed = String(dateStr).trim();
  if (!trimmed) return null;

  // Excel serial number (e.g. 33009, 44520)
  if (!isNaN(Number(trimmed)) && Number(trimmed) > 1000 && Number(trimmed) < 100000) {
    const d = new Date(Math.round((Number(trimmed) - 25569) * 86400 * 1000));
    if (!isNaN(d.getTime())) {
      return d.toISOString().split("T")[0];
    }
  }

  // DD/MM/YYYY or D/M/YYYY
  if (trimmed.includes("/")) {
    const parts = trimmed.split("/");
    if (parts.length === 3) {
      const d = parts[0].padStart(2, "0");
      const m = parts[1].padStart(2, "0");
      const y = parts[2];
      if (y.length === 4) return `${y}-${m}-${d}`;
    }
  }

  // DD-MM-YYYY
  if (trimmed.includes("-")) {
    const parts = trimmed.split("-");
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        // YYYY-MM-DD
        return trimmed;
      }
      if (parts[2].length === 4) {
        // DD-MM-YYYY
        const d = parts[0].padStart(2, "0");
        const m = parts[1].padStart(2, "0");
        const y = parts[2];
        return `${y}-${m}-${d}`;
      }
    }
  }

  const parsed = new Date(trimmed);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().split("T")[0];
  }
  return null;
}

/**
 * Calculate age on reference date (tourStartDate or today)
 */
export function calculateAge(dateOfBirth: string, refDateStr?: string): number | null {
  const normalizedDob = parseDateString(dateOfBirth);
  if (!normalizedDob) return null;

  const birthDate = new Date(normalizedDob);
  if (isNaN(birthDate.getTime())) return null;

  const refDate = refDateStr ? new Date(refDateStr) : new Date();
  if (isNaN(refDate.getTime())) return null;

  let age = refDate.getFullYear() - birthDate.getFullYear();
  const m = refDate.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && refDate.getDate() < birthDate.getDate())) {
    age--;
  }
  return Math.max(0, age);
}

/**
 * Determine ageGroup from dateOfBirth and reference date
 */
export function determineAgeGroup(dateOfBirth: string, refDateStr?: string): BookingPassenger["ageGroup"] {
  const age = calculateAge(dateOfBirth, refDateStr);
  if (age === null) return "adult";
  if (age < 2) return "child_under_2";
  if (age <= 11) return "child_2_11";
  return "adult";
}

/**
 * Match price from tour's priceTable or fallback standard %
 */
export function getPassengerPrice(tour: Tour, ageGroup: BookingPassenger["ageGroup"], age?: number | null): number {
  if (tour.priceTable && tour.priceTable.length > 0) {
    // 1. If age is known, check if custom priceTable row matches
    if (typeof age === "number") {
      const matchByAge = tour.priceTable.find((r) => {
        const range = (r.ageRange || "").toLowerCase();
        const label = (r.ageGroupLabel || "").toLowerCase();
        if (age < 2 && (range.includes("dưới 2") || range.includes("< 2") || range.includes("<2") || label.includes("em bé") || r.ageGroup === "child_under_2")) return true;
        if (age >= 2 && age <= 11 && (range.includes("2") || range.includes("11") || label.includes("trẻ em") || r.ageGroup === "child_2_11")) return true;
        if (age >= 12 && (range.includes("11") || range.includes("12") || label.includes("người lớn") || r.ageGroup === "adult")) return true;
        return false;
      });
      if (matchByAge) return matchByAge.price;
    }

    // 2. Match by ageGroup key
    const matchByGroup = tour.priceTable.find((r) => r.ageGroup === ageGroup);
    if (matchByGroup) return matchByGroup.price;

    // 3. Fallback matching by label keyword in priceTable
    if (ageGroup === "child_under_2") {
      const row = tour.priceTable.find((r) => (r.ageGroupLabel || "").toLowerCase().includes("em bé") || (r.ageGroupLabel || "").toLowerCase().includes("sơ sinh"));
      if (row) return row.price;
      return 0;
    }
    if (ageGroup === "child_2_11") {
      const row = tour.priceTable.find((r) => (r.ageGroupLabel || "").toLowerCase().includes("trẻ em"));
      if (row) return row.price;
      return Math.round(tour.price * 0.7);
    }
    const adultRow = tour.priceTable.find((r) => (r.ageGroupLabel || "").toLowerCase().includes("người lớn"));
    if (adultRow) return adultRow.price;
  }

  // Fallback if tour has no priceTable:
  if (ageGroup === "child_under_2") return 0;
  if (ageGroup === "child_2_11") return Math.round(tour.price * 0.7);
  return tour.price;
}

function newPassenger(id: string, tour: Tour, defaultDob = ""): BookingPassenger {
  const age = calculateAge(defaultDob);
  const ageGroup = determineAgeGroup(defaultDob);
  return {
    id,
    fullName: "",
    dateOfBirth: defaultDob,
    gender: "male",
    ageGroup,
    price: getPassengerPrice(tour, ageGroup, age),
    idNumber: "",
    notes: "",
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

  const handleStartDateChange = (newDate: string) => {
    setTourStartDate(newDate);
    // Recalculate age & price for all passengers with the new tour departure date
    setPassengers((prev) =>
      prev.map((p) => {
        if (!p.dateOfBirth) return p;
        const age = calculateAge(p.dateOfBirth, newDate);
        if (age === null) return p;
        const autoGroup = determineAgeGroup(p.dateOfBirth, newDate);
        return {
          ...p,
          ageGroup: autoGroup,
          price: getPassengerPrice(tour, autoGroup, age),
        };
      })
    );
  };

  const updatePassenger = (id: string, update: Partial<BookingPassenger>) => {
    setPassengers((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const updated = { ...p, ...update };

        // If dateOfBirth is entered or changed, automatically detect age, group & update price!
        if (update.dateOfBirth !== undefined) {
          const age = calculateAge(update.dateOfBirth, tourStartDate);
          if (age !== null) {
            updated.ageGroup = determineAgeGroup(update.dateOfBirth, tourStartDate);
            updated.price = getPassengerPrice(tour, updated.ageGroup, age);
          }
        } else if (update.ageGroup !== undefined) {
          // If user manually altered the age group dropdown
          const age = calculateAge(updated.dateOfBirth, tourStartDate);
          updated.price = getPassengerPrice(tour, update.ageGroup, age);
        }

        return updated;
      })
    );
  };

  // Excel template download & upload states & handlers
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [excelError, setExcelError] = useState<string | null>(null);
  const [excelSuccess, setExcelSuccess] = useState<string | null>(null);

  const handleDownloadExcelTemplate = () => {
    try {
      const templateRows = [
        {
          "STT": 1,
          "Họ và tên (*)": "Nguyễn Văn An",
          "Số CCCD / Passport / Định danh": "001090012345",
          "Ngày sinh (YYYY-MM-DD) (*)": "1990-05-15",
          "Giới tính (Nam/Nữ)": "Nam",
          "Loại khách": "Người lớn",
          "Ghi chú": "Người đại diện đoàn, ăn chay nhẹ",
        },
        {
          "STT": 2,
          "Họ và tên (*)": "Trần Thị Bình",
          "Số CCCD / Passport / Định danh": "001192005678",
          "Ngày sinh (YYYY-MM-DD) (*)": "1992-08-20",
          "Giới tính (Nam/Nữ)": "Nữ",
          "Loại khách": "Người lớn",
          "Ghi chú": "Hay say xe ngồi đầu xe",
        },
        {
          "STT": 3,
          "Họ và tên (*)": "Nguyễn Gia Hưng",
          "Số CCCD / Passport / Định danh": "001218009999",
          "Ngày sinh (YYYY-MM-DD) (*)": "2018-11-10",
          "Giới tính (Nam/Nữ)": "Nam",
          "Loại khách": "Trẻ em (2–11 tuổi)",
          "Ghi chú": "Dị ứng hải sản",
        },
        {
          "STT": 4,
          "Họ và tên (*)": "Nguyễn Bảo Ngọc",
          "Số CCCD / Passport / Định danh": "",
          "Ngày sinh (YYYY-MM-DD) (*)": "2024-03-25",
          "Giới tính (Nam/Nữ)": "Nữ",
          "Loại khách": "Trẻ em (dưới 2 tuổi)",
          "Ghi chú": "Cần nôi / ghế trẻ em",
        },
      ];

      const ws = XLSX.utils.json_to_sheet(templateRows);
      ws["!cols"] = [
        { wch: 6 },
        { wch: 25 },
        { wch: 30 },
        { wch: 28 },
        { wch: 18 },
        { wch: 26 },
        { wch: 35 },
      ];
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Danh_Sach_Khach");
      XLSX.writeFile(wb, `Mau_Danh_Sach_Khach_Tour_${tour.tourCode || "Tour"}.xlsx`);
    } catch (err: any) {
      alert("Không thể tải file mẫu: " + (err?.message || "Lỗi không xác định"));
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setExcelError(null);
    setExcelSuccess(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const buffer = evt.target?.result as ArrayBuffer;
        const workbook = XLSX.read(buffer, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        if (!sheetName) {
          throw new Error("File Excel không có sheet nào!");
        }

        const sheet = workbook.Sheets[sheetName];
        const rawRows: any[] = XLSX.utils.sheet_to_json(sheet, { defval: "" });

        if (!rawRows || rawRows.length === 0) {
          throw new Error("File Excel không có dữ liệu hàng nào!");
        }

        const parsed: BookingPassenger[] = [];

        rawRows.forEach((row, i) => {
          const keys = Object.keys(row);
          const findVal = (keywords: string[]) => {
            const k = keys.find((key) => {
              const lower = key.toLowerCase().trim();
              return keywords.some((kw) => lower.includes(kw));
            });
            return k ? String(row[k]).trim() : "";
          };

          const fullName = findVal(["họ và tên", "họ tên", "tên", "fullname", "name"]);
          if (!fullName) return;

          const rawDob = findVal(["ngày sinh", "ngaysinh", "dob", "birth"]);
          let dateOfBirth = parseDateString(rawDob) || rawDob;
          if (!dateOfBirth) {
            dateOfBirth = "1995-01-01";
          }

          const rawGender = findVal(["giới tính", "gioitinh", "gender"]).toLowerCase();
          const gender: "male" | "female" =
            rawGender.includes("nữ") || rawGender.includes("female") ? "female" : "male";

          const idNumber = findVal(["cccd", "cmnd", "passport", "hộ chiếu", "định danh", "dinhdanh", "idnumber", "so cccd"]);
          const notes = findVal(["ghi chú", "ghichu", "note", "yêu cầu", "yeucau"]);

          // Calculate passenger age relative to tourStartDate
          const calculatedAge = calculateAge(dateOfBirth, tourStartDate);
          let ageGroup: BookingPassenger["ageGroup"] = "adult";

          if (calculatedAge !== null) {
            // Priority 1: Accurate age group directly from date of birth
            ageGroup = determineAgeGroup(dateOfBirth, tourStartDate);
          } else {
            // Priority 2: Fallback to text matching if date of birth was empty
            const rawAge = findVal(["loại khách", "loaikhach", "nhóm tuổi", "age"]).toLowerCase();
            if (
              rawAge.includes("dưới 2") ||
              rawAge.includes("<2") ||
              rawAge.includes("em bé") ||
              rawAge.includes("infant")
            ) {
              ageGroup = "child_under_2";
            } else if (
              rawAge.includes("trẻ em") ||
              rawAge.includes("2-11") ||
              rawAge.includes("2–11") ||
              rawAge.includes("child")
            ) {
              ageGroup = "child_2_11";
            }
          }

          const price = getPassengerPrice(tour, ageGroup, calculatedAge);

          parsed.push({
            id: `p_excel_${Date.now()}_${i}`,
            fullName,
            dateOfBirth,
            gender,
            ageGroup,
            price,
            idNumber,
            notes,
          });
        });

        if (parsed.length === 0) {
          throw new Error("Không tìm thấy dòng thông tin khách hợp lệ. Vui lòng kiểm tra cột 'Họ và tên' trong file.");
        }

        setPassengers(parsed);
        setExcelSuccess(`Đã nạp thành công ${parsed.length} khách từ file: ${file.name}`);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } catch (err: any) {
        setExcelError(err?.message || "Lỗi khi đọc file Excel.");
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    };

    reader.onerror = () => {
      setExcelError("Không thể đọc file đã chọn.");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    };

    reader.readAsArrayBuffer(file);
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
                        onChange={(e) => handleStartDateChange(e.target.value)}
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
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-200 pb-3 mb-4 gap-3">
                <div>
                  <h2 className="text-base font-bold text-teal-700 flex items-center gap-2">
                    <Users className="w-4 h-4 text-teal-600" />
                    Danh sách khách hàng đi tour ({passengers.length} người)
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Nhập từng khách thủ công hoặc tải file Excel lên để tự động điền danh sách nhanh chóng
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {/* Download Excel Template Button */}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleDownloadExcelTemplate}
                    className="text-xs h-9 px-3 border-teal-300 text-teal-800 hover:bg-teal-50 font-semibold gap-1.5 shadow-2xs"
                    title="Tải file mẫu Excel (.xlsx)"
                  >
                    <Download className="w-3.5 h-3.5 text-teal-600" />
                    Tải mẫu Excel
                  </Button>

                  {/* Upload Excel Button */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept=".xlsx,.xls,.csv"
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs h-9 px-3 border-blue-300 text-blue-800 hover:bg-blue-50 font-semibold gap-1.5 shadow-2xs"
                    title="Tải lên file danh sách khách (.xlsx, .xls, .csv)"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-blue-600" />
                    Upload file Excel
                  </Button>

                  {/* Add Passenger Button */}
                  <Button
                    type="button"
                    onClick={addPassenger}
                    className="text-xs h-9 px-3.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold gap-1.5 shadow-2xs"
                  >
                    <Plus className="w-4 h-4" />
                    Thêm khách
                  </Button>
                </div>
              </div>

              {/* Excel Feedback Alerts */}
              {excelSuccess && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center justify-between text-xs text-emerald-800 mb-4 animate-in fade-in">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span className="font-semibold">{excelSuccess}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setExcelSuccess(null)}
                    className="text-emerald-700 hover:text-emerald-900 font-bold ml-2 p-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {excelError && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center justify-between text-xs text-red-800 mb-4 animate-in fade-in">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
                    <span className="font-semibold">{excelError}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setExcelError(null)}
                    className="text-red-700 hover:text-red-900 font-bold ml-2 p-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Fast Excel Guide Tip */}
              <div className="bg-teal-50/60 border border-teal-200/80 rounded-xl p-3 mb-4 flex items-center justify-between text-xs text-teal-900">
                <div className="flex items-start sm:items-center gap-2.5">
                  <FileSpreadsheet className="w-4 h-4 text-teal-700 flex-shrink-0 mt-0.5 sm:mt-0" />
                  <span>
                    <strong>Mẹo nhập nhanh danh sách đoàn:</strong> Nhấn <strong>"Tải mẫu Excel"</strong> để nhận file mẫu ➔ Điền tên, ngày sinh của đoàn ➔ Bấm <strong>"Upload file Excel"</strong> để tự động nhập vào hệ thống.
                  </span>
                </div>
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
                      <div>
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
                          Số CCCD / Passport / Định danh
                        </Label>
                        <Input
                          value={p.idNumber ?? ""}
                          onChange={(e) => updatePassenger(p.id, { idNumber: e.target.value })}
                          placeholder="VD: 001090012345 hoặc B1234567"
                          className="mt-1 text-sm font-mono"
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
                      <div className="sm:col-span-2">
                        <Label className="text-xs text-gray-500">Ghi chú riêng cho khách</Label>
                        <Input
                          value={p.notes ?? ""}
                          onChange={(e) => updatePassenger(p.id, { notes: e.target.value })}
                          placeholder="VD: Ăn chay, say xe ngồi đầu xe, người cao tuổi cần hỗ trợ di chuyển..."
                          className="mt-1 text-sm"
                        />
                      </div>
                    </div>
                    {(() => {
                      const age = calculateAge(p.dateOfBirth, tourStartDate);
                      const grp = AGE_GROUPS.find((g) => g.value === p.ageGroup);
                      return (
                        <div className="flex flex-wrap items-center justify-between bg-blue-50/80 border border-blue-100 rounded-lg px-3 py-2 text-sm gap-2">
                          <div className="flex flex-wrap items-center gap-2">
                            {age !== null ? (
                              <span className="inline-flex items-center gap-1 text-xs bg-white text-teal-700 font-semibold px-2 py-0.5 rounded border border-teal-200 shadow-2xs">
                                🎂 {age} tuổi (tính đến ngày đi tour)
                              </span>
                            ) : (
                              <span className="text-xs text-gray-500 italic">
                                Nhập ngày sinh để hệ thống tự động nhận diện độ tuổi &amp; giá vé
                              </span>
                            )}
                            <span className="text-xs text-gray-600 font-medium">• {grp?.label ?? p.ageGroup}</span>
                          </div>
                          <div className="flex items-center gap-1.5 ml-auto">
                            <span className="text-xs text-gray-500">Giá vé:</span>
                            <span className="font-bold text-blue-700">
                              {p.price === 0 ? "Miễn phí" : formatVND(p.price)}
                            </span>
                          </div>
                        </div>
                      );
                    })()}
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
                        <th className="px-3 py-2 text-left font-medium text-gray-600">CCCD / Passport</th>
                        <th className="px-3 py-2 text-left font-medium text-gray-600">Ngày sinh</th>
                        <th className="px-3 py-2 text-left font-medium text-gray-600">Giới tính</th>
                        <th className="px-3 py-2 text-left font-medium text-gray-600">Loại khách</th>
                        <th className="px-3 py-2 text-left font-medium text-gray-600">Ghi chú</th>
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
                            <td className="px-3 py-2">
                              {p.idNumber ? (
                                <span className="font-mono text-xs text-gray-800 bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200">
                                  {p.idNumber}
                                </span>
                              ) : (
                                <span className="text-gray-400 text-xs italic">—</span>
                              )}
                            </td>
                            <td className="px-3 py-2 text-gray-600">
                              <span>{p.dateOfBirth || "—"}</span>
                              {(() => {
                                const age = calculateAge(p.dateOfBirth, tourStartDate);
                                return age !== null ? (
                                  <span className="ml-1.5 text-xs text-teal-700 font-semibold bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200">
                                    {age} tuổi
                                  </span>
                                ) : null;
                              })()}
                            </td>
                            <td className="px-3 py-2 text-gray-600">{p.gender === "male" ? "Nam" : "Nữ"}</td>
                            <td className="px-3 py-2 text-gray-600">{grp?.label ?? p.ageGroup}</td>
                            <td className="px-3 py-2 text-xs max-w-[180px]">
                              {p.notes ? (
                                <span className="text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 inline-block line-clamp-2">
                                  {p.notes}
                                </span>
                              ) : (
                                <span className="text-gray-400 italic">—</span>
                              )}
                            </td>
                            <td className="px-3 py-2 text-right font-semibold text-blue-700">
                              {p.price === 0 ? "Miễn phí" : formatVND(p.price)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-gray-200 bg-gray-50">
                        <td colSpan={7} className="px-3 py-2 font-bold text-gray-700">Tổng cộng ({passengers.length} khách):</td>
                        <td className="px-3 py-2 text-right font-bold text-blue-700 text-base">{formatVND(totalPrice)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* ===== ITINERARY TIMELINE (LỘ TRÌNH THAM QUAN CƠ BẢN CỦA CÔNG TY) ===== */}
              <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-purple-600" />
                      Lịch trình chi tiết (Lộ trình tham quan cơ bản của công ty)
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Lộ trình các điểm tham quan, ẩm thực và nơi lưu trú được thiết lập cho đoàn.
                    </p>
                  </div>
                  {isCustomized ? (
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200 flex items-center gap-1 self-start sm:self-auto">
                      <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                      Lịch trình có tùy chỉnh theo yêu cầu
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1 self-start sm:self-auto">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                      Theo lịch trình tiêu chuẩn của tour
                    </span>
                  )}
                </div>

                {/* CUSTOMIZATION HIGHLIGHTS (NẾU CÓ) */}
                {isCustomized && (
                  <div className="bg-purple-50/70 rounded-2xl border border-purple-200 p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-purple-700" />
                      <h4 className="font-bold text-xs text-purple-900 uppercase">
                        Các tùy chỉnh bạn đã chọn cho chuyến đi này
                      </h4>
                    </div>
                    <div className="space-y-2 text-xs">
                      {/* Hotel changes */}
                      {customHotelChanges && customHotelChanges.length > 0 && (
                        <div className="bg-white rounded-xl p-3 border border-purple-200 space-y-1">
                          <p className="font-bold text-purple-900 flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-purple-600" />
                            Khách sạn lưu trú:
                          </p>
                          {customHotelChanges.map((hc, idx) => (
                            <div key={idx} className="pl-5 space-y-0.5">
                              <p className="font-bold text-gray-900">
                                {hc.destination}:{" "}
                                <span className="text-purple-700 font-bold">{hc.newHotelName}</span>
                                {hc.stars && ` (${hc.stars}★)`}
                              </p>
                              {hc.originalHotelName && (
                                <p className="text-gray-400 line-through text-[11px]">Gốc: {hc.originalHotelName}</p>
                              )}
                              {hc.note && <p className="text-gray-500 italic text-[11px]">Yêu cầu: {hc.note}</p>}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Location changes */}
                      {locationChanges && locationChanges.length > 0 && (
                        <div className="bg-white rounded-xl p-3 border border-purple-200 space-y-1">
                          <p className="font-bold text-purple-900 flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-purple-600" />
                            Điểm tham quan:
                          </p>
                          {locationChanges.map((lc, idx) => (
                            <div key={idx} className="pl-5 space-y-0.5">
                              <p className="font-bold text-gray-900">
                                Ngày {lc.dayNumber}: <span className="text-amber-800 font-bold">→ {lc.requestedLocations}</span>
                              </p>
                              {lc.originalLocationName ? (
                                <p className="text-gray-400 line-through text-[11px]">
                                  Gốc: {lc.originalLocationName}
                                </p>
                              ) : lc.originalLocations && (
                                <p className="text-gray-400 line-through text-[11px]">
                                  Gốc: {lc.originalLocations.join(", ")}
                                </p>
                              )}
                              {lc.note && <p className="text-gray-500 italic text-[11px]">Ghi chú: {lc.note}</p>}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Meal changes */}
                      {customMealChanges && customMealChanges.length > 0 && (
                        <div className="bg-white rounded-xl p-3 border border-purple-200 space-y-1">
                          <p className="font-bold text-purple-900 flex items-center gap-1.5">
                            <Utensils className="w-3.5 h-3.5 text-purple-600" />
                            Ẩm thực &amp; Thực đơn:
                          </p>
                          {customMealChanges.map((mc, idx) => (
                            <div key={idx} className="pl-5 space-y-0.5">
                              <p className="font-bold text-gray-900">
                                Ngày {mc.dayNumber} ({mc.mealType === "breakfast" ? "Bữa sáng" : mc.mealType === "lunch" ? "Bữa trưa" : "Bữa tối"}):{" "}
                                <span className="text-purple-700 font-bold">{mc.newMealName}</span>
                              </p>
                              {mc.originalMealName && (
                                <p className="text-gray-400 line-through text-[11px]">
                                  Gốc: {mc.originalMealName}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Days List styled exactly like TourDetailPage.tsx */}
                <div className="space-y-4">
                  {tour.itinerary && tour.itinerary.length > 0 ? (
                    tour.itinerary.map((day) => {
                      const dayLocChange = locationChanges?.find(
                        (lc) => lc.dayNumber === day.day || lc.dayId === day.id,
                      );
                      const dayDest = day.destinationCity || tour.destination;
                      const dayHotelChange = customHotelChanges?.find(
                        (hc) => hc.destination === dayDest || tour.itinerary.length === 1,
                      );
                      const dayMealChanges = customMealChanges?.filter(
                        (mc) => mc.dayNumber === day.day,
                      );

                      const hasAnyDayCustomization = Boolean(
                        dayLocChange || dayHotelChange || (dayMealChanges && dayMealChanges.length > 0),
                      );

                      return (
                        <div
                          key={day.id || day.day}
                          className={`rounded-xl border overflow-hidden transition-all ${
                            hasAnyDayCustomization ? "border-amber-300" : "border-gray-200"
                          }`}
                        >
                          {/* Day header */}
                          <div
                            className={`px-4 py-3 flex items-center justify-between ${
                              hasAnyDayCustomization ? "bg-amber-50" : "bg-gray-50"
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
                                    <span className="text-xs text-gray-500 font-normal ml-1.5">
                                      (Ăn{" "}
                                      {day.meals
                                        .map((m) =>
                                          m.type === "breakfast" ? "sáng" : m.type === "lunch" ? "trưa" : "tối",
                                        )
                                        .join(", ")}
                                      )
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
                                    const locChange = locationChanges?.find(
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

                                        {/* Content */}
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
                                                    <p className="text-xs text-amber-600 mt-0.5 italic">
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
                                          className={`w-full flex items-center justify-between px-3.5 py-2.5 text-left ${
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

                            {/* Accommodation / Hotel */}
                            <div className="pt-3 border-t border-gray-100">
                              <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-xl flex items-start justify-between gap-3 text-xs">
                                <div className="space-y-1 min-w-0">
                                  <span className="font-bold text-[11px] text-blue-700 uppercase tracking-wide flex items-center gap-1.5">
                                    <Building2 className="w-3.5 h-3.5 text-blue-600" />
                                    Chỗ ở / Khách sạn đêm nay:
                                  </span>
                                  {dayHotelChange ? (
                                    <div>
                                      <p className="text-gray-400 line-through text-[11px]">
                                        {dayHotelChange.originalHotelName || day.hotel?.name || "Khách sạn mặc định theo tour"}
                                      </p>
                                      <p className="font-bold text-purple-950 text-sm flex items-center gap-1 mt-0.5">
                                        <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                                        → {dayHotelChange.newHotelName}
                                      </p>
                                      {dayHotelChange.note && (
                                        <p className="text-purple-700 italic text-[11px] mt-0.5">
                                          Ghi chú: {dayHotelChange.note}
                                        </p>
                                      )}
                                    </div>
                                  ) : (
                                    <div>
                                      <p className="font-bold text-gray-900 text-sm">
                                        {day.hotel?.name || tour.hotels?.[0]?.name || "Khách sạn tiêu chuẩn theo tour"}
                                      </p>
                                      {day.hotel?.stars && (
                                        <p className="text-gray-500 text-[11px] font-semibold text-amber-600">
                                          {day.hotel.stars}★
                                        </p>
                                      )}
                                    </div>
                                  )}
                                </div>

                                {dayHotelChange ? (
                                  <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800 border border-purple-300 flex-shrink-0">
                                    Đã đổi khách sạn
                                  </span>
                                ) : (
                                  <span className="text-xs px-2 py-0.5 rounded border bg-white text-blue-700 border-blue-200 font-medium flex-shrink-0">
                                    Theo tour
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="bg-gray-50 rounded-xl p-3 text-xs text-gray-600">
                      Điểm đến: <strong>{tour.destination}</strong> · Lịch trình tiêu chuẩn {tour.duration}.
                    </div>
                  )}
                </div>
              </div>

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
