"use client";

import { useMemo, useState, useTransition, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-table/data-table";
import { Button } from "@/components/ui/button";
import { deleteNewsAction, toggleNewsActiveAction } from "@/app/(protected)/actions";
import type { NewsItem } from "@/types";
import type { TimeFormat } from "@/lib/settings";
import { ConfirmationModal } from "@/components/ui/modal";
import { Pencil, Trash2, Power, Plus } from "lucide-react";
import { useToast } from "@/components/ui/toast";

interface NewsManagerProps {
  items: NewsItem[];
  timeFormat?: TimeFormat;
}

export function NewsManager({ items, timeFormat = '24h' }: NewsManagerProps) {
  const router = useRouter();
  const [isDeleting, startTransition] = useTransition();
  const [isToggling, startToggleTransition] = useTransition();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<NewsItem | null>(null);
  const { addToast } = useToast();

  const handleDelete = async () => {
    if (!itemToDelete) return;
    
    const itemTitle = itemToDelete.title;
    
    startTransition(async () => {
      const result = await deleteNewsAction(itemToDelete.id);
      setItemToDelete(null);
      setShowDeleteModal(false);
      
      if (!result.success) {
        console.error("Delete news failed:", result.error);
        addToast({
          type: "error",
          title: "Failed to Delete Announcement",
          description: result.error || "An unexpected error occurred. Please try again.",
        });
        return;
      }
      
      addToast({
        type: "success",
        title: "Announcement Deleted",
        description: `"${itemTitle}" has been successfully deleted.`,
      });
    });
  };

  const handleToggleActive = useCallback(async (id: string, currentStatus: boolean, title: string) => {
    startToggleTransition(async () => {
      const result = await toggleNewsActiveAction(id, !currentStatus);
      
      if (!result.success) {
        console.error("Toggle active failed:", result.error);
        addToast({
          type: "error",
          title: "Failed to Update Status",
          description: result.error || "An unexpected error occurred. Please try again.",
        });
        return;
      }
      
      addToast({
        type: "success",
        title: !currentStatus ? "Announcement Activated" : "Announcement Deactivated",
        description: `"${title}" has been ${!currentStatus ? 'activated' : 'deactivated'}.`,
      });
    });
  }, [addToast]);

  const columns = useMemo<ColumnDef<NewsItem>[]>(
    () => [
      {
        accessorKey: "title",
        header: () => <div className="text-center md:text-left font-semibold">Title</div>,
        cell: ({ row }) => (
          <div className="space-y-1 text-center md:text-left min-w-[180px] px-2">
            <p className="font-semibold text-text">{row.original.title}</p>
            <p className="text-xs text-muted/60 line-clamp-1">{row.original.content.substring(0, 60)}...</p>
          </div>
        ),
      },
      {
        accessorKey: "priority",
        header: () => <div className="text-center font-semibold">Priority</div>,
        cell: ({ row }) => {
          const priority = row.original.priority;
          const styles = {
            low: { bg: "bg-primary/10", text: "text-primary", border: "border-primary/30", dot: "bg-primary" },
            medium: { bg: "bg-warning/10", text: "text-warning", border: "border-warning/30", dot: "bg-warning" },
            high: { bg: "bg-error/10", text: "text-error", border: "border-error/30", dot: "bg-error" }
          };
          const style = styles[priority as keyof typeof styles];
          
          return (
            <div className="flex justify-center min-w-[100px] px-2">
              <div className={`inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-semibold border ${style.bg} ${style.text} ${style.border}`}>
                <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${style.dot}`}></div>
              {priority.charAt(0).toUpperCase() + priority.slice(1)}
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "is_active",
        header: () => <div className="text-center font-semibold">Status</div>,
        cell: ({ row }) => {
          const isActive = row.original.is_active !== false; // Default to true if undefined
          
          return (
            <div className="flex justify-center min-w-[100px] px-2">
              <div className={`inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-semibold border ${
              isActive
                ? "bg-success/10 text-success border-success/30"
                : "bg-gray-500/10 text-gray-400 border-gray-500/30"
            }`}>
                <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${isActive ? "bg-success" : "bg-gray-500"}`}></div>
              {isActive ? "Active" : "Inactive"}
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "expires_at",
        header: () => <div className="text-center font-semibold">Expires</div>,
        cell: ({ row }) => {
          if (!row.original.expires_at) {
            return (
              <div className="flex items-center justify-center gap-1.5 sm:gap-2 min-w-[100px] px-2">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-success rounded-full"></div>
                <span className="text-xs sm:text-sm text-success font-medium">Never</span>
              </div>
            );
          }
          const date = new Date(row.original.expires_at);
          const isExpired = date < new Date();
          return (
            <div className="space-y-1 text-center min-w-[100px] px-2">
              <p className={`text-xs sm:text-sm font-semibold ${isExpired ? 'text-error' : 'text-text'}`}>
                {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
              {isExpired && (
                <p className="text-[10px] sm:text-xs text-error/80">Expired</p>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "created_at",
        header: () => <div className="text-center font-semibold">Published</div>,
        cell: ({ row }) => {
          const date = new Date(row.original.created_at);
          return (
            <div className="space-y-1 text-center min-w-[100px] px-2">
              <p className="text-xs sm:text-sm font-semibold text-text">
                {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
              <p className="text-[10px] sm:text-xs text-muted/60">
                {timeFormat === '12h'
                  ? date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                  : date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
                }
              </p>
            </div>
          );
        },
      },
      {
        id: "actions",
        header: () => <div className="text-center font-semibold">Actions</div>,
        cell: ({ row }) => {
          const isActive = row.original.is_active !== false; // Default to true if undefined
          
          return (
            <div className="flex items-center justify-center gap-1.5 sm:gap-2 min-w-[120px] px-2">
              {/* Toggle Active/Inactive Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleToggleActive(row.original.id, isActive, row.original.title)}
                disabled={isToggling}
                className={`h-7 w-7 sm:h-8 sm:w-8 p-0 rounded-lg border transition-all duration-300 ${
                  isActive
                    ? "bg-success/10 text-success border-success/30 hover:bg-success/20 hover:border-success/50"
                    : "bg-gray-500/10 text-gray-400 border-gray-500/30 hover:bg-gray-500/20 hover:border-gray-500/50"
                }`}
                title={isActive ? "Disable" : "Enable"}
              >
                <Power className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${isActive ? "" : "opacity-50"}`} />
              </Button>

              {/* Edit Button */}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => router.push(`/news/${row.original.id}/edit`)}
                className="h-7 w-7 sm:h-8 sm:w-8 p-0 bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20 hover:border-primary/50 transition-all duration-300 rounded-lg"
                title="Edit"
              >
                <Pencil className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </Button>

              {/* Delete Button */}
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 sm:h-8 sm:w-8 p-0 bg-error/10 text-error border border-error/30 hover:bg-error/20 hover:border-error/50 transition-all duration-300 rounded-lg"
                disabled={isDeleting}
                onClick={() => {
                  setItemToDelete(row.original);
                  setShowDeleteModal(true);
                }}
                title="Delete"
              >
                <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </Button>
            </div>
          );
        },
      },
    ],
    [isDeleting, isToggling, router, handleToggleActive, timeFormat]
  );

  return (
    <div className="space-y-6 sm:space-y-8 overflow-x-hidden">
      {/* News Table Section with Header */}
      <div className="relative animate-fade-in-up">
        <div className="absolute inset-0 bg-gradient-to-br from-card/40 to-surface/40 rounded-2xl sm:rounded-3xl blur-xl"></div>
        <div className="relative bg-card/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl border border-surface/30 shadow-xl overflow-hidden">
          {/* Header Inside Container */}
          <div className="p-4 sm:p-6 border-b border-surface/30 bg-gradient-to-r from-surface/40 to-card/40">
             <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
               <div className="space-y-0.5 sm:space-y-1 flex-1 min-w-0 pr-2 sm:pr-0">
                 <h1 className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-text to-primary bg-clip-text text-transparent">
                  News & Announcements
                </h1>
                 <p className="text-[10px] sm:text-xs md:text-sm text-muted/80 truncate">
                  Manage announcements that sync to the mobile app and in-gym displays
                </p>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-between sm:justify-end">
                <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg sm:rounded-xl border border-primary/30">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-primary rounded-full animate-pulse"></div>
                  <span className="text-[10px] sm:text-xs font-semibold text-primary whitespace-nowrap">
                  {items.filter(item => item.is_active !== false).length} Active {items.filter(item => item.is_active !== false).length === 1 ? 'Announcement' : 'Announcements'}
                </span>
              </div>
                <Button
                  onClick={() => router.push("/news/new")}
                  className="gap-2 h-8 sm:h-10 text-xs sm:text-sm px-4 sm:px-6 bg-gradient-to-br from-slate-800 via-slate-800/95 to-slate-900 hover:from-slate-700 hover:via-slate-700/95 hover:to-slate-800 text-slate-100 hover:text-white border border-slate-600/40 hover:border-slate-500/60 transition-all duration-300 shadow-lg shadow-black/20 hover:shadow-xl hover:shadow-black/30 backdrop-blur-sm font-medium"
                >
                  <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Create New</span>
                  <span className="sm:hidden">Create</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Table Content */}
          <div className="p-4 sm:p-6">
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
