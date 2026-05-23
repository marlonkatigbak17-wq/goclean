import { requireAdmin } from '@/lib/adminAuth';
import { put } from '@vercel/blob';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  if (!await requireAdmin()) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const formData = await request.formData();
  const caption  = formData.get('caption') as string;

  // Collect all uploaded images
  const imageEntries = [...formData.entries()].filter(([k]) => k.startsWith('image'));
  const images = imageEntries.map(([, v]) => v as File).filter(f => f.size > 0);

  const pageId = process.env.FB_PAGE_ID || '584565865053018';
  const token  = process.env.FB_PAGE_ACCESS_TOKEN;

  if (!token)        return Response.json({ error: 'Facebook page token not configured' }, { status: 500 });
  if (!caption?.trim()) return Response.json({ error: 'Caption is required' }, { status: 400 });

  try {
    if (images.length === 0) {
      // Text-only post
      const fbRes = await fetch(`https://graph.facebook.com/v19.0/${pageId}/feed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: caption, access_token: token }),
      });
      const result = await fbRes.json();
      if (result.error) return Response.json({ error: result.error.message }, { status: 400 });
      return Response.json({ success: true, postId: result.id });
    }

    if (images.length === 1) {
      // Single photo post
      const blob = await put(`social/${Date.now()}-${images[0].name}`, images[0], { access: 'public' });
      const fbRes = await fetch(`https://graph.facebook.com/v19.0/${pageId}/photos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: blob.url, message: caption, access_token: token }),
      });
      const result = await fbRes.json();
      if (result.error) return Response.json({ error: result.error.message }, { status: 400 });
      return Response.json({ success: true, postId: result.id });
    }

    // Multiple photos — upload each as unpublished, then create one post
    const photoIds: string[] = [];

    for (const image of images) {
      const blob = await put(`social/${Date.now()}-${image.name}`, image, { access: 'public' });
      const fbRes = await fetch(`https://graph.facebook.com/v19.0/${pageId}/photos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: blob.url, published: false, access_token: token }),
      });
      const result = await fbRes.json();
      if (result.error) return Response.json({ error: result.error.message }, { status: 400 });
      photoIds.push(result.id);
    }

    // Create the multi-photo post
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
