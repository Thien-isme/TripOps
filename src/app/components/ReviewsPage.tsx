import {
  Star,
  ThumbsUp,
  MapPin,
  Calendar,
  Quote,
} from "lucide-react";
import { useState } from "react";

interface ReviewsPageProps {
  onShowLogin: () => void;
}

export function ReviewsPage({ onShowLogin }: ReviewsPageProps) {
  const [selectedRating, setSelectedRating] = useState<
    number | "all"
  >("all");
  const [selectedDestination, setSelectedDestination] =
    useState<string>("all");

  const reviews = [
    {
      id: 1,
      name: "Nguyễn Văn A",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80",
      rating: 5,
      tour: "Khám phá Hà Giang - 4 ngày 3 đêm",
      destination: "Hà Giang",
      date: "15/01/2026",
      comment:
        "Chuyến đi tuyệt vời! Hướng dẫn viên nhiệt tình, lịch trình hợp lý. Phong cảnh Hà Giang đẹp như mơ. Nhất định sẽ quay lại lần nữa!",
      images: [
        "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=300&q=80",
        "https://images.unsplash.com/photo-1528127269322-539801943592?w=300&q=80",
      ],
      likes: 45,
    },
    {
      id: 2,
      name: "Trần Thị B",
      avatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80",
      rating: 5,
      tour: "Thiên đường biển Phú Quốc - 3 ngày 2 đêm",
      destination: "Phú Quốc",
      date: "10/01/2026",
      comment:
        "Kỳ nghỉ hoàn hảo! Khách sạn đẹp, ăn uống ngon, dịch vụ chu đáo. Biển Phú Quốc xanh trong vắt. Cảm ơn TourViet đã tổ chức chuyến đi tuyệt vời!",
      images: [
        "https://images.unsplash.com/photo-1559628376-f3fe5f782a2e?w=300&q=80",
      ],
      likes: 38,
    },
    {
      id: 3,
      name: "Lê Văn C",
      avatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80",
      rating: 5,
      tour: "Miền Tây sông nước - 2 ngày 1 đêm",
      destination: "Cần Thơ",
      date: "05/01/2026",
      comment:
        "Trải nghiệm văn hóa miền Tây rất thú vị. Ăn trái cây vườn, đi chợ nổi, nghe đờn ca tài tử. Hướng dẫn viên tận tâm, giá cả hợp lý!",
      images: [
        "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=300&q=80",
        "https://images.unsplash.com/photo-1528127269322-539801943592?w=300&q=80",
        "https://images.unsplash.com/photo-1559628376-f3fe5f782a2e?w=300&q=80",
      ],
      likes: 52,
    },
    {
      id: 4,
      name: "Phạm Thị D",
      avatar:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80",
      rating: 4,
      tour: "Đà Lạt thơ mộng - 3 ngày 2 đêm",
      destination: "Đà Lạt",
      date: "28/12/2025",
      comment:
        "Chuyến đi rất tốt, chỉ có điều thời tiết không được như mong đợi. Tuy nhiên dịch vụ và lịch trình vẫn rất ổn. Sẽ giới thiệu bạn bè!",
      images: [
        "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=300&q=80",
      ],
      likes: 29,
    },
    {
      id: 5,
      name: "Hoàng Văn E",
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80",
      rating: 5,
      tour: "Hội An cổ kính - 2 ngày 1 đêm",
      destination: "Hội An",
      date: "20/12/2025",
      comment:
        "Hội An đẹp lung linh với đèn lồng. Ăn uống ngon, mua sắm thỏa thích. Hướng dẫn viên nhiệt tình, giúp chụp ảnh đẹp. Rất đáng để đi!",
      images: [
        "https://images.unsplash.com/photo-1528127269322-539801943592?w=300&q=80",
        "https://images.unsplash.com/photo-1559628376-f3fe5f782a2e?w=300&q=80",
      ],
      likes: 41,
    },
    {
      id: 6,
      name: "Võ Thị F",
      avatar:
        "https://images.unsplash.com/photo-1534751516642-a1af1ef26a56?w=100&q=80",
      rating: 5,
      tour: "Nha Trang biển xanh - 3 ngày 2 đêm",
      destination: "Nha Trang",
      date: "15/12/2025",
      comment:
        "Biển Nha Trang đẹp tuyệt vời! Tour tổ chức chuyên nghiệp, lặn ngắm san hô rất thú vị. Khách sạn view đẹp, ăn hải sản tươi ngon!",
      images: [
        "https://images.unsplash.com/photo-1559628376-f3fe5f782a2e?w=300&q=80",
      ],
      likes: 36,
    },
  ];

  const destinations = [
    "all",
    ...Array.from(new Set(reviews.map((r) => r.destination))),
  ];

  const filteredReviews = reviews.filter((review) => {
    const matchesRating =
      selectedRating === "all" ||
      review.rating === selectedRating;
    const matchesDestination =
      selectedDestination === "all" ||
      review.destination === selectedDestination;
    return matchesRating && matchesDestination;
  });

  const averageRating = (
    reviews.reduce((sum, r) => sum + r.rating, 0) /
    reviews.length
  ).toFixed(1);
  const ratingDistribution = [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    count: reviews.filter((r) => r.rating === rating).length,
    percentage:
      (reviews.filter((r) => r.rating === rating).length /
        reviews.length) *
      100,
  }));

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-5 h-5 ${
          i < rating
            ? "text-yellow-500 fill-current"
            : "text-gray-300"
        }`}
      />
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl font-bold mb-6">
              Đánh Giá Của Khách Hàng
            </h1>
            <p className="text-xl text-blue-100 mb-8">
              Hàng ngàn khách hàng đã tin tưởng và hài lòng với
              dịch vụ của chúng tôi. Đọc trải nghiệm thực tế từ
              những du khách đã đi cùng TourViet!
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 -mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Average Rating */}
              <div className="text-center border-r border-gray-200 last:border-r-0">
                <div className="text-5xl font-bold text-blue-600 mb-2">
                  {averageRating}
                </div>
                <div className="flex items-center justify-center gap-1 mb-2">
                  {renderStars(5)}
                </div>
                <div className="text-sm text-gray-600">
                  Dựa trên {reviews.length} đánh giá
                </div>
              </div>

              {/* Total Reviews */}
              <div className="text-center border-r border-gray-200 last:border-r-0">
                <div className="text-5xl font-bold text-purple-600 mb-2">
                  {reviews.length}
                </div>
                <div className="text-lg font-semibold text-gray-900 mb-1">
                  Đánh giá
                </div>
                <div className="text-sm text-gray-600">
                  Từ khách hàng thực tế
                </div>
              </div>

              {/* Satisfaction Rate */}
              <div className="text-center">
                <div className="text-5xl font-bold text-green-600 mb-2">
                  98%
                </div>
                <div className="text-lg font-semibold text-gray-900 mb-1">
                  Hài lòng
                </div>
                <div className="text-sm text-gray-600">
                  Khách hàng quay lại
                </div>
              </div>
            </div>

            {/* Rating Distribution */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Phân bố đánh giá
              </h3>
              <div className="space-y-3">
                {ratingDistribution.map((dist) => (
                  <div
                    key={dist.rating}
                    className="flex items-center gap-4"
                  >
                    <div className="flex items-center gap-1 w-24">
                      <span className="text-sm font-medium text-gray-700">
                        {dist.rating}
                      </span>
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    </div>
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500"
                        style={{ width: `${dist.percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 w-12 text-right">
                      {dist.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="py-8 bg-white sticky top-16 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-gray-700 font-medium">
              Lọc theo:
            </span>

            {/* Rating Filter */}
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedRating("all")}
                className={`px-4 py-2 rounded-lg transition-all ${
                  selectedRating === "all"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Tất cả
              </button>
              {[5, 4].map((rating) => (
                <button
                  key={rating}
                  onClick={() => setSelectedRating(rating)}
                  className={`px-4 py-2 rounded-lg transition-all flex items-center gap-1 ${
                    selectedRating === rating
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <span>{rating}</span>
                  <Star className="w-4 h-4 fill-current" />
                </button>
              ))}
            </div>

            {/* Destination Filter */}
            <select
              value={selectedDestination}
              onChange={(e) =>
                setSelectedDestination(e.target.value)
              }
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

            <span className="ml-auto text-sm text-gray-600">
              <strong>{filteredReviews.length}</strong> đánh giá
            </span>
          </div>
        </div>
      </section>

      {/* Reviews List */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-6">
            {filteredReviews.map((review) => (
              <div
                key={review.id}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all"
              >
                <div className="flex items-start gap-6">
                  {/* Avatar */}
                  <img
                    src={review.avatar}
                    alt={review.name}
                    className="w-16 h-16 rounded-full object-cover flex-shrink-0"
                  />

                  {/* Content */}
                  <div className="flex-1">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">
                          {review.name}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                          <Calendar className="w-4 h-4" />
                          <span>{review.date}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {renderStars(review.rating)}
                        </div>
                      </div>
                    </div>

                    {/* Tour Info */}
                    <div className="flex items-center gap-4 mb-4 text-sm">
                      <div className="flex items-center gap-2 text-blue-600 font-medium">
                        <MapPin className="w-4 h-4" />
                        <span>{review.tour}</span>
                      </div>
                    </div>

                    {/* Comment */}
                    <div className="relative mb-4">
                      <Quote className="absolute -top-2 -left-2 w-8 h-8 text-blue-200" />
                      <p className="text-gray-700 leading-relaxed pl-6">
                        {review.comment}
                      </p>
                    </div>

                    {/* Images */}
                    {review.images.length > 0 && (
                      <div className="flex gap-3 mb-4 overflow-x-auto pb-2">
                        {review.images.map((image, index) => (
                          <img
                            key={index}
                            src={image}
                            alt={`Review ${index + 1}`}
                            className="w-32 h-32 rounded-lg object-cover flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                          />
                        ))}
                      </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <button className="flex items-center gap-2 hover:text-blue-600 transition-colors">
                        <ThumbsUp className="w-4 h-4" />
                        <span>Hữu ích ({review.likes})</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Bạn cũng muốn có trải nghiệm tuyệt vời?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Đăng nhập ngay để đặt tour và tạo nên những kỷ niệm
            đáng nhớ
          </p>
          <button
            onClick={onShowLogin}
            className="px-10 py-4 bg-white text-blue-600 rounded-xl hover:bg-gray-50 transition-all shadow-xl font-bold text-lg transform hover:scale-105"
          >
            Đăng nhập ngay
          </button>
        </div>
      </section>
    </div>
  );
}