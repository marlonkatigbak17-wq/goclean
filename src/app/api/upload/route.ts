export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get('file') as File | null;
  const slug = formData.get('slug') as string | null;

  if (!file || !slug) {
    return Response.json({ error: 'Missing file or slug' }, { status: 400 });
  }

  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  if (!['jpg', 'jpeg', 'png', 'webp'].includes(ext)) {
    return Response.json({ error: 'Invalid file type' }, { status: 400 });
  }

  // Use Vercel Blob if configured
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const { put } = await import('@vercel/blob');
    const filename = `${slug}.${ext}`;
    const blob = await put(`products/${filename}`, file, { access: 'public' });
    return Response.json({ url: blob.url });
  }

  // Fallback: store as base64 data URL (works everywhere, no storage setup needed)
  const buffer = Buffer.from(await file.arrayBuffer());
  const mimeType = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';
  const base64 = buffer.toString('base64');
  const dataUrl = `data:${mimeType};base64,${base64}`;

  return Response.json({ url: dataUrl });
}
