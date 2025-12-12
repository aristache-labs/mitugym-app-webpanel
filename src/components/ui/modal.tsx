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
            className="group/close relative overflow-hidden rounded-lg px-4 py-2 bg-gradient-to-br from-cyan-500/10 via-teal-500/10 to-cyan-600/10 hover:from-cyan-500/20 hover:via-teal-500/20 hover:to-cyan-600/20 border border-cyan-500/20 hover:border-cyan-400/30 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-950/25"
          >
            {/* Shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-200%] group-hover/close:translate-x-[200%] transition-transform duration-700" />
            
            <span className="relative flex items-center gap-2 text-sm font-medium text-cyan-300/60 group-hover/close:text-cyan-100 transition-colors">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 transition-transform duration-300 group-hover/close:rotate-90"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              <span className="hidden sm:inline">Close</span>
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
