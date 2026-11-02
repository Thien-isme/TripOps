import { Service } from "@/app/types";
import { ProviderServiceDetailPage } from "@/app/components/provider/ProviderServiceDetailPage";

export interface AdminServiceDetailPageProps {
  service: Service;
  onBack: () => void;
  onApprove?: (serviceId: string) => void;
  onReject?: (serviceId: string, reason: string) => void;
  onToggleHide?: (serviceId: string, reason?: string) => void;
  onDelete?: (serviceId: string) => void;
  backTitle?: string;
}

export function AdminServiceDetailPage({
  service,
  onBack,
  onApprove,
  onReject,
  onToggleHide,
  onDelete,
  backTitle,
}: AdminServiceDetailPageProps) {
  return (
    <ProviderServiceDetailPage
      service={service}
      onBack={onBack}
      isAdmin={true}
      onApprove={onApprove}
      onReject={onReject}
      onToggleHide={onToggleHide}
      onDelete={onDelete}
      backTitle={backTitle}
    />
  );
}
