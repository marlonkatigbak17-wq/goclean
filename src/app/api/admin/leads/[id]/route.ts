import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const body = await request.json();
  const allowed = ['name', 'email', 'phone', 'service', 'notes', 'status', 'source', 'address', 'city'];
  const data: Record<string, unknown> = { updatedAt: new Date() };
  for (const key of allowed) {
    if (key in body) data[key] = body[key];
  }
  try {
    const lead = await prisma.lead.update({ where: { id }, data });
    return Response.json(lead);
  } catch {
    return Response.json({ error: 'Failed to update lead' }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  try {
    await prisma.lead.delete({ where: { id } });
    return Response.json({ success: true });
  } catch {
    return Response.json({ error: 'Failed to delete lead' }, { status: 500 });
  }
}
