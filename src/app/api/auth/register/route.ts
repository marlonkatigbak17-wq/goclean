import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { signToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { name, email, password, phone } = await request.json();

    if (!name || !email || !password) {
      return Response.json({ error: 'Name, email, and password are required' }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return Response.json({ error: 'Email already registered' }, { status: 409 });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, password: hashed, phone: phone || '' },
    });

    const token = await signToken({ userId: user.id, email: user.email, name: user.name });

    const res = Response.json({ success: true, user: { id: user.id, name: user.name, email: user.email } });
    res.headers.set('Set-Cookie', `customer_auth=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=2592000`);
    return res;
  } catch (e) {
    console.error('Register error:', e);
    return Response.json({ error: 'Server error' }, { status: 500 });
  }
}
