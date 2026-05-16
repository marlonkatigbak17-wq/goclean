export default function BookPage() {
  const services = [
    'Aircon Installation',
    'Aircon Cleaning',
    'Aircon Repair',
    'Preventive Maintenance',
    'Commercial HVAC',
    'Controls & Automation',
    'Other',
  ];

  return (
    <div className="py-16 px-4 bg-gray-50 min-h-screen">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold text-[#1e3a5f] mb-2">Book a Service</h1>
          <p className="text-gray-500">Fill out the form and our team will confirm your booking within 24 hours.</p>
        </div>

        <div className="bg-white border rounded-2xl p-8 shadow-sm">
          <form className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input type="text" required className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" placeholder="Juan Dela Cruz" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                <input type="tel" required className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" placeholder="+63 9XX XXX XXXX" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input type="email" className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" placeholder="your@email.com" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Service Address *</label>
              <input type="text" required className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" placeholder="Unit/House No., Street, Barangay, City" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Service Needed *</label>
              <select required className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300">
                <option value="">Select a service...</option>
                {services.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Date *</label>
              <input type="date" required className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes</label>
              <textarea rows={3} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none" placeholder="Brand, model, number of units, any specific concerns..." />
            </div>

            <button type="submit" className="w-full py-3 bg-[#f0a500] text-[#1e3a5f] font-extrabold rounded-lg hover:bg-yellow-400 transition-colors text-base">
              Submit Booking Request
            </button>
            <p className="text-center text-xs text-gray-400">We will contact you within 24 hours to confirm your booking.</p>
          </form>
        </div>
      </div>
    </div>
  );
}
