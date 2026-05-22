import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';

export async function requireAdmin(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_auth')?.value;
    if (!token) return false;
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
    const { payload } = await jwtVerify(token, secret);
    return payload.admin === true;
  } catch {
    return false;
  }
}
