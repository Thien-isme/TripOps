import { useState } from "react";
import { CustomTourRequest } from "@/app/types";
import { Clock, CheckCircle, XCircle, MessageSquare, ChevronDown, ChevronUp, MapPin, Users, Calendar } from "lucide-react";
import { Button } from "@/app/components/ui/button";

interface UserCustomRequestsProps {
  requests: CustomTourRequest[];
  onCancel: (id: string) => void;
  onNavigateToForm: () => void;
}

const STATUS_CONFIG: Record<CustomTourRequest["status"], { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: "Chờ xử lý", color: "bg-gray-100 text-gray-600", icon: <Clock className="w-3.5 h-3.5" /> },
  reviewing: { label: "Đang xem xét", color: "bg-blue-100 text-blue-700", icon: <Clock className="w-3.5 h-3.5" /> },
  quoted: { label: "Đã báo giá", color: "bg-emerald-100 text-emerald-700", icon: <CheckCircle className="w-3.5 h-3.5" /> },
  accepted: { label: "Đã chấp nhận", color: "bg-teal-100 text-teal-700", icon: <CheckCircle className="w-3.5 h-3.5" /> },
  rejected: { label: "Không phù hợp", color: "bg-red-100 text-red-600", icon: <XCircle className="w-3.5 h-3.5" /> },
  cancelled: { label: "Đã huỷ", color: "bg-gray-100 text-gray-400", icon: <XCircle className="w-3.5 h-3.5" /> },
};

function formatDate(iso: string) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("vi-VN");
}

function formatVND(n: number) {
  return n.toLocaleString("vi-VN") + " ₫";
}

export function UserCustomRequests({ requests, onCancel, onNavigateToForm }: UserCustomRequestsProps) {
  const [expanded, setExpanded] = useState<string | null>(null);

  if (requests.length === 0) {
    return (
      <div className="text-center py-16 space-y-4">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
          <MapPin className="w-8 h-8 text-gray-400" />
        </div>
        <p className="text-gray-500 font-medium">Bạn chưa có yêu cầu thiết kế tour nào.</p>
        <Button onClick={onNavigateToForm} className="bg-teal-600 hover:bg-teal-700">
          Gửi yêu cầu thiết kế tour
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{requests.length} yêu cầu đã gửi</p>
        <Button size="sm" onClick={onNavigateToForm} className="bg-teal-600 hover:bg-teal-700 gap-1.5">
          <MapPin className="w-4 h-4" />
          Gửi yêu cầu mới
        </Button>
      </div>

      {requests.map((req) => {
        const cfg = STATUS_CONFIG[req.status];
        const isExp = expanded === req.id;
        return (
          <div key={req.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            {/* Row header */}
            <div
              className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => setExpanded(isExp ? null : req.id)}
            >
              {/* Status dot */}
              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${cfg.color}`}>
                {cfg.icon}
                {cfg.label}
              </div>

              {/* Main info */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-sm truncate">
                  {req.destinations}
                </p>
                <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-500 flex-wrap">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(req.departureDate)} – {formatDate(req.returnDate)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {req.numberOfPeople} người
                  </span>
                  <span>{req.targetCompanyName}</span>
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

            {/* Expanded detail */}
            {isExp && (
              <div className="border-t border-gray-100 px-5 py-4 space-y-4 bg-gray-50">
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
                  <InfoRow label="Công ty nhận" value={req.targetCompanyName} />
                  <InfoRow label="Ngày gửi" value={new Date(req.createdAt).toLocaleDateString("vi-VN")} />
                </div>

                {req.additionalInfo && (
                  <div className="bg-white border border-gray-200 rounded-lg p-3">
                    <p className="text-xs font-medium text-gray-500 mb-1">Thông tin bổ sung</p>
                    <p className="text-sm text-gray-700">{req.additionalInfo}</p>
                  </div>
                )}

                {/* Company response */}
                {(req.companyNote || req.quotedPricePerPerson) && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
                    <p className="text-xs font-bold text-blue-700 flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5" />
                      Phản hồi từ {req.targetCompanyName}
                    </p>
                    {req.companyNote && <p className="text-sm text-blue-800">{req.companyNote}</p>}
                    {req.quotedPricePerPerson && (
                      <p className="text-sm font-bold text-emerald-700">
                        Báo giá dự kiến: {formatVND(req.quotedPricePerPerson)} / người
                      </p>
                    )}
                    {req.responseAt && (
                      <p className="text-xs text-blue-400">Cập nhật: {new Date(req.responseAt).toLocaleDateString("vi-VN")}</p>
                    )}
                  </div>
                )}

                {/* Cancel button */}
                {(req.status === "pending" || req.status === "reviewing") && (
                  <div className="flex justify-end">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 border-red-200 hover:bg-red-50"
                      onClick={() => onCancel(req.id)}
                    >
                      Huỷ yêu cầu
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
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
