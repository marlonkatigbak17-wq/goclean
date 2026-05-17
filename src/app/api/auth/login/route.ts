import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { signToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return Response.json({ error: 'Email and password required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return Response.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return Response.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const token = await signToken({ userId: user.id, email: user.email, name: user.name });

    const res = Response.json({ success: true, user: { id: user.id, name: user.name, email: user.email } });
    res.headers.set('Set-Cookie', `customer_auth=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=2592000`);
    return res;
  } catch (e) {
    console.error('Login error:', e);
    return Response.json({ error: 'Server error' }, { status: 500 });
  }
}
