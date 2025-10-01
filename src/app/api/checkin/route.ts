import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { z } from "zod";

// Schema for check-in request
const checkinRequestSchema = z.object({
  qr_code: z.string().min(1, "QR code is required"),
  api_key: z.string().min(1, "API key is required"),
  action: z.enum(["checkin", "checkout"]),
  device_id: z.string().optional(), // Optional device identifier
});

// Response types
type CheckinResponse = {
  success: boolean;
  message: string;
  data?: {
    checkin_id?: string;
    member_id?: string;
    member_name?: string;
    membership_status?: string;
    plan_name?: string;
    expires_at?: string;
    duration_minutes?: number;
  };
  error?: string;
};

/**
 * POST /api/checkin
 * 
 * Handles check-in and check-out requests from external devices (daemon/service)
 * 
 * Request body:
 * {
 *   "qr_code": "member_qr_code_string",
 *   "api_key": "your_secure_api_key",
 *   "action": "checkin" | "checkout",
 *   "device_id": "optional_device_identifier"
 * }
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  let memberId: string | undefined;
  let memberName: string | undefined;
  let apiAction: string | undefined;
  
  try {
    // Parse and validate request body
    const body = await request.json();
    const validation = checkinRequestSchema.safeParse(body);

    if (!validation.success) {
      const errorMsg = validation.error.errors.map(e => e.message).join(", ");
      await logApiRequest({
        request,
        endpoint: '/api/checkin',
        method: 'POST',
        statusCode: 400,
        success: false,
        errorMessage: errorMsg,
        durationMs: Date.now() - startTime,
      });
      return NextResponse.json<CheckinResponse>(
        {
          success: false,
          message: "Invalid request data",
          error: errorMsg,
        },
        { status: 400 }
      );
    }

    const { qr_code, api_key, action } = validation.data;
    apiAction = action;
    // device_id can be used for logging/auditing in the future

    // Verify API key (check against environment variable or database)
    const validApiKey = process.env.CHECKIN_API_KEY;
    if (!validApiKey || api_key !== validApiKey) {
      await logApiRequest({
        request,
        endpoint: '/api/checkin',
        method: 'POST',
        statusCode: 401,
        success: false,
        apiAction,
        errorMessage: "Authentication failed",
        durationMs: Date.now() - startTime,
      });
      return NextResponse.json<CheckinResponse>(
        {
          success: false,
          message: "Invalid API key",
          error: "Authentication failed",
        },
        { status: 401 }
      );
    }

    const admin = getSupabaseAdmin();
    if (!admin) {
      return NextResponse.json<CheckinResponse>(
        {
          success: false,
          message: "Service unavailable",
          error: "Database connection failed",
        },
        { status: 503 }
      );
    }

    // Find member by QR code
    // Assuming QR code contains the member ID or a unique identifier
    const { data: member, error: memberError } = await admin
      .from("profiles")
      .select("id, first_name, last_name, email, status, plan_id, starts_at, expires_at")
      .eq("id", qr_code) // Adjust this based on your QR code format
      .single();

    if (memberError || !member) {
      await logApiRequest({
        request,
        endpoint: '/api/checkin',
        method: 'POST',
        statusCode: 404,
        success: false,
        apiAction,
        memberId: qr_code,
        errorMessage: "Member not found",
        durationMs: Date.now() - startTime,
      });
      return NextResponse.json<CheckinResponse>(
        {
          success: false,
          message: "Member not found",
          error: "Invalid QR code or member does not exist",
        },
        { status: 404 }
      );
    }

    // Store member info for logging
    memberId = member.id;
    memberName = `${member.first_name || ''} ${member.last_name || ''}`.trim();

    // Validate membership status and expiration
    const now = new Date();
    const expiresAt = member.expires_at ? new Date(member.expires_at) : null;
    const startsAt = member.starts_at ? new Date(member.starts_at) : null;

    // Check if membership is active
    if (member.status !== "active") {
      await logApiRequest({
        request,
        endpoint: '/api/checkin',
        method: 'POST',
        statusCode: 403,
        success: false,
        apiAction,
        memberId,
        memberName,
        errorMessage: `Member status: ${member.status}`,
        durationMs: Date.now() - startTime,
      });
      return NextResponse.json<CheckinResponse>(
        {
          success: false,
          message: "Membership is not active",
          error: `Member status: ${member.status}`,
          data: {
            member_id: member.id,
            member_name: `${member.first_name || ""} ${member.last_name || ""}`.trim(),
            membership_status: member.status,
            expires_at: member.expires_at || undefined,
          },
        },
        { status: 403 }
      );
    }

    // Check if membership has started
    if (startsAt && startsAt > now) {
      return NextResponse.json<CheckinResponse>(
        {
          success: false,
          message: "Membership has not started yet",
          error: `Membership starts on ${startsAt.toLocaleDateString()}`,
          data: {
            member_id: member.id,
            member_name: `${member.first_name || ""} ${member.last_name || ""}`.trim(),
            membership_status: member.status,
          },
        },
        { status: 403 }
      );
    }

    // Check if membership has expired
    if (expiresAt && expiresAt < now) {
      return NextResponse.json<CheckinResponse>(
        {
          success: false,
          message: "Membership has expired",
          error: `Membership expired on ${expiresAt.toLocaleDateString()}`,
          data: {
            member_id: member.id,
            member_name: `${member.first_name || ""} ${member.last_name || ""}`.trim(),
            membership_status: "expired",
            expires_at: member.expires_at || undefined,
          },
        },
        { status: 403 }
      );
    }

    // Get plan information
    let planName = "Unknown Plan";
    if (member.plan_id) {
      const { data: plan } = await admin
        .from("membership_plans")
        .select("name")
        .eq("id", member.plan_id)
        .single();
      
      if (plan) {
        planName = plan.name;
      }
    }

    // Handle check-in
    if (action === "checkin") {
      // Check if member is already checked in
      const { data: existingCheckin } = await admin
        .from("checkins")
        .select("id, check_in_time")
        .eq("user_id", member.id)
        .is("check_out_time", null)
        .order("check_in_time", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (existingCheckin) {
        return NextResponse.json<CheckinResponse>(
          {
            success: false,
            message: "Member is already checked in",
            error: `Checked in at ${new Date(existingCheckin.check_in_time).toLocaleString()}`,
            data: {
              checkin_id: existingCheckin.id,
              member_id: member.id,
              member_name: memberName,
              membership_status: member.status,
              plan_name: planName,
              expires_at: member.expires_at || undefined,
            },
          },
          { status: 409 }
        );
      }

      // Create new check-in
      const { data: newCheckin, error: checkinError } = await admin
        .from("checkins")
        .insert({
          user_id: member.id,
          check_in_time: now.toISOString(),
          membership_plan_name: planName,
          method: 'qr', // Mark as QR scan check-in
        })
        .select("id")
        .single();

      if (checkinError || !newCheckin) {
        return NextResponse.json<CheckinResponse>(
          {
            success: false,
            message: "Failed to create check-in",
            error: checkinError?.message || "Unknown error",
          },
          { status: 500 }
        );
      }

      const responseData = {
        success: true,
        message: "Check-in successful",
        data: {
          checkin_id: newCheckin.id,
          member_id: member.id,
          member_name: memberName,
          membership_status: member.status,
          plan_name: planName,
          expires_at: member.expires_at || undefined,
        },
      };

      await logApiRequest({
        request,
        endpoint: '/api/checkin',
        method: 'POST',
        statusCode: 200,
        success: true,
        apiAction,
        memberId,
        memberName,
        durationMs: Date.now() - startTime,
        responseData,
      });

      return NextResponse.json<CheckinResponse>(
        responseData,
        { status: 200 }
      );
    }

    // Handle check-out
    if (action === "checkout") {
      // Find active check-in
      const { data: activeCheckin } = await admin
        .from("checkins")
        .select("id, check_in_time")
        .eq("user_id", member.id)
        .is("check_out_time", null)
        .order("check_in_time", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!activeCheckin) {
        return NextResponse.json<CheckinResponse>(
          {
            success: false,
            message: "No active check-in found",
            error: "Member is not currently checked in",
            data: {
              member_id: member.id,
              member_name: memberName,
              membership_status: member.status,
              plan_name: planName,
              expires_at: member.expires_at || undefined,
            },
          },
          { status: 404 }
        );
      }

      // Calculate duration
      const checkInTime = new Date(activeCheckin.check_in_time);
      const durationMinutes = Math.floor((now.getTime() - checkInTime.getTime()) / (1000 * 60));

      // Update check-in with check-out time
      const { error: checkoutError } = await admin
        .from("checkins")
        .update({
          check_out_time: now.toISOString(),
          duration_minutes: durationMinutes,
        })
        .eq("id", activeCheckin.id);

      if (checkoutError) {
        return NextResponse.json<CheckinResponse>(
          {
            success: false,
            message: "Failed to complete check-out",
            error: checkoutError.message,
          },
          { status: 500 }
        );
      }

      const checkoutResponseData = {
        success: true,
        message: "Check-out successful",
        data: {
          checkin_id: activeCheckin.id,
          member_id: member.id,
          member_name: memberName,
          membership_status: member.status,
          plan_name: planName,
          expires_at: member.expires_at || undefined,
          duration_minutes: durationMinutes,
        },
      };

      await logApiRequest({
        request,
        endpoint: '/api/checkin',
        method: 'POST',
        statusCode: 200,
        success: true,
        apiAction,
        memberId,
        memberName,
        durationMs: Date.now() - startTime,
        responseData: checkoutResponseData,
      });

      return NextResponse.json<CheckinResponse>(
        checkoutResponseData,
        { status: 200 }
      );
    }

    // Should never reach here due to Zod validation
    return NextResponse.json<CheckinResponse>(
      {
        success: false,
        message: "Invalid action",
        error: "Action must be 'checkin' or 'checkout'",
      },
      { status: 400 }
    );

  } catch (error) {
    console.error("Check-in API error:", error);
    return NextResponse.json<CheckinResponse>(
      {
        success: false,
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// GET method to verify API is working
export async function GET() {
  return NextResponse.json({
    service: "Gym Check-in API",
    version: "1.0.0",
    status: "operational",
    endpoints: {
      checkin: "POST /api/checkin",
    },
    documentation: {
      method: "POST",
      contentType: "application/json",
      requiredFields: ["qr_code", "api_key", "action"],
      actions: ["checkin", "checkout"],
    },
  });
}

/**
 * Log API request to database
 */
