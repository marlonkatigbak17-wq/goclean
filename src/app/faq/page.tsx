'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const faqs = [
  {
    category: 'Cleaning & Maintenance',
    items: [
      { q: 'How often should I clean my aircon?', a: 'For residential units, we recommend cleaning every 3-6 months depending on usage. For commercial units or dusty environments, every 2-3 months. Regular cleaning improves efficiency by up to 30% and extends the life of your unit.' },
      { q: 'What is included in an aircon cleaning service?', a: 'Our standard cleaning includes: washing the filters, cleaning the evaporator coil, cleaning the blower fan, flushing the drain line, checking the refrigerant pressure, and cleaning the outdoor unit. We leave your unit smelling fresh and running efficiently.' },
      { q: 'How long does aircon cleaning take?', a: 'A standard cleaning for one unit takes about 1-1.5 hours. For multiple units, add approximately 45 minutes per additional unit.' },
      { q: 'Do I need to be home during the service?', a: 'Yes, someone needs to be present to allow our technicians access and to confirm the work is completed to your satisfaction.' },
    ],
  },
  {
    category: 'Repair & Installation',
    items: [
      { q: 'My aircon is not cooling. What could be wrong?', a: 'Common causes include: dirty filters (clean or replace), low refrigerant (needs recharging), dirty condenser coil, faulty compressor, or electrical issues. We recommend booking a check-up so our technician can diagnose the exact problem.' },
      { q: 'How long does aircon installation take?', a: 'Standard split-type installation takes 3-4 hours. Window-type installation takes 1-2 hours. This includes mounting the bracket, running copper tubing, electrical connection, and testing.' },
      { q: 'Do you provide installation warranty?', a: 'Yes! We provide a 30-day service warranty on all installations. If any installation-related issues occur within 30 days, we will fix it for free.' },
      { q: 'What brands do you service?', a: 'We service all major brands: Daikin, Carrier, Midea, Panasonic, LG, Samsung, Koppel, Fujidenzo, and more. Our technicians are trained on all types of residential and commercial units.' },
    ],
  },
  {
    category: 'Pricing & Payment',
    items: [
      { q: 'How much does aircon cleaning cost?', a: 'Standard cleaning starts at ₱500 per unit. Prices may vary depending on unit size (HP), type (window or split), and location. Contact us for an exact quote.' },
      { q: 'What payment methods do you accept?', a: 'We accept GCash, Maya, Credit/Debit Card, QR Ph, and cash on-site. Online orders can be paid through our website using PayMongo\'s secure checkout.' },
      { q: 'Do you offer discounts for multiple units?', a: 'Yes! We offer package rates for 3 or more units. Contact us via WhatsApp at 0917 823 7205 to get a custom quote for your home or office.' },
    ],
  },
  {
    category: 'Delivery & Coverage',
    items: [
      { q: 'Where do you deliver aircon units?', a: 'We deliver to Metro Manila, Laguna, Cavite, Rizal, Bulacan, and nearby areas. Contact us for delivery rates outside these areas.' },
      { q: 'How long does delivery take?', a: 'Most orders are delivered within 1-3 business days. For in-stock items with installation, we schedule a date that works for you during checkout.' },
      { q: 'What if the unit is damaged on arrival?', a: 'All units are inspected before delivery. If a unit arrives damaged, contact us immediately at gocleanair@gmail.com with photos and we will arrange a replacement.' },
    ],
  },
];

export default function FAQPage() {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <div className="py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold text-[#1e3a5f] mb-2">Frequently Asked Questions</h1>
          <p className="text-gray-500">Everything you need to know about our services</p>
        </div>

        <div className="space-y-8">
          {faqs.map((section) => (
            <div key={section.category}>
              <h2 className="text-lg font-bold text-[#1e3a5f] mb-3 pb-2 border-b">{section.category}</h2>
              <div className="space-y-2">
                {section.items.map((item) => (
                  <div key={item.q} className="border rounded-xl overflow-hidden">
                    <button
                      onClick={() => setOpen(open === item.q ? null : item.q)}
                      className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors"
                    >
                      <span className="font-medium text-[#1e3a5f] pr-4">{item.q}</span>
                      {open === item.q ? <ChevronUp size={18} className="text-gray-400 shrink-0" /> : <ChevronDown size={18} className="text-gray-400 shrink-0" />}
                    </button>
                    {open === item.q && (
                      <div className="px-5 pb-4 text-sm text-gray-600 leading-relaxed border-t bg-gray-50">
                        <p className="pt-3">{item.a}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 bg-blue-50 border border-blue-200 rounded-2xl p-6 text-center">
          <h3 className="font-bold text-[#1e3a5f] mb-2">Still have questions?</h3>
          <p className="text-sm text-gray-500 mb-4">Our team is ready to help you</p>
          <div className="flex justify-center gap-3">
            <a href="https://wa.me/639178237205" target="_blank" rel="noopener noreferrer"
              className="px-5 py-2.5 bg-[#25d366] text-white font-bold rounded-lg text-sm hover:bg-[#1db954] transition-colors">
              WhatsApp Us
            </a>
            <a href="/book" className="px-5 py-2.5 bg-[#1e3a5f] text-white font-bold rounded-lg text-sm hover:bg-[#152d4a] transition-colors">
              Book a Service
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
