import fs from 'fs';
import path from 'path';

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

  const filename = `${slug}.${ext}`;

  // Use Vercel Blob in production
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    // @ts-ignore — installed after npm install
    const { put } = await import('@vercel/blob');
    const blob = await put(`products/${filename}`, file, { access: 'public' });
    return Response.json({ url: blob.url });
  }

  // Local development fallback — save to public/images/products/
  const buffer = Buffer.from(await file.arrayBuffer());
  const dir = path.join(process.cwd(), 'public', 'images', 'products');
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, filename), buffer);
  return Response.json({ url: `/images/products/${filename}` });
}
