"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { Button } from "./button";

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
        <div className="px-6 py-4 border-b border-surface/50 bg-surface sticky top-0 z-10 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-text">{title}</h2>
          <button
            onClick={onClose}
            className="group/closetop relative h-9 sm:h-10 px-4 sm:px-6 flex items-center justify-center gap-1.5 sm:gap-2 bg-gradient-to-br from-slate-700/75 via-cyan-900/45 to-slate-700/75 hover:from-slate-600/85 hover:via-cyan-800/55 hover:to-slate-600/85 text-white font-medium text-xs sm:text-sm rounded-xl backdrop-blur-sm shadow-md shadow-black/20 hover:shadow-lg hover:shadow-cyan-950/25 transition-all duration-500 ease-out overflow-hidden border-0 !ring-0 !outline-none active:scale-95"
          >
            {/* Icon with animation */}
            <div className="relative z-10 flex items-center justify-center transition-all duration-500 ease-in-out group-hover/closetop:scale-125 group-hover/closetop:translate-x-[1.7em]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3.5 w-3.5 sm:h-4 sm:w-4 transition-all duration-500 ease-in-out text-cyan-300/60 group-hover/closetop:text-cyan-100 group-hover/closetop:scale-110"
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
            <span className="transition-all duration-500 ease-in-out group-hover/closetop:opacity-0">
              Close
            </span>
          </button>
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
            <Button
              variant="outline"
              onClick={onClose}
            >
              {cancelText}
            </Button>
            <Button
              variant={variant === "destructive" ? "destructive" : "default"}
              onClick={() => {
                onConfirm();
                onClose();
              }}
            >
              {confirmText}
            </Button>
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
