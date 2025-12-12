"use client";

import { useState, useTransition, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Eye, Edit } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface MemberActionsProps {
  memberId: string;
  memberName: string;
}

export function MemberActions({ memberId }: MemberActionsProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // Reset confirmation state when memberId changes
  useEffect(() => {
    setShowDeleteConfirm(false);
  }, [memberId]);

  const handleDelete = () => {
    startTransition(async () => {
      try {
        const { deleteMemberAction } = await import("@/app/(protected)/members/actions");
        const result = await deleteMemberAction(memberId);
        
        if (result.success) {
          // Refresh the page to update the table
          router.refresh();
        } else {
          alert(result.error || "Failed to delete member");
        }
      } catch (error) {
        console.error("Delete failed:", error);
        alert("Failed to delete member");
      }
    });
  };

  // Simple confirmation for delete
  if (showDeleteConfirm) {
    return (
      <div className="flex items-center gap-1">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleDelete}
          disabled={isPending}
          className="h-8 px-2 text-xs bg-red-500 hover:bg-red-600 text-white"
        >
          {isPending ? "..." : "Confirm"}
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setShowDeleteConfirm(false)}
          disabled={isPending}
          className="h-8 px-2 text-xs hover:bg-surface/50"
        >
          Cancel
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <Link href={`/members/${memberId}/view`}>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary transition-colors"
          title="View Member"
        >
          <Eye className="h-4 w-4" />
        </Button>
      </Link>
      
      <Link href={`/members/${memberId}`}>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 w-8 p-0 hover:bg-blue-500/10 hover:text-blue-600 transition-colors"
          title="Edit Member"
        >
          <Edit className="h-4 w-4" />
        </Button>
      </Link>
      
      <button 
        onClick={() => setShowDeleteConfirm(true)}
        className="bin-button"
        title="Delete Member"
        disabled={isPending}
      >
        <svg
          className="bin-top"
          viewBox="0 0 39 7"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <line y1="5" x2="39" y2="5" stroke="white" strokeWidth="4"></line>
          <line
            x1="12"
            y1="1.5"
            x2="26.0357"
            y2="1.5"
            stroke="white"
            strokeWidth="3"
          ></line>
        </svg>
        <svg
          className="bin-bottom"
          viewBox="0 0 33 39"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <mask id="path-1-inside-1_8_19" fill="white">
            <path
              d="M0 0H33V35C33 37.2091 31.2091 39 29 39H4C1.79086 39 0 37.2091 0 35V0Z"
            ></path>
          </mask>
          <path
            d="M0 0H33H0ZM37 35C37 39.4183 33.4183 43 29 43H4C-0.418278 43 -4 39.4183 -4 35H4H29H37ZM4 43C-0.418278 43 -4 39.4183 -4 35V0H4V35V43ZM37 0V35C37 39.4183 33.4183 43 29 43V35V0H37Z"
            fill="white"
            mask="url(#path-1-inside-1_8_19)"
          ></path>
          <path d="M12 6L12 29" stroke="white" strokeWidth="4"></path>
          <path d="M21 6V29" stroke="white" strokeWidth="4"></path>
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
            background-color: rgb(255, 95, 95);
            cursor: pointer;
            border: none;
            transition-duration: 0.3s;
          }
          .bin-button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }
          .bin-bottom {
            width: 12px;
          }
          .bin-top {
            width: 14px;
            transform-origin: right;
            transition-duration: 0.3s;
          }
          .bin-button:hover .bin-top {
            transform: rotate(45deg);
          }
          .bin-button:hover {
            background-color: rgb(255, 0, 0);
          }
          .bin-button:active {
            transform: scale(0.9);
          }
        `}</style>
      </button>
    </div>
  );
}
