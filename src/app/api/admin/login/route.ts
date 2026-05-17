import { NextResponse } from 'next/server';
import { SignJWT } from 'jose';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const { password } = await request.json();

  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Wrong password' }, { status: 401 });
  }

  const secret = new TextEncoder().encode(
    process.env.JWT_SECRET ?? 'goclean-jwt-secret-2024-change-in-production'
  );

  const token = await new SignJWT({ admin: true })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(secret);

  const response = NextResponse.json({ success: true });
  response.cookies.set('admin_auth', token, {
    httpOnly: true,
    sameSite: 'strict',
    path: '/',
    maxAge: 86400,
    secure: process.env.NODE_ENV === 'production',
  });
  return response;
}
