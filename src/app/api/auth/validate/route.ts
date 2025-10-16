import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Initialize Supabase client with service role for admin operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const admin = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(req: NextRequest) {
  try {
    const { api_key } = await req.json();

    // Validate input
    if (!api_key) {
      return NextResponse.json(
        { valid: false, error: 'API key is required' },
        { status: 400 }
      );
    }

    // Check if API key exists and is active
    const { data: apiKeyData, error: apiKeyError } = await admin
      .from('api_keys')
      .select('user_id, is_active')
      .eq('key', api_key)
      .single();

    if (apiKeyError || !apiKeyData || !apiKeyData.is_active) {
      return NextResponse.json({
        valid: false,
        error: 'Invalid or inactive API key',
      });
    }

    // Fetch user profile
    const { data: profile, error: profileError } = await admin
      .from('profiles')
      .select('first_name, last_name, location_id, locations(name)')
      .eq('id', apiKeyData.user_id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({
        valid: false,
        error: 'User profile not found',
      });
    }

    // Return validation success
    const userName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
    const locationName = profile.locations?.name || 'Unknown Location';

    return NextResponse.json({
      valid: true,
      user_name: userName,
      location_name: locationName,
    });

  } catch (error) {
    console.error('Validation error:', error);
    return NextResponse.json(
      { valid: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

