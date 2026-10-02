import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { requireAdmin } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

// Used by the admin product editor and the technician job photo upload.
async function isTechnician(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('tech_auth')?.value;
    if (!token) return false;
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
    const { payload } = await jwtVerify(token, secret);
    return typeof payload.techId === 'string';
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  if (!(await requireAdmin()) && !(await isTechnician())) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get('file') as File | null;
  const slug = formData.get('slug') as string | null;

  if (!file || !slug) {
    return Response.json({ error: 'Missing file or slug' }, { status: 400 });
  }

  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  if (!['jpg', 'jpeg', 'png', 'webp'].includes(ext)) {
    return Response.json({ error: 'Only JPG, PNG, and WebP images are supported' }, { status: 400 });
  }

  if (file.size > 4 * 1024 * 1024) {
    return Response.json({ error: 'Image must be under 4MB' }, { status: 413 });
  }

  const filename = `${slug}.${ext}`;

  // Best: Vercel Blob — instant CDN upload, no deploy needed
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const { put } = await import('@vercel/blob');
      const blob = await put(`products/${filename}`, file, { access: 'public' });
      return Response.json({ url: blob.url });
    } catch (e) {
      return Response.json({ error: `Blob upload failed: ${String(e)}` }, { status: 500 });
    }
  }

  // Fallback: base64 data URL stored in DB (works but large)
  const buffer = Buffer.from(await file.arrayBuffer());
  const mimeType = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';
  const dataUrl = `data:${mimeType};base64,${buffer.toString('base64')}`;
  return Response.json({ url: dataUrl });
}
