"use client";

import { useState, useTransition } from "react";
import { DataTable } from "@/components/data-table/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { PurchasedService, Service } from "@/types";
import { Calendar, User, Package, Trash2 } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";

interface PurchasedServicesTableProps {
  purchasedServices: PurchasedService[];
  services: Service[];
}

export function PurchasedServicesTable({ purchasedServices }: PurchasedServicesTableProps) {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<PurchasedService | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleDeleteClick = (service: PurchasedService) => {
    setServiceToDelete(service);
    setDeleteModalOpen(true);
    setError(null);
  };

  const handleDeleteConfirm = async () => {
    if (!serviceToDelete) return;

    startTransition(async () => {
      const formData = new FormData();
      formData.append("id", serviceToDelete.id);

      try {
        // TODO: Implement deletePurchasedServiceAction
        // const result = await deletePurchasedServiceAction(formData);
        // 
        // if (result.success) {
        //   setDeleteModalOpen(false);
        //   setServiceToDelete(null);
        // } else {
        //   setError(result.error);
        // }
        setError("Delete action not implemented yet");
      } catch {
        setError("An unexpected error occurred");
      }
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-500 text-white">Approved</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500 text-white">Pending</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const columns = [
    {
      accessorKey: "purchase_date",
      header: "Purchase Date",
      cell: ({ row }: { row: { original: PurchasedService } }) => {
        const service = row.original;
        return (
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <div className="font-medium">
                {format(new Date(service.purchase_date), "MMM dd, yyyy")}
              </div>
              <div className="text-sm text-muted-foreground">
                {format(new Date(service.purchase_date), "h:mm a")}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      id: "service",
      header: "Service",
      accessorFn: (row: PurchasedService) => row.service?.name || "Unknown Service",
      cell: ({ row }: { row: { original: PurchasedService } }) => {
        const service = row.original;
        return (
          <div className="space-y-1">
            <div className="font-medium">{service.service?.name || "Unknown Service"}</div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Package className="h-3 w-3" />
              {service.service?.session_type || "Standard"}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "member",
      header: "Member",
      cell: ({ row }: { row: { original: PurchasedService } }) => {
        const service = row.original;
        return (
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <div>
              <div className="font-medium">{service.member?.full_name || "Unknown Member"}</div>
              {service.member?.email && (
                <div className="text-sm text-muted-foreground">{service.member.email}</div>
              )}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: { row: { original: PurchasedService } }) => getStatusBadge(row.original.status),
    },
    {
      accessorKey: "sessions",
      header: "Sessions",
      cell: ({ row }: { row: { original: PurchasedService } }) => {
        const service = row.original;
        return (
          <div className="text-center">
            <div className="font-medium">{service.sessions_remaining}/{service.sessions_total}</div>
            <div className="text-xs text-muted-foreground">remaining/total</div>
          </div>
        );
      },
    },
    {
      accessorKey: "notes",
      header: "Notes",
      cell: ({ row }: { row: { original: PurchasedService } }) => {
        const notes = row.original.notes;
        return notes ? (
          <div className="max-w-[200px] truncate" title={notes}>
            {notes}
          </div>
        ) : (
          <div className="text-muted-foreground">-</div>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }: { row: { original: PurchasedService } }) => {
        const service = row.original;
        return (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              View
            </Button>
            {service.status === "pending" && (
              <>
                <Link href={`/services/purchased/${service.id}/edit`}>
                  <Button variant="ghost" size="sm">
                    Edit
                  </Button>
                </Link>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-green-600 hover:bg-green-50"
                >
                  Approve
                </Button>
              </>
            )}
            {service.status === "cancelled" && (
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:bg-destructive/10"
                onClick={() => handleDeleteClick(service)}
                title="Delete cancelled purchase"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <>
      <DataTable
        columns={columns}
        data={purchasedServices}
        filterKey="service"
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setServiceToDelete(null);
          setError(null);
        }}
        title="Delete Purchased Service"
      >
        <div className="space-y-4">
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <p className="text-sm text-muted-foreground">
            Are you sure you want to permanently delete this cancelled purchased service?
          </p>

          {serviceToDelete && (
            <div className="bg-muted/50 border border-border rounded-lg p-3">
              <div className="space-y-2 text-sm">
                <div><strong>Service:</strong> {serviceToDelete.service?.name}</div>
                <div><strong>Member:</strong> {serviceToDelete.member?.full_name}</div>
                <div><strong>Purchase Date:</strong> {format(new Date(serviceToDelete.purchase_date), "PPp")}</div>
                <div><strong>Status:</strong> <Badge variant="outline" className="text-destructive">Cancelled</Badge></div>
              </div>
            </div>
          )}

          <p className="text-sm font-medium text-destructive">
            This action cannot be undone.
          </p>

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteModalOpen(false);
                setServiceToDelete(null);
                setError(null);
              }}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={isPending}
            >
              {isPending ? "Deleting..." : "Delete Service"}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