async function logApiRequest(params: {
  request: NextRequest;
  endpoint: string;
  method: string;
  statusCode: number;
  success: boolean;
  apiAction?: string | null;
  memberId?: string | null;
  memberName?: string | null;
  errorMessage?: string | null;
  durationMs: number;
  responseData?: unknown;
}) {
  try {
    const admin = getSupabaseAdmin();
    if (!admin) return;

    // Get request metadata
    const ipAddress = params.request.headers.get('x-forwarded-for') || 
                     params.request.headers.get('x-real-ip') || 
                     'unknown';
    const userAgent = params.request.headers.get('user-agent') || 'unknown';

    // Sanitize request data (remove sensitive info like API keys)
    const requestData = {
      action: params.apiAction,
      member_id: params.memberId,
      // Don't log API keys or sensitive data
    };

    await admin.from('api_logs').insert({
      endpoint: params.endpoint,
      method: params.method,
      status_code: params.statusCode,
      request_data: requestData,
      response_data: params.responseData || null,
      member_id: params.memberId || null,
      member_name: params.memberName || null,
      api_action: params.apiAction || null,
      success: params.success,
      error_message: params.errorMessage || null,
      ip_address: ipAddress,
      user_agent: userAgent,
      duration_ms: params.durationMs,
    });
  } catch (error) {
    // Don't throw - logging errors shouldn't break the API
    console.error('Failed to log API request:', error);
  }
}
