'use client';

import { useState, useEffect } from 'react';
import { useCartStore } from '@/store/cartStore';
import { formatPrice } from '@/lib/utils';
import Link from 'next/link';

export default function CheckoutPage() {
  const { items, total } = useCartStore();

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    street: '',
    city: '',
    province: '',
    notes: '',
  });

  useEffect(() => {
    fetch('/api/auth/me').then((r) => r.json()).then((d) => {
      if (!d.user) return;
      setForm((f) => ({ ...f, name: d.user.name || f.name, email: d.user.email || f.email, phone: d.user.phone || f.phone }));
    });
    fetch('/api/account/address').then((r) => r.json()).then((d) => {
      if (!d.address) return;
      setForm((f) => ({ ...f, street: d.address.street || f.street, city: d.address.city || f.city, province: d.address.province || f.province }));
    });
  }, []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [coupon, setCoupon] = useState<{ code: string; discountAmount: number; discountValue: number; discountType: string } | null>(null);
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  if (items.length === 0) {
    return (
      <div className="py-24 px-4 text-center">
        <p className="text-gray-500 mb-4">Your cart is empty.</p>
        <Link href="/shop" className="px-6 py-3 bg-[#1e3a5f] text-white font-bold rounded">
          Go to Shop
        </Link>
      </div>
    );
  }

  function field(key: keyof typeof form) {
    return {
      value: form[key],
      onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        setForm((f) => ({ ...f, [key]: e.target.value })),
    };
  }

  async function applyCoupon() {
    setCouponError('');
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    const res = await fetch('/api/checkout/validate-coupon', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: couponCode, orderTotal: total() }),
    });
    const data = await res.json();
    if (res.ok) {
      setCoupon(data);
    } else {
      setCouponError(data.error);
      setCoupon(null);
    }
    setCouponLoading(false);
  }

  const discountedTotal = coupon ? Math.max(total() - coupon.discountAmount, 0) : total();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const rawItems = items.map((item) => {
      const price =
        item.withInstallation && item.product.priceWithInstallation
          ? item.product.priceWithInstallation
          : item.product.price;
      return {
        name: item.withInstallation ? `${item.product.name} (with installation)` : item.product.name,
        price,
        quantity: item.quantity,
      };
    });

    // Apply discount proportionally across line items
    const ratio = discountedTotal / total();
    const lineItems = rawItems.map((item) => ({ ...item, price: Math.round(item.price * ratio) }));

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: lineItems,
          customer: { name: form.name, email: form.email, phone: form.phone },
          address: {
            street: form.street,
            city: form.city,
            province: form.province,
            notes: form.notes,
          },
          couponCode: coupon?.code,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.url) {
        setError(data.error ?? 'Something went wrong. Please try again.');
        setLoading(false);
        return;
      }

      window.location.href = data.url;
    } catch {
      setError('Network error. Please check your connection and try again.');
      setLoading(false);
    }
  }

  const inputClass =
    'w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300';

  return (
    <div className="py-12 px-4 bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-extrabold text-[#1e3a5f] mb-8">Checkout</h1>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Left: Customer info + address */}
            <div className="lg:col-span-2 space-y-6">

              {/* Contact info */}
              <div className="bg-white border rounded-xl p-6">
                <h2 className="font-bold text-[#1e3a5f] mb-4">Contact Information</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                    <input required type="text" className={inputClass} placeholder="Juan Dela Cruz" {...field('name')} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                    <input required type="tel" className={inputClass} placeholder="09XX XXX XXXX" {...field('phone')} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                    <input required type="email" className={inputClass} placeholder="your@email.com" {...field('email')} />
                  </div>
                </div>
              </div>

              {/* Delivery address */}
              <div className="bg-white border rounded-xl p-6">
                <h2 className="font-bold text-[#1e3a5f] mb-4">Delivery Address</h2>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Street Address *</label>
                    <input required type="text" className={inputClass} placeholder="Unit/House No., Street, Barangay" {...field('street')} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                      <input required type="text" className={inputClass} placeholder="Makati" {...field('city')} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Province</label>
                      <input type="text" className={inputClass} placeholder="Metro Manila" {...field('province')} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Notes</label>
                    <input type="text" className={inputClass} placeholder="Gate code, landmarks, preferred time..." {...field('notes')} />
                  </div>
                </div>
              </div>

              {/* Payment info */}
              <div className="bg-white border rounded-xl p-6">
                <h2 className="font-bold text-[#1e3a5f] mb-2">Payment</h2>
                <p className="text-sm text-gray-500">
                  You will be redirected to PayMongo's secure checkout to pay via{' '}
                  <strong>GCash, Maya, Credit/Debit Card,</strong> or <strong>QR Ph</strong>.
                </p>
              </div>
            </div>

            {/* Right: Order summary */}
            <div>
              <div className="bg-white border rounded-xl p-6 sticky top-24">
                <h2 className="font-bold text-[#1e3a5f] mb-4">Order Summary</h2>
                <div className="space-y-2 text-sm mb-4">
                  {items.map((item) => {
                    const unitPrice =
                      item.withInstallation && item.product.priceWithInstallation
                        ? item.product.priceWithInstallation
                        : item.product.price;
                    return (
                      <div
                        key={`${item.product.id}-${item.withInstallation}`}
                        className="flex justify-between text-gray-600"
                      >
                        <span className="truncate max-w-[140px]">
                          {item.product.name} ×{item.quantity}
                        </span>
                        <span className="shrink-0 ml-2">{formatPrice(unitPrice * item.quantity)}</span>
                      </div>
                    );
                  })}
                </div>
                {/* Coupon input */}
                <div className="border-t pt-3 mb-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Promo code"
                      value={couponCode}
                      onChange={(e) => { setCouponCode(e.target.value.toUpperCase()); setCoupon(null); setCouponError(''); }}
                      className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                    />
                    <button
                      type="button"
                      onClick={applyCoupon}
                      disabled={couponLoading || !couponCode.trim()}
                      className="px-3 py-2 bg-[#1e3a5f] text-white text-sm font-semibold rounded-lg hover:bg-[#152d4a] transition-colors disabled:opacity-50"
                    >
                      {couponLoading ? '...' : 'Apply'}
                    </button>
                  </div>
                  {couponError && <p className="text-xs text-red-500 mt-1">{couponError}</p>}
                  {coupon && <p className="text-xs text-green-600 font-semibold mt-1">✓ {coupon.code} applied — {coupon.discountType === 'percentage' ? `${coupon.discountValue}% off` : `₱${coupon.discountValue.toLocaleString()} off`}</p>}
                </div>

                <div className="space-y-1 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>{formatPrice(total())}</span>
                  </div>
                  {coupon && (
                    <div className="flex justify-between text-green-600 font-medium">
                      <span>Discount ({coupon.code})</span>
                      <span>-{formatPrice(coupon.discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-600">
                    <span>Delivery</span>
                    <span className="text-green-600">Free</span>
                  </div>
                  <div className="flex justify-between font-bold text-[#1e3a5f] text-lg pt-2 border-t">
                    <span>Total</span>
                    <span>{formatPrice(discountedTotal)}</span>
                  </div>
                </div>

                {error && (
                  <p className="mt-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-5 w-full py-3 bg-[#f0a500] text-[#1e3a5f] font-extrabold rounded-lg hover:bg-yellow-400 transition-colors disabled:opacity-60"
                >
                  {loading ? 'Redirecting to payment...' : 'Pay Now'}
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
