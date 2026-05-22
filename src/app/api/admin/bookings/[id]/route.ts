import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/adminAuth';
import { sendSms } from '@/lib/sms';

export const dynamic = 'force-dynamic';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireAdmin()) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const body = await request.json();
  const { status, adminNotes, technicianId, partsUsed } = body;

  const booking = await prisma.booking.update({
    where: { id },
    data: {
      ...(status !== undefined && { status }),
      ...(adminNotes !== undefined && { adminNotes }),
      ...(technicianId !== undefined && { technicianId: technicianId || null }),
      ...(partsUsed !== undefined && { partsUsed }),
    },
  });

  if (adminNotes !== undefined || technicianId !== undefined || partsUsed !== undefined) return Response.json({ booking });

  // Send status email to customer
  if (booking.email) {
    const apiKey = process.env.RESEND_API_KEY!;
    const messages: Record<string, { subject: string; heading: string; body: string }> = {
      confirmed: {
        subject: 'Your GoClean Booking is Confirmed!',
        heading: '📅 Booking Confirmed',
        body: `Your <strong>${booking.service}</strong> booking on <strong>${booking.preferredDate}</strong> has been confirmed! Our team will be there as scheduled. If you need to reschedule, please call us at 0917 823 7205.`,
      },
      completed: {
        subject: 'Service Completed — Thank you!',
        heading: '✅ Service Completed',
        body: `Your <strong>${booking.service}</strong> has been completed. Thank you for choosing GoClean Aircon! We hope you are satisfied with our service.`,
      },
    };

    const template = messages[status];
    if (template) {
      const html = `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f9f9f9;padding:24px;border-radius:8px;">
          <div style="background:#0f1f5c;padding:20px 24px;border-radius:8px 8px 0 0;margin:-24px -24px 24px;">
            <h1 style="color:white;margin:0;font-size:20px;">${template.heading}</h1>
            <p style="color:#93c5fd;margin:4px 0 0;font-size:13px;">GoClean Aircon Supplies & Services</p>
          </div>
          <p style="font-size:15px;color:#111;">Hi <strong>${booking.name}</strong>,</p>
          <p style="font-size:14px;color:#555;">${template.body}</p>
          <div style="background:#eff6ff;border-radius:8px;padding:16px;margin:16px 0;">
            <p style="margin:0;font-size:13px;color:#1e40af;"><strong>Service:</strong> ${booking.service}</p>
            <p style="margin:6px 0 0;font-size:13px;color:#1e40af;"><strong>Date:</strong> ${booking.preferredDate}</p>
            <p style="margin:6px 0 0;font-size:13px;color:#1e40af;"><strong>Address:</strong> ${booking.address}</p>
            ${booking.notes ? `<p style="margin:6px 0 0;font-size:13px;color:#1e40af;"><strong>Notes:</strong> ${booking.notes}</p>` : ''}
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
          to: [booking.email],
          subject: template.subject,
          html,
        }),
      }).catch((e) => console.error('Booking status email error:', e));

      const smsMessages: Record<string, string> = {
        confirmed: `Hi ${booking.name}, your GoClean booking for ${booking.service} on ${booking.preferredDate} is CONFIRMED! See you then. - GoClean Aircon`,
        completed: `Hi ${booking.name}, your ${booking.service} service is done! Thank you for choosing GoClean. - GoClean Aircon`,
      };
      if (smsMessages[status] && booking.phone) {
        await sendSms(booking.phone, smsMessages[status]);
      }
    }
  }

  return Response.json({ booking });
}
