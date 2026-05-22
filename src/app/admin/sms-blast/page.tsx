'use client';
import { useState, useEffect } from 'react';
import { Send, Users, Wrench, AlertTriangle, UserSquare2, Phone, CheckCircle2 } from 'lucide-react';

type Counts = { allCustomers: number; maintenanceDue: number; warrantyExpiring: number; allLeads: number };

const GROUPS = [
  { key: 'all_customers',    label: 'All Customers',          desc: 'Every customer with a phone number',            icon: Users,         countKey: 'allCustomers' },
  { key: 'maintenance_due',  label: 'Maintenance Due',         desc: 'No booking in the last 6 months',               icon: Wrench,        countKey: 'maintenanceDue' },
  { key: 'warranty_expiring',label: 'Warranty Expiring Soon',  desc: 'Warranty expires within 30 days',               icon: AlertTriangle,  countKey: 'warrantyExpiring' },
  { key: 'all_leads',        label: 'All Leads',               desc: 'Everyone in your leads pipeline',               icon: UserSquare2,   countKey: 'allLeads' },
  { key: 'custom',           label: 'Custom Numbers',          desc: 'Paste specific phone numbers to send to',       icon: Phone,         countKey: null },
];

const MAX_CHARS = 160;

export default function SmsBlastPage() {
  const [counts, setCounts] = useState<Counts | null>(null);
  const [group, setGroup] = useState('all_customers');
  const [message, setMessage] = useState('');
  const [customNumbers, setCustomNumbers] = useState('');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ sent: number; failed: number; total: number } | null>(null);
  const [confirm, setConfirm] = useState(false);

  useEffect(() => {
    fetch('/api/admin/sms-blast').then(r => r.json()).then(setCounts);
  }, []);

  function getRecipientCount() {
    if (!counts || group === 'custom') {
      if (group === 'custom') {
        return customNumbers.split(/[\n,;]+/).map(n => n.trim()).filter(Boolean).length;
      }
      return 0;
    }
    const g = GROUPS.find(g => g.key === group);
    if (!g?.countKey) return 0;
    return counts[g.countKey as keyof Counts] ?? 0;
  }

  async function handleSend() {
    setSending(true);
    setResult(null);
    const res = await fetch('/api/admin/sms-blast', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ group, message, customNumbers }),
    });
    const data = await res.json();
    if (res.ok) {
      setResult(data);
      setMessage('');
      setCustomNumbers('');
      setConfirm(false);
    } else {
      alert(data.error || 'Failed to send');
    }
    setSending(false);
  }

  const recipientCount = getRecipientCount();
  const charsLeft = MAX_CHARS - message.length;
  const smsCount = Math.ceil(message.length / MAX_CHARS) || 1;

  return (
    <div className="p-6 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-[#1e3a5f]">SMS Blast</h1>
        <p className="text-sm text-gray-400 mt-0.5">Send a message to a group of customers or leads</p>
      </div>

      {/* Success result */}
      {result && (
        <div className="mb-5 bg-green-50 border border-green-200 rounded-2xl p-5 flex items-start gap-3">
          <CheckCircle2 size={20} className="text-green-600 mt-0.5 shrink-0" />
          <div>
            <div className="font-bold text-green-700">SMS Blast Sent!</div>
            <div className="text-sm text-green-600 mt-1">
              {result.sent} sent successfully{result.failed > 0 && `, ${result.failed} failed`} out of {result.total} recipients.
            </div>
          </div>
        </div>
      )}

      <div className="space-y-5">
        {/* Step 1 — Choose group */}
        <div className="bg-white border rounded-2xl p-5">
          <h2 className="font-bold text-[#1e3a5f] mb-3 text-sm uppercase tracking-wide">1. Choose Recipients</h2>
          <div className="space-y-2">
            {GROUPS.map(g => {
              const Icon = g.icon;
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
            <div className="mt-3">
              <label className="block text-xs text-gray-500 mb-1">Phone numbers (one per line, or comma-separated)</label>
              <textarea
                rows={4}
                value={customNumbers}
                onChange={e => setCustomNumbers(e.target.value)}
                placeholder="09171234567&#10;09181234567&#10;09191234567"
                className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#1e3a5f] resize-none font-mono"
              />
              <div className="text-xs text-gray-400 mt-1">{recipientCount} number{recipientCount !== 1 ? 's' : ''} entered</div>
            </div>
          )}
        </div>

        {/* Step 2 — Write message */}
        <div className="bg-white border rounded-2xl p-5">
          <h2 className="font-bold text-[#1e3a5f] mb-3 text-sm uppercase tracking-wide">2. Write Your Message</h2>
          <textarea
            rows={5}
            value={message}
            onChange={e => setMessage(e.target.value)}
            maxLength={MAX_CHARS * 3}
            placeholder="Hi! This is GoClean Aircon. Time for your annual aircon cleaning? Book now at gocleanair.co or call 0917 823 7205."
            className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1e3a5f] resize-none"
          />
          <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
            <span>{message.length} characters · {smsCount} SMS credit{smsCount !== 1 ? 's' : ''} per recipient</span>
            <span className={charsLeft < 20 ? 'text-red-500 font-bold' : ''}>{charsLeft} left</span>
          </div>
        </div>

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
