import { Compass, Mail, Phone, MapPin, ArrowUpRight } from "lucide-react";

export function PublicFooter() {
  return (
    <footer className="bg-[#15291E] text-[#FBF9F5] pt-16 pb-12 border-t border-[#FFFFFF]/10 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-12 border-b border-[#FFFFFF]/10">
          {/* Brand Info */}
          <div className="md:col-span-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#FFFFFF]/10 flex items-center justify-center text-[#E8E4DC]">
                <Compass className="w-5 h-5 text-[#BD5E38]" />
              </div>
              <div>
                <span className="text-xl font-serif font-medium text-white tracking-tight">
                  TripOps
                </span>
                <span className="text-[10px] tracking-widest uppercase block text-[#FBF9F5]/60">
                  Curated Travel Platform
                </span>
              </div>
            </div>
            <p className="text-sm text-[#FBF9F5]/70 max-w-sm font-light leading-relaxed">
              Nền tảng đặt tour du lịch cao cấp, cá nhân hoá lịch trình với triết lý trải nghiệm văn hóa bản địa sâu sắc và an tâm tuyệt đối cho khách hàng trưởng thành.
            </p>
          </div>

          {/* Nav Links */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="text-xs uppercase tracking-widest font-semibold text-[#BD5E38]">
              Hành trình
            </h4>
            <ul className="space-y-2 text-sm text-[#FBF9F5]/70 font-light">
              <li>
                <a href="#tours" className="hover:text-white transition-colors">
                  Tour văn hóa di sản
                </a>
              </li>
              <li>
                <a href="#tours" className="hover:text-white transition-colors">
                  Nghỉ dưỡng tĩnh lặng
                </a>
              </li>
              <li>
                <a href="#tours" className="hover:text-white transition-colors">
                  Khám phá thiên nhiên
                </a>
              </li>
              <li>
                <a href="#tours" className="hover:text-white transition-colors">
                  Thiết kế tour riêng
                </a>
              </li>
            </ul>
          </div>

          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs uppercase tracking-widest font-semibold text-[#BD5E38]">
              Về TripOps
            </h4>
            <ul className="space-y-2 text-sm text-[#FBF9F5]/70 font-light">
              <li>
                <a href="#about" className="hover:text-white transition-colors">
                  Triết lý thương hiệu
                </a>
              </li>
              <li>
                <a href="#reviews" className="hover:text-white transition-colors">
                  Đánh giá của khách hàng
                </a>
              </li>
              <li>
                <a href="#services" className="hover:text-white transition-colors">
                  Dịch vụ địa phương
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Chính sách bảo mật & hoàn tiền
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs uppercase tracking-widest font-semibold text-[#BD5E38]">
              Kết nối chuyên gia
            </h4>
            <div className="space-y-2.5 text-sm text-[#FBF9F5]/70 font-light">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#BD5E38]" />
                <span>concierge@tripops.vn</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#BD5E38]" />
                <span>1900 6868 (8:00 - 21:00)</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#BD5E38] shrink-0 mt-0.5" />
                <span>Hà Nội & TP. Hồ Chí Minh, Việt Nam</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#FBF9F5]/50 gap-4">
          <p>© {new Date().getFullYear()} TripOps. All rights reserved. Trải nghiệm du lịch có gu.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-[#BD5E38] transition-colors">Điều khoản dịch vụ</a>
            <a href="#" className="hover:text-[#BD5E38] transition-colors">Bảo vệ quyền riêng tư</a>
            <a href="#" className="hover:text-[#BD5E38] transition-colors">Quy chuẩn dịch vụ 5 sao</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
