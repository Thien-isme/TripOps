import { useState } from "react";
import {
  Calendar,
  MapPin,
  User,
  Mail,
  Phone,
  CheckCircle,
  Clock,
  XCircle,
  ChevronDown,
  ChevronUp,
  Star,
  MessageCircle,
  Home,
  Image,
  FileText,
  Users,
  CreditCard,
  AlertTriangle,
  UserCheck,
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/dialog";
import { CancelTourModal } from "./CancelTourModal";
import type { Booking } from "@/app/types";

interface MyBookingsProps {
  bookings: Booking[];
  onCancelBooking: (bookingId: string, reason: string) => void;
}

export function MyBookings({
  bookings,
  onCancelBooking,
}: MyBookingsProps) {
  const [expandedBooking, setExpandedBooking] = useState<
    string | null
  >(null);
  const [showCancelModal, setShowCancelModal] = useState<
    string | null
  >(null);
  const [showRoomDetailsModal, setShowRoomDetailsModal] =
    useState<string | null>(null);
  const [selectedBookingForDetails, setSelectedBookingForDetails] =
    useState<Booking | null>(null);
  const [filterStatus, setFilterStatus] =
    useState<string>("all");

  const filteredBookings = bookings.filter(
    (booking) =>
      filterStatus === "all" || booking.status === filterStatus,
  );

  const handleCancelBooking = (reason: string) => {
    if (showCancelModal) {
      onCancelBooking(showCancelModal, reason);
      setShowCancelModal(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return (
          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
            Đã xác nhận
          </span>
        );
      case "completed":
        return (
          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
            Đã hoàn thành
          </span>
        );
      case "cancelled":
        return (
          <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold">
            Đã hủy
          </span>
        );
      case "rejected":
        return (
          <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-semibold">
            Đã từ chối
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 bg-amber-100 text-amber-800 border border-amber-300 rounded-full text-xs font-semibold">
            Chờ xác nhận &amp; chốt giá
          </span>
        );
    }
  };

  const filterTabs = [
    { id: "all", label: "Tất cả" },
    { id: "pending", label: "Chờ xác nhận" },
    { id: "confirmed", label: "Đã xác nhận" },
    { id: "completed", label: "Hoàn thành" },
    { id: "cancelled", label: "Đã hủy" },
    { id: "rejected", label: "Đã từ chối" },
  ];

  // Helper function to get booking display data
  const getBookingDisplayData = (booking: Booking) => {
    return {
      tourName: booking.tour?.name || "N/A",
      tourCode: booking.tour?.tourCode || "N/A",
      image: booking.tour?.image || "",
      startDate: booking.tourStartDate || "N/A",
      endDate: booking.tourStartDate || "N/A", // Could calculate from duration
      destination: booking.tour?.destination || "N/A",
      itinerary: booking.tour?.itinerary || [],
      accommodation: booking.tour
        ? (booking.tour as any).accommodation
        : null,
    };
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Tour đã đặt
          </h1>
          <p className="text-gray-600">
            Quản lý và theo dõi các tour du lịch của bạn
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterStatus === tab.id
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              {tab.label}
              <span className="ml-2 bg-white/20 px-2 py-0.5 rounded-full text-xs">
                {tab.id === "all"
                  ? bookings.length
                  : bookings.filter((b) => b.status === tab.id)
                      .length}
              </span>
            </button>
          ))}
        </div>

        {/* Bookings List */}
        <div className="space-y-6">
          {filteredBookings.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center shadow-lg">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Không tìm thấy tour nào
              </h3>
              <p className="text-gray-600">
                Thử thay đổi bộ lọc trạng thái
              </p>
            </div>
          ) : (
            filteredBookings.map((booking) => {
              const displayData =
                getBookingDisplayData(booking);
              return (
                <div
                  key={booking.id}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden border-2 border-gray-200 hover:border-blue-300 transition-all"
                >
                  {/* Booking Header */}
                  <div className="p-6">
                    <div className="flex flex-col lg:flex-row gap-6">
                      {/* Tour Image */}
                      <div className="lg:w-64 flex-shrink-0">
                        <img
                          src={displayData.image}
                          alt={displayData.tourName}
                          className="w-full h-48 object-cover rounded-xl"
                        />
                      </div>

                      {/* Booking Info */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-2xl font-bold text-gray-900">
                                {displayData.tourName}
                              </h3>
                              <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm font-mono">
                                {displayData.tourCode}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                              {getStatusBadge(booking.status)}
                              {booking.paymentStatus === "paid" && (
                                <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-xs font-semibold">
                                  Đã thanh toán đủ
                                </span>
                              )}
                              {booking.paymentStatus === "deposit_paid" && (
                                <span className="px-2.5 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-semibold">
                                  Đã đặt cọc 50%
                                </span>
                              )}
                              {booking.paymentStatus === "unpaid" && (
                                <span className="px-2.5 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-full text-xs font-semibold">
                                  Chưa thanh toán (Thanh toán sau)
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-blue-600">
                              {booking.totalPrice.toLocaleString(
                                "vi-VN",
                              )}
                              đ
                            </p>
                            <p className="text-sm text-gray-600">
                              {booking.numberOfGuests} người ({Math.round(booking.totalPrice / (booking.numberOfGuests || 1)).toLocaleString("vi-VN")}đ/người)
                            </p>
                          </div>
                        </div>

                        {booking.status === "pending" && (
                          <div className="bg-amber-50/70 border border-amber-200 rounded-lg p-2.5 mb-3 text-xs text-amber-900 flex items-start gap-2">
                            <Clock className="w-4 h-4 text-amber-700 mt-0.5 flex-shrink-0" />
                            <span>
                              Công ty du lịch đang liên hệ với các đơn vị dịch vụ bên ngoài (khách sạn, quán ăn) để kiểm tra tình trạng chỗ và chốt giá chính thức. Bạn sẽ nhận được thông báo thanh toán sau khi hoàn tất xác nhận.
                            </span>
                          </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div className="flex items-center gap-2 text-gray-600">
                            <Calendar className="w-5 h-5 text-blue-600" />
                            <span>
                              {displayData.startDate} -{" "}
                              {displayData.endDate}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <MapPin className="w-5 h-5 text-blue-600" />
                            <span>
                              {displayData.destination}
                            </span>
                          </div>
                          {booking.guideName && (
                            <>
                              <div className="flex items-center gap-3 text-gray-600 col-span-1 md:col-span-2 bg-blue-50 p-3 rounded-lg border border-blue-100">
                                {booking.guideAvatar ? (
                                  <img
                                    src={booking.guideAvatar}
                                    alt={booking.guideName}
                                    className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                                  />
                                ) : (
                                  <div className="w-10 h-10 rounded-full bg-blue-200 flex items-center justify-center text-blue-600 font-bold">
                                    {booking.guideName.charAt(
                                      0,
                                    )}
                                  </div>
                                )}
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className="font-semibold text-gray-900">
                                      {booking.guideName}
                                    </span>
                                    <span className="text-xs bg-blue-200 text-blue-800 px-2 py-0.5 rounded-full">
                                      Hướng dẫn viên
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2 text-sm mt-0.5">
                                    <Phone className="w-3 h-3" />
                                    <span>
                                      {booking.guidePhone}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </>
                          )}
                        </div>

                        {booking.status === "rejected" &&
                          booking.rejectionReason && (
                            <div className="bg-red-50 border border-red-200 p-4 rounded-lg mb-4">
                              <div className="flex items-start gap-3">
                                <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                                <div>
                                  <h4 className="font-semibold text-red-900">
                                    Booking bị từ chối
                                  </h4>
                                  <p className="text-red-700 text-sm mt-1">
                                    {booking.rejectionReason}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}

                        {booking.status === "cancelled" &&
                          booking.cancellationReason && (
                            <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg mb-4">
                              <div className="flex items-start gap-3">
                                <XCircle className="w-5 h-5 text-orange-600 mt-0.5" />
                                <div>
                                  <h4 className="font-semibold text-orange-900">
                                    Lý do hủy tour
                                  </h4>
                                  <p className="text-orange-700 text-sm mt-1">
                                    {booking.cancellationReason}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-3">
                          <button
                            onClick={() => setSelectedBookingForDetails(booking)}
                            className="px-5 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-semibold flex items-center gap-2 shadow-sm text-sm"
                          >
                            <FileText className="w-4 h-4" />
                            Xem chi tiết booking
                          </button>

                          <button
                            onClick={() =>
                              setExpandedBooking(
                                expandedBooking === booking.id
                                  ? null
                                  : booking.id,
                              )
                            }
                            className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center gap-2 shadow-sm text-sm"
                          >
                            {expandedBooking === booking.id ? (
                              <>
                                <ChevronUp className="w-4 h-4" />
                                Ẩn lộ trình
                              </>
                            ) : (
                              <>
                                <ChevronDown className="w-4 h-4" />
                                Xem lộ trình chi tiết
                              </>
                            )}
                          </button>

                          {booking.status === "confirmed" && (
                            <button
                              onClick={() =>
                                setShowCancelModal(booking.id)
                              }
                              className="px-6 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors font-semibold flex items-center gap-2"
                            >
                              <XCircle className="w-5 h-5" />
                              Hủy tour
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Itinerary */}
                  {expandedBooking === booking.id && (
                    <div className="border-t-2 border-gray-200 bg-gradient-to-br from-blue-50 to-purple-50 p-6">
                      {/* Accommodation Info in Itinerary */}
                      {displayData.accommodation && (
                        <div className="bg-white rounded-xl p-5 shadow-sm mb-6 border border-blue-100">
                          <h4 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
                            <Home className="w-5 h-5 text-blue-600" />
                            Thông tin lưu trú
                          </h4>

                          {/* Accommodation Images */}
                          {displayData.accommodation.images &&
                            displayData.accommodation.images
                              .length > 0 && (
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
                                {displayData.accommodation.images.map(
                                  (img, idx) => (
                                    <img
                                      key={idx}
                                      src={img}
                                      alt={`${displayData.accommodation.name} - ${idx + 1}`}
                                      className="w-full h-32 object-cover rounded-lg shadow-sm"
                                    />
                                  ),
                                )}
                              </div>
                            )}

                          <div className="space-y-3">
                            <div className="text-gray-900 font-semibold text-lg">
                              {displayData.accommodation.name ||
                                displayData.accommodation}
                            </div>

                            {displayData.accommodation
                              .address && (
                              <div className="flex items-start gap-2 text-gray-700">
                                <MapPin className="w-4 h-4 mt-0.5 text-blue-600 flex-shrink-0" />
                                <span className="text-sm">
                                  {
                                    displayData.accommodation
                                      .address
                                  }
                                </span>
                              </div>
                            )}

                            {displayData.accommodation
                              .checkInTime && (
                              <div className="flex items-center gap-2 text-gray-700">
                                <Clock className="w-4 h-4 text-blue-600" />
                                <span className="text-sm">
                                  Check-in:{" "}
                                  {
                                    displayData.accommodation
                                      .checkInTime
                                  }
                                </span>
                              </div>
                            )}

                            <div className="flex flex-col sm:flex-row gap-3 pt-3">
                              {displayData.accommodation
                                .roomDetails && (
                                <Button
                                  className="bg-purple-600 hover:bg-purple-700 text-white gap-2 flex-1"
                                  onClick={() =>
                                    setShowRoomDetailsModal(
                                      booking.id,
                                    )
                                  }
                                >
                                  <Image className="w-4 h-4" />
                                  Xem chi tiết phòng
                                </Button>
                              )}
                              <Button
                                className="bg-blue-600 hover:bg-blue-700 text-white gap-2 flex-1"
                                onClick={() =>
                                  alert(
                                    "Mở cửa sổ chat với nơi lưu trú...",
                                  )
                                }
                              >
                                <MessageCircle className="w-4 h-4" />
                                Chat với nơi lưu trú
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}

                      <h4 className="text-xl font-bold text-gray-900 mb-4">
                        Lộ trình chi tiết
                      </h4>
                      {displayData.itinerary.length > 0 ? (
                        <div className="space-y-4">
                          {displayData.itinerary.map(
                            (day, dayIndex) => (
                              <div
                                key={day.id}
                                className="bg-white rounded-xl p-4 shadow"
                              >
                                <div className="flex items-center gap-2 mb-4">
                                  <div className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold">
                                    {dayIndex + 1}
                                  </div>
                                  <div>
                                    <h4 className="font-semibold text-gray-900">
                                      {day.title}
                                    </h4>
                                    <p className="text-sm text-gray-600">
                                      {day.description}
                                    </p>
                                  </div>
                                </div>

                                <div className="space-y-3 ml-10">
                                  {day.locations.map(
                                    (location) => (
                                      <div
                                        key={location.id}
                                        className="flex items-start gap-3 p-4 rounded-lg border-2 bg-gray-50 border-gray-200"
                                      >
                                        <div className="flex-shrink-0 mt-1">
                                          <MapPin className="w-6 h-6 text-blue-600" />
                                        </div>
                                        <div className="flex-1">
                                          <h5 className="font-semibold text-gray-900 mb-1">
                                            {location.name}
                                          </h5>
                                          <p className="text-sm text-gray-600 mb-2">
                                            {location.address}
                                          </p>
                                          <div className="flex items-center gap-4 text-sm">
                                            <span className="flex items-center gap-1 text-blue-600">
                                              <Calendar className="w-4 h-4" />
                                              {day.date}
                                            </span>
                                            <span className="flex items-center gap-1 text-purple-600">
                                              <Clock className="w-4 h-4" />
                                              {location.time}
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    ),
                                  )}
                                </div>
                              </div>
                            ),
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500 bg-white rounded-xl">
                          Chưa có thông tin lộ trình chi tiết.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelModal &&
        (() => {
          const booking = bookings.find(
            (b) => b.id === showCancelModal,
          );
          if (!booking) return null;
          const displayData = getBookingDisplayData(booking);

          return (
            <CancelTourModal
              bookingId={showCancelModal}
              tourName={displayData.tourName}
              onCancel={() => setShowCancelModal(null)}
              onConfirm={handleCancelBooking}
            />
          );
        })()}

      {/* Room Details Modal */}
      {showRoomDetailsModal &&
        (() => {
          const booking = bookings.find(
            (b) => b.id === showRoomDetailsModal,
          );
          if (!booking) return null;

          const displayData = getBookingDisplayData(booking);
          const roomDetails =
            displayData.accommodation?.roomDetails;

          if (!displayData.accommodation || !roomDetails)
            return null;

          return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      Chi tiết phòng
                    </h3>
                    <p className="text-gray-600">
                      {displayData.accommodation.name}
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      setShowRoomDetailsModal(null)
                    }
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <XCircle className="w-6 h-6 text-gray-500" />
                  </button>
                </div>

                {/* Room Images */}
                {displayData.accommodation.images &&
                  displayData.accommodation.images.length >
                    0 && (
                    <div className="grid grid-cols-2 gap-2 mb-6">
                      {displayData.accommodation.images.map(
                        (img, idx) => (
                          <img
                            key={idx}
                            src={img}
                            alt={`Room ${idx + 1}`}
                            className="w-full h-40 object-cover rounded-lg"
                          />
                        ),
                      )}
                    </div>
                  )}

                <div className="space-y-6">
                  {/* Room Info */}
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">
                      Thông tin phòng
                    </h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-gray-600">
                          Loại phòng:
                        </span>
                        <p className="font-semibold text-gray-900">
                          {roomDetails.roomType}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600">
                          Diện tích:
                        </span>
                        <p className="font-semibold text-gray-900">
                          {roomDetails.size}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600">
                          Loại giường:
                        </span>
                        <p className="font-semibold text-gray-900">
                          {roomDetails.bedType}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600">
                          Số khách:
                        </span>
                        <p className="font-semibold text-gray-900">
                          Tối đa {roomDetails.maxGuests} người
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Check-in/out */}
                  <div className="bg-green-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">
                      Thời gian
                    </h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-green-600" />
                        <div>
                          <span className="text-gray-600">
                            Check-in:
                          </span>
                          <p className="font-semibold text-gray-900">
                            {roomDetails.checkInTime}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-green-600" />
                        <div>
                          <span className="text-gray-600">
                            Check-out:
                          </span>
                          <p className="font-semibold text-gray-900">
                            {roomDetails.checkOutTime}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Amenities */}
                  <div className="bg-purple-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">
                      Tiện nghi trong phòng
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      {roomDetails.amenities.map(
                        (amenity, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-2 text-sm text-gray-700"
                          >
                            <CheckCircle className="w-4 h-4 text-purple-600" />
                            <span>{amenity}</span>
                          </div>
                        ),
                      )}
                    </div>
                  </div>

                  {/* Services */}
                  <div className="bg-yellow-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">
                      Dịch vụ
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      {roomDetails.services.map(
                        (service, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-2 text-sm text-gray-700"
                          >
                            <CheckCircle className="w-4 h-4 text-yellow-600" />
                            <span>{service}</span>
                          </div>
                        ),
                      )}
                    </div>
                  </div>

                  {/* Cancellation Policy */}
                  <div className="bg-red-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">
                      Chính sách hủy phòng
                    </h4>
                    <p className="text-sm text-gray-700">
                      {roomDetails.cancellationPolicy}
                    </p>
                  </div>
                </div>

                <div className="mt-6">
                  <Button
                    onClick={() =>
                      setShowRoomDetailsModal(null)
                    }
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Đóng
                  </Button>
                </div>
              </div>
            </div>
          );
        })()}

      {/* Booking Details Modal */}
      {selectedBookingForDetails && (
        <Dialog open={!!selectedBookingForDetails} onOpenChange={() => setSelectedBookingForDetails(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-lg font-bold text-gray-900">
                <FileText className="w-5 h-5 text-teal-600" />
                Chi tiết đơn đặt tour – #{selectedBookingForDetails.id}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 text-sm text-gray-700">
              {/* Tour Overview Banner */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <img
                  src={selectedBookingForDetails.tour.image}
                  alt={selectedBookingForDetails.tour.name}
                  className="w-full sm:w-28 h-20 rounded-lg object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-xs px-2 py-0.5 rounded-full font-mono bg-blue-100 text-blue-800">
                      {selectedBookingForDetails.tour.tourCode}
                    </span>
                    {getStatusBadge(selectedBookingForDetails.status)}
                    {selectedBookingForDetails.paymentStatus === "paid" && (
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-xs font-semibold">
                        Đã thanh toán đủ
                      </span>
                    )}
                    {selectedBookingForDetails.paymentStatus === "deposit_paid" && (
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-semibold">
                        Đã cọc 50%
                      </span>
                    )}
                    {selectedBookingForDetails.paymentStatus === "unpaid" && (
                      <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                        Chưa thanh toán
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-gray-900 text-base">{selectedBookingForDetails.tour.name}</h3>
                  <div className="flex flex-wrap gap-4 text-xs text-gray-500 mt-1">
                    <span className="flex items-center gap-1 font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                      <Calendar className="w-3.5 h-3.5" />
                      Khởi hành: {selectedBookingForDetails.tourStartDate || "Chưa xác định"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {selectedBookingForDetails.tour.duration}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {selectedBookingForDetails.tour.destination}
                    </span>
                    {selectedBookingForDetails.companyName && (
                      <span className="font-medium text-gray-700">
                        Đơn vị: {selectedBookingForDetails.companyName}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-teal-600" />
                  Thông tin người đại diện liên hệ
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-xs text-gray-400 block">Họ và tên</span>
                    <span className="font-semibold text-gray-900">
                      {selectedBookingForDetails.contactName || selectedBookingForDetails.userName}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-400 block">Số điện thoại</span>
                    <span className="font-semibold text-gray-900">
                      {selectedBookingForDetails.contactPhone || "—"}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-400 block">Email</span>
                    <span className="text-gray-900">
                      {selectedBookingForDetails.contactEmail || selectedBookingForDetails.userEmail}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-400 block">Ngày đặt</span>
                    <span className="text-gray-900">{selectedBookingForDetails.bookingDate}</span>
                  </div>
                  {selectedBookingForDetails.contactAddress && (
                    <div className="sm:col-span-2">
                      <span className="text-xs text-gray-400 block">Địa chỉ</span>
                      <span className="text-gray-900">{selectedBookingForDetails.contactAddress}</span>
                    </div>
                  )}
                  {selectedBookingForDetails.bookingNotes && (
                    <div className="sm:col-span-2 bg-amber-50 rounded-lg p-2.5 text-xs text-amber-800 border border-amber-200">
                      <strong>Ghi chú:</strong> {selectedBookingForDetails.bookingNotes}
                    </div>
                  )}
                </div>
              </div>

              {/* Passengers */}
              <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-teal-600" />
                  Danh sách hành khách tham gia ({selectedBookingForDetails.passengers?.length || selectedBookingForDetails.numberOfGuests} người)
                </h4>
                {selectedBookingForDetails.passengers && selectedBookingForDetails.passengers.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-gray-100 text-gray-600 font-semibold">
                          <th className="px-3 py-2 text-left rounded-l-lg">#</th>
                          <th className="px-3 py-2 text-left">Họ & Tên</th>
                          <th className="px-3 py-2 text-left">Ngày sinh</th>
                          <th className="px-3 py-2 text-left">Giới tính</th>
                          <th className="px-3 py-2 text-left">Loại khách</th>
                          <th className="px-3 py-2 text-right rounded-r-lg">Giá vé</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {selectedBookingForDetails.passengers.map((p, i) => (
                          <tr key={p.id} className="hover:bg-gray-50">
                            <td className="px-3 py-2 text-gray-400">{i + 1}</td>
                            <td className="px-3 py-2 font-medium text-gray-900">{p.fullName}</td>
                            <td className="px-3 py-2 text-gray-600">{p.dateOfBirth}</td>
                            <td className="px-3 py-2 text-gray-600">{p.gender === "male" ? "Nam" : "Nữ"}</td>
                            <td className="px-3 py-2 text-gray-600">
                              {p.ageGroup === "adult" ? "Người lớn" : p.ageGroup === "child_2_11" ? "Trẻ em (2–11t)" : "Em bé (<2t)"}
                            </td>
                            <td className="px-3 py-2 text-right font-semibold text-blue-700">
                              {p.price === 0 ? "Miễn phí" : p.price.toLocaleString("vi-VN") + "đ"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
                    Đăng ký {selectedBookingForDetails.numberOfGuests} khách theo đại diện {selectedBookingForDetails.contactName || selectedBookingForDetails.userName}.
                  </p>
                )}
              </div>

              {/* Finance & Payment Details */}
              <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-teal-600" />
                  Chi tiết thanh toán
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mb-3">
                  <div className="bg-gray-50 p-2.5 rounded-lg">
                    <span className="text-gray-500 block">Tổng tiền tour</span>
                    <span className="font-bold text-sm text-gray-900">
                      {selectedBookingForDetails.totalPrice.toLocaleString("vi-VN")}đ
                    </span>
                  </div>
                  <div className="bg-gray-50 p-2.5 rounded-lg">
                    <span className="text-gray-500 block">Tiền đặt cọc</span>
                    <span className={`font-bold text-sm ${selectedBookingForDetails.depositPaid ? "text-emerald-700" : "text-amber-600"}`}>
                      {selectedBookingForDetails.depositPaid
                        ? `Đã cọc ${(selectedBookingForDetails.depositAmount ?? Math.ceil(selectedBookingForDetails.totalPrice * 0.5)).toLocaleString("vi-VN")}đ`
                        : "Chưa thanh toán cọc"}
                    </span>
                  </div>
                  <div className="bg-gray-50 p-2.5 rounded-lg">
                    <span className="text-gray-500 block">Số tiền còn lại</span>
                    <span className="font-bold text-sm text-red-600">
                      {(selectedBookingForDetails.remainingAmount ?? (selectedBookingForDetails.depositPaid ? selectedBookingForDetails.totalPrice - (selectedBookingForDetails.depositAmount ?? 0) : selectedBookingForDetails.totalPrice)).toLocaleString("vi-VN")}đ
                    </span>
                  </div>
                  <div className="bg-gray-50 p-2.5 rounded-lg">
                    <span className="text-gray-500 block">Trạng thái</span>
                    <span className="font-semibold text-xs mt-1 inline-block text-blue-700">
                      {selectedBookingForDetails.paymentStatus === "paid" ? "Đã thanh toán đủ" : selectedBookingForDetails.paymentStatus === "deposit_paid" ? "Đã cọc 50%" : "Chưa thanh toán"}
                    </span>
                  </div>
                </div>

                {selectedBookingForDetails.paymentRequests && selectedBookingForDetails.paymentRequests.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-xs font-semibold text-gray-600 mb-2">Các đợt thanh toán từ công ty:</p>
                    <div className="space-y-1.5">
                      {selectedBookingForDetails.paymentRequests.map((pr) => (
                        <div key={pr.id} className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 flex items-center justify-between text-xs">
                          <div>
                            <p className="font-medium text-gray-800">{pr.description}</p>
                            <p className="text-gray-500">Hạn thanh toán: {pr.dueDate}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-blue-700">{pr.amount.toLocaleString("vi-VN")}đ</p>
                            <span className={`font-semibold ${pr.status === "paid" ? "text-emerald-600" : pr.status === "overdue" ? "text-red-600" : "text-amber-600"}`}>
                              {pr.status === "paid" ? "Đã thanh toán" : pr.status === "overdue" ? "Quá hạn" : "Chờ thanh toán"}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Assigned Tour Guide */}
              {selectedBookingForDetails.guideName && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center gap-3">
                  {selectedBookingForDetails.guideAvatar ? (
                    <img
                      src={selectedBookingForDetails.guideAvatar}
                      alt={selectedBookingForDetails.guideName}
                      className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm flex-shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center flex-shrink-0">
                      {selectedBookingForDetails.guideName[0]}
                    </div>
                  )}
                  <div>
                    <span className="text-xs font-bold text-blue-800 uppercase tracking-wide block">
                      Hướng dẫn viên đồng hành
                    </span>
                    <p className="font-bold text-gray-900">{selectedBookingForDetails.guideName}</p>
                    {selectedBookingForDetails.guidePhone && (
                      <p className="text-xs text-blue-700 flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3" />
                        {selectedBookingForDetails.guidePhone}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t">
              <Button onClick={() => setSelectedBookingForDetails(null)} className="bg-teal-600 hover:bg-teal-700 text-white">
                Đóng
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}