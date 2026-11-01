import { useState } from "react";
import { Service } from "@/app/types";
import {
  FileCheck,
  Search,
  CheckCircle2,
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
  AlertCircle,
  Eye,
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
import { AdminServiceDetailPage } from "./AdminServiceDetailPage";

interface AdminServiceApprovalProps {
  services: Service[];
  onApproveService: (serviceId: string) => void;
  onRejectService: (serviceId: string, reason: string) => void;
  onToggleHideService?: (serviceId: string, reason?: string) => void;
}

export function AdminServiceApproval({
  services,
  onApproveService,
  onRejectService,
  onToggleHideService,
}: AdminServiceApprovalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [reviewingServiceId, setReviewingServiceId] = useState<string | null>(null);

  // Reject Dialog state
  const [rejectingService, setRejectingService] = useState<Service | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [notification, setNotification] = useState<{ type: "success" | "warning"; message: string } | null>(null);

  // Quick suggestions for Rejecting
  const quickRejectSuggestions = [
    "Hình ảnh bài đăng mờ, chất lượng kém hoặc không đúng thực tế cơ sở.",
    "Bảng giá và phụ thu không rõ ràng hoặc có dấu hiệu bất hợp lý.",
    "Thiếu chính sách nhận/trả phòng và điều kiện hủy đổi dịch vụ.",
    "Thông tin địa chỉ hoặc giấy phép hoạt động chưa đầy đủ / chính xác.",
    "Nội dung mô tả sơ sài, sao chép hoặc chứa thông tin nhảm nhí.",
  ];

  // ONLY PENDING SERVICES ARE HANDLED IN THIS PAGE
  const pendingServices = services.filter((s) => s.status === "pending");

  // If Admin clicked to review, render the DEDICATED FULL PAGE
  if (reviewingServiceId) {
    const currentService = services.find((s) => s.id === reviewingServiceId);
    if (currentService) {
      return (
        <AdminServiceDetailPage
          service={currentService}
          onBack={() => setReviewingServiceId(null)}
          onApprove={(id) => {
            onApproveService(id);
            setNotification({
              type: "success",
              message: `Đã phê duyệt thành công dịch vụ "${currentService.name}"!`,
            });
            setReviewingServiceId(null);
            setTimeout(() => setNotification(null), 4000);
          }}
          onReject={(id, reason) => {
            onRejectService(id, reason);
            setNotification({
              type: "warning",
              message: `Đã từ chối bài đăng dịch vụ "${currentService.name}".`,
            });
            setReviewingServiceId(null);
            setTimeout(() => setNotification(null), 4000);
          }}
          onToggleHide={onToggleHideService}
        />
      );
    }
  }

  // Category counts of pending services
  const hotelPendingCount = pendingServices.filter((s) => s.category === "hotel").length;
  const fnbPendingCount = pendingServices.filter((s) => s.category === "fnb" || s.category === "restaurant").length;
  const transPendingCount = pendingServices.filter((s) => s.category === "transportation").length;
  const attrPendingCount = pendingServices.filter((s) => s.category === "attraction" || s.category === "activity").length;

  const filteredPending = pendingServices.filter((service) => {
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
          label: "Khách sạn",
          icon: Hotel,
          badgeColor: "bg-[#F0F9FF] text-[#075985] border-[#CBD5E1]",
        };
      case "fnb":
      case "restaurant":
        return {
          label: "Nhà hàng",
          icon: Utensils,
          badgeColor: "bg-orange-50 text-orange-700 border-orange-200",
        };
      case "transportation":
        return {
          label: "Xe tour",
          icon: Car,
          badgeColor: "bg-cyan-50 text-cyan-700 border-cyan-200",
        };
      case "attraction":
      case "activity":
      default:
        return {
          label: "Tham quan",
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

  const handleApprove = (service: Service) => {
    onApproveService(service.id);
    setNotification({
      type: "success",
      message: `Đã phê duyệt thành công dịch vụ "${service.name}". Dịch vụ đã xuất hiện trên sàn!`,
    });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleConfirmReject = () => {
    if (!rejectingService) return;
    const reason = rejectReason.trim() || "Nội dung bài đăng chưa đáp ứng tiêu chuẩn kiểm duyệt của nền tảng.";
    onRejectService(rejectingService.id, reason);
    setNotification({
      type: "warning",
      message: `Đã từ chối bài đăng "${rejectingService.name}". Lý do đã được gửi tới đối tác.`,
    });
    setRejectingService(null);
    setRejectReason("");
    setTimeout(() => setNotification(null), 4000);
  };

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2.5">
            <FileCheck className="w-7 h-7 text-amber-600" />
            Phê Duyệt Bài Đăng Dịch Vụ
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Chỉ hiển thị các dịch vụ mới do Nhà cung cấp đăng tải đang chờ phê duyệt. Xem xét kỹ nội dung, hình ảnh, mức giá và bản đồ trước khi đưa lên sàn.
          </p>
        </div>

        {/* Counter Badge */}
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-300 px-4 py-2 rounded-2xl shadow-2xs">
          <Clock className="w-5 h-5 text-amber-600 animate-pulse" />
          <div>
            <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">
              Đang chờ kiểm duyệt
            </span>
            <span className="text-base font-extrabold text-amber-950">
              {pendingServices.length} bài đăng dịch vụ
            </span>
          </div>
        </div>
      </div>

      {/* Notification Banner */}
      {notification && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between text-xs font-semibold animate-in fade-in ${
            notification.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-rose-50 border-rose-200 text-rose-800"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {notification.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
          <button onClick={() => setNotification(null)} className="opacity-70 hover:opacity-100">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-2xs space-y-3">
        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-gray-100">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider shrink-0 mr-1">
            Phân loại:
          </span>
          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedCategory === "all"
                ? "bg-[#075985] text-white shadow-2xs"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Tất cả cần duyệt ({pendingServices.length})
          </button>
          <button
            onClick={() => setSelectedCategory("hotel")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              selectedCategory === "hotel"
                ? "bg-[#075985] text-white shadow-2xs"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <Hotel className="w-3.5 h-3.5" />
            Khách sạn ({hotelPendingCount})
          </button>
          <button
            onClick={() => setSelectedCategory("fnb")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              selectedCategory === "fnb" || selectedCategory === "restaurant"
                ? "bg-orange-600 text-white shadow-2xs"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <Utensils className="w-3.5 h-3.5" />
            Ẩm thực ({fnbPendingCount})
          </button>
          <button
            onClick={() => setSelectedCategory("transportation")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              selectedCategory === "transportation"
                ? "bg-cyan-600 text-white shadow-2xs"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <Car className="w-3.5 h-3.5" />
            Xe tour ({transPendingCount})
          </button>
          <button
            onClick={() => setSelectedCategory("attraction")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              selectedCategory === "attraction" || selectedCategory === "activity"
                ? "bg-teal-600 text-white shadow-2xs"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            Tham quan ({attrPendingCount})
          </button>
        </div>

        {/* Search Row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên dịch vụ, nhà cung cấp, địa chỉ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all"
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
            Tìm thấy <strong className="text-amber-800 font-bold">{filteredPending.length}</strong> bài đăng chờ duyệt
          </div>
        </div>
      </div>

      {/* Main Table for Pending Services */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-amber-50/50 border-b border-gray-200 text-[11px] text-gray-600 font-bold uppercase tracking-wider">
                <th className="py-3.5 px-3 text-center w-12">#</th>
                <th className="py-3.5 px-4 min-w-[280px]">Dịch vụ &amp; Danh mục</th>
                <th className="py-3.5 px-4 min-w-[220px]">Nhà cung cấp / Điểm đến</th>
                <th className="py-3.5 px-4 min-w-[160px]">Khoảng giá đề xuất</th>
                <th className="py-3.5 px-4 min-w-[150px]">Trạng thái</th>
                <th className="py-3.5 px-4 min-w-[260px] text-right pr-5">Thao tác phê duyệt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {filteredPending.map((service, idx) => {
                const meta = getCategoryMeta(service.category);
                const CatIcon = meta.icon;

                return (
                  <tr
                    key={service.id}
                    className="hover:bg-amber-50/30 transition-colors bg-white group"
                  >
                    {/* Index */}
                    <td className="py-3.5 px-3 text-center text-gray-400 font-mono text-[11px]">
                      {idx + 1}
                    </td>

                    {/* Service & Category */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div
                          onClick={() => setReviewingServiceId(service.id)}
                          className="relative w-14 h-14 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 shrink-0 cursor-pointer shadow-2xs group"
                          title="Bấm để xem trang riêng chi tiết"
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
                            onClick={() => setReviewingServiceId(service.id)}
                            className="font-bold text-gray-900 text-xs sm:text-sm hover:text-amber-700 cursor-pointer transition-colors truncate max-w-xs"
                            title={service.name}
                          >
                            {service.name}
                          </h4>

                          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                            <span
                              className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${meta.badgeColor}`}
                            >
                              <CatIcon className="w-3 h-3" />
                              {meta.label}
                            </span>
                            {service.subCategory && (
                              <span className="text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200">
                                {service.subCategory}
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

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs">
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                        <span>Chờ phê duyệt</span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right pr-5">
                      <div className="flex items-center justify-end gap-2">
                        {/* Go to dedicated page */}
                        <Button
                          size="sm"
                          onClick={() => setReviewingServiceId(service.id)}
                          className="text-xs font-bold bg-[#075985] hover:bg-blue-800 text-white h-8 px-3 gap-1.5 rounded-xl shadow-2xs cursor-pointer"
                          title="Chuyển sang trang riêng để xem xét đầy đủ nội dung bài đăng"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Xem chi tiết</span>
                        </Button>

                        {/* Quick Approve */}
                        <Button
                          size="sm"
                          onClick={() => handleApprove(service)}
                          className="text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white h-8 px-2.5 gap-1 rounded-xl shadow-2xs cursor-pointer"
                          title="Phê duyệt nhanh bài đăng này"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Duyệt</span>
                        </Button>

                        {/* Quick Reject */}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setRejectingService(service);
                            setRejectReason("");
                          }}
                          className="text-xs font-semibold text-rose-700 hover:bg-rose-50 border-rose-300 h-8 px-2 gap-1 rounded-xl cursor-pointer"
                          title="Từ chối bài đăng này"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Từ chối</span>
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {/* Empty State */}
              {filteredPending.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3 shadow-xs border border-emerald-200">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <h4 className="font-bold text-gray-900 text-base">Tuyệt vời! Không có bài đăng nào cần phê duyệt</h4>
                    <p className="text-xs text-gray-500 max-w-md mx-auto mt-1 leading-relaxed">
                      Tất cả các dịch vụ mới gửi lên từ đối tác đã được xử lý xong. Khi có đối tác tạo dịch vụ mới, danh sách sẽ tự động xuất hiện tại đây.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reject Modal */}
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
                  placeholder="Nhập lý do cụ thể..."
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
    </div>
  );
}
