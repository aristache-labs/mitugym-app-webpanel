"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { X, User } from "lucide-react";
import { createPortal } from "react-dom";

interface AvatarPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  avatarUrl: string | null | undefined;
  memberName: string;
}

export function AvatarPreviewModal({
  isOpen,
  onClose,
  avatarUrl,
  memberName,
}: AvatarPreviewModalProps) {
  const [isLandscape, setIsLandscape] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [imageAspectRatio, setImageAspectRatio] = useState<number | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Handle ESC key press
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Track device orientation
  useEffect(() => {
    if (typeof window === "undefined") return;
    const updateOrientation = () => {
      const mql = window.matchMedia("(orientation: landscape)");
      setIsLandscape(mql.matches);
      setIsSmallScreen(window.innerWidth < 1024);
    };
    updateOrientation();
    window.addEventListener("orientationchange", updateOrientation);
    window.addEventListener("resize", updateOrientation);
    return () => {
      window.removeEventListener("orientationchange", updateOrientation);
      window.removeEventListener("resize", updateOrientation);
    };
  }, []);

  // Load image to detect its aspect ratio
  useEffect(() => {
    if (!avatarUrl || !isOpen) {
      setImageAspectRatio(null);
      setImageLoaded(false);
      return;
    }

    const img = new window.Image();
    img.onload = () => {
      const ratio = img.width / img.height;
      setImageAspectRatio(ratio);
      setImageLoaded(true);
    };
    img.onerror = () => {
      setImageAspectRatio(1); // fallback to square
      setImageLoaded(true);
    };
    img.src = avatarUrl;
  }, [avatarUrl, isOpen]);

  if (!isOpen) return null;

  const getInitials = () => {
    return memberName
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Determine if image is portrait or landscape
  const isImagePortrait = imageAspectRatio !== null && imageAspectRatio < 0.95;
  const isImageLandscape = imageAspectRatio !== null && imageAspectRatio > 1.05;

  // Calculate dynamic modal width based on image aspect ratio and device orientation
  const getModalMaxWidth = () => {
    // No avatar (placeholder) - use square/compact sizes
    if (!imageLoaded || !avatarUrl) {
      if (isLandscape && isSmallScreen) return "max-w-[45vw]"; // compact for mobile landscape
      return "max-w-[min(80vw,560px)] md:max-w-2xl lg:max-w-3xl";
    }

    // Mobile landscape device
    if (isLandscape && isSmallScreen) {
      if (isImagePortrait) return "max-w-[35vw]"; // very narrow for portrait images
      if (isImageLandscape) return "max-w-[38vw]"; // tighter fit for landscape images
      return "max-w-[50vw]"; // medium for square
    }

    // Mobile portrait or desktop
    if (isImagePortrait) return "max-w-[min(80vw,640px)] md:max-w-xl lg:max-w-2xl";
    if (isImageLandscape) return "max-w-[min(90vw,640px)] md:max-w-3xl lg:max-w-4xl";
    return "max-w-[min(80vw,560px)] md:max-w-2xl lg:max-w-3xl";
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      {/* Gradient Background Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/95 via-black/90 to-primary/20 backdrop-blur-xl" />
      
      {/* Animated Background Glow */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Modal Container */}
      <div
        className={`relative w-full animate-scale-in ${getModalMaxWidth()}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glass Card with Enhanced Border */}
        <div className="relative bg-card/95 backdrop-blur-2xl border border-primary/30 shadow-2xl shadow-primary/20 rounded-3xl overflow-hidden">
          {/* Top Gradient Border Effect */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
          
          {/* Header */}
          <div className={`relative border-b border-surface/20 ${
            isLandscape && isSmallScreen ? "px-4 py-3" : "px-8 py-6"
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-xl bg-primary/10 border border-primary/20 ${
                  isLandscape && isSmallScreen ? "hidden" : ""
                }`}>
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className={`font-bold bg-gradient-to-r from-text via-primary to-text bg-clip-text text-transparent ${
                    isLandscape && isSmallScreen ? "text-lg" : "text-2xl"
                  }`}>
                    {memberName}
                  </h3>
                  <p className={`text-muted/60 mt-0.5 ${
                    isLandscape && isSmallScreen ? "text-xs" : "text-sm"
                  }`}>Member Avatar</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="group p-2.5 rounded-xl bg-surface/20 hover:bg-error/20 border border-surface/40 hover:border-error/50 transition-all duration-300"
                aria-label="Close"
              >
                <X className="h-5 w-5 text-muted group-hover:text-error transition-colors duration-300" />
              </button>
            </div>
          </div>

          {/* Image Content */}
          <div className={isLandscape && isSmallScreen ? "p-3" : "p-6 sm:p-8"}>
            <div
              className="relative w-full max-w-full rounded-2xl overflow-hidden group"
              style={{
                aspectRatio: imageAspectRatio || 1,
                maxHeight: isLandscape && isSmallScreen ? '50vh' : '70vh',
              }}
            >
              {/* Image Container with Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-surface/10 to-secondary/5 border-2 border-primary/20 rounded-2xl">
                {avatarUrl ? (
                  <>
                    <Image
                      src={avatarUrl}
                      alt={memberName}
                      fill
                      className="object-contain p-2"
                      sizes="(max-width: 1024px) 100vw, 1024px"
                      priority
                    />
                    {/* Subtle Glow on Hover */}
                    <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-all duration-500 rounded-2xl" />
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10">
                    <div className={`text-center ${isLandscape && isSmallScreen ? "space-y-3" : "space-y-6"}`}>
                      <div className="relative">
                        <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl" />
                        <User className={`relative text-primary/40 mx-auto ${
                          isLandscape && isSmallScreen ? "h-16 w-16" : "h-32 w-32"
                        }`} />
                      </div>
                      <div>
                        <span className={`font-bold bg-gradient-to-br from-primary to-secondary bg-clip-text text-transparent ${
                          isLandscape && isSmallScreen ? "text-4xl" : "text-7xl"
                        }`}>
                          {getInitials()}
                        </span>
                        <p className={`text-muted/60 ${
                          isLandscape && isSmallScreen ? "mt-2 text-sm" : "mt-4 text-lg"
                        }`}>No avatar uploaded</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Corner Accents */}
              <div className="absolute top-0 left-0 w-16 h-16 border-l-2 border-t-2 border-primary/40 rounded-tl-2xl" />
              <div className="absolute top-0 right-0 w-16 h-16 border-r-2 border-t-2 border-primary/40 rounded-tr-2xl" />
              <div className="absolute bottom-0 left-0 w-16 h-16 border-l-2 border-b-2 border-primary/40 rounded-bl-2xl" />
              <div className="absolute bottom-0 right-0 w-16 h-16 border-r-2 border-b-2 border-primary/40 rounded-br-2xl" />
            </div>
          </div>

          {/* Footer - Desktop only */}
          <div className="hidden lg:block relative border-t border-surface/20 px-8 pb-6">
            <div className="flex items-center justify-center gap-2 py-4">
              <div className="flex items-center gap-2 text-sm text-muted/60">
                <kbd className="px-2 py-1 bg-surface/40 border border-surface/60 rounded text-xs font-mono">ESC</kbd>
                <span>or click outside to close</span>
              </div>
            </div>
          </div>

          {/* Bottom Gradient Border Effect */}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
        </div>
      </div>
    </div>
  );

  // Use portal to render at document body level
  return typeof window !== 'undefined'
    ? createPortal(modalContent, document.body)
    : null;
}

interface AvatarWithPreviewProps {
  avatarUrl?: string | null;
  memberName: string;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export function AvatarWithPreview({
  avatarUrl,
  memberName,
  size = 'medium',
  className = '',
}: AvatarWithPreviewProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getInitials = () => {
    return memberName
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const sizeClasses = {
    small: 'w-10 h-10',
    medium: 'w-16 h-16',
    large: 'w-20 h-20',
  };

  const initialSizeClasses = {
    small: 'text-sm',
    medium: 'text-xl',
    large: 'text-2xl',
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        className={`relative ${sizeClasses[size]} rounded-full overflow-hidden border-2 border-primary/30 shadow-lg hover:border-primary/60 hover:scale-105 transition-all duration-200 cursor-pointer group ${className}`}
        title="Click to view full size"
      >
        {avatarUrl ? (
          <>
            <Image
              src={avatarUrl}
              alt={memberName}
              fill
              className="object-cover"
              sizes={size === 'small' ? '40px' : size === 'medium' ? '64px' : '80px'}
            />
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-200 flex items-center justify-center">
              <span className="text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                View
              </span>
            </div>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10 group-hover:from-primary/20 group-hover:to-secondary/20 transition-all duration-200">
            <span className={`${initialSizeClasses[size]} font-bold text-primary`}>
              {getInitials()}
            </span>
          </div>
        )}
      </button>

      <AvatarPreviewModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        avatarUrl={avatarUrl}
        memberName={memberName}
      />
    </>
  );
}

