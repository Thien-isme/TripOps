import { useState, useMemo } from "react";
import {
  ArrowLeft,
  Calendar,
  Users,
  Building2,
  Phone,
  Mail,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileText,
  DollarSign,
  Search,
  Check,
  X,
  Hotel,
  ShieldCheck,
  Tag,
  MessageSquare,
  Bed,
  User as UserIcon,
  HelpCircle,
  ChevronRight,
  Info,
} from "lucide-react";
import { ProviderGroupReservationRequest, GroupGuestMember } from "@/app/types";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
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

interface ProviderGroupRequestDetailPageProps {
  request: ProviderGroupReservationRequest;
  onBack: () => void;
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

export function ProviderGroupRequestDetailPage({
  request,
  onBack,
  onApproveAndQuote,
  onRejectRequest,
}: ProviderGroupRequestDetailPageProps) {
  // Modal states
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);

  // Form states
  const [quoteInputPrice, setQuoteInputPrice] = useState<string>(
    request.quotedTotalPrice ? request.quotedTotalPrice.toString() : ""
  );
  const [providerNote, setProviderNote] = useState<string>(
    request.providerNote ||
      "Khách sạn đã xem danh sách đoàn và bố trí đủ phòng theo nguyện vọng ghép phòng của khách. Giá trọn gói toàn đoàn đã gồm buffet sáng và thuế VAT."
  );
  const [quoteError, setQuoteError] = useState<string>("");

  const [rejectionReason, setRejectionReason] = useState<string>(
    request.rejectionReason || ""
  );
  const [rejectionError, setRejectionError] = useState<string>("");

  // Passenger list search term
  const [guestSearchTerm, setGuestSearchTerm] = useState("");

  const passengersList = request.passengers || [];

  // Filter passengers based purely on search input (no arbitrary filter tabs)
  const filteredPassengers = useMemo(() => {
    return passengersList.filter((p) => {
      if (guestSearchTerm.trim()) {
        const term = guestSearchTerm.toLowerCase().trim();
        return (
          p.fullName.toLowerCase().includes(term) ||
          (p.identityCardNumber && p.identityCardNumber.toLowerCase().includes(term)) ||
          (p.roommateNote && p.roommateNote.toLowerCase().includes(term)) ||
          (p.note && p.note.toLowerCase().includes(term)) ||
          (p.tierName && p.tierName.toLowerCase().includes(term))
        );
      }
      return true;
    });
  }, [passengersList, guestSearchTerm]);

  // Submit Approval
  const handleSubmitApproval = () => {
    const numPrice = Number(quoteInputPrice.replace(/\D/g, ""));
    if (!numPrice || numPrice <= 0) {
      setQuoteError("Vui lòng nhập giá tổng hợp lệ cho toàn bộ đoàn khách.");
      return;
    }

    onApproveAndQuote(request.id, numPrice, providerNote.trim());
    setShowApproveModal(false);
  };

