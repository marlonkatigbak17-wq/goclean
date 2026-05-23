import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  const now  = new Date();
  const due  = await prisma.socialPost.findMany({
    where: { status: 'scheduled', scheduledAt: { lte: now } },
  });

  const pageId = process.env.FB_PAGE_ID || '584565865053018';
  const token  = process.env.FB_PAGE_ACCESS_TOKEN;

  for (const post of due) {
    if (!token) {
      await prisma.socialPost.update({ where: { id: post.id }, data: { status: 'failed' } });
      continue;
    }

    try {
      const mediaUrls = (post.mediaUrls as string[]) || [];
      const fullCaption = `${post.caption}\n\n${post.hashtags}`.trim();

      let fbPostId: string | null = null;

      if (mediaUrls.length === 0) {
        const res = await fetch(`https://graph.facebook.com/v19.0/${pageId}/feed`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: fullCaption, access_token: token }),
        });
        const data = await res.json();
        fbPostId = data.id || null;
      } else if (mediaUrls.length === 1) {
        const isVideo = mediaUrls[0].match(/\.(mp4|mov|avi|webm)$/i);
        if (isVideo) {
          const res = await fetch(`https://graph.facebook.com/v19.0/${pageId}/videos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ file_url: mediaUrls[0], description: fullCaption, access_token: token }),
          });
          const data = await res.json();
          fbPostId = data.id || null;
        } else {
          const res = await fetch(`https://graph.facebook.com/v19.0/${pageId}/photos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: mediaUrls[0], message: fullCaption, access_token: token }),
          });
          const data = await res.json();
          fbPostId = data.id || null;
        }
      } else {
        // Multiple photos
        const photoIds: string[] = [];
        for (const url of mediaUrls.filter(u => !u.match(/\.(mp4|mov|avi|webm)$/i))) {
          const res = await fetch(`https://graph.facebook.com/v19.0/${pageId}/photos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url, published: false, access_token: token }),
          });
          const data = await res.json();
          if (data.id) photoIds.push(data.id);
        }
        const feedRes = await fetch(`https://graph.facebook.com/v19.0/${pageId}/feed`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: fullCaption,
            attached_media: photoIds.map(id => ({ media_fbid: id })),
            access_token: token,
          }),
        });
        const feedData = await feedRes.json();
        fbPostId = feedData.id || null;
      }

      await prisma.socialPost.update({
        where: { id: post.id },
        data: { status: fbPostId ? 'published' : 'failed', publishedAt: fbPostId ? now : null, fbPostId },
      });
    } catch {
      await prisma.socialPost.update({ where: { id: post.id }, data: { status: 'failed' } });
    }
  }

  return Response.json({ processed: due.length });
}
