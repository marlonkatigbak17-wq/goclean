'use client';
import { useState, useEffect } from 'react';
import { Plus, X, Check, Phone, Mail, Trash2, Pencil, UserCheck, UserX } from 'lucide-react';

type Technician = {
  id: string; name: string; email: string; phone: string;
  active: boolean; createdAt: string;
  _count?: { bookings: number };
};

const empty = () => ({ name: '', email: '', phone: '', password: '', active: true });

export default function TechniciansPage() {
  const [techs, setTechs] = useState<Technician[]>([]);
  const [loading, setLoading] = useState(true);
  const [panel, setPanel] = useState<(Partial<Technician> & { password?: string }) | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [toast, setToast] = useState('');

  useEffect(() => { fetchTechs(); }, []);

  async function fetchTechs() {
    setLoading(true);
    const res = await fetch('/api/admin/technicians');
    const data = await res.json();
    setTechs(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(''), 3000); }

  async function handleSave() {
    if (!panel) return;
    setSaving(true);
    const url = isNew ? '/api/admin/technicians' : `/api/admin/technicians/${panel.id}`;
    const method = isNew ? 'POST' : 'PUT';
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(panel) });
    if (res.ok) { await fetchTechs(); setPanel(null); showToast(isNew ? 'Technician added!' : 'Technician updated!'); }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    await fetch(`/api/admin/technicians/${id}`, { method: 'DELETE' });
    await fetchTechs(); setDeleteId(null); showToast('Technician removed');
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1e3a5f]">Technicians</h1>
          <p className="text-sm text-gray-400 mt-0.5">{techs.length} technician{techs.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => { setPanel(empty()); setIsNew(true); }} className="flex items-center gap-2 px-4 py-2 bg-[#1e3a5f] text-white text-sm font-bold rounded-lg hover:bg-[#152d4a]">
          <Plus size={16} /> Add Technician
        </button>
      </div>

      {loading ? <div className="text-center py-20 text-gray-400">Loading...</div> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {techs.map(t => (
            <div key={t.id} className="bg-white border rounded-2xl p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-[#1e3a5f] rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {t.name[0].toUpperCase()}
                  </div>
                  <div>
                    <div className="font-bold text-[#1e3a5f]">{t.name}</div>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${t.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {t.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => { setPanel({ ...t, password: '' }); setIsNew(false); }} className="p-1.5 text-gray-400 hover:text-[#1e3a5f] hover:bg-blue-50 rounded-lg"><Pencil size={14} /></button>
                  {deleteId === t.id ? (
                    <>
                      <button onClick={() => handleDelete(t.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"><Check size={14} /></button>
                      <button onClick={() => setDeleteId(null)} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg"><X size={14} /></button>
                    </>
                  ) : (
                    <button onClick={() => setDeleteId(t.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={14} /></button>
                  )}
                </div>
              </div>
              <div className="space-y-1.5 text-sm text-gray-600">
                <div className="flex items-center gap-2"><Mail size={13} className="text-gray-400" /> {t.email}</div>
                {t.phone && <div className="flex items-center gap-2"><Phone size={13} className="text-gray-400" /> {t.phone}</div>}
              </div>
              {t._count && (
                <div className="mt-3 pt-3 border-t text-xs text-gray-400">
                  {t._count.bookings} job{t._count.bookings !== 1 ? 's' : ''} assigned
                </div>
              )}
            </div>
          ))}
          {techs.length === 0 && <div className="col-span-3 text-center py-16 text-gray-400">No technicians yet</div>}
        </div>
      )}

      {panel && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40" onClick={() => setPanel(null)} />
          <div className="relative ml-auto w-full max-w-md bg-white h-full overflow-y-auto shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-white z-10">
              <h2 className="text-lg font-extrabold text-[#1e3a5f]">{isNew ? 'New Technician' : 'Edit Technician'}</h2>
              <button onClick={() => setPanel(null)}><X size={18} className="text-gray-400" /></button>
            </div>
            <div className="flex-1 px-6 py-5 space-y-4">
              {[['Full Name *', 'name', 'text', 'Juan dela Cruz'], ['Email *', 'email', 'email', 'juan@goclean.com'], ['Phone', 'phone', 'text', '09XX XXX XXXX']].map(([label, key, type, ph]) => (
                <div key={key}>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">{label}</label>
                  <input type={type} value={(panel as Record<string, string>)[key] || ''} onChange={e => setPanel({ ...panel, [key]: e.target.value })} placeholder={ph} className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#1e3a5f]" />
                </div>
              ))}
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">{isNew ? 'Password *' : 'New Password (leave blank to keep current)'}</label>
                <input type="password" value={panel.password || ''} onChange={e => setPanel({ ...panel, password: e.target.value })} placeholder="••••••••" className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#1e3a5f]" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Status</label>
                <div className="flex gap-3">
                  {[true, false].map(v => (
                    <button key={String(v)} onClick={() => setPanel({ ...panel, active: v })}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold transition-colors ${panel.active === v ? 'bg-[#1e3a5f] text-white border-[#1e3a5f]' : 'text-gray-600 border-gray-200 hover:border-[#1e3a5f]'}`}>
                      {v ? <UserCheck size={15} /> : <UserX size={15} />} {v ? 'Active' : 'Inactive'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t bg-gray-50 flex gap-3 sticky bottom-0">
              <button onClick={() => setPanel(null)} className="flex-1 py-2.5 border border-gray-300 text-gray-600 text-sm font-semibold rounded-xl hover:bg-gray-100">Cancel</button>
              <button onClick={handleSave} disabled={saving || !panel.name || !panel.email || (isNew && !panel.password)}
                className="flex-1 py-2.5 bg-[#1e3a5f] text-white text-sm font-bold rounded-xl hover:bg-[#152d4a] disabled:opacity-50">
                {saving ? 'Saving...' : isNew ? 'Add Technician' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
      {toast && <div className="fixed bottom-6 right-6 z-[100] bg-[#1e3a5f] text-white px-5 py-3 rounded-xl shadow-lg text-sm font-medium flex items-center gap-2"><Check size={14} className="text-green-400" /> {toast}</div>}
    </div>
  );
}
