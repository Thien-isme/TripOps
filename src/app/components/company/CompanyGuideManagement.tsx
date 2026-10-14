import { Tour, User, GuideSchedule } from "@/app/types";
import {
  Users,
  MapPin,
  Star,
  Package,
  Mail,
  Phone,
} from "lucide-react";

interface CompanyGuideManagementProps {
  guides: User[];
  tours: Tour[];
  guideSchedules: GuideSchedule[];
}

export function CompanyGuideManagement({
  guides,
  tours,
  guideSchedules,
}: CompanyGuideManagementProps) {
  const getGuideSchedules = (guideId: string) =>
    guideSchedules.filter((s) => s.booking.guideId === guideId);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-gray-900">
          Hướng dẫn viên
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          {guides.length} hướng dẫn viên thuộc công ty
        </p>
      </div>

      {guides.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">
            Chưa có hướng dẫn viên nào
          </p>
          <p className="text-gray-400 text-xs mt-1">
            Các tài khoản hướng dẫn viên đăng ký sẽ xuất hiện tại
            đây sau khi được liên kết với công ty.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {guides.map((guide) => {
            const schedules = getGuideSchedules(guide.id);
            const activeSchedules = schedules.filter((s) =>
              ["pending", "confirmed"].includes(
                s.booking.status,
              ),
            );

            return (
              <div
                key={guide.id}
                className="bg-white rounded-xl border border-gray-200 p-5 flex gap-4"
              >
                <img
                  src={
                    guide.avatar ||
                    `https://ui-avatars.com/api/?name=${guide.name}&background=3b82f6&color=fff`
                  }
                  alt={guide.name}
                  className="w-14 h-14 rounded-full object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-gray-900">
                      {guide.name}
                    </h3>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${
                        activeSchedules.length > 0
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {activeSchedules.length > 0
                        ? "Đang dẫn tour"
                        : "Rảnh"}
                    </span>
                  </div>
                  <div className="space-y-1 mt-2">
                    <p className="text-xs text-gray-500 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5" />
                      {guide.email}
                    </p>
                    {guide.phone && (
                      <p className="text-xs text-gray-500 flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5" />
                        {guide.phone}
                      </p>
                    )}
                  </div>
                  <div className="mt-3 flex items-center gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Package className="w-3.5 h-3.5" />
                      {schedules.length} tour đã dẫn
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
