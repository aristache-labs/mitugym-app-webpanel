import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { calculateMemberStatus } from "@/lib/utils";
import type {
  AuditLogEntry,
  CheckIn,
  Member,
  MembershipPlan,
  NewsItem,
  OccupancySnapshot,
  ScheduleDay,
  Service,
  ServiceBooking,
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
    gender: "other",
    status: "active",
    plan_id: "plan-basic",
    plan_name: "Unlimited",
    starts_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
    expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
  },
  {
    id: "22222222-2222-2222-2222-222222222222",
    full_name: "Jordan Smith",
    email: "jordan@mitugym.dev",
    phone: "+1 555-0124",
    gender: "male",
    status: "frozen",
    plan_id: "plan-flex",
    plan_name: "Flex 12",
    starts_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 1).toISOString(), // Starts tomorrow
    expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 32).toISOString(), // Expires in ~month
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60).toISOString(),
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
    entity_id: sampleMembers[0].id,
    meta: { email: "avery@mitugym.dev" },
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
    .select("id, first_name, last_name, gender, email, phone, membership_status, membership_plan, plan_start_date, expiry_date, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to load members", error);
    return sampleMembers;
  }

  const rows = (data as SupabaseMemberRow[] | null) ?? [];

  if (!rows.length) {
    return sampleMembers;
  }

  // Fetch plans to map plan IDs to names
  const plansData = await fetchPlans();
  const planLookup = new Map(plansData.map(plan => [plan.id, plan.name]));

  return rows.map<Member>((profile) => {
    const storedStatus = profile.membership_status as Member['status'] || 'active';
    const actualStatus = calculateMemberStatus(storedStatus, profile.plan_start_date, profile.expiry_date);
    
    return {
      id: profile.id,
      full_name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || null,
      email: profile.email,
      phone: profile.phone,
      gender: profile.gender as Member['gender'] || null,
      status: actualStatus as Member['status'],
      plan_id: profile.membership_plan || null,
      plan_name: profile.membership_plan ? planLookup.get(profile.membership_plan) || null : null,
      starts_at: profile.plan_start_date,
      expires_at: profile.expiry_date,
      created_at: profile.created_at,
    };
  });
}

export async function fetchMemberById(id: string): Promise<Member | null> {
  const admin = getSupabaseAdmin();
  if (!admin) {
    return sampleMembers.find((member) => member.id === id) ?? null;
  }

  const { data, error } = await admin
    .from("profiles")
    .select("id, first_name, last_name, gender, email, phone, membership_status, membership_plan, plan_start_date, expiry_date, created_at")
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

  // Fetch plans to get the plan name
  const plansData = await fetchPlans();
  const planLookup = new Map(plansData.map(plan => [plan.id, plan.name]));
  
  const storedStatus = profile.membership_status as Member['status'] || 'active';
  const actualStatus = calculateMemberStatus(storedStatus, profile.plan_start_date, profile.expiry_date);

  return {
    id: profile.id,
    full_name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || null,
    email: profile.email,
    phone: profile.phone,
    gender: profile.gender as Member['gender'] || null,
    status: actualStatus as Member['status'],
    plan_id: profile.membership_plan || null,
    plan_name: profile.membership_plan ? planLookup.get(profile.membership_plan) || null : null,
    starts_at: profile.plan_start_date,
    expires_at: profile.expiry_date,
    created_at: profile.created_at,
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
    // Convert from database format (0=Monday, 6=Sunday) to JS Date format (0=Sunday, 1=Monday)
    // DB: 0=Mon,1=Tue,2=Wed,3=Thu,4=Fri,5=Sat,6=Sun
    // JS: 0=Sun,1=Mon,2=Tue,3=Wed,4=Thu,5=Fri,6=Sat
    weekday: (row.day_of_week + 1) % 7, // DB Mon(0)→JS Mon(1), DB Sun(6)→JS Sun(0)
    opens_at: row.open_time ? row.open_time.substring(0, 5) : null, // Remove seconds from time
    closes_at: row.close_time ? row.close_time.substring(0, 5) : null, // Remove seconds from time
    is_closed: !row.is_active // Convert is_active to is_closed (inverse)
  })) as ScheduleDay[];
}

export async function fetchAuditLogs(): Promise<AuditLogEntry[]> {
  const admin = getSupabaseAdmin();
  if (!admin) {
    return sampleAudit;
  }

  const { data, error } = await admin
    .from("audit_logs_enhanced")
    .select("id, actor_id, actor_name, actor_role, action, entity, entity_id, resource_name, meta, changes, created_at")
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

// ===== SERVICE DATA FUNCTIONS =====

export async function fetchServices(): Promise<Service[]> {
  const admin = getSupabaseAdmin();
  if (!admin) {
    console.error("Supabase admin client not available");
    return [];
  }

  const { data, error } = await admin
    .from("services")
    .select("*")
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch services", error);
    return [];
  }

  return data.map((service) => ({
    id: service.id,
    name: service.name,
    service_type: service.service_type,
    session_type: service.session_type,
    duration_minutes: service.duration_minutes,
    price: parseFloat(service.price),
    description: service.description,
    requires_advance_booking: service.requires_advance_booking,
    advance_booking_hours: service.advance_booking_hours,
    max_sessions: service.max_sessions,
    is_active: service.is_active,
    display_order: service.display_order,
    created_at: service.created_at,
    updated_at: service.updated_at,
  }));
}

