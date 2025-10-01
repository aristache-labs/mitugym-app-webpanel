import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { generateTOTPSecret, getTOTPSetupURI } from "@/lib/totp";

type TOTPSetupResponse = {
  success: boolean;
  message: string;
  data?: {
    member_id: string;
    member_name: string;
    totp_secret: string;
    setup_uri: string;
    qr_format: string;
  };
  error?: string;
};

/**
 * GET /api/member/totp-setup/:memberId
 * 
 * Generate and store TOTP secret for a member
 * Called once during mobile app initial setup
 * 
 * Security: This endpoint requires API key authentication
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ memberId: string }> }
) {
  try {
    const { memberId } = await params;
    
    // Verify API key for security
    const apiKey = request.headers.get('x-api-key') || 
                   request.nextUrl.searchParams.get('api_key');
    
    const validApiKey = process.env.CHECKIN_API_KEY;
    if (!validApiKey || apiKey !== validApiKey) {
      return NextResponse.json<TOTPSetupResponse>(
        {
          success: false,
          message: "Invalid API key",
          error: "Authentication failed",
        },
        { status: 401 }
      );
    }

    if (!memberId) {
      return NextResponse.json<TOTPSetupResponse>(
        {
          success: false,
          message: "Member ID required",
          error: "Missing member ID parameter",
        },
        { status: 400 }
      );
    }

    const admin = getSupabaseAdmin();
    if (!admin) {
      return NextResponse.json<TOTPSetupResponse>(
        {
          success: false,
          message: "Service unavailable",
          error: "Database connection failed",
        },
        { status: 503 }
      );
    }

    // Get member details
    const { data: member, error: memberError } = await admin
      .from("profiles")
      .select("id, first_name, last_name, email, totp_secret")
      .eq("id", memberId)
      .single();

    if (memberError || !member) {
      return NextResponse.json<TOTPSetupResponse>(
        {
          success: false,
          message: "Member not found",
          error: "Invalid member ID",
        },
        { status: 404 }
      );
    }

    // Generate new TOTP secret
    const totpSecret = generateTOTPSecret();
    
    // Update member with new secret
    const { error: updateError } = await admin
      .from("profiles")
      .update({ totp_secret: totpSecret })
      .eq("id", memberId);

    if (updateError) {
      console.error("Failed to update TOTP secret:", updateError);
      return NextResponse.json<TOTPSetupResponse>(
        {
          success: false,
          message: "Failed to setup TOTP",
          error: "Database update failed",
        },
        { status: 500 }
      );
    }

    const memberName = `${member.first_name || ""} ${member.last_name || ""}`.trim();
    const setupURI = getTOTPSetupURI(memberId, totpSecret);

    return NextResponse.json<TOTPSetupResponse>(
      {
        success: true,
        message: "TOTP setup successful",
        data: {
          member_id: memberId,
          member_name: memberName,
          totp_secret: totpSecret,
          setup_uri: setupURI,
          qr_format: `${memberId}:{6-digit-totp-code}`,
        },
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("TOTP setup error:", error);
    return NextResponse.json<TOTPSetupResponse>(
      {
        success: false,
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

