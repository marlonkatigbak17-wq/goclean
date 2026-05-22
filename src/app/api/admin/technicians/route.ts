import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/adminAuth';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!(await requireAdmin())) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const techs = await prisma.technician.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true, email: true, phone: true, active: true, createdAt: true, _count: { select: { bookings: true } } } });
  return Response.json(techs);
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const { name, email, phone, password } = await request.json();
  if (!name || !email || !password) return Response.json({ error: 'Name, email and password required' }, { status: 400 });
  const hashed = await bcrypt.hash(password, 10);
  const tech = await prisma.technician.create({ data: { name, email, phone: phone || '', password: hashed } });
  const { password: _, ...safe } = tech;
  return Response.json(safe);
}
