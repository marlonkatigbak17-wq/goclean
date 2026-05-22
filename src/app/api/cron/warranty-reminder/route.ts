import { prisma } from '@/lib/prisma';
import { sendSms } from '@/lib/sms';

export const dynamic = 'force-dynamic';

// Called by a cron job (e.g. Vercel Cron) — add to vercel.json:
// { "crons": [{ "path": "/api/cron/warranty-reminder", "schedule": "0 9 * * *" }] }
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const now = new Date();
  // Warranties expiring within the next 30 days
  const soon = new Date(now);
  soon.setDate(soon.getDate() + 30);

  const users = await prisma.user.findMany({
    where: {
      warrantyExpiry: { gte: now, lte: soon },
    },
    select: { name: true, phone: true, email: true, warrantyExpiry: true, unitModel: true },
  });

  // Customers due for maintenance (last booking > 6 months ago)
  const sixMonthsAgo = new Date(now);
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const maintenanceDue = await prisma.user.findMany({
    where: {
      bookings: {
        none: { createdAt: { gte: sixMonthsAgo } },
        some: { createdAt: { lt: sixMonthsAgo } },
      },
    },
    select: { name: true, phone: true, email: true },
  });

  const results = { warrantyReminders: 0, maintenanceReminders: 0, errors: [] as string[] };

  // Send warranty reminders via SMS
  for (const u of users) {
    if (!u.phone) continue;
    const expiry = u.warrantyExpiry!.toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric' });
    const msg = `Hi ${u.name}, your ${u.unitModel || 'aircon'} warranty expires on ${expiry}. Contact GoClean for renewal or service: 0917 823 7205`;
    try {
      await sendSms(u.phone, msg);
      results.warrantyReminders++;
    } catch (e) {
      results.errors.push(`SMS to ${u.phone}: ${e}`);
    }
  }

  // Send maintenance reminders via email
  const resendKey = process.env.RESEND_API_KEY;
  for (const u of maintenanceDue) {
    if (!u.email || !resendKey) continue;
    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'GoClean Aircon <onboarding@resend.dev>',
          to: [u.email],
          subject: 'Time for your Aircon Maintenance! 🌬️',
          html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
            <div style="background:#0f1f5c;padding:20px;border-radius:8px 8px 0 0;">
              <h1 style="color:white;margin:0;font-size:18px;">🌬️ Aircon Maintenance Reminder</h1>
              <p style="color:#93c5fd;margin:4px 0 0;font-size:13px;">GoClean Aircon Supplies & Services</p>
            </div>
            <div style="padding:24px;background:#f9f9f9;">
              <p style="font-size:15px;color:#111;">Hi <strong>${u.name}</strong>,</p>
              <p style="font-size:14px;color:#555;">It's been a while since your last aircon service! Regular cleaning keeps your unit running efficiently and extends its lifespan.</p>
              <div style="text-align:center;margin:24px 0;">
                <a href="https://gocleanair.co/book" style="background:#0f1f5c;color:white;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:14px;">Book a Service Now</a>
              </div>
              <p style="font-size:13px;color:#555;">Or call us at <strong>0917 823 7205</strong></p>
            </div>
          </div>`,
        }),
      });
      results.maintenanceReminders++;
    } catch (e) {
      results.errors.push(`Email to ${u.email}: ${e}`);
    }
  }

  return Response.json(results);
}
