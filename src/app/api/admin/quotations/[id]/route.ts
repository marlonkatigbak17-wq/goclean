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

    if (status === 'sent' && q.customerEmail) {
      sendQuotationEmail(q).catch(() => {});
    }

    return Response.json(q);
  } catch (e) {
    console.error('Quotation update error:', e);
    return Response.json({ error: 'Failed to update quotation' }, { status: 500 });
  }
}

type QuotationRow = {
  id: string; customerName: string; customerEmail: string; customerPhone: string;
  items: unknown; subtotal: number; discount: number; total: number;
  notes: string; validUntil: Date | null; createdAt: Date;
};

async function sendQuotationEmail(q: QuotationRow) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || !q.customerEmail) return;

  type Item = { description: string; qty: number; price: number };
  const items = q.items as Item[];
  const quoteNo = q.id.slice(-8).toUpperCase();
  const viewUrl = `https://gocleanair.co/quotation/${q.id}`;
  const validDate = q.validUntil
    ? new Date(q.validUntil).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })
    : null;

  const itemRows = items.map((item, i) => `
    <tr style="background:${i % 2 === 0 ? '#ffffff' : '#f9fafb'}">
      <td style="padding:10px 12px;color:#374151;">${item.description}</td>
      <td style="padding:10px 12px;text-align:center;color:#6b7280;">${item.qty}</td>
      <td style="padding:10px 12px;text-align:right;color:#6b7280;">₱${item.price.toLocaleString()}</td>
      <td style="padding:10px 12px;text-align:right;font-weight:600;color:#374151;">₱${(item.qty * item.price).toLocaleString()}</td>
    </tr>`).join('');

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:620px;margin:0 auto;background:#f3f4f6;padding:24px;">
      <div style="background:#0f1f5c;padding:24px;border-radius:12px 12px 0 0;display:flex;justify-content:space-between;align-items:flex-start;">
        <div>
          <div style="color:white;font-size:20px;font-weight:900;">GoClean Aircon</div>
          <div style="color:#93c5fd;font-size:12px;margin-top:2px;">Supplies &amp; Services · gocleanair.co</div>
        </div>
        <div style="text-align:right;">
          <div style="color:white;font-size:22px;font-weight:900;text-transform:uppercase;letter-spacing:2px;">Quotation</div>
          <div style="color:#93c5fd;font-size:12px;margin-top:2px;">#${quoteNo}</div>
        </div>
      </div>
      <div style="background:white;padding:28px;border-radius:0 0 12px 12px;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
        <p style="margin:0 0 20px;font-size:15px;color:#374151;">Hi <strong>${q.customerName}</strong>,</p>
        <p style="margin:0 0 20px;font-size:14px;color:#6b7280;line-height:1.6;">
          Please find your quotation below. You can accept or decline it by clicking the button at the bottom of this email.
          ${validDate ? `This quotation is valid until <strong>${validDate}</strong>.` : ''}
        </p>

        <table style="width:100%;border-collapse:collapse;margin-bottom:20px;font-size:14px;">
          <thead>
            <tr style="background:#0f1f5c;color:white;">
              <th style="text-align:left;padding:10px 12px;border-radius:6px 0 0 0;font-weight:600;">Description</th>
              <th style="text-align:center;padding:10px 12px;font-weight:600;width:60px;">Qty</th>
              <th style="text-align:right;padding:10px 12px;font-weight:600;width:100px;">Unit Price</th>
              <th style="text-align:right;padding:10px 12px;border-radius:0 6px 0 0;font-weight:600;width:100px;">Amount</th>
            </tr>
          </thead>
          <tbody>${itemRows}</tbody>
        </table>

        <div style="display:flex;justify-content:flex-end;margin-bottom:24px;">
          <div style="width:220px;">
            <div style="display:flex;justify-content:space-between;font-size:13px;color:#6b7280;padding:4px 0;">
              <span>Subtotal</span><span>₱${q.subtotal.toLocaleString()}</span>
            </div>
            ${q.discount > 0 ? `<div style="display:flex;justify-content:space-between;font-size:13px;color:#16a34a;padding:4px 0;"><span>Discount</span><span>- ₱${q.discount.toLocaleString()}</span></div>` : ''}
            <div style="display:flex;justify-content:space-between;font-size:16px;font-weight:900;color:#0f1f5c;padding:8px 0;border-top:2px solid #0f1f5c;margin-top:4px;">
              <span>TOTAL</span><span>₱${q.total.toLocaleString()}</span>
            </div>
          </div>
        </div>

        ${q.notes ? `<div style="background:#eff6ff;border-radius:10px;padding:14px;margin-bottom:24px;font-size:13px;color:#4b5563;"><div style="font-size:11px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">Notes / Terms</div>${q.notes}</div>` : ''}

        <div style="text-align:center;margin:28px 0;">
          <a href="${viewUrl}" style="display:inline-block;background:#0f1f5c;color:white;text-decoration:none;padding:14px 32px;border-radius:10px;font-weight:700;font-size:15px;">View & Respond to Quotation →</a>
        </div>

        <div style="border-top:1px solid #e5e7eb;padding-top:20px;text-align:center;font-size:12px;color:#9ca3af;">
          <div>GoClean Aircon Supplies &amp; Services</div>
          <div style="margin-top:3px;">TESDA NC III Certified · Authorized Daikin Dealer</div>
          <div style="margin-top:3px;">0917 117 8605 · gocleanair.co</div>
        </div>
      </div>
    </div>`;

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'GoClean Aircon <onboarding@resend.dev>',
      to: [q.customerEmail],
      subject: `Your Quotation #${quoteNo} from GoClean Aircon`,
      html,
    }),
  });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  try {
    await prisma.quotation.delete({ where: { id } });
    return Response.json({ success: true });
  } catch {
    return Response.json({ error: 'Failed to delete quotation' }, { status: 500 });
  }
}
