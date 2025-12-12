"use client";

import { useState } from "react";
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
      <button
        onClick={() => setShowConfirmModal(true)}
        disabled={isLoading}
        className="checkout-button"
        title="Check Out Member"
      >
        {isLoading ? (
          <div className="checkout-loading">
            <div className="checkout-spinner"></div>
          </div>
        ) : (
          <>
            <svg
              className="checkout-icon"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M9 11l3 3L22 4"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="checkout-text">Check Out</span>
          </>
        )}
        
        <style jsx>{`
          .checkout-button {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            height: 32px;
            padding: 0 14px;
            border-radius: 8px;
            background: linear-gradient(135deg, rgba(77, 212, 212, 0.15) 0%, rgba(45, 212, 191, 0.12) 100%);
            border: 1px solid rgba(77, 212, 212, 0.35);
            color: rgb(77, 212, 212);
            font-weight: 600;
            font-size: 13px;
            cursor: pointer;
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
            white-space: nowrap;
          }
          .checkout-button:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }
          .checkout-icon {
            width: 14px;
            height: 14px;
            transition: all 0.3s ease;
            flex-shrink: 0;
          }
          .checkout-text {
            transition: all 0.3s ease;
          }
          .checkout-loading {
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .checkout-spinner {
            width: 14px;
            height: 14px;
            border: 2px solid rgba(77, 212, 212, 0.3);
            border-top-color: rgb(77, 212, 212);
            border-radius: 50%;
            animation: spin 0.6s linear infinite;
          }
          .checkout-button:hover:not(:disabled) {
            background: linear-gradient(135deg, rgba(77, 212, 212, 0.25) 0%, rgba(45, 212, 191, 0.2) 100%);
            border-color: rgba(77, 212, 212, 0.5);
            box-shadow: 0 0 15px rgba(77, 212, 212, 0.25);
            transform: translateY(-1px);
          }
          .checkout-button:hover:not(:disabled) .checkout-icon {
            transform: scale(1.15);
          }
          .checkout-button:active:not(:disabled) {
            transform: translateY(0);
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </button>

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
