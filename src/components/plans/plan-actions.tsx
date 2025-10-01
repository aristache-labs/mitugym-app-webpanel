"use client";

import { useState, useTransition, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Eye, Edit, Trash2 } from "lucide-react";
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
      <Link href={`/plans/${planId}/view`}>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary transition-colors"
          title="View Plan"
        >
          <Eye className="h-4 w-4" />
        </Button>
      </Link>
      
      <Link href={`/plans/${planId}`}>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 w-8 p-0 hover:bg-blue-500/10 hover:text-blue-600 transition-colors"
          title="Edit Plan"
        >
          <Edit className="h-4 w-4" />
        </Button>
      </Link>
      
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={() => setShowDeleteConfirm(true)}
        className="h-8 w-8 p-0 hover:bg-red-500/10 hover:text-red-500 transition-colors"
        title="Delete Plan"
        disabled={isPending}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
