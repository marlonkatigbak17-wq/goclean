import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email')?.toLowerCase().trim();
  const ref = searchParams.get('ref')?.toUpperCase().trim();

  if (!email) return Response.json({ error: 'Email required' }, { status: 400 });

  const orders = await prisma.order.findMany({
    where: { customerEmail: { equals: email, mode: 'insensitive' } },
    orderBy: { createdAt: 'desc' },
    take: 10,
    select: {
      id: true,
      customerName: true,
      items: true,
      total: true,
      status: true,
      address: true,
      notes: true,
      createdAt: true,
    },
  });

  const filtered = ref
    ? orders.filter((o) => o.id.slice(-8).toUpperCase() === ref)
    : orders;

  return Response.json({ orders: filtered });
}
