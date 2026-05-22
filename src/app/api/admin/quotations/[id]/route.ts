import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const data = await request.json();
  if (data.items) {
    data.subtotal = data.items.reduce((s: number, i: { qty: number; price: number }) => s + i.qty * i.price, 0);
    data.total = data.subtotal - (data.discount || 0);
  }
  const q = await prisma.quotation.update({ where: { id }, data: { ...data, updatedAt: new Date() } });
  return Response.json(q);
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  await prisma.quotation.delete({ where: { id } });
  return Response.json({ success: true });
}
