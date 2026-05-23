import { requireAdmin } from '@/lib/adminAuth';
import { put } from '@vercel/blob';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  if (!await requireAdmin()) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const formData = await request.formData();
  const image   = formData.get('image') as File | null;
  const caption = formData.get('caption') as string;

  const pageId = process.env.FB_PAGE_ID || '584565865053018';
  const token  = process.env.FB_PAGE_ACCESS_TOKEN;

  if (!token) return Response.json({ error: 'Facebook page token not configured' }, { status: 500 });
  if (!caption?.trim()) return Response.json({ error: 'Caption is required' }, { status: 400 });

  try {
    let fbRes: Response;

    if (image && image.size > 0) {
      const blob = await put(`social/${Date.now()}-${image.name}`, image, { access: 'public' });

      fbRes = await fetch(`https://graph.facebook.com/v19.0/${pageId}/photos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: blob.url, message: caption, access_token: token }),
      });
    } else {
      fbRes = await fetch(`https://graph.facebook.com/v19.0/${pageId}/feed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: caption, access_token: token }),
      });
    }

    const result = await fbRes.json();

    if (result.error) {
      return Response.json({ error: result.error.message }, { status: 400 });
    }

    return Response.json({ success: true, postId: result.id || result.post_id });
  } catch {
    return Response.json({ error: 'Failed to publish to Facebook' }, { status: 500 });
  }
}
