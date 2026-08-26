import { NextResponse } from 'next/server';
import { getSession, clearSession } from '@/lib/security/session';
import { supabaseAdmin } from '@/lib/supabase/server';
import { finalSubmissionSchema } from '@/lib/validation/schemas';
import { v4 as uuidv4 } from 'uuid';

function generateRegistrationId() {
  const date = new Date();
  const year = date.getFullYear();
  const randomStr = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `APSCMT-${year}-${randomStr}`;
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    
    // 1. Verify Session integrity
    if (!session || !session.mobile_verified) {
      return NextResponse.json({ error: 'Unauthorized. Mobile verification is missing or expired.' }, { status: 401 });
    }

    const {
      mobile_number,
      roll_number,
      candidate_name,
      photo_storage_path,
    } = session;

    if (!roll_number || !candidate_name || !photo_storage_path) {
      return NextResponse.json({ error: 'Incomplete secure registration details in session. Please start over.' }, { status: 400 });
    }

    // 2. Validate final submission payload
    const body = await request.json();
    const result = finalSubmissionSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    const { 
      email, 
      mock_test_mode, 
      preferred_location, 
      second_preferred_location,
      course_enrolled_in,
      other_course_details,
      year_of_enrollment,
      month_of_enrollment,
      batch_timing
    } = result.data;

    if (mock_test_mode === 'offline' && (!preferred_location || !second_preferred_location)) {
        return NextResponse.json({ error: 'Both 1st and 2nd Preferred locations are required for offline mock test.' }, { status: 400 });
    }

    // 3. Double check duplicate registration by roll number
    const { data: existingReg, error: regError } = await supabaseAdmin
      .from('registrations')
      .select('id')
      .eq('roll_number', roll_number)
      .maybeSingle();

    if (regError) {
      return NextResponse.json({ error: 'Internal server error while verifying duplicates.' }, { status: 500 });
    }

    if (existingReg) {
      return NextResponse.json({ error: 'This APSC roll number has already been registered.' }, { status: 400 });
    }

    // 4. Double check roll number against candidates database to ensure it's valid
    const { data: candidate, error: candidateError } = await supabaseAdmin
      .from('apsc_candidates')
      .select('candidate_name')
      .eq('roll_number', roll_number)
      .maybeSingle();

    if (candidateError || !candidate || candidate.candidate_name !== candidate_name) {
       return NextResponse.json({ error: 'Invalid candidate details. Please restart registration.' }, { status: 400 });
    }

    // 5. Generate Registration ID and Insert Record
    const registrationId = generateRegistrationId();
    
    const { data: insertData, error: insertError } = await supabaseAdmin
      .from('registrations')
      .insert({
        registration_id: registrationId,
        mobile_number,
        mobile_verified: true,
        roll_number,
        candidate_name,
        email,
        photo_storage_path,
        mock_test_mode,
        preferred_location: mock_test_mode === 'offline' ? preferred_location : null,
        second_preferred_location: mock_test_mode === 'offline' ? second_preferred_location : null,
        course_enrolled_in,
        other_course_details: other_course_details || null,
        year_of_enrollment: year_of_enrollment || null,
        month_of_enrollment: month_of_enrollment || null,
        batch_timing: batch_timing || null,
        acceptance: true,
        acceptance_timestamp: new Date().toISOString(),
        status: 'registered',
        marketing_status: 'new'
      })
      .select('id')
      .single();

    if (insertError) {
      console.error("Database insert error:", insertError);
      return NextResponse.json({ error: 'Failed to save registration. Please try again.' }, { status: 500 });
    }

    // 6. Record the event
    await supabaseAdmin.from('registration_events').insert({
        registration_id: insertData.id,
        event_type: 'registration_submitted',
        details: { mode: mock_test_mode }
    });

    // 7. Clear Session
    await clearSession();

    // 8. Trigger Google Sheets Sync (Fire and Forget)
    const baseUrl = new URL(request.url).origin;
    fetch(`${baseUrl}/api/google/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registration_id: insertData.id })
    }).catch(e => console.error("Failed to trigger background Google Sync", e));

    return NextResponse.json({ 
      success: true, 
      registrationId 
    });

  } catch (error) {
    console.error("Error in final submission route:", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
