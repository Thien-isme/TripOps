import { useState } from "react";
import { Tour } from "@/app/types";
import {
  MapPin,
  Clock,
  Users,
  Search,
  Sparkles,
  ArrowRight,
  SlidersHorizontal,
  Compass,
} from "lucide-react";

interface TourListProps {
  tours: Tour[];
  onBookTour: (tour: Tour) => void;
  onViewTour?: (tour: Tour) => void;
}

export function TourList({ tours, onBookTour, onViewTour }: TourListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDestination, setSelectedDestination] = useState("all");
  const [selectedDuration, setSelectedDuration] = useState("all");

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const destinations = ["all", ...Array.from(new Set(tours.map((t) => t.destination)))];

  const filteredTours = tours.filter((tour) => {
    const matchesSearch =
      tour.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tour.destination.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDest =
      selectedDestination === "all" || tour.destination === selectedDestination;

    return matchesSearch && matchesDest;
  });

  return (
    <div className="space-y-8 font-sans">
      {/* Editorial Filter Header */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E8E4DC] shadow-[0_8px_30px_rgb(0,0,0,0.03)] space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs uppercase font-semibold tracking-widest text-[#BD5E38] flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5" />
              Bộ lọc hành trình có gu
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif text-[#15291E]">
              Khám phá các điểm đến được tuyển chọn
            </h2>
            <p className="text-xs sm:text-sm text-[#686C67] font-light">
              Tìm kiếm hành trình mang đậm dấu ấn bản địa, không gian tĩnh lặng và dịch vụ tận tâm.
            </p>
          </div>

          <div className="text-xs text-[#686C67] font-medium bg-[#FBF9F5] px-3 py-1.5 rounded-full border border-[#E8E4DC]">
            Hiển thị <strong>{filteredTours.length}</strong> hành trình đạt chuẩn
          </div>
        </div>

        {/* Search & Filter Controls */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-2 border-t border-[#E8E4DC]">
          <div className="md:col-span-8 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#686C67]" />
            <input
              type="text"
              placeholder="Nhập tên tour, danh thắng hoặc trải nghiệm mong muốn..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-[#FBF9F5] border border-[#E8E4DC] rounded-xl text-[#191A19] focus:outline-none focus:border-[#15291E] transition-all"
            />
          </div>

          <div className="md:col-span-4">
            <select
              value={selectedDestination}
              onChange={(e) => setSelectedDestination(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-[#FBF9F5] border border-[#E8E4DC] rounded-xl text-[#191A19] focus:outline-none focus:border-[#15291E]"
            >
              <option value="all">Tất cả vùng miền & điểm đến</option>
              {destinations
                .filter((d) => d !== "all")
                .map((dest) => (
                  <option key={dest} value={dest}>
                    {dest}
                  </option>
                ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tour Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredTours.map((tour) => (
          <article
            key={tour.id}
            onClick={() => onViewTour?.(tour)}
            className="group bg-white rounded-2xl overflow-hidden border border-[#E8E4DC] hover:border-[#15291E] hover:shadow-[0_12px_30px_rgb(0,0,0,0.06)] transition-all duration-300 cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="relative aspect-[4/3] overflow-hidden bg-[#FBF9F5]">
                <img
                  src={tour.image}
                  alt={tour.name}
                  className="w-full h-full object-cover filter saturate-[0.92] group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute top-4 left-4 bg-[#FBF9F5]/90 backdrop-blur-md text-[#15291E] px-3 py-1 rounded-full text-xs font-medium border border-[#E8E4DC]">
                  {tour.destination}
                </div>
                {tour.companyName && (
                  <div className="absolute bottom-3 left-3 bg-[#15291E]/80 backdrop-blur-sm text-white px-2.5 py-1 rounded text-[11px] font-light">
                    Đối tác: {tour.companyName}
                  </div>
                )}
              </div>

              <div className="p-6 space-y-4">
                <div className="flex items-center gap-4 text-xs text-[#686C67]">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#BD5E38]" />
                    {tour.duration}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-[#BD5E38]" />
                    Tối đa {tour.maxGuests} khách
                  </span>
                </div>

                <h3 className="text-xl font-serif text-[#15291E] group-hover:text-[#BD5E38] transition-colors leading-snug line-clamp-1">
                  {tour.name}
                </h3>

                <p className="text-xs text-[#686C67] line-clamp-2 leading-relaxed font-light">
                  {tour.description}
                </p>
              </div>
            </div>

            <div className="px-6 pb-6 pt-4 border-t border-[#E8E4DC] flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-[#686C67] block">Chi phí từ</span>
                <span className="text-lg font-serif font-semibold text-[#15291E]">
                  {formatPrice(tour.price)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {onViewTour && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewTour(tour);
                    }}
                    className="px-3.5 py-1.5 rounded-full border border-[#E8E4DC] text-xs font-medium text-[#15291E] hover:border-[#15291E] transition-colors"
                  >
                    Xem chi tiết
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onBookTour(tour);
                  }}
                  className="px-4 py-1.5 rounded-full bg-[#15291E] text-white text-xs font-medium hover:bg-[#BD5E38] transition-all duration-300 shadow-sm"
                >
                  Đặt ngay
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      {filteredTours.length === 0 && (
        <div className="text-center py-20 bg-white rounded-2xl border border-[#E8E4DC] space-y-2">
          <p className="text-sm font-serif text-[#15291E]">Không tìm thấy hành trình phù hợp với tìm kiếm của bạn.</p>
          <p className="text-xs text-[#686C67]">Hãy thử xóa bộ lọc hoặc tìm kiếm theo từ khóa địa danh khác.</p>
        </div>
      )}
    </div>
  );
}
