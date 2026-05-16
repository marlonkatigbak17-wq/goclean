import { Package, ShoppingBag, CalendarCheck, Boxes, TrendingUp, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

const stats = [
  { label: 'Total Products', value: '8', icon: Package, href: '/admin/products', color: 'bg-blue-500' },
  { label: 'Pending Orders', value: '3', icon: ShoppingBag, href: '/admin/orders', color: 'bg-yellow-500' },
  { label: 'New Bookings', value: '5', icon: CalendarCheck, href: '/admin/bookings', color: 'bg-green-500' },
  { label: 'Low Stock Items', value: '2', icon: Boxes, href: '/admin/inventory', color: 'bg-red-500' },
];

const recentOrders = [
  { id: 'ORD-001', customer: 'Maria Santos', product: 'Daikin 1.5HP Inverter', total: 43000, status: 'Pending', date: 'May 15, 2026' },
  { id: 'ORD-002', customer: 'Juan Dela Cruz', product: 'LG 1.5HP Dual Inverter', total: 47000, status: 'Confirmed', date: 'May 14, 2026' },
  { id: 'ORD-003', customer: 'Ana Reyes', product: 'Copper Tube 1/4" ×3', total: 3600, status: 'Delivered', date: 'May 13, 2026' },
];

const recentBookings = [
  { name: 'Carlo Mendoza', service: 'Aircon Cleaning', date: 'May 16, 2026', status: 'Confirmed' },
  { name: 'Liza Bautista', service: 'Aircon Repair', date: 'May 17, 2026', status: 'Pending' },
  { name: 'Ramon Garcia', service: 'Installation', date: 'May 18, 2026', status: 'Pending' },
];

const statusColors: Record<string, string> = {
  Pending: 'bg-yellow-100 text-yellow-700',
  Confirmed: 'bg-blue-100 text-blue-700',
  Delivered: 'bg-green-100 text-green-700',
  Cancelled: 'bg-red-100 text-red-700',
};

export default function AdminDashboard() {
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1e3a5f]">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-0.5">Overview of your business today</p>
        </div>
        <div className="text-sm text-gray-400">May 15, 2026</div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="bg-white rounded-xl p-5 border hover:shadow-md transition-all group">
            <div className={`w-10 h-10 ${s.color} rounded-lg flex items-center justify-center mb-3`}>
              <s.icon size={18} className="text-white" />
            </div>
            <div className="text-2xl font-extrabold text-[#1e3a5f] group-hover:text-[#2563eb] transition-colors">{s.value}</div>
            <div className="text-gray-500 text-sm">{s.label}</div>
          </Link>
        ))}
      </div>

      {/* Revenue summary */}
      <div className="bg-[#1e3a5f] text-white rounded-xl p-6 mb-8 flex items-center gap-6">
        <TrendingUp size={36} className="text-[#f0a500] shrink-0" />
        <div>
          <div className="text-sm text-blue-200 mb-1">Total Revenue (This Month)</div>
          <div className="text-3xl font-extrabold">₱ 183,600</div>
        </div>
        <div className="ml-auto text-right">
          <div className="text-sm text-blue-200 mb-1">vs Last Month</div>
          <div className="text-green-400 font-bold text-lg">+24%</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent orders */}
        <div className="bg-white border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-[#1e3a5f]">Recent Orders</h2>
            <Link href="/admin/orders" className="text-xs text-[#2563eb] hover:underline">View all</Link>
          </div>
          <div className="space-y-3">
            {recentOrders.map((o) => (
              <div key={o.id} className="flex items-center justify-between py-2 border-b last:border-0">
                <div>
                  <div className="text-sm font-medium text-[#1e3a5f]">{o.customer}</div>
                  <div className="text-xs text-gray-400">{o.product}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-[#1e3a5f]">₱{o.total.toLocaleString()}</div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[o.status]}`}>{o.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent bookings */}
        <div className="bg-white border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-[#1e3a5f]">Recent Bookings</h2>
            <Link href="/admin/bookings" className="text-xs text-[#2563eb] hover:underline">View all</Link>
          </div>
          <div className="space-y-3">
            {recentBookings.map((b) => (
              <div key={b.name} className="flex items-center justify-between py-2 border-b last:border-0">
                <div>
                  <div className="text-sm font-medium text-[#1e3a5f]">{b.name}</div>
                  <div className="text-xs text-gray-400">{b.service} · {b.date}</div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[b.status]}`}>{b.status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Low stock alert */}
        <div className="bg-white border border-red-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={16} className="text-red-500" />
            <h2 className="font-bold text-[#1e3a5f]">Low Stock Alert</h2>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-600">Copper Tube 1/4" ×50ft</span><span className="text-red-500 font-medium">3 left</span></div>
            <div className="flex justify-between"><span className="text-gray-600">R-410A Refrigerant 10kg</span><span className="text-red-500 font-medium">1 left</span></div>
          </div>
          <Link href="/admin/inventory" className="text-xs text-[#2563eb] hover:underline mt-3 block">Manage inventory →</Link>
        </div>
      </div>
    </div>
  );
}
