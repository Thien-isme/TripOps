import { useState } from "react";
import { LoginScreen } from "@/app/components/LoginScreen";
import { RegisterScreen } from "@/app/components/RegisterScreen";
import { UnifiedHeader } from "@/app/components/UnifiedHeader";
import { HomePage } from "@/app/components/HomePage";
import { PublicFooter } from "@/app/components/PublicFooter";
import { UserDashboard } from "@/app/components/user/UserDashboard";
import { GuideDashboard } from "@/app/components/guide/GuideDashboard";
import { AdminDashboard } from "@/app/components/admin/AdminDashboard";
import { ProviderDashboard } from "@/app/components/provider/ProviderDashboard";
import { ServicePostManagement } from "@/app/components/provider/ServicePostManagement";
import { CreatePostModal } from "@/app/components/provider/CreatePostModal";
import { EditServiceModal } from "@/app/components/provider/EditServiceModal";
import { CompanyDashboard } from "@/app/components/company/CompanyDashboard";
import { BookToursPage } from "@/app/components/BookToursPage";
import { ContactPage } from "@/app/components/ContactPage";
import { AboutPage } from "@/app/components/AboutPage";
import { ReviewsPage } from "@/app/components/ReviewsPage";
import { PromotionsPage } from "@/app/components/user/PromotionsPage";
import { MessagesPage } from "@/app/components/user/MessagesPage";
import { WishlistPage } from "@/app/components/user/WishlistPage";
import { MyReviewsPage } from "@/app/components/user/MyReviewsPage";
import { NotificationsPage } from "@/app/components/user/NotificationsPage";
import { HelpCenterPage } from "@/app/components/user/HelpCenterPage";
import { MyBookings } from "@/app/components/user/MyBookings";
import { UserProfile } from "@/app/components/user/UserProfile";
import { TourDetailPage } from "@/app/components/user/TourDetailPage";
import { BookingFormPage, BookingSubmitData } from "@/app/components/user/BookingFormPage";
import { CustomTourRequestPage } from "@/app/components/user/CustomTourRequestPage";
import { UserBookingDetailPage } from "@/app/components/user/UserBookingDetailPage";
import {
  User,
  Tour,
  Booking,
  Service,
  GuideSchedule,
  RoomBooking,
  TourCompany,
  PaymentRequest,
  CustomTourRequest,
  CustomHotelChange,
  CustomMealChange,
  CustomLocationChange,
  SystemBankAccount,
  TourVersion,
} from "@/app/types";
import {
  mockTours,
  mockBookings,
  mockServices,
  mockGuideSchedules,
  mockRoomBookings,
  mockUsers,
  mockTourCompanies,
  mockCustomTourRequests,
  defaultSystemBankAccount,
} from "@/app/data/mockData";

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(
    null,
  );
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [currentPage, setCurrentPage] =
    useState<string>("home");
  const [tours, setTours] = useState<Tour[]>(mockTours);
  const [bookings, setBookings] =
    useState<Booking[]>(mockBookings);
  const [services, setServices] =
    useState<Service[]>(mockServices);
  const [guideSchedules, setGuideSchedules] = useState<
    GuideSchedule[]
  >(mockGuideSchedules);
  const [roomBookings, setRoomBookings] =
    useState<RoomBooking[]>(mockRoomBookings);
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [companies, setCompanies] =
    useState<TourCompany[]>(mockTourCompanies);
  const [selectedTour, setSelectedTour] = useState<Tour | null>(null);
  const [selectedUserBooking, setSelectedUserBooking] = useState<Booking | null>(null);
  const [bookingTour, setBookingTour] = useState<Tour | null>(null);
  const [bookingCustomData, setBookingCustomData] = useState<{
    customHotelChanges?: CustomHotelChange[];
    customMealChanges?: CustomMealChange[];
    locationChanges?: CustomLocationChange[];
    hasLocationCustomization?: boolean;
  } | null>(null);
  const [customTourRequests, setCustomTourRequests] = useState<CustomTourRequest[]>(mockCustomTourRequests);
  const [systemBankAccount, setSystemBankAccount] = useState<SystemBankAccount>(defaultSystemBankAccount);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setShowLogin(false);
    setShowRegister(false);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setShowLogin(false);
    setShowRegister(false);
    setCurrentPage("home");
  };

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    setSelectedTour(null);
    setSelectedUserBooking(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleViewUserBookingDetail = (booking: Booking) => {
    setSelectedUserBooking(booking);
    setCurrentPage("user-booking-detail");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleViewTour = (tour: Tour) => {
    setSelectedTour(tour);
    setCurrentPage("tour-detail");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleOpenBookingForm = (
    tour: Tour,
    customData?: {
      customHotelChanges?: CustomHotelChange[];
      customMealChanges?: CustomMealChange[];
      locationChanges?: CustomLocationChange[];
      hasLocationCustomization?: boolean;
    },
  ) => {
    setBookingTour(tour);
    setBookingCustomData(customData ?? null);
    setCurrentPage("booking-form");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBookingSubmit = (data: BookingSubmitData) => {
    if (!currentUser) return;
    const tour = tours.find((t) => t.id === data.tourId);
    if (!tour) return;

    const newBooking = {
      id: `booking-${Date.now()}`,
      tourId: tour.id,
      tour,
      userId: currentUser.id,
      userName: data.contactName,
      userEmail: data.contactEmail,
      numberOfGuests: data.passengers.length,
      totalPrice: data.totalPrice,
      status: "pending" as const,
      bookingDate: new Date().toISOString().split("T")[0],
      tourStartDate: data.tourStartDate || new Date().toISOString().split("T")[0],
      companyId: tour.companyId,
      companyName: tour.companyName,
      passengers: data.passengers,
      contactName: data.contactName,
      contactAddress: data.contactAddress,
      contactPhone: data.contactPhone,
      contactEmail: data.contactEmail,
      bookingNotes: data.bookingNotes,
      hasLocationCustomization: data.hasLocationCustomization,
      customHotelChanges: data.customHotelChanges,
      customMealChanges: data.customMealChanges,
      locationChanges: data.locationChanges,
      depositAmount: 0,
      depositPaid: false,
      remainingAmount: data.totalPrice,
      paymentStatus: "unpaid" as const,
      paymentRequests: [],
    };
    setBookings([newBooking, ...bookings]);
  };

  // User actions
  const handleBookTour = (
    tourId: string,
    numberOfGuests: number,
    startDate: string,
  ) => {
    if (!currentUser) return;

    const tour = tours.find((t) => t.id === tourId);
    if (!tour) return;

    const newBooking: Booking = {
      id: `booking-${Date.now()}`,
      tourId: tour.id,
      tour: tour,
      userId: currentUser.id,
      userName: currentUser.name,
      userEmail: currentUser.email,
      numberOfGuests,
      totalPrice: tour.price * numberOfGuests,
      status: "pending",
      bookingDate: new Date().toISOString().split("T")[0],
      tourStartDate: startDate,
      companyId: tour.companyId,
      companyName: tour.companyName,
      depositAmount: 0,
      depositPaid: false,
      remainingAmount: tour.price * numberOfGuests,
      paymentStatus: "unpaid",
      paymentRequests: [],
    };

    setBookings([...bookings, newBooking]);
  };

  const handleCancelBooking = (
    bookingId: string,
    reason?: string,
  ) => {
    setBookings(
      bookings.map((booking) =>
        booking.id === bookingId
          ? {
              ...booking,
              status: "cancelled" as const,
              cancellationReason: reason,
              rejectedBy: "customer" as const,
            }
          : booking,
      ),
    );
  };

  const handleRejectBooking = (
    bookingId: string,
    reason?: string,
  ) => {
    setBookings(
      bookings.map((booking) =>
        booking.id === bookingId
          ? {
              ...booking,
              status: "cancelled" as const,
              rejectionReason: reason,
            }
          : booking,
      ),
    );
  };

  // Guide actions
  const handleCheckIn = (
    scheduleId: string,
    locationId: string,
    image?: string,
    note?: string,
  ) => {
    setGuideSchedules(
      guideSchedules.map((schedule) => {
        if (schedule.id === scheduleId) {
          // Add location to completed locations
          const completedLocations = [
            ...schedule.completedLocations,
            locationId,
          ];

          // Update the location's check-in time in the tour itinerary
          const updatedBooking = {
            ...schedule.booking,
            tour: {
              ...schedule.booking.tour,
              itinerary: schedule.booking.tour.itinerary.map(
                (day) => ({
                  ...day,
                  locations: day.locations.map((loc) =>
                    loc.id === locationId
                      ? {
                          ...loc,
                          checkedIn: true,
                          checkInTime:
                            new Date().toLocaleTimeString(
                              "vi-VN",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            ),
                          checkInImage: image,
                          checkInNote: note,
                        }
                      : loc,
                  ),
                }),
              ),
            },
          };

          return {
            ...schedule,
            completedLocations,
            booking: updatedBooking,
          };
        }
        return schedule;
      }),
    );
  };

  // Admin / Company actions
  const handleApproveBooking = (bookingId: string) => {
    setBookings(
      bookings.map((booking) =>
        booking.id === bookingId
          ? { ...booking, status: "confirmed" as const }
          : booking,
      ),
    );
  };

  const handleMarkDepositPaid = (bookingId: string) => {
    setBookings((prev) =>
      prev.map((b) =>
        b.id === bookingId
          ? {
              ...b,
              depositPaid: true,
              paymentStatus: (b.remainingAmount === 0 ? "paid" : "deposit_paid") as const,
            }
          : b,
      ),
    );
  };

  const handleMarkFullyPaid = (bookingId: string) => {
    setBookings((prev) =>
      prev.map((b) =>
        b.id === bookingId
          ? {
              ...b,
              depositPaid: true,
              remainingAmount: 0,
              paymentStatus: "paid" as const,
            }
          : b,
      ),
    );
  };

  const handleAssignGuide = (
    bookingId: string,
    guideId: string,
  ) => {
    const guide = mockUsers.find(
      (u) => u.id === guideId && u.role === "guide",
    );
    if (!guide) return;

    setBookings(
      bookings.map((booking) =>
        booking.id === bookingId
          ? {
              ...booking,
              guideId: guide.id,
              guideName: guide.name,
              guideAvatar: guide.avatar,
              guidePhone: guide.phone,
            }
          : booking,
      ),
    );

    // Add to guide schedules
    const booking = bookings.find((b) => b.id === bookingId);
    if (booking) {
      const newSchedule: GuideSchedule = {
        id: `schedule-${Date.now()}`,
        booking: {
          ...booking,
          guideId: guide.id,
          guideName: guide.name,
          guideAvatar: guide.avatar,
          guidePhone: guide.phone,
        },
        currentDay: 1,
        completedLocations: [],
      };
      setGuideSchedules([...guideSchedules, newSchedule]);
    }
  };

  const handleCreateTour = (tourData: Omit<Tour, "id">) => {
    const newTour: Tour = {
      ...tourData,
      id: `tour-${Date.now()}`,
      bookings: 0,
    };
    setTours([...tours, newTour]);
  };

  const handleEditTour = (tour: Tour) => {
    alert(
      `Chỉnh sửa tour: ${tour.name}\n\nDemo đã bao gồm đầy đủ luồng hoạt động.`,
    );
  };

  const handleDeleteTour = (tourId: string) => {
    setTours(tours.filter((t) => t.id !== tourId));
  };

  // Provider actions
  const [showCreateServiceForm, setShowCreateServiceForm] =
    useState(false);
  const [editingService, setEditingService] =
    useState<Service | null>(null);

  const handleCreateService = () => {
    setShowCreateServiceForm(true);
  };

  const handleSubmitService = (
    serviceData: Omit<Service, "id" | "status" | "createdAt">,
  ) => {
    const newService: Service = {
      ...serviceData,
      id: `service-${Date.now()}`,
      status: "pending",
      createdAt: new Date().toISOString().split("T")[0],
    };
    setServices([...services, newService]);
    setShowCreateServiceForm(false);
  };

  const handleEditService = (service: Service) => {
    setEditingService(service);
  };

  const handleUpdateService = (
    serviceId: string,
    serviceData: Omit<Service, "id">,
  ) => {
    setServices(
      services.map((service) =>
        service.id === serviceId
          ? { ...serviceData, id: serviceId }
          : service,
      ),
    );
    setEditingService(null);
  };

  const handleDeleteService = (serviceId: string) => {
    setServices(services.filter((s) => s.id !== serviceId));
  };

  const handleUpdateProviderProfile = (updatedUser: Partial<User>) => {
    if (!currentUser) return;
    setUsers((prevUsers) =>
      prevUsers.map((u) =>
        u.id === currentUser.id ? { ...u, ...updatedUser } : u
      )
    );
    setCurrentUser((prev) =>
      prev ? ({ ...prev, ...updatedUser } as User) : null
    );
  };

  // Service moderation actions (for Admin)
  const handleApproveService = (serviceId: string) => {
    setServices(
      services.map((service) =>
        service.id === serviceId
          ? { ...service, status: "approved" as const }
          : service,
      ),
    );
  };

  const handleRejectService = (
    serviceId: string,
    reason: string,
  ) => {
    setServices(
      services.map((service) =>
        service.id === serviceId
          ? {
              ...service,
              status: "rejected" as const,
              rejectionReason: reason,
            }
          : service,
      ),
    );
  };

  // Provider actions - Room bookings
  const handleApproveRoomBooking = (bookingId: string) => {
    setRoomBookings(
      roomBookings.map((booking) =>
        booking.id === bookingId
          ? { ...booking, status: "confirmed" as const }
          : booking,
      ),
    );
  };

  const handleRejectRoomBooking = (
    bookingId: string,
    reason?: string,
  ) => {
    setRoomBookings(
      roomBookings.map((booking) =>
        booking.id === bookingId
          ? {
              ...booking,
              status: "cancelled" as const,
              rejectionReason: reason,
            }
          : booking,
      ),
    );
  };

  // Admin actions - Provider approval
  const handleApproveProvider = (providerId: string) => {
    setUsers(
      users.map((user) =>
        user.id === providerId
          ? { ...user, accountStatus: "approved" as const }
          : user,
      ),
    );
  };

  const handleRejectProvider = (
    providerId: string,
    reason?: string,
  ) => {
    setUsers(
      users.map((user) =>
        user.id === providerId
          ? {
              ...user,
              accountStatus: "rejected" as const,
              rejectionReason: reason,
            }
          : user,
      ),
    );
  };

  // Admin actions - User status update
  const handleUpdateUserStatus = (
    userId: string,
    isLocked: boolean,
  ) => {
    console.log(
      `User ${userId} status updated: ${isLocked ? "locked" : "active"}`,
    );
  };

  // Platform admin - Company management
  const handleApproveCompany = (companyId: string) => {
    setCompanies(
      companies.map((c) =>
        c.id === companyId
          ? { ...c, status: "approved" as const }
          : c,
      ),
    );
  };

  const handleRejectCompany = (
    companyId: string,
    reason: string,
  ) => {
    setCompanies(
      companies.map((c) =>
        c.id === companyId
          ? {
              ...c,
              status: "rejected" as const,
              rejectionReason: reason,
            }
          : c,
      ),
    );
  };

  const handleSuspendCompany = (
    companyId: string,
    reason: string,
  ) => {
    setCompanies(
      companies.map((c) =>
        c.id === companyId
          ? {
              ...c,
              status: "suspended" as const,
              rejectionReason: reason,
            }
          : c,
      ),
    );
  };

  // Company admin - payment requests
  const handleCreatePaymentRequest = (
    bookingId: string,
    request: Omit<PaymentRequest, "id" | "bookingId" | "createdAt" | "status">,
  ) => {
    const newRequest: PaymentRequest = {
      id: `pr-${Date.now()}`,
      bookingId,
      ...request,
      status: "pending",
      createdAt: new Date().toISOString().split("T")[0],
    };
    setBookings(
      bookings.map((b) =>
        b.id === bookingId
          ? { ...b, paymentRequests: [...(b.paymentRequests ?? []), newRequest] }
          : b,
      ),
    );
  };

  // Admin updates system bank account
  const handleUpdateSystemBank = (bank: SystemBankAccount) => {
    setSystemBankAccount(bank);
  };

  // Admin settles completed tour payment to company
  const handleSettleBooking = (
    bookingId: string,
    settledAmount: number,
    platformFee: number,
  ) => {
    setBookings((prev) =>
      prev.map((b) =>
        b.id === bookingId
          ? {
              ...b,
              settlementStatus: "settled" as const,
              settledAmount,
              settledAt: new Date().toISOString().split("T")[0],
              platformFeeAmount: platformFee,
              platformFeeRate: systemBankAccount.defaultCommissionRate || 8,
            }
          : b,
      ),
    );
  };

  // Company adjusts total booking price
  const handleUpdateBookingPrice = (
    bookingId: string,
    newPrice: number,
    note?: string,
  ) => {
    setBookings((prev) =>
      prev.map((b) => {
        if (b.id !== bookingId) return b;
        const originalPrice = b.originalTotalPrice ?? b.totalPrice;
        const paidAmount = (b.paymentRequests ?? [])
          .filter((pr) => pr.status === "paid")
          .reduce((sum, pr) => sum + pr.amount, 0);
        const remaining = Math.max(0, newPrice - paidAmount);
        return {
          ...b,
          originalTotalPrice: originalPrice,
          totalPrice: newPrice,
          priceAdjustmentNote: note,
          priceAdjustedAt: new Date().toISOString().split("T")[0],
          remainingAmount: remaining,
        };
      }),
    );
  };

  // Customer pays a payment request (into System Escrow Account)
  const handlePayPaymentRequest = (
    bookingId: string,
    paymentRequestId: string,
  ) => {
    setBookings((prev) =>
      prev.map((b) => {
        if (b.id !== bookingId) return b;
        const updatedPaymentRequests = (b.paymentRequests ?? []).map((pr) =>
          pr.id === paymentRequestId
            ? {
                ...pr,
                status: "paid" as const,
                paidAt: new Date().toISOString().split("T")[0],
              }
            : pr,
        );
        const totalPaid = updatedPaymentRequests
          .filter((pr) => pr.status === "paid")
          .reduce((sum, pr) => sum + pr.amount, 0);
        const remaining = Math.max(0, b.totalPrice - totalPaid);
        const isFullyPaid = remaining === 0;

        return {
          ...b,
          paymentRequests: updatedPaymentRequests,
          remainingAmount: remaining,
          paymentStatus: isFullyPaid
            ? ("paid" as const)
            : totalPaid > 0
            ? ("deposit_paid" as const)
            : ("unpaid" as const),
          depositPaid: totalPaid > 0,
          depositAmount: totalPaid,
        };
      }),
    );
  };

  // Custom tour requests
  const handleSubmitCustomTourRequest = (
    data: Omit<CustomTourRequest, "id" | "createdAt" | "status">,
  ) => {
    const req: CustomTourRequest = {
      ...data,
      id: `ctr-${Date.now()}`,
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    setCustomTourRequests((prev) => [req, ...prev]);
    setCurrentPage("home");
  };

  const handleCancelCustomTourRequest = (id: string) => {
    setCustomTourRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "cancelled" as const } : r)),
    );
  };

  const handleUpdateCustomTourRequest = (id: string, update: Partial<CustomTourRequest>) => {
    setCustomTourRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...update } : r)),
    );
  };

  // Company admin - tour CRUD
  const handleCompanyCreateTour = (
    tourData: Omit<Tour, "id"> & { id?: string },
  ) => {
    const newTour: Tour = {
      ...tourData,
      id: tourData.id || `tour-${Date.now()}`,
      bookings: 0,
    };
    setTours([...tours, newTour]);
  };

  const handleCompanyEditTour = (
    tourId: string,
    tourData: Partial<Tour>,
  ) => {
    setTours(
      tours.map((t) =>
        t.id === tourId ? { ...t, ...tourData } : t,
      ),
    );
  };

  const handleCompanyDeleteTour = (tourId: string) => {
    setTours(tours.filter((t) => t.id !== tourId));
  };

  const handleRestoreTourVersion = (tourId: string, versionNumber: number) => {
    const currentTour = tours.find((t) => t.id === tourId);
    if (!currentTour) return;

    const targetVersion = currentTour.versionHistory?.find(
      (v) => v.version === versionNumber
    );
    if (!targetVersion) {
      alert(`Không tìm thấy phiên bản v${versionNumber} trong lịch sử lưu trữ.`);
      return;
    }

    const currentBackup: TourVersion = {
      version: currentTour.version || 1,
      createdAt: new Date().toISOString(),
      createdByName: currentTour.companyName || "Hệ thống",
      changeNote: `Bản sao lưu trước khi khôi phục về phiên bản v${versionNumber}`,
      tourSnapshot: JSON.parse(JSON.stringify(currentTour)),
    };

    const nextVer = (currentTour.version || 1) + 1;
    const restoredSnapshot = JSON.parse(JSON.stringify(targetVersion.tourSnapshot));

    const restoredTour: Tour = {
      ...restoredSnapshot,
      id: currentTour.id,
      version: nextVer,
      changeNote: `Khôi phục từ dữ liệu phiên bản v${versionNumber} (${new Date(targetVersion.createdAt).toLocaleDateString("vi-VN")})`,
      versionHistory: [currentBackup, ...(currentTour.versionHistory || [])],
    };

    setTours((prev) => prev.map((t) => (t.id === tourId ? restoredTour : t)));

    if (currentTour.customRequestId) {
      setCustomTourRequests((prev) =>
        prev.map((r) =>
          r.id === currentTour.customRequestId
            ? { ...r, currentVersion: nextVer, companyNote: restoredTour.changeNote }
            : r
        )
      );
    }

    alert(`Đã khôi phục thành công tour về phiên bản v${versionNumber}! Phiên bản hiện tại là v${nextVer}.`);
  };

  // Show register screen
  if (showRegister) {
    return (
      <>
        <UnifiedHeader
          currentUser={currentUser}
          onShowLogin={() => setShowLogin(true)}
          onLogout={handleLogout}
          onNavigate={(page) => {
            setShowRegister(false);
            handleNavigate(page);
          }}
          currentPage={currentPage}
        />
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
          <RegisterScreen
            onRegisterSuccess={() => {
              setShowRegister(false);
              setShowLogin(true);
            }}
            onBack={() => setShowRegister(false)}
          />
        </div>
        <PublicFooter />
      </>
    );
  }

  // Show login screen
  if (showLogin) {
    return (
      <>
        <UnifiedHeader
          currentUser={currentUser}
          onShowLogin={() => setShowLogin(true)}
          onLogout={handleLogout}
          onNavigate={(page) => {
            setShowLogin(false);
            handleNavigate(page);
          }}
          currentPage={currentPage}
        />
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
          <LoginScreen
            onLogin={handleLogin}
            onBack={() => setShowLogin(false)}
            onShowRegister={() => {
              setShowLogin(false);
              setShowRegister(true);
            }}
          />
        </div>
        <PublicFooter />
      </>
    );
  }

  // For non-user roles (guide, admin, provider, company_admin), show their dashboard
  if (currentUser && currentUser.role !== "user") {
    const allGuides = users.filter((u) => u.role === "guide");
    const userGuideSchedules = guideSchedules.filter(
      (s) => s.booking.guideId === currentUser.id,
    );

    // Company admin view
    if (currentUser.role === "company_admin") {
      const company = companies.find(
        (c) => c.id === currentUser.companyId,
      );
      if (company) {
        const companyGuides = users.filter(
          (u) => u.role === "guide" && u.companyId === company.id,
        );
        const companyBookings = bookings.filter(
          (b) => b.companyId === company.id,
        );
        return (
          <CompanyDashboard
            currentUser={currentUser}
            company={company}
            tours={tours}
            bookings={companyBookings}
            guides={companyGuides}
            guideSchedules={guideSchedules}
            customTourRequests={customTourRequests}
            onCreateTour={handleCompanyCreateTour}
            onEditTour={handleCompanyEditTour}
            onDeleteTour={handleCompanyDeleteTour}
            onApproveBooking={handleApproveBooking}
            onRejectBooking={handleRejectBooking}
            onAssignGuide={handleAssignGuide}
            onCreatePaymentRequest={handleCreatePaymentRequest}
            onMarkDepositPaid={handleMarkDepositPaid}
            onMarkFullyPaid={handleMarkFullyPaid}
            onUpdateBookingPrice={handleUpdateBookingPrice}
            onUpdateCustomRequest={handleUpdateCustomTourRequest}
            onRestoreTourVersion={handleRestoreTourVersion}
            onViewTour={handleViewTour}
            onLogout={handleLogout}
          />
        );
      }
    }

    return (
      <div className="min-h-screen bg-gray-50">
        {currentUser.role !== "admin" && (
          <UnifiedHeader
            currentUser={currentUser}
            onShowLogin={() => setShowLogin(true)}
            onLogout={handleLogout}
            onNavigate={handleNavigate}
            currentPage={currentPage}
          />
        )}

        <main
          className={
            currentUser.role === "admin" || currentUser.role === "provider"
              ? "min-h-screen"
              : "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24"
          }
        >
          {currentUser.role === "guide" && (
            <GuideDashboard
              schedules={userGuideSchedules}
              onCheckIn={handleCheckIn}
            />
          )}

          {currentUser.role === "admin" && (
            <AdminDashboard
              currentUser={currentUser}
              tours={tours}
              bookings={bookings}
              services={services}
              guides={allGuides}
              guideSchedules={guideSchedules}
              providers={users.filter(
                (u) => u.role === "provider",
              )}
              users={users}
              companies={companies}
              onApproveBooking={handleApproveBooking}
              onRejectBooking={handleRejectBooking}
              onAssignGuide={handleAssignGuide}
              onApproveService={handleApproveService}
              onRejectService={handleRejectService}
              onApproveProvider={handleApproveProvider}
              onRejectProvider={handleRejectProvider}
              onUpdateUserStatus={handleUpdateUserStatus}
              onApproveCompany={handleApproveCompany}
              onRejectCompany={handleRejectCompany}
              systemBank={systemBankAccount}
              onUpdateSystemBank={handleUpdateSystemBank}
              onSettleBooking={handleSettleBooking}
              onSuspendCompany={handleSuspendCompany}
              onLogout={handleLogout}
            />
          )}

          {currentUser.role === "provider" && (
            <ProviderDashboard
              currentUser={currentUser}
              services={services}
              onDeleteService={handleDeleteService}
              onSubmitService={handleSubmitService}
              onUpdateService={handleUpdateService}
              onUpdateProfile={handleUpdateProviderProfile}
              onLogout={handleLogout}
            />
          )}
        </main>

        {currentUser.role !== "admin" && currentUser.role !== "provider" && (
          <PublicFooter />
        )}
      </div>
    );
  }

  // For users (logged in or not), show public pages with navigation
  const userBookings = currentUser
    ? bookings.filter((b) => b.userId === currentUser.id)
    : [];

  return (
    <>
      <UnifiedHeader
        currentUser={currentUser}
        onShowLogin={() => setShowLogin(true)}
        onLogout={handleLogout}
        onNavigate={handleNavigate}
        currentPage={currentPage}
      />
      <div className="pt-16">
        {currentPage === "custom-tour" ? (
          <CustomTourRequestPage
            companies={companies}
            currentUser={currentUser}
            onBack={() => handleNavigate("home")}
            onSubmit={handleSubmitCustomTourRequest}
            onShowLogin={() => setShowLogin(true)}
          />
        ) : currentPage === "booking-form" && bookingTour ? (
          <BookingFormPage
            tour={bookingTour}
            currentUser={currentUser as any}
            hasLocationCustomization={bookingCustomData?.hasLocationCustomization}
            customHotelChanges={bookingCustomData?.customHotelChanges}
            customMealChanges={bookingCustomData?.customMealChanges}
            locationChanges={bookingCustomData?.locationChanges}
            onBack={() => {
              setCurrentPage("tour-detail");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            onSubmit={(data) => {
              handleBookingSubmit(data);
            }}
            onViewMyBookings={() => {
              handleNavigate("my-bookings");
            }}
            onGoHome={() => {
              handleNavigate("home");
            }}
          />
        ) : currentPage === "tour-detail" && selectedTour ? (
          <TourDetailPage
            tour={selectedTour}
            services={services}
            currentUser={currentUser}
            onBack={() => {
              setSelectedTour(null);
              setCurrentPage("book-tours");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            onBookNow={handleOpenBookingForm}
            onShowLogin={() => setShowLogin(true)}
          />
        ) : currentPage === "home" && currentUser?.role === "user" ? (
          // Logged in user sees their dashboard on home page
          <div className="min-h-screen bg-gray-50">
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <UserDashboard
                tours={tours}
                userBookings={userBookings}
                customTourRequests={customTourRequests.filter((r) => r.userId === currentUser?.id)}
                onBookTour={handleBookTour}
                onCancelBooking={handleCancelBooking}
                onViewTour={handleViewTour}
                onCancelCustomRequest={handleCancelCustomTourRequest}
                onNavigateToCustomTourForm={() => handleNavigate("custom-tour")}
                onViewBookingDetail={handleViewUserBookingDetail}
              />
            </main>
          </div>
        ) : currentPage === "home" ? (
          // Not logged in, show public home page
          <HomePage
            onShowLogin={() => setShowLogin(true)}
            popularTours={tours.filter((t) => t.tourType !== "custom_request")}
            onNavigate={handleNavigate}
            onViewTour={handleViewTour}
          />
        ) : currentPage === "book-tours" ? (
          <BookToursPage
            tours={tours.filter((t) => t.tourType !== "custom_request")}
            currentUser={currentUser}
            onShowLogin={() => setShowLogin(true)}
            onBookTour={(tourId) => {
              const tour = tours.find((t) => t.id === tourId);
              if (tour) {
                handleOpenBookingForm(tour);
              }
            }}
            onViewTour={handleViewTour}
          />
        ) : currentPage === "contact" ? (
          <ContactPage onShowLogin={() => setShowLogin(true)} />
        ) : currentPage === "about" ? (
          <AboutPage onShowLogin={() => setShowLogin(true)} />
        ) : currentPage === "reviews" ? (
          <ReviewsPage onShowLogin={() => setShowLogin(true)} />
        ) : currentPage === "promotions" ? (
          <PromotionsPage />
        ) : currentPage === "messages" ? (
          <MessagesPage />
        ) : currentPage === "wishlist" ? (
          <WishlistPage />
        ) : currentPage === "my-reviews" ? (
          <MyReviewsPage />
        ) : currentPage === "notifications" ? (
          <NotificationsPage />
        ) : currentPage === "help-center" ? (
          <HelpCenterPage />
        ) : currentPage === "my-bookings" ? (
          <MyBookings
            bookings={userBookings}
            onCancelBooking={handleCancelBooking}
            onViewBookingDetail={handleViewUserBookingDetail}
          />
        ) : currentPage === "user-booking-detail" && selectedUserBooking ? (
          <UserBookingDetailPage
            booking={
              bookings.find((b) => b.id === selectedUserBooking.id) ||
              selectedUserBooking
            }
            systemBank={systemBankAccount}
            onBack={() => {
              setSelectedUserBooking(null);
              setCurrentPage("my-bookings");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            onCancelBooking={handleCancelBooking}
            onPayPaymentRequest={handlePayPaymentRequest}
          />
        ) : currentPage === "user-profile" ? (
          <UserProfile />
        ) : null}
      </div>
      <PublicFooter />
    </>
  );
}

export default App;