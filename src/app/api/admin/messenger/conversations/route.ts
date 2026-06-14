import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

// GET — list all known messenger conversations
export async function GET() {
  if (!await requireAdmin()) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const convos = await prisma.messengerConversation.findMany({
    orderBy: { updatedAt: 'desc' },
  });
  return Response.json(convos);
}

// POST — pause or resume a conversation
// Body: { senderId, action: 'pause' | 'resume' }
export async function POST(request: NextRequest) {
  if (!await requireAdmin()) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const { senderId, action } = await request.json();
  if (!senderId || !action) {
    return Response.json({ error: 'Missing senderId or action' }, { status: 400 });
  }

  const paused = action === 'pause';

  const convo = await prisma.messengerConversation.upsert({
    where: { senderId },
    update: {
      paused,
      pausedAt: paused ? new Date() : null,
    },
    create: {
      senderId,
      paused,
      pausedAt: paused ? new Date() : null,
    },
  });

  return Response.json(convo);
}
