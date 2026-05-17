import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { SignJWT } from 'jose';
import { Lock } from 'lucide-react';

async function doLogin(formData: FormData) {
  'use server';
  const password = formData.get('password')?.toString() ?? '';

  if (!password || password !== process.env.ADMIN_PASSWORD) {
    redirect('/admin/login?error=1');
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) redirect('/admin/login?error=config');

  const token = await new SignJWT({ admin: true })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(new TextEncoder().encode(jwtSecret!));

  const cookieStore = await cookies();
  cookieStore.set('admin_auth', token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 86400,
    secure: process.env.NODE_ENV === 'production',
  });

  redirect('/admin');
}

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="min-h-screen bg-[#0f1f5c] flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-[#0f1f5c] rounded-full mb-4">
            <Lock size={24} className="text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-[#0f1f5c]">Admin Login</h1>
          <p className="text-gray-400 text-sm mt-1">GoClean Aircon</p>
        </div>

        <form action={doLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              name="password"
              required
              autoFocus
              className="w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              placeholder="Enter admin password"
            />
          </div>

          {params.error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {params.error === 'config'
                ? 'Server configuration error. Contact developer.'
                : 'Wrong password. Try again.'}
            </p>
          )}

          <button
            type="submit"
            className="w-full py-3 bg-[#0f1f5c] text-white font-bold rounded-lg hover:bg-[#0a1440] transition-colors"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
