import { useState } from "react";
import {
  MapPin,
  Star,
  Clock,
  Users,
  Sparkles,
  Shield,
  HeadphonesIcon,
  TrendingUp,
  Search,
  Loader2,
} from "lucide-react";
import { Tour } from "@/app/types";
import { PublicTourDetailModal } from "./user/PublicTourDetailModal";

interface HomePageProps {
  onShowLogin: () => void;
  popularTours: Tour[];
  onNavigate?: (page: string) => void;
  onViewTour?: (tour: Tour) => void;
}

export function HomePage({
  onShowLogin,
  popularTours,
  onNavigate,
  onViewTour,
}: HomePageProps) {
  const [aiQuery, setAiQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Tour[]>(
    [],
  );
  const [hasSearched, setHasSearched] = useState(false);
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

  const handleAISearch = async () => {
    if (!aiQuery.trim()) return;

    setIsSearching(true);
    setHasSearched(true);

    // Simulate AI search with delay
    setTimeout(() => {
      // Simple keyword matching for demo
      const query = aiQuery.toLowerCase();
      const results = popularTours.filter((tour) => {
        const matchesDestination = tour.destination
          .toLowerCase()
          .includes(query);
        const matchesName = tour.name
          .toLowerCase()
          .includes(query);
        const matchesDescription = tour.description
          .toLowerCase()
          .includes(query);

        // Budget matching
        const budgetMatch = query.match(
          /(\d+)\s*(triệu|tr|trieu|million)/i,
        );
        if (budgetMatch) {
          const budget = parseInt(budgetMatch[1]) * 1000000;
          return tour.price <= budget;
        }

        // Number of days matching
        const daysMatch = query.match(
          /(\d+)\s*(ngày|ngay|day)/i,
        );
        if (daysMatch) {
          const days = parseInt(daysMatch[1]);
          return tour.duration.includes(`${days} ngày`);
        }

        return (
          matchesDestination ||
          matchesName ||
          matchesDescription
        );
      });

      setSearchResults(
        results.length > 0 ? results : popularTours,
      );
      setIsSearching(false);

      // Scroll to results
      setTimeout(() => {
        document
          .getElementById("search-results")
          ?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
      }, 100);
    }, 1500);
  };

  const features = [
    {
      icon: Sparkles,
      title: "Tìm kiếm bằng AI",
      description:
        "Chỉ cần mô tả ý tưởng, AI sẽ gợi ý tour phù hợp nhất",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: Shield,
      title: "Đảm bảo chất lượng",
      description:
        "Tất cả tour được kiểm duyệt kỹ càng, hoàn tiền 100%",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: HeadphonesIcon,
      title: "Hỗ trợ 24/7",
      description:
        "Đội ngũ chăm sóc khách hàng luôn sẵn sàng hỗ trợ bạn",
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: TrendingUp,
      title: "Giá tốt nhất",
      description:
        "Cam kết giá cạnh tranh, nhiều ưu đãi hấp dẫn",
      color: "from-orange-500 to-red-500",
    },
  ];

  const stats = [
    { value: "50,000+", label: "Khách hàng" },
    { value: "1,000+", label: "Tour du lịch" },
    { value: "200+", label: "Điểm đến" },
    { value: "4.9/5", label: "Đánh giá" },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section
        id="home"
        className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                <Sparkles className="w-4 h-4" />
                Tìm kiếm bằng AI - Công nghệ mới nhất
              </div>

              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Khám phá Việt Nam
                <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Theo cách của bạn
                </span>
              </h1>

              <p className="text-xl text-gray-600 leading-relaxed">
                Nền tảng đặt tour thông minh với AI, giúp bạn
                tìm chuyến đi hoàn hảo chỉ trong vài giây. Từ
                núi rừng hùng vĩ đến biển xanh trong vắt.
              </p>

              {/* AI Search Box */}
              <div className="bg-white rounded-2xl shadow-2xl p-6 border-2 border-purple-100">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  <h3 className="font-semibold text-gray-900">
                    Tìm kiếm tour bằng AI
                  </h3>
                </div>
                <div className="space-y-3">
                  <textarea
                    value={aiQuery}
                    onChange={(e) => setAiQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleAISearch();
                      }
                    }}
                    placeholder='Ví dụ: "Tôi muốn đi Đà Lạt với chi phí 5 triệu cho 3 người trong 3 ngày 2 đêm"'
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                    rows={3}
                  />
                  <button
                    onClick={handleAISearch}
                    disabled={isSearching || !aiQuery.trim()}
                    className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed font-semibold flex items-center justify-center gap-2"
                  >
                    {isSearching ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Đang tìm kiếm...
                      </>
                    ) : (
                      <>
                        <Search className="w-5 h-5" />
                        Tìm tour phù hợp
                      </>
                    )}
                  </button>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="text-xs text-gray-500">
                    Gợi ý:
                  </span>
                  {[
                    "Đà Lạt 3 ngày",
                    "Phú Quốc 5 triệu",
                    "Ninh Bình 2 ngày",
                  ].map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => setAiQuery(suggestion)}
                      className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs hover:bg-purple-100 transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 pt-8">
                {stats.map((stat, index) => (
                  <div
                    key={index}
                    className="text-center lg:text-left"
                  >
                    <div className="text-3xl font-bold text-gray-900">
                      {stat.value}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl blur-3xl opacity-20"></div>
              <img
                src="https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800&q=80"
                alt="Việt Nam Travel"
                className="relative rounded-3xl shadow-2xl w-full h-[500px] object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Tại sao chọn TourViet?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Chúng tôi mang đến trải nghiệm đặt tour hoàn toàn
              mới với công nghệ hiện đại
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-transparent"
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${feature.color} rounded-2xl opacity-0 group-hover:opacity-5 transition-opacity`}
                  ></div>

                  <div
                    className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}
                  >
                    <Icon className="w-7 h-7 text-white" />
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* AI Search Results Section */}
      {hasSearched && (
        <section id="search-results" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium mb-4">
                <Sparkles className="w-4 h-4" />
                Kết quả tìm kiếm AI
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                {searchResults.length} tour phù hợp với yêu cầu
                của bạn
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Dựa trên: "{aiQuery}"
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {searchResults.map((tour) => (
                <div
                  key={tour.id}
                  className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 group cursor-pointer border-2 border-purple-200"
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={tour.image}
                      alt={tour.name}
                      className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-4 left-4 px-3 py-1 bg-purple-600 text-white rounded-full flex items-center gap-1 text-sm font-semibold">
                      <Sparkles className="w-3 h-3" />
                      AI Recommend
                    </div>
                    <div className="absolute top-4 right-4 px-3 py-1 bg-white/95 backdrop-blur-sm rounded-full flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="text-sm font-semibold">
                        {tour.rating}
                      </span>
                    </div>
                  </div>

                  <div className="p-6 space-y-4">
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors">
                      {tour.name}
                    </h3>

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
                        <span>
                          Tối đa {tour.maxGuests} người
                        </span>
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
                        <div className="text-2xl font-bold text-purple-600">
                          {formatPrice(tour.price)}
                        </div>
                      </div>
                      <button
                        onClick={() => onViewTour ? onViewTour(tour) : (setSelectedTour(tour), setShowDetailModal(true))}
                        className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-colors"
                      >
                        Xem chi tiết
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-12">
              <button
                onClick={() => {
                  setHasSearched(false);
                  setSearchResults([]);
                  setAiQuery("");
                }}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all font-semibold"
              >
                Tìm kiếm mới
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Popular Tours Section */}
      <section id="tours" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Tour phổ biến
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Những điểm đến được yêu thích nhất bởi hàng ngàn
              du khách
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {popularTours.slice(0, 3).map((tour) => (
              <div
                key={tour.id}
                className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 group cursor-pointer"
              >
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
                </div>

                <div className="p-6 space-y-4">
                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {tour.name}
                  </h3>

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
                    <button
                      onClick={() => onViewTour ? onViewTour(tour) : (setSelectedTour(tour), setShowDetailModal(true))}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Xem chi tiết
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <button
              onClick={onShowLogin}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg font-semibold"
            >
              Xem tất cả tour
            </button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Sẵn sàng cho chuyến đi tiếp theo?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Đăng nhập ngay để khám phá hàng ngàn tour du lịch và
            nhận ưu đãi đặc biệt
          </p>
          <button
            onClick={onShowLogin}
            className="px-10 py-4 bg-white text-blue-600 rounded-xl hover:bg-gray-50 transition-all shadow-xl font-bold text-lg transform hover:scale-105"
          >
            Đăng nhập ngay
          </button>
        </div>
      </section>

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