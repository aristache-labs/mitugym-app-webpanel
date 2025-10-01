"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-table/data-table";
import { Button } from "@/components/ui/button";
import { deleteNewsAction, toggleNewsActiveAction } from "@/app/(protected)/actions";
import type { NewsItem } from "@/types";
import { ConfirmationModal } from "@/components/ui/modal";
import { Pencil, Trash2, Power, Plus } from "lucide-react";

interface NewsManagerProps {
  items: NewsItem[];
}

export function NewsManager({ items }: NewsManagerProps) {
  const router = useRouter();
  const [isDeleting, startTransition] = useTransition();
  const [isToggling, startToggleTransition] = useTransition();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<NewsItem | null>(null);

  const handleDelete = async () => {
    if (!itemToDelete) return;
    
    startTransition(async () => {
      const result = await deleteNewsAction(itemToDelete.id);
      if (!result.success) {
        console.error("Delete news failed:", result.error);
        // The action will handle the error display through revalidation
      }
      setItemToDelete(null);
    });
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    startToggleTransition(async () => {
      const result = await toggleNewsActiveAction(id, !currentStatus);
      if (!result.success) {
        console.error("Toggle active failed:", result.error);
      }
    });
  };

  const columns = useMemo<ColumnDef<NewsItem>[]>(
    () => [
      {
        accessorKey: "title",
        header: "Title",
        cell: ({ row }) => (
          <div className="space-y-1">
            <p className="font-semibold text-text">{row.original.title}</p>
            <p className="text-xs text-muted/60 line-clamp-1">{row.original.content.substring(0, 60)}...</p>
          </div>
        ),
      },
      {
        accessorKey: "priority",
        header: "Priority",
        cell: ({ row }) => {
          const priority = row.original.priority;
          const styles = {
            low: { bg: "bg-primary/10", text: "text-primary", border: "border-primary/30", dot: "bg-primary" },
            medium: { bg: "bg-warning/10", text: "text-warning", border: "border-warning/30", dot: "bg-warning" },
            high: { bg: "bg-error/10", text: "text-error", border: "border-error/30", dot: "bg-error" }
          };
          const style = styles[priority as keyof typeof styles];
          
          return (
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border ${style.bg} ${style.text} ${style.border}`}>
              <div className={`w-2 h-2 rounded-full ${style.dot}`}></div>
              {priority.charAt(0).toUpperCase() + priority.slice(1)}
            </div>
          );
        },
      },
      {
        accessorKey: "is_active",
        header: "Status",
        cell: ({ row }) => {
          const isActive = row.original.is_active !== false; // Default to true if undefined
          
          return (
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border ${
              isActive
                ? "bg-success/10 text-success border-success/30"
                : "bg-gray-500/10 text-gray-400 border-gray-500/30"
            }`}>
              <div className={`w-2 h-2 rounded-full ${isActive ? "bg-success" : "bg-gray-500"}`}></div>
              {isActive ? "Active" : "Inactive"}
            </div>
          );
        },
      },
      {
        accessorKey: "expires_at",
        header: "Expires",
        cell: ({ row }) => {
          if (!row.original.expires_at) {
            return (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-success rounded-full"></div>
                <span className="text-sm text-success font-medium">Never</span>
              </div>
            );
          }
          const date = new Date(row.original.expires_at);
          const isExpired = date < new Date();
          return (
            <div className="space-y-1">
              <p className={`text-sm font-semibold ${isExpired ? 'text-error' : 'text-text'}`}>
                {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
              {isExpired && (
                <p className="text-xs text-error/80">Expired</p>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "created_at",
        header: "Published",
        cell: ({ row }) => {
          const date = new Date(row.original.created_at);
          return (
            <div className="space-y-1">
              <p className="text-sm font-semibold text-text">
                {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
              <p className="text-xs text-muted/60">
                {date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          );
        },
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const isActive = row.original.is_active !== false; // Default to true if undefined
          
          return (
            <div className="flex items-center justify-center gap-2">
              {/* Toggle Active/Inactive Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleToggleActive(row.original.id, isActive)}
                disabled={isToggling}
                className={`h-8 w-8 p-0 rounded-lg border transition-all duration-300 ${
                  isActive
                    ? "bg-success/10 text-success border-success/30 hover:bg-success/20 hover:border-success/50"
                    : "bg-gray-500/10 text-gray-400 border-gray-500/30 hover:bg-gray-500/20 hover:border-gray-500/50"
                }`}
                title={isActive ? "Disable" : "Enable"}
              >
                <Power className={`h-4 w-4 ${isActive ? "" : "opacity-50"}`} />
              </Button>

              {/* Edit Button */}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => router.push(`/news/${row.original.id}/edit`)}
                className="h-8 w-8 p-0 bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20 hover:border-primary/50 transition-all duration-300 rounded-lg"
                title="Edit"
              >
                <Pencil className="h-4 w-4" />
              </Button>

              {/* Delete Button */}
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 bg-error/10 text-error border border-error/30 hover:bg-error/20 hover:border-error/50 transition-all duration-300 rounded-lg"
                disabled={isDeleting}
                onClick={() => {
                  setItemToDelete(row.original);
                  setShowDeleteModal(true);
                }}
                title="Delete"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          );
        },
      },
    ],
    [isDeleting, isToggling, router]
  );

  return (
    <div className="space-y-6">
      {/* News Table Section with Header */}
      <div className="relative animate-fade-in-up">
        <div className="absolute inset-0 bg-gradient-to-br from-card/40 to-surface/40 rounded-2xl blur-xl"></div>
        <div className="relative bg-card/80 backdrop-blur-sm rounded-2xl border border-surface/30 shadow-xl overflow-hidden">
          {/* Header Inside Container */}
          <div className="p-6 border-b border-surface/30 bg-gradient-to-r from-surface/40 to-card/40">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-text to-primary bg-clip-text text-transparent">
                  News & Announcements
                </h1>
                <p className="text-sm text-muted/80">
                  Manage announcements that sync to the mobile app and in-gym displays
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl border border-primary/30">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                  <span className="text-xs font-semibold text-primary">
                    {items.length} Active {items.length === 1 ? 'Announcement' : 'Announcements'}
                  </span>
                </div>
                <Button
                  onClick={() => router.push("/news/new")}
                  className="gap-2 bg-primary hover:bg-primary/90 text-white"
                >
                  <Plus className="h-4 w-4" />
                  Create New
                </Button>
              </div>
            </div>
          </div>

          {/* Table Content */}
          <div className="p-6">
            <DataTable columns={columns} data={items} />
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setItemToDelete(null);
        }}
        onConfirm={handleDelete}
        title="Delete Announcement"
        description={`Are you sure you want to delete "${itemToDelete?.title}"? This action cannot be undone and will remove the announcement from all displays.`}
        confirmText="Delete Announcement"
        variant="destructive"
      />
    </div>
  );
}
