"use client";

import { useState, useTransition } from "react";
import { Trash2, AlertTriangle } from "lucide-react";
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
              <button
                onClick={handleDelete}
                disabled={isPending}
                className="flex-1 h-10 text-sm px-6 bg-gradient-to-br from-red-600/90 via-red-600/95 to-red-700 hover:from-red-600 hover:via-red-600/95 hover:to-red-700 text-white border-0 transition-all duration-300 shadow-lg shadow-red-500/20 hover:shadow-xl hover:shadow-red-500/30 backdrop-blur-sm font-medium disabled:opacity-70 disabled:cursor-not-allowed rounded-xl"
              >
                {isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2 inline-block" />
                    Deleting...
                  </>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <Trash2 className="h-4 w-4" />
                    Delete Member
                  </div>
                )}
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                disabled={isPending}
                className="flex-1 h-10 text-sm px-6 bg-gradient-to-br from-slate-800/50 via-slate-800/40 to-slate-900/50 hover:from-slate-800/70 hover:via-slate-800/60 hover:to-slate-900/70 text-slate-300 hover:text-slate-100 border-0 transition-all duration-300 shadow-md shadow-black/10 hover:shadow-lg hover:shadow-black/20 backdrop-blur-sm font-medium disabled:opacity-70 disabled:cursor-not-allowed rounded-xl"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className="group/delete relative h-9 sm:h-10 px-4 sm:px-6 flex items-center justify-center gap-1.5 sm:gap-2 bg-gradient-to-br from-red-700/75 via-red-900/45 to-red-700/75 hover:from-red-600/85 hover:via-red-800/55 hover:to-red-600/85 text-white font-medium text-xs sm:text-sm rounded-2xl backdrop-blur-sm shadow-md shadow-red-900/30 hover:shadow-lg hover:shadow-red-950/40 transition-all duration-500 ease-out overflow-hidden border-0 !ring-0 !outline-none active:scale-95"
    >
      {/* Shine Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/delete:translate-x-full transition-transform duration-1000 ease-in-out"></div>
      
      {/* Icon with animation */}
      <div className="relative z-10 flex items-center justify-center transition-all duration-500 ease-in-out group-hover/delete:scale-125 group-hover/delete:translate-x-[3.4em]">
        <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 transition-all duration-500 ease-in-out text-red-200/70 group-hover/delete:text-red-50 group-hover/delete:scale-110" />
      </div>
      
      {/* Text */}
      <span className="hidden sm:inline transition-all duration-500 ease-in-out group-hover/delete:opacity-0">
        Delete Member
      </span>
      <span className="sm:hidden transition-all duration-500 ease-in-out group-hover/delete:opacity-0">
        Delete Member
      </span>
    </button>
  );
}
