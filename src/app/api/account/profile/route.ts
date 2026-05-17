import { getAuthUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  const auth = await getAuthUser();
  if (!auth) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: auth.userId },
    select: { id: true, name: true, email: true, phone: true, createdAt: true },
  });

  return Response.json({ user });
}

export async function PUT(request: Request) {
  const auth = await getAuthUser();
  if (!auth) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { name, phone } = await request.json();

  const user = await prisma.user.update({
    where: { id: auth.userId },
    data: { ...(name ? { name } : {}), phone: phone ?? '' },
    select: { id: true, name: true, email: true, phone: true },
  });

  return Response.json({ user });
}
