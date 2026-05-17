'use client';

import { useState } from 'react';
import { CheckCircle } from 'lucide-react';
import Link from 'next/link';

const services = [
  'Aircon Installation',
  'Aircon Cleaning',
  'Aircon Repair',
  'Preventive Maintenance',
  'Commercial HVAC',
  'Controls & Automation',
  'Other',
];

export default function BookPage() {
  const [form, setForm] = useState({ name: '', phone: '', email: '', address: '', service: '', date: '', notes: '' });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  function field(key: keyof typeof form) {
    return {
      value: form[key],
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
        setForm((f) => ({ ...f, [key]: e.target.value })),
    };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      setSubmitted(true);
    } catch {
      setError('Something went wrong. Please call us at 0917 823 7205.');
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="py-24 px-4 text-center min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <CheckCircle size={72} className="text-green-500 mb-6" />
        <h1 className="text-3xl font-extrabold text-[#0f1f5c] mb-3">Booking Received!</h1>
        <p className="text-gray-600 mb-2 max-w-md">
          Thank you, <strong>{form.name}</strong>! We received your booking request for <strong>{form.service}</strong>.
        </p>
        <p className="text-gray-400 text-sm mb-10">Our team will contact you within 24 hours to confirm.</p>
        <Link href="/" className="px-8 py-3 bg-[#0f1f5c] text-white font-bold rounded-lg hover:bg-[#0a1440] transition-colors">
          Back to Home
        </Link>
      </div>
    );
  }

  const inputClass = 'w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300';

  return (
    <div className="py-16 px-4 bg-gray-50 min-h-screen">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold text-[#0f1f5c] mb-2">Book a Service</h1>
          <p className="text-gray-500">Fill out the form and our team will confirm your booking within 24 hours.</p>
        </div>

        <div className="bg-white border rounded-2xl p-8 shadow-sm">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input required type="text" className={inputClass} placeholder="Juan Dela Cruz" {...field('name')} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                <input required type="tel" className={inputClass} placeholder="+63 9XX XXX XXXX" {...field('phone')} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input type="email" className={inputClass} placeholder="your@email.com" {...field('email')} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Service Address *</label>
              <input required type="text" className={inputClass} placeholder="Unit/House No., Street, Barangay, City" {...field('address')} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Service Needed *</label>
              <select required className={inputClass} {...field('service')}>
                <option value="">Select a service...</option>
                {services.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Date *</label>
              <input required type="date" className={inputClass} {...field('date')} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes</label>
              <textarea rows={3} className={`${inputClass} resize-none`} placeholder="Brand, model, number of units, any specific concerns..." {...field('notes')} />
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#f0a500] text-[#0f1f5c] font-extrabold rounded-lg hover:bg-yellow-400 transition-colors text-base disabled:opacity-60"
            >
              {loading ? 'Sending...' : 'Submit Booking Request'}
            </button>
            <p className="text-center text-xs text-gray-400">We will contact you within 24 hours to confirm your booking.</p>
          </form>
        </div>
      </div>
    </div>
  );
}
