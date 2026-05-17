import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const secret = () =>
  new TextEncoder().encode(
    process.env.JWT_SECRET ?? 'goclean-jwt-secret-2024-change-in-production'
  );

export async function requireAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_auth')?.value;
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, secret());
    return payload.admin === true;
  } catch {
    return false;
  }
}
