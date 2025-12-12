"use client";

import { useState, useTransition } from "react";
import { AnimatedButton } from "@/components/ui/animated-button";
import { FloatingLabelInput } from "@/components/ui/floating-label-input";
import { FloatingLabelSelect } from "@/components/ui/floating-label-select";
import { Card, CardContent } from "@/components/ui/card";
import { createPurchasedServiceAction } from "@/app/(protected)/actions";
import { Service, Member } from "@/types";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import { User, Package, Hash, StickyNote, FileText } from "lucide-react";

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {/* Member Selection */}
        <FloatingLabelSelect
          value={selectedMemberId}
          onChange={(value) => setSelectedMemberId(value)}
          label="Member"
          icon={<User className="w-full h-full" />}
          error={fieldErrors.member_id?.[0]}
          options={[
            { value: "", label: "Select a member", disabled: true },
            ...members.map((member) => ({
              value: member.id,
              label: `${member.full_name} - ${member.email}`
            }))
          ]}
        />

        {/* Service Selection */}
        <div className="pt-2 lg:pt-0">
          <FloatingLabelSelect
            value={selectedServiceId}
            onChange={(value) => setSelectedServiceId(value)}
            label="Service"
            icon={<Package className="w-full h-full" />}
            error={fieldErrors.service_id?.[0]}
            options={[
              { value: "", label: "Select a service", disabled: true },
              ...services.map((service) => ({
                value: service.id,
                label: `${service.name} - ${service.price.toFixed(2)} RON`
              }))
            ]}
          />
        </div>
      </div>

      {/* Sessions Total */}
      <div className="pt-2">
        <FloatingLabelInput
          label="Number of Sessions"
          type="number"
          min={1}
          max={maxSessions}
          value={sessionsTotal}
          onChange={(e) => setSessionsTotal(e.target.value)}
          placeholder="Number of Sessions"
          icon={<Hash className="w-full h-full" />}
          error={fieldErrors.sessions_total?.[0]}
        />
        {selectedService && (
          <p className="text-xs text-muted/60 mt-2 ml-1">
            Maximum {maxSessions} sessions allowed for this service
          </p>
        )}
      </div>

      {/* Notes */}
      <div>
        <div className="relative pt-1.5">
          <label 
            htmlFor="notes-textarea"
            className={`absolute -top-[18px] sm:-top-[18px] left-[5px] text-sm font-normal transition-all duration-200 translate-x-3 ${
              notes && notes.length > 0 ? 'opacity-100 text-text/80' : 'opacity-0'
            } ${fieldErrors.notes ? 'text-error' : ''}`}
          >
            Notes (Optional)
          </label>
          <div 
            className={`absolute -top-[16px] sm:-top-[16px] -left-[12px] w-3.5 h-3.5 transition-all duration-200 translate-x-3 ${
              notes && notes.length > 0 ? 'opacity-100' : 'opacity-0'
            } ${fieldErrors.notes ? 'text-error' : 'text-primary'}`}
          >
            <FileText className="w-full h-full" />
          </div>
          <textarea
            id="notes-textarea"
            rows={3}
            placeholder="Notes (Optional)"
            className={`w-full rounded-2xl border-2 ${
              fieldErrors.notes ? 'border-error' : 'border-surface/50 focus:border-primary'
            } bg-surface/30 px-4 py-3 text-sm text-text placeholder:text-muted/40 outline-none transition-all duration-200 focus:bg-surface/50 resize-none`}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
        {fieldErrors.notes && (
          <p className="text-sm text-destructive mt-1.5">{fieldErrors.notes[0]}</p>
        )}
      </div>

      {/* Preview Card */}
      {selectedService && selectedMember && sessionsTotal && (
        <Card className="group relative bg-card/95 backdrop-blur-xl border border-surface/40 shadow-md transition-all duration-300 hover:shadow-lg hover:border-primary/40 overflow-hidden rounded-2xl sm:rounded-3xl">
          {/* Card Hover Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/2 via-primary/1 to-secondary/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl sm:rounded-3xl"></div>
          
          <CardContent className="relative p-4 sm:p-5">
            {/* Header */}
            <div className="flex items-center gap-2 sm:gap-3 mb-4">
              <div className="p-1.5 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <Package className="h-4 w-4 sm:h-5 sm:w-5 text-primary/60 group-hover:text-primary transition-colors" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-text group-hover:text-primary transition-colors">Purchase Preview</h3>
                <p className="text-[10px] sm:text-xs text-muted/70 mt-0.5">Review your service purchase details</p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-4">
              <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-500/5 to-blue-500/10 border-0">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-1.5 sm:p-2 rounded-lg bg-blue-500/20 border-0">
                    <Hash className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-muted/70">Sessions</p>
                    <p className="text-xl sm:text-2xl font-bold text-text">{sessionsTotal}</p>
                  </div>
                </div>
              </div>
              <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-br from-green-500/5 to-green-500/10 border-0">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-1.5 sm:p-2 rounded-lg bg-green-500/20 border-0">
                    <Package className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-muted/70">Duration</p>
                    <p className="text-xl sm:text-2xl font-bold text-text">{selectedService.duration_minutes}m</p>
                  </div>
                </div>
              </div>
              <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-br from-orange-500/5 to-orange-500/10 border-0">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-1.5 sm:p-2 rounded-lg bg-orange-500/20 border-0">
                    <Hash className="h-4 w-4 sm:h-5 sm:w-5 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-muted/70">Per Session</p>
                    <p className="text-xl sm:text-2xl font-bold text-text">{(selectedService.price / (selectedService.max_sessions || 1)).toFixed(0)}</p>
                  </div>
                </div>
              </div>
              <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary/5 to-primary/10 border-0">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-1.5 sm:p-2 rounded-lg bg-primary/20 border-0">
                    <Package className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-muted/70">Total Cost</p>
                    <p className="text-xl sm:text-2xl font-bold text-text">{selectedService.price.toFixed(0)} RON</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed Information */}
            <div className="grid lg:grid-cols-2 gap-2.5 sm:gap-3 mb-4">
              {/* Member Info Container */}
              <div className="relative backdrop-blur-xl bg-gradient-to-br from-primary/5 via-primary/3 to-transparent rounded-xl border-0 p-2.5 shadow-md hover:shadow-lg transition-all duration-300">
                <div className="flex items-center gap-2 mb-2 pb-2 border-b border-primary/10">
                  <div className="p-1.5 rounded-lg bg-primary/10 backdrop-blur-sm">
                    <User className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <h4 className="text-[11px] font-bold text-text uppercase tracking-wider">Member Details</h4>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-gradient-to-br from-surface/60 to-surface/40 backdrop-blur-sm border-0 hover:from-surface/70 hover:to-surface/50 transition-all duration-200 group/card shadow-sm">
                    <div className="p-1.5 rounded-md bg-primary/15 group-hover/card:bg-primary/25 transition-colors backdrop-blur-sm">
                      <User className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-medium text-primary/80 uppercase tracking-wide">Full Name</p>
                      <p className="text-xs text-text font-semibold truncate">{selectedMember.full_name}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-gradient-to-br from-surface/60 to-surface/40 backdrop-blur-sm border-0 hover:from-surface/70 hover:to-surface/50 transition-all duration-200 group/card shadow-sm">
                    <div className="p-1.5 rounded-md bg-primary/15 group-hover/card:bg-primary/25 transition-colors backdrop-blur-sm">
                      <User className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-medium text-primary/80 uppercase tracking-wide">Email</p>
                      <p className="text-xs text-text font-semibold truncate">{selectedMember.email}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Service Info Container */}
              <div className="relative backdrop-blur-xl bg-gradient-to-br from-primary/5 via-primary/3 to-transparent rounded-xl border-0 p-2.5 shadow-md hover:shadow-lg transition-all duration-300">
                <div className="flex items-center gap-2 mb-2 pb-2 border-b border-primary/10">
                  <div className="p-1.5 rounded-lg bg-primary/10 backdrop-blur-sm">
                    <Package className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <h4 className="text-[11px] font-bold text-text uppercase tracking-wider">Service Details</h4>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-gradient-to-br from-surface/60 to-surface/40 backdrop-blur-sm border-0 hover:from-surface/70 hover:to-surface/50 transition-all duration-200 group/card shadow-sm">
                    <div className="p-1.5 rounded-md bg-primary/15 group-hover/card:bg-primary/25 transition-colors backdrop-blur-sm">
                      <Package className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-medium text-primary/80 uppercase tracking-wide">Service Name</p>
                      <p className="text-xs text-text font-semibold truncate">{selectedService.name}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-gradient-to-br from-surface/60 to-surface/40 backdrop-blur-sm border-0 hover:from-surface/70 hover:to-surface/50 transition-all duration-200 group/card shadow-sm">
                    <div className="p-1.5 rounded-md bg-primary/15 group-hover/card:bg-primary/25 transition-colors backdrop-blur-sm">
                      <Hash className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-medium text-primary/80 uppercase tracking-wide">Total Sessions</p>
                      <p className="text-xs text-text font-semibold">{sessionsTotal} sessions</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Status Notice */}
            <div className="relative backdrop-blur-xl bg-gradient-to-br from-amber-500/12 via-orange-500/10 to-amber-600/12 rounded-xl border-0 p-3 shadow-lg shadow-amber-950/20">
              {/* Animated border glow */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-amber-400/20 to-transparent animate-pulse"></div>
              
              <div className="relative flex items-start gap-2.5">
                <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500/30 to-orange-600/30 backdrop-blur-sm flex-shrink-0 border-0 shadow-md">
                  <StickyNote className="h-4 w-4 text-amber-300" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-amber-200 uppercase tracking-wider mb-1.5 flex items-center gap-2">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                    Action Required - Pending Approval
                  </p>
                  <p className="text-xs text-amber-100/80 leading-relaxed">
                    This purchase will be created with <span className="font-semibold text-amber-200">"Pending"</span> status and require staff approval before the member can book sessions.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Submit Button */}
      <div className="flex justify-end pt-2 sm:pt-0">
        <AnimatedButton
          type="submit" 
          disabled={isPending || !selectedServiceId || !selectedMemberId || !sessionsTotal}
          className="w-full sm:w-auto h-10 sm:h-10 px-6 sm:px-6 text-sm sm:text-sm bg-gradient-to-br from-slate-700/75 via-cyan-900/45 to-slate-700/75 hover:from-slate-600/85 hover:via-cyan-800/55 hover:to-slate-600/85 text-slate-200 hover:text-white border-0 !ring-0 !outline-none transition-all duration-500 ease-out shadow-md shadow-black/20 hover:shadow-lg hover:shadow-cyan-950/25 backdrop-blur-sm font-medium relative z-10"
        >
          {isPending ? "Creating..." : "Create Purchase"}
        </AnimatedButton>
      </div>
    </form>
  );
}

