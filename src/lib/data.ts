import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { calculateMemberStatus } from "@/lib/utils";
import { getExpiringMembers } from "@/lib/expiring-helpers";
import type {
  AuditLogEntry,
  CheckIn,
  Member,
  DatabaseProfile,
  MembershipPlan,
  NewsItem,
  OccupancySnapshot,
  PlanType,
  PurchasedService,
  ScheduleDay,
  Service,
  ServiceBooking,
} from "@/types";


// Helper function to transform DatabaseProfile to Member
function transformDatabaseProfileToMember(dbProfile: DatabaseProfile, planName?: string | null): Member {
  const storedStatus = dbProfile.status as Member['status'] || 'active';
  const actualStatus = calculateMemberStatus(storedStatus, dbProfile.starts_at ?? null, dbProfile.expires_at ?? null);
  
  return {
    id: dbProfile.id,
    full_name: `${dbProfile.first_name || ''} ${dbProfile.last_name || ''}`.trim() || 'Unknown Member',
    email: dbProfile.email || '',
    phone: dbProfile.phone || null,
    gender: dbProfile.gender as Member['gender'] || null,
    date_of_birth: dbProfile.date_of_birth || null,
    address: dbProfile.address || null,
    city: dbProfile.city || null,
    county: dbProfile.county || null,
    status: actualStatus as Member['status'],
    plan_id: dbProfile.plan_id || null,
    plan_name: planName || null,
    starts_at: dbProfile.starts_at || null,
    expires_at: dbProfile.expires_at || null,
    created_at: dbProfile.created_at,
  };
}

const sampleMembers: Member[] = [
  {
    id: "11111111-1111-1111-1111-111111111111",
    full_name: "Avery Carter",
    email: "avery@mitugym.dev",
    phone: "+1 555-0110",
    gender: "other",
    date_of_birth: "1990-05-15",
    address: "123 Main Street",
    city: "Bucharest",
    county: "Ilfov",
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
    date_of_birth: "1985-12-03",
    address: "456 Oak Avenue",
    city: "Cluj-Napoca",
    county: "Cluj",
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
    plan_type: "day_entry",
    price: 15,
    duration_months: 0,
    features: ["Single day access", "All equipment", "Valid for 24 hours"],
    is_active: true,
  },
  {
    id: "plan-basic",
    name: "Monthly Unlimited",
    plan_type: "full",
    price: 79,
    duration_months: 1,
    features: ["Unlimited access", "All equipment", "Monthly billing"],
    is_active: true,
  },
  {
    id: "plan-flex",
    name: "Quarterly Plan",
    plan_type: "full",
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
    .select("id, first_name, last_name, gender, date_of_birth, address, city, county, email, phone, status, plan_id, starts_at, expires_at, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to load members", error);
    return sampleMembers;
  }

  const rows = (data as {
    id: string;
    first_name?: string;
    last_name?: string;
    email?: string;
    phone?: string;
    gender?: string;
    status?: string;
    plan_id?: string;
    starts_at?: string;
    expires_at?: string;
    created_at: string;
  }[] | null) ?? [];

  if (!rows.length) {
    return sampleMembers;
  }

  // Fetch plans to map plan IDs to names
  const plansData = await fetchPlans();
  const planLookup = new Map(plansData.map(plan => [plan.id, plan.name]));

  return rows.map<Member>((profile: DatabaseProfile) => {
    const planName = profile.plan_id ? (planLookup.get(profile.plan_id) ?? null) : null;
    return transformDatabaseProfileToMember(profile, planName);
  });
}

