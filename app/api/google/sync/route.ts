import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { registration_id } = body;

    if (!registration_id) {
      return NextResponse.json({ error: 'Registration ID required' }, { status: 400 });
    }

    // 1. Fetch the registration data
    const { data: registration, error: regError } = await supabaseAdmin
      .from('registrations')
      .select('*')
      .eq('id', registration_id)
      .single();

    if (regError || !registration) {
      console.error("Failed to fetch registration for Google Sync", regError);
      return NextResponse.json({ error: 'Registration not found' }, { status: 404 });
    }

    // Fetch locations to map UUID to Name
    const { data: locations } = await supabaseAdmin.from('test_locations').select('id, name');
    const locationMap: Record<string, string> = locations?.reduce((acc: any, loc: any) => {
      acc[loc.id] = loc.name;
      return acc;
    }, {}) || {};

    const pref1 = registration.preferred_location ? (locationMap[registration.preferred_location] || registration.preferred_location) : 'N/A';
    const pref2 = registration.second_preferred_location ? (locationMap[registration.second_preferred_location] || registration.second_preferred_location) : 'N/A';

    // 2. Format the row data for Google Sheets Webhook
    // Matches the JSON schema expected by the Apps Script
    const payload = {
      registration_id: registration.registration_id,
      date: new Date(registration.created_at).toLocaleString(),
      candidate_name: registration.candidate_name,
      roll_number: registration.roll_number,
      mobile_number: `'${registration.mobile_number}`, // Prefix with ' to prevent Excel/Sheets from dropping leading zeros
      email: registration.email,
      mode: registration.mock_test_mode === 'offline' ? 'Offline' : 'Online',
      course: registration.course_enrolled_in === 'Others' ? `${registration.course_enrolled_in} - ${registration.other_course_details}` : registration.course_enrolled_in || 'N/A',
      preferred_location_1: registration.mock_test_mode === 'offline' ? pref1 : 'N/A',
      preferred_location_2: registration.mock_test_mode === 'offline' ? pref2 : 'N/A',
      transaction_id: registration.transaction_id || 'N/A'
    };

    const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL || "https://script.google.com/macros/s/AKfycbzLdhrDJPxDet9ZweTkmFHO3pcP5i1sJd1r4793-z4HHDWXkV_aTkUZHs0HOqs3jkA/exec";

    // 3. Send to Google Sheets Webhook
    const response = await fetch(webhookUrl, {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Google Apps Script returned ${response.status}`);
    }

    const result = await response.json();
    if (result.status !== 'success') {
      throw new Error(result.message || 'Unknown Apps Script error');
    }

    // 4. Update the sync status in Supabase
    await supabaseAdmin
      .from('registrations')
      .update({
        google_sync_status: 'success',
        google_synced_at: new Date().toISOString(),
        google_sync_attempts: (registration.google_sync_attempts || 0) + 1,
        google_sync_error: null
      })
      .eq('id', registration_id);

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("Error in Google Sync route:", error);
    
    // Record the failure in Supabase for future retries
    if (request.body) {
       try {
         const body = await request.clone().json();
         if (body.registration_id) {
           await supabaseAdmin
            .from('registrations')
            .update({
                google_sync_status: 'failed',
                google_sync_error: error.message || 'Unknown error',
                google_sync_attempts: 1 // Normally you'd increment, simplified for here
            })
            .eq('id', body.registration_id);
         }
       } catch (e) {
           // ignore
       }
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
