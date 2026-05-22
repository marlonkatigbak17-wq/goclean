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

export async function GET() {
  const techId = await getTechId();
  if (!techId) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const jobs = await prisma.booking.findMany({
    where: { technicianId: techId },
    orderBy: { preferredDate: 'asc' },
  });
  return Response.json(jobs);
}
