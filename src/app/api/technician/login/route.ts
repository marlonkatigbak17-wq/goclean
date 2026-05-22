import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { SignJWT } from 'jose';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const { email, password } = await request.json();
  if (!email || !password) return Response.json({ error: 'Email and password required' }, { status: 400 });

  const tech = await prisma.technician.findUnique({ where: { email } });
  if (!tech || !tech.active) return Response.json({ error: 'Invalid credentials' }, { status: 401 });

  const valid = await bcrypt.compare(password, tech.password);
  if (!valid) return Response.json({ error: 'Invalid credentials' }, { status: 401 });

  const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
  const token = await new SignJWT({ techId: tech.id, name: tech.name, role: 'technician' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('12h')
    .sign(secret);

  const res = NextResponse.json({ success: true, name: tech.name });
  res.cookies.set('tech_auth', token, { httpOnly: true, sameSite: 'lax', path: '/', maxAge: 43200, secure: process.env.NODE_ENV === 'production' });
  return res;
}
