'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Star, CheckCircle } from 'lucide-react';
import Image from 'next/image';

type Product = { id: string; slug: string; name: string; brand: string; images: string[] };

function ReviewForm() {
  const searchParams = useSearchParams();
  const preselectedSlug = searchParams.get('product') || '';

  const [products, setProducts] = useState<Product[]>([]);
  const [selectedSlug, setSelectedSlug] = useState(preselectedSlug);
  const [name, setName] = useState('');
  const [rating, setRating] = useState(5);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/products').then(r => r.json()).then(d => setProducts(Array.isArray(d) ? d : []));
  }, []);

  const selected = products.find(p => p.slug === selectedSlug);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedSlug || !name.trim() || !comment.trim()) return;
    setSubmitting(true);
    setError('');
    const res = await fetch('/api/reviews/guest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productSlug: selectedSlug, customerName: name.trim(), rating, comment: comment.trim() }),
    });
    const data = await res.json();
    if (res.ok) {
      setDone(true);
    } else {
      setError(data.error || 'Something went wrong. Please try again.');
    }
    setSubmitting(false);
  }

  if (done) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md w-full text-center">
          <CheckCircle size={56} className="text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-extrabold text-[#1e3a5f] mb-2">Thank you!</h2>
          <p className="text-gray-500 text-sm">Your review has been submitted. We appreciate your feedback!</p>
          <a href="https://gocleanair.co/shop" className="inline-block mt-6 px-6 py-2.5 bg-[#1e3a5f] text-white text-sm font-bold rounded-xl hover:bg-[#152d4a] transition-colors">
            Back to Shop
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Image src="/icon.svg" alt="GoClean" width={56} height={56} className="rounded-xl" />
          </div>
          <h1 className="text-2xl font-extrabold text-[#1e3a5f]">Leave a Review</h1>
          <p className="text-gray-500 text-sm mt-1">Share your experience with GoClean Aircon</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border p-6 space-y-5">
          {/* Product selector */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Product *</label>
            <select
              required
              value={selectedSlug}
              onChange={e => setSelectedSlug(e.target.value)}
              className="w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1e3a5f] bg-white"
            >
              <option value="">Select a product...</option>
              {products.map(p => (
                <option key={p.slug} value={p.slug}>{p.brand} — {p.name}</option>
              ))}
            </select>
          </div>

          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Your Name *</label>
            <input
              required
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Juan dela Cruz"
              className="w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1e3a5f]"
            />
          </div>

          {/* Star rating */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Rating *</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(i => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setRating(i)}
                  onMouseEnter={() => setHovered(i)}
                  onMouseLeave={() => setHovered(0)}
                >
                  <Star
                    size={32}
                    className={i <= (hovered || rating) ? 'text-[#f0a500] fill-[#f0a500]' : 'text-gray-300 fill-gray-300'}
                  />
                </button>
              ))}
              <span className="text-sm text-gray-500 self-center ml-1">
                {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][hovered || rating]}
              </span>
            </div>
          </div>

          {/* Comment */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Your Review *</label>
            <textarea
              required
              rows={4}
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Tell us about your experience with the product..."
              className="w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1e3a5f] resize-none"
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={submitting || !selectedSlug || !name.trim() || !comment.trim()}
            className="w-full py-3 bg-[#1e3a5f] text-white font-bold rounded-xl hover:bg-[#152d4a] transition-colors disabled:opacity-50 text-sm"
          >
            {submitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function ReviewPage() {
  return (
    <Suspense>
      <ReviewForm />
    </Suspense>
  );
}
