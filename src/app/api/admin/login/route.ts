import { NextResponse } from 'next/server';
import { SignJWT } from 'jose';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const { email, password } = await request.json();
  if (!email || !password)
    return NextResponse.json({ error: 'Email and password required' }, { status: 400 });

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });

  // If no admin users exist yet, auto-create the default admin from env vars
  const count = await prisma.adminUser.count();
  if (count === 0 && process.env.ADMIN_PASSWORD) {
    const hashed = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);
    await prisma.adminUser.create({
      data: { name: 'Admin', email: 'admin@gocleanair.co', password: hashed },
    });
  }

  const user = await prisma.adminUser.findUnique({ where: { email } });
  if (!user) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });

  const secret = new TextEncoder().encode(jwtSecret);
  const token = await new SignJWT({ admin: true, adminId: user.id, adminName: user.name })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(secret);

  const response = NextResponse.json({ success: true, name: user.name });
  response.cookies.set('admin_auth', token, {
    httpOnly: true,
    sameSite: 'strict',
    path: '/',
    maxAge: 86400,
    secure: process.env.NODE_ENV === 'production',
  });
  return response;
}
