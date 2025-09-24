"use client";

import { useState, useTransition } from "react";
import { DataTable } from "@/components/data-table/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { PurchasedService, Service } from "@/types";
import { Calendar, User, Package, Trash2, CheckCircle, XCircle } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import { approvePurchasedServiceAction, cancelPurchasedServiceAction, deletePurchasedServiceAction } from "@/app/(protected)/actions";

interface PurchasedServicesTableProps {
  purchasedServices: PurchasedService[];
  services: Service[];
}

export function PurchasedServicesTable({ purchasedServices }: PurchasedServicesTableProps) {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<PurchasedService | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [approveNotes, setApproveNotes] = useState("");
  const [cancelReason, setCancelReason] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleDeleteClick = (service: PurchasedService) => {
    setSelectedService(service);
    setDeleteModalOpen(true);
    setError(null);
  };

  const handleApproveClick = (service: PurchasedService) => {
    setSelectedService(service);
    setApproveModalOpen(true);
    setApproveNotes("");
    setError(null);
  };

  const handleCancelClick = (service: PurchasedService) => {
    setSelectedService(service);
    setCancelModalOpen(true);
    setCancelReason("");
    setError(null);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedService) return;

    startTransition(async () => {
      const formData = new FormData();
      formData.append("id", selectedService.id);

      try {
        const result = await deletePurchasedServiceAction(formData);
        
        if (result.success) {
          setDeleteModalOpen(false);
          setSelectedService(null);
        } else {
          setError(result.error);
        }
      } catch {
        setError("An unexpected error occurred");
      }
    });
  };

  const handleApproveConfirm = async () => {
    if (!selectedService) return;

    startTransition(async () => {
      const formData = new FormData();
      formData.append("id", selectedService.id);
      if (approveNotes) {
        formData.append("notes", approveNotes);
      }

      try {
        const result = await approvePurchasedServiceAction(formData);
        
        if (result.success) {
          setApproveModalOpen(false);
          setSelectedService(null);
          setApproveNotes("");
        } else {
          setError(result.error);
        }
      } catch {
        setError("An unexpected error occurred");
      }
    });
  };

  const handleCancelConfirm = async () => {
    if (!selectedService) return;

    startTransition(async () => {
      const formData = new FormData();
      formData.append("id", selectedService.id);
      formData.append("reason", cancelReason);

      try {
        const result = await cancelPurchasedServiceAction(formData);
        
        if (result.success) {
          setCancelModalOpen(false);
          setSelectedService(null);
          setCancelReason("");
        } else {
          setError(result.error);
        }
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
                  onClick={() => handleApproveClick(service)}
                >
                  <CheckCircle className="h-4 w-4" />
                  Approve
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-destructive hover:bg-destructive/10"
                  onClick={() => handleCancelClick(service)}
                >
                  <XCircle className="h-4 w-4" />
                  Cancel
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

          {selectedService && (
            <div className="bg-muted/50 border border-border rounded-lg p-3">
              <div className="space-y-2 text-sm">
                <div><strong>Service:</strong> {selectedService.service?.name}</div>
                <div><strong>Member:</strong> {selectedService.member?.full_name}</div>
                <div><strong>Purchase Date:</strong> {format(new Date(selectedService.purchase_date), "PPp")}</div>
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
                setSelectedService(null);
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

      {/* Approve Modal */}
      <Modal
        isOpen={approveModalOpen}
        onClose={() => {
          setApproveModalOpen(false);
          setSelectedService(null);
          setApproveNotes("");
          setError(null);
        }}
        title="Approve Purchased Service"
      >
        <div className="space-y-4">
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <p className="text-sm text-muted-foreground">
            Approve this purchased service to allow the member to book sessions.
          </p>

          {selectedService && (
            <div className="bg-muted/50 border border-border rounded-lg p-3">
              <div className="space-y-2 text-sm">
                <div><strong>Service:</strong> {selectedService.service?.name}</div>
                <div><strong>Member:</strong> {selectedService.member?.full_name}</div>
                <div><strong>Sessions:</strong> {selectedService.sessions_total} total</div>
                <div><strong>Purchase Date:</strong> {format(new Date(selectedService.purchase_date), "PPp")}</div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="approve-notes">Approval Notes (Optional)</Label>
            <Textarea
              id="approve-notes"
              placeholder="Add any notes about the approval..."
              value={approveNotes}
              onChange={(e) => setApproveNotes(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setApproveModalOpen(false);
                setSelectedService(null);
                setApproveNotes("");
                setError(null);
              }}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleApproveConfirm}
              disabled={isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              {isPending ? "Approving..." : "Approve Service"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Cancel Modal */}
      <Modal
        isOpen={cancelModalOpen}
        onClose={() => {
          setCancelModalOpen(false);
          setSelectedService(null);
          setCancelReason("");
          setError(null);
        }}
        title="Cancel Purchased Service"
      >
        <div className="space-y-4">
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <p className="text-sm text-muted-foreground">
            Cancel this purchased service. This action will prevent the member from booking sessions for this service.
          </p>

          {selectedService && (
            <div className="bg-muted/50 border border-border rounded-lg p-3">
              <div className="space-y-2 text-sm">
                <div><strong>Service:</strong> {selectedService.service?.name}</div>
                <div><strong>Member:</strong> {selectedService.member?.full_name}</div>
                <div><strong>Sessions Remaining:</strong> {selectedService.sessions_remaining}/{selectedService.sessions_total}</div>
                <div><strong>Purchase Date:</strong> {format(new Date(selectedService.purchase_date), "PPp")}</div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="cancel-reason">Cancellation Reason *</Label>
            <Textarea
              id="cancel-reason"
              placeholder="Please provide a reason for cancelling this service..."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              rows={3}
              required
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setCancelModalOpen(false);
                setSelectedService(null);
                setCancelReason("");
                setError(null);
              }}
              disabled={isPending}
            >
              Keep Service
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelConfirm}
              disabled={isPending || !cancelReason.trim()}
            >
              {isPending ? "Cancelling..." : "Cancel Service"}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
