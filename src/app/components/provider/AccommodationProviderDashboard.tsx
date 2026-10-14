import { useState } from "react";
import { RoomBooking, Service } from "@/app/types";
import { ServicePostManagement } from "./ServicePostManagement";
import {
  LayoutDashboard,
  Calendar,
  Hotel,
  LogOut,
  CheckCircle,
  XCircle,
  Eye,
  Search,
  Users,
  Clock,
  DollarSign,
  FileText,
  Menu,
  X,
  DoorOpen,
  Edit,
  Save,
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/app/components/ui/dialog";
import { Input } from "@/app/components/ui/input";
import { Textarea } from "@/app/components/ui/textarea";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/app/components/ui/tabs";

interface AccommodationProviderDashboardProps {
  bookings: RoomBooking[];
  providerId: string;
  onApproveBooking: (bookingId: string) => void;
  onRejectBooking: (bookingId: string, reason?: string) => void;
  // Service Management Props
  services: Service[];
  onCreateService: () => void;
  onEditService: (service: Service) => void;
  onDeleteService: (serviceId: string) => void;
}

export function AccommodationProviderDashboard({
  bookings,
  providerId,
  onApproveBooking,
  onRejectBooking,
  services,
  onCreateService,
  onEditService,
  onDeleteService,
}: AccommodationProviderDashboardProps) {
  const [activeTab, setActiveTab] = useState<
    "posts" | "bookings" | "rooms"
  >("posts");
  const [isMobileMenuOpen, setIsMobileMenuOpen] =
    useState(false);

  // Filter bookings by provider
  const providerBookings = bookings.filter(
    (b) => b.providerId === providerId,
  );
  const pendingBookingsCount = providerBookings.filter(
    (b) => b.status === "pending",
  ).length;

  const toggleMobileMenu = () =>
    setIsMobileMenuOpen(!isMobileMenuOpen);

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-gray-50 overflow-hidden">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex w-64 flex-col bg-white border-r border-gray-200">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-2 text-blue-600 font-bold text-xl">
            <Hotel className="w-6 h-6" />
            <span>Kênh Khách sạn</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Quản lý dịch vụ lưu trú
          </p>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <Button
            variant={
              activeTab === "posts" ? "secondary" : "ghost"
            }
            className={`w-full justify-start ${activeTab === "posts" ? "bg-blue-50 text-blue-700" : "text-gray-600"}`}
            onClick={() => setActiveTab("posts")}
          >
            <FileText className="w-5 h-5 mr-3" />
            Quản lý bài đăng
          </Button>

          <Button
            variant={
              activeTab === "bookings" ? "secondary" : "ghost"
            }
            className={`w-full justify-start relative ${activeTab === "bookings" ? "bg-blue-50 text-blue-700" : "text-gray-600"}`}
            onClick={() => setActiveTab("bookings")}
          >
            <Calendar className="w-5 h-5 mr-3" />
            Quản lý đặt phòng
            {pendingBookingsCount > 0 && (
              <span className="absolute right-2 top-1/2 -translate-y-1/2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {pendingBookingsCount}
              </span>
            )}
          </Button>

          <Button
            variant={
              activeTab === "rooms" ? "secondary" : "ghost"
            }
            className={`w-full justify-start ${activeTab === "rooms" ? "bg-blue-50 text-blue-700" : "text-gray-600"}`}
            onClick={() => setActiveTab("rooms")}
          >
            <DoorOpen className="w-5 h-5 mr-3" />
            Quản lý phòng trống
          </Button>
        </nav>

        <div className="p-4 border-t border-gray-100">
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm font-medium text-blue-900">
              Hỗ trợ đối tác
            </p>
            <p className="text-xs text-blue-700 mt-1">
              Liên hệ: 1900 1234
            </p>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 md:hidden"
          onClick={toggleMobileMenu}
        >
          <div
            className="absolute left-0 top-0 h-full w-64 bg-white shadow-xl p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <span className="font-bold text-lg">Menu</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMobileMenu}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            <nav className="space-y-2">
              <Button
                variant={
                  activeTab === "posts" ? "secondary" : "ghost"
                }
                className="w-full justify-start"
                onClick={() => {
                  setActiveTab("posts");
                  toggleMobileMenu();
                }}
              >
                <FileText className="w-5 h-5 mr-3" /> Quản lý
                bài đăng
              </Button>
              <Button
                variant={
                  activeTab === "bookings"
                    ? "secondary"
                    : "ghost"
                }
                className="w-full justify-start"
                onClick={() => {
                  setActiveTab("bookings");
                  toggleMobileMenu();
                }}
              >
                <Calendar className="w-5 h-5 mr-3" /> Quản lý
                đặt phòng
              </Button>
              <Button
                variant={
                  activeTab === "rooms" ? "secondary" : "ghost"
                }
                className="w-full justify-start"
                onClick={() => {
                  setActiveTab("rooms");
                  toggleMobileMenu();
                }}
              >
                <DoorOpen className="w-5 h-5 mr-3" /> Quản lý
                phòng trống
              </Button>
            </nav>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="md:hidden p-4 bg-white border-b flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMobileMenu}
          >
            <Menu className="w-5 h-5" />
          </Button>
          <span className="font-bold text-gray-900">
            {activeTab === "posts" && "Quản lý bài đăng"}
            {activeTab === "bookings" && "Quản lý đặt phòng"}
            {activeTab === "rooms" && "Quản lý phòng trống"}
          </span>
        </div>

        <div className="p-6 md:p-8 max-w-7xl mx-auto">
          {activeTab === "posts" ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <ServicePostManagement
                services={services}
                providerId={providerId}
                onCreateService={onCreateService}
                onEditService={onEditService}
                onDeleteService={onDeleteService}
              />
            </div>
          ) : activeTab === "bookings" ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <BookingManagement
                bookings={providerBookings}
                onApprove={onApproveBooking}
                onReject={onRejectBooking}
              />
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <RoomAvailabilityManagement
                services={services}
                providerId={providerId}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// Sub-component for Booking Management
function BookingManagement({
  bookings,
  onApprove,
  onReject,
}: {
  bookings: RoomBooking[];
  onApprove: (id: string) => void;
  onReject: (id: string, reason: string) => void;
}) {
  const [selectedBooking, setSelectedBooking] =
    useState<RoomBooking | null>(null);
  const [rejectDialog, setRejectDialog] = useState<{
    isOpen: boolean;
    bookingId: string | null;
  }>({ isOpen: false, bookingId: null });
  const [rejectReason, setRejectReason] = useState("");
  const [filter, setFilter] = useState<
    "all" | "pending" | "confirmed" | "cancelled"
  >("all");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredBookings = bookings.filter((b) => {
    const matchesFilter =
      filter === "all" || b.status === filter;
    const matchesSearch =
      b.guestName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      b.id.includes(searchTerm) ||
      b.serviceName
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleOpenReject = (bookingId: string) => {
    setRejectDialog({ isOpen: true, bookingId });
    setRejectReason("");
  };

  const handleConfirmReject = () => {
    if (rejectDialog.bookingId && rejectReason.trim()) {
      onReject(rejectDialog.bookingId, rejectReason);
      setRejectDialog({ isOpen: false, bookingId: null });
      setRejectReason("");
      if (selectedBooking?.id === rejectDialog.bookingId) {
        setSelectedBooking(null);
      }
    }
  };

  const getStatusBadge = (status: RoomBooking["status"]) => {
    const variants = {
      pending:
        "bg-yellow-100 text-yellow-800 border-yellow-200",
      confirmed: "bg-green-100 text-green-800 border-green-200",
      cancelled: "bg-red-100 text-red-800 border-red-200",
      completed: "bg-blue-100 text-blue-800 border-blue-200",
    };
    const labels = {
      pending: "Chờ xác nhận",
      confirmed: "Đã xác nhận",
      cancelled: "Đã hủy",
      completed: "Hoàn thành",
    };
    return (
      <Badge variant="outline" className={variants[status]}>
        {labels[status]}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Quản lý Đặt phòng
        </h1>
        <p className="text-gray-600 mt-2">
          Theo dõi và xử lý các yêu cầu đặt phòng từ khách hàng
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Tổng đơn
              </p>
              <p className="text-2xl font-bold">
                {bookings.length}
              </p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
              <Hotel className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Chờ xử lý
              </p>
              <p className="text-2xl font-bold text-yellow-600">
                {
                  bookings.filter((b) => b.status === "pending")
                    .length
                }
              </p>
            </div>
            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600">
              <Clock className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Doanh thu dự kiến
              </p>
              <p className="text-2xl font-bold text-green-600">
                {bookings
                  .filter((b) => b.status === "confirmed")
                  .reduce((sum, b) => sum + b.totalPrice, 0)
                  .toLocaleString("vi-VN")}
                đ
              </p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
              <DollarSign className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-gray-200 shadow-sm">
        <CardHeader className="bg-white border-b border-gray-100 pb-4">
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <Tabs
              value={filter}
              onValueChange={(v) => setFilter(v as any)}
              className="w-full md:w-auto"
            >
              <TabsList>
                <TabsTrigger value="all">Tất cả</TabsTrigger>
                <TabsTrigger value="pending">
                  Chờ xác nhận
                </TabsTrigger>
                <TabsTrigger value="confirmed">
                  Đã xác nhận
                </TabsTrigger>
                <TabsTrigger value="cancelled">
                  Đã hủy
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Tìm tên khách, mã đơn..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 font-semibold">
                    Mã đơn / Dịch vụ
                  </th>
                  <th className="px-6 py-4 font-semibold">
                    Khách hàng
                  </th>
                  <th className="px-6 py-4 font-semibold">
                    Thời gian
                  </th>
                  <th className="px-6 py-4 font-semibold">
                    Tổng tiền
                  </th>
                  <th className="px-6 py-4 font-semibold text-center">
                    Trạng thái
                  </th>
                  <th className="px-6 py-4 font-semibold text-right">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredBookings.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Calendar className="w-10 h-10 text-gray-300" />
                        <p>Không tìm thấy đơn đặt phòng nào</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredBookings.map((booking) => (
                    <tr
                      key={booking.id}
                      className="bg-white hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-mono text-xs text-gray-500 mb-1">
                            #{booking.id}
                          </p>
                          <p className="font-semibold text-gray-900 line-clamp-1">
                            {booking.serviceName}
                          </p>
                          <div className="flex items-center gap-2 mt-1 text-xs text-gray-600">
                            <Hotel className="w-3 h-3" />
                            {booking.numberOfRooms} phòng
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900">
                            {booking.guestName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {booking.guestPhone}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs text-gray-600 space-y-1">
                          <p className="flex items-center gap-1">
                            <span className="font-medium text-gray-500 w-8">
                              Check-in:
                            </span>
                            {booking.checkInDate}
                          </p>
                          <p className="flex items-center gap-1">
                            <span className="font-medium text-gray-500 w-8">
                              Out:
                            </span>
                            {booking.checkOutDate}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-bold text-blue-600">
                        {booking.totalPrice.toLocaleString(
                          "vi-VN",
                        )}
                        đ
                      </td>
                      <td className="px-6 py-4 text-center">
                        {getStatusBadge(booking.status)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-gray-500"
                            onClick={() =>
                              setSelectedBooking(booking)
                            }
                            title="Xem chi tiết"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {booking.status === "pending" && (
                            <>
                              <Button
                                size="icon"
                                className="h-8 w-8 bg-green-100 text-green-700 hover:bg-green-200 hover:text-green-800 shadow-none border border-green-200"
                                onClick={() =>
                                  onApprove(booking.id)
                                }
                                title="Xác nhận"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="outline"
                                className="h-8 w-8 bg-red-50 text-red-700 hover:bg-red-100 border-red-200"
                                onClick={() =>
                                  handleOpenReject(booking.id)
                                }
                                title="Từ chối"
                              >
                                <XCircle className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Booking Detail Dialog */}
      <Dialog
        open={!!selectedBooking}
        onOpenChange={() => setSelectedBooking(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Chi tiết đặt phòng</span>
              {selectedBooking &&
                getStatusBadge(selectedBooking.status)}
            </DialogTitle>
            <DialogDescription>
              Mã đơn: #{selectedBooking?.id}
            </DialogDescription>
          </DialogHeader>

          {selectedBooking && (
            <div className="space-y-6">
              {/* Customer Info */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h4 className="text-sm font-semibold text-gray-900 uppercase mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4" /> Thông tin khách
                  hàng
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500 block mb-1">
                      Họ tên
                    </span>
                    <span className="font-medium">
                      {selectedBooking.guestName}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 block mb-1">
                      Số điện thoại
                    </span>
                    <span className="font-medium">
                      {selectedBooking.guestPhone}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-500 block mb-1">
                      Email
                    </span>
                    <span className="font-medium">
                      {selectedBooking.guestEmail}
                    </span>
                  </div>
                </div>
              </div>

              {/* Booking Info */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 uppercase mb-3 flex items-center gap-2">
                  <Hotel className="w-4 h-4" /> Thông tin phòng
                </h4>
                <div className="border rounded-lg p-4 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-lg text-gray-900">
                        {selectedBooking.serviceName}
                      </h3>
                      <div className="flex items-center gap-3 text-sm text-gray-600 mt-1">
                        <span>
                          {selectedBooking.numberOfRooms} phòng
                        </span>
                        <span>•</span>
                        <span>
                          {selectedBooking.numberOfGuests} khách
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">
                        Tổng tiền
                      </p>
                      <p className="text-xl font-bold text-blue-600">
                        {selectedBooking.totalPrice.toLocaleString(
                          "vi-VN",
                        )}
                        đ
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4 p-3 bg-blue-50 rounded text-blue-900 text-sm">
                    <div className="flex-1 text-center border-r border-blue-200">
                      <span className="block text-xs text-blue-600 uppercase">
                        Check-in
                      </span>
                      <span className="font-bold">
                        {selectedBooking.checkInDate}
                      </span>
                    </div>
                    <div className="flex-1 text-center">
                      <span className="block text-xs text-blue-600 uppercase">
                        Check-out
                      </span>
                      <span className="font-bold">
                        {selectedBooking.checkOutDate}
                      </span>
                    </div>
                  </div>

                  {selectedBooking.specialRequests && (
                    <div className="text-sm bg-yellow-50 p-3 rounded border border-yellow-200 text-yellow-800">
                      <span className="font-semibold block mb-1">
                        Yêu cầu đặc biệt:
                      </span>
                      {selectedBooking.specialRequests}
                    </div>
                  )}

                  {selectedBooking.status === "cancelled" &&
                    selectedBooking.rejectionReason && (
                      <div className="text-sm bg-red-50 p-3 rounded border border-red-200 text-red-800">
                        <span className="font-semibold block mb-1">
                          Lý do từ chối:
                        </span>
                        {selectedBooking.rejectionReason}
                      </div>
                    )}
                </div>
              </div>

              {/* Actions */}
              {selectedBooking.status === "pending" && (
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button
                    variant="outline"
                    className="text-red-600 border-red-200 hover:bg-red-50"
                    onClick={() => {
                      setSelectedBooking(null);
                      handleOpenReject(selectedBooking.id);
                    }}
                  >
                    Từ chối
                  </Button>
                  <Button
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => {
                      onApprove(selectedBooking.id);
                      setSelectedBooking(null);
                    }}
                  >
                    Xác nhận đặt phòng
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Reason Dialog */}
      <Dialog
        open={rejectDialog.isOpen}
        onOpenChange={(open) =>
          !open &&
          setRejectDialog({ isOpen: false, bookingId: null })
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2">
              <XCircle className="w-5 h-5" />
              Từ chối đặt phòng
            </DialogTitle>
            <DialogDescription>
              Vui lòng nhập lý do từ chối để thông báo cho khách
              hàng.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Nhập lý do (VD: Hết phòng, khách sạn đang bảo trì...)"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setRejectDialog({
                  isOpen: false,
                  bookingId: null,
                })
              }
            >
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmReject}
              disabled={!rejectReason.trim()}
            >
              Xác nhận từ chối
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Sub-component for Room Availability Management
function RoomAvailabilityManagement({
  services,
  providerId,
}: {
  services: Service[];
  providerId: string;
}) {
  // State for managing room availability
  const [roomsData, setRoomsData] = useState<
    Record<
      string,
      { total: number; available: number; editing: boolean }
    >
  >(
    services
      .filter(
        (s) =>
          s.providerId === providerId && s.category === "hotel",
      )
      .reduce(
        (acc, service) => ({
          ...acc,
          [service.id]: {
            total: service.capacity || 10,
            available: service.capacity || 10,
            editing: false,
          },
        }),
        {},
      ),
  );

  const providerServices = services.filter(
    (s) =>
      s.providerId === providerId &&
      s.category === "hotel" &&
      s.status === "approved",
  );

  const handleEdit = (serviceId: string) => {
    setRoomsData((prev) => ({
      ...prev,
      [serviceId]: { ...prev[serviceId], editing: true },
    }));
  };

  const handleSave = (serviceId: string) => {
    setRoomsData((prev) => ({
      ...prev,
      [serviceId]: { ...prev[serviceId], editing: false },
    }));
    // Here you would call an API to save the changes
  };

  const handleChange = (
    serviceId: string,
    field: "total" | "available",
    value: number,
  ) => {
    setRoomsData((prev) => ({
      ...prev,
      [serviceId]: {
        ...prev[serviceId],
        [field]: Math.max(0, value),
      },
    }));
  };

  const getTotalRooms = () => {
    return Object.values(roomsData).reduce(
      (sum, room) => sum + room.total,
      0,
    );
  };

  const getAvailableRooms = () => {
    return Object.values(roomsData).reduce(
      (sum, room) => sum + room.available,
      0,
    );
  };

  const getOccupancyRate = () => {
    const total = getTotalRooms();
    const available = getAvailableRooms();
    if (total === 0) return 0;
    return Math.round(((total - available) / total) * 100);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Quản lý Phòng trống
        </h1>
        <p className="text-gray-600 mt-2">
          Cập nhật số lượng phòng trống cho các loại phòng của
          bạn
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Tổng số phòng
              </p>
              <p className="text-2xl font-bold">
                {getTotalRooms()}
              </p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
              <Hotel className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Phòng còn trống
              </p>
              <p className="text-2xl font-bold text-green-600">
                {getAvailableRooms()}
              </p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
              <DoorOpen className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Tỷ lệ lấp đầy
              </p>
              <p className="text-2xl font-bold text-purple-600">
                {getOccupancyRate()}%
              </p>
            </div>
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
              <Users className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Room List */}
      <Card className="border-gray-200 shadow-sm">
        <CardHeader className="bg-white border-b border-gray-100">
          <CardTitle>Danh sách phòng</CardTitle>
          <CardDescription>
            Cập nhật số lượng phòng trống cho từng loại phòng
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {providerServices.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <Hotel className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-lg font-semibold mb-2">
                Chưa có dịch vụ phòng nào
              </p>
              <p className="text-sm">
                Hãy tạo bài đăng dịch vụ phòng để bắt đầu quản
                lý phòng trống
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {providerServices.map((service) => {
                const roomData = roomsData[service.id] || {
                  total: 0,
                  available: 0,
                  editing: false,
                };
                const occupiedRooms =
                  roomData.total - roomData.available;
                const occupancyPercentage =
                  roomData.total > 0
                    ? Math.round(
                        (occupiedRooms / roomData.total) * 100,
                      )
                    : 0;

                return (
                  <div
                    key={service.id}
                    className="p-6 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex flex-col md:flex-row gap-6">
                      {/* Room Image */}
                      <div className="w-full md:w-48 h-32 flex-shrink-0">
                        <img
                          src={service.image}
                          alt={service.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </div>

                      {/* Room Info */}
                      <div className="flex-1 space-y-4">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">
                            {service.name}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {service.description}
                          </p>
                          <p className="text-blue-600 font-semibold mt-2">
                            {service.price.toLocaleString(
                              "vi-VN",
                            )}
                            đ / đêm
                          </p>
                        </div>

                        {/* Room Availability Controls */}
                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Total Rooms */}
                            <div>
                              <label className="text-xs font-medium text-gray-500 uppercase block mb-2">
                                Tổng số phòng
                              </label>
                              <div className="flex items-center gap-2">
                                {roomData.editing ? (
                                  <Input
                                    type="number"
                                    min="0"
                                    value={roomData.total}
                                    onChange={(e) =>
                                      handleChange(
                                        service.id,
                                        "total",
                                        parseInt(
                                          e.target.value,
                                        ) || 0,
                                      )
                                    }
                                    className="w-24 h-10"
                                  />
                                ) : (
                                  <div className="flex items-center gap-2">
                                    <Hotel className="w-5 h-5 text-gray-400" />
                                    <span className="text-2xl font-bold text-gray-900">
                                      {roomData.total}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Available Rooms */}
                            <div>
                              <label className="text-xs font-medium text-gray-500 uppercase block mb-2">
                                Phòng trống
                              </label>
                              <div className="flex items-center gap-2">
                                {roomData.editing ? (
                                  <Input
                                    type="number"
                                    min="0"
                                    max={roomData.total}
                                    value={roomData.available}
                                    onChange={(e) =>
                                      handleChange(
                                        service.id,
                                        "available",
                                        Math.min(
                                          parseInt(
                                            e.target.value,
                                          ) || 0,
                                          roomData.total,
                                        ),
                                      )
                                    }
                                    className="w-24 h-10"
                                  />
                                ) : (
                                  <div className="flex items-center gap-2">
                                    <DoorOpen className="w-5 h-5 text-green-600" />
                                    <span className="text-2xl font-bold text-green-600">
                                      {roomData.available}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Occupancy Status */}
                            <div>
                              <label className="text-xs font-medium text-gray-500 uppercase block mb-2">
                                Tỷ lệ lấp đầy
                              </label>
                              <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-2xl font-bold text-purple-600">
                                    {occupancyPercentage}%
                                  </span>
                                  <span className="text-sm text-gray-500">
                                    ({occupiedRooms}/
                                    {roomData.total})
                                  </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all"
                                    style={{
                                      width: `${occupancyPercentage}%`,
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Action Button */}
                          <div className="mt-4 flex justify-end">
                            {roomData.editing ? (
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    handleSave(service.id)
                                  }
                                >
                                  <Save className="w-4 h-4 mr-2" />
                                  Lưu thay đổi
                                </Button>
                              </div>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleEdit(service.id)
                                }
                              >
                                <Edit className="w-4 h-4 mr-2" />
                                Chỉnh sửa
                              </Button>
                            )}
                          </div>
                        </div>

                        {/* Status Badge */}
                        {roomData.available === 0 && (
                          <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                            <XCircle className="w-4 h-4" />
                            Hết phòng
                          </div>
                        )}
                        {roomData.available > 0 &&
                          roomData.available <= 3 && (
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                              <Clock className="w-4 h-4" />
                              Sắp hết phòng
                            </div>
                          )}
                        {roomData.available > 3 && (
                          <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                            <CheckCircle className="w-4 h-4" />
                            Còn nhiều phòng
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tips Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                <Hotel className="w-5 h-5 text-white" />
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">
                💡 Mẹo quản lý phòng hiệu quả
              </h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>
                  • Cập nhật số lượng phòng trống hàng ngày để
                  tránh overbooking
                </li>
                <li>
                  • Khi xác nhận booking, nhớ giảm số phòng
                  trống tương ứng
                </li>
                <li>
                  • Số lượng phòng trống không thể vượt quá tổng
                  số phòng
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}