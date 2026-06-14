import { requireAdmin } from '@/lib/adminAuth';
import { prisma } from '@/lib/prisma';
import { normalizePhone } from '@/lib/sms';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!await requireAdmin()) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const apiKey     = process.env.SEMAPHORE_API_KEY;
  const senderName = process.env.SEMAPHORE_SENDER_NAME;

  if (!apiKey) return Response.json({ error: 'SEMAPHORE_API_KEY is not set' }, { status: 500 });

  // 1. Balance check
  let balance: unknown = null;
  try {
    const r = await fetch(`https://api.semaphore.co/api/v4/account?apikey=${apiKey}`);
    balance = await r.json().catch(() => null);
  } catch (e) {
    balance = { error: String(e) };
  }

  // 2. Single test send — raw response for debugging
  const testNumber = '09171178605';
  const payload: Record<string, string> = {
    apikey: apiKey,
    number: testNumber.replace(/\D/g, '').replace(/^0/, '63'),
    message: 'GoClean SMS test — if you receive this, SMS is working!',
  };
  if (senderName) payload.sendername = senderName;

  let testRawStatus = 0;
  let testRawBody: unknown = null;
  try {
    const r = await fetch('https://api.semaphore.co/api/v4/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    testRawStatus = r.status;
    testRawBody   = await r.json().catch(() => null);
  } catch (e) {
    testRawBody = { fetchError: String(e) };
  }

  // 3. Sample phone numbers from DB — show raw + what normalizePhone does with them
  const sampleUsers = await prisma.user.findMany({
    where: { phone: { not: '' } },
    select: { phone: true },
    take: 10,
  });
  const phoneAudit = sampleUsers.map(u => ({
    raw: u.phone,
    normalized: normalizePhone(u.phone),
    valid: normalizePhone(u.phone) !== null,
  }));
  const allUsers  = await prisma.user.count({ where: { phone: { not: '' } } });
  const validCount = (await prisma.user.findMany({ where: { phone: { not: '' } }, select: { phone: true } }))
    .filter(u => normalizePhone(u.phone) !== null).length;

  return Response.json({
    config: {
      apiKeyPresent: true,
      apiKeyPreview: `${apiKey.slice(0, 6)}...`,
      senderName: senderName ?? '(not set)',
      payloadSent: payload,
    },
    balance,
    testSend: {
      httpStatus: testRawStatus,
      ok: testRawStatus >= 200 && testRawStatus < 300,
      body: testRawBody,
    },
    phoneAudit: {
      totalWithPhone: allUsers,
      validForSms: validCount,
      invalidCount: allUsers - validCount,
      sample: phoneAudit,
    },
  });
}
