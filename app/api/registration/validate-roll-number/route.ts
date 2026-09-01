import { NextResponse } from 'next/server';
import { rollNumberSchema } from '@/lib/validation/schemas';
import { getSession, updateSession } from '@/lib/security/session';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    // Step 1: Roll number validation does not require mobile_verified session
    const session = await getSession();

    const body = await request.json();
    const result = rollNumberSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    const { rollNumber } = result.data;

    // 1. Verify roll number exists in apsc_candidates
    const { data: candidate, error: candidateError } = await supabaseAdmin
      .from('apsc_candidates')
      .select('candidate_name')
      .eq('roll_number', rollNumber)
      .maybeSingle();

    if (candidateError) {
      console.error("Database error checking candidate:", candidateError);
      return NextResponse.json({ error: 'Internal server error while verifying roll number.' }, { status: 500 });
    }

    if (!candidate) {
      return NextResponse.json({ error: 'Invalid Roll Number.' }, { status: 400 });
    }

    // 2. Check if already registered
    const { data: existingReg, error: regError } = await supabaseAdmin
      .from('registrations')
      .select('id')
      .eq('roll_number', rollNumber)
      .maybeSingle();

    if (regError) {
      console.error("Database error checking existing registration:", regError);
      return NextResponse.json({ error: 'Internal server error while verifying registration.' }, { status: 500 });
    }

    if (existingReg) {
      return NextResponse.json({ error: 'This APSC roll number has already been registered.' }, { status: 400 });
    }

    // 3. Update session with verified details
    await updateSession({ 
      roll_number: rollNumber,
      candidate_name: candidate.candidate_name
    });

    return NextResponse.json({ 
      success: true, 
      candidateName: candidate.candidate_name
    });

  } catch (error) {
    console.error("Error in validate-roll-number route:", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
