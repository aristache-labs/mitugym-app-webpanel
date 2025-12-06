"use client";

import { useState, useRef } from "react";
import { Camera, X } from "lucide-react";
import Image from "next/image";

interface AvatarUploadProps {
  currentAvatarUrl?: string | null;
  onAvatarChange: (file: File | null) => void;
  onAvatarDelete: () => void;
  memberName?: string;
  isEditing?: boolean;
}

export function AvatarUpload({ 
  currentAvatarUrl, 
  onAvatarChange, 
  onAvatarDelete,
  memberName = "Member",
  isEditing = false
}: AvatarUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentAvatarUrl || null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    // Create preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Notify parent component
    onAvatarChange(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDelete = () => {
    setPreviewUrl(null);
    onAvatarDelete();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClickUpload = () => {
    fileInputRef.current?.click();
  };

  const getInitials = () => {
    return memberName
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInput}
        className="hidden"
      />

      {/* Clickable Avatar Preview */}
      <div className="relative group">
        <button
          type="button"
          onClick={handleClickUpload}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative w-36 h-36 sm:w-44 sm:h-44 lg:w-48 lg:h-48 rounded-2xl overflow-hidden border-2 transition-all duration-300 cursor-pointer ${
            isDragging
              ? 'border-primary bg-primary/10 scale-105'
              : previewUrl 
                ? 'border-primary/30 shadow-lg hover:border-primary/50 hover:shadow-xl' 
                : 'border-surface/40 bg-gradient-to-br from-surface/40 to-card/40 hover:border-primary/40'
          }`}
          title="Click to upload photo"
        >
          {previewUrl ? (
            <Image
              src={previewUrl}
              alt={memberName}
              fill
              className="object-cover"
              sizes="192px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10">
              <span className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary">
                {getInitials()}
              </span>
            </div>
          )}
          
          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center gap-2">
            <Camera className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
            <span className="text-xs sm:text-sm text-white font-medium">
              {isDragging ? 'Drop here' : previewUrl ? 'Change' : 'Upload'}
            </span>
          </div>
        </button>

        {/* Delete button */}
        {previewUrl && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete();
            }}
            className="absolute -top-2 -right-2 p-1.5 rounded-full bg-error text-white shadow-lg hover:bg-error/90 transition-all duration-200 hover:scale-110 z-10"
            title="Remove avatar"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Upload Info */}
      <div className="text-center space-y-1">
        <h4 className="text-sm sm:text-base font-semibold text-text">Member Photo</h4>
        <p className="text-xs sm:text-sm text-muted/70">
          Click to upload
        </p>
        <p className="text-[10px] sm:text-xs text-muted/50">
          PNG, JPG, GIF (5MB)
        </p>
      </div>
    </div>
  );
}

