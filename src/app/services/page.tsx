import Link from 'next/link';
import { Wrench, Wind, Settings, Building2, Zap, CheckCircle } from 'lucide-react';

const services = [
  {
    icon: Wind,
    title: 'Aircon Installation',
    desc: 'Professional installation of split-type, window-type, cassette, and VRF systems for homes and businesses.',
    features: ['All brands and models', 'Proper refrigerant charging', 'Leak test included', 'Warranty on labor'],
  },
  {
    icon: Wrench,
    title: 'Aircon Cleaning',
    desc: 'Deep cleaning of indoor and outdoor units to restore performance and improve indoor air quality.',
    features: ['Coil washing', 'Drain line flushing', 'Fan blade cleaning', 'Filter replacement'],
  },
  {
    icon: Settings,
    title: 'Aircon Repair',
    desc: 'Fast and accurate diagnosis and repair for all aircon problems — from no cooling to electrical faults.',
    features: ['Same-day diagnosis', 'Genuine spare parts', 'Refrigerant refill', 'Compressor service'],
  },
  {
    icon: CheckCircle,
    title: 'Preventive Maintenance',
    desc: 'Scheduled maintenance plans to keep your unit efficient and extend its lifespan.',
    features: ['Quarterly or semi-annual plans', 'Performance report', 'Priority scheduling', 'Reminder service'],
  },
  {
    icon: Building2,
    title: 'Commercial HVAC',
    desc: 'Complete HVAC solutions for offices, malls, hospitals, and industrial facilities.',
    features: ['Chiller systems', 'Cassette and ducted AC', 'VRF/VRV systems', 'AHU maintenance'],
  },
  {
    icon: Zap,
    title: 'Controls & Automation',
    desc: 'Smart thermostats, BMS integration, and building automation for energy-efficient climate control.',
    features: ['BMS integration', 'Smart thermostats', 'Remote monitoring', 'Energy management'],
  },
];

export default function ServicesPage() {
  return (
    <div className="py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-[#1e3a5f] mb-3">Our Services</h1>
          <p className="text-gray-500 max-w-2xl mx-auto">
            From residential aircon cleaning to full commercial HVAC systems — our licensed technicians deliver quality work on every job.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((s) => (
            <div key={s.title} className="border rounded-2xl p-6 hover:shadow-lg transition-all">
              <s.icon className="text-[#2563eb] mb-4" size={32} />
              <h2 className="text-xl font-bold text-[#1e3a5f] mb-2">{s.title}</h2>
              <p className="text-gray-500 text-sm mb-4">{s.desc}</p>
              <ul className="space-y-1.5">
                {s.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle size={14} className="text-green-500 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 bg-[#1e3a5f] rounded-2xl p-10 text-center text-white">
          <h2 className="text-2xl font-bold mb-2">Need a Service?</h2>
          <p className="text-blue-200 mb-6">Book online or call us for a free quotation.</p>
          <Link href="/book" className="px-8 py-3 bg-[#f0a500] text-[#1e3a5f] font-bold rounded hover:bg-yellow-400 transition-colors">
            Book a Service
          </Link>
        </div>
      </div>
    </div>
  );
}
