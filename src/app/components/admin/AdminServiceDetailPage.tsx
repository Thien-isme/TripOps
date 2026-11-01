import { useState } from "react";
import { Service } from "@/app/types";
import {
  ArrowLeft,
  MapPin,
  Building2,
  Hotel,
  Utensils,
  Car,
  Compass,
  Star,
  Check,
  X,
  Clock,
  EyeOff,
  RotateCcw,
  ShieldCheck,
  Phone,
  Mail,
  ExternalLink,
  Info,
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/app/components/ui/dialog";
import { Textarea } from "@/app/components/ui/textarea";

interface AdminServiceDetailPageProps {
  service: Service;
  onBack: () => void;
  onApprove?: (serviceId: string) => void;
  onReject?: (serviceId: string, reason: string) => void;
  onToggleHide?: (serviceId: string, reason?: string) => void;
}

export function AdminServiceDetailPage({
  service,
  onBack,
  onApprove,
  onReject,
  onToggleHide,
}: AdminServiceDetailPageProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [hideModalOpen, setHideModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [hideReason, setHideReason] = useState("");
  const [activeTab, setActiveTab] = useState<"overview" | "map" | "policies">("overview");

  const images = service.images && service.images.length > 0 ? service.images : [service.image];

  const quickRejectSuggestions = [
    "Hình ảnh bài đăng mờ, chất lượng kém hoặc không đúng thực tế cơ sở.",
    "Bảng giá và phụ thu không rõ ràng hoặc có dấu hiệu bất hợp lý.",
    "Thiếu chính sách nhận/trả phòng và điều kiện hủy đổi dịch vụ.",
    "Thông tin địa chỉ hoặc giấy phép hoạt động chưa đầy đủ / chính xác.",
    "Nội dung mô tả sơ sài, sao chép hoặc chứa thông tin nhảm nhí.",
  ];

  const quickHideSuggestions = [
    "Thông tin dịch vụ sai lệch, nhảm nhí không đúng thực tế.",
    "Bảng giá ảo hoặc phụ thu bất hợp lý so với thỏa thuận.",
    "Hình ảnh bài đăng chất lượng kém hoặc sao chép trái phép.",
    "Cơ sở dịch vụ đã tạm dừng hoạt động hoặc đổi địa chỉ.",
    "Bài đăng trùng lặp hoặc có dấu hiệu spam trên sàn.",
  ];

  const lat = service.latitude || 11.9404;
  const lng = service.longitude || 108.4583;
  const osmEmbedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.03}%2C${lat - 0.02}%2C${lng + 0.03}%2C${lat + 0.02}&layer=mapnik&marker=${lat}%2C${lng}`;
  const googleMapsExternalUrl = `https://www.google.com/maps?q=${lat},${lng}`;

  const formatPriceSummary = () => {
    if (service.priceFrom && service.priceTo) {
      return `${service.priceFrom.toLocaleString("vi-VN")}đ - ${service.priceTo.toLocaleString("vi-VN")}đ`;
    }
    if (service.price) {
      return `${service.price.toLocaleString("vi-VN")}đ`;
    }
    if (service.pricePerPerson) {
      return `${service.pricePerPerson.toLocaleString("vi-VN")}đ/người`;
    }
    return "Liên hệ báo giá";
  };

  const getPriceUnit = () => {
    if (service.category === "hotel") return "phòng / đêm";
    if (service.category === "fnb" || service.category === "restaurant") return "người / suất";
    if (service.category === "transportation") return "xe / ngày";
    return "vé / người";
  };

  const getCategoryBadge = () => {
    switch (service.category) {
      case "hotel":
        return {
          label: "Lưu trú & Khách sạn",
          icon: Hotel,
          color: "bg-[#F0F9FF] text-[#075985] border-[#CBD5E1]",
        };
      case "fnb":
      case "restaurant":
        return {
          label: "Ẩm thực & Nhà hàng",
          icon: Utensils,
          color: "bg-orange-50 text-orange-700 border-orange-200",
        };
      case "transportation":
        return {
          label: "Vận chuyển & Xe tour",
          icon: Car,
          color: "bg-cyan-50 text-cyan-700 border-cyan-200",
        };
      case "attraction":
      case "activity":
      default:
        return {
          label: "Tham quan & Trải nghiệm",
          icon: Compass,
          color: "bg-teal-50 text-teal-700 border-teal-200",
        };
    }
  };

  const meta = getCategoryBadge();
  const CatIcon = meta.icon;
  const status = service.status || "approved";

  const handleApprove = () => {
    onApprove?.(service.id);
    onBack();
  };

  const handleConfirmReject = () => {
    const reason = rejectReason.trim() || "Nội dung bài đăng chưa đáp ứng tiêu chuẩn kiểm duyệt của nền tảng.";
    onReject?.(service.id, reason);
    setRejectModalOpen(false);
    onBack();
  };

  const handleConfirmHide = () => {
    const reason = hideReason.trim() || "Bài đăng bị tạm ẩn theo quyết định của ban quản trị.";
    onToggleHide?.(service.id, reason);
    setHideModalOpen(false);
    onBack();
  };

  const handleRestore = () => {
    onToggleHide?.(service.id);
    onBack();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-in fade-in duration-200">
      {/* Top Navigation & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs font-bold rounded-xl border-gray-300 hover:bg-gray-100 cursor-pointer shadow-2xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại</span>
          </Button>

          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>Admin</span>
              <span>/</span>
              <span className="cursor-pointer hover:underline" onClick={onBack}>
                {status === "pending" ? "Phê duyệt bài đăng" : "Quản lý bài đăng"}
              </span>
              <span>/</span>
              <span className="font-semibold text-gray-800 truncate max-w-[200px] sm:max-w-xs">
                {service.name}
              </span>
            </div>
            <h1 className="text-xl font-bold text-gray-900 truncate mt-0.5">
              Chi tiết bài đăng: {service.name}
            </h1>
          </div>
        </div>

        {/* Status Badge */}
        <div>
          {status === "pending" && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span>Chờ phê duyệt</span>
            </span>
          )}
          {status === "approved" && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Đang hiển thị công khai</span>
            </span>
          )}
          {status === "hidden" && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700 border border-gray-300">
              <EyeOff className="w-4 h-4 text-gray-500" />
              <span>Đã tạm ẩn</span>
            </span>
          )}
          {status === "rejected" && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
              <X className="w-4 h-4 text-rose-600" />
              <span>Đã từ chối</span>
            </span>
          )}
        </div>
      </div>

      {/* Admin Action Review Banner (Prominent Header) */}
      {status === "pending" && (
        <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-white border-2 border-amber-300 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Clock className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-sm sm:text-base">
                Bài đăng này đang chờ Admin kiểm duyệt
              </h3>
              <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">
                Được gửi bởi đối tác <strong className="text-gray-900 font-bold">{service.providerName}</strong>. Hãy kiểm tra kỹ hình ảnh, giá niêm yết, chính sách và vị trí bản đồ trước khi duyệt.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full md:w-auto shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setRejectReason("");
                setRejectModalOpen(true);
              }}
              className="flex-1 md:flex-initial text-xs sm:text-sm font-bold border-rose-300 text-rose-700 hover:bg-rose-50 h-10 px-4 rounded-xl cursor-pointer"
            >
              <X className="w-4 h-4 mr-1.5" />
              Từ chối bài đăng
            </Button>
            <Button
              type="button"
              onClick={handleApprove}
              className="flex-1 md:flex-initial text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white h-10 px-5 rounded-xl shadow-md cursor-pointer"
            >
              <Check className="w-4 h-4 mr-1.5" />
              Phê duyệt bài đăng này
            </Button>
          </div>
        </div>
      )}

      {status === "rejected" && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-rose-900">Bài đăng đã bị từ chối</p>
              <p className="text-xs text-rose-700 mt-0.5">
                <strong>Lý do từ chối:</strong> {service.rejectionReason || "Chưa có lý do cụ thể."}
              </p>
            </div>
          </div>
          <Button
            type="button"
            size="sm"
            onClick={handleApprove}
            className="text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs"
          >
            <Check className="w-3.5 h-3.5 mr-1" />
            Xem xét & Phê duyệt lại
          </Button>
        </div>
      )}

      {status === "hidden" && (
        <div className="bg-gray-100 border border-gray-300 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <EyeOff className="w-5 h-5 text-gray-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-gray-900">Bài đăng đang bị tạm ẩn khỏi sàn</p>
              <p className="text-xs text-gray-600 mt-0.5">
                <strong>Lý do tạm ẩn:</strong> {service.hiddenReason || "Theo quyết định của quản trị viên."}
              </p>
            </div>
          </div>
          <Button
            type="button"
            size="sm"
            onClick={handleRestore}
            className="text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1" />
            Mở lại hiển thị công khai
          </Button>
        </div>
      )}

      {/* Main 2-Column Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Hero Image Gallery */}
          <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-2xs space-y-3">
            <div className="relative h-72 sm:h-96 w-full rounded-xl overflow-hidden bg-gray-900 shadow-inner group">
              <img
                src={images[activeImageIndex]}
                alt={service.name}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-102"
              />

              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => setActiveImageIndex((prev) => (prev - 1 + images.length) % images.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveImageIndex((prev) => (prev + 1) % images.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              <span className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-xs text-white text-xs px-2.5 py-1 rounded-lg font-medium">
                Ảnh {activeImageIndex + 1} / {images.length}
              </span>
            </div>

            {/* Thumbnail selector */}
            {images.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-20 h-16 rounded-lg overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                      activeImageIndex === idx
                        ? "border-[#075985] ring-2 ring-blue-400"
                        : "border-gray-200 opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Navigation Tabs (Overview / Map / Policies) */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
              <button
                type="button"
                onClick={() => setActiveTab("overview")}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  activeTab === "overview"
                    ? "bg-[#075985] text-white shadow-xs"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                Bài viết &amp; Giới thiệu
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("map")}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  activeTab === "map"
                    ? "bg-[#075985] text-white shadow-xs"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                Bản đồ &amp; Vị trí GPS
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("policies")}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  activeTab === "policies"
                    ? "bg-[#075985] text-white shadow-xs"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                Chính sách &amp; Tiện ích
              </button>
            </div>

            {/* TAB 1: OVERVIEW & BLOG CONTENT */}
            {activeTab === "overview" && (
              <div className="space-y-4 pt-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border ${meta.color}`}>
                    <CatIcon className="w-3.5 h-3.5" />
                    {meta.label}
                  </span>
                  {service.stars && (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      <Star className="w-3.5 h-3.5 fill-current text-amber-500" />
                      Khách sạn {service.stars} Sao
                    </span>
                  )}
                  {service.subCategory && (
                    <span className="text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                      Loại hình: {service.subCategory}
                    </span>
                  )}
                </div>

                <div className="text-gray-700 text-sm leading-relaxed whitespace-pre-line bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                  {service.description || "Chưa có nội dung mô tả chi tiết cho dịch vụ này."}
                </div>

                {/* Scope & Capacities */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  {service.totalRooms && (
                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 text-center">
                      <span className="text-[11px] text-gray-400 block">Quy mô</span>
                      <strong className="text-sm font-bold text-gray-900 block mt-0.5">
                        {service.totalRooms} Phòng
                      </strong>
                    </div>
                  )}
                  {service.capacity && (
                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 text-center">
                      <span className="text-[11px] text-gray-400 block">Sức chứa</span>
                      <strong className="text-sm font-bold text-gray-900 block mt-0.5">
                        {service.capacity} Khách
                      </strong>
                    </div>
                  )}
                  {service.checkInTime && (
                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 text-center">
                      <span className="text-[11px] text-gray-400 block">Check-in</span>
                      <strong className="text-sm font-bold text-gray-900 block mt-0.5">
                        {service.checkInTime}
                      </strong>
                    </div>
                  )}
                  {service.checkOutTime && (
                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 text-center">
                      <span className="text-[11px] text-gray-400 block">Check-out</span>
                      <strong className="text-sm font-bold text-gray-900 block mt-0.5">
                        {service.checkOutTime}
                      </strong>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: MAP & LOCATION */}
            {activeTab === "map" && (
              <div className="space-y-4 pt-1">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2 text-xs text-gray-700">
                    <MapPin className="w-4 h-4 text-red-500 shrink-0" />
                    <span>
                      {service.street ? `${service.street}, ` : ""}
                      {service.ward ? `${service.ward}, ` : ""}
                      {service.province || service.location || "Toàn quốc"}
                    </span>
                  </div>
                  <a
                    href={googleMapsExternalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg border border-blue-200 transition-colors"
                  >
                    <span>Mở vị trí Google Maps</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                <div className="relative h-80 w-full rounded-xl overflow-hidden border border-gray-200 bg-gray-100">
                  <iframe
                    title="Bản đồ dịch vụ"
                    src={osmEmbedUrl}
                    className="w-full h-full border-0"
                    loading="lazy"
                  />
                </div>
              </div>
            )}

            {/* TAB 3: POLICIES & AMENITIES */}
            {activeTab === "policies" && (
              <div className="space-y-4 pt-1">
                {/* Policies List */}
                <div>
                  <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#075985]" />
                    Chính sách &amp; Điều khoản dịch vụ
                  </h4>
                  {Array.isArray(service.policies) && service.policies.length > 0 ? (
                    <ul className="space-y-2 text-xs text-gray-700">
                      {service.policies.map((p, idx) => (
                        <li key={idx} className="flex items-start gap-2 bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{p}</span>
                        </li>
                      ))}
                    </ul>
                  ) : typeof service.policies === "string" ? (
                    <p className="text-xs text-gray-700 bg-gray-50 p-3 rounded-lg">{service.policies}</p>
                  ) : (
                    <p className="text-xs text-gray-400 italic">Áp dụng theo quy định tiêu chuẩn của cơ sở.</p>
                  )}
                </div>

                {/* Amenities List */}
                {service.amenities && service.amenities.length > 0 && (
                  <div className="pt-3 border-t border-gray-100">
                    <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-600" />
                      Tiện nghi &amp; Dịch vụ đi kèm
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {service.amenities.map((am, idx) => (
                        <span key={idx} className="text-xs bg-blue-50 text-blue-800 px-2.5 py-1 rounded-lg border border-blue-200 font-medium">
                          ✓ {am}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (1 col): Price, Provider Info & Sticky Quick Approval Box */}
        <div className="space-y-6">
          {/* Price Card */}
          <div className="bg-gradient-to-br from-blue-50/80 to-white rounded-2xl border border-blue-200 p-5 shadow-2xs space-y-3">
            <span className="text-[11px] font-bold text-[#075985] uppercase tracking-wider block">
              Bảng giá dịch vụ niêm yết
            </span>
            <div>
              <p className="text-2xl font-black text-[#075985] tracking-tight">
                {formatPriceSummary()}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                Đơn vị tính: <strong>/ {getPriceUnit()}</strong>
              </p>
            </div>
            <p className="text-[11px] text-gray-500 leading-relaxed border-t border-blue-100 pt-2.5">
              * Khoảng giá ước tính cho công ty lữ hành liên hệ thiết kế và tùy chỉnh tour du lịch.
            </p>
          </div>

          {/* Provider Info Card */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-2xs space-y-3.5">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#075985]" />
              Nhà cung cấp đối tác
            </h3>
            <div className="space-y-2.5 text-xs">
              <div>
                <span className="text-gray-400 block text-[11px]">Đơn vị đăng bài</span>
                <span className="font-bold text-gray-900 text-sm">{service.providerName}</span>
              </div>
              <div>
                <span className="text-gray-400 block text-[11px]">Mã định danh</span>
                <span className="font-mono text-gray-600">{service.providerId || service.id}</span>
              </div>
              <div className="pt-2 border-t border-gray-100">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Đối tác đã xác minh hợp đồng B2B
                </span>
              </div>
            </div>
          </div>

          {/* Sticky Action Box */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-2xs space-y-3 sticky top-4">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#075985]" />
              Thao tác kiểm duyệt Admin
            </h3>

            {status === "pending" && (
              <div className="space-y-2 pt-1">
                <Button
                  type="button"
                  onClick={handleApprove}
                  className="w-full text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white h-10 rounded-xl shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Phê duyệt bài đăng này</span>
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setRejectReason("");
                    setRejectModalOpen(true);
                  }}
                  className="w-full text-xs font-bold border-rose-300 text-rose-700 hover:bg-rose-50 h-10 rounded-xl cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <X className="w-4 h-4" />
                  <span>Từ chối bài đăng</span>
                </Button>
              </div>
            )}

            {status === "approved" && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setHideReason("");
                  setHideModalOpen(true);
                }}
                className="w-full text-xs font-semibold border-amber-300 text-amber-800 hover:bg-amber-50 h-10 rounded-xl cursor-pointer flex items-center justify-center gap-1.5"
              >
                <EyeOff className="w-4 h-4" />
                <span>Tạm ẩn bài đăng</span>
              </Button>
            )}

            {status === "hidden" && (
              <Button
                type="button"
                onClick={handleRestore}
                className="w-full text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white h-10 rounded-xl shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Mở lại hiển thị công khai</span>
              </Button>
            )}

            {status === "rejected" && (
              <Button
                type="button"
                onClick={handleApprove}
                className="w-full text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white h-10 rounded-xl shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Xem xét & Duyệt lại bài</span>
              </Button>
            )}

            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              className="w-full text-xs font-semibold border-gray-200 text-gray-600 hover:bg-gray-50 h-9 rounded-xl"
            >
              Quay lại danh sách
            </Button>
          </div>
        </div>
      </div>

      {/* Reject Reason Modal */}
      <Dialog open={rejectModalOpen} onOpenChange={setRejectModalOpen}>
        <DialogContent className="max-w-md rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-600" />
              Từ chối bài đăng dịch vụ
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500 mt-1">
              Bài đăng sẽ bị từ chối và gửi lý do chi tiết tới Nhà cung cấp ({service.providerName}) để hoàn thiện lại.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-gray-600">Gợi ý lý do nhanh:</span>
              <div className="flex flex-wrap gap-1.5">
                {quickRejectSuggestions.map((sug, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setRejectReason(sug)}
                    className="px-2.5 py-1 rounded-lg text-[11px] bg-rose-50 hover:bg-rose-100 text-rose-900 border border-rose-200 transition-colors text-left"
                  >
                    {sug}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700 block">
                Lý do từ chối cụ thể:
              </label>
              <Textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Nhập lý do chi tiết..."
                rows={3}
                className="text-xs rounded-xl"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setRejectModalOpen(false)}
                className="rounded-xl text-xs"
              >
                Hủy bỏ
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleConfirmReject}
                className="rounded-xl text-xs bg-rose-600 hover:bg-rose-700 text-white font-semibold"
              >
                Xác nhận từ chối
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Hide Reason Modal */}
      <Dialog open={hideModalOpen} onOpenChange={setHideModalOpen}>
        <DialogContent className="max-w-md rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
              <EyeOff className="w-5 h-5 text-amber-600" />
              Tạm ẩn bài đăng dịch vụ
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500 mt-1">
              Bài đăng bị tạm ẩn sẽ không xuất hiện trên sàn cho đến khi được Admin mở lại.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-gray-600">Gợi ý lý do nhanh:</span>
              <div className="flex flex-wrap gap-1.5">
                {quickHideSuggestions.map((sug, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setHideReason(sug)}
                    className="px-2.5 py-1 rounded-lg text-[11px] bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 transition-colors text-left"
                  >
                    {sug}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700 block">
                Lý do tạm ẩn cụ thể:
              </label>
              <Textarea
                value={hideReason}
                onChange={(e) => setHideReason(e.target.value)}
                placeholder="Nhập lý do tạm ẩn..."
                rows={3}
                className="text-xs rounded-xl"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setHideModalOpen(false)}
                className="rounded-xl text-xs"
              >
                Hủy bỏ
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleConfirmHide}
                className="rounded-xl text-xs bg-amber-600 hover:bg-amber-700 text-white font-semibold"
              >
                Xác nhận tạm ẩn
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
