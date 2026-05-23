import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

const VERIFY_TOKEN = process.env.FB_VERIFY_TOKEN || 'goclean_messenger_2026';

// In-memory conversation history (per sender, lasts while server is warm)
const conversations = new Map<string, { role: string; content: string }[]>();

const SYSTEM_PROMPT = `You are Aria, the friendly AI assistant for GoClean Aircon Supplies and Services Co. You respond via Facebook Messenger — keep replies short and conversational.

BUSINESS INFO:
- Address: Seaoil Compound Gen. Malvar St. Tubigan, Binan, Laguna
- Phone: 0917 117 8605 | Website: gocleanair.co
- Hours: Mon-Fri 8AM-6PM, Sat 8AM-5PM, Sun emergency only

SERVICE AREAS: Binan, Santa Rosa, Cabuyao, Calamba, San Pedro, Los Banos, Carmona, Dasmarinas, Alabang, Muntinlupa
Binan barangays: Tubigan, Canlalay, Sto. Tomas, Langkiwa, Malamig, Casile, Platero, San Antonio, San Vicente

EXACT RATES 2026:
CLEANING (includes free checkup):
- Window Type Basic: 1HP=P600, 1.5-2HP=P800
- Window Type Chemical: 1HP=P1,200, 1.5-2HP=P1,500
- Split Type Basic: 1HP=P1,200, 1.5-2HP=P1,500, 2.5-3HP=P2,000
- Split Type Chemical: 1HP=P1,800, 1.5-2HP=P2,200, 2.5-3HP=P2,800
- Inverter Chemical: 1HP=P2,200, 1.5-2HP=P2,500, 2.5-3HP=P3,200
- Cassette Type: 1.5-2HP=P4,500, 2.5-3HP=P5,500

OTHER SERVICES:
- Troubleshooting: 1HP=P500, 1.5-2HP=P500, 2.5-3HP=P1,000
- Leak Checking: 1HP=P1,200, 1.5-2HP=P1,500, 2.5-3HP=P2,000
- Freon Charging: 1HP=P3,500, 1.5-2HP=P4,500, 2.5-3HP=P6,000
- Installation: 1HP=P8,500, 1.5-2HP=P10,500, 2.5-3HP=P13,500

UNITS FOR SALE:
- Carrier Optima 1HP Split Inverter: P32,500
- Carrier Optima 1.5HP Split Inverter: P39,500
- Daikin D-Smart 1HP Inverter: P33,500
- Daikin D-Smart 1.5HP Inverter: P42,500
- LG Dual Inverter 1HP: P30,500
- Panasonic Deluxe 1.5HP: P41,500
- TCL Elite 1HP Inverter: P24,000

PAYMENT: Cash, GCash, Maya, BPI/BDO/UnionBank, Credit Card Installment, Home Credit/BillEase

WARRANTY: Cleaning=7 days, Installation=30 days, Freon=30 days, Compressor=6 months, New Units=manufacturer warranty

PROMOS:
- 3 Units Cleaning = Free 1 Basic Cleaning
- Free Check-Up in selected Laguna areas
- Free 10ft Pipe on selected installations
- 10% Discount for repeat customers

FAQs:
Q: Bakit hindi malamig? A: Dirty evaporator, low freon, leak, or capacitor problem. Troubleshooting muna.
Q: Need ba agad magpakarga ng freon? A: Hindi agad — leak checking muna bago mag-charge.
Q: Gaano kadalas magpalinis? A: Every 4-6 months para sa residential.

BOOKING: When a customer wants to book a service, collect their full name, phone number, complete address, service needed, and preferred date/time. Once you have ALL of these, respond with exactly this format on a new line:
BOOK:name=<name>|phone=<phone>|address=<address>|service=<service>|date=<date>

STYLE:
- Keep responses short and conversational (this is Messenger, not email)
- Warm, friendly, use "po" and "opo" naturally
- Taglish is welcome
- Never make up exact prices, give ranges only
- Business hours: Monday to Saturday 8AM-6PM`;

