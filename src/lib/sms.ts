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
  const payload = { apikey: apiKey, number, message };
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

// Send to up to 1,000 numbers in a single Semaphore API call (their recommended bulk method).
// Returns how many were accepted and the first error if any.
export async function sendSmsBatch(
  numbers: string[],   // already normalized (639XXXXXXXXX)
  message: string,
): Promise<{ ok: boolean; count: number; error?: string }> {
  const apiKey = process.env.SEMAPHORE_API_KEY;
  if (!apiKey) return { ok: false, count: 0, error: 'SEMAPHORE_API_KEY not set' };
  if (!numbers.length) return { ok: false, count: 0, error: 'No numbers' };

  const result = await callSemaphore(apiKey, numbers.join(','), message);
  return result.ok
    ? { ok: true, count: numbers.length }
    : { ok: false, count: 0, error: result.error };
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

  const BATCH = 1000;
  let sent = 0;
  let failed = numbers.length - clean.length; // count invalid ones as failed
  let sampleError: string | undefined;

  for (let i = 0; i < clean.length; i += BATCH) {
    const batch  = clean.slice(i, i + BATCH);
    const result = await sendSmsBatch(batch, message);
    if (result.ok) {
      sent += result.count;
    } else {
      failed += batch.length;
      if (!sampleError) sampleError = result.error;
    }
  }

  return { sent, failed, ...(sampleError ? { sampleError } : {}) };
}
