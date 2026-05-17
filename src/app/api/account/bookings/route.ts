import { getAuthUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  const auth = await getAuthUser();
  if (!auth) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const bookings = await prisma.booking.findMany({
    where: { userId: auth.userId },
    orderBy: { createdAt: 'desc' },
  });

  return Response.json({ bookings });
}
