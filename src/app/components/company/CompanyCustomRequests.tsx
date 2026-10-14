import { useState } from "react";
import { CustomTourRequest } from "@/app/types";
import {
  Clock, CheckCircle, XCircle, ChevronDown, ChevronUp,
  MapPin, Users, Calendar, MessageSquare, DollarSign, Building2,
} from "lucide-react";
import { Button } from "@/app/components/ui/button";

interface CompanyCustomRequestsProps {
  requests: CustomTourRequest[];
  onUpdateRequest: (id: string, update: Partial<CustomTourRequest>) => void;
}

const STATUS_CONFIG: Record<CustomTourRequest["status"], { label: string; color: string }> = {
  pending: { label: "Chờ xử lý", color: "bg-gray-100 text-gray-600" },
  reviewing: { label: "Đang xem xét", color: "bg-blue-100 text-blue-700" },
  quoted: { label: "Đã báo giá", color: "bg-emerald-100 text-emerald-700" },
  accepted: { label: "Khách đồng ý", color: "bg-teal-100 text-teal-700" },
  rejected: { label: "Từ chối", color: "bg-red-100 text-red-600" },
  cancelled: { label: "Đã huỷ", color: "bg-gray-100 text-gray-400" },
};

function formatDate(iso: string) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("vi-VN");
}

function formatVND(n: number) {
  return n.toLocaleString("vi-VN") + " ₫";
}

