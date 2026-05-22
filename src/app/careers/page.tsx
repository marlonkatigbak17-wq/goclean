'use client';

import { useState, useRef } from 'react';
import { CheckCircle, Upload, X, FileText, Loader2, ChevronDown, ChevronUp } from 'lucide-react';

const POSITIONS = [
  {
    title: 'Aircon Technician',
    type: 'Full-time',
    description: 'Install, service, and repair residential and light commercial aircon units. Work on split-type, window-type, and cassette units.',
    requirements: ['TESDA NC II certification preferred', 'At least 1 year hands-on experience', 'Can work independently in the field', 'With or without driver\'s license'],
  },
  {
    title: 'Senior Technician / Team Lead',
    type: 'Full-time',
    description: 'Lead a small team of technicians for commercial and industrial AC projects. Handle complex diagnostics and client escalations.',
    requirements: ['3+ years HVAC experience', 'TESDA NC III a plus', 'Leadership and communication skills', 'Valid driver\'s license required'],
  },
  {
    title: 'Aircon Cleaning Specialist',
    type: 'Full-time / Part-time',
    description: 'Perform preventive maintenance, deep cleaning, and chemical washing of aircon units for residential clients.',
    requirements: ['Experience in aircon cleaning preferred', 'Willing to be trained', 'Good work attitude', 'Physically fit'],
  },
  {
    title: 'Sales & Customer Service',
    type: 'Full-time',
    description: 'Handle customer inquiries, quotations, and follow-ups. Coordinate bookings and assist walk-in clients at the shop.',
    requirements: ['Strong communication skills', 'Computer literate (MS Office)', 'Experience in sales or customer service preferred', 'Can start immediately'],
  },
];

interface FileEntry { file: File; url?: string; uploading: boolean; error?: string; }

