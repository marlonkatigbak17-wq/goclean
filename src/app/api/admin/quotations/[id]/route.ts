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
  const leadId = data.leadId !== undefined ? (data.leadId || null) : undefined;
  const validUntil = data.validUntil !== undefined ? (data.validUntil ? new Date(data.validUntil) : null) : undefined;
  const { leadId: _l, validUntil: _v, ...rest } = data;
  const clean = { ...rest, ...(leadId !== undefined && { leadId }), ...(validUntil !== undefined && { validUntil }) };
  const q = await prisma.quotation.update({ where: { id }, data: { ...clean, updatedAt: new Date() } });
  return Response.json(q);
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  await prisma.quotation.delete({ where: { id } });
  return Response.json({ success: true });
}
