import { useState } from "react";
import {
  LayoutDashboard,
  Map,
  Package,
  Calendar,
  Settings,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  LogOut,
  UserCheck,
  FileCheck,
  Building2,
  Users,
} from "lucide-react";

interface AdminLayoutProps {
  children: React.ReactNode;
  activeSection: string;
  onNavigate: (section: string) => void;
  onLogout?: () => void;
}

export function AdminLayout({
  children,
  activeSection,
  onNavigate,
  onLogout,
}: AdminLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      id: "companies",
      label: "Công ty Du lịch",
      icon: Building2,
    },
    { id: "active-tours", label: "Tour đang dẫn", icon: Map },
    { id: "bookings", label: "Quản lý Booking", icon: Calendar },
    {
      id: "approve-providers",
      label: "Phê duyệt NCC",
      icon: UserCheck,
    },
    {
      id: "approve-posts",
      label: "Phê duyệt Bài đăng",
      icon: FileCheck,
    },
    {
      id: "providers",
      label: "Nhà cung cấp",
      icon: Package,
    },
    {
      id: "users",
      label: "Quản lý Người dùng",
      icon: Users,
    },
  ];

  const SidebarContent = () => (
    <>
      {/* Logo/Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Platform Admin
              </h2>
              <p className="text-sm text-gray-500">
                Quản lý nền tảng
              </p>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors hidden lg:block"
          >
            {collapsed ? (
              <ChevronRight className="w-5 h-5 text-gray-600" />
            ) : (
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            )}
          </button>
          <button
            onClick={() => setMobileOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors lg:hidden"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Menu Items */}
      <nav className="p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                onNavigate(item.id);
                setMobileOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <Icon
                className={`w-5 h-5 flex-shrink-0 ${isActive ? "text-white" : "text-gray-600"}`}
              />
              {!collapsed && (
                <span className="font-medium">
                  {item.label}
                </span>
              )}
            </button>
          );
        })}
        {onLogout && (
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-gray-700 hover:bg-gray-100"
          >
            <LogOut className="w-5 h-5 flex-shrink-0 text-gray-600" />
            {!collapsed && (
              <span className="font-medium">Đăng xuất</span>
            )}
          </button>
        )}
      </nav>
    </>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:block bg-white border-r border-gray-200 transition-all duration-300 fixed left-0 top-0 bottom-0 z-30 ${
          collapsed ? "w-20" : "w-64"
        }`}
      >
        <div className="h-full flex flex-col">
          <SidebarContent />
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={`lg:hidden fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-gray-200 z-50 transform transition-transform ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <main
        className={`flex-1 overflow-auto transition-all duration-300 ${collapsed ? "lg:ml-20" : "lg:ml-64"}`}
      >
        {/* Mobile Header */}
        <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-30">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Menu className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}