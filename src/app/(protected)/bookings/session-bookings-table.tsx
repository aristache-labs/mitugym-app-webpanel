"use client";

import { useState, useTransition } from "react";
import { DataTable } from "@/components/data-table/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { ServiceBooking } from "@/types";
import { Calendar, User, Clock, CheckCircle, XCircle, Trash2 } from "lucide-react";
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
      // TODO: Implement confirmSessionBookingAction
      setError("Confirm action not implemented yet");
    });
  };

  const handleComplete = async () => {
    if (!selectedBooking) return;

    startTransition(async () => {
      // TODO: Implement completeSessionBookingAction
      setError("Complete action not implemented yet");
    });
  };

  const handleCancel = async () => {
    if (!selectedBooking) return;

    startTransition(async () => {
      // TODO: Implement cancelSessionBookingAction
      setError("Cancel action not implemented yet");
    });
  };

  const handleDelete = async () => {
    if (!selectedBooking) return;

    startTransition(async () => {
      // TODO: Implement deleteSessionBookingAction
      setError("Delete action not implemented yet");
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-500 text-white">Pending</Badge>;
      case "upcoming":
        return <Badge className="bg-blue-500 text-white">Confirmed</Badge>;
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
      header: () => <div className="flex justify-center w-full">Date & Time</div>,
      cell: ({ row }: { row: { original: ServiceBooking } }) => {
        const booking = row.original;
        return (
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <div className="font-medium">
                {format(new Date(booking.booking_date), "MMM dd, yyyy")}
              </div>
              <div className="text-sm text-muted-foreground">
                {format(new Date(booking.booking_date), "h:mm a")}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      id: "service",
      header: () => <div className="flex justify-center w-full">Service</div>,
      accessorFn: (row: ServiceBooking) => row.service?.name || "Unknown Service",
      cell: ({ row }: { row: { original: ServiceBooking } }) => {
        const booking = row.original;
        return (
          <div className="space-y-1">
            <div className="font-medium">{booking.service?.name || "Unknown Service"}</div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="h-3 w-3" />
              {booking.service?.duration_minutes || 60} minutes
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "member",
      header: () => <div className="flex justify-center w-full">Member</div>,
      cell: ({ row }: { row: { original: ServiceBooking } }) => {
        const booking = row.original;
        return (
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <div>
              <div className="font-medium">{booking.member?.full_name || "Unknown Member"}</div>
              {booking.member?.email && (
                <div className="text-sm text-muted-foreground">{booking.member.email}</div>
              )}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: () => <div className="flex justify-center w-full">Status</div>,
      cell: ({ row }: { row: { original: ServiceBooking } }) => getStatusBadge(row.original.status),
    },
    {
      accessorKey: "notes",
      header: () => <div className="flex justify-center w-full">Notes</div>,
      cell: ({ row }: { row: { original: ServiceBooking } }) => {
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
      header: () => <div className="flex justify-center w-full">Actions</div>,
      cell: ({ row }: { row: { original: ServiceBooking } }) => {
        const booking = row.original;
        return (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              View
            </Button>
            {booking.status === "pending" && (
              <>
                <Link href={`/bookings/${booking.id}/edit`}>
                  <Button variant="ghost" size="sm">
                    Edit
                  </Button>
                </Link>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-green-600 hover:bg-green-50"
                  onClick={() => handleConfirmClick(booking)}
                >
                  <CheckCircle className="h-4 w-4" />
                  Confirm
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-destructive hover:bg-destructive/10"
                  onClick={() => handleCancelClick(booking)}
                >
                  <XCircle className="h-4 w-4" />
                  Cancel
                </Button>
              </>
            )}
            {booking.status === "upcoming" && (
              <>
                <Link href={`/bookings/${booking.id}/edit`}>
                  <Button variant="ghost" size="sm">
                    Edit
                  </Button>
                </Link>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-green-600 hover:bg-green-50"
                  onClick={() => handleCompleteClick(booking)}
                >
                  <CheckCircle className="h-4 w-4" />
                  Complete
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-destructive hover:bg-destructive/10"
                  onClick={() => handleCancelClick(booking)}
                >
                  <XCircle className="h-4 w-4" />
                  Cancel
                </Button>
              </>
            )}
            {booking.status === "cancelled" && (
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:bg-destructive/10"
                onClick={() => handleDeleteClick(booking)}
                title="Delete cancelled booking"
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
      >
        <div className="space-y-4">
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <p className="text-sm text-muted-foreground">
            Are you sure you want to confirm this booking?
          </p>

          {selectedBooking && (
            <div className="bg-muted/50 border border-border rounded-lg p-3">
              <div className="space-y-2 text-sm">
                <div><strong>Service:</strong> {selectedBooking.service?.name}</div>
                <div><strong>Member:</strong> {selectedBooking.member?.full_name}</div>
                <div><strong>Date:</strong> {format(new Date(selectedBooking.booking_date), "PPp")}</div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setConfirmModalOpen(false);
                setSelectedBooking(null);
                setError(null);
              }}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              {isPending ? "Confirming..." : "Confirm Booking"}
            </Button>
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
      >
        <div className="space-y-4">
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <p className="text-sm text-muted-foreground">
            Mark this booking as completed?
          </p>

          {selectedBooking && (
            <div className="bg-muted/50 border border-border rounded-lg p-3">
              <div className="space-y-2 text-sm">
                <div><strong>Service:</strong> {selectedBooking.service?.name}</div>
                <div><strong>Member:</strong> {selectedBooking.member?.full_name}</div>
                <div><strong>Date:</strong> {format(new Date(selectedBooking.booking_date), "PPp")}</div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setCompleteModalOpen(false);
                setSelectedBooking(null);
                setError(null);
              }}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleComplete}
              disabled={isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              {isPending ? "Completing..." : "Mark Complete"}
            </Button>
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
      >
        <div className="space-y-4">
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <p className="text-sm text-muted-foreground">
            Are you sure you want to cancel this booking?
          </p>

          {selectedBooking && (
            <div className="bg-muted/50 border border-border rounded-lg p-3">
              <div className="space-y-2 text-sm">
                <div><strong>Service:</strong> {selectedBooking.service?.name}</div>
                <div><strong>Member:</strong> {selectedBooking.member?.full_name}</div>
                <div><strong>Date:</strong> {format(new Date(selectedBooking.booking_date), "PPp")}</div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setCancelModalOpen(false);
                setSelectedBooking(null);
                setError(null);
              }}
              disabled={isPending}
            >
              Keep Booking
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancel}
              disabled={isPending}
            >
              {isPending ? "Cancelling..." : "Cancel Booking"}
            </Button>
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
      >
        <div className="space-y-4">
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <p className="text-sm text-muted-foreground">
            Are you sure you want to permanently delete this cancelled booking?
          </p>

          {selectedBooking && (
            <div className="bg-muted/50 border border-border rounded-lg p-3">
              <div className="space-y-2 text-sm">
                <div><strong>Service:</strong> {selectedBooking.service?.name}</div>
                <div><strong>Member:</strong> {selectedBooking.member?.full_name}</div>
                <div><strong>Date:</strong> {format(new Date(selectedBooking.booking_date), "PPp")}</div>
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
                setSelectedBooking(null);
                setError(null);
              }}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isPending}
            >
              {isPending ? "Deleting..." : "Delete Booking"}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
