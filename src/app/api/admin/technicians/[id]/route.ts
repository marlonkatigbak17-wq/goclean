import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/adminAuth';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const { name, email, phone, password, active } = await request.json();
  const data: Record<string, unknown> = { name, email, phone, active };
  if (password) data.password = await bcrypt.hash(password, 10);
  const tech = await prisma.technician.update({ where: { id }, data });
  const { password: _, ...safe } = tech;
  return Response.json(safe);
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  await prisma.technician.delete({ where: { id } });
  return Response.json({ success: true });
}
