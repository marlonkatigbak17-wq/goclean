import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/adminAuth';
import { sendSms, normalizePhone } from '@/lib/sms';

export const dynamic    = 'force-dynamic';
export const maxDuration = 300; // allow up to 5 min for large blasts (Vercel Pro)

// GET — return recipient counts per group
export async function GET() {
  if (!await requireAdmin()) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const now = new Date();
  const sixMonthsAgo = new Date(now); sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  const in30Days = new Date(now); in30Days.setDate(in30Days.getDate() + 30);

  const [allCustomers, maintenanceDue, warrantyExpiring, allLeads, importedContacts] = await Promise.all([
    prisma.user.count({ where: { phone: { not: '' } } }),
    prisma.user.count({
      where: {
        phone: { not: '' },
        bookings: {
          none: { createdAt: { gte: sixMonthsAgo } },
          some: { createdAt: { lt: sixMonthsAgo } },
        },
      },
    }),
    prisma.user.count({
      where: { phone: { not: '' }, warrantyExpiry: { gte: now, lte: in30Days } },
    }),
    prisma.lead.count({ where: { phone: { not: '' }, source: { not: 'imported' } } }),
    prisma.lead.count({ where: { phone: { not: '' }, source: 'imported' } }),
  ]);

  return Response.json({ allCustomers, maintenanceDue, warrantyExpiring, allLeads, importedContacts });
}

// POST — stream progress: one SMS at a time, newline-delimited JSON
export async function POST(request: Request) {
  if (!await requireAdmin()) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { group, message, customNumbers } = await request.json();
  if (!message?.trim()) return Response.json({ error: 'Message is required' }, { status: 400 });

  const now = new Date();
  const sixMonthsAgo = new Date(now); sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  const in30Days = new Date(now); in30Days.setDate(in30Days.getDate() + 30);

  let rawNumbers: string[] = [];

  if (group === 'custom') {
    rawNumbers = (customNumbers as string).split(/[\n,;]+/).map((n: string) => n.trim()).filter(Boolean);
  } else if (group === 'all_customers') {
    const users = await prisma.user.findMany({ where: { phone: { not: '' } }, select: { phone: true } });
    rawNumbers = users.map(u => u.phone);
  } else if (group === 'maintenance_due') {
    const users = await prisma.user.findMany({
      where: {
        phone: { not: '' },
        bookings: { none: { createdAt: { gte: sixMonthsAgo } }, some: { createdAt: { lt: sixMonthsAgo } } },
      },
      select: { phone: true },
    });
    rawNumbers = users.map(u => u.phone);
  } else if (group === 'warranty_expiring') {
    const users = await prisma.user.findMany({
      where: { phone: { not: '' }, warrantyExpiry: { gte: now, lte: in30Days } },
      select: { phone: true },
    });
    rawNumbers = users.map(u => u.phone);
  } else if (group === 'all_leads') {
    const leads = await prisma.lead.findMany({ where: { phone: { not: '' }, source: { not: 'imported' } }, select: { phone: true } });
    rawNumbers = leads.map(l => l.phone);
  } else if (group === 'imported_contacts') {
    const leads = await prisma.lead.findMany({ where: { phone: { not: '' }, source: 'imported' }, select: { phone: true } });
    rawNumbers = leads.map(l => l.phone);
  }

  if (!rawNumbers.length) return Response.json({ error: 'No recipients found' }, { status: 400 });

  // Filter to valid numbers up front so total count is accurate
  const numbers = rawNumbers.map(n => normalizePhone(n) ?? n).filter(n => normalizePhone(n) !== null || true);
  // (keep raw for display; sendSms normalizes internally)

  const enc = new TextEncoder();
  const push = (obj: object) => enc.encode(JSON.stringify(obj) + '\n');

  const stream = new ReadableStream({
    async start(controller) {
      let sent   = 0;
      let failed = 0;
      const total = rawNumbers.length;

      for (let i = 0; i < total; i++) {
        const number = rawNumbers[i];
        const result = await sendSms(number, message.trim(), { skipSenderName: true });

        if (result.ok) {
          sent++;
        } else {
          failed++;
        }

        controller.enqueue(push({
          i: i + 1,
          total,
          number,
          ok: result.ok,
          ...(result.error ? { error: result.error } : {}),
          sent,
          failed,
        }));

        // 5 s between sends to stay well under Semaphore's rate limit
        if (i < total - 1) await new Promise(r => setTimeout(r, 5000));
      }

      controller.enqueue(push({ done: true, sent, failed, total }));
      controller.close();
    },
  });

  return new Response(stream, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'X-Content-Type-Options': 'nosniff' },
  });
}
