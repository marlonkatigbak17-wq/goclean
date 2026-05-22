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
  try {
    const body = await request.json();
    const { customerName, customerEmail, customerPhone, items, discount, notes, status, validUntil, leadId } = body;

    if (!customerName?.trim()) return Response.json({ error: 'Customer name is required' }, { status: 400 });
    if (!items?.length) return Response.json({ error: 'At least one item is required' }, { status: 400 });

    const subtotal = items.reduce((s: number, i: { qty: number; price: number }) => s + (i.qty || 0) * (i.price || 0), 0);
    const discountAmt = Number(discount) || 0;
    const total = subtotal - discountAmt;

    const quotation = await prisma.quotation.create({
      data: {
        customerName: customerName.trim(),
        customerEmail: customerEmail?.trim() || '',
        customerPhone: customerPhone?.trim() || '',
        items,
        subtotal,
        discount: discountAmt,
        total,
        status: status || 'draft',
        notes: notes?.trim() || '',
        validUntil: validUntil ? new Date(validUntil) : null,
        leadId: leadId || null,
      },
      include: { lead: true },
    });

    return Response.json(quotation);
  } catch (e) {
    console.error('Quotation create error:', e);
    return Response.json({ error: 'Failed to create quotation' }, { status: 500 });
  }
}
