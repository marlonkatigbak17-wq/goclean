import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/adminAuth';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const { name, email, password } = await request.json();
  const data: Record<string, unknown> = {};
  if (name?.trim())  data.name  = name.trim();
  if (email?.trim()) data.email = email.trim().toLowerCase();
  if (password)      data.password = await bcrypt.hash(password, 10);
  try {
    const user = await prisma.adminUser.update({
      where: { id },
      data,
      select: { id: true, name: true, email: true, createdAt: true },
    });
    return Response.json(user);
  } catch {
    return Response.json({ error: 'Email already in use' }, { status: 400 });
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const count = await prisma.adminUser.count();
  if (count <= 1) return Response.json({ error: 'Cannot delete the last admin user' }, { status: 400 });
  await prisma.adminUser.delete({ where: { id } });
  return Response.json({ success: true });
}
