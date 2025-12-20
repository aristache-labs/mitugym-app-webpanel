-- Migration: Add RLS policies for staff to manage admin notifications
-- This allows staff members to update and delete admin-only notifications

-- Policy: Staff can update admin-only notifications
CREATE POLICY "Staff can update admin notifications"
ON public.notifications
FOR UPDATE
TO authenticated
USING (
  member_id IS NULL 
  AND is_global = true 
  AND is_admin_only = true
  AND auth.uid() IN (SELECT id FROM staff_profiles)
)
WITH CHECK (
  member_id IS NULL 
  AND is_global = true 
  AND is_admin_only = true
);

-- Policy: Staff can delete admin-only notifications
CREATE POLICY "Staff can delete admin notifications"
ON public.notifications
FOR DELETE
TO authenticated
USING (
  member_id IS NULL 
  AND is_global = true 
  AND is_admin_only = true
  AND auth.uid() IN (SELECT id FROM staff_profiles)
);

-- Policy: Staff can view admin-only notifications
CREATE POLICY "Staff can view admin notifications"
ON public.notifications
FOR SELECT
TO authenticated
USING (
  member_id IS NULL 
  AND is_global = true 
  AND is_admin_only = true
  AND auth.uid() IN (SELECT id FROM staff_profiles)
);

