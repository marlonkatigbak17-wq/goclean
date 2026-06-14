'use client';
import { useState, useEffect, useRef } from 'react';
import { Send, Users, Wrench, AlertTriangle, UserSquare2, Phone, CheckCircle2, Upload, Download, Zap, RefreshCw, Sparkles, X } from 'lucide-react';
import * as XLSX from 'xlsx';

type Counts = { allCustomers: number; maintenanceDue: number; warrantyExpiring: number; allLeads: number; importedContacts: number };
type Balance = { balance: number; name: string; status: string } | null;

const GROUPS = [
  { key: 'all_customers',    label: 'All Customers',          desc: 'Every customer with a phone number',            icon: Users,         countKey: 'allCustomers' },
  { key: 'maintenance_due',  label: 'Maintenance Due',         desc: 'No booking in the last 6 months',               icon: Wrench,        countKey: 'maintenanceDue' },
  { key: 'warranty_expiring',label: 'Warranty Expiring Soon',  desc: 'Warranty expires within 30 days',               icon: AlertTriangle,  countKey: 'warrantyExpiring' },
  { key: 'all_leads',        label: 'All Leads',               desc: 'Everyone in your leads pipeline',               icon: UserSquare2,   countKey: 'allLeads' },
  { key: 'imported_contacts',label: 'Imported Contacts',       desc: 'Contacts imported via Excel',                   icon: Upload,        countKey: 'importedContacts' },
  { key: 'custom',           label: 'Custom Numbers',          desc: 'Paste or import specific phone numbers',        icon: Phone,         countKey: null },
];

const MAX_CHARS = 160;

