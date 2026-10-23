import { useState } from "react";
import {
  MapPin,
  Star,
  Clock,
  Users,
  Search,
  Filter,
  Sparkles,
  Send,
  MessageCircle,
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
  const [activeTab, setActiveTab] = useState<
    "available" | "ai-search"
  >("available");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDestination, setSelectedDestination] =
    useState("all");
  const [selectedCompany, setSelectedCompany] = useState("all");
  const [priceRange, setPriceRange] = useState("all");

  // AI Search states
  const [aiQuery, setAiQuery] = useState("");
  const [aiSuggestions, setAiSuggestions] = useState<
    AISuggestedTour[]
  >([]);
  const [isAISearching, setIsAISearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Tour detail modal state
  const [selectedTour, setSelectedTour] = useState<Tour | null>(
    null,
  );
  const [showDetailModal, setShowDetailModal] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  // Get unique destinations and companies
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

  // Filter tours for "Available Tours" tab
  const filteredTours = tours.filter((tour) => {
    if (tour.tourType === "custom_request") return false;
    if (tour.status && tour.status !== "published") return false;

    const matchesSearch =
      tour.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      tour.destination
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      tour.description
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

    const matchesDestination =
      selectedDestination === "all" ||
      tour.destination === selectedDestination;

    const matchesCompany =
      selectedCompany === "all" ||
      tour.companyName === selectedCompany;

    let matchesPrice = true;
    if (priceRange === "under5")
      matchesPrice = tour.price < 5000000;
    else if (priceRange === "5to10")
      matchesPrice =
        tour.price >= 5000000 && tour.price < 10000000;
    else if (priceRange === "over10")
      matchesPrice = tour.price >= 10000000;

    return (
      matchesSearch &&
      matchesDestination &&
      matchesCompany &&
      matchesPrice
    );
  });

  // Handle AI Search
  const handleAISearch = () => {
    if (!aiQuery.trim()) return;

    setIsAISearching(true);
    setHasSearched(false);

    // Simulate AI processing
    setTimeout(() => {
      // Mock AI suggestions based on query keywords
      const query = aiQuery.toLowerCase();
      const suggestions: AISuggestedTour[] = [];

      // Simple matching logic for demo
      if (
        query.includes("đà lạt") ||
        query.includes("da lat") ||
        query.includes("mát") ||
        query.includes("lạnh")
      ) {
        const dalat = tours.find(
          (t) => t.destination === "Đà Lạt",
        );
        if (dalat) {
          suggestions.push({
            ...dalat,
            isAISuggested: true,
            aiReason:
              "Phù hợp với mong muốn về khí hậu mát mẻ và điểm đến Đà Lạt trong yêu cầu của bạn.",
          });
        }
      }

      if (
        query.includes("biển") ||
        query.includes("phú quốc") ||
        query.includes("phu quoc") ||
        query.includes("đảo")
      ) {
        const phuquoc = tours.find(
          (t) => t.destination === "Phú Quốc",
        );
        if (phuquoc) {
          suggestions.push({
            ...phuquoc,
            isAISuggested: true,
            aiReason:
              "Lựa chọn hoàn hảo cho chuyến du lịch biển đảo với bãi biển đẹp và nhiều hoạt động thú vị.",
          });
        }
      }

      if (
        query.includes("ninh bình") ||
        query.includes("miền bắc") ||
        query.includes("hà nội") ||
        query.includes("cố đô")
      ) {
        const ninhbinh = tours.find(
          (t) => t.destination === "Ninh Bình",
        );
        if (ninhbinh) {
          suggestions.push({
            ...ninhbinh,
            isAISuggested: true,
            aiReason:
              "Trải nghiệm văn hóa và thiên nhiên tuyệt đẹp tại cố đô Ninh Bình, phù hợp với ngân sách.",
          });
        }
      }

      // Check price range in query
      const priceMatch = query.match(/(\d+)\s*(triệu|tr)/);
      if (priceMatch && suggestions.length === 0) {
        const budget = parseInt(priceMatch[1]) * 1000000;
        const affordableTours = tours.filter(
          (t) => t.price <= budget,
        );
        affordableTours.slice(0, 2).forEach((tour) => {
          suggestions.push({
            ...tour,
            isAISuggested: true,
            aiReason: `Tour này phù hợp với ngân sách ${priceMatch[1]} triệu đồng của bạn.`,
          });
        });
      }

      // If no specific match, suggest some popular tours
      if (suggestions.length === 0) {
        tours.slice(0, 2).forEach((tour) => {
          suggestions.push({
            ...tour,
            isAISuggested: true,
            aiReason:
              "Tour phổ biến được nhiều khách hàng yêu thích, phù hợp với nhu cầu du lịch của bạn.",
          });
        });
      }

      setAiSuggestions(suggestions);
      setIsAISearching(false);
      setHasSearched(true);
    }, 1500);
  };

  const handleContactAdmin = (tour: Tour) => {
    alert(
      `Yêu cầu tư vấn tour: ${tour.name}\n\n` +
        `Chúng tôi đã ghi nhận yêu cầu của bạn!\n\n` +
        `Quản trị viên sẽ liên hệ với các nhà cung cấp dịch vụ để:\n` +
        `• Kiểm tra tình trạng sẵn có\n` +
        `• Tùy chỉnh tour theo nhu cầu của bạn\n` +
        `• Báo giá chi tiết\n\n` +
        `Chúng tôi sẽ phản hồi trong vòng 24 giờ qua email: ${currentUser?.email || "email của bạn"}`,
    );
  };

  const renderTourCard = (
    tour: Tour | AISuggestedTour,
    isAISuggested = false,
  ) => {
    const aiTour = tour as AISuggestedTour;

    return (
      <div
        key={tour.id}
        className={`bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 group ${
          isAISuggested ? "ring-2 ring-purple-500" : ""
        }`}
      >
        {isAISuggested && (
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-semibold">
              Gợi ý của AI
            </span>
          </div>
        )}

        <div className="relative overflow-hidden">
          <img
            src={tour.image}
            alt={tour.name}
            className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute top-4 right-4 px-3 py-1 bg-white/95 backdrop-blur-sm rounded-full flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-500 fill-current" />
            <span className="text-sm font-semibold">
              {tour.rating}
            </span>
          </div>
          {tour.companyName && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-4 py-3 flex items-center gap-2">
              {tour.companyLogo && (
                <img
                  src={tour.companyLogo}
                  alt={tour.companyName}
                  className="w-5 h-5 rounded object-cover"
                />
              )}
              <span className="text-white text-xs font-medium">
                {tour.companyName}
              </span>
            </div>
          )}
        </div>

        <div className="p-6 space-y-4">
          <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
            {tour.name}
          </h3>

          {isAISuggested && aiTour.aiReason && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
              <p className="text-sm text-purple-900">
                <Sparkles className="w-4 h-4 inline mr-1" />
                {aiTour.aiReason}
              </p>
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-gray-600 text-sm">
              <MapPin className="w-4 h-4" />
              <span>{tour.destination}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600 text-sm">
              <Clock className="w-4 h-4" />
              <span>{tour.duration}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600 text-sm">
              <Users className="w-4 h-4" />
              <span>Tối đa {tour.maxGuests} người</span>
            </div>
          </div>

          <p className="text-gray-600 text-sm line-clamp-2">
            {tour.description}
          </p>

          <div className="pt-4 border-t border-gray-200 flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">
                Giá từ
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {formatPrice(tour.price)}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => onViewTour ? onViewTour(tour) : (setSelectedTour(tour), setShowDetailModal(true))}
                className="px-4 py-2 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-semibold"
              >
                Chi tiết
              </button>
              {isAISuggested ? (
                <button
                  onClick={() =>
                    currentUser
                      ? handleContactAdmin(tour)
                      : onShowLogin?.()
                  }
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all flex items-center gap-2 font-semibold"
                >
                  <MessageCircle className="w-4 h-4" />
                  Liên hệ
                </button>
              ) : (
                <button
                  onClick={() => {
                    if (!currentUser) {
                      onShowLogin?.();
                      return;
                    }
                    onBookTour?.(tour.id);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                >
                  Đặt ngay
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl font-bold mb-6">
              Đặt Tour Du Lịch
            </h1>
            <p className="text-xl text-blue-100 mb-8">
              Chọn tour có sẵn hoặc để AI gợi ý tour phù hợp với
              bạn
            </p>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <section className="bg-white shadow-md sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-4 pt-6">
            <button
              onClick={() => setActiveTab("available")}
              className={`px-6 py-3 rounded-t-lg font-semibold transition-all ${
                activeTab === "available"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <Search className="w-5 h-5 inline mr-2" />
              Tour có sẵn
            </button>
            <button
              onClick={() => setActiveTab("ai-search")}
              className={`px-6 py-3 rounded-t-lg font-semibold transition-all ${
                activeTab === "ai-search"
                  ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <Sparkles className="w-5 h-5 inline mr-2" />
              Tìm tour với AI
            </button>
          </div>
        </div>
      </section>

      {/* Tab Content */}
      {activeTab === "available" ? (
        <>
          {/* Filters Section */}
          <section className="bg-white shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm tour..."
                    value={searchQuery}
                    onChange={(e) =>
                      setSearchQuery(e.target.value)
                    }
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Company Filter */}
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <select
                    value={selectedCompany}
                    onChange={(e) =>
                      setSelectedCompany(e.target.value)
                    }
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                  >
                    <option value="all">Tất cả công ty</option>
                    {companies
                      .filter((c) => c !== "all")
                      .map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                  </select>
                </div>

                {/* Destination Filter */}
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <select
                    value={selectedDestination}
                    onChange={(e) =>
                      setSelectedDestination(e.target.value)
                    }
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
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

                {/* Price Range Filter */}
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <select
                    value={priceRange}
                    onChange={(e) =>
                      setPriceRange(e.target.value)
                    }
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                  >
                    <option value="all">Tất cả mức giá</option>
                    <option value="under5">Dưới 5 triệu</option>
                    <option value="5to10">5 - 10 triệu</option>
                    <option value="over10">
                      Trên 10 triệu
                    </option>
                  </select>
                </div>

                {/* Results Count */}
                <div className="flex items-center justify-center md:justify-start">
                  <span className="text-gray-600">
                    <strong>{filteredTours.length}</strong> tour
                    được tìm thấy
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Tours Grid */}
          <section className="py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {filteredTours.length === 0 ? (
                <div className="text-center py-20">
                  <div className="text-gray-400 mb-4">
                    <Search className="w-16 h-16 mx-auto" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Không tìm thấy tour phù hợp
                  </h3>
                  <p className="text-gray-600">
                    Thử điều chỉnh bộ lọc hoặc tìm kiếm với từ
                    khóa khác
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredTours.map((tour) =>
                    renderTourCard(tour, false),
                  )}
                </div>
              )}
            </div>
          </section>
        </>
      ) : (
        /* AI Search Tab */
        <section className="py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* AI Search Input */}
            <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Tìm tour với AI
                </h2>
                <p className="text-gray-600">
                  Mô tả chuyến đi mơ ước của bạn, AI sẽ gợi ý
                  những tour phù hợp nhất
                </p>
              </div>

              <div className="space-y-4">
                <textarea
                  value={aiQuery}
                  onChange={(e) => setAiQuery(e.target.value)}
                  placeholder="Ví dụ: Tôi muốn đi Đà Lạt với chi phí 5 triệu cho 3 người trong 3 ngày 2 đêm..."
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  rows={4}
                />

                <button
                  onClick={handleAISearch}
                  disabled={isAISearching || !aiQuery.trim()}
                  className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed font-semibold flex items-center justify-center gap-2"
                >
                  {isAISearching ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Đang tìm kiếm...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Tìm tour phù hợp
                    </>
                  )}
                </button>
              </div>

              {/* Example queries */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-600 mb-3">
                  Gợi ý câu hỏi:
                </p>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Tour Đà Lạt giá rẻ cho 2 người",
                    "Du lịch biển Phú Quốc 4 ngày",
                    "Khám phá Ninh Bình cuối tuần",
                  ].map((example) => (
                    <button
                      key={example}
                      onClick={() => setAiQuery(example)}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors text-sm"
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* AI Suggestions */}
            {hasSearched && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-gray-900">
                  Gợi ý cho bạn ({aiSuggestions.length})
                </h3>

                {aiSuggestions.length === 0 ? (
                  <div className="bg-white rounded-2xl p-12 text-center">
                    <div className="text-gray-400 mb-4">
                      <Search className="w-16 h-16 mx-auto" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Không tìm thấy tour phù hợp
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Thử mô tả chi tiết hơn hoặc điều chỉnh yêu
                      cầu của bạn
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {aiSuggestions.map((tour) =>
                      renderTourCard(tour, true),
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      )}

      {/* CTA Section */}
      {activeTab === "available" && (
        <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl font-bold text-white mb-6">
              Cần tư vấn đặt tour?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              {currentUser
                ? "Liên hệ với quản trị viên để được tư vấn chi tiết"
                : "Đăng nhập để chat trực tiếp với tư vấn viên hoặc nhận hỗ trợ 24/7"}
            </p>
            <button
              onClick={onShowLogin}
              className="px-10 py-4 bg-white text-blue-600 rounded-xl hover:bg-gray-50 transition-all shadow-xl font-bold text-lg transform hover:scale-105"
            >
              {currentUser ? "Liên hệ ngay" : "Đăng nhập"}
            </button>
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