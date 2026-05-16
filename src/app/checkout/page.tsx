'use client';

import { useState } from 'react';
import { useCartStore } from '@/store/cartStore';
import { formatPrice } from '@/lib/utils';
import { CheckCircle, CreditCard, Smartphone, Building2 } from 'lucide-react';
import Link from 'next/link';

const paymentMethods = [
  { id: 'gcash', label: 'GCash', icon: Smartphone, desc: 'Pay via GCash QR or number' },
  { id: 'maya', label: 'Maya', icon: Smartphone, desc: 'Pay via Maya wallet' },
  { id: 'card', label: 'Credit / Debit Card', icon: CreditCard, desc: 'Visa, Mastercard, JCB' },
  { id: 'bank', label: 'Bank Transfer', icon: Building2, desc: 'BDO, BPI, Metrobank' },
];

export default function CheckoutPage() {
  const { items, total, clearCart } = useCartStore();
  const [paymentMethod, setPaymentMethod] = useState('gcash');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  if (submitted) {
    return (
      <div className="py-24 px-4 text-center">
        <CheckCircle size={64} className="text-green-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-[#1e3a5f] mb-2">Order Placed!</h1>
        <p className="text-gray-500 mb-2">Thank you for your order. We will contact you within 24 hours to confirm payment and delivery.</p>
        <p className="text-gray-400 text-sm mb-8">Order confirmation sent to your email.</p>
        <Link href="/shop" className="px-6 py-3 bg-[#1e3a5f] text-white font-bold rounded hover:bg-[#152d4a] transition-colors">
          Continue Shopping
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="py-24 px-4 text-center">
        <p className="text-gray-500 mb-4">Your cart is empty.</p>
        <Link href="/shop" className="px-6 py-3 bg-[#1e3a5f] text-white font-bold rounded">Go to Shop</Link>
      </div>
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      clearCart();
      setSubmitted(true);
      setLoading(false);
    }, 1500);
  }

  return (
    <div className="py-12 px-4 bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-extrabold text-[#1e3a5f] mb-8">Checkout</h1>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Left: Customer info + payment */}
            <div className="lg:col-span-2 space-y-6">

              {/* Contact info */}
              <div className="bg-white border rounded-xl p-6">
                <h2 className="font-bold text-[#1e3a5f] mb-4">Contact Information</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                    <input required type="text" className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" placeholder="Juan Dela Cruz" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                    <input required type="tel" className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" placeholder="+63 9XX XXX XXXX" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                    <input required type="email" className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" placeholder="your@email.com" />
                  </div>
                </div>
              </div>

              {/* Delivery address */}
              <div className="bg-white border rounded-xl p-6">
                <h2 className="font-bold text-[#1e3a5f] mb-4">Delivery Address</h2>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Street Address *</label>
                    <input required type="text" className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" placeholder="Unit/House No., Street, Barangay" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                      <input required type="text" className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" placeholder="Makati" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Province</label>
                      <input type="text" className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" placeholder="Metro Manila" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Notes</label>
                    <input type="text" className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" placeholder="Gate code, landmarks, preferred time..." />
                  </div>
                </div>
              </div>

              {/* Payment method */}
              <div className="bg-white border rounded-xl p-6">
                <h2 className="font-bold text-[#1e3a5f] mb-4">Payment Method</h2>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {paymentMethods.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPaymentMethod(m.id)}
                      className={`flex items-center gap-3 p-3 border rounded-xl text-left transition-colors ${
                        paymentMethod === m.id
                          ? 'border-[#1e3a5f] bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <m.icon size={18} className={paymentMethod === m.id ? 'text-[#2563eb]' : 'text-gray-400'} />
                      <div>
                        <div className={`text-sm font-semibold ${paymentMethod === m.id ? 'text-[#1e3a5f]' : 'text-gray-700'}`}>{m.label}</div>
                        <div className="text-xs text-gray-400">{m.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>

                {paymentMethod === 'card' && (
                  <div className="space-y-3 border-t pt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                      <input type="text" className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" placeholder="1234 5678 9012 3456" maxLength={19} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Expiry</label>
                        <input type="text" className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" placeholder="MM/YY" maxLength={5} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                        <input type="text" className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" placeholder="123" maxLength={4} />
                      </div>
                    </div>
                  </div>
                )}

                {(paymentMethod === 'gcash' || paymentMethod === 'maya') && (
                  <div className="border-t pt-4 text-sm text-gray-500">
                    After placing your order, you will receive payment instructions via SMS and email. Send payment to confirm your order.
                  </div>
                )}

                {paymentMethod === 'bank' && (
                  <div className="border-t pt-4 text-sm text-gray-500">
                    Bank account details will be sent to your email after placing the order. Please transfer within 24 hours to reserve your items.
                  </div>
                )}
              </div>
            </div>

            {/* Right: Order summary */}
            <div>
              <div className="bg-white border rounded-xl p-6 sticky top-24">
                <h2 className="font-bold text-[#1e3a5f] mb-4">Order Summary</h2>
                <div className="space-y-2 text-sm mb-4">
                  {items.map((item) => {
                    const unitPrice = item.withInstallation && item.product.priceWithInstallation
                      ? item.product.priceWithInstallation
                      : item.product.price;
                    return (
                      <div key={`${item.product.id}-${item.withInstallation}`} className="flex justify-between text-gray-600">
                        <span className="truncate max-w-[140px]">{item.product.name} ×{item.quantity}</span>
                        <span className="shrink-0 ml-2">{formatPrice(unitPrice * item.quantity)}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="border-t pt-3 space-y-1 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span><span>{formatPrice(total())}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Delivery</span><span className="text-green-600">Free</span>
                  </div>
                  <div className="flex justify-between font-bold text-[#1e3a5f] text-lg pt-2 border-t">
                    <span>Total</span><span>{formatPrice(total())}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-5 w-full py-3 bg-[#f0a500] text-[#1e3a5f] font-extrabold rounded-lg hover:bg-yellow-400 transition-colors disabled:opacity-60"
                >
                  {loading ? 'Processing...' : 'Place Order'}
                </button>
                <p className="text-xs text-gray-400 text-center mt-2">Secured by PayMongo</p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