export default function SmsBlastPage() {
  const [counts, setCounts]             = useState<Counts | null>(null);
  const [balance, setBalance]           = useState<Balance>(null);
  const [balanceLoading, setBalanceLoading] = useState(true);
  const [group, setGroup]               = useState('all_customers');
  const [message, setMessage]           = useState('');
  const [customNumbers, setCustomNumbers] = useState('');
  const [sending, setSending]           = useState(false);
  const [progress, setProgress]         = useState<{ i: number; total: number; sent: number; failed: number; sampleError?: string } | null>(null);
  const [result, setResult]             = useState<{ sent: number; failed: number; total: number; sampleError?: string } | null>(null);
  const [confirm, setConfirm]           = useState(false);
  const [importToast, setImportToast]   = useState('');
  const [showAiModal, setShowAiModal]   = useState(false);
  const [aiPrompt, setAiPrompt]         = useState('');
  const [aiGenerating, setAiGenerating] = useState(false);
  const [testResult, setTestResult]     = useState<unknown>(null);
  const [testLoading, setTestLoading]   = useState(false);
  const importRef = useRef<HTMLInputElement>(null);

  async function generateMessage() {
    if (!aiPrompt.trim()) return;
    setAiGenerating(true);
    const res = await fetch('/api/admin/sms-blast/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: aiPrompt }),
    });
    const data = await res.json();
    if (res.ok && data.message) {
      setMessage(data.message);
      setShowAiModal(false);
      setAiPrompt('');
    }
    setAiGenerating(false);
  }

  async function loadBalance() {
    setBalanceLoading(true);
    const res = await fetch('/api/admin/sms-blast/balance');
    const data = await res.json();
    setBalance(res.ok ? data : null);
    setBalanceLoading(false);
  }

  async function runTest() {
    setTestLoading(true);
    setTestResult(null);
    const res = await fetch('/api/admin/sms-blast/test');
    const data = await res.json().catch(() => ({ error: 'Failed to parse response' }));
    setTestResult(data);
    setTestLoading(false);
  }

  useEffect(() => {
    fetch('/api/admin/sms-blast').then(r => r.json()).then(setCounts);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadBalance();
  }, []);

  function getRecipientCount() {
    if (group === 'custom') {
      return customNumbers.split(/[\n,;]+/).map(n => n.trim()).filter(Boolean).length;
    }
    if (!counts) return 0;
    const g = GROUPS.find(g => g.key === group);
    if (!g?.countKey) return 0;
    return counts[g.countKey as keyof Counts] ?? 0;
  }

  function handleExcelImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data  = new Uint8Array(ev.target?.result as ArrayBuffer);
        const wb    = XLSX.read(data, { type: 'array' });
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const rows: Record<string, unknown>[] = XLSX.utils.sheet_to_json(sheet);

        const phones: string[] = [];
        rows.forEach(row => {
          const phoneKey = Object.keys(row).find(k =>
            ['phone', 'mobile', 'contact', 'number', 'tel', 'cellphone', 'celphone', 'cp', 'cellfone'].some(x =>
              k.toLowerCase().includes(x)
            )
          );
          const val = phoneKey ? String(row[phoneKey]).trim() : '';
          if (val && val !== 'undefined') phones.push(val);
        });

        if (phones.length > 0) {
          setCustomNumbers(phones.join('\n'));
          setGroup('custom');
          setImportToast(`✅ Imported ${phones.length} number${phones.length !== 1 ? 's' : ''} from Excel`);
        } else {
          setImportToast('⚠️ No phone column found. Make sure the column is named "Phone" or "Mobile".');
        }
        setTimeout(() => setImportToast(''), 4000);
      } catch {
        setImportToast('❌ Failed to read Excel file. Please use .xlsx or .xls format.');
        setTimeout(() => setImportToast(''), 4000);
      }
    };
    reader.readAsArrayBuffer(file);
    e.target.value = '';
  }

  async function handleExportContacts() {
    const res  = await fetch('/api/admin/sms-blast/export');
    const data = await res.json();
    if (!data.contacts?.length) { alert('No contacts found.'); return; }

    const ws = XLSX.utils.json_to_sheet(data.contacts);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Contacts');
    XLSX.writeFile(wb, 'goclean-contacts.xlsx');
  }

  async function handleSend() {
    setSending(true);
    setResult(null);
    setProgress(null);

    let res: Response;
    try {
      res = await fetch('/api/admin/sms-blast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ group, message, customNumbers }),
      });
    } catch {
      alert('Network error — please try again');
      setSending(false);
      return;
    }

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert((data as { error?: string }).error || 'Failed to send');
      setSending(false);
      return;
    }

    // Stream progress line by line
    const reader  = res.body!.getReader();
    const decoder = new TextDecoder();
    let   buf     = '';
    let   sampleError: string | undefined;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });
      const lines = buf.split('\n');
      buf = lines.pop() ?? '';

      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const msg = JSON.parse(line) as {
            done?: boolean; i?: number; total?: number; sent?: number; failed?: number; ok?: boolean; error?: string;
          };
          if (msg.done) {
            setResult({ sent: msg.sent!, failed: msg.failed!, total: msg.total!, ...(sampleError ? { sampleError } : {}) });
            setProgress(null);
            setMessage('');
            setCustomNumbers('');
            setConfirm(false);
          } else {
            if (!msg.ok && msg.error && !sampleError) sampleError = msg.error;
            setProgress({ i: msg.i!, total: msg.total!, sent: msg.sent!, failed: msg.failed!, ...(sampleError ? { sampleError } : {}) });
          }
        } catch { /* malformed line */ }
      }
    }

    setSending(false);
  }

  const recipientCount = getRecipientCount();
  const charsLeft      = MAX_CHARS - message.length;
  const smsCount       = Math.ceil(message.length / MAX_CHARS) || 1;

  return (
    <div className="p-6 max-w-2xl">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1e3a5f]">SMS Blast</h1>
          <p className="text-sm text-gray-400 mt-0.5">Send a message to a group of customers or leads</p>
        </div>
        <button
          onClick={handleExportContacts}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-600 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Download size={15} /> Export Contacts
        </button>
      </div>

      {/* SMS Credit Balance */}
      <div className="flex items-center gap-3 bg-white border rounded-2xl px-4 py-3 mb-5">
        <div className="w-9 h-9 rounded-full bg-yellow-100 flex items-center justify-center shrink-0">
          <Zap size={18} className="text-yellow-500" />
        </div>
        <div className="flex-1">
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Semaphore SMS Credits</p>
          {balanceLoading ? (
            <p className="text-sm text-gray-400 mt-0.5">Loading balance…</p>
          ) : balance ? (
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className={`text-xl font-extrabold ${balance.balance < 50 ? 'text-red-600' : balance.balance < 200 ? 'text-orange-500' : 'text-green-600'}`}>
                {balance.balance.toLocaleString()}
              </span>
              <span className="text-sm text-gray-500">credits remaining</span>
              {balance.balance < 50 && (
                <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-semibold">Low balance</span>
              )}
            </div>
          ) : (
            <p className="text-sm text-red-500 mt-0.5">Could not load balance</p>
          )}
        </div>
        <button
          onClick={loadBalance}
          disabled={balanceLoading}
          className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
          title="Refresh balance"
        >
          <RefreshCw size={15} className={balanceLoading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* SMS Test */}
      <div className="mb-5">
        <button
          onClick={runTest}
          disabled={testLoading}
          className="text-xs px-3 py-1.5 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          {testLoading ? 'Testing…' : '🔍 Debug: Test Single SMS'}
        </button>
        {testResult && (
          <pre className="mt-2 text-xs bg-gray-900 text-green-300 rounded-xl p-4 overflow-auto max-h-60 whitespace-pre-wrap break-all">
            {JSON.stringify(testResult, null, 2)}
          </pre>
        )}
      </div>

      {/* Import toast */}
      {importToast && (
        <div className="mb-4 px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-800 font-medium">
          {importToast}
        </div>
      )}

      {/* Live progress */}
      {progress && (
        <div className="mb-5 bg-blue-50 border border-blue-200 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold text-blue-800">Sending SMS…</span>
            <span className="text-sm text-blue-600 font-mono">{progress.i} / {progress.total}</span>
          </div>
          <div className="w-full bg-blue-100 rounded-full h-2.5 mb-3 overflow-hidden">
            <div
              className="bg-blue-500 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${Math.round((progress.i / progress.total) * 100)}%` }}
            />
          </div>
          <div className="flex gap-4 text-sm">
            <span className="text-green-600 font-semibold">✓ {progress.sent} sent</span>
            {progress.failed > 0 && <span className="text-red-500 font-semibold">✗ {progress.failed} failed</span>}
          </div>
          {progress.sampleError && (
            <div className="text-xs mt-2 text-red-500 bg-red-100 rounded px-2 py-1 font-mono break-all">
              Error: {progress.sampleError}
            </div>
          )}
        </div>
      )}

      {/* Final result */}
      {result && (
        <div className={`mb-5 border rounded-2xl p-5 flex items-start gap-3 ${result.sent > 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <CheckCircle2 size={20} className={`mt-0.5 shrink-0 ${result.sent > 0 ? 'text-green-600' : 'text-red-500'}`} />
          <div>
            <div className={`font-bold ${result.sent > 0 ? 'text-green-700' : 'text-red-700'}`}>
              {result.sent > 0 ? 'SMS Blast Complete!' : 'SMS Blast Failed'}
            </div>
            <div className={`text-sm mt-1 ${result.sent > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {result.sent} sent successfully{result.failed > 0 && `, ${result.failed} failed`} out of {result.total} recipients.
            </div>
            {result.sampleError && (
              <div className="text-xs mt-2 text-red-500 bg-red-100 rounded px-2 py-1 font-mono break-all">
                Error: {result.sampleError}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="space-y-5">
        {/* Step 1 — Choose group */}
        <div className="bg-white border rounded-2xl p-5">
          <h2 className="font-bold text-[#1e3a5f] mb-3 text-sm uppercase tracking-wide">1. Choose Recipients</h2>
          <div className="space-y-2">
            {GROUPS.map(g => {
              const Icon  = g.icon;
              const count = g.countKey && counts ? counts[g.countKey as keyof Counts] : null;
              return (
                <label key={g.key} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${group === g.key ? 'border-[#1e3a5f] bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <input type="radio" name="group" value={g.key} checked={group === g.key} onChange={() => setGroup(g.key)} className="accent-[#1e3a5f]" />
                  <Icon size={16} className={group === g.key ? 'text-[#1e3a5f]' : 'text-gray-400'} />
                  <div className="flex-1">
                    <div className={`text-sm font-semibold ${group === g.key ? 'text-[#1e3a5f]' : 'text-gray-700'}`}>{g.label}</div>
                    <div className="text-xs text-gray-400">{g.desc}</div>
                  </div>
                  {count !== null && (
                    <span className="text-xs font-bold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{count}</span>
                  )}
                </label>
              );
            })}
          </div>

          {/* Custom numbers input */}
          {group === 'custom' && (
            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs text-gray-500">Phone numbers (one per line, or comma-separated)</label>
                <button
                  onClick={() => importRef.current?.click()}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border border-[#1e3a5f] text-[#1e3a5f] rounded-lg hover:bg-blue-50 transition-colors"
                >
                  <Upload size={12} /> Import Excel
                </button>
                <input ref={importRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleExcelImport} />
              </div>
              <textarea
                rows={5}
                value={customNumbers}
                onChange={e => setCustomNumbers(e.target.value)}
                placeholder="09171234567&#10;09181234567&#10;09191234567&#10;&#10;Or import from Excel using the button above"
                className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#1e3a5f] resize-none font-mono"
              />
              <div className="text-xs text-gray-400">{recipientCount} number{recipientCount !== 1 ? 's' : ''} entered</div>
            </div>
          )}
        </div>

        {/* Step 2 — Write message */}
        <div className="bg-white border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-[#1e3a5f] text-sm uppercase tracking-wide">2. Write Your Message</h2>
            <button
              onClick={() => setShowAiModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-lg transition-colors"
            >
              <Sparkles size={13} /> Generate with AI
            </button>
          </div>
          <textarea
            rows={5}
            value={message}
            onChange={e => setMessage(e.target.value)}
            maxLength={MAX_CHARS * 3}
            placeholder="Hi! This is GoClean Aircon. Time for your annual aircon cleaning? Book now at gocleanair.co or call 0917 117 8605."
            className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1e3a5f] resize-none"
          />
          <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
            <span>{message.length} characters · {smsCount} SMS credit{smsCount !== 1 ? 's' : ''} per recipient</span>
            <span className={charsLeft < 20 ? 'text-red-500 font-bold' : ''}>{charsLeft} left</span>
          </div>
        </div>

        {/* AI Generate Modal */}
        {showAiModal && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <Sparkles size={18} className="text-purple-500" /> AI Message Generator
                </h3>
                <button onClick={() => { setShowAiModal(false); setAiPrompt(''); }} className="text-gray-400 hover:text-gray-600">
                  <X size={18} />
                </button>
              </div>
              <p className="text-sm text-gray-500 mb-3">Describe what kind of SMS you want to send:</p>
              <textarea
                rows={3}
                value={aiPrompt}
                onChange={e => setAiPrompt(e.target.value)}
                placeholder="e.g. Promo for aircon cleaning, follow up to leads, remind customers about maintenance..."
                className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-purple-400 resize-none mb-3"
                autoFocus
              />
              <div className="flex flex-wrap gap-2 mb-4">
                {[
                  'Promo for cleaning this week',
                  'Follow up to all leads',
                  'Remind customers about annual maintenance',
                  'Special discount offer',
                  'Holiday promo',
                ].map(s => (
                  <button key={s} onClick={() => setAiPrompt(s)}
                    className="text-xs px-2.5 py-1 bg-purple-50 text-purple-700 rounded-full hover:bg-purple-100 border border-purple-200 transition-colors">
                    {s}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <button onClick={() => { setShowAiModal(false); setAiPrompt(''); }}
                  className="flex-1 py-2.5 border border-gray-300 text-gray-600 text-sm font-semibold rounded-xl hover:bg-gray-50">
                  Cancel
                </button>
                <button onClick={generateMessage} disabled={aiGenerating || !aiPrompt.trim()}
                  className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold rounded-xl disabled:opacity-50 flex items-center justify-center gap-2 transition-colors">
                  {aiGenerating ? <><RefreshCw size={14} className="animate-spin" /> Generating...</> : <><Sparkles size={14} /> Generate</>}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3 — Send */}
        <div className="bg-white border rounded-2xl p-5">
          <h2 className="font-bold text-[#1e3a5f] mb-3 text-sm uppercase tracking-wide">3. Send</h2>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl mb-4 text-sm">
            <Send size={16} className="text-[#1e3a5f]" />
            <span className="text-gray-600">
              Sending to <strong className="text-[#1e3a5f]">{recipientCount} recipient{recipientCount !== 1 ? 's' : ''}</strong> · {smsCount} SMS credit{smsCount !== 1 ? 's' : ''} each = <strong className="text-[#1e3a5f]">{recipientCount * smsCount} total credits</strong>
            </span>
          </div>

          {!confirm ? (
            <button
              onClick={() => setConfirm(true)}
              disabled={!message.trim() || recipientCount === 0}
              className="w-full py-3 bg-[#1e3a5f] text-white font-bold rounded-xl hover:bg-[#152d4a] disabled:opacity-40 flex items-center justify-center gap-2"
            >
              <Send size={16} /> Send SMS Blast
            </button>
          ) : (
            <div className="space-y-2">
              <div className="text-sm text-center text-orange-600 font-semibold bg-orange-50 rounded-xl p-3">
                ⚠️ Are you sure? This will send {recipientCount * smsCount} SMS credits.
              </div>
              <div className="flex gap-2">
                <button onClick={() => setConfirm(false)} className="flex-1 py-2.5 border border-gray-300 text-gray-600 text-sm font-semibold rounded-xl hover:bg-gray-100">
                  Cancel
                </button>
                <button onClick={handleSend} disabled={sending} className="flex-1 py-2.5 bg-[#1e3a5f] text-white text-sm font-bold rounded-xl hover:bg-[#152d4a] disabled:opacity-50 flex items-center justify-center gap-2">
                  {sending ? 'Sending...' : <><Send size={14} /> Confirm Send</>}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
