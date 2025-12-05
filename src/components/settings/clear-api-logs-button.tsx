"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";

export function ClearApiLogsButton() {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string>("");
  const router = useRouter();
  const { addToast } = useToast();

  const handleClearLogs = () => {
    startTransition(async () => {
      try {
        // Call the API to clear API logs
        const response = await fetch('/api/settings/clear-api-logs', {
          method: 'DELETE',
        });

        const result = await response.json();
        
        if (!result.success) {
          setError(result.error || 'Failed to clear API logs');
          addToast({
            type: 'error',
            title: 'Failed to Clear API Logs',
            description: result.error || 'An unexpected error occurred',
          });
          return;
        }
        
        setError(null);
        setShowConfirmDialog(false);
        setSuccessMessage(result.message || "API logs cleared successfully");
        setShowSuccessDialog(true);
        addToast({
          type: 'success',
          title: 'API Logs Cleared',
          description: 'All API log entries have been permanently deleted.',
        });
        router.refresh(); // Refresh the page to show empty API logs
      } catch (_err) {
        setError("An unexpected error occurred");
        addToast({
          type: 'error',
          title: 'Failed to Clear API Logs',
          description: 'An unexpected error occurred',
        });
      }
    });
  };

  return (
    <>
      <Button
        variant="destructive"
        onClick={() => setShowConfirmDialog(true)}
        disabled={isPending}
        className="h-8 sm:h-9 text-xs sm:text-sm px-3 sm:px-4"
      >
        <span className="hidden sm:inline">Clear API Logs</span>
        <span className="sm:hidden">Clear</span>
      </Button>

      <Modal
        isOpen={showConfirmDialog}
        onClose={() => !isPending && setShowConfirmDialog(false)}
        title="Clear API Logs"
      >
        <div className="space-y-3 sm:space-y-4">
          <div className="space-y-1.5 sm:space-y-2">
            <p className="text-xs sm:text-sm text-muted-foreground">
              This action will permanently delete all API log entries. This cannot be undone.
            </p>
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-2.5 sm:p-3">
              <p className="text-xs sm:text-sm font-medium text-destructive">
                ⚠️ Warning: This will clear all check-in API request history
              </p>
              <ul className="text-[10px] sm:text-xs text-destructive/80 mt-1 space-y-0.5 sm:space-y-1">
                <li>• All check-in and checkout requests</li>
                <li>• API verification attempts</li>
                <li>• Rate limiting data</li>
                <li>• Error logs and diagnostics</li>
              </ul>
            </div>
          </div>

          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-2.5 sm:p-3">
              <p className="text-xs sm:text-sm text-destructive">{error}</p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-0 sm:space-x-2">
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
              disabled={isPending}
              className="h-8 sm:h-9 text-xs sm:text-sm"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleClearLogs}
              disabled={isPending}
              className="h-8 sm:h-9 text-xs sm:text-sm"
            >
              {isPending ? "Clearing..." : "Clear All Logs"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Success Modal */}
      <Modal
        isOpen={showSuccessDialog}
        onClose={() => setShowSuccessDialog(false)}
        title="Success"
      >
        <div className="space-y-3 sm:space-y-4">
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-2.5 sm:p-3">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="w-4 h-4 sm:w-5 sm:h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs sm:text-sm">✓</span>
              </div>
              <p className="text-xs sm:text-sm font-medium text-green-700">{successMessage}</p>
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button
              onClick={() => setShowSuccessDialog(false)}
              className="bg-green-600 hover:bg-green-700 h-8 sm:h-9 text-xs sm:text-sm px-3 sm:px-4"
            >
              OK
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

