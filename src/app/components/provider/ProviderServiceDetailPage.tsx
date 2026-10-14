import { useState } from "react";
import { Service } from "@/app/types";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Image as ImageIcon,
  MapPin,
  Star,
  Hotel,
  Utensils,
  Compass,
  Sparkles,
  Car,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Layers,
  Calendar,
  DollarSign,
  Users,
  ShieldCheck,
  Info,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { ImageUploadManager } from "../ImageUploadManager";

interface ProviderServiceDetailPageProps {
  service: Service;
  onBack: () => void;
  onEdit: (service: Service) => void;
  onDelete: (serviceId: string) => void;
  onUpdateServiceImages?: (serviceId: string, images: string[], thumbnail: string) => void;
}

export function ProviderServiceDetailPage({
  service,
  onBack,
  onEdit,
  onDelete,
  onUpdateServiceImages,
}: ProviderServiceDetailPageProps) {
  const imagesList = service.images && service.images.length > 0
    ? service.images
    : [service.image];

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showImageManager, setShowImageManager] = useState(false);

  const getStatusBadge = (status: Service["status"]) => {
    switch (status) {
      case "approved":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Đã phê duyệt (Đang hoạt động)
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            Bị từ chối kiểm duyệt
          </span>
        );
      case "pending":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-600 animate-spin-slow" />
            Đang chờ admin kiểm duyệt
          </span>
        );
    }
  };

  const getCategoryMeta = () => {
    switch (service.category) {
      case "hotel":
        return {
          label: "Lưu trú & Khách sạn",
          icon: Hotel,
          color: "bg-blue-50 text-blue-700 border-blue-200",
          unit: "/phòng",
        };
      case "fnb":
      case "restaurant":
        return {
          label: "Ẩm thực & Nhà hàng",
          icon: Utensils,
          color: "bg-orange-50 text-orange-700 border-orange-200",
          unit: service.pricePerPerson ? "/người" : "/suất",
        };
      case "attraction":
        return {
          label: "Điểm tham quan & Vé",
          icon: Compass,
          color: "bg-teal-50 text-teal-700 border-teal-200",
          unit: "/vé",
        };
      case "activity":
        return {
          label: "Hoạt động & Trải nghiệm",
          icon: Sparkles,
          color: "bg-purple-50 text-purple-700 border-purple-200",
          unit: "/người",
        };
      case "transportation":
        return {
          label: "Phương tiện & Vận chuyển",
          icon: Car,
          color: "bg-cyan-50 text-cyan-700 border-cyan-200",
          unit: service.seats ? `/${service.seats} chỗ` : "/chuyến",
        };
      default:
        return {
          label: service.category,
          icon: Layers,
          color: "bg-gray-100 text-gray-700 border-gray-200",
          unit: "",
        };
    }
  };

  const meta = getCategoryMeta();
  const Icon = meta.icon;

  const formatAddress = () => {
    // Strictly 2 levels: Ward and Province (NO district)
    const parts = [service.street, service.ward, service.province].filter(Boolean);
    if (parts.length > 0) return parts.join(", ");
    return service.location || "Chưa cập nhật";
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Navigation & Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 md:p-6 rounded-2xl border border-gray-200 shadow-xs">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={onBack}
            className="rounded-xl border-gray-200 hover:bg-gray-100 text-gray-700"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Quay lại bảng dịch vụ
          </Button>
          <div className="hidden md:flex items-center gap-2 text-xs text-gray-400">
            <span>/</span>
            <span>Dịch vụ</span>
            <span>/</span>
            <span className="text-gray-700 font-medium truncate max-w-[200px]">
              {service.name}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <Button
            variant="outline"
            size="sm"
            className="text-purple-600 border-purple-200 hover:bg-purple-50 rounded-xl"
            onClick={() => setShowImageManager(true)}
          >
            <ImageIcon className="w-4 h-4 mr-1.5" />
            Quản lý ảnh ({imagesList.length})
          </Button>

          <Button
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs"
            onClick={() => onEdit(service)}
          >
            <Edit className="w-4 h-4 mr-1.5" />
            Chỉnh sửa
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="text-rose-600 border-rose-200 hover:bg-rose-50 rounded-xl"
            onClick={() => {
              if (
                confirm(
                  `Bạn có chắc chắn muốn xóa bài đăng "${service.name}"? Hành động này không thể hoàn tác.`
                )
              ) {
                onDelete(service.id);
                onBack();
              }
            }}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Rejection / Moderation Status Banner */}
      {service.status === "rejected" && (
        <div className="p-4 bg-rose-50 border-2 border-rose-200 rounded-2xl flex items-start gap-3.5">
          <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-bold text-rose-900 text-sm">
              Bài đăng bị từ chối kiểm duyệt
            </h4>
            <p className="text-xs text-rose-700 mt-1">
              <strong>Lý do từ Admin:</strong> {service.rejectionReason || "Thông tin dịch vụ chưa đầy đủ hoặc không đạt tiêu chuẩn."}
            </p>
            <p className="text-xs text-rose-600 mt-1">
              Vui lòng bấm nút <strong>Chỉnh sửa</strong> ở trên để cập nhật lại thông tin theo yêu cầu và gửi duyệt lại.
            </p>
          </div>
          <Button
            size="sm"
            onClick={() => onEdit(service)}
            className="bg-rose-600 hover:bg-rose-700 text-white text-xs rounded-xl flex-shrink-0"
          >
            Sửa & Gửi lại
          </Button>
        </div>
      )}

      {service.status === "pending" && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-3">
          <Clock className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <div className="text-xs text-amber-800">
            <strong>Bài đăng đang chờ Admin xét duyệt:</strong> Dịch vụ sẽ tự động kích hoạt và có thể được các công ty lữ hành tích hợp vào tour ngay sau khi được phê duyệt.
          </div>
        </div>
      )}

      {/* Hero Showcase: Photos and Main Header */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
        {/* Left: Interactive Image Gallery (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="relative h-80 sm:h-96 w-full rounded-2xl overflow-hidden bg-gray-100 border border-gray-200">
            <img
              src={imagesList[activeImageIndex] || service.image}
              alt={service.name}
              className="w-full h-full object-cover transition-all duration-300"
            />
            <div className="absolute top-4 left-4">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold backdrop-blur-md bg-white/90 border border-gray-200 shadow-sm`}>
                <Icon className="w-4 h-4 text-blue-600" />
                {meta.label}
              </span>
            </div>
            <div className="absolute bottom-4 right-4 bg-black/75 backdrop-blur-xs text-white px-3 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5" />
              Ảnh {activeImageIndex + 1} / {imagesList.length}
            </div>
          </div>

          {/* Thumbnails list */}
          {imagesList.length > 1 && (
            <div className="flex gap-2.5 overflow-x-auto pb-1">
              {imagesList.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative flex-shrink-0 w-20 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                    activeImageIndex === idx
                      ? "border-blue-600 ring-2 ring-blue-600/30 scale-102"
                      : "border-gray-200 opacity-75 hover:opacity-100"
                  }`}
                >
                  <img
                    src={img}
                    alt={`Thumbnail ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Key Info & Overview (5 cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              {getStatusBadge(service.status)}
            </div>

            <h1 className="text-2xl font-bold text-gray-900 leading-tight">
              {service.name}
            </h1>
            <p className="text-xs text-gray-500 font-mono mt-1">
              Mã dịch vụ: {service.id}
            </p>

            <div className="flex items-start gap-2 mt-3 text-xs text-gray-600">
              <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
              <span>{formatAddress()}</span>
            </div>

            {/* Price Box */}
            <div className="mt-5 p-4 rounded-xl bg-gradient-to-br from-blue-50/70 to-indigo-50/70 border border-blue-100">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">
                {service.priceFrom && service.priceTo
                  ? `Khoảng giá dự kiến / ${service.category === "hotel" ? "phòng" : "người"}`
                  : "Đơn giá niêm yết"}
              </span>
              {service.priceFrom && service.priceTo ? (
                <div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl sm:text-3xl font-extrabold text-blue-700">
                      {service.priceFrom.toLocaleString("vi-VN")}đ - {service.priceTo.toLocaleString("vi-VN")}đ
                    </span>
                    <span className="text-xs font-semibold text-blue-600">
                      / {service.category === "hotel" ? "phòng" : "người"}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1">
                    {service.category === "hotel"
                      ? "Khoảng giá theo phòng/đêm giúp công ty lữ hành dễ dàng ước tính chi phí khi thiết kế tour."
                      : "Khoảng giá theo đầu người giúp công ty lữ hành dễ dàng ước tính chi phí khi thiết kế tour."}
                  </p>
                </div>
              ) : (
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-extrabold text-blue-700">
                    {service.price?.toLocaleString("vi-VN")}đ
                  </span>
                  <span className="text-xs font-medium text-gray-600">
                    {meta.unit}
                  </span>
                </div>
              )}

              {service.pricePerPerson && !service.priceFrom && (
                <div className="mt-2 pt-2 border-t border-blue-200/50 flex justify-between text-xs text-gray-700">
                  <span>Giá tính theo người:</span>
                  <strong>{service.pricePerPerson.toLocaleString("vi-VN")}đ/người</strong>
                </div>
              )}

              {service.childPrice && (
                <div className="mt-1 flex justify-between text-xs text-gray-700">
                  <span>Giá vé trẻ em:</span>
                  <strong>{service.childPrice.toLocaleString("vi-VN")}đ/trẻ</strong>
                </div>
              )}
            </div>
          </div>

          {/* Quick Specs summary */}
          <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-gray-100">
            {service.category === "hotel" ? (
              (service.totalRooms || service.capacity) && (
                <div className="p-2.5 bg-gray-50 rounded-xl">
                  <span className="text-gray-500 block">Tổng số phòng:</span>
                  <strong className="text-gray-900 text-sm">
                    {service.totalRooms || service.capacity} phòng
                  </strong>
                </div>
              )
            ) : (
              service.capacity && (
                <div className="p-2.5 bg-gray-50 rounded-xl">
                  <span className="text-gray-500 block">Sức chứa tối đa:</span>
                  <strong className="text-gray-900 text-sm">{service.capacity} người</strong>
                </div>
              )
            )}
            {service.seats && (
              <div className="p-2.5 bg-gray-50 rounded-xl">
                <span className="text-gray-500 block">Số chỗ ngồi:</span>
                <strong className="text-gray-900 text-sm">{service.seats} ghế</strong>
              </div>
            )}
            {service.stars && (
              <div className="p-2.5 bg-gray-50 rounded-xl">
                <span className="text-gray-500 block">Xếp hạng:</span>
                <strong className="text-amber-600 text-sm">{service.stars} Sao ⭐</strong>
              </div>
            )}
            <div className="p-2.5 bg-gray-50 rounded-xl">
              <span className="text-gray-500 block">Ngày tạo bài:</span>
              <strong className="text-gray-900">
                {new Date(service.createdAt).toLocaleDateString("vi-VN")}
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* Main Details Section Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column (2 cols): Detailed Description & Category Specs */}
        <div className="md:col-span-2 space-y-6">
          {/* 1. Description */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-3">
            <h3 className="font-bold text-base text-gray-900 flex items-center gap-2">
              <Info className="w-5 h-5 text-blue-600" />
              Mô tả chi tiết dịch vụ
            </h3>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line bg-gray-50/60 p-4 rounded-xl border border-gray-100">
              {service.description}
            </p>
          </div>

          {/* 2. Category-Specific Details */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4">
            <h3 className="font-bold text-base text-gray-900 flex items-center gap-2">
              <Icon className="w-5 h-5 text-blue-600" />
              Thông số chi tiết [{meta.label}]
            </h3>

            {/* Hotel Specs */}
            {service.category === "hotel" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="text-gray-500 block mb-0.5">Tên cơ sở lưu trú:</span>
                  <span className="font-semibold text-gray-900 text-sm">
                    {service.name}
                  </span>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="text-gray-500 block mb-0.5">Loại hình lưu trú:</span>
                  <span className="font-semibold text-gray-900 text-sm">
                    {service.subCategory || "Khách sạn (Hotel)"}
                  </span>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="text-gray-500 block mb-0.5">Xếp hạng sao:</span>
                  <span className="font-semibold text-amber-600 text-sm">
                    {service.stars && service.stars > 0 ? `${service.stars} Sao ⭐` : "Tiêu chuẩn du lịch"}
                  </span>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="text-gray-500 block mb-0.5">Tổng số lượng phòng:</span>
                  <span className="font-semibold text-gray-900 text-sm">
                    {service.totalRooms || service.capacity || "Chưa cập nhật"} phòng
                  </span>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 sm:col-span-2">
                  <span className="text-gray-500 block mb-0.5">Các chính sách đi kèm:</span>
                  <span className="font-semibold text-gray-900 text-sm leading-relaxed whitespace-pre-line">
                    {service.policies || (service.checkInTime ? `Nhận phòng: ${service.checkInTime} - Trả phòng: ${service.checkOutTime}` : "Đang cập nhật")}
                  </span>
                </div>
              </div>
            )}

            {/* FnB Specs */}
            {(service.category === "fnb" || service.category === "restaurant") && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="text-gray-500 block mb-0.5">Phân loại ẩm thực:</span>
                  <span className="font-semibold text-gray-900 text-sm capitalize">
                    {service.subCategory === "restaurant"
                      ? "Nhà hàng ăn uống"
                      : service.subCategory === "cafe"
                      ? "Quán Cà phê & Trà"
                      : service.subCategory || "Ẩm thực"}
                  </span>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="text-gray-500 block mb-0.5">Phong cách ẩm thực:</span>
                  <span className="font-semibold text-gray-900 text-sm">
                    {service.cuisineType || "Đặc sản địa phương"}
                  </span>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 sm:col-span-2">
                  <span className="text-gray-500 block mb-0.5">Khung giờ mở cửa đón khách:</span>
                  <span className="font-semibold text-gray-900 text-sm">
                    {service.openingHours || "07:00 - 22:00"}
                  </span>
                </div>
                {service.dietaryOptions && service.dietaryOptions.length > 0 && (
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 sm:col-span-2">
                    <span className="text-gray-500 block mb-1">Thực đơn đặc biệt:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {service.dietaryOptions.map((opt, i) => (
                        <Badge key={i} variant="outline" className="bg-amber-50 text-amber-800 border-amber-200">
                          {opt}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Attraction Specs */}
            {service.category === "attraction" && (
              <div className="grid grid-cols-1 gap-4 text-xs">
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="text-gray-500 block mb-0.5">Giờ đón khách / mở cửa:</span>
                  <span className="font-semibold text-gray-900 text-sm">
                    {service.openingHours || "07:30 - 17:30 hàng ngày"}
                  </span>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="text-gray-500 block mb-0.5">Quyền lợi vé bao gồm:</span>
                  <span className="font-semibold text-gray-900 text-sm">
                    {service.ticketIncludes || "Vé vào cổng tham quan đầy đủ tiện ích nội khu"}
                  </span>
                </div>
              </div>
            )}

            {/* Activity Specs */}
            {service.category === "activity" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="text-gray-500 block mb-0.5">Thời lượng trải nghiệm:</span>
                  <span className="font-semibold text-gray-900 text-sm">
                    {service.duration || "Khoảng 2 - 3 giờ"}
                  </span>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="text-gray-500 block mb-0.5">Mức độ thể lực / Độ khó:</span>
                  <span className="font-semibold text-purple-700 text-sm">
                    {service.difficultyLevel || "Dễ dàng"}
                  </span>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="text-gray-500 block mb-0.5">Giới hạn độ tuổi:</span>
                  <span className="font-semibold text-gray-900 text-sm">
                    {service.ageRestriction || "Thích hợp mọi lứa tuổi"}
                  </span>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="text-gray-500 block mb-0.5">Thiết bị bảo hộ an toàn:</span>
                  <span className="font-semibold text-gray-900 text-sm">
                    {service.safetyGear || "Đầy đủ trang thiết bị bảo hộ chuẩn quy chuẩn"}
                  </span>
                </div>
              </div>
            )}

            {/* Transportation Specs */}
            {service.category === "transportation" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="text-gray-500 block mb-0.5">Dòng xe / Phương tiện:</span>
                  <span className="font-semibold text-gray-900 text-sm">
                    {service.vehicleType || "Xe du lịch"}
                  </span>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="text-gray-500 block mb-0.5">Số lượng chỗ ngồi:</span>
                  <span className="font-semibold text-gray-900 text-sm">
                    {service.seats || 16} Chỗ ngồi
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* 3. Amenities List */}
          {service.amenities && service.amenities.length > 0 && (
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-3">
              <h3 className="font-bold text-base text-gray-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-600" />
                Tiện nghi & Dịch vụ đi kèm
              </h3>
              <div className="flex flex-wrap gap-2 pt-1">
                {service.amenities.map((amenity, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 bg-blue-50/80 text-blue-800 text-xs font-semibold rounded-xl border border-blue-200 flex items-center gap-1.5"
                  >
                    ✓ {amenity}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column (1 col): Address, Map & System Info */}
        <div className="space-y-6">
          {/* Address Details Card */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4">
            <h3 className="font-bold text-base text-gray-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-emerald-600" />
              Địa chỉ
            </h3>
            <div className="space-y-3 text-xs">
              {service.province && (
                <div className="flex justify-between py-1.5 border-b border-gray-100">
                  <span className="text-gray-500">Tỉnh / Thành phố:</span>
                  <strong className="text-gray-900">{service.province}</strong>
                </div>
              )}
              {service.ward && (
                <div className="flex justify-between py-1.5 border-b border-gray-100">
                  <span className="text-gray-500">Phường / Xã:</span>
                  <strong className="text-gray-900">{service.ward}</strong>
                </div>
              )}
              {service.street && (
                <div className="flex justify-between py-1.5 border-b border-gray-100">
                  <span className="text-gray-500">Đường / Số nhà:</span>
                  <strong className="text-gray-900">{service.street}</strong>
                </div>
              )}
              <div className="pt-2">
                <span className="text-gray-500 block mb-1">Địa chỉ đầy đủ:</span>
                <p className="text-gray-800 font-medium italic bg-emerald-50/50 p-2.5 rounded-lg border border-emerald-100">
                  {formatAddress()}
                </p>
              </div>

              {/* Map Preview & Google Maps Link */}
              <div className="pt-3 border-t border-gray-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-700 flex items-center gap-1">
                    <Compass className="w-3.5 h-3.5 text-blue-600" />
                    Tọa độ GPS:
                  </span>
                  <span className="font-mono text-gray-800 font-semibold">
                    {(service.latitude || 11.9404).toFixed(4)}, {(service.longitude || 108.4583).toFixed(4)}
                  </span>
                </div>

                <div className="rounded-xl overflow-hidden border border-gray-200 h-40 bg-gray-100 relative">
                  <iframe
                    title="Bản đồ vị trí dịch vụ"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    loading="lazy"
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${(service.longitude || 108.4583) - 0.02}%2C${(service.latitude || 11.9404) - 0.02}%2C${(service.longitude || 108.4583) + 0.02}%2C${(service.latitude || 11.9404) + 0.02}&layer=mapnik&marker=${service.latitude || 11.9404}%2C${service.longitude || 108.4583}`}
                  />
                </div>

                <a
                  href={`https://www.google.com/maps?q=${service.latitude || 11.9404},${service.longitude || 108.4583}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 font-medium text-xs border border-blue-200 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Mở vị trí trên Google Maps
                </a>
              </div>
            </div>
          </div>

          {/* System metadata */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-3">
            <h3 className="font-bold text-sm text-gray-900">
              Thông tin hệ thống
            </h3>
            <div className="space-y-2 text-xs text-gray-600">
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span>Nhà cung cấp:</span>
                <strong>{service.providerName}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span>Mã số định danh:</span>
                <span className="font-mono">{service.id}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span>Ngày tạo bài:</span>
                <span>{new Date(service.createdAt).toLocaleString("vi-VN")}</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Trạng thái:</span>
                {getStatusBadge(service.status)}
              </div>
            </div>
          </div>

          {/* Quick Action Footer */}
          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-2">
            <Button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
              onClick={() => onEdit(service)}
            >
              <Edit className="w-4 h-4 mr-2" />
              Chỉnh sửa thông tin
            </Button>
            <Button
              variant="outline"
              className="w-full text-purple-600 border-purple-200 hover:bg-purple-50 rounded-xl"
              onClick={() => setShowImageManager(true)}
            >
              <ImageIcon className="w-4 h-4 mr-2" />
              Cập nhật ảnh bài đăng
            </Button>
          </div>
        </div>
      </div>

      {/* Image Upload Manager Modal */}
      {showImageManager && (
        <ImageUploadManager
          isOpen={showImageManager}
          onClose={() => setShowImageManager(false)}
          onSave={(images, thumbnailIndex) => {
            const updated = {
              ...service,
              images: images,
              image: images[thumbnailIndex] || images[0],
            };
            onEdit(updated);
            if (onUpdateServiceImages) {
              onUpdateServiceImages(service.id, images, images[thumbnailIndex] || images[0]);
            }
            setShowImageManager(false);
          }}
          initialImages={imagesList}
          initialThumbnailIndex={activeImageIndex}
          title={`Quản lý thư viện ảnh - ${service.name}`}
        />
      )}
    </div>
  );
}
