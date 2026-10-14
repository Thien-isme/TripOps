import { Tour } from "@/app/types";
import {
  X,
  MapPin,
  Clock,
  Users,
  DollarSign,
  Star,
  Calendar,
  User,
  Mail,
  UserCheck,
} from "lucide-react";

interface PublicTourDetailModalProps {
  tour: Tour;
  onClose: () => void;
  onBookNow?: () => void;
}

export function PublicTourDetailModal({
  tour,
  onClose,
  onBookNow,
}: PublicTourDetailModalProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto my-8">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-2xl font-bold text-gray-900">
            Chi tiết tour
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Tour Image */}
          <div className="rounded-xl overflow-hidden shadow-lg">
            <img
              src={tour.image}
              alt={tour.name}
              className="w-full h-80 object-cover"
            />
          </div>

          {/* Tour Name and Description */}
          <div>
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-3xl font-bold text-gray-900">
                {tour.name}
              </h3>
              <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1.5 rounded-full">
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                <span className="font-bold text-gray-900">
                  {tour.rating}
                </span>
              </div>
            </div>
            <p className="text-lg text-gray-600 leading-relaxed">
              {tour.description}
            </p>
          </div>

          {/* Tour Info Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-xl p-4 border-2 border-blue-100">
              <div className="flex items-center gap-2 text-blue-600 mb-1">
                <MapPin className="w-5 h-5" />
                <span className="font-semibold text-sm">
                  Điểm đến
                </span>
              </div>
              <p className="text-gray-900 font-medium">
                {tour.destination}
              </p>
            </div>

            <div className="bg-purple-50 rounded-xl p-4 border-2 border-purple-100">
              <div className="flex items-center gap-2 text-purple-600 mb-1">
                <Clock className="w-5 h-5" />
                <span className="font-semibold text-sm">
                  Thời gian
                </span>
              </div>
              <p className="text-gray-900 font-medium">
                {tour.duration}
              </p>
            </div>

            <div className="bg-green-50 rounded-xl p-4 border-2 border-green-100">
              <div className="flex items-center gap-2 text-green-600 mb-1">
                <DollarSign className="w-5 h-5" />
                <span className="font-semibold text-sm">
                  Giá
                </span>
              </div>
              <p className="text-gray-900 font-bold text-lg">
                {formatPrice(tour.price)}
              </p>
            </div>

            <div className="bg-orange-50 rounded-xl p-4 border-2 border-orange-100">
              <div className="flex items-center gap-2 text-orange-600 mb-1">
                <Users className="w-5 h-5" />
                <span className="font-semibold text-sm">
                  Số khách
                </span>
              </div>
              <p className="text-gray-900 font-medium">
                {tour.minGuests} - {tour.maxGuests} người
              </p>
            </div>

            {tour.tourCode && (
              <div className="bg-indigo-50 rounded-xl p-4 border-2 border-indigo-100">
                <div className="flex items-center gap-2 text-indigo-600 mb-1">
                  <Calendar className="w-5 h-5" />
                  <span className="font-semibold text-sm">
                    Mã tour
                  </span>
                </div>
                <p className="text-gray-900 font-medium">
                  {tour.tourCode}
                </p>
              </div>
            )}
          </div>

          {/* Important Notice - Min Guests */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl p-5">
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                <UserCheck className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h4 className="font-bold text-amber-900 mb-1">
                  Lưu ý về số lượng khách
                </h4>
                <p className="text-amber-800">
                  Tour yêu cầu tối thiểu{" "}
                  <strong>{tour.minGuests} người</strong> và tối
                  đa <strong>{tour.maxGuests} người</strong> để
                  khởi hành.
                </p>
              </div>
            </div>
          </div>

          {/* Highlights */}
          {tour.highlights && tour.highlights.length > 0 && (
            <div>
              <h4 className="font-bold text-2xl text-gray-900 mb-4 flex items-center gap-2">
                <Star className="w-6 h-6 text-yellow-500" />
                Điểm nổi bật
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {tour.highlights.map((highlight, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 bg-gray-50 p-4 rounded-xl"
                  >
                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-sm font-bold">
                        {index + 1}
                      </span>
                    </div>
                    <span className="text-gray-700 leading-relaxed">
                      {highlight}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Itinerary */}
          {tour.itinerary && tour.itinerary.length > 0 && (
            <div>
              <h4 className="font-bold text-2xl text-gray-900 mb-5">
                Lịch trình chi tiết
              </h4>
              <div className="space-y-5">
                {tour.itinerary.map((day, index) => (
                  <div
                    key={day.id}
                    className="border-2 border-gray-200 rounded-xl p-6 hover:border-blue-300 transition-colors"
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                        {day.day}
                      </div>
                      <div className="flex-1">
                        <h5 className="font-bold text-xl text-gray-900 mb-1">
                          {day.title}
                        </h5>
                        <p className="text-gray-600">
                          {day.description}
                        </p>
                        {day.date && (
                          <p className="text-sm text-gray-500 mt-1">
                            Ngày:{" "}
                            {new Date(
                              day.date,
                            ).toLocaleDateString("vi-VN")}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Locations */}
                    {day.locations &&
                      day.locations.length > 0 && (
                        <div className="pl-[72px] space-y-3">
                          {day.locations.map(
                            (location, locIndex) => (
                              <div
                                key={location.id}
                                className="flex items-start gap-3 bg-blue-50 p-4 rounded-lg"
                              >
                                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                                  {locIndex + 1}
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-start justify-between gap-2 mb-1">
                                    <h6 className="font-bold text-gray-900">
                                      {location.name}
                                    </h6>
                                    {location.time && (
                                      <span className="text-sm font-semibold text-blue-600 bg-blue-100 px-2 py-1 rounded">
                                        {location.time}
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-start gap-2 text-sm text-gray-600">
                                    <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                    <span>
                                      {location.address}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ),
                          )}
                        </div>
                      )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Created By Info - Optional */}
          {tour.createdByName && (
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-5 border border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <User className="w-5 h-5 text-gray-600" />
                Thông tin tour
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2 text-gray-700">
                  <User className="w-4 h-4 text-gray-500" />
                  <span>
                    Người tạo:{" "}
                    <strong>{tour.createdByName}</strong>
                  </span>
                </div>
                {tour.createdAt && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span>
                      Ngày tạo:{" "}
                      <strong>{tour.createdAt}</strong>
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer - Action Buttons */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-gray-600">Giá tour</p>
            <p className="text-3xl font-bold text-blue-600">
              {formatPrice(tour.price)}
            </p>
            <p className="text-xs text-gray-500">
              * Giá cho 1 người
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
            >
              Đóng
            </button>
            {onBookNow && (
              <button
                onClick={onBookNow}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl font-semibold"
              >
                Đặt ngay
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}