import { requireAdmin } from '@/lib/adminAuth';
import { prisma } from '@/lib/prisma';
import { put } from '@vercel/blob';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  if (!await requireAdmin()) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const from = searchParams.get('from');
  const to   = searchParams.get('to');

  const posts = await prisma.socialPost.findMany({
    where: {
      scheduledAt: {
        gte: from ? new Date(from) : new Date(),
        lte: to   ? new Date(to)  : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    },
    orderBy: { scheduledAt: 'asc' },
  });

  return Response.json({ posts });
}

export async function POST(request: Request) {
  if (!await requireAdmin()) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const formData   = await request.formData();
  const caption    = formData.get('caption')    as string;
  const hashtags   = formData.get('hashtags')   as string;
  const postType   = formData.get('postType')   as string;
  const notes      = formData.get('notes')      as string;
  const scheduledAt = formData.get('scheduledAt') as string;

  if (!caption?.trim())    return Response.json({ error: 'Caption is required' }, { status: 400 });
  if (!scheduledAt)        return Response.json({ error: 'Scheduled time is required' }, { status: 400 });

  // Upload all media (images + videos) to Vercel Blob
  const mediaEntries = [...formData.entries()].filter(([k]) => k.startsWith('media'));
  const mediaUrls: string[] = [];

  for (const [, file] of mediaEntries) {
    const f = file as File;
    if (f.size > 0) {
      const blob = await put(`social/scheduled/${Date.now()}-${f.name}`, f, { access: 'public' });
      mediaUrls.push(blob.url);
    }
  }

  const post = await prisma.socialPost.create({
    data: {
      caption,
      hashtags: hashtags || '',
      mediaUrls,
      postType:   postType   || 'service',
      notes:      notes      || '',
      scheduledAt: new Date(scheduledAt),
      status: 'scheduled',
    },
  });

  return Response.json({ post });
}
