"use client";

import { useState, useRef } from "react";
import { Camera, Upload, X, User } from "lucide-react";
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
    <div className="space-y-4">
      <div className="flex items-start gap-6">
        {/* Avatar Preview */}
        <div className="relative group">
          <div className={`relative w-32 h-32 rounded-2xl overflow-hidden border-2 transition-all duration-300 ${
            previewUrl 
              ? 'border-primary/30 shadow-lg' 
              : 'border-surface/40 bg-gradient-to-br from-surface/40 to-card/40'
          }`}>
            {previewUrl ? (
              <Image
                src={previewUrl}
                alt={memberName}
                fill
                className="object-cover"
                sizes="128px"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10">
                <span className="text-3xl font-bold text-primary">
                  {getInitials()}
                </span>
              </div>
            )}
            
            {/* Overlay on hover */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
              <Camera className="h-8 w-8 text-white" />
            </div>
          </div>

          {/* Delete button */}
          {previewUrl && (
            <button
              type="button"
              onClick={handleDelete}
              className="absolute -top-2 -right-2 p-1.5 rounded-full bg-error text-white shadow-lg hover:bg-error/90 transition-all duration-200 hover:scale-110"
              title="Remove avatar"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Upload Area */}
        <div className="flex-1 space-y-3">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleClickUpload}
            className={`relative border-2 border-dashed rounded-xl p-6 transition-all duration-200 cursor-pointer ${
              isDragging
                ? 'border-primary bg-primary/5 scale-[1.02]'
                : 'border-surface/40 hover:border-primary/50 hover:bg-surface/20'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileInput}
              className="hidden"
            />

            <div className="flex flex-col items-center gap-3 text-center">
              <div className={`p-3 rounded-xl transition-all duration-200 ${
                isDragging 
                  ? 'bg-primary/20 scale-110' 
                  : 'bg-primary/10'
              }`}>
                <Upload className={`h-6 w-6 transition-colors duration-200 ${
                  isDragging ? 'text-primary' : 'text-primary/70'
                }`} />
              </div>
              
              <div>
                <p className="text-sm font-medium text-text">
                  {isDragging ? 'Drop image here' : 'Click to upload or drag and drop'}
                </p>
                <p className="text-xs text-muted/60 mt-1">
                  PNG, JPG, GIF up to 5MB
                </p>
              </div>
            </div>
          </div>

          {isEditing && currentAvatarUrl && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
              <User className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
              <p className="text-xs text-blue-800 dark:text-blue-200">
                Current avatar will be replaced if you upload a new one
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

