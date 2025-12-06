"use client";

import { useState } from "react";
import { DataTable } from "@/components/data-table/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { deleteServiceAction } from "@/app/(protected)/actions";
import { Service } from "@/types";
import { Edit, Trash2, Clock, Banknote } from "lucide-react";
import Link from "next/link";

interface ServicesTableProps {
  services: Service[];
}

export function ServicesTable({ services }: ServicesTableProps) {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = (service: Service) => {
    setServiceToDelete(service);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!serviceToDelete) return;
    
    setIsDeleting(true);
    try {
      const result = await deleteServiceAction(serviceToDelete.id);
      if (result.success) {
        setDeleteModalOpen(false);
        setServiceToDelete(null);
        // Page will refresh automatically due to revalidatePath
      } else {
        alert(result.error);
      }
      } catch {
        alert("Failed to delete service");
      } finally {
      setIsDeleting(false);
    }
  };

  const getServiceTypeBadge = (type: string) => {
    switch (type) {
      case "personal_trainer":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Personal Training</Badge>;
      case "professional_massage":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Massage</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const columns = [
    {
      accessorKey: "name",
      header: () => <div className="flex justify-center w-full">Service Name</div>,
      cell: ({ row }: { row: { original: Service } }) => {
        const service = row.original;
        return (
          <div className="font-medium">{service.name}</div>
        );
      },
    },
    {
      accessorKey: "service_type",
      header: () => <div className="flex justify-center w-full">Type</div>,
      cell: ({ row }: { row: { original: Service } }) => getServiceTypeBadge(row.original.service_type),
    },
    {
      accessorKey: "price",
      header: () => <div className="flex justify-center w-full">Price</div>,
      cell: ({ row }: { row: { original: Service } }) => (
        <div className="flex items-center gap-1">
          <Banknote className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{row.original.price.toFixed(2)} RON</span>
        </div>
      ),
    },
    {
      accessorKey: "duration_minutes",
      header: () => <div className="flex justify-center w-full">Duration</div>,
      cell: () => (
        <div className="flex items-center gap-1">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span>1 hour</span>
        </div>
      ),
    },
    {
      accessorKey: "max_sessions",
      header: () => <div className="flex justify-center w-full">Sessions</div>,
      cell: ({ row }: { row: { original: Service } }) => {
        const sessions = row.original.max_sessions;
        return sessions ? `${sessions} session${sessions > 1 ? 's' : ''}` : "1 session";
      },
    },
    {
      accessorKey: "requires_advance_booking",
      header: () => <div className="flex justify-center w-full">Booking</div>,
      cell: ({ row }: { row: { original: Service } }) => {
        const service = row.original;
        return service.requires_advance_booking ? (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            {service.advance_booking_hours}h advance
          </Badge>
        ) : (
          <Badge variant="outline" className="bg-gray-50 text-gray-600">No advance needed</Badge>
        );
      },
    },
    {
      accessorKey: "is_active",
      header: () => <div className="flex justify-center w-full">Status</div>,
      cell: ({ row }: { row: { original: Service } }) => (
        <Badge variant={row.original.is_active ? "default" : "secondary"}>
          {row.original.is_active ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      id: "actions",
        header: () => <div className="flex justify-center w-full">Actions</div>,
      cell: ({ row }: { row: { original: Service } }) => {
        const service = row.original;
        return (
          <div className="flex items-center gap-2">
            <Link href={`/services/${service.id}/edit`}>
              <Button variant="ghost" size="sm">
                <Edit className="h-4 w-4" />
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDeleteClick(service)}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <>
      <DataTable
        columns={columns}
        data={services}
        filterKey="name"
        filterPlaceholder="Search services..."
      />

      <Modal
        isOpen={deleteModalOpen}
        onClose={() => !isDeleting && setDeleteModalOpen(false)}
        title="Delete Service"
      >
        {serviceToDelete && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete the service &ldquo;<strong>{serviceToDelete.name}</strong>&rdquo;? 
              This action cannot be undone.
            </p>
            {serviceToDelete.requires_advance_booking && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-800">
                  ⚠️ This service requires advance booking. Make sure there are no upcoming bookings before deleting.
                </p>
              </div>
            )}
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setDeleteModalOpen(false)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete Service"}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