export async function fetchMemberById(id: string): Promise<Member | null> {
  const admin = getSupabaseAdmin();
  if (!admin) {
    return sampleMembers.find((member) => member.id === id) ?? null;
  }

  const { data, error } = await admin
    .from("profiles")
    .select("id, first_name, last_name, gender, date_of_birth, address, city, county, email, phone, status, plan_id, starts_at, expires_at, created_at")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("Failed to load member", error);
    return sampleMembers.find((member) => member.id === id) ?? null;
  }

  if (!data) {
    return null;
  }

  const profile = data as {
    id: string;
    first_name?: string;
    last_name?: string;
    email?: string;
    phone?: string;
    gender?: string;
    status?: string;
    plan_id?: string;
    starts_at?: string;
    expires_at?: string;
    created_at: string;
  };

  // Fetch plans to get the plan name
  const plansData = await fetchPlans();
  const planLookup = new Map(plansData.map(plan => [plan.id, plan.name]));
  
  const dbProfile = profile as DatabaseProfile;
  const planName = dbProfile.plan_id ? (planLookup.get(dbProfile.plan_id) ?? null) : null;
  return transformDatabaseProfileToMember(dbProfile, planName);
}

export async function fetchPlans(): Promise<MembershipPlan[]> {
  const admin = getSupabaseAdmin();
  if (!admin) {
    return samplePlans;
  }

  const { data, error } = await admin
    .from("membership_plans")
    .select("id, name, plan_type, price, duration_months, features, is_active")
    .order("price");

  if (error) {
    console.error("Failed to load plans", error);
    return samplePlans;
  }

  return data ? data.map((plan: {
    id: string;
    name: string;
    plan_type: string;
    price: number;
    duration_months?: number;
    features?: string[];
    is_active: boolean;
  }) => ({
    id: plan.id,
    name: plan.name,
    plan_type: plan.plan_type as PlanType,
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

  return checkinsData.map<CheckIn>((checkIn: {
    id: string;
    user_id: string;
    check_in_time: string;
    check_out_time?: string;
    duration_minutes?: number;
    membership_plan_name?: string;
  }) => ({
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

  const rows = (data as {
    id: string;
    title: string;
    content: string;
    priority: number;
    end_date?: string;
    created_at: string;
    created_by?: string;
  }[] | null) ?? [];

  return rows.length
    ? rows.map<NewsItem>((item) => ({
        id: item.id,
        title: item.title,
        content: item.content,
        priority: item.priority === 1 ? 'low' : item.priority === 2 ? 'medium' : 'high',
        expires_at: item.end_date || null,
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

  return data.map((row: {
    day_of_week: number;
    open_time?: string;
    close_time?: string;
    is_active: boolean;
  }) => ({
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
  const admin = getSupabaseAdmin();
  
  const [members, checkIns, occupancy, sessionBookings, purchasedServices] = await Promise.all([
    fetchMembers(),
    fetchCheckIns(),
    fetchOccupancy(),
    fetchSessionBookings(),
    fetchPurchasedServices(),
  ]);

  const activeMembers = members.filter((member) => member.status === "active").length;
  
  // Get expiring members count from database
  let expiringSoon = 0;
  if (admin) {
    const { data: expiringMembers, error } = await admin.rpc('get_expiring_members_count');
    
    if (error) {
      console.warn("Failed to get expiring members from database, using fallback calculation", error);
      // Use fallback calculation if RPC fails - now using consistent helper
      expiringSoon = getExpiringMembers(members, 7).length;
    } else {
      expiringSoon = expiringMembers ?? 0;
    }
  } else {
    // Fallback to frontend calculation if admin not available - using consistent helper
    expiringSoon = getExpiringMembers(members, 7).length;
  }

  const occupancyNow = occupancy?.total ?? checkIns.filter((checkIn) => {
    return new Date(checkIn.checked_in_at).getTime() > Date.now() - 1000 * 60 * 60;
  }).length;

  // Count pending session bookings
  const pendingBookings = sessionBookings.filter((booking) => booking.status === "pending").length;

  // Count pending purchased services (those awaiting approval)
  const pendingServices = purchasedServices.filter((service) => service.status === "pending").length;

  return {
    occupancy: occupancyNow,
    activeMembers,
    expiringSoon,
    pendingBookings,
    pendingServices,
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

export async function fetchPurchasedServices(): Promise<PurchasedService[]> {
  const admin = getSupabaseAdmin();
  if (!admin) {
    console.error("Supabase admin client not available");
    return [];
  }

  // First, get purchased services with services data
  const { data: purchasedData, error: purchasedError } = await admin
    .from("purchased_services")
    .select(`
      *,
      services (*)
    `)
    .order("purchase_date", { ascending: false });

  if (purchasedError) {
    console.error("Failed to fetch purchased services", purchasedError);
    return [];
  }

  if (!purchasedData || purchasedData.length === 0) {
    return [];
  }


  // Get unique member IDs
  const memberIds = [...new Set(purchasedData.map(p => p.member_id))];

  // Fetch profiles for these members
  const { data: profilesData, error: profilesError } = await admin
    .from("profiles")
    .select("*")
    .in("id", memberIds);

  if (profilesError) {
    console.error("Failed to fetch member profiles", profilesError);
  }

  // Create a map of member profiles
  const profilesMap = new Map();
  if (profilesData) {
    profilesData.forEach(profile => {
      profilesMap.set(profile.id, profile);
    });
  }

  return purchasedData.map((purchase) => ({
    id: purchase.id,
    member_id: purchase.member_id,
    service_id: purchase.service_id,
    status: purchase.status,
    sessions_total: purchase.sessions_total,
    sessions_remaining: purchase.sessions_remaining,
    purchase_date: purchase.purchase_date,
    approved_date: purchase.approved_date,
    cancelled_date: purchase.cancelled_date,
    notes: purchase.notes,
    created_at: purchase.created_at,
    updated_at: purchase.updated_at,
    service: purchase.services ? {
      id: purchase.services.id,
      name: purchase.services.name,
      service_type: purchase.services.service_type,
      session_type: purchase.services.session_type,
      duration_minutes: purchase.services.duration_minutes,
      price: parseFloat(purchase.services.price),
      description: purchase.services.description,
      requires_advance_booking: purchase.services.requires_advance_booking,
      advance_booking_hours: purchase.services.advance_booking_hours,
      max_sessions: purchase.services.max_sessions,
      is_active: purchase.services.is_active,
      display_order: purchase.services.display_order,
      created_at: purchase.services.created_at,
      updated_at: purchase.services.updated_at,
    } : undefined,
    member: profilesMap.has(purchase.member_id) ? 
      transformDatabaseProfileToMember(profilesMap.get(purchase.member_id) as DatabaseProfile) : undefined,
  }));
}

export async function fetchSessionBookings(): Promise<ServiceBooking[]> {
  const admin = getSupabaseAdmin();
  if (!admin) {
    console.error("Supabase admin client not available");
    return [];
  }

  // First, get session bookings with purchased services data
  const { data: bookingsData, error: bookingsError } = await admin
    .from("session_bookings")
    .select(`
      *,
      purchased_services (
        services (*)
      )
    `)
    .order("booking_date", { ascending: false });

  if (bookingsError) {
    console.error("Failed to fetch session bookings", bookingsError);
    return [];
  }

  if (!bookingsData || bookingsData.length === 0) {
    return [];
  }

  // Get unique member IDs
  const memberIds = [...new Set(bookingsData.map(b => b.member_id))];

  // Fetch profiles for these members
  const { data: profilesData, error: profilesError } = await admin
    .from("profiles")
    .select("*")
    .in("id", memberIds);

  if (profilesError) {
    console.error("Failed to fetch member profiles", profilesError);
  }

  // Create a map of member profiles
  const profilesMap = new Map();
  if (profilesData) {
    profilesData.forEach(profile => {
      profilesMap.set(profile.id, profile);
    });
  }

  return bookingsData.map((booking) => ({
    id: booking.id,
    member_id: booking.member_id,
    service_id: booking.purchased_services?.services?.id || "",
    booking_date: booking.booking_date,
    status: booking.status === "confirmed" ? "upcoming" : booking.status,
    sessions_remaining: null,
    notes: booking.notes,
    created_at: booking.created_at,
    updated_at: booking.updated_at,
    service: booking.purchased_services?.services ? {
      id: booking.purchased_services.services.id,
      name: booking.purchased_services.services.name,
      service_type: booking.purchased_services.services.service_type,
      session_type: booking.purchased_services.services.session_type,
      duration_minutes: booking.purchased_services.services.duration_minutes,
      price: parseFloat(booking.purchased_services.services.price),
      description: booking.purchased_services.services.description,
      requires_advance_booking: booking.purchased_services.services.requires_advance_booking,
      advance_booking_hours: booking.purchased_services.services.advance_booking_hours,
      max_sessions: booking.purchased_services.services.max_sessions,
      is_active: booking.purchased_services.services.is_active,
      display_order: booking.purchased_services.services.display_order,
      created_at: booking.purchased_services.services.created_at,
      updated_at: booking.purchased_services.services.updated_at,
    } : undefined,
    member: profilesMap.has(booking.member_id) ? 
      transformDatabaseProfileToMember(profilesMap.get(booking.member_id) as DatabaseProfile) : undefined,
  }));
}

export async function fetchTodaysSessionBookings(): Promise<ServiceBooking[]> {
  const admin = getSupabaseAdmin();
  if (!admin) {
    console.error("Supabase admin client not available");
    return [];
  }

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];

  const { data: bookingsData, error: bookingsError } = await admin
    .from("session_bookings")
    .select(`
      *,
      purchased_services (
        services (*)
      )
    `)
    .in("status", ["pending", "confirmed"])
    .gte("booking_date", `${today}T00:00:00Z`)
    .lt("booking_date", `${today}T23:59:59Z`)
    .order("booking_date", { ascending: true });

  if (bookingsError) {
    console.error("Failed to fetch today's session bookings", bookingsError);
    return [];
  }

  if (!bookingsData || bookingsData.length === 0) {
    return [];
  }

  // Get unique member IDs
  const memberIds = [...new Set(bookingsData.map(b => b.member_id))];

  // Fetch profiles for these members
  const { data: profilesData, error: profilesError } = await admin
    .from("profiles")
    .select("*")
    .in("id", memberIds);

  if (profilesError) {
    console.error("Failed to fetch member profiles", profilesError);
  }

  // Create a map of member profiles
  const profilesMap = new Map();
  if (profilesData) {
    profilesData.forEach(profile => {
      profilesMap.set(profile.id, profile);
    });
  }

  return bookingsData.map((booking) => ({
    id: booking.id,
    member_id: booking.member_id,
    service_id: booking.purchased_services?.services?.id || "",
    booking_date: booking.booking_date,
    status: booking.status === "confirmed" ? "upcoming" : booking.status,
    sessions_remaining: null,
    notes: booking.notes,
    created_at: booking.created_at,
    updated_at: booking.updated_at,
    service: booking.purchased_services?.services ? {
      id: booking.purchased_services.services.id,
      name: booking.purchased_services.services.name,
      service_type: booking.purchased_services.services.service_type,
      session_type: booking.purchased_services.services.session_type,
      duration_minutes: booking.purchased_services.services.duration_minutes,
      price: parseFloat(booking.purchased_services.services.price),
      description: booking.purchased_services.services.description,
      requires_advance_booking: booking.purchased_services.services.requires_advance_booking,
      advance_booking_hours: booking.purchased_services.services.advance_booking_hours,
      max_sessions: booking.purchased_services.services.max_sessions,
      is_active: booking.purchased_services.services.is_active,
      display_order: booking.purchased_services.services.display_order,
      created_at: booking.purchased_services.services.created_at,
      updated_at: booking.purchased_services.services.updated_at,
    } : undefined,
    member: profilesMap.has(booking.member_id) ? 
      transformDatabaseProfileToMember(profilesMap.get(booking.member_id) as DatabaseProfile) : undefined,
  }));
}
