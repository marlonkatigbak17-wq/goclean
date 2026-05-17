import { createHmac } from 'crypto';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

async function sendEmails(
  customer: { name?: string; email?: string; phone?: string },
  lineItems: { name: string; amount: number; quantity: number }[],
  metadata: { address?: string; delivery_notes?: string },
  totalCentavos: number,
) {
  const apiKey = process.env.RESEND_API_KEY!;
  const total = (totalCentavos / 100).toLocaleString('en-PH', { style: 'currency', currency: 'PHP' });

  const itemRows = lineItems.map((item) =>
    `<tr>
      <td style="padding:6px 0;color:#111;">${item.name}</td>
      <td style="padding:6px 0;text-align:center;color:#555;">${item.quantity}</td>
      <td style="padding:6px 0;text-align:right;color:#111;">₱${((item.amount * item.quantity) / 100).toLocaleString()}</td>
    </tr>`
  ).join('');

  // ── Email to shop owners ──
  const ownerHtml = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f9f9f9;padding:24px;border-radius:8px;">
      <div style="background:#0f1f5c;padding:20px 24px;border-radius:8px 8px 0 0;margin:-24px -24px 24px;">
        <h1 style="color:white;margin:0;font-size:20px;">💳 New Order Paid!</h1>
        <p style="color:#93c5fd;margin:4px 0 0;font-size:13px;">GoClean Aircon Supplies & Services</p>
      </div>
      <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:16px;">
        <tr><td style="padding:8px 0;color:#555;width:140px;">👤 Customer</td><td style="padding:8px 0;font-weight:bold;color:#111;">${customer.name || '—'}</td></tr>
        <tr><td style="padding:8px 0;color:#555;">📞 Phone</td><td style="padding:8px 0;color:#111;">${customer.phone || '—'}</td></tr>
        <tr><td style="padding:8px 0;color:#555;">✉️ Email</td><td style="padding:8px 0;color:#111;">${customer.email || '—'}</td></tr>
        <tr><td style="padding:8px 0;color:#555;">📍 Delivery</td><td style="padding:8px 0;color:#111;">${metadata.address || '—'}</td></tr>
        ${metadata.delivery_notes ? `<tr><td style="padding:8px 0;color:#555;">📝 Notes</td><td style="padding:8px 0;color:#111;">${metadata.delivery_notes}</td></tr>` : ''}
      </table>
      <table style="width:100%;border-collapse:collapse;font-size:14px;border-top:2px solid #0f1f5c;margin-bottom:16px;">
        <thead><tr style="background:#f3f4f6;">
          <th style="padding:8px 6px;text-align:left;font-size:12px;color:#555;">Item</th>
          <th style="padding:8px 6px;text-align:center;font-size:12px;color:#555;">Qty</th>
          <th style="padding:8px 6px;text-align:right;font-size:12px;color:#555;">Amount</th>
        </tr></thead>
        <tbody>${itemRows}</tbody>
        <tfoot><tr style="border-top:2px solid #0f1f5c;">
          <td colspan="2" style="padding:10px 6px;font-weight:bold;color:#0f1f5c;">TOTAL PAID</td>
          <td style="padding:10px 6px;text-align:right;font-weight:bold;color:#0f1f5c;font-size:16px;">${total}</td>
        </tr></tfoot>
      </table>
      <div style="margin-top:16px;padding:12px;background:#d1fae5;border-radius:8px;text-align:center;font-weight:bold;color:#065f46;">
        ✅ Payment confirmed via PayMongo
      </div>
    </div>`;

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'GoClean Orders <onboarding@resend.dev>',
      to: ['gocleanair@gmail.com', 'gocleanair3@gmail.com'],
      subject: `✅ New Order Paid — ${customer.name || 'Customer'} (${total})`,
      html: ownerHtml,
    }),
  });

  // ── Email to customer ──
  if (customer.email) {
    const customerHtml = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f9f9f9;padding:24px;border-radius:8px;">
        <div style="background:#0f1f5c;padding:20px 24px;border-radius:8px 8px 0 0;margin:-24px -24px 24px;">
          <h1 style="color:white;margin:0;font-size:20px;">Thank you for your order!</h1>
          <p style="color:#93c5fd;margin:4px 0 0;font-size:13px;">GoClean Aircon Supplies & Services</p>
        </div>
        <p style="font-size:15px;color:#111;">Hi <strong>${customer.name || 'there'}</strong>,</p>
        <p style="font-size:14px;color:#555;">We received your payment and your order is confirmed. Our team will contact you within 24 hours to arrange delivery.</p>
        <table style="width:100%;border-collapse:collapse;font-size:14px;border-top:2px solid #0f1f5c;margin:16px 0;">
          <thead><tr style="background:#f3f4f6;">
            <th style="padding:8px 6px;text-align:left;font-size:12px;color:#555;">Item</th>
            <th style="padding:8px 6px;text-align:center;font-size:12px;color:#555;">Qty</th>
            <th style="padding:8px 6px;text-align:right;font-size:12px;color:#555;">Amount</th>
          </tr></thead>
          <tbody>${itemRows}</tbody>
          <tfoot><tr style="border-top:2px solid #0f1f5c;">
            <td colspan="2" style="padding:10px 6px;font-weight:bold;color:#0f1f5c;">TOTAL PAID</td>
            <td style="padding:10px 6px;text-align:right;font-weight:bold;color:#0f1f5c;font-size:16px;">${total}</td>
          </tr></tfoot>
        </table>
        <div style="margin-top:16px;padding:16px;background:#eff6ff;border-radius:8px;">
          <p style="margin:0;font-size:13px;color:#1e40af;"><strong>📦 Delivery Address:</strong> ${metadata.address || '—'}</p>
          ${metadata.delivery_notes ? `<p style="margin:8px 0 0;font-size:13px;color:#1e40af;"><strong>📝 Notes:</strong> ${metadata.delivery_notes}</p>` : ''}
        </div>
        <p style="font-size:13px;color:#555;margin-top:20px;">Questions? Call us at <strong>0917 823 7205</strong> or email <strong>gocleanair@gmail.com</strong></p>
        <div style="margin-top:16px;border-top:1px solid #e5e7eb;padding-top:12px;font-size:12px;color:#999;text-align:center;">
          GoClean Aircon Supplies & Services · Binan, Laguna · gocleanair.co
        </div>
      </div>`;

    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'GoClean Aircon <onboarding@resend.dev>',
        to: [customer.email],
        subject: `Order Confirmed — GoClean Aircon (${total})`,
        html: customerHtml,
      }),
    });
  }
}

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const sigHeader = request.headers.get('paymongo-signature') ?? '';

    // Verify signature if webhook secret is set
    const webhookSecret = process.env.PAYMONGO_WEBHOOK_SECRET;
    if (webhookSecret && sigHeader) {
      const parts = Object.fromEntries(sigHeader.split(',').map((p) => p.split('=')));
      const expected = createHmac('sha256', webhookSecret)
        .update(`${parts['t']}.${rawBody}`)
        .digest('hex');
      if (expected !== parts['v1']) {
        return Response.json({ error: 'Invalid signature' }, { status: 401 });
      }
    }

    const event = JSON.parse(rawBody);
    const eventType = event?.data?.attributes?.type;

    if (eventType === 'checkout_session.payment.paid') {
      const session = event.data.attributes.data;
      const attrs = session.attributes;
      const billing = attrs.billing ?? {};
      const lineItems = attrs.line_items ?? [];
      const metadata = attrs.metadata ?? {};

      await sendEmails(billing, lineItems, metadata, attrs.amount ?? 0);

      // Save order to database
      try {
        const user = billing.email
          ? await prisma.user.findUnique({ where: { email: billing.email }, select: { id: true } })
          : null;

        await prisma.order.upsert({
          where: { sessionId: session.id },
          create: {
            sessionId: session.id,
            userId: user?.id ?? null,
            customerName: billing.name ?? '',
            customerEmail: billing.email ?? '',
            customerPhone: billing.phone ?? '',
            address: metadata.address ?? '',
            notes: metadata.delivery_notes ?? '',
            items: lineItems,
            total: (attrs.amount ?? 0) / 100,
            status: 'paid',
          },
          update: {},
        });

        if (metadata.coupon_code) {
          await prisma.coupon.updateMany({
            where: { code: metadata.coupon_code },
            data: { usedCount: { increment: 1 } },
          });
        }
      } catch (dbErr) {
        console.error('Order save error:', dbErr);
      }
    }

    return Response.json({ received: true });
  } catch (e) {
    console.error('Webhook error:', e);
    return Response.json({ error: 'Webhook error' }, { status: 500 });
  }
}
