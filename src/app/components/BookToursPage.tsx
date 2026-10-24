import { useState } from "react";
import {
  MapPin,
  Clock,
  Users,
  Search,
  Filter,
  Sparkles,
  ArrowRight,
  ArrowUpRight,
  MessageCircle,
  CheckCircle2,
  SlidersHorizontal,
} from "lucide-react";
import { Tour, User } from "@/app/types";
import { PublicTourDetailModal } from "./user/PublicTourDetailModal";

interface BookToursPageProps {
  tours: Tour[];
  onShowLogin?: () => void;
  currentUser: User | null;
  onBookTour?: (
    tourId: string,
    numberOfGuests: number,
    startDate: string,
  ) => void;
  onViewTour?: (tour: Tour) => void;
}

interface AISuggestedTour extends Tour {
  aiReason?: string;
  isAISuggested?: boolean;
}

export function BookToursPage({
  tours,
  onShowLogin,
  currentUser,
  onBookTour,
  onViewTour,
}: BookToursPageProps) {
  const [activeTab, setActiveTab] = useState<"available" | "ai-search">("available");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDestination, setSelectedDestination] = useState("all");
  const [selectedCompany, setSelectedCompany] = useState("all");
  const [priceRange, setPriceRange] = useState("all");

  // AI Search states
  const [aiQuery, setAiQuery] = useState("");
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestedTour[]>([]);
  const [isAISearching, setIsAISearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Tour detail modal state
  const [selectedTour, setSelectedTour] = useState<Tour | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const destinations = [
    "all",
    ...Array.from(new Set(tours.map((t) => t.destination))),
  ];

  const companies = [
    "all",
    ...Array.from(
      new Set(
        tours
          .filter((t) => t.companyName)
          .map((t) => t.companyName as string),
      ),
    ),
  ];

  const filteredTours = tours.filter((tour) => {
    if (tour.tourType === "custom_request") return false;
    if (tour.status && tour.status !== "published") return false;

    const matchesSearch =
      tour.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tour.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tour.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDestination =
      selectedDestination === "all" ||
      tour.destination === selectedDestination;

    const matchesCompany =
      selectedCompany === "all" || tour.companyName === selectedCompany;

    let matchesPrice = true;
    if (priceRange === "under5") {
      matchesPrice = tour.price < 5000000;
    } else if (priceRange === "5to10") {
      matchesPrice = tour.price >= 5000000 && tour.price <= 10000000;
    } else if (priceRange === "over10") {
      matchesPrice = tour.price > 10000000;
    }

    return (
      matchesSearch &&
      matchesDestination &&
      matchesCompany &&
      matchesPrice
    );
  });

  const handleAISearch = () => {
    if (!aiQuery.trim()) return;

    setIsAISearching(true);
    setHasSearched(false);

    setTimeout(() => {
      const query = aiQuery.toLowerCase();
      const suggestions: AISuggestedTour[] = [];

      if (query.includes("đà lạt") || query.includes("da lat")) {
        const dalat = tours.find((t) =>
          t.destination.toLowerCase().includes("đà lạt"),
        );
        if (dalat) {
          suggestions.push({
            ...dalat,
            isAISuggested: true,
            aiReason:
              "Không gian rừng thông nguyên sơ, nhịp sống chậm rãi và khí hậu trong lành lý tưởng để phục hồi năng lượng.",
          });
        }
      }

      if (query.includes("phú quốc") || query.includes("phu quoc")) {
        const phuquoc = tours.find((t) =>
          t.destination.toLowerCase().includes("phú quốc"),
        );
        if (phuquoc) {
          suggestions.push({
            ...phuquoc,
            isAISuggested: true,
            aiReason:
              "Resort ven biển riêng tư, hoàng hôn tĩnh lặng và hải sản bản địa tươi ngon chọn lọc.",
          });
        }
      }

      if (suggestions.length === 0) {
        tours.slice(0, 3).forEach((tour) => {
          suggestions.push({
            ...tour,
            isAISuggested: true,
            aiReason:
              "Hành trình được đánh giá cao bởi du khách tinh tế, dịch vụ chuẩn mực và an tâm tuyệt đối.",
          });
        });
      }

      setAiSuggestions(suggestions);
      setIsAISearching(false);
      setHasSearched(true);
    }, 900);
  };

  const renderTourCard = (
    tour: Tour | AISuggestedTour,
    isAISuggested = false,
  ) => {
    const aiTour = tour as AISuggestedTour;

    return (
      <article
        key={tour.id}
        onClick={() => onViewTour ? onViewTour(tour) : (setSelectedTour(tour), setShowDetailModal(true))}
        className="group bg-white rounded-2xl overflow-hidden border border-[#E8E4DC] hover:border-[#15291E] hover:shadow-[0_12px_30px_rgb(0,0,0,0.05)] transition-all duration-300 cursor-pointer flex flex-col"
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-[#FBF9F5]">
          <img
            src={tour.image}
            alt={tour.name}
            className="w-full h-full object-cover filter saturate-[0.9] group-hover:scale-105 transition-transform duration-700 ease-out"
          />
          <div className="absolute top-4 left-4 bg-[#FBF9F5]/90 backdrop-blur-md text-[#15291E] px-3 py-1 rounded-full text-xs font-medium border border-[#E8E4DC]">
            {tour.destination}
          </div>
          {isAISuggested && (
            <div className="absolute top-4 right-4 bg-[#15291E] text-white px-3 py-1 rounded-full text-[11px] font-semibold flex items-center gap-1.5 shadow-sm">
              <Sparkles className="w-3 h-3 text-[#BD5E38]" />
              Gợi ý từ AI
            </div>
          )}
        </div>

        <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
          <div className="space-y-2.5">
            {isAISuggested && aiTour.aiReason && (
              <div className="bg-[#FBF9F5] border-l-2 border-[#BD5E38] p-3 rounded-r-lg">
                <p className="text-xs text-[#15291E] italic leading-relaxed">
                  &ldquo;{aiTour.aiReason}&rdquo;
                </p>
              </div>
            )}

            <div className="flex items-center gap-4 text-xs text-[#686C67]">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#BD5E38]" />
                {tour.duration}
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-[#BD5E38]" />
                Tối đa {tour.maxGuests} người
              </span>
            </div>

            <h3 className="text-xl font-serif text-[#15291E] group-hover:text-[#BD5E38] transition-colors leading-snug line-clamp-1">
              {tour.name}
            </h3>

            <p className="text-xs text-[#686C67] line-clamp-2 leading-relaxed">
              {tour.description}
            </p>
          </div>

          <div className="pt-4 border-t border-[#E8E4DC] flex items-center justify-between">
            <div>
              <span className="text-[11px] uppercase tracking-wider text-[#686C67] block">Chi phí từ</span>
              <span className="text-xl font-serif font-medium text-[#15291E]">
                {formatPrice(tour.price)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (!currentUser) {
                    onShowLogin?.();
                    return;
                  }
                  onBookTour?.(tour.id, 1, new Date().toISOString().split("T")[0]);
                }}
                className="px-4 py-2 rounded-full bg-[#15291E] text-white text-xs font-medium hover:bg-[#BD5E38] transition-all duration-300"
              >
                Đặt chuyến đi
              </button>
            </div>
          </div>
        </div>
      </article>
    );
  };

  return (
    <div className="min-h-screen bg-[#FBF9F5] text-[#191A19] font-sans antialiased">
      {/* Header Banner */}
      <section className="pt-28 pb-12 border-b border-[#E8E4DC] bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-3">
            <span className="text-xs uppercase font-semibold tracking-widest text-[#BD5E38]">
              Danh mục hành trình TripOps
            </span>
            <h1 className="text-3xl sm:text-5xl font-serif text-[#15291E] tracking-tight">
              Lựa chọn hành trình phù hợp với phong cách của bạn
            </h1>
            <p className="text-sm sm:text-base text-[#686C67] font-light leading-relaxed">
              Tất cả các tour đều được kiểm định khắt khe về chất lượng dịch vụ, thời lượng hợp lý và tính bản địa sâu sắc.
            </p>
          </div>

          {/* Navigation Tab Bar */}
          <div className="flex gap-4 mt-8 border-b border-[#E8E4DC]">
            <button
              onClick={() => setActiveTab("available")}
              className={`pb-3 text-sm font-medium tracking-wide transition-all relative ${
                activeTab === "available"
                  ? "text-[#15291E] font-semibold"
                  : "text-[#686C67] hover:text-[#15291E]"
              }`}
            >
              Hành trình chọn sẵn ({filteredTours.length})
              {activeTab === "available" && (
                <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#15291E]" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("ai-search")}
              className={`pb-3 text-sm font-medium tracking-wide transition-all relative flex items-center gap-1.5 ${
                activeTab === "ai-search"
                  ? "text-[#15291E] font-semibold"
                  : "text-[#686C67] hover:text-[#15291E]"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#BD5E38]" />
              <span>Gợi ý thông minh với AI</span>
              {activeTab === "ai-search" && (
                <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#BD5E38]" />
              )}
            </button>
          </div>
        </div>
      </section>

      {/* Tab 1: Available Tours */}
      {activeTab === "available" ? (
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            {/* Minimalist Filter Bar */}
            <div className="bg-white p-4 rounded-2xl border border-[#E8E4DC] shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#686C67]" />
                <input
                  type="text"
                  placeholder="Tìm theo tên hoặc điểm đến..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 text-sm bg-[#FBF9F5] border border-[#E8E4DC] rounded-xl text-[#191A19] focus:outline-none focus:border-[#15291E]"
                />
              </div>

              <div>
                <select
                  value={selectedDestination}
                  onChange={(e) => setSelectedDestination(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-[#FBF9F5] border border-[#E8E4DC] rounded-xl text-[#191A19] focus:outline-none focus:border-[#15291E]"
                >
                  <option value="all">Tất cả điểm đến</option>
                  {destinations
                    .filter((d) => d !== "all")
                    .map((dest) => (
                      <option key={dest} value={dest}>
                        {dest}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <select
                  value={selectedCompany}
                  onChange={(e) => setSelectedCompany(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-[#FBF9F5] border border-[#E8E4DC] rounded-xl text-[#191A19] focus:outline-none focus:border-[#15291E]"
                >
                  <option value="all">Tất cả đơn vị đồng tổ chức</option>
                  {companies
                    .filter((c) => c !== "all")
                    .map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <select
                  value={priceRange}
                  onChange={(e) => setPriceRange(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-[#FBF9F5] border border-[#E8E4DC] rounded-xl text-[#191A19] focus:outline-none focus:border-[#15291E]"
                >
                  <option value="all">Tất cả mức ngân sách</option>
                  <option value="under5">Dưới 5 triệu VND</option>
                  <option value="5to10">Từ 5 - 10 triệu VND</option>
                  <option value="over10">Trên 10 triệu VND (Cao cấp)</option>
                </select>
              </div>
            </div>

            {/* Tour Cards Grid */}
            {filteredTours.length === 0 ? (
              <div className="text-center py-24 bg-white rounded-2xl border border-[#E8E4DC] space-y-3">
                <Search className="w-10 h-10 mx-auto text-[#686C67]/50" />
                <h3 className="text-xl font-serif text-[#15291E]">Không tìm thấy hành trình phù hợp</h3>
                <p className="text-xs text-[#686C67] max-w-sm mx-auto">
                  Hãy thử điều chỉnh lại bộ lọc hoặc gõ từ khóa tìm kiếm khác.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredTours.map((tour) => renderTourCard(tour, false))}
              </div>
            )}
          </div>
        </section>
      ) : (
        /* Tab 2: AI Search */
        <section className="py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E8E4DC] shadow-sm space-y-4">
              <div className="space-y-1">
                <span className="text-xs uppercase tracking-widest font-semibold text-[#BD5E38] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Trợ lý tư vấn cá nhân
                </span>
                <h2 className="text-2xl font-serif text-[#15291E]">
                  Mô tả chuyến đi bạn hằng mong đợi
                </h2>
                <p className="text-xs text-[#686C67]">
                  Hệ thống AI của TripOps sẽ phân tích sở thích, nhịp độ và tiêu chuẩn dịch vụ để gợi ý phương án hoàn hảo nhất.
                </p>
              </div>

              <textarea
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                placeholder="Ví dụ: Tôi muốn cùng bạn đời đi nghỉ dưỡng 4 ngày tại vùng biển yên bình, ẩm thực tươi sạch, khách sạn phong cách boutique..."
                rows={3}
                className="w-full p-4 text-sm bg-[#FBF9F5] border border-[#E8E4DC] rounded-xl text-[#191A19] focus:outline-none focus:border-[#15291E] resize-none"
              />

              <div className="flex justify-end">
                <button
                  onClick={handleAISearch}
                  disabled={isAISearching || !aiQuery.trim()}
                  className="px-6 py-2.5 rounded-full bg-[#15291E] text-white text-xs font-semibold hover:bg-[#BD5E38] disabled:opacity-40 transition-all duration-300"
                >
                  {isAISearching ? "Đang xử lý đề xuất..." : "Khởi tạo gợi ý"}
                </button>
              </div>
            </div>

            {hasSearched && (
              <div className="space-y-6">
                <h3 className="text-xl font-serif text-[#15291E]">
                  Hành trình được chọn lọc riêng ({aiSuggestions.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {aiSuggestions.map((tour) => renderTourCard(tour, true))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Tour Detail Modal */}
      {showDetailModal && selectedTour && (
        <PublicTourDetailModal
          tour={selectedTour}
          onClose={() => setShowDetailModal(false)}
        />
      )}
    </div>
  );
}
