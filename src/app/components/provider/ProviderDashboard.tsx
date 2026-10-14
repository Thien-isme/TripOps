import { useState } from "react";
import { Service } from "@/app/types";
import { ServiceManagement } from "./ServiceManagement";
import { CreateServiceForm } from "./CreateServiceForm";
import { Package, DollarSign, Star } from "lucide-react";

interface ProviderDashboardProps {
  services: Service[];
  currentProviderId: string;
  onCreateService: () => void;
  onEditService: (service: Service) => void;
  onDeleteService: (serviceId: string) => void;
  showCreateServiceForm: boolean;
  handleSubmitService: (
    serviceData: Omit<Service, "id">,
  ) => void;
  onCloseServiceForm?: () => void;
}

export function ProviderDashboard({
  services,
  currentProviderId,
  onCreateService,
  onEditService,
  onDeleteService,
  showCreateServiceForm,
  handleSubmitService,
  onCloseServiceForm,
}: ProviderDashboardProps) {
  const currentProvider = {
    id: currentProviderId,
    name: "Nhà cung cấp",
  }; // In real app, get from user data
  const myServices = services.filter(
    (s) => s.providerId === currentProviderId,
  );
  const totalRevenue = myServices.reduce(
    (sum, s) => sum + s.price,
    0,
  );
  const avgRating =
    myServices.length > 0
      ? myServices.reduce((sum, s) => sum + s.rating, 0) /
        myServices.length
      : 0;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm mb-1">
                Dịch vụ
              </p>
              <p className="text-3xl font-bold">
                {myServices.length}
              </p>
            </div>
            <Package className="w-12 h-12 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm mb-1">
                Tổng giá trị
              </p>
              <p className="text-2xl font-bold">
                {formatPrice(totalRevenue)}
              </p>
            </div>
            <DollarSign className="w-12 h-12 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm mb-1">
                Đánh giá TB
              </p>
              <p className="text-3xl font-bold">
                {avgRating.toFixed(1)}
              </p>
            </div>
            <Star className="w-12 h-12 text-yellow-200" />
          </div>
        </div>
      </div>

      <ServiceManagement
        services={services}
        currentProviderId={currentProviderId}
        onCreateService={onCreateService}
        onEditService={onEditService}
        onDeleteService={onDeleteService}
      />

      {showCreateServiceForm && (
        <CreateServiceForm
          handleSubmitService={handleSubmitService}
          currentProvider={currentProvider}
          onCloseServiceForm={onCloseServiceForm}
        />
      )}
    </div>
  );
}