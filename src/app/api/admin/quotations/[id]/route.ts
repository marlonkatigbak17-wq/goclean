import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const q = await prisma.quotation.findUnique({ where: { id }, include: { lead: true } });
  if (!q) return Response.json({ error: 'Not found' }, { status: 404 });
  return Response.json(q);
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const { id } = await params;
    const body = await request.json();
    const { customerName, customerEmail, customerPhone, items, discount, notes, status, validUntil, leadId } = body;

    const data: Record<string, unknown> = {};
    if (customerName !== undefined) data.customerName = customerName;
    if (customerEmail !== undefined) data.customerEmail = customerEmail;
    if (customerPhone !== undefined) data.customerPhone = customerPhone;
    if (notes !== undefined) data.notes = notes;
    if (status !== undefined) data.status = status;
    if (leadId !== undefined) data.leadId = leadId || null;
    if (validUntil !== undefined) data.validUntil = validUntil ? new Date(validUntil) : null;

    if (items !== undefined) {
      data.items = items;
      data.subtotal = items.reduce((s: number, i: { qty: number; price: number }) => s + i.qty * i.price, 0);
      data.discount = Number(discount) || 0;
      data.total = (data.subtotal as number) - (data.discount as number);
    } else if (discount !== undefined) {
      const existing = await prisma.quotation.findUnique({ where: { id }, select: { subtotal: true } });
      data.discount = Number(discount) || 0;
      data.total = (existing?.subtotal || 0) - (data.discount as number);
    }

    const q = await prisma.quotation.update({ where: { id }, data });
    return Response.json(q);
  } catch (e) {
    console.error('Quotation update error:', e);
    return Response.json({ error: 'Failed to update quotation' }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  await prisma.quotation.delete({ where: { id } });
  return Response.json({ success: true });
}
