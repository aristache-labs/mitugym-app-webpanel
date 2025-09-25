export type MemberStatus = "active" | "inactive" | "frozen" | "pending" | "suspended";
export type MemberGender = "male" | "female" | "other";

export type Member = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  gender?: MemberGender | null;
  date_of_birth: string | null;
  address: string | null;
  city: string | null;
  county: string | null;
  status: MemberStatus;
  plan_id: string | null;
  plan_name?: string | null;
  starts_at: string | null;
  expires_at: string | null;
  created_at: string;
};

// Database profile type for raw Supabase queries
export type DatabaseProfile = {
  id: string;
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  phone?: string | null;
  gender?: string | null;
  date_of_birth?: string | null;
  address?: string | null;
  city?: string | null;
  county?: string | null;
  status?: string | null;
  plan_id?: string | null;
  starts_at?: string | null;
  expires_at?: string | null;
  created_at: string;
};

export type MembershipPlan = {
  id: string;
  name: string;
  price: number;
  duration_months: number;
  features?: string[];
  is_active: boolean;
};

export type CheckIn = {
  id: string;
  member_id: string;
  member_name?: string | null;
  checked_in_at: string;
  checked_out_at?: string | null;
  duration_minutes?: number | null;
  method: string | null;
};

export type NewsItem = {
  id: string;
  title: string;
  content: string;
  priority: "low" | "medium" | "high";
  expires_at: string | null;
  created_at: string;
  author_name?: string | null;
};

export type ScheduleDay = {
  weekday: number; // 0-6
  opens_at: string | null;
  closes_at: string | null;
  is_closed: boolean;
};

export type AuditLogEntry = {
  id: string;
  actor_id: string | null;
  actor_name?: string | null;
  actor_role?: string | null;
  action: string;
  entity: string | null;
  entity_id: string | null;
  resource_name?: string | null;
  meta: Record<string, unknown> | null;
  changes?: Record<string, { before: unknown; after: unknown }> | string | null;
  created_at: string;
};

export type OccupancySnapshot = {
  total: number;
  capacity?: number | null;
};

// Service related types
export type ServiceType = "personal_trainer" | "professional_massage";
export type BookingStatus = "pending" | "confirmed" | "upcoming" | "completed" | "cancelled";
export type PurchasedServiceStatus = "pending" | "approved" | "cancelled";

export type Service = {
  id: string;
  name: string;
  service_type: ServiceType;
  session_type?: string | null;
  duration_minutes: number;
  price: number;
  description?: string | null;
  requires_advance_booking: boolean;
  advance_booking_hours: number;
  max_sessions?: number | null;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
};

export type ServiceBooking = {
  id: string;
  member_id: string | null;
  service_id: string | null;
  booking_date: string;
  status: BookingStatus;
  sessions_remaining?: number | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
  // Relations
  service?: Service;
  member?: Member;
};

export type PurchasedService = {
  id: string;
  member_id: string;
  service_id: string;
  status: PurchasedServiceStatus;
  sessions_total: number;
  sessions_remaining: number;
  purchase_date: string;
  approved_date?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
  // Relations
  service?: Service;
  member?: Member;
};
