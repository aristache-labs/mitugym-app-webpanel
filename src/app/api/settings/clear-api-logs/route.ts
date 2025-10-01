import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function DELETE() {
  try {
    const supabase = getSupabaseAdmin();

    if (!supabase) {
      return NextResponse.json(
        { success: false, error: "Supabase admin client not configured" },
        { status: 500 }
      );
    }

    // Delete all API logs
    const { error } = await supabase
      .from("api_logs")
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all records (using a condition that's always true)

    if (error) {
      console.error("Error clearing API logs:", error);
      return NextResponse.json(
        { success: false, error: "Failed to clear API logs" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "API logs cleared successfully",
    });
  } catch (error) {
    console.error("Unexpected error clearing API logs:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