async function callClaude(messages: { role: string; content: string }[]): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return 'Sorry po, our AI assistant is temporarily unavailable. Please call us at 0917 117 8605. Thank you!';

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 500,
      system: SYSTEM_PROMPT,
      messages,
    }),
  });

  if (!res.ok) return 'Sorry po, I encountered an issue. Please call 0917 117 8605.';
  const data = await res.json();
  return data.content?.[0]?.text || 'Sorry po, please try again.';
}

async function sendMessage(recipientId: string, text: string) {
  const token = process.env.FB_PAGE_ACCESS_TOKEN;
  if (!token) return;

  await fetch(`https://graph.facebook.com/v19.0/me/messages?access_token=${token}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      recipient: { id: recipientId },
      message: { text },
    }),
  });
}

async function parseAndCreateBooking(text: string, senderId: string): Promise<boolean> {
  const match = text.match(/BOOK:(.+)/);
  if (!match) return false;

  try {
    const params: Record<string, string> = {};
    match[1].split('|').forEach(pair => {
      const [k, v] = pair.split('=');
      if (k && v) params[k.trim()] = v.trim();
    });

    if (!params.name || !params.phone || !params.service) return false;

    await prisma.booking.create({
      data: {
        name: params.name,
        email: '',
        phone: params.phone,
        address: params.address || '',
        service: params.service,
        preferredDate: params.date || 'To be confirmed',
        notes: 'Booked via Facebook Messenger',
        status: 'pending',
      },
    });

    // Notify admin
    const apiKey = process.env.RESEND_API_KEY;
    if (apiKey) {
      fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'GoClean Bookings <onboarding@resend.dev>',
          to: ['gocleanair@gmail.com', 'gocleanair2@gmail.com'],
          subject: `New Booking (Messenger): ${params.service} — ${params.name}`,
          html: `<div style="font-family:Arial,sans-serif;max-width:600px;">
            <h2 style="color:#0f1f5c;">New Booking via Facebook Messenger</h2>
            <p><strong>Name:</strong> ${params.name}</p>
            <p><strong>Phone:</strong> ${params.phone}</p>
            <p><strong>Address:</strong> ${params.address || '—'}</p>
            <p><strong>Service:</strong> ${params.service}</p>
            <p><strong>Preferred Date:</strong> ${params.date || 'To be confirmed'}</p>
            <p><a href="https://gocleanair.co/admin/bookings">View in Admin Panel →</a></p>
          </div>`,
        }),
      }).catch(() => {});
    }

    return true;
  } catch {
    return false;
  }
}

// GET — webhook verification
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    return new Response(challenge, { status: 200 });
  }
  return new Response('Forbidden', { status: 403 });
}

// POST — incoming messages
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (body.object !== 'page') return Response.json({ status: 'ok' });

    for (const entry of body.entry || []) {
      for (const event of entry.messaging || []) {
        if (!event.message?.text) continue;

        const senderId = event.sender.id;
        const userText = event.message.text;

        // Build conversation history
        const history = conversations.get(senderId) || [];
        history.push({ role: 'user', content: userText });

        // Keep last 10 messages
        if (history.length > 10) history.splice(0, history.length - 10);

        const aiResponse = await callClaude(history);

        // Check if AI wants to create a booking
        const booked = await parseAndCreateBooking(aiResponse, senderId);

        // Clean response (remove BOOK: line before sending to user)
        const cleanResponse = aiResponse.replace(/BOOK:[^\n]*/g, '').trim() ||
          `Booking confirmed po! Our team will call you at ${history.find(m => m.role === 'user')?.content || 'your number'} to confirm. Is there anything else I can help you with?`;

        history.push({ role: 'assistant', content: cleanResponse });
        conversations.set(senderId, history);

        await sendMessage(senderId, cleanResponse);
      }
    }

    return Response.json({ status: 'ok' });
  } catch (e) {
    console.error('Messenger webhook error:', e);
    return Response.json({ status: 'error' }, { status: 500 });
  }
}
