'use client';

import { useCartStore } from '@/store/cartStore';
import { products } from '@/lib/products';
import { formatPrice } from '@/lib/utils';
import { Package, CheckCircle, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

const bundles = [
  {
    id: 'bundle-starter',
    name: 'Starter Home Bundle',
    tagline: 'Perfect for a single bedroom',
    description: 'Get a reliable Panasonic window-type aircon plus a professional cleaning session in one package — everything you need to stay cool.',
    productIds: ['4'],
    extras: ['1x Professional Aircon Cleaning', 'Free installation check'],
    originalPrice: 17000,
    bundlePrice: 15500,
    badge: 'Most Popular',
    badgeColor: 'bg-[#f0a500] text-[#1e3a5f]',
  },
  {
    id: 'bundle-inverter',
    name: 'Inverter Upgrade Bundle',
    tagline: 'Save on electricity every month',
    description: 'Our best-selling Daikin 1.5HP Inverter plus installation. Inverter units use up to 50% less electricity — this bundle pays for itself.',
    productIds: ['1'],
    extras: ['Professional installation included', '30-day service warranty', 'Free post-install cleaning'],
    originalPrice: 45000,
    bundlePrice: 43000,
    badge: 'Best Value',
    badgeColor: 'bg-green-600 text-white',
  },
  {
    id: 'bundle-family',
    name: 'Family Home Bundle',
    tagline: 'Cool two rooms for less',
    description: 'Two units — one Daikin 1.5HP Inverter for the master bedroom and one Panasonic Window Type for a second room — at a combined discount.',
    productIds: ['1', '4'],
    extras: ['Installation for both units', 'Priority scheduling', '2x free cleaning vouchers'],
    originalPrice: 57000,
    bundlePrice: 52000,
    badge: 'Save ₱5,000',
    badgeColor: 'bg-blue-600 text-white',
  },
  {
    id: 'bundle-commercial',
    name: 'Small Office Bundle',
    tagline: 'Keep your team comfortable',
    description: 'The Midea 2HP Inverter is ideal for offices and small commercial spaces. Includes professional installation and a maintenance plan.',
    productIds: ['3'],
    extras: ['Commercial installation', 'Priority support line', '3-month maintenance plan'],
    originalPrice: 38000,
    bundlePrice: 35000,
    badge: 'Commercial',
    badgeColor: 'bg-[#0f1f5c] text-white',
  },
];

export default function BundlesPage() {
  const { addItem } = useCartStore();
  const [added, setAdded] = useState<string | null>(null);

  function addBundle(bundle: typeof bundles[0]) {
    bundle.productIds.forEach((pid) => {
      const product = products.find((p) => p.id === pid);
      if (product) addItem(product, false);
    });
    setAdded(bundle.id);
    setTimeout(() => setAdded(null), 2000);
  }

  return (
    <div className="py-12 px-4 bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-[#0f1f5c] rounded-full mb-4">
            <Package size={24} className="text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-[#1e3a5f] mb-2">Bundle Deals</h1>
          <p className="text-gray-500">Save more when you buy together — curated packages for every need</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {bundles.map((bundle) => {
            const savings = bundle.originalPrice - bundle.bundlePrice;
            const bundleProducts = bundle.productIds.map((id) => products.find((p) => p.id === id)).filter(Boolean);

            return (
              <div key={bundle.id} className="bg-white border rounded-2xl overflow-hidden hover:shadow-md transition-all">
                <div className="bg-gradient-to-r from-[#0f1f5c] to-[#1e3a5f] p-5 text-white relative">
                  <span className={`absolute top-4 right-4 text-xs font-bold px-2.5 py-1 rounded-full ${bundle.badgeColor}`}>
                    {bundle.badge}
                  </span>
                  <h2 className="text-lg font-extrabold mb-1">{bundle.name}</h2>
                  <p className="text-blue-200 text-sm">{bundle.tagline}</p>
                </div>

                <div className="p-5">
                  <p className="text-sm text-gray-600 mb-4">{bundle.description}</p>

                  <div className="space-y-1 mb-4">
                    {bundleProducts.map((p) => p && (
                      <div key={p.id} className="flex items-center gap-2 text-sm text-[#1e3a5f] font-medium">
                        <CheckCircle size={14} className="text-green-500 shrink-0" />
                        {p.name}
                      </div>
                    ))}
                    {bundle.extras.map((extra) => (
                      <div key={extra} className="flex items-center gap-2 text-sm text-gray-600">
                        <CheckCircle size={14} className="text-blue-400 shrink-0" />
                        {extra}
                      </div>
                    ))}
                  </div>

                  <div className="flex items-end gap-3 mb-4">
                    <div>
                      <div className="text-xs text-gray-400 line-through">{formatPrice(bundle.originalPrice)}</div>
                      <div className="text-2xl font-extrabold text-[#1e3a5f]">{formatPrice(bundle.bundlePrice)}</div>
                    </div>
                    <div className="text-sm text-green-600 font-semibold mb-1">Save {formatPrice(savings)}</div>
                  </div>

                  <button
                    onClick={() => addBundle(bundle)}
                    className="w-full py-3 bg-[#f0a500] text-[#1e3a5f] font-extrabold rounded-lg hover:bg-yellow-400 transition-colors flex items-center justify-center gap-2"
                  >
                    <ShoppingCart size={16} />
                    {added === bundle.id ? 'Added to Cart!' : 'Add Bundle to Cart'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-10 bg-[#0f1f5c] text-white rounded-2xl p-6 text-center">
          <h3 className="font-extrabold text-lg mb-2">Need a custom bundle?</h3>
          <p className="text-blue-200 text-sm mb-4">Have specific requirements? We can put together a package tailored to your home or office.</p>
          <div className="flex justify-center gap-3">
            <a href="https://wa.me/639178237205" target="_blank" rel="noopener noreferrer"
              className="px-5 py-2.5 bg-[#25d366] text-white font-bold rounded-lg text-sm hover:bg-[#1db954] transition-colors">
              WhatsApp Us
            </a>
            <Link href="/shop" className="px-5 py-2.5 bg-white/10 text-white font-bold rounded-lg text-sm hover:bg-white/20 transition-colors">
              Browse All Products
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
