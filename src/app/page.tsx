import Link from 'next/link';
import { Wrench, ShoppingBag, Star, CheckCircle, ArrowRight, Phone, ShoppingCart, PackageCheck, Truck, Zap, XCircle, Info } from 'lucide-react';
import { products } from '@/lib/products';
import { formatPrice } from '@/lib/utils';
import ProductImage from '@/components/shop/ProductImage';
import FacebookFeed from '@/components/ui/FacebookFeed';

const services = [
  { title: 'Aircon Installation', desc: 'Professional installation for all AC types and brands.' },
  { title: 'Aircon Cleaning', desc: 'Deep cleaning to restore performance and air quality.' },
  { title: 'Aircon Repair', desc: 'Fast diagnosis and repair for all aircon problems.' },
  { title: 'Preventive Maintenance', desc: 'Regular checkups to keep your unit running efficiently.' },
  { title: 'Commercial HVAC', desc: 'Centralized systems for offices, malls, and buildings.' },
  { title: 'Controls & Automation', desc: 'Smart controls and building automation systems.' },
];

const stats = [
  { value: '2016', label: 'Est. Since' },
  { value: '100+', label: 'Corporate Clients' },
  { value: 'NC III', label: 'TESDA Certified' },
  { value: 'Daikin', label: 'Authorized Dealer' },
];

const howToOrder = [
  {
    step: '01',
    icon: ShoppingBag,
    title: 'Browse & Choose',
    desc: 'Pick from our selection of top aircon brands — Daikin, LG, Carrier, Midea, and more.',
  },
  {
    step: '02',
    icon: ShoppingCart,
    title: 'Add to Cart',
    desc: 'Choose unit only or bundle with professional installation at a discounted rate.',
  },
  {
    step: '03',
    icon: Truck,
    title: 'We Deliver',
    desc: 'Free delivery within Metro Manila and Laguna. We handle the logistics for you.',
  },
  {
    step: '04',
    icon: PackageCheck,
    title: 'Install & Enjoy',
    desc: 'TESDA NC III certified technicians install your unit safely. 30-day service warranty included.',
  },
];

const brandShowcase = [
  { name: 'Daikin', tag: 'Authorized Dealer', color: 'bg-blue-50 border-blue-200 text-blue-700' },
  { name: 'LG', tag: 'Dual Inverter', color: 'bg-red-50 border-red-200 text-red-700' },
  { name: 'Carrier', tag: 'Global Leader', color: 'bg-sky-50 border-sky-200 text-sky-700' },
  { name: 'Midea', tag: 'Wi-Fi Enabled', color: 'bg-green-50 border-green-200 text-green-700' },
  { name: 'Panasonic', tag: 'Nanoe-X Tech', color: 'bg-purple-50 border-purple-200 text-purple-700' },
];

