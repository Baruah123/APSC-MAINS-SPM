import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const secretKey = process.env.SESSION_SECRET;
const key = new TextEncoder().encode(secretKey);

export type RegistrationSession = {
  mobile_number?: string;
  mobile_verified?: boolean;
  roll_number?: string;
  candidate_name?: string;
  photo_storage_path?: string;
  email?: string;
  mock_test_mode?: 'online' | 'offline';
  preferred_location?: string;
  acceptance?: boolean;
};

const SESSION_COOKIE_NAME = 'registration_session';
const ADMIN_SESSION_COOKIE_NAME = 'admin_session';
const SESSION_EXPIRATION = 60 * 60; // 1 hour
const ADMIN_SESSION_EXPIRATION = 60 * 60 * 24; // 24 hours

export async function encrypt(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_EXPIRATION}s`)
    .sign(key);
}

export async function decrypt(input: string): Promise<any> {
  const { payload } = await jwtVerify(input, key, {
    algorithms: ['HS256'],
  });
  return payload;
}

export async function getSession(): Promise<RegistrationSession | null> {
  const session = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  if (!session) return null;
  try {
    return await decrypt(session);
  } catch (error) {
    return null;
  }
}

export async function updateSession(data: Partial<RegistrationSession>) {
  const session = await getSession();
  const newSessionData = { ...session, ...data };
  const encryptedSession = await encrypt(newSessionData);
  
  (await cookies()).set(SESSION_COOKIE_NAME, encryptedSession, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_EXPIRATION,
    path: '/',
  });
}

export async function clearSession() {
  (await cookies()).set(SESSION_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });
}

// ==========================================
// ADMIN SESSION MANAGEMENT
// ==========================================

export type AdminSession = {
  uid: string;
  email: string;
  isAdmin: boolean;
  role: 'admin' | 'viewer';
};

export async function createAdminSession(data: AdminSession) {
  const encryptedSession = await new SignJWT(data)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${ADMIN_SESSION_EXPIRATION}s`)
    .sign(key);
    
  (await cookies()).set(ADMIN_SESSION_COOKIE_NAME, encryptedSession, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: ADMIN_SESSION_EXPIRATION,
    path: '/',
  });
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const session = (await cookies()).get(ADMIN_SESSION_COOKIE_NAME)?.value;
  if (!session) return null;
  try {
    return await decrypt(session) as AdminSession;
  } catch (error) {
    return null;
  }
}

export async function clearAdminSession() {
  (await cookies()).set(ADMIN_SESSION_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });
}
