'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  LayoutDashboard, Package, ShoppingBag, CalendarCheck,
  Boxes, LogOut, Users, Tag, Calendar, UserSquare2, Wrench,
  FileText, Menu, X, ChevronDown, ContactRound, MessageSquare, MapPin,
} from 'lucide-react';

const topNav = [
  { label: 'Dashboard', href: '/admin',           icon: LayoutDashboard },
  { label: 'Products',  href: '/admin/products',   icon: Package },
  { label: 'Orders',    href: '/admin/orders',     icon: ShoppingBag },
  { label: 'Bookings',  href: '/admin/bookings',   icon: CalendarCheck },
  { label: 'Calendar',  href: '/admin/calendar',   icon: Calendar },
  { label: 'Inventory', href: '/admin/inventory',  icon: Boxes },
];

const crmNav = [
  { label: 'Customers',   href: '/admin/customers',   icon: Users },
  { label: 'Leads',       href: '/admin/leads',        icon: UserSquare2 },
  { label: 'Technicians', href: '/admin/technicians',  icon: Wrench },
  { label: 'Tracking',    href: '/admin/tracking',     icon: MapPin },
  { label: 'Quotations',  href: '/admin/quotations',   icon: FileText },
];

const bottomNav = [
  { label: 'SMS Blast',   href: '/admin/sms-blast', icon: MessageSquare },
  { label: 'Promo Codes', href: '/admin/coupons',    icon: Tag },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter();
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const crmActive = crmNav.some(
    item => pathname === item.href || pathname.startsWith(item.href),
  );
  const [crmOpen, setCrmOpen] = useState(crmActive);

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
  }

  function NavLink({ href, icon: Icon, label }: { href: string; icon: React.ElementType; label: string }) {
    const active = pathname === href || (href !== '/admin' && pathname.startsWith(href));
    return (
      <Link
        href={href}
        onClick={() => setDrawerOpen(false)}
        className={`flex items-center gap-3 px-5 py-2.5 text-sm transition-colors ${
          active
            ? 'bg-white/15 text-white font-semibold border-r-2 border-white'
            : 'text-blue-100 hover:bg-white/10 hover:text-white'
        }`}
      >
        <Icon size={15} />
        {label}
      </Link>
    );
  }

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between shrink-0">
        <div>
          <div className="text-lg font-extrabold text-white">GoClean</div>
          <div className="text-xs text-blue-300 mt-0.5">Admin Dashboard</div>
        </div>
        <button onClick={() => setDrawerOpen(false)} className="lg:hidden p-1 text-blue-300 hover:text-white">
          <X size={20} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-1 overflow-y-auto">

        {/* Top links */}
        {topNav.map(item => <NavLink key={item.href} {...item} />)}

        {/* CRM dropdown */}
        <div className="mt-1">
          <button
            onClick={() => setCrmOpen(v => !v)}
            className={`w-full flex items-center gap-3 px-5 py-2.5 text-sm transition-colors ${
              crmActive
                ? 'text-white font-semibold'
                : 'text-blue-100 hover:bg-white/10 hover:text-white'
            }`}
          >
            <ContactRound size={15} />
            <span className="flex-1 text-left">CRM</span>
            <ChevronDown
              size={14}
              className={`transition-transform duration-200 ${crmOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {crmOpen && (
            <div className="bg-black/20">
              {crmNav.map(item => (
                <NavLink key={item.href} {...item} />
              ))}
            </div>
          )}
        </div>

        {/* Bottom links */}
        {bottomNav.map(item => <NavLink key={item.href} {...item} />)}

      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-white/10 space-y-2 shrink-0">
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

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed top-0 left-0 h-full w-56 bg-[#0f1f5c] text-white flex-col z-30 overflow-y-auto">
        <SidebarContent />
      </aside>

      {/* Mobile backdrop */}
      {drawerOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setDrawerOpen(false)} />
      )}

      {/* Mobile drawer */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-[#0f1f5c] text-white flex flex-col z-50 lg:hidden transition-transform duration-300 overflow-y-auto ${
          drawerOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <SidebarContent />
      </aside>

      {/* Mobile top bar */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-[#0f1f5c] text-white flex items-center gap-3 px-4 py-3 shadow">
        <button onClick={() => setDrawerOpen(true)} className="p-1 text-white">
          <Menu size={22} />
        </button>
        <span className="font-extrabold text-base">GoClean Admin</span>
      </header>

      {/* Main */}
      <main className="lg:ml-56 pt-14 lg:pt-0 min-h-screen">{children}</main>
    </div>
  );
}
