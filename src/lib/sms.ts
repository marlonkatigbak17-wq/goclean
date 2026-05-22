export async function sendSms(to: string, message: string) {
  const apiKey = process.env.SEMAPHORE_API_KEY;
  if (!apiKey || !to) return;

  const number = to.replace(/\D/g, '').replace(/^0/, '63');
  if (number.length < 11) return;

  await fetch('https://api.semaphore.co/api/v4/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      apikey: apiKey,
      number,
      message,
      sendername: process.env.SEMAPHORE_SENDER_NAME ?? 'GOCLEAN',
    }),
  }).catch((e) => console.error('SMS error:', e));
}

export async function sendBulkSms(numbers: string[], message: string): Promise<{ sent: number; failed: number }> {
  const apiKey = process.env.SEMAPHORE_API_KEY;
  if (!apiKey) return { sent: 0, failed: numbers.length };

  const clean = numbers
    .map(n => n.replace(/\D/g, '').replace(/^0/, '63'))
    .filter(n => n.length >= 11);

  if (!clean.length) return { sent: 0, failed: numbers.length };

  // Semaphore bulk: send in batches of 1000
  const BATCH = 1000;
  let sent = 0;
  let failed = 0;

  for (let i = 0; i < clean.length; i += BATCH) {
    const batch = clean.slice(i, i + BATCH);
    try {
      const res = await fetch('https://api.semaphore.co/api/v4/bulk_messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apikey: apiKey,
          number: batch.join(','),
          message,
          sendername: process.env.SEMAPHORE_SENDER_NAME ?? 'GOCLEAN',
        }),
      });
      if (res.ok) sent += batch.length;
      else failed += batch.length;
    } catch {
      failed += batch.length;
    }
  }

  return { sent, failed };
}
