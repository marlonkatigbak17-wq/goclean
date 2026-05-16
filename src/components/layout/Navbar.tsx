'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X, Phone } from 'lucide-react';
import CartIcon from '@/components/shop/CartIcon';

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Services', href: '/services' },
  { label: 'Shop', href: '/shop' },
  { label: 'Projects', href: '/projects' },
  { label: 'About Us', href: '/about' },
  { label: 'Reviews', href: '/reviews' },
  { label: 'Contact', href: '/contact' },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="bg-[#1e3a5f] text-white sticky top-0 z-50 shadow-lg">
      {/* Top bar */}
      <div className="bg-[#152d4a] text-xs text-blue-200 py-1">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <span>Goclean Aircon Supplies and Service Co.</span>
          <a href="tel:+639178237205" className="flex items-center gap-1 hover:text-white transition-colors">
            <Phone size={12} />
            0917 823 7205 / 0922 912 1250
          </a>
        </div>
      </div>

      {/* Main nav */}
      <nav className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold tracking-tight">
          <span className="text-white">Go</span>
          <span className="text-[#f0a500]">clean</span>
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
          <CartIcon />
          <Link
            href="/book"
            className="hidden sm:inline-flex items-center px-4 py-2 bg-[#f0a500] text-[#1e3a5f] text-sm font-bold rounded hover:bg-yellow-400 transition-colors"
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
        <div className="lg:hidden bg-[#152d4a] border-t border-blue-800 px-4 pb-4">
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
                className="block text-center px-4 py-2 bg-[#f0a500] text-[#1e3a5f] text-sm font-bold rounded hover:bg-yellow-400 transition-colors"
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
