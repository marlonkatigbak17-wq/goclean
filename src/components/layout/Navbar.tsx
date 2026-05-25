'use client';

import Link from 'next/link';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Menu, X, Phone, User } from 'lucide-react';
import CartIcon from '@/components/shop/CartIcon';

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Services', href: '/services' },
  { label: 'Shop', href: '/shop' },
  { label: 'Projects', href: '/projects' },
  { label: 'About Us', href: '/about' },
  { label: 'Blog', href: '/blog' },
  { label: 'Reviews', href: '/reviews' },
  { label: 'Careers', href: '/careers' },
  { label: 'Contact', href: '/contact' },
  { label: '📲 Download App', href: '/download' },
];

function GocleanLogo() {
  return (
    <svg viewBox="0 0 210 58" className="h-10 w-auto" xmlns="http://www.w3.org/2000/svg" aria-label="GoClean Aircon">
      {/* Dark navy circle (left/back) */}
      <circle cx="22" cy="29" r="22" fill="#0d1d6e" />
      {/* Royal blue circle (right/front) */}
      <circle cx="40" cy="29" r="22" fill="#1565c0" />
      {/* Wave lines — white */}
      <path d="M5 22 Q15 14 26 22 Q37 30 50 22" stroke="white" strokeWidth="3.2" fill="none" strokeLinecap="round" />
      <path d="M3 30 Q13 22 24 30 Q35 38 48 30" stroke="white" strokeWidth="3.2" fill="none" strokeLinecap="round" />
      <path d="M5 38 Q15 30 26 38 Q37 46 50 38" stroke="white" strokeWidth="3.2" fill="none" strokeLinecap="round" />
      {/* GOCLEAN */}
      <text x="72" y="24" fontFamily="Arial Black, Arial, sans-serif" fontWeight="900" fontSize="18" fill="white" letterSpacing="0.5">GOCLEAN</text>
      {/* AIRCON */}
      <text x="72" y="43" fontFamily="Arial Black, Arial, sans-serif" fontWeight="900" fontSize="18" fill="white" letterSpacing="0.5">AIRCON</text>
      {/* SUPPLIES AND SERVICES */}
      <text x="73" y="55" fontFamily="Arial, sans-serif" fontWeight="700" fontSize="7.5" fill="#93c5fd" letterSpacing="1.5">SUPPLIES AND SERVICES</text>
    </svg>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  if (pathname.startsWith('/admin') || pathname.startsWith('/technician')) return null;

  return (
    <header className="bg-[#0f1f5c] text-white sticky top-0 z-50 shadow-lg">
      {/* Top bar */}
      <div className="bg-[#0a1440] text-xs text-blue-200 py-1">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <span>Goclean Aircon Supplies and Service Co.</span>
          <a href="tel:+639171178606" className="flex items-center gap-1 hover:text-white transition-colors">
            <Phone size={12} />
            0917 117 8605 / 049 536 7220
          </a>
        </div>
      </div>

      {/* Main nav */}
      <nav className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <GocleanLogo />
        </Link>

        {/* Desktop links */}
        <ul className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="px-3 py-2 rounded text-sm font-medium text-blue-100 hover:text-white hover:bg-white/10 transition-colors"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Link href="/account" className="p-2 text-blue-200 hover:text-white transition-colors" title="My Account">
            <User size={20} />
          </Link>
          <CartIcon />
          <Link
            href="/book"
            className="hidden sm:inline-flex items-center px-4 py-2 bg-[#f0a500] text-[#0f1f5c] text-sm font-bold rounded hover:bg-yellow-400 transition-colors"
          >
            Book Service
          </Link>
          <button
            className="lg:hidden p-2 text-blue-200 hover:text-white"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="lg:hidden bg-[#0a1440] border-t border-blue-900 px-4 pb-4">
          <ul className="flex flex-col gap-1 pt-2">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="block px-3 py-2 rounded text-sm text-blue-100 hover:text-white hover:bg-white/10 transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li className="pt-2">
              <Link
                href="/book"
                className="block text-center px-4 py-2 bg-[#f0a500] text-[#0f1f5c] text-sm font-bold rounded hover:bg-yellow-400 transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                Book Service
              </Link>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