const featuredSlugs = ['daikin-1-5hp-inverter', 'lg-1-5hp-dual-inverter', 'daikin-2-5hp-cassette'];
const featuredProducts = products.filter((p) => featuredSlugs.includes(p.slug));

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative text-white py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src="/hero-bg.png" alt="" className="w-full h-full object-cover object-center" />
          <div className="absolute inset-0 bg-gradient-to-br from-[#1e3a5f]/85 to-[#0f2140]/90" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1">
            <div className="inline-block bg-[#f0a500]/20 text-[#f0a500] text-xs font-semibold px-3 py-1 rounded-full mb-4 uppercase tracking-wider">
              Authorized Daikin Dealer · TESDA NC III Certified · Since 2016
            </div>
            <h1 className="text-4xl lg:text-5xl font-extrabold leading-tight mb-5">
              GoClean Aircon<br />
              <span className="text-[#f0a500]">Supplies &amp; Services</span>
            </h1>
            <p className="text-blue-200 text-lg mb-8 max-w-xl">
              Quality aircon units from top brands — plus expert installation, cleaning, repair, and preventive maintenance by TESDA NC III certified technicians. Serving Binan, Laguna and Metro Manila.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/shop" className="px-6 py-3 bg-[#f0a500] text-[#1e3a5f] font-bold rounded hover:bg-yellow-400 transition-colors flex items-center gap-2">
                <ShoppingBag size={18} /> Shop Aircon Units
              </Link>
              <Link href="/book" className="px-6 py-3 border border-blue-300 text-blue-100 rounded hover:bg-white/10 transition-colors flex items-center gap-2">
                <Wrench size={18} /> Book a Service
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 shrink-0">
            {stats.map((s) => (
              <div key={s.label} className="bg-white/10 backdrop-blur rounded-xl p-5 text-center">
                <div className="text-3xl font-extrabold text-[#f0a500]">{s.value}</div>
                <div className="text-blue-200 text-sm mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust badges */}
      <section className="bg-gray-50 border-b py-6 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-center gap-6 text-sm text-gray-600">
          {['TESDA NC III Certified Technicians', 'Authorized Daikin VRV Expert', 'Free Quotation', 'VAT Registered Business'].map((b) => (
            <div key={b} className="flex items-center gap-2">
              <CheckCircle size={16} className="text-green-500" />
              {b}
            </div>
          ))}
        </div>
      </section>

      {/* Services */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-[#1e3a5f]">Our Services</h2>
            <p className="text-gray-500 mt-2">Professional HVAC solutions for residential and commercial clients</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((s) => (
              <div key={s.title} className="border rounded-xl p-6 hover:shadow-md hover:border-blue-300 transition-all group">
                <Wrench className="text-[#2563eb] mb-3 group-hover:scale-110 transition-transform" size={28} />
                <h3 className="font-bold text-[#1e3a5f] mb-1">{s.title}</h3>
                <p className="text-gray-500 text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/services" className="inline-flex items-center gap-2 text-[#2563eb] font-semibold hover:underline">
              View All Services <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-[#1e3a5f]">Top Picks</h2>
              <p className="text-gray-500 mt-1">Our most popular aircon units — all with optional installation</p>
            </div>
            <Link href="/shop" className="hidden sm:inline-flex items-center gap-1.5 text-[#2563eb] font-semibold hover:underline text-sm">
              View All <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {featuredProducts.map((p, i) => (
              <div key={p.id} className="bg-white border rounded-2xl overflow-hidden hover:shadow-lg transition-all">
                <div className="relative">
                  <ProductImage slug={p.slug} name={p.name} src={p.images?.[0]} className="h-48" />
                  {i === 0 && (
                    <span className="absolute top-3 left-3 bg-[#f0a500] text-[#1e3a5f] text-xs font-bold px-2 py-0.5 rounded-full">
                      Best Seller
                    </span>
                  )}
                  {p.specs.energyEfficiency?.includes('Inverter') && (
                    <span className="absolute top-3 right-3 bg-green-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Zap size={10} /> Inverter
                    </span>
                  )}
                </div>
                <div className="p-5">
                  <div className="text-xs text-gray-400 mb-1">{p.brand} · {p.subcategory}</div>
                  <h3 className="font-bold text-[#1e3a5f] text-sm leading-snug mb-3">{p.name}</h3>
                  <div className="flex items-end justify-between">
                    <div>
                      <div className="text-xl font-extrabold text-[#1e3a5f]">{formatPrice(p.price)}</div>
                      {p.priceWithInstallation && (
                        <div className="text-xs text-gray-400">{formatPrice(p.priceWithInstallation)} with install</div>
                      )}
                    </div>
                    <Link
                      href={`/shop/${p.slug}`}
                      className="px-4 py-2 bg-[#1e3a5f] text-white text-xs font-bold rounded hover:bg-[#152d4a] transition-colors"
                    >
                      View
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-6 sm:hidden">
            <Link href="/shop" className="inline-flex items-center gap-1.5 text-[#2563eb] font-semibold hover:underline text-sm">
              View All Products <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* How to Order */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#1e3a5f]">How to Order</h2>
            <p className="text-gray-500 mt-2">From browse to cool air — in 4 easy steps</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {howToOrder.map((step) => {
              const Icon = step.icon;
              return (
                <div key={step.step} className="relative text-center">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#1e3a5f] text-white mb-4">
                    <Icon size={24} />
                  </div>
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 text-xs font-bold text-[#f0a500] bg-white px-1">
                    STEP {step.step}
                  </div>
                  <h3 className="font-bold text-[#1e3a5f] mb-2">{step.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
                </div>
              );
            })}
          </div>
          <div className="text-center mt-10">
            <Link href="/shop" className="px-8 py-3 bg-[#f0a500] text-[#1e3a5f] font-bold rounded hover:bg-yellow-400 transition-colors inline-flex items-center gap-2">
              <ShoppingBag size={18} /> Start Shopping
            </Link>
          </div>
        </div>
      </section>

      {/* Delivery & Installation Guidelines */}
      <section className="py-16 px-4 bg-[#f8faff] border-y">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-[#1e3a5f]">Delivery &amp; Installation Guidelines</h2>
            <p className="text-gray-500 mt-2 text-sm max-w-2xl mx-auto">
              Delivery and installation schedules are handled separately. Installation is normally scheduled within 2 to 3 working days after product delivery, depending on technician availability and site readiness.
            </p>
          </div>

          {/* Info notices */}
          <div className="space-y-3 mb-8">
            {[
              'For installation scheduling, updates, or concerns, please coordinate directly with the GoClean Aircon Supplies and Service Co. Team.',
              'Any additional charges beyond the selected installation package must be settled directly with the assigned accredited technician.',
              'For safety, quality assurance, and warranty purposes, installation by authorized GoClean technicians is highly recommended.',
              'Additional service charges may apply for locations outside the standard service coverage area.',
            ].map((note, i) => (
              <div key={i} className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
                <Info size={16} className="text-blue-500 shrink-0 mt-0.5" />
                <p className="text-sm text-blue-800">{note}</p>
              </div>
            ))}
          </div>

          {/* Inclusions & Exclusions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Inclusions */}
            <div className="bg-white border border-green-200 rounded-2xl p-6">
              <h3 className="font-bold text-[#1e3a5f] text-base mb-4 flex items-center gap-2">
                <CheckCircle size={18} className="text-green-500" /> Standard Installation Inclusions
              </h3>
              <ul className="space-y-2">
                {[
                  'Up to 10 feet copper pipe and electrical wiring',
                  'Copper pipe insulation',
                  'PVC drain line / drain hose',
                  'L-type mounting bracket',
                  'Refrigerant charging',
                  'Standard installation labor and testing',
                  'Mounting of indoor and outdoor units under standard installation conditions',
                  'Unit testing and operational demonstration',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                    <CheckCircle size={14} className="text-green-400 shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Exclusions */}
            <div className="bg-white border border-red-100 rounded-2xl p-6">
              <h3 className="font-bold text-[#1e3a5f] text-base mb-4 flex items-center gap-2">
                <XCircle size={18} className="text-red-400" /> Standard Installation Exclusions
              </h3>
              <ul className="space-y-2">
                {[
                  'Additional copper pipe and wiring beyond 10 feet',
                  'Electrical outlet and power supply installation',
                  'Circuit breaker installation and electrical upgrades',
                  'Masonry works, glass cutting, carpentry, and civil works',
                  'Wall or ceiling restoration and repainting',
                  'Drain tapping point provision',
                  'Government permits and building clearances',
                  'Additional brackets, platforms, or special mounting requirements',
                  'Out-of-town and non-serviceable area charges',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                    <XCircle size={14} className="text-red-300 shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-6 text-center text-sm text-gray-500">
            For inquiries and assistance, please contact{' '}
            <span className="font-semibold text-[#1e3a5f]">GoClean Aircon Supplies and Service Co.</span>{' '}
            at{' '}
            <a href="tel:+639171178606" className="text-[#2563eb] hover:underline font-medium">0917 117 8606</a>
          </div>
        </div>
      </section>

      {/* Brand Showcase */}
      <section className="py-14 px-4 bg-gray-50 border-y">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-[#1e3a5f]">Brands We Carry</h2>
            <p className="text-gray-500 text-sm mt-1">Authorized dealer and certified installer for top global brands</p>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            {brandShowcase.map((b) => (
              <Link
                key={b.name}
                href={`/shop?brand=${b.name}`}
                className={`border rounded-xl px-6 py-4 text-center hover:shadow-md transition-all min-w-[130px] ${b.color}`}
              >
                <div className="text-xl font-extrabold mb-1">{b.name}</div>
                <div className="text-xs opacity-75">{b.tag}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-[#1e3a5f] mb-2">What Customers Say</h2>
          <div className="flex justify-center gap-1 mb-8">
            {[1,2,3,4,5].map(i => <Star key={i} size={20} className="text-[#f0a500] fill-[#f0a500]" />)}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: 'Nike Factory Store', text: 'GoClean has been our trusted HVAC contractor for multiple branches. Professional and reliable every time.' },
              { name: 'Kumon Learning Center', text: 'We use GoClean for all our branches in Laguna. Fast, clean, and certified technicians.' },
              { name: 'Ayala Malls Solenad', text: 'Excellent chilled water installation work. GoClean team is knowledgeable and professional.' },
            ].map((r) => (
              <div key={r.name} className="bg-gray-50 border rounded-xl p-6 text-left shadow-sm">
                <div className="flex gap-1 mb-3">
                  {[1,2,3,4,5].map(i => <Star key={i} size={14} className="text-[#f0a500] fill-[#f0a500]" />)}
                </div>
                <p className="text-gray-600 text-sm mb-3">&ldquo;{r.text}&rdquo;</p>
                <div className="font-semibold text-[#1e3a5f] text-sm">{r.name}</div>
              </div>
            ))}
          </div>
          <Link href="/reviews" className="mt-6 inline-flex items-center gap-2 text-[#2563eb] font-semibold hover:underline">
            Read All Reviews <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Facebook Feed */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-[#1e3a5f]">Follow Us on Facebook</h2>
            <p className="text-gray-500 mt-2">Stay updated with our latest promos, projects, and announcements</p>
            <a
              href="https://www.facebook.com/gocleanaircon"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-3 text-[#1877F2] font-semibold hover:underline text-sm"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-[#1877F2]"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              facebook.com/gocleanaircon · 1,567 likes
            </a>
          </div>
          <div className="flex justify-center">
            <div className="w-full max-w-lg rounded-2xl overflow-hidden shadow-lg border bg-white">
              <FacebookFeed height={480} />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="bg-[#f0a500] py-12 px-4 text-center">
        <h2 className="text-2xl font-extrabold text-[#1e3a5f] mb-2">Ready to Get Started?</h2>
        <p className="text-[#1e3a5f]/80 mb-6">Book a service or get a free quotation today.</p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/book" className="px-6 py-3 bg-[#1e3a5f] text-white font-bold rounded hover:bg-[#152d4a] transition-colors">
            Book a Service
          </Link>
          <a href="tel:+639171178606" className="px-6 py-3 border-2 border-[#1e3a5f] text-[#1e3a5f] font-bold rounded hover:bg-[#1e3a5f]/10 transition-colors flex items-center gap-2">
            <Phone size={16} /> 0917 117 8606
          </a>
        </div>
      </section>
    </>
  );
}
