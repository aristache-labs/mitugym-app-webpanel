"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { createPurchasedServiceAction } from "@/app/(protected)/actions";
import { Service, Member } from "@/types";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import { User, Package, Hash, StickyNote } from "lucide-react";

interface PurchaseFormProps {
  services: Service[];
  members: Member[];
}

export function PurchaseForm({ services, members }: PurchaseFormProps) {
  const [selectedServiceId, setSelectedServiceId] = useState<string>("");
  const [selectedMemberId, setSelectedMemberId] = useState<string>("");
  const [sessionsTotal, setSessionsTotal] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { addToast } = useToast();

  const selectedService = services.find(s => s.id === selectedServiceId);
  const selectedMember = members.find(m => m.id === selectedMemberId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const formData = new FormData();
    formData.append("member_id", selectedMemberId);
    formData.append("service_id", selectedServiceId);
    formData.append("sessions_total", sessionsTotal);
    formData.append("notes", notes);

    startTransition(async () => {
      try {
        const result = await createPurchasedServiceAction(formData);
        
        if (result.success) {
          addToast({
            type: "success",
            title: "Purchase Created Successfully",
            description: `Service purchase for ${selectedMember?.full_name} has been created and is pending approval.`,
          });
          router.push("/services");
        } else {
          if (result.issues) {
            setFieldErrors(result.issues);
            addToast({
              type: "error",
              title: "Validation Error",
              description: "Please check the form fields and try again.",
            });
          } else {
            setError(result.error);
            addToast({
              type: "error",
              title: "Failed to Create Purchase",
              description: result.error || "An unexpected error occurred. Please try again.",
            });
          }
        }
      } catch {
        const errorMessage = "An unexpected error occurred";
        setError(errorMessage);
        addToast({
          type: "error",
          title: "Unexpected Error",
          description: errorMessage,
        });
      }
    });
  };

  const maxSessions = selectedService?.max_sessions || 100;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Member Selection */}
        <div className="space-y-2">
          <Label htmlFor="member_id" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Member *
          </Label>
          <Select
            value={selectedMemberId}
            onChange={(e) => setSelectedMemberId(e.target.value)}
            className="w-full"
          >
            <option value="">Select a member</option>
            {members.map((member) => (
              <option key={member.id} value={member.id}>
                {member.full_name} - {member.email}
              </option>
            ))}
          </Select>
          {fieldErrors.member_id && (
            <p className="text-sm text-destructive">{fieldErrors.member_id[0]}</p>
          )}
        </div>

        {/* Service Selection */}
        <div className="space-y-2">
          <Label htmlFor="service_id" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Service *
          </Label>
          <Select
            value={selectedServiceId}
            onChange={(e) => setSelectedServiceId(e.target.value)}
            className="w-full"
          >
            <option value="">Select a service</option>
            {services.map((service) => (
              <option key={service.id} value={service.id}>
                {service.name} - {service.price.toFixed(2)} RON
              </option>
            ))}
          </Select>
          {fieldErrors.service_id && (
            <p className="text-sm text-destructive">{fieldErrors.service_id[0]}</p>
          )}
        </div>
      </div>

      {/* Sessions Total */}
      <div className="space-y-2">
        <Label htmlFor="sessions_total" className="flex items-center gap-2">
          <Hash className="h-4 w-4" />
          Number of Sessions *
        </Label>
        <Input
          id="sessions_total"
          type="number"
          min="1"
          max={maxSessions}
          value={sessionsTotal}
          onChange={(e) => setSessionsTotal(e.target.value)}
          placeholder="Enter number of sessions"
        />
        {selectedService && (
          <p className="text-xs text-muted-foreground">
            Maximum {maxSessions} sessions allowed for this service
          </p>
        )}
        {fieldErrors.sessions_total && (
          <p className="text-sm text-destructive">{fieldErrors.sessions_total[0]}</p>
        )}
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes" className="flex items-center gap-2">
          <StickyNote className="h-4 w-4" />
          Notes (Optional)
        </Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add any additional notes..."
          rows={3}
        />
        {fieldErrors.notes && (
          <p className="text-sm text-destructive">{fieldErrors.notes[0]}</p>
        )}
      </div>

      {/* Preview Card */}
      {selectedService && selectedMember && sessionsTotal && (
        <div className="relative">
          {/* Background Glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 rounded-3xl blur-2xl"></div>
          
          <Card className="relative group bg-card/95 backdrop-blur-xl border border-surface/40 shadow-2xl shadow-black/20 transition-all duration-300 hover:shadow-3xl hover:shadow-primary/10 hover:border-primary/50 overflow-hidden rounded-3xl">
            {/* Card Hover Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/2 via-primary/1 to-secondary/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl"></div>
            
            {/* Gradient Border */}
            <div className="absolute inset-0 rounded-3xl">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-transparent via-primary/30 to-transparent" 
                   style={{ 
                     mask: 'linear-gradient(white, white) content-box, linear-gradient(white, white)',
                     maskComposite: 'exclude',
                     WebkitMask: 'linear-gradient(white, white) content-box, linear-gradient(white, white)',
                     WebkitMaskComposite: 'xor',
                     padding: '1px'
                   }}>
              </div>
            </div>
            
            <CardContent className="relative p-8">
              {/* Header */}
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 rounded-2xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <Package className="h-6 w-6 text-primary/60 group-hover:text-primary transition-colors" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-text group-hover:text-primary transition-colors">Purchase Preview</h3>
                  <p className="text-sm text-muted/70 mt-1">Review your service purchase details</p>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 rounded-2xl bg-gradient-to-br from-blue-500/5 to-blue-500/10 border border-blue-500/20">
                  <div className="text-lg font-bold text-blue-600">{sessionsTotal}</div>
                  <div className="text-xs text-muted/70">Sessions</div>
                </div>
                <div className="text-center p-4 rounded-2xl bg-gradient-to-br from-green-500/5 to-green-500/10 border border-green-500/20">
                  <div className="text-lg font-bold text-green-600">{selectedService.duration_minutes}m</div>
                  <div className="text-xs text-muted/70">Duration</div>
                </div>
                <div className="text-center p-4 rounded-2xl bg-gradient-to-br from-orange-500/5 to-orange-500/10 border border-orange-500/20">
                  <div className="text-lg font-bold text-orange-600">{(selectedService.price / (selectedService.max_sessions || 1)).toFixed(0)}</div>
                  <div className="text-xs text-muted/70">Per Session</div>
                </div>
                <div className="text-center p-4 rounded-2xl bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20">
                  <div className="text-lg font-bold text-primary">{selectedService.price.toFixed(0)} RON</div>
                  <div className="text-xs text-muted/70">Total Cost</div>
                </div>
              </div>

              {/* Detailed Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 rounded-2xl bg-surface/20 border border-surface/30 hover:bg-surface/30 transition-colors">
                    <User className="h-5 w-5 text-primary flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-muted/70 uppercase tracking-wider">Member</p>
                      <p className="text-sm font-semibold text-text">{selectedMember.full_name}</p>
                      <p className="text-xs text-muted/60">{selectedMember.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 rounded-2xl bg-surface/20 border border-surface/30 hover:bg-surface/30 transition-colors">
                    <Hash className="h-5 w-5 text-primary flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-muted/70 uppercase tracking-wider">Sessions</p>
                      <p className="text-sm font-semibold text-text">{sessionsTotal} sessions total</p>
                      <p className="text-xs text-muted/60">All sessions available after approval</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 rounded-2xl bg-surface/20 border border-surface/30 hover:bg-surface/30 transition-colors">
                    <Package className="h-5 w-5 text-primary flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-muted/70 uppercase tracking-wider">Service</p>
                      <p className="text-sm font-semibold text-text">{selectedService.name}</p>
                      <p className="text-xs text-muted/60">{selectedService.duration_minutes} minutes per session</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 rounded-2xl bg-surface/20 border border-surface/30 hover:bg-surface/30 transition-colors">
                    <Package className="h-5 w-5 text-primary flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-muted/70 uppercase tracking-wider">Total Cost</p>
                      <p className="text-lg font-bold text-text">{selectedService.price.toFixed(2)} RON</p>
                      <p className="text-xs text-muted/60">{(selectedService.price / (selectedService.max_sessions || 1)).toFixed(2)} RON per session</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Notice */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 via-transparent to-yellow-500/10 rounded-2xl blur-xl"></div>
                <div className="relative p-4 rounded-2xl bg-gradient-to-br from-yellow-500/5 to-yellow-500/10 border border-yellow-500/20">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-yellow-500/10">
                      <StickyNote className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-yellow-800 mb-1">Pending Approval Required</p>
                      <p className="text-xs text-yellow-700 leading-relaxed">
                        This purchase will be created with "Pending" status and require staff approval before the member can book sessions.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Submit Button */}
      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.push("/services")}
          disabled={isPending}
          className="px-6 hover:bg-surface/50 transition-all duration-200 rounded-xl"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isPending || !selectedServiceId || !selectedMemberId || !sessionsTotal}
          className="gap-2 bg-primary hover:bg-primary/90 text-white shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl px-8"
        >
          {isPending ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              Creating Purchase...
            </>
          ) : (
            <>
              <Package className="h-4 w-4" />
              Create Purchase
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
