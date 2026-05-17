import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import { sendSms } from '@/lib/sms';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { name, phone, email, address, service, date, notes } = await request.json();

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      return Response.json({ error: 'Email not configured' }, { status: 500 });
    }

    // Save to DB — link to user if logged in
    const auth = await getAuthUser();
    try {
      await prisma.booking.create({
        data: {
          userId: auth?.userId ?? null,
          name, email, phone, address, service,
          preferredDate: date,
          notes: notes || '',
          status: 'pending',
        },
      });
    } catch (dbErr) {
      console.error('Booking save error:', dbErr);
    }

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f9f9f9;padding:24px;border-radius:8px;">
        <div style="background:#0f1f5c;padding:20px 24px;border-radius:8px 8px 0 0;margin:-24px -24px 24px;">
          <h1 style="color:white;margin:0;font-size:20px;">📋 New Booking Request</h1>
          <p style="color:#93c5fd;margin:4px 0 0;font-size:13px;">GoClean Aircon Supplies & Services</p>
        </div>
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <tr><td style="padding:8px 0;color:#555;width:140px;">👤 Name</td><td style="padding:8px 0;font-weight:bold;color:#111;">${name}</td></tr>
          <tr><td style="padding:8px 0;color:#555;">📞 Phone</td><td style="padding:8px 0;font-weight:bold;color:#111;">${phone}</td></tr>
          <tr><td style="padding:8px 0;color:#555;">✉️ Email</td><td style="padding:8px 0;color:#111;">${email || '—'}</td></tr>
          <tr><td style="padding:8px 0;color:#555;">📍 Address</td><td style="padding:8px 0;color:#111;">${address}</td></tr>
          <tr><td style="padding:8px 0;color:#555;">🔧 Service</td><td style="padding:8px 0;font-weight:bold;color:#0f1f5c;">${service}</td></tr>
          <tr><td style="padding:8px 0;color:#555;">📅 Date</td><td style="padding:8px 0;font-weight:bold;color:#0f1f5c;">${date}</td></tr>
          <tr><td style="padding:8px 0;color:#555;">📝 Notes</td><td style="padding:8px 0;color:#111;">${notes || '—'}</td></tr>
        </table>
        <div style="margin-top:24px;padding-top:16px;border-top:1px solid #e5e7eb;font-size:12px;color:#999;text-align:center;">
          Sent from gocleanair.co booking form
        </div>
      </div>
    `;

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'GoClean Bookings <onboarding@resend.dev>',
        to: ['gocleanair@gmail.com', 'gocleanair3@gmail.com'],
        subject: `New Booking: ${service} — ${name} (${date})`,
        html,
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      console.error('Resend error:', err);
      return Response.json({ error: 'Failed to send email' }, { status: 500 });
    }

    // Confirmation email to customer
    if (email) {
      const confirmHtml = `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f9f9f9;padding:24px;border-radius:8px;">
          <div style="background:#0f1f5c;padding:20px 24px;border-radius:8px 8px 0 0;margin:-24px -24px 24px;">
            <h1 style="color:white;margin:0;font-size:20px;">📋 Booking Received!</h1>
            <p style="color:#93c5fd;margin:4px 0 0;font-size:13px;">GoClean Aircon Supplies & Services</p>
          </div>
          <p style="font-size:15px;color:#111;">Hi <strong>${name}</strong>,</p>
          <p style="font-size:14px;color:#555;">We received your booking request! Our team will contact you within 24 hours to confirm the schedule.</p>
          <div style="background:#eff6ff;border-radius:8px;padding:16px;margin:16px 0;">
            <p style="margin:0;font-size:13px;color:#1e40af;"><strong>Service:</strong> ${service}</p>
            <p style="margin:6px 0 0;font-size:13px;color:#1e40af;"><strong>Preferred Date:</strong> ${date}</p>
            <p style="margin:6px 0 0;font-size:13px;color:#1e40af;"><strong>Address:</strong> ${address}</p>
            ${notes ? `<p style="margin:6px 0 0;font-size:13px;color:#1e40af;"><strong>Notes:</strong> ${notes}</p>` : ''}
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
          to: [email],
          subject: `Booking Received — ${service} on ${date}`,
          html: confirmHtml,
        }),
      }).catch((e) => console.error('Confirmation email error:', e));
    }

    if (phone) {
      await sendSms(phone, `Hi ${name}, your GoClean booking for ${service} on ${date} has been received! We'll confirm within 24hrs. Call 0917 823 7205 for questions. - GoClean Aircon`);
    }

    return Response.json({ success: true });
  } catch (e) {
    console.error('Booking API error:', e);
    return Response.json({ error: 'Server error' }, { status: 500 });
  }
}
