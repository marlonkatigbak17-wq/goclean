'use client';

import { useEffect, useState } from 'react';
import { StickyNote } from 'lucide-react';

type Booking = {
  id: string;
  name: string;
  phone: string;
  email: string;
  service: string;
  address: string;
  preferredDate: string;
  notes: string;
  adminNotes: string;
  status: string;
  createdAt: string;
};

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filter, setFilter] = useState('All');
  const [updating, setUpdating] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');

  useEffect(() => {
    fetch('/api/admin/bookings')
      .then((r) => r.json())
      .then((d) => setBookings(d.bookings ?? []))
      .finally(() => setLoading(false));
  }, []);

  async function updateStatus(id: string, status: string) {
    setUpdating(id + status);
    const res = await fetch(`/api/admin/bookings/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      const data = await res.json();
      setBookings((prev) => prev.map((b) => b.id === id ? { ...b, status: data.booking.status } : b));
    }
    setUpdating(null);
  }

  async function saveNote(id: string) {
    await fetch(`/api/admin/bookings/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminNotes: noteText }),
    });
    setBookings((prev) => prev.map((b) => b.id === id ? { ...b, adminNotes: noteText } : b));
    setEditingNote(null);
  }

  const filtered = filter === 'All' ? bookings : bookings.filter((b) => b.status === filter.toLowerCase());

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1e3a5f]">Service Bookings</h1>
          <p className="text-gray-500 text-sm">{bookings.length} bookings total</p>
        </div>
        <div className="flex gap-2">
          {['All', 'Pending', 'Confirmed', 'Completed'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-xs rounded-lg border font-medium transition-colors ${
                filter === f ? 'bg-[#1e3a5f] text-white border-[#1e3a5f]' : 'text-gray-600 border-gray-200 hover:border-[#1e3a5f]'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">Loading bookings...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">No bookings found</div>
      ) : (
        <div className="space-y-3">
          {filtered.map((b) => (
            <div key={b.id} className="bg-white border rounded-xl p-5 hover:shadow-sm transition-all">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-bold text-[#1e3a5f]">{b.name}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${statusColors[b.status] ?? 'bg-gray-100 text-gray-500'}`}>{b.status}</span>
                  </div>
                  <div className="text-xs text-gray-400">{b.phone}{b.email ? ` · ${b.email}` : ''}</div>
                </div>
                <div className="text-right text-sm">
                  <div className="font-semibold text-[#1e3a5f]">{b.service}</div>
                  <div className="text-xs text-gray-400">{b.preferredDate}</div>
                </div>
              </div>

              <div className="text-xs text-gray-500 mb-3">{b.address}{b.notes ? ` · Notes: ${b.notes}` : ''}</div>

              {/* Admin notes */}
              <div className="mb-3">
                {editingNote === b.id ? (
                  <div className="flex gap-2">
                    <textarea
                      autoFocus
                      rows={2}
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      className="flex-1 text-xs border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
                      placeholder="Internal note (not visible to customer)..."
                    />
                    <div className="flex flex-col gap-1">
                      <button onClick={() => saveNote(b.id)} className="px-3 py-1 text-xs bg-[#1e3a5f] text-white rounded font-medium">Save</button>
                      <button onClick={() => setEditingNote(null)} className="px-3 py-1 text-xs text-gray-500 hover:text-gray-700">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => { setEditingNote(b.id); setNoteText(b.adminNotes ?? ''); }}
                    className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-[#1e3a5f] transition-colors"
                  >
                    <StickyNote size={13} />
                    {b.adminNotes ? <span className="text-gray-600">{b.adminNotes}</span> : <span>Add note</span>}
                  </button>
                )}
              </div>

              <div className="flex gap-1">
                <button onClick={() => updateStatus(b.id, 'confirmed')} disabled={b.status === 'confirmed' || b.status === 'completed' || !!updating}
                  className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded font-medium hover:bg-blue-200 transition-colors disabled:opacity-40">
                  {updating === b.id + 'confirmed' ? '...' : 'Confirm'}
                </button>
                <button onClick={() => updateStatus(b.id, 'completed')} disabled={b.status === 'completed' || !!updating}
                  className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded font-medium hover:bg-green-200 transition-colors disabled:opacity-40">
                  {updating === b.id + 'completed' ? '...' : 'Done'}
                </button>
                <button onClick={() => updateStatus(b.id, 'cancelled')} disabled={b.status === 'cancelled' || !!updating}
                  className="px-2 py-1 text-xs bg-red-100 text-red-500 rounded font-medium hover:bg-red-200 transition-colors disabled:opacity-40">
                  Cancel
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
