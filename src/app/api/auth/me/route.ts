import { getAuthUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  const auth = await getAuthUser();
  if (!auth) return Response.json({ user: null });

  const user = await prisma.user.findUnique({
    where: { id: auth.userId },
    select: { id: true, name: true, email: true, phone: true, createdAt: true },
  });

  return Response.json({ user: user ?? null });
}
