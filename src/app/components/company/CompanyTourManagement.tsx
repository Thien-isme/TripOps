import { useState, useRef } from "react";
import {
  Tour,
  TourCompany,
  DailyItinerary,
  TourPriceRow,
  TourMeal,
  TourAlternativeMeal,
  TourHotel,
  TourAlternativeHotel,
  Location,
  TourVersion,
  CustomTourRequest,
} from "@/app/types";
import {
  Plus,
  Edit,
  Trash2,
  Copy,
  Package,
  MapPin,
  Clock,
  Users,
  Star,
  DollarSign,
  Building2,
  Calendar,
  Sparkles,
  Utensils,
  CheckCircle,
  XCircle,
  Info,
  ChevronDown,
  ChevronUp,
  X,
  Upload,
  Image as ImageIcon,
  Check,
  Eye,
  RefreshCw,
  GripVertical,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  Sun,
  History,
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/dialog";
import { Input } from "@/app/components/ui/input";
import { Textarea } from "@/app/components/ui/textarea";
import { Label } from "@/app/components/ui/label";
import { TourVersionHistoryModal } from "@/app/components/company/TourVersionHistoryModal";

interface CompanyTourManagementProps {
  tours: Tour[];
  company: TourCompany;
  onCreateTour: (tour: Omit<Tour, "id">) => void;
  onEditTour: (tourId: string, tour: Partial<Tour>) => void;
  onDeleteTour: (tourId: string) => void;
  onRestoreTourVersion?: (tourId: string, versionNumber: number) => void;
}

export function CompanyTourManagement({
  tours,
  company,
  onCreateTour,
  onEditTour,
  onDeleteTour,
  onRestoreTourVersion,
}: CompanyTourManagementProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTour, setEditingTour] = useState<Tour | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [copiedNotice, setCopiedNotice] = useState<string | null>(null);
  const [versionHistoryTour, setVersionHistoryTour] = useState<Tour | null>(null);
  const [tourTypeFilter, setTourTypeFilter] = useState<"all" | "public" | "custom">("all");

  const isApproved = company.status === "approved";

  const publicCount = tours.filter((t) => t.tourType !== "custom_request").length;
  const customCount = tours.filter((t) => t.tourType === "custom_request").length;

  const filteredTours = tours.filter((t) => {
    if (tourTypeFilter === "public") return t.tourType !== "custom_request";
    if (tourTypeFilter === "custom") return t.tourType === "custom_request";
    return true;
  });

  // Duplicate Tour Action
  const handleDuplicateTour = (sourceTour: Tour) => {
    const newTourCode = `T${Date.now().toString().slice(-4)}`;
    const duplicatedTourData: Omit<Tour, "id"> = {
      ...JSON.parse(JSON.stringify(sourceTour)),
      tourCode: newTourCode,
      name: `${sourceTour.name} (Bản sao)`,
      bookings: 0,
      createdAt: new Date().toLocaleDateString("vi-VN"),
      companyId: company.id,
      companyName: company.name,
      companyLogo: company.logo,
    };
    onCreateTour(duplicatedTourData);
    setCopiedNotice(`Đã nhân bản thành công "${sourceTour.name}"!`);
    setTimeout(() => setCopiedNotice(null), 3500);
  };

  // Chuyển sang màn hình trang riêng biệt TourFormPage khi tạo hoặc chỉnh sửa tour
  if (showCreateModal || !!editingTour) {
    return (
      <TourFormPage
        tour={editingTour}
        company={company}
        isCustomTour={editingTour?.tourType === "custom_request"}
        onBack={() => {
          setShowCreateModal(false);
          setEditingTour(null);
        }}
        onSubmit={(data) => {
          if (editingTour) {
            onEditTour(editingTour.id, data);
            setEditingTour(null);
          } else {
            onCreateTour(data as Omit<Tour, "id">);
            setShowCreateModal(false);
          }
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Quản lý Tour</h2>
          <p className="text-sm text-gray-500 mt-1">
            {tours.length} tour tổng cộng · {publicCount} tour công khai · {customCount} tour thiết kế riêng
          </p>
        </div>
        <Button
          disabled={!isApproved}
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Tạo Tour mới
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-3">
        <button
          onClick={() => setTourTypeFilter("all")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            tourTypeFilter === "all"
              ? "bg-blue-600 text-white shadow-xs"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          Tất cả ({tours.length})
        </button>
        <button
          onClick={() => setTourTypeFilter("public")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            tourTypeFilter === "public"
              ? "bg-blue-600 text-white shadow-xs"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          Tour công khai ({publicCount})
        </button>
        <button
          onClick={() => setTourTypeFilter("custom")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
            tourTypeFilter === "custom"
              ? "bg-purple-600 text-white shadow-xs"
              : "bg-purple-50 text-purple-700 hover:bg-purple-100"
          }`}
        >
          <span>✨ Tour thiết kế theo yêu cầu ({customCount})</span>
        </button>
      </div>

      {copiedNotice && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 flex items-center justify-between text-sm text-emerald-800 animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>{copiedNotice}</span>
          </div>
          <button
            onClick={() => setCopiedNotice(null)}
            className="text-emerald-600 hover:text-emerald-900 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {!isApproved && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-700">
          Công ty chưa được phê duyệt. Bạn cần được nền tảng phê duyệt để tạo và đăng tour.
        </div>
      )}

      {filteredTours.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">
            {tourTypeFilter === "custom"
              ? "Chưa có tour thiết kế riêng nào"
              : tourTypeFilter === "public"
              ? "Chưa có tour công khai nào"
              : "Chưa có tour nào"}
          </p>
          {isApproved && tourTypeFilter !== "custom" && (
            <Button className="mt-4" onClick={() => setShowCreateModal(true)}>
              Tạo tour đầu tiên
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredTours.map((tour) => {
            const isCustom = tour.tourType === "custom_request";
            return (
              <div
                key={tour.id}
                className={`bg-white rounded-xl border overflow-hidden hover:shadow-md transition-shadow flex flex-col justify-between ${
                  isCustom ? "border-purple-300 ring-1 ring-purple-100" : "border-gray-200"
                }`}
              >
                <div>
                  <div className="relative h-44">
                    <img
                      src={tour.image || (tour.images && tour.images[0]) || "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800"}
                      alt={tour.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1 shadow-sm">
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                      <span className="text-xs font-semibold">{tour.rating}</span>
                    </div>

                    {isCustom ? (
                      <div className="absolute top-2 left-2 bg-purple-600 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1">
                        <span>🔒 Theo yêu cầu (v{tour.version || 1})</span>
                      </div>
                    ) : (
                      <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
                        {tour.tourCode}
                      </div>
                    )}

                    {tour.images && tour.images.length > 1 && (
                      <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-xs text-white text-[11px] px-2 py-0.5 rounded font-medium">
                        +{tour.images.length} ảnh
                      </div>
                    )}
                    {tour.operationPeriod && (
                      <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-xs text-white text-[11px] px-2 py-0.5 rounded">
                        {tour.operationPeriod}
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    {isCustom && tour.targetCustomerName && (
                      <div className="mb-2 bg-purple-50 text-purple-800 text-[11px] font-semibold px-2 py-1 rounded-md flex items-center justify-between border border-purple-200">
                        <span>Khách: {tour.targetCustomerName}</span>
                        {tour.targetCustomerPhone && <span className="text-purple-600">{tour.targetCustomerPhone}</span>}
                      </div>
                    )}

                    <h3 className="font-bold text-gray-900 text-sm leading-snug mb-2 line-clamp-2">
                      {tour.name}
                    </h3>

                    {isCustom && tour.changeNote && (
                      <p className="text-[11px] text-amber-700 bg-amber-50 rounded px-2 py-1 mb-2 line-clamp-2 border border-amber-200 italic">
                        📝 v{tour.version || 1}: {tour.changeNote}
                      </p>
                    )}

                    <div className="space-y-1.5 text-xs text-gray-500 mb-3">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-blue-500" />
                        <span>{tour.destination}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-blue-500" />
                        <span>{tour.duration} ({tour.itinerary?.length ?? tour.numberOfDays ?? 0} ngày lịch trình)</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-blue-500" />
                        <span>{tour.minGuests} – {tour.maxGuests} khách</span>
                      </div>
                      {tour.highlights && tour.highlights.length > 0 && (
                        <p className="text-[11px] text-gray-400 line-clamp-1 italic">
                          ★ {tour.highlights.slice(0, 2).join(" • ")}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="px-4 pb-4">
                  <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                    <div>
                      <p className="text-[11px] text-gray-400">Giá cơ bản từ</p>
                      <p className="text-base font-extrabold text-blue-600">
                        {tour.price.toLocaleString("vi-VN")}đ
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      {isCustom && (
                        <button
                          type="button"
                          title="Lịch sử phiên bản & Phục hồi (Version Backup/Restore)"
                          onClick={() => setVersionHistoryTour(tour)}
                          className="p-2 text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded-lg transition-colors"
                        >
                          <History className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        type="button"
                        title="Nhân bản tour (Duplicate)"
                        onClick={() => handleDuplicateTour(tour)}
                        className="p-2 text-gray-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        title="Chỉnh sửa chi tiết tour"
                        onClick={() => setEditingTour(tour)}
                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        title="Xóa tour"
                        onClick={() => setConfirmDeleteId(tour.id)}
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Version History Modal */}
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


      {/* Delete confirmation */}
      <Dialog
        open={!!confirmDeleteId}
        onOpenChange={() => setConfirmDeleteId(null)}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Xóa tour</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600">
            Bạn có chắc muốn xóa tour này? Toàn bộ thông tin lịch trình, giá và quy định của tour sẽ bị xóa. Hành động này không thể hoàn tác.
          </p>
          <div className="flex gap-2 justify-end mt-4">
            <Button variant="outline" onClick={() => setConfirmDeleteId(null)}>
              Hủy
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={() => {
                if (confirmDeleteId) {
                  onDeleteTour(confirmDeleteId);
                  setConfirmDeleteId(null);
                }
              }}
            >
              Xác nhận xóa
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// =========================================================================
// COMPREHENSIVE TOUR FORM STANDALONE PAGE (CHUYỂN THÀNH TRANG RIÊNG BIỆT)
// =========================================================================

export interface TourFormPageProps {
  tour: Tour | null;
  company: TourCompany;
  onBack: () => void;
  onSubmit: (data: Partial<Tour>) => void;
  customRequest?: CustomTourRequest | null;
  isCustomTour?: boolean;
}

type TabType = "general" | "itinerary" | "pricing" | "regulations" | "preview";

function formatVND(n: number) {
  return n.toLocaleString("vi-VN") + "đ";
}

export const SYSTEM_CATALOG_HOTELS = [
  { name: "Dalat Edensee Lake Resort & Spa", stars: 5, priceDifference: 400000, description: "Resort ven hồ Tuyền Lâm – Không gian nghỉ dưỡng đẳng cấp" },
  { name: "Ana Mandara Villas Dalat Resort", stars: 5, priceDifference: 750000, description: "Khu resort biệt thự Pháp cổ giữa rừng thông bạt ngàn" },
  { name: "MerPerle Dalat Hotel", stars: 5, priceDifference: 1200000, description: "Khách sạn phong cách cổ điển lộng lẫy, dịch vụ chuẩn mực" },
  { name: "Tuyền Lâm Lake View Resort", stars: 4, priceDifference: 1800000, description: "Khu nghỉ dưỡng cao cấp hòa quyện thiên nhiên hồ Tuyền Lâm" },
  { name: "Terracotta Hotel & Resort Dalat", stars: 4, priceDifference: 300000, description: "Resort bán đảo hồ Tuyền Lâm với nhiều tiện ích thư giãn" },
  { name: "TTC Hotel Premium Ngọc Lan", stars: 4, priceDifference: -350000, description: "Khách sạn ngay chợ Đà Lạt, view toàn cảnh hồ Xuân Hương" },
  { name: "Khách sạn Sammy Đà Lạt", stars: 4, priceDifference: -600000, description: "Khách sạn phong cách Pháp trung tâm thành phố, tiện nghi" },
  { name: "Khách sạn Golf 3 Đà Lạt", stars: 3, priceDifference: -800000, description: "Khách sạn ngay phố đi bộ, thuận tiện mua sắm và ẩm thực" },
];

export const SYSTEM_CATALOG_RESTAURANTS = [
  // Bữa sáng (Breakfast)
  {
    restaurantName: "Buffet sáng tiêu chuẩn tại Khách sạn",
    mealType: "breakfast" as const,
    priceDifference: 0,
    description: "Buffet sáng phong phú nhiều món Á - Âu kèm trà, cà phê tại khách sạn",
  },
  {
    restaurantName: "Bánh căn Lệ Đà Lạt",
    mealType: "breakfast" as const,
    priceDifference: 20000,
    description: "Bánh căn giòn rụm xíu mại trứng cút, nước mắm hành mỡ cay nồng",
  },
  {
    restaurantName: "Bánh mì xíu mại Hoàng Diệu",
    mealType: "breakfast" as const,
    priceDifference: 15000,
    description: "Bánh mì giòn chấm chén xíu mại nóng hổi béo ngậy đặc sản Đà Lạt",
  },
  {
    restaurantName: "Phở thố đá Chu Gia Đà Lạt",
    mealType: "breakfast" as const,
    priceDifference: 35000,
    description: "Phở bò thố đá sôi sục giữ trọn hương vị tươi ngọt đậm đà",
  },
  {
    restaurantName: "Bún bò Huế ấp Ánh Sáng",
    mealType: "breakfast" as const,
    priceDifference: 25000,
    description: "Tô bún bò đậm đà thơm mùi sả ruốc hương vị cố đô giữa lòng phố núi",
  },
  // Bữa trưa (Lunch)
  {
    restaurantName: "Nhà hàng Trúc Lâm Viên",
    mealType: "lunch" as const,
    priceDifference: 30000,
    description: "Cơm niêu gia đình, cá kho tộ, canh atiso sườn non",
  },
  {
    restaurantName: "Nhà hàng Leguda Buffet Rau Cáp Treo",
    mealType: "lunch" as const,
    priceDifference: 40000,
    description: "Buffet rau sạch không giới hạn đồi Robin view cáp treo",
  },
  {
    restaurantName: "Nhà hàng Làng Nướng Đà Lạt",
    mealType: "lunch" as const,
    priceDifference: 50000,
    description: "Thịt rừng nướng ngói, rau rừng xào tỏi thơm lừng",
  },
  {
    restaurantName: "Nhà hàng Song May Đà Lạt",
    mealType: "lunch" as const,
    priceDifference: 70000,
    description: "Ẩm thực truyền thống Việt Nam trong không gian nhà gỗ cổ kính",
  },
  {
    restaurantName: "Cơm lam Gà nướng Tam Nguyên",
    mealType: "lunch" as const,
    priceDifference: -20000,
    description: "Đặc sản dân dã gà đồi nướng than hoa, cơm lam ống tre",
  },
  // Bữa tối (Dinner)
  {
    restaurantName: "Nhà hàng Lẩu Gà Lá É Tao Ngộ",
    mealType: "dinner" as const,
    priceDifference: 40000,
    description: "Đặc sản lẩu gà lá é trứ danh thơm cay ấm cúng giữa đêm sương",
  },
  {
    restaurantName: "Nhà hàng Quán Nướng Chu",
    mealType: "dinner" as const,
    priceDifference: 60000,
    description: "Món nướng đá ngói, bò tơ nướng sa tế đậm đà nức tiếng",
  },
  {
    restaurantName: "Nhà hàng Dalat Palace Ristorante",
    mealType: "dinner" as const,
    priceDifference: 200000,
    description: "Ẩm thực Fine Dining Âu - Á cao cấp sang trọng chuẩn 5 sao",
  },
  {
    restaurantName: "Nhà hàng La Viet Fine Dining",
    mealType: "dinner" as const,
    priceDifference: 130000,
    description: "Trải nghiệm ẩm thực phong cách đương đại kết hợp cà phê bản địa",
  },
  {
    restaurantName: "Lẩu bò Ba Toa Quán Gỗ",
    mealType: "dinner" as const,
    priceDifference: -15000,
    description: "Lẩu bò đậm đà phong vị Đà Lạt truyền thống nổi tiếng",
  },
];

export function TourFormPage({
  tour,
  company,
  onBack,
  onSubmit,
  customRequest,
  isCustomTour,
}: TourFormPageProps) {
  const isCustom = isCustomTour || !!customRequest || tour?.tourType === "custom_request";
  const [changeNote, setChangeNote] = useState("");
  const [activeTab, setActiveTab] = useState<TabType>("general");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Tab 1: General Info
  const [name, setName] = useState(
    tour?.name ?? (customRequest ? `Tour riêng: ${customRequest.destination} - Khách đoàn ${customRequest.customerName}` : "")
  );
  const [destination, setDestination] = useState(
    tour?.destination ?? (customRequest?.destination ?? "")
  );
  const [duration, setDuration] = useState(
    tour?.duration ?? (customRequest ? `${customRequest.numberOfDays} ngày ${Math.max(1, customRequest.numberOfDays - 1)} đêm` : "3 ngày 2 đêm")
  );
  const [numberOfDays, setNumberOfDays] = useState(
    tour?.numberOfDays ?? (customRequest?.numberOfDays ?? 3)
  );
  const [numberOfNights, setNumberOfNights] = useState(
    tour?.numberOfNights ?? (customRequest ? Math.max(1, customRequest.numberOfDays - 1) : 2)
  );
  const [price, setPrice] = useState(
    tour?.price ?? (customRequest?.estimatedBudget ? Math.round(customRequest.estimatedBudget / (customRequest.numberOfGuests || 1)) : 3500000)
  );

  // Photos & Thumbnail
  const initialImages: string[] = tour?.images && tour.images.length > 0
    ? tour.images
    : tour?.image
    ? [tour.image]
    : [
        "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800",
        "https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=800",
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
      ];
  const [images, setImages] = useState<string[]>(initialImages);
  const [thumbnailIndex, setThumbnailIndex] = useState<number>(0);

  // Operation period
  const [operationPeriod, setOperationPeriod] = useState(
    tour?.operationPeriod ?? "Khởi hành theo thỏa thuận với khách"
  );
  const [minGuests, setMinGuests] = useState(
    tour?.minGuests ?? (customRequest?.numberOfGuests ?? 2)
  );
  const [maxGuests, setMaxGuests] = useState(
    tour?.maxGuests ?? (customRequest ? customRequest.numberOfGuests + 2 : 20)
  );
  const [description, setDescription] = useState(
    tour?.description ?? (customRequest?.specialRequests ? `Tour thiết kế riêng theo yêu cầu của ${customRequest.customerName}.\nYêu cầu đặc biệt: ${customRequest.specialRequests}` : "")
  );
  const [highlights, setHighlights] = useState<string[]>(
    tour?.highlights && tour.highlights.length > 0
      ? tour.highlights
      : [
          "Tham quan danh lam thắng cảnh đặc sắc nhất điểm đến",
          "Thưởng thức các bữa ăn đặc sản địa phương phong phú",
          "Nghỉ dưỡng tại hệ thống khách sạn/resort tiêu chuẩn cao",
        ]
  );
  const [newHighlight, setNewHighlight] = useState("");

  // Tab 2 - Section 1: Danh sách Khách sạn lưu trú & Cấu hình Đổi hạng khách sạn
  const [hotels, setHotels] = useState<TourHotel[]>(() => {
    if (tour?.hotels && tour.hotels.length > 0) {
      return JSON.parse(JSON.stringify(tour.hotels));
    }
    const found = tour?.itinerary?.find((d) => d.hotel)?.hotel;
    const defaultAlternatives: TourAlternativeHotel[] = [
      { id: "alt-1", name: "Dalat Edensee Lake Resort & Spa", stars: 5, priceDifference: 400000, description: "Resort ven hồ Tuyền Lâm – Không gian nghỉ dưỡng đẳng cấp" },
      { id: "alt-2", name: "Ana Mandara Villas Dalat Resort", stars: 5, priceDifference: 750000, description: "Khu resort biệt thự Pháp cổ giữa rừng thông bạt ngàn" },
      { id: "alt-3", name: "MerPerle Dalat Hotel", stars: 5, priceDifference: 1200000, description: "Khách sạn phong cách cổ điển lộng lẫy, dịch vụ chuẩn mực" },
      { id: "alt-4", name: "Terracotta Hotel & Resort Dalat", stars: 4, priceDifference: 300000, description: "Resort bán đảo hồ Tuyền Lâm với nhiều tiện ích thư giãn" },
      { id: "alt-5", name: "TTC Hotel Premium Ngọc Lan", stars: 4, priceDifference: -350000, description: "Khách sạn ngay chợ Đà Lạt, view toàn cảnh hồ Xuân Hương" },
      { id: "alt-6", name: "Khách sạn Sammy Đà Lạt", stars: 4, priceDifference: -600000, description: "Khách sạn phong cách Pháp trung tâm thành phố, tiện nghi" },
    ];

    if (found) {
      return [
        {
          id: "hotel-1",
          name: found.name,
          destination: tour?.destination || "Đà Lạt",
          nights: tour?.numberOfNights ?? 2,
          stars: found.stars || 4,
          pricePerNight: found.pricePerNight || 2800000,
          description: found.description || "Khách sạn cao cấp view đẹp",
          address: found.address || "Trung tâm thành phố",
          allowCustomHotelRequest: true,
          alternativeHotels: defaultAlternatives,
        },
      ];
    }
    return [
      {
        id: "hotel-1",
        name: "Khách sạn Đà Lạt Palace Heritage",
        destination: tour?.destination || "Đà Lạt",
        nights: tour?.numberOfNights ?? 2,
        stars: 5,
        pricePerNight: 2800000,
        description: "Khách sạn cổ kính trung tâm thành phố, view hồ Xuân Hương",
        address: "02 Trần Phú, Phường 3, TP. Đà Lạt",
        allowCustomHotelRequest: true,
        alternativeHotels: defaultAlternatives,
      },
    ];
  });
  const [expandedHotelId, setExpandedHotelId] = useState<string | null>("hotel-1");

  const addHotel = () => {
    const newId = `hotel-${Date.now()}`;
    const newHotel: TourHotel = {
      id: newId,
      name: "Khách sạn / Resort mới",
      destination: destination || "Điểm đến",
      nights: 1,
      stars: 4,
      pricePerNight: 1500000,
      description: "",
      address: "",
      allowCustomHotelRequest: true,
      alternativeHotels: [],
    };
    setHotels((prev) => [...prev, newHotel]);
    setExpandedHotelId(newId);
  };

  const removeHotel = (id: string) => {
    if (hotels.length > 1) {
      setHotels((prev) => prev.filter((h) => h.id !== id));
    }
  };

  const updateHotel = (id: string, updates: Partial<TourHotel>) => {
    setHotels((prev) => prev.map((h) => (h.id === id ? { ...h, ...updates } : h)));
  };

  // Helpers for Alternative / Upgrade Hotels
  const addAlternativeHotel = (hotelId: string, prefill?: Partial<TourAlternativeHotel>) => {
    const newAlt: TourAlternativeHotel = {
      id: `alt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: prefill?.name || "Khách sạn / Resort nâng cấp",
      stars: prefill?.stars ?? 4,
      priceDifference: prefill?.priceDifference ?? 400000,
      description: prefill?.description || "Không gian nghỉ dưỡng cao cấp, tiện nghi sang trọng",
      address: prefill?.address || "",
    };
    setHotels((prev) =>
      prev.map((h) => {
        if (h.id === hotelId) {
          return {
            ...h,
            alternativeHotels: [...(h.alternativeHotels || []), newAlt],
          };
        }
        return h;
      })
    );
  };

  const updateAlternativeHotel = (
    hotelId: string,
    altId: string,
    updates: Partial<TourAlternativeHotel>
  ) => {
    setHotels((prev) =>
      prev.map((h) => {
        if (h.id === hotelId) {
          return {
            ...h,
            alternativeHotels: (h.alternativeHotels || []).map((alt) =>
              alt.id === altId ? { ...alt, ...updates } : alt
            ),
          };
        }
        return h;
      })
    );
  };

  const removeAlternativeHotel = (hotelId: string, altId: string) => {
    setHotels((prev) =>
      prev.map((h) => {
        if (h.id === hotelId) {
          return {
            ...h,
            alternativeHotels: (h.alternativeHotels || []).filter((alt) => alt.id !== altId),
          };
        }
        return h;
      })
    );
  };

  // Tab 2 - Section 2: Chế độ ẩm thực & Bữa ăn (Có thể thêm hoặc xóa)
  const [expandedMealKey, setExpandedMealKey] = useState<string | null>(null);
  const [showAddMealForm, setShowAddMealForm] = useState(false);
  const [newMealDay, setNewMealDay] = useState(1);
  const [newMealType, setNewMealType] = useState<"breakfast" | "lunch" | "dinner">("lunch");
  const [newMealRestaurant, setNewMealRestaurant] = useState("");
  const [newMealDesc, setNewMealDesc] = useState("");
  const [newMealPrice, setNewMealPrice] = useState(120000);

  const handleAddMeal = () => {
    const dayIdx = itinerary.findIndex((d) => d.day === newMealDay);
    if (dayIdx >= 0) {
      const updated = [...itinerary];
      const dayMeals = [...(updated[dayIdx].meals || [])];
      const label = newMealType === "lunch" ? "Ăn trưa" : newMealType === "dinner" ? "Ăn tối" : "Ăn sáng";
      dayMeals.push({
        type: newMealType,
        serviceName: newMealRestaurant.trim() || `Nhà hàng đặc sản (${label})`,
        description: newMealDesc.trim() || "Thực đơn tiêu chuẩn theo chương trình tour",
        pricePerPerson: newMealPrice || 120000,
      });
      updated[dayIdx].meals = dayMeals;
      setItinerary(updated);
      setNewMealRestaurant("");
      setNewMealDesc("");
      setShowAddMealForm(false);
    }
  };

  const removeMeal = (dayIdx: number, mealIdx: number) => {
    const updated = [...itinerary];
    const currentMeals = updated[dayIdx].meals || [];
    updated[dayIdx].meals = currentMeals.filter((_, i) => i !== mealIdx);
    setItinerary(updated);
  };

  const addMealToDay = (dayIdx: number, mealType: "lunch" | "dinner" | "breakfast" = "lunch") => {
    const updated = [...itinerary];
    const dayMeals = [...(updated[dayIdx].meals || [])];
    const label = mealType === "lunch" ? "Ăn trưa" : mealType === "dinner" ? "Ăn tối" : "Ăn sáng";
    const defaultPrice = mealType === "breakfast" ? 60000 : mealType === "dinner" ? 140000 : 120000;
    const newMeal: TourMeal = {
      type: mealType,
      serviceName: `Nhà hàng đặc sản (${label})`,
      description: "Thực đơn tiêu chuẩn theo chương trình tour",
      pricePerPerson: defaultPrice,
      allowCustomMealRequest: true,
      alternativeMeals: [],
    };
    dayMeals.push(newMeal);
    updated[dayIdx].meals = dayMeals;
    setItinerary(updated);
    setExpandedMealKey(`${updated[dayIdx].id}-${mealType}-${dayMeals.length - 1}`);
  };

  // Helper methods for Alternative Meals (Đổi món / nhà hàng)
  const addAlternativeMeal = (dayIdx: number, mealIdx: number, prefill?: Partial<TourAlternativeMeal>) => {
    const updated = [...itinerary];
    const currentMeals = updated[dayIdx].meals || [];
    if (!currentMeals[mealIdx]) return;
    const targetMeal = currentMeals[mealIdx];
    const newAlt: TourAlternativeMeal = {
      id: `alt-meal-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      restaurantName: prefill?.restaurantName || "Nhà hàng đổi món / nâng cấp",
      priceDifference: prefill?.priceDifference ?? 50000,
      description: prefill?.description || "Thực đơn phong phú, không gian ấm cúng",
      address: prefill?.address || "",
    };
    currentMeals[mealIdx] = {
      ...targetMeal,
      alternativeMeals: [...(targetMeal.alternativeMeals || []), newAlt],
    };
    updated[dayIdx].meals = currentMeals;
    setItinerary(updated);
  };

  const updateAlternativeMeal = (
    dayIdx: number,
    mealIdx: number,
    altId: string,
    updates: Partial<TourAlternativeMeal>
  ) => {
    const updated = [...itinerary];
    const currentMeals = updated[dayIdx].meals || [];
    if (!currentMeals[mealIdx]) return;
    const targetMeal = currentMeals[mealIdx];
    currentMeals[mealIdx] = {
      ...targetMeal,
      alternativeMeals: (targetMeal.alternativeMeals || []).map((alt) =>
        alt.id === altId ? { ...alt, ...updates } : alt
      ),
    };
    updated[dayIdx].meals = currentMeals;
    setItinerary(updated);
  };

  const removeAlternativeMeal = (dayIdx: number, mealIdx: number, altId: string) => {
    const updated = [...itinerary];
    const currentMeals = updated[dayIdx].meals || [];
    if (!currentMeals[mealIdx]) return;
    const targetMeal = currentMeals[mealIdx];
    currentMeals[mealIdx] = {
      ...targetMeal,
      alternativeMeals: (targetMeal.alternativeMeals || []).filter((alt) => alt.id !== altId),
    };
    updated[dayIdx].meals = currentMeals;
    setItinerary(updated);
  };

  const updateMealField = (dayIdx: number, mealIdx: number, updates: Partial<TourMeal>) => {
    const updated = [...itinerary];
    const currentMeals = updated[dayIdx].meals || [];
    if (!currentMeals[mealIdx]) return;
    currentMeals[mealIdx] = { ...currentMeals[mealIdx], ...updates };
    updated[dayIdx].meals = currentMeals;
    setItinerary(updated);
  };

  // Tab 2: Lịch trình chi tiết
  const [itinerary, setItinerary] = useState<DailyItinerary[]>(
    tour?.itinerary && tour.itinerary.length > 0
      ? JSON.parse(JSON.stringify(tour.itinerary))
      : [
          {
            id: `day-1`,
            day: 1,
            date: "2026-03-01",
            title: "TP.HCM – Đà Lạt (Ăn trưa, tối)",
            description: "Hướng dẫn viên Viettravel đón đoàn tại điểm hẹn, xuất phát đi Đà Lạt. Tới nơi nhận phòng khách sạn, ăn trưa nhà hàng địa phương. Buổi chiều tham quan hồ Xuân Hương và Nhà thờ Con Gà. Tối dạo chợ đêm Đà Lạt và thưởng thức ẩm thực đặc sản.",
            destinationCity: "Đà Lạt",
            hotel: {
              name: "Khách sạn Đà Lạt Palace Heritage",
              pricePerNight: 2800000,
              description: "Khách sạn cổ kính trung tâm thành phố, view hồ Xuân Hương",
            },
            meals: [
              { type: "lunch", serviceName: "Nhà hàng Hương Rừng Đà Lạt", description: "Đặc sản gà đồi, cơm lam, rau củ tươi organic Đà Lạt", pricePerPerson: 120000 },
              { type: "dinner", serviceName: "Nhà hàng Chợ Đêm & Phố Ẩm Thực Đà Lạt", description: "Ẩm thực đường phố: bánh tráng nướng, sữa đậu nành", pricePerPerson: 90000 },
            ],
            locations: [
              { id: "loc-1-1", name: "Hồ Xuân Hương", address: "01 Trần Quốc Toản, Phường 1, Đà Lạt", time: "14:00" },
              { id: "loc-1-2", name: "Nhà thờ Con Gà", address: "Trần Phú, Phường 3, Đà Lạt", time: "15:30" },
              { id: "loc-1-3", name: "Chợ đêm Đà Lạt", address: "Nguyễn Thị Minh Khai, Phường 1, Đà Lạt", time: "19:00" },
            ],
          },
          {
            id: `day-2`,
            day: 2,
            date: "2026-03-02",
            title: "Khám phá Đà Lạt (Ăn sáng, trưa, tối)",
            description: "Sau bữa sáng tại khách sạn, đoàn khởi hành tham quan Thung lũng tình yêu, Mê Linh Coffee Garden và Thác Datanla. Buổi chiều ghé Quảng trường Lâm Viên ngắm hoàng hôn. Tối ăn nhà hàng đặc sản địa phương.",
            destinationCity: "Đà Lạt",
            hotel: {
              name: "Khách sạn Đà Lạt Palace Heritage",
              pricePerNight: 2800000,
              description: "Khách sạn cổ kính trung tâm thành phố",
            },
            meals: [
              { type: "breakfast", serviceName: "Khách sạn Đà Lạt Palace Heritage", description: "Buffet sáng tại khách sạn", pricePerPerson: 0 },
              { type: "lunch", serviceName: "Nhà hàng Làng Nướng Đà Lạt", description: "Đặc sản nướng Đà Lạt", pricePerPerson: 130000 },
              { type: "dinner", serviceName: "Nhà hàng La Viet", description: "Ẩm thực Việt Nam đặc sắc", pricePerPerson: 150000 },
            ],
            locations: [
              { id: "loc-2-1", name: "Thung lũng tình yêu", address: "Phường 4, Đà Lạt", time: "08:30" },
              { id: "loc-2-2", name: "Mê Linh Coffee Garden", address: "Đường Hồ Tùng Mậu, Phường 3, Đà Lạt", time: "11:00" },
              { id: "loc-2-3", name: "Thác Datanla", address: "Đèo Prenn, Phường 3, Đà Lạt", time: "14:00" },
              { id: "loc-2-4", name: "Quảng trường Lâm Viên", address: "Trần Quốc Toản, Phường 1, Đà Lạt", time: "17:00" },
            ],
          },
          {
            id: `day-3`,
            day: 3,
            date: "2026-03-03",
            title: "Đà Lạt – TP.HCM (Ăn sáng, trưa)",
            description: "Ăn sáng tại khách sạn, trả phòng. Tham quan Ga Đà Lạt – công trình kiến trúc Pháp cổ điển. Ghé Vườn hoa thành phố chụp ảnh lưu niệm. Ăn trưa rồi lên xe trở về TP.HCM, kết thúc tour.",
            destinationCity: "Đà Lạt",
            meals: [
              { type: "breakfast", serviceName: "Khách sạn Đà Lạt Palace Heritage", description: "Buffet sáng tại khách sạn", pricePerPerson: 0 },
              { type: "lunch", serviceName: "Nhà hàng Trúc Lâm Viên", description: "Cơm phần đặc sản Đà Lạt", pricePerPerson: 100000 },
            ],
            locations: [
              { id: "loc-3-1", name: "Ga Đà Lạt", address: "Quang Trung, Phường 10, Đà Lạt", time: "08:00" },
              { id: "loc-3-2", name: "Vườn hoa thành phố", address: "Đường Hồ Tùng Mậu, Phường 3, Đà Lạt", time: "09:30" },
            ],
          },
        ]
  );

  // Tab 3: Bảng giá vé theo độ tuổi
  const [priceTable, setPriceTable] = useState<TourPriceRow[]>(
    tour?.priceTable && tour.priceTable.length > 0
      ? JSON.parse(JSON.stringify(tour.priceTable))
      : [
          { ageGroup: "adult", ageGroupLabel: "Người lớn", ageRange: "Từ 11 tuổi trở lên", price: 3500000 },
          { ageGroup: "child_2_11", ageGroupLabel: "Trẻ em", ageRange: "Từ 2 đến dưới 11 tuổi", price: 2450000 },
          { ageGroup: "child_under_2", ageGroupLabel: "Em bé", ageRange: "Dưới 2 tuổi", price: 0 },
        ]
  );

  // Tab 4: Quy định & Chính sách
  const [inclusions, setInclusions] = useState<string[]>(
    tour?.inclusions && tour.inclusions.length > 0
      ? tour.inclusions
      : [
          "Xe du lịch máy lạnh đưa đón và tham quan suốt tuyến theo chương trình.",
          "Khách sạn tiêu chuẩn (2–3 khách/phòng tiện nghi).",
          "Các bữa ăn chính và ăn sáng buffet theo chương trình.",
          "Vé vào cổng các điểm tham quan có trong lịch trình.",
          "Hướng dẫn viên chuyên nghiệp nhiệt tình phục vụ đoàn suốt tuyến.",
          "Bảo hiểm du lịch tối đa 50.000.000đ/người.",
          "Nước suối đóng chai (1 chai/người/ngày).",
        ]
  );
  const [exclusions, setExclusions] = useState<string[]>(
    tour?.exclusions && tour.exclusions.length > 0
      ? tour.exclusions
      : [
          "Chi phí cá nhân: giặt ủi, điện thoại, thức uống minibar ngoài chương trình.",
          "Phụ thu phòng đơn (nếu khách đi 1 mình có nhu cầu ở riêng).",
          "Tiền bồi dưỡng (tip) cho tài xế và hướng dẫn viên (tùy tâm).",
          "Thuế VAT (xuất hóa đơn theo yêu cầu).",
        ]
  );
  const [regulations, setRegulations] = useState<string[]>(
    tour?.regulations && tour.regulations.length > 0
      ? tour.regulations
      : [
          "Quý khách vui lòng có mặt tại điểm hẹn trước giờ khởi hành 15–30 phút.",
          "Mang theo giấy tờ tùy thân hợp lệ (CMND/CCCD/Hộ chiếu bản gốc).",
          "Trẻ em phải có người lớn đi kèm và mang theo giấy khai sinh.",
          "Lịch trình có thể thay đổi thứ tự điểm đến theo tình hình thực tế nhưng vẫn đảm bảo đủ điểm.",
        ]
  );
  const [companyNote, setCompanyNote] = useState(
    tour?.companyNote ?? `${company.name.toUpperCase()} KÍNH CHÚC QUÝ KHÁCH MỘT CHUYẾN ĐI THÚ VỊ VÀ Ý NGHĨA!`
  );

  const [newInclusion, setNewInclusion] = useState("");
  const [newExclusion, setNewExclusion] = useState("");
  const [newRegulation, setNewRegulation] = useState("");

  const [previewActiveTab, setPreviewActiveTab] = useState<"program" | "regulations" | "pricing" | "custom" | "reviews">("program");
  const [previewExpandedDays, setPreviewExpandedDays] = useState<Set<string>>(new Set([itinerary[0]?.id || "day-1"]));

  const togglePreviewDay = (id: string) => {
    setPreviewExpandedDays((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Handle local image file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const result = uploadEvent.target?.result as string;
        if (result) {
          setImages((prev) => [...prev, result]);
        }
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = (idx: number) => {
    if (images.length <= 1) return;
    const updated = images.filter((_, i) => i !== idx);
    setImages(updated);
    if (thumbnailIndex >= updated.length) {
      setThumbnailIndex(0);
    }
  };

  // Drag and drop state & swap for attraction points
  const [draggedLocation, setDraggedLocation] = useState<{ dayIdx: number; locIdx: number } | null>(null);
  const [dragOverLocation, setDragOverLocation] = useState<{ dayIdx: number; locIdx: number } | null>(null);

  const moveLocation = (dayIdx: number, fromIdx: number, toIdx: number) => {
    const updated = [...itinerary];
    const locs = [...updated[dayIdx].locations];
    if (toIdx < 0 || toIdx >= locs.length) return;
    const [moved] = locs.splice(fromIdx, 1);
    locs.splice(toIdx, 0, moved);
    updated[dayIdx].locations = locs;
    setItinerary(updated);
  };

  // Helpers for Days
  const addDay = () => {
    const nextDayNum = itinerary.length + 1;
    const nextNights = Math.max(0, nextDayNum - 1);
    const newDay: DailyItinerary = {
      id: `day-${Date.now()}`,
      day: nextDayNum,
      date: new Date(Date.now() + nextDayNum * 86400000).toISOString().split("T")[0],
      title: `Ngày ${nextDayNum}: Tiếp tục hành trình (Ăn trưa, tối)`,
      description: "Đoàn tiếp tục tham quan các điểm du lịch nổi tiếng...",
      destinationCity: destination || "Điểm đến",
      hotel: {
        name: itinerary[0]?.hotel?.name || hotels[0]?.name || "Khách sạn lưu trú tiêu chuẩn",
        pricePerNight: itinerary[0]?.hotel?.pricePerNight || hotels[0]?.pricePerNight || 2800000,
        description: "Khách sạn lưu trú tiêu chuẩn",
      },
      meals: [
        { type: "lunch", serviceName: "Nhà hàng Trúc Lâm Viên", description: "Bữa trưa đặc sản", pricePerPerson: 140000 },
        { type: "dinner", serviceName: "Nhà hàng Làng Nướng Đà Lạt", description: "Bữa tối tiêu chuẩn", pricePerPerson: 160000 },
      ],
      locations: [
        { id: `loc-${Date.now()}-1`, name: "Điểm tham quan mới", address: "", time: "09:00" },
      ],
    };
    const updated = [...itinerary, newDay];
    setItinerary(updated);
    setNumberOfDays(nextDayNum);
    setNumberOfNights(nextNights);
    setDuration(`${nextDayNum} ngày ${nextNights} đêm`);
  };

  const removeDay = (idx: number) => {
    if (itinerary.length <= 1) return;
    const updated = itinerary.filter((_, i) => i !== idx).map((d, i) => ({
      ...d,
      day: i + 1,
    }));
    const daysCount = updated.length;
    const nightsCount = Math.max(0, daysCount - 1);
    setItinerary(updated);
    setNumberOfDays(daysCount);
    setNumberOfNights(nightsCount);
    setDuration(`${daysCount} ngày ${nightsCount} đêm`);
  };

  const addLocationToDay = (dayIdx: number) => {
    const updated = [...itinerary];
    updated[dayIdx].locations.push({
      id: `loc-${Date.now()}`,
      name: "Điểm tham quan mới",
      address: "",
      time: "10:00",
    });
    setItinerary(updated);
  };

  const removeLocationFromDay = (dayIdx: number, locIdx: number) => {
    const updated = [...itinerary];
    updated[dayIdx].locations = updated[dayIdx].locations.filter((_, i) => i !== locIdx);
    setItinerary(updated);
  };

  const handleSubmit = () => {
    const tourCode = tour?.tourCode ?? (isCustom ? `TC-${Date.now().toString().slice(-4)}` : `T${Date.now().toString().slice(-4)}`);
    const chosenThumbnail = images[thumbnailIndex] || images[0] || "";

    let nextVersion = tour?.version || 1;
    let nextVersionHistory = tour?.versionHistory ? [...tour.versionHistory] : [];

    if (isCustom) {
      if (tour) {
        const snapshot: TourVersion = {
          version: tour.version || 1,
          createdAt: new Date().toISOString(),
          createdByName: company.name,
          changeNote: changeNote.trim() || `Cập nhật phiên bản v${tour.version || 1}`,
          tourSnapshot: JSON.parse(JSON.stringify(tour)),
        };
        nextVersionHistory = [snapshot, ...nextVersionHistory];
        nextVersion = (tour.version || 1) + 1;
      } else {
        nextVersion = 1;
      }
    }

    const tourData: Partial<Tour> = {
      tourCode,
      name,
      destination,
      duration,
      numberOfDays,
      numberOfNights,
      price,
      image: chosenThumbnail,
      images,
      operationPeriod,
      minGuests,
      maxGuests,
      description,
      highlights: highlights.filter((h) => h.trim().length > 0),
      hotels,
      itinerary,
      priceTable,
      inclusions: inclusions.filter((i) => i.trim().length > 0),
      exclusions: exclusions.filter((e) => e.trim().length > 0),
      regulations: regulations.filter((r) => r.trim().length > 0),
      companyNote,
      rating: tour?.rating ?? 4.8,
      companyId: company.id,
      companyName: company.name,
      companyLogo: company.logo,
      tourType: isCustom ? "custom_request" : (tour?.tourType || "public"),
      customRequestId: customRequest?.id || tour?.customRequestId,
      targetUserId: customRequest?.userId || tour?.targetUserId,
      targetCustomerName: customRequest?.customerName || tour?.targetCustomerName,
      targetCustomerPhone: customRequest?.customerPhone || tour?.targetCustomerPhone,
      targetCustomerEmail: customRequest?.customerEmail || tour?.targetCustomerEmail,
      version: isCustom ? nextVersion : tour?.version,
      changeNote: isCustom
        ? (changeNote.trim() || (tour ? `Cập nhật phiên bản v${nextVersion}` : "Phiên bản thiết kế đầu tiên theo yêu cầu"))
        : tour?.changeNote,
      versionHistory: isCustom ? nextVersionHistory : tour?.versionHistory,
    };

    onSubmit(tourData);
    onBack();
  };

  const chosenThumbnail = images[thumbnailIndex] || images[0] || "";
  const mainHotel = hotels[0];
  const hotelNights = hotels.reduce((sum, h) => sum + (h.nights || 1), 0);

  return (
    <div className="bg-slate-50 min-h-screen pb-16 space-y-6 -m-6">
      {/* Sticky Top Header Bar */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-200 px-6 py-3.5 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 font-medium px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại danh sách</span>
          </button>
          <div className="h-5 w-px bg-gray-200" />
          <div>
            <h1 className="text-base sm:text-lg font-bold text-gray-900 leading-tight flex items-center gap-2">
              <Package className={`w-5 h-5 ${isCustom ? "text-purple-600" : "text-blue-600"}`} />
              {isCustom
                ? (tour ? `Chỉnh sửa Tour Theo Yêu Cầu: ${tour.name} (v${tour.version || 1})` : "Thiết Kế Tour Riêng Theo Yêu Cầu Của Khách")
                : (tour ? `Chỉnh sửa Tour: ${tour.name}` : "Thiết kế & Tạo Tour Du lịch Mới")}
            </h1>
            <p className="text-xs text-gray-500">
              {isCustom
                ? `Mã tour: ${tour?.tourCode || "TC-NEW"} · Khách hàng: ${customRequest?.customerName || tour?.targetCustomerName || "Khách đặt riêng"}`
                : (tour ? `Mã tour: ${tour?.tourCode || "T-NEW"} · Cập nhật thông tin chi tiết` : "Cấu hình đầy đủ thông tin, hình ảnh, chỗ ở, chỗ ăn, lộ trình chi tiết và bảng giá")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            className="text-gray-600"
          >
            Hủy bỏ
          </Button>
          <Button
            type="button"
            disabled={!name.trim() || !destination.trim()}
            onClick={handleSubmit}
            className={`${
              isCustom
                ? "bg-purple-600 hover:bg-purple-700 text-white"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            } font-semibold shadow-xs`}
          >
            <Check className="w-4 h-4 mr-1.5" />
            {isCustom
              ? (tour ? `Lưu phiên bản mới (v${(tour.version || 1) + 1})` : "Hoàn tất & Lưu Tour Thiết Kế")
              : (tour ? "Lưu thay đổi Tour" : "Hoàn tất & Đăng Tour")}
          </Button>
        </div>
      </div>

      {/* Custom Tour Banner & Change Note Input */}
      {isCustom && (
        <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-950 text-white px-6 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-md border-b border-purple-700">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="bg-purple-500/30 text-purple-200 border border-purple-400/50 text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5">
              <span>🔒</span> TOUR THIẾT KẾ RIÊNG
            </span>
            <span className="text-sm font-semibold">
              Khách hàng: <span className="text-purple-200">{customRequest?.customerName || tour?.targetCustomerName || "Yêu cầu từ khách"}</span>
              {(customRequest?.customerPhone || tour?.targetCustomerPhone) && (
                <span className="text-purple-300 ml-1">({customRequest?.customerPhone || tour?.targetCustomerPhone})</span>
              )}
            </span>
            <span className="bg-purple-800 text-purple-200 text-xs px-2.5 py-0.5 rounded-full font-mono font-bold border border-purple-600">
              {tour ? `Phiên bản hiện tại: v${tour.version || 1} ➔ Dự kiến lưu: v${(tour.version || 1) + 1}` : "Phiên bản đầu tiên: v1"}
            </span>
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <span className="text-xs text-purple-200 font-medium whitespace-nowrap">Ghi chú thay đổi (Change Note):</span>
            <input
              type="text"
              value={changeNote}
              onChange={(e) => setChangeNote(e.target.value)}
              placeholder={tour ? `Ghi chú cho v${(tour.version || 1) + 1} (VD: Đổi khách sạn sang TTC Premium...)` : "Ghi chú ban đầu..."}
              className="text-xs bg-purple-950/80 text-white placeholder-purple-400 border border-purple-500/50 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-purple-400 flex-1 md:w-80"
            />
          </div>
        </div>
      )}

      {/* Sticky Tabs Bar */}
      <div className="bg-white border-y border-gray-200 px-6 shadow-2xs sticky top-[57px] z-20">
        <div className="flex overflow-x-auto gap-1">
          {[
            { id: "general", label: "1. Thông tin chung, Ảnh & Điểm nhấn" },
            { id: "itinerary", label: "2. Chỗ ở, Chỗ ăn & Lịch trình chi tiết" },
            { id: "pricing", label: "3. Bảng giá vé theo độ tuổi" },
            { id: "regulations", label: "4. Quy định & Chính sách" },
            { id: "preview", label: "5. Mô phỏng Tour hiển thị (Preview)" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`py-3.5 px-4 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                activeTab === tab.id
                  ? "border-blue-600 text-blue-700 bg-blue-50/50"
                  : "border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              {tab.id === "preview" && <Eye className="w-4 h-4 text-purple-600" />}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Page Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-6">
          {/* TAB 1: THÔNG TIN CHUNG, HÌNH ẢNH & ĐIỂM NHẤN */}
          {activeTab === "general" && (
            <div className="space-y-6">
              {/* UPLOAD MULTIPLE IMAGES & CHOOSE THUMBNAIL */}
              <div className="bg-blue-50/60 border border-blue-200 rounded-2xl p-4.5 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <Label className="text-sm font-bold text-blue-950 flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-blue-600" />
                      Hình ảnh của Tour (Tải lên từ máy tính &amp; Chọn Thumbnail)
                    </Label>
                    <p className="text-xs text-blue-700 mt-0.5">
                      Chọn ảnh từ máy tính. Nhấp vào ảnh để đặt làm <strong>Ảnh đại diện (Thumbnail)</strong> chính thức.
                    </p>
                  </div>
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="tour-file-uploader"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-white border-blue-300 text-blue-700 hover:bg-blue-50 text-xs gap-1.5 shadow-xs"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      Tải ảnh từ máy tính
                    </Button>
                  </div>
                </div>

                {/* Thumbnails grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3 pt-2">
                  {images.map((img, idx) => {
                    const isThumb = thumbnailIndex === idx;
                    return (
                      <div
                        key={idx}
                        onClick={() => setThumbnailIndex(idx)}
                        className={`relative rounded-xl overflow-hidden border-2 cursor-pointer transition-all aspect-video group shadow-xs ${
                          isThumb ? "border-blue-600 ring-2 ring-blue-500/50" : "border-gray-200 hover:border-blue-400"
                        }`}
                      >
                        <img src={img} alt={`Tour photo ${idx + 1}`} className="w-full h-full object-cover" />
                        {isThumb && (
                          <div className="absolute top-1.5 left-1.5 bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-md">
                            <Check className="w-3 h-3" />
                            Ảnh đại diện
                          </div>
                        )}
                        {!isThumb && (
                          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-[11px] font-medium">
                            Chọn làm Thumbnail
                          </div>
                        )}
                        {images.length > 1 && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeImage(idx);
                            }}
                            className="absolute top-1.5 right-1.5 p-1 bg-black/60 hover:bg-red-600 text-white rounded-full transition-colors"
                            title="Xóa ảnh"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Thông tin cơ bản */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <Label className="text-xs font-semibold text-gray-700">Tên tour <span className="text-red-500">*</span></Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="VD: Khám Phá Đà Lạt – Xứ Sở Ngàn Hoa 3N2Đ"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold text-gray-700">Điểm đến chính <span className="text-red-500">*</span></Label>
                  <Input
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="VD: Đà Lạt"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold text-gray-700">Thời gian (hiển thị)</Label>
                  <Input
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="VD: 3 ngày 2 đêm"
                    className="mt-1"
                  />
                </div>

                {/* THỜI GIAN HOẠT ĐỘNG */}
                <div>
                  <Label className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-blue-600" />
                    Thời gian hoạt động / Mùa tour <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    value={operationPeriod}
                    onChange={(e) => setOperationPeriod(e.target.value)}
                    placeholder="VD: Quanh năm (Tháng 1 – Tháng 12)"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold text-gray-700">Số ngày</Label>
                  <Input
                    type="number"
                    min={1}
                    value={numberOfDays}
                    onChange={(e) => setNumberOfDays(parseInt(e.target.value) || 1)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold text-gray-700">Số đêm</Label>
                  <Input
                    type="number"
                    min={0}
                    value={numberOfNights}
                    onChange={(e) => setNumberOfNights(parseInt(e.target.value) || 0)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold text-gray-700">Giá cơ bản / người lớn (VNĐ) <span className="text-red-500">*</span></Label>
                  <Input
                    type="number"
                    step={50000}
                    value={price}
                    onChange={(e) => setPrice(parseInt(e.target.value) || 0)}
                    className="mt-1 font-bold text-blue-700"
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold text-gray-700">Số khách tối thiểu – tối đa</Label>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <Input
                      type="number"
                      min={1}
                      value={minGuests}
                      onChange={(e) => setMinGuests(parseInt(e.target.value) || 2)}
                      placeholder="Min"
                    />
                    <Input
                      type="number"
                      min={1}
                      value={maxGuests}
                      onChange={(e) => setMaxGuests(parseInt(e.target.value) || 20)}
                      placeholder="Max"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <Label className="text-xs font-semibold text-gray-700">Mô tả ngắn tổng quan về tour</Label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    placeholder="Mô tả hấp dẫn về hành trình, những nét thú vị đón chờ du khách..."
                    className="mt-1 text-sm"
                  />
                </div>
              </div>

              {/* Highlights section */}
              <div className="border-t border-gray-100 pt-4 space-y-2">
                <Label className="text-xs font-semibold text-gray-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  Điểm nhấn nổi bật của Tour (ĐIỂM NỔI BẬT)
                </Label>
                <div className="space-y-1.5">
                  {highlights.map((hl, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <Input
                        value={hl}
                        onChange={(e) => {
                          const updated = [...highlights];
                          updated[idx] = e.target.value;
                          setHighlights(updated);
                        }}
                        className="text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => setHighlights(highlights.filter((_, i) => i !== idx))}
                        className="p-1.5 text-gray-400 hover:text-red-600 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 pt-1">
                  <Input
                    value={newHighlight}
                    onChange={(e) => setNewHighlight(e.target.value)}
                    placeholder="Thêm điểm nhấn mới..."
                    className="text-xs"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        if (newHighlight.trim()) {
                          setHighlights([...highlights, newHighlight.trim()]);
                          setNewHighlight("");
                        }
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (newHighlight.trim()) {
                        setHighlights([...highlights, newHighlight.trim()]);
                        setNewHighlight("");
                      }
                    }}
                  >
                    Thêm
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CHỖ Ở, CHỖ ĂN & LỊCH TRÌNH CHI TIẾT (CHUẨN XÁC 100% NHƯ THONGTINTOUR.PNG) */}
          {activeTab === "itinerary" && (
            <div className="space-y-7">
              {/* Header tip identical to thongtintour.png */}
              <div className="flex items-center justify-between text-xs text-gray-500 border-b border-gray-100 pb-3">
                <p>Chọn khách sạn và tùy chỉnh lịch trình. Thay đổi địa điểm hoặc tự nhập khách sạn → công ty sẽ báo giá.</p>
                <button
                  type="button"
                  onClick={addDay}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-medium transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Thêm ngày tour
                </button>
              </div>

              {/* ===== 1. KHÁCH SẠN LƯU TRÚ ===== */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-blue-600" />
                    KHÁCH SẠN LƯU TRÚ ({hotels.length})
                  </h3>
                  <button
                    type="button"
                    onClick={addHotel}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg border border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100 font-medium transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Thêm khách sạn
                  </button>
                </div>

                {/* List of hotels for this tour (supports multiple hotels) */}
                <div className="space-y-2.5">
                  {hotels.map((hotel, hIdx) => {
                    const isExpanded = expandedHotelId === hotel.id;
                    return (
                      <div key={hotel.id || hIdx} className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-2xs">
                        <button
                          type="button"
                          onClick={() => setExpandedHotelId(isExpanded ? null : (hotel.id || `h-${hIdx}`))}
                          className="w-full flex items-center justify-between px-4 py-3 bg-blue-50/80 hover:bg-blue-100/70 transition-colors text-left"
                        >
                          <div className="flex items-center gap-3">
                            <Building2 className="w-5 h-5 text-blue-600 flex-shrink-0" />
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-bold text-gray-900">{hotel.destination || destination || "Khu vực lưu trú"}</p>
                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                                  {hotel.stars || 4} <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                                </span>
                              </div>
                              <p className="text-xs text-gray-500">
                                {hotel.nights || 1} đêm • {hotel.name || "Chưa nhập tên khách sạn"}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {hotels.length > 1 && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeHotel(hotel.id || "");
                                }}
                                className="p-1.5 text-gray-400 hover:text-red-600 rounded transition-colors"
                                title="Xóa khách sạn này"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4 text-gray-400" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-gray-400" />
                            )}
                          </div>
                        </button>

                        {isExpanded && (
                          <div className="p-4 bg-white border-t border-gray-100 space-y-3">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <Label className="text-xs font-semibold text-gray-700">Tên khách sạn / Resort mặc định của tour</Label>
                                <Input
                                  value={hotel.name}
                                  onChange={(e) => updateHotel(hotel.id || "", { name: e.target.value })}
                                  placeholder="VD: Khách sạn Đà Lạt Palace Heritage"
                                  className="mt-1 text-xs"
                                />
                              </div>
                              <div>
                                <Label className="text-xs font-semibold text-gray-700">Điểm đến / Khu vực lưu trú</Label>
                                <Input
                                  value={hotel.destination ?? ""}
                                  onChange={(e) => updateHotel(hotel.id || "", { destination: e.target.value })}
                                  placeholder="VD: Đà Lạt"
                                  className="mt-1 text-xs"
                                />
                              </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <Label className="text-xs font-semibold text-gray-700">Số đêm lưu trú</Label>
                                <Input
                                  type="number"
                                  min={1}
                                  value={hotel.nights ?? 1}
                                  onChange={(e) => updateHotel(hotel.id || "", { nights: parseInt(e.target.value) || 1 })}
                                  className="mt-1 text-xs"
                                />
                              </div>
                              <div>
                                <Label className="text-xs font-semibold text-gray-700 flex items-center justify-between">
                                  <span>Số sao của khách sạn</span>
                                  <span className="flex items-center gap-0.5 text-amber-500">
                                    {Array.from({ length: hotel.stars || 4 }).map((_, i) => (
                                      <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-500" />
                                    ))}
                                  </span>
                                </Label>
                                <select
                                  value={hotel.stars ?? 4}
                                  onChange={(e) => updateHotel(hotel.id || "", { stars: parseInt(e.target.value) || 4 })}
                                  className="mt-1 w-full h-9 px-3 py-1.5 text-xs border border-gray-300 rounded-md bg-white text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                  <option value={1}>1 sao ⭐</option>
                                  <option value={2}>2 sao ⭐⭐</option>
                                  <option value={3}>3 sao ⭐⭐⭐</option>
                                  <option value={4}>4 sao ⭐⭐⭐⭐</option>
                                  <option value={5}>5 sao ⭐⭐⭐⭐⭐</option>
                                </select>
                              </div>
                            </div>
                            <div>
                              <Label className="text-xs font-semibold text-gray-700">Địa chỉ / Ghi chú phòng</Label>
                              <Input
                                value={hotel.address ?? hotel.description ?? ""}
                                onChange={(e) => updateHotel(hotel.id || "", { address: e.target.value, description: e.target.value })}
                                placeholder="VD: 02 Trần Phú, Phường 3, TP. Đà Lạt"
                                className="mt-1 text-xs"
                              />
                            </div>
                            <p className="text-[11px] text-gray-500">
                              * Số sao khách sạn là tiêu chuẩn dịch vụ lưu trú mặc định của gói tour (Khách hàng có thể đổi sang khách sạn khác ở mục Khách sạn đổi hạng bên dưới).
                            </p>

                            {/* DANH SÁCH KHÁCH SẠN NÂNG CẤP / ĐỔI HẠNG CHO KHÁCH CHỌN */}
                            <div className="pt-4 border-t border-gray-200 space-y-3.5">
                              <div className="flex items-center justify-between flex-wrap gap-2">
                                <div>
                                  <Label className="text-xs font-bold text-gray-900 flex items-center gap-1.5 uppercase">
                                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                                    Danh sách khách sạn nâng cấp / đổi hạng cho khách chọn ({(hotel.alternativeHotels || []).length})
                                  </Label>
                                  <p className="text-[11px] text-gray-500 mt-0.5">
                                    Khách hàng khi xem tour có thể chọn đổi sang các khách sạn này với mức giá chênh lệch do công ty ấn định (Hiển thị ở tab Lịch trình tùy chỉnh).
                                  </p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => addAlternativeHotel(hotel.id || "")}
                                  className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg border border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100 font-semibold transition-colors shadow-2xs"
                                >
                                  <Plus className="w-3.5 h-3.5 text-amber-700" />
                                  Thêm khách sạn đổi hạng
                                </button>
                              </div>

                              {/* Gợi ý thêm nhanh từ kho khách sạn hệ thống */}
                              <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3 space-y-2">
                                <p className="text-[11px] font-semibold text-amber-900 flex items-center gap-1">
                                  <Building2 className="w-3.5 h-3.5 text-amber-600" />
                                  Chọn nhanh khách sạn đối tác gợi ý để thêm vào tour:
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                  {SYSTEM_CATALOG_HOTELS.map((catHotel, cIdx) => {
                                    const alreadyAdded = (hotel.alternativeHotels || []).some(
                                      (a) => a.name.toLowerCase() === catHotel.name.toLowerCase()
                                    );
                                    return (
                                      <button
                                        key={cIdx}
                                        type="button"
                                        disabled={alreadyAdded}
                                        onClick={() => addAlternativeHotel(hotel.id || "", catHotel)}
                                        className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all flex items-center gap-1.5 ${
                                          alreadyAdded
                                            ? "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed"
                                            : "border-amber-300 bg-white hover:bg-amber-100 text-amber-900 hover:border-amber-400 font-medium"
                                        }`}
                                      >
                                        <Plus className="w-3 h-3 text-amber-600" />
                                        <span>{catHotel.name}</span>
                                        <span className="text-amber-600 font-bold">({catHotel.stars}★)</span>
                                        <span className={`font-bold ${catHotel.priceDifference > 0 ? "text-amber-700" : "text-emerald-600"}`}>
                                          ({catHotel.priceDifference > 0 ? "+" : ""}{formatVND(catHotel.priceDifference)})
                                        </span>
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>

                              {/* Danh sách các khách sạn đổi hạng đã cấu hình */}
                              {(hotel.alternativeHotels || []).length === 0 ? (
                                <div className="p-4 border border-dashed border-gray-200 rounded-xl text-center text-xs text-gray-400">
                                  Chưa có khách sạn đổi hạng nào. Bấm nút "+ Thêm khách sạn đổi hạng" hoặc chọn nhanh từ danh mục đối tác ở trên.
                                </div>
                              ) : (
                                <div className="space-y-2.5">
                                  {(hotel.alternativeHotels || []).map((alt, aIdx) => (
                                    <div
                                      key={alt.id || aIdx}
                                      className="p-3 rounded-xl border border-gray-200 bg-gray-50/50 hover:bg-white transition-all space-y-2 shadow-2xs"
                                    >
                                      <div className="flex items-center justify-between gap-2">
                                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-12 gap-2">
                                          {/* Tên khách sạn */}
                                          <div className="sm:col-span-6">
                                            <Label className="text-[11px] text-gray-500 font-medium">Tên khách sạn đổi hạng / nâng cấp</Label>
                                            <Input
                                              value={alt.name}
                                              onChange={(e) =>
                                                updateAlternativeHotel(hotel.id || "", alt.id, { name: e.target.value })
                                              }
                                              placeholder="VD: Dalat Edensee Lake Resort & Spa"
                                              className="text-xs mt-0.5 bg-white font-semibold"
                                            />
                                          </div>

                                          {/* Số sao */}
                                          <div className="sm:col-span-3">
                                            <Label className="text-[11px] text-gray-500 font-medium flex items-center justify-between">
                                              <span>Số sao</span>
                                              <span className="text-amber-500 text-[10px]">
                                                {"★".repeat(alt.stars || 4)}
                                              </span>
                                            </Label>
                                            <select
                                              value={alt.stars ?? 4}
                                              onChange={(e) =>
                                                updateAlternativeHotel(hotel.id || "", alt.id, {
                                                  stars: parseInt(e.target.value) || 4,
                                                })
                                              }
                                              className="text-xs mt-0.5 w-full h-9 px-2 py-1 border border-gray-300 rounded-md bg-white font-medium text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                            >
                                              <option value={1}>1 sao ⭐</option>
                                              <option value={2}>2 sao ⭐⭐</option>
                                              <option value={3}>3 sao ⭐⭐⭐</option>
                                              <option value={4}>4 sao ⭐⭐⭐⭐</option>
                                              <option value={5}>5 sao ⭐⭐⭐⭐⭐</option>
                                            </select>
                                          </div>

                                          {/* Mức chênh lệch */}
                                          <div className="sm:col-span-3">
                                            <div className="flex items-center justify-between">
                                              <Label className="text-[11px] text-gray-500 font-medium">
                                                Giá chênh lệch (VNĐ)
                                              </Label>
                                              <span
                                                className={`text-[11px] font-bold ${
                                                  alt.priceDifference > 0
                                                    ? "text-amber-700"
                                                    : alt.priceDifference < 0
                                                    ? "text-emerald-600"
                                                    : "text-gray-500"
                                                }`}
                                              >
                                                {alt.priceDifference > 0 ? "+" : ""}
                                                {formatVND(alt.priceDifference || 0)}
                                              </span>
                                            </div>
                                            <Input
                                              type="number"
                                              step={50000}
                                              value={alt.priceDifference}
                                              onChange={(e) =>
                                                updateAlternativeHotel(hotel.id || "", alt.id, {
                                                  priceDifference: parseInt(e.target.value) || 0,
                                                })
                                              }
                                              placeholder="VD: 400000 hoặc -350000"
                                              className="text-xs mt-0.5 bg-white font-bold"
                                            />
                                          </div>
                                        </div>

                                        {/* Nút xóa */}
                                        <button
                                          type="button"
                                          onClick={() => removeAlternativeHotel(hotel.id || "", alt.id)}
                                          className="p-1.5 text-gray-400 hover:text-red-600 rounded transition-colors self-end mb-1"
                                          title="Xóa khách sạn này"
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </button>
                                      </div>

                                      {/* Mô tả ngắn */}
                                      <div>
                                        <Input
                                          value={alt.description ?? ""}
                                          onChange={(e) =>
                                            updateAlternativeHotel(hotel.id || "", alt.id, { description: e.target.value })
                                          }
                                          placeholder="Mô tả tóm tắt điểm nổi bật (VD: Resort ven hồ Tuyền Lâm, view rừng thông thơ mộng...)"
                                          className="text-xs bg-white text-gray-600"
                                        />
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Toggle cho phép khách tự nhập khách sạn */}
                              <div className="flex items-center gap-2 pt-1 text-xs">
                                <input
                                  type="checkbox"
                                  id={`custom-hotel-req-${hotel.id}`}
                                  checked={hotel.allowCustomHotelRequest !== false}
                                  onChange={(e) =>
                                    updateHotel(hotel.id || "", { allowCustomHotelRequest: e.target.checked })
                                  }
                                  className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                                />
                                <label
                                  htmlFor={`custom-hotel-req-${hotel.id}`}
                                  className="text-gray-700 cursor-pointer select-none font-medium"
                                >
                                  Cho phép khách hàng tự đề xuất khách sạn khác ngoài danh sách (tab "Tự nhập khách sạn" – công ty sẽ báo giá sau khi nhận booking)
                                </label>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ===== 2. LỊCH TRÌNH CHI TIẾT & CHẾ ĐỘ ĂN UỐNG (THEO TỪNG NGÀY) ===== */}
              <div className="space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-purple-600" />
                      LỊCH TRÌNH CHI TIẾT &amp; CHẾ ĐỘ ĂN UỐNG (THEO TỪNG NGÀY)
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Lộ trình các điểm tham quan và các bữa ăn (trưa/tối) theo từng ngày. Bữa ăn nằm ngay dưới các điểm tham quan giúp theo dõi và tùy chỉnh trực quan.
                    </p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    onClick={addDay}
                    className="bg-purple-600 hover:bg-purple-700 text-white text-xs gap-1.5 flex items-center shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Thêm ngày tour
                  </Button>
                </div>

                <div className="space-y-4">
                  {itinerary.map((day, dIdx) => (
                    <div key={day.id || dIdx} className="rounded-xl border border-gray-200 overflow-hidden bg-white shadow-2xs">
                      {/* Day header identical to thongtintour.png */}
                      <div className="px-4 py-3 flex items-center justify-between bg-white border-b border-gray-100">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                            {day.day}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 text-sm">
                              Ngày {day.day}: {day.title || `Lịch trình ngày ${day.day}`}
                              {day.meals && day.meals.length > 0 && (
                                <span className="text-xs text-gray-400 font-normal ml-1.5">
                                  ({day.meals.map((m) => m.type === "breakfast" ? "Ăn sáng" : m.type === "lunch" ? "trưa" : "tối").join(", ")})
                                </span>
                              )}
                            </p>
                          </div>
                        </div>

                        {itinerary.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeDay(dIdx)}
                            className="text-gray-400 hover:text-red-600 p-1"
                            title="Xóa ngày này"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      {/* Day content: Edit Title & Description */}
                      <div className="p-4 space-y-3">
                        <div>
                          <Label className="text-[11px] text-gray-600">Tiêu đề ngày</Label>
                          <Input
                            value={day.title}
                            onChange={(e) => {
                              const updated = [...itinerary];
                              updated[dIdx].title = e.target.value;
                              setItinerary(updated);
                            }}
                            placeholder="VD: TP.HCM – Đà Lạt (Ăn trưa, tối)"
                            className="text-xs mt-0.5"
                          />
                        </div>

                        {/* Description box like thongtintour.png */}
                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                          <Label className="text-[11px] font-semibold text-gray-600 block mb-1">Mô tả lịch trình trong ngày</Label>
                          <Textarea
                            value={day.description}
                            onChange={(e) => {
                              const updated = [...itinerary];
                              updated[dIdx].description = e.target.value;
                              setItinerary(updated);
                            }}
                            rows={2}
                            placeholder="Mô tả tóm tắt hoạt động trong ngày..."
                            className="text-xs bg-white"
                          />
                        </div>

                        {/* Locations timeline identical to thongtintour.png */}
                        <div className="space-y-2 pt-1">
                          <div className="flex items-center justify-between">
                            <Label className="text-[11px] font-bold text-gray-700">Điểm tham quan ({day.locations.length})</Label>
                            <button
                              type="button"
                              onClick={() => addLocationToDay(dIdx)}
                              className="text-purple-600 hover:text-purple-800 text-[11px] font-semibold flex items-center gap-1"
                            >
                              <Plus className="w-3 h-3" /> Thêm điểm tham quan
                            </button>
                          </div>

                          <div className="relative pl-1">
                            <div className="absolute left-3.5 top-2 bottom-2 w-0.5 bg-gray-200" />
                            <div className="space-y-2">
                              {day.locations.map((loc, lIdx) => {
                                const isBeingDragged = draggedLocation?.dayIdx === dIdx && draggedLocation?.locIdx === lIdx;
                                const isDropTarget = dragOverLocation?.dayIdx === dIdx && dragOverLocation?.locIdx === lIdx;

                                return (
                                  <div
                                    key={loc.id || lIdx}
                                    draggable
                                    onDragStart={(e) => {
                                      e.dataTransfer.setData("text/plain", `${dIdx}-${lIdx}`);
                                      setDraggedLocation({ dayIdx: dIdx, locIdx: lIdx });
                                    }}
                                    onDragOver={(e) => {
                                      e.preventDefault();
                                      if (draggedLocation?.dayIdx === dIdx && dragOverLocation?.locIdx !== lIdx) {
                                        setDragOverLocation({ dayIdx: dIdx, locIdx: lIdx });
                                      }
                                    }}
                                    onDrop={(e) => {
                                      e.preventDefault();
                                      if (draggedLocation && draggedLocation.dayIdx === dIdx && draggedLocation.locIdx !== lIdx) {
                                        moveLocation(dIdx, draggedLocation.locIdx, lIdx);
                                      }
                                      setDraggedLocation(null);
                                      setDragOverLocation(null);
                                    }}
                                    onDragEnd={() => {
                                      setDraggedLocation(null);
                                      setDragOverLocation(null);
                                    }}
                                    className={`relative flex items-center gap-2.5 transition-all ${
                                      isDropTarget ? "scale-[1.01]" : ""
                                    }`}
                                  >
                                    {/* Dot icon */}
                                    <div className="relative z-10 w-7 h-7 rounded-full bg-white border-2 border-blue-400 flex items-center justify-center flex-shrink-0">
                                      <MapPin className="w-3.5 h-3.5 text-blue-500" />
                                    </div>

                                    {/* Location Card with Drag Handle & Swap Controls */}
                                    <div
                                      className={`flex-1 flex items-center justify-between p-2.5 rounded-xl border bg-white transition-all ${
                                        isBeingDragged
                                          ? "border-dashed border-purple-400 bg-purple-50/50 opacity-60"
                                          : isDropTarget
                                          ? "border-purple-500 bg-purple-50 ring-2 ring-purple-300"
                                          : "border-gray-200 hover:border-gray-300 shadow-2xs"
                                      }`}
                                    >
                                      {/* Drag Handle */}
                                      <div
                                        title="Kéo thả để sắp xếp thứ tự điểm tham quan"
                                        className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-purple-600 mr-2 p-0.5 flex-shrink-0"
                                      >
                                        <GripVertical className="w-4 h-4" />
                                      </div>

                                      {/* Location Name Input */}
                                      <div className="flex items-center gap-2 flex-1">
                                        <Input
                                          value={loc.name}
                                          onChange={(e) => {
                                            const updated = [...itinerary];
                                            updated[dIdx].locations[lIdx].name = e.target.value;
                                            setItinerary(updated);
                                          }}
                                          placeholder="Tên điểm tham quan (VD: Hồ Xuân Hương)..."
                                          className="text-xs font-medium text-gray-900 border-none shadow-none focus-visible:ring-1 flex-1 p-0 h-auto"
                                        />
                                      </div>

                                      {/* Actions: Move Up, Move Down, Delete */}
                                      <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                                        <button
                                          type="button"
                                          disabled={lIdx === 0}
                                          onClick={() => moveLocation(dIdx, lIdx, lIdx - 1)}
                                          className="p-1 text-gray-400 hover:text-purple-600 disabled:opacity-20 disabled:hover:text-gray-400 rounded transition-colors"
                                          title="Đổi thứ tự lên trên"
                                        >
                                          <ArrowUp className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                          type="button"
                                          disabled={lIdx === day.locations.length - 1}
                                          onClick={() => moveLocation(dIdx, lIdx, lIdx + 1)}
                                          className="p-1 text-gray-400 hover:text-purple-600 disabled:opacity-20 disabled:hover:text-gray-400 rounded transition-colors"
                                          title="Đổi thứ tự xuống dưới"
                                        >
                                          <ArrowDown className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => removeLocationFromDay(dIdx, lIdx)}
                                          className="p-1 text-gray-400 hover:text-red-600 rounded transition-colors ml-0.5"
                                          title="Xóa điểm tham quan này"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>

                        {/* CHẾ ĐỘ ẨM THỰC & BỮA ĂN (CHỖ ĂN) - ĐẶT NGAY DƯỚI CÁC ĐIỂM THAM QUAN */}
                        <div className="border-t border-gray-100 pt-4 space-y-3">
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <div>
                              <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wide flex items-center gap-1.5">
                                <Utensils className="w-3.5 h-3.5 text-emerald-600" />
                                BỮA ĂN TRONG NGÀY {day.day} (CHẾ ĐỘ ẨM THỰC)
                              </h4>
                              <p className="text-[11px] text-gray-500">
                                Cấu hình nhà hàng mặc định và các lựa chọn đổi nhà hàng cho Ngày {day.day}
                              </p>
                            </div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <button
                                type="button"
                                onClick={() => addMealToDay(dIdx, "breakfast")}
                                className="px-2.5 py-1 text-xs rounded-lg border border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100 font-medium transition-colors flex items-center gap-1"
                              >
                                <Plus className="w-3 h-3" />
                                Thêm bữa sáng
                              </button>
                              <button
                                type="button"
                                onClick={() => addMealToDay(dIdx, "lunch")}
                                className="px-2.5 py-1 text-xs rounded-lg border border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-medium transition-colors flex items-center gap-1"
                              >
                                <Plus className="w-3 h-3" />
                                Thêm bữa trưa
                              </button>
                              <button
                                type="button"
                                onClick={() => addMealToDay(dIdx, "dinner")}
                                className="px-2.5 py-1 text-xs rounded-lg border border-purple-300 bg-purple-50 text-purple-700 hover:bg-purple-100 font-medium transition-colors flex items-center gap-1"
                              >
                                <Plus className="w-3 h-3" />
                                Thêm bữa tối
                              </button>
                            </div>
                          </div>

                          {/* Danh sách các bữa ăn của ngày */}
                          {(!day.meals || day.meals.length === 0) ? (
                            <div className="p-3 border border-dashed border-gray-200 rounded-xl text-center text-xs text-gray-400 bg-gray-50/50">
                              Chưa có bữa ăn nào cho Ngày {day.day}. Nhấp nút "+ Thêm bữa sáng", "+ Thêm bữa trưa" hoặc "+ Thêm bữa tối" ở trên để bổ sung.
                            </div>
                          ) : (
                            <div className="space-y-2.5">
                              {day.meals.map((meal, mIdx) => {
                                const mealType = meal.type;
                                const mealKey = `${day.id}-${mealType}-${mIdx}`;
                                const isExpanded = expandedMealKey === mealKey;
                                const mealLabel = mealType === "breakfast" ? "Ăn sáng" : mealType === "lunch" ? "Ăn trưa" : "Ăn tối";
                                const altsCount = (meal.alternativeMeals || []).length;

                                return (
                                  <div key={mealKey} className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-2xs">
                                    <button
                                      type="button"
                                      onClick={() => setExpandedMealKey(isExpanded ? null : mealKey)}
                                      className={`w-full flex items-center justify-between px-3.5 py-2.5 transition-colors text-left ${
                                        mealType === "breakfast"
                                          ? "bg-amber-50/50 hover:bg-amber-100/50"
                                          : mealType === "lunch"
                                          ? "bg-emerald-50/50 hover:bg-emerald-100/50"
                                          : "bg-purple-50/50 hover:bg-purple-100/50"
                                      }`}
                                    >
                                      <div className="flex items-center gap-2.5 min-w-0">
                                        <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                                          mealType === "breakfast"
                                            ? "bg-amber-100 text-amber-700"
                                            : mealType === "lunch"
                                            ? "bg-emerald-100 text-emerald-700"
                                            : "bg-purple-100 text-purple-700"
                                        }`}>
                                          {mealType === "breakfast" ? <Sun className="w-3.5 h-3.5" /> : <Utensils className="w-3.5 h-3.5" />}
                                        </div>
                                        <div className="min-w-0">
                                          <p className="text-xs sm:text-sm font-semibold text-gray-900">
                                            {mealLabel}:{" "}
                                            <span className="font-bold text-gray-900">{meal.serviceName || "Nhà hàng theo tour"}</span>
                                          </p>
                                          <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-1">
                                            Mặc định: {meal.serviceName || "Nhà hàng địa phương"} {meal.pricePerPerson ? `(${formatVND(meal.pricePerPerson)}/người)` : ""}
                                          </p>
                                        </div>
                                      </div>

                                      <div className="flex items-center gap-2 flex-shrink-0">
                                        <span className="text-[11px] text-gray-500 bg-white px-2 py-0.5 rounded border border-gray-200 font-medium">
                                          {altsCount > 0 ? `${altsCount} lựa chọn đổi món` : "Theo tour (0đ)"}
                                        </span>
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            removeMeal(dIdx, mIdx);
                                          }}
                                          className="p-1 text-gray-400 hover:text-red-600 rounded transition-colors"
                                          title="Xóa bữa ăn này"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                        {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                                      </div>
                                    </button>

                                    {isExpanded && (
                                      <div className="p-4 bg-white border-t border-gray-100 space-y-4">
                                        {/* Default Restaurant & Description */}
                                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                                          <div className="sm:col-span-8">
                                            <Label className="text-xs font-semibold text-gray-700">
                                              Tên nhà hàng mặc định ({mealLabel}) <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                              value={meal.serviceName || ""}
                                              onChange={(e) => updateMealField(dIdx, mIdx, { serviceName: e.target.value })}
                                              placeholder="VD: Nhà hàng Hương Rừng Đà Lạt"
                                              className="mt-1 text-xs"
                                            />
                                          </div>
                                          <div className="sm:col-span-4">
                                            <Label className="text-xs font-semibold text-gray-700">
                                              Giá tiêu chuẩn / người (VNĐ)
                                            </Label>
                                            <Input
                                              type="number"
                                              step={10000}
                                              value={meal.pricePerPerson || 120000}
                                              onChange={(e) => updateMealField(dIdx, mIdx, { pricePerPerson: parseInt(e.target.value) || 0 })}
                                              placeholder="VD: 120000"
                                              className="mt-1 text-xs font-semibold"
                                            />
                                          </div>
                                          <div className="sm:col-span-12">
                                            <Label className="text-xs font-semibold text-gray-700">Mô tả thực đơn tiêu chuẩn</Label>
                                            <Input
                                              value={meal.description ?? ""}
                                              onChange={(e) => updateMealField(dIdx, mIdx, { description: e.target.value })}
                                              placeholder="VD: Đặc sản gà đồi, cơm lam, rau củ tươi organic"
                                              className="mt-1 text-xs"
                                            />
                                          </div>
                                        </div>

                                        {/* Sub-section: Cấu hình nhà hàng đổi món / nâng cấp */}
                                        <div className="border-t border-emerald-100 pt-3 space-y-3">
                                          <div className="flex items-center justify-between flex-wrap gap-2">
                                            <div>
                                              <h5 className="text-[11px] font-bold text-emerald-950 uppercase tracking-wide flex items-center gap-1.5">
                                                <Utensils className="w-3 h-3 text-emerald-600" />
                                                CÁC LỰA CHỌN ĐỔI NHÀ HÀNG ({altsCount})
                                              </h5>
                                              <p className="text-[10px] text-gray-500">
                                                Khách hàng có thể chọn đổi sang các nhà hàng này với mức giá chênh lệch
                                              </p>
                                            </div>
                                            <button
                                              type="button"
                                              onClick={() => addAlternativeMeal(dIdx, mIdx)}
                                              className="flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg border border-emerald-300 bg-emerald-50 text-emerald-900 hover:bg-emerald-100 font-semibold transition-colors shadow-2xs"
                                            >
                                              <Plus className="w-3 h-3 text-emerald-700" />
                                              Thêm nhà hàng đổi món
                                            </button>
                                          </div>

                                          {/* Quick-add catalog recommendations */}
                                          <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-2.5 space-y-1.5">
                                            <p className="text-[11px] font-semibold text-emerald-900 flex items-center gap-1">
                                              <Sparkles className="w-3 h-3 text-emerald-600" />
                                              Chọn nhanh nhà hàng đối tác ({mealLabel.toLowerCase()}):
                                            </p>
                                            <div className="flex flex-wrap gap-1.5">
                                              {SYSTEM_CATALOG_RESTAURANTS.filter((r) => r.mealType === mealType).map((catMeal, cIdx) => {
                                                const alreadyAdded = (meal.alternativeMeals || []).some(
                                                  (a) => a.restaurantName.toLowerCase() === catMeal.restaurantName.toLowerCase()
                                                );
                                                return (
                                                  <button
                                                    key={cIdx}
                                                    type="button"
                                                    disabled={alreadyAdded}
                                                    onClick={() => addAlternativeMeal(dIdx, mIdx, catMeal)}
                                                    className={`text-[11px] px-2 py-0.5 rounded-lg border transition-all flex items-center gap-1 ${
                                                      alreadyAdded
                                                        ? "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed"
                                                        : "border-emerald-300 bg-white hover:bg-emerald-100 text-emerald-900 hover:border-emerald-400 font-medium"
                                                    }`}
                                                  >
                                                    <Plus className="w-2.5 h-2.5 text-emerald-600" />
                                                    <span>{catMeal.restaurantName}</span>
                                                    <span className={`font-bold ${catMeal.priceDifference > 0 ? "text-amber-700" : "text-emerald-600"}`}>
                                                      ({catMeal.priceDifference > 0 ? "+" : ""}{formatVND(catMeal.priceDifference)})
                                                    </span>
                                                  </button>
                                                );
                                              })}
                                            </div>
                                          </div>

                                          {/* List of configured alternative meals */}
                                          {altsCount === 0 ? (
                                            <div className="p-3 border border-dashed border-gray-200 rounded-xl text-center text-[11px] text-gray-400">
                                              Chưa có nhà hàng đổi món nào. Bấm nút "+ Thêm nhà hàng đổi món" hoặc chọn nhanh ở trên.
                                            </div>
                                          ) : (
                                            <div className="space-y-2">
                                              {(meal.alternativeMeals || []).map((alt, aIdx) => (
                                                <div
                                                  key={alt.id || aIdx}
                                                  className="p-2.5 rounded-xl border border-gray-200 bg-gray-50/50 hover:bg-white transition-all space-y-1.5 shadow-2xs"
                                                >
                                                  <div className="flex items-center justify-between gap-2">
                                                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-12 gap-2">
                                                      <div className="sm:col-span-7">
                                                        <Label className="text-[10px] text-gray-500 font-medium">Tên nhà hàng đổi món</Label>
                                                        <Input
                                                          value={alt.restaurantName}
                                                          onChange={(e) =>
                                                            updateAlternativeMeal(dIdx, mIdx, alt.id, { restaurantName: e.target.value })
                                                          }
                                                          placeholder="VD: Nhà hàng Trúc Lâm Viên"
                                                          className="text-xs mt-0.5 bg-white font-semibold"
                                                        />
                                                      </div>
                                                      <div className="sm:col-span-5">
                                                        <div className="flex items-center justify-between">
                                                          <Label className="text-[10px] text-gray-500 font-medium">
                                                            Giá chênh lệch / người
                                                          </Label>
                                                          <span
                                                            className={`text-[10px] font-bold ${
                                                              alt.priceDifference > 0
                                                                ? "text-amber-700"
                                                                : alt.priceDifference < 0
                                                                ? "text-emerald-600"
                                                                : "text-gray-500"
                                                            }`}
                                                          >
                                                            {alt.priceDifference > 0 ? "+" : ""}
                                                            {formatVND(alt.priceDifference || 0)}
                                                          </span>
                                                        </div>
                                                        <Input
                                                          type="number"
                                                          step={10000}
                                                          value={alt.priceDifference}
                                                          onChange={(e) =>
                                                            updateAlternativeMeal(dIdx, mIdx, alt.id, {
                                                              priceDifference: parseInt(e.target.value) || 0,
                                                            })
                                                          }
                                                          className="text-xs mt-0.5 bg-white font-bold"
                                                        />
                                                      </div>
                                                    </div>
                                                    <button
                                                      type="button"
                                                      onClick={() => removeAlternativeMeal(dIdx, mIdx, alt.id)}
                                                      className="p-1.5 text-gray-400 hover:text-red-600 rounded transition-colors self-end mb-1"
                                                      title="Xóa nhà hàng này"
                                                    >
                                                      <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                  </div>
                                                  <div>
                                                    <Input
                                                      value={alt.description ?? ""}
                                                      onChange={(e) =>
                                                        updateAlternativeMeal(dIdx, mIdx, alt.id, { description: e.target.value })
                                                      }
                                                      placeholder="Mô tả thực đơn (VD: Cơm niêu gia đình, canh atiso...)"
                                                      className="text-xs bg-white text-gray-600"
                                                    />
                                                  </div>
                                                </div>
                                              ))}
                                            </div>
                                          )}

                                          {/* Toggle custom request */}
                                          <div className="flex items-center gap-2 pt-1 text-xs">
                                            <input
                                              type="checkbox"
                                              id={`custom-meal-req-${mealKey}`}
                                              checked={meal.allowCustomMealRequest !== false}
                                              onChange={(e) =>
                                                updateMealField(dIdx, mIdx, { allowCustomMealRequest: e.target.checked })
                                              }
                                              className="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500 cursor-pointer"
                                            />
                                            <label
                                              htmlFor={`custom-meal-req-${mealKey}`}
                                              className="text-gray-700 cursor-pointer select-none font-medium text-[11px]"
                                            >
                                              Cho phép khách tự đề xuất nhà hàng khác ngoài danh sách (công ty sẽ báo giá sau khi nhận booking)
                                            </label>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Button to add a new day at bottom of Section 3 */}
                  <button
                    type="button"
                    onClick={addDay}
                    className="w-full py-3.5 border-2 border-dashed border-purple-300 rounded-xl text-purple-700 bg-purple-50/50 hover:bg-purple-100/70 font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs"
                  >
                    <Plus className="w-4 h-4" />
                    Thêm ngày mới vào lịch trình tour (Ngày {itinerary.length + 1})
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: BẢNG GIÁ THEO ĐỘ TUỔI */}
          {activeTab === "pricing" && (
            <div className="space-y-6">
              <div className="space-y-3">
                <div className="border-b border-gray-100 pb-2">
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                    Bảng giá vé theo phân loại độ tuổi
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Quy định đơn giá áp dụng cho từng đối tượng hành khách. Người dùng khi đặt tour sẽ tự do chọn ngày khởi hành mong muốn.
                  </p>
                </div>

                <div className="overflow-x-auto border border-gray-200 rounded-xl">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-gray-100 text-gray-700">
                        <th className="p-3 text-left">Phân loại khách</th>
                        <th className="p-3 text-left">Độ tuổi áp dụng</th>
                        <th className="p-3 text-right">Đơn giá vé (VNĐ)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {priceTable.map((row, idx) => (
                        <tr key={idx}>
                          <td className="p-3 font-bold text-gray-900">{row.ageGroupLabel}</td>
                          <td className="p-3">
                            <Input
                              value={row.ageRange ?? ""}
                              onChange={(e) => {
                                const updated = [...priceTable];
                                updated[idx].ageRange = e.target.value;
                                setPriceTable(updated);
                              }}
                              className="text-xs h-8 max-w-xs"
                            />
                          </td>
                          <td className="p-3 text-right">
                            <Input
                              type="number"
                              step={50000}
                              value={row.price}
                              onChange={(e) => {
                                const updated = [...priceTable];
                                updated[idx].price = parseInt(e.target.value) || 0;
                                setPriceTable(updated);
                              }}
                              className="text-xs h-8 text-right font-bold text-blue-700 max-w-[160px] ml-auto"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: QUY ĐỊNH & CHÍNH SÁCH */}
          {activeTab === "regulations" && (
            <div className="space-y-6">
              {/* GIÁ BAO GỒM */}
              <div className="space-y-2">
                <Label className="text-xs font-bold text-emerald-800 flex items-center gap-1.5 uppercase">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  Giá tour bao gồm:
                </Label>
                <div className="space-y-1.5">
                  {inclusions.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <Input
                        value={item}
                        onChange={(e) => {
                          const updated = [...inclusions];
                          updated[idx] = e.target.value;
                          setInclusions(updated);
                        }}
                        className="text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => setInclusions(inclusions.filter((_, i) => i !== idx))}
                        className="p-1.5 text-gray-400 hover:text-red-600 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newInclusion}
                    onChange={(e) => setNewInclusion(e.target.value)}
                    placeholder="Thêm mục bao gồm..."
                    className="text-xs"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (newInclusion.trim()) {
                        setInclusions([...inclusions, newInclusion.trim()]);
                        setNewInclusion("");
                      }
                    }}
                  >
                    Thêm
                  </Button>
                </div>
              </div>

              {/* GIÁ KHÔNG BAO GỒM */}
              <div className="space-y-2 border-t border-gray-100 pt-4">
                <Label className="text-xs font-bold text-red-800 flex items-center gap-1.5 uppercase">
                  <XCircle className="w-4 h-4 text-red-600" />
                  Giá tour không bao gồm:
                </Label>
                <div className="space-y-1.5">
                  {exclusions.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <Input
                        value={item}
                        onChange={(e) => {
                          const updated = [...exclusions];
                          updated[idx] = e.target.value;
                          setExclusions(updated);
                        }}
                        className="text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => setExclusions(exclusions.filter((_, i) => i !== idx))}
                        className="p-1.5 text-gray-400 hover:text-red-600 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newExclusion}
                    onChange={(e) => setNewExclusion(e.target.value)}
                    placeholder="Thêm mục không bao gồm..."
                    className="text-xs"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (newExclusion.trim()) {
                        setExclusions([...exclusions, newExclusion.trim()]);
                        setNewExclusion("");
                      }
                    }}
                  >
                    Thêm
                  </Button>
                </div>
              </div>

              {/* ĐIỀU KIỆN & LƯU Ý */}
              <div className="space-y-2 border-t border-gray-100 pt-4">
                <Label className="text-xs font-bold text-amber-900 flex items-center gap-1.5 uppercase">
                  <Info className="w-4 h-4 text-amber-600" />
                  Điều kiện &amp; Lưu ý khi đi tour:
                </Label>
                <div className="space-y-1.5">
                  {regulations.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <Input
                        value={item}
                        onChange={(e) => {
                          const updated = [...regulations];
                          updated[idx] = e.target.value;
                          setRegulations(updated);
                        }}
                        className="text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => setRegulations(regulations.filter((_, i) => i !== idx))}
                        className="p-1.5 text-gray-400 hover:text-red-600 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newRegulation}
                    onChange={(e) => setNewRegulation(e.target.value)}
                    placeholder="Thêm điều kiện / lưu ý mới..."
                    className="text-xs"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (newRegulation.trim()) {
                        setRegulations([...regulations, newRegulation.trim()]);
                        setNewRegulation("");
                      }
                    }}
                  >
                    Thêm
                  </Button>
                </div>
              </div>

              {/* LỜI NHẮN TỪ CÔNG TY */}
              <div className="space-y-2 border-t border-gray-100 pt-4">
                <Label className="text-xs font-bold text-gray-900">
                  Lời nhắn / Khẩu hiệu kết thúc tour từ Công ty du lịch
                </Label>
                <Input
                  value={companyNote}
                  onChange={(e) => setCompanyNote(e.target.value)}
                  placeholder="VD: VIETTRAVEL KÍNH CHÚC QUÝ KHÁCH MỘT CHUYẾN ĐI VUI VẺ!"
                  className="text-sm font-semibold text-red-600"
                />
              </div>
            </div>
          )}

          {/* TAB 5: MÔ PHỎNG TOUR HIỂN THỊ (PREVIEW Y HỆT KHÁCH HÀNG XEM) */}
          {activeTab === "preview" && (
            <div className="space-y-6 bg-gray-50/70 p-4 rounded-2xl border border-gray-200">
              <div className="bg-purple-100/70 text-purple-900 border border-purple-300 p-3 rounded-xl text-xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-purple-700" />
                  <span><strong>Chế độ mô phỏng trực tiếp:</strong> Đây là giao diện chính xác mà khách hàng sẽ thấy sau khi bạn đăng tour này.</span>
                </div>
                <span className="text-[11px] font-bold bg-purple-200 px-2 py-0.5 rounded">Preview Live</span>
              </div>

              {/* Top Hero Preview */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                  <div className="relative rounded-2xl overflow-hidden shadow-md h-72">
                    <img src={chosenThumbnail} alt={name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute top-4 left-4 flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5 shadow-sm">
                      {company.logo && <img src={company.logo} alt="" className="w-5 h-5 rounded object-cover" />}
                      <span className="text-xs font-semibold text-gray-800">{company.name}</span>
                    </div>
                    <div className="absolute top-4 right-4 bg-amber-400 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                      <Star className="w-3.5 h-3.5 fill-white" />
                      4.8
                    </div>
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <p className="text-[11px] text-white/70 font-medium mb-1">MÃ TOUR: {tour?.tourCode || "T-NEW"}</p>
                      <h1 className="text-xl font-bold leading-tight drop-shadow-sm">{name || "Tên tour của bạn"}</h1>
                    </div>
                  </div>

                  {/* Thumbnail gallery if multiple images */}
                  {images.length > 1 && (
                    <div className="flex items-center gap-2 overflow-x-auto pb-1">
                      {images.map((img, i) => (
                        <img
                          key={i}
                          src={img}
                          alt=""
                          className={`w-16 h-12 rounded-lg object-cover border-2 flex-shrink-0 ${
                            thumbnailIndex === i ? "border-blue-600 ring-2 ring-blue-500/50" : "border-gray-200"
                          }`}
                        />
                      ))}
                    </div>
                  )}

                  {/* Meta strip */}
                  <div className="bg-white border border-gray-200 rounded-xl p-3.5 flex flex-wrap gap-4 text-xs text-gray-700 shadow-2xs">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-blue-500" />
                      <span>{destination || "Điểm đến"}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-blue-500" />
                      <span>{duration}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-blue-500" />
                      <span>{minGuests}–{maxGuests} khách</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-blue-500" />
                      <span>{operationPeriod}</span>
                    </div>
                  </div>

                  {/* Preview Tabs View */}
                  <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-2xs">
                    <div className="flex border-b border-gray-200 bg-gray-50/50">
                      {[
                        { id: "program", label: "Chương trình tour" },
                        { id: "regulations", label: "Quy định" },
                        { id: "pricing", label: "Bảng giá" },
                        { id: "custom", label: "Lịch trình tùy chỉnh" },
                        { id: "reviews", label: "Nhận xét" },
                      ].map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setPreviewActiveTab(t.id as any)}
                          className={`px-3 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
                            previewActiveTab === t.id
                              ? "border-blue-600 text-blue-700 bg-white"
                              : "border-transparent text-gray-500 hover:text-gray-800"
                          }`}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>

                    <div className="p-4 text-xs space-y-4">
                      {/* CUSTOM TAB (EXACTLY MATCHING THONGTINTOUR.PNG) */}
                      {previewActiveTab === "custom" && (
                        <div className="space-y-5">
                          <p className="text-gray-500 text-[11px]">
                            Chọn khách sạn và tùy chỉnh lịch trình. Thay đổi địa điểm hoặc tự nhập khách sạn → công ty sẽ báo giá.
                          </p>

                          {/* 1. KHÁCH SẠN LƯU TRÚ */}
                          <div className="space-y-2">
                            <h4 className="font-bold text-gray-900 text-xs flex items-center gap-1.5 uppercase">
                              <Building2 className="w-3.5 h-3.5 text-blue-600" />
                              Khách sạn lưu trú ({hotels.length})
                            </h4>
                            <div className="space-y-2">
                              {hotels.map((h, hi) => (
                                <div key={hi} className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-2xs">
                                  <div className="p-3 bg-blue-50/80 flex items-center justify-between border-b border-gray-100">
                                    <div className="flex items-center gap-2.5">
                                      <Building2 className="w-4 h-4 text-blue-600" />
                                      <div>
                                        <div className="flex items-center gap-1.5">
                                          <p className="font-bold text-gray-900 text-xs">{h.destination || destination || "Điểm đến"}</p>
                                          <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.2 rounded bg-amber-50 text-amber-800 border border-amber-200">
                                            {h.stars || 4} ★
                                          </span>
                                        </div>
                                        <p className="text-[11px] text-gray-500">
                                          {h.nights || 1} đêm • {h.name || "Khách sạn lưu trú"} • {h.stars || 4} sao (Tiêu chuẩn: 0đ)
                                        </p>
                                      </div>
                                    </div>
                                    <span className="text-[10px] bg-white border border-gray-200 px-2 py-0.5 rounded text-gray-600 font-medium">
                                      {(h.alternativeHotels || []).length} lựa chọn đổi hạng
                                    </span>
                                  </div>
                                  {(h.alternativeHotels || []).length > 0 && (
                                    <div className="p-2.5 space-y-1.5 bg-gray-50/50">
                                      {(h.alternativeHotels || []).map((alt, ai) => (
                                        <div key={ai} className="flex items-center justify-between p-2 rounded-lg bg-white border border-gray-100 text-[11px]">
                                          <div className="flex items-center gap-1.5">
                                            <span className="font-medium text-gray-800">{alt.name}</span>
                                            <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.2 rounded bg-amber-50 text-amber-800 border border-amber-200">
                                              {alt.stars || 4} ★
                                            </span>
                                          </div>
                                          <span className={`font-bold ${alt.priceDifference > 0 ? "text-amber-700" : "text-emerald-600"}`}>
                                            {alt.priceDifference > 0 ? "+" : ""}{formatVND(alt.priceDifference)}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* 2. LỊCH TRÌNH CHI TIẾT & CHẾ ĐỘ ĂN UỐNG (THEO TỪNG NGÀY) */}
                          <div className="space-y-2">
                            <h4 className="font-bold text-gray-900 text-xs flex items-center gap-1.5 uppercase">
                              <MapPin className="w-3.5 h-3.5 text-purple-600" />
                              LỊCH TRÌNH CHI TIẾT &amp; CHẾ ĐỘ ĂN UỐNG (THEO TỪNG NGÀY)
                            </h4>
                            <div className="space-y-3">
                              {itinerary.map((d) => (
                                <div key={d.id} className="border border-gray-200 rounded-xl p-3 bg-white space-y-2.5 shadow-2xs">
                                  <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-purple-600 text-white text-xs font-bold flex items-center justify-center">
                                      {d.day}
                                    </div>
                                    <span className="font-bold text-gray-900 text-xs">Ngày {d.day}: {d.title}</span>
                                  </div>
                                  {d.description && (
                                    <p className="bg-gray-50 p-2.5 rounded-lg border border-gray-100 text-[11px] text-gray-600">
                                      {d.description}
                                    </p>
                                  )}
                                  <div className="space-y-1.5 pl-2">
                                    {d.locations.map((loc) => (
                                      <div key={loc.id} className="flex items-center justify-between p-2 rounded-lg border border-gray-200 bg-white">
                                        <div className="flex items-center gap-2 text-xs">
                                          <MapPin className="w-3 h-3 text-blue-500" />
                                          <span className="font-medium text-gray-900">{loc.name}</span>
                                        </div>
                                        <span className="text-[10px] text-gray-600 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                                          Thay đổi
                                        </span>
                                      </div>
                                    ))}
                                  </div>

                                  {/* Bữa ăn trong ngày: Nằm ngay dưới các điểm tham quan */}
                                  {d.meals && d.meals.length > 0 && (
                                    <div className="pt-2.5 border-t border-gray-100 space-y-2 pl-2">
                                      <p className="text-[11px] font-bold text-emerald-950 uppercase flex items-center gap-1.5">
                                        <Utensils className="w-3.5 h-3.5 text-emerald-600" />
                                        Bữa ăn Ngày {d.day} (Chỗ ăn)
                                      </p>
                                      <div className="space-y-1.5">
                                        {d.meals.map((m, mi) => (
                                          <div key={mi} className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                                            <div className={`p-2 flex items-center justify-between border-b border-gray-100 ${
                                              m.type === "breakfast" ? "bg-amber-50/50" : m.type === "lunch" ? "bg-emerald-50/50" : "bg-purple-50/50"
                                            }`}>
                                              <div className="flex items-center gap-2">
                                                {m.type === "breakfast" ? (
                                                  <Sun className="w-3 h-3 text-amber-600" />
                                                ) : (
                                                  <Utensils className="w-3 h-3 text-emerald-600" />
                                                )}
                                                <span className="font-semibold text-gray-900 text-[11px]">
                                                  {m.type === "breakfast" ? "Ăn sáng" : m.type === "lunch" ? "Ăn trưa" : "Ăn tối"}: {m.serviceName}
                                                </span>
                                              </div>
                                              <span className="text-[10px] bg-white border border-gray-200 px-1.5 py-0.5 rounded text-gray-600 font-medium">
                                                {(m.alternativeMeals || []).length} lựa chọn đổi món
                                              </span>
                                            </div>
                                            {(m.alternativeMeals || []).length > 0 && (
                                              <div className="p-2 space-y-1 bg-gray-50/40">
                                                {(m.alternativeMeals || []).map((alt, ai) => (
                                                  <div key={ai} className="flex items-center justify-between p-1.5 rounded bg-white border border-gray-100 text-[10px]">
                                                    <span className="font-medium text-gray-800">{alt.restaurantName}</span>
                                                    <span className={`font-bold ${alt.priceDifference > 0 ? "text-amber-700" : "text-emerald-600"}`}>
                                                      {alt.priceDifference > 0 ? "+" : ""}{formatVND(alt.priceDifference)}
                                                    </span>
                                                  </div>
                                                ))}
                                              </div>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* PROGRAM TAB (CHƯƠNG TRÌNH TOUR CHÍNH THỨC) */}
                      {previewActiveTab === "program" && (
                        <div className="space-y-6">
                          {/* Thời gian hoạt động */}
                          {operationPeriod && (
                            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3.5">
                              <h4 className="text-xs font-bold text-blue-700 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5" />
                                Thời gian hoạt động
                              </h4>
                              <p className="text-xs text-gray-700">
                                <span className="text-gray-500">Mùa tour / Thời gian hoạt động:</span>{" "}
                                <strong>{operationPeriod}</strong>
                              </p>
                            </div>
                          )}

                          {/* Điểm nổi bật */}
                          {highlights.length > 0 && (
                            <div>
                              <h4 className="text-sm font-bold text-red-600 mb-2.5 flex items-center gap-1.5">
                                <Star className="w-4 h-4" />
                                ĐIỂM NỔI BẬT:
                              </h4>
                              <ul className="space-y-1.5">
                                {highlights.map((h, i) => (
                                  <li key={i} className="flex items-start gap-2 text-xs text-gray-700">
                                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                                    <span>{h}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Lịch trình chi tiết */}
                          <div>
                            <h4 className="text-sm font-bold text-red-600 mb-3 uppercase">LỊCH TRÌNH CHI TIẾT:</h4>
                            <div className="space-y-3">
                              {itinerary.map((d) => {
                                const isOpen = previewExpandedDays.has(d.id);
                                return (
                                  <div key={d.id} className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-2xs">
                                    <button
                                      type="button"
                                      onClick={() => togglePreviewDay(d.id)}
                                      className="w-full flex items-center gap-3 px-3.5 py-3 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
                                    >
                                      <div className="w-7 h-7 bg-red-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 shadow-xs">
                                        {d.day}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className="font-bold text-gray-900 text-xs sm:text-sm">
                                          NGÀY {d.day}: {d.title.toUpperCase()}
                                        </p>
                                      </div>
                                      {d.meals && d.meals.length > 0 && (
                                        <div className="flex gap-1 flex-shrink-0">
                                          {d.meals.map((m, mi) => {
                                            const isBreakfast = m.type === "breakfast";
                                            const isLunch = m.type === "lunch";
                                            const badgeColor = isBreakfast
                                              ? "text-amber-700 bg-amber-50 border border-amber-200"
                                              : isLunch
                                              ? "text-emerald-700 bg-emerald-50 border border-emerald-200"
                                              : "text-purple-700 bg-purple-50 border border-purple-200";
                                            const label = isBreakfast ? "Sáng" : isLunch ? "Trưa" : "Tối";
                                            return (
                                              <span key={mi} className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${badgeColor}`}>
                                                {label}
                                              </span>
                                            );
                                          })}
                                        </div>
                                      )}
                                      {isOpen ? (
                                        <ChevronUp className="w-4 h-4 text-gray-400" />
                                      ) : (
                                        <ChevronDown className="w-4 h-4 text-gray-400" />
                                      )}
                                    </button>

                                    {isOpen && (
                                      <div className="px-4 py-3.5 space-y-3 bg-white">
                                        {d.description && (
                                          <p className="text-gray-700 leading-relaxed text-xs">{d.description}</p>
                                        )}

                                        {/* Pure locations list (No detailed addresses) */}
                                        {d.locations.length > 0 && (
                                          <div className="space-y-1.5">
                                            {d.locations.map((loc) => (
                                              <div key={loc.id} className="flex items-center gap-2 text-xs text-gray-700">
                                                <MapPin className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                                                <span className="font-medium text-gray-900">{loc.name}</span>
                                              </div>
                                            ))}
                                          </div>
                                        )}

                                        {/* Chế độ ẩm thực & Bữa ăn (Chỗ ăn) trong ngày */}
                                        {d.meals && d.meals.length > 0 && (
                                          <div className="pt-3 border-t border-gray-100 space-y-2">
                                            <h5 className="text-[11px] font-bold text-gray-700 uppercase tracking-wide flex items-center gap-1.5">
                                              <Utensils className="w-3.5 h-3.5 text-emerald-600" />
                                              Chế độ ẩm thực &amp; Bữa ăn (Chỗ ăn)
                                            </h5>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                                              {d.meals.map((meal, mIdx) => {
                                                const mealType = meal.type;
                                                const label = mealType === "breakfast" ? "Ăn sáng" : mealType === "lunch" ? "Ăn trưa" : "Ăn tối";
                                                const isBreakfast = mealType === "breakfast";
                                                const isLunch = mealType === "lunch";
                                                return (
                                                  <div
                                                    key={mIdx}
                                                    className={`p-2.5 rounded-xl border flex items-start gap-2.5 ${
                                                      isBreakfast
                                                        ? "bg-amber-50/60 border-amber-200/80"
                                                        : isLunch
                                                        ? "bg-emerald-50/60 border-emerald-200/80"
                                                        : "bg-purple-50/60 border-purple-200/80"
                                                    }`}
                                                  >
                                                    <div
                                                      className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                                                        isBreakfast
                                                          ? "bg-amber-100 text-amber-700"
                                                          : isLunch
                                                          ? "bg-emerald-100 text-emerald-700"
                                                          : "bg-purple-100 text-purple-700"
                                                      }`}
                                                    >
                                                      {isBreakfast ? <Sun className="w-3 h-3" /> : <Utensils className="w-3 h-3 text-emerald-600" />}
                                                    </div>
                                                    <div className="min-w-0">
                                                      <p className="text-[11px] font-bold text-gray-900">{label}</p>
                                                      <p className="text-xs text-gray-800 font-semibold truncate">
                                                        {meal.serviceName || "Nhà hàng theo chương trình"}
                                                      </p>
                                                      {meal.description && (
                                                        <p className="text-[10px] text-gray-500 line-clamp-1 mt-0.5">
                                                          {meal.description}
                                                        </p>
                                                      )}
                                                    </div>
                                                  </div>
                                                );
                                              })}
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* PRICING TAB */}
                      {previewActiveTab === "pricing" && (
                        <div className="space-y-3">
                          <h4 className="font-bold text-gray-900">BẢNG GIÁ THEO LỨA TUỔI:</h4>
                          <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
                            <thead className="bg-gray-100">
                              <tr>
                                <th className="p-2 text-left">Phân loại</th>
                                <th className="p-2 text-left">Độ tuổi</th>
                                <th className="p-2 text-right">Giá vé</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                              {priceTable.map((p, idx) => (
                                <tr key={idx}>
                                  <td className="p-2 font-medium">{p.ageGroupLabel}</td>
                                  <td className="p-2 text-gray-600">{p.ageRange}</td>
                                  <td className="p-2 text-right font-bold text-blue-700">
                                    {p.price === 0 ? "Miễn phí" : formatVND(p.price)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {/* REGULATIONS TAB */}
                      {previewActiveTab === "regulations" && (
                        <div className="space-y-3">
                          <div>
                            <h4 className="font-bold text-emerald-700 mb-1">GIÁ TOUR BAO GỒM:</h4>
                            <ul className="space-y-0.5 list-disc pl-4 text-gray-700">
                              {inclusions.map((inc, i) => <li key={i}>{inc}</li>)}
                            </ul>
                          </div>
                          <div>
                            <h4 className="font-bold text-red-600 mb-1">GIÁ TOUR KHÔNG BAO GỒM:</h4>
                            <ul className="space-y-0.5 list-disc pl-4 text-gray-700">
                              {exclusions.map((exc, i) => <li key={i}>{exc}</li>)}
                            </ul>
                          </div>
                          <div>
                            <h4 className="font-bold text-amber-700 mb-1">ĐIỀU KIỆN &amp; LƯU Ý:</h4>
                            <ul className="space-y-0.5 list-disc pl-4 text-gray-700">
                              {regulations.map((reg, i) => <li key={i}>{reg}</li>)}
                            </ul>
                          </div>
                        </div>
                      )}

                      {/* REVIEWS TAB */}
                      {previewActiveTab === "reviews" && (
                        <div className="space-y-4">
                          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-4">
                            <div className="text-center">
                              <p className="text-4xl font-bold text-blue-700">5.0</p>
                              <div className="flex justify-center gap-0.5 mt-1">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                                ))}
                              </div>
                              <p className="text-[11px] text-gray-500 mt-0.5">Tour mới (Chưa có đánh giá thực tế)</p>
                            </div>
                            <div className="flex-1 w-full space-y-1 text-xs">
                              {[
                                { star: 5, pct: "100%" },
                                { star: 4, pct: "0%" },
                                { star: 3, pct: "0%" },
                                { star: 2, pct: "0%" },
                                { star: 1, pct: "0%" },
                              ].map(({ star, pct }) => (
                                <div key={star} className="flex items-center gap-2">
                                  <span className="text-xs text-gray-600 w-3">{star}</span>
                                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                  <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                                    <div className="bg-amber-400 h-1.5 rounded-full" style={{ width: pct }} />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="p-4 border border-dashed border-gray-200 rounded-xl text-center text-xs text-gray-400">
                            Khách hàng sẽ để lại đánh giá và nhận xét sau khi hoàn thành chuyến đi.
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Booking Sidebar Preview */}
                <div className="lg:col-span-1 space-y-4">
                  <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-4 space-y-3 text-xs">
                    <div>
                      <p className="text-gray-400">Giá từ</p>
                      <p className="text-2xl font-bold text-blue-700">{formatVND(price)}</p>
                      <p className="text-gray-400 text-[10px]">/ người lớn</p>
                    </div>

                    <div className="bg-blue-50 rounded-xl p-2.5">
                      <p className="text-[10px] text-blue-600 font-bold uppercase mb-0.5">Thời gian hoạt động</p>
                      <p className="font-semibold text-gray-800">{operationPeriod}</p>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-2.5 space-y-1 text-gray-600">
                      <div className="flex justify-between">
                        <span>Thời lượng:</span>
                        <strong className="text-gray-900">{duration}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Điểm đến:</span>
                        <strong className="text-gray-900">{destination}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Quy mô đoàn:</span>
                        <strong className="text-gray-900">{minGuests}–{maxGuests} khách</strong>
                      </div>
                    </div>

                    <Button className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 text-xs rounded-xl">
                      Đặt tour ngay (Khách tự chọn ngày)
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
      </div>

      {/* Sticky Bottom Action Bar */}
      <div className="sticky bottom-0 z-30 bg-white/95 backdrop-blur-md border-t border-gray-200 px-6 py-3.5 flex items-center justify-between shadow-lg">
        <div className="text-xs text-gray-500 flex items-center gap-2">
          <Info className="w-4 h-4 text-blue-500 flex-shrink-0" />
          <span>{tour ? `Đang chỉnh sửa: ${tour.name}` : "Tạo tour mới chuẩn dữ liệu. Đảm bảo đã thiết lập đủ lịch trình và bảng giá."}</span>
        </div>
        <div className="flex items-center gap-2.5">
          <Button variant="outline" onClick={onBack}>
            Hủy
          </Button>
          <Button
            disabled={!name.trim() || !destination.trim()}
            onClick={handleSubmit}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold"
          >
            <Check className="w-4 h-4 mr-1.5" />
            {tour ? "Lưu thay đổi Tour" : "Hoàn tất & Đăng Tour"}
          </Button>
        </div>
      </div>
    </div>
  );
}
