import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!(await requireAdmin())) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const leads = await prisma.lead.findMany({ orderBy: { createdAt: 'desc' }, include: { quotations: true } });
  return Response.json(leads);
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const data = await request.json();
  if (!data.name || !data.phone) return Response.json({ error: 'Name and phone required' }, { status: 400 });
  const lead = await prisma.lead.create({ data });
  return Response.json(lead);
}
