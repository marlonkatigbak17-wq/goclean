import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!(await requireAdmin())) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const quotations = await prisma.quotation.findMany({ orderBy: { createdAt: 'desc' }, include: { lead: true } });
  return Response.json(quotations);
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const data = await request.json();
  if (!data.customerName || !data.items?.length) return Response.json({ error: 'Customer name and items required' }, { status: 400 });
  const subtotal = data.items.reduce((s: number, i: { qty: number; price: number }) => s + i.qty * i.price, 0);
  const discount = data.discount || 0;
  const total = subtotal - discount;
  // sanitize empty strings for optional fields
  const leadId = data.leadId || null;
  const validUntil = data.validUntil ? new Date(data.validUntil) : null;
  const { leadId: _l, validUntil: _v, ...rest } = data;
  const quotation = await prisma.quotation.create({ data: { ...rest, subtotal, total, discount, leadId, validUntil }, include: { lead: true } });
  return Response.json(quotation);
}
