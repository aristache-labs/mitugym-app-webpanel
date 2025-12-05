"use client";

import { DataTable } from "@/components/data-table/data-table";
import { Button } from "@/components/ui/button";
import { downloadCsv, generateCsv } from "@/lib/csv";
import { formatCurrency } from "@/lib/utils";
import type { Service } from "@/types";
import { serviceColumns } from "./columns";
import Link from "next/link";
import { Plus, Download } from "lucide-react";

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
        <div className="flex items-center justify-center md:justify-end gap-3 w-full md:w-auto">
          <Link href="/services/new">
            <Button className="gap-2 h-9 sm:h-10 text-xs sm:text-sm px-4 sm:px-6 bg-gradient-to-br from-slate-800 via-slate-800/95 to-slate-900 hover:from-slate-700 hover:via-slate-700/95 hover:to-slate-800 text-slate-100 hover:text-white border border-slate-600/40 hover:border-slate-500/60 transition-all duration-300 shadow-lg shadow-black/20 hover:shadow-xl hover:shadow-black/30 backdrop-blur-sm font-medium">
              <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Create Service</span>
              <span className="sm:hidden">Create</span>
            </Button>
          </Link>
          <Button 
            onClick={handleExport} 
            className="h-9 sm:h-10 text-xs sm:text-sm px-4 sm:px-6 bg-gradient-to-br from-slate-800/50 via-slate-800/40 to-slate-900/50 hover:from-slate-800/70 hover:via-slate-800/60 hover:to-slate-900/70 text-slate-300 hover:text-slate-100 border border-slate-700/50 hover:border-slate-600/70 transition-all duration-300 shadow-md shadow-black/10 hover:shadow-lg hover:shadow-black/20 backdrop-blur-sm font-medium"
          >
            <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2" />
            <span className="hidden sm:inline">Export</span>
            <span className="sm:hidden">Export</span>
          </Button>
        </div>
      }
    />
  );
}
