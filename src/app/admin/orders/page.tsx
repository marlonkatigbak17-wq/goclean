'use client';

import { useEffect, useState } from 'react';
import { formatPrice } from '@/lib/utils';
import { StickyNote } from 'lucide-react';

type Order = {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address: string;
  items: { name: string; amount: number; quantity: number }[];
  total: number;
  status: string;
  adminNotes: string;
  createdAt: string;
};

const statusColors: Record<string, string> = {
  paid: 'bg-yellow-100 text-yellow-700',
  processing: 'bg-blue-100 text-blue-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

const statusFlow = ['paid', 'processing', 'delivered'];
const statusLabels: Record<string, string> = { paid: 'Paid', processing: 'Processing', delivered: 'Delivered', cancelled: 'Cancelled' };

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState('All');
  const [updating, setUpdating] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');

  useEffect(() => {
    fetch('/api/admin/orders')
      .then((r) => r.json())
      .then((d) => setOrders(d.orders ?? []))
      .finally(() => setLoading(false));
  }, []);

  async function updateStatus(id: string, status: string) {
    setUpdating(id + status);
    const res = await fetch(`/api/admin/orders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      const data = await res.json();
      setOrders((prev) => prev.map((o) => o.id === id ? { ...o, status: data.order.status } : o));
    }
    setUpdating(null);
  }

  async function saveNote(id: string) {
    await fetch(`/api/admin/orders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminNotes: noteText }),
    });
    setOrders((prev) => prev.map((o) => o.id === id ? { ...o, adminNotes: noteText } : o));
    setEditingNote(null);
  }

  function exportCsv() {
    const rows = [
      ['Order ID', 'Date', 'Customer', 'Email', 'Phone', 'Address', 'Items', 'Total', 'Status'],
      ...orders.map((o) => [
        '#' + o.id.slice(-8).toUpperCase(),
        new Date(o.createdAt).toLocaleDateString('en-PH'),
        o.customerName,
        o.customerEmail,
        o.customerPhone,
        o.address,
        (o.items as { name: string; quantity: number }[]).map((i) => `${i.name} x${i.quantity}`).join('; '),
        o.total.toFixed(2),
        o.status,
      ]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `goclean-orders-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const filtered = filter === 'All' ? orders : orders.filter((o) => o.status === filter.toLowerCase());

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1e3a5f]">Orders</h1>
          <p className="text-gray-500 text-sm">{orders.length} orders total</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={exportCsv}
            disabled={orders.length === 0}
            className="px-3 py-1.5 text-xs rounded-lg border font-medium text-gray-600 border-gray-200 hover:border-[#1e3a5f] transition-colors disabled:opacity-40"
          >
            Export CSV
          </button>
          {['All', 'Paid', 'Processing', 'Delivered'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-xs rounded-lg border font-medium transition-colors ${
                filter === f ? 'bg-[#1e3a5f] text-white border-[#1e3a5f]' : 'text-gray-600 border-gray-200 hover:border-[#1e3a5f]'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">Loading orders...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">No orders found</div>
      ) : (
        <div className="space-y-4">
          {filtered.map((o) => (
            <div key={o.id} className="bg-white border rounded-xl p-5 hover:shadow-sm transition-all">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-bold text-[#1e3a5f]">#{o.id.slice(-8).toUpperCase()}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${statusColors[o.status] ?? 'bg-gray-100 text-gray-500'}`}>
                      {statusLabels[o.status] ?? o.status}
                    </span>
                  </div>
                  <div className="font-medium text-gray-700">{o.customerName}</div>
                  <div className="text-xs text-gray-400">
                    {o.customerPhone && <span>{o.customerPhone} · </span>}
                    {o.address}
                  </div>
                  {o.customerEmail && <div className="text-xs text-gray-400">{o.customerEmail}</div>}
                </div>
                <div className="text-right">
                  <div className="text-xl font-extrabold text-[#1e3a5f]">{formatPrice(o.total)}</div>
                  <div className="text-xs text-gray-400">{new Date(o.createdAt).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t text-sm text-gray-600 space-y-0.5">
                {(o.items as { name: string; amount: number; quantity: number }[]).map((item, i) => (
                  <div key={i}>{item.name} ×{item.quantity} — ₱{((item.amount * item.quantity) / 100).toLocaleString()}</div>
                ))}
              </div>

              {/* Admin notes */}
              <div className="mt-3 pt-3 border-t">
                {editingNote === o.id ? (
                  <div className="flex gap-2">
                    <textarea
                      autoFocus
                      rows={2}
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      className="flex-1 text-xs border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
                      placeholder="Internal note (not visible to customer)..."
                    />
                    <div className="flex flex-col gap-1">
                      <button onClick={() => saveNote(o.id)} className="px-3 py-1 text-xs bg-[#1e3a5f] text-white rounded font-medium">Save</button>
                      <button onClick={() => setEditingNote(null)} className="px-3 py-1 text-xs text-gray-500 hover:text-gray-700">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => { setEditingNote(o.id); setNoteText(o.adminNotes ?? ''); }}
                    className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-[#1e3a5f] transition-colors"
                  >
                    <StickyNote size={13} />
                    {o.adminNotes ? <span className="text-gray-600">{o.adminNotes}</span> : <span>Add note</span>}
                  </button>
                )}
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {statusFlow.map((s) => (
                  <button
                    key={s}
                    onClick={() => updateStatus(o.id, s)}
                    disabled={o.status === s || updating === o.id + s}
                    className={`px-3 py-1.5 text-xs rounded-lg font-medium border transition-colors disabled:opacity-50 capitalize ${
                      o.status === s
                        ? 'bg-[#1e3a5f] text-white border-[#1e3a5f]'
                        : 'text-gray-500 border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    {updating === o.id + s ? '...' : statusLabels[s]}
                  </button>
                ))}
                <button
                  onClick={() => updateStatus(o.id, 'cancelled')}
                  disabled={o.status === 'cancelled' || !!updating}
                  className="ml-auto px-3 py-1.5 text-xs rounded-lg font-medium border border-red-200 text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
