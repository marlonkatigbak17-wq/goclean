'use client';
import { useState, useEffect, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ClipboardList, Eraser } from 'lucide-react';
import SignaturePad, { SignaturePadHandle } from '@/components/technician/SignaturePad';

type Job = {
  id: string; name: string; phone: string; address: string;
  unitModel: string; preWorkChecklist: ChecklistData | null;
};

type ChecklistData = {
  fields: Record<string, string>;
  items: Record<string, boolean>;
  remarks: string;
  customerSignature: string;
  signedAt: string;
};

const FIELD_DEFS: { key: string; label: string }[] = [
  { key: 'customerName', label: 'Customer name' },
  { key: 'siteAddress', label: 'Site address' },
  { key: 'contactNumber', label: 'Contact number' },
  { key: 'dateOfService', label: 'Date of service' },
  { key: 'technicianName', label: 'Technician name' },
  { key: 'brandModel', label: 'Aircon brand/model' },
  { key: 'capacityHp', label: 'Aircon capacity (HP)' },
  { key: 'serialNumber', label: 'Serial number (if applicable)' },
];

const SECTIONS: { title: string; items: string[] }[] = [
  {
    title: '2. Initial Unit Inspection',
    items: [
      'Check overall condition of indoor unit',
      'Check overall condition of outdoor unit',
      'Inspect for physical damage/cracks',
      'Check mounting brackets and supports',
      'Check drain pan condition',
      'Check drain hose condition',
      'Check insulation condition',
    ],
  },
  {
    title: '3. Electrical Inspection',
    items: [
      'Check power supply voltage',
      'Check circuit breaker condition',
      'Check electrical wiring connections',
      'Check terminals for loose connections',
      'Check indoor PCB condition',
      'Check outdoor PCB condition',
    ],
  },
  {
    title: '4. Operational Check (Before Cleaning)',
    items: [
      'Turn unit ON and test operation',
      'Measure return air temperature',
      'Measure supply air temperature',
      'Check cooling performance',
      'Check fan operation',
      'Check swing/louver operation',
      'Check remote controller operation',
      'Listen for unusual noise or vibration',
    ],
  },
  {
    title: '5. Refrigeration System Check',
    items: [
      'Check refrigerant line condition',
      'Check for oil traces/leaks',
      'Check service valve condition',
      'Check suction line temperature',
      'Check discharge line temperature',
    ],
  },
  {
    title: '6. Condensate Drain Check',
    items: [
      'Check drain hose for blockage',
      'Check water flow from drain line',
      'Check for water leaks indoors',
    ],
  },
  {
    title: '7. Documentation',
    items: [
      'Take "Before Cleaning" photos',
      'Record findings and observations',
      'Inform customer of any defects found',
      'Obtain customer approval before proceeding',
    ],
  },
];

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function PreWorkChecklistPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const sigRef = useRef<SignaturePadHandle>(null);
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const [fields, setFields] = useState<Record<string, string>>({});
  const [items, setItems] = useState<Record<string, boolean>>({});
  const [remarks, setRemarks] = useState('');
  const [hasSavedSignature, setHasSavedSignature] = useState(false);

  useEffect(() => {
    fetch('/api/technician/jobs')
      .then(r => {
        if (r.status === 401) { router.push('/technician/login'); return null; }
        return r.json();
      })
      .then((jobs: Job[] | null) => {
        if (!jobs) return;
        const found = jobs.find(j => j.id === id);
        if (!found) return;
        setJob(found);
        const existing = found.preWorkChecklist;
        if (existing) {
          setFields(existing.fields || {});
          setItems(existing.items || {});
          setRemarks(existing.remarks || '');
          setHasSavedSignature(!!existing.customerSignature);
        } else {
          setFields({
            customerName: found.name,
            siteAddress: found.address,
            contactNumber: found.phone,
            dateOfService: todayISO(),
            brandModel: found.unitModel || '',
          });
        }
      })
      .finally(() => setLoading(false));
  }, [id, router]);

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(''), 3000); }

  function setField(key: string, value: string) {
    setFields(prev => ({ ...prev, [key]: value }));
  }

  function toggleItem(key: string) {
    setItems(prev => ({ ...prev, [key]: !prev[key] }));
  }

  async function handleSubmit() {
    if (!fields.customerName?.trim()) {
      showToast('Customer name is required');
      return;
    }
    const sigEmpty = sigRef.current?.isEmpty() ?? true;
    if (sigEmpty && !hasSavedSignature) {
      showToast('Customer signature is required');
      return;
    }
    setSaving(true);
    const customerSignature = sigEmpty ? undefined : sigRef.current?.toDataURL();
    const payload: ChecklistData = {
      fields,
      items,
      remarks,
      customerSignature: customerSignature ?? '',
      signedAt: new Date().toISOString(),
    };
    const res = await fetch(`/api/technician/jobs/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ preWorkChecklist: payload }),
    });
    if (res.ok) {
      showToast('Checklist saved!');
      setHasSavedSignature(!sigEmpty || hasSavedSignature);
      router.back();
    } else {
      showToast('Failed to save checklist');
    }
    setSaving(false);
  }

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-400">Loading...</div>;
  if (!job) return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-400">Job not found</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#1e3a5f] text-white px-5 py-4">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <button onClick={() => router.back()} className="p-1.5 hover:bg-white/10 rounded-lg"><ArrowLeft size={18} /></button>
          <div>
            <div className="font-extrabold">Pre-Work Checklist</div>
            <div className="text-xs text-blue-300">{job.name}</div>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto p-4 space-y-4 pb-28">
        <div className="bg-white border rounded-2xl p-5 text-center">
          <div className="font-extrabold text-[#1e3a5f] text-sm">GOCLEAN AIRCON SUPPLIES AND SERVICES CO.</div>
          <div className="text-xs text-gray-500 mt-1">Gen. Malvar St. Tubigan Binan Laguna</div>
          <div className="text-xs text-gray-500">(049) 576 5147 / (0917) 823 7205 / (0917) 1178605</div>
          <div className="text-xs text-gray-500">gocleanair@gmail.com / gocleanaircon3@gmail.com</div>
          <div className="text-xs text-gray-400 mt-1">VAT: 609-074-194-00000</div>
        </div>

        {/* 1. Customer & Unit Information */}
        <div className="bg-white border rounded-2xl p-5">
          <h3 className="font-bold text-[#1e3a5f] mb-3 flex items-center gap-2"><ClipboardList size={15} /> 1. Customer & Unit Information</h3>
          <div className="space-y-2">
            {FIELD_DEFS.map(f => (
              <div key={f.key}>
                <label className="text-xs text-gray-500">{f.label}</label>
                <input
                  value={fields[f.key] || ''}
                  onChange={e => setField(f.key, e.target.value)}
                  className="w-full border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-[#1e3a5f]"
                />
              </div>
            ))}
          </div>
        </div>

        {SECTIONS.map((section, sIdx) => (
          <div key={section.title} className="bg-white border rounded-2xl p-5">
            <h3 className="font-bold text-[#1e3a5f] mb-3">{section.title}</h3>
            <div className="space-y-2">
              {section.items.map((label, iIdx) => {
                const key = `${sIdx}-${iIdx}`;
                return (
                  <label key={key} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={!!items[key]} onChange={() => toggleItem(key)} className="w-4 h-4 accent-[#1e3a5f]" />
                    <span>{label}</span>
                  </label>
                );
              })}
            </div>
          </div>
        ))}

        {/* Technician Remarks */}
        <div className="bg-white border rounded-2xl p-5">
          <h3 className="font-bold text-[#1e3a5f] mb-3">Technician Remarks</h3>
          <textarea
            value={remarks}
            onChange={e => setRemarks(e.target.value)}
            rows={3}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1e3a5f]"
            placeholder="Findings, observations, defects found..."
          />
        </div>

        {/* Customer Acknowledgment */}
        <div className="bg-white border rounded-2xl p-5">
          <h3 className="font-bold text-[#1e3a5f] mb-3">Customer Acknowledgment</h3>
          <div className="text-sm mb-2">
            <span className="text-gray-500">Customer Name:</span> <span className="font-medium">{fields.customerName || '—'}</span>
          </div>
          <label className="text-xs text-gray-500">Signature</label>
          {hasSavedSignature && (
            <div className="text-xs text-green-600 mb-1">Signature already on file. Sign again below to replace it.</div>
          )}
          <div className="border-2 border-dashed border-gray-300 rounded-xl overflow-hidden relative">
            <SignaturePad ref={sigRef} className="w-full h-40 bg-white" />
          </div>
          <button
            onClick={() => sigRef.current?.clear()}
            className="mt-2 flex items-center gap-1 text-xs text-gray-500 hover:text-red-500"
          >
            <Eraser size={13} /> Clear signature
          </button>
          <div className="text-xs text-gray-500 mt-2">Date: {todayISO()}</div>
        </div>
      </div>

      <div className="fixed bottom-0 inset-x-0 bg-white border-t p-4">
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="w-full max-w-lg mx-auto block py-3 bg-[#1e3a5f] text-white font-bold rounded-xl hover:bg-[#152d4a] disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Checklist'}
        </button>
      </div>

      {toast && <div className="fixed bottom-24 inset-x-4 z-[100] bg-[#1e3a5f] text-white px-5 py-3 rounded-xl shadow-lg text-sm font-medium text-center max-w-lg mx-auto">{toast}</div>}
    </div>
  );
}
