import { getSupabaseAdmin } from "@/lib/supabase-admin";
import type {
  AuditLogEntry,
  CheckIn,
  Member,
  MembershipPlan,
  NewsItem,
  OccupancySnapshot,
  ScheduleDay,
} from "@/types";

type SupabaseMemberRow = Omit<Member, "plan_name"> & {
  membership_plans?: { name?: string | null } | null;
};

type SupabaseCheckInRow = CheckIn & {
  members?: { full_name?: string | null } | null;
};

type SupabaseNewsRow = NewsItem & {
  staff_profiles?: { full_name?: string | null } | null;
};

const sampleMembers: Member[] = [
  {
    id: "11111111-1111-1111-1111-111111111111",
    full_name: "Avery Carter",
    email: "avery@mitugym.dev",
    phone: "+1 555-0110",
    status: "active",
    plan_id: "plan-basic",
    plan_name: "Unlimited",
    expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
    notes: "Prefers morning classes",
  },
  {
    id: "22222222-2222-2222-2222-222222222222",
    full_name: "Jordan Smith",
    email: "jordan@mitugym.dev",
    phone: "+1 555-0124",
    status: "frozen",
    plan_id: "plan-flex",
    plan_name: "Flex 12",
    expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2).toISOString(),
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60).toISOString(),
    notes: null,
  },
];

const samplePlans: MembershipPlan[] = [
  {
    id: "plan-basic",
    name: "Unlimited",
    price: 79,
    duration_days: 30,
    description: "Unlimited access, billed monthly",
    is_active: true,
  },
  {
    id: "plan-flex",
    name: "Flex 12",
    price: 249,
    duration_days: 90,
    description: "12 sessions you can use anytime within 3 months",
    is_active: true,
  },
];

const sampleCheckIns: CheckIn[] = [
  {
    id: "ci-1",
    member_id: sampleMembers[0].id,
    member_name: sampleMembers[0].full_name,
    checked_in_at: new Date().toISOString(),
    method: "qr",
  },
  {
    id: "ci-2",
    member_id: sampleMembers[1].id,
    member_name: sampleMembers[1].full_name,
    checked_in_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    method: "manual",
  },
];

const sampleNews: NewsItem[] = [
  {
    id: "news-1",
    title: "New recovery classes",
    content: "<p>We are launching guided recovery classes on Tuesdays and Thursdays.</p>",
    priority: "high",
    expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 10).toISOString(),
    created_at: new Date().toISOString(),
    author_name: "Operations",
  },
];

const sampleSchedule: ScheduleDay[] = Array.from({ length: 7 }).map((_, index) => ({
  weekday: index,
  opens_at: "06:00",
  closes_at: "22:00",
  is_closed: index === 6,
}));

const sampleAudit: AuditLogEntry[] = [
  {
    id: "audit-1",
    actor_id: sampleMembers[0].id,
    action: "member.create",
    entity: "members",
    metadata: { email: "avery@mitugym.dev" },
    created_at: new Date().toISOString(),
  },
];

export async function fetchMembers(): Promise<Member[]> {
  const admin = getSupabaseAdmin();
  if (!admin) {
    return sampleMembers;
  }

  const { data, error } = await admin
    .from("members")
    .select("id, full_name, email, phone, status, plan_id, expires_at, created_at, notes, membership_plans(name)")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to load members", error);
    return sampleMembers;
  }

  const rows = (data as SupabaseMemberRow[] | null) ?? [];

  return rows.length
    ? rows.map<Member>((member) => ({
        ...member,
        plan_name: member.membership_plans?.name ?? null,
      }))
    : sampleMembers;
}

export async function fetchMemberById(id: string): Promise<Member | null> {
  const admin = getSupabaseAdmin();
  if (!admin) {
    return sampleMembers.find((member) => member.id === id) ?? null;
  }

  const { data, error } = await admin
    .from("members")
    .select("id, full_name, email, phone, status, plan_id, expires_at, created_at, notes, membership_plans(name)")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("Failed to load member", error);
    return sampleMembers.find((member) => member.id === id) ?? null;
  }

  if (!data) {
    return null;
  }

  const row = data as SupabaseMemberRow;

  return {
    ...row,
    plan_name: row.membership_plans?.name ?? null,
  } as Member;
}

