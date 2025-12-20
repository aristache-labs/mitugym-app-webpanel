"use client";

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import { CheckCircle2, XCircle, AlertTriangle, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Toast {
  id: string;
  type: "success" | "error" | "warning";
  title: string;
  description?: string;
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast = { ...toast, id };
    setToasts((prev) => [...prev, newToast]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div 
      className="fixed right-4 z-[9999] space-y-3 max-w-[420px] w-full pointer-events-none px-4 sm:px-0"
      style={{
        top: 'calc(env(safe-area-inset-top) + 5rem)',
        bottom: 'auto',
      }}
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
}

interface ToastItemProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

function ToastItem({ toast, onRemove }: ToastItemProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [progress, setProgress] = useState(100);
  const [isPaused, setIsPaused] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchOffset, setTouchOffset] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const remainingTimeRef = useRef<number>(toast.duration ?? 5000);
  const toastRef = useRef<HTMLDivElement>(null);

  const duration = toast.duration ?? 5000;

  // Get toast styling based on type
  const getToastStyles = () => {
    switch (toast.type) {
      case "success":
        return {
          Icon: CheckCircle2,
          iconColor: "text-green-400",
          iconBgColor: "#22c55e",
          borderColor: "rgba(34, 197, 94, 0.2)",
          bgGradient: "linear-gradient(135deg, #0e1512 0%, #0a110d 100%)",
          shadowColor: "rgba(34, 197, 94, 0.2)",
          glowColor: "rgba(34, 197, 94, 0.15)",
          progressBg: "rgba(34, 197, 94, 0.15)",
          progressColor: "#22c55e",
        };
      case "error":
        return {
          Icon: XCircle,
          iconColor: "text-red-400",
          iconBgColor: "#ef4444",
          borderColor: "rgba(239, 68, 68, 0.2)",
          bgGradient: "linear-gradient(135deg, #1a0e0e 0%, #140a0a 100%)",
          shadowColor: "rgba(239, 68, 68, 0.2)",
          glowColor: "rgba(239, 68, 68, 0.15)",
          progressBg: "rgba(239, 68, 68, 0.15)",
          progressColor: "#ef4444",
        };
      case "warning":
        return {
          Icon: AlertTriangle,
          iconColor: "text-yellow-400",
          iconBgColor: "#eab308",
          borderColor: "rgba(234, 179, 8, 0.2)",
          bgGradient: "linear-gradient(135deg, #1a1810 0%, #14120c 100%)",
          shadowColor: "rgba(234, 179, 8, 0.2)",
          glowColor: "rgba(234, 179, 8, 0.15)",
          progressBg: "rgba(234, 179, 8, 0.15)",
          progressColor: "#eab308",
        };
    }
  };

  const styles = getToastStyles();
  const Icon = styles.Icon;

  // Start countdown timer with smooth animation
  useEffect(() => {
    setIsVisible(true);
    startTimeRef.current = Date.now();

    const updateProgress = () => {
      if (!isPaused) {
        const elapsed = Date.now() - startTimeRef.current;
        const remaining = Math.max(0, remainingTimeRef.current - elapsed);
        const progressPercent = (remaining / duration) * 100;
        
        setProgress(progressPercent);

        if (remaining <= 0) {
          handleRemove();
        } else {
          animationFrameRef.current = requestAnimationFrame(updateProgress);
        }
      } else {
        animationFrameRef.current = requestAnimationFrame(updateProgress);
      }
    };

    animationFrameRef.current = requestAnimationFrame(updateProgress);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isPaused]);

  const handleRemove = () => {
    if (isLeaving) return;
    setIsLeaving(true);
    setTimeout(() => onRemove(toast.id), 400);
  };

  const handleMouseEnter = () => {
    setIsPaused(true);
    remainingTimeRef.current = (progress / 100) * duration;
  };

  const handleMouseLeave = () => {
    setIsPaused(false);
    startTimeRef.current = Date.now();
  };

  // Touch handlers for swipe gesture
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
    setIsSwiping(true);
    setIsPaused(true);
    remainingTimeRef.current = (progress / 100) * duration;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    
    const currentTouch = e.touches[0].clientX;
    const diff = currentTouch - touchStart;
    
    // Only allow swipe to right
    if (diff > 0) {
      setTouchOffset(diff);
    }
  };

  const handleTouchEnd = () => {
    if (touchOffset > 100) {
      // Swiped far enough, remove toast
      handleRemove();
    } else {
      // Return to position
      setTouchOffset(0);
      setIsPaused(false);
      startTimeRef.current = Date.now();
    }
    setTouchStart(null);
    setIsSwiping(false);
  };

  return (
    <div
      ref={toastRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className={cn(
        "relative group backdrop-blur-xl rounded-2xl overflow-hidden pointer-events-auto transition-all duration-500 ease-out",
        isVisible && !isLeaving 
          ? "translate-x-0 opacity-100 scale-100" 
          : "translate-x-[120%] opacity-0 scale-95",
        isLeaving && "translate-x-[120%] opacity-0 scale-90"
      )}
      style={{
        background: styles.bgGradient,
        border: `1px solid ${styles.borderColor}`,
        boxShadow: `0 10px 40px ${styles.shadowColor}, 0 0 1px ${styles.borderColor}`,
        transform: isSwiping ? `translateX(${touchOffset}px)` : undefined,
        transition: isSwiping ? 'none' : 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      {/* Top subtle glow */}
      <div 
        className="absolute top-0 left-0 right-0 h-px opacity-40"
        style={{
          background: `linear-gradient(90deg, transparent, ${styles.iconBgColor}, transparent)`,
        }}
      />

      {/* Hover glow effect */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: `radial-gradient(circle at top right, ${styles.glowColor}, transparent 60%)`,
        }}
      />

      {/* Main content */}
      <div className="relative z-10 px-4 pt-3.5 pb-3">
        <div className="flex items-start gap-3.5">
          {/* Icon */}
          <div className="flex-shrink-0 relative mt-0.5">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg relative overflow-hidden"
              style={{
                backgroundColor: `${styles.iconBgColor}15`,
                border: `1.5px solid ${styles.iconBgColor}30`,
              }}
            >
              {/* Icon glow background */}
              <div 
                className="absolute inset-0 opacity-20"
                style={{
                  background: `radial-gradient(circle at center, ${styles.iconBgColor}, transparent 70%)`,
                }}
              />
              <Icon 
                className={cn("w-5 h-5 relative z-10", styles.iconColor)} 
                strokeWidth={2.5}
              />
            </div>
            
            {/* Animated pulse ring */}
            <div 
              className="absolute inset-0 rounded-xl animate-ping opacity-20"
              style={{
                backgroundColor: `${styles.iconBgColor}40`,
                animationDuration: '2s',
              }}
            />
          </div>

          {/* Text content */}
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold text-text leading-tight tracking-tight mb-1">
              {toast.title}
            </h4>
            {toast.description && (
              <p className="text-xs text-muted/80 leading-relaxed font-medium">
                {toast.description}
              </p>
            )}
          </div>

          {/* Close button */}
          <button
            onClick={handleRemove}
            className="flex-shrink-0 p-1.5 rounded-lg transition-all duration-200 hover:bg-surface/50 active:scale-90 opacity-50 hover:opacity-100 -mt-0.5"
            aria-label="Close notification"
          >
            <X className="w-4 h-4 text-text" strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* Progress bar container */}
      <div 
        className="h-1 w-full relative overflow-hidden"
        style={{ backgroundColor: styles.progressBg }}
      >
        {/* Progress bar */}
        <div
          className="h-full relative"
          style={{
            width: `${progress}%`,
            backgroundColor: styles.progressColor,
            boxShadow: `0 0 8px ${styles.progressColor}80`,
            transition: 'none',
          }}
        >
          {/* Animated shimmer */}
          <div 
            className="absolute inset-0 opacity-40"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
              animation: 'shimmer 1.5s infinite',
            }}
          />
        </div>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% { 
            transform: translateX(-100%);
          }
          100% { 
            transform: translateX(200%);
          }
        }
      `}</style>
    </div>
  );
}

