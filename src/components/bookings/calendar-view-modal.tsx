"use client";

import { useState, useMemo } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { ServiceBooking } from "@/types";
import type { TimeFormat } from "@/lib/settings";
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  User, 
  Package,
  CheckCircle,
  AlertCircle,
  XCircle,
  Eye
} from "lucide-react";
import { format, addDays, subDays, startOfDay, isSameDay } from "date-fns";
import Link from "next/link";

interface CalendarViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookings: ServiceBooking[];
  timeFormat?: TimeFormat;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "pending":
      return {
        bg: "bg-warning/10",
        border: "border-warning/30",
        text: "text-warning",
        icon: AlertCircle,
      };
    case "upcoming":
    case "confirmed":
      return {
        bg: "bg-primary/10",
        border: "border-primary/30",
        text: "text-primary",
        icon: CheckCircle,
      };
    case "completed":
      return {
        bg: "bg-success/10",
        border: "border-success/30",
        text: "text-success",
        icon: CheckCircle,
      };
    case "cancelled":
      return {
        bg: "bg-error/10",
        border: "border-error/30",
        text: "text-error",
        icon: XCircle,
      };
    default:
      return {
        bg: "bg-surface/10",
        border: "border-surface/30",
        text: "text-muted",
        icon: Package,
      };
  }
};

