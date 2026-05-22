import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!await requireAdmin()) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const cutoff = new Date();
  cutoff.setMinutes(cutoff.getMinutes() - 10); // active within last 10 minutes

  const technicians = await prisma.technician.findMany({
    where: { active: true },
    select: {
      id: true,
      name: true,
      phone: true,
      lastLat: true,
      lastLng: true,
      lastSeen: true,
      bookings: {
        where: { status: { in: ['confirmed', 'pending'] } },
        orderBy: { createdAt: 'desc' },
        take: 1,
        select: { service: true, address: true, preferredDate: true },
      },
    },
  });

  return Response.json(technicians.map(t => ({
    ...t,
    isOnline: t.lastSeen ? t.lastSeen >= cutoff : false,
    currentJob: t.bookings[0] ?? null,
  })));
}
