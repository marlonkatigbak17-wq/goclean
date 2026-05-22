'use client';
import { useState, useEffect } from 'react';
import { Plus, X, Check, Trash2, Pencil, ShieldCheck, Mail, User, KeyRound } from 'lucide-react';

type AdminUser = { id: string; name: string; email: string; createdAt: string };

const empty = () => ({ name: '', email: '', password: '' });

export default function SettingsPage() {
  const [users, setUsers]     = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [panel, setPanel]     = useState<Partial<AdminUser> & { password?: string } | null>(null);
  const [isNew, setIsNew]     = useState(false);
  const [saving, setSaving]   = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [toast, setToast]     = useState('');
  const [toastErr, setToastErr] = useState(false);
  const [error, setError]     = useState('');

  useEffect(() => { fetchUsers(); }, []);

  async function fetchUsers() {
    setLoading(true);
    const res = await fetch('/api/admin/admin-users');
    const data = await res.json();
    setUsers(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  function showToast(msg: string, err = false) {
    setToast(msg); setToastErr(err);
    setTimeout(() => setToast(''), 3500);
  }

  async function handleSave() {
    if (!panel) return;
    setError('');
    setSaving(true);
    const url    = isNew ? '/api/admin/admin-users' : `/api/admin/admin-users/${panel.id}`;
    const method = isNew ? 'POST' : 'PUT';
    const res  = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(panel) });
    const data = await res.json();
    if (res.ok) {
      await fetchUsers();
      setPanel(null);
      showToast(isNew ? 'Admin user added!' : 'Admin user updated!');
    } else {
      setError(data.error || 'Failed to save');
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    const res  = await fetch(`/api/admin/admin-users/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (res.ok) { await fetchUsers(); showToast('Admin user removed'); }
    else showToast(data.error || 'Failed to delete', true);
    setDeleteId(null);
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1e3a5f] flex items-center gap-2">
            <ShieldCheck size={22} /> Admin Users
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">Manage who can access the admin dashboard</p>
        </div>
        <button onClick={() => { setPanel(empty()); setIsNew(true); setError(''); }}
          className="flex items-center gap-2 px-4 py-2 bg-[#1e3a5f] text-white text-sm font-bold rounded-lg hover:bg-[#152d4a]">
          <Plus size={16} /> Add User
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">Loading...</div>
      ) : (
        <div className="space-y-3">
          {users.map(u => (
            <div key={u.id} className="bg-white border rounded-2xl p-5 flex items-center gap-4">
              <div className="w-11 h-11 rounded-full bg-[#1e3a5f] text-white flex items-center justify-center font-bold text-lg shrink-0">
                {u.name[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-[#1e3a5f]">{u.name}</div>
                <div className="text-sm text-gray-500 flex items-center gap-1"><Mail size={12} /> {u.email}</div>
                <div className="text-xs text-gray-400 mt-0.5">Added {new Date(u.createdAt).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
              </div>
              <div className="flex gap-1 shrink-0">
                <button onClick={() => { setPanel({ ...u, password: '' }); setIsNew(false); setError(''); }}
                  className="p-1.5 text-gray-400 hover:text-[#1e3a5f] hover:bg-blue-50 rounded-lg"><Pencil size={14} /></button>
                {deleteId === u.id ? (
                  <>
                    <button onClick={() => handleDelete(u.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"><Check size={14} /></button>
                    <button onClick={() => setDeleteId(null)} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg"><X size={14} /></button>
                  </>
                ) : (
                  <button onClick={() => setDeleteId(u.id)} disabled={users.length === 1}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          ))}
          {users.length === 0 && (
            <div className="text-center py-16 text-gray-400">No admin users yet</div>
          )}
        </div>
      )}

      {/* Panel */}
      {panel && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40" onClick={() => setPanel(null)} />
          <div className="relative ml-auto w-full max-w-md bg-white h-full overflow-y-auto shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-white z-10">
              <h2 className="text-lg font-extrabold text-[#1e3a5f]">{isNew ? 'New Admin User' : 'Edit Admin User'}</h2>
              <button onClick={() => setPanel(null)}><X size={18} className="text-gray-400" /></button>
            </div>
            <div className="flex-1 px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Full Name *</label>
                <div className="relative">
                  <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" value={panel.name || ''} onChange={e => setPanel({ ...panel, name: e.target.value })}
                    placeholder="Juan dela Cruz" className="w-full border rounded-xl pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:border-[#1e3a5f]" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Email *</label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="email" value={panel.email || ''} onChange={e => setPanel({ ...panel, email: e.target.value })}
                    placeholder="juan@gocleanair.co" className="w-full border rounded-xl pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:border-[#1e3a5f]" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">
                  {isNew ? 'Password *' : 'New Password (leave blank to keep current)'}
                </label>
                <div className="relative">
                  <KeyRound size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="password" value={panel.password || ''} onChange={e => setPanel({ ...panel, password: e.target.value })}
                    placeholder="••••••••" className="w-full border rounded-xl pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:border-[#1e3a5f]" />
                </div>
              </div>
              {error && <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{error}</p>}
            </div>
            <div className="px-6 py-4 border-t bg-gray-50 flex gap-3 sticky bottom-0">
              <button onClick={() => setPanel(null)} className="flex-1 py-2.5 border border-gray-300 text-gray-600 text-sm font-semibold rounded-xl hover:bg-gray-100">Cancel</button>
              <button onClick={handleSave} disabled={saving || !panel.name || !panel.email || (isNew && !panel.password)}
                className="flex-1 py-2.5 bg-[#1e3a5f] text-white text-sm font-bold rounded-xl hover:bg-[#152d4a] disabled:opacity-50">
                {saving ? 'Saving...' : isNew ? 'Add User' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className={`fixed bottom-6 right-6 z-[100] px-5 py-3 rounded-xl shadow-lg text-sm font-medium flex items-center gap-2 ${toastErr ? 'bg-red-600 text-white' : 'bg-[#1e3a5f] text-white'}`}>
          <Check size={14} className={toastErr ? 'text-red-200' : 'text-green-400'} /> {toast}
        </div>
      )}
    </div>
  );
}
