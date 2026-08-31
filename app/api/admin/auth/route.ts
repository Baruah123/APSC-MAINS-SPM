import { NextResponse } from 'next/server';
import { createAdminSession, getAdminSession, clearAdminSession } from '@/lib/security/session';

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }
    return NextResponse.json({ authenticated: true, user: session });
  } catch (error: any) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}

export async function DELETE() {
  try {
    await clearAdminSession();
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to logout' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Missing credentials' }, { status: 400 });
    }

    const adminEmail = 'admin@spmiasacademy.com';
    const viewerEmail = 'viewer@spmiasacademy.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'spmadmin123';
    const viewerPassword = process.env.VIEWER_PASSWORD || 'spmviewer123';

    let role: 'admin' | 'viewer' | '' = '';
    
    if (email === adminEmail && password === adminPassword) {
      role = 'admin';
    } else if (email === viewerEmail && password === viewerPassword) {
      role = 'viewer';
    } else {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Set the secure HTTP-only cookie using iron-session logic
    await createAdminSession({
      uid: role === 'admin' ? 'admin-uid-bypass' : 'viewer-uid-bypass',
      email: email,
      isAdmin: true, // both admin and viewer get past middleware, roles handle specific permissions
      role: role,
    });

    return NextResponse.json({ success: true, role });
  } catch (error: any) {
    console.error('Authentication error:', error.message);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
