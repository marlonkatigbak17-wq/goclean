'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LayoutDashboard, Package, ShoppingBag, CalendarCheck, Boxes, LogOut, Users, Tag, Calendar, UserSquare2, Wrench, FileText } from 'lucide-react';

const navItems = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Products', href: '/admin/products', icon: Package },
  { label: 'Orders', href: '/admin/orders', icon: ShoppingBag },
  { label: 'Bookings', href: '/admin/bookings', icon: CalendarCheck },
  { label: 'Calendar', href: '/admin/calendar', icon: Calendar },
  { label: 'Inventory', href: '/admin/inventory', icon: Boxes },
  { label: 'Customers', href: '/admin/customers', icon: Users },
  { label: 'Leads', href: '/admin/leads', icon: UserSquare2 },
  { label: 'Technicians', href: '/admin/technicians', icon: Wrench },
  { label: 'Quotations', href: '/admin/quotations', icon: FileText },
  { label: 'Promo Codes', href: '/admin/coupons', icon: Tag },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside className="w-56 bg-[#0f1f5c] text-white flex flex-col shrink-0">
        <div className="px-5 py-5 border-b border-white/10">
          <div className="text-lg font-extrabold text-white">GoClean</div>
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
        <div className="px-5 py-4 border-t border-white/10 space-y-2">
          <Link href="/" className="block text-xs text-blue-300 hover:text-white transition-colors">← Back to Website</Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-xs text-red-300 hover:text-red-100 transition-colors"
          >
            <LogOut size={13} /> Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
