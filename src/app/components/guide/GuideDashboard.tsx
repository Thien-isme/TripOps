import { useState } from "react";
import {
  Calendar,
  MapPin,
  CheckCircle,
  Clock,
  User,
  Mail,
  Star,
  MessageCircleMore,
  History as HistoryIcon,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Upload,
  ShieldCheck,
  MessageSquare,
  Phone,
} from "lucide-react";
import { GuideSchedule } from "@/app/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/app/components/ui/dialog";
import { Textarea } from "@/app/components/ui/textarea";
import { Button } from "@/app/components/ui/button";
import { Label } from "@/app/components/ui/label";

interface GuideDashboardProps {
  schedules: GuideSchedule[];
  onCheckIn: (scheduleId: string, locationId: string) => void;
}

// Mock data for future scheduled tours
const mockFutureSchedules = [
  {
    id: "future-1",
    tourName: "Sapa Trekking 3N2Đ",
    customerName: "Lê Văn Đức",
    customerEmail: "duc.le@email.com",
    startDate: "2026-02-15",
    endDate: "2026-02-17",
    numberOfGuests: 6,
    status: "scheduled" as const,
  },
  {
    id: "future-2",
    tourName: "Hội An Cổ Trấn 2N1Đ",
    customerName: "Hoàng Thị Mai",
    customerEmail: "mai.hoang@email.com",
    startDate: "2026-02-20",
    endDate: "2026-02-21",
    numberOfGuests: 4,
    status: "scheduled" as const,
  },
  {
    id: "future-3",
    tourName: "Nha Trang Beach 4N3Đ",
    customerName: "Vũ Minh Tâm",
    customerEmail: "tam.vu@email.com",
    startDate: "2026-02-28",
    endDate: "2026-03-02",
    numberOfGuests: 8,
    status: "scheduled" as const,
  },
];

// Mock data for completed tours with full itinerary
const mockCompletedTours = [
  {
    id: "completed-1",
    tourName: "Đà Lạt Romantic 3N2Đ",
    customerName: "Nguyễn Văn An",
    customerEmail: "an.nguyen@email.com",
    startDate: "10/01/2026",
    endDate: "12/01/2026",
    rating: 5,
    feedback: "Hướng dẫn viên rất nhiệt tình và chu đáo!",
    itinerary: [
      {
        id: "c1-day-1",
        day: 1,
        date: "2026-01-10",
        title: "TP.HCM - Đà Lạt",
        description:
          "Khởi hành từ TP.HCM, di chuyển đến Đà Lạt",
        locations: [
          {
            id: "c1-loc-1-1",
            name: "Hồ Xuân Hương",
            address: "01 Trần Quốc Toản, Phường 1, Đà Lạt",
            latitude: 11.9404,
            longitude: 108.4385,
            time: "09:00",
            checkedIn: true,
            checkInTime: "09:05",
          },
          {
            id: "c1-loc-1-2",
            name: "Nhà thờ Con Gà",
            address: "Trần Phú, Phường 3, Đà Lạt",
            latitude: 11.9331,
            longitude: 108.4431,
            time: "11:00",
            checkedIn: true,
            checkInTime: "11:10",
          },
        ],
      },
      {
        id: "c1-day-2",
        day: 2,
        date: "2026-01-11",
        title: "Khám phá Đà Lạt",
        description: "Tham quan các điểm du lịch nổi tiếng",
        locations: [
          {
            id: "c1-loc-2-1",
            name: "Thung lũng tình yêu",
            address: "Phường 4, Đà Lạt",
            latitude: 11.9153,
            longitude: 108.4208,
            time: "08:30",
            checkedIn: true,
            checkInTime: "08:35",
          },
        ],
      },
    ],
  },
  {
    id: "completed-2",
    tourName: "Phú Quốc Tropical 4N3Đ",
    customerName: "Trần Thị Bích",
    customerEmail: "bich.tran@email.com",
    startDate: "05/01/2026",
    endDate: "08/01/2026",
    rating: 4,
    feedback: "Tour tốt, thời gian hợp lý",
    itinerary: [
      {
        id: "c2-day-1",
        day: 1,
        date: "2026-01-05",
        title: "Hà Nội - Phú Quốc",
        description: "Bay từ Hà Nội đến Phú Quốc",
        locations: [
          {
            id: "c2-loc-1-1",
            name: "Bãi Sao",
            address: "An Thới, Phú Quốc",
            latitude: 10.1657,
            longitude: 103.9938,
            time: "14:00",
            checkedIn: true,
            checkInTime: "14:15",
          },
        ],
      },
    ],
  },
];

