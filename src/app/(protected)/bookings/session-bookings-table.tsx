"use client";

import { useState, useTransition } from "react";
import { DataTable } from "@/components/data-table/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { ServiceBooking } from "@/types";
import { confirmSessionBookingAction, completeSessionBookingAction, cancelSessionBookingAction, deleteSessionBookingAction } from "@/app/(protected)/actions";
import { Calendar, User, Clock, CheckCircle, XCircle, Trash2, Eye, Edit, X, Package } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";

interface SessionBookingsTableProps {
  bookings: ServiceBooking[];
}

export function SessionBookingsTable({ bookings }: SessionBookingsTableProps) {
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<ServiceBooking | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleConfirmClick = (booking: ServiceBooking) => {
    setSelectedBooking(booking);
    setConfirmModalOpen(true);
    setError(null);
  };

  const handleCompleteClick = (booking: ServiceBooking) => {
    setSelectedBooking(booking);
    setCompleteModalOpen(true);
    setError(null);
  };

  const handleCancelClick = (booking: ServiceBooking) => {
    setSelectedBooking(booking);
    setCancelModalOpen(true);
    setError(null);
  };

  const handleDeleteClick = (booking: ServiceBooking) => {
    setSelectedBooking(booking);
    setDeleteModalOpen(true);
    setError(null);
  };

  const handleConfirm = async () => {
    if (!selectedBooking) return;

    startTransition(async () => {
      const formData = new FormData();
      formData.append("id", selectedBooking.id);
      formData.append("notes", "");

      try {
        const result = await confirmSessionBookingAction(formData);
        
        if (result.success) {
          setConfirmModalOpen(false);
          setSelectedBooking(null);
        } else {
          setError(result.error);
        }
      } catch {
        setError("An unexpected error occurred");
      }
    });
  };

  const handleComplete = async () => {
    if (!selectedBooking) return;

    startTransition(async () => {
      const formData = new FormData();
      formData.append("id", selectedBooking.id);
      formData.append("notes", "");

      try {
        const result = await completeSessionBookingAction(formData);
        
        if (result.success) {
          setCompleteModalOpen(false);
          setSelectedBooking(null);
        } else {
          setError(result.error);
        }
      } catch {
        setError("An unexpected error occurred");
      }
    });
  };

  const handleCancel = async () => {
    if (!selectedBooking) return;

    startTransition(async () => {
      const formData = new FormData();
      formData.append("id", selectedBooking.id);
      formData.append("reason", "Cancelled by staff");

      try {
        const result = await cancelSessionBookingAction(formData);
        
        if (result.success) {
          setCancelModalOpen(false);
          setSelectedBooking(null);
        } else {
          setError(result.error);
        }
      } catch {
        setError("An unexpected error occurred");
      }
    });
  };

  const handleDelete = async () => {
    if (!selectedBooking) return;

    startTransition(async () => {
      setError(null);
      
      const formData = new FormData();
      formData.append("id", selectedBooking.id);

      try {
        const result = await deleteSessionBookingAction(formData);

        if (result.success) {
          setDeleteModalOpen(false);
          setSelectedBooking(null);
          // The page will automatically refresh due to revalidatePath in the action
        } else {
          setError(result.error || "Failed to delete session booking");
        }
      } catch (error) {
        console.error("Delete error:", error);
        setError("An unexpected error occurred");
      }
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-500 text-white">Pending</Badge>;
      case "confirmed":
        return <Badge className="bg-blue-500 text-white">Confirmed</Badge>;
      case "upcoming":
        return <Badge className="bg-indigo-500 text-white">Upcoming</Badge>;
      case "completed":
        return <Badge className="bg-green-500 text-white">Completed</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const columns = [
    {
      accessorKey: "booking_date",
      header: ({ column }) => (
        <div className="text-center font-semibold">Date & Time</div>
      ),
      cell: ({ row }: { row: { original: ServiceBooking } }) => {
        const booking = row.original;
        return (
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <div className="font-medium whitespace-nowrap">
                {format(new Date(booking.booking_date), "MMM dd, yyyy")}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {format(new Date(booking.booking_date), "h:mm a")}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      id: "service",
      header: ({ column }) => (
        <div className="text-center font-semibold">Service</div>
      ),
      accessorFn: (row: ServiceBooking) => row.service?.name || "Unknown Service",
      cell: ({ row }: { row: { original: ServiceBooking } }) => {
        const booking = row.original;
        return (
          <div className="max-w-[180px]">
            <div className="font-medium line-clamp-2 leading-tight">
              {booking.service?.name || "Unknown Service"}
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
              <Clock className="h-3 w-3" />
              {booking.service?.duration_minutes || 60} min
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "member",
      header: ({ column }) => (
        <div className="text-center font-semibold">Member</div>
      ),
      cell: ({ row }: { row: { original: ServiceBooking } }) => {
        const booking = row.original;
        return (
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <div className="min-w-0 max-w-[160px]">
              <div className="font-medium line-clamp-1">{booking.member?.full_name || "Unknown Member"}</div>
              {booking.member?.email && (
                <div className="text-sm text-muted-foreground truncate">{booking.member.email}</div>
              )}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <div className="text-center font-semibold">Status</div>
      ),
      cell: ({ row }: { row: { original: ServiceBooking } }) => getStatusBadge(row.original.status),
    },
    {
      id: "actions",
      header: ({ column }) => (
        <div className="text-center font-semibold">Actions</div>
      ),
      cell: ({ row }: { row: { original: ServiceBooking } }) => {
        const booking = row.original;
        return (
          <div className="flex items-center gap-1">
            <Link href={`/bookings/${booking.id}`}>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary transition-all duration-200 rounded-lg"
                title="View booking"
              >
                <Eye className="h-4 w-4" />
              </Button>
            </Link>
            {(booking.status === "pending" || booking.status === "confirmed" || booking.status === "upcoming") && (
              <Link href={`/bookings/${booking.id}/edit`}>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0 hover:bg-blue-500/10 hover:text-blue-600 transition-all duration-200 rounded-lg"
                  title="Edit booking"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </Link>
            )}
            {booking.status === "pending" && (
              <>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0 hover:bg-green-500/10 hover:text-green-600 transition-all duration-200 rounded-lg"
                  onClick={() => handleConfirmClick(booking)}
                  title="Confirm booking"
                >
                  <CheckCircle className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0 hover:bg-red-500/10 hover:text-red-600 transition-all duration-200 rounded-lg"
                  onClick={() => handleCancelClick(booking)}
                  title="Cancel booking"
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              </>
            )}
            {(booking.status === "confirmed" || booking.status === "upcoming") && (
              <>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0 hover:bg-green-500/10 hover:text-green-600 transition-all duration-200 rounded-lg"
                  onClick={() => handleCompleteClick(booking)}
                  title="Complete booking"
                >
                  <CheckCircle className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0 hover:bg-red-500/10 hover:text-red-600 transition-all duration-200 rounded-lg"
                  onClick={() => handleCancelClick(booking)}
                  title="Cancel booking"
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              </>
            )}
            {booking.status === "cancelled" && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-red-500/10 hover:text-red-600 transition-all duration-200 rounded-lg"
                onClick={() => handleDeleteClick(booking)}
                title="Delete cancelled booking"
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
        data={bookings}
        filterKey="service"
      />

      {/* Confirm Modal */}
      <Modal
        isOpen={confirmModalOpen}
        onClose={() => {
          setConfirmModalOpen(false);
          setSelectedBooking(null);
          setError(null);
        }}
        title="Confirm Booking"
        className="max-w-2xl"
      >
        <div className="relative">
          {/* Background Glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-green-500/10 rounded-3xl blur-2xl"></div>
          
          <div className="relative space-y-6">
            {/* Header Section */}
            <div className="text-center space-y-2">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-500/20 to-green-600/30 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-green-500/20">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-text">Confirm Session Booking</h3>
              <p className="text-sm text-muted-foreground">
                This will confirm the booking and notify the member
              </p>
            </div>

            {/* Error Display */}
            {error && (
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-red-600/10 rounded-2xl blur-xl"></div>
                <div className="relative bg-red-500/10 backdrop-blur-sm border border-red-500/20 rounded-2xl p-4">
                  <div className="flex items-center gap-3">
                    <XCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                    <p className="text-sm text-red-600 font-medium">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Booking Details */}
            {selectedBooking && (
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-green-600/10 rounded-2xl blur-xl"></div>
                <div className="relative bg-green-500/5 backdrop-blur-sm border border-green-500/20 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Calendar className="h-5 w-5 text-green-600" />
                    <h4 className="font-semibold text-text">Booking Details</h4>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-green-500/5 to-transparent border border-green-500/10">
                      <Package className="h-4 w-4 text-green-600" />
                      <div>
                        <p className="text-xs font-medium text-green-600 uppercase tracking-wider">Service</p>
                        <p className="text-sm font-semibold text-text">{selectedBooking.service?.name}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-green-500/5 to-transparent border border-green-500/10">
                      <User className="h-4 w-4 text-green-600" />
                      <div>
                        <p className="text-xs font-medium text-green-600 uppercase tracking-wider">Member</p>
                        <p className="text-sm font-semibold text-text">{selectedBooking.member?.full_name}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-green-500/5 to-transparent border border-green-500/10">
                      <Clock className="h-4 w-4 text-green-600" />
                      <div>
                        <p className="text-xs font-medium text-green-600 uppercase tracking-wider">Date & Time</p>
                        <p className="text-sm font-semibold text-text">{format(new Date(selectedBooking.booking_date), "PPp")}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-4 pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  setConfirmModalOpen(false);
                  setSelectedBooking(null);
                  setError(null);
                }}
                disabled={isPending}
                className="gap-2 hover:bg-secondary/10 hover:text-secondary hover:border-secondary/50 transition-all duration-200 rounded-xl"
              >
                <X className="h-4 w-4" />
                Cancel
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={isPending}
                className="gap-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg shadow-green-500/25 hover:shadow-xl hover:shadow-green-500/40 transition-all duration-200 rounded-xl min-w-[140px]"
              >
                {isPending ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Confirming...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    Confirm Booking
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Complete Modal */}
      <Modal
        isOpen={completeModalOpen}
        onClose={() => {
          setCompleteModalOpen(false);
          setSelectedBooking(null);
          setError(null);
        }}
        title="Complete Booking"
        className="max-w-2xl"
      >
        <div className="relative">
          {/* Background Glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-emerald-500/10 rounded-3xl blur-2xl"></div>
          
          <div className="relative space-y-6">
            {/* Header Section */}
            <div className="text-center space-y-2">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-emerald-500/20 to-emerald-600/30 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-emerald-500/20">
                <CheckCircle className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold text-text">Complete Session Booking</h3>
              <p className="text-sm text-muted-foreground">
                Mark this session as completed and update the member&apos;s remaining sessions
              </p>
            </div>

            {/* Error Display */}
            {error && (
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-red-600/10 rounded-2xl blur-xl"></div>
                <div className="relative bg-red-500/10 backdrop-blur-sm border border-red-500/20 rounded-2xl p-4">
                  <div className="flex items-center gap-3">
                    <XCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                    <p className="text-sm text-red-600 font-medium">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Booking Details */}
            {selectedBooking && (
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-emerald-600/10 rounded-2xl blur-xl"></div>
                <div className="relative bg-emerald-500/5 backdrop-blur-sm border border-emerald-500/20 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Calendar className="h-5 w-5 text-emerald-600" />
                    <h4 className="font-semibold text-text">Session Details</h4>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-emerald-500/5 to-transparent border border-emerald-500/10">
                      <Package className="h-4 w-4 text-emerald-600" />
                      <div>
                        <p className="text-xs font-medium text-emerald-600 uppercase tracking-wider">Service</p>
                        <p className="text-sm font-semibold text-text">{selectedBooking.service?.name}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-emerald-500/5 to-transparent border border-emerald-500/10">
                      <User className="h-4 w-4 text-emerald-600" />
                      <div>
                        <p className="text-xs font-medium text-emerald-600 uppercase tracking-wider">Member</p>
                        <p className="text-sm font-semibold text-text">{selectedBooking.member?.full_name}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-emerald-500/5 to-transparent border border-emerald-500/10">
                      <Clock className="h-4 w-4 text-emerald-600" />
                      <div>
                        <p className="text-xs font-medium text-emerald-600 uppercase tracking-wider">Date & Time</p>
                        <p className="text-sm font-semibold text-text">{format(new Date(selectedBooking.booking_date), "PPp")}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Completion Notice */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-blue-600/10 rounded-2xl blur-xl"></div>
              <div className="relative bg-blue-500/5 backdrop-blur-sm border border-blue-500/20 rounded-2xl p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-600 mb-1">Completion Effects</p>
                    <p className="text-xs text-muted-foreground">
                      This will mark the session as completed and automatically deduct one session from the member&apos;s remaining count.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-4 pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  setCompleteModalOpen(false);
                  setSelectedBooking(null);
                  setError(null);
                }}
                disabled={isPending}
                className="gap-2 hover:bg-secondary/10 hover:text-secondary hover:border-secondary/50 transition-all duration-200 rounded-xl"
              >
                <X className="h-4 w-4" />
                Cancel
              </Button>
              <Button
                onClick={handleComplete}
                disabled={isPending}
                className="gap-2 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/40 transition-all duration-200 rounded-xl min-w-[140px]"
              >
                {isPending ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Completing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    Mark Complete
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Cancel Modal */}
      <Modal
        isOpen={cancelModalOpen}
        onClose={() => {
          setCancelModalOpen(false);
          setSelectedBooking(null);
          setError(null);
        }}
        title="Cancel Booking"
        className="max-w-2xl"
      >
        <div className="relative">
          {/* Background Glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-transparent to-red-500/10 rounded-3xl blur-2xl"></div>
          
          <div className="relative space-y-6">
            {/* Header Section */}
            <div className="text-center space-y-2">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-red-500/20 to-red-600/30 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-red-500/20">
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-text">Cancel Session Booking</h3>
              <p className="text-sm text-muted-foreground">
                This action will cancel the booking and may affect the member&apos;s session count
              </p>
            </div>

            {/* Error Display */}
            {error && (
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-red-600/10 rounded-2xl blur-xl"></div>
                <div className="relative bg-red-500/10 backdrop-blur-sm border border-red-500/20 rounded-2xl p-4">
                  <div className="flex items-center gap-3">
                    <XCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                    <p className="text-sm text-red-600 font-medium">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Booking Details */}
            {selectedBooking && (
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-red-600/10 rounded-2xl blur-xl"></div>
                <div className="relative bg-red-500/5 backdrop-blur-sm border border-red-500/20 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Calendar className="h-5 w-5 text-red-600" />
                    <h4 className="font-semibold text-text">Booking to Cancel</h4>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-red-500/5 to-transparent border border-red-500/10">
                      <Package className="h-4 w-4 text-red-600" />
                      <div>
                        <p className="text-xs font-medium text-red-600 uppercase tracking-wider">Service</p>
                        <p className="text-sm font-semibold text-text">{selectedBooking.service?.name}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-red-500/5 to-transparent border border-red-500/10">
                      <User className="h-4 w-4 text-red-600" />
                      <div>
                        <p className="text-xs font-medium text-red-600 uppercase tracking-wider">Member</p>
                        <p className="text-sm font-semibold text-text">{selectedBooking.member?.full_name}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-red-500/5 to-transparent border border-red-500/10">
                      <Clock className="h-4 w-4 text-red-600" />
                      <div>
                        <p className="text-xs font-medium text-red-600 uppercase tracking-wider">Date & Time</p>
                        <p className="text-sm font-semibold text-text">{format(new Date(selectedBooking.booking_date), "PPp")}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Warning Notice */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-orange-600/10 rounded-2xl blur-xl"></div>
              <div className="relative bg-orange-500/5 backdrop-blur-sm border border-orange-500/20 rounded-2xl p-4">
                <div className="flex items-start gap-3">
                  <XCircle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-orange-600 mb-1">Cancellation Warning</p>
                    <p className="text-xs text-muted-foreground">
                      This booking will be permanently cancelled. The member will be notified and the session may be returned to their available count.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-4 pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  setCancelModalOpen(false);
                  setSelectedBooking(null);
                  setError(null);
                }}
                disabled={isPending}
                className="gap-2 hover:bg-secondary/10 hover:text-secondary hover:border-secondary/50 transition-all duration-200 rounded-xl"
              >
                <X className="h-4 w-4" />
                Keep Booking
              </Button>
              <Button
                onClick={handleCancel}
                disabled={isPending}
                className="gap-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/40 transition-all duration-200 rounded-xl min-w-[140px]"
              >
                {isPending ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Cancelling...
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4" />
                    Cancel Booking
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setSelectedBooking(null);
          setError(null);
        }}
        title="Delete Booking"
        className="max-w-2xl"
      >
        <div className="relative">
          {/* Background Glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-transparent to-red-500/10 rounded-3xl blur-2xl"></div>
          
          <div className="relative space-y-6">
            {/* Header Section */}
            <div className="text-center space-y-2">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-red-500/20 to-red-600/30 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-red-500/20">
                <Trash2 className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-text">Delete Session Booking</h3>
              <p className="text-sm text-muted-foreground">
                This action will permanently remove the booking from the system
              </p>
            </div>

            {/* Error Display */}
            {error && (
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-red-600/10 rounded-2xl blur-xl"></div>
                <div className="relative bg-red-500/10 backdrop-blur-sm border border-red-500/20 rounded-2xl p-4">
                  <div className="flex items-center gap-3">
                    <XCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                    <p className="text-sm text-red-600 font-medium">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Booking Details */}
            {selectedBooking && (
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-red-600/10 rounded-2xl blur-xl"></div>
                <div className="relative bg-red-500/5 backdrop-blur-sm border border-red-500/20 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Calendar className="h-5 w-5 text-red-600" />
                    <h4 className="font-semibold text-text">Booking to Delete</h4>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-red-500/5 to-transparent border border-red-500/10">
                      <Package className="h-4 w-4 text-red-600" />
                      <div>
                        <p className="text-xs font-medium text-red-600 uppercase tracking-wider">Service</p>
                        <p className="text-sm font-semibold text-text">{selectedBooking.service?.name}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-red-500/5 to-transparent border border-red-500/10">
                      <User className="h-4 w-4 text-red-600" />
                      <div>
                        <p className="text-xs font-medium text-red-600 uppercase tracking-wider">Member</p>
                        <p className="text-sm font-semibold text-text">{selectedBooking.member?.full_name}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-red-500/5 to-transparent border border-red-500/10">
                      <Clock className="h-4 w-4 text-red-600" />
                      <div>
                        <p className="text-xs font-medium text-red-600 uppercase tracking-wider">Date & Time</p>
                        <p className="text-sm font-semibold text-text">{format(new Date(selectedBooking.booking_date), "PPp")}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Danger Warning */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-red-600/10 to-red-700/15 rounded-2xl blur-xl"></div>
              <div className="relative bg-red-600/10 backdrop-blur-sm border border-red-600/30 rounded-2xl p-4">
                <div className="flex items-start gap-3">
                  <Trash2 className="h-5 w-5 text-red-700 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-700 mb-1">Permanent Deletion Warning</p>
                    <p className="text-xs text-muted-foreground">
                      This booking will be permanently deleted from the system. This action cannot be undone and all associated data will be lost.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-4 pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  setDeleteModalOpen(false);
                  setSelectedBooking(null);
                  setError(null);
                }}
                disabled={isPending}
                className="gap-2 hover:bg-secondary/10 hover:text-secondary hover:border-secondary/50 transition-all duration-200 rounded-xl"
              >
                <X className="h-4 w-4" />
                Keep Booking
              </Button>
              <Button
                onClick={handleDelete}
                disabled={isPending}
                className="gap-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/40 transition-all duration-200 rounded-xl min-w-[140px]"
              >
                {isPending ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    Delete Booking
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}
