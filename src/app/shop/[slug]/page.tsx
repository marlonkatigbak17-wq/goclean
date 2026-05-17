import { notFound } from 'next/navigation';
import { getProductBySlug, products } from '@/lib/products';
import { formatPrice } from '@/lib/utils';
import { CheckCircle, Zap, Star, Package } from 'lucide-react';
import AddToCartButton from '@/components/shop/AddToCartButton';
import ProductImage from '@/components/shop/ProductImage';
import ProductReviews from '@/components/shop/ProductReviews';

export async function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();

  const specEntries = Object.entries(product.specs).filter(([, v]) => v);

  return (
    <div className="py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

          {/* Image */}
          <ProductImage slug={product.slug} name={product.name} className="rounded-2xl h-96" />

          {/* Info */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">{product.brand}</span>
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{product.subcategory}</span>
              {product.specs.energyEfficiency?.includes('Inverter') && (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full flex items-center gap-1 font-medium">
                  <Zap size={10} /> Inverter
                </span>
              )}
            </div>

            <h1 className="text-2xl font-extrabold text-[#1e3a5f] mb-3">{product.name}</h1>

            <div className="flex items-center gap-2 mb-4">
              <div className="flex gap-0.5">
                {[1,2,3,4,5].map(i => <Star key={i} size={14} className="text-[#f0a500] fill-[#f0a500]" />)}
              </div>
              <span className="text-sm text-gray-400">4.9 (24 reviews)</span>
            </div>

            <p className="text-gray-600 text-sm mb-6">{product.description}</p>

            {/* Specs */}
            {specEntries.length > 0 && (
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <h3 className="font-semibold text-[#1e3a5f] text-sm mb-3">Specifications</h3>
                <dl className="grid grid-cols-2 gap-2">
                  {specEntries.map(([key, val]) => (
                    <div key={key}>
                      <dt className="text-xs text-gray-400 capitalize">{key.replace(/([A-Z])/g, ' $1')}</dt>
                      <dd className="text-sm font-medium text-[#1e3a5f]">{val}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            {/* Pricing */}
            <div className="border rounded-xl p-5 mb-5">
              <div className="flex items-end gap-3 mb-3">
                <div>
                  <div className="text-xs text-gray-400 mb-0.5">Unit Only</div>
                  <div className="text-3xl font-extrabold text-[#1e3a5f]">{formatPrice(product.price)}</div>
                </div>
                {product.priceWithInstallation && (
                  <div className="text-right">
                    <div className="text-xs text-gray-400 mb-0.5">With Installation</div>
                    <div className="text-2xl font-bold text-[#2563eb]">{formatPrice(product.priceWithInstallation)}</div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 text-xs text-green-600 mb-4">
                <Package size={13} />
                {product.inStock ? 'In Stock — Ready to deliver' : 'Out of Stock'}
              </div>

              <AddToCartButton product={product} />
            </div>

            {/* Guarantees */}
            <div className="space-y-2">
              {['Licensed & insured installation team', 'Manufacturer warranty honored', 'Free delivery within Metro Manila', '30-day service warranty on installation'].map((g) => (
                <div key={g} className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle size={14} className="text-green-500 shrink-0" />
                  {g}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <ProductReviews slug={product.slug} />
    </div>
  );
}
