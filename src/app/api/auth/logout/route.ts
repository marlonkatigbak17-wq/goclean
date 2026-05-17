export const dynamic = 'force-dynamic';

export async function POST() {
  const res = Response.json({ success: true });
  res.headers.set('Set-Cookie', 'customer_auth=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0');
  return res;
}
