import { useState } from "react";
import { CustomTourRequest, Tour, TourCompany, TourCoHost } from "@/app/types";
import { mockTourCompanies } from "@/app/data/mockData";
import {
  Clock,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  MapPin,
  Users,
  Calendar,
  MessageSquare,
  DollarSign,
  Building2,
  Sparkles,
  History,
  Eye,
  Edit,
  ArrowRight,
  ShieldAlert,
  Handshake,
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { TourFormPage } from "@/app/components/company/CompanyTourManagement";
import { TourVersionHistoryModal } from "@/app/components/company/TourVersionHistoryModal";
import { CoHostInvitationModal } from "@/app/components/company/CoHostInvitationModal";

interface CompanyCustomRequestsProps {
  requests: CustomTourRequest[];
  company: TourCompany;
  tours: Tour[];
  allCompanies?: TourCompany[];
  onUpdateRequest: (id: string, update: Partial<CustomTourRequest>) => void;
  onCreateTour: (tour: Omit<Tour, "id"> & { id?: string }) => void;
  onEditTour: (tourId: string, tour: Partial<Tour>) => void;
  onRestoreTourVersion?: (tourId: string, versionNumber: number) => void;
  onViewTour?: (tour: Tour) => void;
}

const STATUS_CONFIG: Record<CustomTourRequest["status"], { label: string; color: string }> = {
  pending: { label: "Chờ xử lý", color: "bg-amber-100 text-amber-800 border-amber-200" },
  reviewing: { label: "Đang xem xét", color: "bg-blue-100 text-blue-700 border-blue-200" },
  designed: { label: "Đã thiết kế Tour", color: "bg-purple-100 text-purple-700 border-purple-200" },
  quoted: { label: "Đã báo giá", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  accepted: { label: "Khách đồng ý", color: "bg-teal-100 text-teal-700 border-teal-200" },
  rejected: { label: "Từ chối", color: "bg-red-100 text-red-600 border-red-200" },
  cancelled: { label: "Đã huỷ", color: "bg-gray-100 text-gray-400 border-gray-200" },
};

function formatDate(iso: string) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("vi-VN");
}

function formatVND(n: number) {
  return n.toLocaleString("vi-VN") + " ₫";
}

export function CompanyCustomRequests({
  requests,
  company,
  tours,
  allCompanies,
  onUpdateRequest,
  onCreateTour,
  onEditTour,
  onRestoreTourVersion,
  onViewTour,
}: CompanyCustomRequestsProps) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [respondingId, setRespondingId] = useState<string | null>(null);
  const [responseForm, setResponseForm] = useState({
    note: "",
    quotedPrice: "",
    status: "reviewing" as CustomTourRequest["status"],
  });

  // State for Tour Design Form
  const [designingRequest, setDesigningRequest] = useState<CustomTourRequest | null>(null);
  const [editingCustomTour, setEditingCustomTour] = useState<Tour | null>(null);

  // State for Tour Version History Modal
  const [versionHistoryTour, setVersionHistoryTour] = useState<Tour | null>(null);

  // State for Co-Host Invitation Modal
  const [invitingRequest, setInvitingRequest] = useState<CustomTourRequest | null>(null);

  const handleSendCoHostInvitation = (invitation: {
    partnerCompanyId: string;
    partnerCompanyName: string;
    partnerCompanyLogo?: string;
    partnerCompanyPhone?: string;
    partnerCompanyEmail?: string;
    assignedSegments: string;
    assignedDays?: number[];
    revenueSharePercentage?: number;
    notes: string;
    estimatedBudgetPerGuest?: number;
    fixedPayoutAmount?: number;
  }) => {
    if (!invitingRequest) return;
    const sharePct = invitation.revenueSharePercentage || 50;
    const leadShare = 100 - sharePct;

    const leadCoHost: TourCoHost = {
      id: `cohost-lead-${Date.now()}`,
      companyId: company.id,
      companyName: company.name,
      companyLogo: company.logo,
      companyPhone: company.phone,
      companyEmail: company.email,
      role: "lead",
      status: "accepted",
      assignedSegments: `Đón tiếp đoàn & Điều hành tổng thể`,
      revenueSharePercentage: leadShare,
      quoteStatus: "draft",
      invitedAt: new Date().toISOString(),
      respondedAt: new Date().toISOString(),
    };

    const partnerCoHost: TourCoHost = {
      id: `cohost-partner-${Date.now()}`,
      companyId: invitation.partnerCompanyId,
      companyName: invitation.partnerCompanyName,
      companyLogo: invitation.partnerCompanyLogo,
      companyPhone: invitation.partnerCompanyPhone,
      companyEmail: invitation.partnerCompanyEmail,
      role: "partner",
      status: "pending",
      assignedSegments: invitation.assignedSegments,
      estimatedBudgetPerGuest: invitation.estimatedBudgetPerGuest,
      revenueSharePercentage: sharePct,
      quoteStatus: "draft",
      notes: invitation.notes,
      invitedAt: new Date().toISOString(),
    };

    const coHosts = [leadCoHost, partnerCoHost];

    onUpdateRequest(invitingRequest.id, {
      isCoHosted: true,
      coHosts,
      companyNote: `Đã gửi lời mời hợp tác cho ${invitation.partnerCompanyName} cùng thiết kế và báo giá chặng: ${invitation.assignedSegments}.`,
    });

    const matchingTour = tours.find(
      (t) => t.id === invitingRequest.designedTourId || t.customRequestId === invitingRequest.id
    );
    if (matchingTour) {
      onEditTour(matchingTour.id, {
        isCoHosted: true,
        coHosts,
      });
    }

    setInvitingRequest(null);
  };

  const openResponse = (req: CustomTourRequest) => {
    setRespondingId(req.id);
    setResponseForm({
      note: req.companyNote ?? "",
      quotedPrice: req.quotedPricePerPerson?.toString() ?? "",
      status: req.status === "pending" ? "reviewing" : req.status,
    });
  };

  const submitResponse = (id: string) => {
    onUpdateRequest(id, {
      status: responseForm.status,
      companyNote: responseForm.note || undefined,
      quotedPricePerPerson: responseForm.quotedPrice ? Number(responseForm.quotedPrice) : undefined,
      responseAt: new Date().toISOString(),
    });
    setRespondingId(null);
  };

  const handleStartDesignTour = (req: CustomTourRequest, existingTour?: Tour | null) => {
    setDesigningRequest(req);
    setEditingCustomTour(existingTour || null);
  };

  // If in tour designing mode, render the full standalone TourFormPage
  if (designingRequest) {
    return (
      <TourFormPage
        tour={editingCustomTour}
        company={company}
        customRequest={designingRequest}
        isCustomTour={true}
        onBack={() => {
          setDesigningRequest(null);
          setEditingCustomTour(null);
        }}
        onSubmit={(data) => {
          if (editingCustomTour) {
            onEditTour(editingCustomTour.id, data);
            onUpdateRequest(designingRequest.id, {
              status: "designed",
              currentVersion: data.version,
              companyNote: data.changeNote,
              quotedPricePerPerson: data.price,
              responseAt: new Date().toISOString(),
            });
          } else {
            const newTourId = `tour-custom-${Date.now().toString().slice(-6)}`;
            const newTourPayload: any = {
              ...data,
              id: newTourId,
              tourType: "custom_request",
              customRequestId: designingRequest.id,
              targetUserId: designingRequest.userId,
              targetCustomerName: designingRequest.contactName,
              targetCustomerPhone: designingRequest.contactPhone,
              targetCustomerEmail: designingRequest.contactEmail,
              version: 1,
              changeNote: data.changeNote || "Bản thiết kế ban đầu theo yêu cầu của khách hàng",
              versionHistory: [],
            };
            onCreateTour(newTourPayload);
            onUpdateRequest(designingRequest.id, {
              status: "designed",
              designedTourId: newTourId,
              currentVersion: 1,
              companyNote: data.changeNote || "Bản thiết kế ban đầu theo yêu cầu của khách hàng",
              quotedPricePerPerson: data.price,
              responseAt: new Date().toISOString(),
            });
          }
          setDesigningRequest(null);
          setEditingCustomTour(null);
        }}
      />
    );
  }

  const pending = requests.filter((r) => r.status === "pending" || r.status === "reviewing");
  const designed = requests.filter((r) => r.status === "designed" || r.status === "quoted" || r.status === "accepted");
  const others = requests.filter(
    (r) => r.status !== "pending" && r.status !== "reviewing" && r.status !== "designed" && r.status !== "quoted" && r.status !== "accepted"
  );

  if (requests.length === 0) {
    return (
      <div className="text-center py-16 space-y-3 bg-white rounded-xl border border-gray-200">
        <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mx-auto">
          <Sparkles className="w-8 h-8 text-purple-500" />
        </div>
        <p className="text-gray-700 font-semibold">Chưa có yêu cầu thiết kế tour nào</p>
        <p className="text-xs text-gray-500 max-w-sm mx-auto">
          Khi khách hàng có nhu cầu thiết kế tour riêng mà không chọn tour có sẵn, yêu cầu sẽ hiển thị tại đây để bạn tạo tour và gửi cho khách.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {(["pending", "reviewing", "designed", "quoted"] as const).map((s) => {
          const count = requests.filter((r) => r.status === s).length;
          const cfg = STATUS_CONFIG[s];
          return (
            <div key={s} className="bg-white border border-gray-200 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">{count}</p>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium border ${cfg.color}`}>
                {cfg.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* 1. Yêu cầu đang cần xử lý hoặc xem xét */}
      {pending.length > 0 && (
        <RequestGroup
          title="Yêu cầu chờ thiết kế & Xử lý"
          requests={pending}
          tours={tours}
          expanded={expanded}
          setExpanded={setExpanded}
          respondingId={respondingId}
          responseForm={responseForm}
          setResponseForm={setResponseForm}
          openResponse={openResponse}
          submitResponse={submitResponse}
          onCancel={() => setRespondingId(null)}
          onStartDesignTour={handleStartDesignTour}
          onViewTour={onViewTour}
          onOpenVersionHistory={(tour) => setVersionHistoryTour(tour)}
          onOpenInviteCoHost={(req) => setInvitingRequest(req)}
        />
      )}

      {/* 2. Yêu cầu đã thiết kế tour */}
      {designed.length > 0 && (
        <RequestGroup
          title="Tour đã thiết kế & Đang phục vụ khách"
          requests={designed}
          tours={tours}
          expanded={expanded}
          setExpanded={setExpanded}
          respondingId={respondingId}
          responseForm={responseForm}
          setResponseForm={setResponseForm}
          openResponse={openResponse}
          submitResponse={submitResponse}
          onCancel={() => setRespondingId(null)}
          onStartDesignTour={handleStartDesignTour}
          onViewTour={onViewTour}
          onOpenVersionHistory={(tour) => setVersionHistoryTour(tour)}
          onOpenInviteCoHost={(req) => setInvitingRequest(req)}
        />
      )}

      {/* 3. Khác */}
      {others.length > 0 && (
        <RequestGroup
          title="Yêu cầu đã kết thúc / Từ chối"
          requests={others}
          tours={tours}
          expanded={expanded}
          setExpanded={setExpanded}
          respondingId={respondingId}
          responseForm={responseForm}
          setResponseForm={setResponseForm}
          openResponse={openResponse}
          submitResponse={submitResponse}
          onCancel={() => setRespondingId(null)}
          onStartDesignTour={handleStartDesignTour}
          onViewTour={onViewTour}
          onOpenVersionHistory={(tour) => setVersionHistoryTour(tour)}
          onOpenInviteCoHost={(req) => setInvitingRequest(req)}
        />
      )}

      {/* Tour Version History Modal */}
      {versionHistoryTour && (
        <TourVersionHistoryModal
          isOpen={!!versionHistoryTour}
          onClose={() => setVersionHistoryTour(null)}
          tour={versionHistoryTour}
          onRestoreVersion={(verNum) => {
            if (onRestoreTourVersion) {
              onRestoreTourVersion(versionHistoryTour.id, verNum);
            }
            setVersionHistoryTour(null);
          }}
        />
      )}

      {/* Co-Host Invitation Modal */}
      {invitingRequest && (
        <CoHostInvitationModal
          open={Boolean(invitingRequest)}
          onClose={() => setInvitingRequest(null)}
          customRequest={invitingRequest}
          tour={tours.find(
            (t) => t.id === invitingRequest.designedTourId || t.customRequestId === invitingRequest.id
          )}
          currentCompany={company}
          availableCompanies={allCompanies || mockTourCompanies}
          onSendInvitation={handleSendCoHostInvitation}
        />
      )}
    </div>
  );
}

interface GroupProps {
  title: string;
  requests: CustomTourRequest[];
  tours: Tour[];
  expanded: string | null;
  setExpanded: (id: string | null) => void;
  respondingId: string | null;
  responseForm: { note: string; quotedPrice: string; status: CustomTourRequest["status"] };
  setResponseForm: React.Dispatch<React.SetStateAction<{ note: string; quotedPrice: string; status: CustomTourRequest["status"] }>>;
  openResponse: (req: CustomTourRequest) => void;
  submitResponse: (id: string) => void;
  onCancel: () => void;
  onStartDesignTour: (req: CustomTourRequest, existingTour?: Tour | null) => void;
  onViewTour?: (tour: Tour) => void;
  onOpenVersionHistory?: (tour: Tour) => void;
  onOpenInviteCoHost: (req: CustomTourRequest) => void;
}

function RequestGroup({
  title,
  requests,
  tours,
  expanded,
  setExpanded,
  respondingId,
  responseForm,
  setResponseForm,
  openResponse,
  submitResponse,
  onCancel,
  onStartDesignTour,
  onViewTour,
  onOpenVersionHistory,
  onOpenInviteCoHost,
}: GroupProps) {
  return (
    <div>
      <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
        <span>{title}</span>
        <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full font-semibold">
          {requests.length}
        </span>
      </h4>

      <div className="space-y-3">
        {requests.map((req) => {
          const cfg = STATUS_CONFIG[req.status] || STATUS_CONFIG.pending;
          const isExp = expanded === req.id;
          const isResponding = respondingId === req.id;

          // Find associated tour
          const matchingTour = tours.find(
            (t) => t.id === req.designedTourId || t.customRequestId === req.id
          );

          return (
            <div
              key={req.id}
              className={`bg-white border rounded-xl overflow-hidden shadow-sm transition-all ${
                matchingTour ? "border-purple-200 ring-1 ring-purple-100" : "border-gray-200"
              }`}
            >
              {/* Header row */}
              <div
                className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setExpanded(isExp ? null : req.id)}
              >
                <div
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold flex-shrink-0 border ${cfg.color}`}
                >
                  {req.status === "pending" ? (
                    <Clock className="w-3.5 h-3.5" />
                  ) : req.status === "designed" ? (
                    <Sparkles className="w-3.5 h-3.5" />
                  ) : req.status === "rejected" ? (
                    <XCircle className="w-3.5 h-3.5" />
                  ) : (
                    <CheckCircle className="w-3.5 h-3.5" />
                  )}
                  {cfg.label}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-gray-900 text-sm truncate">{req.destinations}</p>
                    {matchingTour && (
                      <span className="bg-purple-100 text-purple-800 text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <span>v{matchingTour.version || req.currentVersion || 1}</span>
                      </span>
                    )}
                    {req.isCoHosted && (
                      <span className="bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-800 border border-purple-200 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
                        <Handshake className="w-3 h-3 text-purple-600" />
                        Liên minh đối tác
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-500 flex-wrap">
                    <span className="flex items-center gap-1 font-medium text-gray-700">
                      <Users className="w-3 h-3 text-gray-400" />
                      {req.contactName} ({req.contactPhone})
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-gray-400" />
                      {formatDate(req.departureDate)} – {formatDate(req.returnDate)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3 text-gray-400" />
                      {req.numberOfPeople} người
                    </span>
                    {req.businessName && (
                      <span className="flex items-center gap-1 text-blue-600">
                        <Building2 className="w-3 h-3" />
                        {req.businessName}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  {(req.quotedPricePerPerson || matchingTour?.price) && (
                    <div className="text-right">
                      <p className="text-[11px] text-gray-400">Giá tour / khách</p>
                      <p className="text-sm font-extrabold text-emerald-600">
                        {formatVND(matchingTour?.price ?? req.quotedPricePerPerson ?? 0)}
                      </p>
                    </div>
                  )}
                  {isExp ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </div>
              </div>

              {/* Expanded details */}
              {isExp && (
                <div className="border-t border-gray-100 px-5 py-4 space-y-4 bg-gray-50/50">
                  {/* DESIGNED TOUR HIGHLIGHT CARD */}
                  {matchingTour ? (
                    <div className="bg-gradient-to-r from-purple-50 via-indigo-50 to-purple-50 border border-purple-200 rounded-xl p-4.5 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="bg-purple-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-full uppercase">
                              Tour Thiết Kế Riêng
                            </span>
                            <span className="bg-purple-200 text-purple-900 text-xs font-bold px-2 py-0.5 rounded font-mono">
                              Phiên bản v{matchingTour.version || 1}
                            </span>
                            <span className="text-xs text-purple-700 font-semibold">
                              Mã tour: {matchingTour.tourCode}
                            </span>
                          </div>
                          <h4 className="font-bold text-gray-900 text-base mt-1.5">
                            {matchingTour.name}
                          </h4>
                          <p className="text-xs text-gray-600 mt-0.5">
                            {matchingTour.duration} · Điểm đến: {matchingTour.destination} · {matchingTour.itinerary?.length || 0} ngày lịch trình · Giá:{" "}
                            <strong className="text-emerald-700">{formatVND(matchingTour.price)}/khách</strong>
                          </p>
                        </div>

                        {/* Actions for Designed Tour */}
                        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                          {onViewTour && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => onViewTour(matchingTour)}
                              className="text-purple-700 border-purple-300 hover:bg-purple-100 gap-1.5 text-xs font-semibold"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              Xem Tour
                            </Button>
                          )}
                          <Button
                            size="sm"
                            onClick={() => onStartDesignTour(req, matchingTour)}
                            className="bg-purple-600 hover:bg-purple-700 text-white gap-1.5 text-xs font-semibold shadow-xs"
                          >
                            <Edit className="w-3.5 h-3.5" />
                            Chỉnh sửa / Tạo v{(matchingTour.version || 1) + 1}
                          </Button>
                          {onOpenVersionHistory && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => onOpenVersionHistory(matchingTour)}
                              className="text-gray-700 border-gray-300 hover:bg-gray-100 gap-1.5 text-xs"
                              title="Xem lịch sử thay đổi và phục hồi phiên bản trước"
                            >
                              <History className="w-3.5 h-3.5 text-purple-600" />
                              Lịch sử ({matchingTour.versionHistory?.length || 0})
                            </Button>
                          )}
                        </div>
                      </div>

                      {matchingTour.changeNote && (
                        <div className="bg-white/80 rounded-lg p-2.5 border border-purple-100 text-xs text-purple-900">
                          <span className="font-bold text-purple-950">Ghi chú phiên bản v{matchingTour.version || 1}:</span>{" "}
                          <span>{matchingTour.changeNote}</span>
                        </div>
                      )}

                      <div className="flex items-center gap-2 text-xs text-gray-500 pt-1 border-t border-purple-100">
                        <ShieldAlert className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                        <span>
                          Khách hàng chỉ có quyền xem tour này và đặt chỗ. Nếu khách muốn sửa lịch trình, họ sẽ liên hệ để bạn tạo version mới.
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4 text-amber-600" />
                          Chưa thiết kế tour cho yêu cầu này
                        </p>
                        <p className="text-xs text-amber-700 mt-1">
                          Sử dụng công cụ thiết kế tour đầy đủ của hệ thống để lên lộ trình, chỗ ở, bữa ăn và bảng giá riêng cho khách hàng này.
                        </p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => onStartDesignTour(req, null)}
                        className="bg-purple-600 hover:bg-purple-700 text-white font-bold gap-1.5 shadow-sm whitespace-nowrap"
                      >
                        <Sparkles className="w-4 h-4" />
                        Thiết kế Tour cho khách này
                      </Button>
                    </div>
                  )}

                  {/* CO-HOSTING DETAILS CARD */}
                  {req.isCoHosted && req.coHosts && req.coHosts.length > 0 && (
                    <div className="bg-gradient-to-r from-purple-50 via-indigo-50/40 to-blue-50 border border-purple-200 rounded-xl p-4 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="bg-purple-600 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1.5 uppercase">
                            <Handshake className="w-3.5 h-3.5 text-amber-300" />
                            Liên minh hợp tác dẫn tour (Co-Hosting)
                          </span>
                          <span className="text-xs font-bold">
                            {req.coHosts.find((c) => c.role === "partner")?.status === "accepted" ? (
                              <span className="text-emerald-700 flex items-center gap-1">
                                <CheckCircle className="w-3.5 h-3.5" /> Đối tác đã nhận lời
                              </span>
                            ) : (
                              <span className="text-amber-700 flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" /> Chờ đối tác phản hồi
                              </span>
                            )}
                          </span>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onOpenInviteCoHost(req)}
                          className="text-purple-700 border-purple-300 hover:bg-purple-100 text-xs h-7 self-start sm:self-auto font-semibold"
                        >
                          Cập nhật phân công / Mời lại
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        {req.coHosts.map((ch) => (
                          <div
                            key={ch.id}
                            className="bg-white rounded-lg p-3 border border-purple-100 shadow-2xs space-y-1.5"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-gray-900 flex items-center gap-1.5">
                                {ch.companyLogo && (
                                  <img
                                    src={ch.companyLogo}
                                    alt=""
                                    className="w-5 h-5 rounded object-cover"
                                  />
                                )}
                                {ch.companyName}
                              </span>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                  ch.role === "lead"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-purple-100 text-purple-800"
                                }`}
                              >
                                {ch.role === "lead" ? "Chủ trì" : "Đối tác"} {ch.status === "accepted" ? "· Đã xác nhận" : "· Chờ xác nhận"}
                              </span>
                            </div>
                            <p className="text-[11px] text-gray-700">
                              <strong>Phụ trách:</strong> {ch.assignedSegments || "Điều phối lịch trình"}
                            </p>
                            {ch.estimatedBudgetPerGuest && (
                              <p className="text-[10px] text-emerald-700 font-semibold">
                                Ngân sách dự kiến: ~{formatVND(ch.estimatedBudgetPerGuest)} / khách
                              </p>
                            )}
                          </div>
                        ))}
                      </div>

                      <p className="text-[11px] text-gray-500 italic">
                        * Tiền tour được bảo chứng qua Tài khoản Ký quỹ (Escrow) của Hệ thống sàn du lịch, đảm bảo an toàn tuyệt đối cho khách hàng và quyết toán minh bạch cho cả 2 công ty.
                      </p>
                    </div>
                  )}

                  {/* Customer specifications info */}
                  <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <p className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">
                      Chi tiết yêu cầu của khách
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                      <InfoRow label="Điểm đến mong muốn" value={req.destinations} />
                      <InfoRow label="Ngày đi" value={formatDate(req.departureDate)} />
                      <InfoRow label="Ngày về" value={formatDate(req.returnDate)} />
                      <InfoRow label="Số lượng khách" value={`${req.numberOfPeople} người`} />
                      {req.budgetPerPerson && (
                        <InfoRow
                          label="Ngân sách dự kiến"
                          value={`${Number(req.budgetPerPerson).toLocaleString("vi-VN")} ₫ / người`}
                        />
                      )}
                      {req.hotelStars && <InfoRow label="Hạng khách sạn" value={`${req.hotelStars} sao`} />}
                      {req.businessName && <InfoRow label="Doanh nghiệp / Đoàn thể" value={req.businessName} />}
                      <InfoRow label="Người liên hệ" value={req.contactName} />
                      <InfoRow label="Số điện thoại" value={req.contactPhone} />
                      <InfoRow label="Email" value={req.contactEmail} />
                      <InfoRow label="Ngày gửi yêu cầu" value={formatDate(req.createdAt)} />
                    </div>

                    {req.additionalInfo && (
                      <div className="mt-3 bg-gray-50 border border-gray-200 rounded-lg p-3">
                        <p className="text-xs font-semibold text-gray-500 mb-1">
                          Ghi chú / Yêu cầu đặc biệt từ khách hàng:
                        </p>
                        <p className="text-sm text-gray-800 italic">"{req.additionalInfo}"</p>
                      </div>
                    )}
                  </div>

                  {/* Previous response note */}
                  {req.companyNote && !isResponding && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-xs font-bold text-blue-700 mb-1 flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5" /> Phản hồi / Báo giá gửi khách
                      </p>
                      <p className="text-sm text-blue-800">{req.companyNote}</p>
                      {req.quotedPricePerPerson && (
                        <p className="text-sm font-bold text-emerald-700 mt-1">
                          Báo giá: {formatVND(req.quotedPricePerPerson)} / người
                        </p>
                      )}
                    </div>
                  )}

                  {/* Response form */}
                  {isResponding ? (
                    <div className="bg-white border border-blue-300 rounded-xl p-4 space-y-3">
                      <p className="text-sm font-bold text-gray-800 flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-blue-600" />
                        Gửi phản hồi / Cập nhật trạng thái
                      </p>
                      <div>
                        <label className="text-xs font-medium text-gray-600 block mb-1">Trạng thái yêu cầu</label>
                        <select
                          value={responseForm.status}
                          onChange={(e) => setResponseForm((p) => ({ ...p, status: e.target.value as any }))}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                        >
                          <option value="reviewing">Đang xem xét</option>
                          <option value="designed">Đã thiết kế Tour</option>
                          <option value="quoted">Đã báo giá</option>
                          <option value="accepted">Đồng ý nhận tour</option>
                          <option value="rejected">Từ chối yêu cầu</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-600 block mb-1">
                          <DollarSign className="w-3 h-3 inline mr-1" />
                          Báo giá dự kiến / người (₫)
                        </label>
                        <input
                          type="number"
                          value={responseForm.quotedPrice}
                          onChange={(e) => setResponseForm((p) => ({ ...p, quotedPrice: e.target.value }))}
                          placeholder="VD: 5000000"
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-600 block mb-1">
                          <MessageSquare className="w-3 h-3 inline mr-1" />
                          Ghi chú gửi khách hàng
                        </label>
                        <textarea
                          value={responseForm.note}
                          onChange={(e) => setResponseForm((p) => ({ ...p, note: e.target.value }))}
                          placeholder="Nhập nội dung trao đổi, tư vấn hoặc hướng dẫn khách xem tour..."
                          rows={3}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                      </div>
                      <div className="flex gap-2 justify-end">
                        <Button variant="outline" size="sm" onClick={onCancel}>
                          Huỷ
                        </Button>
                        <Button
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                          onClick={() => submitResponse(req.id)}
                        >
                          Lưu phản hồi
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-end gap-2 flex-wrap">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-purple-700 border-purple-300 hover:bg-purple-50 gap-1.5 text-xs font-semibold"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenInviteCoHost(req);
                        }}
                      >
                        <Handshake className="w-3.5 h-3.5 text-purple-600" />
                        {req.isCoHosted ? "Quản lý liên minh" : "Mời đối tác liên kết"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-gray-700 border-gray-300 hover:bg-gray-100 gap-1.5 text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          openResponse(req);
                        }}
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        {req.companyNote ? "Chỉnh sửa phản hồi" : "Gửi tin nhắn phản hồi"}
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-sm font-semibold text-gray-900 mt-0.5">{value}</p>
    </div>
  );
}