export async function fetchServiceById(id: string): Promise<Service | null> {
  const admin = getSupabaseAdmin();
  if (!admin) {
    console.error("Supabase admin client not available");
    return null;
  }

  const { data, error } = await admin
    .from("services")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Failed to fetch service", error);
    return null;
  }

  return {
    id: data.id,
    name: data.name,
    service_type: data.service_type,
    session_type: data.session_type,
    duration_minutes: data.duration_minutes,
    price: parseFloat(data.price),
    description: data.description,
    requires_advance_booking: data.requires_advance_booking,
    advance_booking_hours: data.advance_booking_hours,
    max_sessions: data.max_sessions,
    is_active: data.is_active,
    display_order: data.display_order,
    created_at: data.created_at,
    updated_at: data.updated_at,
  };
}

export async function fetchServiceBookings(): Promise<ServiceBooking[]> {
  const admin = getSupabaseAdmin();
  if (!admin) {
    console.error("Supabase admin client not available");
    return [];
  }

  const { data, error } = await admin
    .from("service_bookings")
    .select(`
      *,
      services (*),
      profiles (*)
    `)
    .order("booking_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch service bookings", error);
    return [];
  }

  return data.map((booking) => ({
    id: booking.id,
    member_id: booking.member_id,
    service_id: booking.service_id,
    booking_date: booking.booking_date,
    status: booking.status,
    sessions_remaining: booking.sessions_remaining,
    notes: booking.notes,
    created_at: booking.created_at,
    updated_at: booking.updated_at,
    service: booking.services ? {
      id: booking.services.id,
      name: booking.services.name,
      service_type: booking.services.service_type,
      session_type: booking.services.session_type,
      duration_minutes: booking.services.duration_minutes,
      price: parseFloat(booking.services.price),
      description: booking.services.description,
      requires_advance_booking: booking.services.requires_advance_booking,
      advance_booking_hours: booking.services.advance_booking_hours,
      max_sessions: booking.services.max_sessions,
      is_active: booking.services.is_active,
      display_order: booking.services.display_order,
      created_at: booking.services.created_at,
      updated_at: booking.services.updated_at,
    } : undefined,
    member: booking.profiles ? {
      id: booking.profiles.id,
      full_name: `${booking.profiles.first_name || ""} ${booking.profiles.last_name || ""}`.trim(),
      email: booking.profiles.email,
      phone: booking.profiles.phone,
      gender: booking.profiles.gender,
      status: booking.profiles.membership_status,
      plan_id: null, // Not needed for bookings
      starts_at: booking.profiles.plan_start_date,
      expires_at: booking.profiles.expiry_date,
      created_at: booking.profiles.created_at,
    } : undefined,
  }));
}

export async function fetchTodaysServiceBookings(): Promise<ServiceBooking[]> {
  const admin = getSupabaseAdmin();
  if (!admin) {
    console.error("Supabase admin client not available");
    return [];
  }

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];

  const { data, error } = await admin
    .from("service_bookings")
    .select(`
      *,
      services (*),
      profiles (*)
    `)
    .eq("status", "upcoming")
    .gte("booking_date", `${today}T00:00:00Z`)
    .lt("booking_date", `${today}T23:59:59Z`)
    .order("booking_date", { ascending: true });

  if (error) {
    console.error("Failed to fetch today's service bookings", error);
    return [];
  }

  return data.map((booking) => ({
    id: booking.id,
    member_id: booking.member_id,
    service_id: booking.service_id,
    booking_date: booking.booking_date,
    status: booking.status,
    sessions_remaining: booking.sessions_remaining,
    notes: booking.notes,
    created_at: booking.created_at,
    updated_at: booking.updated_at,
    service: booking.services ? {
      id: booking.services.id,
      name: booking.services.name,
      service_type: booking.services.service_type,
      session_type: booking.services.session_type,
      duration_minutes: booking.services.duration_minutes,
      price: parseFloat(booking.services.price),
      description: booking.services.description,
      requires_advance_booking: booking.services.requires_advance_booking,
      advance_booking_hours: booking.services.advance_booking_hours,
      max_sessions: booking.services.max_sessions,
      is_active: booking.services.is_active,
      display_order: booking.services.display_order,
      created_at: booking.services.created_at,
      updated_at: booking.services.updated_at,
    } : undefined,
    member: booking.profiles ? {
      id: booking.profiles.id,
      full_name: `${booking.profiles.first_name || ""} ${booking.profiles.last_name || ""}`.trim(),
      email: booking.profiles.email,
      phone: booking.profiles.phone,
      gender: booking.profiles.gender,
      status: booking.profiles.membership_status,
      plan_id: null, // Not needed for bookings
      starts_at: booking.profiles.plan_start_date,
      expires_at: booking.profiles.expiry_date,
      created_at: booking.profiles.created_at,
    } : undefined,
  }));
}
