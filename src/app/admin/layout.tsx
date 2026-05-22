'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  LayoutDashboard, Package, ShoppingBag, CalendarCheck,
  Boxes, LogOut, Users, Tag, Calendar, UserSquare2, Wrench,
  FileText, Menu, X, ChevronDown, ContactRound, MessageSquare, MapPin, Settings,
} from 'lucide-react';

const mainNav = [
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

const extraNav = [
  { label: 'SMS Blast',   href: '/admin/sms-blast', icon: MessageSquare },
  { label: 'Promo Codes', href: '/admin/coupons',    icon: Tag },
  { label: 'Settings',    href: '/admin/settings',   icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [crmOpen, setCrmOpen]       = useState(false);

  const crmActive = crmNav.some(item => pathname === item.href || pathname.startsWith(item.href + '/'));

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
  }

  function isActive(href: string) {
    return href === '/admin'
      ? pathname === href
      : pathname === href || pathname.startsWith(href + '/');
  }

  const linkCls = (active: boolean) =>
    `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
      active ? 'bg-white/20 text-white' : 'text-blue-100 hover:bg-white/10 hover:text-white'
    }`;

  if (pathname === '/admin/login') return <>{children}</>;

  return (
    <div className="min-h-screen bg-gray-100">

      {/* ── Top Navbar ── */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-[#0f1f5c] shadow-md">
        <div className="flex items-center gap-2 px-4 h-14">

          {/* Logo */}
          <div className="shrink-0 mr-3">
            <div className="font-extrabold text-white text-base leading-tight">GoClean</div>
            <div className="text-blue-300 text-[10px] leading-none">Admin</div>
          </div>

          {/* Desktop nav links */}
          <nav className="hidden lg:flex items-center gap-0.5 flex-1 flex-wrap">
            {mainNav.map(item => (
              <Link key={item.href} href={item.href} className={linkCls(isActive(item.href))}>
                <item.icon size={14} />{item.label}
              </Link>
            ))}

            {/* CRM dropdown */}
            <div className="relative">
              <button
                onClick={() => setCrmOpen(v => !v)}
                onBlur={() => setTimeout(() => setCrmOpen(false), 150)}
                className={linkCls(crmActive)}
              >
                <ContactRound size={14} />
                CRM
                <ChevronDown size={12} className={`transition-transform duration-200 ${crmOpen ? 'rotate-180' : ''}`} />
              </button>
              {crmOpen && (
                <div className="absolute top-full left-0 mt-1 bg-white rounded-xl shadow-xl border py-1 min-w-[175px] z-50">
                  {crmNav.map(item => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setCrmOpen(false)}
                      className={`flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors ${
                        isActive(item.href)
                          ? 'bg-blue-50 text-[#0f1f5c] font-semibold'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <item.icon size={14} />{item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {extraNav.map(item => (
              <Link key={item.href} href={item.href} className={linkCls(isActive(item.href))}>
                <item.icon size={14} />{item.label}
              </Link>
            ))}
          </nav>

          <div className="flex-1 lg:hidden" />

          {/* Desktop logout */}
          <button
            onClick={handleLogout}
            className="hidden lg:flex items-center gap-1.5 text-xs text-red-300 hover:text-red-100 px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors shrink-0"
          >
            <LogOut size={14} /> Logout
          </button>

          {/* Mobile hamburger */}
          <button onClick={() => setMobileOpen(v => !v)} className="lg:hidden p-2 text-white">
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile dropdown menu */}
        {mobileOpen && (
          <div className="lg:hidden bg-[#0f1f5c] border-t border-white/10 px-4 py-3 space-y-0.5 max-h-[80vh] overflow-y-auto">
            {mainNav.map(item => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium ${
                  isActive(item.href) ? 'bg-white/20 text-white' : 'text-blue-100 hover:bg-white/10 hover:text-white'
                }`}
              >
                <item.icon size={15} />{item.label}
              </Link>
            ))}

            <div className="text-xs text-blue-400 px-3 pt-3 pb-1 font-semibold uppercase tracking-widest">CRM</div>
            {crmNav.map(item => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium ${
                  isActive(item.href) ? 'bg-white/20 text-white' : 'text-blue-100 hover:bg-white/10 hover:text-white'
                }`}
              >
                <item.icon size={15} />{item.label}
              </Link>
            ))}

            <div className="text-xs text-blue-400 px-3 pt-3 pb-1 font-semibold uppercase tracking-widest">Tools</div>
            {extraNav.map(item => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium ${
                  isActive(item.href) ? 'bg-white/20 text-white' : 'text-blue-100 hover:bg-white/10 hover:text-white'
                }`}
              >
                <item.icon size={15} />{item.label}
              </Link>
            ))}

            <div className="pt-3 border-t border-white/10 space-y-0.5">
              <Link
                href="/"
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2.5 text-sm text-blue-300 hover:text-white rounded-xl hover:bg-white/10"
              >
                ← Back to Website
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2.5 text-sm text-red-300 hover:text-red-100 w-full rounded-xl hover:bg-white/10"
              >
                <LogOut size={15} /> Logout
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main content */}
      <main className="pt-14 min-h-screen">{children}</main>
    </div>
  );
}
