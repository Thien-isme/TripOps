import { useState } from "react";
import { Service } from "@/app/types";
import {
  FileText,
  Eye,
  EyeOff,
  Trash2,
  Search,
  CheckCircle2,
  AlertTriangle,
  X,
  MapPin,
  Building2,
  Hotel,
  Utensils,
  Car,
  Compass,
  Star,
  Check,
  Clock,
  RotateCcw,
  AlertCircle,
  HelpCircle,
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
import { ServiceBlogDetailModal } from "@/app/components/service/ServiceBlogDetailModal";
import { AdminServiceDetailPage } from "./AdminServiceDetailPage";

interface ServicePostApprovalProps {
  services: Service[];
  onToggleHideService?: (serviceId: string, reason?: string) => void;
  onDeleteService?: (serviceId: string) => void;
  onApproveService?: (serviceId: string) => void;
  onRejectService?: (serviceId: string, reason: string) => void;
}

export function ServicePostApproval({
  services,
  onToggleHideService,
  onDeleteService,
  onApproveService,
  onRejectService,
}: ServicePostApprovalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<"all" | "pending" | "approved" | "hidden" | "rejected">("all");
  const [previewModalService, setPreviewModalService] = useState<Service | null>(null);
  const [selectedServiceDetailId, setSelectedServiceDetailId] = useState<string | null>(null);

  // If viewing dedicated full page
  if (selectedServiceDetailId) {
    const currentService = services.find((s) => s.id === selectedServiceDetailId);
    if (currentService) {
      return (
        <AdminServiceDetailPage
          service={currentService}
          onBack={() => setSelectedServiceDetailId(null)}
          onApprove={(id) => onApproveService?.(id)}
          onReject={(id, reason) => onRejectService?.(id, reason)}
          onToggleHide={(id, reason) => onToggleHideService?.(id, reason)}
        />
      );
    }
  }

  // Action Dialog States
  const [hidingService, setHidingService] = useState<Service | null>(null);
  const [rejectingService, setRejectingService] = useState<Service | null>(null);
  const [deletingService, setDeletingService] = useState<Service | null>(null);
  const [viewingReasonService, setViewingReasonService] = useState<Service | null>(null);

  const [hideReason, setHideReason] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [notification, setNotification] = useState<{ type: "success" | "info" | "warning"; message: string } | null>(null);

  // Quick suggestions for Rejecting
  const quickRejectSuggestions = [
    "Hình ảnh bài đăng mờ, chất lượng kém hoặc không đúng thực tế cơ sở.",
    "Bảng giá và phụ thu không rõ ràng hoặc có dấu hiệu bất hợp lý.",
    "Thiếu chính sách nhận/trả phòng và điều kiện hủy đổi dịch vụ.",
    "Thông tin địa chỉ hoặc giấy phép hoạt động chưa đầy đủ / chính xác.",
    "Nội dung mô tả sơ sài, sao chép hoặc chứa thông tin nhảm nhí.",
  ];

  // Quick suggestions for Hiding
  const quickHideSuggestions = [
    "Thông tin dịch vụ sai lệch, nhảm nhí không đúng thực tế.",
    "Bảng giá ảo hoặc phụ thu bất hợp lý so với thỏa thuận.",
    "Hình ảnh bài đăng chất lượng kém hoặc sao chép trái phép.",
    "Cơ sở dịch vụ đã tạm dừng hoạt động hoặc đổi địa chỉ.",
    "Bài đăng trùng lặp hoặc có dấu hiệu spam trên sàn.",
  ];

  // Counts
  const totalCount = services.length;
  const pendingCount = services.filter((s) => s.status === "pending").length;
  const approvedCount = services.filter((s) => s.status === "approved" || (!s.status && s.status !== "hidden")).length;
  const hiddenCount = services.filter((s) => s.status === "hidden").length;
  const rejectedCount = services.filter((s) => s.status === "rejected").length;

  const hotelCount = services.filter((s) => s.category === "hotel").length;
  const fnbCount = services.filter((s) => s.category === "fnb" || s.category === "restaurant").length;
  const transCount = services.filter((s) => s.category === "transportation").length;
  const attrCount = services.filter((s) => s.category === "attraction" || s.category === "activity").length;

  // Filtered Services List
  const filteredServices = services.filter((service) => {
    // Status filter
    const status = service.status || "approved";
    if (selectedStatus !== "all" && status !== selectedStatus) {
      return false;
    }

    // Category filter
    if (selectedCategory !== "all") {
      if (selectedCategory === "hotel" && service.category !== "hotel") return false;
      if (
        (selectedCategory === "fnb" || selectedCategory === "restaurant") &&
        service.category !== "fnb" &&
        service.category !== "restaurant"
      )
        return false;
      if (selectedCategory === "transportation" && service.category !== "transportation") return false;
      if (
        (selectedCategory === "attraction" || selectedCategory === "activity") &&
        service.category !== "attraction" &&
        service.category !== "activity"
      )
        return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = service.name.toLowerCase().includes(q);
      const matchProvider = (service.providerName || "").toLowerCase().includes(q);
      const matchLoc = (service.location || "").toLowerCase().includes(q);
      const matchProv = (service.province || "").toLowerCase().includes(q);
      const matchWard = (service.ward || "").toLowerCase().includes(q);
      return matchName || matchProvider || matchLoc || matchProv || matchWard;
    }

    return true;
  });

  const getCategoryMeta = (cat: Service["category"]) => {
    switch (cat) {
      case "hotel":
        return {
          label: "Lưu trú & Khách sạn",
          shortLabel: "Khách sạn",
          icon: Hotel,
          badgeColor: "bg-[#F0F9FF] text-[#075985] border-[#CBD5E1]",
        };
      case "fnb":
      case "restaurant":
        return {
          label: "Ẩm thực & Nhà hàng",
          shortLabel: "Nhà hàng",
          icon: Utensils,
          badgeColor: "bg-orange-50 text-orange-700 border-orange-200",
        };
      case "transportation":
        return {
          label: "Vận chuyển & Xe tour",
          shortLabel: "Xe tour",
          icon: Car,
          badgeColor: "bg-cyan-50 text-cyan-700 border-cyan-200",
        };
      case "attraction":
      case "activity":
      default:
        return {
          label: "Tham quan & Trải nghiệm",
          shortLabel: "Tham quan",
          icon: Compass,
          badgeColor: "bg-teal-50 text-teal-700 border-teal-200",
        };
    }
  };

  const formatPriceSummary = (service: Service) => {
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

  const getPriceUnit = (service: Service) => {
    if (service.category === "hotel") return "phòng / đêm";
    if (service.category === "fnb" || service.category === "restaurant") return "người / suất";
    if (service.category === "transportation") return "xe / ngày";
    return "vé / người";
  };

  // Handlers
  const handleApproveService = (service: Service) => {
    if (onApproveService) {
      onApproveService(service.id);
    }
    setNotification({
      type: "success",
      message: `Đã phê duyệt thành công bài đăng "${service.name}". Dịch vụ này đã sẵn sàng hiển thị trên sàn!`,
    });
    if (previewModalService?.id === service.id) {
      setPreviewModalService(null);
    }
    setTimeout(() => setNotification(null), 4000);
  };

  const handleConfirmReject = () => {
    if (!rejectingService) return;
    const reason = rejectReason.trim() || "Nội dung bài đăng chưa đáp ứng tiêu chuẩn kiểm duyệt của nền tảng.";
    if (onRejectService) {
      onRejectService(rejectingService.id, reason);
    }
    setNotification({
      type: "warning",
      message: `Đã từ chối bài đăng "${rejectingService.name}". Lý do đã được gửi tới đối tác.`,
    });
    if (previewModalService?.id === rejectingService.id) {
      setPreviewModalService(null);
    }
    setRejectingService(null);
    setRejectReason("");
    setTimeout(() => setNotification(null), 4000);
  };

  const handleConfirmHide = () => {
    if (!hidingService) return;
    const reason = hideReason.trim() || "Nội dung bài đăng bị tạm ẩn do thông tin không chính xác hoặc không phù hợp.";
    if (onToggleHideService) {
      onToggleHideService(hidingService.id, reason);
    }
    setNotification({
      type: "info",
      message: `Đã tạm ẩn bài đăng "${hidingService.name}". Dịch vụ này sẽ không xuất hiện trên sàn!`,
    });
    if (previewModalService?.id === hidingService.id) {
      setPreviewModalService(null);
    }
    setHidingService(null);
    setHideReason("");
    setTimeout(() => setNotification(null), 4000);
  };

  const handleRestoreService = (service: Service) => {
    if (onToggleHideService) {
      onToggleHideService(service.id);
    }
    setNotification({
      type: "success",
      message: `Đã mở hiển thị lại bài đăng "${service.name}" công khai trên sàn!`,
    });
    if (previewModalService?.id === service.id) {
      setPreviewModalService(null);
    }
    setTimeout(() => setNotification(null), 4000);
  };

  const handleConfirmDelete = () => {
    if (!deletingService) return;
    if (onDeleteService) {
      onDeleteService(deletingService.id);
    }
    setNotification({
      type: "info",
      message: `Đã xóa vĩnh viễn bài đăng "${deletingService.name}" khỏi hệ thống!`,
    });
    if (previewModalService?.id === deletingService.id) {
      setPreviewModalService(null);
    }
    setDeletingService(null);
    setTimeout(() => setNotification(null), 4000);
  };

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="w-7 h-7 text-[#075985]" />
            Quản Lý Bài Đăng Dịch Vụ
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Kiểm duyệt và quản lý toàn bộ các bài đăng dịch vụ (khách sạn, ăn uống, xe tour, vé tham quan) do Nhà cung cấp đăng tải. Phê duyệt, từ chối, tạm ẩn hoặc xóa vi phạm.
          </p>
        </div>
      </div>

      {/* Notification Banner */}
      {notification && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between text-xs font-semibold animate-in fade-in ${
            notification.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : notification.type === "warning"
              ? "bg-rose-50 border-rose-200 text-rose-800"
              : "bg-amber-50 border-amber-200 text-amber-800"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {notification.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : notification.type === "warning" ? (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
          <button onClick={() => setNotification(null)} className="opacity-70 hover:opacity-100">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filter and Controls Toolbar (No Stats Cards) */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-2xs space-y-3.5">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-gray-100">
          <button
            onClick={() => setSelectedStatus("all")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedStatus === "all"
                ? "bg-[#075985] text-white shadow-2xs"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Tất cả bài đăng ({totalCount})
          </button>

          <button
            onClick={() => setSelectedStatus("pending")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              selectedStatus === "pending"
                ? "bg-amber-500 text-white shadow-2xs ring-2 ring-amber-300"
                : pendingCount > 0
                ? "bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <Clock className={`w-3.5 h-3.5 ${pendingCount > 0 ? "animate-pulse" : ""}`} />
            <span>Chờ phê duyệt</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                selectedStatus === "pending"
                  ? "bg-amber-700 text-white"
                  : pendingCount > 0
                  ? "bg-amber-500 text-white"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              {pendingCount}
            </span>
          </button>

          <button
            onClick={() => setSelectedStatus("approved")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              selectedStatus === "approved"
                ? "bg-emerald-600 text-white shadow-2xs"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>Đang hiển thị ({approvedCount})</span>
          </button>

          <button
            onClick={() => setSelectedStatus("hidden")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              selectedStatus === "hidden"
                ? "bg-gray-800 text-white shadow-2xs"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <EyeOff className="w-3.5 h-3.5 text-gray-400" />
            <span>Đã tạm ẩn ({hiddenCount})</span>
          </button>

          <button
            onClick={() => setSelectedStatus("rejected")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              selectedStatus === "rejected"
                ? "bg-rose-600 text-white shadow-2xs"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <X className="w-3.5 h-3.5 text-rose-500" />
            <span>Đã từ chối ({rejectedCount})</span>
          </button>
        </div>

        {/* Category Filter Row */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider shrink-0 mr-1">
            Danh mục:
          </span>
          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === "all"
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Tất cả ({services.length})
          </button>
          <button
            onClick={() => setSelectedCategory("hotel")}
            className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              selectedCategory === "hotel"
                ? "bg-[#075985] text-white shadow-2xs"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <Hotel className="w-3.5 h-3.5" />
            Lưu trú ({hotelCount})
          </button>
          <button
            onClick={() => setSelectedCategory("fnb")}
            className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              selectedCategory === "fnb" || selectedCategory === "restaurant"
                ? "bg-orange-600 text-white shadow-2xs"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <Utensils className="w-3.5 h-3.5" />
            Ẩm thực ({fnbCount})
          </button>
          <button
            onClick={() => setSelectedCategory("transportation")}
            className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              selectedCategory === "transportation"
                ? "bg-cyan-600 text-white shadow-2xs"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <Car className="w-3.5 h-3.5" />
            Vận chuyển ({transCount})
          </button>
          <button
            onClick={() => setSelectedCategory("attraction")}
            className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              selectedCategory === "attraction" || selectedCategory === "activity"
                ? "bg-teal-600 text-white shadow-2xs"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            Tham quan ({attrCount})
          </button>
        </div>

        {/* Search Bar & Result Counter */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-gray-100">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm theo tên dịch vụ, nhà cung cấp, địa chỉ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-[#075985] focus:bg-white transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="text-xs text-gray-500 font-medium">
            Hiển thị <strong className="text-gray-900">{filteredServices.length}</strong> / {services.length} bài đăng dịch vụ
          </div>
        </div>
      </div>

      {/* Main Table Interface */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/90 border-b border-gray-200 text-[11px] text-gray-500 font-bold uppercase tracking-wider">
                <th className="py-3.5 px-3 text-center w-12">#</th>
                <th className="py-3.5 px-4 min-w-[280px]">Dịch vụ &amp; Danh mục</th>
                <th className="py-3.5 px-4 min-w-[220px]">Nhà cung cấp / Điểm đến</th>
                <th className="py-3.5 px-4 min-w-[160px]">Khoảng giá</th>
                <th className="py-3.5 px-4 min-w-[150px]">Trạng thái</th>
                <th className="py-3.5 px-4 min-w-[220px] text-right pr-5">Thao tác xử lý</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {filteredServices.map((service, sIdx) => {
                const meta = getCategoryMeta(service.category);
                const CatIcon = meta.icon;
                const status = service.status || "approved";

                return (
                  <tr
                    key={service.id}
                    className={`hover:bg-blue-50/40 transition-colors ${
                      status === "pending"
                        ? "bg-amber-50/20"
                        : status === "hidden"
                        ? "bg-gray-50/50 opacity-85"
                        : status === "rejected"
                        ? "bg-rose-50/20"
                        : ""
                    }`}
                  >
                    {/* Index */}
                    <td className="py-3.5 px-3 text-center text-gray-400 font-mono text-[11px]">
                      {sIdx + 1}
                    </td>

                    {/* Service & Category */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div
                          onClick={() => setSelectedServiceDetailId(service.id)}
                          className="relative w-14 h-14 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 shrink-0 cursor-pointer shadow-2xs group"
                        >
                          <img
                            src={service.image}
                            alt={service.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                          {service.stars && (
                            <span className="absolute bottom-0.5 right-0.5 bg-black/75 text-amber-300 text-[9px] font-bold px-1 rounded flex items-center gap-0.5">
                              {service.stars}★
                            </span>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <h4
                            onClick={() => setSelectedServiceDetailId(service.id)}
                            className="font-bold text-gray-900 text-xs sm:text-sm hover:text-[#075985] cursor-pointer transition-colors truncate max-w-xs"
                            title={service.name}
                          >
                            {service.name}
                          </h4>

                          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                            <span
                              className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${meta.badgeColor}`}
                            >
                              <CatIcon className="w-3 h-3" />
                              {meta.shortLabel}
                            </span>
                            {service.subCategory && (
                              <span className="text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200">
                                {service.subCategory}
                              </span>
                            )}
                            {service.totalRooms && (
                              <span className="text-[10px] text-gray-500">
                                • {service.totalRooms} phòng
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Provider & Location */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-1">
                        <p className="font-semibold text-gray-900 text-xs flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <span className="truncate max-w-[180px]">{service.providerName}</span>
                        </p>
                        <p className="text-[11px] text-gray-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-red-500 shrink-0" />
                          <span className="truncate max-w-[180px]">
                            {service.province || service.location || "Toàn quốc"}
                            {service.ward ? `, ${service.ward}` : ""}
                          </span>
                        </p>
                      </div>
                    </td>

                    {/* Price Range */}
                    <td className="py-3.5 px-4">
                      <div>
                        <span className="font-bold text-xs text-[#075985] block">
                          {formatPriceSummary(service)}
                        </span>
                        <span className="text-[10px] text-gray-400 block mt-0.5">
                          / {getPriceUnit(service)}
                        </span>
                      </div>
                    </td>

                    {/* Approval Status */}
                    <td className="py-3.5 px-4">
                      {status === "pending" && (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-900 border border-amber-300 shadow-2xs">
                          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                          <span>Chờ phê duyệt</span>
                        </div>
                      )}

                      {status === "approved" && (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Đang hiển thị</span>
                        </div>
                      )}

                      {status === "hidden" && (
                        <div
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700 border border-gray-300 cursor-pointer"
                          onClick={() => setViewingReasonService(service)}
                          title="Bấm để xem lý do tạm ẩn"
                        >
                          <EyeOff className="w-3.5 h-3.5 text-gray-500" />
                          <span>Đã tạm ẩn</span>
                        </div>
                      )}

                      {status === "rejected" && (
                        <div
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-800 border border-rose-300 cursor-pointer"
                          onClick={() => setViewingReasonService(service)}
                          title="Bấm để xem lý do từ chối"
                        >
                          <X className="w-3.5 h-3.5 text-rose-600" />
                          <span>Đã từ chối</span>
                        </div>
                      )}
                    </td>

                    {/* Action Buttons */}
                    <td className="py-3.5 px-4 text-right pr-5">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* View Preview Button */}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedServiceDetailId(service.id)}
                          className="text-xs font-semibold text-[#075985] bg-blue-50/60 hover:bg-blue-100 border-blue-200 h-8 px-2.5 gap-1 shadow-2xs cursor-pointer"
                          title="Xem trước bài viết chi tiết & bản đồ"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Xem</span>
                        </Button>

                        {/* Actions for PENDING */}
                        {status === "pending" && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleApproveService(service)}
                              className="text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white h-8 px-2.5 gap-1 shadow-2xs cursor-pointer"
                              title="Phê duyệt bài đăng này lên sàn"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Duyệt</span>
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setRejectingService(service);
                                setRejectReason("");
                              }}
                              className="text-xs font-semibold text-rose-700 hover:bg-rose-50 border-rose-300 h-8 px-2 gap-1 cursor-pointer"
                              title="Từ chối phê duyệt bài đăng này"
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>Từ chối</span>
                            </Button>
                          </>
                        )}

                        {/* Actions for APPROVED */}
                        {status === "approved" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setHidingService(service);
                              setHideReason("");
                            }}
                            className="text-xs font-semibold text-amber-800 hover:bg-amber-50 border-amber-300 h-8 px-2.5 gap-1 cursor-pointer"
                            title="Tạm ẩn bài đăng nếu có sai lệch / vi phạm"
                          >
                            <EyeOff className="w-3.5 h-3.5" />
                            <span>Tạm ẩn</span>
                          </Button>
                        )}

                        {/* Actions for HIDDEN */}
                        {status === "hidden" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRestoreService(service)}
                            className="text-xs font-semibold text-emerald-700 hover:bg-emerald-50 border-emerald-300 h-8 px-2.5 gap-1 cursor-pointer"
                            title="Mở lại bài đăng để hiển thị công khai trên sàn"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Mở lại</span>
                          </Button>
                        )}

                        {/* Actions for REJECTED */}
                        {status === "rejected" && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setViewingReasonService(service)}
                              className="text-xs font-semibold text-rose-700 hover:bg-rose-50 border-rose-200 h-8 px-2"
                              title="Xem lý do từ chối"
                            >
                              <HelpCircle className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleApproveService(service)}
                              className="text-xs font-semibold text-emerald-700 hover:bg-emerald-50 border-emerald-300 h-8 px-2 gap-1 cursor-pointer"
                              title="Xem xét và duyệt lại bài đăng này"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Duyệt lại</span>
                            </Button>
                          </>
                        )}

                        {/* Delete Button */}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setDeletingService(service)}
                          className="h-8 w-8 p-0 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Xóa vĩnh viễn bài đăng này"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {/* Empty State */}
              {filteredServices.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center">
                    <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <h4 className="font-bold text-gray-800 text-sm">Không tìm thấy bài đăng dịch vụ nào</h4>
                    <p className="text-xs text-gray-500 max-w-md mx-auto mt-1">
                      Không có bài đăng nào phù hợp với bộ lọc danh mục, trạng thái hoặc từ khóa tìm kiếm.
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSearchQuery("");
                        setSelectedCategory("all");
                        setSelectedStatus("all");
                      }}
                      className="rounded-xl text-xs mt-3"
                    >
                      Đặt lại bộ lọc
                    </Button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: PREVIEW SERVICE BLOG (WITH ADMIN APPROVAL ACTION BAR) */}
      {/* ========================================================================= */}
      {previewModalService && (
        <ServiceBlogDetailModal
          service={previewModalService}
          isOpen={Boolean(previewModalService)}
          onClose={() => setPreviewModalService(null)}
          isAdmin={true}
          onApprove={(s) => handleApproveService(s)}
          onReject={(s) => {
            setRejectingService(s);
            setRejectReason("");
          }}
          onToggleHide={(s) => {
            if (s.status === "hidden") {
              handleRestoreService(s);
            } else {
              setHidingService(s);
              setHideReason("");
            }
          }}
        />
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: TỪ CHỐI BÀI ĐĂNG DỊCH VỤ (KÈM LÝ DO CHI TIẾT) */}
      {/* ========================================================================= */}
      <Dialog open={!!rejectingService} onOpenChange={() => setRejectingService(null)}>
        <DialogContent className="max-w-md rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-600" />
              Từ chối bài đăng dịch vụ
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500 mt-1">
              Bài đăng bị từ chối sẽ không được hiển thị trên sàn. Lý do từ chối sẽ được thông báo cụ thể cho Nhà cung cấp để chỉnh sửa.
            </DialogDescription>
          </DialogHeader>

          {rejectingService && (
            <div className="space-y-4 pt-2">
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs">
                <span className="text-gray-400 block mb-0.5">Dịch vụ đang xét duyệt:</span>
                <strong className="text-gray-900 font-bold block">{rejectingService.name}</strong>
                <span className="text-gray-500 text-[11px] mt-0.5 block">Nhà cung cấp: {rejectingService.providerName}</span>
              </div>

              {/* Quick suggestions */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-gray-600">Gợi ý lý do từ chối nhanh:</span>
                <div className="flex flex-wrap gap-1.5">
                  {quickRejectSuggestions.map((sug, sIdx) => (
                    <button
                      key={sIdx}
                      type="button"
                      onClick={() => setRejectReason(sug)}
                      className="px-2.5 py-1 rounded-lg text-[11px] bg-rose-50 hover:bg-rose-100 text-rose-900 border border-rose-200 transition-colors text-left"
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reason textarea */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700 block">
                  Lý do từ chối cụ thể (Gửi thông báo tới Nhà cung cấp):
                </label>
                <Textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Nhập lý do cụ thể (VD: Giá dịch vụ chưa hợp lý, hình ảnh không đúng thực tế, thiếu chính sách hủy...)"
                  rows={3}
                  className="text-xs rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setRejectingService(null)}
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
                  Xác nhận từ chối bài đăng
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* MODAL 3: TẠM ẨN BÀI ĐĂNG DỊCH VỤ (KÈM LÝ DO THÔNG TIN XÀM / SAI LỆCH) */}
      {/* ========================================================================= */}
      <Dialog open={!!hidingService} onOpenChange={() => setHidingService(null)}>
        <DialogContent className="max-w-md rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
              <EyeOff className="w-5 h-5 text-amber-600" />
              Tạm ẩn bài đăng dịch vụ
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500 mt-1">
              Bài đăng bị tạm ẩn sẽ không còn hiển thị cho các công ty lữ hành tra cứu. Bạn có thể mở lại bất cứ lúc nào.
            </DialogDescription>
          </DialogHeader>

          {hidingService && (
            <div className="space-y-4 pt-2">
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs">
                <span className="text-gray-400 block mb-0.5">Dịch vụ đang thao tác:</span>
                <strong className="text-gray-900 font-bold block">{hidingService.name}</strong>
                <span className="text-gray-500 text-[11px] mt-0.5 block">Nhà cung cấp: {hidingService.providerName}</span>
              </div>

              {/* Quick suggestions */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-gray-600">Gợi ý lý do nhanh:</span>
                <div className="flex flex-wrap gap-1.5">
                  {quickHideSuggestions.map((sug, sIdx) => (
                    <button
                      key={sIdx}
                      type="button"
                      onClick={() => setHideReason(sug)}
                      className="px-2.5 py-1 rounded-lg text-[11px] bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 transition-colors text-left"
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reason textarea */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700 block">
                  Lý do tạm ẩn cụ thể (Gửi thông báo / lưu vết hệ thống):
                </label>
                <Textarea
                  value={hideReason}
                  onChange={(e) => setHideReason(e.target.value)}
                  placeholder="Nhập lý do cụ thể (VD: Giá dịch vụ ảo, thông tin sai lệch so với thực tế...)"
                  rows={3}
                  className="text-xs rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setHidingService(null)}
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
                  Xác nhận tạm ẩn dịch vụ
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* MODAL 4: XEM LÝ DO TỪ CHỐI HOẶC TẠM ẨN */}
      {/* ========================================================================= */}
      <Dialog open={!!viewingReasonService} onOpenChange={() => setViewingReasonService(null)}>
        <DialogContent className="max-w-md rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-600" />
              Chi tiết trạng thái bài đăng
            </DialogTitle>
          </DialogHeader>

          {viewingReasonService && (
            <div className="space-y-3 pt-2 text-xs">
              <div>
                <span className="text-gray-400 block text-[11px]">Dịch vụ:</span>
                <strong className="text-gray-900 font-bold text-sm">{viewingReasonService.name}</strong>
                <span className="text-gray-500 block mt-0.5">Đối tác: {viewingReasonService.providerName}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 space-y-1.5">
                <span className="text-[11px] font-bold text-gray-600 uppercase tracking-wide block">
                  {viewingReasonService.status === "rejected" ? "Lý do từ chối:" : "Lý do tạm ẩn:"}
                </span>
                <p className="text-gray-800 leading-relaxed font-medium">
                  {viewingReasonService.rejectionReason || viewingReasonService.hiddenReason || "Chưa có thông tin lý do cụ thể."}
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setViewingReasonService(null)}
                  className="rounded-xl text-xs"
                >
                  Đóng
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => {
                    handleApproveService(viewingReasonService);
                    setViewingReasonService(null);
                  }}
                  className="rounded-xl text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                >
                  Phê duyệt lại bài đăng
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* MODAL 5: XÁC NHẬN XÓA BÀI ĐĂNG DỊCH VỤ */}
      {/* ========================================================================= */}
      <Dialog open={!!deletingService} onOpenChange={() => setDeletingService(null)}>
        <DialogContent className="max-w-md rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-red-600 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              Xác nhận xóa bài đăng dịch vụ
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500 mt-1">
              Hành động này sẽ xóa vĩnh viễn bài đăng dịch vụ khỏi hệ thống và không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>

          {deletingService && (
            <div className="space-y-4 pt-2">
              <p className="text-xs text-gray-700 leading-relaxed">
                Bạn có chắc chắn muốn xóa bài đăng{" "}
                <strong className="text-gray-900 font-bold">"{deletingService.name}"</strong> của đối tác{" "}
                <strong>{deletingService.providerName}</strong> không?
              </p>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setDeletingService(null)}
                  className="rounded-xl text-xs"
                >
                  Hủy bỏ
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  onClick={handleConfirmDelete}
                  className="rounded-xl text-xs font-semibold"
                >
                  Đồng ý xóa vĩnh viễn
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
