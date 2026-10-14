import { useState, useRef, useEffect } from "react";
import {
  MapPin,
  ChevronDown,
  LogOut,
  Settings,
  Calendar,
  Tag,
  MessageSquare,
  Heart,
  CreditCard,
  Star,
  Bell,
  HelpCircle,
  History,
  MapPinned,
  MessageCircleMore,
} from "lucide-react";
import { User as UserType } from "@/app/types";

interface UnifiedHeaderProps {
  currentUser: UserType | null;
  onShowLogin: () => void;
  onLogout?: () => void;
  onNavigate: (page: string) => void;
  currentPage?: string;
}

export function UnifiedHeader({
  currentUser,
  onShowLogin,
  onLogout,
  onNavigate,
  currentPage = "home",
}: UnifiedHeaderProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const menuItems = [
    { id: "home", label: "Trang chủ" },
    { id: "book-tours", label: "Đặt Tour" },
    { id: "custom-tour", label: "Thiết kế tour theo yêu cầu" },
    { id: "contact", label: "Liên hệ" },
    { id: "about", label: "Về chúng tôi" },
    { id: "reviews", label: "Đánh giá của khách hàng" },
  ];

  const roleLabels = {
    user: "Khách hàng",
    guide: "Hướng dẫn viên",
    admin: "Quản lý",
    provider: "Nhà cung cấp",
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener(
        "mousedown",
        handleClickOutside,
      );
  }, []);

  // Generate avatar initials
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Generate avatar color based on name
  const getAvatarColor = (name: string) => {
    const colors = [
      "from-blue-500 to-blue-600",
      "from-purple-500 to-purple-600",
      "from-green-500 to-green-600",
      "from-orange-500 to-orange-600",
      "from-pink-500 to-pink-600",
      "from-indigo-500 to-indigo-600",
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  // Handle navigation - if user is logged in and role is not 'user', go to dashboard
  const handleNavigateClick = (page: string) => {
    if (currentUser && currentUser.role !== "user") {
      // For non-user roles, going to these pages means logging out first
      if (page !== "home") {
        return; // Don't navigate for non-user roles
      }
    }
    onNavigate(page);
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm shadow-sm z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => handleNavigateClick("home")}
          >
            <MapPin className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              TourViet
            </span>
          </div>

          {/* Navigation - Only show for users or non-logged in */}
          {(!currentUser || currentUser.role === "user") && (
            <div className="hidden md:flex items-center gap-8">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavigateClick(item.id)}
                  className={`transition-colors font-medium ${
                    currentPage === item.id
                      ? "text-blue-600"
                      : "text-gray-700 hover:text-blue-600"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}

          {/* Right side - Login button or User Avatar */}
          {!currentUser ? (
            // Not logged in - show login button
            <button
              onClick={onShowLogin}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Đăng nhập
            </button>
          ) : currentUser.role === "user" ? (
            // Logged in as user - show avatar with dropdown
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() =>
                  setIsDropdownOpen(!isDropdownOpen)
                }
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {/* Avatar */}
                <div
                  className={`w-10 h-10 rounded-full bg-gradient-to-br ${getAvatarColor(currentUser.name)} flex items-center justify-center text-white font-semibold shadow-md`}
                >
                  {getInitials(currentUser.name)}
                </div>

                {/* User Info - Hidden on mobile */}
                <div className="hidden md:block text-left">
                  <div className="text-sm font-semibold text-gray-900">
                    {currentUser.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {roleLabels[currentUser.role]}
                  </div>
                </div>

                <ChevronDown
                  className={`w-4 h-4 text-gray-500 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
                />
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 animate-in fade-in slide-in-from-top-2 duration-200 max-h-[calc(100vh-100px)] overflow-y-auto">
                  {/* User Info in Dropdown */}
                  <div className="px-4 py-3 border-b border-gray-100 sticky top-0 bg-white z-10">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-12 h-12 rounded-full bg-gradient-to-br ${getAvatarColor(currentUser.name)} flex items-center justify-center text-white font-semibold shadow-md`}
                      >
                        {getInitials(currentUser.name)}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">
                          {currentUser.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {currentUser.email}
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full inline-block">
                      {roleLabels[currentUser.role]}
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="py-2">
                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        onNavigate("user-profile");
                      }}
                      className="w-full px-4 py-2.5 text-left flex items-center gap-3 hover:bg-gray-50 transition-colors"
                    >
                      <Settings className="w-5 h-5 text-gray-500" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          Quản lý hồ sơ
                        </div>
                        <div className="text-xs text-gray-500">
                          Cập nhật thông tin cá nhân
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        onNavigate("my-bookings");
                      }}
                      className="w-full px-4 py-2.5 text-left flex items-center gap-3 hover:bg-gray-50 transition-colors"
                    >
                      <Calendar className="w-5 h-5 text-gray-500" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          Tour đã đặt
                        </div>
                        <div className="text-xs text-gray-500">
                          Xem và quản lý các tour
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        onNavigate("promotions");
                      }}
                      className="w-full px-4 py-2.5 text-left flex items-center gap-3 hover:bg-gray-50 transition-colors"
                    >
                      <Tag className="w-5 h-5 text-gray-500" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          Khuyến mãi
                        </div>
                        <div className="text-xs text-gray-500">
                          Ưu đãi & mã giảm giá
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        onNavigate("messages");
                      }}
                      className="w-full px-4 py-2.5 text-left flex items-center gap-3 hover:bg-gray-50 transition-colors"
                    >
                      <MessageSquare className="w-5 h-5 text-gray-500" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          Tin nhắn
                        </div>
                        <div className="text-xs text-gray-500">
                          Từ cơ sở lưu trú
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        onNavigate("wishlist");
                      }}
                      className="w-full px-4 py-2.5 text-left flex items-center gap-3 hover:bg-gray-50 transition-colors"
                    >
                      <Heart className="w-5 h-5 text-gray-500" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          Danh sách yêu thích
                        </div>
                        <div className="text-xs text-gray-500">
                          Tour đã lưu
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        onNavigate("my-reviews");
                      }}
                      className="w-full px-4 py-2.5 text-left flex items-center gap-3 hover:bg-gray-50 transition-colors"
                    >
                      <Star className="w-5 h-5 text-gray-500" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          Nhận xét của tôi
                        </div>
                        <div className="text-xs text-gray-500">
                          Đánh giá đã viết
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        onNavigate("notifications");
                      }}
                      className="w-full px-4 py-2.5 text-left flex items-center gap-3 hover:bg-gray-50 transition-colors"
                    >
                      <Bell className="w-5 h-5 text-gray-500" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          Thông báo
                        </div>
                        <div className="text-xs text-gray-500">
                          Cập nhật mới nhất
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        onNavigate("help-center");
                      }}
                      className="w-full px-4 py-2.5 text-left flex items-center gap-3 hover:bg-gray-50 transition-colors"
                    >
                      <HelpCircle className="w-5 h-5 text-gray-500" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          Trung tâm trợ giúp
                        </div>
                        <div className="text-xs text-gray-500">
                          Câu hỏi & hỗ trợ
                        </div>
                      </div>
                    </button>
                  </div>

                  {/* Logout */}
                  <div className="border-t border-gray-100 pt-2">
                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        onLogout?.();
                      }}
                      className="w-full px-4 py-2.5 text-left flex items-center gap-3 hover:bg-red-50 transition-colors text-red-600"
                    >
                      <LogOut className="w-5 h-5" />
                      <div>
                        <div className="text-sm font-medium">
                          Đăng xuất
                        </div>
                        <div className="text-xs text-red-500">
                          Thoát khỏi tài khoản
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            // Logged in as non-user (guide, admin, provider) - show simple avatar with logout
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() =>
                  setIsDropdownOpen(!isDropdownOpen)
                }
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {/* Avatar */}
                <div
                  className={`w-10 h-10 rounded-full bg-gradient-to-br ${getAvatarColor(currentUser.name)} flex items-center justify-center text-white font-semibold shadow-md`}
                >
                  {getInitials(currentUser.name)}
                </div>

                {/* User Info - Hidden on mobile */}
                <div className="hidden md:block text-left">
                  <div className="text-sm font-semibold text-gray-900">
                    {currentUser.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {roleLabels[currentUser.role]}
                  </div>
                </div>

                <ChevronDown
                  className={`w-4 h-4 text-gray-500 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
                />
              </button>

              {/* Dropdown Menu for non-user roles */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-200 py-2">
                  {/* User Info in Dropdown */}
                  <div className="px-4 py-3 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-12 h-12 rounded-full bg-gradient-to-br ${getAvatarColor(currentUser.name)} flex items-center justify-center text-white font-semibold shadow-md`}
                      >
                        {getInitials(currentUser.name)}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">
                          {currentUser.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {currentUser.email}
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full inline-block">
                      {roleLabels[currentUser.role]}
                    </div>
                  </div>

                  {/* Logout */}
                  <div className="pt-2">
                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        onLogout?.();
                      }}
                      className="w-full px-4 py-2.5 text-left flex items-center gap-3 hover:bg-red-50 transition-colors text-red-600"
                    >
                      <LogOut className="w-5 h-5" />
                      <div>
                        <div className="text-sm font-medium">
                          Đăng xuất
                        </div>
                        <div className="text-xs text-red-500">
                          Thoát khỏi tài khoản
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}