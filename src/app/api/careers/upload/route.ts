import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const type = formData.get('type') as string | null; // 'resume' or 'cert'

    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

    const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp',
      'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowed.includes(file.type))
      return NextResponse.json({ error: 'Invalid file type. PDF, Word, or image only.' }, { status: 400 });

    const maxMb = 5;
    if (file.size > maxMb * 1024 * 1024)
      return NextResponse.json({ error: `File too large (max ${maxMb}MB)` }, { status: 400 });

    const prefix = type === 'cert' ? 'careers/certs' : 'careers/resumes';
    const ext = file.name.split('.').pop();
    const filename = `${prefix}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const blob = await put(filename, file, { access: 'public' });

    return NextResponse.json({ url: blob.url });
  } catch (e) {
    console.error('Upload error:', e);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
