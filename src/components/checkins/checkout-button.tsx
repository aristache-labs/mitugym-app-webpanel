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
      <div className="flex items-center justify-center gap-1.5 sm:gap-2">
        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-success/60 rounded-full"></div>
        <span className="text-[10px] sm:text-xs font-medium text-success/80 bg-success/10 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full border border-success/20 whitespace-nowrap">
          Checked out
        </span>
      </div>
    );
  }

  return (
    <>
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-lg blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <AnimatedButton
          size="sm"
          variant="default"
          onClick={() => setShowConfirmModal(true)}
          disabled={isLoading}
          className="relative h-7 sm:h-8 px-2.5 sm:px-4 text-[10px] sm:text-xs font-semibold bg-gradient-to-r from-primary/20 to-accent/20 border-primary/30 hover:from-primary/30 hover:to-accent/30 hover:border-primary/50 transition-all duration-300 shadow-lg hover:shadow-xl whitespace-nowrap"
        >
          {isLoading ? (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
              <span className="hidden sm:inline">Processing...</span>
              <span className="sm:hidden">...</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-primary rounded-full animate-pulse"></div>
              <span>Check Out</span>
            </div>
          )}
        </AnimatedButton>
      </div>

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
