'use client';

import { useEffect, useState } from 'react';
import { Star } from 'lucide-react';

type Review = {
  id: string;
  customerName: string;
  rating: number;
  comment: string;
  createdAt: string;
};

function StarRow({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={size}
          className={i <= rating ? 'text-[#f0a500] fill-[#f0a500]' : 'text-gray-300 fill-gray-300'}
        />
      ))}
    </div>
  );
}

export default function ProductReviews({ slug }: { slug: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);
  const [rating, setRating] = useState(5);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetch(`/api/reviews?slug=${slug}`)
      .then((r) => r.json())
      .then((d) => setReviews(d.reviews ?? []))
      .finally(() => setLoading(false));

    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((d) => setLoggedIn(!!d.user));
  }, [slug]);

  async function submitReview(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    const res = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productSlug: slug, rating, comment }),
    });
    const data = await res.json();
    if (res.ok) {
      setReviews((prev) => [data.review, ...prev]);
      setComment('');
      setRating(5);
      setSuccess('Review submitted!');
    } else {
      setError(data.error);
    }
    setSubmitting(false);
  }

  const avgRating = reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

  return (
    <div className="mt-12 max-w-6xl mx-auto px-4">
      <div className="border-t pt-10">
        <div className="flex items-center gap-4 mb-6">
          <h2 className="text-xl font-extrabold text-[#1e3a5f]">Customer Reviews</h2>
          {reviews.length > 0 && (
            <div className="flex items-center gap-2">
              <StarRow rating={Math.round(avgRating)} />
              <span className="text-sm text-gray-500">{avgRating.toFixed(1)} ({reviews.length})</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Review list */}
          <div className="lg:col-span-2 space-y-4">
            {loading ? (
              <p className="text-sm text-gray-400">Loading reviews...</p>
            ) : reviews.length === 0 ? (
              <p className="text-sm text-gray-400">No reviews yet. Be the first!</p>
            ) : (
              reviews.map((r) => (
                <div key={r.id} className="border rounded-xl p-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-sm text-[#1e3a5f]">{r.customerName}</span>
                    <span className="text-xs text-gray-400">
                      {new Date(r.createdAt).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                  <StarRow rating={r.rating} size={13} />
                  <p className="mt-2 text-sm text-gray-600">{r.comment}</p>
                </div>
              ))
            )}
          </div>

          {/* Submit form */}
          <div>
            <div className="bg-gray-50 border rounded-xl p-5">
              <h3 className="font-bold text-[#1e3a5f] mb-3 text-sm">Write a Review</h3>
              {!loggedIn ? (
                <p className="text-sm text-gray-500">
                  <a href="/account/login" className="text-[#1e3a5f] font-semibold hover:underline">Log in</a> to leave a review.
                </p>
              ) : success ? (
                <p className="text-sm text-green-600 font-semibold">{success}</p>
              ) : (
                <form onSubmit={submitReview} className="space-y-3">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Your Rating</div>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setRating(i)}
                          onMouseEnter={() => setHovered(i)}
                          onMouseLeave={() => setHovered(0)}
                          className="focus:outline-none"
                        >
                          <Star
                            size={22}
                            className={i <= (hovered || rating) ? 'text-[#f0a500] fill-[#f0a500]' : 'text-gray-300 fill-gray-300'}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <textarea
                      required
                      rows={4}
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Share your experience with this product..."
                      className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
                    />
                  </div>
                  {error && <p className="text-xs text-red-500">{error}</p>}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-2 bg-[#1e3a5f] text-white text-sm font-bold rounded-lg hover:bg-[#152d4a] transition-colors disabled:opacity-60"
                  >
                    {submitting ? 'Submitting...' : 'Submit Review'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
