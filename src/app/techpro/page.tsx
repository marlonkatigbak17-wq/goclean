'use client';

import { useState } from 'react';
import { Wrench, CheckCircle, AlertTriangle, Calculator, Zap, BookOpen, CreditCard, Smartphone } from 'lucide-react';

const plans = [
  {
    id: 'monthly',
    label: 'Monthly',
    price: 199,
    period: '/month',
    desc: 'Perfect for trying it out',
    badge: null,
  },
  {
    id: 'yearly',
    label: 'Yearly',
    price: 1499,
    period: '/year',
    desc: 'Save ₱889 vs monthly',
    badge: 'Best Value',
  },
];

const features = [
  { icon: AlertTriangle, text: '75+ Error codes — Daikin, LG, Carrier, Midea, AUX' },
  { icon: Calculator, text: 'BTU room size calculator' },
  { icon: Zap, text: 'Refrigerant pressure guide (R22, R32, R410A)' },
  { icon: Wrench, text: 'Service & installation checklists' },
  { icon: BookOpen, text: 'Troubleshooting guide' },
  { icon: CheckCircle, text: 'Lifetime updates' },
];

export default function TechProPayPage() {
  const [plan, setPlan] = useState('yearly');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const selected = plans.find(p => p.id === plan)!;

  async function handlePay() {
    if (!name || !phone) { setError('Name and phone number are required.'); return; }
    if (!/^(09|\+639)\d{9}$/.test(phone.replace(/\s/g, ''))) {
      setError('Enter a valid PH mobile number (e.g. 09171234567)');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/techpro/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, name, phone, email }),
      });
      const data = await res.json();
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        setError(data.error || 'Payment failed. Please try again.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
            <Wrench size={15} /> TechPro Aircon — Premium
          </div>
          <h1 className="text-4xl font-extrabold text-[#1a1a2e] mb-2">Upgrade to Premium</h1>
          <p className="text-gray-500">Full access to all technician tools. Activate instantly after payment.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">

          {/* Features */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-bold text-[#1a1a2e] text-lg mb-4">What you get</h2>
            <div className="space-y-3">
              {features.map((f, i) => {
                const Icon = f.icon;
                return (
                  <div key={i} className="flex items-center gap-3">
                    <div className="bg-green-100 rounded-full p-1.5 shrink-0">
                      <CheckCircle size={14} className="text-green-600" />
                    </div>
                    <span className="text-sm text-gray-700">{f.text}</span>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 bg-blue-50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <Smartphone size={16} className="text-blue-600" />
                <span className="text-sm font-semibold text-blue-800">How it works</span>
              </div>
              <ol className="text-xs text-blue-700 space-y-1 ml-2">
                <li>1. Pay via GCash or credit/debit card</li>
                <li>2. Your license key is sent via SMS instantly</li>
                <li>3. Open TechPro app → Enter key → Unlocked!</li>
              </ol>
            </div>
          </div>

          {/* Payment form */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-bold text-[#1a1a2e] text-lg mb-4">Choose your plan</h2>

            {/* Plan selector */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {plans.map(p => (
                <button
                  key={p.id}
                  onClick={() => setPlan(p.id)}
                  className={`relative border-2 rounded-xl p-3 text-left transition-all ${
                    plan === p.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {p.badge && (
                    <span className="absolute -top-2 left-3 bg-blue-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{p.badge}</span>
                  )}
                  <p className="font-bold text-[#1a1a2e]">{p.label}</p>
                  <p className="text-xl font-extrabold text-blue-600">₱{p.price.toLocaleString()}<span className="text-xs text-gray-400 font-normal">{p.period}</span></p>
                  <p className="text-xs text-gray-500 mt-0.5">{p.desc}</p>
                </button>
              ))}
            </div>

            {/* Form fields */}
            <div className="space-y-3 mb-4">
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">Full Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Juan dela Cruz"
                  className="w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">Mobile Number * <span className="text-gray-400 font-normal">(key will be sent here)</span></label>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="09171234567"
                  className="w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">Email <span className="text-gray-400 font-normal">(optional)</span></label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="juan@email.com"
                  className="w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
            </div>

            {error && <p className="text-red-500 text-xs mb-3 bg-red-50 rounded-lg px-3 py-2">{error}</p>}

            <button
              onClick={handlePay}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <CreditCard size={18} />
              {loading ? 'Redirecting to payment...' : `Pay ₱${selected.price.toLocaleString()} via GCash / Card`}
            </button>
            <p className="text-center text-xs text-gray-400 mt-2">Secured by PayMongo · License key sent via SMS after payment</p>
          </div>
        </div>
      </div>
    </div>
  );
}
