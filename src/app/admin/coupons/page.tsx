'use client';

import { useEffect, useState } from 'react';
import { Tag, Plus, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';

type Coupon = {
  id: string;
  code: string;
  discountType: string;
  discountValue: number;
  minOrder: number;
  maxUses: number | null;
  usedCount: number;
  active: boolean;
  createdAt: string;
};

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ code: '', discountType: 'percentage', discountValue: '', minOrder: '', maxUses: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/coupons').then((r) => r.ok ? r.json() : null).then((d) => { if (d) setCoupons(d.coupons ?? []); }).finally(() => setLoading(false));
  }, []);

  async function createCoupon(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    const res = await fetch('/api/admin/coupons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    let data: { coupon?: unknown; error?: string } = {};
    try { data = await res.json(); } catch { /* non-JSON */ }
    if (res.ok) {
      setCoupons((prev) => [data.coupon as never, ...prev]);
      setForm({ code: '', discountType: 'percentage', discountValue: '', minOrder: '', maxUses: '' });
      setShowForm(false);
    } else {
      setError(data.error ?? 'Failed to create coupon');
    }
    setSaving(false);
  }

  async function toggleActive(id: string, active: boolean) {
    const res = await fetch(`/api/admin/coupons/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !active }),
    });
    if (res.ok) setCoupons((prev) => prev.map((c) => c.id === id ? { ...c, active: !active } : c));
  }

  async function deleteCoupon(id: string) {
    if (!confirm('Delete this coupon?')) return;
    await fetch(`/api/admin/coupons/${id}`, { method: 'DELETE' });
    setCoupons((prev) => prev.filter((c) => c.id !== id));
  }

  const inputClass = 'w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300';

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1e3a5f]">Promo Codes</h1>
          <p className="text-gray-500 text-sm">{coupons.length} coupons total</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-[#1e3a5f] text-white text-sm font-bold rounded-lg hover:bg-[#152d4a] transition-colors"
        >
          <Plus size={16} /> New Code
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="bg-white border rounded-xl p-6 mb-6">
          <h2 className="font-bold text-[#1e3a5f] mb-4">Create Promo Code</h2>
          <form onSubmit={createCoupon} className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Code (e.g. SUMMER10)</label>
              <input required type="text" className={inputClass} placeholder="PROMO20" value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Discount Type</label>
              <select className={inputClass} value={form.discountType} onChange={(e) => setForm((f) => ({ ...f, discountType: e.target.value }))}>
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (₱)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                {form.discountType === 'percentage' ? 'Discount %' : 'Discount Amount (₱)'}
              </label>
              <input required type="number" min="1" className={inputClass} placeholder={form.discountType === 'percentage' ? '10' : '500'} value={form.discountValue} onChange={(e) => setForm((f) => ({ ...f, discountValue: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Minimum Order (₱) — optional</label>
              <input type="number" min="0" className={inputClass} placeholder="0" value={form.minOrder} onChange={(e) => setForm((f) => ({ ...f, minOrder: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Max Uses — optional</label>
              <input type="number" min="1" className={inputClass} placeholder="Unlimited" value={form.maxUses} onChange={(e) => setForm((f) => ({ ...f, maxUses: e.target.value }))} />
            </div>
            <div className="col-span-2 flex items-center gap-3">
              {error && <p className="text-sm text-red-500">{error}</p>}
              <button type="submit" disabled={saving} className="px-5 py-2 bg-[#f0a500] text-[#1e3a5f] font-bold rounded-lg hover:bg-yellow-400 transition-colors disabled:opacity-60">
                {saving ? 'Creating...' : 'Create Code'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="text-center py-20 text-gray-400">Loading...</div>
      ) : coupons.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Tag size={36} className="mx-auto mb-3 opacity-30" />
          <div>No promo codes yet. Create one above.</div>
        </div>
      ) : (
        <div className="bg-white border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Code</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Discount</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Min Order</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Used</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Status</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {coupons.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3 font-mono font-bold text-[#1e3a5f]">{c.code}</td>
                  <td className="px-5 py-3 text-gray-700">
                    {c.discountType === 'percentage' ? `${c.discountValue}% off` : `₱${c.discountValue.toLocaleString()} off`}
                  </td>
                  <td className="px-5 py-3 text-gray-600">{c.minOrder > 0 ? `₱${c.minOrder.toLocaleString()}` : '—'}</td>
                  <td className="px-5 py-3 text-gray-600">{c.usedCount}{c.maxUses ? ` / ${c.maxUses}` : ''}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${c.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {c.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => toggleActive(c.id, c.active)} className="text-gray-400 hover:text-[#1e3a5f] transition-colors" title={c.active ? 'Deactivate' : 'Activate'}>
                        {c.active ? <ToggleRight size={20} className="text-green-500" /> : <ToggleLeft size={20} />}
                      </button>
                      <button onClick={() => deleteCoupon(c.id)} className="text-gray-300 hover:text-red-500 transition-colors">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
