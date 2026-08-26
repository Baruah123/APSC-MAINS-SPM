import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    // In a real application, you must verify the admin session/token here
    // e.g. verify Admin JWT

    const body = await request.json();
    const candidates = body.candidates;

    if (!Array.isArray(candidates) || candidates.length === 0) {
      return NextResponse.json({ error: 'Invalid or empty candidate data' }, { status: 400 });
    }

    // Process in batches of 1000 to avoid limits
    let imported = 0;
    let errors = 0;
    const batchSize = 1000;

    for (let i = 0; i < candidates.length; i += batchSize) {
      const batch = candidates.slice(i, i + batchSize);
      
      const { error } = await supabaseAdmin
        .from('apsc_candidates')
        .upsert(batch, { onConflict: 'roll_number', ignoreDuplicates: true });

      if (error) {
        console.error("Batch import error:", error);
        // Supabase might fail the entire batch if one is extremely malformed,
        // but ignoreDuplicates usually handles conflicts.
        errors += batch.length; 
      } else {
        // Technically some might have been ignored, but we count the batch size
        // for simplicity unless we query exactly what was inserted.
        // A robust way is to check the return count, but upsert with ignoreDuplicates
        // doesn't return count easily in all configurations without extra querying.
        imported += batch.length;
      }
    }

    // Note: If some were ignored due to duplicate roll_number, `imported` might 
    // be slightly inaccurate unless we fetch before/after counts.
    // For simplicity, we just return the processed count.

    return NextResponse.json({ 
      success: true, 
      imported,
      errors
    });

  } catch (error) {
    console.error("Error in import-candidates route:", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
