import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { mobileSchema } from '@/lib/validation/schemas';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = mobileSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    const { mobile } = result.data;

    // Check if mobile number is already in registrations
    const { data: existingReg, error } = await supabaseAdmin
      .from('registrations')
      .select('id')
      .eq('mobile_number', mobile)
      .maybeSingle();

    if (error) {
      console.error("Database error checking mobile:", error);
      return NextResponse.json({ error: 'Internal server error while verifying mobile number.' }, { status: 500 });
    }

    if (existingReg) {
      return NextResponse.json({ exists: true });
    }

    return NextResponse.json({ exists: false });

  } catch (error) {
    console.error("Error in check-mobile route:", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
