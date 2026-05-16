'use client';

import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';

export default function CartIcon() {
  const count = useCartStore((s) => s.itemCount());
  return (
    <Link href="/shop/cart" className="relative p-2 text-blue-200 hover:text-white transition-colors" aria-label="Cart">
      <ShoppingCart size={20} />
      {count > 0 && (
        <span className="absolute -top-0.5 -right-0.5 bg-[#f0a500] text-[#1e3a5f] text-[10px] font-extrabold rounded-full w-4 h-4 flex items-center justify-center">
          {count > 9 ? '9+' : count}
        </span>
      )}
    </Link>
  );
}
