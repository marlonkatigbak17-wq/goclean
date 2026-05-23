import { requireAdmin } from '@/lib/adminAuth';
import { put } from '@vercel/blob';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  if (!await requireAdmin()) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const formData = await request.formData();
  const caption  = formData.get('caption') as string;

  // Collect all media (images + videos)
  const mediaEntries = [...formData.entries()].filter(([k]) => k.startsWith('media'));
  const mediaFiles   = mediaEntries.map(([, v]) => v as File).filter(f => f.size > 0);

  const pageId = process.env.FB_PAGE_ID || '584565865053018';
  const token  = process.env.FB_PAGE_ACCESS_TOKEN;

  if (!token)            return Response.json({ error: 'Facebook page token not configured' }, { status: 500 });
  if (!caption?.trim())  return Response.json({ error: 'Caption is required' }, { status: 400 });

  const isVideo = (f: File) => f.type.startsWith('video/');

  try {
    if (mediaFiles.length === 0) {
      const fbRes = await fetch(`https://graph.facebook.com/v19.0/${pageId}/feed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: caption, access_token: token }),
      });
      const result = await fbRes.json();
      if (result.error) return Response.json({ error: result.error.message }, { status: 400 });
      return Response.json({ success: true, postId: result.id });
    }

    // Single video
    if (mediaFiles.length === 1 && isVideo(mediaFiles[0])) {
      const blob = await put(`social/${Date.now()}-${mediaFiles[0].name}`, mediaFiles[0], { access: 'public' });
      const fbRes = await fetch(`https://graph.facebook.com/v19.0/${pageId}/videos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ file_url: blob.url, description: caption, access_token: token }),
      });
      const result = await fbRes.json();
      if (result.error) return Response.json({ error: result.error.message }, { status: 400 });
      return Response.json({ success: true, postId: result.id });
    }

    // Single photo
    if (mediaFiles.length === 1) {
      const blob = await put(`social/${Date.now()}-${mediaFiles[0].name}`, mediaFiles[0], { access: 'public' });
      const fbRes = await fetch(`https://graph.facebook.com/v19.0/${pageId}/photos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: blob.url, message: caption, access_token: token }),
      });
      const result = await fbRes.json();
      if (result.error) return Response.json({ error: result.error.message }, { status: 400 });
      return Response.json({ success: true, postId: result.id });
    }

    // Multiple photos (videos mixed in are skipped for multi-photo post)
    const photoIds: string[] = [];
    for (const file of mediaFiles.filter(f => !isVideo(f))) {
      const blob = await put(`social/${Date.now()}-${file.name}`, file, { access: 'public' });
      const fbRes = await fetch(`https://graph.facebook.com/v19.0/${pageId}/photos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: blob.url, published: false, access_token: token }),
      });
      const result = await fbRes.json();
      if (result.error) return Response.json({ error: result.error.message }, { status: 400 });
      photoIds.push(result.id);
    }

    const feedRes = await fetch(`https://graph.facebook.com/v19.0/${pageId}/feed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: caption,
        attached_media: photoIds.map(id => ({ media_fbid: id })),
        access_token: token,
      }),
    });
    const feedResult = await feedRes.json();
    if (feedResult.error) return Response.json({ error: feedResult.error.message }, { status: 400 });
    return Response.json({ success: true, postId: feedResult.id });

  } catch {
    return Response.json({ error: 'Failed to publish to Facebook' }, { status: 500 });
  }
}
