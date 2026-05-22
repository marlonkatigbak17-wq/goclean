'use client';
import { useState, useEffect, use } from 'react';
import { ArrowLeft, Phone, Mail, MapPin, Wrench, ShoppingBag, Star } from 'lucide-react';
import Link from 'next/link';

type Customer = {
  id: string; name: string; email: string; phone: string;
  unitModel: string; installationDate: string | null; warrantyExpiry: string | null; notes: string;
  createdAt: string;
  address?: { street: string; city: string; province: string };
  bookings: { id: string; service: string; status: string; preferredDate: string; createdAt: string }[];
  orders: { id: string; total: number; status: string; createdAt: string }[];
};

export default function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ unitModel: '', installationDate: '', warrantyExpiry: '', notes: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/customers/${id}`)
      .then(r => r.json())
      .then(d => { setCustomer(d); setForm({ unitModel: d.unitModel || '', installationDate: d.installationDate ? d.installationDate.split('T')[0] : '', warrantyExpiry: d.warrantyExpiry ? d.warrantyExpiry.split('T')[0] : '', notes: d.notes || '' }); })
      .finally(() => setLoading(false));
  }, [id]);

  async function handleSave() {
    setSaving(true);
    const res = await fetch(`/api/admin/customers/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    const data = await res.json();
    if (res.ok) { setCustomer({ ...customer!, ...data }); setEditing(false); }
    setSaving(false);
  }

  if (loading) return <div className="p-6 text-gray-400">Loading...</div>;
  if (!customer) return <div className="p-6 text-gray-400">Customer not found</div>;

  const statusColor = (s: string) => s === 'completed' || s === 'paid' ? 'text-green-600 bg-green-50' : s === 'pending' ? 'text-yellow-600 bg-yellow-50' : 'text-gray-600 bg-gray-100';

  return (
    <div className="p-6 max-w-5xl">
      <Link href="/admin/customers" className="flex items-center gap-1 text-sm text-gray-500 hover:text-[#1e3a5f] mb-5"><ArrowLeft size={15} /> Back to Customers</Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: customer info */}
        <div className="space-y-4">
          <div className="bg-white border rounded-2xl p-5">
            <div className="w-14 h-14 bg-[#1e3a5f] rounded-full flex items-center justify-center text-white text-2xl font-bold mb-3">
              {customer.name[0].toUpperCase()}
            </div>
            <h2 className="text-xl font-extrabold text-[#1e3a5f]">{customer.name}</h2>
            <div className="mt-3 space-y-2 text-sm text-gray-600">
              <div className="flex items-center gap-2"><Mail size={14} /> {customer.email}</div>
              {customer.phone && <div className="flex items-center gap-2"><Phone size={14} /> {customer.phone}</div>}
              {customer.address && <div className="flex items-center gap-2"><MapPin size={14} /> {[customer.address.street, customer.address.city, customer.address.province].filter(Boolean).join(', ')}</div>}
            </div>
            <div className="mt-3 text-xs text-gray-400">Customer since {new Date(customer.createdAt).toLocaleDateString('en-PH', { month: 'long', year: 'numeric' })}</div>
          </div>

          {/* Unit info */}
          <div className="bg-white border rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-[#1e3a5f] text-sm">Aircon Unit Info</h3>
              <button onClick={() => setEditing(!editing)} className="text-xs text-[#1e3a5f] font-semibold hover:underline">{editing ? 'Cancel' : 'Edit'}</button>
            </div>
            {editing ? (
              <div className="space-y-3">
                {[['Unit Model', 'unitModel', 'text', 'e.g. Daikin D-Smart 1.5HP'], ['Installation Date', 'installationDate', 'date', ''], ['Warranty Expiry', 'warrantyExpiry', 'date', '']].map(([label, key, type, ph]) => (
                  <div key={key}>
                    <label className="block text-xs text-gray-500 mb-1">{label}</label>
                    <input type={type} value={(form as Record<string, string>)[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} placeholder={ph} className="w-full border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-[#1e3a5f]" />
                  </div>
                ))}
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Notes</label>
                  <textarea rows={3} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} className="w-full border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-[#1e3a5f] resize-none" />
                </div>
                <button onClick={handleSave} disabled={saving} className="w-full py-2 bg-[#1e3a5f] text-white text-sm font-bold rounded-lg hover:bg-[#152d4a] disabled:opacity-50">{saving ? 'Saving...' : 'Save'}</button>
              </div>
            ) : (
              <div className="space-y-2 text-sm">
                <div><span className="text-gray-500">Model:</span> <span className="font-medium">{customer.unitModel || '—'}</span></div>
                <div><span className="text-gray-500">Installed:</span> <span className="font-medium">{customer.installationDate ? new Date(customer.installationDate).toLocaleDateString('en-PH') : '—'}</span></div>
                <div><span className="text-gray-500">Warranty until:</span> <span className="font-medium">{customer.warrantyExpiry ? new Date(customer.warrantyExpiry).toLocaleDateString('en-PH') : '—'}</span></div>
                {customer.notes && <div className="mt-2 p-2 bg-gray-50 rounded-lg text-xs text-gray-600">{customer.notes}</div>}
              </div>
            )}
          </div>
        </div>

        {/* Right: history */}
        <div className="lg:col-span-2 space-y-4">
          {/* Bookings */}
          <div className="bg-white border rounded-2xl p-5">
            <h3 className="font-bold text-[#1e3a5f] mb-3 flex items-center gap-2"><Wrench size={15} /> Service History ({customer.bookings.length})</h3>
            {customer.bookings.length === 0 ? <p className="text-sm text-gray-400">No service bookings yet</p> : (
              <div className="space-y-2">
                {customer.bookings.map(b => (
                  <div key={b.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl text-sm">
                    <div>
                      <div className="font-semibold text-[#1e3a5f]">{b.service}</div>
                      <div className="text-xs text-gray-400">{b.preferredDate}</div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold capitalize ${statusColor(b.status)}`}>{b.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Orders */}
          <div className="bg-white border rounded-2xl p-5">
            <h3 className="font-bold text-[#1e3a5f] mb-3 flex items-center gap-2"><ShoppingBag size={15} /> Order History ({customer.orders.length})</h3>
            {customer.orders.length === 0 ? <p className="text-sm text-gray-400">No orders yet</p> : (
              <div className="space-y-2">
                {customer.orders.map(o => (
                  <div key={o.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl text-sm">
                    <div>
                      <div className="font-semibold text-[#1e3a5f]">₱{o.total.toLocaleString()}</div>
                      <div className="text-xs text-gray-400">{new Date(o.createdAt).toLocaleDateString('en-PH')}</div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold capitalize ${statusColor(o.status)}`}>{o.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Total Services', value: customer.bookings.length, icon: Wrench },
              { label: 'Total Orders', value: customer.orders.length, icon: ShoppingBag },
              { label: 'Total Spent', value: `₱${customer.orders.reduce((s, o) => s + o.total, 0).toLocaleString()}`, icon: Star },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="bg-white border rounded-2xl p-4 text-center">
                <Icon size={20} className="text-[#1e3a5f] mx-auto mb-1" />
                <div className="text-xl font-extrabold text-[#1e3a5f]">{value}</div>
                <div className="text-xs text-gray-400">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
