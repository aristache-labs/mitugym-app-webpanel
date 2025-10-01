/**
 * Supabase Storage utilities for file uploads
 */

import { getSupabaseAdmin } from "@/lib/supabase-admin";

const AVATARS_BUCKET = "avatars";

/**
 * Upload an avatar image to Supabase Storage
 */
export async function uploadAvatar(
  file: File,
  userId: string
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const admin = getSupabaseAdmin();
    if (!admin) {
      return { success: false, error: "Storage service unavailable" };
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

    // Convert File to ArrayBuffer for upload
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    // Upload file to Supabase Storage
    const { error } = await admin.storage
      .from(AVATARS_BUCKET)
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      console.error("Upload error:", error);
      return { success: false, error: error.message };
    }

    // Get public URL
    const { data: urlData } = admin.storage
      .from(AVATARS_BUCKET)
      .getPublicUrl(filePath);

    return {
      success: true,
      url: urlData.publicUrl,
    };
  } catch (error) {
    console.error("Upload exception:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Upload failed",
    };
  }
}

/**
 * Delete an avatar image from Supabase Storage
 */
export async function deleteAvatar(
  avatarUrl: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const admin = getSupabaseAdmin();
    if (!admin) {
      return { success: false, error: "Storage service unavailable" };
    }

    // Extract file path from URL
    const url = new URL(avatarUrl);
    const pathParts = url.pathname.split(`/${AVATARS_BUCKET}/`);
    if (pathParts.length < 2) {
      return { success: false, error: "Invalid avatar URL" };
    }

    const filePath = pathParts[1];

    // Delete file from storage
    const { error } = await admin.storage
      .from(AVATARS_BUCKET)
      .remove([filePath]);

    if (error) {
      console.error("Delete error:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Delete exception:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Delete failed",
    };
  }
}

/**
 * Update avatar - deletes old one and uploads new one
 */
export async function updateAvatar(
  file: File,
  userId: string,
  oldAvatarUrl?: string | null
): Promise<{ success: boolean; url?: string; error?: string }> {
  // Delete old avatar if exists
  if (oldAvatarUrl) {
    await deleteAvatar(oldAvatarUrl);
  }

  // Upload new avatar
  return uploadAvatar(file, userId);
}

/**
 * Ensure the avatars bucket exists
 */
export async function ensureAvatarsBucket(): Promise<boolean> {
  try {
    const admin = getSupabaseAdmin();
    if (!admin) {
      return false;
    }

    // Check if bucket exists
    const { data: buckets } = await admin.storage.listBuckets();
    const bucketExists = buckets?.some((b) => b.name === AVATARS_BUCKET);

    if (!bucketExists) {
      // Create bucket if it doesn't exist
      const { error } = await admin.storage.createBucket(AVATARS_BUCKET, {
        public: true,
        fileSizeLimit: 5242880, // 5MB
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'],
      });

      if (error) {
        console.error("Failed to create avatars bucket:", error);
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error("Bucket check failed:", error);
    return false;
  }
}

