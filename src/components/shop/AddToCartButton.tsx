'use client';

import { useState } from 'react';
import { ShoppingCart, CheckCircle } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useToastStore } from '@/store/toastStore';
import { Product } from '@/types';
import { formatPrice } from '@/lib/utils';

export default function AddToCartButton({ product }: { product: Product }) {
  const [withInstallation, setWithInstallation] = useState(false);
  const [added, setAdded] = useState(false);
  const addItem = useCartStore((s) => s.addItem);
  const showToast = useToastStore((s) => s.show);

  function handleAdd() {
    addItem(product, withInstallation);
    showToast(`${product.name} added to cart`);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div className="space-y-3">
      {product.priceWithInstallation && (
        <div className="flex gap-2">
          <button
            onClick={() => setWithInstallation(false)}
            className={`flex-1 py-2 text-sm rounded-lg border font-medium transition-colors ${
              !withInstallation
                ? 'bg-[#1e3a5f] text-white border-[#1e3a5f]'
                : 'text-gray-600 border-gray-200 hover:border-[#1e3a5f]'
            }`}
          >
            Unit Only — {formatPrice(product.price)}
          </button>
          <button
            onClick={() => setWithInstallation(true)}
            className={`flex-1 py-2 text-sm rounded-lg border font-medium transition-colors ${
              withInstallation
                ? 'bg-[#1e3a5f] text-white border-[#1e3a5f]'
                : 'text-gray-600 border-gray-200 hover:border-[#1e3a5f]'
            }`}
          >
            With Install — {formatPrice(product.priceWithInstallation)}
          </button>
        </div>
      )}
      <button
        onClick={handleAdd}
        className={`w-full py-3 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-colors ${
          added
            ? 'bg-green-500 text-white'
            : 'bg-[#f0a500] text-[#1e3a5f] hover:bg-yellow-400'
        }`}
      >
        {added ? (
          <><CheckCircle size={16} /> Added to Cart</>
        ) : (
          <><ShoppingCart size={16} /> Add to Cart</>
        )}
      </button>
    </div>
  );
}
