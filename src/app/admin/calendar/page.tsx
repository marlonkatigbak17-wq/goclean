'use client';

import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';

type Booking = {
  id: string;
  name: string;
  phone: string;
  service: string;
  address: string;
  preferredDate: string;
  status: string;
};

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  confirmed: 'bg-blue-100 text-blue-700 border-blue-200',
  completed: 'bg-green-100 text-green-700 border-green-200',
  cancelled: 'bg-red-100 text-red-500 border-red-200',
};

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function AdminCalendarPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/bookings')
      .then((r) => r.json())
      .then((d) => setBookings(d.bookings ?? []))
      .finally(() => setLoading(false));
  }, []);

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  }
  function nextMonth() {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  }

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Group bookings by date string (YYYY-MM-DD or the stored preferredDate)
  const byDate: Record<string, Booking[]> = {};
  bookings.forEach((b) => {
    const key = b.preferredDate;
    if (!byDate[key]) byDate[key] = [];
    byDate[key].push(b);
  });

  // Build calendar cells
  const cells: (number | null)[] = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  while (cells.length % 7 !== 0) cells.push(null);

  function dateKey(day: number) {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }

  // Also try matching partial date strings (e.g. "May 15, 2026" format)
  function getBookingsForDay(day: number): Booking[] {
    const iso = dateKey(day);
    const monthName = MONTHS[month];
    return bookings.filter((b) => {
      const d = b.preferredDate;
      return d === iso || d.includes(`${monthName} ${day},`) || d.includes(`${monthName} ${day} `) || d === `${day}/${month + 1}/${year}`;
    });
  }

  const selectedBookings = selected ? getBookingsForDay(parseInt(selected)) : [];
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1e3a5f]">Booking Calendar</h1>
          <p className="text-gray-500 text-sm">{bookings.filter(b => b.status !== 'cancelled').length} active bookings</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={prevMonth} className="p-2 rounded-lg border hover:bg-gray-50 transition-colors"><ChevronLeft size={16} /></button>
          <span className="font-bold text-[#1e3a5f] min-w-[140px] text-center">{MONTHS[month]} {year}</span>
          <button onClick={nextMonth} className="p-2 rounded-lg border hover:bg-gray-50 transition-colors"><ChevronRight size={16} /></button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">Loading bookings...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-2 bg-white border rounded-xl overflow-hidden">
            <div className="grid grid-cols-7 border-b">
              {DAYS.map((d) => (
                <div key={d} className="py-2 text-center text-xs font-semibold text-gray-500">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {cells.map((day, i) => {
                if (!day) return <div key={i} className="min-h-[80px] border-b border-r border-gray-50" />;
                const dayBookings = getBookingsForDay(day);
                const isToday = dateKey(day) === todayKey;
                const isSelected = selected === String(day);
                return (
                  <div
                    key={i}
                    onClick={() => setSelected(isSelected ? null : String(day))}
                    className={`min-h-[80px] p-1.5 border-b border-r border-gray-100 cursor-pointer transition-colors ${isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                  >
                    <div className={`text-xs font-semibold mb-1 w-6 h-6 flex items-center justify-center rounded-full ${isToday ? 'bg-[#1e3a5f] text-white' : 'text-gray-600'}`}>
                      {day}
                    </div>
                    {dayBookings.slice(0, 2).map((b) => (
                      <div key={b.id} className={`text-xs px-1 py-0.5 rounded border mb-0.5 truncate ${statusColors[b.status] ?? 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                        {b.name.split(' ')[0]}
                      </div>
                    ))}
                    {dayBookings.length > 2 && (
                      <div className="text-xs text-gray-400">+{dayBookings.length - 2} more</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Side panel */}
          <div>
            {selected && selectedBookings.length > 0 ? (
              <div className="bg-white border rounded-xl p-5">
                <h2 className="font-bold text-[#1e3a5f] mb-4 flex items-center gap-2">
                  <CalendarDays size={16} />
                  {MONTHS[month]} {selected}
                </h2>
                <div className="space-y-3">
                  {selectedBookings.map((b) => (
                    <div key={b.id} className={`p-3 rounded-lg border ${statusColors[b.status] ?? 'bg-gray-50 border-gray-200'}`}>
                      <div className="font-semibold text-sm">{b.name}</div>
                      <div className="text-xs mt-0.5 opacity-75">{b.phone}</div>
                      <div className="text-xs font-medium mt-1">{b.service}</div>
                      <div className="text-xs mt-0.5 opacity-75 truncate">{b.address}</div>
                      <span className="text-xs font-semibold capitalize mt-1 inline-block">{b.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : selected ? (
              <div className="bg-white border rounded-xl p-5 text-center text-gray-400">
                <CalendarDays size={32} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">No bookings on {MONTHS[month]} {selected}</p>
              </div>
            ) : (
              <div className="bg-white border rounded-xl p-5 text-center text-gray-400">
                <CalendarDays size={32} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">Click a day to see bookings</p>
              </div>
            )}

            {/* Upcoming bookings summary */}
            <div className="mt-4 bg-white border rounded-xl p-5">
              <h3 className="font-bold text-[#1e3a5f] text-sm mb-3">Upcoming Confirmed</h3>
              <div className="space-y-2">
                {bookings
                  .filter((b) => b.status === 'confirmed')
                  .slice(0, 5)
                  .map((b) => (
                    <div key={b.id} className="flex items-start gap-2 text-xs">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                      <div>
                        <div className="font-medium text-[#1e3a5f]">{b.name}</div>
                        <div className="text-gray-400">{b.service} · {b.preferredDate}</div>
                      </div>
                    </div>
                  ))}
                {bookings.filter((b) => b.status === 'confirmed').length === 0 && (
                  <p className="text-xs text-gray-400">No confirmed bookings yet</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
