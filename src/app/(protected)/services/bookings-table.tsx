"use client";

import { useState, useTransition } from "react";
import { DataTable } from "@/components/data-table/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { ServiceBooking, Service } from "@/types";
import { Calendar, User, Clock, Trash2 } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import { deleteServiceBookingAction } from "@/app/(protected)/actions";

interface BookingsTableProps {
  bookings: ServiceBooking[];
  services: Service[];
}

export function BookingsTable({ bookings }: BookingsTableProps) {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState<ServiceBooking | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleDeleteClick = (booking: ServiceBooking) => {
    setBookingToDelete(booking);
    setDeleteModalOpen(true);
    setError(null);
  };

  const handleDeleteConfirm = async () => {
    if (!bookingToDelete) return;

    startTransition(async () => {
      const formData = new FormData();
      formData.append("id", bookingToDelete.id);

      try {
        const result = await deleteServiceBookingAction(formData);
        
        if (result.success) {
          setDeleteModalOpen(false);
          setBookingToDelete(null);
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
      case "upcoming":
        return <Badge className="bg-blue-500 text-white">Upcoming</Badge>;
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
      header: "Date & Time",
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
      header: "Service",
      accessorFn: (row: ServiceBooking) => row.service?.name || "Unknown Service",
      cell: ({ row }: { row: { original: ServiceBooking } }) => {
        const booking = row.original;
        return (
          <div className="space-y-1">
            <div className="font-medium">{booking.service?.name || "Unknown Service"}</div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="h-3 w-3" />
              1 hour
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "member",
      header: "Member",
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
      header: "Status",
      cell: ({ row }: { row: { original: ServiceBooking } }) => getStatusBadge(row.original.status),
    },
    {
      accessorKey: "sessions_remaining",
      header: "Sessions",
      cell: ({ row }: { row: { original: ServiceBooking } }) => {
        const remaining = row.original.sessions_remaining;
        return remaining ? (
          <div className="text-center">
            <div className="font-medium">{remaining}</div>
            <div className="text-xs text-muted-foreground">remaining</div>
          </div>
        ) : (
          <div className="text-center text-muted-foreground">-</div>
        );
      },
    },
    {
      accessorKey: "notes",
      header: "Notes",
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
      header: "Actions",
      cell: ({ row }: { row: { original: ServiceBooking } }) => {
        const booking = row.original;
        return (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              View
            </Button>
            {booking.status === "upcoming" && (
              <>
                <Link href={`/services/bookings/${booking.id}/edit`}>
                  <Button variant="ghost" size="sm">
                    Edit
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" className="text-destructive">
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

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setBookingToDelete(null);
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

          {bookingToDelete && (
            <div className="bg-muted/50 border border-border rounded-lg p-3">
              <div className="space-y-2 text-sm">
                <div><strong>Service:</strong> {bookingToDelete.service?.name}</div>
                <div><strong>Member:</strong> {bookingToDelete.member?.full_name}</div>
                <div><strong>Date:</strong> {format(new Date(bookingToDelete.booking_date), "PPp")}</div>
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
                setBookingToDelete(null);
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
              {isPending ? "Deleting..." : "Delete Booking"}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
