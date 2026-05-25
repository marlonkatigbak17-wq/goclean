'use client';

import { useEffect, useState } from 'react';
import { Key, Plus, ToggleLeft, ToggleRight, CheckCircle, XCircle, Copy, Search } from 'lucide-react';

interface License {
  id: string;
  key: string;
  plan: string;
  amount: number;
  phone: string;
  email?: string;
  name?: string;
  isActive: boolean;
  activatedAt?: string;
  expiresAt?: string;
  deviceId?: string;
  createdAt: string;
}

export default function TechProAdminPage() {
  const [licenses, setLicenses] = useState<License[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ plan: 'monthly', phone: '', name: '', email: '' });
  const [copied, setCopied] = useState('');

  async function load() {
    setLoading(true);
    const res = await fetch('/api/admin/techpro');
    setLicenses(await res.json());
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function createKey() {
    if (!form.phone) return;
    await fetch('/api/admin/techpro', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setShowForm(false);
    setForm({ plan: 'monthly', phone: '', name: '', email: '' });
    load();
  }

  async function toggleActive(id: string, isActive: boolean) {
    await fetch('/api/admin/techpro', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, isActive: !isActive }),
    });
    load();
  }

  function copyKey(key: string) {
    navigator.clipboard.writeText(key);
    setCopied(key);
    setTimeout(() => setCopied(''), 2000);
  }

  const filtered = licenses.filter(l =>
    !search ||
    l.key.includes(search.toUpperCase()) ||
    l.phone.includes(search) ||
    (l.name?.toLowerCase().includes(search.toLowerCase()))
  );

  const active = licenses.filter(l => l.isActive && l.expiresAt && new Date(l.expiresAt) > new Date()).length;
  const revenue = licenses.reduce((s, l) => s + l.amount, 0);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1e3a5f] flex items-center gap-2"><Key size={22} /> TechPro Licenses</h1>
          <p className="text-gray-500 text-sm mt-0.5">Manage premium license keys</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700"
        >
          <Plus size={16} /> Generate Key
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Keys', value: licenses.length },
          { label: 'Active Now', value: active },
          { label: 'Total Revenue', value: `₱${revenue.toLocaleString()}` },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border p-4 shadow-sm">
            <p className="text-2xl font-bold text-[#1e3a5f]">{s.value}</p>
            <p className="text-gray-500 text-sm">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Manual generate form */}
      {showForm && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <h3 className="font-semibold text-blue-800 mb-3">Generate Manual Key</h3>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">Plan</label>
              <select value={form.plan} onChange={e => setForm({...form, plan: e.target.value})}
                className="w-full border rounded-lg px-3 py-2 text-sm">
                <option value="monthly">Monthly — ₱199</option>
                <option value="yearly">Yearly — ₱1,499</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">Phone *</label>
              <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}
                placeholder="09171234567" className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">Name</label>
              <input value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                placeholder="Juan dela Cruz" className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">Email</label>
              <input value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                placeholder="optional" className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={createKey} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700">
              Generate & Save
            </button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by key, phone, or name..."
          className="w-full border rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              {['Key', 'Name / Phone', 'Plan', 'Expires', 'Device', 'Status', ''].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan={7} className="text-center py-10 text-gray-400">Loading...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-10 text-gray-400">No licenses found</td></tr>
            ) : filtered.map(l => {
              const expired = l.expiresAt && new Date(l.expiresAt) < new Date();
              const statusOk = l.isActive && !expired;
              return (
                <tr key={l.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <code className="font-mono text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded">{l.key}</code>
                      <button onClick={() => copyKey(l.key)} className="text-gray-400 hover:text-gray-600">
                        {copied === l.key ? <CheckCircle size={13} className="text-green-500" /> : <Copy size={13} />}
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-800">{l.name || '—'}</p>
                    <p className="text-gray-400 text-xs">{l.phone}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${l.plan === 'yearly' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                      {l.plan}
                    </span>
                    <p className="text-gray-400 text-xs mt-0.5">₱{l.amount.toLocaleString()}</p>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {l.expiresAt ? new Date(l.expiresAt).toLocaleDateString('en-PH') : '—'}
                    {expired && <span className="ml-1 text-red-500 font-semibold">Expired</span>}
                  </td>
                  <td className="px-4 py-3">
                    {l.deviceId
                      ? <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Locked</span>
                      : <span className="text-xs text-gray-400">Not used</span>}
                  </td>
                  <td className="px-4 py-3">
                    <div className={`flex items-center gap-1 text-xs font-semibold ${statusOk ? 'text-green-600' : 'text-gray-400'}`}>
                      {statusOk ? <CheckCircle size={13} /> : <XCircle size={13} />}
                      {statusOk ? 'Active' : 'Inactive'}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleActive(l.id, l.isActive)} title={l.isActive ? 'Deactivate' : 'Activate'}>
                      {l.isActive
                        ? <ToggleRight size={20} className="text-green-500 hover:text-red-400" />
                        : <ToggleLeft size={20} className="text-gray-400 hover:text-green-500" />}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
