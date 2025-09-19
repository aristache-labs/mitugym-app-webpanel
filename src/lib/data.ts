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
    id: "plan-day",
    name: "Day Pass",
    price: 15,
    duration_months: 0,
    features: ["Single day access", "All equipment", "Valid for 24 hours"],
    is_active: true,
  },
  {
    id: "plan-basic",
    name: "Monthly Unlimited",
    price: 79,
    duration_months: 1,
    features: ["Unlimited access", "All equipment", "Monthly billing"],
    is_active: true,
  },
  {
    id: "plan-flex",
    name: "Quarterly Plan",
    price: 199,
    duration_months: 3,
    features: ["3 month access", "All equipment", "Flexible timing"],
    is_active: true,
  },
];

const sampleCheckIns: CheckIn[] = [
  {
    id: "ci-1",
    member_id: sampleMembers[0].id,
    member_name: sampleMembers[0].full_name,
    checked_in_at: new Date().toISOString(),
    checked_out_at: null,
    duration_minutes: null,
    method: "qr",
  },
  {
    id: "ci-2",
    member_id: sampleMembers[1].id,
    member_name: sampleMembers[1].full_name,
    checked_in_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    checked_out_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    duration_minutes: 10,
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
    .from("profiles")
    .select("id, first_name, last_name, email, phone, membership_status, membership_plan, expiry_date, created_at, address")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to load members", error);
    return sampleMembers;
  }

  const rows = (data as SupabaseMemberRow[] | null) ?? [];

  return rows.length
    ? rows.map<Member>((profile) => ({
        id: profile.id,
        full_name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || null,
        email: profile.email,
        phone: profile.phone,
        status: profile.membership_status as Member['status'] || 'active',
        plan_id: profile.membership_plan || null,
        plan_name: profile.membership_plan,
        expires_at: profile.expiry_date,
        created_at: profile.created_at,
        notes: profile.address // Using address field for notes
      }))
    : sampleMembers;
}

export async function fetchMemberById(id: string): Promise<Member | null> {
  const admin = getSupabaseAdmin();
  if (!admin) {
    return sampleMembers.find((member) => member.id === id) ?? null;
  }

  const { data, error } = await admin
    .from("profiles")
    .select("id, first_name, last_name, email, phone, membership_status, membership_plan, expiry_date, created_at, address")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("Failed to load member", error);
    return sampleMembers.find((member) => member.id === id) ?? null;
  }

  if (!data) {
    return null;
  }

  const profile = data as any;

  return {
    id: profile.id,
    full_name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || null,
    email: profile.email,
    phone: profile.phone,
    status: profile.membership_status as Member['status'] || 'active',
    plan_id: profile.membership_plan || null,
    plan_name: profile.membership_plan,
    expires_at: profile.expiry_date,
    created_at: profile.created_at,
    notes: profile.address
  } as Member;
}

export async function fetchPlans(): Promise<MembershipPlan[]> {
  const admin = getSupabaseAdmin();
  if (!admin) {
    return samplePlans;
  }

  const { data, error } = await admin
    .from("membership_plans")
    .select("id, name, price, duration_months, features, is_active")
    .order("price");

  if (error) {
    console.error("Failed to load plans", error);
    return samplePlans;
  }

  return data ? data.map((plan: any) => ({
    id: plan.id,
    name: plan.name,
    price: plan.price,
    duration_months: plan.duration_months ?? 1, // Use nullish coalescing to preserve 0
    features: plan.features || [],
    is_active: plan.is_active
  })) : samplePlans;
}

export async function fetchCheckIns(): Promise<CheckIn[]> {
  const admin = getSupabaseAdmin();
  if (!admin) {
    return sampleCheckIns;
  }

  // Get checkins data
  const { data: checkinsData, error: checkinsError } = await admin
    .from("checkins")
    .select("id, user_id, check_in_time, check_out_time, duration_minutes, membership_plan_name")
    .order("check_in_time", { ascending: false })
    .limit(200);

  if (checkinsError) {
    console.error("Failed to load check-ins", checkinsError);
    return sampleCheckIns;
  }

  if (!checkinsData || checkinsData.length === 0) {
    return sampleCheckIns;
  }

  // Get unique user IDs from checkins
  const userIds = [...new Set(checkinsData.map(c => c.user_id))];

  // Get member names for these users
  const { data: profilesData, error: profilesError } = await admin
    .from("profiles")
    .select("id, first_name, last_name")
    .in("id", userIds);

  if (profilesError) {
    console.error("Failed to load member profiles", profilesError);
  }

  // Create a map of user_id to member name
  const memberNames: Record<string, string> = {};
  if (profilesData) {
    profilesData.forEach(profile => {
      memberNames[profile.id] = `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Unknown Member';
    });
  }

  return checkinsData.map<CheckIn>((checkIn: any) => ({
    id: checkIn.id,
    member_id: checkIn.user_id,
    member_name: memberNames[checkIn.user_id] || 'Unknown Member',
    checked_in_at: checkIn.check_in_time,
    checked_out_at: checkIn.check_out_time,
    duration_minutes: checkIn.duration_minutes,
    method: 'manual' // Default since method isn't in the current schema
  }));
}

export async function fetchNews(): Promise<NewsItem[]> {
  const admin = getSupabaseAdmin();
  if (!admin) {
    return sampleNews;
  }

  const { data, error } = await admin
    .from("announcements")
    .select("id, title, content, priority, end_date, created_at, created_by")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to load news", error);
    return sampleNews;
  }

  const rows = (data as any[] | null) ?? [];

  return rows.length
    ? rows.map<NewsItem>((item) => ({
        id: item.id,
        title: item.title,
        content: item.content,
        priority: item.priority === 1 ? 'low' : item.priority === 2 ? 'medium' : 'high',
        expires_at: item.end_date,
        created_at: item.created_at,
        author_name: 'Admin', // No relationship exists, using default
      }))
    : sampleNews;
}

export async function fetchSchedule(): Promise<ScheduleDay[]> {
  const admin = getSupabaseAdmin();
  if (!admin) {
    return sampleSchedule;
  }

  const { data, error } = await admin.from("gym_schedule").select("day_of_week, open_time, close_time, is_active");

  if (error) {
    console.error("Failed to load schedule", error);
    return sampleSchedule;
  }

  if (!data || data.length === 0) {
    return sampleSchedule;
  }

  return data.map((row: any) => ({
    weekday: row.day_of_week,
    opens_at: row.open_time,
    closes_at: row.close_time,
    is_closed: !row.is_active // Convert is_active to is_closed (inverse)
  })) as ScheduleDay[];
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
