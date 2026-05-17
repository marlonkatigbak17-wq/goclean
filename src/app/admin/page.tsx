import { prisma } from '@/lib/prisma';
import { Package, ShoppingBag, CalendarCheck, TrendingUp, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

function getMonthLabel(date: Date) {
  return date.toLocaleString('en', { month: 'short', year: '2-digit' });
}

export default async function AdminDashboard() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const [allOrders, allBookings, products, recentOrders, recentBookings] = await Promise.all([
    prisma.order.findMany({ select: { total: true, createdAt: true, status: true } }),
    prisma.booking.findMany({ select: { status: true, createdAt: true } }),
    prisma.product.count(),
    prisma.order.findMany({ orderBy: { createdAt: 'desc' }, take: 5 }),
    prisma.booking.findMany({ orderBy: { createdAt: 'desc' }, take: 5 }),
  ]);

  const thisMonthOrders = allOrders.filter((o) => o.createdAt >= startOfMonth);
  const lastMonthOrders = allOrders.filter((o) => o.createdAt >= startOfLastMonth && o.createdAt < startOfMonth);
  const thisMonthRevenue = thisMonthOrders.reduce((s, o) => s + o.total, 0);
  const lastMonthRevenue = lastMonthOrders.reduce((s, o) => s + o.total, 0);
  const revenueChange = lastMonthRevenue > 0 ? Math.round(((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100) : 0;
  const pendingOrders = allOrders.filter((o) => o.status === 'paid').length;
  const pendingBookings = allBookings.filter((b) => b.status === 'pending').length;

  // Monthly revenue last 6 months
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const next = new Date(d.getFullYear(), d.getMonth() + 1, 1);
    const revenue = allOrders
      .filter((o) => o.createdAt >= d && o.createdAt < next)
      .reduce((s, o) => s + o.total, 0);
    return { label: getMonthLabel(d), revenue };
  });
  const maxRevenue = Math.max(...monthlyData.map((m) => m.revenue), 1);

  const statusColors: Record<string, string> = {
    paid: 'bg-yellow-100 text-yellow-700',
    processing: 'bg-blue-100 text-blue-700',
    delivered: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
    pending: 'bg-yellow-100 text-yellow-700',
    confirmed: 'bg-blue-100 text-blue-700',
    completed: 'bg-green-100 text-green-700',
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1e3a5f]">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-0.5">Live overview of your business</p>
        </div>
        <div className="text-sm text-gray-400">
          {now.toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric' })}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Products', value: products, icon: Package, href: '/admin/products', color: 'bg-blue-500' },
          { label: 'Pending Orders', value: pendingOrders, icon: ShoppingBag, href: '/admin/orders', color: 'bg-yellow-500' },
          { label: 'Pending Bookings', value: pendingBookings, icon: CalendarCheck, href: '/admin/bookings', color: 'bg-green-500' },
          { label: 'Orders This Month', value: thisMonthOrders.length, icon: TrendingUp, href: '/admin/orders', color: 'bg-purple-500' },
        ].map((s) => (
          <Link key={s.label} href={s.href} className="bg-white rounded-xl p-5 border hover:shadow-md transition-all group">
            <div className={`w-10 h-10 ${s.color} rounded-lg flex items-center justify-center mb-3`}>
              <s.icon size={18} className="text-white" />
            </div>
            <div className="text-2xl font-extrabold text-[#1e3a5f] group-hover:text-[#2563eb] transition-colors">{s.value}</div>
            <div className="text-gray-500 text-sm">{s.label}</div>
          </Link>
        ))}
      </div>

      {/* Revenue banner */}
      <div className="bg-[#1e3a5f] text-white rounded-xl p-6 mb-8 flex items-center gap-6">
        <TrendingUp size={36} className="text-[#f0a500] shrink-0" />
        <div>
          <div className="text-sm text-blue-200 mb-1">Revenue This Month</div>
          <div className="text-3xl font-extrabold">₱{thisMonthRevenue.toLocaleString()}</div>
        </div>
        <div className="ml-auto text-right">
          <div className="text-sm text-blue-200 mb-1">vs Last Month</div>
          <div className={`font-bold text-lg ${revenueChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {revenueChange >= 0 ? '+' : ''}{revenueChange}%
          </div>
        </div>
      </div>

      {/* Monthly revenue chart */}
      <div className="bg-white border rounded-xl p-6 mb-6">
        <h2 className="font-bold text-[#1e3a5f] mb-6">Monthly Revenue</h2>
        <div className="flex items-end gap-3 h-36">
          {monthlyData.map((m) => (
            <div key={m.label} className="flex-1 flex flex-col items-center gap-2">
              <div className="text-xs font-semibold text-[#1e3a5f]">
                {m.revenue > 0 ? `₱${(m.revenue / 1000).toFixed(0)}k` : ''}
              </div>
              <div className="w-full bg-gray-100 rounded-t-md flex items-end" style={{ height: '96px' }}>
                <div
                  className="w-full bg-[#1e3a5f] rounded-t-md transition-all"
                  style={{ height: `${Math.max((m.revenue / maxRevenue) * 96, m.revenue > 0 ? 4 : 0)}px` }}
                />
              </div>
              <div className="text-xs text-gray-400">{m.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent orders */}
        <div className="bg-white border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-[#1e3a5f]">Recent Orders</h2>
            <Link href="/admin/orders" className="text-xs text-[#2563eb] hover:underline">View all</Link>
          </div>
          {recentOrders.length === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">No orders yet</p>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((o) => (
                <div key={o.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <div className="text-sm font-medium text-[#1e3a5f]">{o.customerName}</div>
                    <div className="text-xs text-gray-400">{o.createdAt.toLocaleDateString('en-PH')}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-[#1e3a5f]">₱{o.total.toLocaleString()}</div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${statusColors[o.status] ?? 'bg-gray-100 text-gray-500'}`}>{o.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent bookings */}
        <div className="bg-white border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-[#1e3a5f]">Recent Bookings</h2>
            <Link href="/admin/bookings" className="text-xs text-[#2563eb] hover:underline">View all</Link>
          </div>
          {recentBookings.length === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">No bookings yet</p>
          ) : (
            <div className="space-y-3">
              {recentBookings.map((b) => (
                <div key={b.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <div className="text-sm font-medium text-[#1e3a5f]">{b.name}</div>
                    <div className="text-xs text-gray-400">{b.service} · {b.preferredDate}</div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${statusColors[b.status] ?? 'bg-gray-100 text-gray-500'}`}>{b.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* All-time revenue */}
        <div className="bg-white border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={16} className="text-[#f0a500]" />
            <h2 className="font-bold text-[#1e3a5f]">All-Time Revenue</h2>
          </div>
          <div className="text-3xl font-extrabold text-[#1e3a5f]">
            ₱{allOrders.reduce((s, o) => s + o.total, 0).toLocaleString()}
          </div>
          <div className="text-sm text-gray-400 mt-1">{allOrders.length} total orders</div>
        </div>
      </div>
    </div>
  );
}
