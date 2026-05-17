import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireAdmin()) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const { active } = await request.json();
  const coupon = await prisma.coupon.update({ where: { id }, data: { active } });
  return Response.json({ coupon });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireAdmin()) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  await prisma.coupon.delete({ where: { id } });
  return Response.json({ success: true });
}
