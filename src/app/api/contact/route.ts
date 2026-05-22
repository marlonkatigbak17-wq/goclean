import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { name, phone, email, subject, message } = await request.json();
    if (!name?.trim() || !message?.trim()) {
      return Response.json({ error: 'Name and message are required' }, { status: 400 });
    }

    await prisma.lead.create({
      data: {
        name: name.trim(),
        phone: phone?.trim() || '',
        email: email?.trim() || '',
        source: 'contact_form',
        service: subject || 'Service Inquiry',
        notes: message.trim(),
        status: 'new',
      },
    });

    return Response.json({ success: true });
  } catch (e) {
    console.error('Contact form error:', e);
    return Response.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
