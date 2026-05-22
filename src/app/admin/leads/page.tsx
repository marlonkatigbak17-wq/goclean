'use client';
import { useState, useEffect } from 'react';
import { Plus, X, Check, Phone, Mail, Trash2, Pencil } from 'lucide-react';

type Lead = {
  id: string; name: string; email: string; phone: string;
  source: string; service: string; notes: string; status: string;
  createdAt: string; quotations: { id: string }[];
};

const STATUSES = ['new', 'contacted', 'quoted', 'converted', 'lost'];
const SOURCES = ['website', 'facebook', 'walk-in', 'referral', 'phone'];
const STATUS_COLORS: Record<string, string> = {
  new: 'bg-blue-100 text-blue-700',
  contacted: 'bg-yellow-100 text-yellow-700',
  quoted: 'bg-purple-100 text-purple-700',
  converted: 'bg-green-100 text-green-700',
  lost: 'bg-red-100 text-red-600',
};

const empty = () => ({ name: '', email: '', phone: '', source: 'website', service: '', notes: '', status: 'new' });

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [panel, setPanel] = useState<Partial<Lead> | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [filter, setFilter] = useState('all');
  const [toast, setToast] = useState('');

  useEffect(() => { fetchLeads(); }, []);

  async function fetchLeads() {
    setLoading(true);
    const res = await fetch('/api/admin/leads');
    const data = await res.json();
    setLeads(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(''), 3000); }

  async function handleSave() {
    if (!panel) return;
    setSaving(true);
    const url = isNew ? '/api/admin/leads' : `/api/admin/leads/${panel.id}`;
    const method = isNew ? 'POST' : 'PUT';
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(panel) });
    if (res.ok) { await fetchLeads(); setPanel(null); showToast(isNew ? 'Lead added!' : 'Lead updated!'); }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    await fetch(`/api/admin/leads/${id}`, { method: 'DELETE' });
    await fetchLeads(); setDeleteId(null); showToast('Lead deleted');
  }

  const filtered = filter === 'all' ? leads : leads.filter(l => l.status === filter);
  const counts = STATUSES.reduce((acc, s) => ({ ...acc, [s]: leads.filter(l => l.status === s).length }), {} as Record<string, number>);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1e3a5f]">Leads & Inquiries</h1>
          <p className="text-sm text-gray-400 mt-0.5">{leads.length} total leads</p>
        </div>
        <button onClick={() => { setPanel(empty()); setIsNew(true); }} className="flex items-center gap-2 px-4 py-2 bg-[#1e3a5f] text-white text-sm font-bold rounded-lg hover:bg-[#152d4a]">
          <Plus size={16} /> Add Lead
        </button>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {['all', ...STATUSES].map(s => (
          <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1.5 rounded-full text-xs font-bold capitalize transition-colors ${filter === s ? 'bg-[#1e3a5f] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {s} {s !== 'all' && counts[s] > 0 && <span className="ml-1">({counts[s]})</span>}
          </button>
        ))}
      </div>

      {loading ? <div className="text-center py-20 text-gray-400">Loading...</div> : (
        <div className="bg-white rounded-2xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                {['Name', 'Contact', 'Source', 'Service', 'Status', 'Date', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(l => (
                <tr key={l.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-semibold text-[#1e3a5f]">{l.name}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 text-gray-600"><Phone size={11} /> {l.phone}</div>
                    {l.email && <div className="flex items-center gap-1 text-gray-400 text-xs mt-0.5"><Mail size={11} /> {l.email}</div>}
                  </td>
                  <td className="px-4 py-3 text-gray-500 capitalize">{l.source}</td>
                  <td className="px-4 py-3 text-gray-600">{l.service || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold capitalize ${STATUS_COLORS[l.status]}`}>{l.status}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{new Date(l.createdAt).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => { setPanel({ ...l }); setIsNew(false); }} className="p-1.5 text-gray-400 hover:text-[#1e3a5f] hover:bg-blue-50 rounded-lg"><Pencil size={14} /></button>
                      {deleteId === l.id ? (
                        <div className="flex gap-1">
                          <button onClick={() => handleDelete(l.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"><Check size={14} /></button>
                          <button onClick={() => setDeleteId(null)} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg"><X size={14} /></button>
                        </div>
                      ) : (
                        <button onClick={() => setDeleteId(l.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={14} /></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={7} className="text-center py-12 text-gray-400">No leads found</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {/* Panel */}
      {panel && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40" onClick={() => setPanel(null)} />
          <div className="relative ml-auto w-full max-w-md bg-white h-full overflow-y-auto shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-white z-10">
              <h2 className="text-lg font-extrabold text-[#1e3a5f]">{isNew ? 'New Lead' : 'Edit Lead'}</h2>
              <button onClick={() => setPanel(null)}><X size={18} className="text-gray-400" /></button>
            </div>
            <div className="flex-1 px-6 py-5 space-y-4">
              {[['Name *', 'name', 'text', 'Juan dela Cruz'], ['Phone *', 'phone', 'text', '09XX XXX XXXX'], ['Email', 'email', 'email', 'juan@email.com']].map(([label, key, type, ph]) => (
                <div key={key}>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">{label}</label>
                  <input type={type} value={(panel as Record<string, string>)[key] || ''} onChange={e => setPanel({ ...panel, [key]: e.target.value })} placeholder={ph} className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#1e3a5f]" />
                </div>
              ))}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Source</label>
                  <select value={panel.source || 'website'} onChange={e => setPanel({ ...panel, source: e.target.value })} className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#1e3a5f] bg-white capitalize">
                    {SOURCES.map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Status</label>
                  <select value={panel.status || 'new'} onChange={e => setPanel({ ...panel, status: e.target.value })} className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#1e3a5f] bg-white capitalize">
                    {STATUSES.map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Service Interested In</label>
                <input type="text" value={panel.service || ''} onChange={e => setPanel({ ...panel, service: e.target.value })} placeholder="e.g. Aircon cleaning, Installation" className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#1e3a5f]" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Notes</label>
                <textarea rows={4} value={panel.notes || ''} onChange={e => setPanel({ ...panel, notes: e.target.value })} placeholder="Any additional notes..." className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#1e3a5f] resize-none" />
              </div>
            </div>
            <div className="px-6 py-4 border-t bg-gray-50 flex gap-3 sticky bottom-0">
              <button onClick={() => setPanel(null)} className="flex-1 py-2.5 border border-gray-300 text-gray-600 text-sm font-semibold rounded-xl hover:bg-gray-100">Cancel</button>
              <button onClick={handleSave} disabled={saving || !panel.name || !panel.phone} className="flex-1 py-2.5 bg-[#1e3a5f] text-white text-sm font-bold rounded-xl hover:bg-[#152d4a] disabled:opacity-50">
                {saving ? 'Saving...' : isNew ? 'Add Lead' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
      {toast && <div className="fixed bottom-6 right-6 z-[100] bg-[#1e3a5f] text-white px-5 py-3 rounded-xl shadow-lg text-sm font-medium flex items-center gap-2"><Check size={14} className="text-green-400" /> {toast}</div>}
    </div>
  );
}
