"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "./button";
import { Trash2 } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive";
  children?: React.ReactNode;
  className?: string;
  isPending?: boolean;
}

export function Modal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "default",
  children,
  className,
  isPending = false,
}: ModalProps) {
  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      // Prevent body scroll
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // FORCE render directly to document.body using React Portal
  const modalContent = (
    <div 
      className="p-2 sm:p-5"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999999,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: 0
      }}
      onClick={onClose}
    >
      {/* Modal Content */}
      <div 
        className={`bg-surface border border-surface/50 rounded-lg shadow-lg w-full ${className || 'max-w-2xl'}`}
        style={{
          maxHeight: '90vh',
          overflow: 'auto',
          margin: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-surface/50 bg-surface sticky top-0 z-10">
          <h2 className="text-lg font-semibold text-text">{title}</h2>
        </div>
        
        {/* Content */}
        <div className="px-6 py-4 bg-surface">
          {description && (
            <p className="text-sm text-muted mb-4">{description}</p>
          )}
          {children}
        </div>
        
        {/* Footer */}
        {onConfirm && (
          <div className="px-6 py-4 border-t border-surface/50 flex justify-end gap-3 bg-surface sticky bottom-0">
            {variant === "destructive" ? (
              <>
                <button
                  onClick={onClose}
                  className="flex-1 h-10 text-sm px-6 bg-gradient-to-br from-slate-800/50 via-slate-800/40 to-slate-900/50 hover:from-slate-800/70 hover:via-slate-800/60 hover:to-slate-900/70 text-slate-300 hover:text-slate-100 border-0 transition-all duration-300 shadow-md shadow-black/10 hover:shadow-lg hover:shadow-black/20 backdrop-blur-sm font-medium rounded-xl"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    onConfirm();
                    onClose();
                  }}
                  disabled={isPending}
                  className="group/delete flex-1 h-9 sm:h-10 px-4 sm:px-6 flex items-center justify-center gap-1.5 sm:gap-2 bg-gradient-to-br from-red-700/75 via-red-900/45 to-red-700/75 hover:from-red-600/85 hover:via-red-800/55 hover:to-red-600/85 text-white font-medium text-xs sm:text-sm rounded-2xl backdrop-blur-sm shadow-md shadow-red-900/30 hover:shadow-lg hover:shadow-red-950/40 transition-all duration-500 ease-out overflow-hidden border-0 !ring-0 !outline-none active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {!isPending && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/delete:translate-x-full transition-transform duration-1000 ease-in-out"></div>
                  )}
                  
                  {isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-3.5 w-3.5 sm:h-4 sm:w-4 border-2 border-white border-t-transparent" />
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <>
                      <div className="relative z-10 flex items-center justify-center transition-all duration-500 ease-in-out group-hover/delete:scale-125 group-hover/delete:translate-x-[1.7em]">
                        <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 transition-all duration-500 ease-in-out text-red-200/70 group-hover/delete:text-red-50 group-hover/delete:scale-110" />
                      </div>
                      <span className="transition-all duration-500 ease-in-out group-hover/delete:opacity-0">
                        Delete
                      </span>
                    </>
                  )}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={onClose}
                  className="group/modalclose relative h-9 sm:h-10 px-4 sm:px-6 flex items-center justify-center gap-1.5 sm:gap-2 bg-gradient-to-br from-slate-700/75 via-cyan-900/45 to-slate-700/75 hover:from-slate-600/85 hover:via-cyan-800/55 hover:to-slate-600/85 text-white font-medium text-xs sm:text-sm rounded-xl backdrop-blur-sm shadow-md shadow-black/20 hover:shadow-lg hover:shadow-cyan-950/25 transition-all duration-500 ease-out overflow-hidden border-0 !ring-0 !outline-none active:scale-95"
                >
                  {/* Icon with animation */}
                  <div className="relative z-10 flex items-center justify-center transition-all duration-500 ease-in-out group-hover/modalclose:scale-125 group-hover/modalclose:translate-x-[1.7em]">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3.5 w-3.5 sm:h-4 sm:w-4 transition-all duration-500 ease-in-out text-cyan-300/60 group-hover/modalclose:text-cyan-100 group-hover/modalclose:scale-110"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  
                  {/* Text */}
                  <span className="transition-all duration-500 ease-in-out group-hover/modalclose:opacity-0">
                    Close
                  </span>
                </button>

                <button
                  onClick={() => {
                    onConfirm();
                    onClose();
                  }}
                  disabled={isPending}
                  className="h-9 sm:h-10 px-4 sm:px-6 text-xs sm:text-sm bg-gradient-to-br from-slate-700/75 via-cyan-900/45 to-slate-700/75 hover:from-slate-600/85 hover:via-cyan-800/55 hover:to-slate-600/85 text-slate-200 hover:text-white border-0 ring-0 outline-none transition-all duration-500 ease-out shadow-md shadow-black/20 hover:shadow-lg hover:shadow-cyan-950/25 backdrop-blur-sm font-medium rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPending ? "Processing..." : confirmText}
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );

  // Use React Portal to render directly to document.body
  return typeof window !== 'undefined' ? createPortal(modalContent, document.body) : null;
}

// Confirmation Modal specifically for actions
interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  variant?: "default" | "destructive";
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  variant = "default",
}: ConfirmationModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title={title}
      description={description}
      confirmText={confirmText}
      variant={variant}
    />
  );
}
