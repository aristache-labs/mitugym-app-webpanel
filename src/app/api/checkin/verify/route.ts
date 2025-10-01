import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { z } from "zod";
import { apiKeyRateLimiter, ipRateLimiter, memberRateLimiter, createRateLimitIdentifier } from "@/lib/rate-limit";

// Schema for verification request
const verifyRequestSchema = z.object({
  qr_code: z.string().min(1, "QR code is required"),
  api_key: z.string().min(1, "API key is required"),
});

type VerifyResponse = {
  success: boolean;
  message: string;
  data?: {
    member_id: string;
    member_name: string;
    email: string;
    membership_status: string;
    plan_name: string | null;
    starts_at: string | null;
    expires_at: string | null;
    days_remaining: number | null;
    is_checked_in: boolean;
    can_checkin: boolean;
    validation_errors: string[];
  };
  error?: string;
};

/**
 * POST /api/checkin/verify
 * 
 * Verifies member membership and eligibility for check-in without actually checking in
 * Useful for pre-validation before allowing access
 * 
 * Request body:
 * {
 *   "qr_code": "member_qr_code_string",
 *   "api_key": "your_secure_api_key"
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Check IP-based rate limit
    const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    
    const ipLimit = ipRateLimiter.check(createRateLimitIdentifier('ip', ipAddress));
    if (!ipLimit.allowed) {
      const resetIn = Math.ceil((ipLimit.resetTime - Date.now()) / 1000);
      return NextResponse.json<VerifyResponse>(
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
    const validation = verifyRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json<VerifyResponse>(
        {
          success: false,
          message: "Invalid request data",
          error: validation.error.errors.map(e => e.message).join(", "),
        },
        { status: 400 }
      );
    }

    const { qr_code, api_key } = validation.data;

    // Check API key-based rate limit
    const apiKeyLimit = apiKeyRateLimiter.check(createRateLimitIdentifier('api_key', api_key));
    if (!apiKeyLimit.allowed) {
      const resetIn = Math.ceil((apiKeyLimit.resetTime - Date.now()) / 1000);
      return NextResponse.json<VerifyResponse>(
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

    // Verify API key
    const validApiKey = process.env.CHECKIN_API_KEY;
    if (!validApiKey || api_key !== validApiKey) {
      return NextResponse.json<VerifyResponse>(
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
      return NextResponse.json<VerifyResponse>(
        {
          success: false,
          message: "Service unavailable",
          error: "Database connection failed",
        },
        { status: 503 }
      );
    }

    // Find member by QR code
    const { data: member, error: memberError } = await admin
      .from("profiles")
      .select("id, first_name, last_name, email, status, plan_id, starts_at, expires_at")
      .eq("id", qr_code)
      .single();

    if (memberError || !member) {
      return NextResponse.json<VerifyResponse>(
        {
          success: false,
          message: "Member not found",
          error: "Invalid QR code or member does not exist",
        },
        { status: 404 }
      );
    }

    // Get plan information
    let planName: string | null = null;
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

    const memberName = `${member.first_name || ""} ${member.last_name || ""}`.trim();
    const now = new Date();
    const expiresAt = member.expires_at ? new Date(member.expires_at) : null;
    const startsAt = member.starts_at ? new Date(member.starts_at) : null;

    // Calculate days remaining
    let daysRemaining: number | null = null;
    if (expiresAt) {
      const diffTime = expiresAt.getTime() - now.getTime();
      daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    // Check if member is currently checked in
    const { data: activeCheckin } = await admin
      .from("checkins")
      .select("id")
      .eq("user_id", member.id)
      .is("check_out_time", null)
      .limit(1)
      .maybeSingle();

    const isCheckedIn = !!activeCheckin;

    // Validate membership eligibility
    const validationErrors: string[] = [];
    let canCheckin = true;

    if (member.status !== "active") {
      validationErrors.push(`Membership status is ${member.status}`);
      canCheckin = false;
    }

    if (startsAt && startsAt > now) {
      validationErrors.push(`Membership starts on ${startsAt.toLocaleDateString()}`);
      canCheckin = false;
    }

    if (expiresAt && expiresAt < now) {
      validationErrors.push(`Membership expired on ${expiresAt.toLocaleDateString()}`);
      canCheckin = false;
    }

    if (isCheckedIn) {
      validationErrors.push("Member is already checked in");
      canCheckin = false;
    }

    return NextResponse.json<VerifyResponse>(
      {
        success: true,
        message: canCheckin ? "Member is eligible for check-in" : "Member cannot check in",
        data: {
          member_id: member.id,
          member_name: memberName,
          email: member.email || "",
          membership_status: member.status,
          plan_name: planName,
          starts_at: member.starts_at,
          expires_at: member.expires_at,
          days_remaining: daysRemaining,
          is_checked_in: isCheckedIn,
          can_checkin: canCheckin,
          validation_errors: validationErrors,
        },
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Verify API error:", error);
    return NextResponse.json<VerifyResponse>(
      {
        success: false,
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// GET method for documentation
export async function GET() {
  return NextResponse.json({
    service: "Gym Check-in Verification API",
    version: "1.0.0",
    status: "operational",
    endpoints: {
      verify: "POST /api/checkin/verify",
    },
    documentation: {
      method: "POST",
      contentType: "application/json",
      requiredFields: ["qr_code", "api_key"],
      description: "Verifies member eligibility without performing check-in",
    },
  });
}

