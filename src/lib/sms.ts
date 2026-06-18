export function normalizePhone(raw: string): string | null {
  const d = raw.replace(/\D/g, '');

  let bare = d;
  if (bare.startsWith('0639') && bare.length === 13) bare = bare.slice(1);
  if (bare.startsWith('63')   && bare.length === 12) bare = bare.slice(2);
  if (bare.startsWith('0')    && bare.length === 11) bare = bare.slice(1);

  if (bare.startsWith('9') && bare.length === 10) return '63' + bare;
  return null;
}

async function callSemaphore(
  apiKey: string,
  number: string,   // one number or comma-separated list
  message: string,
): Promise<{ ok: boolean; status: number; error?: string }> {
  // Build body manually so commas in `number` are NOT percent-encoded
  // (URLSearchParams encodes commas as %2C which Semaphore doesn't accept for bulk)
  const body = `apikey=${encodeURIComponent(apiKey)}&number=${number}&message=${encodeURIComponent(message)}`;
  try {
    const res  = await fetch('https://api.semaphore.co/api/v4/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });
    const resBody = await res.json().catch(() => null) as Record<string, unknown> | null;
    if (res.ok) return { ok: true, status: res.status };
    const err = (resBody?.message ?? resBody?.error ?? JSON.stringify(resBody) ?? `HTTP ${res.status}`) as string;
    return { ok: false, status: res.status, error: err };
  } catch (e) {
    return { ok: false, status: 0, error: String(e) };
  }
}

export async function sendSms(
  to: string,
  message: string,
): Promise<{ ok: boolean; error?: string }> {
  const apiKey = process.env.SEMAPHORE_API_KEY;
  if (!apiKey || !to) return { ok: false, error: 'Missing API key or recipient' };

  const number = normalizePhone(to);
  if (!number) return { ok: false, error: `Invalid phone number: ${to}` };

  const result = await callSemaphore(apiKey, number, message);
  return result.ok ? { ok: true } : { ok: false, error: result.error };
}

// Semaphore's single-call comma-separated bulk endpoint has proven unreliable for this
// account (it fails the whole batch even when every number is valid), so send one at a
// time with limited concurrency instead. Slower, but each send succeeds/fails on its own.
const CONCURRENCY = 5;

export async function sendSmsBatch(
  numbers: string[],   // already normalized (639XXXXXXXXX)
  message: string,
): Promise<{ sent: number; failed: number; error?: string }> {
  const apiKey = process.env.SEMAPHORE_API_KEY;
  if (!apiKey) return { sent: 0, failed: numbers.length, error: 'SEMAPHORE_API_KEY not set' };
  if (!numbers.length) return { sent: 0, failed: 0 };

  let sent = 0;
  let failed = 0;
  let error: string | undefined;

  for (let i = 0; i < numbers.length; i += CONCURRENCY) {
    const chunk   = numbers.slice(i, i + CONCURRENCY);
    const results = await Promise.all(chunk.map(n => callSemaphore(apiKey, n, message)));
    for (const r of results) {
      if (r.ok) sent++;
      else { failed++; if (!error) error = r.error; }
    }
  }

  return { sent, failed, ...(error ? { error } : {}) };
}

// Used by cron/reminder routes
export async function sendBulkSms(
  numbers: string[],
  message: string,
): Promise<{ sent: number; failed: number; sampleError?: string }> {
  const apiKey = process.env.SEMAPHORE_API_KEY;
  if (!apiKey) return { sent: 0, failed: numbers.length, sampleError: 'SEMAPHORE_API_KEY not set' };

  const clean = numbers.map(n => normalizePhone(n)).filter((n): n is string => n !== null);
  if (!clean.length) return { sent: 0, failed: numbers.length, sampleError: `All numbers invalid. Sample: "${numbers[0]}"` };

  const failed = numbers.length - clean.length; // count invalid ones as failed
  const result = await sendSmsBatch(clean, message);

  return {
    sent: result.sent,
    failed: failed + result.failed,
    ...(result.error ? { sampleError: result.error } : {}),
  };
}
