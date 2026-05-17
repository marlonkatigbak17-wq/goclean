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
