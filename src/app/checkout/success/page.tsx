'use client';

import { useEffect } from 'react';
import { useCartStore } from '@/store/cartStore';
import { CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function CheckoutSuccessPage() {
  const clearCart = useCartStore((s) => s.clearCart);

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return (
    <div className="py-24 px-4 text-center min-h-screen bg-gray-50 flex flex-col items-center justify-center">
      <CheckCircle size={72} className="text-green-500 mb-6" />
      <h1 className="text-3xl font-extrabold text-[#1e3a5f] mb-3">Payment Received!</h1>
      <p className="text-gray-600 mb-2 max-w-md">
        Thank you for your order. We will contact you within 24 hours to arrange delivery.
      </p>
      <p className="text-gray-400 text-sm mb-10">
        A confirmation receipt was sent to your email by PayMongo.
      </p>
      <Link
        href="/shop"
        className="px-8 py-3 bg-[#1e3a5f] text-white font-bold rounded-lg hover:bg-[#152d4a] transition-colors"
      >
        Continue Shopping
      </Link>
    </div>
  );
}
