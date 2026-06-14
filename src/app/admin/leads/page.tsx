'use client';
import { useState, useEffect, useRef } from 'react';
import { Plus, X, Check, Phone, Mail, Trash2, Pencil, Upload, Download, FileSpreadsheet, AlertCircle } from 'lucide-react';
import * as XLSX from 'xlsx';

type Lead = {
  id: string; name: string; email: string; phone: string;
  source: string; service: string; notes: string; status: string;
  createdAt: string; quotations: { id: string }[];
};

const STATUSES = ['new', 'contacted', 'quoted', 'converted', 'lost'];
const SOURCES  = ['website', 'facebook', 'walk-in', 'referral', 'phone', 'import'];
const STATUS_COLORS: Record<string, string> = {
  new:       'bg-blue-100 text-blue-700',
  contacted: 'bg-yellow-100 text-yellow-700',
  quoted:    'bg-purple-100 text-purple-700',
  converted: 'bg-green-100 text-green-700',
  lost:      'bg-red-100 text-red-600',
};

const empty = () => ({ name: '', email: '', phone: '', source: 'website', service: '', notes: '', status: 'new' });

// ── Column aliases for flexible import ──────────────────────────────────────
function normalise(row: Record<string, unknown>) {
  const get = (...keys: string[]) => {
    for (const k of keys) {
      const found = Object.keys(row).find(r => r.toLowerCase().trim() === k.toLowerCase());
      if (found !== undefined) return String(row[found] ?? '');
    }
    return '';
  };
  return {
    name:    get('name', 'full name', 'customer name', 'client'),
    phone:   get('phone', 'mobile', 'contact', 'number', 'cell'),
    email:   get('email', 'email address', 'e-mail'),
    source:  get('source', 'lead source'),
    service: get('service', 'service type', 'interest', 'inquiry'),
    notes:   get('notes', 'note', 'remarks', 'comment'),
    status:  get('status'),
  };
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [panel, setPanel] = useState<Partial<Lead> | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [filter, setFilter] = useState('all');
  const [toast, setToast] = useState('');

  // Import state
  const [importOpen, setImportOpen]     = useState(false);
  const [importRows, setImportRows]     = useState<ReturnType<typeof normalise>[]>([]);
  const [importFile, setImportFile]     = useState('');
  const [importing, setImporting]       = useState(false);
  const [importResult, setImportResult] = useState<{ imported: number; skipped: number } | null>(null);
  const [importError, setImportError]   = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { fetchLeads(); }, []);

  async function fetchLeads() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/leads');
      if (!res.ok) { if (res.status === 401) window.location.href = '/admin/login'; return; }
      const data = await res.json();
      setLeads(Array.isArray(data) ? data : []);
    } catch { /* network error — leave list empty */ } finally {
      setLoading(false);
    }
  }

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(''), 3000); }

  async function handleSave() {
    if (!panel) return;
    setSaving(true);
    const url    = isNew ? '/api/admin/leads' : `/api/admin/leads/${panel.id}`;
    const method = isNew ? 'POST' : 'PUT';
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(panel) });
    if (res.ok) { await fetchLeads(); setPanel(null); showToast(isNew ? 'Lead added!' : 'Lead updated!'); }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    await fetch(`/api/admin/leads/${id}`, { method: 'DELETE' });
    await fetchLeads(); setDeleteId(null); showToast('Lead deleted');
  }

  // ── Export ────────────────────────────────────────────────────────────────
  function handleExport() {
    const rows = leads.map(l => ({
      Name:    l.name,
      Phone:   l.phone,
      Email:   l.email,
      Source:  l.source,
      Service: l.service,
      Status:  l.status,
      Notes:   l.notes,
      Date:    new Date(l.createdAt).toLocaleDateString('en-PH'),
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    ws['!cols'] = [16,14,22,12,20,12,30,12].map(w => ({ wch: w }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Leads');
    XLSX.writeFile(wb, `goclean-leads-${new Date().toISOString().slice(0,10)}.xlsx`);
  }

  // ── Download blank template ───────────────────────────────────────────────
  function handleTemplate() {
    const ws = XLSX.utils.aoa_to_sheet([
      ['Name', 'Phone', 'Email', 'Source', 'Service', 'Notes', 'Status'],
      ['Juan dela Cruz', '09171234567', 'juan@email.com', 'facebook', 'Aircon Cleaning', '', 'new'],
    ]);
    ws['!cols'] = [18,14,22,12,20,30,10].map(w => ({ wch: w }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Leads Template');
    XLSX.writeFile(wb, 'leads-import-template.xlsx');
  }

  // ── Parse uploaded file ───────────────────────────────────────────────────
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportFile(file.name);
    setImportResult(null);
    setImportError('');
    const reader = new FileReader();
    reader.onload = ev => {
      const wb   = XLSX.read(ev.target?.result, { type: 'array' });
      const ws   = wb.Sheets[wb.SheetNames[0]];
      const raw  = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: '' });
      const rows = raw.map(normalise).filter(r => r.name || r.phone);
      setImportRows(rows);
    };
    reader.readAsArrayBuffer(file);
  }

  // ── Run import ────────────────────────────────────────────────────────────
  async function handleImport() {
    if (!importRows.length) return;
    setImporting(true);
    setImportError('');
    const res  = await fetch('/api/admin/leads/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ leads: importRows }),
    });
    const data = await res.json();
    if (res.ok) {
      setImportResult(data);
      await fetchLeads();
    } else {
      setImportError(data.error || 'Import failed');
    }
    setImporting(false);
  }

  function closeImport() {
    setImportOpen(false);
    setImportRows([]);
    setImportFile('');
    setImportResult(null);
    setImportError('');
    if (fileRef.current) fileRef.current.value = '';
  }

  const filtered = filter === 'all' ? leads : leads.filter(l => l.status === filter);
  const counts   = STATUSES.reduce((acc, s) => ({ ...acc, [s]: leads.filter(l => l.status === s).length }), {} as Record<string, number>);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1e3a5f]">Leads &amp; Inquiries</h1>
          <p className="text-sm text-gray-400 mt-0.5">{leads.length} total leads</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={handleExport} disabled={leads.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-white border text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 disabled:opacity-40">
            <Download size={15} /> Export
          </button>
          <button onClick={() => setImportOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white border text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50">
            <Upload size={15} /> Import Excel
          </button>
          <button onClick={() => { setPanel(empty()); setIsNew(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-[#1e3a5f] text-white text-sm font-bold rounded-lg hover:bg-[#152d4a]">
            <Plus size={16} /> Add Lead
          </button>
        </div>
      </div>

      {/* Status filter */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {['all', ...STATUSES].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold capitalize transition-colors ${filter === s ? 'bg-[#1e3a5f] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {s} {s !== 'all' && counts[s] > 0 && <span className="ml-1">({counts[s]})</span>}
          </button>
        ))}
      </div>

      {loading ? <div className="text-center py-20 text-gray-400">Loading...</div> : (
        <div className="bg-white rounded-2xl border overflow-hidden overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
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

      {/* ── Add / Edit panel ── */}
      {panel && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40" onClick={() => setPanel(null)} />
          <div className="relative ml-auto w-full max-w-md bg-white h-full overflow-y-auto shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-white z-10">
              <h2 className="text-lg font-extrabold text-[#1e3a5f]">{isNew ? 'New Lead' : 'Edit Lead'}</h2>
              <button onClick={() => setPanel(null)}><X size={18} className="text-gray-400" /></button>
            </div>
            <div className="flex-1 px-6 py-5 space-y-4">
              {([['Name *', 'name', 'text', 'Juan dela Cruz'], ['Phone *', 'phone', 'text', '09XX XXX XXXX'], ['Email', 'email', 'email', 'juan@email.com']] as [string,string,string,string][]).map(([label, key, type, ph]) => (
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

      {/* ── Import modal ── */}
      {importOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={closeImport} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <div className="flex items-center gap-2">
                <FileSpreadsheet size={18} className="text-[#1e3a5f]" />
                <h2 className="text-lg font-extrabold text-[#1e3a5f]">Import Leads from Excel</h2>
              </div>
              <button onClick={closeImport}><X size={18} className="text-gray-400" /></button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
              {/* Step 1: template */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
                <FileSpreadsheet size={18} className="text-blue-500 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <div className="font-semibold text-blue-800 text-sm">Step 1 — Use the template (optional)</div>
                  <div className="text-blue-600 text-xs mt-0.5">Download the template to see the required columns: Name, Phone, Email, Source, Service, Notes, Status</div>
                </div>
                <button onClick={handleTemplate} className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700">
                  <Download size={12} /> Template
                </button>
              </div>

              {/* Step 2: upload */}
              <div>
                <div className="font-semibold text-gray-700 text-sm mb-2">Step 2 — Upload your file</div>
                <label className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl p-8 cursor-pointer transition-colors ${importFile ? 'border-green-400 bg-green-50' : 'border-gray-300 hover:border-[#1e3a5f] hover:bg-blue-50'}`}>
                  <Upload size={28} className={importFile ? 'text-green-500' : 'text-gray-400'} />
                  <span className="text-sm font-medium text-gray-600">
                    {importFile ? importFile : 'Click to select .xlsx or .csv file'}
                  </span>
                  {importFile && <span className="text-xs text-green-600 font-semibold">{importRows.length} rows detected</span>}
                  <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleFileChange} />
                </label>
              </div>

              {/* Preview */}
              {importRows.length > 0 && !importResult && (
                <div>
                  <div className="font-semibold text-gray-700 text-sm mb-2">Preview (first 5 rows)</div>
                  <div className="border rounded-xl overflow-hidden overflow-x-auto">
                    <table className="w-full text-xs min-w-[480px]">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          {['Name', 'Phone', 'Email', 'Source', 'Service', 'Status'].map(h => (
                            <th key={h} className="text-left px-3 py-2 font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {importRows.slice(0, 5).map((r, i) => (
                          <tr key={i} className={!r.name || !r.phone ? 'bg-red-50' : ''}>
                            <td className="px-3 py-2">{r.name || <span className="text-red-400 italic">missing</span>}</td>
                            <td className="px-3 py-2">{r.phone || <span className="text-red-400 italic">missing</span>}</td>
                            <td className="px-3 py-2 text-gray-500">{r.email}</td>
                            <td className="px-3 py-2 text-gray-500">{r.source || 'import'}</td>
                            <td className="px-3 py-2 text-gray-500">{r.service}</td>
                            <td className="px-3 py-2 text-gray-500">{r.status || 'new'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {importRows.length > 5 && <p className="text-xs text-gray-400 mt-1 pl-1">…and {importRows.length - 5} more rows</p>}
                  {importRows.some(r => !r.name || !r.phone) && (
                    <div className="flex items-center gap-2 mt-2 text-xs text-red-500">
                      <AlertCircle size={13} /> Rows highlighted in red are missing Name or Phone and will be skipped.
                    </div>
                  )}
                </div>
              )}

              {/* Result */}
              {importResult && (
                <div className="bg-green-50 border border-green-300 rounded-xl p-5 text-center">
                  <Check size={32} className="text-green-500 mx-auto mb-2" />
                  <div className="font-bold text-green-800 text-lg">{importResult.imported} leads imported</div>
                  {importResult.skipped > 0 && <div className="text-green-600 text-sm mt-1">{importResult.skipped} rows skipped (missing Name or Phone)</div>}
                </div>
              )}

              {importError && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
                  <AlertCircle size={15} /> {importError}
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t bg-gray-50 flex gap-3">
              <button onClick={closeImport} className="flex-1 py-2.5 border border-gray-300 text-gray-600 text-sm font-semibold rounded-xl hover:bg-gray-100">
                {importResult ? 'Close' : 'Cancel'}
              </button>
              {!importResult && (
                <button onClick={handleImport} disabled={importing || importRows.length === 0}
                  className="flex-1 py-2.5 bg-[#1e3a5f] text-white text-sm font-bold rounded-xl hover:bg-[#152d4a] disabled:opacity-50 flex items-center justify-center gap-2">
                  {importing ? 'Importing...' : <><Upload size={15} /> Import {importRows.length > 0 ? `${importRows.length} Leads` : ''}</>}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 right-6 z-[100] bg-[#1e3a5f] text-white px-5 py-3 rounded-xl shadow-lg text-sm font-medium flex items-center gap-2">
          <Check size={14} className="text-green-400" /> {toast}
        </div>
      )}
    </div>
  );
}
