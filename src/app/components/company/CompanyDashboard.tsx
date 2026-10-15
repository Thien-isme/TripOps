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
import { mockTourCompanies } from "@/app/data/mockData";
import { CompanyLayout } from "./CompanyLayout";
import { CompanyOverview } from "./CompanyOverview";
import { CompanyTourManagement } from "./CompanyTourManagement";
import { CompanyBookingManagement } from "./CompanyBookingManagement";
import { CompanyGuideManagement } from "./CompanyGuideManagement";
import { CompanyCustomRequests } from "./CompanyCustomRequests";
import { CompanyBookingDetailPage } from "./CompanyBookingDetailPage";
import { CompanyCoHostManagement } from "./CompanyCoHostManagement";

interface CompanyDashboardProps {
  currentUser: User;
  company: TourCompany;
  tours: Tour[];
  bookings: Booking[];
  guides: User[];
  guideSchedules: GuideSchedule[];
  customTourRequests?: CustomTourRequest[];
  allCompanies?: TourCompany[];
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
  onRestoreTourVersion?: (tourId: string, versionNumber: number) => void;
  onViewTour?: (tour: Tour) => void;
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
  allCompanies,
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
  onRestoreTourVersion,
  onViewTour,
  onLogout,
}: CompanyDashboardProps) {
  const [activeSection, setActiveSection] = useState("overview");
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);

  const companyTours = tours.filter(
    (t) =>
      t.companyId === company.id ||
      t.coHosts?.some((ch) => ch.companyId === company.id)
  );
  const companyBookings = bookings.filter(
    (b) =>
      b.companyId === company.id ||
      b.coHosts?.some((ch) => ch.companyId === company.id) ||
      b.tour?.coHosts?.some((ch) => ch.companyId === company.id)
  );
  const companyGuides = guides.filter(
    (g) => g.companyId === company.id,
  );
  const companyCustomRequests = customTourRequests.filter(
    (r) =>
      r.targetCompanyId === company.id ||
      r.coHosts?.some((ch) => ch.companyId === company.id)
  );
  const pendingCustomRequestsCount = companyCustomRequests.filter(
    (r) => r.status === "pending" && r.targetCompanyId === company.id,
  ).length;

  // Count incoming pending co-host invitations for this company
  const pendingCoHostInvitesCount =
    customTourRequests.filter((r) =>
      r.coHosts?.some(
        (ch) => ch.companyId === company.id && ch.status === "pending"
      )
    ).length +
    tours.filter((t) =>
      t.coHosts?.some(
        (ch) => ch.companyId === company.id && ch.status === "pending"
      )
    ).length;

  const currentSelectedBooking = selectedBookingId
    ? companyBookings.find((b) => b.id === selectedBookingId) || bookings.find((b) => b.id === selectedBookingId)
    : null;

  const handleNavigateSection = (section: string) => {
    setActiveSection(section);
    setSelectedBookingId(null);
  };

  const handleAcceptCoHostInvitation = (requestIdOrTourId: string, isTour: boolean) => {
    if (!isTour) {
      const targetReq = customTourRequests.find((r) => r.id === requestIdOrTourId);
      if (targetReq && targetReq.coHosts) {
        const updatedCoHosts = targetReq.coHosts.map((ch) =>
          ch.companyId === company.id
            ? { ...ch, status: "accepted" as const, respondedAt: new Date().toISOString() }
            : ch
        );
        onUpdateCustomRequest?.(requestIdOrTourId, {
          coHosts: updatedCoHosts,
          companyNote: `${company.name} đã chấp nhận tham gia liên minh dẫn tour.`,
        });

        // Also sync to matching tour if exists
        const matchingTour = tours.find(
          (t) => t.id === targetReq.designedTourId || t.customRequestId === targetReq.id
        );
        if (matchingTour && matchingTour.coHosts) {
          const updatedTourCoHosts = matchingTour.coHosts.map((ch) =>
            ch.companyId === company.id
              ? { ...ch, status: "accepted" as const, respondedAt: new Date().toISOString() }
              : ch
          );
          onEditTour(matchingTour.id, {
            coHosts: updatedTourCoHosts,
          });
        }
      }
    } else {
      const targetTour = tours.find((t) => t.id === requestIdOrTourId);
      if (targetTour && targetTour.coHosts) {
        const updatedTourCoHosts = targetTour.coHosts.map((ch) =>
          ch.companyId === company.id
            ? { ...ch, status: "accepted" as const, respondedAt: new Date().toISOString() }
            : ch
        );
        onEditTour(requestIdOrTourId, {
          coHosts: updatedTourCoHosts,
        });
      }
    }
  };

  const handleRejectCoHostInvitation = (requestIdOrTourId: string, isTour: boolean, reason?: string) => {
    if (!isTour) {
      const targetReq = customTourRequests.find((r) => r.id === requestIdOrTourId);
      if (targetReq && targetReq.coHosts) {
        const updatedCoHosts = targetReq.coHosts.map((ch) =>
          ch.companyId === company.id
            ? {
                ...ch,
                status: "rejected" as const,
                notes: reason ? `${ch.notes || ""}\nLý do từ chối: ${reason}` : ch.notes,
                respondedAt: new Date().toISOString(),
              }
            : ch
        );
        onUpdateCustomRequest?.(requestIdOrTourId, {
          coHosts: updatedCoHosts,
          companyNote: `${company.name} đã từ chối lời mời: ${reason || "Không thể sắp xếp lịch"}`,
        });
      }
    } else {
      const targetTour = tours.find((t) => t.id === requestIdOrTourId);
      if (targetTour && targetTour.coHosts) {
        const updatedTourCoHosts = targetTour.coHosts.map((ch) =>
          ch.companyId === company.id
            ? {
                ...ch,
                status: "rejected" as const,
                notes: reason ? `${ch.notes || ""}\nLý do từ chối: ${reason}` : ch.notes,
                respondedAt: new Date().toISOString(),
              }
            : ch
        );
        onEditTour(requestIdOrTourId, {
          coHosts: updatedTourCoHosts,
        });
      }
    }
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
            onRestoreTourVersion={onRestoreTourVersion}
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
            company={company}
            tours={companyTours}
            allCompanies={allCompanies || mockTourCompanies}
            onUpdateRequest={(id, update) => onUpdateCustomRequest?.(id, update)}
            onCreateTour={onCreateTour}
            onEditTour={onEditTour}
            onRestoreTourVersion={onRestoreTourVersion}
            onViewTour={onViewTour}
          />
        );
      case "co-hosting":
        return (
          <CompanyCoHostManagement
            company={company}
            tours={tours}
            customTourRequests={customTourRequests}
            bookings={bookings}
            allCompanies={allCompanies || mockTourCompanies}
            onAcceptInvitation={handleAcceptCoHostInvitation}
            onRejectInvitation={handleRejectCoHostInvitation}
            onViewTour={onViewTour}
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
      coHostingBadgeCount={pendingCoHostInvitesCount}
      onLogout={onLogout}
    >
      {renderContent()}
    </CompanyLayout>
  );
}
