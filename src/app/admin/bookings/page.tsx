'use client';

import { useEffect, useState } from 'react';
import { StickyNote, UserCog, Package, Trash2, Plus, X } from 'lucide-react';

const SERVICES = [
  'Aircon Installation', 'Aircon Cleaning', 'Aircon Repair',
  'Preventive Maintenance', 'Commercial HVAC', 'Controls & Automation', 'Other',
];

const emptyNew = () => ({ name: '', phone: '', email: '', service: '', address: '', date: '', notes: '' });

type Booking = {
  id: string; name: string; phone: string; email: string; service: string;
  address: string; preferredDate: string; notes: string; adminNotes: string;
  status: string; createdAt: string; technicianId: string | null;
  partsUsed: { name: string; qty: number }[] | null; photos: string[];
};

type Technician = { id: string; name: string; active: boolean };

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

export default function AdminBookingsPage() {
  const [bookings, setBookings]     = useState<Booking[]>([]);
  const [techs, setTechs]           = useState<Technician[]>([]);
  const [filter, setFilter]         = useState('All');
  const [updating, setUpdating]     = useState<string | null>(null);
  const [loading, setLoading]       = useState(true);
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [noteText, setNoteText]     = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selected, setSelected]     = useState<Set<string>>(new Set());
  const [confirmIds, setConfirmIds] = useState<string[]>([]);
  const [deleting, setDeleting]     = useState(false);
  const [newModal, setNewModal]     = useState(false);
  const [newForm, setNewForm]       = useState(emptyNew());
  const [creating, setCreating]     = useState(false);
  const [toast, setToast]           = useState('');

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/bookings'),
      fetch('/api/admin/technicians'),
    ]).then(async ([bRes, tRes]) => {
      if (bRes.status === 401) { window.location.href = '/admin/login'; return; }
      if (!bRes.ok || !tRes.ok) return;
      const [bData, tData] = await Promise.all([bRes.json(), tRes.json()]);
      setBookings(bData.bookings ?? []);
      setTechs(Array.isArray(tData) ? tData.filter((t: Technician) => t.active) : []);
    }).finally(() => setLoading(false));
  }, []);

  async function updateField(id: string, field: string, value: unknown) {
    setUpdating(id + field);
    try {
      const res = await fetch(`/api/admin/bookings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: value }),
      });
      if (res.ok) {
        const data = await res.json();
        setBookings(prev => prev.map(b => b.id === id ? { ...b, ...data.booking } : b));
      } else if (res.status === 401) {
        window.location.href = '/admin/login';
      } else {
        showToast('Failed to update — please try again');
      }
    } catch {
      showToast('Network error — please try again');
    } finally {
      setUpdating(null);
    }
  }

  async function deleteBookings(ids: string[]) {
    setDeleting(true);
    const results = await Promise.all(ids.map(id => fetch(`/api/admin/bookings/${id}`, { method: 'DELETE' })));
    if (results.some(r => r.status === 401)) { window.location.href = '/admin/login'; return; }
    setBookings(prev => prev.filter(b => !ids.includes(b.id)));
    setSelected(new Set());
    setConfirmIds([]);
    setDeleting(false);
  }

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(''), 3000); }

  async function handleCreate() {
    const { name, phone, address, service, date } = newForm;
    if (!name.trim() || !phone.trim() || !address.trim() || !service || !date) {
      showToast('Please fill in all required fields'); return;
    }
    setCreating(true);
    const res = await fetch('/api/booking', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: newForm.name.trim(),
        phone: newForm.phone.trim(),
        email: newForm.email.trim(),
        address: newForm.address.trim(),
        service: newForm.service,
        date: newForm.date,
        notes: newForm.notes.trim(),
      }),
    });
    if (res.ok) {
      const [bRes] = await Promise.all([fetch('/api/admin/bookings')]);
      if (bRes.ok) {
        const bData = await bRes.json();
        setBookings(bData.bookings ?? []);
      }
      setNewModal(false);
      setNewForm(emptyNew());
      showToast('Booking created!');
    } else {
      showToast('Failed to create booking');
    }
    setCreating(false);
  }

  async function saveNote(id: string) {
    const res = await fetch(`/api/admin/bookings/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminNotes: noteText }),
    });
    if (res.status === 401) { window.location.href = '/admin/login'; return; }
    setBookings(prev => prev.map(b => b.id === id ? { ...b, adminNotes: noteText } : b));
    setEditingNote(null);
  }

  function toggleSelect(id: string) {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); } else { next.add(id); }
      return next;
    });
  }

  const filtered    = filter === 'All' ? bookings : bookings.filter(b => b.status === filter.toLowerCase());
  const allSelected = filtered.length > 0 && filtered.every(b => selected.has(b.id));
  const someSelected = selected.size > 0;

  function toggleSelectAll() {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map(b => b.id)));
    }
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1e3a5f]">Service Bookings</h1>
          <p className="text-gray-500 text-sm">{bookings.length} bookings total</p>
        </div>
        <div className="flex gap-2 items-center">
          <button onClick={() => { setNewModal(true); setNewForm(emptyNew()); }}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#1e3a5f] text-white text-xs font-bold rounded-lg hover:bg-[#152d4a] transition-colors">
            <Plus size={14} /> New Booking
          </button>
          {['All', 'Pending', 'Confirmed', 'Completed'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-xs rounded-lg border font-medium transition-colors ${filter === f ? 'bg-[#1e3a5f] text-white border-[#1e3a5f]' : 'text-gray-600 border-gray-200 hover:border-[#1e3a5f]'}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Bulk action bar */}
      {someSelected && (
        <div className="flex items-center justify-between bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">
          <span className="text-sm font-medium text-red-700">{selected.size} booking{selected.size > 1 ? 's' : ''} selected</span>
          <div className="flex gap-2">
            <button onClick={() => setSelected(new Set())}
              className="px-3 py-1.5 text-xs text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              Clear
            </button>
            <button onClick={() => setConfirmIds([...selected])}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium">
              <Trash2 size={13} /> Delete Selected
            </button>
          </div>
        </div>
      )}

      {loading ? <div className="text-center py-20 text-gray-400">Loading bookings...</div> :
       filtered.length === 0 ? <div className="text-center py-20 text-gray-400">No bookings found</div> : (
        <>
          {/* Select all row */}
          <div className="flex items-center gap-2 mb-2 px-1">
            <input type="checkbox" checked={allSelected} onChange={toggleSelectAll}
              className="w-4 h-4 rounded accent-[#1e3a5f] cursor-pointer" />
            <span className="text-xs text-gray-400">Select all</span>
          </div>

          <div className="space-y-3">
            {filtered.map(b => (
              <div key={b.id}
                className={`bg-white border rounded-xl p-5 hover:shadow-sm transition-all ${selected.has(b.id) ? 'border-[#1e3a5f] ring-1 ring-[#1e3a5f]/20' : ''}`}>

                <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                  <div className="flex items-start gap-3">
                    <input type="checkbox" checked={selected.has(b.id)} onChange={() => toggleSelect(b.id)}
                      className="mt-1 w-4 h-4 rounded accent-[#1e3a5f] cursor-pointer shrink-0" />
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-bold text-[#1e3a5f]">{b.name}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${statusColors[b.status] ?? 'bg-gray-100 text-gray-500'}`}>{b.status}</span>
                      </div>
                      <div className="text-xs text-gray-400">{b.phone}{b.email ? ` · ${b.email}` : ''}</div>
                    </div>
                  </div>
                  <div className="text-right text-sm">
                    <div className="font-semibold text-[#1e3a5f]">{b.service}</div>
                    <div className="text-xs text-gray-400">{b.preferredDate}</div>
                  </div>
                </div>

                <div className="text-xs text-gray-500 mb-3 pl-7">{b.address}{b.notes ? ` · Notes: ${b.notes}` : ''}</div>

                <div className="pl-7">
                  {/* Technician assignment */}
                  <div className="mb-3 flex items-center gap-2">
                    <UserCog size={13} className="text-gray-400 shrink-0" />
                    <select value={b.technicianId || ''} onChange={e => updateField(b.id, 'technicianId', e.target.value || null)}
                      disabled={!!updating}
                      className="flex-1 border rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-[#1e3a5f] bg-white max-w-xs">
                      <option value="">— Assign Technician —</option>
                      {techs.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                  </div>

                  {/* Admin notes */}
                  <div className="mb-3">
                    {editingNote === b.id ? (
                      <div className="flex gap-2">
                        <textarea autoFocus rows={2} value={noteText} onChange={e => setNoteText(e.target.value)}
                          className="flex-1 text-xs border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
                          placeholder="Internal note (not visible to customer)..." />
                        <div className="flex flex-col gap-1">
                          <button onClick={() => saveNote(b.id)} className="px-3 py-1 text-xs bg-[#1e3a5f] text-white rounded font-medium">Save</button>
                          <button onClick={() => setEditingNote(null)} className="px-3 py-1 text-xs text-gray-500 hover:text-gray-700">Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <button onClick={() => { setEditingNote(b.id); setNoteText(b.adminNotes ?? ''); }}
                        className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-[#1e3a5f] transition-colors">
                        <StickyNote size={13} />
                        {b.adminNotes ? <span className="text-gray-600">{b.adminNotes}</span> : <span>Add note</span>}
                      </button>
                    )}
                  </div>

                  {/* Parts & Photos expand */}
                  {(b.partsUsed?.length || b.photos?.length) ? (
                    <div className="mb-3">
                      <button onClick={() => setExpandedId(expandedId === b.id ? null : b.id)}
                        className="flex items-center gap-1.5 text-xs text-[#1e3a5f] font-semibold hover:underline">
                        <Package size={12} />
                        {expandedId === b.id ? 'Hide details' : `View tech details (${(b.partsUsed?.length || 0)} parts, ${b.photos?.length || 0} photos)`}
                      </button>
                      {expandedId === b.id && (
                        <div className="mt-2 p-3 bg-gray-50 rounded-xl space-y-2">
                          {b.partsUsed && b.partsUsed.length > 0 && (
                            <div>
                              <div className="text-xs font-semibold text-gray-500 mb-1">Parts Used</div>
                              {b.partsUsed.map((p, i) => (
                                <div key={i} className="text-xs text-gray-600">{p.name} × {p.qty}</div>
                              ))}
                            </div>
                          )}
                          {b.photos && b.photos.length > 0 && (
                            <div>
                              <div className="text-xs font-semibold text-gray-500 mb-1">Job Photos</div>
                              <div className="flex gap-2 flex-wrap">
                                {b.photos.map((url, i) => (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img key={i} src={url} alt={`Photo ${i + 1}`} className="w-20 h-20 object-cover rounded-lg border" />
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ) : null}

                  <div className="flex items-center justify-between gap-1">
                    <div className="flex gap-1">
                      <button onClick={() => updateField(b.id, 'status', 'confirmed')}
                        disabled={b.status === 'confirmed' || b.status === 'completed' || !!updating}
                        className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded font-medium hover:bg-blue-200 transition-colors disabled:opacity-40">
                        {updating === b.id + 'status' ? '...' : 'Confirm'}
                      </button>
                      <button onClick={() => updateField(b.id, 'status', 'completed')}
                        disabled={b.status === 'completed' || !!updating}
                        className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded font-medium hover:bg-green-200 transition-colors disabled:opacity-40">
                        Done
                      </button>
                      <button onClick={() => updateField(b.id, 'status', 'cancelled')}
                        disabled={b.status === 'cancelled' || !!updating}
                        className="px-2 py-1 text-xs bg-red-100 text-red-500 rounded font-medium hover:bg-red-200 transition-colors disabled:opacity-40">
                        Cancel
                      </button>
                    </div>
                    <button onClick={() => setConfirmIds([b.id])}
                      className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete booking">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* New Booking modal */}
      {newModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setNewModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-extrabold text-[#1e3a5f] flex items-center gap-2">
                <Plus size={18} /> New Manual Booking
              </h2>
              <button onClick={() => setNewModal(false)}><X size={18} className="text-gray-400 hover:text-gray-600" /></button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs text-gray-500 mb-1">Customer Name *</label>
                  <input value={newForm.name} onChange={e => setNewForm({ ...newForm, name: e.target.value })}
                    placeholder="Juan dela Cruz" className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#1e3a5f]" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Phone *</label>
                  <input value={newForm.phone} onChange={e => setNewForm({ ...newForm, phone: e.target.value })}
                    placeholder="09XX XXX XXXX" className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#1e3a5f]" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Email</label>
                  <input type="email" value={newForm.email} onChange={e => setNewForm({ ...newForm, email: e.target.value })}
                    placeholder="optional" className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#1e3a5f]" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs text-gray-500 mb-1">Service *</label>
                  <select value={newForm.service} onChange={e => setNewForm({ ...newForm, service: e.target.value })}
                    className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#1e3a5f] bg-white">
                    <option value="">— Select service —</option>
                    {SERVICES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs text-gray-500 mb-1">Address *</label>
                  <input value={newForm.address} onChange={e => setNewForm({ ...newForm, address: e.target.value })}
                    placeholder="Full address" className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#1e3a5f]" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs text-gray-500 mb-1">Preferred Date *</label>
                  <input value={newForm.date} onChange={e => setNewForm({ ...newForm, date: e.target.value })}
                    placeholder="e.g. Tomorrow morning, June 5 2PM" className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#1e3a5f]" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs text-gray-500 mb-1">Notes</label>
                  <textarea rows={2} value={newForm.notes} onChange={e => setNewForm({ ...newForm, notes: e.target.value })}
                    placeholder="Additional notes..." className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#1e3a5f] resize-none" />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              <button onClick={() => setNewModal(false)}
                className="flex-1 py-2.5 border border-gray-300 text-gray-600 text-sm font-semibold rounded-xl hover:bg-gray-100">
                Cancel
              </button>
              <button onClick={handleCreate} disabled={creating}
                className="flex-1 py-2.5 bg-[#1e3a5f] text-white text-sm font-bold rounded-xl hover:bg-[#152d4a] disabled:opacity-50">
                {creating ? 'Creating...' : 'Create Booking'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {confirmIds.length > 0 && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <Trash2 size={18} className="text-red-500" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">
                  Delete {confirmIds.length > 1 ? `${confirmIds.length} Bookings` : 'Booking'}?
                </h3>
                <p className="text-xs text-gray-500">This cannot be undone.</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-5">
              {confirmIds.length === 1
                ? <>Are you sure you want to permanently delete the booking for <strong>{bookings.find(b => b.id === confirmIds[0])?.name}</strong>?</>
                : <>Are you sure you want to permanently delete <strong>{confirmIds.length} selected bookings</strong>?</>
              }
            </p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setConfirmIds([])} disabled={deleting}
                className="px-4 py-2 text-sm text-gray-600 border rounded-lg hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button onClick={() => deleteBookings(confirmIds)} disabled={deleting}
                className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-60 font-medium">
                {deleting ? 'Deleting...' : `Yes, Delete${confirmIds.length > 1 ? ` (${confirmIds.length})` : ''}`}
              </button>
            </div>
          </div>
        </div>
      )}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[100] bg-[#1e3a5f] text-white px-5 py-3 rounded-xl shadow-lg text-sm font-medium">
          {toast}
        </div>
      )}
    </div>
  );
}
