"use client";

import { useMemo, useState, useTransition, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-table/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AnimatedCreateButton } from "@/components/ui/animated-create-button";
import { deleteNewsAction, toggleNewsActiveAction } from "@/app/(protected)/actions";
import type { NewsItem } from "@/types";
import type { TimeFormat } from "@/lib/settings";
import { ConfirmationModal } from "@/components/ui/modal";
import { Pencil, Trash2, Power, Megaphone } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { PageHeader } from "@/components/ui/page-header";

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

  const handleCreateNew = () => {
    router.push("/news/new");
  };

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
        cell: ({ row }) => {
          // Strip HTML tags for preview
          const stripHtml = (html: string) => html.replace(/<[^>]*>/g, '').trim();
          const plainContent = stripHtml(row.original.content);
          
          return (
            <div className="space-y-1 text-center md:text-left min-w-[180px] px-2">
              <p className="font-semibold text-text">{row.original.title}</p>
              <p className="text-xs text-muted/60 line-clamp-1">{plainContent.substring(0, 60)}{plainContent.length > 60 ? '...' : ''}</p>
            </div>
          );
        },
      },
      {
        accessorKey: "priority",
        header: () => <div className="text-center font-semibold">Priority</div>,
        cell: ({ row }) => {
          const priority = row.original.priority;
          
          let variant: "default" | "warning" | "destructive" = "default";
          if (priority === "medium") variant = "warning";
          if (priority === "high") variant = "destructive";
          
          return (
            <div className="flex justify-center min-w-[100px] px-2">
              <Badge variant={variant}>
                {priority.charAt(0).toUpperCase() + priority.slice(1)}
              </Badge>
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
              <Badge variant={isActive ? "success" : "destructive"}>
                {isActive ? "Active" : "Inactive"}
              </Badge>
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
            <div className="flex items-center justify-center gap-1 min-w-[120px] px-2">
              {/* Toggle Active/Inactive Button */}
              <button
                onClick={() => handleToggleActive(row.original.id, isActive, row.original.title)}
                disabled={isToggling}
                className={isActive ? "news-toggle-active" : "news-toggle-inactive"}
                title={isActive ? "Disable" : "Enable"}
              >
                <svg
                  className={isActive ? "news-power-icon-active" : "news-power-icon-inactive"}
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M18.36 6.64a9 9 0 11-12.73 0"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <line
                    x1="12"
                    y1="2"
                    x2="12"
                    y2="12"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <style jsx>{`
                  .news-toggle-active {
                    width: 32px;
                    height: 32px;
                    border-radius: 8px;
                    background-color: rgba(34, 197, 94, 0.12);
                    border: 1px solid rgba(34, 197, 94, 0.25);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    color: rgba(34, 197, 94, 0.9);
                  }
                  .news-toggle-active:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                  }
                  .news-power-icon-active {
                    width: 16px;
                    height: 16px;
                    transition: all 0.3s ease;
                  }
                  .news-toggle-active:hover:not(:disabled) {
                    background-color: rgba(34, 197, 94, 0.18);
                    border-color: rgba(34, 197, 94, 0.4);
                    box-shadow: 0 0 12px rgba(34, 197, 94, 0.2);
                    color: rgb(34, 197, 94);
                  }
                  .news-toggle-active:hover:not(:disabled) .news-power-icon-active {
                    transform: scale(1.15) rotate(-15deg);
                  }
                  .news-toggle-active:active:not(:disabled) {
                    transform: scale(0.95);
                  }

                  .news-toggle-inactive {
                    width: 32px;
                    height: 32px;
                    border-radius: 8px;
                    background-color: rgba(107, 114, 128, 0.12);
                    border: 1px solid rgba(107, 114, 128, 0.25);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    color: rgba(107, 114, 128, 0.7);
                  }
                  .news-toggle-inactive:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                  }
                  .news-power-icon-inactive {
                    width: 16px;
                    height: 16px;
                    transition: all 0.3s ease;
                    opacity: 0.6;
                  }
                  .news-toggle-inactive:hover:not(:disabled) {
                    background-color: rgba(107, 114, 128, 0.18);
                    border-color: rgba(107, 114, 128, 0.35);
                    box-shadow: 0 0 12px rgba(107, 114, 128, 0.15);
                    color: rgb(107, 114, 128);
                  }
                  .news-toggle-inactive:hover:not(:disabled) .news-power-icon-inactive {
                    transform: scale(1.15) rotate(15deg);
                    opacity: 0.8;
                  }
                  .news-toggle-inactive:active:not(:disabled) {
                    transform: scale(0.95);
                  }
                `}</style>
              </button>

              {/* Edit Button */}
              <button
                onClick={() => router.push(`/news/${row.original.id}/edit`)}
                className="news-edit-button"
                title="Edit"
              >
                <svg
                  className="news-edit-icon"
                  viewBox="0 0 512 512"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M410.3 231l11.3-11.3-33.9-33.9-62.1-62.1L291.7 89.8l-11.3 11.3-22.6 22.6L58.6 322.9c-10.4 10.4-18 23.3-22.2 37.4L1 480.7c-2.5 8.4-.2 17.5 6.1 23.7s15.3 8.5 23.7 6.1l120.3-35.4c14.1-4.2 27-11.8 37.4-22.2L387.7 253.7 410.3 231zM160 399.4l-9.1 22.7c-4 3.1-8.5 5.4-13.3 6.9L59.4 452l23-78.1c1.4-4.9 3.8-9.4 6.9-13.3l22.7-9.1v32c0 8.8 7.2 16 16 16h32zM362.7 18.7L348.3 33.2 325.7 55.8 314.3 67.1l33.9 33.9 62.1 62.1 33.9 33.9 11.3-11.3 22.6-22.6 14.5-14.5c25-25 25-65.5 0-90.5L453.3 18.7c-25-25-65.5-25-90.5 0zm-47.4 168l-144 144c-6.2 6.2-16.4 6.2-22.6 0s-6.2-16.4 0-22.6l144-144c6.2-6.2 16.4-6.2 22.6 0s6.2 16.4 0 22.6z"
                  />
                </svg>
                <style jsx>{`
                  .news-edit-button {
                    width: 32px;
                    height: 32px;
                    border-radius: 8px;
                    background-color: rgba(77, 212, 212, 0.12);
                    border: 1px solid rgba(77, 212, 212, 0.25);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    overflow: hidden;
                    position: relative;
                  }
                  .news-edit-icon {
                    width: 13px;
                    transition: all 0.3s ease;
                    fill: rgba(77, 212, 212, 0.9);
                  }
                  .news-edit-button:hover {
                    background-color: rgba(77, 212, 212, 0.18);
                    border-color: rgba(77, 212, 212, 0.4);
                    box-shadow: 0 0 12px rgba(77, 212, 212, 0.2);
                  }
                  .news-edit-button:hover .news-edit-icon {
                    transform: rotate(-12deg) scale(1.05);
                    fill: rgb(77, 212, 212);
                  }
                  .news-edit-button:active {
                    transform: scale(0.95);
                  }
                `}</style>
              </button>

              {/* Delete Button */}
              <button
                onClick={() => {
                  setItemToDelete(row.original);
                  setShowDeleteModal(true);
                }}
                disabled={isDeleting}
                className="news-delete-button"
                title="Delete"
              >
                <svg
                  className="news-bin-top"
                  viewBox="0 0 39 7"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <line y1="5" x2="39" y2="5" strokeWidth="4"></line>
                  <line x1="12" y1="1.5" x2="26.0357" y2="1.5" strokeWidth="3"></line>
                </svg>
                <svg
                  className="news-bin-bottom"
                  viewBox="0 0 33 39"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <mask id="path-1-news-bin" fill="rgba(255, 107, 107, 0.9)">
                    <path d="M0 0H33V35C33 37.2091 31.2091 39 29 39H4C1.79086 39 0 37.2091 0 35V0Z"></path>
                  </mask>
                  <path
                    d="M0 0H33H0ZM37 35C37 39.4183 33.4183 43 29 43H4C-0.418278 43 -4 39.4183 -4 35H4H29H37ZM4 43C-0.418278 43 -4 39.4183 -4 35V0H4V35V43ZM37 0V35C37 39.4183 33.4183 43 29 43V35V0H37Z"
                    fill="rgba(255, 107, 107, 0.9)"
                    mask="url(#path-1-news-bin)"
                  ></path>
                  <path d="M12 6L12 29" strokeWidth="4"></path>
                  <path d="M21 6V29" strokeWidth="4"></path>
                </svg>
                <style jsx>{`
                  .news-delete-button {
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
                  .news-delete-button:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                  }
                  .news-bin-bottom {
                    width: 12px;
                    transition: all 0.3s ease;
                  }
                  .news-bin-top {
                    width: 14px;
                    transform-origin: right;
                    transition: all 0.3s ease;
                  }
                  .news-bin-bottom path {
                    stroke: rgba(255, 107, 107, 0.9);
                    fill: rgba(255, 107, 107, 0.9);
                  }
                  .news-bin-top line {
                    stroke: rgba(255, 107, 107, 0.9);
                  }
                  .news-delete-button:hover:not(:disabled) {
                    background-color: rgba(255, 107, 107, 0.18);
                    border-color: rgba(255, 107, 107, 0.4);
                    box-shadow: 0 0 12px rgba(255, 107, 107, 0.2);
                  }
                  .news-delete-button:hover:not(:disabled) .news-bin-top {
                    transform: rotate(15deg);
                  }
                  .news-delete-button:hover:not(:disabled) .news-bin-bottom path {
                    stroke: rgb(255, 107, 107);
                    fill: rgb(255, 107, 107);
                  }
                  .news-delete-button:hover:not(:disabled) .news-bin-top line {
                    stroke: rgb(255, 107, 107);
                  }
                  .news-delete-button:active:not(:disabled) {
                    transform: scale(0.95);
                  }
                `}</style>
              </button>
            </div>
          );
        },
      },
    ],
    [isDeleting, isToggling, router, handleToggleActive, timeFormat]
  );

  return (
    <div className="space-y-6 sm:space-y-8 overflow-hidden">
      {/* News Table Section with Header */}
      <div className="relative animate-fade-in-up">
        <div className="relative bg-card/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl border border-surface/30 overflow-hidden">
          {/* Header Inside Container */}
          <div className="p-4 sm:p-6 border-b border-surface/30 bg-gradient-to-r from-surface/40 to-card/40">
            <div className="space-y-3 sm:space-y-0">
              <PageHeader
                icon={Megaphone}
                title="News & Announcements"
                subtitle="Manage announcements that sync to the mobile app and in-gym displays"
              />
              <div className="flex items-center gap-2 sm:gap-3 justify-between sm:justify-end">
                <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg sm:rounded-xl border border-primary/30">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-primary rounded-full animate-pulse"></div>
                  <span className="text-[10px] sm:text-xs font-semibold text-primary whitespace-nowrap">
                    {items.filter(item => item.is_active !== false).length} Active {items.filter(item => item.is_active !== false).length === 1 ? 'Announcement' : 'Announcements'}
                  </span>
                </div>
                <AnimatedCreateButton onClick={handleCreateNew} label="Create New" shortLabel="Create" />
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
