import Link from 'next/link';
import { Phone, Mail, MapPin, Share2, MessageCircle } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#1a1a2e] text-gray-300">
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

        {/* Brand */}
        <div>
          <div className="text-2xl font-bold mb-1">
            <span className="text-white">GoClean</span>
            <span className="text-[#f0a500]"> Aircon</span>
          </div>
          <div className="text-xs text-blue-300 mb-3">Supplies &amp; Services</div>
          <p className="text-sm text-gray-400 mb-2">
            Authorized Daikin Dealer &amp; Installer. TESDA NC III certified technicians. Serving residential, commercial, and industrial clients since 2016.
          </p>
          <p className="text-xs text-gray-500 mb-4">VAT Reg No. 609-074-194-00000</p>
          <div className="flex gap-3">
            <a
              href="https://www.facebook.com/gocleanaircon"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 bg-blue-700 rounded hover:bg-blue-600 transition-colors"
              aria-label="Facebook"
            >
              <Share2 size={16} />
            </a>
            <a
              href="https://m.me/gocleanaircon"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 bg-green-600 rounded hover:bg-green-500 transition-colors"
              aria-label="Messenger"
            >
              <MessageCircle size={16} />
            </a>
          </div>
        </div>

        {/* Services */}
        <div>
          <h3 className="text-white font-semibold mb-3 text-sm uppercase tracking-wider">Services</h3>
          <ul className="space-y-2 text-sm">
            {['Aircon Installation', 'Aircon Cleaning', 'Aircon Repair', 'Preventive Maintenance', 'Commercial HVAC', 'Chilled Water Installation', 'Controls & Automation'].map((s) => (
              <li key={s}>
                <Link href="/services" className="hover:text-white transition-colors">{s}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Shop */}
        <div>
          <h3 className="text-white font-semibold mb-3 text-sm uppercase tracking-wider">Shop</h3>
          <ul className="space-y-2 text-sm">
            {['Split Type Aircon', 'Window Type Aircon', 'Inverter Units', 'Commercial Systems', 'Aircon Parts', 'HVAC Tools'].map((s) => (
              <li key={s}>
                <Link href="/shop" className="hover:text-white transition-colors">{s}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="text-white font-semibold mb-3 text-sm uppercase tracking-wider">Contact Us</h3>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-2">
              <MapPin size={15} className="mt-0.5 text-[#f0a500] shrink-0" />
              <span>Seaoil Compound, Gen. Malvar, Brgy. Tubigan, Binan, Laguna</span>
            </li>
            <li className="flex items-center gap-2">
              <Phone size={15} className="text-[#f0a500] shrink-0" />
              <div>
                <a href="tel:+639178237205" className="hover:text-white transition-colors block">0917 823 7205</a>
                <a href="tel:+639229121250" className="hover:text-white transition-colors block">0922 912 1250</a>
              </div>
            </li>
            <li className="flex items-center gap-2">
              <Mail size={15} className="text-[#f0a500] shrink-0" />
              <a href="mailto:gocleanair@gmail.com" className="hover:text-white transition-colors">gocleanair@gmail.com</a>
            </li>
          </ul>
          <Link
            href="/book"
            className="mt-5 inline-block px-5 py-2 bg-[#f0a500] text-[#1a1a2e] text-sm font-bold rounded hover:bg-yellow-400 transition-colors"
          >
            Book a Service
          </Link>
        </div>
      </div>

      <div className="border-t border-gray-800 text-center text-xs text-gray-500 py-4">
        © {new Date().getFullYear()} GoClean Aircon Supplies &amp; Services. All rights reserved. | Binan, Laguna, Philippines
      </div>
    </footer>
  );
}
