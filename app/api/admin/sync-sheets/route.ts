import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    // 1. Fetch registrations that haven't been successfully synced
    const { data: registrations, error: fetchError } = await supabaseAdmin
      .from('registrations')
      .select('*')
      .neq('google_sync_status', 'success');

    if (fetchError) {
      console.error("Failed to fetch unsynced registrations:", fetchError);
      return NextResponse.json({ error: 'Failed to fetch unsynced registrations' }, { status: 500 });
    }

    if (!registrations || registrations.length === 0) {
      return NextResponse.json({ success: true, message: 'All registrations are already synced.', syncedCount: 0, failedCount: 0 });
    }

    // 2. Fetch locations to map UUID to Name
    const { data: locations } = await supabaseAdmin.from('test_locations').select('id, name');
    const locationMap: Record<string, string> = locations?.reduce((acc: any, loc: any) => {
      acc[loc.id] = loc.name;
      return acc;
    }, {}) || {};

    const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL || "https://script.google.com/macros/s/AKfycbzLdhrDJPxDet9ZweTkmFHO3pcP5i1sJd1r4793-z4HHDWXkV_aTkUZHs0HOqs3jkA/exec";

    let syncedCount = 0;
    let failedCount = 0;

    // 3. Loop through unsynced registrations and sync them individually
    for (const registration of registrations) {
      try {
        const pref1 = registration.preferred_location ? (locationMap[registration.preferred_location] || registration.preferred_location) : 'N/A';
        const pref2 = registration.second_preferred_location ? (locationMap[registration.second_preferred_location] || registration.second_preferred_location) : 'N/A';

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

        // Update the sync status to success
        await supabaseAdmin
          .from('registrations')
          .update({
            google_sync_status: 'success',
            google_synced_at: new Date().toISOString(),
            google_sync_attempts: (registration.google_sync_attempts || 0) + 1,
            google_sync_error: null
          })
          .eq('id', registration.id);

        syncedCount++;
      } catch (err: any) {
        console.error(`Error syncing registration ${registration.id}:`, err);
        failedCount++;
        
        // Update the sync status to failed
        await supabaseAdmin
          .from('registrations')
          .update({
            google_sync_status: 'failed',
            google_sync_error: err.message || 'Unknown error',
            google_sync_attempts: (registration.google_sync_attempts || 0) + 1
          })
          .eq('id', registration.id);
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Sync complete. ${syncedCount} succeeded, ${failedCount} failed.`,
      syncedCount,
      failedCount
    });

  } catch (error: any) {
    console.error("Error in Bulk Google Sync route:", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
