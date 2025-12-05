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
    pending: { variant: "secondary" as const, label: "Pending" },
    confirmed: { variant: "default" as const, label: "Confirmed" },
    upcoming: { variant: "default" as const, label: "Upcoming" },
    completed: { variant: "success" as const, label: "Completed" },
    cancelled: { variant: "destructive" as const, label: "Cancelled" },
  };

  const config = statusConfig[status as keyof typeof statusConfig] || {
    variant: "secondary" as const,
    label: status,
  };

  return (
    <Badge variant={config.variant} className="capitalize">
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
      <div className="space-y-8">
        {/* Header Actions */}
        <div className="flex items-center justify-end">
          <div className="flex items-center gap-2">
            {(booking.status === "pending" || booking.status === "confirmed" || booking.status === "upcoming") && (
              <Link href={`/bookings/${booking.id}/edit`}>
                <Button variant="ghost" className="gap-2 hover:bg-blue-500/10 hover:text-blue-600 transition-all duration-200 rounded-xl">
                  <Edit3 className="h-4 w-4" />
                  Edit Booking
                </Button>
              </Link>
            )}
            
            {booking.status === "pending" && (
              <Button 
                className="gap-2 bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl"
                onClick={() => setConfirmModalOpen(true)}
              >
                <CheckCircle className="h-4 w-4" />
                Confirm
              </Button>
            )}
            
            {(booking.status === "confirmed" || booking.status === "upcoming") && (
              <Button 
                className="gap-2 bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl"
                onClick={() => setCompleteModalOpen(true)}
              >
                <CheckCircle className="h-4 w-4" />
                Mark Complete
              </Button>
            )}
            
            {(booking.status === "pending" || booking.status === "confirmed" || booking.status === "upcoming") && (
              <Button 
                variant="destructive" 
                className="gap-2 shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl"
                onClick={() => setCancelModalOpen(true)}
              >
                <XCircle className="h-4 w-4" />
                Cancel
              </Button>
            )}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Booking Info */}
          <div className="lg:col-span-2 space-y-8">
            {/* Booking Overview */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 via-transparent to-primary/5 rounded-3xl blur-2xl"></div>
              
              <Card className="relative bg-card/95 backdrop-blur-xl border border-surface/40 shadow-md transition-all duration-300 hover:shadow-lg hover:border-surface/60 overflow-hidden rounded-3xl">
                <div className="absolute inset-0 bg-gradient-to-br from-secondary/2 via-secondary/1 to-primary/2 opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-3xl"></div>
                
                <CardHeader className="relative p-8 pb-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-xl bg-secondary/10 hover:bg-secondary/20 transition-colors">
                        <Calendar className="h-6 w-6 text-secondary/60 hover:text-secondary transition-colors" />
                      </div>
                      <CardTitle className="text-xl font-semibold text-text hover:text-secondary transition-colors">
                        Booking Overview
                      </CardTitle>
                    </div>
                    <Link href="/bookings">
                      <Button variant="ghost" size="sm" className="gap-2 hover:bg-primary/10 hover:text-primary transition-all duration-200 rounded-xl">
                        <ArrowLeft className="h-4 w-4" />
                        Back to Bookings
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                
                <CardContent className="relative p-8 pt-0">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20">
                      <p className="text-xs font-medium text-primary/80 uppercase tracking-wider mb-2">Booking Date</p>
                      <p className="text-lg font-semibold text-text">
                        {format(new Date(booking.booking_date), "MMMM dd, yyyy")}
                      </p>
                    </div>
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500/5 to-blue-500/10 border border-blue-500/20">
                      <p className="text-xs font-medium text-blue-600 uppercase tracking-wider mb-2">Time</p>
                      <p className="text-lg font-semibold text-text">
                        {timeFormat === '12h' 
                          ? format(new Date(booking.booking_date), "h:mm a")
                          : format(new Date(booking.booking_date), "HH:mm")
                        }
                      </p>
                    </div>
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-green-500/5 to-green-500/10 border border-green-500/20">
                      <p className="text-xs font-medium text-green-600 uppercase tracking-wider mb-2">Created</p>
                      <p className="text-sm font-medium text-text">
                        {timeFormat === '12h' 
                          ? format(new Date(booking.created_at), "MMM dd, yyyy 'at' h:mm a")
                          : format(new Date(booking.created_at), "MMM dd, yyyy 'at' HH:mm")
                        }
                      </p>
                    </div>
                    
                    {/* Completed Date */}
                    {booking.completed_date && (
                      <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/5 to-emerald-500/10 border border-emerald-500/20">
                        <p className="text-xs font-medium text-emerald-600 uppercase tracking-wider mb-2">Completed</p>
                        <p className="text-sm font-medium text-text">
                          {timeFormat === '12h' 
                            ? format(new Date(booking.completed_date), "MMM dd, yyyy 'at' h:mm a")
                            : format(new Date(booking.completed_date), "MMM dd, yyyy 'at' HH:mm")
                          }
                        </p>
                      </div>
                    )}
                    
                    {/* Cancelled Date */}
                    {booking.cancelled_date && (
                      <div className="p-4 rounded-2xl bg-gradient-to-br from-red-500/5 to-red-500/10 border border-red-500/20">
                        <p className="text-xs font-medium text-red-600 uppercase tracking-wider mb-2">Cancelled</p>
                        <p className="text-sm font-medium text-text">
                          {timeFormat === '12h' 
                            ? format(new Date(booking.cancelled_date), "MMM dd, yyyy 'at' h:mm a")
                            : format(new Date(booking.cancelled_date), "MMM dd, yyyy 'at' HH:mm")
                          }
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Service Details */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 rounded-3xl blur-2xl"></div>
              
              <Card className="relative bg-card/95 backdrop-blur-xl border border-surface/40 shadow-md transition-all duration-300 hover:shadow-lg hover:border-primary/40 overflow-hidden rounded-3xl">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/2 via-primary/1 to-secondary/2 opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-3xl"></div>
                
                <CardHeader className="relative p-8 pb-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-xl bg-primary/10 hover:bg-primary/20 transition-colors">
                        <Clock className="h-6 w-6 text-primary/60 hover:text-primary transition-colors" />
                      </div>
                      <CardTitle className="text-xl font-semibold text-text hover:text-primary transition-colors">
                        Service Details
                      </CardTitle>
                    </div>
                    {getStatusBadge(booking.status)}
                  </div>
                </CardHeader>
                
                <CardContent className="relative p-8 pt-0 space-y-6">
                  {/* Service Name */}
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-secondary/5 to-secondary/10 border border-secondary/20">
                    <p className="text-xs font-medium text-secondary/80 uppercase tracking-wider mb-2">Service Name</p>
                    <p className="text-xl font-semibold text-text">{booking.service?.name || "Unknown Service"}</p>
                  </div>
                  
                  {/* Service Stats Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500/5 to-blue-500/10 border border-blue-500/20">
                      <div className="flex items-center gap-2 mb-2">
                        <Timer className="h-4 w-4 text-blue-600" />
                        <p className="text-xs font-medium text-blue-600 uppercase tracking-wider">Duration</p>
                      </div>
                      <p className="text-lg font-semibold text-text">
                        {booking.service?.duration_minutes || 60} min
                      </p>
                    </div>
                    
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-green-500/5 to-green-500/10 border border-green-500/20">
                      <div className="flex items-center gap-2 mb-2">
                        <Banknote className="h-4 w-4 text-green-600" />
                        <p className="text-xs font-medium text-green-600 uppercase tracking-wider">Price</p>
                      </div>
                      <p className="text-lg font-semibold text-text">
                        {booking.service?.price?.toFixed(2) || "0.00"} RON
                      </p>
                    </div>
                    
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-orange-500/5 to-orange-500/10 border border-orange-500/20">
                      <div className="flex items-center gap-2 mb-2">
                        <Package className="h-4 w-4 text-orange-600" />
                        <p className="text-xs font-medium text-orange-600 uppercase tracking-wider">Type</p>
                      </div>
                      <p className="text-lg font-semibold text-text capitalize">
                        {booking.service?.service_type?.replace('_', ' ') || "N/A"}
                      </p>
                    </div>
                  </div>

                  {/* Description */}
                  {booking.service?.description && (
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500/5 to-purple-500/10 border border-purple-500/20">
                      <div className="flex items-center gap-2 mb-3">
                        <FileText className="h-4 w-4 text-purple-600" />
                        <p className="text-xs font-medium text-purple-600 uppercase tracking-wider">Description</p>
                      </div>
                      <p className="text-sm text-text/90 leading-relaxed bg-surface/30 p-3 rounded-xl border">
                        {booking.service.description}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Notes */}
            {booking.notes && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Booking Notes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm bg-muted/50 p-3 rounded-lg whitespace-pre-wrap">
                    {booking.notes}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Member Info */}
          <div className="space-y-8">
            {/* Member Information */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-cyan-500/10 rounded-3xl blur-2xl"></div>
              
              <Card className="relative bg-card/95 backdrop-blur-xl border border-surface/40 shadow-md transition-all duration-300 hover:shadow-lg hover:border-surface/60 overflow-hidden rounded-3xl">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/2 via-cyan-500/1 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-3xl"></div>
                
                <CardHeader className="relative p-8 pb-6">
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 transition-colors">
                      <User className="h-6 w-6 text-cyan-500/60 hover:text-cyan-500 transition-colors" />
                    </div>
                    <CardTitle className="text-xl font-semibold text-text hover:text-cyan-500 transition-colors">
                      Member Information
                    </CardTitle>
                  </div>
                </CardHeader>
                
                <CardContent className="relative p-8 pt-0 space-y-4">
                  {/* Full Name */}
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Full Name</p>
                    <p className="text-lg font-semibold text-text">{booking.member?.full_name || "Unknown Member"}</p>
                  </div>

                  {/* Contact Information */}
                  {booking.member?.email && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Email</p>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-cyan-500" />
                        <a 
                          href={`mailto:${booking.member.email}`}
                          className="text-sm text-primary hover:underline font-medium"
                        >
                          {booking.member.email}
                        </a>
                      </div>
                    </div>
                  )}

                  {booking.member?.phone && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Phone</p>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-cyan-500" />
                        <a 
                          href={`tel:${booking.member.phone}`}
                          className="text-sm text-primary hover:underline font-medium"
                        >
                          {booking.member.phone}
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Member Details */}
                  {booking.member?.gender && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Gender</p>
                      <p className="text-sm font-medium text-text capitalize">{booking.member.gender}</p>
                    </div>
                  )}

                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Membership Status</p>
                    <Badge 
                      variant={booking.member?.status === "active" ? "default" : "secondary"}
                      className={
                        booking.member?.status === "active" 
                          ? "bg-green-500/20 text-green-600 border-green-500/30" 
                          : "bg-red-500/20 text-red-600 border-red-500/30"
                      }
                    >
                      {booking.member?.status || "Unknown"}
                    </Badge>
                  </div>

                  {booking.member?.plan_name && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Plan</p>
                      <p className="text-sm font-medium text-text">{booking.member.plan_name}</p>
                    </div>
                  )}

                  {/* View Profile Button */}
                  <div className="pt-2">
                    <Link href={`/members/${booking.member_id}/view`}>
                      <Button variant="outline" className="w-full gap-2 hover:bg-cyan-500/10 hover:text-cyan-600 hover:border-cyan-500/50 transition-all duration-200 rounded-xl">
                        <User className="h-4 w-4" />
                        View Member Profile
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-cyan-500/10 rounded-3xl blur-2xl"></div>
              
              <Card className="relative bg-card/95 backdrop-blur-xl border border-surface/40 shadow-md transition-all duration-300 hover:shadow-lg hover:border-surface/60 overflow-hidden rounded-3xl">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/2 via-cyan-500/1 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-3xl"></div>
                
                <CardHeader className="relative p-8 pb-6">
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 transition-colors">
                      <Hash className="h-6 w-6 text-cyan-500/60 hover:text-cyan-500 transition-colors" />
                    </div>
                    <CardTitle className="text-xl font-semibold text-text hover:text-cyan-500 transition-colors">
                      Quick Actions
                    </CardTitle>
                  </div>
                </CardHeader>
                
                <CardContent className="relative p-8 pt-0 space-y-6">
                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 text-center">
                      <p className="text-xs font-medium text-primary/80 uppercase tracking-wider mb-1">Status</p>
                      <p className="text-sm font-semibold text-text capitalize">{booking.status}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500/5 to-orange-500/10 border border-orange-500/20 text-center">
                      <p className="text-xs font-medium text-orange-600 uppercase tracking-wider mb-1">Sessions Left</p>
                      <p className="text-sm font-semibold text-text">{booking.sessions_remaining || "N/A"}</p>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="space-y-3">
                    <Link href="/bookings">
                      <Button variant="outline" className="w-full gap-2 hover:bg-cyan-500/10 hover:text-cyan-600 hover:border-cyan-500/50 transition-all duration-200 rounded-xl">
                        <Calendar className="h-4 w-4" />
                        All Bookings
                      </Button>
                    </Link>
                    <Link href="/services">
                      <Button variant="outline" className="w-full gap-2 hover:bg-cyan-500/10 hover:text-cyan-600 hover:border-cyan-500/50 transition-all duration-200 rounded-xl">
                        <Clock className="h-4 w-4" />
                        All Services
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
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
            <div className="flex items-center justify-end gap-4 pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  setConfirmModalOpen(false);
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
            <div className="flex items-center justify-end gap-4 pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  setCompleteModalOpen(false);
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
            <div className="flex items-center justify-end gap-4 pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  setCancelModalOpen(false);
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
    </>
  );
}

