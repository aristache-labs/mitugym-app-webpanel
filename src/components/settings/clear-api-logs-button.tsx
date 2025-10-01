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
        size="sm"
      >
        Clear API Logs
      </Button>

      <Modal
        isOpen={showConfirmDialog}
        onClose={() => !isPending && setShowConfirmDialog(false)}
        title="Clear API Logs"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              This action will permanently delete all API log entries. This cannot be undone.
            </p>
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
              <p className="text-sm font-medium text-destructive">
                ⚠️ Warning: This will clear all check-in API request history
              </p>
              <ul className="text-xs text-destructive/80 mt-1 space-y-1">
                <li>• All check-in and checkout requests</li>
                <li>• API verification attempts</li>
                <li>• Rate limiting data</li>
                <li>• Error logs and diagnostics</li>
              </ul>
            </div>
          </div>

          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleClearLogs}
              disabled={isPending}
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
        <div className="space-y-4">
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm">✓</span>
              </div>
              <p className="text-sm font-medium text-green-700">{successMessage}</p>
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button
              onClick={() => setShowSuccessDialog(false)}
              className="bg-green-600 hover:bg-green-700"
            >
              OK
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

