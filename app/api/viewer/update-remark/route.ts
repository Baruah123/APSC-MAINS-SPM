import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { getAdminSession } from '@/lib/security/session';

export async function POST(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session || (session.role !== 'admin' && session.role !== 'viewer')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, remark } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'Missing registration ID' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('registrations')
      .update({ remarks: remark })
      .eq('id', id);

    if (error) {
      console.error('Error updating remark:', error);
      return NextResponse.json({ error: 'Failed to update database' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Error in update-remark API:', err.message);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
