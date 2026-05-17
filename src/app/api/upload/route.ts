export const dynamic = 'force-dynamic';

const REPO = 'marlonkatigbak17-wq/goclean';

async function commitToGitHub(path: string, content: string, filename: string) {
  const token = process.env.GITHUB_PAT!;
  const apiUrl = `https://api.github.com/repos/${REPO}/contents/${path}`;

  // Get existing file SHA if it exists (needed for updates)
  let sha: string | undefined;
  const existing = await fetch(apiUrl, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (existing.ok) {
    const data = await existing.json();
    sha = data.sha;
  }

  const body: Record<string, unknown> = {
    message: `Upload product image: ${filename}`,
    content,
  };
  if (sha) body.sha = sha;

  const res = await fetch(apiUrl, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  return res.ok;
}

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
  const buffer = Buffer.from(await file.arrayBuffer());

  // Use Vercel Blob if configured
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const { put } = await import('@vercel/blob');
    const blob = await put(`products/${filename}`, file, { access: 'public' });
    return Response.json({ url: blob.url });
  }

  // Commit directly to GitHub repo → auto-deploys via GitHub Actions
  if (process.env.GITHUB_PAT) {
    const base64 = buffer.toString('base64');
    const path = `public/images/products/${filename}`;
    const ok = await commitToGitHub(path, base64, filename);
    if (ok) {
      return Response.json({ url: `/images/products/${filename}`, pending: true });
    }
  }

  // Fallback: base64 data URL stored in DB (works instantly, no deploy needed)
  const mimeType = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';
  const dataUrl = `data:${mimeType};base64,${buffer.toString('base64')}`;
  return Response.json({ url: dataUrl });
}
