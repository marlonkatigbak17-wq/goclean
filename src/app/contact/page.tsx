import { Phone, Mail, MapPin, Clock, MessageCircle } from 'lucide-react';
import FacebookFeed from '@/components/ui/FacebookFeed';

export default function ContactPage() {
  return (
    <div className="py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-[#1e3a5f] mb-3">Contact Us</h1>
          <p className="text-gray-500">Get in touch for inquiries, quotations, or bookings. We respond within 24 hours.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

          {/* Contact info */}
          <div>
            <h2 className="text-xl font-bold text-[#1e3a5f] mb-6">Get in Touch</h2>
            <div className="space-y-5">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-50 rounded-xl">
                  <MapPin size={20} className="text-[#2563eb]" />
                </div>
                <div>
                  <div className="font-semibold text-[#1e3a5f] text-sm">Address</div>
                  <span className="text-gray-600 text-sm">Seaoil Compound, Gen. Malvar,<br />Brgy. Tubigan, Binan, Laguna</span>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-50 rounded-xl">
                  <Phone size={20} className="text-[#2563eb]" />
                </div>
                <div>
                  <div className="font-semibold text-[#1e3a5f] text-sm">Phone / Viber</div>
                  <a href="tel:+639178237205" className="text-gray-600 hover:text-[#2563eb] transition-colors block text-sm">(0917) 823 7205</a>
                  <a href="tel:+639229121250" className="text-gray-600 hover:text-[#2563eb] transition-colors block text-sm">(0922) 912 1250</a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-50 rounded-xl">
                  <Mail size={20} className="text-[#2563eb]" />
                </div>
                <div>
                  <div className="font-semibold text-[#1e3a5f] text-sm">Email</div>
                  <a href="mailto:gocleanair@gmail.com" className="text-gray-600 hover:text-[#2563eb] transition-colors text-sm">gocleanair@gmail.com</a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-50 rounded-xl">
                  <Clock size={20} className="text-[#2563eb]" />
                </div>
                <div>
                  <div className="font-semibold text-[#1e3a5f] text-sm">Business Hours</div>
                  <span className="text-gray-600 text-sm">Monday – Saturday: 8:00 AM – 6:00 PM</span>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <div className="font-semibold text-[#1e3a5f] text-sm mb-3">Follow &amp; Message Us</div>
              <div className="flex gap-3">
                <a
                  href="https://www.facebook.com/gocleanaircon"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                >
                  <MessageCircle size={16} /> Facebook Page
                </a>
                <a
                  href="https://m.me/gocleanaircon"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
                >
                  <MessageCircle size={16} /> Messenger
                </a>
              </div>
            </div>

            {/* Service area */}
            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-5">
              <div className="font-semibold text-[#1e3a5f] text-sm mb-2">Service Areas</div>
              <p className="text-gray-600 text-sm">Binan, Santa Rosa, Cabuyao, Calamba, San Pedro, Muntinlupa, Las Piñas, Makati, BGC, Ortigas, Pasig, Quezon City, and surrounding areas in Laguna and Metro Manila.</p>
            </div>
          </div>

          {/* Contact form */}
          <div className="bg-gray-50 border rounded-2xl p-8">
            <h2 className="text-xl font-bold text-[#1e3a5f] mb-6">Send a Message</h2>
            <form className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input type="text" className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" placeholder="Your name" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input type="tel" className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" placeholder="09XX XXX XXXX" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" placeholder="your@email.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <select className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300">
                  <option>Service Inquiry</option>
                  <option>Product / Aircon Inquiry</option>
                  <option>Quotation Request</option>
                  <option>Maintenance Contract</option>
                  <option>Complaint / Feedback</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea rows={4} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none" placeholder="How can we help you?" />
              </div>
              <button type="submit" className="w-full py-3 bg-[#1e3a5f] text-white font-bold rounded-lg hover:bg-[#152d4a] transition-colors">
                Send Message
              </button>
            </form>
          </div>
        </div>

        {/* Facebook Feed */}
        <div className="mt-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-[#1e3a5f]">Follow Us on Facebook</h2>
            <p className="text-gray-500 text-sm mt-1">Latest updates, promos, and project photos from GoClean</p>
          </div>
          <div className="flex justify-center">
            <div className="w-full max-w-lg rounded-2xl overflow-hidden shadow-lg border bg-white">
              <FacebookFeed height={500} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
