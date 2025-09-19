export type MemberStatus = "active" | "inactive" | "frozen";
export type MemberGender = "male" | "female" | "other";

export type Member = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  gender?: MemberGender | null;
  status: MemberStatus;
  plan_id: string | null;
  plan_name?: string | null;
  expires_at: string | null;
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
  action: string;
  entity: string | null;
  entity_id: string | null;
  meta: Record<string, unknown> | null;
  created_at: string;
};

export type OccupancySnapshot = {
  total: number;
  capacity?: number | null;
};
