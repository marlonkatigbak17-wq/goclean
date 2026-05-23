import { requireAdmin } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!await requireAdmin()) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const pageId = process.env.FB_PAGE_ID || '584565865053018';
  const token  = process.env.FB_PAGE_ACCESS_TOKEN;

  if (!token) return Response.json({ error: 'FB_PAGE_ACCESS_TOKEN is not set in environment variables.' });

  try {
    // Check token validity and permissions
    const debugRes = await fetch(
      `https://graph.facebook.com/v19.0/debug_token?input_token=${token}&access_token=${token}`
    );
    const debugData = await debugRes.json();

    // Check page info
    const pageRes = await fetch(
      `https://graph.facebook.com/v19.0/${pageId}?fields=id,name,access_token&access_token=${token}`
    );
    const pageData = await pageRes.json();

    // Try a test post (unpublished, immediately deleted)
    const testRes = await fetch(`https://graph.facebook.com/v19.0/${pageId}/feed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'GoClean test post — please ignore.',
        published: false,
        access_token: token,
      }),
    });
    const testData = await testRes.json();

    // Delete the test post if created
    if (testData.id) {
      await fetch(`https://graph.facebook.com/v19.0/${testData.id}?access_token=${token}`, {
        method: 'DELETE',
      });
    }

    return Response.json({
      tokenPresent: true,
      pageId,
      pageInfo:    pageData,
      tokenDebug:  debugData?.data || debugData,
      publishTest: testData.error ? { error: testData.error } : { success: true },
    });
  } catch (e) {
    return Response.json({ error: String(e) });
  }
}
