import { getAuthUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  const auth = await getAuthUser();
  if (!auth) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const address = await prisma.address.findUnique({ where: { userId: auth.userId } });
  return Response.json({ address });
}

export async function PUT(request: Request) {
  const auth = await getAuthUser();
  if (!auth) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { street, city, province } = await request.json();

  const address = await prisma.address.upsert({
    where: { userId: auth.userId },
    create: { userId: auth.userId, street: street || '', city: city || '', province: province || '' },
    update: { street: street || '', city: city || '', province: province || '' },
  });

  return Response.json({ address });
}
