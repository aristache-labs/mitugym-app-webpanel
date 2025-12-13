"use client";

import { useState, useTransition } from "react";
import { DataTable } from "@/components/data-table/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { AnimatedCreateButton } from "@/components/ui/animated-create-button";
import { ServiceBooking } from "@/types";
import type { TimeFormat } from "@/lib/settings";
import { confirmSessionBookingAction, completeSessionBookingAction, cancelSessionBookingAction, deleteSessionBookingAction } from "@/app/(protected)/actions";
import { Calendar as CalendarIcon, User, Clock, CheckCircle, XCircle, Trash2, Eye, Edit, X, Package } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CalendarViewButton } from "@/components/bookings/calendar-view-button";

interface SessionBookingsTableProps {
  bookings: ServiceBooking[];
  timeFormat?: TimeFormat;
}

export function SessionBookingsTable({ bookings, timeFormat = '24h' }: SessionBookingsTableProps) {
  const router = useRouter();
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<ServiceBooking | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleNewBooking = () => {
    router.push("/bookings/new");
  };

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
        return <Badge variant="default">Pending</Badge>;
      case "confirmed":
        return <Badge variant="default">Confirmed</Badge>;
      case "upcoming":
        return <Badge className="bg-blue-500/20 text-blue-400 border border-blue-500/30 shadow-sm hover:bg-blue-500/30 transition-all duration-200">Upcoming</Badge>;
      case "completed":
        return <Badge variant="success">Completed</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const columns = [
    {
      accessorKey: "booking_date",
      header: () => (
        <div className="text-center md:text-left font-semibold">Date & Time</div>
      ),
      cell: ({ row }: { row: { original: ServiceBooking } }) => {
        const booking = row.original;
        return (
          <div className="flex items-center justify-center md:justify-start gap-3 min-w-[140px] md:min-w-0">
            <CalendarIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <div>
              <div className="font-medium whitespace-nowrap">
                {format(new Date(booking.booking_date), "MMM dd, yyyy")}
              </div>
              <div className="text-sm text-muted-foreground mt-1.5">
                {timeFormat === '12h' 
                  ? format(new Date(booking.booking_date), "h:mm a")
                  : format(new Date(booking.booking_date), "HH:mm")
                }
              </div>
            </div>
          </div>
        );
      },
    },
    {
      id: "service",
      header: () => (
        <div className="text-center font-semibold">Service</div>
      ),
      accessorFn: (row: ServiceBooking) => row.service?.name || "Unknown Service",
      cell: ({ row }: { row: { original: ServiceBooking } }) => {
        const booking = row.original;
        return (
          <div className="min-w-[160px] md:max-w-[180px] mx-auto text-center px-2">
            <div className="font-medium line-clamp-2 leading-tight">
              {booking.service?.name || "Unknown Service"}
            </div>
            <div className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground mt-2">
              <Clock className="h-3.5 w-3.5" />
              {booking.service?.duration_minutes || 60} min
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "member",
      header: () => (
        <div className="text-center font-semibold">Member</div>
      ),
      cell: ({ row }: { row: { original: ServiceBooking } }) => {
        const booking = row.original;
        return (
          <div className="flex items-center justify-center gap-3 min-w-[180px] md:min-w-0 px-2">
            <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <div className="min-w-0 md:max-w-[160px]">
              <div className="font-medium line-clamp-1">{booking.member?.full_name || "Unknown Member"}</div>
              {booking.member?.email && (
                <div className="text-sm text-muted-foreground truncate mt-1">{booking.member.email}</div>
              )}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: () => (
        <div className="text-center font-semibold">Status</div>
      ),
      cell: ({ row }: { row: { original: ServiceBooking } }) => (
        <div className="flex justify-center min-w-[100px] px-2">
          {getStatusBadge(row.original.status)}
        </div>
      ),
    },
    {
      id: "actions",
      header: () => (
        <div className="text-center font-semibold">Actions</div>
      ),
      cell: ({ row }: { row: { original: ServiceBooking } }) => {
        const booking = row.original;
        return (
          <div className="flex items-center justify-center gap-1 min-w-[140px] px-2">
            {/* View Button */}
            <Link href={`/bookings/${booking.id}`}>
              <button
                className="booking-view-button"
                title="View booking"
              >
                <svg
                  className="booking-view-icon"
                  viewBox="0 0 576 512"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M288 32c-80.8 0-145.5 36.8-192.6 80.6C48.6 156 17.3 208 2.5 243.7c-3.3 7.9-3.3 16.7 0 24.6C17.3 304 48.6 356 95.4 399.4C142.5 443.2 207.2 480 288 480s145.5-36.8 192.6-80.6c46.8-43.5 78.1-95.4 93-131.1c3.3-7.9 3.3-16.7 0-24.6c-14.9-35.7-46.2-87.7-93-131.1C433.5 68.8 368.8 32 288 32zM144 256a144 144 0 1 1 288 0 144 144 0 1 1 -288 0zm144-64c0 35.3-28.7 64-64 64c-7.1 0-13.9-1.2-20.3-3.3c-5.5-1.8-11.9 1.6-11.7 7.4c.3 6.9 1.3 13.8 3.2 20.7c13.7 51.2 66.4 81.6 117.6 67.9s81.6-66.4 67.9-117.6c-11.1-41.5-47.8-69.4-88.6-71.1c-5.8-.2-9.2 6.1-7.4 11.7c2.1 6.4 3.3 13.2 3.3 20.3z"
                  />
                </svg>
                <style jsx>{`
                  .booking-view-button {
                    width: 32px;
                    height: 32px;
                    border-radius: 8px;
                    background-color: rgba(77, 212, 212, 0.12);
                    border: 1px solid rgba(77, 212, 212, 0.25);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    overflow: hidden;
                    position: relative;
                  }
                  .booking-view-icon {
                    width: 15px;
                    transition: all 0.3s ease;
                    fill: rgba(77, 212, 212, 0.9);
                  }
                  .booking-view-button:hover {
                    background-color: rgba(77, 212, 212, 0.18);
                    border-color: rgba(77, 212, 212, 0.4);
                    box-shadow: 0 0 12px rgba(77, 212, 212, 0.2);
                  }
                  .booking-view-button:hover .booking-view-icon {
                    transform: scale(1.1);
                    fill: rgb(77, 212, 212);
                  }
                  .booking-view-button:active {
                    transform: scale(0.95);
                  }
                `}</style>
              </button>
            </Link>

            {/* Edit Button */}
            {(booking.status === "pending" || booking.status === "confirmed" || booking.status === "upcoming") && (
              <Link href={`/bookings/${booking.id}/edit`}>
                <button 
                  className="booking-edit-button"
                  title="Edit booking"
                >
                  <svg
                    className="booking-edit-icon"
                    viewBox="0 0 512 512"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M410.3 231l11.3-11.3-33.9-33.9-62.1-62.1L291.7 89.8l-11.3 11.3-22.6 22.6L58.6 322.9c-10.4 10.4-18 23.3-22.2 37.4L1 480.7c-2.5 8.4-.2 17.5 6.1 23.7s15.3 8.5 23.7 6.1l120.3-35.4c14.1-4.2 27-11.8 37.4-22.2L387.7 253.7 410.3 231zM160 399.4l-9.1 22.7c-4 3.1-8.5 5.4-13.3 6.9L59.4 452l23-78.1c1.4-4.9 3.8-9.4 6.9-13.3l22.7-9.1v32c0 8.8 7.2 16 16 16h32zM362.7 18.7L348.3 33.2 325.7 55.8 314.3 67.1l33.9 33.9 62.1 62.1 33.9 33.9 11.3-11.3 22.6-22.6 14.5-14.5c25-25 25-65.5 0-90.5L453.3 18.7c-25-25-65.5-25-90.5 0zm-47.4 168l-144 144c-6.2 6.2-16.4 6.2-22.6 0s-6.2-16.4 0-22.6l144-144c6.2-6.2 16.4-6.2 22.6 0s6.2 16.4 0 22.6z"
                    />
                  </svg>
                  <style jsx>{`
                    .booking-edit-button {
                      width: 32px;
                      height: 32px;
                      border-radius: 8px;
                      background-color: rgba(77, 212, 212, 0.12);
                      border: 1px solid rgba(77, 212, 212, 0.25);
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      cursor: pointer;
                      transition: all 0.3s ease;
                      overflow: hidden;
                      position: relative;
                    }
                    .booking-edit-icon {
                      width: 13px;
                      transition: all 0.3s ease;
                      fill: rgba(77, 212, 212, 0.9);
                    }
                    .booking-edit-button:hover {
                      background-color: rgba(77, 212, 212, 0.18);
                      border-color: rgba(77, 212, 212, 0.4);
                      box-shadow: 0 0 12px rgba(77, 212, 212, 0.2);
                    }
                    .booking-edit-button:hover .booking-edit-icon {
                      transform: rotate(-12deg) scale(1.05);
                      fill: rgb(77, 212, 212);
                    }
                    .booking-edit-button:active {
                      transform: scale(0.95);
                    }
                  `}</style>
                </button>
              </Link>
            )}

            {/* Confirm/Complete Button (Green) */}
            {booking.status === "pending" && (
              <>
                <button
                  onClick={() => handleConfirmClick(booking)}
                  className="booking-confirm-button"
                  title="Confirm booking"
                >
                  <svg
                    className="booking-confirm-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <style jsx>{`
                    .booking-confirm-button {
                      width: 32px;
                      height: 32px;
                      border-radius: 8px;
                      background-color: rgba(34, 197, 94, 0.12);
                      border: 1px solid rgba(34, 197, 94, 0.25);
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      cursor: pointer;
                      transition: all 0.3s ease;
                      color: rgba(34, 197, 94, 0.9);
                    }
                    .booking-confirm-icon {
                      width: 16px;
                      height: 16px;
                      transition: all 0.3s ease;
                    }
                    .booking-confirm-button:hover {
                      background-color: rgba(34, 197, 94, 0.18);
                      border-color: rgba(34, 197, 94, 0.4);
                      box-shadow: 0 0 12px rgba(34, 197, 94, 0.2);
                      color: rgb(34, 197, 94);
                    }
                    .booking-confirm-button:hover .booking-confirm-icon {
                      transform: scale(1.15) rotate(5deg);
                    }
                    .booking-confirm-button:active {
                      transform: scale(0.95);
                    }
                  `}</style>
                </button>

                <button
                  onClick={() => handleCancelClick(booking)}
                  className="booking-cancel-button-pending"
                  title="Cancel booking"
                >
                  <svg
                    className="booking-cancel-icon-pending"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <style jsx>{`
                    .booking-cancel-button-pending {
                      width: 32px;
                      height: 32px;
                      border-radius: 8px;
                      background-color: rgba(234, 179, 8, 0.12);
                      border: 1px solid rgba(234, 179, 8, 0.25);
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      cursor: pointer;
                      transition: all 0.3s ease;
                      color: rgba(234, 179, 8, 0.9);
                    }
                    .booking-cancel-icon-pending {
                      width: 16px;
                      height: 16px;
                      transition: all 0.3s ease;
                    }
                    .booking-cancel-button-pending:hover {
                      background-color: rgba(234, 179, 8, 0.18);
                      border-color: rgba(234, 179, 8, 0.4);
                      box-shadow: 0 0 12px rgba(234, 179, 8, 0.2);
                      color: rgb(234, 179, 8);
                    }
                    .booking-cancel-button-pending:hover .booking-cancel-icon-pending {
                      transform: scale(1.15) rotate(90deg);
                    }
                    .booking-cancel-button-pending:active {
                      transform: scale(0.95);
                    }
                  `}</style>
                </button>
              </>
            )}

            {/* Complete and Cancel for confirmed/upcoming */}
            {(booking.status === "confirmed" || booking.status === "upcoming") && (
              <>
                <button
                  onClick={() => handleCompleteClick(booking)}
                  className="booking-complete-button"
                  title="Complete booking"
                >
                  <svg
                    className="booking-complete-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <style jsx>{`
                    .booking-complete-button {
                      width: 32px;
                      height: 32px;
                      border-radius: 8px;
                      background-color: rgba(34, 197, 94, 0.12);
                      border: 1px solid rgba(34, 197, 94, 0.25);
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      cursor: pointer;
                      transition: all 0.3s ease;
                      color: rgba(34, 197, 94, 0.9);
                    }
                    .booking-complete-icon {
                      width: 16px;
                      height: 16px;
                      transition: all 0.3s ease;
                    }
                    .booking-complete-button:hover {
                      background-color: rgba(34, 197, 94, 0.18);
                      border-color: rgba(34, 197, 94, 0.4);
                      box-shadow: 0 0 12px rgba(34, 197, 94, 0.2);
                      color: rgb(34, 197, 94);
                    }
                    .booking-complete-button:hover .booking-complete-icon {
                      transform: scale(1.15) rotate(5deg);
                    }
                    .booking-complete-button:active {
                      transform: scale(0.95);
                    }
                  `}</style>
                </button>

                <button
                  onClick={() => handleCancelClick(booking)}
                  className="booking-cancel-button-confirmed"
                  title="Cancel booking"
                >
                  <svg
                    className="booking-cancel-icon-confirmed"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <style jsx>{`
                    .booking-cancel-button-confirmed {
                      width: 32px;
                      height: 32px;
                      border-radius: 8px;
                      background-color: rgba(234, 179, 8, 0.12);
                      border: 1px solid rgba(234, 179, 8, 0.25);
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      cursor: pointer;
                      transition: all 0.3s ease;
                      color: rgba(234, 179, 8, 0.9);
                    }
                    .booking-cancel-icon-confirmed {
                      width: 16px;
                      height: 16px;
                      transition: all 0.3s ease;
                    }
                    .booking-cancel-button-confirmed:hover {
                      background-color: rgba(234, 179, 8, 0.18);
                      border-color: rgba(234, 179, 8, 0.4);
                      box-shadow: 0 0 12px rgba(234, 179, 8, 0.2);
                      color: rgb(234, 179, 8);
                    }
                    .booking-cancel-button-confirmed:hover .booking-cancel-icon-confirmed {
                      transform: scale(1.15) rotate(90deg);
                    }
                    .booking-cancel-button-confirmed:active {
                      transform: scale(0.95);
                    }
                  `}</style>
                </button>
              </>
            )}

            {/* Delete Button for cancelled bookings */}
            {booking.status === "cancelled" && (
              <button
                onClick={() => handleDeleteClick(booking)}
                className="booking-delete-button"
                title="Delete cancelled booking"
              >
                <svg
                  className="booking-bin-top"
                  viewBox="0 0 39 7"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <line y1="5" x2="39" y2="5" strokeWidth="4"></line>
                  <line x1="12" y1="1.5" x2="26.0357" y2="1.5" strokeWidth="3"></line>
                </svg>
                <svg
                  className="booking-bin-bottom"
                  viewBox="0 0 33 39"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <mask id="path-1-booking-bin" fill="rgba(255, 107, 107, 0.9)">
                    <path d="M0 0H33V35C33 37.2091 31.2091 39 29 39H4C1.79086 39 0 37.2091 0 35V0Z"></path>
                  </mask>
                  <path
                    d="M0 0H33H0ZM37 35C37 39.4183 33.4183 43 29 43H4C-0.418278 43 -4 39.4183 -4 35H4H29H37ZM4 43C-0.418278 43 -4 39.4183 -4 35V0H4V35V43ZM37 0V35C37 39.4183 33.4183 43 29 43V35V0H37Z"
                    fill="rgba(255, 107, 107, 0.9)"
                    mask="url(#path-1-booking-bin)"
                  ></path>
                  <path d="M12 6L12 29" strokeWidth="4"></path>
                  <path d="M21 6V29" strokeWidth="4"></path>
                </svg>
                <style jsx>{`
                  .booking-delete-button {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    width: 32px;
                    height: 32px;
                    border-radius: 8px;
                    background-color: rgba(255, 107, 107, 0.12);
                    border: 1px solid rgba(255, 107, 107, 0.25);
                    cursor: pointer;
                    transition: all 0.3s ease;
                  }
                  .booking-bin-bottom {
                    width: 12px;
                    transition: all 0.3s ease;
                  }
                  .booking-bin-top {
                    width: 14px;
                    transform-origin: right;
                    transition: all 0.3s ease;
                  }
                  .booking-bin-bottom path {
                    stroke: rgba(255, 107, 107, 0.9);
                    fill: rgba(255, 107, 107, 0.9);
                  }
                  .booking-bin-top line {
                    stroke: rgba(255, 107, 107, 0.9);
                  }
                  .booking-delete-button:hover {
                    background-color: rgba(255, 107, 107, 0.18);
                    border-color: rgba(255, 107, 107, 0.4);
                    box-shadow: 0 0 12px rgba(255, 107, 107, 0.2);
                  }
                  .booking-delete-button:hover .booking-bin-top {
                    transform: rotate(15deg);
                  }
                  .booking-delete-button:hover .booking-bin-bottom path {
                    stroke: rgb(255, 107, 107);
                    fill: rgb(255, 107, 107);
                  }
                  .booking-delete-button:hover .booking-bin-top line {
                    stroke: rgb(255, 107, 107);
                  }
                  .booking-delete-button:active {
                    transform: scale(0.95);
                  }
                `}</style>
              </button>
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
        filterPlaceholder="Search bookings..."
        toolbarSlot={
          <div className="flex items-center justify-center md:justify-end gap-3 w-full md:w-auto">
            <CalendarViewButton bookings={bookings} timeFormat={timeFormat} />
            <AnimatedCreateButton onClick={handleNewBooking} label="New Booking" shortLabel="New" />
          </div>
        }
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
                    <CalendarIcon className="h-5 w-5 text-green-600" />
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
            <div className="flex justify-center pt-4">
              <button
                onClick={handleConfirm}
                disabled={isPending}
                className="group/confirm relative h-9 sm:h-10 px-4 sm:px-6 flex items-center justify-center gap-1.5 sm:gap-2 bg-gradient-to-br from-green-700/75 via-green-900/45 to-green-700/75 hover:from-green-600/85 hover:via-green-800/55 hover:to-green-600/85 text-white font-medium text-xs sm:text-sm rounded-xl backdrop-blur-sm shadow-md shadow-green-900/30 hover:shadow-lg hover:shadow-green-950/40 transition-all duration-500 ease-out overflow-hidden border-0 !ring-0 !outline-none active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {!isPending && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/confirm:translate-x-full transition-transform duration-1000 ease-in-out"></div>
                )}
                
                {isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-3.5 w-3.5 sm:h-4 sm:w-4 border-2 border-white border-t-transparent" />
                    <span>Confirming...</span>
                  </>
                ) : (
                  <>
                    <div className="relative z-10 flex items-center justify-center transition-all duration-500 ease-in-out group-hover/confirm:scale-125 group-hover/confirm:translate-x-[4.5em]">
                      <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 transition-all duration-500 ease-in-out text-green-200/70 group-hover/confirm:text-green-50 group-hover/confirm:scale-110" />
                    </div>
                    <span className="transition-all duration-500 ease-in-out group-hover/confirm:opacity-0">
                      Confirm Booking
                    </span>
                  </>
                )}
              </button>
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
                    <CalendarIcon className="h-5 w-5 text-emerald-600" />
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
            <div className="flex justify-center pt-4">
              <button
                onClick={handleComplete}
                disabled={isPending}
                className="group/complete relative h-9 sm:h-10 px-4 sm:px-6 flex items-center justify-center gap-1.5 sm:gap-2 bg-gradient-to-br from-green-700/75 via-green-900/45 to-green-700/75 hover:from-green-600/85 hover:via-green-800/55 hover:to-green-600/85 text-white font-medium text-xs sm:text-sm rounded-xl backdrop-blur-sm shadow-md shadow-green-900/30 hover:shadow-lg hover:shadow-green-950/40 transition-all duration-500 ease-out overflow-hidden border-0 !ring-0 !outline-none active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {!isPending && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/complete:translate-x-full transition-transform duration-1000 ease-in-out"></div>
                )}
                
                {isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-3.5 w-3.5 sm:h-4 sm:w-4 border-2 border-white border-t-transparent" />
                    <span>Completing...</span>
                  </>
                ) : (
                  <>
                    <div className="relative z-10 flex items-center justify-center transition-all duration-500 ease-in-out group-hover/complete:scale-125 group-hover/complete:translate-x-[4.2em]">
                      <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 transition-all duration-500 ease-in-out text-green-200/70 group-hover/complete:text-green-50 group-hover/complete:scale-110" />
                    </div>
                    <span className="transition-all duration-500 ease-in-out group-hover/complete:opacity-0">
                      Mark Complete
                    </span>
                  </>
                )}
              </button>
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
                    <CalendarIcon className="h-5 w-5 text-red-600" />
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
            <div className="flex justify-center pt-4">
              <button
                onClick={handleCancel}
                disabled={isPending}
                className="group/cancel relative h-9 sm:h-10 px-4 sm:px-6 flex items-center justify-center gap-1.5 sm:gap-2 bg-gradient-to-br from-red-700/75 via-red-900/45 to-red-700/75 hover:from-red-600/85 hover:via-red-800/55 hover:to-red-600/85 text-white font-medium text-xs sm:text-sm rounded-2xl backdrop-blur-sm shadow-md shadow-red-900/30 hover:shadow-lg hover:shadow-red-950/40 transition-all duration-500 ease-out overflow-hidden border-0 !ring-0 !outline-none active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {!isPending && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/cancel:translate-x-full transition-transform duration-1000 ease-in-out"></div>
                )}
                
                {isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-3.5 w-3.5 sm:h-4 sm:w-4 border-2 border-white border-t-transparent" />
                    <span>Cancelling...</span>
                  </>
                ) : (
                  <>
                    <div className="relative z-10 flex items-center justify-center transition-all duration-500 ease-in-out group-hover/cancel:scale-125 group-hover/cancel:translate-x-[4.2em]">
                      <XCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 transition-all duration-500 ease-in-out text-red-200/70 group-hover/cancel:text-red-50 group-hover/cancel:scale-110" />
                    </div>
                    <span className="transition-all duration-500 ease-in-out group-hover/cancel:opacity-0">
                      Cancel Booking
                    </span>
                  </>
                )}
              </button>
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
                    <CalendarIcon className="h-5 w-5 text-red-600" />
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
            <div className="flex justify-center pt-4">
              <button
                onClick={handleDelete}
                disabled={isPending}
                className="group/delete relative h-9 sm:h-10 px-4 sm:px-6 flex items-center justify-center gap-1.5 sm:gap-2 bg-gradient-to-br from-red-700/75 via-red-900/45 to-red-700/75 hover:from-red-600/85 hover:via-red-800/55 hover:to-red-600/85 text-white font-medium text-xs sm:text-sm rounded-2xl backdrop-blur-sm shadow-md shadow-red-900/30 hover:shadow-lg hover:shadow-red-950/40 transition-all duration-500 ease-out overflow-hidden border-0 !ring-0 !outline-none active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {!isPending && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/delete:translate-x-full transition-transform duration-1000 ease-in-out"></div>
                )}
                
                {isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-3.5 w-3.5 sm:h-4 sm:w-4 border-2 border-white border-t-transparent" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <div className="relative z-10 flex items-center justify-center transition-all duration-500 ease-in-out group-hover/delete:scale-125 group-hover/delete:translate-x-[4.1em]">
                      <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 transition-all duration-500 ease-in-out text-red-200/70 group-hover/delete:text-red-50 group-hover/delete:scale-110" />
                    </div>
                    <span className="transition-all duration-500 ease-in-out group-hover/delete:opacity-0">
                      Delete Booking
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}
