'use client';

import { useEffect, useState } from 'react';
import { Search, ChevronDown, FileText, Star, Trash2, ExternalLink, MessageSquare } from 'lucide-react';

const STATUSES = ['new', 'screening', 'interview', 'exam', 'job_offer', 'hired', 'rejected'];
const STATUS_LABELS: Record<string, string> = {
  new: 'New', screening: 'Screening', interview: 'Interview',
  exam: 'Practical Exam', job_offer: 'Job Offer', hired: 'Hired', rejected: 'Rejected',
};
const STATUS_COLORS: Record<string, string> = {
  new: 'bg-gray-100 text-gray-700',
  screening: 'bg-blue-100 text-blue-700',
  interview: 'bg-yellow-100 text-yellow-700',
  exam: 'bg-purple-100 text-purple-700',
  job_offer: 'bg-orange-100 text-orange-700',
  hired: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
};

interface App {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  position: string;
  experience: string;
  canDrive: boolean;
  startImmediately: boolean;
  resumeUrl: string | null;
  certUrls: string[];
  coverLetter: string;
  status: string;
  adminNotes: string;
  score: number | null;
  createdAt: string;
}

export default function AdminCareersPage() {
  const [apps, setApps] = useState<App[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPosition, setFilterPosition] = useState('');
  const [selected, setSelected] = useState<App | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/careers');
      if (res.status === 401) { window.location.href = '/admin/login'; return; }
      setApps(await res.json());
    } finally { setLoading(false); }
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  }

  async function patch(id: string, data: Partial<App>) {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/careers/${id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      setApps(prev => prev.map(a => a.id === id ? updated : a));
      if (selected?.id === id) setSelected(updated);
      showToast('Saved');
    } catch { showToast('Failed to save'); }
    finally { setSaving(false); }
  }

  async function deleteApp(id: string) {
    if (!confirm('Delete this application?')) return;
    await fetch(`/api/admin/careers/${id}`, { method: 'DELETE' });
    setApps(prev => prev.filter(a => a.id !== id));
    if (selected?.id === id) setSelected(null);
  }

  const positions = [...new Set(apps.map(a => a.position))].sort();

  const filtered = apps.filter(a => {
    const q = search.toLowerCase();
    const matchSearch = !q || a.name.toLowerCase().includes(q) || a.phone.includes(q) || a.position.toLowerCase().includes(q);
    const matchStatus = !filterStatus || a.status === filterStatus;
    const matchPos = !filterPosition || a.position === filterPosition;
    return matchSearch && matchStatus && matchPos;
  });

  const counts = STATUSES.reduce((acc, s) => {
    acc[s] = apps.filter(a => a.status === s).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {toast && (
        <div className="fixed top-20 right-6 z-50 bg-gray-900 text-white text-sm px-4 py-2 rounded-lg shadow-lg">{toast}</div>
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hiring Pipeline</h1>
          <p className="text-sm text-gray-500 mt-0.5">{apps.length} total application{apps.length !== 1 ? 's' : ''}</p>
        </div>
        <a href="/careers" target="_blank" className="flex items-center gap-1.5 text-sm text-[#0f1f5c] hover:underline">
          <ExternalLink size={14} />View Careers Page
        </a>
      </div>

      {/* Status cards */}
      <div className="grid grid-cols-4 lg:grid-cols-7 gap-2 mb-6">
        {STATUSES.map(s => (
          <button
            key={s}
            onClick={() => setFilterStatus(filterStatus === s ? '' : s)}
            className={`rounded-xl border-2 p-3 text-center transition-colors ${
              filterStatus === s ? 'border-[#0f1f5c] bg-blue-50' : 'border-gray-200 bg-white hover:border-blue-300'
            }`}
          >
            <div className={`text-2xl font-bold ${filterStatus === s ? 'text-[#0f1f5c]' : 'text-gray-900'}`}>{counts[s]}</div>
            <div className={`text-xs mt-0.5 ${filterStatus === s ? 'text-[#0f1f5c] font-semibold' : 'text-gray-500'}`}>{STATUS_LABELS[s]}</div>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text" placeholder="Search by name, phone, position..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={filterPosition} onChange={e => setFilterPosition(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Positions</option>
          {positions.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>

      {/* Table + Detail split */}
      <div className="flex gap-4">
        {/* List */}
        <div className={`${selected ? 'hidden lg:block lg:w-1/2' : 'w-full'}`}>
          {loading ? (
            <div className="text-center py-16 text-gray-400">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-gray-400">No applications found</div>
          ) : (
            <div className="space-y-2">
              {filtered.map(app => (
                <div
                  key={app.id}
                  onClick={() => setSelected(selected?.id === app.id ? null : app)}
                  className={`bg-white rounded-xl border-2 p-4 cursor-pointer transition-colors hover:border-blue-300 ${
                    selected?.id === app.id ? 'border-[#0f1f5c]' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-gray-900">{app.name}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[app.status]}`}>
                          {STATUS_LABELS[app.status]}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500 mt-0.5">{app.position} · {app.phone}</div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        {app.experience === '0' ? 'No experience' : `${app.experience}yr exp`}
                        {app.canDrive ? ' · Has license' : ''}
                        {app.startImmediately ? ' · Start immediately' : ''}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      {app.score !== null && (
                        <div className="flex items-center gap-1 text-yellow-500">
                          <Star size={12} fill="currentColor" />
                          <span className="text-xs font-semibold">{app.score}/10</span>
                        </div>
                      )}
                      <span className="text-xs text-gray-400">{new Date(app.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Detail panel */}
        {selected && (
          <div className="w-full lg:w-1/2 bg-white rounded-xl border-2 border-[#0f1f5c] p-5 h-fit sticky top-20">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900 text-lg">{selected.name}</h2>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 text-xl font-bold">×</button>
            </div>

            {/* Info */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm mb-4">
              <div><span className="text-gray-500">Phone:</span> <span className="font-medium">{selected.phone}</span></div>
              <div><span className="text-gray-500">Email:</span> <span className="font-medium">{selected.email || '—'}</span></div>
              <div><span className="text-gray-500">Position:</span> <span className="font-medium">{selected.position}</span></div>
              <div><span className="text-gray-500">Experience:</span> <span className="font-medium">{selected.experience === '0' ? 'None' : `${selected.experience} yr`}</span></div>
              <div><span className="text-gray-500">Address:</span> <span className="font-medium">{selected.address || '—'}</span></div>
              <div className="flex gap-3">
                {selected.canDrive && <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full">Has License</span>}
                {selected.startImmediately && <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">ASAP Start</span>}
              </div>
            </div>

            {/* Files */}
            {(selected.resumeUrl || selected.certUrls.length > 0) && (
              <div className="mb-4 space-y-1">
                {selected.resumeUrl && (
                  <a href={selected.resumeUrl} target="_blank" className="flex items-center gap-2 text-sm text-[#0f1f5c] hover:underline">
                    <FileText size={14} />View Resume
                  </a>
                )}
                {selected.certUrls.map((url, i) => (
                  <a key={i} href={url} target="_blank" className="flex items-center gap-2 text-sm text-[#0f1f5c] hover:underline">
                    <FileText size={14} />Certificate {i + 1}
                  </a>
                ))}
              </div>
            )}

            {/* Cover Letter */}
            {selected.coverLetter && (
              <div className="mb-4 bg-gray-50 rounded-lg p-3">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 mb-1"><MessageSquare size={12} />Message</div>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{selected.coverLetter}</p>
              </div>
            )}

            {/* Status */}
            <div className="mb-3">
              <label className="block text-xs font-semibold text-gray-500 mb-1">STATUS</label>
              <select
                value={selected.status}
                onChange={e => patch(selected.id, { status: e.target.value })}
                className={`w-full border rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 ${STATUS_COLORS[selected.status]}`}
              >
                {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
              </select>
            </div>

            {/* Score */}
            <div className="mb-3">
              <label className="block text-xs font-semibold text-gray-500 mb-1">SCORE (1–10)</label>
              <input
                type="number" min={1} max={10}
                value={selected.score ?? ''}
                onChange={e => setSelected({ ...selected, score: e.target.value ? parseInt(e.target.value) : null })}
                onBlur={() => patch(selected.id, { score: selected.score })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Rate applicant 1–10"
              />
            </div>

            {/* Notes */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-500 mb-1">ADMIN NOTES</label>
              <textarea
                value={selected.adminNotes}
                onChange={e => setSelected({ ...selected, adminNotes: e.target.value })}
                onBlur={() => patch(selected.id, { adminNotes: selected.adminNotes })}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Internal notes (interview schedule, feedback, etc.)"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <button
                onClick={() => deleteApp(selected.id)}
                className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-700"
              >
                <Trash2 size={14} />Delete
              </button>
              <a
                href={`tel:${selected.phone}`}
                className="bg-[#0f1f5c] text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-900 transition-colors"
              >
                Call Applicant
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
