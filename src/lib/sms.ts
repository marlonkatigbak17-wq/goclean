export function normalizePhone(raw: string): string | null {
  // Strip everything except digits
  const d = raw.replace(/\D/g, '');

  // Step down to bare 10-digit local number (9XXXXXXXXX)
  let bare = d;
  if (bare.startsWith('0639') && bare.length === 13) bare = bare.slice(1); // 0639... → 639...
  if (bare.startsWith('63')   && bare.length === 12) bare = bare.slice(2); // 639... → 9...
  if (bare.startsWith('0')    && bare.length === 11) bare = bare.slice(1); // 09... → 9...

  // Valid PH mobile: starts with 9, exactly 10 digits
  if (bare.startsWith('9') && bare.length === 10) return '63' + bare;
  return null;
}

async function callSemaphore(
  apiKey: string,
  number: string,
  message: string,
  senderName?: string,
): Promise<{ ok: boolean; status: number; error?: string }> {
  const payload: Record<string, string> = { apikey: apiKey, number, message };
  if (senderName) payload.sendername = senderName;
  try {
    const res  = await fetch('https://api.semaphore.co/api/v4/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const body = await res.json().catch(() => null) as Record<string, unknown> | null;
    if (res.ok) return { ok: true, status: res.status };
    const err = (body?.message ?? body?.error ?? JSON.stringify(body) ?? `HTTP ${res.status}`) as string;
    return { ok: false, status: res.status, error: err };
  } catch (e) {
    return { ok: false, status: 0, error: String(e) };
  }
}

// skipSenderName: set true after the first send confirms sender name is rejected,
// so we avoid wasting a request on every subsequent recipient.
export async function sendSms(
  to: string,
  message: string,
  opts: { skipSenderName?: boolean } = {},
): Promise<{ ok: boolean; error?: string }> {
  const apiKey = process.env.SEMAPHORE_API_KEY;
  if (!apiKey || !to) return { ok: false, error: 'Missing API key or recipient' };

  const number = normalizePhone(to);
  if (!number) return { ok: false, error: `Invalid phone number: ${to}` };

  const senderName = opts.skipSenderName ? undefined : (process.env.SEMAPHORE_SENDER_NAME || undefined);

  const result = await callSemaphore(apiKey, number, message, senderName);
  if (result.ok) return { ok: true };

  // If senderName was used and failed, retry once without it
  if (senderName) {
    console.warn('SMS failed with sendername, retrying without:', result.error);
    const retry = await callSemaphore(apiKey, number, message);
    if (retry.ok) return { ok: true };
    return { ok: false, error: retry.error };
  }

  return { ok: false, error: result.error };
}

// Used by cron/reminder routes — not the blast route
export async function sendBulkSms(
  numbers: string[],
  message: string,
): Promise<{ sent: number; failed: number; sampleError?: string }> {
  const apiKey = process.env.SEMAPHORE_API_KEY;
  if (!apiKey) return { sent: 0, failed: numbers.length, sampleError: 'SEMAPHORE_API_KEY not set' };

  const clean = numbers.map(n => normalizePhone(n)).filter((n): n is string => n !== null);
  if (!clean.length) return { sent: 0, failed: numbers.length, sampleError: `All numbers invalid. Sample: "${numbers[0]}"` };

  let sent = 0;
  let failed = 0;
  let sampleError: string | undefined;
  let skipSenderName = false;

  for (const n of clean) {
    const r = await sendSms(n, message, { skipSenderName });
    if (r.ok) {
      sent++;
    } else {
      failed++;
      if (!sampleError) sampleError = r.error;
      // If sender name caused the failure, skip it for all remaining
      if (!skipSenderName && process.env.SEMAPHORE_SENDER_NAME) skipSenderName = true;
    }
    await new Promise(res => setTimeout(res, 5000));
  }

  return { sent, failed, ...(sampleError ? { sampleError } : {}) };
}
