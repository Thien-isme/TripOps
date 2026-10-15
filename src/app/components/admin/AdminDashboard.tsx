import { useState } from "react";
import {
  Tour,
  Booking,
  Service,
  User,
  GuideSchedule,
  TourCompany,
  SystemBankAccount,
} from "@/app/types";
import { AdminLayout } from "./AdminLayout";
import { AdminDashboardOverview } from "./AdminDashboardOverview";
import { ActiveToursManagement } from "./ActiveToursManagement";
import { AdminBookingManagement } from "./AdminBookingManagement";
import { AdminFinancialManagement } from "./AdminFinancialManagement";
import { ProviderAccountApproval } from "./ProviderAccountApproval";
import { ServicePostApproval } from "./ServicePostApproval";
import { ProviderManagement } from "./ProviderManagement";
import { UserManagement } from "./UserManagement";
import { CompanyManagement } from "./CompanyManagement";

interface AdminDashboardProps {
  currentUser: User;
  tours: Tour[];
  bookings: Booking[];
  services: Service[];
  guides: User[];
  providers: User[];
  users: User[];
  guideSchedules: GuideSchedule[];
  companies: TourCompany[];
  onApproveBooking: (bookingId: string) => void;
  onRejectBooking: (bookingId: string, reason?: string) => void;
  onAssignGuide: (bookingId: string, guideId: string) => void;
  onApproveService: (serviceId: string) => void;
  onRejectService: (serviceId: string, reason: string) => void;
  onApproveProvider: (providerId: string) => void;
  onRejectProvider: (
    providerId: string,
    reason?: string,
  ) => void;
  onUpdateUserStatus: (userId: string, isLocked: boolean) => void;
  onApproveCompany: (companyId: string) => void;
  onRejectCompany: (companyId: string, reason: string) => void;
  systemBank: SystemBankAccount;
  onUpdateSystemBank: (bank: SystemBankAccount) => void;
  onSettleBooking: (
    bookingId: string,
    settledAmount: number,
    platformFee: number,
  ) => void;
  onSuspendCompany: (companyId: string, reason: string) => void;
  onLogout?: () => void;
}

export function AdminDashboard({
  currentUser,
  tours,
  bookings,
  services,
  guides,
  providers,
  users,
  guideSchedules,
  companies,
  onApproveBooking,
  onRejectBooking,
  onAssignGuide,
  onApproveService,
  onRejectService,
  onApproveProvider,
  onRejectProvider,
  onUpdateUserStatus,
  onApproveCompany,
  onRejectCompany,
  systemBank,
  onUpdateSystemBank,
  onSettleBooking,
  onSuspendCompany,
  onLogout,
}: AdminDashboardProps) {
  const [activeSection, setActiveSection] =
    useState<string>("companies");

  const companyAdmins = users.filter(
    (u) => u.role === "company_admin",
  );

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return (
          <AdminDashboardOverview
            tours={tours}
            bookings={bookings}
            services={services}
            guides={guides}
            guideSchedules={guideSchedules}
          />
        );
      case "companies":
        return (
          <CompanyManagement
            companies={companies}
            companyAdmins={companyAdmins}
            onApproveCompany={onApproveCompany}
            onRejectCompany={onRejectCompany}
            onSuspendCompany={onSuspendCompany}
          />
        );
      case "active-tours":
        return (
          <ActiveToursManagement
            guideSchedules={guideSchedules}
          />
        );
      case "bookings":
        return (
          <AdminBookingManagement
            bookings={bookings}
            guides={guides}
            onApproveBooking={onApproveBooking}
            onRejectBooking={onRejectBooking}
            onAssignGuide={onAssignGuide}
          />
        );
      case "finance":
        return (
          <AdminFinancialManagement
            systemBank={systemBank}
            onUpdateSystemBank={onUpdateSystemBank}
            bookings={bookings}
            onSettleBooking={onSettleBooking}
          />
        );
      case "approve-providers":
        return (
          <ProviderAccountApproval
            providers={providers}
            onApproveProvider={onApproveProvider}
            onRejectProvider={onRejectProvider}
          />
        );
      case "approve-posts":
        return (
          <ServicePostApproval
            services={services}
            onApproveService={onApproveService}
            onRejectService={onRejectService}
          />
        );
      case "providers":
        return (
          <ProviderManagement
            providers={providers.filter(
              (p) => p.accountStatus === "approved",
            )}
            services={services}
          />
        );
      case "users":
        return (
          <UserManagement
            users={users}
            onUpdateUserStatus={onUpdateUserStatus}
          />
        );
      default:
        return null;
    }
  };

  return (
    <AdminLayout
      activeSection={activeSection}
      onNavigate={setActiveSection}
      onLogout={onLogout}
    >
      {renderContent()}
    </AdminLayout>
  );
}