export async function fetchPlans(): Promise<MembershipPlan[]> {
  const admin = getSupabaseAdmin();
  if (!admin) {
    return samplePlans;
  }

  const { data, error } = await admin
    .from("membership_plans")
    .select("id, name, price, duration_days, description, is_active")
    .order("price");

  if (error) {
    console.error("Failed to load plans", error);
    return samplePlans;
  }

  return data ?? samplePlans;
}

export async function fetchCheckIns(): Promise<CheckIn[]> {
  const admin = getSupabaseAdmin();
  if (!admin) {
    return sampleCheckIns;
  }

  const { data, error } = await admin
    .from("check_ins")
    .select("id, member_id, checked_in_at, method, members(full_name)")
    .order("checked_in_at", { ascending: false })
    .limit(200);

  if (error) {
    console.error("Failed to load check-ins", error);
    return sampleCheckIns;
  }

  const rows = (data as SupabaseCheckInRow[] | null) ?? [];

  return rows.length
    ? rows.map<CheckIn>((checkIn) => ({
        ...checkIn,
        member_name: checkIn.members?.full_name ?? null,
      }))
    : sampleCheckIns;
}

export async function fetchNews(): Promise<NewsItem[]> {
  const admin = getSupabaseAdmin();
  if (!admin) {
    return sampleNews;
  }

  const { data, error } = await admin
    .from("news")
    .select("id, title, content, priority, expires_at, created_at, staff_profiles(full_name)")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to load news", error);
    return sampleNews;
  }

  const rows = (data as SupabaseNewsRow[] | null) ?? [];

  return rows.length
    ? rows.map<NewsItem>((item) => ({
        ...item,
        author_name: item.staff_profiles?.full_name ?? null,
      }))
    : sampleNews;
}

export async function fetchSchedule(): Promise<ScheduleDay[]> {
  const admin = getSupabaseAdmin();
  if (!admin) {
    return sampleSchedule;
  }

  const { data, error } = await admin.from("gym_schedule").select("weekday, opens_at, closes_at, is_closed");

  if (error) {
    console.error("Failed to load schedule", error);
    return sampleSchedule;
  }

  if (!data || data.length === 0) {
    return sampleSchedule;
  }

  return data as ScheduleDay[];
}

export async function fetchAuditLogs(): Promise<AuditLogEntry[]> {
  const admin = getSupabaseAdmin();
  if (!admin) {
    return sampleAudit;
  }

  const { data, error } = await admin
    .from("audit_logs")
    .select("id, actor_id, action, entity, metadata, created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    console.error("Failed to load audit logs", error);
    return sampleAudit;
  }

  return data ?? sampleAudit;
}

export async function fetchOccupancy(): Promise<OccupancySnapshot> {
  const admin = getSupabaseAdmin();
  if (!admin) {
    return { total: sampleCheckIns.length, capacity: 120 };
  }

  const { data, error } = await admin.rpc("current_occupancy");

  if (error) {
    console.error("Failed to fetch occupancy", error);
    return { total: sampleCheckIns.length, capacity: 120 };
  }

  return (data as OccupancySnapshot) ?? { total: 0, capacity: 120 };
}

export async function fetchDashboardMetrics() {
  const [members, checkIns, occupancy] = await Promise.all([
    fetchMembers(),
    fetchCheckIns(),
    fetchOccupancy(),
  ]);

  const activeMembers = members.filter((member) => member.status === "active").length;
  const expiringSoon = members.filter((member) => {
    if (!member.expires_at) return false;
    const expires = new Date(member.expires_at).getTime();
    const now = Date.now();
    const week = 1000 * 60 * 60 * 24 * 7;
    return expires - now < week && expires > now;
  }).length;

  const occupancyNow = occupancy?.total ?? checkIns.filter((checkIn) => {
    return new Date(checkIn.checked_in_at).getTime() > Date.now() - 1000 * 60 * 60;
  }).length;

  return {
    occupancy: occupancyNow,
    activeMembers,
    expiringSoon,
  };
}
