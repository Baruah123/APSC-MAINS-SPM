import { NextResponse } from 'next/server';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import { createAdminSession } from '@/lib/security/session';

const JWKS_URI = 'https://www.googleapis.com/robot/v1/metadata/jwk/securetoken@system.gserviceaccount.com';
const JWKS = createRemoteJWKSet(new URL(JWKS_URI));

export async function POST(request: Request) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({ error: 'Missing token' }, { status: 400 });
    }

    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    
    if (!projectId) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    // Verify the Firebase JWT
    const { payload } = await jwtVerify(token, JWKS, {
      issuer: `https://securetoken.google.com/${projectId}`,
      audience: projectId,
    });

    if (!payload.sub) {
      return NextResponse.json({ error: 'Invalid token payload' }, { status: 401 });
    }

    const email = (payload.email as string) || '';
    const role = email === 'viewer@spmiasacademy.com' ? 'viewer' : 'admin';

    // Set the secure HTTP-only cookie using iron-session logic
    await createAdminSession({
      uid: payload.sub,
      email: email,
      isAdmin: true, // both admin and viewer get past middleware, roles handle specific permissions
      role: role,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Firebase token verification error:', error.message);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
