import { requireAdmin } from '@/lib/adminAuth';
import { prisma } from '@/lib/prisma';

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

  if (!caption?.trim())  return Response.json({ error: 'Caption is required' }, { status: 400 });
  if (!scheduledAt)      return Response.json({ error: 'Scheduled time is required' }, { status: 400 });

  const pageId = process.env.FB_PAGE_ID || '584565865053018';
  const token  = process.env.FB_PAGE_ACCESS_TOKEN;

  // Upload photos to Facebook as unpublished, store their IDs as "fbid:<id>"
  // Videos are stored as "video:<name>" placeholder (not supported for scheduling)
  const mediaEntries = [...formData.entries()].filter(([k]) => k.startsWith('media'));
  const mediaRefs: string[] = [];

  for (const [, file] of mediaEntries) {
    const f = file as File;
    if (f.size === 0) continue;

    if (f.type.startsWith('image/') && token) {
      const buffer = await f.arrayBuffer();
      const fb = new FormData();
      fb.append('source', new Blob([buffer], { type: f.type }), f.name);
      fb.append('published', 'false');
      fb.append('access_token', token);
      const res  = await fetch(`https://graph.facebook.com/v19.0/${pageId}/photos`, { method: 'POST', body: fb });
      if (!res.ok) continue;
      const data = await res.json();
      if (data.id) mediaRefs.push(`fbid:${data.id}`);
    }
    // Videos skipped for scheduling — too large and can't be pre-uploaded unpublished
  }

  const post = await prisma.socialPost.create({
    data: {
      caption,
      hashtags: hashtags || '',
      mediaUrls: mediaRefs,
      postType:   postType   || 'service',
      notes:      notes      || '',
      scheduledAt: new Date(scheduledAt),
      status: 'scheduled',
    },
  });

  return Response.json({ post });
}
