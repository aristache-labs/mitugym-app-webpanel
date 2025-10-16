import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { z } from "zod";

// Schema for query parameters
const scheduleQuerySchema = z.object({
  api_key: z.string().min(1, "API key is required"),
  day: z.enum([
    "monday",
    "tuesday", 
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday"
  ], { errorMap: () => ({ message: "Day must be one of: monday, tuesday, wednesday, thursday, friday, saturday, sunday" }) }),
});

// Map day names to database day_of_week values (0=Monday, 6=Sunday)
const DAY_NAME_TO_DB_VALUE: Record<string, number> = {
  monday: 0,
  tuesday: 1,
  wednesday: 2,
  thursday: 3,
  friday: 4,
  saturday: 5,
  sunday: 6,
};

// Response type
type ScheduleResponse = {
  success: boolean;
  schedule?: {
    id: string;
    day_of_week: string;
    open_time: string | null;
    close_time: string | null;
    is_closed: boolean;
  };
  message?: string;
  error?: string;
};

/**
 * GET /api/gym-schedule
 * 
 * Fetches the gym schedule for a specific day of the week
 * Used by Flutter app to display traffic chart only during operating hours
 * 
 * Query parameters:
 * - api_key: API authentication key (required)
 * - day: Day of the week in lowercase (monday, tuesday, etc.)
 * 
 * Example:
 * GET /api/gym-schedule?api_key=xxx&day=monday
 */
export async function GET(request: NextRequest) {
  try {
    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const queryParams = {
      api_key: searchParams.get('api_key'),
      day: searchParams.get('day'),
    };

    // Validate query parameters
    const validation = scheduleQuerySchema.safeParse(queryParams);
    
    if (!validation.success) {
      const errorMsg = validation.error.errors.map(e => e.message).join(", ");
      return NextResponse.json<ScheduleResponse>(
        {
          success: false,
          message: "Invalid query parameters",
          error: errorMsg,
        },
        { status: 400 }
      );
    }

    const { api_key, day } = validation.data;

    // Verify API key
    const expectedApiKey = process.env.CHECKIN_API_KEY;
    if (!expectedApiKey || api_key !== expectedApiKey) {
      return NextResponse.json<ScheduleResponse>(
        {
          success: false,
          message: "Invalid API key",
          error: "Authentication failed",
        },
        { status: 401 }
      );
    }

    // Get Supabase admin client
    const admin = getSupabaseAdmin();
    if (!admin) {
      return NextResponse.json<ScheduleResponse>(
        {
          success: false,
          message: "Service unavailable",
          error: "Database connection failed",
        },
        { status: 503 }
      );
    }

    // Get day_of_week value from day name
    const dayOfWeek = DAY_NAME_TO_DB_VALUE[day];

    // Fetch schedule for the specified day
    const { data: scheduleData, error: scheduleError } = await admin
      .from("gym_schedule")
      .select("id, day_of_week, open_time, close_time, is_active")
      .eq("day_of_week", dayOfWeek)
      .maybeSingle();

    if (scheduleError) {
      console.error('Error fetching gym schedule:', scheduleError);
      return NextResponse.json<ScheduleResponse>(
        {
          success: false,
          message: "Failed to fetch schedule",
          error: scheduleError.message,
        },
        { status: 500 }
      );
    }

    // If no schedule found for this day, return default closed schedule
    if (!scheduleData) {
      return NextResponse.json<ScheduleResponse>(
        {
          success: true,
          schedule: {
            id: `default-${day}`,
            day_of_week: day,
            open_time: null,
            close_time: null,
            is_closed: true,
          },
        },
        { status: 200 }
      );
    }

    // Format time to HH:MM (remove seconds if present)
    const formatTime = (time: string | null): string | null => {
      if (!time) return null;
      // Handle both "HH:MM:SS" and "HH:MM" formats
      return time.substring(0, 5);
    };

    // Return schedule data
    return NextResponse.json<ScheduleResponse>(
      {
        success: true,
        schedule: {
          id: scheduleData.id,
          day_of_week: day,
          open_time: formatTime(scheduleData.open_time),
          close_time: formatTime(scheduleData.close_time),
          is_closed: !scheduleData.is_active, // Convert is_active to is_closed
        },
      },
      { 
        status: 200,
        headers: {
          'Cache-Control': 'public, max-age=300, s-maxage=300', // Cache for 5 minutes
        },
      }
    );

  } catch (error) {
    console.error('Unexpected error in /api/gym-schedule:', error);
    return NextResponse.json<ScheduleResponse>(
      {
        success: false,
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// OPTIONS method for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

