import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireAdmin()) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  try {
    await prisma.transaction.delete({ where: { id } });
    return Response.json({ success: true });
  } catch {
    return Response.json({ error: 'Failed to delete' }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireAdmin()) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const body = await req.json();
  try {
    const tx = await prisma.transaction.update({
      where: { id },
      data: {
        ...(body.type        !== undefined && { type: body.type }),
        ...(body.category    !== undefined && { category: body.category }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.amount      !== undefined && { amount: Number(body.amount) }),
        ...(body.date        !== undefined && { date: new Date(body.date) }),
        ...(body.reference   !== undefined && { reference: body.reference || null }),
        ...(body.notes       !== undefined && { notes: body.notes }),
      },
    });
    return Response.json(tx);
  } catch {
    return Response.json({ error: 'Failed to update' }, { status: 500 });
  }
}
