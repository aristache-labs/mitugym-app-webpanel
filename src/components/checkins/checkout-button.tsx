"use client";

import { useState } from "react";
import { AnimatedButton } from "@/components/ui/animated-button";
import { ConfirmationModal } from "@/components/ui/modal";
import { manualCheckoutAction } from "@/app/(protected)/actions";

interface CheckoutButtonProps {
  checkinId: string;
  memberName: string;
  isCheckedOut: boolean;
}

export function CheckoutButton({ checkinId, memberName, isCheckedOut }: CheckoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleCheckout = async () => {
    if (isCheckedOut) return;
    setIsLoading(true);
    try {
      const result = await manualCheckoutAction(checkinId);
      if (!result.success) {
        console.error("Checkout failed:", result.error);
        // The action will handle the error display through revalidation
      }
    } catch (error) {
      console.error("Checkout failed:", error);
      // The action will handle the error display through revalidation
    } finally {
      setIsLoading(false);
    }
  };

  if (isCheckedOut) {
    return (
      <span className="text-xs text-muted">
        Checked out
      </span>
    );
  }

  return (
    <>
      <AnimatedButton
        size="sm"
        variant="default"
        onClick={() => setShowConfirmModal(true)}
        disabled={isLoading}
        className="h-7 px-2 text-xs"
      >
        {isLoading ? "..." : "Check Out"}
      </AnimatedButton>

      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleCheckout}
        title="Check Out Member"
        description={`Are you sure you want to check out ${memberName}? This will calculate their session duration and mark them as having left the gym.`}
        confirmText="Check Out"
        variant="default"
      />
    </>
  );
}
