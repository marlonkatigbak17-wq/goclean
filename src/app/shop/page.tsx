'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Star, Zap, Search, ChevronDown } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import ProductImage from '@/components/shop/ProductImage';
import { useCartStore } from '@/store/cartStore';
import type { Product } from '@/types';
import { useToastStore } from '@/store/toastStore';

const categoryCards = [
  { label: 'Split Type', value: 'Split Type', icon: '🌬️', desc: 'Wall-mounted inverter & standard' },
  { label: 'Window Type', value: 'Window Type', icon: '🪟', desc: 'Budget-friendly window units' },
  { label: 'Commercial', value: 'Cassette', icon: '🏢', desc: 'Ceiling cassette & ducted' },
  { label: 'Supplies & Tools', value: 'supplies', icon: '🔧', desc: 'Copper tubes, fittings & tools' },
];

const brands = ['All Brands', 'Daikin', 'Carrier', 'Midea', 'Panasonic', 'LG'];
const hpOptions = ['All HP', '0.8HP', '1HP', '1.5HP', '2HP', '2.5HP'];
const sortOptions = [
  { label: 'Default', value: 'default' },
  { label: 'Price: Low to High', value: 'price-asc' },
  { label: 'Price: High to Low', value: 'price-desc' },
];

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('');
  const [brand, setBrand] = useState('All Brands');
  const [hp, setHp] = useState('All HP');
  const [sortBy, setSortBy] = useState('default');

  const addItem = useCartStore((s) => s.addItem);
  const showToast = useToastStore((s) => s.show);

  useEffect(() => {
    fetch('/api/products')
      .then((r) => r.json())
      .then((data) => setProducts(Array.isArray(data) ? data : []))
      .catch(() => setProducts([]))
      .finally(() => setProductsLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return products
      .filter((p) => {
        if (search) {
          const q = search.toLowerCase();
          if (!p.name.toLowerCase().includes(q) && !p.brand.toLowerCase().includes(q)) return false;
        }
        if (activeCategory) {
          if (activeCategory === 'supplies') {
            if (p.category !== 'hvac-supplies' && p.category !== 'tools') return false;
          } else {
            if (p.subcategory !== activeCategory) return false;
          }
        }
        if (brand !== 'All Brands' && p.brand !== brand) return false;
        if (hp !== 'All HP' && p.specs.horsepower !== hp) return false;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        return 0;
      });
  }, [search, activeCategory, brand, hp, sortBy]);

  function clearFilters() {
    setSearch('');
    setActiveCategory('');
    setBrand('All Brands');
    setHp('All HP');
    setSortBy('default');
  }

  const hasFilters = search || activeCategory || brand !== 'All Brands' || hp !== 'All HP';

  return (
    <div className="py-10 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-[#1e3a5f] mb-1">Aircon Shop</h1>
          <p className="text-gray-500">Quality units from top brands — with optional installation service</p>
        </div>

        {/* Daikin Amihan Promo Banner */}
        <Link href="/shop/daikin-amihan-1hp" className="block mb-8 rounded-2xl overflow-hidden relative group">
          <div className="relative w-full h-40 sm:h-56 bg-gradient-to-r from-sky-100 to-blue-50">
            <Image
              src="/images/banners/amihan-banner.jpg"
              alt="Daikin Amihan — Ginhawang pang-family, affordable, at sure quality!"
              fill
              className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
              onError={() => {}}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0f2140]/60 to-transparent flex flex-col justify-center px-8">
              <div className="text-white text-xs font-semibold uppercase tracking-widest mb-1 opacity-80">New Arrival</div>
              <div className="text-white text-2xl sm:text-3xl font-extrabold leading-tight">Daikin Amihan</div>
              <div className="text-blue-200 text-sm mt-1 mb-3">Ginhawang pang-family, affordable, at sure quality!</div>
              <span className="inline-block bg-[#f0a500] text-[#1e3a5f] text-xs font-bold px-4 py-1.5 rounded-full w-fit">
                Shop Now →
              </span>
            </div>
          </div>
        </Link>

        {/* Category cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {categoryCards.map((c) => (
            <button
              key={c.value}
              onClick={() => setActiveCategory(activeCategory === c.value ? '' : c.value)}
              className={`rounded-xl border p-4 text-left transition-all hover:shadow-md ${
                activeCategory === c.value
                  ? 'bg-[#1e3a5f] text-white border-[#1e3a5f]'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-[#1e3a5f]'
              }`}
            >
              <div className="text-2xl mb-1">{c.icon}</div>
              <div className="font-bold text-sm">{c.label}</div>
              <div className={`text-xs mt-0.5 ${activeCategory === c.value ? 'text-white/70' : 'text-gray-400'}`}>
                {c.desc}
              </div>
            </button>
          ))}
        </div>

        {/* Search + filter bar */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or brand..."
              className="w-full pl-9 pr-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:border-[#1e3a5f]"
            />
          </div>

          <div className="relative">
            <select
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2.5 border rounded-lg text-sm text-gray-600 focus:outline-none focus:border-[#1e3a5f] bg-white"
            >
              {brands.map((b) => <option key={b}>{b}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

          <div className="relative">
            <select
              value={hp}
              onChange={(e) => setHp(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2.5 border rounded-lg text-sm text-gray-600 focus:outline-none focus:border-[#1e3a5f] bg-white"
            >
              {hpOptions.map((h) => <option key={h}>{h}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2.5 border rounded-lg text-sm text-gray-600 focus:outline-none focus:border-[#1e3a5f] bg-white"
            >
              {sortOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

          {hasFilters && (
            <button
              onClick={clearFilters}
              className="px-4 py-2.5 text-sm text-gray-500 border rounded-lg hover:bg-gray-50"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Result count */}
        <div className="text-sm text-gray-400 mb-4">
          {filtered.length} {filtered.length === 1 ? 'product' : 'products'} found
        </div>

        {/* Product grid */}
        {productsLoading ? (
          <div className="text-center py-20 text-gray-400">
            <div className="text-3xl mb-3 animate-pulse">❄️</div>
            <div className="font-medium">Loading products...</div>
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((p) => (
              <div key={p.id} className="border rounded-2xl overflow-hidden hover:shadow-lg transition-all group">
                <div className="relative">
                  <ProductImage slug={p.slug} name={p.name} className="h-48" />
                  {p.badge && (
                    <span className={`absolute top-3 left-3 text-xs font-bold px-2 py-0.5 rounded-full ${
                      p.badge === 'Best Seller' ? 'bg-[#f0a500] text-[#1e3a5f]' :
                      p.badge === 'New' ? 'bg-green-500 text-white' :
                      'bg-red-500 text-white'
                    }`}>
                      {p.badge}
                    </span>
                  )}
                </div>

                <div className="p-5">
                  {p.specs.energyEfficiency?.includes('Inverter') && (
                    <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium mb-2">
                      <Zap size={10} /> Inverter
                    </span>
                  )}
                  <h3 className="font-bold text-[#1e3a5f] mb-1 text-sm leading-tight">{p.name}</h3>
                  <div className="flex items-center gap-1 mb-3">
                    <Star size={12} className="text-[#f0a500] fill-[#f0a500]" />
                    <span className="text-xs text-gray-500">4.8 · In Stock</span>
                  </div>

                  <div className="mb-4">
                    <div className="text-xl font-extrabold text-[#1e3a5f]">{formatPrice(p.price)}</div>
                    {p.priceWithInstallation && (
                      <div className="text-xs text-gray-500 mt-0.5">
                        {formatPrice(p.priceWithInstallation)} with installation
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Link
                      href={`/shop/${p.slug}`}
                      className="flex-1 text-center py-2 border border-[#1e3a5f] text-[#1e3a5f] text-sm font-semibold rounded hover:bg-[#1e3a5f] hover:text-white transition-colors"
                    >
                      View Details
                    </Link>
                    <button
                      onClick={() => {
                        addItem(p, false);
                        showToast(`${p.name} added to cart`);
                      }}
                      className="p-2 bg-[#f0a500] text-[#1e3a5f] rounded hover:bg-yellow-400 transition-colors"
                      title="Add to cart"
                    >
                      <ShoppingCart size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-gray-400">
            <div className="text-4xl mb-3">🔍</div>
            <div className="font-medium">No products match your filters</div>
            <button onClick={clearFilters} className="mt-3 text-sm text-[#2563eb] hover:underline">
              Clear all filters
            </button>
          </div>
        )}

        {/* Quotation CTA */}
        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-2xl p-8 text-center">
          <h2 className="text-xl font-bold text-[#1e3a5f] mb-2">Not sure what to buy?</h2>
          <p className="text-gray-500 mb-4 text-sm">Use our quotation tool — input your room size and we&apos;ll recommend the right unit.</p>
          <Link href="/quote" className="px-6 py-3 bg-[#1e3a5f] text-white font-bold rounded hover:bg-[#152d4a] transition-colors">
            Get a Free Quotation
          </Link>
        </div>
      </div>
    </div>
  );
}
