import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { z } from "zod";
import { apiKeyRateLimiter, ipRateLimiter, memberRateLimiter, createRateLimitIdentifier } from "@/lib/rate-limit";
import { parseQRCode, validateTOTPCode, isTOTPFormat } from "@/lib/totp";

// Schema for check-in request  
// Note: action is now optional - smart detection based on check-in status
const checkinRequestSchema = z.object({
  qr_code: z.string().min(1, "QR code is required"),
  api_key: z.string().min(1, "API key is required"),
  action: z.enum(["checkin", "checkout", "auto"]).optional(), // Optional - auto-detect if not provided
  device_id: z.string().optional(), // Optional device identifier
  is_offline_scan: z.boolean().optional(), // Flag for offline scans (skip TOTP validation)
});

// Member profile type from database
type MemberProfile = {
  id: string;
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  phone?: string | null;
  avatar_url?: string | null;
  status?: string | null;
  expires_at?: string | null;
  starts_at?: string | null;
  date_of_birth?: string | null;
  address?: string | null;
  city?: string | null;
  county?: string | null;
  gender?: string | null;
};

// Response types
type CheckinResponse = {
  success: boolean;
  message: string;
  data?: {
    checkin_id?: string;
    member_id?: string;
    member_name?: string;
    avatar_url?: string | null;
    membership_status?: string | null;
    plan_name?: string;
    expires_at?: string;
    starts_at?: string;
    duration_minutes?: number;
    // Additional member details
    email?: string;
    phone?: string | null;
    date_of_birth?: string | null;
    address?: string | null;
    city?: string | null;
    county?: string | null;
    gender?: string | null;
  };
  error?: string;
};

/**
 * Helper function to build consistent member data response
 */
function buildMemberData(member: MemberProfile, planName: string, additionalData?: {
  checkin_id?: string;
  duration_minutes?: number;
}) {
  return {
    checkin_id: additionalData?.checkin_id,
    member_id: member.id,
    member_name: `${member.first_name || ""} ${member.last_name || ""}`.trim(),
    avatar_url: member.avatar_url || null,
    membership_status: member.status,
    plan_name: planName,
    expires_at: member.expires_at || undefined,
    starts_at: member.starts_at || undefined,
    duration_minutes: additionalData?.duration_minutes,
    // Additional member details
    email: member.email || undefined,
    phone: member.phone || null,
    date_of_birth: member.date_of_birth || null,
    address: member.address || null,
    city: member.city || null,
    county: member.county || null,
    gender: member.gender || null,
  };
}

