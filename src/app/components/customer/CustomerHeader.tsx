import { useState } from "react";
import {
  CalendarDays,
  ChevronDown,
  Compass,
  FileQuestion,
  LogOut,
  Menu,
  MessageSquare,
  ShieldAlert,
  Sparkles,
  Star,
  UserRound,
  ArrowUpRight,
} from "lucide-react";
import type { User } from "@/app/types";
import { Button } from "@/app/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/app/components/ui/dropdown-menu";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/app/components/ui/sheet";

interface CustomerHeaderProps {
  currentUser: User | null;
  currentPage: string;
  onNavigate: (page: string) => void;
  onShowLogin: () => void;
  onLogout: () => void;
  onOpenAIAdvisor?: () => void;
}

export function CustomerHeader({
  currentUser,
  currentPage,
  onNavigate,
  onShowLogin,
  onLogout,
  onOpenAIAdvisor,
}: CustomerHeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const links = [
    { id: "home", label: "Trang chủ" },
    { id: "book-tours", label: "Khám phá tour" },
    { id: "custom-tour", label: "Thiết kế tour theo yêu cầu" },
  ];
  const accountLinks = [
    { id: "user-profile", label: "Thông tin tài khoản", icon: UserRound },
    { id: "my-bookings", label: "Booking của tôi", icon: CalendarDays },
    { id: "messages", label: "Tin nhắn", icon: MessageSquare },
    {
      id: "my-requests",
      label: "Yêu cầu thiết kế của tôi",
      icon: FileQuestion,
    },
    { id: "my-reviews", label: "Đánh giá của tôi", icon: Star },
    { id: "my-complaints", label: "Khiếu nại của tôi", icon: ShieldAlert },
  ];
  const isCustomer = !currentUser || currentUser.role === "user";
  const initials =
    currentUser?.name
      .trim()
      .split(/\s+/)
      .slice(-2)
      .map((part) => part[0])
      .join("") || "KH";
  const navigate = (page: string) => {
    setMobileOpen(false);
    onNavigate(page);
  };
  return (
    <header className="trip-header">
      <div className="trip-header-inner">
        <button
          className="trip-brand focus:outline-none"
          onClick={() => navigate("home")}
          aria-label="TripOps — Trang chủ"
        >
          <img
            src="/images/Logo/TripOps_logo_transparent.png"
            alt="TripOps Logo"
            className="h-9 sm:h-10 w-auto object-contain transition-transform hover:scale-[1.02]"
          />
        </button>
        {isCustomer && (
          <nav className="trip-header-nav" aria-label="Điều hướng chính">
            {links.map((link) => (
              <button
                key={link.id}
                aria-current={
                  currentPage === link.id ||
                  (link.id === "book-tours" && currentPage === "tour-detail")
                    ? "page"
                    : undefined
                }
                onClick={() => navigate(link.id)}
              >
                {link.label}
              </button>
            ))}
          </nav>
        )}
        <div className="trip-header-actions">
          {onOpenAIAdvisor && (
            <button
              className="trip-ai-trigger"
              onClick={onOpenAIAdvisor}
              aria-label="Tìm tour cùng AI"
            >
              <Sparkles aria-hidden="true" />
              <span>Tìm tour cùng AI</span>
            </button>
          )}
          {currentUser ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                className="trip-account-trigger"
                aria-label="Mở menu tài khoản"
              >
                <span className="trip-account-avatar">{initials}</span>
                <span className="trip-account-name">
                  {currentUser.name.split(" ").slice(-1)[0]}
                </span>
                <ChevronDown size={14} />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="trip-account-menu">
                <DropdownMenuLabel>
                  <p className="text-sm font-semibold">{currentUser.name}</p>
                  <p className="text-xs font-normal text-slate-500 mt-1 truncate">
                    {currentUser.email}
                  </p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {accountLinks
                  .filter(
                    (link) =>
                      currentUser.role === "user" || link.id === "user-profile",
                  )
                  .map((link) => (
                    <DropdownMenuItem
                      key={link.id}
                      onSelect={() => navigate(link.id)}
                    >
                      <link.icon size={16} />
                      {link.label}
                    </DropdownMenuItem>
                  ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={onLogout} className="text-red-700">
                  <LogOut size={16} />
                  Đăng xuất
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              className="home-primary-button trip-login"
              onClick={onShowLogin}
            >
              Đăng nhập
              <ArrowUpRight size={14} aria-hidden="true" />
            </Button>
          )}
          {isCustomer && (
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger
                className="trip-mobile-trigger"
                aria-label="Mở menu điều hướng"
              >
                <Menu size={20} />
              </SheetTrigger>
              <SheetContent
                className="trip-mobile-sheet"
                closeLabel="Đóng menu"
              >
                <SheetHeader>
                  <SheetTitle>Khám phá cùng TripOps</SheetTitle>
                  <SheetDescription>
                    Tìm hành trình dành cho đoàn bạn.
                  </SheetDescription>
                </SheetHeader>
                <nav
                  className="trip-mobile-links"
                  aria-label="Điều hướng trên điện thoại"
                >
                  {links.map((link) => (
                    <button
                      key={link.id}
                      onClick={() => navigate(link.id)}
                      aria-current={
                        currentPage === link.id ? "page" : undefined
                      }
                    >
                      {link.label}
                    </button>
                  ))}
                  {onOpenAIAdvisor && (
                    <button
                      onClick={() => {
                        setMobileOpen(false);
                        onOpenAIAdvisor();
                      }}
                    >
                      <Sparkles />
                      Tìm tour cùng AI
                    </button>
                  )}
                  {currentUser &&
                    accountLinks.map((link) => (
                      <button key={link.id} onClick={() => navigate(link.id)}>
                        <link.icon />
                        {link.label}
                      </button>
                    ))}
                </nav>
              </SheetContent>
            </Sheet>
          )}
        </div>
      </div>
    </header>
  );
}
