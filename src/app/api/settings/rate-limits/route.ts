import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { updateRateLimitersFromDB } from "@/lib/rate-limit";
import { z } from "zod";

const rateLimitSettingsSchema = z.object({
  window_ms: z.number().min(1000).max(3600000), // 1 second to 1 hour
  ip_max: z.number().min(1).max(10000),
  api_key_max: z.number().min(1).max(10000),
  member_max: z.number().min(1).max(1000),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = rateLimitSettingsSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error.errors.map(e => e.message).join(", "),
        },
        { status: 400 }
      );
    }

    const { window_ms, ip_max, api_key_max, member_max } = validation.data;

    const admin = getSupabaseAdmin();
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Database unavailable" },
        { status: 503 }
      );
    }

    // Update settings in database
    const updates = [
      { key: 'rate_limit_window_ms', value: window_ms.toString() },
      { key: 'rate_limit_ip_max', value: ip_max.toString() },
      { key: 'rate_limit_api_key_max', value: api_key_max.toString() },
      { key: 'rate_limit_member_max', value: member_max.toString() },
    ];

    for (const update of updates) {
      const { error } = await admin
        .from('app_settings')
        .upsert(update, { onConflict: 'key' });

      if (error) {
        console.error('Failed to update setting:', update.key, error);
        return NextResponse.json(
          { success: false, error: `Failed to update ${update.key}` },
          { status: 500 }
        );
      }
    }

    // Reload rate limiters from database
    await updateRateLimitersFromDB();

    return NextResponse.json({
      success: true,
      message: "Rate limit settings updated successfully",
    });
  } catch (error) {
    console.error("Rate limit settings update error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

