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
 * Retrieves check-in/check-out history from api_logs table
 * Used by Flutter desktop app to sync server data
 * 
 * Query parameters:
 * - api_key: API authentication key (required)
 * - limit: Number of records to return (default: 100, max: 1000)
 * - created_at: Filter by timestamp (format: gte.2025-10-08T23:06:59.135565)
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

    // Build query
    let query = admin
      .from("api_logs")
      .select("id, endpoint, method, status_code, member_id, member_name, api_action, success, error_message, response_data, ip_address, duration_ms, created_at")
      .eq("endpoint", "/api/checkin") // Only return check-in/check-out logs
      .order("created_at", { ascending: false })
      .limit(limit);

    // Apply timestamp filter if provided
    if (created_at) {
      // Parse format: gte.2025-10-08T23:06:59.135565
      const match = created_at.match(/^(gte|gt|lte|lt|eq)\.(.+)$/);
      if (match) {
        const [, operator, timestamp] = match;
        
        switch (operator) {
          case 'gte':
            query = query.gte('created_at', timestamp);
            break;
          case 'gt':
            query = query.gt('created_at', timestamp);
            break;
          case 'lte':
            query = query.lte('created_at', timestamp);
            break;
          case 'lt':
            query = query.lt('created_at', timestamp);
            break;
          case 'eq':
            query = query.eq('created_at', timestamp);
            break;
        }
      } else {
        // If no operator, default to gte (greater than or equal)
        query = query.gte('created_at', created_at);
      }
    }

    // Execute query
    const { data: logs, error: logsError } = await query;

    if (logsError) {
      console.error('Error fetching history:', logsError);
      return NextResponse.json<HistoryResponse>(
        {
          success: false,
          message: "Failed to fetch history",
          error: logsError.message,
        },
        { status: 500 }
      );
    }

    // Return results
    return NextResponse.json<HistoryResponse>(
      {
        success: true,
        data: logs || [],
        count: logs?.length || 0,
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

