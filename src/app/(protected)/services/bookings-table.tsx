"use client";

import { DataTable } from "@/components/data-table/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ServiceBooking, Service } from "@/types";
import { Calendar, User, Clock } from "lucide-react";
import { format } from "date-fns";

interface BookingsTableProps {
  bookings: ServiceBooking[];
  services: Service[];
}

export function BookingsTable({ bookings }: BookingsTableProps) {
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
      accessorKey: "service",
      header: "Service",
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
                <Button variant="ghost" size="sm">
                  Edit
                </Button>
                <Button variant="ghost" size="sm" className="text-destructive">
                  Cancel
                </Button>
              </>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={bookings}
    />
  );
}
