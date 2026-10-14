import { useState } from "react";
import { Service } from "@/app/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { Eye, CheckCircle, XCircle, Clock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/app/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/app/components/ui/tabs";
import { RejectServiceModal } from "./RejectServiceModal";

interface ServicePostApprovalProps {
  services: Service[];
  onApproveService: (serviceId: string) => void;
  onRejectService: (serviceId: string, reason: string) => void;
}

export function ServicePostApproval({
  services,
  onApproveService,
  onRejectService,
}: ServicePostApprovalProps) {
  const [selectedService, setSelectedService] =
    useState<Service | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [serviceToReject, setServiceToReject] =
    useState<Service | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const itemsPerPage = 10;

  const pendingServices = services.filter(
    (s) => s.status === "pending",
  ).length;
  const approvedServices = services.filter(
    (s) => s.status === "approved",
  ).length;
  const rejectedServices = services.filter(
    (s) => s.status === "rejected",
  ).length;

  // Pagination logic
  const totalPages = Math.ceil(services.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedServices = services.slice(
    startIndex,
    endIndex,
  );

  const getStatusBadge = (status: Service["status"]) => {
    const variants = {
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
    };
    const labels = {
      pending: "Chờ kiểm duyệt",
      approved: "Đã phê duyệt",
      rejected: "Đã từ chối",
    };
    return (
      <Badge className={variants[status]}>
        {labels[status]}
      </Badge>
    );
  };

  const getCategoryLabel = (category: Service["category"]) => {
    const labels = {
      hotel: "Khách sạn",
      restaurant: "Nhà hàng",
      eatery: "Quán ăn",
      transportation: "Vận chuyển",
      activity: "Hoạt động",
    };
    return labels[category] || category;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Phê duyệt Bài đăng
        </h1>
        <p className="text-gray-600 mt-2">
          Kiểm duyệt và phê duyệt các bài đăng dịch vụ
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Eye className="w-6 h-6" />
            </div>
          </div>
          <p className="text-3xl font-bold mb-1">
            {services.length}
          </p>
          <p className="text-sm text-blue-100">Tổng bài đăng</p>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
            {pendingServices > 0 && (
              <span className="px-3 py-1 bg-white/30 rounded-full text-sm font-bold">
                Mới!
              </span>
            )}
          </div>
          <p className="text-3xl font-bold mb-1">
            {pendingServices}
          </p>
          <p className="text-sm text-yellow-100">
            Chờ kiểm duyệt
          </p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6" />
            </div>
          </div>
          <p className="text-3xl font-bold mb-1">
            {approvedServices}
          </p>
          <p className="text-sm text-green-100">Đã phê duyệt</p>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <XCircle className="w-6 h-6" />
            </div>
          </div>
          <p className="text-3xl font-bold mb-1">
            {rejectedServices}
          </p>
          <p className="text-sm text-red-100">Đã từ chối</p>
        </div>
      </div>

      {/* Table List */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách bài đăng</CardTitle>
          <CardDescription>
            Xem và kiểm duyệt các bài đăng dịch vụ
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3">
                    Dịch vụ
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Danh mục
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Nhà cung cấp
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Giá
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Địa điểm
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Trạng thái
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-center"
                  >
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedServices.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      Không có bài đăng nào
                    </td>
                  </tr>
                ) : (
                  paginatedServices.map((service) => (
                    <tr
                      key={service.id}
                      className="bg-white border-b hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 font-medium text-gray-900">
                        <div className="flex items-center gap-3">
                          <img
                            src={service.image}
                            alt={service.name}
                            className="w-10 h-10 rounded-lg object-cover"
                          />
                          <span
                            className="line-clamp-1 max-w-[200px]"
                            title={service.name}
                          >
                            {service.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="outline">
                          {getCategoryLabel(service.category)}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        {service.providerName}
                      </td>
                      <td className="px-6 py-4 font-semibold text-blue-600">
                        {service.price.toLocaleString("vi-VN")}đ
                      </td>
                      <td className="px-6 py-4">
                        <div
                          className="flex items-center gap-1 max-w-[150px] truncate"
                          title={service.location}
                        >
                          <span className="truncate">
                            {service.location}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(service.status)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                            onClick={() =>
                              setSelectedService(service)
                            }
                            title="Xem chi tiết"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>

                          {service.status === "pending" && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-green-600 hover:text-green-800 hover:bg-green-50"
                                onClick={() =>
                                  onApproveService(service.id)
                                }
                                title="Phê duyệt"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-600 hover:text-red-800 hover:bg-red-50"
                                onClick={() => {
                                  setServiceToReject(service);
                                  setRejectModalOpen(true);
                                }}
                                title="Từ chối"
                              >
                                <XCircle className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-6">
              <Button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                variant="outline"
                size="sm"
              >
                Trước
              </Button>
              <span className="text-sm text-gray-600">
                Trang {currentPage} / {totalPages}
              </span>
              <Button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                variant="outline"
                size="sm"
              >
                Sau
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog
        open={!!selectedService}
        onOpenChange={() => {
          setSelectedService(null);
          setSelectedImageIndex(0);
        }}
      >
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedService?.name}</DialogTitle>
            <DialogDescription>
              Xem chi tiết bài đăng dịch vụ
            </DialogDescription>
          </DialogHeader>

          {selectedService && (
            <div className="space-y-4">
              {/* Image Gallery */}
              <div className="space-y-2">
                {/* Main Image */}
                <div className="relative">
                  <img
                    src={
                      selectedService.images?.[selectedImageIndex] ||
                      selectedService.image
                    }
                    alt={selectedService.name}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                  {selectedService.images &&
                    selectedService.images.length > 1 && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute left-2 top-1/2 -translate-y-1/2 h-10 w-10 bg-black/50 text-white hover:bg-black/70 hover:text-white rounded-full"
                          onClick={() =>
                            setSelectedImageIndex(
                              (prev) =>
                                (prev - 1 + selectedService.images.length) %
                                selectedService.images.length,
                            )
                          }
                          title="Ảnh trước"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="2"
                            stroke="currentColor"
                            className="w-5 h-5"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M15.75 19.5L8.25 12l7.5-7.5"
                            />
                          </svg>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 bg-black/50 text-white hover:bg-black/70 hover:text-white rounded-full"
                          onClick={() =>
                            setSelectedImageIndex(
                              (prev) =>
                                (prev + 1) % selectedService.images.length,
                            )
                          }
                          title="Ảnh sau"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="2"
                            stroke="currentColor"
                            className="w-5 h-5"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M8.25 4.5l7.5 7.5-7.5 7.5"
                            />
                          </svg>
                        </Button>
                        <div className="absolute bottom-2 right-2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                          {selectedImageIndex + 1} / {selectedService.images.length}
                        </div>
                      </>
                    )}
                </div>

                {/* Thumbnail Gallery */}
                {selectedService.images &&
                  selectedService.images.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {selectedService.images.map((img, idx) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedImageIndex(idx)}
                          className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                            selectedImageIndex === idx
                              ? "border-blue-600 ring-2 ring-blue-200"
                              : "border-gray-300 hover:border-blue-400"
                          }`}
                        >
                          <img
                            src={img}
                            alt={`${selectedService.name} - Ảnh ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
              </div>

              <div className="flex items-center justify-between">
                <div className="space-x-2">
                  <Badge variant="outline">
                    {getCategoryLabel(selectedService.category)}
                  </Badge>
                  {getStatusBadge(selectedService.status)}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">
                  Nhà cung cấp
                </h4>
                <p className="text-gray-700">
                  {selectedService.providerName}
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Mô tả</h4>
                <p className="text-gray-700">
                  {selectedService.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">
                    Thông tin cơ bản
                  </h4>
                  <div className="space-y-2 text-sm">
                    <p>
                      <strong>Giá:</strong>{" "}
                      {selectedService.price.toLocaleString(
                        "vi-VN",
                      )}
                      đ
                    </p>
                    <p>
                      <strong>Địa điểm:</strong>{" "}
                      {selectedService.location}
                    </p>
                    {selectedService.capacity && (
                      <p>
                        <strong>Sức chứa:</strong>{" "}
                        {selectedService.capacity} người
                      </p>
                    )}
                    <p>
                      <strong>Đánh giá:</strong> ⭐{" "}
                      {selectedService.rating}/5
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">
                    Thông tin bổ sung
                  </h4>
                  <div className="space-y-2 text-sm">
                    {selectedService.stars && (
                      <p>
                        <strong>Hạng sao:</strong>{" "}
                        {selectedService.stars} ⭐
                      </p>
                    )}
                    {selectedService.cuisine && (
                      <p>
                        <strong>Ẩm thực:</strong>{" "}
                        {selectedService.cuisine}
                      </p>
                    )}
                    {selectedService.openingHours && (
                      <p>
                        <strong>Giờ mở cửa:</strong>{" "}
                        {selectedService.openingHours}
                      </p>
                    )}
                    {selectedService.duration && (
                      <p>
                        <strong>Thời lượng:</strong>{" "}
                        {selectedService.duration}
                      </p>
                    )}
                    <p>
                      <strong>Ngày tạo:</strong>{" "}
                      {selectedService.createdAt}
                    </p>
                  </div>
                </div>
              </div>

              {selectedService.amenities &&
                selectedService.amenities.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">
                      Tiện nghi
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedService.amenities.map(
                        (amenity, idx) => (
                          <Badge key={idx} variant="secondary">
                            {amenity}
                          </Badge>
                        ),
                      )}
                    </div>
                  </div>
                )}

              {selectedService.status === "rejected" &&
                selectedService.rejectionReason && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h4 className="font-semibold text-red-800 mb-2">
                      Lý do từ chối
                    </h4>
                    <p className="text-red-700 text-sm">
                      {selectedService.rejectionReason}
                    </p>
                  </div>
                )}

              {selectedService.status === "pending" && (
                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={() => {
                      onApproveService(selectedService.id);
                      setSelectedService(null);
                    }}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Phê duyệt bài đăng
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 text-red-600 border-red-600 hover:bg-red-50"
                    onClick={() => {
                      setServiceToReject(selectedService);
                      setRejectModalOpen(true);
                      setSelectedService(null);
                    }}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Từ chối bài đăng
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Service Modal */}
      <RejectServiceModal
        isOpen={rejectModalOpen}
        onClose={() => {
          setRejectModalOpen(false);
          setServiceToReject(null);
        }}
        onConfirm={(reason) => {
          if (serviceToReject) {
            onRejectService(serviceToReject.id, reason);
          }
          setRejectModalOpen(false);
          setServiceToReject(null);
        }}
        serviceName={serviceToReject?.name}
      />
    </div>
  );
}