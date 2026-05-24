import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

interface Message { role: 'user' | 'assistant'; content: string; }

export async function POST(request: Request) {
  const { messages, customerName, customerPhone, customerEmail, leadId } = await request.json();

  // Save lead on first message (leadId not yet set)
  let resolvedLeadId = leadId;
  if (!resolvedLeadId && customerName && customerPhone) {
    try {
      const lead = await prisma.lead.create({
        data: {
          name: customerName,
          phone: customerPhone,
          email: customerEmail || '',
          source: 'website-chat',
          status: 'new',
        },
      });
      resolvedLeadId = lead.id;
    } catch { /* ignore duplicate */ }
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return Response.json({ error: 'AI not configured' }, { status: 500 });

  const systemPrompt = `You are Christine, the friendly AI assistant of GoClean Aircon Supplies and Services Co. You are chatting on the GoClean website.

BUSINESS INFO:
- Company: GoClean Aircon Supplies and Services Co.
- Location: Seaoil Compound, Gen. Malvar, Brgy. Tubigan, Binan, Laguna
- Phone: 0917 117 8606 | Landline: 049 536 7220
- Email: gocleanair@gmail.com | Website: gocleanair.co
- Facebook: facebook.com/gocleanaircon

SERVICES & PRICES:
- Basic Aircon Cleaning: ₱500–₱800/unit
- Chemical Cleaning: ₱1,200–₱1,800/unit
- Chemical Overhaul: ₱2,500–₱3,500/unit
- Aircon Repair: ₱500 diagnostic + parts
- Aircon Installation: ₱2,500–₱4,500 depending on HP
- Freon Charging: ₱800–₱1,500

SERVICE AREAS: Binan, Santa Rosa, Cabuyao, Calamba, San Pedro, Los Banos, and nearby Laguna areas.

PAYMENT: Cash, GCash, Maya, BPI/BDO/UnionBank, Credit Card Installment, BillEase. No Home Credit.

BUSINESS HOURS: Monday to Saturday, 8AM–6PM.

CURRENT CUSTOMER: You are chatting with ${customerName}. Use their name naturally.

GOAL: Be warm, helpful, and guide every conversation toward booking a service or purchase. Ask questions to understand their needs.

BOOKING: When a customer wants to book, collect: service needed, address, preferred date/time. Tell them the team will contact them at ${customerPhone} to confirm the schedule.

COMMUNICATION STYLE:
- Detect language — if they write in Filipino/Tagalog, reply in Tagalog/Taglish. If English, reply in English.
- Use "po" and "opo" naturally
- Be warm and conversational, not robotic
- Keep replies concise — 2-4 sentences max per message
- Always end with a question to keep the conversation going
- If unsure about something: "Para sa exact details, maaari po kayong tumawag sa 0917 117 8606"`;

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 400,
      system: systemPrompt,
      messages: (messages as Message[]).map(m => ({ role: m.role, content: m.content })),
    }),
  });

  if (!res.ok) return Response.json({ error: 'AI error' }, { status: 500 });
  const data = await res.json();
  const reply = data.content?.[0]?.text || 'Sorry, I encountered an issue. Please try again.';

  return Response.json({ reply, leadId: resolvedLeadId });
}
