'use client';
import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Camera, CheckCircle2, ClipboardCheck, ClipboardList, Package, Wrench, Upload } from 'lucide-react';

type Job = {
  id: string; name: string; phone: string; email: string; service: string;
  address: string; preferredDate: string; status: string; notes: string;
  adminNotes: string; unitModel: string; installationDate: string;
  partsUsed: { name: string; qty: number }[] | null; photos: string[];
  preWorkChecklist: { customerSignature?: string } | null;
  installationChecklist: { customerSignature?: string } | null;
};

const STATUS_FLOW = ['pending', 'confirmed', 'completed'];
const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
};

export default function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [parts, setParts] = useState<{ name: string; qty: number }[]>([]);
  const [newPart, setNewPart] = useState({ name: '', qty: 1 });
  const [toast, setToast] = useState('');

  useEffect(() => {
    fetch(`/api/technician/jobs`)
      .then(r => {
        if (r.status === 401) { router.push('/technician/login'); return null; }
        return r.json();
      })
      .then((jobs: Job[] | null) => {
        if (!jobs) return;
        const found = jobs.find(j => j.id === id);
        if (found) { setJob(found); setParts(found.partsUsed || []); }
      })
      .finally(() => setLoading(false));
  }, [id, router]);

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(''), 3000); }

  async function updateStatus(status: string) {
    setSaving(true);
    const res = await fetch(`/api/technician/jobs/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      const updated = await res.json();
      setJob(prev => prev ? { ...prev, status: updated.status } : prev);
      showToast('Status updated!');
    }
    setSaving(false);
  }

  async function saveParts() {
    setSaving(true);
    const res = await fetch(`/api/technician/jobs/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ partsUsed: parts }),
    });
    if (res.ok) showToast('Parts saved!');
    setSaving(false);
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !job) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData });
    if (uploadRes.ok) {
      const { url } = await uploadRes.json();
      const newPhotos = [...job.photos, url];
      const res = await fetch(`/api/technician/jobs/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photos: newPhotos }),
      });
      if (res.ok) {
        setJob(prev => prev ? { ...prev, photos: newPhotos } : prev);
        showToast('Photo uploaded!');
      }
    }
    setUploading(false);
    e.target.value = '';
  }

  function addPart() {
    if (!newPart.name.trim()) return;
    setParts(prev => [...prev, { ...newPart }]);
    setNewPart({ name: '', qty: 1 });
  }

  function removePart(i: number) { setParts(prev => prev.filter((_, idx) => idx !== i)); }

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-400">Loading...</div>;
  if (!job) return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-400">Job not found</div>;

  const currentStep = STATUS_FLOW.indexOf(job.status);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#1e3a5f] text-white px-5 py-4">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <button onClick={() => router.back()} className="p-1.5 hover:bg-white/10 rounded-lg"><ArrowLeft size={18} /></button>
          <div>
            <div className="font-extrabold">{job.name}</div>
            <div className="text-xs text-blue-300">{job.service}</div>
          </div>
          <span className={`ml-auto px-2 py-0.5 rounded-full text-xs font-bold capitalize ${STATUS_COLORS[job.status] ?? 'bg-gray-100 text-gray-500'}`}>{job.status}</span>
        </div>
      </div>

      <div className="max-w-lg mx-auto p-4 space-y-4">
        {/* Job Info */}
        <div className="bg-white border rounded-2xl p-5">
          <h3 className="font-bold text-[#1e3a5f] mb-3 flex items-center gap-2"><Wrench size={15} /> Job Details</h3>
          <div className="space-y-2 text-sm">
            <div><span className="text-gray-500">Customer:</span> <span className="font-medium">{job.name}</span></div>
            <div><span className="text-gray-500">Phone:</span> <span className="font-medium">{job.phone}</span></div>
            <div><span className="text-gray-500">Address:</span> <span className="font-medium">{job.address}</span></div>
            <div><span className="text-gray-500">Schedule:</span> <span className="font-medium">{job.preferredDate}</span></div>
            {job.unitModel && <div><span className="text-gray-500">Unit Model:</span> <span className="font-medium">{job.unitModel}</span></div>}
            {job.installationDate && <div><span className="text-gray-500">Installed:</span> <span className="font-medium">{job.installationDate}</span></div>}
            {job.notes && <div className="p-2 bg-yellow-50 rounded-lg text-xs text-yellow-700">Customer note: {job.notes}</div>}
            {job.adminNotes && <div className="p-2 bg-blue-50 rounded-lg text-xs text-blue-700">Admin note: {job.adminNotes}</div>}
          </div>
        </div>

        {/* Pre-Work Checklist */}
        <button
          onClick={() => router.push(`/technician/jobs/${id}/checklist`)}
          className="w-full bg-white border rounded-2xl p-5 flex items-center gap-3 text-left hover:border-[#1e3a5f]"
        >
          <ClipboardList size={18} className="text-[#1e3a5f]" />
          <div className="flex-1">
            <div className="font-bold text-[#1e3a5f]">Pre-Work Checklist</div>
            <div className="text-xs text-gray-500">Customer & unit info, inspection, customer signature</div>
          </div>
          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${job.preWorkChecklist?.customerSignature ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
            {job.preWorkChecklist?.customerSignature ? 'Completed' : 'Pending'}
          </span>
        </button>

        {/* Installation Checkout */}
        <button
          onClick={() => router.push(`/technician/jobs/${id}/installation-checkout`)}
          className="w-full bg-white border rounded-2xl p-5 flex items-center gap-3 text-left hover:border-[#1e3a5f]"
        >
          <ClipboardCheck size={18} className="text-[#1e3a5f]" />
          <div className="flex-1">
            <div className="font-bold text-[#1e3a5f]">Installation Checkout</div>
            <div className="text-xs text-gray-500">Install checks, system readings, customer signature</div>
          </div>
          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${job.installationChecklist?.customerSignature ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
            {job.installationChecklist?.customerSignature ? 'Completed' : 'Pending'}
          </span>
        </button>

        {/* Status update */}
        <div className="bg-white border rounded-2xl p-5">
          <h3 className="font-bold text-[#1e3a5f] mb-3 flex items-center gap-2"><CheckCircle2 size={15} /> Update Status</h3>
          <div className="flex gap-2">
            {STATUS_FLOW.map((s, i) => (
              <button key={s} onClick={() => updateStatus(s)} disabled={saving || i < currentStep}
                className={`flex-1 py-2 rounded-xl text-xs font-bold capitalize transition-colors ${job.status === s ? 'bg-[#1e3a5f] text-white' : i < currentStep ? 'bg-gray-100 text-gray-300 cursor-not-allowed' : 'bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-[#1e3a5f]'}`}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Parts used */}
        <div className="bg-white border rounded-2xl p-5">
          <h3 className="font-bold text-[#1e3a5f] mb-3 flex items-center gap-2"><Package size={15} /> Parts Used</h3>
          <div className="space-y-2 mb-3">
            {parts.map((p, i) => (
              <div key={i} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg text-sm">
                <span className="flex-1">{p.name}</span>
                <span className="text-gray-500 text-xs">x{p.qty}</span>
                <button onClick={() => removePart(i)} className="text-gray-300 hover:text-red-500 text-xs">✕</button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input value={newPart.name} onChange={e => setNewPart({ ...newPart, name: e.target.value })} placeholder="Part name" className="flex-1 border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-[#1e3a5f]" onKeyDown={e => e.key === 'Enter' && addPart()} />
            <input type="number" min={1} value={newPart.qty} onChange={e => setNewPart({ ...newPart, qty: Number(e.target.value) })} className="w-16 border rounded-lg px-2 py-1.5 text-sm text-center focus:outline-none focus:border-[#1e3a5f]" />
            <button onClick={addPart} className="px-3 py-1.5 bg-[#1e3a5f] text-white text-xs font-bold rounded-lg hover:bg-[#152d4a]">Add</button>
          </div>
          {parts.length > 0 && (
            <button onClick={saveParts} disabled={saving} className="mt-3 w-full py-2 bg-green-600 text-white text-sm font-bold rounded-xl hover:bg-green-700 disabled:opacity-50">
              {saving ? 'Saving...' : 'Save Parts'}
            </button>
          )}
        </div>

        {/* Photos */}
        <div className="bg-white border rounded-2xl p-5">
          <h3 className="font-bold text-[#1e3a5f] mb-3 flex items-center gap-2"><Camera size={15} /> Job Photos</h3>
          {job.photos.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mb-3">
              {job.photos.map((url, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={i} src={url} alt={`Job photo ${i + 1}`} className="w-full h-24 object-cover rounded-xl border" />
              ))}
            </div>
          )}
          <label className={`flex items-center justify-center gap-2 w-full py-3 border-2 border-dashed rounded-xl text-sm font-semibold cursor-pointer transition-colors ${uploading ? 'text-gray-300 border-gray-200' : 'text-[#1e3a5f] border-[#1e3a5f]/30 hover:border-[#1e3a5f] hover:bg-blue-50'}`}>
            {uploading ? <><Upload size={16} className="animate-bounce" /> Uploading...</> : <><Camera size={16} /> {job.photos.length > 0 ? 'Add More Photos' : 'Take / Upload Photo'}</>}
            <input type="file" accept="image/*" capture="environment" onChange={handlePhotoUpload} disabled={uploading} className="hidden" />
          </label>
        </div>
      </div>

      {toast && <div className="fixed bottom-6 inset-x-4 z-[100] bg-[#1e3a5f] text-white px-5 py-3 rounded-xl shadow-lg text-sm font-medium text-center max-w-lg mx-auto">{toast}</div>}
    </div>
  );
}
