import { MapPin } from "lucide-react";

interface PublicHeaderProps {
  onShowLogin: () => void;
  onNavigate?: (page: string) => void;
  currentPage?: string;
}

export function PublicHeader({
  onShowLogin,
  onNavigate,
  currentPage = "home",
}: PublicHeaderProps) {
  const menuItems = [
    { id: "home", label: "Trang chủ" },
    { id: "book-tours", label: "Đặt Tour" },
    { id: "contact", label: "Liên hệ" },
    { id: "about", label: "Về chúng tôi" },
    { id: "reviews", label: "Đánh giá của khách hàng" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm shadow-sm z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => onNavigate?.("home")}
          >
            <MapPin className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              TourViet
            </span>
          </div>

          {/* Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate?.(item.id)}
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

          {/* Login Button */}
          <button
            onClick={onShowLogin}
            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Đăng nhập
          </button>
        </div>
      </nav>
    </header>
  );
}