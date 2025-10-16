import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Initialize Supabase client with service role for admin operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const admin = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(req: NextRequest) {
  try {
    // Parse request body
    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    const { email, password, device_name } = body;

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Authenticate with Supabase Auth
    const { data: authData, error: authError } = await admin.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !authData.user) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const userId = authData.user.id;

    // Fetch user profile to get name
    const { data: profile, error: profileError } = await admin
      .from('profiles')
      .select('first_name, last_name')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { success: false, error: 'User profile not found' },
        { status: 404 }
      );
    }

    // Default location name (can be customized later)
    const locationName = 'MituGym';

    // Get or create API key for this user
    const { data: existingApiKey, error: apiKeyError } = await admin
      .from('api_keys')
      .select('key')
      .eq('user_id', userId)
      .eq('is_active', true)
      .single();

    let finalApiKey: string;

    // If no active API key exists, create one
    if (apiKeyError || !existingApiKey) {
      const newApiKey = generateApiKey();
      const { data: newKeyData, error: createError } = await admin
        .from('api_keys')
        .insert({
          user_id: userId,
          key: newApiKey,
          name: device_name || 'Scanner App',
          is_active: true,
        })
        .select('key')
        .single();

      if (createError || !newKeyData) {
        return NextResponse.json(
          { success: false, error: 'Failed to create API key' },
          { status: 500 }
        );
      }

      finalApiKey = newKeyData.key;
    } else {
      finalApiKey = existingApiKey.key;
    }

    // Log device authentication
    await admin.from('device_logins').insert({
      user_id: userId,
      device_name: device_name || 'Unknown Device',
      api_key: finalApiKey,
      logged_in_at: new Date().toISOString(),
    });

    // Return success response
    const userName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim();

    return NextResponse.json({
      success: true,
      api_key: finalApiKey,
      user_name: userName,
      location_name: locationName,
      email: email,
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Generate a secure API key
function generateApiKey(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let key = '';
  for (let i = 0; i < 64; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return key;
}

