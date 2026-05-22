import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { message } = body;

    // Vapi sends tool-calls when the AI wants to invoke a function
    if (message?.type === 'tool-calls') {
      const toolCall = message.toolCallList?.[0];
      if (!toolCall) return Response.json({ results: [] });

      const { name, parameters } = toolCall.function;

      if (name === 'bookAppointment') {
        const { customerName, phone, address, service, preferredDate, notes } = parameters;

        if (!customerName || !phone || !service) {
          return Response.json({
            results: [{
              toolCallId: toolCall.id,
              result: 'I was unable to complete the booking — name, phone, and service are required. Could you please repeat those details?',
            }],
          });
        }

        // Create booking in database
        const booking = await prisma.booking.create({
          data: {
            name: customerName.trim(),
            email: '',
            phone: phone.trim(),
            address: address?.trim() || '',
            service: service.trim(),
            preferredDate: preferredDate?.trim() || 'To be confirmed',
            notes: notes?.trim() || 'Booked via AI phone call',
            status: 'pending',
          },
        });

        // Notify admin via email (fire and forget)
        const apiKey = process.env.RESEND_API_KEY;
        if (apiKey) {
          fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
              from: 'GoClean Bookings <onboarding@resend.dev>',
              to: ['gocleanair@gmail.com', 'gocleanair2@gmail.com'],
              subject: `New Booking (AI Call): ${service} — ${customerName}`,
              html: `<div style="font-family:Arial,sans-serif;max-width:600px;">
                <h2 style="color:#0f1f5c;">New Booking via AI Hotline</h2>
                <p><strong>Name:</strong> ${customerName}</p>
                <p><strong>Phone:</strong> ${phone}</p>
                <p><strong>Address:</strong> ${address || '—'}</p>
                <p><strong>Service:</strong> ${service}</p>
                <p><strong>Preferred Date:</strong> ${preferredDate || 'To be confirmed'}</p>
                <p><strong>Notes:</strong> ${notes || '—'}</p>
                <p><a href="https://gocleanair.co/admin/bookings">View in Admin Panel →</a></p>
              </div>`,
            }),
          }).catch(() => {});
        }

        return Response.json({
          results: [{
            toolCallId: toolCall.id,
            result: `Booking confirmed! I've scheduled a ${service} for ${customerName} on ${preferredDate || 'a date to be confirmed'}. Our team will call you at ${phone} to confirm the exact time. Your booking reference is ${booking.id.slice(-6).toUpperCase()}. Is there anything else I can help you with?`,
          }],
        });
      }

      return Response.json({
        results: [{
          toolCallId: toolCall.id,
          result: 'I was unable to process that request.',
        }],
      });
    }

    // Acknowledge other event types
    return Response.json({ received: true });
  } catch (e) {
    console.error('Vapi webhook error:', e);
    return Response.json({ error: 'Webhook error' }, { status: 500 });
  }
}