// Mock data for customer feedbacks
const mockFeedbacks = [
  {
    id: "fb-1",
    tourName: "Đà Lạt Romantic 3N2Đ",
    customerName: "Khách hàng A",
    date: "12/01/2026",
    rating: 5,
    comment:
      "Hướng dẫn viên rất nhiệt tình, am hiểu về các địa điểm. Giải thích rõ ràng và luôn quan tâm đến nhóm.",
  },
  {
    id: "fb-2",
    tourName: "Phú Quốc Tropical 4N3Đ",
    customerName: "Khách hàng B",
    date: "08/01/2026",
    rating: 4,
    comment:
      "Hướng dẫn tốt, thời gian sắp xếp hợp lý. Tuy nhiên có thể thêm thời gian tự do cho khách.",
  },
  {
    id: "fb-3",
    tourName: "Ninh Bình Discovery 2N1Đ",
    customerName: "Khách hàng C",
    date: "30/12/2025",
    rating: 5,
    comment:
      "Xuất sắc! Hướng dẫn viên có kiến thức sâu về lịch sử và văn hóa địa phương.",
  },
];

export function GuideDashboard({
  schedules,
  onCheckIn,
}: GuideDashboardProps) {
  const [activeTab, setActiveTab] = useState<
    "active" | "schedule" | "history" | "feedback"
  >("active");
  const [currentMonth, setCurrentMonth] = useState(
    new Date(2026, 1),
  ); // February 2026
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    null,
  );
  const [expandedHistory, setExpandedHistory] = useState<
    string | null
  >(null);

  // Check-in modal state
  const [checkingIn, setCheckingIn] = useState<{
    scheduleId: string;
    locationId: string;
    locationName: string;
  } | null>(null);
  const [checkInImage, setCheckInImage] = useState<string>("");
  const [checkInNote, setCheckInNote] = useState<string>("");

  const activeTours = schedules.filter(
    (s) => s.completedLocations.length < getTotalLocations(s),
  );
  const totalLocations = (schedule: GuideSchedule) =>
    getTotalLocations(schedule);
  const completedLocations = (schedule: GuideSchedule) =>
    schedule.completedLocations.length;

  function getTotalLocations(schedule: GuideSchedule): number {
    return schedule.booking.tour.itinerary.reduce(
      (total, day) => total + day.locations.length,
      0,
    );
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 ${
              star <= rating
                ? "text-yellow-500 fill-current"
                : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  // Calendar functions
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const getToursForDate = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0];
    return mockFutureSchedules.filter((schedule) => {
      return (
        dateStr >= schedule.startDate &&
        dateStr <= schedule.endDate
      );
    });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const monthNames = [
    "Tháng 1",
    "Tháng 2",
    "Tháng 3",
    "Tháng 4",
    "Tháng 5",
    "Tháng 6",
    "Tháng 7",
    "Tháng 8",
    "Tháng 9",
    "Tháng 10",
    "Tháng 11",
    "Tháng 12",
  ];

  const toursOnSelectedDate = selectedDate
    ? getToursForDate(selectedDate)
    : [];

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6" />
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold">
                {activeTours.length}
              </p>
              <p className="text-sm text-blue-100">Đang dẫn</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <CalendarDays className="w-6 h-6" />
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold">
                {mockFutureSchedules.length}
              </p>
              <p className="text-sm text-indigo-100">
                Lịch sắp tới
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <MapPin className="w-6 h-6" />
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold">
                {activeTours.reduce(
                  (sum, s) => sum + completedLocations(s),
                  0,
                )}
              </p>
              <p className="text-sm text-purple-100">
                Đã check-in
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold">
                {mockCompletedTours.length}
              </p>
              <p className="text-sm text-green-100">
                Hoàn thành
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-lg">
        <div className="border-b border-gray-200 px-6">
          <div className="flex gap-4 overflow-x-auto">
            <button
              onClick={() => setActiveTab("active")}
              className={`px-6 py-4 font-semibold transition-all border-b-2 whitespace-nowrap ${
                activeTab === "active"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-600 hover:text-blue-600"
              }`}
            >
              <Calendar className="w-5 h-5 inline mr-2" />
              Tour đang dẫn
            </button>
            <button
              onClick={() => setActiveTab("schedule")}
              className={`px-6 py-4 font-semibold transition-all border-b-2 whitespace-nowrap ${
                activeTab === "schedule"
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-gray-600 hover:text-indigo-600"
              }`}
            >
              <CalendarDays className="w-5 h-5 inline mr-2" />
              Lịch trình dẫn tour
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`px-6 py-4 font-semibold transition-all border-b-2 whitespace-nowrap ${
                activeTab === "history"
                  ? "border-purple-600 text-purple-600"
                  : "border-transparent text-gray-600 hover:text-purple-600"
              }`}
            >
              <HistoryIcon className="w-5 h-5 inline mr-2" />
              Lịch sử tour
            </button>
            <button
              onClick={() => setActiveTab("feedback")}
              className={`px-6 py-4 font-semibold transition-all border-b-2 whitespace-nowrap ${
                activeTab === "feedback"
                  ? "border-orange-600 text-orange-600"
                  : "border-transparent text-gray-600 hover:text-orange-600"
              }`}
            >
              <MessageCircleMore className="w-5 h-5 inline mr-2" />
              Phản hồi khách hàng
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Active Tours Tab */}
          {activeTab === "active" && (
            <div className="space-y-6">
              {activeTours.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Không có tour đang dẫn
                  </h3>
                  <p className="text-gray-600">
                    Bạn chưa được phân công tour nào hoặc đã
                    hoàn thành tất cả
                  </p>
                </div>
              ) : (
                activeTours.map((schedule) => (
                  <div
                    key={schedule.id}
                    className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 border-2 border-blue-200"
                  >
                    {/* Tour Header */}
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-2xl font-bold text-gray-900">
                            {schedule.booking.tour.name}
                          </h3>
                          <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded font-mono">
                            ID: {schedule.booking.tour.id}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden">
                              <img
                                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${schedule.booking.userName}`}
                                alt="Customer"
                                className="w-full h-full object-cover"
                              />
                            </div>
                            {schedule.booking.userName}
                          </span>
                          <span className="flex items-center gap-1">
                            <Mail className="w-4 h-4" />
                            {schedule.booking.userEmail}
                          </span>
                        </div>
                        {/* Customer Note */}
                        <div className="mt-3 bg-white/50 p-3 rounded-lg border border-blue-100 text-sm text-gray-600 italic flex gap-2 items-start">
                          <MessageSquare className="w-4 h-4 mt-0.5 shrink-0 text-blue-400" />
                          "Khách yêu cầu ăn kiêng và phòng tầng
                          cao view hồ"
                        </div>
                        {/* Admin Contact */}
                        <div className="mt-3 flex items-center gap-4 text-xs">
                          <span className="font-semibold text-gray-500 uppercase tracking-tighter">
                            Liên hệ Admin:
                          </span>
                          <span className="flex items-center gap-1 text-blue-600 font-bold">
                            <Phone className="w-3 h-3" /> 1900
                            1234
                          </span>
                          <span className="flex items-center gap-1 text-blue-600 font-bold">
                            <MessageCircleMore className="w-3 h-3" />{" "}
                            Zalo Admin
                          </span>
                        </div>
                      </div>
                      <div className="px-4 py-2 bg-blue-600 text-white rounded-xl">
                        <div className="text-2xl font-bold">
                          {completedLocations(schedule)}/
                          {totalLocations(schedule)}
                        </div>
                        <div className="text-xs text-blue-100">
                          Đã hoàn thành
                        </div>
                      </div>
                    </div>

                    {/* Itinerary */}
                    <div className="space-y-4">
                      {schedule.booking.tour.itinerary.map(
                        (day, dayIndex) => (
                          <div
                            key={dayIndex}
                            className="bg-white rounded-xl p-4"
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

                            {/* Locations */}
                            <div className="space-y-3 ml-10">
                              <p className="text-sm font-medium text-gray-700 mb-2">
                                Địa điểm ({day.locations.length}
                                ):
                              </p>
                              {day.locations.map((location) => {
                                const isCompleted =
                                  schedule.completedLocations.includes(
                                    location.id,
                                  );
                                return (
                                  <div
                                    key={location.id}
                                    className={`flex items-start justify-between p-4 rounded-lg border-2 ${
                                      isCompleted
                                        ? "bg-green-50 border-green-300"
                                        : "bg-gray-50 border-gray-200"
                                    }`}
                                  >
                                    <div className="flex items-start gap-3 flex-1">
                                      <div className="flex-shrink-0 mt-1">
                                        {isCompleted ? (
                                          <CheckCircle className="w-6 h-6 text-green-600" />
                                        ) : (
                                          <Clock className="w-6 h-6 text-gray-400" />
                                        )}
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
                                            {location.time ||
                                              "09:00"}
                                          </span>
                                        </div>
                                        {isCompleted &&
                                          location.checkInTime && (
                                            <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
                                              <CheckCircle className="w-4 h-4" />
                                              Đã check-in lúc:{" "}
                                              {
                                                location.checkInTime
                                              }
                                            </p>
                                          )}
                                      </div>
                                    </div>
                                    {!isCompleted && (
                                      <button
                                        onClick={() =>
                                          setCheckingIn({
                                            scheduleId:
                                              schedule.id,
                                            locationId:
                                              location.id,
                                            locationName:
                                              location.name,
                                          })
                                        }
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-md shadow-blue-100"
                                      >
                                        Check-in
                                      </button>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Schedule Tab - Calendar */}
          {activeTab === "schedule" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Calendar */}
                <div className="lg:col-span-2 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl p-6 border-2 border-indigo-200">
                  {/* Calendar Header */}
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900">
                      {monthNames[currentMonth.getMonth()]}{" "}
                      {currentMonth.getFullYear()}
                    </h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          setCurrentMonth(
                            new Date(
                              currentMonth.getFullYear(),
                              currentMonth.getMonth() - 1,
                            ),
                          )
                        }
                        className="p-2 hover:bg-indigo-100 rounded-lg transition-colors"
                      >
                        <ChevronLeft className="w-5 h-5 text-gray-700" />
                      </button>
                      <button
                        onClick={() =>
                          setCurrentMonth(
                            new Date(
                              currentMonth.getFullYear(),
                              currentMonth.getMonth() + 1,
                            ),
                          )
                        }
                        className="p-2 hover:bg-indigo-100 rounded-lg transition-colors"
                      >
                        <ChevronRight className="w-5 h-5 text-gray-700" />
                      </button>
                    </div>
                  </div>

                  {/* Day names */}
                  <div className="grid grid-cols-7 gap-2 mb-2">
                    {[
                      "CN",
                      "T2",
                      "T3",
                      "T4",
                      "T5",
                      "T6",
                      "T7",
                    ].map((day) => (
                      <div
                        key={day}
                        className="text-center font-semibold text-gray-600 text-sm py-2"
                      >
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Calendar Grid */}
                  <div className="grid grid-cols-7 gap-2">
                    {getDaysInMonth(currentMonth).map(
                      (date, index) => {
                        if (!date) {
                          return (
                            <div
                              key={`empty-${index}`}
                              className="aspect-square"
                            />
                          );
                        }

                        const toursOnDay =
                          getToursForDate(date);
                        const isSelected =
                          selectedDate?.toDateString() ===
                          date.toDateString();
                        const isTodayDate = isToday(date);

                        return (
                          <button
                            key={date.toISOString()}
                            onClick={() =>
                              setSelectedDate(date)
                            }
                            className={`aspect-square p-2 rounded-lg transition-all relative ${
                              isSelected
                                ? "bg-indigo-600 text-white shadow-lg scale-105"
                                : isTodayDate
                                  ? "bg-indigo-100 text-indigo-900 border-2 border-indigo-600"
                                  : toursOnDay.length > 0
                                    ? "bg-white border-2 border-indigo-300 hover:border-indigo-500"
                                    : "bg-white hover:bg-gray-50"
                            }`}
                          >
                            <div className="text-sm font-semibold">
                              {date.getDate()}
                            </div>
                            {toursOnDay.length > 0 && (
                              <div
                                className={`absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full ${
                                  isSelected
                                    ? "bg-white"
                                    : "bg-indigo-600"
                                }`}
                              />
                            )}
                          </button>
                        );
                      },
                    )}
                  </div>
                </div>

                {/* Tours on selected date */}
                <div className="lg:col-span-1">
                  <div className="bg-white rounded-2xl p-6 border-2 border-gray-200 sticky top-6">
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <CalendarDays className="w-5 h-5 text-indigo-600" />
                      {selectedDate
                        ? `Ngày ${selectedDate.getDate()}/${selectedDate.getMonth() + 1}`
                        : "Chọn ngày"}
                    </h3>

                    {selectedDate &&
                    toursOnSelectedDate.length > 0 ? (
                      <div className="space-y-3">
                        {toursOnSelectedDate.map((tour) => (
                          <div
                            key={tour.id}
                            className="bg-indigo-50 rounded-lg p-4 border border-indigo-200"
                          >
                            <h4 className="font-semibold text-gray-900 mb-2">
                              {tour.tourName}
                            </h4>
                            <div className="space-y-1 text-sm text-gray-600">
                              <p className="flex items-center gap-1">
                                <User className="w-3 h-3" />
                                {tour.customerName}
                              </p>
                              <p className="flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                {tour.customerEmail}
                              </p>
                              <p className="flex items-center gap-1">
                                <User className="w-3 h-3" />
                                {tour.numberOfGuests} người
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : selectedDate ? (
                      <p className="text-gray-600 text-sm">
                        Không có tour nào trong ngày này
                      </p>
                    ) : (
                      <p className="text-gray-600 text-sm">
                        Chọn một ngày để xem chi tiết
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* All Future Tours List */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Tất cả tour sắp tới
                </h3>
                <div className="space-y-4">
                  {mockFutureSchedules.map((tour) => (
                    <div
                      key={tour.id}
                      className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 border-2 border-indigo-200"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="text-xl font-bold text-gray-900 mb-2">
                            {tour.tourName}
                          </h4>
                          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <User className="w-4 h-4" />
                              {tour.customerName}
                            </span>
                            <span className="flex items-center gap-1">
                              <Mail className="w-4 h-4" />
                              {tour.customerEmail}
                            </span>
                            <span className="flex items-center gap-1">
                              <User className="w-4 h-4" />
                              {tour.numberOfGuests} người
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="px-4 py-2 bg-indigo-600 text-white rounded-lg mb-2">
                            <div className="text-sm font-semibold">
                              {tour.startDate}
                            </div>
                            <div className="text-xs text-indigo-100">
                              đến
                            </div>
                            <div className="text-sm font-semibold">
                              {tour.endDate}
                            </div>
                          </div>
                          <span className="text-xs text-gray-600">
                            {tour.numberOfGuests} khách
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* History Tab */}
          {activeTab === "history" && (
            <div className="space-y-4">
              {mockCompletedTours.length === 0 ? (
                <div className="text-center py-12">
                  <HistoryIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Chưa có tour đã hoàn thành
                  </h3>
                  <p className="text-gray-600">
                    Lịch sử các tour bạn đã dẫn sẽ hiển thị ở
                    đây
                  </p>
                </div>
              ) : (
                mockCompletedTours.map((tour) => (
                  <div
                    key={tour.id}
                    className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-200"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          {tour.tourName}
                          <span className="ml-2 text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded font-mono">
                            ID: {tour.id}
                          </span>
                        </h3>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {tour.customerName}
                          </span>
                          <span className="flex items-center gap-1">
                            <Mail className="w-4 h-4" />
                            {tour.customerEmail}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {renderStars(tour.rating)}
                        <span className="text-sm text-gray-600">
                          {tour.startDate} - {tour.endDate}
                        </span>
                      </div>
                    </div>

                    {tour.feedback && (
                      <div className="bg-white rounded-lg p-4 border border-purple-200 mb-4">
                        <p className="text-sm font-medium text-gray-700 mb-1">
                          Phản hồi của khách hàng:
                        </p>
                        <p className="text-gray-600 italic">
                          "{tour.feedback}"
                        </p>
                      </div>
                    )}

                    {/* View Itinerary */}
                    <button
                      onClick={() =>
                        setExpandedHistory(
                          expandedHistory === tour.id
                            ? null
                            : tour.id,
                        )
                      }
                      className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold flex items-center justify-center gap-2"
                    >
                      {expandedHistory === tour.id ? (
                        <>
                          <ChevronUp className="w-5 h-5" />
                          Ẩn lộ trình
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-5 h-5" />
                          Xem lộ trình chi tiết
                        </>
                      )}
                    </button>

                    {/* Expanded Itinerary */}
                    {expandedHistory === tour.id &&
                      tour.itinerary && (
                        <div className="mt-4 space-y-4">
                          {tour.itinerary.map(
                            (day, dayIndex) => (
                              <div
                                key={day.id}
                                className="bg-white rounded-xl p-4"
                              >
                                <div className="flex items-center gap-2 mb-4">
                                  <div className="w-8 h-8 bg-purple-600 text-white rounded-lg flex items-center justify-center font-bold">
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
                                        className="flex items-start justify-between p-4 rounded-lg border-2 bg-green-50 border-green-300"
                                      >
                                        <div className="flex items-start gap-3 flex-1">
                                          <div className="flex-shrink-0 mt-1">
                                            <CheckCircle className="w-6 h-6 text-green-600" />
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
                                            {location.checkInTime && (
                                              <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
                                                <CheckCircle className="w-4 h-4" />
                                                Đã check-in lúc:{" "}
                                                {
                                                  location.checkInTime
                                                }
                                              </p>
                                            )}
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
                      )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* Feedback Tab */}
          {activeTab === "feedback" && (
            <div className="space-y-4">
              {mockFeedbacks.length === 0 ? (
                <div className="text-center py-12">
                  <MessageCircleMore className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Chưa có phản hồi nào
                  </h3>
                  <p className="text-gray-600">
                    Các đánh giá từ khách hàng sẽ hiển thị ở đây
                  </p>
                </div>
              ) : (
                mockFeedbacks.map((feedback) => (
                  <div
                    key={feedback.id}
                    className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-xl p-6 border-2 border-orange-200"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold">
                            <User className="w-6 h-6" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              Khách hàng ẩn danh
                            </h4>
                            <p className="text-sm text-gray-600 italic">
                              Đánh giá chung về chuyến đi
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {renderStars(feedback.rating)}
                        <span className="text-sm text-gray-600">
                          {feedback.date}
                        </span>
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-orange-200">
                      <p className="text-gray-700 leading-relaxed">
                        "{feedback.comment}"
                      </p>
                    </div>
                  </div>
                ))
              )}

              {/* Average Rating */}
              {mockFeedbacks.length > 0 && (
                <div className="bg-gradient-to-br from-yellow-400 to-orange-400 rounded-xl p-6 text-white">
                  <div className="text-center">
                    <p className="text-sm font-medium mb-2">
                      Đánh giá trung bình
                    </p>
                    <div className="text-5xl font-bold mb-2">
                      {(
                        mockFeedbacks.reduce(
                          (sum, f) => sum + f.rating,
                          0,
                        ) / mockFeedbacks.length
                      ).toFixed(1)}
                    </div>
                    <div className="flex justify-center mb-2">
                      {renderStars(
                        Math.round(
                          mockFeedbacks.reduce(
                            (sum, f) => sum + f.rating,
                            0,
                          ) / mockFeedbacks.length,
                        ),
                      )}
                    </div>
                    <p className="text-sm text-yellow-100">
                      Dựa trên {mockFeedbacks.length} đánh giá
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      {/* Check-in Modal */}
      <Dialog
        open={checkingIn !== null}
        onOpenChange={() => setCheckingIn(null)}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-blue-700 font-bold">
              <ShieldCheck className="w-6 h-6" />
              Xác nhận Check-in
            </DialogTitle>
            <DialogDescription>
              Bạn đang check-in tại{" "}
              <span className="font-bold text-gray-900">
                {checkingIn?.locationName}
              </span>
              . Vui lòng cung cấp hình ảnh minh chứng và ghi chú
              nếu có.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label className="font-semibold text-gray-700">
                Hình ảnh tại điểm check-in
              </Label>
              <div
                onClick={() =>
                  setCheckInImage(
                    "https://images.unsplash.com/photo-1542044896530-05d85be9b11a?w=400",
                  )
                }
                className="border-2 border-dashed border-gray-200 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-blue-300 hover:bg-blue-50 transition-all"
              >
                {checkInImage ? (
                  <div className="relative w-full aspect-video rounded-xl overflow-hidden">
                    <img
                      src={checkInImage}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <span className="text-white text-sm font-bold">
                        Thay đổi ảnh
                      </span>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-gray-700">
                        Bấm để tải ảnh lên
                      </p>
                      <p className="text-xs text-gray-500">
                        Chụp ảnh HDV và đoàn tại địa điểm
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="font-semibold text-gray-700">
                Ghi chú (Tùy chọn)
              </Label>
              <Textarea
                placeholder="VD: Đoàn đến trễ 10 phút, Thay đổi lịch trình nhẹ..."
                value={checkInNote}
                onChange={(e) => setCheckInNote(e.target.value)}
                className="min-h-[100px] rounded-xl border-gray-200 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button
              variant="ghost"
              onClick={() => setCheckingIn(null)}
            >
              Hủy bỏ
            </Button>
            <Button
              onClick={() => {
                if (checkingIn) {
                  onCheckIn(
                    checkingIn.scheduleId,
                    checkingIn.locationId,
                    checkInImage,
                    checkInNote,
                  );
                  setCheckingIn(null);
                  setCheckInImage("");
                  setCheckInNote("");
                }
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 rounded-xl font-bold"
              disabled={!checkInImage}
            >
              Hoàn tất Check-in
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}