import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/adminAuth';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!(await requireAdmin())) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const users = await prisma.adminUser.findMany({
    orderBy: { createdAt: 'asc' },
    select: { id: true, name: true, email: true, createdAt: true },
  });
  return Response.json(users);
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const { name, email, password } = await request.json();
  if (!name?.trim() || !email?.trim() || !password)
    return Response.json({ error: 'Name, email and password required' }, { status: 400 });
  try {
    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.adminUser.create({
      data: { name: name.trim(), email: email.trim().toLowerCase(), password: hashed },
      select: { id: true, name: true, email: true, createdAt: true },
    });
    return Response.json(user);
  } catch {
    return Response.json({ error: 'Email already in use' }, { status: 400 });
  }
}
