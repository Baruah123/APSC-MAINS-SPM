import { NextResponse } from 'next/server';
import { getSession, updateSession } from '@/lib/security/session';
import { supabaseAdmin } from '@/lib/supabase/server';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    
    if (!session || !session.mobile_verified || !session.roll_number) {
      return NextResponse.json({ error: 'Unauthorized. Please complete previous steps.' }, { status: 401 });
    }

    const formData = await request.formData();
    const photo = formData.get('photo') as Blob;

    if (!photo) {
      return NextResponse.json({ error: 'No photo provided.' }, { status: 400 });
    }

    // Basic validation
    if (!photo.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Invalid file format. Must be an image.' }, { status: 400 });
    }

    if (photo.size > 5 * 1024 * 1024) { // 5MB max
      return NextResponse.json({ error: 'Image file is too large. Maximum size is 5MB.' }, { status: 400 });
    }

    // Generate safe unique filename
    const ext = photo.type === 'image/png' ? 'png' : 'jpg';
    const fileName = `${uuidv4()}.${ext}`;
    
    // In a production environment, we use a secure path:
    // candidate-photos/{roll_number}/{unique-file-name}.jpg
    // But to not leak roll number in URL if ever exposed, UUID is better.
    const storagePath = `candidate-photos/${session.roll_number}/${fileName}`;

    // Convert Blob to Buffer for Supabase upload
    const arrayBuffer = await photo.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { data, error } = await supabaseAdmin
      .storage
      .from('candidate-photos')
      .upload(storagePath, buffer, {
        contentType: photo.type,
        upsert: false
      });

    if (error) {
      console.error("Supabase storage upload error:", error);
      return NextResponse.json({ error: 'Failed to upload photo to storage.' }, { status: 500 });
    }

    // Update session
    await updateSession({ photo_storage_path: data.path });

    return NextResponse.json({ 
      success: true, 
      path: data.path 
    });

  } catch (error) {
    console.error("Error in upload-photo route:", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
