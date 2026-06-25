import { prisma } from '@/lib/prisma';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

async function getTechId(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('tech_auth')?.value;
    if (!token) return null;
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
    const { payload } = await jwtVerify(token, secret);
    return payload.techId as string;
  } catch { return null; }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const techId = await getTechId();
  if (!techId) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;

  const booking = await prisma.booking.findUnique({ where: { id } });
  if (!booking || booking.technicianId !== techId) return Response.json({ error: 'Not found' }, { status: 404 });

  const { status, photos, partsUsed, adminNotes, preWorkChecklist, installationChecklist } = await request.json();
  const data: Record<string, unknown> = {};
  if (status) data.status = status;
  if (photos) data.photos = photos;
  if (partsUsed) data.partsUsed = partsUsed;
  if (adminNotes) data.adminNotes = adminNotes;
  if (preWorkChecklist) data.preWorkChecklist = preWorkChecklist;
  if (installationChecklist) data.installationChecklist = installationChecklist;

  const updated = await prisma.booking.update({ where: { id }, data });
  return Response.json(updated);
}
