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


export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rate limit login endpoints
  if (pathname === '/api/admin/login' || pathname === '/api/auth/login' || pathname === '/api/technician/login') {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown';
    if (isRateLimited(ip)) {
      return NextResponse.json({ error: 'Too many attempts. Please try again in 15 minutes.' }, { status: 429 });
    }
    return NextResponse.next();
  }

  // AUTH DISABLED
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*', '/api/auth/login', '/api/technician/login'],
};