  // Submit Rejection
  const handleSubmitRejection = () => {
    if (!rejectionReason.trim()) {
      setRejectionError("Vui lòng nhập lý do từ chối để thông báo cho Agency.");
      return;
    }

    onRejectRequest(request.id, rejectionReason.trim());
    setShowRejectModal(false);
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/\D/g, "");
    setQuoteInputPrice(rawVal);
    if (quoteError) setQuoteError("");
  };

  const parsedQuotedPrice = Number(quoteInputPrice || "0");

  const isPending = request.status === "pending";
  const isConfirmed = request.status === "confirmed";
  const isRejected = request.status === "rejected";

  return (
    <div className="space-y-6 font-sans max-w-7xl mx-auto pb-16 animate-in fade-in duration-200">
      {/* Top Bar Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div className="space-y-2">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-[#075985] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại danh sách yêu cầu giữ phòng đoàn</span>
          </button>

          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-black text-gray-900">
              Chi tiết Yêu cầu Giữ phòng #{request.bookingCode}
            </h1>
            <span className="px-2.5 py-0.5 rounded-md bg-sky-100 text-[#075985] font-black text-xs border border-sky-200">
              {request.tourName}
            </span>
            {isPending && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-300">
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
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-800 border border-rose-300">
                <XCircle className="w-3.5 h-3.5 text-rose-600" />
                Đã từ chối tiếp nhận
              </span>
            )}
          </div>
        </div>

        {/* Action buttons on top */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {isPending && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setRejectionReason(request.rejectionReason || "");
                  setRejectionError("");
                  setShowRejectModal(true);
                }}
                className="text-xs rounded-xl h-10 text-rose-700 border-rose-200 hover:bg-rose-50 font-bold px-4"
              >
                <X className="w-4 h-4 mr-1 text-rose-600" />
                Từ chối tiếp nhận
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  setQuoteError("");
                  setShowApproveModal(true);
                }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl h-10 px-5 shadow-md shadow-emerald-600/20 gap-1.5"
              >
                <Check className="w-4 h-4" />
                Phê duyệt & Báo giá trọn gói
              </Button>
            </>
          )}

          {isConfirmed && (
            <Button
              size="sm"
              onClick={() => {
                setQuoteError("");
                setShowApproveModal(true);
              }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl h-10 px-4"
            >
              Cập nhật lại báo giá
            </Button>
          )}

          {isRejected && (
            <Button
              size="sm"
              onClick={() => {
                setQuoteError("");
                setShowApproveModal(true);
              }}
              className="bg-[#075985] hover:bg-[#0369A1] text-white font-black text-xs rounded-xl h-10 px-4"
            >
              Xem xét lại & Báo giá
            </Button>
          )}
        </div>
      </div>

      {/* 3 Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Agency Info */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
            <Building2 className="w-4 h-4 text-[#075985]" />
            <span>Công ty Lữ hành (Agency)</span>
          </div>

          <div className="flex items-start gap-3">
            {request.agencyLogo ? (
              <img
                src={request.agencyLogo}
                alt={request.agencyName}
                className="w-12 h-12 rounded-xl object-cover border border-gray-100 flex-shrink-0"
              />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-sky-50 text-[#075985] font-black text-base flex items-center justify-center flex-shrink-0">
                {request.agencyName.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div>
              <div className="font-extrabold text-sm text-gray-900 leading-snug">
                {request.agencyName}
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Người phụ trách: <strong>{request.agencyContactName}</strong>
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-gray-100 space-y-1.5 text-xs text-gray-600">
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-gray-400" />
              <span>{request.agencyPhone}</span>
            </div>
            {request.agencyEmail && (
              <div className="flex items-center gap-2 truncate">
                <Mail className="w-3.5 h-3.5 text-gray-400" />
                <span className="truncate">{request.agencyEmail}</span>
              </div>
            )}
          </div>
        </div>

        {/* Card 2: Stay & Group Specs */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
            <Hotel className="w-4 h-4 text-[#075985]" />
            <span>Lịch trình lưu trú & Quy mô</span>
          </div>

          <div className="space-y-2">
            <div className="font-extrabold text-sm text-gray-900">
              {request.serviceName}
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-sky-50/70 border border-sky-100">
                <div className="text-[10px] font-bold text-[#075985] uppercase">
                  Thời gian
                </div>
                <div className="font-black text-gray-900 mt-0.5">
                  {formatDate(request.checkInDate)} → {formatDate(request.checkOutDate)}
                </div>
                <div className="text-[11px] text-[#075985] font-bold">
                  {request.numberOfNights} đêm lưu trú
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-100">
                <div className="text-[10px] font-bold text-emerald-800 uppercase">
                  Tổng đoàn khách
                </div>
                <div className="font-black text-emerald-950 mt-0.5">
                  {request.numberOfGuests} khách
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Quotation Status */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
            <DollarSign className="w-4 h-4 text-emerald-600" />
            <span>Báo giá trọn gói cho toàn đoàn</span>
          </div>

          {isConfirmed && request.quotedTotalPrice ? (
            <div className="space-y-2">
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950">
                <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                  Tổng tiền đã báo cho Agency
                </div>
                <div className="text-xl sm:text-2xl font-black text-emerald-700 mt-0.5">
                  {formatVND(request.quotedTotalPrice)}
                </div>
                <div className="text-[11px] text-emerald-800 font-semibold italic mt-0.5">
                  ({numberToVietnameseWords(request.quotedTotalPrice)})
                </div>
              </div>
              {request.providerNote && (
                <p className="text-xs text-gray-600 italic">
                  "{request.providerNote}"
                </p>
              )}
            </div>
          ) : isRejected ? (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-950 space-y-1">
              <span className="font-bold block">Đã từ chối:</span>
              <p className="text-gray-700 italic">"{request.rejectionReason}"</p>
            </div>
          ) : (
            <div className="space-y-2 text-xs">
              <p className="text-gray-500 leading-relaxed">
                Chưa có báo giá. Hãy xem danh sách khách và ghi chú bên dưới để tự xếp phòng và bấm{" "}
                <strong className="text-emerald-700">"Phê duyệt & Báo giá"</strong>.
              </p>
              <Button
                size="sm"
                onClick={() => {
                  setQuoteError("");
                  setShowApproveModal(true);
                }}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl"
              >
                Nhập báo giá tổng ngay
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MAIN SECTION: Passenger Roster (Strictly from booking_participants table) */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-xs overflow-hidden space-y-4 p-5 sm:p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-sky-100 text-[#075985] flex items-center justify-center font-bold">
                <Users className="w-4 h-4" />
              </div>
              <h3 className="font-black text-base sm:text-lg text-gray-900">
                Danh sách Đoàn khách & Nguyện vọng Xếp phòng ({passengersList.length} thành viên)
              </h3>
            </div>
            <p className="text-xs text-gray-500 mt-1 pl-10">
              Khách sạn xem thông tin thành viên và ghi chú muốn ở cùng ai để tự phân bổ số lượng phòng phù hợp.
            </p>
          </div>

          {/* Quick guest stats badges */}
          <div className="flex items-center gap-2 flex-wrap pl-10 md:pl-0">
            <span className="px-3.5 py-1.5 rounded-xl bg-sky-50 text-[#075985] font-black text-xs border border-sky-100">
              Tổng: {request.numberOfGuests} khách
            </span>
          </div>
        </div>

        {/* Search bar inside passenger table (Removed redundant filter tabs as requested) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-100 text-slate-800 text-xs font-bold">
            <span>Tất cả thành viên trong đoàn</span>
            <span className="px-2 py-0.5 rounded-md bg-white text-gray-900 font-black shadow-2xs">
              {filteredPassengers.length} / {passengersList.length}
            </span>
          </div>

          <div className="relative min-w-[240px] sm:w-80">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              value={guestSearchTerm}
              onChange={(e) => setGuestSearchTerm(e.target.value)}
              placeholder="Tìm theo tên khách, CCCD, ghi chú ở cùng ai..."
              className="pl-8 text-xs h-8 rounded-xl border-gray-200 focus:border-[#075985]"
            />
            {guestSearchTerm && (
              <button
                onClick={() => setGuestSearchTerm("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Passengers Table - Fields strictly from booking_participants */}
        <div className="border border-gray-200 rounded-2xl overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/90 border-b border-gray-200 text-gray-600 font-extrabold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-3 text-center w-12">#</th>
                  <th className="py-3 px-4">Thành viên đoàn</th>
                  <th className="py-3 px-3">Đối tượng & Ngày sinh</th>
                  <th className="py-3 px-4">CCCD / Hộ chiếu</th>
                  <th className="py-3 px-4 min-w-[280px]">Ghi chú muốn ở cùng với ai (Xếp phòng)</th>
                  <th className="py-3 px-4">Ghi chú cá nhân</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredPassengers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-400">
                      Không tìm thấy thành viên nào phù hợp với từ khóa tìm kiếm.
                    </td>
                  </tr>
                ) : (
                  filteredPassengers.map((guest, idx) => {
                    const participantSTT = guest.participantIndex || idx + 1;
                    const genderLabel =
                      guest.gender === "FEMALE" || guest.gender === "female"
                        ? "Nữ"
                        : guest.gender === "MALE" || guest.gender === "male"
                        ? "Nam"
                        : "Khác";

                    const isChild =
                      guest.tierName?.toLowerCase().includes("trẻ") || false;

                    return (
                      <tr
                        key={guest.id || idx}
                        className="hover:bg-sky-50/40 transition-colors"
                      >
                        {/* STT: participant_index */}
                        <td className="py-3.5 px-3 text-center font-bold text-gray-500 text-xs">
                          {participantSTT}
                        </td>

                        {/* full_name & gender */}
                        <td className="py-3.5 px-4 font-bold text-gray-900">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-sky-100 to-indigo-100 text-[#075985] font-black text-xs flex items-center justify-center flex-shrink-0">
                              {guest.fullName.slice(0, 1).toUpperCase()}
                            </div>
                            <div>
                              <span className="font-extrabold block text-gray-900 text-xs">
                                {guest.fullName}
                              </span>
                              <span className="text-[10px] text-gray-500 font-medium">
                                Giới tính: <strong>{genderLabel}</strong>
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* tier_name & date_of_birth */}
                        <td className="py-3.5 px-3">
                          <div className="space-y-0.5">
                            <span
                              className={`px-2 py-0.5 rounded-md font-bold text-[10px] inline-block ${
                                isChild
                                  ? "bg-amber-100 text-amber-900"
                                  : "bg-slate-100 text-slate-800"
                              }`}
                            >
                              {guest.tierName || "Người lớn"}
                            </span>
                            {guest.dateOfBirth && (
                              <div className="text-[10px] text-gray-400 font-mono">
                                {formatDate(guest.dateOfBirth)}
                              </div>
                            )}
                          </div>
                        </td>

                        {/* identity_card_number */}
                        <td className="py-3.5 px-4 text-gray-700">
                          {guest.identityCardNumber ? (
                            <span className="font-mono text-[11px] font-semibold text-gray-800 bg-gray-50 px-2 py-1 rounded-md border border-gray-200">
                              {guest.identityCardNumber}
                            </span>
                          ) : (
                            <span className="text-gray-400 italic text-[11px]">
                              Chưa có CCCD (trẻ em)
                            </span>
                          )}
                        </td>

                        {/* roommate_note: Ghi chú muốn ở cùng với ai */}
                        <td className="py-3.5 px-4">
                          {guest.roommateNote ? (
                            <div className="p-2.5 rounded-xl text-xs font-semibold flex items-start gap-2 border bg-sky-50 text-sky-950 border-sky-200">
                              <Bed className="w-4 h-4 flex-shrink-0 mt-0.5 text-[#075985]" />
                              <span className="leading-relaxed">
                                {guest.roommateNote}
                              </span>
                            </div>
                          ) : (
                            <span className="text-gray-400 italic text-[11px]">
                              Khách sạn tự sắp xếp phòng
                            </span>
                          )}
                        </td>

                        {/* note: Ăn chay, dị ứng, say xe... */}
                        <td className="py-3.5 px-4 text-gray-600 text-[11px]">
                          {guest.note ? (
                            <span className="italic">{guest.note}</span>
                          ) : (
                            <span className="text-gray-300">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Floating Bottom Bar: Quick summary and Action Buttons */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-5 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky bottom-4 z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-50 text-[#075985] flex items-center justify-center font-bold flex-shrink-0">
            <Hotel className="w-5 h-5" />
          </div>
          <div>
            <div className="font-extrabold text-sm text-gray-900">
              Đoàn {request.numberOfGuests} khách · {request.numberOfNights} đêm tại {request.serviceName}
            </div>
            <div className="text-xs text-gray-500">
              {isConfirmed && request.quotedTotalPrice
                ? `Giá trọn gói đã xác nhận: ${formatVND(request.quotedTotalPrice)}`
                : "Xem thông tin thành viên và ghi chú trên để tự xếp phòng và đưa ra giá trọn gói cho toàn đoàn."}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isPending && (
            <>
              <Button
                variant="outline"
                onClick={() => {
                  setRejectionReason(request.rejectionReason || "");
                  setRejectionError("");
                  setShowRejectModal(true);
                }}
                className="text-xs rounded-xl h-10 text-rose-700 border-rose-200 hover:bg-rose-50 font-bold px-4"
              >
                Từ chối tiếp nhận
              </Button>
              <Button
                onClick={() => {
                  setQuoteError("");
                  setShowApproveModal(true);
                }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl h-10 px-5 shadow-md shadow-emerald-600/20"
              >
                <Check className="w-4 h-4 mr-1.5" />
                Phê duyệt & Báo giá trọn gói đoàn
              </Button>
            </>
          )}

          {isConfirmed && (
            <Button
              onClick={() => {
                setQuoteError("");
                setShowApproveModal(true);
              }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl h-10 px-5"
            >
              Cập nhật lại báo giá
            </Button>
          )}

          {isRejected && (
            <Button
              onClick={() => {
                setQuoteError("");
                setShowApproveModal(true);
              }}
              className="bg-[#075985] hover:bg-[#0369A1] text-white font-black text-xs rounded-xl h-10 px-5"
            >
              Xem xét lại & Báo giá
            </Button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: Phê duyệt & Báo giá Tổng cho Đoàn (Approve & Quote Modal)        */}
      {/* ========================================================================= */}
      <Dialog open={showApproveModal} onOpenChange={setShowApproveModal}>
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
                  #{request.bookingCode}
                </span>
              </div>
              <DialogTitle className="text-xl font-black text-gray-900 mt-1">
                Báo giá Tổng cho Toàn bộ Đoàn khách
              </DialogTitle>
              <DialogDescription className="text-gray-500 text-xs mt-0.5">
                Agency: <strong>{request.agencyName}</strong>
              </DialogDescription>
            </div>
          </div>

          <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
            {/* Quick summary strip */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs space-y-2">
              <div className="font-extrabold text-slate-900 text-sm flex items-center justify-between">
                <span>{request.serviceName}</span>
                <span className="text-[#075985] font-black">
                  {request.numberOfGuests} khách · {request.numberOfNights} đêm
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-slate-600 text-xs pt-1 border-t border-slate-200/60">
                <div>
                  📅 Check-in: <strong>{formatDate(request.checkInDate)}</strong>
                </div>
                <div>
                  📅 Check-out: <strong>{formatDate(request.checkOutDate)}</strong>
                </div>
                <div>
                  👥 Đoàn khách: <strong>{request.numberOfGuests} khách</strong>
                </div>
                <div>
                  🌙 Lưu trú: <strong>{request.numberOfNights} đêm</strong>
                </div>
              </div>
            </div>

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
                    quoteInputPrice ? Number(quoteInputPrice).toLocaleString("vi-VN") : ""
                  }
                  onChange={handlePriceChange}
                  placeholder="Ví dụ: 36.000.000"
                  className={`text-lg font-black pr-14 h-12 rounded-xl text-gray-900 bg-white border-gray-300 focus:border-[#075985] focus:ring-2 focus:ring-[#075985]/15 ${
                    quoteError ? "border-rose-500 bg-rose-50/20" : ""
                  }`}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 font-extrabold text-sm text-gray-500">
                  VNĐ
                </span>
              </div>

              {/* Number in words display */}
              {parsedQuotedPrice > 0 && (
                <div className="p-3 rounded-xl bg-sky-50/70 border border-sky-100 text-xs text-slate-700 flex items-center gap-2">
                  <span className="font-bold text-[#075985]">Số tiền bằng chữ:</span>
                  <span className="font-black text-gray-900 capitalize">
                    {numberToVietnameseWords(parsedQuotedPrice)}
                  </span>
                </div>
              )}

              {quoteError && (
                <p className="text-xs text-rose-600 font-semibold flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {quoteError}
                </p>
              )}
            </div>

            {/* Note & Conditions for Agency */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-gray-700">
                Ghi chú điều khoản / Chính sách kèm theo báo giá:
              </Label>
              <Textarea
                rows={3}
                value={providerNote}
                onChange={(e) => setProviderNote(e.target.value)}
                placeholder="Ghi chú về cơ cấu phòng đã xếp, buffet sáng, hỗ trợ check-in sớm, v.v..."
                className="text-xs rounded-xl border-gray-300 focus:border-[#075985] focus:ring-2 focus:ring-[#075985]/15 resize-none leading-relaxed text-gray-900 bg-white"
              />
            </div>
          </div>

          <DialogFooter className="p-5 pt-3 bg-gray-50/70 flex items-center justify-end gap-2 border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowApproveModal(false)}
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
      {/* MODAL 2: Từ chối tiếp nhận yêu cầu (Reject Modal)                         */}
      {/* ========================================================================= */}
      <Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
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
                  #{request.bookingCode}
                </span>
              </div>
              <DialogTitle className="text-xl font-black text-gray-900 mt-1">
                Từ chối yêu cầu giữ phòng đoàn
              </DialogTitle>
              <DialogDescription className="text-gray-500 text-xs mt-0.5">
                Đơn hàng: <strong>#{request.bookingCode}</strong> · {request.agencyName}
              </DialogDescription>
            </div>
          </div>

          <div className="p-6 space-y-4">
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
              <Label className="text-xs font-bold text-gray-800 flex items-center gap-1">
                <span>Lý do từ chối</span>
                <span className="text-rose-600">*</span>
              </Label>
              <Textarea
                rows={4}
                value={rejectionReason}
                onChange={(e) => {
                  setRejectionReason(e.target.value);
                  if (rejectionError) setRejectionError("");
                }}
                placeholder="Nhập lý do cụ thể (Ví dụ: Khách sạn đã kín phòng vào ngày lưu trú, không đủ phòng theo cơ cấu đoàn yêu cầu...)"
                className={`text-xs rounded-xl resize-none text-gray-900 bg-white border-gray-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/15 ${
                  rejectionError ? "border-rose-500 bg-rose-50/20" : ""
                }`}
              />
              {rejectionError && (
                <p className="text-xs text-rose-600 font-semibold flex items-center gap-1 mt-1">
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
              onClick={() => setShowRejectModal(false)}
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
