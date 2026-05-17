import { notFound } from 'next/navigation';
import Link from 'next/link';
import { MapPin, CheckCircle, Phone, Star, Clock, Shield } from 'lucide-react';

const cityData: Record<string, {
  city: string;
  region: string;
  headline: string;
  description: string;
  services: string[];
  landmarks: string[];
  responseTime: string;
}> = {
  'santa-rosa': {
    city: 'Santa Rosa',
    region: 'Laguna',
    headline: 'Aircon Cleaning & Repair in Santa Rosa, Laguna',
    description: 'GoClean Aircon provides fast, professional aircon cleaning, repair, and installation services in Santa Rosa, Laguna. As our main service area, we offer same-day and next-day appointments for Santa Rosa residents.',
    services: ['Aircon cleaning & washing', 'Refrigerant recharge', 'Aircon repair & troubleshooting', 'Split-type installation', 'Window-type installation', 'Preventive maintenance'],
    landmarks: ['Nuvali', 'Paseo', 'Walter Mart Santa Rosa', 'Sta. Rosa City Hall', 'Lima Technology Center'],
    responseTime: 'Same day',
  },
  'binan': {
    city: 'Biñan',
    region: 'Laguna',
    headline: 'Aircon Services in Biñan, Laguna',
    description: 'Professional aircon cleaning, installation, and repair in Biñan, Laguna. GoClean services all barangays in Biñan — from Casile to Zapote. Fast response, licensed technicians.',
    services: ['Aircon cleaning & washing', 'Refrigerant recharge', 'Aircon repair', 'Split-type installation', 'Window-type installation', 'Annual maintenance plans'],
    landmarks: ['Biñan City Hall', 'SM City Biñan', 'Southwoods', 'Evia Lifestyle Center'],
    responseTime: 'Same day',
  },
  'calamba': {
    city: 'Calamba',
    region: 'Laguna',
    headline: 'Aircon Cleaning & Installation in Calamba, Laguna',
    description: 'GoClean Aircon serves all of Calamba, Laguna with professional aircon maintenance, repair, and installation. Home of Rizal and home of cool air — we keep your units running efficiently.',
    services: ['Aircon cleaning', 'Repair & troubleshooting', 'Installation (split & window type)', 'Refrigerant refill', 'Commercial AC maintenance'],
    landmarks: ['Calamba City Hall', 'SM Calamba', 'Enchanted Kingdom area', 'Los Baños boundary'],
    responseTime: 'Same day',
  },
  'san-pedro': {
    city: 'San Pedro',
    region: 'Laguna',
    headline: 'Aircon Services in San Pedro, Laguna',
    description: 'Fast and reliable aircon cleaning, repair, and installation in San Pedro, Laguna. GoClean covers all barangays in San Pedro, including areas near the Muntinlupa border.',
    services: ['Aircon general cleaning', 'Refrigerant recharge (R-410A & R-22)', 'Repair & parts replacement', 'New unit installation', 'Preventive maintenance check'],
    landmarks: ['San Pedro City Hall', 'SM Center San Pedro', 'Robinsons San Pedro', 'BF Homes Laguna'],
    responseTime: 'Same-day to next day',
  },
  'bacoor': {
    city: 'Bacoor',
    region: 'Cavite',
    headline: 'Aircon Cleaning & Repair in Bacoor, Cavite',
    description: 'GoClean Aircon provides professional aircon services in Bacoor, Cavite. From Molino to Springville, we cover all areas in Bacoor with certified technicians and quality service.',
    services: ['Aircon cleaning & washing', 'Refrigerant top-up', 'Repair & diagnostics', 'Split-type installation', 'Window-type installation'],
    landmarks: ['SM Bacoor', 'Robinsons Bacoor', 'Molino Boulevard', 'SM City Bacoor'],
    responseTime: '1–2 days',
  },
  'dasmarinas': {
    city: 'Dasmariñas',
    region: 'Cavite',
    headline: 'Aircon Services in Dasmariñas, Cavite',
    description: 'Trusted aircon cleaning, repair, and installation in Dasmariñas, Cavite. GoClean serves Dasma City proper and surrounding subdivisions with reliable, on-time service.',
    services: ['General aircon cleaning', 'Freon recharge', 'Compressor repair', 'New unit installation', 'Preventive maintenance'],
    landmarks: ['SM City Dasmariñas', 'De La Salle University', 'Robinsons Dasmariñas', 'Dasmariñas City Hall'],
    responseTime: '1–2 days',
  },
  'muntinlupa': {
    city: 'Muntinlupa',
    region: 'Metro Manila',
    headline: 'Aircon Cleaning & Repair in Muntinlupa City',
    description: 'Professional aircon services in Muntinlupa — Alabang, Filinvest, Sucat, and all barangays. GoClean technicians are available in Muntinlupa on select days; call to confirm availability.',
    services: ['Aircon general cleaning', 'Deep cleaning & chemical wash', 'Refrigerant refill', 'Repair & troubleshooting', 'Installation'],
    landmarks: ['Alabang Town Center', 'SM Southmall', 'Festival Mall', 'Filinvest City'],
    responseTime: 'Call to confirm',
  },
  'makati': {
    city: 'Makati',
    region: 'Metro Manila',
    headline: 'Aircon Cleaning & Repair in Makati City',
    description: 'GoClean Aircon services residential and commercial units in Makati — from condos in BGC to offices in Ayala Avenue. Available on select days; advance booking recommended.',
    services: ['Condo aircon cleaning', 'Commercial AC maintenance', 'Split-type installation', 'Chemical overhaul', 'Refrigerant recharge'],
    landmarks: ['Ayala Center', 'BGC', 'Greenbelt', 'Rockwell', 'Salcedo Village'],
    responseTime: 'Advance booking',
  },
  'taguig': {
    city: 'Taguig',
    region: 'Metro Manila',
    headline: 'Aircon Services in Taguig City (BGC)',
    description: 'Professional aircon cleaning and installation in Taguig, including Bonifacio Global City (BGC). GoClean handles both residential and commercial units in Taguig on select service days.',
    services: ['Residential aircon cleaning', 'Commercial AC service', 'Installation', 'Refrigerant top-up', 'Preventive maintenance'],
    landmarks: ['Bonifacio Global City', 'Market! Market!', 'Uptown Mall', 'SM Aura'],
    responseTime: 'Advance booking',
  },
  'las-pinas': {
    city: 'Las Piñas',
    region: 'Metro Manila',
    headline: 'Aircon Cleaning & Repair in Las Piñas City',
    description: 'Reliable aircon services in Las Piñas — from Almanza to BF Resort and Pamplona. GoClean covers Las Piñas on scheduled service days with advance booking recommended.',
    services: ['Aircon cleaning', 'Repair & diagnostics', 'New unit installation', 'Refrigerant recharge', 'Annual maintenance'],
    landmarks: ['SM Southmall', 'Robinsons Las Piñas', 'BF Resort Village', 'Alabang-Zapote Road'],
    responseTime: 'Advance booking',
  },
  'antipolo': {
    city: 'Antipolo',
    region: 'Rizal',
    headline: 'Aircon Services in Antipolo, Rizal',
    description: 'GoClean Aircon serves Antipolo, Rizal upon request. Our technicians travel to Antipolo for cleaning, repair, and installation services — advance booking required.',
    services: ['Aircon cleaning & maintenance', 'Repair & troubleshooting', 'Installation', 'Refrigerant refill'],
    landmarks: ['SM City Antipolo', 'Robinsons Antipolo', 'Antipolo Cathedral', 'Sumulong Highway'],
    responseTime: 'Upon request',
  },
};

