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
        <div className="flex items-center justify-center md:justify-end gap-2 w-full md:w-auto">
          <Link href="/services/new">
            <Button className="gap-2 bg-primary hover:bg-primary/90 text-white h-9 sm:h-10 text-xs sm:text-sm px-3 sm:px-4">
              <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Create Service</span>
              <span className="sm:hidden">Create</span>
            </Button>
          </Link>
          <Button variant="outline" onClick={handleExport} className="h-9 sm:h-10 text-xs sm:text-sm px-3 sm:px-4">
            <span className="hidden sm:inline">Export CSV</span>
            <span className="sm:hidden">Export</span>
          </Button>
        </div>
      }
    />
  );
}
