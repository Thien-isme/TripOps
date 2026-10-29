import { useState, useMemo } from "react";
import {
  BedDouble,
  Calendar,
  Users,
  Building2,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileText,
  Search,
  Sparkles,
  Check,
  X,
  Hotel,
  ShieldCheck,
  Tag,
  MessageSquare,
  ArrowRight,
  ListFilter,
  UserCheck,
} from "lucide-react";
import { ProviderGroupReservationRequest } from "@/app/types";
import { ProviderGroupRequestDetailPage } from "./ProviderGroupRequestDetailPage";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/app/components/ui/dialog";

interface ProviderGroupBookingRequestsProps {
  requests: ProviderGroupReservationRequest[];
  onApproveAndQuote: (
    requestId: string,
    quotedTotalPrice: number,
    providerNote: string
  ) => void;
  onRejectRequest: (requestId: string, rejectionReason: string) => void;
}

function formatVND(n: number) {
  return n.toLocaleString("vi-VN") + " ₫";
}

function formatDate(iso: string) {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

function numberToVietnameseWords(num: number): string {
  if (!num || isNaN(num) || num <= 0) return "";
  let n = Math.floor(num);
  if (n >= 1000000000) {
    const billions = Math.floor(n / 1000000000);
    const millions = Math.floor((n % 1000000000) / 1000000);
    return `${billions} tỷ ${millions > 0 ? millions + " triệu " : ""}đồng`;
  }
  if (n >= 1000000) {
    const millions = Math.floor(n / 1000000);
    const thousands = Math.floor((n % 1000000) / 1000);
    return `${millions} triệu ${thousands > 0 ? thousands + " nghìn " : ""}đồng`;
  }
  if (n >= 1000) {
    const thousands = Math.floor(n / 1000);
    return `${thousands} nghìn đồng`;
  }
  return `${n} đồng`;
}

export function ProviderGroupBookingRequests({
  requests,
  onApproveAndQuote,
  onRejectRequest,
}: ProviderGroupBookingRequestsProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "ALL" | "pending" | "confirmed" | "rejected"
  >("ALL");

  // State to manage dedicated standalone detail page
  const [viewingRequestId, setViewingRequestId] = useState<string | null>(null);

  // Quick modals for list actions
  const [approvingRequest, setApprovingRequest] =
    useState<ProviderGroupReservationRequest | null>(null);
  const [rejectingRequest, setRejectingRequest] =
    useState<ProviderGroupReservationRequest | null>(null);

  // Form states for Approval & Quoting
  const [quoteInputPrice, setQuoteInputPrice] = useState<string>("");
  const [providerNote, setProviderNote] = useState<string>("");
  const [quoteError, setQuoteError] = useState<string>("");

  // Form states for Rejection
  const [rejectionReason, setRejectionReason] = useState<string>("");
  const [rejectionError, setRejectionError] = useState<string>("");

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // KPI computations
  const stats = useMemo(() => {
    const total = requests.length;
    const pending = requests.filter((r) => r.status === "pending").length;
    const confirmed = requests.filter((r) => r.status === "confirmed").length;
    const rejected = requests.filter((r) => r.status === "rejected").length;
    const totalQuotedRevenue = requests
      .filter((r) => r.status === "confirmed" && r.quotedTotalPrice)
      .reduce((sum, r) => sum + (r.quotedTotalPrice || 0), 0);

    return { total, pending, confirmed, rejected, totalQuotedRevenue };
  }, [requests]);

  // Filtered requests list
  const filteredRequests = useMemo(() => {
    return requests.filter((r) => {
      const matchStatus =
        statusFilter === "ALL" ? true : r.status === statusFilter;
      const term = searchTerm.toLowerCase().trim();
      const matchSearch =
        !term ||
        r.bookingCode.toLowerCase().includes(term) ||
        r.tourName.toLowerCase().includes(term) ||
        r.agencyName.toLowerCase().includes(term) ||
        r.serviceName.toLowerCase().includes(term) ||
        (r.roomTypeRequested && r.roomTypeRequested.toLowerCase().includes(term));

      return matchStatus && matchSearch;
    });
  }, [requests, statusFilter, searchTerm]);

  // Open Approval modal
  const handleOpenApproveModal = (req: ProviderGroupReservationRequest) => {
    setApprovingRequest(req);
    setQuoteInputPrice(
      req.quotedTotalPrice ? req.quotedTotalPrice.toString() : ""
    );
    setProviderNote(
      req.providerNote ||
        "Khách sạn đã xem danh sách đoàn và bố trí phòng theo đúng nguyện vọng ghép phòng của khách. Giá trọn gói toàn đoàn đã gồm buffet sáng và thuế VAT."
    );
    setQuoteError("");
  };

  // Open Rejection modal
  const handleOpenRejectModal = (req: ProviderGroupReservationRequest) => {
    setRejectingRequest(req);
    setRejectionReason(req.rejectionReason || "");
    setRejectionError("");
  };

  // Submit Approval & Quotation
  const handleSubmitApproval = () => {
    if (!approvingRequest) return;
    const numPrice = Number(quoteInputPrice.replace(/\D/g, ""));
    if (!numPrice || numPrice <= 0) {
      setQuoteError("Vui lòng nhập giá tổng hợp lệ cho toàn bộ đoàn khách.");
      return;
    }

    onApproveAndQuote(approvingRequest.id, numPrice, providerNote.trim());
    showToast(
      `Đã phê duyệt và gửi báo giá ${formatVND(numPrice)} cho đoàn ${approvingRequest.agencyName} thành công!`
    );
    setApprovingRequest(null);
  };

  // Submit Rejection
  const handleSubmitRejection = () => {
    if (!rejectingRequest) return;
    if (!rejectionReason.trim()) {
      setRejectionError("Vui lòng nhập lý do từ chối để thông báo cho Agency.");
      return;
    }

    onRejectRequest(rejectingRequest.id, rejectionReason.trim());
    showToast(`Đã từ chối tiếp nhận yêu cầu từ ${rejectingRequest.agencyName}.`, "error");
    setRejectingRequest(null);
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/\D/g, "");
    setQuoteInputPrice(rawVal);
    if (quoteError) setQuoteError("");
  };

  const parsedQuotedPrice = Number(quoteInputPrice || "0");

  // =========================================================================
  // RENDER STANDALONE DETAIL PAGE IF A REQUEST IS SELECTED
  // =========================================================================
  if (viewingRequestId) {
    const currentRequest = requests.find((r) => r.id === viewingRequestId);
    if (currentRequest) {
      return (
        <ProviderGroupRequestDetailPage
          request={currentRequest}
          onBack={() => setViewingRequestId(null)}
          onApproveAndQuote={(reqId, price, note) => {
            onApproveAndQuote(reqId, price, note);
            showToast(`Đã phê duyệt và gửi báo giá ${formatVND(price)} thành công!`);
          }}
          onRejectRequest={(reqId, reason) => {
            onRejectRequest(reqId, reason);
            showToast(`Đã từ chối tiếp nhận yêu cầu.`, "error");
          }}
        />
      );
    }
  }

  // =========================================================================
  // MAIN LIST VIEW
  // =========================================================================
  return (
    <div className="space-y-6 font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-5 right-5 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl text-white text-sm font-semibold transition-all transform animate-in fade-in slide-in-from-bottom-3 ${
            toastMessage.type === "success"
              ? "bg-emerald-600 border border-emerald-500 shadow-emerald-500/20"
              : "bg-rose-600 border border-rose-500 shadow-rose-500/20"
          }`}
        >
          {toastMessage.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
          )}
          <span>{toastMessage.text}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="ml-2 hover:opacity-75"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200/90 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-gray-100/80 rounded-xl overflow-x-auto">
            <button
              onClick={() => setStatusFilter("ALL")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                statusFilter === "ALL"
                  ? "bg-white text-gray-900 shadow-xs"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Tất cả ({stats.total})
            </button>
            <button
              onClick={() => setStatusFilter("pending")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                statusFilter === "pending"
                  ? "bg-amber-500 text-white shadow-xs"
                  : "text-amber-800 hover:bg-amber-50"
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              Chờ báo giá ({stats.pending})
            </button>
            <button
              onClick={() => setStatusFilter("confirmed")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                statusFilter === "confirmed"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-emerald-700 hover:bg-emerald-50"
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Đã xác nhận ({stats.confirmed})
            </button>
            <button
              onClick={() => setStatusFilter("rejected")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                statusFilter === "rejected"
                  ? "bg-gray-700 text-white shadow-xs"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <XCircle className="w-3.5 h-3.5" />
              Đã từ chối ({stats.rejected})
            </button>
          </div>

          {/* Search Input */}
          <div className="relative min-w-[260px] md:w-80">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm mã đơn, tên Agency, tour, khách sạn..."
              className="pl-9 text-xs h-9 rounded-xl border-gray-200 focus:border-[#075985]"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Requests List */}
      {filteredRequests.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-gray-300 p-12 text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-sky-50 text-[#075985] flex items-center justify-center mx-auto">
            <BedDouble className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-gray-900">
            Không tìm thấy yêu cầu giữ phòng nào phù hợp
          </h3>
          <p className="text-xs text-gray-500 max-w-md mx-auto leading-relaxed">
            Các yêu cầu xác nhận và báo giá cho đoàn khách từ các Công ty lữ hành sẽ hiển thị tại đây.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((req) => {
            const isPending = req.status === "pending";
            const isConfirmed = req.status === "confirmed";
            const isRejected = req.status === "rejected";

            return (
              <div
                key={req.id}
                className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden shadow-xs hover:shadow-md ${
                  isPending
                    ? "border-amber-300/80 ring-1 ring-amber-100"
                    : isConfirmed
                    ? "border-emerald-300/80"
                    : "border-gray-200"
                }`}
              >
                {/* Request Card Header */}
                <div className="p-5 sm:p-6 bg-gradient-to-r from-gray-50/80 via-white to-gray-50/50 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex items-start sm:items-center gap-3">
                    {req.agencyLogo ? (
                      <img
                        src={req.agencyLogo}
                        alt={req.agencyName}
                        className="w-11 h-11 rounded-xl object-cover border border-gray-200 shadow-2xs flex-shrink-0"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#075985] to-[#0284C7] text-white flex items-center justify-center font-bold text-sm shadow-2xs flex-shrink-0">
                        {req.agencyName.slice(0, 2).toUpperCase()}
                      </div>
                    )}

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          onClick={() => setViewingRequestId(req.id)}
                          className="font-extrabold text-gray-900 text-sm sm:text-base hover:text-[#075985] transition-colors text-left"
                        >
                          {req.agencyName}
                        </button>
                        <span className="px-2 py-0.5 rounded-md bg-sky-100 text-[#075985] font-black text-[11px] border border-sky-200">
                          #{req.bookingCode}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 font-medium truncate mt-0.5">
                        Người đại diện:{" "}
                        <strong className="text-gray-700">
                          {req.agencyContactName}
                        </strong>{" "}
                        · SĐT: {req.agencyPhone}
                      </p>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {isPending && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-300 animate-pulse">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        Chờ duyệt & báo giá đoàn
                      </span>
                    )}
                    {isConfirmed && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Đã xác nhận giữ phòng
                      </span>
                    )}
                    {isRejected && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700 border border-gray-300">
                        <XCircle className="w-3.5 h-3.5 text-gray-500" />
                        Đã từ chối tiếp nhận
                      </span>
                    )}
                  </div>
                </div>

                {/* Request Card Body */}
                <div className="p-5 sm:p-6 space-y-4">
                  {/* Tour and Service Info */}
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-gray-100">
                    <div className="space-y-1">
                      <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                        Đoàn tour liên kết
                      </div>
                      <div className="text-sm sm:text-base font-extrabold text-gray-900 flex items-center gap-1.5">
                        <Tag className="w-4 h-4 text-[#F97316]" />
                        {req.tourName}
                      </div>
                    </div>

                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800">
                      <Hotel className="w-4 h-4 text-[#075985]" />
                      <span>{req.serviceName}</span>
                    </div>
                  </div>

                  {/* 2 Focused Specs: Time & Guests (REMOVED rigid room count as requested) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Spec 1: Dates & Nights */}
                    <div className="p-3.5 rounded-xl bg-sky-50/70 border border-sky-100 space-y-1">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-[#075985]">
                        <Calendar className="w-4 h-4 text-sky-600" />
                        <span>Thời gian lưu trú</span>
                      </div>
                      <div className="text-sm font-black text-gray-900">
                        {formatDate(req.checkInDate)} →{" "}
                        {formatDate(req.checkOutDate)}
                      </div>
                      <p className="text-[11px] text-[#075985] font-semibold">
                        Lưu trú: {req.numberOfNights} đêm
                      </p>
                    </div>

                    {/* Spec 2: Group size & Rooming roster link */}
                    <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-100 space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
                          <Users className="w-4 h-4 text-emerald-600" />
                          <span>Quy mô đoàn khách</span>
                        </div>
                        <button
                          onClick={() => setViewingRequestId(req.id)}
                          className="text-[11px] text-emerald-700 font-bold hover:underline flex items-center gap-0.5"
                        >
                          Xem danh sách đoàn →
                        </button>
                      </div>
                      <div className="text-sm font-black text-emerald-950">
                        {req.numberOfGuests} khách
                      </div>
                    </div>
                  </div>

                  {/* IF CONFIRMED: Highlighted Quoted Price Section */}
                  {isConfirmed && req.quotedTotalPrice && (
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-200 text-xs space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
                            Giá tổng đã báo cho toàn bộ đoàn khách:
                          </span>
                          <div className="text-2xl font-black text-emerald-700 mt-0.5">
                            {formatVND(req.quotedTotalPrice)}
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-900 text-xs font-bold">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                            Đã gửi báo giá tới Agency
                          </span>
                        </div>
                      </div>

                      {req.providerNote && (
                        <div className="pt-2 border-t border-emerald-200/60 text-emerald-950 text-xs">
                          <strong>Ghi chú điều kiện kèm theo:</strong>{" "}
                          <span className="text-gray-700">{req.providerNote}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* IF REJECTED: Show Rejection Reason */}
                  {isRejected && req.rejectionReason && (
                    <div className="p-3.5 rounded-xl bg-rose-50/70 border border-rose-200 text-xs text-rose-950 space-y-1">
                      <div className="font-bold flex items-center gap-1.5 text-rose-900">
                        <XCircle className="w-3.5 h-3.5 text-rose-600" />
                        <span>Lý do từ chối đã gửi cho Agency:</span>
                      </div>
                      <p className="text-gray-700 leading-relaxed">
                        {req.rejectionReason}
                      </p>
                    </div>
                  )}
                </div>

                {/* Request Card Actions */}
                <div className="p-4 sm:px-6 bg-gray-50/70 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="text-xs text-gray-500 font-medium">
                    Ngày gửi yêu cầu: {formatDate(req.createdAt)}
                    {req.respondedAt && (
                      <span className="ml-2 text-gray-600">
                        · Phản hồi: {formatDate(req.respondedAt)}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
                    {/* Standalone Detail Page Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setViewingRequestId(req.id)}
                      className="text-xs rounded-xl h-9 border-[#075985] text-[#075985] hover:bg-sky-50 font-bold gap-1.5"
                    >
                      <UserCheck className="w-4 h-4 text-[#075985]" />
                      Xem chi tiết & Danh sách đoàn
                    </Button>

                    {isPending && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenRejectModal(req)}
                          className="text-xs rounded-xl h-9 text-rose-700 border-rose-200 hover:bg-rose-50 font-bold"
                        >
                          <X className="w-3.5 h-3.5 mr-1 text-rose-600" />
                          Từ chối
                        </Button>

                        <Button
                          size="sm"
                          onClick={() => handleOpenApproveModal(req)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs rounded-xl h-9 font-extrabold shadow-sm shadow-emerald-600/30 gap-1.5"
                        >
                          <Check className="w-4 h-4" />
                          Phê duyệt & Báo giá đoàn
                        </Button>
                      </>
                    )}

                    {isConfirmed && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenApproveModal(req)}
                        className="text-xs rounded-xl h-9 text-emerald-800 border-emerald-300 hover:bg-emerald-50 font-bold"
                      >
                        Cập nhật lại báo giá
                      </Button>
                    )}

                    {isRejected && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenApproveModal(req)}
                        className="text-xs rounded-xl h-9 text-[#075985] border-sky-300 hover:bg-sky-50 font-bold"
                      >
                        Xem xét lại & Báo giá
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: Phê duyệt & Báo giá Tổng cho Đoàn (Approve & Quote Modal)        */}
      {/* ========================================================================= */}
      <Dialog
        open={Boolean(approvingRequest)}
        onOpenChange={(open) => !open && setApprovingRequest(null)}
      >
        <DialogContent className="max-w-xl p-0 overflow-hidden rounded-3xl border border-gray-100 shadow-2xl bg-white">
          {/* Elegant Clean Header */}
          <div className="p-6 pb-4 border-b border-gray-100 flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-sky-50 text-[#075985] flex items-center justify-center flex-shrink-0 border border-sky-100">
              <CheckCircle2 className="w-6 h-6 text-[#075985]" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-[#075985] uppercase tracking-wider">
                  Xác nhận giữ phòng & Báo giá trọn gói
                </span>
                <span className="px-2 py-0.5 rounded-md bg-sky-100 text-[#075985] font-black text-[11px] border border-sky-200">
                  #{approvingRequest?.bookingCode}
                </span>
              </div>
              <DialogTitle className="text-xl font-black text-gray-900 mt-1">
                Báo giá Tổng cho Toàn bộ Đoàn khách
              </DialogTitle>
              <DialogDescription className="text-gray-500 text-xs mt-0.5">
                Agency: <strong>{approvingRequest?.agencyName}</strong>
              </DialogDescription>
            </div>
          </div>

          <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
            {approvingRequest && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs space-y-2">
                <div className="font-extrabold text-slate-900 text-sm flex items-center justify-between">
                  <span>{approvingRequest.serviceName}</span>
                  <span className="text-[#075985] font-black">
                    {approvingRequest.numberOfGuests} khách · {approvingRequest.numberOfNights} đêm
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-slate-600 text-xs pt-1 border-t border-slate-200/60">
                  <div>
                    📅 Check-in:{" "}
                    <strong>{formatDate(approvingRequest.checkInDate)}</strong>
                  </div>
                  <div>
                    📅 Check-out:{" "}
                    <strong>{formatDate(approvingRequest.checkOutDate)}</strong>
                  </div>
                  <div>
                    👥 Đoàn khách:{" "}
                    <strong>{approvingRequest.numberOfGuests} khách</strong>
                  </div>
                  <div>
                    🌙 Lưu trú:{" "}
                    <strong>{approvingRequest.numberOfNights} đêm</strong>
                  </div>
                </div>
              </div>
            )}

            {/* MANDATORY INPUT: Quoted Total Price */}
            <div className="space-y-2">
              <Label className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                <span>Giá tổng cho toàn bộ đoàn khách (VNĐ)</span>
                <span className="text-rose-600">*</span>
              </Label>
              <div className="relative">
                <Input
                  type="text"
                  value={
                    quoteInputPrice
                      ? Number(quoteInputPrice).toLocaleString("vi-VN")
                      : ""
                  }
                  onChange={handlePriceChange}
                  placeholder="Ví dụ: 36.000.000"
                  className={`text-lg font-black pr-14 h-12 rounded-xl text-gray-900 bg-white border-gray-300 focus:border-[#075985] focus:ring-2 focus:ring-[#075985]/15 ${
                    quoteError ? "border-rose-500 bg-rose-50/20" : ""
                  }`}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 font-extrabold text-gray-500 text-sm">
                  VNĐ
                </span>
              </div>

              {parsedQuotedPrice > 0 ? (
                <div className="p-3 rounded-xl bg-sky-50/70 border border-sky-100 text-xs text-slate-700 flex items-center gap-2 animate-in fade-in">
                  <span className="font-bold text-[#075985]">Số tiền bằng chữ:</span>
                  <span className="font-black text-gray-900 capitalize">
                    {numberToVietnameseWords(parsedQuotedPrice)}
                  </span>
                </div>
              ) : null}

              {quoteError && (
                <p className="text-xs font-semibold text-rose-600 flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {quoteError}
                </p>
              )}
            </div>

            {/* Provider Notes & Condition presets */}
            <div className="space-y-2">
              <Label className="text-xs font-bold text-gray-700 flex items-center justify-between">
                <span>Ghi chú điều kiện & Dịch vụ kèm theo</span>
                <span className="text-[11px] text-gray-400 font-normal">
                  Gửi kèm bảng báo giá tới Agency
                </span>
              </Label>
              <Textarea
                rows={3}
                value={providerNote}
                onChange={(e) => setProviderNote(e.target.value)}
                placeholder="Ví dụ: Đã bố trí phòng theo đúng danh sách đoàn. Giá đã gồm buffet sáng, VAT và phụ thu nhận phòng sớm..."
                className="text-xs rounded-xl border-gray-300 focus:border-[#075985] focus:ring-2 focus:ring-[#075985]/15 resize-none leading-relaxed text-gray-900 bg-white"
              />

              <div className="space-y-1 pt-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase">
                  Thêm nhanh ghi chú mẫu:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    "+ Đã gồm buffet sáng",
                    "+ Đã bao gồm VAT 8%",
                    "+ Miễn phí nhận phòng sớm",
                    "+ Bố trí các phòng cùng tầng",
                    "+ Hạn đặt cọc 30% trước 7 ngày",
                  ].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() =>
                        setProviderNote((prev) =>
                          prev ? `${prev}. ${preset.replace("+ ", "")}` : preset.replace("+ ", "")
                        )
                      }
                      className="px-2.5 py-1 rounded-md bg-gray-100 hover:bg-sky-50 hover:text-[#075985] text-[11px] text-gray-600 border border-gray-200 font-medium transition-colors"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="p-5 pt-3 bg-gray-50/70 flex items-center justify-end gap-2 border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setApprovingRequest(null)}
              className="text-xs rounded-xl h-10 px-4 font-bold border-gray-200 hover:bg-gray-100"
            >
              Hủy bỏ
            </Button>
            <Button
              type="button"
              onClick={handleSubmitApproval}
              className="bg-[#075985] hover:bg-[#0369A1] text-white font-black text-xs rounded-xl h-10 px-5 shadow-sm shadow-[#075985]/20"
            >
              <Check className="w-4 h-4 mr-1.5" />
              Gửi Báo giá trọn gói cho Agency
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* MODAL 2: Từ chối yêu cầu (Reject Modal)                                   */}
      {/* ========================================================================= */}
      <Dialog
        open={Boolean(rejectingRequest)}
        onOpenChange={(open) => !open && setRejectingRequest(null)}
      >
        <DialogContent className="max-w-md p-0 overflow-hidden rounded-3xl border border-gray-100 shadow-2xl bg-white">
          {/* Elegant Clean Header */}
          <div className="p-6 pb-4 border-b border-gray-100 flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center flex-shrink-0 border border-rose-100">
              <XCircle className="w-6 h-6 text-rose-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-rose-600 uppercase tracking-wider">
                  Xác nhận từ chối tiếp nhận
                </span>
                <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 font-black text-[11px] border border-rose-200">
                  #{rejectingRequest?.bookingCode}
                </span>
              </div>
              <DialogTitle className="text-xl font-black text-gray-900 mt-1">
                Từ chối yêu cầu giữ phòng đoàn
              </DialogTitle>
              <DialogDescription className="text-gray-500 text-xs mt-0.5">
                Agency: <strong>{rejectingRequest?.agencyName}</strong>
              </DialogDescription>
            </div>
          </div>

          <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
            <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs text-amber-950 space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-amber-900">
                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span>Lưu ý quan trọng:</span>
              </div>
              <p className="leading-relaxed text-amber-900/90 pl-5 text-xs">
                Khi từ chối, yêu cầu này sẽ bị hủy bỏ và lý do sẽ được thông báo ngay đến Công ty lữ hành để họ kịp thời sắp xếp phương án khác.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-gray-700">
                Chọn lý do mẫu nhanh:
              </Label>
              <div className="space-y-1">
                {[
                  "Khách sạn đã kín phòng trong thời gian yêu cầu.",
                  "Không đủ cơ cấu phòng theo nguyện vọng của đoàn lớn.",
                  "Khách sạn đang trong giai đoạn bảo trì / nâng cấp dịch vụ.",
                  "Thời gian nhận/trả phòng không đáp ứng được lịch của đoàn.",
                ].map((reasonText) => (
                  <button
                    key={reasonText}
                    type="button"
                    onClick={() => setRejectionReason(reasonText)}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs border border-gray-200 hover:bg-rose-50 hover:border-rose-300 hover:text-rose-900 transition-colors"
                  >
                    {reasonText}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-gray-800 flex items-center gap-1">
                <span>Lý do chi tiết gửi Agency</span>
                <span className="text-rose-600">*</span>
              </Label>
              <Textarea
                rows={3}
                value={rejectionReason}
                onChange={(e) => {
                  setRejectionReason(e.target.value);
                  if (rejectionError) setRejectionError("");
                }}
                placeholder="Nhập lý do chi tiết..."
                className={`text-xs rounded-xl resize-none text-gray-900 bg-white border-gray-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/15 ${
                  rejectionError ? "border-rose-500 bg-rose-50/20" : ""
                }`}
              />
              {rejectionError && (
                <p className="text-xs font-semibold text-rose-600 flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {rejectionError}
                </p>
              )}
            </div>
          </div>

          <DialogFooter className="p-5 pt-3 bg-gray-50/70 flex items-center justify-end gap-2 border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setRejectingRequest(null)}
              className="text-xs rounded-xl h-10 px-4 font-bold border-gray-200 hover:bg-gray-100"
            >
              Hủy
            </Button>
            <Button
              type="button"
              onClick={handleSubmitRejection}
              className="bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded-xl h-10 px-5 shadow-sm shadow-rose-600/20"
            >
              <XCircle className="w-4 h-4 mr-1.5" />
              Xác nhận từ chối
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
