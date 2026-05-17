import Link from 'next/link';
import { MapPin, CheckCircle, Phone } from 'lucide-react';

const areas = [
  {
    region: 'Laguna',
    cities: ['Santa Rosa', 'Biñan', 'Calamba', 'San Pedro', 'Cabuyao', 'Los Baños', 'Bay', 'Calauan', 'Sta. Cruz'],
    note: 'Main service area — fastest response',
    highlight: true,
  },
  {
    region: 'Cavite',
    cities: ['Bacoor', 'Imus', 'Dasmariñas', 'General Trias', 'Silang', 'Kawit', 'Noveleta'],
    note: 'Available 3-5 days a week',
    highlight: false,
  },
  {
    region: 'Metro Manila',
    cities: ['Muntinlupa', 'Las Piñas', 'Parañaque', 'Pasay', 'Makati', 'Taguig', 'Pasig', 'Mandaluyong', 'Marikina', 'Quezon City'],
    note: 'Available select days — call to confirm',
    highlight: false,
  },
  {
    region: 'Rizal',
    cities: ['Antipolo', 'Cainta', 'Taytay', 'Angono', 'Binangonan'],
    note: 'Available upon request',
    highlight: false,
  },
];

export default function ServiceAreaPage() {
  return (
    <div className="py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-[#0f1f5c] rounded-full mb-4">
            <MapPin size={24} className="text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-[#1e3a5f] mb-2">Service Areas</h1>
          <p className="text-gray-500">We cover Laguna, Cavite, Metro Manila, and Rizal</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-10">
          {areas.map((area) => (
            <div key={area.region} className={`border rounded-2xl p-6 ${area.highlight ? 'border-[#1e3a5f] bg-blue-50' : 'bg-white'}`}>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-extrabold text-[#1e3a5f]">{area.region}</h2>
                {area.highlight && (
                  <span className="text-xs bg-[#1e3a5f] text-white px-2 py-0.5 rounded-full font-semibold">Main Area</span>
                )}
              </div>
              <p className="text-xs text-gray-500 mb-3 italic">{area.note}</p>
              <div className="flex flex-wrap gap-2">
                {area.cities.map((city) => (
                  <span key={city} className="flex items-center gap-1 text-sm text-gray-700 bg-white border rounded-full px-3 py-0.5">
                    <CheckCircle size={11} className="text-green-500 shrink-0" />
                    {city}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Not in list CTA */}
        <div className="bg-gray-50 border rounded-2xl p-6 text-center mb-8">
          <h3 className="font-bold text-[#1e3a5f] mb-1">Not on the list?</h3>
          <p className="text-sm text-gray-500 mb-4">We may still be able to help. Contact us and we will check availability in your area.</p>
          <a
            href="https://wa.me/639178237205"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#25d366] text-white font-bold rounded-lg hover:bg-[#1db954] transition-colors"
          >
            Ask on WhatsApp
          </a>
        </div>

        {/* Contact info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white border rounded-xl p-5 flex items-start gap-4">
            <Phone size={20} className="text-[#1e3a5f] mt-0.5 shrink-0" />
            <div>
              <div className="font-bold text-[#1e3a5f] text-sm">Call / Text</div>
              <div className="text-gray-600 text-sm">0917 823 7205</div>
              <div className="text-gray-600 text-sm">0922 912 1250</div>
            </div>
          </div>
          <div className="bg-[#1e3a5f] text-white rounded-xl p-5 flex items-center justify-between">
            <div>
              <div className="font-bold text-sm mb-1">Ready to book?</div>
              <div className="text-blue-200 text-xs">Schedule your service today</div>
            </div>
            <Link href="/book" className="px-4 py-2 bg-[#f0a500] text-[#1e3a5f] font-bold rounded-lg text-sm hover:bg-yellow-400 transition-colors">
              Book Now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
