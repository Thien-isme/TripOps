import { useState, useMemo } from "react";
import { TourCompany, User } from "@/app/types";
import {
  Building2,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Phone,
  Mail,
  MapPin,
  Search,
  AlertTriangle,
  ShieldCheck,
  FileCheck,
  UserCheck,
  ExternalLink,
  Store,
  Compass,
  Check,
  X,
  Sparkles,
  RefreshCw,
  Ban,
  ShieldAlert,
} from "lucide-react";
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

export interface UnifiedPartnerItem {
  id: string;
  type: "agency" | "provider";
  businessName: string;
  taxCode: string;
  representativeName: string;
  email: string;
  phone: string;
  address: string;
  licenseNumber?: string;
  licenseUrl?: string;
  description?: string;
  status: "pending" | "approved" | "rejected";
  isSuspended?: boolean;
  rejectionReason?: string;
  approvalNote?: string;
  createdAt: string;
  originalCompany?: TourCompany;
  originalProvider?: User;
}

interface PartnerApprovalManagementProps {
  companies: TourCompany[];
  companyAdmins: User[];
  providers: User[];
  onApproveCompany: (companyId: string) => void;
  onRejectCompany: (companyId: string, reason: string) => void;
  onApproveProvider: (providerId: string) => void;
  onRejectProvider: (providerId: string, reason?: string) => void;
  onToggleStatus?: (partnerId: string, newSuspendedState: boolean) => void;
}

const cleanDisplayName = (name?: string) => {
  if (!name) return "";
  return name.replace(/\s*\(.*?\)\s*/g, " ").replace(/\s+/g, " ").trim();
};

