import { useState } from "react";
import { Tour, Booking, CustomTourRequest } from "@/app/types";
import { TourList } from "./TourList";
import { MyBookings } from "./MyBookings";
import { BookingModal } from "./BookingModal";
import { UserCustomRequests } from "./UserCustomRequests";
import { Compass, Calendar, PenSquare } from "lucide-react";

interface UserDashboardProps {
  tours: Tour[];
  userBookings: Booking[];
  customTourRequests?: CustomTourRequest[];
  onBookTour: (
    tourId: string,
    numberOfGuests: number,
    startDate: string,
  ) => void;
  onCancelBooking: (bookingId: string, reason: string) => void;
  onViewTour?: (tour: Tour) => void;
  onCancelCustomRequest?: (id: string) => void;
  onNavigateToCustomTourForm?: () => void;
}

export function UserDashboard({
  tours,
  userBookings,
  customTourRequests = [],
  onBookTour,
  onCancelBooking,
  onViewTour,
  onCancelCustomRequest,
  onNavigateToCustomTourForm,
}: UserDashboardProps) {
  const [activeTab, setActiveTab] = useState<
    "explore" | "mybookings" | "custom-requests"
  >("explore");
  const [selectedTour, setSelectedTour] = useState<Tour | null>(
    null,
  );

  const handleBookTour = (
    numberOfGuests: number,
    startDate: string,
  ) => {
    if (selectedTour) {
      onBookTour(selectedTour.id, numberOfGuests, startDate);
      setSelectedTour(null);
      alert(
        "Đặt tour thành công! Vui lòng đợi xác nhận từ quản lý.",
      );
    }
  };

  const tabs = [
    { id: "explore", label: "Khám phá Tour", icon: Compass },
    { id: "mybookings", label: "Tour của tôi", icon: Calendar },
    { id: "custom-requests", label: "Yêu cầu thiết kế", icon: PenSquare, badge: customTourRequests.filter((r) => r.status === "quoted").length },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="flex border-b border-gray-200">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 px-4 py-4 text-center font-medium transition-colors flex items-center justify-center gap-2 text-sm ${
                  activeTab === tab.id
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                {"badge" in tab && (tab.badge ?? 0) > 0 && (
                  <span className="bg-emerald-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {activeTab === "explore" && (
        <TourList
          tours={tours}
          onBookTour={(tour) => setSelectedTour(tour)}
          onViewTour={onViewTour}
        />
      )}

      {activeTab === "mybookings" && (
        <MyBookings
          bookings={userBookings}
          onCancelBooking={onCancelBooking}
        />
      )}

      {activeTab === "custom-requests" && (
        <UserCustomRequests
          requests={customTourRequests}
          onCancel={(id) => onCancelCustomRequest?.(id)}
          onNavigateToForm={() => onNavigateToCustomTourForm?.()}
        />
      )}

      {selectedTour && (
        <BookingModal
          tour={selectedTour}
          onClose={() => setSelectedTour(null)}
          onConfirm={handleBookTour}
        />
      )}
    </div>
  );
}