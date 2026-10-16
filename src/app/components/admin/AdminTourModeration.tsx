import { useState } from "react";
import { Tour } from "@/app/types";
import {
  FileCheck2,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  Calendar,
  Users,
  Eye,
  Building2,
  AlertTriangle,
  Search,
  Filter,
  ArrowRight,
  Star,
  Check,
  X,
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

interface AdminTourModerationProps {
  tours: Tour[];
  onApproveTour: (tourId: string) => void;
  onRejectTour: (tourId: string, reason: string) => void;
}

export function AdminTourModeration({
  tours,
  onApproveTour,
  onRejectTour,
}: AdminTourModerationProps) {
  const [filterStatus, setFilterStatus] = useState<string>("pending_approval");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTourForDetail, setSelectedTourForDetail] = useState<Tour | null>(null);
  const [rejectingTour, setRejectingTour] = useState<Tour | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Quick rejection templates
  const quickRejectionTemplates = [
    "Lịch trình chi tiết chưa rõ ràng về các điểm đón và thời gian di chuyển.",
    "Hình ảnh bài đăng tour có độ phân giải thấp hoặc chưa phù hợp với tiêu chuẩn sàn.",
    "Bảng giá tour và các điều khoản phụ thu chưa đầy đủ, dễ gây hiểu lầm cho khách hàng.",
    "Số lượng khách tối thiểu/tối đa chưa khớp với quy mô dịch vụ lưu trú và vận chuyển.",
  ];

  // Counts
  const pendingCount = tours.filter((t) => t.status === "pending_approval").length;
  const publishedCount = tours.filter((t) => t.status === "published" || (!t.status && t.tourType !== "custom_request")).length;
  const rejectedCount = tours.filter((t) => t.status === "rejected").length;
  const draftCount = tours.filter((t) => t.status === "draft" || t.status === "hidden").length;

  const filteredTours = tours.filter((tour) => {
    // Status filter
    const status = tour.status || "published";
    if (filterStatus === "pending_approval" && status !== "pending_approval") return false;
    if (filterStatus === "published" && status !== "published") return false;
    if (filterStatus === "rejected" && status !== "rejected") return false;
    if (filterStatus === "draft_hidden" && status !== "draft" && status !== "hidden") return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = tour.name.toLowerCase().includes(q);
      const matchCode = (tour.tourCode || "").toLowerCase().includes(q);
      const matchDest = tour.destination.toLowerCase().includes(q);
      const matchCompany = (tour.companyName || "").toLowerCase().includes(q);
      return matchName || matchCode || matchDest || matchCompany;
    }

    return true;
  });

  const handleApprove = (tour: Tour) => {
    onApproveTour(tour.id);
    setActionSuccess(`Đã phê duyệt và xuất bản tour "${tour.name}" thành công!`);
    setTimeout(() => setActionSuccess(null), 3500);
  };

  const handleConfirmReject = () => {
    if (!rejectingTour || !rejectionReason.trim()) return;
    onRejectTour(rejectingTour.id, rejectionReason.trim());
    setActionSuccess(`Đã từ chối tour "${rejectingTour.name}" kèm phản hồi cho công ty.`);
    setRejectingTour(null);
    setRejectionReason("");
    setTimeout(() => setActionSuccess(null), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Title & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <FileCheck2 className="w-6 h-6 text-blue-600" />
            Kiểm Duyệt & Phê Duyệt Tour Sàn
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Duyệt các gói tour du lịch do doanh nghiệp lữ hành gửi lên trước khi chính thức hiển thị cho khách hàng
          </p>
        </div>
      </div>

      {actionSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-3.5 flex items-center justify-between text-xs font-semibold animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess(null)} className="text-emerald-600 hover:text-emerald-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div
          onClick={() => setFilterStatus("pending_approval")}
          className={`cursor-pointer rounded-xl p-4 border transition-all ${
            filterStatus === "pending_approval"
              ? "bg-amber-50/70 border-amber-300 ring-2 ring-amber-400/30"
              : "bg-white border-gray-200 hover:border-amber-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-700 uppercase">Chờ duyệt</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-extrabold text-amber-600 mt-2">{pendingCount}</p>
          <p className="text-[11px] text-gray-400 mt-1">Cần Admin xử lý ngay</p>
        </div>

        <div
          onClick={() => setFilterStatus("published")}
          className={`cursor-pointer rounded-xl p-4 border transition-all ${
            filterStatus === "published"
              ? "bg-emerald-50/70 border-emerald-300 ring-2 ring-emerald-400/30"
              : "bg-white border-gray-200 hover:border-emerald-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-700 uppercase">Đã xuất bản</span>
            <CheckCircle className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-extrabold text-emerald-600 mt-2">{publishedCount}</p>
          <p className="text-[11px] text-gray-400 mt-1">Đang mở bán công khai</p>
        </div>

        <div
          onClick={() => setFilterStatus("rejected")}
          className={`cursor-pointer rounded-xl p-4 border transition-all ${
            filterStatus === "rejected"
              ? "bg-rose-50/70 border-rose-300 ring-2 ring-rose-400/30"
              : "bg-white border-gray-200 hover:border-rose-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-700 uppercase">Đã từ chối</span>
            <XCircle className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-2xl font-extrabold text-rose-600 mt-2">{rejectedCount}</p>
          <p className="text-[11px] text-gray-400 mt-1">Chờ công ty bổ sung</p>
        </div>

        <div
          onClick={() => setFilterStatus("all")}
          className={`cursor-pointer rounded-xl p-4 border transition-all ${
            filterStatus === "all"
              ? "bg-blue-50/70 border-blue-300 ring-2 ring-blue-400/30"
              : "bg-white border-gray-200 hover:border-blue-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-700 uppercase">Tất cả Tour</span>
            <Building2 className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-extrabold text-blue-600 mt-2">{tours.length}</p>
          <p className="text-[11px] text-gray-400 mt-1">Toàn sàn</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên tour, mã, điểm đến, công ty..."
            className="w-full text-xs pl-9 pr-3.5 py-2 rounded-lg border border-gray-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Status Tab buttons */}
        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          <button
            onClick={() => setFilterStatus("pending_approval")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              filterStatus === "pending_approval"
                ? "bg-amber-500 text-white shadow-xs"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Chờ duyệt ({pendingCount})
          </button>
          <button
            onClick={() => setFilterStatus("published")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              filterStatus === "published"
                ? "bg-emerald-600 text-white shadow-xs"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Đã xuất bản ({publishedCount})
          </button>
          <button
            onClick={() => setFilterStatus("rejected")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              filterStatus === "rejected"
                ? "bg-rose-600 text-white shadow-xs"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Từ chối ({rejectedCount})
          </button>
          <button
            onClick={() => setFilterStatus("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              filterStatus === "all"
                ? "bg-blue-600 text-white shadow-xs"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Tất cả ({tours.length})
          </button>
        </div>
      </div>

      {/* Tour List */}
      {filteredTours.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <CheckCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-gray-700">Không có tour nào trong trạng thái này</h3>
          <p className="text-xs text-gray-500 mt-1">Mọi yêu cầu kiểm duyệt tour đã được xử lý hoàn tất!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTours.map((tour) => {
            const status = tour.status || "published";
            const isPending = status === "pending_approval";
            const isPublished = status === "published";
            const isRejected = status === "rejected";

            return (
              <div
                key={tour.id}
                className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                {/* Left: Thumbnail & Info */}
                <div className="flex items-start gap-4 min-w-0">
                  <img
                    src={tour.image || (tour.images && tour.images[0]) || "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800"}
                    alt={tour.name}
                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl object-cover shrink-0 border border-gray-100"
                  />
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200">
                        {tour.tourCode || tour.id}
                      </span>
                      <span className="text-xs font-semibold text-gray-600 flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-gray-400" />
                        {tour.companyName || "Công ty lữ hành"}
                      </span>

                      {/* Status Badge */}
                      {isPending && (
                        <span className="bg-amber-100 text-amber-800 text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-600" />
                          Chờ phê duyệt
                        </span>
                      )}
                      {isPublished && (
                        <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle className="w-3 h-3 text-emerald-600" />
                          Đã xuất bản
                        </span>
                      )}
                      {isRejected && (
                        <span className="bg-rose-100 text-rose-800 text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                          <XCircle className="w-3 h-3 text-rose-600" />
                          Bị từ chối
                        </span>
                      )}
                    </div>

                    <h3 className="font-bold text-sm sm:text-base text-gray-900 leading-snug line-clamp-1">
                      {tour.name}
                    </h3>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-red-500" />
                        {tour.destination}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-blue-500" />
                        {tour.duration} ({tour.itinerary?.length || tour.numberOfDays || 0} ngày)
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-emerald-500" />
                        {tour.minGuests} – {tour.maxGuests} khách
                      </span>
                      <span className="font-extrabold text-blue-700 text-xs">
                        Giá từ: {tour.price.toLocaleString("vi-VN")}đ
                      </span>
                    </div>

                    {isRejected && tour.rejectionReason && (
                      <div className="mt-1 bg-rose-50 border border-rose-200 rounded-lg p-2 text-[11px] text-rose-800">
                        <span className="font-bold">Lý do từ chối:</span> {tour.rejectionReason}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 w-full md:w-auto justify-end border-t md:border-t-0 pt-3 md:pt-0 border-gray-100 shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedTourForDetail(tour)}
                    className="text-xs h-8 px-3"
                  >
                    <Eye className="w-3.5 h-3.5 mr-1" />
                    Xem chi tiết
                  </Button>

                  {isPending && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => handleApprove(tour)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8 px-3.5 flex items-center gap-1.5"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Phê duyệt
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          setRejectingTour(tour);
                          setRejectionReason("");
                        }}
                        className="text-xs h-8 px-3 flex items-center gap-1.5"
                      >
                        <X className="w-3.5 h-3.5" />
                        Từ chối
                      </Button>
                    </>
                  )}

                  {isPublished && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setRejectingTour(tour);
                        setRejectionReason("");
                      }}
                      className="text-xs text-rose-600 border-rose-200 hover:bg-rose-50 h-8 px-3"
                    >
                      Thu hồi / Tạm ngưng
                    </Button>
                  )}

                  {isRejected && (
                    <Button
                      size="sm"
                      onClick={() => handleApprove(tour)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8 px-3 flex items-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Duyệt lại
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reject Modal */}
      <Dialog open={!!rejectingTour} onOpenChange={(open) => !open && setRejectingTour(null)}>
        <DialogContent className="max-w-md p-6 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
              Từ chối phê duyệt tour
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500">
              Vui lòng nêu rõ lý do từ chối để công ty lữ hành chỉnh sửa và gửi duyệt lại.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div>
              <p className="text-xs font-bold text-gray-800 mb-1">
                Tour: <span className="text-blue-600 font-semibold">{rejectingTour?.name}</span>
              </p>
              <p className="text-[11px] text-gray-500">Công ty: {rejectingTour?.companyName}</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Lý do từ chối cụ thể
              </label>
              <Textarea
                rows={4}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Ví dụ: Hình ảnh chưa đúng chất lượng, lộ trình ngày 2 thiếu thông tin địa chỉ nhà hàng..."
                className="text-xs"
              />
            </div>

            {/* Quick Suggestions */}
            <div>
              <span className="text-[11px] font-bold text-gray-500 block mb-1">
                Gợi ý mẫu lý do thường gặp:
              </span>
              <div className="space-y-1">
                {quickRejectionTemplates.map((t, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setRejectionReason(t)}
                    className="w-full text-left text-[11px] text-gray-600 hover:text-blue-700 hover:bg-blue-50 p-1.5 rounded transition-colors"
                  >
                    • {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
              <Button size="sm" variant="outline" onClick={() => setRejectingTour(null)} className="text-xs">
                Hủy bỏ
              </Button>
              <Button
                size="sm"
                variant="destructive"
                disabled={!rejectionReason.trim()}
                onClick={handleConfirmReject}
                className="text-xs"
              >
                Xác nhận từ chối tour
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Detail Modal */}
      <Dialog open={!!selectedTourForDetail} onOpenChange={(open) => !open && setSelectedTourForDetail(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto p-6 rounded-2xl">
          {selectedTourForDetail && (
            <div className="space-y-5">
              <div className="flex items-start justify-between border-b border-gray-100 pb-3">
                <div>
                  <span className="text-xs font-mono font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                    {selectedTourForDetail.tourCode || selectedTourForDetail.id}
                  </span>
                  <h3 className="text-lg font-bold text-gray-900 mt-1">
                    {selectedTourForDetail.name}
                  </h3>
                  <p className="text-xs text-gray-500">
                    Đơn vị: {selectedTourForDetail.companyName} · Điểm đến: {selectedTourForDetail.destination}
                  </p>
                </div>
              </div>

              <img
                src={selectedTourForDetail.image}
                alt={selectedTourForDetail.name}
                className="w-full h-56 rounded-xl object-cover"
              />

              <div className="grid grid-cols-3 gap-3 text-center bg-gray-50 p-3 rounded-xl border border-gray-100 text-xs">
                <div>
                  <span className="text-gray-400 block text-[11px]">Thời lượng</span>
                  <span className="font-bold text-gray-800">{selectedTourForDetail.duration}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[11px]">Quy mô đoàn</span>
                  <span className="font-bold text-gray-800">
                    {selectedTourForDetail.minGuests} – {selectedTourForDetail.maxGuests} khách
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[11px]">Giá sàn từ</span>
                  <span className="font-extrabold text-blue-600">
                    {selectedTourForDetail.price.toLocaleString("vi-VN")}đ
                  </span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase text-gray-700 mb-1">Mô tả tour</h4>
                <p className="text-xs text-gray-600 leading-relaxed">
                  {selectedTourForDetail.description}
                </p>
              </div>

              {selectedTourForDetail.highlights && selectedTourForDetail.highlights.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase text-gray-700 mb-1.5">Điểm nhấn (Highlights)</h4>
                  <ul className="text-xs text-gray-600 space-y-1">
                    {selectedTourForDetail.highlights.map((h, i) => (
                      <li key={i} className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Itinerary Preview */}
              {selectedTourForDetail.itinerary && selectedTourForDetail.itinerary.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase text-gray-700 mb-2">
                    Lộ trình {selectedTourForDetail.itinerary.length} ngày
                  </h4>
                  <div className="space-y-2">
                    {selectedTourForDetail.itinerary.map((day) => (
                      <div key={day.day} className="bg-gray-50 p-3 rounded-lg border border-gray-100 text-xs">
                        <div className="font-bold text-gray-800 mb-1">{day.title}</div>
                        <p className="text-gray-500 mb-1.5 text-[11px]">{day.description}</p>
                        <div className="flex flex-wrap gap-1">
                          {day.locations.map((loc, l) => (
                            <span key={l} className="bg-white px-2 py-0.5 rounded border border-gray-200 text-[10px] text-gray-700">
                              📍 {loc.time || "08:30"}: {loc.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-gray-100 flex justify-end gap-2">
                <Button size="sm" variant="outline" onClick={() => setSelectedTourForDetail(null)} className="text-xs">
                  Đóng
                </Button>
                {selectedTourForDetail.status === "pending_approval" && (
                  <Button
                    size="sm"
                    onClick={() => {
                      handleApprove(selectedTourForDetail);
                      setSelectedTourForDetail(null);
                    }}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
                  >
                    Phê duyệt tour này
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