export async function generateStaticParams() {
  return Object.keys(cityData).map((city) => ({ city }));
}

export async function generateMetadata({ params }: { params: Promise<{ city: string }> }) {
  const { city } = await params;
  const data = cityData[city];
  if (!data) return {};
  return {
    title: `${data.headline} | GoClean Aircon`,
    description: data.description,
  };
}

export default async function CityPage({ params }: { params: Promise<{ city: string }> }) {
  const { city } = await params;
  const data = cityData[city];
  if (!data) notFound();

  return (
    <div className="py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Hero */}
        <div className="bg-gradient-to-br from-[#0f1f5c] to-[#1e3a5f] rounded-2xl p-8 text-white mb-8">
          <div className="flex items-center gap-2 text-blue-300 text-sm mb-3">
            <MapPin size={14} />
            <span>{data.region}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold mb-3">{data.headline}</h1>
          <p className="text-blue-100 text-sm leading-relaxed mb-6">{data.description}</p>
          <div className="flex flex-wrap gap-3">
            <Link href="/book" className="px-5 py-2.5 bg-[#f0a500] text-[#1e3a5f] font-bold rounded-lg text-sm hover:bg-yellow-400 transition-colors">
              Book a Service
            </Link>
            <a href="https://wa.me/639178237205" target="_blank" rel="noopener noreferrer"
              className="px-5 py-2.5 bg-white/10 text-white font-bold rounded-lg text-sm hover:bg-white/20 transition-colors">
              WhatsApp Us
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white border rounded-xl p-5 flex items-start gap-3">
            <Clock size={20} className="text-[#1e3a5f] mt-0.5 shrink-0" />
            <div>
              <div className="font-bold text-[#1e3a5f] text-sm">Response Time</div>
              <div className="text-gray-600 text-sm">{data.responseTime}</div>
            </div>
          </div>
          <div className="bg-white border rounded-xl p-5 flex items-start gap-3">
            <Shield size={20} className="text-[#1e3a5f] mt-0.5 shrink-0" />
            <div>
              <div className="font-bold text-[#1e3a5f] text-sm">Licensed Technicians</div>
              <div className="text-gray-600 text-sm">All jobs covered by warranty</div>
            </div>
          </div>
          <div className="bg-white border rounded-xl p-5 flex items-start gap-3">
            <Phone size={20} className="text-[#1e3a5f] mt-0.5 shrink-0" />
            <div>
              <div className="font-bold text-[#1e3a5f] text-sm">Call / Text</div>
              <div className="text-gray-600 text-sm">0917 823 7205</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Services */}
          <div className="bg-white border rounded-xl p-6">
            <h2 className="font-extrabold text-[#1e3a5f] mb-4">Services Available in {data.city}</h2>
            <div className="space-y-2">
              {data.services.map((s) => (
                <div key={s} className="flex items-center gap-2 text-sm text-gray-700">
                  <CheckCircle size={14} className="text-green-500 shrink-0" />
                  {s}
                </div>
              ))}
            </div>
          </div>

          {/* Areas */}
          <div className="bg-white border rounded-xl p-6">
            <h2 className="font-extrabold text-[#1e3a5f] mb-4">Areas We Cover</h2>
            <div className="flex flex-wrap gap-2 mb-4">
              {data.landmarks.map((l) => (
                <span key={l} className="text-sm bg-blue-50 text-[#1e3a5f] px-3 py-1 rounded-full border border-blue-100">
                  {l}
                </span>
              ))}
            </div>
            <p className="text-xs text-gray-500">We cover all barangays in {data.city}. Not sure if we reach your area? <a href="https://wa.me/639178237205" className="text-[#1e3a5f] font-semibold hover:underline" target="_blank" rel="noopener noreferrer">Ask us on WhatsApp</a>.</p>
          </div>
        </div>

        {/* Reviews snippet */}
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 mb-8">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex gap-0.5">
              {[1,2,3,4,5].map(i => <Star key={i} size={14} className="text-[#f0a500] fill-[#f0a500]" />)}
            </div>
            <span className="text-sm font-semibold text-[#1e3a5f]">Trusted by homeowners in {data.city}</span>
          </div>
          <p className="text-sm text-gray-600 italic">&ldquo;Quick response, professional technicians, and my aircon is running like new. Highly recommend GoClean to anyone in {data.city}!&rdquo;</p>
        </div>

        {/* CTA */}
        <div className="bg-[#0f1f5c] text-white rounded-2xl p-6 text-center">
          <h3 className="font-extrabold text-lg mb-2">Ready to book in {data.city}?</h3>
          <p className="text-blue-200 text-sm mb-4">Fill out our quick booking form or call/WhatsApp us directly.</p>
          <div className="flex justify-center gap-3 flex-wrap">
            <Link href="/book" className="px-6 py-2.5 bg-[#f0a500] text-[#1e3a5f] font-bold rounded-lg text-sm hover:bg-yellow-400 transition-colors">
              Book Online
            </Link>
            <a href="tel:+639178237205" className="px-6 py-2.5 bg-white/10 text-white font-bold rounded-lg text-sm hover:bg-white/20 transition-colors">
              Call Now
            </a>
            <Link href="/service-area" className="px-6 py-2.5 bg-white/10 text-white font-bold rounded-lg text-sm hover:bg-white/20 transition-colors">
              All Service Areas
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
