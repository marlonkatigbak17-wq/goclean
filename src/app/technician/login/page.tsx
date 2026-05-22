'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Wrench } from 'lucide-react';

export default function TechLoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await fetch('/api/technician/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      router.push('/technician');
    } else {
      const data = await res.json();
      setError(data.error || 'Login failed');
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f1f5c] to-[#1e3a8a] flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#1e3a5f] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Wrench size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-[#1e3a5f]">Technician Portal</h1>
          <p className="text-sm text-gray-400 mt-1">GoClean Air Services</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Email</label>
            <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required
              className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1e3a5f]" placeholder="your@email.com" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Password</label>
            <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required
              className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1e3a5f]" placeholder="••••••••" />
          </div>
          {error && <p className="text-sm text-red-500 text-center">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full py-3 bg-[#1e3a5f] text-white font-bold rounded-xl hover:bg-[#152d4a] disabled:opacity-50 transition-colors">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
