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
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  MapPin,
  Users,
  DollarSign,
  Image as ImageIcon,
} from "lucide-react";
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
import { ImageUploadManager } from "../ImageUploadManager";

interface ServicePostManagementProps {
  services: Service[];
  providerId: string;
  onCreateService: () => void;
  onEditService: (service: Service) => void;
  onDeleteService: (serviceId: string) => void;
}

export function ServicePostManagement({
  services,
  providerId,
  onCreateService,
  onEditService,
  onDeleteService,
}: ServicePostManagementProps) {
  const [selectedService, setSelectedService] =
    useState<Service | null>(null);
  const [filter, setFilter] = useState<
    "all" | "pending" | "approved" | "rejected"
  >("all");
  const [imageManagementService, setImageManagementService] =
    useState<Service | null>(null);

  // Filter services by provider
  const providerServices = services.filter(
    (s) => s.providerId === providerId,
  );

  // Calculate stats
  const pendingServices = providerServices.filter(
    (s) => s.status === "pending",
  ).length;
  const approvedServices = providerServices.filter(
    (s) => s.status === "approved",
  ).length;
  const rejectedServices = providerServices.filter(
    (s) => s.status === "rejected",
  ).length;

  // Filter services
  const filteredServices =
    filter === "all"
      ? providerServices
      : providerServices.filter((s) => s.status === filter);

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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Quản lý Bài đăng
          </h1>
          <p className="text-gray-600 mt-2">
            Quản lý các bài đăng dịch vụ của bạn
          </p>
        </div>
        <Button
          onClick={onCreateService}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-5 h-5 mr-2" />
          Tạo bài đăng mới
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-blue-900">
              Tổng bài đăng
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-700">
              {providerServices.length}
            </div>
            <p className="text-xs text-blue-600 mt-1">
              Tất cả bài đăng
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-yellow-900">
              Chờ kiểm duyệt
            </CardTitle>
            <Clock className="w-5 h-5 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-700">
              {pendingServices}
            </div>
            <p className="text-xs text-yellow-600 mt-1">
              Đang chờ xét duyệt
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-green-900">
              Đã phê duyệt
            </CardTitle>
            <CheckCircle className="w-5 h-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-700">
              {approvedServices}
            </div>
            <p className="text-xs text-green-600 mt-1">
              Đang hoạt động
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-red-900">
              Đã từ chối
            </CardTitle>
            <XCircle className="w-5 h-5 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-700">
              {rejectedServices}
            </div>
            <p className="text-xs text-red-600 mt-1">
              Cần chỉnh sửa
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách bài đăng</CardTitle>
          <CardDescription>
            Xem và quản lý các bài đăng dịch vụ
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs
            value={filter}
            onValueChange={(v) => setFilter(v as any)}
          >
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">Tất cả</TabsTrigger>
              <TabsTrigger value="pending">
                Chờ kiểm duyệt
              </TabsTrigger>
              <TabsTrigger value="approved">
                Đã phê duyệt
              </TabsTrigger>
              <TabsTrigger value="rejected">
                Đã từ chối
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Services List */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredServices.length === 0 ? (
              <div className="col-span-2 text-center py-12 text-gray-500">
                <p>Chưa có bài đăng nào</p>
                <Button
                  onClick={onCreateService}
                  className="mt-4"
                >
                  Tạo bài đăng đầu tiên
                </Button>
              </div>
            ) : (
              filteredServices.map((service) => (
                <Card
                  key={service.id}
                  className="hover:shadow-lg transition-shadow"
                >
                  <div className="relative">
                    <img
                      src={service.image}
                      alt={service.name}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                    <div className="absolute top-3 right-3">
                      {getStatusBadge(service.status)}
                    </div>
                    {/* Hiển thị số lượng ảnh nếu có nhiều ảnh */}
                    {service.images &&
                      service.images.length > 1 && (
                        <div className="absolute bottom-3 right-3 bg-black/70 text-white px-2 py-1 rounded-lg text-xs flex items-center gap-1">
                          <ImageIcon className="w-3 h-3" />
                          {service.images.length}
                        </div>
                      )}
                  </div>
                  <CardContent className="p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className="text-xs"
                      >
                        {getCategoryLabel(service.category)}
                      </Badge>
                    </div>
                    <h3 className="font-semibold text-lg mb-2">
                      {service.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {service.description}
                    </p>

                    {/* Hiển thị địa chỉ chi tiết */}
                    {(service.province ||
                      service.district ||
                      service.ward) && (
                      <div className="flex items-start gap-1 mb-2 text-xs text-gray-500">
                        <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
                        <span className="line-clamp-1">
                          {[
                            service.street,
                            service.ward,
                            service.district,
                            service.province,
                          ]
                            .filter(Boolean)
                            .join(", ")}
                        </span>
                      </div>
                    )}

                    {/* Hiển thị giá */}
                    <div className="space-y-1 mb-3">
                      <div className="flex items-center gap-1 text-blue-600 font-bold text-lg">
                        <DollarSign className="w-4 h-4" />
                        {service.price.toLocaleString("vi-VN")}đ
                        {service.category === "hotel" && (
                          <span className="text-xs text-gray-600 font-normal ml-1">
                            /đêm
                          </span>
                        )}
                      </div>
                      {service.pricePerPerson && service.category !== "hotel" && service.category !== "restaurant" && service.category !== "eatery" && (
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Users className="w-3 h-3" />
                          {service.pricePerPerson.toLocaleString(
                            "vi-VN",
                          )}
                          đ/{service.category === "activity" ? "người (TB)" : "người"}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() =>
                          setSelectedService(service)
                        }
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Xem
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => onEditService(service)}
                        disabled={service.status === "pending"}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Sửa
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-purple-600 hover:bg-purple-50 hover:border-purple-300"
                        onClick={() => setImageManagementService(service)}
                        title="Quản lý ảnh"
                      >
                        <ImageIcon className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:bg-red-50 hover:border-red-300"
                        onClick={() => {
                          if (
                            confirm(
                              "Bạn có chắc muốn hủy bài đăng này? Hành động này không thể hoàn tác.",
                            )
                          ) {
                            onDeleteService(service.id);
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    {service.status === "pending" && (
                      <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                        ⏳ Bài đăng đang chờ admin kiểm duyệt
                      </div>
                    )}
                    {service.status === "rejected" && (
                      <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-800">
                        ❌ Bài đăng đã bị từ chối. Vui lòng
                        chỉnh sửa và gửi lại.
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog
        open={!!selectedService}
        onOpenChange={() => setSelectedService(null)}
      >
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedService?.name}</DialogTitle>
            <DialogDescription>
              Chi tiết về dịch vụ
            </DialogDescription>
          </DialogHeader>

          {selectedService && (
            <div className="space-y-4">
              {/* Hiển thị tất cả ảnh nếu có nhiều ảnh */}
              {selectedService.images &&
              selectedService.images.length > 0 ? (
                <div className="space-y-2">
                  <img
                    src={selectedService.images[0]}
                    alt={selectedService.name}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                  {selectedService.images.length > 1 && (
                    <div className="grid grid-cols-4 gap-2">
                      {selectedService.images
                        .slice(1)
                        .map((img, idx) => (
                          <img
                            key={idx}
                            src={img}
                            alt={`${selectedService.name} ${idx + 2}`}
                            className="w-full h-24 object-cover rounded-lg cursor-pointer hover:opacity-75 transition-opacity"
                          />
                        ))}
                    </div>
                  )}
                </div>
              ) : (
                <img
                  src={selectedService.image}
                  alt={selectedService.name}
                  className="w-full h-64 object-cover rounded-lg"
                />
              )}

              <div className="flex items-center justify-between">
                <Badge variant="outline">
                  {getCategoryLabel(selectedService.category)}
                </Badge>
                {getStatusBadge(selectedService.status)}
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
                      <strong>
                        {selectedService.category === "hotel"
                          ? "Giá phòng/đêm:"
                          : "Giá cơ bản:"}
                      </strong>{" "}
                      {selectedService.price.toLocaleString(
                        "vi-VN",
                      )}
                      đ
                    </p>
                    {selectedService.pricePerPerson &&
                      selectedService.category !== "hotel" && (
                        <p>
                          <strong>Giá/người:</strong>{" "}
                          {selectedService.pricePerPerson.toLocaleString(
                            "vi-VN",
                          )}
                          đ
                        </p>
                      )}
                    {selectedService.capacity && selectedService.category !== "fnb" && selectedService.category !== "activity" && (
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
                    Địa chỉ
                  </h4>
                  <div className="space-y-2 text-sm">
                    {selectedService.province && (
                      <p>
                        <strong>Tỉnh/TP:</strong>{" "}
                        {selectedService.province}
                      </p>
                    )}
                    {selectedService.district && (
                      <p>
                        <strong>Quận/Huyện:</strong>{" "}
                        {selectedService.district}
                      </p>
                    )}
                    {selectedService.ward && (
                      <p>
                        <strong>Phường/Xã:</strong>{" "}
                        {selectedService.ward}
                      </p>
                    )}
                    {selectedService.street && (
                      <p>
                        <strong>Đường:</strong>{" "}
                        {selectedService.street}
                      </p>
                    )}
                    {selectedService.location && (
                      <p className="text-gray-600 italic">
                        {selectedService.location}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
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
                    {selectedService.subCategory && selectedService.category === "fnb" && (
                      <p>
                        <strong>Loại hình:</strong>{" "}
                        {selectedService.subCategory === "restaurant" ? "Quán ăn" : "Cà phê"}
                      </p>
                    )}
                    {selectedService.checkInTime && (
                      <p>
                        <strong>Giờ check-in:</strong>{" "}
                        {selectedService.checkInTime}
                      </p>
                    )}
                    {selectedService.checkOutTime && (
                      <p>
                        <strong>Giờ check-out:</strong>{" "}
                        {selectedService.checkOutTime}
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
                    {selectedService.priceRange && (
                      <p>
                        <strong>Khoảng giá:</strong>{" "}
                        {selectedService.priceRange}
                      </p>
                    )}
                    {selectedService.duration && (
                      <p>
                        <strong>Thời lượng:</strong>{" "}
                        {selectedService.duration}
                      </p>
                    )}
                    {selectedService.difficulty && (
                      <p>
                        <strong>Độ khó:</strong>{" "}
                        {selectedService.difficulty}
                      </p>
                    )}
                    {selectedService.ageRestriction && (
                      <p>
                        <strong>Giới hạn độ tuổi:</strong>{" "}
                        {selectedService.ageRestriction}
                      </p>
                    )}
                    {selectedService.vehicleType && (
                      <p>
                        <strong>Loại xe:</strong>{" "}
                        {selectedService.vehicleType}
                      </p>
                    )}
                    {selectedService.seats && (
                      <p>
                        <strong>Số chỗ:</strong>{" "}
                        {selectedService.seats}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">
                    Thông tin hệ thống
                  </h4>
                  <div className="space-y-2 text-sm">
                    <p>
                      <strong>Ngày tạo:</strong>{" "}
                      {new Date(
                        selectedService.createdAt,
                      ).toLocaleDateString("vi-VN")}
                    </p>
                    <p>
                      <strong>Trạng thái:</strong>{" "}
                      {selectedService.status}
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
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Image Upload Manager */}
      {imageManagementService && (
        <ImageUploadManager
          isOpen={!!imageManagementService}
          onClose={() => setImageManagementService(null)}
          onSave={(images, thumbnailIndex) => {
            // Update the service with new images
            const updatedService = {
              ...imageManagementService,
              images: images,
              image: images[thumbnailIndex] || images[0],
            };
            onEditService(updatedService);
            setImageManagementService(null);
          }}
          initialImages={imageManagementService.images || [imageManagementService.image]}
          initialThumbnailIndex={0}
          title={`Quản lý ảnh - ${imageManagementService.name}`}
        />
      )}
    </div>
  );
}