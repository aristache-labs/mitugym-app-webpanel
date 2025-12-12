"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import Link from "next/link";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { ServiceBooking } from "@/types";
import type { TimeFormat } from "@/lib/settings";
import { 
  confirmSessionBookingAction, 
  completeSessionBookingAction, 
  cancelSessionBookingAction 
} from "@/app/(protected)/actions";
import { 
  Calendar, 
  User, 
  Clock, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Edit3,
  ArrowLeft,
  Phone,
  Mail,
  Package,
  Hash,
  Timer,
  Banknote,
  X
} from "lucide-react";

interface SessionBookingViewProps {
  booking: ServiceBooking;
  timeFormat?: TimeFormat;
}

function getStatusBadge(status: string) {
  const statusConfig = {
    pending: { 
      variant: "secondary" as const, 
      label: "Pending",
      className: "bg-orange-500/30 text-white border-0 text-xs sm:text-sm rounded-full"
    },
    confirmed: { 
      variant: "default" as const, 
      label: "Confirmed",
      className: "bg-green-500/30 text-white border-0 text-xs sm:text-sm rounded-full"
    },
    upcoming: { 
      variant: "default" as const, 
      label: "Upcoming",
      className: "bg-blue-500/30 text-white border-0 text-xs sm:text-sm rounded-full"
    },
    completed: { 
      variant: "success" as const, 
      label: "Completed",
      className: "bg-green-500/30 text-white border-0 text-xs sm:text-sm rounded-full"
    },
    cancelled: { 
      variant: "destructive" as const, 
      label: "Cancelled",
      className: "bg-red-500/30 text-white border-0 text-xs sm:text-sm rounded-full"
    },
  };

  const config = statusConfig[status as keyof typeof statusConfig] || {
    variant: "secondary" as const,
    label: status,
    className: "bg-gray-500/30 text-white border-0 text-xs sm:text-sm rounded-full"
  };

  return (
    <Badge variant={config.variant} className={`capitalize ${config.className}`}>
      {config.label}
    </Badge>
  );
}

