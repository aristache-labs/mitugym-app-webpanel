"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, AlertTriangle, X } from "lucide-react";
import { useRouter } from "next/navigation";

interface DeleteMemberButtonProps {
  memberId: string;
  memberName: string;
}

export function DeleteMemberButton({ memberId, memberName }: DeleteMemberButtonProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleDelete = () => {
    startTransition(async () => {
      try {
        // Import the delete action dynamically
        const { deleteMemberAction } = await import("@/app/(protected)/members/actions");
        const result = await deleteMemberAction(memberId);
        
        if (result.success) {
          // Redirect to members page on success
          router.push("/members");
        } else {
          // Handle error - you could add toast notification here
          alert(result.error || "Failed to delete member");
        }
      } catch (error) {
        console.error("Delete failed:", error);
        alert("Failed to delete member");
      }
    });
  };

  if (showConfirm) {
    return (
      <div className="flex items-center gap-2">
        {/* Premium Confirmation Overlay */}
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={() => setShowConfirm(false)}>
          <div className="relative bg-gradient-to-br from-card/95 to-card/90 backdrop-blur-xl border border-red-500/20 shadow-2xl rounded-3xl p-8 max-w-lg w-full mx-4" onClick={(e) => e.stopPropagation()}>
            {/* Gradient border effect */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-red-500/20 via-transparent to-red-600/20 -z-10" />
            
            <div className="flex items-start gap-4 mb-6">
              <div className="p-3 rounded-2xl bg-red-500/15 border border-red-500/20">
                <AlertTriangle className="h-6 w-6 text-red-500" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-text mb-1">Delete Member</h3>
                <p className="text-sm text-red-400 font-medium">⚠️ This action cannot be undone</p>
              </div>
            </div>
            
            <div className="p-4 rounded-2xl bg-red-500/5 border border-red-500/10 mb-6">
              <p className="text-sm text-muted leading-relaxed">
                Are you sure you want to permanently delete <strong className="text-text font-semibold">{memberName}</strong>?
              </p>
              <ul className="mt-3 space-y-1 text-xs text-muted/80">
                <li>• Member profile and personal information</li>
                <li>• Complete check-in history</li>
                <li>• Membership records and payments</li>
                <li>• All associated data and settings</li>
              </ul>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                onClick={handleDelete}
                disabled={isPending}
                className="flex-1 h-10 text-sm px-6 bg-gradient-to-br from-red-600/90 via-red-600/95 to-red-700 hover:from-red-600 hover:via-red-600/95 hover:to-red-700 text-white border border-red-500/40 hover:border-red-500/60 transition-all duration-300 shadow-lg shadow-red-500/20 hover:shadow-xl hover:shadow-red-500/30 backdrop-blur-sm font-medium disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Member
                  </>
                )}
              </Button>
              <Button
                onClick={() => setShowConfirm(false)}
                disabled={isPending}
                className="flex-1 h-10 text-sm px-6 bg-gradient-to-br from-slate-800/50 via-slate-800/40 to-slate-900/50 hover:from-slate-800/70 hover:via-slate-800/60 hover:to-slate-900/70 text-slate-300 hover:text-slate-100 border border-slate-700/50 hover:border-slate-600/70 transition-all duration-300 shadow-md shadow-black/10 hover:shadow-lg hover:shadow-black/20 backdrop-blur-sm font-medium disabled:opacity-70 disabled:cursor-not-allowed"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Button
      onClick={() => setShowConfirm(true)}
      className="gap-2 h-9 text-sm px-4 bg-gradient-to-br from-red-600/90 via-red-600/95 to-red-700 hover:from-red-600 hover:via-red-600/95 hover:to-red-700 text-white border border-red-500/40 hover:border-red-500/60 transition-all duration-300 shadow-lg shadow-red-500/20 hover:shadow-xl hover:shadow-red-500/30 backdrop-blur-sm font-medium"
    >
      <Trash2 className="h-4 w-4" />
      Delete Member
    </Button>
  );
}
