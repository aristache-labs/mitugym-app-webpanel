"use client";

import { useState, useTransition, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface PlanActionsProps {
  planId: string;
  planName: string;
}

export function PlanActions({ planId, planName }: PlanActionsProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // Reset confirmation state when planId changes
  useEffect(() => {
    setShowDeleteConfirm(false);
  }, [planId]);

  const handleDelete = () => {
    startTransition(async () => {
      try {
        const { deletePlanAction } = await import("@/app/(protected)/plans/actions");
        const result = await deletePlanAction(planId);
        
        if (result.success) {
          // Refresh the page to update the table
          router.refresh();
        } else {
          alert(result.error || "Failed to delete plan");
        }
      } catch (error) {
        console.error("Delete failed:", error);
        alert("Failed to delete plan");
      }
    });
  };

  // Simple confirmation for delete
  if (showDeleteConfirm) {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={handleDelete}
          disabled={isPending}
          className="confirm-button"
          title="Confirm Delete"
        >
          <svg
            className="confirm-icon"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M5 13l4 4L19 7"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="confirm-text">{isPending ? "..." : "Yes"}</span>
          
          <style jsx>{`
            .confirm-button {
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 6px;
              height: 32px;
              padding: 0 14px;
              border-radius: 8px;
              background: linear-gradient(135deg, rgba(255, 107, 107, 0.15) 0%, rgba(239, 68, 68, 0.12) 100%);
              border: 1px solid rgba(255, 107, 107, 0.35);
              color: rgb(255, 107, 107);
              font-weight: 600;
              font-size: 13px;
              cursor: pointer;
              transition: all 0.3s ease;
              position: relative;
              overflow: hidden;
            }
            .confirm-button:disabled {
              opacity: 0.5;
              cursor: not-allowed;
            }
            .confirm-icon {
              width: 14px;
              height: 14px;
              transition: all 0.3s ease;
            }
            .confirm-text {
              transition: all 0.3s ease;
            }
            .confirm-button:hover:not(:disabled) {
              background: linear-gradient(135deg, rgba(255, 107, 107, 0.25) 0%, rgba(239, 68, 68, 0.2) 100%);
              border-color: rgba(255, 107, 107, 0.5);
              box-shadow: 0 0 15px rgba(255, 107, 107, 0.25);
              transform: translateY(-1px);
            }
            .confirm-button:hover:not(:disabled) .confirm-icon {
              transform: scale(1.15);
            }
            .confirm-button:active:not(:disabled) {
              transform: translateY(0);
            }
          `}</style>
        </button>
        
        <button
          onClick={() => setShowDeleteConfirm(false)}
          disabled={isPending}
          className="cancel-button"
          title="Cancel"
        >
          <svg
            className="cancel-icon"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M6 18L18 6M6 6l12 12"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="cancel-text">No</span>
          
          <style jsx>{`
            .cancel-button {
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 6px;
              height: 32px;
              padding: 0 14px;
              border-radius: 8px;
              background: linear-gradient(135deg, rgba(107, 114, 128, 0.12) 0%, rgba(75, 85, 99, 0.1) 100%);
              border: 1px solid rgba(107, 114, 128, 0.3);
              color: rgba(156, 163, 175, 0.9);
              font-weight: 600;
              font-size: 13px;
              cursor: pointer;
              transition: all 0.3s ease;
              position: relative;
              overflow: hidden;
            }
            .cancel-button:disabled {
              opacity: 0.5;
              cursor: not-allowed;
            }
            .cancel-icon {
              width: 14px;
              height: 14px;
              transition: all 0.3s ease;
            }
            .cancel-text {
              transition: all 0.3s ease;
            }
            .cancel-button:hover:not(:disabled) {
              background: linear-gradient(135deg, rgba(107, 114, 128, 0.2) 0%, rgba(75, 85, 99, 0.18) 100%);
              border-color: rgba(107, 114, 128, 0.45);
              color: rgb(156, 163, 175);
              box-shadow: 0 0 12px rgba(107, 114, 128, 0.15);
              transform: translateY(-1px);
            }
            .cancel-button:hover:not(:disabled) .cancel-icon {
              transform: rotate(90deg) scale(1.1);
            }
            .cancel-button:active:not(:disabled) {
              transform: translateY(0);
            }
          `}</style>
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <Link href={`/plans/${planId}/view`}>
        <button
          className="view-button"
          title="View Plan"
        >
          <svg
            className="view-svgIcon"
            viewBox="0 0 576 512"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M288 32c-80.8 0-145.5 36.8-192.6 80.6C48.6 156 17.3 208 2.5 243.7c-3.3 7.9-3.3 16.7 0 24.6C17.3 304 48.6 356 95.4 399.4C142.5 443.2 207.2 480 288 480s145.5-36.8 192.6-80.6c46.8-43.5 78.1-95.4 93-131.1c3.3-7.9 3.3-16.7 0-24.6c-14.9-35.7-46.2-87.7-93-131.1C433.5 68.8 368.8 32 288 32zM144 256a144 144 0 1 1 288 0 144 144 0 1 1 -288 0zm144-64c0 35.3-28.7 64-64 64c-7.1 0-13.9-1.2-20.3-3.3c-5.5-1.8-11.9 1.6-11.7 7.4c.3 6.9 1.3 13.8 3.2 20.7c13.7 51.2 66.4 81.6 117.6 67.9s81.6-66.4 67.9-117.6c-11.1-41.5-47.8-69.4-88.6-71.1c-5.8-.2-9.2 6.1-7.4 11.7c2.1 6.4 3.3 13.2 3.3 20.3z"
              fill="white"
            />
          </svg>
          
          <style jsx>{`
            .view-button {
              width: 32px;
              height: 32px;
              border-radius: 8px;
              background-color: rgba(77, 212, 212, 0.12);
              border: 1px solid rgba(77, 212, 212, 0.25);
              font-weight: 600;
              display: flex;
              align-items: center;
              justify-content: center;
              cursor: pointer;
              transition: all 0.3s ease;
              overflow: hidden;
              position: relative;
            }

            .view-svgIcon {
              width: 15px;
              transition: all 0.3s ease;
            }

            .view-svgIcon path {
              fill: rgba(77, 212, 212, 0.9);
            }

            .view-button:hover {
              background-color: rgba(77, 212, 212, 0.18);
              border-color: rgba(77, 212, 212, 0.4);
              box-shadow: 0 0 12px rgba(77, 212, 212, 0.2);
            }

            .view-button:hover .view-svgIcon {
              transform: scale(1.1);
            }

            .view-button:hover .view-svgIcon path {
              fill: rgb(77, 212, 212);
            }

            .view-button:active {
              transform: scale(0.95);
            }
          `}</style>
        </button>
      </Link>
      
      <Link href={`/plans/${planId}`}>
        <button 
          className="edit-button"
          title="Edit Plan"
        >
          <svg
            className="edit-svgIcon"
            viewBox="0 0 512 512"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M410.3 231l11.3-11.3-33.9-33.9-62.1-62.1L291.7 89.8l-11.3 11.3-22.6 22.6L58.6 322.9c-10.4 10.4-18 23.3-22.2 37.4L1 480.7c-2.5 8.4-.2 17.5 6.1 23.7s15.3 8.5 23.7 6.1l120.3-35.4c14.1-4.2 27-11.8 37.4-22.2L387.7 253.7 410.3 231zM160 399.4l-9.1 22.7c-4 3.1-8.5 5.4-13.3 6.9L59.4 452l23-78.1c1.4-4.9 3.8-9.4 6.9-13.3l22.7-9.1v32c0 8.8 7.2 16 16 16h32zM362.7 18.7L348.3 33.2 325.7 55.8 314.3 67.1l33.9 33.9 62.1 62.1 33.9 33.9 11.3-11.3 22.6-22.6 14.5-14.5c25-25 25-65.5 0-90.5L453.3 18.7c-25-25-65.5-25-90.5 0zm-47.4 168l-144 144c-6.2 6.2-16.4 6.2-22.6 0s-6.2-16.4 0-22.6l144-144c6.2-6.2 16.4-6.2 22.6 0s6.2 16.4 0 22.6z"
              fill="white"
            />
          </svg>
          
          <style jsx>{`
            .edit-button {
              width: 32px;
              height: 32px;
              border-radius: 8px;
              background-color: rgba(77, 212, 212, 0.12);
              border: 1px solid rgba(77, 212, 212, 0.25);
              font-weight: 600;
              display: flex;
              align-items: center;
              justify-content: center;
              cursor: pointer;
              transition: all 0.3s ease;
              overflow: hidden;
              position: relative;
            }

            .edit-svgIcon {
              width: 13px;
              transition: all 0.3s ease;
            }

            .edit-svgIcon path {
              fill: rgba(77, 212, 212, 0.9);
            }

            .edit-button:hover {
              background-color: rgba(77, 212, 212, 0.18);
              border-color: rgba(77, 212, 212, 0.4);
              box-shadow: 0 0 12px rgba(77, 212, 212, 0.2);
            }

            .edit-button:hover .edit-svgIcon {
              transform: rotate(-12deg) scale(1.05);
            }

            .edit-button:hover .edit-svgIcon path {
              fill: rgb(77, 212, 212);
            }

            .edit-button:active {
              transform: scale(0.95);
            }
          `}</style>
        </button>
      </Link>
      
      <button 
        onClick={() => setShowDeleteConfirm(true)}
        className="bin-button"
        title="Delete Plan"
        disabled={isPending}
      >
        <svg
          className="bin-top"
          viewBox="0 0 39 7"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <line y1="5" x2="39" y2="5" strokeWidth="4"></line>
          <line
            x1="12"
            y1="1.5"
            x2="26.0357"
            y2="1.5"
            strokeWidth="3"
          ></line>
        </svg>
        <svg
          className="bin-bottom"
          viewBox="0 0 33 39"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <mask id="path-1-inside-1_8_19-plan" fill="rgba(255, 107, 107, 0.9)">
            <path
              d="M0 0H33V35C33 37.2091 31.2091 39 29 39H4C1.79086 39 0 37.2091 0 35V0Z"
            ></path>
          </mask>
          <path
            d="M0 0H33H0ZM37 35C37 39.4183 33.4183 43 29 43H4C-0.418278 43 -4 39.4183 -4 35H4H29H37ZM4 43C-0.418278 43 -4 39.4183 -4 35V0H4V35V43ZM37 0V35C37 39.4183 33.4183 43 29 43V35V0H37Z"
            fill="rgba(255, 107, 107, 0.9)"
            mask="url(#path-1-inside-1_8_19-plan)"
          ></path>
          <path d="M12 6L12 29" strokeWidth="4"></path>
          <path d="M21 6V29" strokeWidth="4"></path>
        </svg>
        
        <style jsx>{`
          .bin-button {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            width: 32px;
            height: 32px;
            border-radius: 8px;
            background-color: rgba(255, 107, 107, 0.12);
            border: 1px solid rgba(255, 107, 107, 0.25);
            cursor: pointer;
            transition: all 0.3s ease;
          }
          .bin-button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }
          .bin-bottom {
            width: 12px;
            transition: all 0.3s ease;
          }
          .bin-top {
            width: 14px;
            transform-origin: right;
            transition: all 0.3s ease;
          }
          .bin-bottom path {
            stroke: rgba(255, 107, 107, 0.9);
            fill: rgba(255, 107, 107, 0.9);
          }
          .bin-top line {
            stroke: rgba(255, 107, 107, 0.9);
          }
          .bin-button:hover {
            background-color: rgba(255, 107, 107, 0.18);
            border-color: rgba(255, 107, 107, 0.4);
            box-shadow: 0 0 12px rgba(255, 107, 107, 0.2);
          }
          .bin-button:hover .bin-top {
            transform: rotate(15deg);
          }
          .bin-button:hover .bin-bottom path {
            stroke: rgb(255, 107, 107);
            fill: rgb(255, 107, 107);
          }
          .bin-button:hover .bin-top line {
            stroke: rgb(255, 107, 107);
          }
          .bin-button:active {
            transform: scale(0.95);
          }
        `}</style>
      </button>
    </div>
  );
}
