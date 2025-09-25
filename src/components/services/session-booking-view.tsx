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
  Mail
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
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <Link href="/bookings">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Bookings
            </Button>
          </Link>
          
          <div className="flex items-center gap-3">
            {(booking.status === "pending" || booking.status === "confirmed" || booking.status === "upcoming") && (
              <Link href={`/bookings/${booking.id}/edit`}>
                <Button variant="outline" size="sm">
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit Booking
                </Button>
              </Link>
            )}
            
            {booking.status === "pending" && (
              <Button 
                size="sm" 
                className="bg-green-600 hover:bg-green-700"
                onClick={() => setConfirmModalOpen(true)}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Confirm
              </Button>
            )}
            
            {(booking.status === "confirmed" || booking.status === "upcoming") && (
              <Button 
                size="sm" 
                className="bg-green-600 hover:bg-green-700"
                onClick={() => setCompleteModalOpen(true)}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Mark Complete
              </Button>
            )}
            
            {(booking.status === "pending" || booking.status === "confirmed" || booking.status === "upcoming") && (
              <Button 
                variant="destructive" 
                size="sm"
                onClick={() => setCancelModalOpen(true)}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            )}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Booking Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Booking Overview */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Booking Overview
                  </CardTitle>
                  {getStatusBadge(booking.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Booking Date</p>
                      <p className="text-lg font-semibold">
                        {format(new Date(booking.booking_date), "MMMM dd, yyyy")}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Time</p>
                      <p className="text-lg font-semibold">
                        {format(new Date(booking.booking_date), "h:mm a")}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Booking ID</p>
                      <p className="text-sm font-mono bg-muted px-2 py-1 rounded">
                        {booking.id}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Created</p>
                      <p className="text-sm">
                        {format(new Date(booking.created_at), "MMM dd, yyyy 'at' h:mm a")}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Service Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Service Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Service Name</p>
                  <p className="text-xl font-semibold">{booking.service?.name || "Unknown Service"}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Duration</p>
                    <p className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {booking.service?.duration_minutes || 60} minutes
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Price</p>
                    <p className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      {booking.service?.price?.toFixed(2) || "0.00"} RON
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Type</p>
                    <p className="capitalize">{booking.service?.service_type || "N/A"}</p>
                  </div>
                </div>

                {booking.service?.description && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Description</p>
                    <p className="text-sm bg-muted/50 p-3 rounded-lg">{booking.service.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>

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
