import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { z } from "zod";

// Schema for query parameters
const historyQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(1000).optional().default(100),
  created_at: z.string().optional(), // Format: gte.2025-10-08T23:06:59.135565
  api_key: z.string().min(1, "API key is required"),
});

// Response type
type HistoryResponse = {
  success: boolean;
  data?: Array<{
    id: string;
    endpoint: string;
    method: string;
    status_code: number;
    member_id?: string | null;
    member_name?: string | null;
    api_action?: string | null;
    success: boolean;
    error_message?: string | null;
    response_data?: Record<string, unknown> | null;
    ip_address?: string | null;
    duration_ms?: number | null;
    created_at: string;
  }>;
  count?: number;
  message?: string;
  error?: string;
};

/**
 * GET /api/history
 * 
 * Retrieves gym session history from checkins table
 * Returns one record per session (includes both check-in and check-out data)
 * Used by Flutter desktop app to sync server data
 * 
 * Query parameters:
 * - api_key: API authentication key (required)
 * - limit: Number of sessions to return (default: 100, max: 1000)
 * - created_at: Filter by check-in timestamp (format: gte.2025-10-08T23:06:59.135565)
 * 
 * Example:
 * GET /api/history?api_key=xxx&limit=50&created_at=gte.2025-10-08T23:06:59.135565
 */
export async function GET(request: NextRequest) {
  try {
    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const queryParams = {
      limit: searchParams.get('limit'),
      created_at: searchParams.get('created_at'),
      api_key: searchParams.get('api_key'),
    };

    // Validate query parameters
    const validation = historyQuerySchema.safeParse(queryParams);
    
    if (!validation.success) {
      const errorMsg = validation.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(", ");
      return NextResponse.json<HistoryResponse>(
        {
          success: false,
          message: "Invalid query parameters",
          error: errorMsg,
        },
        { status: 400 }
      );
    }

    const { limit, created_at, api_key } = validation.data;

    // Verify API key
    const expectedApiKey = process.env.CHECKIN_API_KEY;
    if (!expectedApiKey || api_key !== expectedApiKey) {
      return NextResponse.json<HistoryResponse>(
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
      return NextResponse.json<HistoryResponse>(
        {
          success: false,
          message: "Service unavailable",
          error: "Database connection failed",
        },
        { status: 503 }
      );
    }

    // Build query - fetch from checkins table WITHOUT join (no FK constraint exists)
    let query = admin
      .from("checkins")
      .select("id, user_id, check_in_time, check_out_time, membership_plan_name, method, duration_minutes")
      .order("check_in_time", { ascending: false })
      .limit(limit); // Limit will be applied after transformation

    // Apply timestamp filter if provided
    if (created_at) {
      // Parse format: gte.2025-10-08T23:06:59.135565
      const match = created_at.match(/^(gte|gt|lte|lt|eq)\.(.+)$/);
      if (match) {
        const [, operator, timestamp] = match;
        
        switch (operator) {
          case 'gte':
            query = query.gte('check_in_time', timestamp);
            break;
          case 'gt':
            query = query.gt('check_in_time', timestamp);
            break;
          case 'lte':
            query = query.lte('check_in_time', timestamp);
            break;
          case 'lt':
            query = query.lt('check_in_time', timestamp);
            break;
          case 'eq':
            query = query.eq('check_in_time', timestamp);
            break;
        }
      } else {
        // If no operator, default to gte (greater than or equal)
        query = query.gte('check_in_time', created_at);
      }
    }

    // Execute query
    const { data: checkins, error: logsError } = await query;

    if (logsError) {
      console.error('Error fetching checkins:', logsError);
      return NextResponse.json<HistoryResponse>(
        {
          success: false,
          message: "Failed to fetch checkins",
          error: logsError.message,
        },
        { status: 500 }
      );
    }

    // Fetch profiles separately
    const userIds = [...new Set(checkins?.map(c => c.user_id) || [])];
    const { data: profiles, error: profilesError } = await admin
      .from("profiles")
      .select("id, first_name, last_name, avatar_url, status")
      .in("id", userIds);

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      // Continue without profiles - we'll use fallback names
    }

    // Create a map of profiles for quick lookup
    const profileMap = new Map(
      profiles?.map(p => [p.id, p]) || []
    );

    // Transform checkins data to match expected format
    // Create one entry per session (not separate check-in/check-out)
    const historyEntries: Array<{
      id: string;
      endpoint: string;
      method: string;
      status_code: number;
      member_id?: string | null;
      member_name?: string | null;
      api_action?: string | null;
      success: boolean;
      error_message?: string | null;
      response_data?: Record<string, unknown> | null;
      ip_address?: string | null;
      duration_ms?: number | null;
      created_at: string;
    }> = [];

    if (checkins) {
      for (const checkin of checkins) {
        // Lookup profile from map
        const profile = profileMap.get(checkin.user_id);
        
        const memberName = profile 
          ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() 
          : 'Unknown';

        // Add single session entry (includes both check-in and check-out data)
        historyEntries.push({
          id: checkin.id,
          endpoint: '/api/checkin',
          method: 'POST',
          status_code: 200,
          member_id: checkin.user_id,
          member_name: memberName,
          api_action: 'session', // Single session entry
          success: true,
          error_message: null,
          response_data: {
            checkin_id: checkin.id,
            member_id: checkin.user_id,
            member_name: memberName,
            avatar_url: profile?.avatar_url || null,
            membership_status: profile?.status || 'unknown',
            plan_name: checkin.membership_plan_name || 'Unknown Plan',
            method: checkin.method || 'qr',
            check_in_time: checkin.check_in_time,
            check_out_time: checkin.check_out_time,
            duration_minutes: checkin.duration_minutes || null,
          },
          ip_address: null,
          duration_ms: null,
          created_at: checkin.check_in_time, // Use check-in time for sorting
        });
      }
    }

    // Sort by check_in_time descending (most recent first)
    historyEntries.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    const limitedEntries = historyEntries.slice(0, limit);

    // Return results
    return NextResponse.json<HistoryResponse>(
      {
        success: true,
        data: limitedEntries,
        count: limitedEntries.length,
      },
      { 
        status: 200,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      }
    );

  } catch (error) {
    console.error('Unexpected error in /api/history:', error);
    return NextResponse.json<HistoryResponse>(
      {
        success: false,
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

