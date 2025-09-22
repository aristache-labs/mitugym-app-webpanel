"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { clearAuditLogsAction } from "@/app/(protected)/actions";
import { useRouter } from "next/navigation";

export function ClearAuditLogsButton() {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string>("");
  const router = useRouter();

  const handleClearLogs = () => {
    startTransition(async () => {
      try {
        const result = await clearAuditLogsAction();
        
        if (!result.success) {
          setError(result.error);
          return;
        }
        
        setError(null);
        setShowConfirmDialog(false);
        setSuccessMessage(result.message);
        setShowSuccessDialog(true);
        router.refresh(); // Refresh the page to show empty audit logs
      } catch (err) {
        setError("An unexpected error occurred");
      }
    });
  };

  return (
    <>
      <Button
        variant="destructive"
        onClick={() => setShowConfirmDialog(true)}
        disabled={isPending}
      >
        Clear Audit Logs
      </Button>

      <Modal
        isOpen={showConfirmDialog}
        onClose={() => !isPending && setShowConfirmDialog(false)}
        title="Clear Audit Logs"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              This action will permanently delete all audit log entries. This cannot be undone.
            </p>
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
              <p className="text-sm font-medium text-destructive">
                ⚠️ Warning: This will clear all historical activity records
              </p>
              <ul className="text-xs text-destructive/80 mt-1 space-y-1">
                <li>• Member creation and updates</li>
                <li>• Plan modifications</li>
                <li>• Schedule changes</li>
                <li>• News/announcement edits</li>
                <li>• All other system activities</li>
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
