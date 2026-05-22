'use client';
import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { MapPin, RefreshCw, Wifi, WifiOff, Briefcase } from 'lucide-react';

const TrackingMap = dynamic(() => import('@/components/admin/TrackingMap'), { ssr: false });

type TechLocation = {
  id: string; name: string; phone: string;
  lastLat: number | null; lastLng: number | null; lastSeen: string | null;
  isOnline: boolean;
  currentJob: { service: string; address: string; preferredDate: string } | null;
};

export default function TrackingPage() {
  const [technicians, setTechnicians] = useState<TechLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchLocations = useCallback(async () => {
    const res = await fetch('/api/admin/tracking');
    const data = await res.json();
    if (Array.isArray(data)) {
      setTechnicians(data);
      setLastUpdated(new Date());
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchLocations();
    const interval = setInterval(fetchLocations, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, [fetchLocations]);

  const online = technicians.filter(t => t.isOnline);
  const withLocation = technicians.filter(t => t.lastLat && t.lastLng);

  return (
    <div className="p-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1e3a5f] flex items-center gap-2">
            <MapPin size={22} /> Technician Tracking
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {online.length} online · {withLocation.length} with location · refreshes every 30s
            {lastUpdated && <span> · updated {lastUpdated.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>}
          </p>
        </div>
        <button onClick={fetchLocations} className="flex items-center gap-2 px-4 py-2 bg-white border rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50">
          <RefreshCw size={15} /> Refresh
        </button>
      </div>

      <div className="flex gap-4 flex-1 min-h-0">
        {/* Map */}
        <div className="flex-1 bg-white border rounded-2xl overflow-hidden" style={{ minHeight: 480 }}>
          {loading ? (
            <div className="h-full flex items-center justify-center text-gray-400">Loading map...</div>
          ) : withLocation.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-3">
              <MapPin size={40} className="opacity-30" />
              <div className="text-center">
                <div className="font-semibold">No active locations</div>
                <div className="text-sm mt-1">Technicians need to enable location sharing on their portal</div>
              </div>
            </div>
          ) : (
            <TrackingMap technicians={withLocation} />
          )}
        </div>

        {/* Sidebar list */}
        <div className="w-72 shrink-0 space-y-3 overflow-y-auto">
          {technicians.length === 0 ? (
            <div className="bg-white border rounded-2xl p-5 text-center text-gray-400 text-sm">No technicians found</div>
          ) : technicians.map(t => (
            <div key={t.id} className="bg-white border rounded-2xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-full bg-[#1e3a5f] text-white flex items-center justify-center font-bold text-sm shrink-0">
                  {t.name[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-[#1e3a5f] text-sm truncate">{t.name}</div>
                  <div className="text-xs text-gray-400">{t.phone}</div>
                </div>
                {t.isOnline
                  ? <span className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full"><Wifi size={10} /> Online</span>
                  : <span className="flex items-center gap-1 text-xs font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full"><WifiOff size={10} /> Offline</span>
                }
              </div>

              {t.currentJob && (
                <div className="flex items-start gap-2 p-2 bg-blue-50 rounded-xl text-xs">
                  <Briefcase size={11} className="text-blue-500 mt-0.5 shrink-0" />
                  <div>
                    <div className="font-semibold text-blue-700">{t.currentJob.service}</div>
                    <div className="text-blue-500 mt-0.5">{t.currentJob.address}</div>
                  </div>
                </div>
              )}

              {t.lastSeen && (
                <div className="mt-2 flex items-center gap-1 text-xs text-gray-400">
                  <MapPin size={10} />
                  Last seen {new Date(t.lastSeen).toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' })}
                </div>
              )}

              {!t.lastLat && (
                <div className="mt-2 text-xs text-gray-400 italic">No location shared yet</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