export default function CareersPage() {
  const [expanded, setExpanded] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    name: '', email: '', phone: '', address: '',
    position: '', experience: '0', canDrive: false,
    startImmediately: false, coverLetter: '',
  });

  const [resume, setResume] = useState<FileEntry | null>(null);
  const [certs, setCerts] = useState<FileEntry[]>([]);

  const resumeRef = useRef<HTMLInputElement>(null);
  const certRef   = useRef<HTMLInputElement>(null);

  function set(field: string, value: unknown) {
    setForm(f => ({ ...f, [field]: value }));
  }

  async function uploadFile(file: File): Promise<string> {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('type', 'resume');
    const res = await fetch('/api/careers/upload', { method: 'POST', body: fd });
    if (!res.ok) throw new Error('Upload failed');
    const data = await res.json();
    return data.url;
  }

  async function handleResumeChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const entry: FileEntry = { file, uploading: true };
    setResume(entry);
    try {
      const url = await uploadFile(file);
      setResume({ file, url, uploading: false });
    } catch {
      setResume({ file, uploading: false, error: 'Upload failed' });
    }
  }

  async function handleCertAdd(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const entries: FileEntry[] = files.map(f => ({ file: f, uploading: true }));
    setCerts(prev => [...prev, ...entries]);
    const updated = await Promise.all(entries.map(async (entry, i) => {
      try {
        const fd = new FormData();
        fd.append('file', entry.file);
        fd.append('type', 'cert');
        const res = await fetch('/api/careers/upload', { method: 'POST', body: fd });
        if (!res.ok) throw new Error('Upload failed');
        const data = await res.json();
        return { ...entry, url: data.url, uploading: false };
      } catch {
        return { ...entry, uploading: false, error: 'Upload failed' };
      }
    }));
    setCerts(prev => {
      const next = [...prev];
      const start = next.length - entries.length;
      updated.forEach((u, i) => { next[start + i] = u; });
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!form.name.trim() || !form.phone.trim() || !form.position.trim()) {
      setError('Name, phone, and position are required.');
      return;
    }
    if (resume?.uploading || certs.some(c => c.uploading)) {
      setError('Please wait for files to finish uploading.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/careers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          resumeUrl: resume?.url || null,
          certUrls: certs.filter(c => c.url).map(c => c.url!),
        }),
      });
      if (!res.ok) throw new Error('Failed');
      setSubmitted(true);
    } catch {
      setError('Something went wrong. Please try again or call us at 0917 823 7205.');
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md w-full text-center">
          <CheckCircle className="mx-auto mb-4 text-green-500" size={56} />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Submitted!</h2>
          <p className="text-gray-600 mb-6">
            Thank you for applying to GoClean. We'll review your application and get back to you within 3–5 business days.
          </p>
          <button
            onClick={() => { setSubmitted(false); setForm({ name:'',email:'',phone:'',address:'',position:'',experience:'0',canDrive:false,startImmediately:false,coverLetter:'' }); setResume(null); setCerts([]); }}
            className="text-[#0f1f5c] font-semibold hover:underline"
          >
            Submit another application
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-[#0f1f5c] text-white py-16 px-4 text-center">
        <h1 className="text-4xl font-extrabold mb-3">Join the GoClean Team</h1>
        <p className="text-blue-200 text-lg max-w-xl mx-auto">
          We're looking for skilled and motivated people to help us deliver world-class aircon services across Biñan and Laguna.
        </p>
      </section>

      <div className="max-w-4xl mx-auto px-4 py-12 space-y-12">

        {/* Open Positions */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Open Positions</h2>
          <div className="space-y-3">
            {POSITIONS.map((pos, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <button
                  onClick={() => setExpanded(expanded === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 transition-colors"
                >
                  <div>
                    <span className="font-semibold text-gray-900">{pos.title}</span>
                    <span className="ml-3 text-xs bg-blue-100 text-[#0f1f5c] px-2 py-0.5 rounded-full font-medium">{pos.type}</span>
                  </div>
                  {expanded === i ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
                </button>
                {expanded === i && (
                  <div className="px-6 pb-5 border-t border-gray-100">
                    <p className="text-gray-600 mt-3 mb-3">{pos.description}</p>
                    <p className="text-sm font-semibold text-gray-700 mb-1">Requirements:</p>
                    <ul className="space-y-1">
                      {pos.requirements.map((r, j) => (
                        <li key={j} className="text-sm text-gray-600 flex items-start gap-2">
                          <span className="text-[#0f1f5c] mt-0.5">•</span>{r}
                        </li>
                      ))}
                    </ul>
                    <button
                      onClick={() => { set('position', pos.title); document.getElementById('apply-form')?.scrollIntoView({ behavior: 'smooth' }); }}
                      className="mt-4 bg-[#0f1f5c] text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-blue-900 transition-colors"
                    >
                      Apply for this position
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Application Form */}
        <section id="apply-form">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Apply Now</h2>
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">

            {/* Name + Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name <span className="text-red-500">*</span></label>
                <input
                  type="text" value={form.name} onChange={e => set('name', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Juan dela Cruz"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number <span className="text-red-500">*</span></label>
                <input
                  type="tel" value={form.phone} onChange={e => set('phone', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="09XX XXX XXXX"
                />
              </div>
            </div>

            {/* Email + Address */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input
                  type="email" value={form.email} onChange={e => set('email', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="juan@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address / City</label>
                <input
                  type="text" value={form.address} onChange={e => set('address', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Biñan, Laguna"
                />
              </div>
            </div>

            {/* Position */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Position Applying For <span className="text-red-500">*</span></label>
              <select
                value={form.position} onChange={e => set('position', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">Select a position...</option>
                {POSITIONS.map(p => <option key={p.title} value={p.title}>{p.title}</option>)}
                <option value="Other">Other (specify in message)</option>
              </select>
            </div>

            {/* Experience */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Years of Experience in HVAC/Aircon</label>
              <select
                value={form.experience} onChange={e => set('experience', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="0">No experience (willing to be trained)</option>
                <option value="1">1 year</option>
                <option value="2">2 years</option>
                <option value="3">3 years</option>
                <option value="5">4–5 years</option>
                <option value="6">6+ years</option>
              </select>
            </div>

            {/* Checkboxes */}
            <div className="flex flex-wrap gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox" checked={form.canDrive} onChange={e => set('canDrive', e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-[#0f1f5c] focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">I have a driver's license</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox" checked={form.startImmediately} onChange={e => set('startImmediately', e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-[#0f1f5c] focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">I can start immediately</span>
              </label>
            </div>

            {/* Resume Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Resume / CV <span className="text-gray-400 font-normal">(PDF, Word, or image — max 5MB)</span></label>
              {resume ? (
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <FileText size={16} className="text-[#0f1f5c] shrink-0" />
                  <span className="text-sm text-gray-700 truncate flex-1">{resume.file.name}</span>
                  {resume.uploading && <Loader2 size={14} className="animate-spin text-blue-500" />}
                  {resume.error && <span className="text-xs text-red-500">{resume.error}</span>}
                  {resume.url && <span className="text-xs text-green-600 font-medium">Uploaded</span>}
                  <button type="button" onClick={() => setResume(null)} className="text-gray-400 hover:text-gray-600">
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <button
                  type="button" onClick={() => resumeRef.current?.click()}
                  className="flex items-center gap-2 border-2 border-dashed border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-500 hover:border-blue-400 hover:text-blue-500 transition-colors w-full"
                >
                  <Upload size={16} />Upload Resume
                </button>
              )}
              <input ref={resumeRef} type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" className="hidden" onChange={handleResumeChange} />
            </div>

            {/* Cert Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Certifications <span className="text-gray-400 font-normal">(TESDA, etc. — optional)</span></label>
              <div className="space-y-2">
                {certs.map((c, i) => (
                  <div key={i} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <FileText size={16} className="text-green-600 shrink-0" />
                    <span className="text-sm text-gray-700 truncate flex-1">{c.file.name}</span>
                    {c.uploading && <Loader2 size={14} className="animate-spin text-blue-500" />}
                    {c.error && <span className="text-xs text-red-500">{c.error}</span>}
                    {c.url && <span className="text-xs text-green-600 font-medium">Uploaded</span>}
                    <button type="button" onClick={() => setCerts(prev => prev.filter((_, j) => j !== i))} className="text-gray-400 hover:text-gray-600">
                      <X size={14} />
                    </button>
                  </div>
                ))}
                <button
                  type="button" onClick={() => certRef.current?.click()}
                  className="flex items-center gap-2 border-2 border-dashed border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-500 hover:border-blue-400 hover:text-blue-500 transition-colors w-full"
                >
                  <Upload size={16} />Add Certificate
                </button>
              </div>
              <input ref={certRef} type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" multiple className="hidden" onChange={handleCertAdd} />
            </div>

            {/* Cover Letter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message / Cover Letter <span className="text-gray-400 font-normal">(optional)</span></label>
              <textarea
                value={form.coverLetter} onChange={e => set('coverLetter', e.target.value)}
                rows={4}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Tell us about yourself, your experience, and why you want to join GoClean..."
              />
            </div>

            {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-3">{error}</p>}

            <button
              type="submit" disabled={loading}
              className="w-full bg-[#0f1f5c] text-white py-3 rounded-xl font-semibold text-sm hover:bg-blue-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? <><Loader2 size={16} className="animate-spin" />Submitting...</> : 'Submit Application'}
            </button>
          </form>
        </section>

      </div>
    </div>
  );
}
