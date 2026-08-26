import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient as updateSupabaseSession } from '@/utils/supabase/middleware';
import { decrypt } from '@/lib/security/session';

export async function middleware(request: NextRequest) {
  // Always update the supabase session if it's there
  let response = updateSupabaseSession(request);
  if (!response) {
    response = NextResponse.next();
  }

  const path = request.nextUrl.pathname;

  // Protect /admin routes (except /admin/login)
  if (path.startsWith('/admin') && path !== '/admin/login') {
    const adminSessionCookie = request.cookies.get('admin_session')?.value;
    if (!adminSessionCookie) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
    try {
      const session = await decrypt(adminSessionCookie);
      if (session.role === 'viewer') {
        return NextResponse.redirect(new URL('/viewer', request.url));
      }
    } catch {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  // Protect /viewer routes (except /viewer/login)
  if (path.startsWith('/viewer') && path !== '/viewer/login') {
    const adminSessionCookie = request.cookies.get('admin_session')?.value;
    if (!adminSessionCookie) {
      return NextResponse.redirect(new URL('/viewer/login', request.url));
    }
    try {
      await decrypt(adminSessionCookie);
    } catch {
      return NextResponse.redirect(new URL('/viewer/login', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
