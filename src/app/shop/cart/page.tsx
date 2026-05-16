'use client';

import Link from 'next/link';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { formatPrice } from '@/lib/utils';

export default function CartPage() {
  const { items, removeItem, updateQuantity, total } = useCartStore();

  if (items.length === 0) {
    return (
      <div className="py-24 px-4 text-center">
        <ShoppingBag size={56} className="text-gray-200 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-[#1e3a5f] mb-2">Your cart is empty</h1>
        <p className="text-gray-400 mb-6">Browse our shop and add items to get started.</p>
        <Link href="/shop" className="px-6 py-3 bg-[#1e3a5f] text-white font-bold rounded hover:bg-[#152d4a] transition-colors">
          Go to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-extrabold text-[#1e3a5f] mb-8">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => {
              const unitPrice = item.withInstallation && item.product.priceWithInstallation
                ? item.product.priceWithInstallation
                : item.product.price;

              return (
                <div key={`${item.product.id}-${item.withInstallation}`} className="border rounded-xl p-4 flex gap-4 items-start">
                  <div className="bg-blue-50 rounded-lg w-20 h-20 flex items-center justify-center shrink-0 text-3xl">❄️</div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-[#1e3a5f] text-sm leading-tight">{item.product.name}</h3>
                    {item.withInstallation && (
                      <span className="text-xs text-green-600 font-medium">Includes Installation</span>
                    )}
                    <div className="text-sm font-semibold text-[#1e3a5f] mt-1">{formatPrice(unitPrice)}</div>
                  </div>

                  <div className="flex flex-col items-end gap-3 shrink-0">
                    <button
                      onClick={() => removeItem(item.product.id, item.withInstallation)}
                      className="text-gray-300 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>

                    <div className="flex items-center border rounded-lg overflow-hidden">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.withInstallation, item.quantity - 1)}
                        className="px-2 py-1 text-gray-500 hover:bg-gray-100 transition-colors"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="px-3 py-1 text-sm font-bold text-[#1e3a5f] border-x">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.withInstallation, item.quantity + 1)}
                        className="px-2 py-1 text-gray-500 hover:bg-gray-100 transition-colors"
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    <div className="text-sm font-bold text-[#1e3a5f]">{formatPrice(unitPrice * item.quantity)}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order summary */}
          <div className="lg:col-span-1">
            <div className="border rounded-xl p-6 sticky top-24">
              <h2 className="font-bold text-[#1e3a5f] mb-4">Order Summary</h2>

              <div className="space-y-2 text-sm mb-4">
                {items.map((item) => {
                  const unitPrice = item.withInstallation && item.product.priceWithInstallation
                    ? item.product.priceWithInstallation
                    : item.product.price;
                  return (
                    <div key={`${item.product.id}-${item.withInstallation}`} className="flex justify-between text-gray-600">
                      <span className="truncate max-w-[160px]">{item.product.name} ×{item.quantity}</span>
                      <span className="shrink-0 ml-2">{formatPrice(unitPrice * item.quantity)}</span>
                    </div>
                  );
                })}
              </div>

              <div className="border-t pt-3 flex justify-between font-bold text-[#1e3a5f] text-lg mb-5">
                <span>Total</span>
                <span>{formatPrice(total())}</span>
              </div>

              <Link
                href="/checkout"
                className="w-full flex items-center justify-center gap-2 py-3 bg-[#f0a500] text-[#1e3a5f] font-bold rounded-lg hover:bg-yellow-400 transition-colors"
              >
                Proceed to Checkout <ArrowRight size={16} />
              </Link>

              <Link href="/shop" className="block text-center text-sm text-[#2563eb] mt-3 hover:underline">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
