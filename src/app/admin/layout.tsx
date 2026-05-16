import Link from 'next/link';
import { LayoutDashboard, Package, ShoppingBag, CalendarCheck, Boxes } from 'lucide-react';

const navItems = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Products', href: '/admin/products', icon: Package },
  { label: 'Orders', href: '/admin/orders', icon: ShoppingBag },
  { label: 'Bookings', href: '/admin/bookings', icon: CalendarCheck },
  { label: 'Inventory', href: '/admin/inventory', icon: Boxes },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside className="w-56 bg-[#1e3a5f] text-white flex flex-col shrink-0">
        <div className="px-5 py-5 border-b border-white/10">
          <div className="text-lg font-extrabold">
            <span className="text-white">Go</span>
            <span className="text-[#f0a500]">clean</span>
          </div>
          <div className="text-xs text-blue-300 mt-0.5">Admin Dashboard</div>
        </div>
        <nav className="flex-1 py-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-5 py-3 text-sm text-blue-100 hover:bg-white/10 hover:text-white transition-colors"
            >
              <item.icon size={16} />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="px-5 py-4 border-t border-white/10">
          <Link href="/" className="text-xs text-blue-300 hover:text-white transition-colors">← Back to Website</Link>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
