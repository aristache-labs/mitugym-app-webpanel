"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Bell, Check, CheckCheck, Trash2, X } from "lucide-react";
import { useSupabase } from "@/components/providers/supabase-provider";
import { formatDistanceToNow } from "date-fns";
import type { AdminNotification } from "@/types/notifications";

export function NotificationBell() {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { supabase } = useSupabase();

  // Check if component is mounted (for portal)
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Check if mobile/responsive view
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const response = await fetch("/api/notifications?limit=20");
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
        setUnreadCount(
          (data.notifications || []).filter((n: AdminNotification) => !n.is_read).length
        );
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId }),
      });

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notificationId ? { ...n, is_read: true } : n
          )
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAllAsRead: true }),
      });

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((n) => ({ ...n, is_read: true }))
        );
        setUnreadCount(0);
      }
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId: string) => {
    try {
      const response = await fetch(
        `/api/notifications?id=${notificationId}`,
        { method: "DELETE" }
      );

      if (response.ok) {
        const notification = notifications.find((n) => n.id === notificationId);
        setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
        if (notification && !notification.is_read) {
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }
      }
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  };

  // Delete all notifications
  const deleteAllNotifications = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/notifications", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deleteAll: true }),
      });

      if (response.ok) {
        setNotifications([]);
        setUnreadCount(0);
      }
    } catch (error) {
      console.error("Failed to delete all notifications:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Initial fetch
  useEffect(() => {
    fetchNotifications();
  }, []);

  // Subscribe to real-time notifications
  useEffect(() => {
    if (!supabase) return;

    const channel = supabase
      .channel("admin-notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: "is_global=eq.true",
        },
        (payload) => {
          const newNotification = payload.new as AdminNotification;
          // Only add if it's a member action notification (service purchase, session booking, updates, or cancellations)
          if (
            newNotification.member_id === null &&
            (newNotification.type === "service_purchase" || 
             newNotification.type === "session_booking" ||
             newNotification.type === "session_updated" ||
             newNotification.type === "session_cancelled")
          ) {
            setNotifications((prev) => [newNotification, ...prev]);
            setUnreadCount((prev) => prev + 1);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  // Get notification icon based on type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "service_purchase":
        return "💳";
      case "session_booking":
        return "📅";
      case "session_updated":
        return "📝";
      case "session_cancelled":
        return "❌";
      case "announcement":
        return "📢";
      case "gym_schedule_updated":
        return "🕐";
      default:
        return "🔔";
    }
  };

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        {/* Bell Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative rounded-xl p-2.5 text-text transition-all duration-200 hover:bg-primary/10 active:scale-95"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-gradient-to-br from-accent to-accent/80 px-1.5 text-[10px] font-bold text-white shadow-lg ring-2 ring-background">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Dropdown - Rendered via Portal to escape parent containers */}
      {isOpen && mounted && createPortal(
        <>
          {/* Background Overlay - ONLY ON MOBILE */}
          {isMobile && (
            <div 
              className="fixed inset-0"
              style={{
                top: 'calc(env(safe-area-inset-top) + 4rem)',
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 9998,
                backgroundColor: 'rgba(0, 0, 0, 0.85)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
              }}
              onClick={() => setIsOpen(false)}
            />
          )}
          
          {/* Dropdown Panel */}
          <div 
            className="fixed left-3 right-3 lg:left-auto lg:right-100 w-auto lg:w-[620px] max-w-full lg:max-w-[620px] rounded-2xl overflow-hidden lg:max-h-[600px] flex flex-col"
            style={{
              top: isMobile ? 'calc(env(safe-area-inset-top) + 4.00rem)' : 'calc(env(safe-area-inset-top) + 2.5rem)',
              maxHeight: 'calc(100vh - env(safe-area-inset-top) - 5.5rem)',
              backgroundColor: '#141a1a',
              zIndex: 9999,
              border: '1px solid rgba(77, 212, 212, 0.15)',
              boxShadow: '0 0 0 1px rgba(77, 212, 212, 0.1), 0 8px 32px rgba(0, 0, 0, 0.4), 0 0 60px rgba(77, 212, 212, 0.08)',
              WebkitBackfaceVisibility: 'hidden',
              backfaceVisibility: 'hidden',
              transform: 'translateZ(0)',
              willChange: 'transform',
            }}
          >
            {/* Mobile Header with Close */}
            <div className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-primary/10 bg-gradient-to-r from-primary/10 to-transparent"
              style={{
                backgroundColor: '#141a1a',
              }}
            >
              <div>
                <h3 className="text-base font-bold text-text">Notifications</h3>
                {notifications.length > 0 && (
                  <p className="text-xs text-muted mt-0.5">
                    {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
                  </p>
                )}
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-2 text-muted hover:text-text hover:bg-primary/10 transition-all duration-200"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Desktop Header */}
            <div className="hidden lg:block bg-gradient-to-r from-primary/10 via-primary/5 to-transparent px-5 py-4 border-b border-primary/10">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-text">Notifications</h3>
                  {notifications.length > 0 && (
                    <p className="text-xs text-muted mt-0.5">
                      {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  {notifications.length > 0 && (
                    <>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          disabled={isLoading}
                          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-primary bg-primary/10 hover:bg-primary/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Mark all as read"
                        >
                          <CheckCheck className="h-3.5 w-3.5" />
                          <span>Mark all</span>
                        </button>
                      )}
                      <button
                        onClick={deleteAllNotifications}
                        disabled={isLoading}
                        className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-red-400 bg-red-500/10 hover:bg-red-500/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Delete all notifications"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Clear all</span>
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => setIsOpen(false)}
                    className="rounded-lg p-1.5 text-muted hover:text-text hover:bg-surface/80 transition-all duration-200 ml-1"
                    aria-label="Close"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Mobile Action Buttons */}
            {notifications.length > 0 && (
              <div className="lg:hidden flex items-center gap-2 px-4 py-2 border-b border-primary/5"
                style={{ backgroundColor: '#141a1a' }}
              >
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    disabled={isLoading}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-primary bg-primary/10 hover:bg-primary/20 active:bg-primary/30 transition-all duration-200 disabled:opacity-50"
                    title="Mark all as read"
                  >
                    <CheckCheck className="h-3.5 w-3.5" />
                    <span>Mark all</span>
                  </button>
                )}
                <button
                  onClick={deleteAllNotifications}
                  disabled={isLoading}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-red-400 bg-red-500/10 hover:bg-red-500/20 active:bg-red-500/30 transition-all duration-200 disabled:opacity-50"
                  title="Delete all notifications"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Clear all</span>
                </button>
              </div>
            )}

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-0"
              style={{ backgroundColor: '#0f1414' }}
            >
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 lg:py-16 px-6">
                  <div className="rounded-full bg-primary/10 p-4 mb-4">
                    <Bell className="h-8 w-8 text-primary/40" />
                  </div>
                  <p className="text-sm font-medium text-text mb-1">No notifications</p>
                  <p className="text-xs text-muted text-center">
                    You're all caught up! New notifications will appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-1 m-0 p-0 -ml-1">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`group relative w-full transition-all duration-300 ease-in-out ${
                        !notification.is_read 
                          ? "bg-gradient-to-br from-primary/8 to-primary/4 border-l-[3px] border-primary/50 hover:border-primary/80 shadow-sm hover:shadow-md hover:from-primary/10 hover:to-primary/5" 
                          : "bg-surface/95 border-l-[3px] border-muted/50 hover:border-primary/50 hover:bg-surface shadow-sm"
                      }`}
                      style={{ marginRight: 0 }}
                    >
                      <div className="flex gap-1.5 lg:gap-1.5 items-center py-1 lg:py-1 pl-1 lg:pl-1 pr-1 lg:pr-1">
                        {/* Icon - Centered vertically */}
                        <div className="flex-shrink-0 relative ml-0">
                          <div className={`w-10 h-10 lg:w-11 lg:h-11 rounded-xl flex items-center justify-center text-lg lg:text-xl ${
                            !notification.is_read 
                              ? "bg-gradient-to-br from-primary/30 to-primary/15" 
                              : "bg-gradient-to-br from-surface to-card ring-1 ring-primary/20"
                          }`}>
                            {getNotificationIcon(notification.type)}
                          </div>
                          {/* NEW badge - positioned on top left corner */}
                          {!notification.is_read && (
                            <span 
                              className="absolute -top-0.5 left-1.0 px-1 py-0.5 rounded text-[7px] font-bold uppercase tracking-wider bg-accent text-background shadow-lg"
                              style={{ transform: 'rotate(-12deg)' }}
                            >
                              New
                            </span>
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          {/* Title and time on same line */}
                          <div className="flex items-center gap-2 mb-0.5">
                            <h4 className="text-sm font-semibold text-text leading-tight">
                              {notification.title}
                            </h4>
                            <span className="text-muted/50">•</span>
                            <p className="text-[10px] font-medium text-muted/70 uppercase tracking-wide whitespace-nowrap">
                              {formatDistanceToNow(new Date(notification.created_at), {
                                addSuffix: true,
                              })}
                            </p>
                          </div>
                          <p className="text-xs text-muted leading-snug">
                            {notification.message}
                          </p>
                        </div>

                        {/* Actions - Centered vertically */}
                        <div className="flex items-center gap-0.5 lg:gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-200">
                          {!notification.is_read && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="rounded-lg p-1.5 lg:p-2 text-primary hover:bg-primary/10 active:bg-primary/20 transition-all duration-200"
                              title="Mark as read"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            onClick={() => deleteNotification(notification.id)}
                            className="rounded-lg p-1.5 lg:p-2 text-red-400 hover:bg-red-500/10 active:bg-red-500/20 transition-all duration-200"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="bg-gradient-to-r from-transparent via-primary/5 to-transparent border-t border-primary/10 px-4 lg:px-5 py-2.5 lg:py-3 flex-shrink-0">
                <p className="text-[11px] text-muted text-center font-medium">
                  Showing {notifications.length} notification{notifications.length !== 1 ? "s" : ""}
                </p>
              </div>
            )}
          </div>
        </>,
        document.body
      )}
    </>
  );
}

