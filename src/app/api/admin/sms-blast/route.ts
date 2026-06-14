import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/adminAuth';
import { normalizePhone, sendSmsBatch } from '@/lib/sms';

export const dynamic    = 'force-dynamic';
export const maxDuration = 60;

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

// POST — stream batch progress (up to 1,000 numbers per Semaphore call)
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

  // Normalize up front — invalid numbers are counted as failed immediately
  const normalized = rawNumbers.map(n => normalizePhone(n)).filter((n): n is string => n !== null);
  const invalidCount = rawNumbers.length - normalized.length;

  if (!normalized.length) {
    return Response.json({ error: `All ${rawNumbers.length} phone numbers are in an unrecognized format.` }, { status: 400 });
  }

  const enc  = new TextEncoder();
  const push = (obj: object) => enc.encode(JSON.stringify(obj) + '\n');

  const BATCH = 1000;

  const stream = new ReadableStream({
    async start(controller) {
      let sent   = 0;
      let failed = invalidCount;
      const total = rawNumbers.length;
      let sampleError: string | undefined;

      for (let i = 0; i < normalized.length; i += BATCH) {
        const batch     = normalized.slice(i, i + BATCH);
        const batchEnd  = Math.min(i + BATCH, normalized.length);
        const result    = await sendSmsBatch(batch, message.trim());

        if (result.ok) {
          sent += result.count;
        } else {
          failed += batch.length;
          if (!sampleError) sampleError = result.error;
        }

        controller.enqueue(push({
          i: batchEnd + invalidCount,
          total,
          batchSize: batch.length,
          ok: result.ok,
          ...(result.error ? { error: result.error } : {}),
          sent,
          failed,
        }));
      }

      controller.enqueue(push({ done: true, sent, failed, total }));
      controller.close();
    },
  });

  return new Response(stream, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'X-Content-Type-Options': 'nosniff' },
  });
}
