'use client';

import { useEffect, useState } from 'react';
import { Users, ShoppingBag, CalendarCheck } from 'lucide-react';

type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  createdAt: string;
  orderCount: number;
  bookingCount: number;
  totalSpent: number;
};

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/admin/customers')
      .then((r) => r.json())
      .then((d) => setCustomers(d.customers ?? []))
      .finally(() => setLoading(false));
  }, []);

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
  );

  const totalRevenue = customers.reduce((s, c) => s + c.totalSpent, 0);
  const topCustomer = customers.reduce((top, c) => (!top || c.totalSpent > top.totalSpent ? c : top), customers[0]);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1e3a5f]">Customers</h1>
          <p className="text-gray-500 text-sm">{customers.length} registered accounts</p>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white border rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-500 rounded-lg flex items-center justify-center">
              <Users size={16} className="text-white" />
            </div>
            <div>
              <div className="text-xl font-extrabold text-[#1e3a5f]">{customers.length}</div>
              <div className="text-xs text-gray-500">Total Customers</div>
            </div>
          </div>
        </div>
        <div className="bg-white border rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-green-500 rounded-lg flex items-center justify-center">
              <ShoppingBag size={16} className="text-white" />
            </div>
            <div>
              <div className="text-xl font-extrabold text-[#1e3a5f]">₱{totalRevenue.toLocaleString()}</div>
              <div className="text-xs text-gray-500">Total from Accounts</div>
            </div>
          </div>
        </div>
        <div className="bg-white border rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-yellow-500 rounded-lg flex items-center justify-center">
              <CalendarCheck size={16} className="text-white" />
            </div>
            <div>
              <div className="text-sm font-bold text-[#1e3a5f] truncate">{topCustomer?.name ?? '—'}</div>
              <div className="text-xs text-gray-500">Top Customer</div>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Search by name or email..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full max-w-sm border rounded-lg px-3 py-2 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-blue-300"
      />

      {loading ? (
        <div className="text-center py-20 text-gray-400">Loading customers...</div>
      ) : (
        <div className="bg-white border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Customer</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Phone</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600 text-center">Orders</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600 text-center">Bookings</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600 text-right">Total Spent</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-10 text-gray-400">No customers found</td></tr>
              ) : filtered.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3">
                    <div className="font-medium text-[#1e3a5f]">{c.name}</div>
                    <div className="text-xs text-gray-400">{c.email}</div>
                  </td>
                  <td className="px-5 py-3 text-gray-600">{c.phone || '—'}</td>
                  <td className="px-5 py-3 text-center">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${c.orderCount > 0 ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-400'}`}>
                      {c.orderCount}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-center">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${c.bookingCount > 0 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                      {c.bookingCount}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right font-bold text-[#1e3a5f]">
                    {c.totalSpent > 0 ? `₱${c.totalSpent.toLocaleString()}` : '—'}
                  </td>
                  <td className="px-5 py-3 text-gray-400 text-xs">
                    {new Date(c.createdAt).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
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
