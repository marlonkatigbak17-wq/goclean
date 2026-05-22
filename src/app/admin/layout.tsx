'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  LayoutDashboard, Package, ShoppingBag, CalendarCheck,
  Boxes, LogOut, Users, Tag, Calendar, UserSquare2, Wrench, FileText, Menu, X,
} from 'lucide-react';

const navItems = [
  { label: 'Dashboard',   href: '/admin',              icon: LayoutDashboard },
  { label: 'Products',    href: '/admin/products',      icon: Package },
  { label: 'Orders',      href: '/admin/orders',        icon: ShoppingBag },
  { label: 'Bookings',    href: '/admin/bookings',      icon: CalendarCheck },
  { label: 'Calendar',    href: '/admin/calendar',      icon: Calendar },
  { label: 'Inventory',   href: '/admin/inventory',     icon: Boxes },
  { label: 'Customers',   href: '/admin/customers',     icon: Users },
  { label: 'Leads',       href: '/admin/leads',         icon: UserSquare2 },
  { label: 'Technicians', href: '/admin/technicians',   icon: Wrench },
  { label: 'Quotations',  href: '/admin/quotations',    icon: FileText },
  { label: 'Promo Codes', href: '/admin/coupons',       icon: Tag },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
  }

  const SidebarContent = () => (
    <>
      <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
        <div>
          <div className="text-lg font-extrabold text-white">GoClean</div>
          <div className="text-xs text-blue-300 mt-0.5">Admin Dashboard</div>
        </div>
        {/* Close button — mobile only */}
        <button onClick={() => setOpen(false)} className="lg:hidden p-1 text-blue-300 hover:text-white">
          <X size={20} />
        </button>
      </div>

      <nav className="flex-1 py-1 overflow-y-auto">
        {navItems.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== '/admin' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-5 py-3 text-sm transition-colors ${
                active
                  ? 'bg-white/15 text-white font-semibold border-r-2 border-white'
                  : 'text-blue-100 hover:bg-white/10 hover:text-white'
              }`}
            >
              <item.icon size={16} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-5 py-4 border-t border-white/10 space-y-2">
        <Link href="/" className="block text-xs text-blue-300 hover:text-white transition-colors">
          ← Back to Website
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-xs text-red-300 hover:text-red-100 transition-colors"
        >
          <LogOut size={13} /> Logout
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-gray-100">

      {/* ── Desktop sidebar (hidden on mobile) ── */}
      <aside className="hidden lg:flex fixed top-0 left-0 h-full w-56 bg-[#0f1f5c] text-white flex-col z-30" style={{ overflowY: 'auto' }}>
        <SidebarContent />
      </aside>

      {/* ── Mobile drawer backdrop ── */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* ── Mobile drawer ── */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-[#0f1f5c] text-white flex flex-col z-50 lg:hidden transition-transform duration-300 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ overflowY: 'auto' }}
      >
        <SidebarContent />
      </aside>

      {/* ── Mobile top bar ── */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-[#0f1f5c] text-white flex items-center gap-3 px-4 py-3 shadow">
        <button onClick={() => setOpen(true)} className="p-1 text-white">
          <Menu size={22} />
        </button>
        <span className="font-extrabold text-base">GoClean Admin</span>
      </header>

      {/* ── Main content ── */}
      {/* On desktop: offset left by sidebar. On mobile: offset top by header bar */}
      <main className="lg:ml-56 pt-14 lg:pt-0 min-h-screen">
        {children}
      </main>
    </div>
  );
}
