import { requireAdmin } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  if (!await requireAdmin()) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const formData = await request.formData();
  const postType = formData.get('postType') as string;
  const notes    = formData.get('notes') as string;

  // Collect all uploaded media (images only for vision — videos described by notes)
  const imageEntries = [...formData.entries()].filter(([k]) => k.startsWith('media'));
  const images = imageEntries.map(([, v]) => v as File).filter(f => f.size > 0 && f.type.startsWith('image/'));

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return Response.json({ error: 'AI not configured' }, { status: 500 });

  const postTypeContext: Record<string, string> = {
    promo:          'a promotional post highlighting a special offer or discount',
    service:        'a service feature post showcasing our aircon cleaning or repair service',
    product:        'a product showcase post for an aircon unit we sell',
    tips:           'an educational tips post about aircon maintenance',
    'before-after': 'a before-and-after cleaning result post to show the quality of our work',
    announcement:   'a business announcement post',
  };

  const context = postTypeContext[postType] || 'a general business post';

  const contentBlocks: object[] = [];

  // Add all images as vision blocks
  for (const image of images) {
    const buffer    = await image.arrayBuffer();
    const base64    = Buffer.from(buffer).toString('base64');
    const mediaType = image.type as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp';
    contentBlocks.push({ type: 'image', source: { type: 'base64', media_type: mediaType, data: base64 } });
  }

  const imageNote = images.length > 1 ? `There are ${images.length} photos in this post.` : '';
  contentBlocks.push({
    type: 'text',
    text: `Write ${context} for our Facebook page${images.length > 0 ? ' based on these photos' : ''}. ${imageNote} ${notes ? `Additional context: ${notes}` : ''} Write in English only — engaging, warm, and professional. Include 5-8 relevant hashtags at the end. Format: caption only followed by hashtags, no extra labels.`.trim(),
  });

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 800,
      system: `You are the social media manager for GoClean Aircon Supplies and Services Co., an aircon cleaning and repair company based in Binan, Laguna, Philippines. Write all Facebook posts in English only — engaging, professional, and warm. Business info: Phone 0917 117 8605, Website gocleanair.co. Services: aircon cleaning (basic and chemical), installation, repair, freon charging, troubleshooting. Service areas: Binan, Santa Rosa, Cabuyao, Calamba, San Pedro, Los Banos and nearby Laguna areas.`,
      messages: [{ role: 'user', content: contentBlocks }],
    }),
  });

  if (!res.ok) return Response.json({ error: 'AI generation failed' }, { status: 500 });

  const data = await res.json();
  const full  = data.content?.[0]?.text || '';

  const hashtagIndex = full.search(/#\w/);
  const caption  = hashtagIndex > 0 ? full.slice(0, hashtagIndex).trim() : full.trim();
  const hashtags = hashtagIndex > 0 ? full.slice(hashtagIndex).trim() : '';

  return Response.json({ caption, hashtags, full });
}
