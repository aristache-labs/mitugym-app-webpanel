export type NotificationType = 
  | "service_purchase"
  | "session_booking"
  | "session_updated"
  | "session_cancelled"
  | "announcement"
  | "gym_schedule_updated";

export type AdminNotification = {
  id: string;
  member_id: string | null; // NULL for admin notifications
  type: NotificationType;
  title: string;
  message: string;
  reference_id: string | null;
  reference_type: string | null;
  is_global: boolean;
  is_admin_only: boolean; // TRUE for admin-only notifications (not shown in mobile app)
  is_read: boolean;
  created_at: string;
  read_at?: string | null;
};

export type NotificationCount = {
  total: number;
  unread: number;
};

