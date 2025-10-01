"use client";

import { useState, useTransition } from "react";
import { DataTable } from "@/components/data-table/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { PurchasedService, Service } from "@/types";
import { Calendar, User, Package, Trash2, CheckCircle, XCircle, Eye, Briefcase, Banknote, StickyNote, Hash } from "lucide-react";
import { format } from "date-fns";
import { approvePurchasedServiceAction, cancelPurchasedServiceAction, deletePurchasedServiceAction } from "@/app/(protected)/actions";

interface PurchasedServicesTableProps {
  purchasedServices: PurchasedService[];
  services: Service[];
}

export function PurchasedServicesTable({ purchasedServices }: PurchasedServicesTableProps) {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
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

  const handleViewClick = (service: PurchasedService) => {
    setSelectedService(service);
    setViewModalOpen(true);
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
      header: () => <div className="flex justify-center w-full whitespace-nowrap">Purchase Date</div>,
      cell: ({ row }: { row: { original: PurchasedService } }) => {
        const service = row.original;
        return (
          <div className="flex items-start gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div className="min-w-0">
              <div className="font-medium text-sm leading-tight">
                {format(new Date(service.purchase_date), "MMM dd, yyyy")}
              </div>
              <div className="text-xs text-muted-foreground leading-tight mt-1">
                {format(new Date(service.purchase_date), "h:mm a")}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      id: "service",
      header: () => <div className="flex justify-center w-full">Service</div>,
      accessorFn: (row: PurchasedService) => row.service?.name || "Unknown Service",
      cell: ({ row }: { row: { original: PurchasedService } }) => {
        const service = row.original;
        return (
          <div className="max-w-[180px]">
            <div className="font-medium text-sm line-clamp-2 leading-tight">
              {service.service?.name || "Unknown Service"}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "member",
      header: () => <div className="flex justify-center w-full">Member</div>,
      cell: ({ row }: { row: { original: PurchasedService } }) => {
        const service = row.original;
        return (
          <div className="flex items-start gap-2">
            <User className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div className="min-w-0 max-w-[160px]">
              <div className="font-medium text-sm leading-tight line-clamp-1">
                {service.member?.full_name || "Unknown Member"}
              </div>
              {service.member?.email && (
                <div className="text-xs text-muted-foreground leading-tight truncate">
                  {service.member.email}
                </div>
              )}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: () => <div className="flex justify-center w-full">Status</div>,
      cell: ({ row }: { row: { original: PurchasedService } }) => getStatusBadge(row.original.status),
    },
    {
      accessorKey: "sessions",
      header: () => <div className="flex justify-center w-full">Sessions</div>,
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
      id: "actions",
        header: () => <div className="flex justify-center w-full">Actions</div>,
      cell: ({ row }: { row: { original: PurchasedService } }) => {
        const service = row.original;
        return (
          <div className="flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => handleViewClick(service)}
              className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary transition-colors"
              title="View Details"
            >
              <Eye className="h-4 w-4" />
            </Button>
            {service.status === "pending" && (
              <>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0 hover:bg-green-500/10 hover:text-green-600 transition-colors"
                  onClick={() => handleApproveClick(service)}
                  title="Approve Service"
                >
                  <CheckCircle className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0 hover:bg-red-500/10 hover:text-red-500 transition-colors"
                  onClick={() => handleCancelClick(service)}
                  title="Cancel Service"
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              </>
            )}
            {service.status === "approved" && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0 hover:bg-red-500/10 hover:text-red-500 transition-colors"
                onClick={() => handleCancelClick(service)}
                title="Cancel Service"
              >
                <XCircle className="h-4 w-4" />
              </Button>
            )}
            {service.status === "cancelled" && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-red-500/10 hover:text-red-500 transition-colors"
                onClick={() => handleDeleteClick(service)}
                title="Delete Service"
              >
                <Trash2 className="h-4 w-4" />
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
          setSelectedService(null);
          setError(null);
        }}
        title="Delete Service Purchase"
        className="max-w-2xl"
      >
        <div className="space-y-6">
          {error && (
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-transparent to-red-500/10 rounded-2xl blur-xl"></div>
              <div className="relative p-4 rounded-2xl bg-gradient-to-br from-red-500/5 to-red-500/10 border border-red-500/20">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-red-500/10">
                    <XCircle className="h-5 w-5 text-red-500" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-red-800 mb-1">Error</p>
                    <p className="text-xs text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Header Section */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-transparent to-red-500/10 rounded-2xl blur-xl"></div>
            <div className="relative bg-card/95 backdrop-blur-xl border border-surface/40 shadow-lg rounded-2xl p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 rounded-2xl bg-red-500/10">
                  <Trash2 className="h-6 w-6 text-red-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-text">Delete Service Purchase</h3>
                  <p className="text-sm text-muted/70">Permanently remove this cancelled service purchase</p>
                </div>
              </div>
            </div>
          </div>

          {/* Service Details */}
          {selectedService && (
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 rounded-2xl blur-xl"></div>
              <div className="relative bg-card/95 backdrop-blur-xl border border-surface/40 shadow-lg rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-xl bg-primary/10">
                    <Package className="h-5 w-5 text-primary" />
                  </div>
                  <h4 className="font-semibold text-text">Purchase Details</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-surface/20 border border-surface/30">
                      <Package className="h-4 w-4 text-primary flex-shrink-0" />
                      <div>
                        <p className="text-xs font-medium text-muted/70 uppercase tracking-wider">Service</p>
                        <p className="text-sm font-semibold text-text">{selectedService.service?.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-surface/20 border border-surface/30">
                      <Calendar className="h-4 w-4 text-primary flex-shrink-0" />
                      <div>
                        <p className="text-xs font-medium text-muted/70 uppercase tracking-wider">Purchase Date</p>
                        <p className="text-sm font-semibold text-text">{format(new Date(selectedService.purchase_date), "PPp")}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-surface/20 border border-surface/30">
                      <User className="h-4 w-4 text-primary flex-shrink-0" />
                      <div>
                        <p className="text-xs font-medium text-muted/70 uppercase tracking-wider">Member</p>
                        <p className="text-sm font-semibold text-text">{selectedService.member?.full_name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-surface/20 border border-surface/30">
                      <XCircle className="h-4 w-4 text-primary flex-shrink-0" />
                      <div>
                        <p className="text-xs font-medium text-muted/70 uppercase tracking-wider">Status</p>
                        <div className="mt-1">
                          <Badge variant="outline" className="bg-red-500/20 text-red-600 border-red-500/30">
                            Cancelled
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Warning Notice */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-transparent to-red-500/10 rounded-2xl blur-xl"></div>
            <div className="relative p-4 rounded-2xl bg-gradient-to-br from-red-500/5 to-red-500/10 border border-red-500/20">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-red-500/10">
                  <Trash2 className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-red-800 mb-1">⚠️ Permanent Deletion</p>
                  <p className="text-xs text-red-700 leading-relaxed">
                    This action will permanently delete this cancelled service purchase from the system. This cannot be undone and all associated data will be lost.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Confirmation Notice */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 via-transparent to-yellow-500/10 rounded-2xl blur-xl"></div>
            <div className="relative p-4 rounded-2xl bg-gradient-to-br from-yellow-500/5 to-yellow-500/10 border border-yellow-500/20">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-yellow-500/10">
                  <StickyNote className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-yellow-800 mb-1">📋 Confirmation Required</p>
                  <p className="text-xs text-yellow-700 leading-relaxed">
                    Are you sure you want to permanently delete this cancelled purchased service? This action is irreversible.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="ghost"
              onClick={() => {
                setDeleteModalOpen(false);
                setSelectedService(null);
                setError(null);
              }}
              disabled={isPending}
              className="px-6 hover:bg-surface/50 transition-all duration-200 rounded-xl"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteConfirm}
              disabled={isPending}
              className="gap-2 bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/40 transition-all duration-200 rounded-xl px-8"
            >
              {isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  Delete Service
                </>
              )}
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
        title="Approve Service Purchase"
        className="max-w-2xl"
      >
        <div className="space-y-6">
          {error && (
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-transparent to-red-500/10 rounded-2xl blur-xl"></div>
              <div className="relative p-4 rounded-2xl bg-gradient-to-br from-red-500/5 to-red-500/10 border border-red-500/20">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-red-500/10">
                    <XCircle className="h-5 w-5 text-red-500" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-red-800 mb-1">Error</p>
                    <p className="text-xs text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Header Section */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-green-500/10 rounded-2xl blur-xl"></div>
            <div className="relative bg-card/95 backdrop-blur-xl border border-surface/40 shadow-lg rounded-2xl p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 rounded-2xl bg-green-500/10">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-text">Approve Service Purchase</h3>
                  <p className="text-sm text-muted/70">Allow the member to book sessions for this service</p>
                </div>
              </div>
            </div>
          </div>

          {/* Service Details */}
          {selectedService && (
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 rounded-2xl blur-xl"></div>
              <div className="relative bg-card/95 backdrop-blur-xl border border-surface/40 shadow-lg rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-xl bg-primary/10">
                    <Package className="h-5 w-5 text-primary" />
                  </div>
                  <h4 className="font-semibold text-text">Purchase Details</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-surface/20 border border-surface/30">
                      <Package className="h-4 w-4 text-primary flex-shrink-0" />
                      <div>
                        <p className="text-xs font-medium text-muted/70 uppercase tracking-wider">Service</p>
                        <p className="text-sm font-semibold text-text">{selectedService.service?.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-surface/20 border border-surface/30">
                      <Hash className="h-4 w-4 text-primary flex-shrink-0" />
                      <div>
                        <p className="text-xs font-medium text-muted/70 uppercase tracking-wider">Sessions</p>
                        <p className="text-sm font-semibold text-text">{selectedService.sessions_total} total</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-surface/20 border border-surface/30">
                      <User className="h-4 w-4 text-primary flex-shrink-0" />
                      <div>
                        <p className="text-xs font-medium text-muted/70 uppercase tracking-wider">Member</p>
                        <p className="text-sm font-semibold text-text">{selectedService.member?.full_name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-surface/20 border border-surface/30">
                      <Calendar className="h-4 w-4 text-primary flex-shrink-0" />
                      <div>
                        <p className="text-xs font-medium text-muted/70 uppercase tracking-wider">Purchase Date</p>
                        <p className="text-sm font-semibold text-text">{format(new Date(selectedService.purchase_date), "PPp")}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notes Section */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-blue-500/10 rounded-2xl blur-xl"></div>
            <div className="relative bg-card/95 backdrop-blur-xl border border-surface/40 shadow-lg rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-xl bg-blue-500/10">
                  <StickyNote className="h-5 w-5 text-blue-500" />
                </div>
                <Label htmlFor="approve-notes" className="font-semibold text-text">Approval Notes (Optional)</Label>
              </div>
            <Textarea
              id="approve-notes"
              placeholder="Add any notes about the approval..."
              value={approveNotes}
              onChange={(e) => setApproveNotes(e.target.value)}
              rows={3}
                className="w-full rounded-2xl border border-surface/50 bg-surface/20 px-4 py-3 text-sm placeholder:text-muted/50 focus:border-primary/50 focus:bg-surface/30 transition-all duration-200"
            />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="ghost"
              onClick={() => {
                setApproveModalOpen(false);
                setSelectedService(null);
                setApproveNotes("");
                setError(null);
              }}
              disabled={isPending}
              className="px-6 hover:bg-surface/50 transition-all duration-200 rounded-xl"
            >
              Cancel
            </Button>
            <Button
              onClick={handleApproveConfirm}
              disabled={isPending}
              className="gap-2 bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-500/25 hover:shadow-xl hover:shadow-green-500/40 transition-all duration-200 rounded-xl px-8"
            >
              {isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  Approving...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Approve Service
                </>
              )}
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
        title="Cancel Service Purchase"
        className="max-w-2xl"
      >
        <div className="space-y-6">
          {error && (
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-transparent to-red-500/10 rounded-2xl blur-xl"></div>
              <div className="relative p-4 rounded-2xl bg-gradient-to-br from-red-500/5 to-red-500/10 border border-red-500/20">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-red-500/10">
                    <XCircle className="h-5 w-5 text-red-500" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-red-800 mb-1">Error</p>
                    <p className="text-xs text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Header Section */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-transparent to-red-500/10 rounded-2xl blur-xl"></div>
            <div className="relative bg-card/95 backdrop-blur-xl border border-surface/40 shadow-lg rounded-2xl p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 rounded-2xl bg-red-500/10">
                  <XCircle className="h-6 w-6 text-red-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-text">Cancel Service Purchase</h3>
                  <p className="text-sm text-muted/70">This will prevent the member from booking sessions for this service</p>
                </div>
              </div>
            </div>
          </div>

          {/* Service Details */}
          {selectedService && (
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 rounded-2xl blur-xl"></div>
              <div className="relative bg-card/95 backdrop-blur-xl border border-surface/40 shadow-lg rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-xl bg-primary/10">
                    <Package className="h-5 w-5 text-primary" />
                  </div>
                  <h4 className="font-semibold text-text">Purchase Details</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-surface/20 border border-surface/30">
                      <Package className="h-4 w-4 text-primary flex-shrink-0" />
                      <div>
                        <p className="text-xs font-medium text-muted/70 uppercase tracking-wider">Service</p>
                        <p className="text-sm font-semibold text-text">{selectedService.service?.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-surface/20 border border-surface/30">
                      <Hash className="h-4 w-4 text-primary flex-shrink-0" />
                      <div>
                        <p className="text-xs font-medium text-muted/70 uppercase tracking-wider">Sessions</p>
                        <p className="text-sm font-semibold text-text">{selectedService.sessions_remaining}/{selectedService.sessions_total} remaining</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-surface/20 border border-surface/30">
                      <User className="h-4 w-4 text-primary flex-shrink-0" />
                      <div>
                        <p className="text-xs font-medium text-muted/70 uppercase tracking-wider">Member</p>
                        <p className="text-sm font-semibold text-text">{selectedService.member?.full_name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-surface/20 border border-surface/30">
                      <Calendar className="h-4 w-4 text-primary flex-shrink-0" />
                      <div>
                        <p className="text-xs font-medium text-muted/70 uppercase tracking-wider">Purchase Date</p>
                        <p className="text-sm font-semibold text-text">{format(new Date(selectedService.purchase_date), "PPp")}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Warning Notice */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 via-transparent to-yellow-500/10 rounded-2xl blur-xl"></div>
            <div className="relative p-4 rounded-2xl bg-gradient-to-br from-yellow-500/5 to-yellow-500/10 border border-yellow-500/20">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-yellow-500/10">
                  <StickyNote className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-yellow-800 mb-1">⚠️ Important Notice</p>
                  <p className="text-xs text-yellow-700 leading-relaxed">
                    Cancelling this service will prevent the member from booking any remaining sessions. This action cannot be undone.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Reason Section */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-orange-500/10 rounded-2xl blur-xl"></div>
            <div className="relative bg-card/95 backdrop-blur-xl border border-surface/40 shadow-lg rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-xl bg-orange-500/10">
                  <StickyNote className="h-5 w-5 text-orange-500" />
                </div>
                <Label htmlFor="cancel-reason" className="font-semibold text-text">Cancellation Reason *</Label>
              </div>
            <Textarea
              id="cancel-reason"
              placeholder="Please provide a reason for cancelling this service..."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              rows={3}
              required
                className="w-full rounded-2xl border border-surface/50 bg-surface/20 px-4 py-3 text-sm placeholder:text-muted/50 focus:border-primary/50 focus:bg-surface/30 transition-all duration-200"
            />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="ghost"
              onClick={() => {
                setCancelModalOpen(false);
                setSelectedService(null);
                setCancelReason("");
                setError(null);
              }}
              disabled={isPending}
              className="px-6 hover:bg-surface/50 transition-all duration-200 rounded-xl"
            >
              Keep Service
            </Button>
            <Button
              onClick={handleCancelConfirm}
              disabled={isPending || !cancelReason.trim()}
              className="gap-2 bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/40 transition-all duration-200 rounded-xl px-8"
            >
              {isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  Cancelling...
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4" />
                  Cancel Service
                </>
              )}
            </Button>
          </div>
        </div>
      </Modal>

      {/* View Details Modal */}
      <Modal
        isOpen={viewModalOpen}
        onClose={() => {
          setViewModalOpen(false);
          setSelectedService(null);
          setError(null);
        }}
        title="Purchased Service Details"
        className="max-w-6xl"
      >
        <div className="space-y-6">
          {selectedService && (
            <>
              {/* Header with Status */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 rounded-2xl blur-xl"></div>
                <div className="relative bg-card/95 backdrop-blur-xl border border-surface/40 shadow-lg rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-primary/10">
                        <Package className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg text-text">{selectedService.service?.name || "Unknown Service"}</h3>
                        <p className="text-sm text-muted/70">Service Purchase Details</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(selectedService.status)}
                    </div>
                  </div>
                  
                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20">
                      <div className="text-lg font-bold text-primary">{selectedService.sessions_remaining}</div>
                      <div className="text-xs text-muted/70">Remaining</div>
                    </div>
                    <div className="text-center p-3 rounded-xl bg-gradient-to-br from-blue-500/5 to-blue-500/10 border border-blue-500/20">
                      <div className="text-lg font-bold text-blue-600">{selectedService.sessions_total}</div>
                      <div className="text-xs text-muted/70">Total</div>
                    </div>
                    <div className="text-center p-3 rounded-xl bg-gradient-to-br from-green-500/5 to-green-500/10 border border-green-500/20">
                      <div className="text-lg font-bold text-green-600">{selectedService.service?.duration_minutes || 60}m</div>
                      <div className="text-xs text-muted/70">Duration</div>
                    </div>
                    <div className="text-center p-3 rounded-xl bg-gradient-to-br from-orange-500/5 to-orange-500/10 border border-orange-500/20">
                      <div className="text-lg font-bold text-orange-600">{selectedService.service?.price?.toFixed(0) || "0"} RON</div>
                      <div className="text-xs text-muted/70">Price</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Service Information */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-blue-500/10 rounded-2xl blur-xl"></div>
                <div className="relative bg-card/95 backdrop-blur-xl border border-surface/40 shadow-lg rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-xl bg-blue-500/10">
                      <Briefcase className="h-5 w-5 text-blue-500" />
                    </div>
                    <h3 className="font-semibold text-lg text-text">Service Information</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-surface/20 border border-surface/30">
                        <Package className="h-4 w-4 text-primary flex-shrink-0" />
                  <div>
                          <p className="text-xs font-medium text-muted/70 uppercase tracking-wider">Service Name</p>
                          <p className="text-sm font-semibold text-text">{selectedService.service?.name || "Unknown Service"}</p>
                  </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-surface/20 border border-surface/30">
                        <Calendar className="h-4 w-4 text-primary flex-shrink-0" />
                  <div>
                          <p className="text-xs font-medium text-muted/70 uppercase tracking-wider">Duration</p>
                          <p className="text-sm font-semibold text-text">{selectedService.service?.duration_minutes || 60} minutes</p>
                  </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-surface/20 border border-surface/30">
                        <Package className="h-4 w-4 text-primary flex-shrink-0" />
                  <div>
                          <p className="text-xs font-medium text-muted/70 uppercase tracking-wider">Service Type</p>
                          <p className="text-sm font-semibold text-text">{selectedService.service?.session_type || "Standard"}</p>
                  </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-surface/20 border border-surface/30">
                        <Banknote className="h-4 w-4 text-primary flex-shrink-0" />
                  <div>
                          <p className="text-xs font-medium text-muted/70 uppercase tracking-wider">Price</p>
                          <p className="text-sm font-semibold text-text">{selectedService.service?.price?.toFixed(2) || "0.00"} RON</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Member Information */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-green-500/10 rounded-2xl blur-xl"></div>
                <div className="relative bg-card/95 backdrop-blur-xl border border-surface/40 shadow-lg rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-xl bg-green-500/10">
                      <User className="h-5 w-5 text-green-500" />
                    </div>
                    <h3 className="font-semibold text-lg text-text">Member Information</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-surface/20 border border-surface/30">
                        <User className="h-4 w-4 text-primary flex-shrink-0" />
                  <div>
                          <p className="text-xs font-medium text-muted/70 uppercase tracking-wider">Full Name</p>
                          <p className="text-sm font-semibold text-text">{selectedService.member?.full_name || "Unknown Member"}</p>
                  </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-surface/20 border border-surface/30">
                        <User className="h-4 w-4 text-primary flex-shrink-0" />
                  <div>
                          <p className="text-xs font-medium text-muted/70 uppercase tracking-wider">Phone</p>
                          <p className="text-sm font-semibold text-text">{selectedService.member?.phone || "-"}</p>
                  </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-surface/20 border border-surface/30">
                        <User className="h-4 w-4 text-primary flex-shrink-0" />
                  <div>
                          <p className="text-xs font-medium text-muted/70 uppercase tracking-wider">Email</p>
                          <p className="text-sm font-semibold text-text">{selectedService.member?.email || "-"}</p>
                  </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-surface/20 border border-surface/30">
                        <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                  <div>
                          <p className="text-xs font-medium text-muted/70 uppercase tracking-wider">Status</p>
                          <p className="text-sm font-semibold text-text capitalize">{selectedService.member?.status || "-"}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Purchase Details */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-orange-500/10 rounded-2xl blur-xl"></div>
                <div className="relative bg-card/95 backdrop-blur-xl border border-surface/40 shadow-lg rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-xl bg-orange-500/10">
                      <Calendar className="h-5 w-5 text-orange-500" />
                    </div>
                    <h3 className="font-semibold text-lg text-text">Purchase Details</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-surface/20 border border-surface/30">
                        <Calendar className="h-4 w-4 text-primary flex-shrink-0" />
                  <div>
                          <p className="text-xs font-medium text-muted/70 uppercase tracking-wider">Purchase Date</p>
                          <p className="text-sm font-semibold text-text">{format(new Date(selectedService.purchase_date), "PPp")}</p>
                  </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-surface/20 border border-surface/30">
                        <Package className="h-4 w-4 text-primary flex-shrink-0" />
                  <div>
                          <p className="text-xs font-medium text-muted/70 uppercase tracking-wider">Total Sessions</p>
                          <p className="text-sm font-semibold text-text">{selectedService.sessions_total}</p>
                  </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-surface/20 border border-surface/30">
                        <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                  <div>
                          <p className="text-xs font-medium text-muted/70 uppercase tracking-wider">Status</p>
                          <div className="mt-1">{getStatusBadge(selectedService.status)}</div>
                  </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-surface/20 border border-surface/30">
                        <Package className="h-4 w-4 text-primary flex-shrink-0" />
                  <div>
                          <p className="text-xs font-medium text-muted/70 uppercase tracking-wider">Remaining Sessions</p>
                          <p className="text-sm font-semibold text-text">{selectedService.sessions_remaining}</p>
                  </div>
                      </div>
                    </div>
                  </div>
                  {(selectedService.approved_date || selectedService.cancelled_date) && (
                    <div className="mt-4 pt-4 border-t border-surface/30">
                      <div className="space-y-3">
                  {selectedService.approved_date && (
                          <div className="flex items-center gap-3 p-3 rounded-xl bg-green-500/5 border border-green-500/20">
                            <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <div>
                              <p className="text-xs font-medium text-green-600 uppercase tracking-wider">Approved Date</p>
                              <p className="text-sm font-semibold text-text">{format(new Date(selectedService.approved_date), "PPp")}</p>
                      </div>
                          </div>
                        )}
                        {selectedService.cancelled_date && (
                          <div className="flex items-center gap-3 p-3 rounded-xl bg-red-500/5 border border-red-500/20">
                            <XCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                            <div>
                              <p className="text-xs font-medium text-red-600 uppercase tracking-wider">Cancelled Date</p>
                              <p className="text-sm font-semibold text-text">{format(new Date(selectedService.cancelled_date), "PPp")}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Notes */}
              {selectedService.notes && (
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-purple-500/10 rounded-2xl blur-xl"></div>
                  <div className="relative bg-card/95 backdrop-blur-xl border border-surface/40 shadow-lg rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 rounded-xl bg-purple-500/10">
                        <Package className="h-5 w-5 text-purple-500" />
                      </div>
                      <h3 className="font-semibold text-lg text-text">Notes</h3>
                    </div>
                    <div className="p-4 rounded-xl bg-surface/20 border border-surface/30">
                      <p className="text-sm text-text whitespace-pre-wrap leading-relaxed">
                    {selectedService.notes}
                  </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons based on status */}
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setViewModalOpen(false);
                    setSelectedService(null);
                    setError(null);
                  }}
                  className="px-6 hover:bg-surface/50 transition-all duration-200 rounded-xl"
                >
                  Close
                </Button>
                
                {selectedService.status === "pending" && (
                  <>
                    <Button
                      onClick={() => {
                        setViewModalOpen(false);
                        handleApproveClick(selectedService);
                      }}
                      className="gap-2 bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-500/25 hover:shadow-xl hover:shadow-green-500/40 transition-all duration-200 rounded-xl"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Approve
                    </Button>
                    <Button
                      onClick={() => {
                        setViewModalOpen(false);
                        handleCancelClick(selectedService);
                      }}
                      className="gap-2 bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/40 transition-all duration-200 rounded-xl"
                    >
                      <XCircle className="h-4 w-4" />
                      Cancel
                    </Button>
                  </>
                )}
                
                {selectedService.status === "approved" && (
                  <Button
                    onClick={() => {
                      setViewModalOpen(false);
                      handleCancelClick(selectedService);
                    }}
                    className="gap-2 bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/40 transition-all duration-200 rounded-xl"
                  >
                    <XCircle className="h-4 w-4" />
                    Cancel Service
                  </Button>
                )}
                
                {selectedService.status === "cancelled" && (
                  <Button
                    onClick={() => {
                      setViewModalOpen(false);
                      handleDeleteClick(selectedService);
                    }}
                    className="gap-2 bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/40 transition-all duration-200 rounded-xl"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      </Modal>
    </>
  );
}
