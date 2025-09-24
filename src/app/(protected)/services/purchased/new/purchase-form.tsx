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
          router.push("/services");
        } else {
          if (result.issues) {
            setFieldErrors(result.issues);
          } else {
            setError(result.error);
          }
        }
      } catch {
        setError("An unexpected error occurred");
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
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-3">Purchase Preview</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Member:</span>
                <div className="font-medium">{selectedMember.full_name}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Service:</span>
                <div className="font-medium">{selectedService.name}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Sessions:</span>
                <div className="font-medium">{sessionsTotal} sessions</div>
              </div>
              <div>
                <span className="text-muted-foreground">Total Cost:</span>
                <div className="font-medium text-lg">
                  {(selectedService.price * parseInt(sessionsTotal || "0")).toFixed(2)} RON
                </div>
              </div>
            </div>
            <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-yellow-800 text-sm">
              📋 This purchase will be created with &ldquo;Pending&rdquo; status and require staff approval before the member can book sessions.
            </div>
          </CardContent>
        </Card>
      )}

      {/* Submit Button */}
      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/services")}
          disabled={isPending}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isPending || !selectedServiceId || !selectedMemberId || !sessionsTotal}
        >
          {isPending ? "Creating Purchase..." : "Create Purchase"}
        </Button>
      </div>
    </form>
  );
}
