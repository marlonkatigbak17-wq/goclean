'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, Package, CheckCircle, Clock, Truck, XCircle } from 'lucide-react';

type OrderItem = { name: string; qty: number; price: number };

type Order = {
  id: string;
  customerName: string;
  items: OrderItem[];
  total: number;
  status: string;
  address: string;
  notes: string;
  createdAt: string;
};

const STATUS_STEPS = ['paid', 'processing', 'delivered'];

const STATUS_META: Record<string, { label: string; color: string; icon: React.ReactNode; bg: string }> = {
  paid: { label: 'Order Placed', color: 'text-blue-600', bg: 'bg-blue-100', icon: <Package size={16} /> },
  processing: { label: 'Processing', color: 'text-orange-600', bg: 'bg-orange-100', icon: <Clock size={16} /> },
  delivered: { label: 'Delivered', color: 'text-green-700', bg: 'bg-green-100', icon: <CheckCircle size={16} /> },
  cancelled: { label: 'Cancelled', color: 'text-red-600', bg: 'bg-red-100', icon: <XCircle size={16} /> },
};

function StatusTimeline({ status }: { status: string }) {
  if (status === 'cancelled') {
    return (
      <div className="flex items-center gap-2 text-red-600 text-sm font-medium">
        <XCircle size={16} /> Cancelled
      </div>
    );
  }
  const currentIdx = STATUS_STEPS.indexOf(status);
  return (
    <div className="flex items-center gap-0 mt-3">
      {STATUS_STEPS.map((step, i) => {
        const done = i <= currentIdx;
        const active = i === currentIdx;
        const meta = STATUS_META[step];
        return (
          <div key={step} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                  done
                    ? active
                      ? 'bg-[#f0a500] border-[#f0a500] text-white'
                      : 'bg-[#0f1f5c] border-[#0f1f5c] text-white'
                    : 'bg-gray-100 border-gray-300 text-gray-400'
                }`}
              >
                {done ? (active ? meta.icon : <CheckCircle size={14} />) : i + 1}
              </div>
              <span className={`text-xs mt-1 whitespace-nowrap ${done ? 'text-[#0f1f5c] font-semibold' : 'text-gray-400'}`}>
                {meta.label}
              </span>
            </div>
            {i < STATUS_STEPS.length - 1 && (
              <div className={`h-0.5 w-12 sm:w-20 mx-1 mb-5 ${i < currentIdx ? 'bg-[#0f1f5c]' : 'bg-gray-200'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function TrackPage() {
  const [email, setEmail] = useState('');
  const [ref, setRef] = useState('');
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError('');
    setOrders(null);
    try {
      const params = new URLSearchParams({ email: email.trim() });
      if (ref.trim()) params.set('ref', ref.trim());
      const res = await fetch(`/api/track?${params}`);
      const data = await res.json();
      if (data.error) { setError(data.error); return; }
      setOrders(data.orders);
      if (data.orders.length === 0) setError('No orders found for this email address.');
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#1a1a2e] mb-2">Track Your Order</h1>
          <p className="text-gray-500 text-sm">Enter your email to check the status of your orders.</p>
        </div>

        <form onSubmit={handleSearch} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address <span className="text-red-500">*</span></label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f1f5c]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Order Reference <span className="text-gray-400 font-normal">(optional)</span></label>
              <input
                type="text"
                value={ref}
                onChange={(e) => setRef(e.target.value.toUpperCase())}
                placeholder="e.g. A1B2C3D4"
                maxLength={8}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm uppercase font-mono focus:outline-none focus:ring-2 focus:ring-[#0f1f5c]"
              />
              <p className="text-xs text-gray-400 mt-1">Found in your order confirmation email</p>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="mt-4 w-full flex items-center justify-center gap-2 bg-[#0f1f5c] text-white py-2.5 rounded-lg font-semibold text-sm hover:bg-[#1a2e7a] transition-colors disabled:opacity-60"
          >
            <Search size={16} />
            {loading ? 'Searching…' : 'Track Order'}
          </button>
        </form>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm mb-4">
            {error}
          </div>
        )}

        {orders && orders.length > 0 && (
          <div className="space-y-4">
            <p className="text-sm text-gray-500">{orders.length} order{orders.length !== 1 ? 's' : ''} found</p>
            {orders.map((order) => {
              const ref8 = order.id.slice(-8).toUpperCase();
              const items = Array.isArray(order.items) ? order.items as OrderItem[] : [];
              const meta = STATUS_META[order.status] ?? STATUS_META.paid;
              return (
                <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                  <div className="flex items-start justify-between gap-3 mb-1">
                    <div>
                      <p className="font-semibold text-[#1a1a2e]">Order #{ref8}</p>
                      <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                    <span className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${meta.bg} ${meta.color}`}>
                      {meta.icon} {meta.label}
                    </span>
                  </div>

                  <StatusTimeline status={order.status} />

                  <div className="mt-4 border-t pt-3">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Items</p>
                    <ul className="space-y-1">
                      {items.map((item, i) => (
                        <li key={i} className="flex justify-between text-sm text-gray-700">
                          <span>{item.name} × {item.qty}</span>
                          <span className="font-medium">₱{(item.price * item.qty).toLocaleString()}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="flex justify-between text-sm font-bold text-[#1a1a2e] mt-2 pt-2 border-t">
                      <span>Total</span>
                      <span>₱{order.total.toLocaleString()}</span>
                    </div>
                  </div>

                  {order.address && (
                    <p className="mt-3 text-xs text-gray-500">
                      <span className="font-medium">Delivery to:</span> {order.address}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-8 text-center text-sm text-gray-500">
          Need help?{' '}
          <Link href="/contact" className="text-[#0f1f5c] font-medium hover:underline">Contact us</Link>
          {' '}or call{' '}
          <a href="tel:+639178237205" className="text-[#0f1f5c] font-medium hover:underline">0917 823 7205</a>
        </div>
      </div>
    </div>
  );
}
