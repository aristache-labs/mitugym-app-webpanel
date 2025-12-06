"use client";

import { DataTable } from "@/components/data-table/data-table";
import { AnimatedCreateButton } from "@/components/ui/animated-create-button";
import { AnimatedExportButton } from "@/components/ui/animated-export-button";
import { downloadCsv, generateCsv } from "@/lib/csv";
import { formatCurrency } from "@/lib/utils";
import type { Service } from "@/types";
import { serviceColumns } from "./columns";
import { useRouter } from "next/navigation";

const csvColumns = [
  { header: "Name", accessor: (service: Service) => service.name },
  { header: "Type", accessor: (service: Service) => {
    const typeLabels = { 'personal_trainer': 'Personal Training', 'professional_massage': 'Professional Massage' };
    return typeLabels[service.service_type as keyof typeof typeLabels] || service.service_type;
  }},
  { header: "Price", accessor: (service: Service) => formatCurrency(service.price) },
  { header: "Duration", accessor: (service: Service) => `${service.duration_minutes} min` },
  { header: "Sessions", accessor: (service: Service) => `${service.max_sessions || 1} session${(service.max_sessions || 1) > 1 ? 's' : ''}` },
  { header: "Status", accessor: (service: Service) => (service.is_active ? "Active" : "Inactive") },
  { header: "Advance Booking", accessor: (service: Service) => service.requires_advance_booking ? `${service.advance_booking_hours}h advance` : "No advance needed" },
  { header: "Description", accessor: (service: Service) => service.description || "" },
];

export function ServicesTableNew({ services }: { services: Service[] }) {
  const router = useRouter();

  const handleCreateService = () => {
    router.push("/services/new");
  };

  const handleExport = () => {
    const csv = generateCsv(services, csvColumns);
    downloadCsv(csv, `mitugym-services-${new Date().toISOString()}.csv`);
  };

  return (
    <DataTable
      columns={serviceColumns}
      data={services}
      filterKey="name"
      filterPlaceholder="Search services..."
      toolbarSlot={
        <div className="flex items-center justify-center md:justify-end gap-3 w-full md:w-auto">
          <AnimatedCreateButton onClick={handleCreateService} label="Create Service" shortLabel="Create" />
          <AnimatedExportButton onClick={handleExport} />
        </div>
      }
    />
  );
}
