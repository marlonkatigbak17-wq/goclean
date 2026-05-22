import { Star } from 'lucide-react';

const reviews = [
  { name: 'Maria Santos', rating: 5, service: 'Aircon Installation', date: 'April 2024', comment: 'Very professional team. They arrived on time, did clean work, and explained everything. My new Daikin inverter is working perfectly!' },
  { name: 'Juan Dela Cruz', rating: 5, service: 'Shop Purchase', date: 'March 2024', comment: 'Best aircon shop in the area. Great prices, legit brands, and the staff helped me choose the right unit for my room size.' },
  { name: 'Ana Reyes', rating: 5, service: 'Preventive Maintenance', date: 'February 2024', comment: 'Enrolled in their maintenance plan and it is worth every peso. They remind me when my schedule is due and the technicians are always thorough.' },
  { name: 'Carlo Mendoza', rating: 4, service: 'Aircon Repair', date: 'January 2024', comment: 'Fast response and accurate diagnosis. They fixed my aircon the same day. Slightly pricey but quality work.' },
  { name: 'Liza Bautista', rating: 5, service: 'Commercial HVAC', date: 'December 2023', comment: 'They installed the entire HVAC system for our new office. Excellent project management and clean installation. Highly recommend!' },
  { name: 'Ramon Garcia', rating: 5, service: 'Aircon Cleaning', date: 'November 2023', comment: 'My old aircon felt like new after their deep cleaning service. Very affordable and the technician was very respectful.' },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={14}
          className={i <= rating ? 'text-[#f0a500] fill-[#f0a500]' : 'text-gray-300'}
        />
      ))}
    </div>
  );
}

export default function ReviewsPage() {
  const avgRating = (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1);

  return (
    <div className="py-16 px-4">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-[#1e3a5f] mb-3">Customer Reviews</h1>
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="flex gap-1">
              {[1,2,3,4,5].map(i => <Star key={i} size={24} className="text-[#f0a500] fill-[#f0a500]" />)}
            </div>
            <span className="text-3xl font-extrabold text-[#1e3a5f]">{avgRating}</span>
          </div>
          <p className="text-gray-400 text-sm">Based on {reviews.length} reviews</p>
        </div>

        {/* Reviews grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((r) => (
            <div key={r.name} className="bg-white border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all">
              <StarRating rating={r.rating} />
              <p className="text-gray-600 text-sm my-4">&ldquo;{r.comment}&rdquo;</p>
              <div className="border-t pt-3 flex justify-between items-end">
                <div>
                  <div className="font-bold text-[#1e3a5f] text-sm">{r.name}</div>
                  <div className="text-xs text-[#2563eb] font-medium">{r.service}</div>
                </div>
                <div className="text-xs text-gray-400">{r.date}</div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 text-center bg-gray-50 border rounded-2xl p-8">
          <h2 className="text-xl font-bold text-[#1e3a5f] mb-2">Had a great experience?</h2>
          <p className="text-gray-500 text-sm mb-4">Leave us a review on Google or Facebook and help others find us.</p>
          <div className="flex justify-center gap-4">
            <a href="https://www.google.com/search?q=GoClean+Aircon+Supplies+Services+Binan+Laguna" target="_blank" rel="noopener noreferrer" className="px-5 py-2 bg-[#1e3a5f] text-white text-sm font-bold rounded hover:bg-[#152d4a] transition-colors">Google Review</a>
            <a href="https://www.facebook.com/gocleanaircon/reviews" target="_blank" rel="noopener noreferrer" className="px-5 py-2 bg-blue-600 text-white text-sm font-bold rounded hover:bg-blue-700 transition-colors">Facebook Review</a>
          </div>
        </div>
      </div>
    </div>
  );
}
