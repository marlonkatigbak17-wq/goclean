import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/adminAuth';
import { sendSms } from '@/lib/sms';

export const dynamic = 'force-dynamic';

const statusMessages: Record<string, { subject: string; heading: string; body: string; color: string }> = {
  processing: {
    subject: 'Your GoClean Order is Being Processed',
    heading: '📦 Order Confirmed & Processing',
    body: 'Great news! Your order has been confirmed and is now being processed. Our team will contact you within 24 hours to arrange delivery.',
    color: '#1d4ed8',
  },
  delivered: {
    subject: 'Your GoClean Order has been Delivered!',
    heading: '✅ Order Delivered',
    body: 'Your order has been delivered! We hope you are happy with your purchase. Thank you for choosing GoClean Aircon.',
    color: '#15803d',
  },
};

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireAdmin()) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const body = await request.json();
  const { status, adminNotes } = body;

  const order = await prisma.order.update({
    where: { id },
    data: {
      ...(status !== undefined && { status }),
      ...(adminNotes !== undefined && { adminNotes }),
    },
  });

  if (adminNotes !== undefined) return Response.json({ order });

  // Send status email to customer
  const template = statusMessages[status];
  if (template && order.customerEmail) {
    const apiKey = process.env.RESEND_API_KEY!;
    const html = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f9f9f9;padding:24px;border-radius:8px;">
        <div style="background:#0f1f5c;padding:20px 24px;border-radius:8px 8px 0 0;margin:-24px -24px 24px;">
          <h1 style="color:white;margin:0;font-size:20px;">${template.heading}</h1>
          <p style="color:#93c5fd;margin:4px 0 0;font-size:13px;">GoClean Aircon Supplies & Services</p>
        </div>
        <p style="font-size:15px;color:#111;">Hi <strong>${order.customerName}</strong>,</p>
        <p style="font-size:14px;color:#555;">${template.body}</p>
        <div style="background:#eff6ff;border-radius:8px;padding:16px;margin:16px 0;">
          <p style="margin:0;font-size:13px;color:#1e40af;"><strong>Order Reference:</strong> #${order.id.slice(-8).toUpperCase()}</p>
          <p style="margin:6px 0 0;font-size:13px;color:#1e40af;"><strong>Total Paid:</strong> ₱${order.total.toLocaleString()}</p>
          <p style="margin:6px 0 0;font-size:13px;color:#1e40af;"><strong>Delivery Address:</strong> ${order.address}</p>
        </div>
        <p style="font-size:13px;color:#555;">Questions? Call us at <strong>0917 823 7205</strong> or email <strong>gocleanair@gmail.com</strong></p>
        <div style="border-top:1px solid #e5e7eb;padding-top:12px;margin-top:16px;font-size:12px;color:#999;text-align:center;">
          GoClean Aircon Supplies & Services · gocleanair.co
        </div>
      </div>`;

    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'GoClean Aircon <onboarding@resend.dev>',
        to: [order.customerEmail],
        subject: template.subject,
        html,
      }),
    }).catch((e) => console.error('Status email error:', e));

    const smsMessages: Record<string, string> = {
      processing: `Hi ${order.customerName}, your GoClean order #${order.id.slice(-6).toUpperCase()} is being processed. We'll contact you shortly for delivery. - GoClean Aircon`,
      delivered: `Hi ${order.customerName}, your GoClean order #${order.id.slice(-6).toUpperCase()} has been delivered! Thank you for choosing us. - GoClean Aircon`,
    };
    if (smsMessages[status] && order.customerPhone) {
      await sendSms(order.customerPhone, smsMessages[status]);
    }
  }

  return Response.json({ order });
}
