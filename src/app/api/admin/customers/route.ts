import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!await requireAdmin()) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      createdAt: true,
      _count: { select: { orders: true, bookings: true } },
      orders: { select: { total: true } },
    },
  });

  const result = users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    phone: u.phone,
    createdAt: u.createdAt,
    orderCount: u._count.orders,
    bookingCount: u._count.bookings,
    totalSpent: u.orders.reduce((s, o) => s + o.total, 0),
  }));

  return Response.json({ customers: result });
}
