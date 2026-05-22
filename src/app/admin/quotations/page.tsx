'use client';
import { useState, useEffect } from 'react';
import { Plus, X, Check, Trash2, Pencil, FileText, Printer } from 'lucide-react';

type QuotationItem = { description: string; qty: number; price: number };
type Quotation = {
  id: string; customerName: string; customerEmail: string; customerPhone: string;
  items: QuotationItem[]; subtotal: number; discount: number; total: number;
  status: string; notes: string; validUntil: string | null; createdAt: string;
  lead?: { name: string } | null;
};

const STATUSES = ['draft', 'sent', 'accepted', 'declined'];
const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-600',
  sent: 'bg-blue-100 text-blue-700',
  accepted: 'bg-green-100 text-green-700',
  declined: 'bg-red-100 text-red-600',
};

const emptyItem = (): QuotationItem => ({ description: '', qty: 1, price: 0 });
const emptyForm = () => ({
  customerName: '', customerEmail: '', customerPhone: '',
  items: [emptyItem()], discount: 0, notes: '', status: 'draft', validUntil: '', leadId: '',
});

export default function QuotationsPage() {
  const [quotes, setQuotes] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [panel, setPanel] = useState<ReturnType<typeof emptyForm> | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [filter, setFilter] = useState('all');
  const [toast, setToast] = useState('');

  useEffect(() => { fetchQuotes(); }, []);

  async function fetchQuotes() {
    setLoading(true);
    const res = await fetch('/api/admin/quotations');
    const data = await res.json();
    setQuotes(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(''), 3000); }

  function openNew() {
    setEditId(null);
    setPanel(emptyForm());
  }

  function openEdit(q: Quotation) {
    setEditId(q.id);
    setPanel({
      customerName: q.customerName, customerEmail: q.customerEmail, customerPhone: q.customerPhone,
      items: q.items as QuotationItem[], discount: q.discount, notes: q.notes,
      status: q.status, validUntil: q.validUntil ? q.validUntil.split('T')[0] : '', leadId: '',
    });
  }

  function setItem(i: number, field: keyof QuotationItem, value: string | number) {
    if (!panel) return;
    const items = [...panel.items];
    items[i] = { ...items[i], [field]: field === 'description' ? value : Number(value) };
    setPanel({ ...panel, items });
  }

  function addItem() { if (panel) setPanel({ ...panel, items: [...panel.items, emptyItem()] }); }
  function removeItem(i: number) {
    if (!panel || panel.items.length === 1) return;
    setPanel({ ...panel, items: panel.items.filter((_, idx) => idx !== i) });
  }

  const subtotal = panel ? panel.items.reduce((s, i) => s + i.qty * i.price, 0) : 0;
  const total = subtotal - (panel?.discount || 0);

  async function handleSave() {
    if (!panel) return;
    setSaving(true);
    const payload = {
      customerName: panel.customerName.trim(),
      customerEmail: panel.customerEmail,
      customerPhone: panel.customerPhone,
      items: panel.items,
      discount: panel.discount,
      notes: panel.notes,
      status: panel.status,
      validUntil: panel.validUntil || null,
      leadId: panel.leadId || null,
    };
    const url = editId ? `/api/admin/quotations/${editId}` : '/api/admin/quotations';
    const method = editId ? 'PUT' : 'POST';
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const data = await res.json();
    if (res.ok) {
      await fetchQuotes();
      setPanel(null);
      showToast(editId ? 'Quotation updated!' : 'Quotation created!');
    } else {
      showToast(`Error: ${data.error || 'Failed to save'}`);
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    await fetch(`/api/admin/quotations/${id}`, { method: 'DELETE' });
    await fetchQuotes(); setDeleteId(null); showToast('Quotation deleted');
  }

  const filtered = filter === 'all' ? quotes : quotes.filter(q => q.status === filter);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1e3a5f]">Quotations</h1>
          <p className="text-sm text-gray-400 mt-0.5">{quotes.length} total quotations</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 px-4 py-2 bg-[#1e3a5f] text-white text-sm font-bold rounded-lg hover:bg-[#152d4a]">
          <Plus size={16} /> New Quotation
        </button>
      </div>

      <div className="flex gap-2 mb-5 flex-wrap">
        {['all', ...STATUSES].map(s => (
          <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1.5 rounded-full text-xs font-bold capitalize transition-colors ${filter === s ? 'bg-[#1e3a5f] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {s}
          </button>
        ))}
      </div>

      {loading ? <div className="text-center py-20 text-gray-400">Loading...</div> : (
        <div className="bg-white rounded-2xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                {['Customer', 'Items', 'Total', 'Status', 'Date', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(q => (
                <tr key={q.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-[#1e3a5f]">{q.customerName}</div>
                    {q.customerPhone && <div className="text-xs text-gray-400">{q.customerPhone}</div>}
                    {q.lead && <div className="text-xs text-purple-500">Lead: {q.lead.name}</div>}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{(q.items as QuotationItem[]).length} item{(q.items as QuotationItem[]).length !== 1 ? 's' : ''}</td>
                  <td className="px-4 py-3 font-bold text-[#1e3a5f]">₱{q.total.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold capitalize ${STATUS_COLORS[q.status]}`}>{q.status}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{new Date(q.createdAt).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => window.open(`/admin/quotations/${q.id}/print`, '_blank')} className="p-1.5 text-gray-400 hover:text-[#1e3a5f] hover:bg-blue-50 rounded-lg" title="Print"><Printer size={14} /></button>
                      <button onClick={() => openEdit(q)} className="p-1.5 text-gray-400 hover:text-[#1e3a5f] hover:bg-blue-50 rounded-lg"><Pencil size={14} /></button>
                      {deleteId === q.id ? (
                        <div className="flex gap-1">
                          <button onClick={() => handleDelete(q.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"><Check size={14} /></button>
                          <button onClick={() => setDeleteId(null)} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg"><X size={14} /></button>
                        </div>
                      ) : (
                        <button onClick={() => setDeleteId(q.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={14} /></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={6} className="text-center py-12 text-gray-400">No quotations found</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {/* Builder panel */}
      {panel && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40" onClick={() => setPanel(null)} />
          <div className="relative ml-auto w-full max-w-2xl bg-white h-full overflow-y-auto shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-white z-10">
              <h2 className="text-lg font-extrabold text-[#1e3a5f] flex items-center gap-2"><FileText size={18} /> {editId ? 'Edit Quotation' : 'New Quotation'}</h2>
              <button onClick={() => setPanel(null)}><X size={18} className="text-gray-400" /></button>
            </div>
            <div className="flex-1 px-6 py-5 space-y-5">
              {/* Customer info */}
              <div>
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Customer Info</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="block text-xs text-gray-500 mb-1">Name *</label>
                    <input value={panel.customerName} onChange={e => setPanel({ ...panel, customerName: e.target.value })} placeholder="Juan dela Cruz" className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#1e3a5f]" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Phone</label>
                    <input value={panel.customerPhone} onChange={e => setPanel({ ...panel, customerPhone: e.target.value })} placeholder="09XX XXX XXXX" className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#1e3a5f]" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Email</label>
                    <input value={panel.customerEmail} onChange={e => setPanel({ ...panel, customerEmail: e.target.value })} placeholder="juan@email.com" className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#1e3a5f]" />
                  </div>
                </div>
              </div>

              {/* Line items */}
              <div>
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Items</h3>
                <div className="space-y-2">
                  <div className="grid grid-cols-12 gap-2 text-xs font-semibold text-gray-400 px-1">
                    <span className="col-span-6">Description</span>
                    <span className="col-span-2 text-center">Qty</span>
                    <span className="col-span-3 text-right">Unit Price</span>
                    <span className="col-span-1" />
                  </div>
                  {panel.items.map((item, i) => (
                    <div key={i} className="grid grid-cols-12 gap-2 items-center">
                      <input value={item.description} onChange={e => setItem(i, 'description', e.target.value)} placeholder="Service or product" className="col-span-6 border rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:border-[#1e3a5f]" />
                      <input type="number" min={1} value={item.qty} onChange={e => setItem(i, 'qty', e.target.value)} className="col-span-2 border rounded-lg px-2 py-1.5 text-sm text-center focus:outline-none focus:border-[#1e3a5f]" />
                      <input type="number" min={0} value={item.price} onChange={e => setItem(i, 'price', e.target.value)} className="col-span-3 border rounded-lg px-2 py-1.5 text-sm text-right focus:outline-none focus:border-[#1e3a5f]" />
                      <button onClick={() => removeItem(i)} className="col-span-1 text-gray-300 hover:text-red-500 flex justify-center"><X size={14} /></button>
                    </div>
                  ))}
                  <button onClick={addItem} className="flex items-center gap-1.5 text-xs text-[#1e3a5f] font-semibold hover:underline mt-1"><Plus size={13} /> Add item</button>
                </div>
              </div>

              {/* Totals */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-sm"><span className="text-gray-500">Subtotal</span><span className="font-medium">₱{subtotal.toLocaleString()}</span></div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Discount (₱)</span>
                  <input type="number" min={0} value={panel.discount} onChange={e => setPanel({ ...panel, discount: Number(e.target.value) })} className="w-28 border rounded-lg px-2 py-1 text-sm text-right focus:outline-none focus:border-[#1e3a5f]" />
                </div>
                <div className="flex justify-between text-base font-bold text-[#1e3a5f] pt-1 border-t"><span>Total</span><span>₱{total.toLocaleString()}</span></div>
              </div>

              {/* Meta */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Status</label>
                  <select value={panel.status} onChange={e => setPanel({ ...panel, status: e.target.value })} className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#1e3a5f] bg-white capitalize">
                    {STATUSES.map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Valid Until</label>
                  <input type="date" value={panel.validUntil} onChange={e => setPanel({ ...panel, validUntil: e.target.value })} className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#1e3a5f]" />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Notes</label>
                <textarea rows={3} value={panel.notes} onChange={e => setPanel({ ...panel, notes: e.target.value })} placeholder="Terms, conditions, or additional info..." className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#1e3a5f] resize-none" />
              </div>
            </div>
            <div className="px-6 py-4 border-t bg-gray-50 flex gap-3 sticky bottom-0">
              <button onClick={() => setPanel(null)} className="flex-1 py-2.5 border border-gray-300 text-gray-600 text-sm font-semibold rounded-xl hover:bg-gray-100">Cancel</button>
              <button onClick={handleSave} disabled={saving || !panel.customerName}
                className="flex-1 py-2.5 bg-[#1e3a5f] text-white text-sm font-bold rounded-xl hover:bg-[#152d4a] disabled:opacity-50">
                {saving ? 'Saving...' : editId ? 'Save Changes' : 'Create Quotation'}
              </button>
            </div>
          </div>
        </div>
      )}
      {toast && <div className="fixed bottom-6 right-6 z-[100] bg-[#1e3a5f] text-white px-5 py-3 rounded-xl shadow-lg text-sm font-medium flex items-center gap-2"><Check size={14} className="text-green-400" /> {toast}</div>}
    </div>
  );
}
