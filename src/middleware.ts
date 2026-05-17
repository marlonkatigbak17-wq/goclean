import { NextRequest, NextResponse } from 'next/server';

const loginAttempts = new Map<string, { count: number; reset: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000;
  const limit = 10;
  const record = loginAttempts.get(ip);
  if (!record || now > record.reset) {
    loginAttempts.set(ip, { count: 1, reset: now + windowMs });
    return false;
  }
  if (record.count >= limit) return true;
  record.count++;
  return false;
}

function isValidJwt(value: string): boolean {
  const parts = value.split('.');
  return parts.length === 3 && parts.every((p) => p.length > 0);
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rate limit login endpoints
  if (pathname === '/api/admin/login' || pathname === '/api/auth/login') {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown';
    if (isRateLimited(ip)) {
      return NextResponse.json({ error: 'Too many attempts. Please try again in 15 minutes.' }, { status: 429 });
    }
    return NextResponse.next();
  }

  // Allow admin login/logout through
  if (pathname === '/admin/login' || pathname === '/api/admin/logout') {
    return NextResponse.next();
  }

  // Optimistic cookie check — full JWT verification is done in each API route via requireAdmin()
  const token = request.cookies.get('admin_auth')?.value;

  if (!token || !isValidJwt(token)) {
    if (pathname.startsWith('/api/admin/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*', '/api/auth/login'],
};