/**
 * POST /api/checkin
 * 
 * Handles check-in and check-out requests from external devices (daemon/service)
 * 
 * Request body:
 * {
 *   "qr_code": "member_id:totp_code" or "member_id" (legacy),
 *   "api_key": "your_secure_api_key",
 *   "action": "checkin" | "checkout" | "auto" (optional - auto-detects if not provided),
 *   "device_id": "optional_device_identifier"
 * }
 * 
 * QR Code Format:
 * - New: "member_id:123456" (TOTP rotating code)
 * - Legacy: "member_id" (backward compatible)
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  let memberId: string | undefined;
  let memberName: string | undefined;
  let apiAction: string | undefined;
  
  try {
    // Get IP address for rate limiting
    const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    
    // Check IP-based rate limit first (general protection)
    const ipLimit = ipRateLimiter.check(createRateLimitIdentifier('ip', ipAddress));
    if (!ipLimit.allowed) {
      const resetIn = Math.ceil((ipLimit.resetTime - Date.now()) / 1000);
      await logApiRequest({
        request,
        endpoint: '/api/checkin',
        method: 'POST',
        statusCode: 429,
        success: false,
        errorMessage: `Rate limit exceeded for IP: ${ipAddress}`,
        durationMs: Date.now() - startTime,
      });
      return NextResponse.json<CheckinResponse>(
        {
          success: false,
          message: "Too many requests",
          error: `Rate limit exceeded. Try again in ${resetIn} seconds.`,
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': '100',
            'X-RateLimit-Remaining': ipLimit.remaining.toString(),
            'X-RateLimit-Reset': ipLimit.resetTime.toString(),
            'Retry-After': resetIn.toString(),
          },
        }
      );
    }

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

    const { qr_code, api_key, is_offline_scan } = validation.data;
    let { action } = validation.data;
    
    // Parse QR code - check if it's TOTP format or legacy
    let actualMemberId: string;
    let isTOTP = false;
    
    // For offline scans, qr_code contains just the member_id (no TOTP)
    if (is_offline_scan) {
      actualMemberId = qr_code; // Already just the member_id
      isTOTP = false; // Skip TOTP validation for offline scans
    } else if (isTOTPFormat(qr_code)) {
      // New TOTP format: member_id:totp_code
      const parsed = parseQRCode(qr_code);
      if (!parsed) {
        await logApiRequest({
          request,
          endpoint: '/api/checkin',
          method: 'POST',
          statusCode: 400,
          success: false,
          errorMessage: "Invalid QR code format",
          durationMs: Date.now() - startTime,
        });
        return NextResponse.json<CheckinResponse>(
          {
            success: false,
            message: "Invalid QR code format",
            error: "QR code must be in format: member_id:totp_code",
          },
          { status: 400 }
        );
      }
      actualMemberId = parsed.memberId;
      isTOTP = true;
    } else {
      // Legacy format: just member ID (backward compatible)
      actualMemberId = qr_code;
      isTOTP = false;
    }
    
    apiAction = action || "auto";
    
    // Check API key-based rate limit
    const apiKeyLimit = apiKeyRateLimiter.check(createRateLimitIdentifier('api_key', api_key));
    if (!apiKeyLimit.allowed) {
      const resetIn = Math.ceil((apiKeyLimit.resetTime - Date.now()) / 1000);
      await logApiRequest({
        request,
        endpoint: '/api/checkin',
        method: 'POST',
        statusCode: 429,
        success: false,
        apiAction,
        errorMessage: 'Rate limit exceeded for API key',
        durationMs: Date.now() - startTime,
      });
      return NextResponse.json<CheckinResponse>(
        {
          success: false,
          message: "Too many requests",
          error: `API key rate limit exceeded. Try again in ${resetIn} seconds.`,
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': '60',
            'X-RateLimit-Remaining': apiKeyLimit.remaining.toString(),
            'X-RateLimit-Reset': apiKeyLimit.resetTime.toString(),
            'Retry-After': resetIn.toString(),
          },
        }
      );
    }
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

    // Find member by member ID and get all relevant details
    const { data: member, error: memberError } = await admin
      .from("profiles")
      .select("id, first_name, last_name, email, phone, date_of_birth, gender, address, city, county, status, plan_id, starts_at, expires_at, totp_secret, avatar_url")
      .eq("id", actualMemberId)
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

    // Validate TOTP if using new format
    if (isTOTP) {
      const parsed = parseQRCode(qr_code);
      if (!parsed) {
        // This shouldn't happen as we already validated, but check anyway
        return NextResponse.json<CheckinResponse>(
          {
            success: false,
            message: "Invalid QR code",
            error: "QR code validation failed",
          },
          { status: 400 }
        );
      }

      // Check if member has TOTP secret
      const memberWithSecret = member as typeof member & { totp_secret?: string };
      if (!memberWithSecret.totp_secret) {
        await logApiRequest({
          request,
          endpoint: '/api/checkin',
          method: 'POST',
          statusCode: 403,
          success: false,
          apiAction,
          memberId,
          memberName,
          errorMessage: "TOTP not configured for this member",
          durationMs: Date.now() - startTime,
        });
        return NextResponse.json<CheckinResponse>(
          {
            success: false,
            message: "TOTP not configured",
            error: "Please set up your mobile app first at /api/member/totp-setup/:memberId",
          data: {
            member_id: memberId,
            member_name: memberName,
            avatar_url: (member as typeof member & { avatar_url?: string | null }).avatar_url || null,
          },
        },
        { status: 403 }
        );
      }

      // Validate TOTP code
      const isValidTOTP = validateTOTPCode(parsed.totpCode, memberWithSecret.totp_secret, memberId);
      
      if (!isValidTOTP) {
        await logApiRequest({
          request,
          endpoint: '/api/checkin',
          method: 'POST',
          statusCode: 401,
          success: false,
          apiAction,
          memberId,
          memberName,
          errorMessage: "Invalid or expired TOTP code",
          durationMs: Date.now() - startTime,
        });
        return NextResponse.json<CheckinResponse>(
          {
            success: false,
            message: "Invalid QR code",
            error: "QR code is invalid or expired. Please refresh your QR code.",
          data: {
            member_id: memberId,
            member_name: memberName,
            avatar_url: (member as typeof member & { avatar_url?: string | null }).avatar_url || null,
          },
        },
        { status: 401 }
        );
      }
    }

    // Check member-based rate limit (prevent spam for specific members)
    const memberLimit = memberRateLimiter.check(createRateLimitIdentifier('member', member.id));
    if (!memberLimit.allowed) {
      const resetIn = Math.ceil((memberLimit.resetTime - Date.now()) / 1000);
      await logApiRequest({
        request,
        endpoint: '/api/checkin',
        method: 'POST',
        statusCode: 429,
        success: false,
        apiAction,
        memberId,
        memberName,
        errorMessage: `Rate limit exceeded for member: ${memberName}`,
        durationMs: Date.now() - startTime,
      });
      return NextResponse.json<CheckinResponse>(
        {
          success: false,
          message: "Too many requests",
          error: `Too many check-in attempts for this member. Try again in ${resetIn} seconds.`,
          data: {
            member_id: memberId,
            member_name: memberName,
            avatar_url: (member as typeof member & { avatar_url?: string | null }).avatar_url || null,
          },
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': '20',
            'X-RateLimit-Remaining': memberLimit.remaining.toString(),
            'X-RateLimit-Reset': memberLimit.resetTime.toString(),
            'Retry-After': resetIn.toString(),
          },
        }
      );
    }

    // Validate membership status and expiration
    const now = new Date();
    const expiresAt = member.expires_at ? new Date(member.expires_at) : null;
    const startsAt = member.starts_at ? new Date(member.starts_at) : null;

    // Get plan information first (needed for response data)
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

    // Note: Staff override disabled (role column doesn't exist in profiles table)
    // To enable: Add 'role' column to profiles table and uncomment below
    const isStaffOrAdmin = false; // Disabled for now
    
    if (isStaffOrAdmin) {
      // Staff always get free entry - skip all validation and record as special check-in
      
      // Check for existing active session for staff (auto-detect)
      const { data: existingCheckin } = await admin
        .from("checkins")
        .select("id, check_in_time, check_out_time")
        .eq("user_id", member.id)
        .is("check_out_time", null)
        .order("check_in_time", { ascending: false })
        .limit(1)
        .single();

      // Auto-detect action based on existing session
      const finalAction = apiAction === "auto" 
        ? (existingCheckin ? "checkout" : "checkin")
        : apiAction;

      if (finalAction === "checkout" && existingCheckin) {
        // Staff checkout
        const checkOutTime = now.toISOString();
        await admin
          .from("checkins")
          .update({ 
            check_out_time: checkOutTime,
            updated_at: checkOutTime
          })
          .eq("id", existingCheckin.id);

        const duration = Math.round(
          (now.getTime() - new Date(existingCheckin.check_in_time).getTime()) / 60000
        );

        await logApiRequest({
          request,
          endpoint: '/api/checkin',
          method: 'POST',
          statusCode: 200,
          success: true,
          apiAction: finalAction,
          memberId,
          memberName: `${member.first_name || ""} ${member.last_name || ""}`.trim() + " (STAFF)",
          responseData: {
            checkin_id: existingCheckin.id,
            member_id: member.id,
            duration_minutes: duration,
          },
          durationMs: Date.now() - startTime,
        });

        return NextResponse.json<CheckinResponse>({
          success: true,
          message: "Staff check-out successful",
          data: buildMemberData(member, "Staff Access", {
            checkin_id: existingCheckin.id,
            duration_minutes: duration,
          }),
        });
      } else {
        // Staff check-in
        const checkInTime = now.toISOString();
        const { data: newCheckin } = await admin
          .from("checkins")
          .insert({
            user_id: member.id,
            check_in_time: checkInTime,
            membership_plan_name: "Staff Access",
            method: 'qr',
            status: 'success',
            created_at: checkInTime,
            updated_at: checkInTime,
          })
          .select("id")
          .single();

        await logApiRequest({
          request,
          endpoint: '/api/checkin',
          method: 'POST',
          statusCode: 200,
          success: true,
          apiAction: finalAction,
          memberId,
          memberName: `${member.first_name || ""} ${member.last_name || ""}`.trim() + " (STAFF)",
          responseData: {
            checkin_id: newCheckin?.id,
            member_id: member.id,
          },
          durationMs: Date.now() - startTime,
        });

        return NextResponse.json<CheckinResponse>({
          success: true,
          message: "Staff check-in successful",
          data: buildMemberData(member, "Staff Access", {
            checkin_id: newCheckin?.id,
          }),
        });
      }
    }

    // Check if membership is active
    if (member.status !== "active") {
      // Record the denied attempt in checkins table
      await admin
        .from("checkins")
        .insert({
          user_id: member.id,
          check_in_time: now.toISOString(),
          membership_plan_name: planName,
          method: 'qr',
          status: 'denied',
          denial_reason: `Member status: ${member.status}`,
        });

      // Log with response data for better tracking
      await logApiRequest({
        request,
        endpoint: '/api/checkin',
        method: 'POST',
        statusCode: 200, // Changed to 200 so we can see response_data
        success: false,
        apiAction,
        memberId,
        memberName,
        errorMessage: `Member status: ${member.status}`,
        responseData: {
          member_id: member.id,
          member_name: `${member.first_name || ""} ${member.last_name || ""}`.trim(),
          avatar_url: (member as typeof member & { avatar_url?: string | null }).avatar_url || null,
          membership_status: member.status,
          plan_name: planName,
          expires_at: member.expires_at || undefined,
        },
        durationMs: Date.now() - startTime,
      });
      return NextResponse.json<CheckinResponse>(
        {
          success: false,
          message: `Membership is ${member.status}`,
          data: {
            member_id: member.id,
            member_name: `${member.first_name || ""} ${member.last_name || ""}`.trim(),
            avatar_url: (member as typeof member & { avatar_url?: string | null }).avatar_url || null,
            membership_status: member.status,
            plan_name: planName,
            expires_at: member.expires_at || undefined,
          },
        },
        { status: 200 } // Changed to 200 to always return data
      );
    }

    // Check if membership has started
    if (startsAt && startsAt > now) {
      // Record the denied attempt in checkins table
      await admin
        .from("checkins")
        .insert({
          user_id: member.id,
          check_in_time: now.toISOString(),
          membership_plan_name: planName,
          method: 'qr',
          status: 'denied',
          denial_reason: `Membership starts on ${startsAt.toLocaleDateString()}`,
        });

      await logApiRequest({
        request,
        endpoint: '/api/checkin',
        method: 'POST',
        statusCode: 200,
        success: false,
        apiAction,
        memberId,
        memberName,
        errorMessage: `Membership starts on ${startsAt.toLocaleDateString()}`,
        responseData: {
          member_id: member.id,
          member_name: `${member.first_name || ""} ${member.last_name || ""}`.trim(),
          avatar_url: (member as typeof member & { avatar_url?: string | null }).avatar_url || null,
          membership_status: "pending",
          plan_name: planName,
          starts_at: member.starts_at || undefined,
        },
        durationMs: Date.now() - startTime,
      });
      return NextResponse.json<CheckinResponse>(
        {
          success: false,
          message: "Membership has not started yet",
          data: buildMemberData(member, planName),
        },
        { status: 200 }
      );
    }

    // Check if membership has expired
    if (expiresAt && expiresAt < now) {
      // Record the denied attempt in checkins table
      await admin
        .from("checkins")
        .insert({
          user_id: member.id,
          check_in_time: now.toISOString(),
          membership_plan_name: planName,
          method: 'qr',
          status: 'denied',
          denial_reason: `Membership expired on ${expiresAt.toLocaleDateString()}`,
        });

      await logApiRequest({
        request,
        endpoint: '/api/checkin',
        method: 'POST',
        statusCode: 200,
        success: false,
        apiAction,
        memberId,
        memberName,
        errorMessage: `Membership expired on ${expiresAt.toLocaleDateString()}`,
        responseData: {
          member_id: member.id,
          member_name: `${member.first_name || ""} ${member.last_name || ""}`.trim(),
          avatar_url: (member as typeof member & { avatar_url?: string | null }).avatar_url || null,
          membership_status: "expired",
          plan_name: planName,
          expires_at: member.expires_at || undefined,
        },
        durationMs: Date.now() - startTime,
      });
      return NextResponse.json<CheckinResponse>(
        {
          success: false,
          message: "Membership has expired",
          data: buildMemberData(member, planName),
        },
        { status: 200 }
      );
    }

    // Check current check-in status for smart action detection
    const { data: existingCheckin } = await admin
      .from("checkins")
      .select("id, check_in_time")
      .eq("user_id", member.id)
      .is("check_out_time", null)
      .order("check_in_time", { ascending: false })
      .limit(1)
      .maybeSingle();

    // Smart action detection: if action is 'auto' or not provided
    if (action === "auto" || !action) {
      action = existingCheckin ? "checkout" : "checkin";
      apiAction = action;
    }

    // Handle check-in
    if (action === "checkin") {
      // Check if member is already checked in (from smart detection above)
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
              avatar_url: (member as typeof member & { avatar_url?: string | null }).avatar_url || null,
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
        data: buildMemberData(member, planName, {
          checkin_id: newCheckin.id,
        }),
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
            data: buildMemberData(member, planName),
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
        data: buildMemberData(member, planName, {
          checkin_id: activeCheckin.id,
          duration_minutes: durationMinutes,
        }),
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