export function CompanyCustomRequests({ requests, onUpdateRequest }: CompanyCustomRequestsProps) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [respondingId, setRespondingId] = useState<string | null>(null);
  const [responseForm, setResponseForm] = useState({ note: "", quotedPrice: "", status: "reviewing" as CustomTourRequest["status"] });

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

  const pending = requests.filter((r) => r.status === "pending" || r.status === "reviewing");
  const others = requests.filter((r) => r.status !== "pending" && r.status !== "reviewing");

  if (requests.length === 0) {
    return (
      <div className="text-center py-16 space-y-3">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
          <MapPin className="w-8 h-8 text-gray-400" />
        </div>
        <p className="text-gray-500 font-medium">Chưa có yêu cầu thiết kế tour nào.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {(["pending", "reviewing", "quoted", "rejected"] as const).map((s) => {
          const count = requests.filter((r) => r.status === s).length;
          const cfg = STATUS_CONFIG[s];
          return (
            <div key={s} className="bg-white border border-gray-200 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">{count}</p>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cfg.color}`}>{cfg.label}</span>
            </div>
          );
        })}
      </div>

      {/* Pending/reviewing first */}
      {pending.length > 0 && (
        <RequestGroup title="Cần xử lý" requests={pending} expanded={expanded} setExpanded={setExpanded}
          respondingId={respondingId} responseForm={responseForm} setResponseForm={setResponseForm}
          openResponse={openResponse} submitResponse={submitResponse} onCancel={() => setRespondingId(null)} />
      )}

      {others.length > 0 && (
        <RequestGroup title="Đã xử lý" requests={others} expanded={expanded} setExpanded={setExpanded}
          respondingId={respondingId} responseForm={responseForm} setResponseForm={setResponseForm}
          openResponse={openResponse} submitResponse={submitResponse} onCancel={() => setRespondingId(null)} />
      )}
    </div>
  );
}

interface GroupProps {
  title: string;
  requests: CustomTourRequest[];
  expanded: string | null;
  setExpanded: (id: string | null) => void;
  respondingId: string | null;
  responseForm: { note: string; quotedPrice: string; status: CustomTourRequest["status"] };
  setResponseForm: React.Dispatch<React.SetStateAction<{ note: string; quotedPrice: string; status: CustomTourRequest["status"] }>>;
  openResponse: (req: CustomTourRequest) => void;
  submitResponse: (id: string) => void;
  onCancel: () => void;
}

function RequestGroup({ title, requests, expanded, setExpanded, respondingId, responseForm, setResponseForm, openResponse, submitResponse, onCancel }: GroupProps) {
  return (
    <div>
      <h4 className="text-sm font-bold text-gray-700 mb-3">{title} ({requests.length})</h4>
      <div className="space-y-3">
        {requests.map((req) => {
          const cfg = STATUS_CONFIG[req.status];
          const isExp = expanded === req.id;
          const isResponding = respondingId === req.id;

          return (
            <div key={req.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
              {/* Header row */}
              <div
                className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setExpanded(isExp ? null : req.id)}
              >
                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${cfg.color}`}>
                  {req.status === "pending" ? <Clock className="w-3.5 h-3.5" /> : req.status === "rejected" ? <XCircle className="w-3.5 h-3.5" /> : <CheckCircle className="w-3.5 h-3.5" />}
                  {cfg.label}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm truncate">{req.destinations}</p>
                  <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-500 flex-wrap">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{formatDate(req.departureDate)} – {formatDate(req.returnDate)}</span>
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" />{req.numberOfPeople} người</span>
                    {req.businessName && <span className="flex items-center gap-1"><Building2 className="w-3 h-3" />{req.businessName}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  {req.quotedPricePerPerson && (
                    <div className="text-right">
                      <p className="text-xs text-gray-400">Báo giá / người</p>
                      <p className="text-sm font-bold text-emerald-600">{formatVND(req.quotedPricePerPerson)}</p>
                    </div>
                  )}
                  {isExp ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </div>
              </div>

              {/* Expanded */}
              {isExp && (
                <div className="border-t border-gray-100 px-5 py-4 space-y-4 bg-gray-50">
                  {/* Contact info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                    <InfoRow label="Điểm đến" value={req.destinations} />
                    <InfoRow label="Ngày đi" value={formatDate(req.departureDate)} />
                    <InfoRow label="Ngày về" value={formatDate(req.returnDate)} />
                    <InfoRow label="Số người" value={req.numberOfPeople} />
                    {req.budgetPerPerson && <InfoRow label="Ngân sách / người" value={`${Number(req.budgetPerPerson).toLocaleString("vi-VN")} ₫`} />}
                    {req.hotelStars && <InfoRow label="Hạng khách sạn" value={`${req.hotelStars} sao`} />}
                    {req.businessName && <InfoRow label="Doanh nghiệp" value={req.businessName} />}
                    <InfoRow label="Người liên hệ" value={req.contactName} />
                    <InfoRow label="Email" value={req.contactEmail} />
                    <InfoRow label="SĐT" value={req.contactPhone} />
                    <InfoRow label="Ngày gửi" value={formatDate(req.createdAt)} />
                  </div>

                  {req.additionalInfo && (
                    <div className="bg-white border border-gray-200 rounded-lg p-3">
                      <p className="text-xs font-medium text-gray-500 mb-1">Thông tin bổ sung từ khách</p>
                      <p className="text-sm text-gray-700">{req.additionalInfo}</p>
                    </div>
                  )}

                  {/* Previous response */}
                  {req.companyNote && !isResponding && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-xs font-bold text-blue-700 mb-1 flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5" />Phản hồi trước
                      </p>
                      <p className="text-sm text-blue-800">{req.companyNote}</p>
                      {req.quotedPricePerPerson && (
                        <p className="text-sm font-bold text-emerald-700 mt-1">Báo giá: {formatVND(req.quotedPricePerPerson)} / người</p>
                      )}
                    </div>
                  )}

                  {/* Response form */}
                  {isResponding ? (
                    <div className="bg-white border border-blue-300 rounded-xl p-4 space-y-3">
                      <p className="text-sm font-bold text-gray-800 flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-blue-600" />
                        Phản hồi yêu cầu
                      </p>
                      <div>
                        <label className="text-xs font-medium text-gray-600 block mb-1">Trạng thái</label>
                        <select
                          value={responseForm.status}
                          onChange={(e) => setResponseForm((p) => ({ ...p, status: e.target.value as any }))}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                        >
                          <option value="reviewing">Đang xem xét</option>
                          <option value="quoted">Đã báo giá</option>
                          <option value="accepted">Đồng ý nhận tour</option>
                          <option value="rejected">Từ chối</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-600 block mb-1">
                          <DollarSign className="w-3 h-3 inline mr-1" />
                          Báo giá dự kiến / người (₫) — để trống nếu chưa xác định
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
                          placeholder="Nhập nội dung phản hồi cho khách..."
                          rows={3}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                      </div>
                      <div className="flex gap-2 justify-end">
                        <Button variant="outline" size="sm" onClick={onCancel}>Huỷ</Button>
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={() => submitResponse(req.id)}>
                          Lưu phản hồi
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-end">
                      <Button
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700 gap-1.5"
                        onClick={(e) => { e.stopPropagation(); openResponse(req); }}
                      >
                        <MessageSquare className="w-4 h-4" />
                        {req.companyNote ? "Cập nhật phản hồi" : "Phản hồi yêu cầu"}
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
      <p className="text-sm font-medium text-gray-900 mt-0.5">{value}</p>
    </div>
  );
}
