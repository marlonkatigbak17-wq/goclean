import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!await requireAdmin()) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const apps = await prisma.jobApplication.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return Response.json(apps);
}
