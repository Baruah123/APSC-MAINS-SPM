import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json({ error: 'Registration ID required' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('registrations')
      .delete()
      .eq('id', id);

    if (error) {
      console.error("Failed to delete registration:", error);
      return NextResponse.json({ error: 'Failed to delete registration' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error in delete registration route:", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
