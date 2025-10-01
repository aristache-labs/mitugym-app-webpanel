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
import { 
  confirmSessionBookingAction, 
  completeSessionBookingAction, 
  cancelSessionBookingAction 
} from "@/app/(protected)/actions";
import { 
  Calendar, 
  User, 
  Clock, 
  DollarSign, 
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
  Banknote
} from "lucide-react";

interface SessionBookingViewProps {
  booking: ServiceBooking;
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

export function SessionBookingView({ booking }: SessionBookingViewProps) {
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
              
              <Card className="relative bg-card/95 backdrop-blur-xl border border-surface/40 shadow-2xl shadow-black/20 transition-all duration-300 hover:shadow-3xl hover:shadow-secondary/10 hover:border-secondary/50 overflow-hidden rounded-3xl">
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
                        {format(new Date(booking.booking_date), "h:mm a")}
                      </p>
                    </div>
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-green-500/5 to-green-500/10 border border-green-500/20">
                      <p className="text-xs font-medium text-green-600 uppercase tracking-wider mb-2">Created</p>
                      <p className="text-sm font-medium text-text">
                        {format(new Date(booking.created_at), "MMM dd, yyyy 'at' h:mm a")}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Service Details */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 rounded-3xl blur-2xl"></div>
              
              <Card className="relative bg-card/95 backdrop-blur-xl border border-surface/40 shadow-2xl shadow-black/20 transition-all duration-300 hover:shadow-3xl hover:shadow-primary/10 hover:border-primary/50 overflow-hidden rounded-3xl">
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
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Member Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Full Name</p>
                  <p className="text-lg font-semibold">{booking.member?.full_name || "Unknown Member"}</p>
                </div>

                {booking.member?.email && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Email</p>
                    <p className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4" />
                      <a 
                        href={`mailto:${booking.member.email}`}
                        className="text-primary hover:underline"
                      >
                        {booking.member.email}
                      </a>
                    </p>
                  </div>
                )}

                {booking.member?.phone && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Phone</p>
                    <p className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4" />
                      <a 
                        href={`tel:${booking.member.phone}`}
                        className="text-primary hover:underline"
                      >
                        {booking.member.phone}
                      </a>
                    </p>
                  </div>
                )}

                {booking.member?.gender && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Gender</p>
                    <p className="text-sm capitalize">{booking.member.gender}</p>
                  </div>
                )}

                <div>
                  <p className="text-sm font-medium text-muted-foreground">Membership Status</p>
                  <Badge variant={booking.member?.status === "active" ? "success" : "secondary"}>
                    {booking.member?.status || "Unknown"}
                  </Badge>
                </div>

                {booking.member?.plan_name && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Plan</p>
                    <p className="text-sm">{booking.member.plan_name}</p>
                  </div>
                )}

                <div className="pt-2">
                  <Link href={`/members/${booking.member_id}`}>
                    <Button variant="outline" size="sm" className="w-full">
                      View Member Profile
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-muted/50 p-2 rounded text-center">
                    <p className="font-medium">Status</p>
                    <p className="capitalize">{booking.status}</p>
                  </div>
                  <div className="bg-muted/50 p-2 rounded text-center">
                    <p className="font-medium">Sessions Left</p>
                    <p>{booking.sessions_remaining || "N/A"}</p>
                  </div>
                </div>
                
                <div className="pt-2 space-y-2">
                  <Link href="/bookings">
                    <Button variant="outline" size="sm" className="w-full">
                      <Calendar className="h-4 w-4 mr-2" />
                      All Bookings
                    </Button>
                  </Link>
                  <Link href="/services">
                    <Button variant="outline" size="sm" className="w-full">
                      <Clock className="h-4 w-4 mr-2" />
                      All Services
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
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

          <div className="bg-muted/50 border border-border rounded-lg p-3">
            <div className="space-y-2 text-sm">
              <div><strong>Service:</strong> {booking.service?.name}</div>
              <div><strong>Member:</strong> {booking.member?.full_name}</div>
              <div><strong>Date:</strong> {format(new Date(booking.booking_date), "PPp")}</div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setConfirmModalOpen(false);
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

          <div className="bg-muted/50 border border-border rounded-lg p-3">
            <div className="space-y-2 text-sm">
              <div><strong>Service:</strong> {booking.service?.name}</div>
              <div><strong>Member:</strong> {booking.member?.full_name}</div>
              <div><strong>Date:</strong> {format(new Date(booking.booking_date), "PPp")}</div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setCompleteModalOpen(false);
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

          <div className="bg-muted/50 border border-border rounded-lg p-3">
            <div className="space-y-2 text-sm">
              <div><strong>Service:</strong> {booking.service?.name}</div>
              <div><strong>Member:</strong> {booking.member?.full_name}</div>
              <div><strong>Date:</strong> {format(new Date(booking.booking_date), "PPp")}</div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setCancelModalOpen(false);
                setError(null);
              }}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCancel}
              disabled={isPending}
              variant="destructive"
            >
              {isPending ? "Cancelling..." : "Cancel Booking"}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
