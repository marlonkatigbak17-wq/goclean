import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireAdmin()) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      address: true,
      bookings: { orderBy: { createdAt: 'desc' }, select: { id: true, service: true, status: true, preferredDate: true, createdAt: true } },
      orders: { orderBy: { createdAt: 'desc' }, select: { id: true, total: true, status: true, createdAt: true } },
    },
  });
  if (!user) return Response.json({ error: 'Not found' }, { status: 404 });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password: _, ...safe } = user as typeof user & { password: string };
  return Response.json(safe);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireAdmin()) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  try {
    await prisma.user.delete({ where: { id } });
    return Response.json({ success: true });
  } catch {
    return Response.json({ error: 'Failed to delete customer' }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireAdmin()) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const { unitModel, installationDate, warrantyExpiry, notes } = await req.json();

  const data: Record<string, unknown> = {};
  if (unitModel !== undefined) data.unitModel = unitModel;
  if (notes !== undefined) data.notes = notes;
  if (installationDate !== undefined) data.installationDate = installationDate ? new Date(installationDate) : null;
  if (warrantyExpiry !== undefined) data.warrantyExpiry = warrantyExpiry ? new Date(warrantyExpiry) : null;

  try {
    const updated = await prisma.user.update({ where: { id }, data });
    return Response.json(updated);
  } catch {
    return Response.json({ error: 'Failed to update customer' }, { status: 500 });
  }
}
