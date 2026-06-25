'use client';
import { useState, useEffect, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ClipboardCheck, Eraser } from 'lucide-react';
import SignaturePad, { SignaturePadHandle } from '@/components/technician/SignaturePad';

type Job = {
  id: string; name: string; phone: string; address: string;
  unitModel: string; installationChecklist: ChecklistData | null;
};

type ItemResult = { status: 'pass' | 'fail' | ''; remarks: string };

type ChecklistData = {
  fields: Record<string, string>;
  items: Record<string, ItemResult>;
  readings: Record<string, string>;
  customerSignature: string;
  signedAt: string;
};

const FIELD_DEFS: { key: string; label: string }[] = [
  { key: 'jobNo', label: 'Job No.' },
  { key: 'date', label: 'Date' },
  { key: 'customerName', label: 'Customer name' },
  { key: 'contactNumber', label: 'Contact no.' },
  { key: 'address', label: 'Address' },
  { key: 'technicianName', label: 'Technician' },
  { key: 'assistantTechnician', label: 'Assistant technician' },
  { key: 'brand', label: 'Brand' },
  { key: 'model', label: 'Model' },
  { key: 'capacityHp', label: 'Capacity (HP)' },
  { key: 'indoorSerial', label: 'Indoor serial no.' },
  { key: 'outdoorSerial', label: 'Outdoor serial no.' },
];

const CHECKLIST_ITEMS = [
  'Indoor unit securely mounted',
  'Outdoor unit securely mounted',
  'Unit properly leveled',
  'Copper pipe insulated',
  'Drain hose installed',
  'Drain test passed',
  'Vacuum completed',
  'Leak test completed',
  'Refrigerant valves opened',
  'Electrical wiring secured',
  'Circuit breaker installed',
  'Cooling test passed',
  'Heating test (if applicable)',
  'Remote tested',
  'No abnormal vibration',
  'No refrigerant leak',
  'Work area cleaned',
  'Customer orientation completed',
];

const READING_DEFS: { key: string; label: string }[] = [
  { key: 'voltage', label: 'Voltage (V)' },
  { key: 'runningCurrent', label: 'Running current (A)' },
  { key: 'suctionPressure', label: 'Suction pressure (psi)' },
  { key: 'dischargePressure', label: 'Discharge pressure (psi)' },
  { key: 'returnAirTemp', label: 'Return air temp (°C)' },
  { key: 'supplyAirTemp', label: 'Supply air temp (°C)' },
  { key: 'tempDifference', label: 'Temperature difference (°C)' },
  { key: 'vacuumMicrons', label: 'Vacuum microns' },
  { key: 'pipeLength', label: 'Pipe length (ft)' },
];

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function InstallationCheckoutPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const sigRef = useRef<SignaturePadHandle>(null);
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const [fields, setFields] = useState<Record<string, string>>({});
  const [items, setItems] = useState<Record<string, ItemResult>>({});
  const [readings, setReadings] = useState<Record<string, string>>({});
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
        const existing = found.installationChecklist;
        if (existing) {
          setFields(existing.fields || {});
          setItems(existing.items || {});
          setReadings(existing.readings || {});
          setHasSavedSignature(!!existing.customerSignature);
        } else {
          setFields({
            date: todayISO(),
            customerName: found.name,
            contactNumber: found.phone,
            address: found.address,
            brand: found.unitModel || '',
          });
        }
      })
      .finally(() => setLoading(false));
  }, [id, router]);

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(''), 3000); }

  function setField(key: string, value: string) {
    setFields(prev => ({ ...prev, [key]: value }));
  }

  function setReading(key: string, value: string) {
    setReadings(prev => ({ ...prev, [key]: value }));
  }

  function setItemStatus(item: string, status: 'pass' | 'fail') {
    setItems(prev => ({ ...prev, [item]: { status, remarks: prev[item]?.remarks ?? '' } }));
  }

  function setItemRemarks(item: string, remarks: string) {
    setItems(prev => ({ ...prev, [item]: { status: prev[item]?.status ?? '', remarks } }));
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
      readings,
      customerSignature: customerSignature ?? '',
      signedAt: new Date().toISOString(),
    };
    const res = await fetch(`/api/technician/jobs/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ installationChecklist: payload }),
    });
    if (res.ok) {
      showToast('Installation checkout saved!');
      setHasSavedSignature(!sigEmpty || hasSavedSignature);
      router.back();
    } else {
      showToast('Failed to save checkout form');
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
            <div className="font-extrabold">Installation Checkout</div>
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

        {/* Job & Unit Information */}
        <div className="bg-white border rounded-2xl p-5">
          <h3 className="font-bold text-[#1e3a5f] mb-3 flex items-center gap-2"><ClipboardCheck size={15} /> Job & Unit Information</h3>
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

        {/* Installation Checklist */}
        <div className="bg-white border rounded-2xl p-5">
          <h3 className="font-bold text-[#1e3a5f] mb-3">Installation Checklist</h3>
          <div className="space-y-3">
            {CHECKLIST_ITEMS.map(item => (
              <div key={item} className="border-b border-gray-100 last:border-0 pb-3 last:pb-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm flex-1">{item}</span>
                  <div className="flex gap-1 shrink-0">
                    <button
                      onClick={() => setItemStatus(item, 'pass')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${items[item]?.status === 'pass' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-green-50'}`}
                    >
                      PASS
                    </button>
                    <button
                      onClick={() => setItemStatus(item, 'fail')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${items[item]?.status === 'fail' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-red-50'}`}
                    >
                      FAIL
                    </button>
                  </div>
                </div>
                {items[item]?.status === 'fail' && (
                  <input
                    value={items[item]?.remarks || ''}
                    onChange={e => setItemRemarks(item, e.target.value)}
                    placeholder="Remarks"
                    className="mt-2 w-full border rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-[#1e3a5f]"
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* System Readings */}
        <div className="bg-white border rounded-2xl p-5">
          <h3 className="font-bold text-[#1e3a5f] mb-3">System Readings</h3>
          <div className="grid grid-cols-2 gap-2">
            {READING_DEFS.map(r => (
              <div key={r.key}>
                <label className="text-xs text-gray-500">{r.label}</label>
                <input
                  value={readings[r.key] || ''}
                  onChange={e => setReading(r.key, e.target.value)}
                  className="w-full border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-[#1e3a5f]"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Customer Acceptance */}
        <div className="bg-white border rounded-2xl p-5">
          <h3 className="font-bold text-[#1e3a5f] mb-3">Customer Acceptance</h3>
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
          {saving ? 'Saving...' : 'Save Checkout Form'}
        </button>
      </div>

      {toast && <div className="fixed bottom-24 inset-x-4 z-[100] bg-[#1e3a5f] text-white px-5 py-3 rounded-xl shadow-lg text-sm font-medium text-center max-w-lg mx-auto">{toast}</div>}
    </div>
  );
}
