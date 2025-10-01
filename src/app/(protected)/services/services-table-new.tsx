"use client";

import { DataTable } from "@/components/data-table/data-table";
import { Button } from "@/components/ui/button";
import { downloadCsv, generateCsv } from "@/lib/csv";
import { formatCurrency } from "@/lib/utils";
import type { Service } from "@/types";
import { serviceColumns } from "./columns";
import Link from "next/link";
import { Plus } from "lucide-react";

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
  const handleExport = () => {
    const csv = generateCsv(services, csvColumns);
    downloadCsv(csv, `mitugym-services-${new Date().toISOString()}.csv`);
  };

  return (
    <DataTable
      columns={serviceColumns}
      data={services}
      filterKey="name"
      toolbarSlot={
        <div className="flex items-center gap-2">
          <Link href="/services/new">
            <Button className="gap-2 bg-primary hover:bg-primary/90 text-white">
              <Plus className="h-4 w-4" />
              Create Service
            </Button>
          </Link>
          <Button variant="outline" onClick={handleExport}>
            Export CSV
          </Button>
        </div>
      }
    />
  );
}