export function CalendarViewModal({ 
  isOpen, 
  onClose, 
  bookings, 
  timeFormat = '24h' 
}: CalendarViewModalProps) {
  // Initialize with today's date at midnight
  const getTodayAtMidnight = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const day = now.getDate();
    return new Date(year, month, day, 0, 0, 0, 0);
  };

  const [selectedDate, setSelectedDate] = useState(getTodayAtMidnight);

  const formatTimeDisplay = (dateString: string): string => {
    const date = new Date(dateString);
    if (timeFormat === '12h') {
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    } else {
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      });
    }
  };

  const dayBookings = useMemo(() => {
    const dayStart = startOfDay(selectedDate);
    return bookings.filter(booking => {
      // Parse the booking date as-is (already in local timezone from database)
      const bookingDate = startOfDay(new Date(booking.booking_date));
      return isSameDay(bookingDate, dayStart);
    }).sort((a, b) => {
      return new Date(a.booking_date).getTime() - new Date(b.booking_date).getTime();
    });
  }, [bookings, selectedDate]);

  const handlePreviousDay = () => {
    setSelectedDate(prev => subDays(prev, 1));
  };

  const handleNextDay = () => {
    setSelectedDate(prev => addDays(prev, 1));
  };

  const handleToday = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const day = now.getDate();
    setSelectedDate(new Date(year, month, day, 0, 0, 0, 0));
  };

  // Get today's date at midnight for comparison
  const getTodayMidnight = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const day = now.getDate();
    return new Date(year, month, day, 0, 0, 0, 0);
  };

  const isToday = selectedDate.getFullYear() === getTodayMidnight().getFullYear() &&
                  selectedDate.getMonth() === getTodayMidnight().getMonth() &&
                  selectedDate.getDate() === getTodayMidnight().getDate();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title=""
      className="max-w-5xl"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 rounded-2xl blur-xl"></div>
          <div className="relative bg-gradient-to-br from-card/80 to-surface/40 backdrop-blur-sm rounded-2xl border border-surface/30 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 border border-primary/30">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-text to-primary bg-clip-text text-transparent">
                    Calendar View
                  </h2>
                  <p className="text-sm text-muted/70 mt-1">
                    View bookings by date
                  </p>
                </div>
              </div>
              <Badge className="px-4 py-2 text-sm font-semibold bg-surface/20 text-muted border-surface/30">
                {dayBookings.length} {dayBookings.length === 1 ? 'Booking' : 'Bookings'}
              </Badge>
            </div>
          </div>
        </div>

        {/* Date Navigation */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-surface/40 to-card/40 rounded-2xl blur-lg"></div>
          <div className="relative bg-card/60 backdrop-blur-sm border border-surface/30 rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePreviousDay}
                className="gap-2 hover:bg-primary/10 hover:text-primary transition-all duration-200"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>

              <div className="flex flex-col items-center gap-2">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-3">
                    <p className="text-2xl font-bold text-text">
                      {format(selectedDate, 'EEEE')}
                    </p>
                    {isToday && (
                      <Badge className="px-3 py-1 text-xs font-semibold bg-success/20 text-success border-success/30">
                        Today
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted/70 mt-1">
                    {format(selectedDate, 'MMMM d, yyyy')}
                  </p>
                </div>
                {!isToday && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleToday}
                    className="bg-primary/10 hover:bg-primary/20 text-primary border-primary/30"
                  >
                    Jump to Today
                  </Button>
                )}
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleNextDay}
                className="gap-2 hover:bg-primary/10 hover:text-primary transition-all duration-200"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Bookings Timeline */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-card/40 to-surface/40 rounded-2xl blur-xl"></div>
          <div className="relative bg-card/80 backdrop-blur-sm border border-surface/30 rounded-2xl p-6 max-h-[500px] overflow-y-auto">
            {dayBookings.length === 0 ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-surface/40 mb-4">
                  <Calendar className="h-8 w-8 text-muted/40" />
                </div>
                <p className="text-lg font-medium text-text mb-1">No bookings</p>
                <p className="text-sm text-muted/60">
                  There are no bookings scheduled for this date
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {dayBookings.map((booking, index) => {
                  const statusConfig = getStatusColor(booking.status);
                  const StatusIcon = statusConfig.icon;

                  return (
                    <div
                      key={booking.id}
                      className="group relative"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
                      <div className={`relative bg-gradient-to-br from-surface/60 to-card/60 backdrop-blur-sm border ${statusConfig.border} rounded-xl p-4 hover:shadow-lg transition-all duration-300`}>
                        <div className="flex items-start justify-between gap-4">
                          {/* Time */}
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${statusConfig.bg} border ${statusConfig.border}`}>
                              <Clock className={`h-4 w-4 ${statusConfig.text}`} />
                            </div>
                            <div>
                              <p className={`text-lg font-bold ${statusConfig.text}`}>
                                {formatTimeDisplay(booking.booking_date)}
                              </p>
                              <p className="text-xs text-muted/60">
                                {booking.service?.duration_minutes || 60} minutes
                              </p>
                            </div>
                          </div>

                          {/* Member & Service Info */}
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-primary" />
                              <p className="font-semibold text-text">
                                {booking.member?.full_name || 'Unknown Member'}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Package className="h-4 w-4 text-secondary" />
                              <p className="text-sm text-muted">
                                {booking.service?.name || 'Unknown Service'}
                              </p>
                            </div>
                          </div>

                          {/* Status & Actions */}
                          <div className="flex items-center gap-3">
                            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${statusConfig.bg} border ${statusConfig.border}`}>
                              <StatusIcon className={`h-3.5 w-3.5 ${statusConfig.text}`} />
                              <span className={`text-xs font-semibold ${statusConfig.text} capitalize`}>
                                {booking.status}
                              </span>
                            </div>
                            <Link href={`/bookings/${booking.id}`}>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary"
                                title="View Details"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer Summary */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-surface/40 to-card/40 rounded-2xl blur-lg"></div>
          <div className="relative bg-card/60 backdrop-blur-sm border border-surface/30 rounded-2xl p-4">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-warning"></div>
                  <span className="text-muted">Pending: {dayBookings.filter(b => b.status === 'pending').length}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-primary"></div>
                  <span className="text-muted">Confirmed: {dayBookings.filter(b => b.status === 'upcoming' || b.status === 'confirmed').length}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-success"></div>
                  <span className="text-muted">Completed: {dayBookings.filter(b => b.status === 'completed').length}</span>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={onClose}
                className="hover:bg-surface/40"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}

