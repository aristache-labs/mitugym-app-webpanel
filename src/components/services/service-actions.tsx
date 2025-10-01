"use client";

import { useState, useTransition, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Eye, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface ServiceActionsProps {
  serviceId: string;
  serviceName: string;
}

export function ServiceActions({ serviceId, serviceName }: ServiceActionsProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // Reset confirmation state when serviceId changes
  useEffect(() => {
    setShowDeleteConfirm(false);
  }, [serviceId]);

  const handleDelete = () => {
    startTransition(async () => {
      try {
        const { deleteServiceAction } = await import("@/app/(protected)/services/actions");
        const result = await deleteServiceAction(serviceId);
        
        if (result.success) {
          // Refresh the page to update the table
          router.refresh();
        } else {
          alert(result.error || "Failed to delete service");
        }
      } catch (error) {
        console.error("Delete failed:", error);
        alert("Failed to delete service");
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
      <Link href={`/services/${serviceId}/view`}>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary transition-colors"
          title="View Service"
        >
          <Eye className="h-4 w-4" />
        </Button>
      </Link>
      
      <Link href={`/services/${serviceId}/edit`}>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 w-8 p-0 hover:bg-blue-500/10 hover:text-blue-600 transition-colors"
          title="Edit Service"
        >
          <Edit className="h-4 w-4" />
        </Button>
      </Link>
      
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={() => setShowDeleteConfirm(true)}
        className="h-8 w-8 p-0 hover:bg-red-500/10 hover:text-red-500 transition-colors"
        title="Delete Service"
        disabled={isPending}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
