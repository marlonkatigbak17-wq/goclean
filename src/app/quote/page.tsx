'use client';

import { useState } from 'react';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils';
import { CheckCircle, Zap } from 'lucide-react';

interface QuoteResult {
  hp: string;
  type: string;
  brand: string;
  unitPrice: number;
  installPrice: number;
  slug: string;
  reason: string;
}

function getRecommendation(roomSqm: number, roomType: string, floorCount: number): QuoteResult {
  const adjusted = roomSqm * (roomType === 'kitchen' ? 1.5 : roomType === 'server' ? 2 : 1) * (floorCount > 1 ? 1.1 : 1);

  if (adjusted <= 15) return { hp: '0.75HP', type: 'Window Type', brand: 'Panasonic', unitPrice: 12000, installPrice: 15500, slug: 'panasonic-1hp-window', reason: 'Small room up to 15 sqm — a window type unit is cost-effective and easy to install.' };
  if (adjusted <= 22) return { hp: '1HP', type: 'Split Type', brand: 'Carrier', unitPrice: 22000, installPrice: 27000, slug: 'carrier-1hp-split', reason: 'Standard room 15–22 sqm — a 1HP split type delivers efficient, quiet cooling.' };
  if (adjusted <= 30) return { hp: '1.5HP', type: 'Inverter Split Type', brand: 'Daikin', unitPrice: 38000, installPrice: 43000, slug: 'daikin-1-5hp-inverter', reason: 'Medium room 22–30 sqm — a 1.5HP inverter unit saves up to 50% on electricity vs standard.' };
  if (adjusted <= 45) return { hp: '2HP', type: 'Inverter Split Type', brand: 'Midea', unitPrice: 34000, installPrice: 39500, slug: 'midea-2hp-inverter', reason: 'Large room 30–45 sqm — a 2HP inverter unit ensures fast and even cooling.' };
  return { hp: '2.5HP+', type: 'Cassette / Floor Standing', brand: 'Daikin', unitPrice: 85000, installPrice: 96000, slug: 'daikin-2-5hp-cassette', reason: 'Large commercial space — we recommend a ceiling cassette or floor-standing unit for even air distribution.' };
}

export default function QuotePage() {
  const [roomSqm, setRoomSqm] = useState('');
  const [roomType, setRoomType] = useState('bedroom');
  const [floorCount, setFloorCount] = useState('1');
  const [result, setResult] = useState<QuoteResult | null>(null);

  function handleCalculate(e: React.FormEvent) {
    e.preventDefault();
    const sqm = parseFloat(roomSqm);
    if (!sqm || sqm <= 0) return;
    setResult(getRecommendation(sqm, roomType, parseInt(floorCount)));
  }

  return (
    <div className="py-16 px-4 bg-gray-50 min-h-screen">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold text-[#1e3a5f] mb-2">Free Aircon Quotation</h1>
          <p className="text-gray-500">Tell us about your room and we&apos;ll recommend the right aircon unit for you.</p>
        </div>

        <div className="bg-white border rounded-2xl p-8 shadow-sm mb-6">
          <form onSubmit={handleCalculate} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Room Size (square meters) *</label>
              <input
                type="number"
                required
                min="1"
                max="500"
                value={roomSqm}
                onChange={(e) => setRoomSqm(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                placeholder="e.g. 20"
              />
              <p className="text-xs text-gray-400 mt-1">Measure length × width of your room in meters.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Room Type *</label>
              <select
                value={roomType}
                onChange={(e) => setRoomType(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              >
                <option value="bedroom">Bedroom / Living Room</option>
                <option value="office">Office / Study Room</option>
                <option value="kitchen">Kitchen (heat-generating)</option>
                <option value="server">Server Room / IT Room</option>
                <option value="commercial">Commercial Space</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Floor Number</label>
              <select
                value={floorCount}
                onChange={(e) => setFloorCount(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              >
                <option value="1">Ground Floor</option>
                <option value="2">2nd Floor or higher (roof heat)</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#1e3a5f] text-white font-bold rounded-lg hover:bg-[#152d4a] transition-colors"
            >
              Get Recommendation
            </button>
          </form>
        </div>

        {result && (
          <div className="bg-white border-2 border-[#1e3a5f] rounded-2xl p-8 shadow-md">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle size={20} className="text-green-500" />
              <h2 className="font-bold text-[#1e3a5f]">Our Recommendation</h2>
            </div>

            <div className="bg-blue-50 rounded-xl p-5 mb-5">
              <div className="text-xs text-blue-500 font-medium uppercase tracking-wider mb-1">{result.brand}</div>
              <div className="text-xl font-extrabold text-[#1e3a5f] mb-1">{result.hp} {result.type}</div>
              <p className="text-gray-500 text-sm">{result.reason}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="border rounded-xl p-4 text-center">
                <div className="text-xs text-gray-400 mb-1">Unit Only</div>
                <div className="text-2xl font-extrabold text-[#1e3a5f]">{formatPrice(result.unitPrice)}</div>
              </div>
              <div className="border-2 border-[#f0a500] rounded-xl p-4 text-center">
                <div className="text-xs text-[#f0a500] font-medium mb-1 flex items-center justify-center gap-1">
                  <Zap size={11} /> With Installation
                </div>
                <div className="text-2xl font-extrabold text-[#1e3a5f]">{formatPrice(result.installPrice)}</div>
              </div>
            </div>

            <div className="flex gap-3">
              <Link
                href={`/shop/${result.slug}`}
                className="flex-1 text-center py-3 bg-[#f0a500] text-[#1e3a5f] font-bold rounded-lg hover:bg-yellow-400 transition-colors"
              >
                View Product
              </Link>
              <Link
                href="/book"
                className="flex-1 text-center py-3 border border-[#1e3a5f] text-[#1e3a5f] font-bold rounded-lg hover:bg-[#1e3a5f] hover:text-white transition-colors"
              >
                Book Installation
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