export function SessionBookingView({ booking, timeFormat = '24h' }: SessionBookingViewProps) {
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleConfirm = async () => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append("id", booking.id);
      formData.append("notes", "Confirmed from booking details view");

      const result = await confirmSessionBookingAction(formData);
      if (result.success) {
        setConfirmModalOpen(false);
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  };

  const handleComplete = async () => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append("id", booking.id);
      formData.append("notes", "Completed from booking details view");

      const result = await completeSessionBookingAction(formData);
      if (result.success) {
        setCompleteModalOpen(false);
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  };

  const handleCancel = async () => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append("id", booking.id);
      formData.append("reason", "Cancelled from booking details view");

      const result = await cancelSessionBookingAction(formData);
      if (result.success) {
        setCancelModalOpen(false);
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  };

  return (
    <>
      <div className="space-y-4 sm:space-y-6 md:space-y-8">
        {/* Modern Header with Status and Action Buttons */}
        <div className="relative">
          {/* Background Glow */}
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
            
            <div className="relative p-4 sm:p-6 md:p-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6 mb-4 sm:mb-6">
                <div className="flex items-start sm:items-center gap-3 sm:gap-4 md:gap-6 w-full sm:w-auto">
                  <div className="p-2 sm:p-3 md:p-4 rounded-xl sm:rounded-2xl bg-primary/10 flex-shrink-0">
                    <Calendar className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-text truncate">Session Booking</h1>
                      {getStatusBadge(booking.status)}
                    </div>
                    <p className="text-xs sm:text-sm text-muted/70 mt-0.5 sm:mt-1">Booking Details & Information</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                  {/* Edit Booking Button */}
                  {(booking.status === "pending" || booking.status === "confirmed" || booking.status === "upcoming") && (
                    <Link href={`/bookings/${booking.id}/edit`} className="flex-1 sm:flex-none">
                      <button
                        className="group relative h-8 sm:h-9 md:h-10 px-3 sm:px-4 md:px-6 w-full sm:w-auto flex items-center justify-center gap-1.5 sm:gap-2 bg-gradient-to-br from-slate-700/75 via-cyan-900/45 to-slate-700/75 hover:from-slate-600/85 hover:via-cyan-800/55 hover:to-slate-600/85 text-white font-medium text-xs sm:text-sm rounded-2xl backdrop-blur-sm shadow-md shadow-black/20 hover:shadow-lg hover:shadow-cyan-950/25 transition-all duration-500 ease-out overflow-hidden border-0 !ring-0 !outline-none active:scale-95"
                      >
                        {/* Edit Icon */}
                        <div className="relative z-10 flex items-center justify-center transition-all duration-500 ease-in-out group-hover:scale-125 group-hover:translate-x-[3.8em]">
                          <Edit3 className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 transition-all duration-500 ease-in-out text-cyan-300/60 group-hover:text-cyan-100 group-hover:scale-110" />
                        </div>
                        {/* Text */}
                        <span className="hidden sm:inline transition-all duration-500 ease-in-out group-hover:opacity-0">
                          Edit Booking
                        </span>
                        {/* Mobile text */}
                        <span className="sm:hidden transition-all duration-500 ease-in-out group-hover:opacity-0">
                          Edit
                        </span>
                      </button>
                    </Link>
                  )}
                  
                  {/* Confirm Button */}
                  {booking.status === "pending" && (
                    <button
                      onClick={() => setConfirmModalOpen(true)}
                      className="group/confirm relative h-8 sm:h-9 md:h-10 px-3 sm:px-4 md:px-6 flex-1 sm:flex-none flex items-center justify-center gap-1.5 sm:gap-2 bg-gradient-to-br from-green-700/75 via-green-900/45 to-green-700/75 hover:from-green-600/85 hover:via-green-800/55 hover:to-green-600/85 text-white font-medium text-xs sm:text-sm rounded-2xl backdrop-blur-sm shadow-md shadow-green-900/30 hover:shadow-lg hover:shadow-green-950/40 transition-all duration-500 ease-out overflow-hidden border-0 !ring-0 !outline-none active:scale-95"
                    >
                      {/* Shine Effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/confirm:translate-x-full transition-transform duration-1000 ease-in-out"></div>
                      
                      {/* Icon with animation */}
                      <div className="relative z-10 flex items-center justify-center transition-all duration-500 ease-in-out group-hover/confirm:scale-125 group-hover/confirm:translate-x-[2.5em]">
                        <CheckCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 transition-all duration-500 ease-in-out text-green-200/70 group-hover/confirm:text-green-50 group-hover/confirm:scale-110" />
                      </div>
                      
                      {/* Text */}
                      <span className="transition-all duration-500 ease-in-out group-hover/confirm:opacity-0">
                        Confirm
                      </span>
                    </button>
                  )}
                  
                  {/* Mark Complete Button */}
                  {(booking.status === "confirmed" || booking.status === "upcoming") && (
                    <button
                      onClick={() => setCompleteModalOpen(true)}
                      className="group/complete relative h-8 sm:h-9 md:h-10 px-3 sm:px-4 md:px-6 flex-1 sm:flex-none flex items-center justify-center gap-1.5 sm:gap-2 bg-gradient-to-br from-green-700/75 via-green-900/45 to-green-700/75 hover:from-green-600/85 hover:via-green-800/55 hover:to-green-600/85 text-white font-medium text-xs sm:text-sm rounded-2xl backdrop-blur-sm shadow-md shadow-green-900/30 hover:shadow-lg hover:shadow-green-950/40 transition-all duration-500 ease-out overflow-hidden border-0 !ring-0 !outline-none active:scale-95"
                    >
                      {/* Shine Effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/complete:translate-x-full transition-transform duration-1000 ease-in-out"></div>
                      
                      {/* Icon with animation */}
                      <div className="relative z-10 flex items-center justify-center transition-all duration-500 ease-in-out group-hover/complete:scale-125 group-hover/complete:translate-x-[4.3em]">
                        <CheckCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 transition-all duration-500 ease-in-out text-green-200/70 group-hover/complete:text-green-50 group-hover/complete:scale-110" />
                      </div>
                      
                      {/* Text */}
                      <span className="hidden sm:inline transition-all duration-500 ease-in-out group-hover/complete:opacity-0">
                        Mark Complete
                      </span>
                      <span className="sm:hidden transition-all duration-500 ease-in-out group-hover/complete:opacity-0">
                        Complete
                      </span>
                    </button>
                  )}
                  
                  {/* Cancel Button */}
                  {(booking.status === "pending" || booking.status === "confirmed" || booking.status === "upcoming") && (
                    <button
                      onClick={() => setCancelModalOpen(true)}
                      className="group/cancel relative h-8 sm:h-9 md:h-10 px-3 sm:px-4 md:px-6 flex-1 sm:flex-none flex items-center justify-center gap-1.5 sm:gap-2 bg-gradient-to-br from-red-700/75 via-red-900/45 to-red-700/75 hover:from-red-600/85 hover:via-red-800/55 hover:to-red-600/85 text-white font-medium text-xs sm:text-sm rounded-2xl backdrop-blur-sm shadow-md shadow-red-900/30 hover:shadow-lg hover:shadow-red-950/40 transition-all duration-500 ease-out overflow-hidden border-0 !ring-0 !outline-none active:scale-95"
                    >
                      {/* Shine Effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/cancel:translate-x-full transition-transform duration-1000 ease-in-out"></div>
                      
                      {/* Icon with animation */}
                      <div className="relative z-10 flex items-center justify-center transition-all duration-500 ease-in-out group-hover/cancel:scale-125 group-hover/cancel:translate-x-[2.3em]">
                        <XCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 transition-all duration-500 ease-in-out text-red-200/70 group-hover/cancel:text-red-50 group-hover/cancel:scale-110" />
                      </div>
                      
                      {/* Text */}
                      <span className="transition-all duration-500 ease-in-out group-hover/cancel:opacity-0">
                        Cancel
                      </span>
                    </button>
                  )}
                  
                  {/* Back Button */}
                  <Link 
                    href="/bookings"
                    className="group/link relative h-8 sm:h-9 md:h-10 w-full sm:w-auto px-3 sm:px-4 md:px-6 flex items-center justify-center gap-1.5 sm:gap-2 bg-gradient-to-br from-slate-700/75 via-cyan-900/45 to-slate-700/75 hover:from-slate-600/85 hover:via-cyan-800/55 hover:to-slate-600/85 text-white font-medium text-xs sm:text-sm rounded-2xl backdrop-blur-sm shadow-md shadow-black/20 hover:shadow-lg hover:shadow-cyan-950/25 transition-all duration-500 ease-out overflow-hidden border-0 !ring-0 !outline-none active:scale-95 !no-underline flex-1 sm:flex-none"
                  >
                    {/* Arrow Icon */}
                    <div className="relative z-10 flex items-center justify-center transition-all duration-500 ease-in-out group-hover/link:scale-125 group-hover/link:translate-x-[1.3em]">
                      <ArrowLeft className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 transition-all duration-500 ease-in-out text-cyan-300/60 group-hover/link:text-cyan-100 group-hover/link:scale-110" />
                    </div>
                    
                    {/* Text */}
                    <span className="transition-all duration-500 ease-in-out group-hover/link:opacity-0">
                      Back
                    </span>
                  </Link>
                </div>
              </div>

              {/* Quick Stats - Compact 3 Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
                <div className="p-2.5 sm:p-3 rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 border-0">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-primary/20 border-0">
                      <Calendar className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-[10px] sm:text-xs font-medium text-muted/70">Booking Date</p>
                      <p className="text-base sm:text-lg font-bold text-text">{format(new Date(booking.booking_date), "MMM dd, yyyy")}</p>
                    </div>
                  </div>
                </div>
                <div className="p-2.5 sm:p-3 rounded-xl bg-gradient-to-br from-blue-500/5 to-blue-500/10 border-0">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-blue-500/20 border-0">
                      <Clock className="h-4 w-4 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-[10px] sm:text-xs font-medium text-muted/70">Time</p>
                      <p className="text-base sm:text-lg font-bold text-text">
                        {timeFormat === '12h' 
                          ? format(new Date(booking.booking_date), "h:mm a")
                          : format(new Date(booking.booking_date), "HH:mm")
                        }
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-2.5 sm:p-3 rounded-xl bg-gradient-to-br from-cyan-500/5 to-cyan-500/10 border-0">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-cyan-500/20 border-0">
                      <Package className="h-4 w-4 text-cyan-500" />
                    </div>
                    <div>
                      <p className="text-[10px] sm:text-xs font-medium text-muted/70">Sessions Left</p>
                      <p className="text-base sm:text-lg font-bold text-text">
                        {booking.sessions_remaining !== undefined ? booking.sessions_remaining : "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content - Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Left Column */}
          <div className="space-y-4 sm:space-y-6">
            {/* Service Details Card - Compact */}
            <Card className="group relative bg-card/95 backdrop-blur-xl border border-surface/40 shadow-md transition-all duration-300 hover:shadow-lg hover:border-green-500/40 overflow-hidden rounded-2xl sm:rounded-3xl">
              {/* Card Hover Overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/2 via-green-500/1 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl sm:rounded-3xl"></div>
              
              <CardHeader className="relative p-4 sm:p-5 pb-2">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-1.5 rounded-lg bg-green-500/10 group-hover:bg-green-500/20 transition-colors">
                    <Package className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 group-hover:text-green-500 transition-colors" />
                  </div>
                  <div>
                    <CardTitle className="text-base sm:text-lg font-semibold text-text group-hover:text-green-600 transition-colors">
                      Service Details
                    </CardTitle>
                    <p className="text-[10px] sm:text-xs text-muted/70 mt-0.5">Service information</p>
                  </div>
                </div>
              </CardHeader>
                
              <CardContent className="relative p-4 sm:p-5 pt-2">
                {/* Service Name Banner */}
                <div className="p-3 mb-2.5 rounded-xl bg-gradient-to-br from-green-500/10 to-green-500/5 backdrop-blur-sm border-0 shadow-sm">
                  <p className="text-[10px] font-medium text-green-600 uppercase tracking-wide mb-1">Service Name</p>
                  <p className="text-sm sm:text-base font-bold text-text">{booking.service?.name || "Unknown Service"}</p>
                </div>

                {/* Service Info Grid - 2 Columns */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-gradient-to-br from-surface/60 to-surface/40 backdrop-blur-sm border-0 hover:from-surface/70 hover:to-surface/50 transition-all duration-200 shadow-sm">
                    <div className="p-1.5 rounded-md bg-blue-500/20 backdrop-blur-sm">
                      <Timer className="h-3.5 w-3.5 text-blue-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-medium text-primary/80 uppercase tracking-wide">Duration</p>
                      <p className="text-xs text-text font-semibold truncate">
                        {booking.service?.duration_minutes || 60} min
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-gradient-to-br from-surface/60 to-surface/40 backdrop-blur-sm border-0 hover:from-surface/70 hover:to-surface/50 transition-all duration-200 shadow-sm">
                    <div className="p-1.5 rounded-md bg-green-500/20 backdrop-blur-sm">
                      <Banknote className="h-3.5 w-3.5 text-green-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-medium text-primary/80 uppercase tracking-wide">Price</p>
                      <p className="text-xs text-text font-semibold truncate">
                        {booking.service?.price?.toFixed(2) || "0.00"} RON
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-gradient-to-br from-surface/60 to-surface/40 backdrop-blur-sm border-0 hover:from-surface/70 hover:to-surface/50 transition-all duration-200 shadow-sm col-span-2">
                    <div className="p-1.5 rounded-md bg-orange-500/20 backdrop-blur-sm">
                      <Package className="h-3.5 w-3.5 text-orange-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-medium text-primary/80 uppercase tracking-wide">Service Type</p>
                      <p className="text-xs text-text font-semibold truncate capitalize">
                        {booking.service?.service_type?.replace('_', ' ') || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Description */}
                {booking.service?.description && (
                  <div className="p-3 mt-2.5 rounded-lg bg-gradient-to-br from-surface/60 to-surface/40 backdrop-blur-sm border-0 shadow-sm">
                    <div className="flex items-center gap-2 mb-1.5">
                      <FileText className="h-3.5 w-3.5 text-primary" />
                      <p className="text-[10px] font-medium text-primary/80 uppercase tracking-wide">Description</p>
                    </div>
                    <p className="text-xs text-text/90 leading-relaxed">
                      {booking.service.description}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Member Info & Quick Actions */}
          <div className="space-y-4 sm:space-y-6">
            {/* Member Information - Compact */}
            <Card className="group relative bg-card/95 backdrop-blur-xl border border-surface/40 shadow-md transition-all duration-300 hover:shadow-lg hover:border-primary/40 overflow-hidden rounded-2xl sm:rounded-3xl">
              {/* Card Hover Overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/2 via-primary/1 to-secondary/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl sm:rounded-3xl"></div>
              
              <CardHeader className="relative p-4 sm:p-5 pb-2">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-1.5 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <User className="h-4 w-4 sm:h-5 sm:w-5 text-primary/60 group-hover:text-primary transition-colors" />
                  </div>
                  <div>
                    <CardTitle className="text-base sm:text-lg font-semibold text-text group-hover:text-primary transition-colors">
                      Member Information
                    </CardTitle>
                    <p className="text-[10px] sm:text-xs text-muted/70 mt-0.5">Contact details</p>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="relative p-4 sm:p-5 pt-2">
                {/* Compact Grid */}
                <div className="grid grid-cols-2 gap-2">
                  {/* Full Name - Full Width */}
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-gradient-to-br from-surface/60 to-surface/40 backdrop-blur-sm border-0 hover:from-surface/70 hover:to-surface/50 transition-all duration-200 shadow-sm col-span-2">
                    <div className="p-1.5 rounded-md bg-primary/15 backdrop-blur-sm">
                      <User className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-medium text-primary/80 uppercase tracking-wide">Full Name</p>
                      <p className="text-xs text-text font-semibold truncate">{booking.member?.full_name || "Unknown Member"}</p>
                    </div>
                  </div>

                  {/* Email - Full Width */}
                  {booking.member?.email && (
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-gradient-to-br from-surface/60 to-surface/40 backdrop-blur-sm border-0 hover:from-surface/70 hover:to-surface/50 transition-all duration-200 shadow-sm col-span-2">
                      <div className="p-1.5 rounded-md bg-primary/15 backdrop-blur-sm">
                        <Mail className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-medium text-primary/80 uppercase tracking-wide">Email</p>
                        <a 
                          href={`mailto:${booking.member.email}`}
                          className="text-xs text-primary hover:underline font-semibold truncate block"
                        >
                          {booking.member.email}
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Phone - Full Width */}
                  {booking.member?.phone && (
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-gradient-to-br from-surface/60 to-surface/40 backdrop-blur-sm border-0 hover:from-surface/70 hover:to-surface/50 transition-all duration-200 shadow-sm col-span-2">
                      <div className="p-1.5 rounded-md bg-primary/15 backdrop-blur-sm">
                        <Phone className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-medium text-primary/80 uppercase tracking-wide">Phone</p>
                        <a 
                          href={`tel:${booking.member.phone}`}
                          className="text-xs text-primary hover:underline font-semibold truncate block"
                        >
                          {booking.member.phone}
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Status & Plan - Two Columns */}
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-gradient-to-br from-surface/60 to-surface/40 backdrop-blur-sm border-0 hover:from-surface/70 hover:to-surface/50 transition-all duration-200 shadow-sm">
                    <div className="p-1.5 rounded-md bg-primary/15 backdrop-blur-sm">
                      <CheckCircle className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-medium text-primary/80 uppercase tracking-wide">Status</p>
                      <Badge 
                        variant={booking.member?.status === "active" ? "default" : "secondary"}
                        className={`w-fit text-[10px] px-2 py-0.5 border-0 ${
                          booking.member?.status === "active" 
                            ? 'bg-green-500/30 text-white' 
                            : 'bg-red-500/30 text-white'
                        }`}
                      >
                        {booking.member?.status || "Unknown"}
                      </Badge>
                    </div>
                  </div>

                  {booking.member?.plan_name && (
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-gradient-to-br from-surface/60 to-surface/40 backdrop-blur-sm border-0 hover:from-surface/70 hover:to-surface/50 transition-all duration-200 shadow-sm">
                      <div className="p-1.5 rounded-md bg-primary/15 backdrop-blur-sm">
                        <Package className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-medium text-primary/80 uppercase tracking-wide">Plan</p>
                        <p className="text-xs text-text font-semibold truncate">{booking.member.plan_name}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* View Profile Button */}
                <div className="mt-3">
                  <Link href={`/members/${booking.member_id}/view`}>
                    <button className="group/view relative h-9 px-4 w-full flex items-center justify-center gap-1.5 bg-gradient-to-br from-slate-700/75 via-cyan-900/45 to-slate-700/75 hover:from-slate-600/85 hover:via-cyan-800/55 hover:to-slate-600/85 text-white font-medium text-xs rounded-xl backdrop-blur-sm shadow-md shadow-black/20 hover:shadow-lg hover:shadow-cyan-950/25 transition-all duration-500 ease-out overflow-hidden border-0 !ring-0 !outline-none active:scale-95">
                      {/* Icon */}
                      <div className="relative z-10 flex items-center justify-center transition-all duration-500 ease-in-out group-hover/view:scale-125 group-hover/view:translate-x-[5.8em]">
                        <User className="h-3.5 w-3.5 transition-all duration-500 ease-in-out text-cyan-300/60 group-hover/view:text-cyan-100 group-hover/view:scale-110" />
                      </div>
                      
                      {/* Text */}
                      <span className="transition-all duration-500 ease-in-out group-hover/view:opacity-0">
                        View Member Profile
                      </span>
                    </button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions - Compact */}
            <Card className="group relative bg-card/95 backdrop-blur-xl border border-surface/40 shadow-md transition-all duration-300 hover:shadow-lg hover:border-primary/40 overflow-hidden rounded-2xl sm:rounded-3xl">
              {/* Card Hover Overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/2 via-primary/1 to-secondary/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl sm:rounded-3xl"></div>
              
              <CardHeader className="relative p-4 sm:p-5 pb-2">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-1.5 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <Hash className="h-4 w-4 sm:h-5 sm:w-5 text-primary/60 group-hover:text-primary transition-colors" />
                  </div>
                  <div>
                    <CardTitle className="text-base sm:text-lg font-semibold text-text group-hover:text-primary transition-colors">
                      Quick Actions
                    </CardTitle>
                    <p className="text-[10px] sm:text-xs text-muted/70 mt-0.5">Navigate</p>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="relative p-4 sm:p-5 pt-2">
                <div className="space-y-2">
                  {/* Action Buttons - Compact */}
                  <Link href="/bookings">
                    <button className="group/action relative h-9 px-4 w-full flex items-center justify-center gap-1.5 bg-gradient-to-br from-slate-700/75 via-cyan-900/45 to-slate-700/75 hover:from-slate-600/85 hover:via-cyan-800/55 hover:to-slate-600/85 text-white font-medium text-xs rounded-xl backdrop-blur-sm shadow-md shadow-black/20 hover:shadow-lg hover:shadow-cyan-950/25 transition-all duration-500 ease-out overflow-hidden border-0 !ring-0 !outline-none active:scale-95">
                      {/* Icon */}
                      <div className="relative z-10 flex items-center justify-center transition-all duration-500 ease-in-out group-hover/action:scale-125 group-hover/action:translate-x-[3.8em]">
                        <Calendar className="h-3.5 w-3.5 transition-all duration-500 ease-in-out text-cyan-300/60 group-hover/action:text-cyan-100 group-hover/action:scale-110" />
                      </div>
                      
                      {/* Text */}
                      <span className="transition-all duration-500 ease-in-out group-hover/action:opacity-0">
                        All Bookings
                      </span>
                    </button>
                  </Link>
                  <Link href="/services">
                    <button className="group/action relative h-9 px-4 w-full flex items-center justify-center gap-1.5 bg-gradient-to-br from-slate-700/75 via-cyan-900/45 to-slate-700/75 hover:from-slate-600/85 hover:via-cyan-800/55 hover:to-slate-600/85 text-white font-medium text-xs rounded-xl backdrop-blur-sm shadow-md shadow-black/20 hover:shadow-lg hover:shadow-cyan-950/25 transition-all duration-500 ease-out overflow-hidden border-0 !ring-0 !outline-none active:scale-95">
                      {/* Icon */}
                      <div className="relative z-10 flex items-center justify-center transition-all duration-500 ease-in-out group-hover/action:scale-125 group-hover/action:translate-x-[3.5em]">
                        <Clock className="h-3.5 w-3.5 transition-all duration-500 ease-in-out text-cyan-300/60 group-hover/action:text-cyan-100 group-hover/action:scale-110" />
                      </div>
                      
                      {/* Text */}
                      <span className="transition-all duration-500 ease-in-out group-hover/action:opacity-0">
                        All Services
                      </span>
                    </button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Notes - If exists */}
            {booking.notes && (
              <Card className="group relative bg-card/95 backdrop-blur-xl border border-surface/40 shadow-md transition-all duration-300 hover:shadow-lg hover:border-primary/40 overflow-hidden rounded-2xl sm:rounded-3xl">
                {/* Card Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/2 via-primary/1 to-secondary/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl sm:rounded-3xl"></div>
                
                <CardHeader className="relative p-4 sm:p-5 pb-2">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="p-1.5 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-primary/60 group-hover:text-primary transition-colors" />
                    </div>
                    <div>
                      <CardTitle className="text-base sm:text-lg font-semibold text-text group-hover:text-primary transition-colors">
                        Booking Notes
                      </CardTitle>
                      <p className="text-[10px] sm:text-xs text-muted/70 mt-0.5">Additional info</p>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="relative p-4 sm:p-5 pt-2">
                  <div className="p-3 rounded-lg bg-gradient-to-br from-surface/60 to-surface/40 backdrop-blur-sm border-0 shadow-sm">
                    <p className="text-xs text-text whitespace-pre-wrap leading-relaxed">
                      {booking.notes}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Confirm Modal */}
      <Modal
        isOpen={confirmModalOpen}
        onClose={() => {
          setConfirmModalOpen(false);
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
                      <p className="text-sm font-semibold text-text">{booking.service?.name}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-green-500/5 to-transparent border border-green-500/10">
                    <User className="h-4 w-4 text-green-600" />
                    <div>
                      <p className="text-xs font-medium text-green-600 uppercase tracking-wider">Member</p>
                      <p className="text-sm font-semibold text-text">{booking.member?.full_name}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-green-500/5 to-transparent border border-green-500/10">
                    <Clock className="h-4 w-4 text-green-600" />
                    <div>
                      <p className="text-xs font-medium text-green-600 uppercase tracking-wider">Date & Time</p>
                      <p className="text-sm font-semibold text-text">{format(new Date(booking.booking_date), "PPp")}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-4">
              {/* Close Button */}
              <button
                onClick={() => {
                  setConfirmModalOpen(false);
                  setError(null);
                }}
                disabled={isPending}
                className="group/close relative h-9 sm:h-10 px-4 sm:px-6 flex items-center justify-center gap-1.5 sm:gap-2 bg-gradient-to-br from-slate-700/75 via-cyan-900/45 to-slate-700/75 hover:from-slate-600/85 hover:via-cyan-800/55 hover:to-slate-600/85 text-white font-medium text-xs sm:text-sm rounded-xl backdrop-blur-sm shadow-md shadow-black/20 hover:shadow-lg hover:shadow-cyan-950/25 transition-all duration-500 ease-out overflow-hidden border-0 !ring-0 !outline-none active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {/* Icon with animation */}
                <div className="relative z-10 flex items-center justify-center transition-all duration-500 ease-in-out group-hover/close:scale-125 group-hover/close:translate-x-[1.7em]">
                  <X className="h-3.5 w-3.5 sm:h-4 sm:w-4 transition-all duration-500 ease-in-out text-cyan-300/60 group-hover/close:text-cyan-100 group-hover/close:scale-110" />
                </div>
                
                {/* Text */}
                <span className="transition-all duration-500 ease-in-out group-hover/close:opacity-0">
                  Close
                </span>
              </button>
              
              {/* Confirm Button */}
              <button
                onClick={handleConfirm}
                disabled={isPending}
                className="group/confirm relative h-9 sm:h-10 px-4 sm:px-6 flex items-center justify-center gap-1.5 sm:gap-2 bg-gradient-to-br from-green-700/75 via-green-900/45 to-green-700/75 hover:from-green-600/85 hover:via-green-800/55 hover:to-green-600/85 text-white font-medium text-xs sm:text-sm rounded-xl backdrop-blur-sm shadow-md shadow-green-900/30 hover:shadow-lg hover:shadow-green-950/40 transition-all duration-500 ease-out overflow-hidden border-0 !ring-0 !outline-none active:scale-95 min-w-[140px] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {/* Shine Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/confirm:translate-x-full transition-transform duration-1000 ease-in-out"></div>
                
                {isPending ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    <span>Confirming...</span>
                  </>
                ) : (
                  <>
                    {/* Icon with animation */}
                    <div className="relative z-10 flex items-center justify-center transition-all duration-500 ease-in-out group-hover/confirm:scale-125 group-hover/confirm:translate-x-[4.5em]">
                      <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 transition-all duration-500 ease-in-out text-green-200/70 group-hover/confirm:text-green-50 group-hover/confirm:scale-110" />
                    </div>
                    
                    {/* Text */}
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
                      <p className="text-sm font-semibold text-text">{booking.service?.name}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-emerald-500/5 to-transparent border border-emerald-500/10">
                    <User className="h-4 w-4 text-emerald-600" />
                    <div>
                      <p className="text-xs font-medium text-emerald-600 uppercase tracking-wider">Member</p>
                      <p className="text-sm font-semibold text-text">{booking.member?.full_name}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-emerald-500/5 to-transparent border border-emerald-500/10">
                    <Clock className="h-4 w-4 text-emerald-600" />
                    <div>
                      <p className="text-xs font-medium text-emerald-600 uppercase tracking-wider">Date & Time</p>
                      <p className="text-sm font-semibold text-text">{format(new Date(booking.booking_date), "PPp")}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

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
            <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-4">
              {/* Close Button */}
              <button
                onClick={() => {
                  setCompleteModalOpen(false);
                  setError(null);
                }}
                disabled={isPending}
                className="group/close relative h-9 sm:h-10 px-4 sm:px-6 flex items-center justify-center gap-1.5 sm:gap-2 bg-gradient-to-br from-slate-700/75 via-cyan-900/45 to-slate-700/75 hover:from-slate-600/85 hover:via-cyan-800/55 hover:to-slate-600/85 text-white font-medium text-xs sm:text-sm rounded-xl backdrop-blur-sm shadow-md shadow-black/20 hover:shadow-lg hover:shadow-cyan-950/25 transition-all duration-500 ease-out overflow-hidden border-0 !ring-0 !outline-none active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {/* Icon with animation */}
                <div className="relative z-10 flex items-center justify-center transition-all duration-500 ease-in-out group-hover/close:scale-125 group-hover/close:translate-x-[1.7em]">
                  <X className="h-3.5 w-3.5 sm:h-4 sm:w-4 transition-all duration-500 ease-in-out text-cyan-300/60 group-hover/close:text-cyan-100 group-hover/close:scale-110" />
                </div>
                
                {/* Text */}
                <span className="transition-all duration-500 ease-in-out group-hover/close:opacity-0">
                  Close
                </span>
              </button>
              
              {/* Mark Complete Button */}
              <button
                onClick={handleComplete}
                disabled={isPending}
                className="group/complete relative h-9 sm:h-10 px-4 sm:px-6 flex items-center justify-center gap-1.5 sm:gap-2 bg-gradient-to-br from-emerald-700/75 via-emerald-900/45 to-emerald-700/75 hover:from-emerald-600/85 hover:via-emerald-800/55 hover:to-emerald-600/85 text-white font-medium text-xs sm:text-sm rounded-xl backdrop-blur-sm shadow-md shadow-emerald-900/30 hover:shadow-lg hover:shadow-emerald-950/40 transition-all duration-500 ease-out overflow-hidden border-0 !ring-0 !outline-none active:scale-95 min-w-[140px] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {/* Shine Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/complete:translate-x-full transition-transform duration-1000 ease-in-out"></div>
                
                {isPending ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    <span>Completing...</span>
                  </>
                ) : (
                  <>
                    {/* Icon with animation */}
                    <div className="relative z-10 flex items-center justify-center transition-all duration-500 ease-in-out group-hover/complete:scale-125 group-hover/complete:translate-x-[4.2em]">
                      <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 transition-all duration-500 ease-in-out text-emerald-200/70 group-hover/complete:text-emerald-50 group-hover/complete:scale-110" />
                    </div>
                    
                    {/* Text */}
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
                      <p className="text-sm font-semibold text-text">{booking.service?.name}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-red-500/5 to-transparent border border-red-500/10">
                    <User className="h-4 w-4 text-red-600" />
                    <div>
                      <p className="text-xs font-medium text-red-600 uppercase tracking-wider">Member</p>
                      <p className="text-sm font-semibold text-text">{booking.member?.full_name}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-red-500/5 to-transparent border border-red-500/10">
                    <Clock className="h-4 w-4 text-red-600" />
                    <div>
                      <p className="text-xs font-medium text-red-600 uppercase tracking-wider">Date & Time</p>
                      <p className="text-sm font-semibold text-text">{format(new Date(booking.booking_date), "PPp")}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

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
            <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-4">
              {/* Keep Booking Button */}
              <button
                onClick={() => {
                  setCancelModalOpen(false);
                  setError(null);
                }}
                disabled={isPending}
                className="group/keep relative h-9 sm:h-10 px-4 sm:px-6 flex items-center justify-center gap-1.5 sm:gap-2 bg-gradient-to-br from-slate-700/75 via-cyan-900/45 to-slate-700/75 hover:from-slate-600/85 hover:via-cyan-800/55 hover:to-slate-600/85 text-white font-medium text-xs sm:text-sm rounded-xl backdrop-blur-sm shadow-md shadow-black/20 hover:shadow-lg hover:shadow-cyan-950/25 transition-all duration-500 ease-out overflow-hidden border-0 !ring-0 !outline-none active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {/* Icon with animation */}
                <div className="relative z-10 flex items-center justify-center transition-all duration-500 ease-in-out group-hover/keep:scale-125 group-hover/keep:translate-x-[3.7em]">
                  <X className="h-3.5 w-3.5 sm:h-4 sm:w-4 transition-all duration-500 ease-in-out text-cyan-300/60 group-hover/keep:text-cyan-100 group-hover/keep:scale-110" />
                </div>
                
                {/* Text */}
                <span className="transition-all duration-500 ease-in-out group-hover/keep:opacity-0">
                  Keep Booking
                </span>
              </button>
              
              {/* Cancel Booking Button */}
              <button
                onClick={handleCancel}
                disabled={isPending}
                className="group/cancel relative h-9 sm:h-10 px-4 sm:px-6 flex items-center justify-center gap-1.5 sm:gap-2 bg-gradient-to-br from-red-700/75 via-red-900/45 to-red-700/75 hover:from-red-600/85 hover:via-red-800/55 hover:to-red-600/85 text-white font-medium text-xs sm:text-sm rounded-xl backdrop-blur-sm shadow-md shadow-red-900/30 hover:shadow-lg hover:shadow-red-950/40 transition-all duration-500 ease-out overflow-hidden border-0 !ring-0 !outline-none active:scale-95 min-w-[140px] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {/* Shine Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/cancel:translate-x-full transition-transform duration-1000 ease-in-out"></div>
                
                {isPending ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    <span>Cancelling...</span>
                  </>
                ) : (
                  <>
                    {/* Icon with animation */}
                    <div className="relative z-10 flex items-center justify-center transition-all duration-500 ease-in-out group-hover/cancel:scale-125 group-hover/cancel:translate-x-[4.3em]">
                      <XCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 transition-all duration-500 ease-in-out text-red-200/70 group-hover/cancel:text-red-50 group-hover/cancel:scale-110" />
                    </div>
                    
                    {/* Text */}
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
    </>
  );
}