export function PartnerApprovalManagement({
  companies,
  companyAdmins,
  providers,
  onApproveCompany,
  onRejectCompany,
  onApproveProvider,
  onRejectProvider,
  onToggleStatus,
}: PartnerApprovalManagementProps) {
  // Quản lý danh sách ID đối tác bị đình chỉ hoạt động
  const [suspendedPartnerIds, setSuspendedPartnerIds] = useState<Set<string>>(new Set());

  // 1. CHUYỂN ĐỔI VÀ HỢP NHẤT DỮ LIỆU ĐỐI TÁC
  const allPartners = useMemo<UnifiedPartnerItem[]>(() => {
    const list: UnifiedPartnerItem[] = [];

    // Danh sách Doanh nghiệp Lữ hành (Agency / TourCompany)
    companies.forEach((comp) => {
      const admin = companyAdmins.find((u) => u.companyId === comp.id || u.id === comp.adminId);
      list.push({
        id: comp.id,
        type: "agency",
        businessName: comp.name,
        taxCode: comp.taxCode || "Chưa cập nhật",
        representativeName: admin?.name || "Người đại diện pháp luật",
        email: comp.email || admin?.email || "Chưa có email",
        phone: comp.phone || admin?.phone || "Chưa có SĐT",
        address: comp.address || "Chưa có địa chỉ",
        licenseNumber: comp.licenseNumber,
        licenseUrl: "https://images.unsplash.com/photo-1450133064473-71024230f91b?w=600",
        description: comp.description,
        status: (comp.status as any) === "suspended" ? "approved" : (comp.status as "pending" | "approved" | "rejected"),
        isSuspended: (comp.status as any) === "suspended" || suspendedPartnerIds.has(comp.id),
        rejectionReason: comp.rejectionReason,
        createdAt: comp.createdAt || "2026-09-01",
        originalCompany: comp,
      });
    });

    // Danh sách Nhà cung cấp Dịch vụ (Provider)
    providers.forEach((prov) => {
      const statusRaw = prov.accountStatus || "pending";
      list.push({
        id: prov.id,
        type: "provider",
        businessName: prov.businessName || prov.name || "Cơ sở Cung ứng",
        taxCode: prov.taxCode || "Chưa cập nhật",
        representativeName: prov.name,
        email: prov.email,
        phone: prov.phone || prov.businessPhone || "Chưa có SĐT",
        address: prov.businessAddress || prov.street || "Chưa có địa chỉ",
        licenseUrl: "https://images.unsplash.com/photo-1450133064473-71024230f91b?w=600",
        description: prov.businessDescription,
        status: (statusRaw as any) === "suspended" ? "approved" : (statusRaw as "pending" | "approved" | "rejected"),
        isSuspended: (statusRaw as any) === "suspended" || suspendedPartnerIds.has(prov.id),
        rejectionReason: prov.rejectionReason,
        createdAt: "2026-09-10",
        originalProvider: prov,
      });
    });

    return list;
  }, [companies, companyAdmins, providers, suspendedPartnerIds]);

  // Filters & Search (Mặc định chọn tab "Đã phê duyệt")
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"approved" | "pending" | "rejected">("approved");
  const [roleFilter, setRoleFilter] = useState<"all" | "agency" | "provider">("all");

  // Modals state
  const [selectedPartner, setSelectedPartner] = useState<UnifiedPartnerItem | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  
  // Modal Phê duyệt
  const [approvingPartner, setApprovingPartner] = useState<UnifiedPartnerItem | null>(null);
  const [approvalNote, setApprovalNote] = useState("");

  // Modal Từ chối
  const [rejectingPartner, setRejectingPartner] = useState<UnifiedPartnerItem | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectError, setRejectError] = useState("");

  // Modal Xác nhận đổi trạng thái (Đang hoạt động <-> Đình chỉ)
  const [togglingStatusPartner, setTogglingStatusPartner] = useState<UnifiedPartnerItem | null>(null);

  // Mở Modal Xác nhận Đổi Trạng thái
  const handleOpenToggleStatusModal = (partner: UnifiedPartnerItem) => {
    setTogglingStatusPartner(partner);
  };

  // Xác nhận chuyển đổi trạng thái Hoạt động / Đình chỉ
  const handleConfirmToggleStatus = () => {
    if (!togglingStatusPartner) return;
    const partnerId = togglingStatusPartner.id;

    setSuspendedPartnerIds((prev) => {
      const next = new Set(prev);
      const isCurrentlySuspended = next.has(partnerId) || togglingStatusPartner.isSuspended;
      
      if (isCurrentlySuspended) {
        next.delete(partnerId);
      } else {
        next.add(partnerId);
      }
      
      if (onToggleStatus) {
        onToggleStatus(partnerId, !isCurrentlySuspended);
      }
      return next;
    });

    setTogglingStatusPartner(null);
  };

  // Filtered partners
  const filteredPartners = useMemo(() => {
    return allPartners.filter((item) => {
      if (item.status !== statusFilter) {
        return false;
      }
      if (roleFilter !== "all" && item.type !== roleFilter) {
        return false;
      }
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchName = item.businessName.toLowerCase().includes(query);
        const matchRep = item.representativeName.toLowerCase().includes(query);
        const matchEmail = item.email.toLowerCase().includes(query);
        const matchTax = item.taxCode.toLowerCase().includes(query);
        const matchPhone = item.phone.toLowerCase().includes(query);
        return matchName || matchRep || matchEmail || matchTax || matchPhone;
      }
      return true;
    });
  }, [allPartners, statusFilter, roleFilter, searchTerm]);

  // Counts
  const counts = useMemo(() => {
    return {
      approved: allPartners.filter((p) => p.status === "approved").length,
      pending: allPartners.filter((p) => p.status === "pending").length,
      rejected: allPartners.filter((p) => p.status === "rejected").length,
    };
  }, [allPartners]);

  // Xử lý mở Modal duyệt
  const handleOpenApproveModal = (partner: UnifiedPartnerItem) => {
    setApprovingPartner(partner);
    setApprovalNote(
      partner.type === "agency"
        ? "Hồ sơ pháp nhân và giấy phép lữ hành đã được thẩm định hợp lệ trên Cổng thông tin Quốc gia. Kích hoạt toàn bộ quyền đăng tour và liên minh bán hàng."
        : "Thông tin cơ sở cung ứng dịch vụ và mã số thuế đã được kiểm tra đạt chuẩn. Kích hoạt quyền đăng bán dịch vụ trên sàn TripOps."
    );
  };

  // Xác nhận Phê duyệt
  const handleConfirmApprove = () => {
    if (!approvingPartner) return;
    if (approvingPartner.type === "agency") {
      onApproveCompany(approvingPartner.id);
    } else {
      onApproveProvider(approvingPartner.id);
    }
    setApprovingPartner(null);
    setShowDetailModal(false);
  };

  // Xử lý mở Modal từ chối
  const handleOpenRejectModal = (partner: UnifiedPartnerItem) => {
    setRejectingPartner(partner);
    setRejectReason("");
    setRejectError("");
  };

  // Xác nhận Từ chối
  const handleConfirmReject = () => {
    if (!rejectingPartner) return;
    if (!rejectReason.trim()) {
      setRejectError("Vui lòng nhập lý do từ chối cụ thể để đối tác biết và sửa đổi hồ sơ!");
      return;
    }

    if (rejectingPartner.type === "agency") {
      onRejectCompany(rejectingPartner.id, rejectReason.trim());
    } else {
      onRejectProvider(rejectingPartner.id, rejectReason.trim());
    }
    setRejectingPartner(null);
    setShowDetailModal(false);
  };

  const rejectionPresets = [
    "Mã số thuế không tồn tại hoặc không trùng khớp với tên pháp nhân trên Cổng Thông tin Quốc gia về Đăng ký Doanh nghiệp.",
    "Bản chụp Giấy phép kinh doanh / Giấy phép lữ hành bị mờ, không thấy rõ dấu mộc đỏ pháp lý.",
    "Địa chỉ trụ sở hoặc thông tin số điện thoại người đại diện không chính xác, ban quản trị không liên lạc được.",
    "Giấy phép kinh doanh lữ hành đã hết hạn hiệu lực, đề nghị cung cấp bản gia hạn mới nhất.",
  ];

  return (
    <div className="space-y-6">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#075985]/10 text-[#075985] text-xs font-bold mb-2">
            <ShieldCheck className="w-4 h-4 text-[#F97316]" />
            <span>Trung tâm Kiểm duyệt Đối tác Sàn (TripOps Moderation)</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Phê duyệt Hồ sơ Doanh nghiệp & Nhà cung cấp
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Thẩm định tính hợp pháp của Mã số thuế và Giấy phép kinh doanh trước khi cấp quyền bán hàng.
          </p>
        </div>

        {counts.pending > 0 && (
          <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 px-4 py-3 rounded-2xl shrink-0">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-extrabold text-lg shadow-xs animate-bounce">
              {counts.pending}
            </div>
            <div>
              <div className="text-xs font-bold text-amber-950">Có đơn chờ xét duyệt!</div>
              <div className="text-[11px] text-amber-700">Cần xử lý trong vòng 24h</div>
            </div>
          </div>
        )}
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 1. Đã phê duyệt */}
        <div
          onClick={() => setStatusFilter("approved")}
          className={`p-4.5 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === "approved"
              ? "bg-emerald-600 text-white border-emerald-600 shadow-md scale-[1.02]"
              : "bg-white text-slate-700 border-emerald-200 hover:border-emerald-300 shadow-2xs"
          }`}
        >
          <div className="text-xs font-medium opacity-90 flex items-center justify-between">
            <span>Đã phê duyệt</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black mt-2">{counts.approved}</div>
          <div className="text-[11px] mt-1 opacity-80">Đang hoạt động / Quản lý trạng thái trên sàn</div>
        </div>

        {/* 2. Chờ phê duyệt */}
        <div
          onClick={() => setStatusFilter("pending")}
          className={`p-4.5 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === "pending"
              ? "bg-amber-500 text-white border-amber-500 shadow-md scale-[1.02]"
              : "bg-white text-slate-700 border-amber-200 hover:border-amber-300 shadow-2xs"
          }`}
        >
          <div className="text-xs font-medium opacity-90 flex items-center justify-between">
            <span>Chờ phê duyệt</span>
            <Clock className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black mt-2 flex items-center gap-2">
            <span>{counts.pending}</span>
            {counts.pending > 0 && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/25 uppercase font-bold tracking-wider">
                Mới
              </span>
            )}
          </div>
          <div className="text-[11px] mt-1 opacity-80">Hồ sơ đã nộp cần thẩm định</div>
        </div>

        {/* 3. Bị từ chối */}
        <div
          onClick={() => setStatusFilter("rejected")}
          className={`p-4.5 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === "rejected"
              ? "bg-rose-600 text-white border-rose-600 shadow-md scale-[1.02]"
              : "bg-white text-slate-700 border-rose-200 hover:border-rose-300 shadow-2xs"
          }`}
        >
          <div className="text-xs font-medium opacity-90 flex items-center justify-between">
            <span>Bị từ chối</span>
            <XCircle className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black mt-2">{counts.rejected}</div>
          <div className="text-[11px] mt-1 opacity-80">Cần bổ sung / Nộp lại hồ sơ</div>
        </div>
      </div>

      {/* FILTER & SEARCH TOOLBAR */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo tên doanh nghiệp, MST, email, SĐT..."
            className="pl-9.5 text-xs h-10 bg-slate-50/60 focus:bg-white border-slate-200 rounded-xl"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
            >
              ✕
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-medium">
            <button
              onClick={() => setRoleFilter("all")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                roleFilter === "all" ? "bg-white text-slate-900 shadow-2xs font-bold" : "text-slate-500"
              }`}
            >
              Tất cả vai trò
            </button>
            <button
              onClick={() => setRoleFilter("agency")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                roleFilter === "agency" ? "bg-amber-500 text-white shadow-2xs font-bold" : "text-slate-600"
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Công ty lữ hành</span>
            </button>
            <button
              onClick={() => setRoleFilter("provider")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                roleFilter === "provider" ? "bg-emerald-600 text-white shadow-2xs font-bold" : "text-slate-600"
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              <span>Provider (Dịch vụ)</span>
            </button>
          </div>
        </div>
      </div>

      {/* PARTNER LIST TABLE */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {filteredPartners.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">Không tìm thấy đối tác nào phù hợp</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Thử thay đổi từ khóa tìm kiếm hoặc chuyển sang bộ lọc trạng thái khác.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px] tracking-wider">
                  <th className="py-3.5 px-4">Doanh nghiệp</th>
                  <th className="py-3.5 px-4">Người đại diệ</th>
                  <th className="py-3.5 px-4">Trụ sở</th>
                  <th className="py-3.5 px-4">Trạng thái</th>
                  <th className="py-3.5 px-4 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPartners.map((item) => {
                  const isSuspended = item.isSuspended || suspendedPartnerIds.has(item.id);

                  return (
                    <tr key={item.id} className="hover:bg-sky-50/30 transition-colors group">
                      {/* Cột 1: Thông tin Doanh nghiệp */}
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-sm text-slate-900 group-hover:text-[#075985] transition-colors">
                              {item.businessName}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide flex items-center gap-1 ${
                                item.type === "agency"
                                  ? "bg-amber-100 text-amber-900 border border-amber-200"
                                  : "bg-emerald-100 text-emerald-900 border border-emerald-200"
                              }`}
                            >
                              {item.type === "agency" ? <Compass className="w-3 h-3" /> : <Store className="w-3 h-3" />}
                              <span>{item.type === "agency" ? "Agency / Lữ hành" : "Nhà cung cấp"}</span>
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Cột 2: Người đại diện */}
                      <td className="py-4 px-4">
                        <div className="space-y-0.5">
                          <div className="font-bold text-slate-900">{item.representativeName}</div>
                          
                        </div>
                      </td>

                      {/* Cột 3: Địa chỉ & Giấy phép */}
                      <td className="py-4 px-4 max-w-xs">
                        <div className="space-y-1">
                          <div className="text-slate-600 line-clamp-1 flex items-start gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                            <span className="truncate">{item.address}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedPartner(item);
                                setShowDetailModal(true);
                              }}
                              className="inline-flex items-center gap-1 text-[11px] text-[#075985] hover:text-[#0369a1] font-bold hover:underline cursor-pointer"
                            >
                            </button>
                          </div>
                        </div>
                      </td>

                      {/* Cột 4: TRẠNG THÁI */}
                      <td className="py-4 px-4">
                        {item.status === "approved" && (
                          <>
                            {isSuspended ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-300">
                                <Ban className="w-3 h-3 text-slate-500" />
                                <span>Đình chỉ</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>Đang hoạt động</span>
                              </span>
                            )}
                          </>
                        )}

                        {item.status === "pending" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                            <Clock className="w-3 h-3 text-amber-600" />
                            <span>Chờ xét duyệt</span>
                          </span>
                        )}

                        {item.status === "rejected" && (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                              <XCircle className="w-3 h-3 text-rose-600" />
                              <span>Bị từ chối</span>
                            </span>
                            {item.rejectionReason && (
                              <p className="text-[10px] text-rose-700 italic line-clamp-1 max-w-xs">
                                Lý do: "{item.rejectionReason}"
                              </p>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Cột 5: HÀNH ĐỘNG */}
                      <td className="py-4 px-4 text-right">
                        {/* TAB ĐÃ PHÊ DUYỆT */}
                        {item.status === "approved" && (
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedPartner(item);
                                setShowDetailModal(true);
                              }}
                              className="h-8 px-2.5 text-xs text-slate-700 border-slate-300 hover:bg-slate-100 cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Xem hồ sơ</span>
                            </Button>

                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenToggleStatusModal(item)}
                              className={`h-8 px-2.5 text-xs font-bold gap-1.5 cursor-pointer rounded-xl border transition-colors ${
                                isSuspended
                                  ? "bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100"
                                  : "bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100"
                              }`}
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                              <span>
                                {isSuspended ? "Kích hoạt lại" : "Đình chỉ"}
                              </span>
                            </Button>
                          </div>
                        )}

                        {/* TAB CHỜ PHÊ DUYỆT */}
                        {item.status === "pending" && (
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedPartner(item);
                                setShowDetailModal(true);
                              }}
                              className="h-8 px-2.5 text-xs text-slate-700 border-slate-300 hover:bg-slate-100 cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Xem hồ sơ</span>
                            </Button>

                            <Button
                              type="button"
                              size="sm"
                              onClick={() => handleOpenApproveModal(item)}
                              className="h-8 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs gap-1 cursor-pointer"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Phê duyệt</span>
                            </Button>

                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenRejectModal(item)}
                              className="h-8 px-2.5 border-rose-300 text-rose-700 hover:bg-rose-50 font-bold text-xs gap-1 cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>Từ chối</span>
                            </Button>
                          </div>
                        )}

                        {/* TAB BỊ TỪ CHỐI */}
                        {item.status === "rejected" && (
                          <div className="flex items-center justify-end">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedPartner(item);
                                setShowDetailModal(true);
                              }}
                              className="h-8 px-2.5 text-xs text-slate-700 border-slate-300 hover:bg-slate-100 cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Xem hồ sơ</span>
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL MỚI: XÁC NHẬN THAY ĐỔI TRẠNG THÁI (ĐANG HOẠT ĐỘNG <-> ĐÌNH CHỈ) */}
      {/* ========================================================================= */}
      <Dialog
        open={Boolean(togglingStatusPartner)}
        onOpenChange={(open) => !open && setTogglingStatusPartner(null)}
      >
        <DialogContent className="max-w-md rounded-3xl p-6 bg-white text-slate-900 border border-slate-200 shadow-2xl">
          {togglingStatusPartner && (() => {
            const isCurrentlySuspended =
              togglingStatusPartner.isSuspended ||
              suspendedPartnerIds.has(togglingStatusPartner.id);

            return (
              <>
                <DialogHeader>
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-2 ${
                      isCurrentlySuspended
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {isCurrentlySuspended ? (
                      <CheckCircle2 className="w-6 h-6" />
                    ) : (
                      <ShieldAlert className="w-6 h-6" />
                    )}
                  </div>
                  <DialogTitle className="text-lg font-bold text-slate-900">
                    {isCurrentlySuspended
                      ? "Xác nhận Kích hoạt lại đối tác?"
                      : "Xác nhận Đình chỉ hoạt động đối tác?"}
                  </DialogTitle>
                  <DialogDescription className="text-xs text-slate-500">
                    Doanh nghiệp:{" "}
                    <strong className="text-slate-900">
                      {togglingStatusPartner.businessName}
                    </strong>{" "}
                    (MST: {togglingStatusPartner.taxCode})
                  </DialogDescription>
                </DialogHeader>

                <div className="my-3 text-xs space-y-3">
                  {!isCurrentlySuspended ? (
                    <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 space-y-1.5">
                      <div className="font-bold flex items-center gap-1.5 text-amber-900">
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>Cảnh báo ảnh hưởng lớn:</span>
                      </div>
                      <ul className="list-disc list-inside text-[11px] text-amber-800 space-y-1 leading-relaxed">
                        <li>Tất cả tour/dịch vụ của đối tác sẽ bị <strong>tạm ẩn khỏi sàn</strong> ngay lập tức.</li>
                        <li>Đối tác không thể tạo mới tour hoặc nhận đơn hàng mới từ du khách.</li>
                        <li>Các giao dịch đang xử lý sẽ cần làm việc trực tiếp với CSKH.</li>
                      </ul>
                    </div>
                  ) : (
                    <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-1.5">
                      <div className="font-bold flex items-center gap-1.5 text-emerald-900">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Hiệu lực khôi phục:</span>
                      </div>
                      <p className="text-[11px] text-emerald-800 leading-relaxed">
                        Đối tác sẽ được mở lại toàn bộ quyền truy cập hệ thống, danh sách tour/dịch vụ sẽ hiển thị công khai trở lại trên sàn TripOps.
                      </p>
                    </div>
                  )}
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setTogglingStatusPartner(null)}
                    className="text-xs h-10 px-4 rounded-xl cursor-pointer"
                  >
                    Hủy bỏ
                  </Button>
                  <Button
                    type="button"
                    onClick={handleConfirmToggleStatus}
                    className={`font-bold text-xs h-10 px-5 rounded-xl gap-1.5 cursor-pointer shadow-xs text-white ${
                      isCurrentlySuspended
                        ? "bg-emerald-600 hover:bg-emerald-700"
                        : "bg-amber-600 hover:bg-amber-700"
                    }`}
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>
                      {isCurrentlySuspended ? "Xác nhận Kích hoạt" : "Xác nhận Đình chỉ"}
                    </span>
                  </Button>
                </DialogFooter>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* MODAL 1: PHÊ DUYỆT HỒ SƠ ĐỐI TÁC */}
      {/* ========================================================================= */}
      <Dialog open={Boolean(approvingPartner)} onOpenChange={(open) => !open && setApprovingPartner(null)}>
        <DialogContent className="max-w-lg rounded-3xl p-6 bg-white text-slate-900 border border-slate-200 shadow-2xl">
          <DialogHeader>
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-2">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <DialogTitle className="text-lg font-bold text-slate-900">
              Phê duyệt Hồ sơ Doanh nghiệp đối tác
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Cấp quyền chính thức hoạt động trên sàn cho:{" "}
              <strong className="text-slate-900">{approvingPartner?.businessName}</strong> (MST: {approvingPartner?.taxCode})
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 my-2 text-xs">
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <span>Quyền lợi sau khi được Admin phê duyệt:</span>
              </div>
              <p className="text-[11px] text-emerald-800 leading-relaxed">
                Tài khoản sẽ được mở khóa 100% tính năng, được phép đăng tour/dịch vụ lên sàn công khai và tham gia liên minh hợp tác doanh nghiệp.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">
                Ghi chú phê duyệt / Lời nhắn kích hoạt (Lưu vào hồ sơ đối tác):
              </Label>
              <Textarea
                value={approvalNote}
                onChange={(e) => setApprovalNote(e.target.value)}
                rows={3}
                placeholder="Nhập ghi chú phê duyệt hoặc căn cứ thẩm định..."
                className="text-xs bg-slate-50 focus:bg-white resize-none"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setApprovingPartner(null)}
              className="text-xs h-10 px-4 rounded-xl cursor-pointer"
            >
              Hủy bỏ
            </Button>
            <Button
              type="button"
              onClick={handleConfirmApprove}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-10 px-5 rounded-xl gap-1.5 cursor-pointer shadow-xs"
            >
              <Check className="w-4 h-4" />
              <span>Xác nhận Phê duyệt & Kích hoạt</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* MODAL 2: TỪ CHỐI HỒ SƠ ĐỐI TÁC */}
      {/* ========================================================================= */}
      <Dialog open={Boolean(rejectingPartner)} onOpenChange={(open) => !open && setRejectingPartner(null)}>
        <DialogContent className="max-w-lg rounded-3xl p-6 bg-white text-slate-900 border border-slate-200 shadow-2xl">
          <DialogHeader>
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center mb-2">
              <XCircle className="w-6 h-6" />
            </div>
            <DialogTitle className="text-lg font-bold text-slate-900">
              Từ chối Phê duyệt Hồ sơ Đối tác
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Doanh nghiệp: <strong className="text-slate-900">{rejectingPartner?.businessName}</strong> (MST: {rejectingPartner?.taxCode})
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 my-2 text-xs">
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-rose-950">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>Quy định kiểm duyệt bắt buộc:</span>
              </div>
              <p className="text-[11px] text-rose-800 leading-relaxed">
                Quản trị viên <strong>bắt buộc phải ghi rõ lý do từ chối</strong> để đối tác biết chính xác điểm sai sót cần sửa đổi.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-900 flex items-center justify-between">
                <span>Lý do từ chối hồ sơ (Bắt buộc) <span className="text-rose-600">*</span></span>
              </Label>
              <Textarea
                value={rejectReason}
                onChange={(e) => {
                  setRejectReason(e.target.value);
                  setRejectError("");
                }}
                rows={3}
                placeholder="VD: Mã số thuế không trùng khớp với Giấy đăng ký kinh doanh..."
                className={`text-xs bg-slate-50 focus:bg-white resize-none ${
                  rejectError ? "border-rose-500 focus:ring-rose-500" : ""
                }`}
              />
              {rejectError && (
                <p className="text-[11px] text-rose-600 font-semibold">{rejectError}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Gợi ý lý do phổ biến (Bấm để chọn nhanh):</span>
              </span>
              <div className="flex flex-col gap-1.5">
                {rejectionPresets.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setRejectReason(preset);
                      setRejectError("");
                    }}
                    className="text-left text-[11px] p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900 transition-colors cursor-pointer"
                  >
                    • {preset}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setRejectingPartner(null)}
              className="text-xs h-10 px-4 rounded-xl cursor-pointer"
            >
              Hủy bỏ
            </Button>
            <Button
              type="button"
              onClick={handleConfirmReject}
              className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs h-10 px-5 rounded-xl gap-1.5 cursor-pointer shadow-xs"
            >
              <X className="w-4 h-4" />
              <span>Xác nhận Từ chối hồ sơ</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* MODAL 3: XEM CHI TIẾT HỒ SƠ ĐỐI TÁC */}
      {/* ========================================================================= */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="sm:max-w-4xl md:max-w-4xl w-[94vw] max-w-4xl rounded-3xl p-0 bg-white text-slate-900 border border-slate-200/90 shadow-2xl overflow-hidden focus:outline-none block">
          {selectedPartner && (
            <div className="flex flex-col max-h-[88vh]">
              {/* HEADER MODAL */}
              <div
                className={`px-7 py-5 border-b border-slate-200/80 pr-14 ${
                  selectedPartner.type === "agency"
                    ? "bg-gradient-to-r from-amber-500/10 via-sky-50/40 to-white"
                    : "bg-gradient-to-r from-emerald-500/10 via-teal-50/40 to-white"
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wide flex items-center gap-1.5 ${
                        selectedPartner.type === "agency"
                          ? "bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs"
                          : "bg-emerald-100 text-emerald-900 border border-emerald-300 shadow-2xs"
                      }`}
                    >
                      {selectedPartner.type === "agency" ? (
                        <>
                          <Compass className="w-3.5 h-3.5 text-amber-800" />
                          <span>Công ty lữ hành</span>
                        </>
                      ) : (
                        <>
                          <Store className="w-3.5 h-3.5 text-emerald-800" />
                          <span>Nhà cung cấp Dịch vụ</span>
                        </>
                      )}
                    </span>

                    {selectedPartner.status === "approved" && (
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shadow-2xs ${
                          suspendedPartnerIds.has(selectedPartner.id) || selectedPartner.isSuspended
                            ? "bg-slate-100 text-slate-700 border-slate-300"
                            : "bg-emerald-50 text-emerald-700 border-emerald-300"
                        }`}
                      >
                        {suspendedPartnerIds.has(selectedPartner.id) || selectedPartner.isSuspended ? (
                          <>
                            <Ban className="w-3.5 h-3.5 text-slate-500" />
                            <span>Đình chỉ</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Đang hoạt động</span>
                          </>
                        )}
                      </span>
                    )}

                    {selectedPartner.status === "pending" && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border bg-amber-50 text-amber-700 border-amber-300 shadow-2xs">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        <span>Chờ xét duyệt</span>
                      </span>
                    )}

                    {selectedPartner.status === "rejected" && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border bg-rose-50 text-rose-700 border-rose-300 shadow-2xs">
                        <XCircle className="w-3.5 h-3.5 text-rose-600" />
                        <span>Bị từ chối</span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-3">
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                    {selectedPartner.businessName}
                  </h2>
                  <p className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-2">
                    <span>Hồ sơ thẩm định tư cách đối tác hệ sinh thái TripOps</span>
                    <span className="text-slate-300 hidden sm:inline">•</span>
                    <span>Mã số thuế: <strong className="font-mono text-slate-700">{selectedPartner.taxCode}</strong></span>
                  </p>
                </div>
              </div>

              {/* BODY CONTENT */}
              <div className="p-7 space-y-5 overflow-y-auto bg-slate-50/60 flex-1">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                  <div className="lg:col-span-7 space-y-5">
                    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3.5">
                      <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100">
                        <Building2 className="w-4 h-4 text-[#075985]" />
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                          1. Thông tin pháp nhân doanh nghiệp
                        </h3>
                      </div>

                      <div className="space-y-3 text-xs">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <span className="text-[11px] text-slate-400 font-semibold block uppercase">
                              Tên cơ sở kinh doanh
                            </span>
                            <span className="font-bold text-slate-900 text-sm mt-0.5 block">
                              {selectedPartner.businessName}
                            </span>
                          </div>

                          <div>
                            <span className="text-[11px] text-slate-400 font-semibold block uppercase">
                              Mã số thuế (MST)
                            </span>
                            <span className="font-mono font-black text-slate-900 text-sm bg-slate-100 px-2.5 py-1 rounded-lg inline-block mt-0.5 border border-slate-200">
                              {selectedPartner.taxCode}
                            </span>
                          </div>
                        </div>

                        <div>
                          <span className="text-[11px] text-slate-400 font-semibold block uppercase">
                            Địa chỉ trụ sở kinh doanh
                          </span>
                          <div className="font-medium text-slate-800 flex items-start gap-1.5 mt-0.5">
                            <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                            <span>{selectedPartner.address}</span>
                          </div>
                        </div>

                        {selectedPartner.description && (
                          <div>
                            <span className="text-[11px] text-slate-400 font-semibold block uppercase">
                              Giới thiệu năng lực hoạt động
                            </span>
                            <div className="mt-1 p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-700 leading-relaxed text-xs">
                              {selectedPartner.description}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3.5">
                      <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100">
                        <UserCheck className="w-4 h-4 text-[#075985]" />
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                          2. Người đại diện & Thông tin liên hệ
                        </h3>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div>
                          <span className="text-[11px] text-slate-400 font-semibold block uppercase">
                            Họ và tên người đại diện
                          </span>
                          <span className="font-bold text-slate-900 text-sm mt-0.5 block">
                            {cleanDisplayName(selectedPartner.representativeName)}
                          </span>
                        </div>

                        <div>
                          <span className="text-[11px] text-slate-400 font-semibold block uppercase">
                            Số điện thoại liên hệ
                          </span>
                          <div className="font-mono font-bold text-slate-900 flex items-center gap-1.5 mt-0.5">
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            <span>{selectedPartner.phone}</span>
                          </div>
                        </div>

                        <div className="sm:col-span-2">
                          <span className="text-[11px] text-slate-400 font-semibold block uppercase">
                            Email đăng nhập tài khoản
                          </span>
                          <div className="font-medium text-slate-900 flex items-center gap-1.5 mt-0.5">
                            <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{selectedPartner.email}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-5 space-y-5">
                    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3.5">
                      <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <FileCheck className="w-4 h-4 text-emerald-600" />
                          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                            3. Hồ sơ pháp lý
                          </h3>
                        </div>
                        <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Tệp gốc</span>
                        </span>
                      </div>

                      <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-xl bg-red-100 text-red-700 flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                            PDF
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="font-bold text-slate-900 text-xs truncate">
                              Giay_Phep_KD_{selectedPartner.taxCode}.pdf
                            </div>
                            <div className="text-[11px] text-slate-500 mt-0.5">
                              Dấu mộc đỏ pháp nhân · Định dạng hợp lệ
                            </div>
                          </div>
                        </div>

                        <a
                          href={selectedPartner.licenseUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900 text-xs font-bold transition-all shadow-2xs cursor-pointer"
                        >
                          <ExternalLink className="w-4 h-4 text-[#075985]" />
                          <span>Mở xem tài liệu gốc</span>
                        </a>
                      </div>
                    </div>

                    {selectedPartner.rejectionReason && (
                      <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 space-y-1.5 text-xs">
                        <div className="font-bold text-rose-950 flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                          <span>Lý do từ chối trước đó:</span>
                        </div>
                        <p className="text-rose-800 leading-relaxed italic pl-6">
                          "{selectedPartner.rejectionReason}"
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* FOOTER ACTIONS */}
              <div className="px-7 py-4.5 bg-white border-t border-slate-200/80 flex items-center justify-between gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowDetailModal(false)}
                  className="text-xs h-10 px-5 rounded-xl cursor-pointer font-semibold border-slate-300"
                >
                  Đóng
                </Button>

                <div className="flex items-center gap-2.5">
                  {selectedPartner.status === "approved" && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowDetailModal(false);
                        handleOpenToggleStatusModal(selectedPartner);
                      }}
                      className="h-10 px-4 text-xs font-bold gap-1.5 cursor-pointer rounded-xl border border-slate-300 hover:bg-slate-100"
                    >
                      <RefreshCw className="w-4 h-4 text-slate-600" />
                      <span>
                        {suspendedPartnerIds.has(selectedPartner.id) || selectedPartner.isSuspended
                          ? "Thay đổi trạng thái: Kích hoạt lại"
                          : "Thay đổi trạng thái: Đình chỉ"}
                      </span>
                    </Button>
                  )}

                  {selectedPartner.status === "pending" && (
                    <>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setShowDetailModal(false);
                          handleOpenRejectModal(selectedPartner);
                        }}
                        className="h-10 px-4.5 border-rose-300 text-rose-700 hover:bg-rose-50 text-xs font-bold gap-1.5 cursor-pointer rounded-xl"
                      >
                        <X className="w-4 h-4" />
                        <span>Từ chối hồ sơ</span>
                      </Button>

                      <Button
                        type="button"
                        onClick={() => {
                          setShowDetailModal(false);
                          handleOpenApproveModal(selectedPartner);
                        }}
                        className="h-10 px-5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-2 cursor-pointer shadow-xs rounded-xl"
                      >
                        <Check className="w-4 h-4" />
                        <span>Phê duyệt hồ sơ</span>
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}