import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/adminAuth';
import { sendBulkSms } from '@/lib/sms';

export const dynamic = 'force-dynamic';

// GET — return recipient counts per group
export async function GET() {
  if (!await requireAdmin()) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const now = new Date();
  const sixMonthsAgo = new Date(now); sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  const in30Days = new Date(now); in30Days.setDate(in30Days.getDate() + 30);

  const [allCustomers, maintenanceDue, warrantyExpiring, allLeads] = await Promise.all([
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
    prisma.lead.count({ where: { phone: { not: '' } } }),
  ]);

  return Response.json({ allCustomers, maintenanceDue, warrantyExpiring, allLeads });
}

// POST — send the blast
export async function POST(request: Request) {
  if (!await requireAdmin()) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { group, message, customNumbers } = await request.json();
  if (!message?.trim()) return Response.json({ error: 'Message is required' }, { status: 400 });

  const now = new Date();
  const sixMonthsAgo = new Date(now); sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  const in30Days = new Date(now); in30Days.setDate(in30Days.getDate() + 30);

  let numbers: string[] = [];

  if (group === 'custom') {
    numbers = (customNumbers as string)
      .split(/[\n,;]+/)
      .map((n: string) => n.trim())
      .filter(Boolean);
  } else if (group === 'all_customers') {
    const users = await prisma.user.findMany({ where: { phone: { not: '' } }, select: { phone: true } });
    numbers = users.map(u => u.phone);
  } else if (group === 'maintenance_due') {
    const users = await prisma.user.findMany({
      where: {
        phone: { not: '' },
        bookings: {
          none: { createdAt: { gte: sixMonthsAgo } },
          some: { createdAt: { lt: sixMonthsAgo } },
        },
      },
      select: { phone: true },
    });
    numbers = users.map(u => u.phone);
  } else if (group === 'warranty_expiring') {
    const users = await prisma.user.findMany({
      where: { phone: { not: '' }, warrantyExpiry: { gte: now, lte: in30Days } },
      select: { phone: true },
    });
    numbers = users.map(u => u.phone);
  } else if (group === 'all_leads') {
    const leads = await prisma.lead.findMany({ where: { phone: { not: '' } }, select: { phone: true } });
    numbers = leads.map(l => l.phone);
  }

  if (!numbers.length) return Response.json({ error: 'No recipients found' }, { status: 400 });

  const result = await sendBulkSms(numbers, message.trim());
  return Response.json({ ...result, total: numbers.length });
}
