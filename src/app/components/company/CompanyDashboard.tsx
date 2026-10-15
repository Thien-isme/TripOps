import { useState } from "react";
import {
  Tour,
  Booking,
  User,
  GuideSchedule,
  TourCompany,
  PaymentRequest,
  CustomTourRequest,
} from "@/app/types";
import { CompanyLayout } from "./CompanyLayout";
import { CompanyOverview } from "./CompanyOverview";
import { CompanyTourManagement } from "./CompanyTourManagement";
import { CompanyBookingManagement } from "./CompanyBookingManagement";
import { CompanyGuideManagement } from "./CompanyGuideManagement";
import { CompanyCustomRequests } from "./CompanyCustomRequests";
import { CompanyBookingDetailPage } from "./CompanyBookingDetailPage";

interface CompanyDashboardProps {
  currentUser: User;
  company: TourCompany;
  tours: Tour[];
  bookings: Booking[];
  guides: User[];
  guideSchedules: GuideSchedule[];
  customTourRequests?: CustomTourRequest[];
  onCreateTour: (tour: Omit<Tour, "id">) => void;
  onEditTour: (tourId: string, tour: Partial<Tour>) => void;
  onDeleteTour: (tourId: string) => void;
  onApproveBooking: (bookingId: string) => void;
  onRejectBooking: (bookingId: string, reason?: string) => void;
  onAssignGuide: (bookingId: string, guideId: string) => void;
  onCreatePaymentRequest: (bookingId: string, request: Omit<PaymentRequest, "id" | "bookingId" | "createdAt" | "status">) => void;
  onMarkDepositPaid?: (bookingId: string) => void;
  onMarkFullyPaid?: (bookingId: string) => void;
  onUpdateBookingPrice?: (bookingId: string, newPrice: number, note?: string) => void;
  onUpdateCustomRequest?: (id: string, update: Partial<CustomTourRequest>) => void;
  onLogout?: () => void;
}

export function CompanyDashboard({
  currentUser,
  company,
  tours,
  bookings,
  guides,
  guideSchedules,
  customTourRequests = [],
  onCreateTour,
  onEditTour,
  onDeleteTour,
  onApproveBooking,
  onRejectBooking,
  onAssignGuide,
  onCreatePaymentRequest,
  onMarkDepositPaid,
  onMarkFullyPaid,
  onUpdateBookingPrice,
  onUpdateCustomRequest,
  onLogout,
}: CompanyDashboardProps) {
  const [activeSection, setActiveSection] = useState("overview");
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);

  const companyTours = tours.filter(
    (t) => t.companyId === company.id,
  );
  const companyBookings = bookings.filter(
    (b) => b.companyId === company.id,
  );
  const companyGuides = guides.filter(
    (g) => g.companyId === company.id,
  );
  const companyCustomRequests = customTourRequests.filter(
    (r) => r.targetCompanyId === company.id,
  );
  const pendingCustomRequestsCount = companyCustomRequests.filter(
    (r) => r.status === "pending",
  ).length;

  const currentSelectedBooking = selectedBookingId
    ? companyBookings.find((b) => b.id === selectedBookingId) || bookings.find((b) => b.id === selectedBookingId)
    : null;

  const handleNavigateSection = (section: string) => {
    setActiveSection(section);
    setSelectedBookingId(null);
  };

  const renderContent = () => {
    switch (activeSection) {
      case "overview":
        return (
          <CompanyOverview
            company={company}
            tours={companyTours}
            bookings={companyBookings}
            guides={companyGuides}
          />
        );
      case "tours":
        return (
          <CompanyTourManagement
            tours={companyTours}
            company={company}
            onCreateTour={onCreateTour}
            onEditTour={onEditTour}
            onDeleteTour={onDeleteTour}
          />
        );
      case "bookings":
        if (currentSelectedBooking) {
          return (
            <CompanyBookingDetailPage
              booking={currentSelectedBooking}
              guides={companyGuides}
              companyName={company.name}
              onBack={() => setSelectedBookingId(null)}
              onApproveBooking={onApproveBooking}
              onRejectBooking={onRejectBooking}
              onAssignGuide={onAssignGuide}
              onCreatePaymentRequest={onCreatePaymentRequest}
              onMarkDepositPaid={onMarkDepositPaid}
              onMarkFullyPaid={onMarkFullyPaid}
              onUpdateBookingPrice={onUpdateBookingPrice}
            />
          );
        }
        return (
          <CompanyBookingManagement
            bookings={companyBookings}
            guides={companyGuides}
            companyName={company.name}
            onApproveBooking={onApproveBooking}
            onRejectBooking={onRejectBooking}
            onAssignGuide={onAssignGuide}
            onCreatePaymentRequest={onCreatePaymentRequest}
            onMarkDepositPaid={onMarkDepositPaid}
            onMarkFullyPaid={onMarkFullyPaid}
            onGenerateContract={(id) => {}}
            onViewBookingDetail={(b) => setSelectedBookingId(b.id)}
          />
        );
      case "guides":
        return (
          <CompanyGuideManagement
            guides={companyGuides}
            tours={companyTours}
            guideSchedules={guideSchedules}
          />
        );
      case "custom-requests":
        return (
          <CompanyCustomRequests
            requests={companyCustomRequests}
            onUpdateRequest={(id, update) => onUpdateCustomRequest?.(id, update)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <CompanyLayout
      activeSection={activeSection}
      onNavigate={handleNavigateSection}
      company={company}
      currentUser={currentUser}
      onLogout={onLogout}
    >
      {renderContent()}
    </CompanyLayout>
  );
}
