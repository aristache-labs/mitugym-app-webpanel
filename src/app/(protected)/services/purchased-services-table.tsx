"use client";

import { useState, useTransition } from "react";
import { DataTable } from "@/components/data-table/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AnimatedCreateButton } from "@/components/ui/animated-create-button";
import { PurchasedService, Service } from "@/types";
import type { TimeFormat } from "@/lib/settings";
import { Calendar, User, Package, Trash2, CheckCircle, XCircle, Eye, Briefcase, Banknote, StickyNote, Hash, Clock, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { approvePurchasedServiceAction, cancelPurchasedServiceAction, deletePurchasedServiceAction } from "@/app/(protected)/actions";
import { useRouter } from "next/navigation";
import { smartNavigate } from "@/lib/ios-chrome-navigation";

interface PurchasedServicesTableProps {
  purchasedServices: PurchasedService[];
  services: Service[];
  timeFormat?: TimeFormat;
}

export function PurchasedServicesTable({ purchasedServices, timeFormat = '24h' }: PurchasedServicesTableProps) {
  const router = useRouter();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<PurchasedService | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [approveNotes, setApproveNotes] = useState("");
  const [cancelReason, setCancelReason] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleNewPurchase = () => {
    // Use hard navigation for iOS Chrome portrait to fix scroll restoration bug
    if (!smartNavigate("/services/purchased/new")) {
      router.push("/services/purchased/new");
    }
  };

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

  const getStatusBadge = (status: string, compact: boolean = false) => {
    const sizeClasses = compact 
      ? "text-[10px] px-2 py-0.5" 
      : "text-xs sm:text-sm";
    const iconSize = compact ? "h-2.5 w-2.5" : "h-3 w-3";
    
    switch (status) {
      case "approved":
        return (
          <Badge className={`bg-green-500/30 text-white border-0 rounded-full ${sizeClasses}`}>
            <CheckCircle className={`${iconSize} mr-1`} />
            Approved
          </Badge>
        );
      case "pending":
        return (
          <Badge className={`bg-yellow-500/30 text-white border-0 rounded-full ${sizeClasses}`}>
            <Clock className={`${iconSize} mr-1`} />
            Pending
          </Badge>
        );
      case "cancelled":
        return (
          <Badge className={`bg-red-500/30 text-white border-0 rounded-full ${sizeClasses}`}>
            <XCircle className={`${iconSize} mr-1`} />
            Cancelled
          </Badge>
        );
      default:
        return <Badge variant="outline" className={`rounded-full ${sizeClasses}`}>{status}</Badge>;
    }
  };

  const columns = [
    {
      accessorKey: "purchase_date",
      header: () => <div className="text-center md:text-left w-full whitespace-nowrap">Purchase Date</div>,
      cell: ({ row }: { row: { original: PurchasedService } }) => {
        const service = row.original;
        return (
          <div className="flex items-start justify-center md:justify-start gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div className="min-w-0">
              <div className="font-medium text-sm leading-tight">
                {format(new Date(service.purchase_date), "MMM dd, yyyy")}
              </div>
              <div className="text-xs text-muted-foreground leading-tight mt-1">
                {timeFormat === '12h' 
                  ? format(new Date(service.purchase_date), "h:mm a")
                  : format(new Date(service.purchase_date), "HH:mm")
                }
              </div>
            </div>
          </div>
        );
      },
    },
    {
      id: "service",
      header: () => <div className="text-center w-full">Service</div>,
      accessorFn: (row: PurchasedService) => row.service?.name || "Unknown Service",
      cell: ({ row }: { row: { original: PurchasedService } }) => {
        const service = row.original;
        return (
          <div className="max-w-[180px] text-center mx-auto">
            <div className="font-medium text-sm line-clamp-2 leading-tight">
              {service.service?.name || "Unknown Service"}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "member",
      header: () => <div className="text-center w-full">Member</div>,
      cell: ({ row }: { row: { original: PurchasedService } }) => {
        const service = row.original;
        return (
          <div className="flex items-start justify-center gap-2">
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
      header: () => <div className="text-center w-full">Status</div>,
      cell: ({ row }: { row: { original: PurchasedService } }) => (
        <div className="flex justify-center">
          {getStatusBadge(row.original.status)}
        </div>
      ),
    },
    {
      accessorKey: "sessions",
      header: () => <div className="text-center w-full">Sessions</div>,
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
        header: () => <div className="text-center w-full">Actions</div>,
      cell: ({ row }: { row: { original: PurchasedService } }) => {
        const service = row.original;
        return (
          <div className="flex items-center justify-center gap-1">
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
        filterPlaceholder="Search purchased services..."
        toolbarSlot={
          <div className="flex items-center justify-center md:justify-end w-full md:w-auto">
            <AnimatedCreateButton onClick={handleNewPurchase} label="New Purchase" shortLabel="New" />
          </div>
        }
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
        className="max-w-[98vw] sm:max-w-6xl"
      >
        <div className="space-y-4 sm:space-y-6">
          {selectedService && (
            <>
              {error && (
                <div className="relative p-3 sm:p-4 rounded-xl bg-red-500/5 border border-red-500/20 backdrop-blur-sm">
                  <div className="flex items-start gap-2 sm:gap-3">
                    <div className="p-1.5 sm:p-2 rounded-lg bg-red-500/10">
                      <XCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-500" />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-semibold text-red-400 mb-0.5 sm:mb-1">Error</p>
                      <p className="text-xs text-red-300/80">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Header with Title and Badge */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 rounded-2xl sm:rounded-3xl blur-2xl"></div>
                <div className="relative bg-card/95 backdrop-blur-xl border border-surface/40 shadow-md transition-all duration-300 hover:shadow-lg hover:border-primary/40 overflow-hidden rounded-2xl sm:rounded-3xl">
                  {/* Card Hover Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/2 via-primary/1 to-secondary/2 opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-2xl sm:rounded-3xl"></div>
                  
                  {/* Enhanced Border Effect */}
                  <div className="absolute inset-0 rounded-2xl sm:rounded-3xl">
                    <div className="absolute inset-0 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-transparent via-primary/30 to-transparent" 
                         style={{ 
                           mask: 'linear-gradient(white, white) content-box, linear-gradient(white, white)',
                           WebkitMask: 'linear-gradient(white, white) content-box, linear-gradient(white, white)',
                           WebkitMaskComposite: 'xor',
                           maskComposite: 'exclude',
                           padding: '1px'
                         }}>
                    </div>
                  </div>
                  
                  <div className="relative p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
                      <div className="flex items-start sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
                        <div className="p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-primary/10 flex-shrink-0">
                          <Package className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-text truncate">{selectedService.service?.name || "Unknown Service"}</h3>
                            {getStatusBadge(selectedService.status)}
                          </div>
                          <p className="text-xs sm:text-sm text-muted/70 mt-0.5 sm:mt-1">Approve this service purchase to allow booking</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
                      <div className="p-2.5 sm:p-3 md:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary/5 to-primary/10 border-0">
                        <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3">
                          <div className="p-1 sm:p-1.5 md:p-2 rounded-lg bg-primary/20 border-0 flex-shrink-0">
                            <Package className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 text-primary" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[10px] sm:text-xs md:text-sm font-medium text-muted/70 whitespace-nowrap">Remaining</p>
                            <p className="text-lg sm:text-xl md:text-2xl font-bold text-text">{selectedService.sessions_remaining}</p>
                          </div>
                        </div>
                      </div>
                      <div className="p-2.5 sm:p-3 md:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-500/5 to-blue-500/10 border-0">
                        <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3">
                          <div className="p-1 sm:p-1.5 md:p-2 rounded-lg bg-blue-500/20 border-0 flex-shrink-0">
                            <Hash className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 text-blue-500" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[10px] sm:text-xs md:text-sm font-medium text-muted/70 whitespace-nowrap">Total</p>
                            <p className="text-lg sm:text-xl md:text-2xl font-bold text-text">{selectedService.sessions_total}</p>
                          </div>
                        </div>
                      </div>
                      <div className="p-2.5 sm:p-3 md:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-br from-green-500/5 to-green-500/10 border-0">
                        <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3">
                          <div className="p-1 sm:p-1.5 md:p-2 rounded-lg bg-green-500/20 border-0 flex-shrink-0">
                            <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 text-green-500" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[10px] sm:text-xs md:text-sm font-medium text-muted/70 whitespace-nowrap">Duration</p>
                            <p className="text-lg sm:text-xl md:text-2xl font-bold text-text whitespace-nowrap">{selectedService.service?.duration_minutes}m</p>
                          </div>
                        </div>
                      </div>
                      <div className="p-2.5 sm:p-3 md:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-br from-orange-500/5 to-orange-500/10 border-0">
                        <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3">
                          <div className="p-1 sm:p-1.5 md:p-2 rounded-lg bg-orange-500/20 border-0 flex-shrink-0">
                            <Banknote className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 text-orange-500" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[10px] sm:text-xs md:text-sm font-medium text-muted/70 whitespace-nowrap">Price</p>
                            <p className="text-lg sm:text-xl md:text-2xl font-bold text-text whitespace-nowrap">{selectedService.service?.price?.toFixed(0) || "0"} <span className="text-base sm:text-lg md:text-xl">RON</span></p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Service, Member & Purchase Information */}
              <div className="relative group bg-card/95 backdrop-blur-xl border border-surface/40 shadow-md transition-all duration-300 hover:shadow-lg hover:border-primary/40 overflow-hidden rounded-2xl sm:rounded-3xl">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/2 via-primary/1 to-secondary/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl sm:rounded-3xl"></div>
                
                <div className="relative p-4 sm:p-5 pb-2">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="p-1.5 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <Briefcase className="h-4 w-4 sm:h-5 sm:w-5 text-primary/60 group-hover:text-primary transition-colors" />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold text-text group-hover:text-primary transition-colors">Service Information</h3>
                      <p className="text-[10px] sm:text-xs text-muted/70 mt-0.5">Detailed service, member and purchase information</p>
                    </div>
                  </div>
                </div>
                
                <div className="relative p-4 sm:p-5 pt-2">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5 sm:gap-3">
                    
                    {/* Service & Member Combined */}
                    <div className="relative backdrop-blur-xl bg-gradient-to-br from-primary/5 via-primary/3 to-transparent rounded-xl border-0 p-2.5 shadow-md hover:shadow-lg transition-all duration-300">
                      <div className="flex items-center gap-2 mb-2 pb-2 border-b border-primary/10">
                        <div className="p-1.5 rounded-lg bg-primary/10 backdrop-blur-sm">
                          <Briefcase className="h-3.5 w-3.5 text-primary" />
                        </div>
                        <h3 className="text-[11px] font-bold text-text uppercase tracking-wider">Service & Member</h3>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 p-2 rounded-lg bg-gradient-to-br from-surface/60 to-surface/40 backdrop-blur-sm border-0 hover:from-surface/70 hover:to-surface/50 transition-all duration-200 group/card shadow-sm">
                          <div className="p-1.5 rounded-md bg-primary/15 group-hover/card:bg-primary/25 transition-colors backdrop-blur-sm">
                            <Package className="h-3.5 w-3.5 text-primary" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-[10px] font-medium text-primary/80 uppercase tracking-wide">Service</p>
                            <p className="text-xs text-text font-semibold truncate">{selectedService.service?.name}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 p-2 rounded-lg bg-gradient-to-br from-surface/60 to-surface/40 backdrop-blur-sm border-0 hover:from-surface/70 hover:to-surface/50 transition-all duration-200 group/card shadow-sm">
                          <div className="p-1.5 rounded-md bg-primary/15 group-hover/card:bg-primary/25 transition-colors backdrop-blur-sm">
                            <User className="h-3.5 w-3.5 text-primary" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-[10px] font-medium text-primary/80 uppercase tracking-wide">Member</p>
                            <p className="text-xs text-text font-semibold truncate">{selectedService.member?.full_name}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Purchase Details */}
                    <div className="relative backdrop-blur-xl bg-gradient-to-br from-primary/5 via-primary/3 to-transparent rounded-xl border-0 p-2.5 shadow-md hover:shadow-lg transition-all duration-300">
                      <div className="flex items-center gap-2 mb-2 pb-2 border-b border-primary/10">
                        <div className="p-1.5 rounded-lg bg-primary/10 backdrop-blur-sm">
                          <Calendar className="h-3.5 w-3.5 text-primary" />
                        </div>
                        <h3 className="text-[11px] font-bold text-text uppercase tracking-wider">Purchase Details</h3>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 p-2 rounded-lg bg-gradient-to-br from-surface/60 to-surface/40 backdrop-blur-sm border-0 hover:from-surface/70 hover:to-surface/50 transition-all duration-200 group/card shadow-sm">
                          <div className="p-1.5 rounded-md bg-primary/15 group-hover/card:bg-primary/25 transition-colors backdrop-blur-sm">
                            <Calendar className="h-3.5 w-3.5 text-primary" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-[10px] font-medium text-primary/80 uppercase tracking-wide">Purchase Date</p>
                            <p className="text-xs text-text font-semibold truncate">
                              {timeFormat === '12h'
                                ? format(new Date(selectedService.purchase_date), "PPp")
                                : format(new Date(selectedService.purchase_date), "PPp").replace(/\d{1,2}:\d{2}\s?[AP]M/i, format(new Date(selectedService.purchase_date), "HH:mm"))
                              }
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 p-2 rounded-lg bg-gradient-to-br from-surface/60 to-surface/40 backdrop-blur-sm border-0 hover:from-surface/70 hover:to-surface/50 transition-all duration-200 group/card shadow-sm">
                          <div className="p-1.5 rounded-md bg-primary/15 group-hover/card:bg-primary/25 transition-colors backdrop-blur-sm">
                            <Hash className="h-3.5 w-3.5 text-primary" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-[10px] font-medium text-primary/80 uppercase tracking-wide">Sessions</p>
                            <p className="text-xs text-text font-semibold">{selectedService.sessions_total} total</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                  </div>
                </div>
              </div>

              {/* Approval Notes Section */}
              <div className="relative group bg-card/95 backdrop-blur-xl border border-surface/40 shadow-md transition-all duration-300 hover:shadow-lg hover:border-primary/40 overflow-hidden rounded-2xl sm:rounded-3xl">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/2 via-primary/1 to-secondary/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl sm:rounded-3xl"></div>
                
                <div className="relative p-4 sm:p-5 pb-2">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="p-1.5 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <StickyNote className="h-4 w-4 sm:h-5 sm:w-5 text-primary/60 group-hover:text-primary transition-colors" />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold text-text group-hover:text-primary transition-colors">Approval Notes</h3>
                      <p className="text-[10px] sm:text-xs text-muted/70 mt-0.5">Add optional notes about this approval (optional)</p>
                    </div>
                  </div>
                </div>
                
                <div className="relative p-4 sm:p-5 pt-2">
                  <Textarea
                    id="approve-notes"
                    placeholder="Add any notes about the approval..."
                    value={approveNotes}
                    onChange={(e) => setApproveNotes(e.target.value)}
                    rows={3}
                    className="w-full rounded-xl border border-surface/50 bg-surface/30 px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-text placeholder:text-muted/50 focus:border-primary/50 focus:bg-surface/40 focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                  />
                </div>
              </div>
            </>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 pt-2 sm:pt-4">
            <button
              onClick={() => {
                setApproveModalOpen(false);
                setSelectedService(null);
                setApproveNotes("");
                setError(null);
              }}
              disabled={isPending}
              className="group/cancel relative h-9 sm:h-10 px-4 sm:px-6 flex items-center justify-center gap-1.5 sm:gap-2 bg-gradient-to-br from-slate-700/75 via-cyan-900/45 to-slate-700/75 hover:from-slate-600/85 hover:via-cyan-800/55 hover:to-slate-600/85 text-white font-medium text-xs sm:text-sm rounded-xl backdrop-blur-sm shadow-md shadow-black/20 hover:shadow-lg hover:shadow-cyan-950/25 transition-all duration-500 ease-out overflow-hidden border-0 !ring-0 !outline-none active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="relative z-10 flex items-center justify-center transition-all duration-500 ease-in-out group-hover/cancel:scale-125 group-hover/cancel:translate-x-[2em]">
                <XCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 transition-all duration-500 ease-in-out text-cyan-300/60 group-hover/cancel:text-cyan-100 group-hover/cancel:scale-110" />
              </div>
              <span className="transition-all duration-500 ease-in-out group-hover/cancel:opacity-0">
                Cancel
              </span>
            </button>
            
            <button
              onClick={handleApproveConfirm}
              disabled={isPending}
              className="group/approve relative h-9 sm:h-10 px-4 sm:px-6 flex items-center justify-center gap-1.5 sm:gap-2 bg-gradient-to-br from-green-700/75 via-green-900/45 to-green-700/75 hover:from-green-600/85 hover:via-green-800/55 hover:to-green-600/85 text-white font-medium text-xs sm:text-sm rounded-xl backdrop-blur-sm shadow-md shadow-green-900/30 hover:shadow-lg hover:shadow-green-950/40 transition-all duration-500 ease-out overflow-hidden border-0 !ring-0 !outline-none active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {!isPending && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/approve:translate-x-full transition-transform duration-1000 ease-in-out"></div>
              )}
              
              {isPending ? (
                <>
                  <div className="animate-spin rounded-full h-3.5 w-3.5 sm:h-4 sm:w-4 border-2 border-white border-t-transparent" />
                  <span>Approving...</span>
                </>
              ) : (
                <>
                  <div className="relative z-10 flex items-center justify-center transition-all duration-500 ease-in-out group-hover/approve:scale-125 group-hover/approve:translate-x-[4.5em]">
                    <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 transition-all duration-500 ease-in-out text-green-200/70 group-hover/approve:text-green-50 group-hover/approve:scale-110" />
                  </div>
                  <span className="transition-all duration-500 ease-in-out group-hover/approve:opacity-0">
                    Approve Service
                  </span>
                </>
              )}
            </button>
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
        className="max-w-[98vw] sm:max-w-6xl"
      >
        <div className="space-y-4 sm:space-y-6">
          {selectedService && (
            <>
              {error && (
                <div className="relative p-3 sm:p-4 rounded-xl bg-red-500/5 border border-red-500/20 backdrop-blur-sm">
                  <div className="flex items-start gap-2 sm:gap-3">
                    <div className="p-1.5 sm:p-2 rounded-lg bg-red-500/10">
                      <XCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-500" />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-semibold text-red-400 mb-0.5 sm:mb-1">Error</p>
                      <p className="text-xs text-red-300/80">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Header with Title and Badge */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 rounded-2xl sm:rounded-3xl blur-2xl"></div>
                <div className="relative bg-card/95 backdrop-blur-xl border border-surface/40 shadow-md transition-all duration-300 hover:shadow-lg hover:border-primary/40 overflow-hidden rounded-2xl sm:rounded-3xl">
                  {/* Card Hover Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/2 via-primary/1 to-secondary/2 opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-2xl sm:rounded-3xl"></div>
                  
                  {/* Enhanced Border Effect */}
                  <div className="absolute inset-0 rounded-2xl sm:rounded-3xl">
                    <div className="absolute inset-0 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-transparent via-primary/30 to-transparent" 
                         style={{ 
                           mask: 'linear-gradient(white, white) content-box, linear-gradient(white, white)',
                           WebkitMask: 'linear-gradient(white, white) content-box, linear-gradient(white, white)',
                           WebkitMaskComposite: 'xor',
                           maskComposite: 'exclude',
                           padding: '1px'
                         }}>
                    </div>
                  </div>
                  
                  <div className="relative p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
                      <div className="flex items-start sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
                        <div className="p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-primary/10 flex-shrink-0">
                          <Package className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-text truncate">{selectedService.service?.name || "Unknown Service"}</h3>
                            {getStatusBadge(selectedService.status)}
                          </div>
                          <p className="text-xs sm:text-sm text-muted/70 mt-0.5 sm:mt-1">Cancel this service purchase to prevent further bookings</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
                      <div className="p-2.5 sm:p-3 md:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary/5 to-primary/10 border-0">
                        <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3">
                          <div className="p-1 sm:p-1.5 md:p-2 rounded-lg bg-primary/20 border-0 flex-shrink-0">
                            <Package className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 text-primary" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[10px] sm:text-xs md:text-sm font-medium text-muted/70 whitespace-nowrap">Remaining</p>
                            <p className="text-lg sm:text-xl md:text-2xl font-bold text-text">{selectedService.sessions_remaining}</p>
                          </div>
                        </div>
                      </div>
                      <div className="p-2.5 sm:p-3 md:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-500/5 to-blue-500/10 border-0">
                        <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3">
                          <div className="p-1 sm:p-1.5 md:p-2 rounded-lg bg-blue-500/20 border-0 flex-shrink-0">
                            <Hash className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 text-blue-500" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[10px] sm:text-xs md:text-sm font-medium text-muted/70 whitespace-nowrap">Total</p>
                            <p className="text-lg sm:text-xl md:text-2xl font-bold text-text">{selectedService.sessions_total}</p>
                          </div>
                        </div>
                      </div>
                      <div className="p-2.5 sm:p-3 md:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-br from-green-500/5 to-green-500/10 border-0">
                        <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3">
                          <div className="p-1 sm:p-1.5 md:p-2 rounded-lg bg-green-500/20 border-0 flex-shrink-0">
                            <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 text-green-500" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[10px] sm:text-xs md:text-sm font-medium text-muted/70 whitespace-nowrap">Duration</p>
                            <p className="text-lg sm:text-xl md:text-2xl font-bold text-text whitespace-nowrap">{selectedService.service?.duration_minutes}m</p>
                          </div>
                        </div>
                      </div>
                      <div className="p-2.5 sm:p-3 md:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-br from-orange-500/5 to-orange-500/10 border-0">
                        <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3">
                          <div className="p-1 sm:p-1.5 md:p-2 rounded-lg bg-orange-500/20 border-0 flex-shrink-0">
                            <Banknote className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 text-orange-500" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[10px] sm:text-xs md:text-sm font-medium text-muted/70 whitespace-nowrap">Price</p>
                            <p className="text-lg sm:text-xl md:text-2xl font-bold text-text whitespace-nowrap">{selectedService.service?.price?.toFixed(0) || "0"} <span className="text-base sm:text-lg md:text-xl">RON</span></p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Service, Member & Purchase Information */}
              <div className="relative group bg-card/95 backdrop-blur-xl border border-surface/40 shadow-md transition-all duration-300 hover:shadow-lg hover:border-primary/40 overflow-hidden rounded-2xl sm:rounded-3xl">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/2 via-primary/1 to-secondary/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl sm:rounded-3xl"></div>
                
                <div className="relative p-4 sm:p-5 pb-2">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="p-1.5 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <Briefcase className="h-4 w-4 sm:h-5 sm:w-5 text-primary/60 group-hover:text-primary transition-colors" />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold text-text group-hover:text-primary transition-colors">Service Information</h3>
                      <p className="text-[10px] sm:text-xs text-muted/70 mt-0.5">Detailed service, member and purchase information</p>
                    </div>
                  </div>
                </div>
                
                <div className="relative p-4 sm:p-5 pt-2">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5 sm:gap-3">
                    
                    {/* Service & Member Combined */}
                    <div className="relative backdrop-blur-xl bg-gradient-to-br from-primary/5 via-primary/3 to-transparent rounded-xl border-0 p-2.5 shadow-md hover:shadow-lg transition-all duration-300">
                      <div className="flex items-center gap-2 mb-2 pb-2 border-b border-primary/10">
                        <div className="p-1.5 rounded-lg bg-primary/10 backdrop-blur-sm">
                          <Briefcase className="h-3.5 w-3.5 text-primary" />
                        </div>
                        <h3 className="text-[11px] font-bold text-text uppercase tracking-wider">Service & Member</h3>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 p-2 rounded-lg bg-gradient-to-br from-surface/60 to-surface/40 backdrop-blur-sm border-0 hover:from-surface/70 hover:to-surface/50 transition-all duration-200 group/card shadow-sm">
                          <div className="p-1.5 rounded-md bg-primary/15 group-hover/card:bg-primary/25 transition-colors backdrop-blur-sm">
                            <Package className="h-3.5 w-3.5 text-primary" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-[10px] font-medium text-primary/80 uppercase tracking-wide">Service</p>
                            <p className="text-xs text-text font-semibold truncate">{selectedService.service?.name}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 p-2 rounded-lg bg-gradient-to-br from-surface/60 to-surface/40 backdrop-blur-sm border-0 hover:from-surface/70 hover:to-surface/50 transition-all duration-200 group/card shadow-sm">
                          <div className="p-1.5 rounded-md bg-primary/15 group-hover/card:bg-primary/25 transition-colors backdrop-blur-sm">
                            <User className="h-3.5 w-3.5 text-primary" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-[10px] font-medium text-primary/80 uppercase tracking-wide">Member</p>
                            <p className="text-xs text-text font-semibold truncate">{selectedService.member?.full_name}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Purchase Details */}
                    <div className="relative backdrop-blur-xl bg-gradient-to-br from-primary/5 via-primary/3 to-transparent rounded-xl border-0 p-2.5 shadow-md hover:shadow-lg transition-all duration-300">
                      <div className="flex items-center gap-2 mb-2 pb-2 border-b border-primary/10">
                        <div className="p-1.5 rounded-lg bg-primary/10 backdrop-blur-sm">
                          <Calendar className="h-3.5 w-3.5 text-primary" />
                        </div>
                        <h3 className="text-[11px] font-bold text-text uppercase tracking-wider">Purchase Details</h3>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 p-2 rounded-lg bg-gradient-to-br from-surface/60 to-surface/40 backdrop-blur-sm border-0 hover:from-surface/70 hover:to-surface/50 transition-all duration-200 group/card shadow-sm">
                          <div className="p-1.5 rounded-md bg-primary/15 group-hover/card:bg-primary/25 transition-colors backdrop-blur-sm">
                            <Calendar className="h-3.5 w-3.5 text-primary" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-[10px] font-medium text-primary/80 uppercase tracking-wide">Purchase Date</p>
                            <p className="text-xs text-text font-semibold truncate">
                              {timeFormat === '12h'
                                ? format(new Date(selectedService.purchase_date), "PPp")
                                : format(new Date(selectedService.purchase_date), "PPp").replace(/\d{1,2}:\d{2}\s?[AP]M/i, format(new Date(selectedService.purchase_date), "HH:mm"))
                              }
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 p-2 rounded-lg bg-gradient-to-br from-surface/60 to-surface/40 backdrop-blur-sm border-0 hover:from-surface/70 hover:to-surface/50 transition-all duration-200 group/card shadow-sm">
                          <div className="p-1.5 rounded-md bg-primary/15 group-hover/card:bg-primary/25 transition-colors backdrop-blur-sm">
                            <Hash className="h-3.5 w-3.5 text-primary" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-[10px] font-medium text-primary/80 uppercase tracking-wide">Sessions</p>
                            <p className="text-xs text-text font-semibold">{selectedService.sessions_remaining}/{selectedService.sessions_total} remaining</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                  </div>
                </div>
              </div>

              {/* Warning Notice */}
              <div className="relative p-3 sm:p-4 rounded-xl bg-gradient-to-br from-yellow-500/5 to-amber-500/5 border border-yellow-500/20 backdrop-blur-sm">
                <div className="flex items-start gap-2 sm:gap-3">
                  <div className="p-1.5 sm:p-2 rounded-lg bg-yellow-500/10">
                    <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-semibold text-yellow-400 mb-1">⚠️ Important Notice</p>
                    <p className="text-xs text-yellow-300/80 leading-relaxed">
                      Cancelling this service will prevent the member from booking any remaining sessions. This action cannot be undone.
                    </p>
                  </div>
                </div>
              </div>

              {/* Cancellation Reason Section */}
              <div className="relative group bg-card/95 backdrop-blur-xl border border-surface/40 shadow-md transition-all duration-300 hover:shadow-lg hover:border-primary/40 overflow-hidden rounded-2xl sm:rounded-3xl">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/2 via-primary/1 to-secondary/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl sm:rounded-3xl"></div>
                
                <div className="relative p-4 sm:p-5 pb-2">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="p-1.5 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <StickyNote className="h-4 w-4 sm:h-5 sm:w-5 text-primary/60 group-hover:text-primary transition-colors" />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold text-text group-hover:text-primary transition-colors">Cancellation Reason</h3>
                      <p className="text-[10px] sm:text-xs text-muted/70 mt-0.5">Please provide a reason for cancelling (required)</p>
                    </div>
                  </div>
                </div>
                
                <div className="relative p-4 sm:p-5 pt-2">
                  <Textarea
                    id="cancel-reason"
                    placeholder="Please provide a reason for cancelling this service..."
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    rows={3}
                    required
                    className="w-full rounded-xl border border-surface/50 bg-surface/30 px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-text placeholder:text-muted/50 focus:border-primary/50 focus:bg-surface/40 focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                  />
                </div>
              </div>
            </>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 pt-2 sm:pt-4">
            <button
              onClick={() => {
                setCancelModalOpen(false);
                setSelectedService(null);
                setCancelReason("");
                setError(null);
              }}
              disabled={isPending}
              className="group/keep relative h-9 sm:h-10 px-4 sm:px-6 flex items-center justify-center gap-1.5 sm:gap-2 bg-gradient-to-br from-slate-700/75 via-cyan-900/45 to-slate-700/75 hover:from-slate-600/85 hover:via-cyan-800/55 hover:to-slate-600/85 text-white font-medium text-xs sm:text-sm rounded-xl backdrop-blur-sm shadow-md shadow-black/20 hover:shadow-lg hover:shadow-cyan-950/25 transition-all duration-500 ease-out overflow-hidden border-0 !ring-0 !outline-none active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="relative z-10 flex items-center justify-center transition-all duration-500 ease-in-out group-hover/keep:scale-125 group-hover/keep:translate-x-[3.5em]">
                <XCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 transition-all duration-500 ease-in-out text-cyan-300/60 group-hover/keep:text-cyan-100 group-hover/keep:scale-110" />
              </div>
              <span className="transition-all duration-500 ease-in-out group-hover/keep:opacity-0">
                Keep Service
              </span>
            </button>
            
            <button
              onClick={handleCancelConfirm}
              disabled={isPending || !cancelReason.trim()}
              className="group/cancelservice relative h-9 sm:h-10 px-4 sm:px-6 flex items-center justify-center gap-1.5 sm:gap-2 bg-gradient-to-br from-red-700/75 via-red-900/45 to-red-700/75 hover:from-red-600/85 hover:via-red-800/55 hover:to-red-600/85 text-white font-medium text-xs sm:text-sm rounded-xl backdrop-blur-sm shadow-md shadow-red-900/30 hover:shadow-lg hover:shadow-red-950/40 transition-all duration-500 ease-out overflow-hidden border-0 !ring-0 !outline-none active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {!isPending && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/cancelservice:translate-x-full transition-transform duration-1000 ease-in-out"></div>
              )}
              
              {isPending ? (
                <>
                  <div className="animate-spin rounded-full h-3.5 w-3.5 sm:h-4 sm:w-4 border-2 border-white border-t-transparent" />
                  <span>Cancelling...</span>
                </>
              ) : (
                <>
                  <div className="relative z-10 flex items-center justify-center transition-all duration-500 ease-in-out group-hover/cancelservice:scale-125 group-hover/cancelservice:translate-x-[4em]">
                    <XCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 transition-all duration-500 ease-in-out text-red-200/70 group-hover/cancelservice:text-red-50 group-hover/cancelservice:scale-110" />
                  </div>
                  <span className="transition-all duration-500 ease-in-out group-hover/cancelservice:opacity-0">
                    Cancel Service
                  </span>
                </>
              )}
            </button>
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
        className="max-w-[98vw] sm:max-w-6xl"
      >
        <div className="space-y-4 sm:space-y-6">
          {selectedService && (
            <>
              {/* Header with Status */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 rounded-2xl sm:rounded-3xl blur-2xl"></div>
                <div className="relative bg-card/95 backdrop-blur-xl border border-surface/40 shadow-md transition-all duration-300 hover:shadow-lg hover:border-primary/40 overflow-hidden rounded-2xl sm:rounded-3xl">
                  {/* Card Hover Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/2 via-primary/1 to-secondary/2 opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-2xl sm:rounded-3xl"></div>
                  
                  {/* Enhanced Border Effect */}
                  <div className="absolute inset-0 rounded-2xl sm:rounded-3xl">
                    <div className="absolute inset-0 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-transparent via-primary/30 to-transparent" 
                         style={{ 
                           mask: 'linear-gradient(white, white) content-box, linear-gradient(white, white)',
                           WebkitMask: 'linear-gradient(white, white) content-box, linear-gradient(white, white)',
                           WebkitMaskComposite: 'xor',
                           maskComposite: 'exclude',
                           padding: '1px'
                         }}>
                    </div>
                  </div>
                  
                  <div className="relative p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
                      <div className="flex items-start sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
                        <div className="p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-primary/10 flex-shrink-0">
                          <Package className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-text truncate">{selectedService.service?.name || "Unknown Service"}</h3>
                            {getStatusBadge(selectedService.status)}
                          </div>
                          <p className="text-xs sm:text-sm text-muted/70 mt-0.5 sm:mt-1">Service Purchase Details</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
                      <div className="p-2.5 sm:p-3 md:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary/5 to-primary/10 border-0">
                        <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3">
                          <div className="p-1 sm:p-1.5 md:p-2 rounded-lg bg-primary/20 border-0 flex-shrink-0">
                            <Package className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 text-primary" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[10px] sm:text-xs md:text-sm font-medium text-muted/70 whitespace-nowrap">Remaining</p>
                            <p className="text-lg sm:text-xl md:text-2xl font-bold text-text">{selectedService.sessions_remaining}</p>
                          </div>
                        </div>
                      </div>
                      <div className="p-2.5 sm:p-3 md:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-500/5 to-blue-500/10 border-0">
                        <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3">
                          <div className="p-1 sm:p-1.5 md:p-2 rounded-lg bg-blue-500/20 border-0 flex-shrink-0">
                            <Hash className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 text-blue-500" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[10px] sm:text-xs md:text-sm font-medium text-muted/70 whitespace-nowrap">Total</p>
                            <p className="text-lg sm:text-xl md:text-2xl font-bold text-text">{selectedService.sessions_total}</p>
                          </div>
                        </div>
                      </div>
                      <div className="p-2.5 sm:p-3 md:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-br from-green-500/5 to-green-500/10 border-0">
                        <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3">
                          <div className="p-1 sm:p-1.5 md:p-2 rounded-lg bg-green-500/20 border-0 flex-shrink-0">
                            <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 text-green-500" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[10px] sm:text-xs md:text-sm font-medium text-muted/70 whitespace-nowrap">Duration</p>
                            <p className="text-lg sm:text-xl md:text-2xl font-bold text-text whitespace-nowrap">{selectedService.service?.duration_minutes || 60}m</p>
                          </div>
                        </div>
                      </div>
                      <div className="p-2.5 sm:p-3 md:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-br from-orange-500/5 to-orange-500/10 border-0">
                        <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3">
                          <div className="p-1 sm:p-1.5 md:p-2 rounded-lg bg-orange-500/20 border-0 flex-shrink-0">
                            <Banknote className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 text-orange-500" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[10px] sm:text-xs md:text-sm font-medium text-muted/70 whitespace-nowrap">Price</p>
                            <p className="text-lg sm:text-xl md:text-2xl font-bold text-text whitespace-nowrap">{selectedService.service?.price?.toFixed(0) || "0"} <span className="text-base sm:text-lg md:text-xl">RON</span></p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Service, Member & Purchase Information - 3 Column Grid Layout */}
              <div className="relative group bg-card/95 backdrop-blur-xl border border-surface/40 shadow-md transition-all duration-300 hover:shadow-lg hover:border-primary/40 overflow-hidden rounded-2xl sm:rounded-3xl">
                {/* Card Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/2 via-primary/1 to-secondary/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl sm:rounded-3xl"></div>
                
                <div className="relative p-4 sm:p-5 pb-2">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="p-1.5 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <Briefcase className="h-4 w-4 sm:h-5 sm:w-5 text-primary/60 group-hover:text-primary transition-colors" />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold text-text group-hover:text-primary transition-colors">Service Information</h3>
                      <p className="text-[10px] sm:text-xs text-muted/70 mt-0.5">Detailed service, member and purchase information</p>
                    </div>
                  </div>
                </div>
                
                <div className="relative p-4 sm:p-5 pt-2">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-2.5 sm:gap-3">
                    
                    {/* Service Details Container */}
                    <div className="relative backdrop-blur-xl bg-gradient-to-br from-primary/5 via-primary/3 to-transparent rounded-xl border-0 p-2.5 shadow-md hover:shadow-lg transition-all duration-300">
                      {/* Header */}
                      <div className="flex items-center gap-2 mb-2 pb-2 border-b border-primary/10">
                        <div className="p-1.5 rounded-lg bg-primary/10 backdrop-blur-sm">
                          <Briefcase className="h-3.5 w-3.5 text-primary" />
                        </div>
                        <h3 className="text-[11px] font-bold text-text uppercase tracking-wider">Service Details</h3>
                      </div>
                      
                      {/* Cards */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 p-2 rounded-lg bg-gradient-to-br from-surface/60 to-surface/40 backdrop-blur-sm border-0 hover:from-surface/70 hover:to-surface/50 transition-all duration-200 group/card shadow-sm">
                          <div className="p-1.5 rounded-md bg-primary/15 group-hover/card:bg-primary/25 transition-colors backdrop-blur-sm">
                            <Package className="h-3.5 w-3.5 text-primary" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-[10px] font-medium text-primary/80 uppercase tracking-wide">Service Name</p>
                            <p className="text-xs text-text font-semibold truncate">{selectedService.service?.name || "Unknown Service"}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 p-2 rounded-lg bg-gradient-to-br from-surface/60 to-surface/40 backdrop-blur-sm border-0 hover:from-surface/70 hover:to-surface/50 transition-all duration-200 group/card shadow-sm">
                          <div className="p-1.5 rounded-md bg-primary/15 group-hover/card:bg-primary/25 transition-colors backdrop-blur-sm">
                            <Clock className="h-3.5 w-3.5 text-primary" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-[10px] font-medium text-primary/80 uppercase tracking-wide">Duration</p>
                            <p className="text-xs text-text font-semibold truncate">{selectedService.service?.duration_minutes || 60} minutes</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 p-2 rounded-lg bg-gradient-to-br from-surface/60 to-surface/40 backdrop-blur-sm border-0 hover:from-surface/70 hover:to-surface/50 transition-all duration-200 group/card shadow-sm">
                          <div className="p-1.5 rounded-md bg-primary/15 group-hover/card:bg-primary/25 transition-colors backdrop-blur-sm">
                            <Briefcase className="h-3.5 w-3.5 text-primary" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-[10px] font-medium text-primary/80 uppercase tracking-wide">Service Type</p>
                            <p className="text-xs text-text font-semibold truncate capitalize">{selectedService.service?.session_type || "Standard"}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 p-2 rounded-lg bg-gradient-to-br from-surface/60 to-surface/40 backdrop-blur-sm border-0 hover:from-surface/70 hover:to-surface/50 transition-all duration-200 group/card shadow-sm">
                          <div className="p-1.5 rounded-md bg-primary/15 group-hover/card:bg-primary/25 transition-colors backdrop-blur-sm">
                            <Banknote className="h-3.5 w-3.5 text-primary" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-[10px] font-medium text-primary/80 uppercase tracking-wide">Price</p>
                            <p className="text-xs text-text font-semibold truncate">{selectedService.service?.price?.toFixed(2) || "0.00"} RON</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Member Details Container */}
                    <div className="relative backdrop-blur-xl bg-gradient-to-br from-primary/5 via-primary/3 to-transparent rounded-xl border-0 p-2.5 shadow-md hover:shadow-lg transition-all duration-300">
                      {/* Header */}
                      <div className="flex items-center gap-2 mb-2 pb-2 border-b border-primary/10">
                        <div className="p-1.5 rounded-lg bg-primary/10 backdrop-blur-sm">
                          <User className="h-3.5 w-3.5 text-primary" />
                        </div>
                        <h3 className="text-[11px] font-bold text-text uppercase tracking-wider">Member Details</h3>
                      </div>
                      
                      {/* Cards */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 p-2 rounded-lg bg-gradient-to-br from-surface/60 to-surface/40 backdrop-blur-sm border-0 hover:from-surface/70 hover:to-surface/50 transition-all duration-200 group/card shadow-sm">
                          <div className="p-1.5 rounded-md bg-primary/15 group-hover/card:bg-primary/25 transition-colors backdrop-blur-sm">
                            <User className="h-3.5 w-3.5 text-primary" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-[10px] font-medium text-primary/80 uppercase tracking-wide">Full Name</p>
                            <p className="text-xs text-text font-semibold truncate">{selectedService.member?.full_name || "Unknown Member"}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 p-2 rounded-lg bg-gradient-to-br from-surface/60 to-surface/40 backdrop-blur-sm border-0 hover:from-surface/70 hover:to-surface/50 transition-all duration-200 group/card shadow-sm">
                          <div className="p-1.5 rounded-md bg-primary/15 group-hover/card:bg-primary/25 transition-colors backdrop-blur-sm">
                            <User className="h-3.5 w-3.5 text-primary" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-[10px] font-medium text-primary/80 uppercase tracking-wide">Phone</p>
                            <p className="text-xs text-text font-semibold truncate">{selectedService.member?.phone || "-"}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 p-2 rounded-lg bg-gradient-to-br from-surface/60 to-surface/40 backdrop-blur-sm border-0 hover:from-surface/70 hover:to-surface/50 transition-all duration-200 group/card shadow-sm">
                          <div className="p-1.5 rounded-md bg-primary/15 group-hover/card:bg-primary/25 transition-colors backdrop-blur-sm">
                            <User className="h-3.5 w-3.5 text-primary" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-[10px] font-medium text-primary/80 uppercase tracking-wide">Email</p>
                            <p className="text-xs text-text font-semibold truncate">{selectedService.member?.email || "-"}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 p-2 rounded-lg bg-gradient-to-br from-surface/60 to-surface/40 backdrop-blur-sm border-0 hover:from-surface/70 hover:to-surface/50 transition-all duration-200 group/card shadow-sm">
                          <div className="p-1.5 rounded-md bg-primary/15 group-hover/card:bg-primary/25 transition-colors backdrop-blur-sm">
                            <CheckCircle className="h-3.5 w-3.5 text-primary" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-[10px] font-medium text-primary/80 uppercase tracking-wide">Status</p>
                            <p className="text-xs text-text font-semibold truncate capitalize">{selectedService.member?.status || "-"}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Purchase Details Container */}
                    <div className="relative backdrop-blur-xl bg-gradient-to-br from-primary/5 via-primary/3 to-transparent rounded-xl border-0 p-2.5 shadow-md hover:shadow-lg transition-all duration-300">
                      {/* Header */}
                      <div className="flex items-center gap-2 mb-2 pb-2 border-b border-primary/10">
                        <div className="p-1.5 rounded-lg bg-primary/10 backdrop-blur-sm">
                          <Calendar className="h-3.5 w-3.5 text-primary" />
                        </div>
                        <h3 className="text-[11px] font-bold text-text uppercase tracking-wider">Purchase Details</h3>
                      </div>
                      
                      {/* Cards */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 p-2 rounded-lg bg-gradient-to-br from-surface/60 to-surface/40 backdrop-blur-sm border-0 hover:from-surface/70 hover:to-surface/50 transition-all duration-200 group/card shadow-sm">
                          <div className="p-1.5 rounded-md bg-primary/15 group-hover/card:bg-primary/25 transition-colors backdrop-blur-sm">
                            <Calendar className="h-3.5 w-3.5 text-primary" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-[10px] font-medium text-primary/80 uppercase tracking-wide">Purchase Date</p>
                            <p className="text-xs text-text font-semibold truncate">
                              {timeFormat === '12h'
                                ? format(new Date(selectedService.purchase_date), "PPp")
                                : format(new Date(selectedService.purchase_date), "PPp").replace(/\d{1,2}:\d{2}\s?[AP]M/i, format(new Date(selectedService.purchase_date), "HH:mm"))
                              }
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 p-2 rounded-lg bg-gradient-to-br from-surface/60 to-surface/40 backdrop-blur-sm border-0 hover:from-surface/70 hover:to-surface/50 transition-all duration-200 group/card shadow-sm">
                          <div className="p-1.5 rounded-md bg-primary/15 group-hover/card:bg-primary/25 transition-colors backdrop-blur-sm">
                            <Hash className="h-3.5 w-3.5 text-primary" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-[10px] font-medium text-primary/80 uppercase tracking-wide">Total Sessions</p>
                            <p className="text-xs text-text font-semibold truncate">{selectedService.sessions_total}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 p-2 rounded-lg bg-gradient-to-br from-surface/60 to-surface/40 backdrop-blur-sm border-0 hover:from-surface/70 hover:to-surface/50 transition-all duration-200 group/card shadow-sm">
                          <div className="p-1.5 rounded-md bg-primary/15 group-hover/card:bg-primary/25 transition-colors backdrop-blur-sm">
                            <CheckCircle className="h-3.5 w-3.5 text-primary" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-[10px] font-medium text-primary/80 uppercase tracking-wide">Status</p>
                            <div className="mt-0.5">{getStatusBadge(selectedService.status, true)}</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 p-2 rounded-lg bg-gradient-to-br from-surface/60 to-surface/40 backdrop-blur-sm border-0 hover:from-surface/70 hover:to-surface/50 transition-all duration-200 group/card shadow-sm">
                          <div className="p-1.5 rounded-md bg-primary/15 group-hover/card:bg-primary/25 transition-colors backdrop-blur-sm">
                            <Package className="h-3.5 w-3.5 text-primary" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-[10px] font-medium text-primary/80 uppercase tracking-wide">Remaining</p>
                            <p className="text-xs text-text font-semibold truncate">{selectedService.sessions_remaining}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                  </div>
                </div>
              </div>

              {/* Additional Purchase Details (Approved/Cancelled Dates) */}
              {(selectedService.approved_date || selectedService.cancelled_date) && (
                <div className="relative group bg-card/95 backdrop-blur-xl border border-surface/40 shadow-md transition-all duration-300 hover:shadow-lg hover:border-primary/40 overflow-hidden rounded-2xl sm:rounded-3xl">
                  {/* Card Hover Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/2 via-primary/1 to-secondary/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl sm:rounded-3xl"></div>
                  
                  <div className="relative p-4 sm:p-5 pb-2">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="p-1.5 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                        <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-primary/60 group-hover:text-primary transition-colors" />
                      </div>
                      <div>
                        <h3 className="text-base sm:text-lg font-semibold text-text group-hover:text-primary transition-colors">Additional Details</h3>
                        <p className="text-[10px] sm:text-xs text-muted/70 mt-0.5">Approval and cancellation information</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="relative p-4 sm:p-5 pt-2">
                    <div className="space-y-2.5 sm:space-y-3">
                          {selectedService.approved_date && (
                            <div className="flex items-center gap-2 p-2 sm:p-3 rounded-lg sm:rounded-xl bg-gradient-to-br from-green-500/10 to-green-500/5 backdrop-blur-sm border-0 shadow-sm">
                              <div className="p-1.5 rounded-md bg-green-500/20 backdrop-blur-sm">
                                <CheckCircle className="h-3.5 w-3.5 text-green-600" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-[10px] font-medium text-green-600 uppercase tracking-wide">Approved Date</p>
                                <p className="text-xs text-text font-semibold truncate">
                                  {timeFormat === '12h'
                                    ? format(new Date(selectedService.approved_date), "PPp")
                                    : format(new Date(selectedService.approved_date), "PPp").replace(/\d{1,2}:\d{2}\s?[AP]M/i, format(new Date(selectedService.approved_date), "HH:mm"))
                                  }
                                </p>
                              </div>
                            </div>
                          )}
                          {selectedService.cancelled_date && (
                            <div className="flex items-center gap-2 p-2 sm:p-3 rounded-lg sm:rounded-xl bg-gradient-to-br from-red-500/10 to-red-500/5 backdrop-blur-sm border-0 shadow-sm">
                              <div className="p-1.5 rounded-md bg-red-500/20 backdrop-blur-sm">
                                <XCircle className="h-3.5 w-3.5 text-red-600" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-[10px] font-medium text-red-600 uppercase tracking-wide">Cancelled Date</p>
                                <p className="text-xs text-text font-semibold truncate">
                                  {timeFormat === '12h'
                                    ? format(new Date(selectedService.cancelled_date), "PPp")
                                    : format(new Date(selectedService.cancelled_date), "PPp").replace(/\d{1,2}:\d{2}\s?[AP]M/i, format(new Date(selectedService.cancelled_date), "HH:mm"))
                                  }
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                  </div>
                </div>
              )}

              {/* Notes */}
              {selectedService.notes && (
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 rounded-2xl sm:rounded-3xl blur-2xl"></div>
                  <div className="relative group bg-card/95 backdrop-blur-xl border border-surface/40 shadow-md transition-all duration-300 hover:shadow-lg hover:border-primary/40 overflow-hidden rounded-2xl sm:rounded-3xl">
                    {/* Card Hover Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/2 via-primary/1 to-secondary/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl sm:rounded-3xl"></div>
                    
                    <div className="relative p-4 sm:p-5 pb-2">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="p-1.5 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                          <StickyNote className="h-4 w-4 sm:h-5 sm:w-5 text-primary/60 group-hover:text-primary transition-colors" />
                        </div>
                        <div>
                          <h3 className="text-base sm:text-lg font-semibold text-text group-hover:text-primary transition-colors">Notes</h3>
                          <p className="text-[10px] sm:text-xs text-muted/70 mt-0.5">Additional purchase information</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="relative p-4 sm:p-5 pt-2">
                      <div className="p-3 sm:p-4 rounded-lg sm:rounded-xl bg-gradient-to-br from-surface/60 to-surface/40 backdrop-blur-sm border-0 shadow-sm">
                        <p className="text-xs sm:text-sm text-text whitespace-pre-wrap leading-relaxed">
                          {selectedService.notes}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons based on status */}
              <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-4">
                {/* Close Button - Like Back Button */}
                <button
                  onClick={() => {
                    setViewModalOpen(false);
                    setSelectedService(null);
                    setError(null);
                  }}
                  className="group/close relative h-9 sm:h-10 px-4 sm:px-6 flex items-center justify-center gap-1.5 sm:gap-2 bg-gradient-to-br from-slate-700/75 via-cyan-900/45 to-slate-700/75 hover:from-slate-600/85 hover:via-cyan-800/55 hover:to-slate-600/85 text-white font-medium text-xs sm:text-sm rounded-xl backdrop-blur-sm shadow-md shadow-black/20 hover:shadow-lg hover:shadow-cyan-950/25 transition-all duration-500 ease-out overflow-hidden border-0 !ring-0 !outline-none active:scale-95"
                >
                  {/* Icon with animation */}
                  <div className="relative z-10 flex items-center justify-center transition-all duration-500 ease-in-out group-hover/close:scale-125 group-hover/close:translate-x-[1.7em]">
                    <XCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 transition-all duration-500 ease-in-out text-cyan-300/60 group-hover/close:text-cyan-100 group-hover/close:scale-110" />
                  </div>
                  
                  {/* Text */}
                  <span className="transition-all duration-500 ease-in-out group-hover/close:opacity-0">
                    Close
                  </span>
                </button>
                
                {selectedService.status === "pending" && (
                  <>
                    {/* Approve Button - Green with Icon Animation */}
                    <button
                      onClick={() => {
                        setViewModalOpen(false);
                        handleApproveClick(selectedService);
                      }}
                      className="group/approve relative h-9 sm:h-10 px-4 sm:px-6 flex items-center justify-center gap-1.5 sm:gap-2 bg-gradient-to-br from-green-700/75 via-green-900/45 to-green-700/75 hover:from-green-600/85 hover:via-green-800/55 hover:to-green-600/85 text-white font-medium text-xs sm:text-sm rounded-xl backdrop-blur-sm shadow-md shadow-green-900/30 hover:shadow-lg hover:shadow-green-950/40 transition-all duration-500 ease-out overflow-hidden border-0 !ring-0 !outline-none active:scale-95"
                    >
                      {/* Shine Effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/approve:translate-x-full transition-transform duration-1000 ease-in-out"></div>
                      
                      {/* Icon with animation */}
                      <div className="relative z-10 flex items-center justify-center transition-all duration-500 ease-in-out group-hover/approve:scale-125 group-hover/approve:translate-x-[2.5em]">
                        <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 transition-all duration-500 ease-in-out text-green-200/70 group-hover/approve:text-green-50 group-hover/approve:scale-110" />
                      </div>
                      
                      {/* Text */}
                      <span className="transition-all duration-500 ease-in-out group-hover/approve:opacity-0">
                        Approve
                      </span>
                    </button>
                    
                    {/* Cancel Button - Red Style (Like Delete Member) */}
                    <button
                      onClick={() => {
                        setViewModalOpen(false);
                        handleCancelClick(selectedService);
                      }}
                      className="group/cancel relative h-9 sm:h-10 px-4 sm:px-6 flex items-center justify-center gap-1.5 sm:gap-2 bg-gradient-to-br from-red-700/75 via-red-900/45 to-red-700/75 hover:from-red-600/85 hover:via-red-800/55 hover:to-red-600/85 text-white font-medium text-xs sm:text-sm rounded-xl backdrop-blur-sm shadow-md shadow-red-900/30 hover:shadow-lg hover:shadow-red-950/40 transition-all duration-500 ease-out overflow-hidden border-0 !ring-0 !outline-none active:scale-95"
                    >
                      {/* Shine Effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/cancel:translate-x-full transition-transform duration-1000 ease-in-out"></div>
                      
                      {/* Icon with animation */}
                      <div className="relative z-10 flex items-center justify-center transition-all duration-500 ease-in-out group-hover/cancel:scale-125 group-hover/cancel:translate-x-[2.2em]">
                        <XCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 transition-all duration-500 ease-in-out text-red-200/70 group-hover/cancel:text-red-50 group-hover/cancel:scale-110" />
                      </div>
                      
                      {/* Text */}
                      <span className="transition-all duration-500 ease-in-out group-hover/cancel:opacity-0">
                        Cancel
                      </span>
                    </button>
                  </>
                )}
                
                {selectedService.status === "approved" && (
                  <button
                    onClick={() => {
                      setViewModalOpen(false);
                      handleCancelClick(selectedService);
                    }}
                    className="group/cancel relative h-9 sm:h-10 px-4 sm:px-6 flex items-center justify-center gap-1.5 sm:gap-2 bg-gradient-to-br from-red-700/75 via-red-900/45 to-red-700/75 hover:from-red-600/85 hover:via-red-800/55 hover:to-red-600/85 text-white font-medium text-xs sm:text-sm rounded-xl backdrop-blur-sm shadow-md shadow-red-900/30 hover:shadow-lg hover:shadow-red-950/40 transition-all duration-500 ease-out overflow-hidden border-0 !ring-0 !outline-none active:scale-95"
                  >
                    {/* Shine Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/cancel:translate-x-full transition-transform duration-1000 ease-in-out"></div>
                    
                    {/* Icon with animation */}
                    <div className="relative z-10 flex items-center justify-center transition-all duration-500 ease-in-out group-hover/cancel:scale-125 group-hover/cancel:translate-x-[3.5em]">
                      <XCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 transition-all duration-500 ease-in-out text-red-200/70 group-hover/cancel:text-red-50 group-hover/cancel:scale-110" />
                    </div>
                    
                    {/* Text */}
                    <span className="transition-all duration-500 ease-in-out group-hover/cancel:opacity-0">
                      Cancel Service
                    </span>
                  </button>
                )}
                
                {selectedService.status === "cancelled" && (
                  <button
                    onClick={() => {
                      setViewModalOpen(false);
                      handleDeleteClick(selectedService);
                    }}
                    className="group/delete relative h-9 sm:h-10 px-4 sm:px-6 flex items-center justify-center gap-1.5 sm:gap-2 bg-gradient-to-br from-red-700/75 via-red-900/45 to-red-700/75 hover:from-red-600/85 hover:via-red-800/55 hover:to-red-600/85 text-white font-medium text-xs sm:text-sm rounded-xl backdrop-blur-sm shadow-md shadow-red-900/30 hover:shadow-lg hover:shadow-red-950/40 transition-all duration-500 ease-out overflow-hidden border-0 !ring-0 !outline-none active:scale-95"
                  >
                    {/* Shine Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/delete:translate-x-full transition-transform duration-1000 ease-in-out"></div>
                    
                    {/* Icon with animation */}
                    <div className="relative z-10 flex items-center justify-center transition-all duration-500 ease-in-out group-hover/delete:scale-125 group-hover/delete:translate-x-[2.5em]">
                      <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 transition-all duration-500 ease-in-out text-red-200/70 group-hover/delete:text-red-50 group-hover/delete:scale-110" />
                    </div>
                    
                    {/* Text */}
                    <span className="transition-all duration-500 ease-in-out group-hover/delete:opacity-0">
                      Delete
                    </span>
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </Modal>
    </>
  );
}
