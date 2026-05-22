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

export async function POST(request: Request) {
  const techId = await getTechId();
  if (!techId) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { lat, lng } = await request.json();
  if (typeof lat !== 'number' || typeof lng !== 'number') {
    return Response.json({ error: 'Invalid coordinates' }, { status: 400 });
  }

  await prisma.technician.update({
    where: { id: techId },
    data: { lastLat: lat, lastLng: lng, lastSeen: new Date() },
  });

  return Response.json({ success: true });
}

// Clear location when technician stops sharing
export async function DELETE() {
  const techId = await getTechId();
  if (!techId) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  await prisma.technician.update({
    where: { id: techId },
    data: { lastLat: null, lastLng: null, lastSeen: null },
  });

  return Response.json({ success: true });
}
