import { useState } from "react";
import { Tour } from "@/app/types";
import {
  Star,
  MapPin,
  Clock,
  Users,
  Sparkles,
} from "lucide-react";

interface TourListProps {
  tours: Tour[];
  onBookTour: (tour: Tour) => void;
  onViewTour?: (tour: Tour) => void;
}

export function TourList({ tours, onBookTour, onViewTour }: TourListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showAISearch, setShowAISearch] = useState(false);
  const [aiQuery, setAiQuery] = useState("");

  const handleAISearch = () => {
    // Simulate AI search
    alert(
      `Đang tìm kiếm tour phù hợp với yêu cầu: "${aiQuery}"\n\nKết quả sẽ được hiển thị dưới đây.`,
    );
    setShowAISearch(false);
    setAiQuery("");
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const filteredTours = tours.filter(
    (tour) =>
      tour.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      tour.destination
        .toLowerCase()
        .includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Tìm kiếm tour
        </h2>

        <div className="space-y-4">
          <input
            type="text"
            placeholder="Tìm kiếm theo tên tour hoặc điểm đến..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />

          <div className="relative">
            {!showAISearch ? (
              <button
                onClick={() => setShowAISearch(true)}
                className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-5 h-5" />
                Tìm kiếm bằng AI
              </button>
            ) : (
              <div className="space-y-3">
                <textarea
                  placeholder='Ví dụ: "Tôi muốn đi Đà Lạt với chi phí 5 triệu cho 3 người trong 3 ngày 2 đêm"'
                  value={aiQuery}
                  onChange={(e) => setAiQuery(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  rows={3}
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleAISearch}
                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    Tìm kiếm
                  </button>
                  <button
                    onClick={() => {
                      setShowAISearch(false);
                      setAiQuery("");
                    }}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTours.map((tour) => (
          <div
            key={tour.id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="relative">
              <img
                src={tour.image}
                alt={tour.name}
                className="w-full h-48 object-cover"
              />
              {tour.companyName && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-3 py-2 flex items-center gap-2">
                  {tour.companyLogo && (
                    <img
                      src={tour.companyLogo}
                      alt={tour.companyName}
                      className="w-5 h-5 rounded object-cover flex-shrink-0"
                    />
                  )}
                  <span className="text-white text-xs font-medium truncate">
                    {tour.companyName}
                  </span>
                </div>
              )}
            </div>
            <div className="p-5 space-y-3">
              <div className="flex items-start justify-between">
                <h3 className="font-semibold text-lg text-gray-900">
                  {tour.name}
                </h3>
                <div className="flex items-center gap-1 text-yellow-500">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="text-sm font-medium">
                    {tour.rating}
                  </span>
                </div>
              </div>

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

              <div className="pt-3 border-t border-gray-200 flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-600">
                    Giá từ
                  </div>
                  <div className="text-xl font-bold text-blue-600">
                    {formatPrice(tour.price)}
                  </div>
                </div>
                <div className="flex gap-2">
                  {onViewTour && (
                    <button
                      onClick={() => onViewTour(tour)}
                      className="px-3 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors text-sm"
                    >
                      Chi tiết
                    </button>
                  )}
                  <button
                    onClick={() => onBookTour(tour)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Đặt ngay
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredTours.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">
            Không tìm thấy tour phù hợp
          </p>
        </div>
      )}
    </div>
  );
}