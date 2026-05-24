'use client';

import { useEffect, useRef, useState } from 'react';
import { MessageCircle, X, Send, Loader2, ChevronDown } from 'lucide-react';

interface Message { role: 'user' | 'assistant'; content: string; }

type Stage = 'closed' | 'form' | 'chat';

export default function ChatWidget() {
  const [stage, setStage]       = useState<Stage>('closed');
  const [name, setName]         = useState('');
  const [phone, setPhone]       = useState('');
  const [email, setEmail]       = useState('');
  const [formError, setFormError] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput]       = useState('');
  const [sending, setSending]   = useState(false);
  const [leadId, setLeadId]     = useState<string | null>(null);
  const [unread, setUnread]     = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setStage(s => s === 'closed' ? 'form' : s);
    }, 10000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (stage === 'chat') inputRef.current?.focus();
  }, [stage]);

  function openChat() {
    setStage('form');
    setUnread(false);
  }

  async function startChat(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim())  { setFormError('Please enter your name.'); return; }
    if (!phone.trim()) { setFormError('Please enter your mobile number.'); return; }
    setFormError('');
    setStage('chat');

    // Send greeting
    const greeting: Message = {
      role: 'assistant',
      content: `Hi ${name.split(' ')[0]}! 👋 I'm Christine, GoClean's AI assistant. How can I help you today? Are you looking to book a service, get a quote, or do you have questions about our aircon units?`,
    };
    setMessages([greeting]);
  }

  async function sendMessage(e?: React.FormEvent) {
    e?.preventDefault();
    const text = input.trim();
    if (!text || sending) return;

    const userMsg: Message = { role: 'user', content: text };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput('');
    setSending(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updated,
          customerName: name,
          customerPhone: phone,
          customerEmail: email,
          leadId,
        }),
      });
      const data = await res.json();
      if (data.reply) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
        if (data.leadId) setLeadId(data.leadId);
      }
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' }]);
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      {/* Chat window */}
      {stage !== 'closed' && (
        <div className="fixed bottom-20 right-4 z-50 w-[360px] max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl border flex flex-col overflow-hidden"
          style={{ height: stage === 'chat' ? '520px' : 'auto' }}>

          {/* Header */}
          <div className="bg-[#0f1f5c] px-4 py-3 flex items-center gap-3 shrink-0">
            <div className="relative">
              <img src="/christine.jpg" alt="Christine" className="w-9 h-9 rounded-full object-cover" />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-[#0f1f5c]" />
            </div>
            <div className="flex-1">
              <p className="text-white font-bold text-sm">Christine</p>
              <p className="text-blue-200 text-xs">GoClean Chat Assistant · Online</p>
            </div>
            <button onClick={() => setStage('closed')} className="text-blue-200 hover:text-white transition-colors p-1">
              <ChevronDown size={18} />
            </button>
          </div>

          {/* Lead capture form */}
          {stage === 'form' && (
            <form onSubmit={startChat} className="p-5 space-y-3">
              <p className="text-sm text-gray-600 leading-relaxed">
                Hi! Before we chat, please share a few details so Christine can assist you better.
              </p>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Full Name *</label>
                <input value={name} onChange={e => setName(e.target.value)} placeholder="Juan dela Cruz"
                  className="w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f1f5c]/30" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Mobile Number *</label>
                <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="09xxxxxxxxx" type="tel"
                  className="w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f1f5c]/30" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Email Address <span className="text-gray-400 font-normal">(optional)</span></label>
                <input value={email} onChange={e => setEmail(e.target.value)} placeholder="you@email.com" type="email"
                  className="w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f1f5c]/30" />
              </div>
              {formError && <p className="text-xs text-red-500">{formError}</p>}
              <button type="submit"
                className="w-full py-3 bg-[#0f1f5c] text-white rounded-xl font-semibold text-sm hover:bg-[#1a2f7a] transition-colors flex items-center justify-center gap-2">
                <MessageCircle size={16} /> Start Chatting with Christine
              </button>
              <p className="text-[10px] text-gray-400 text-center">Your info is kept private and used only for this chat.</p>
            </form>
          )}

          {/* Chat messages */}
          {stage === 'chat' && (
            <>
              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-gray-50">
                {messages.map((m, i) => (
                  <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {m.role === 'assistant' && (
                      <img src="/christine.jpg" alt="Christine" className="w-6 h-6 rounded-full object-cover mr-2 mt-auto shrink-0" />
                    )}
                    <div className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                      m.role === 'user'
                        ? 'bg-[#0f1f5c] text-white rounded-br-sm'
                        : 'bg-white text-gray-800 shadow-sm border rounded-bl-sm'
                    }`}>
                      {m.content}
                    </div>
                  </div>
                ))}
                {sending && (
                  <div className="flex justify-start">
                    <img src="/christine.jpg" alt="Christine" className="w-6 h-6 rounded-full object-cover mr-2 shrink-0" />
                    <div className="bg-white border shadow-sm rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1 items-center">
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <form onSubmit={sendMessage} className="flex items-center gap-2 px-3 py-3 border-t bg-white shrink-0">
                <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)}
                  placeholder="Type a message..."
                  disabled={sending}
                  className="flex-1 border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f1f5c]/30 disabled:opacity-60" />
                <button type="submit" disabled={sending || !input.trim()}
                  className="w-9 h-9 bg-[#0f1f5c] text-white rounded-xl flex items-center justify-center hover:bg-[#1a2f7a] transition-colors disabled:opacity-40 shrink-0">
                  {sending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                </button>
              </form>
            </>
          )}
        </div>
      )}

      {/* Floating toggle button */}
      <div className="fixed bottom-4 right-4 z-50">
        <button onClick={stage === 'closed' ? openChat : () => setStage('closed')}
          className="relative w-14 h-14 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center overflow-hidden bg-[#0f1f5c]">
          {stage !== 'closed'
            ? <X size={22} className="text-white" />
            : <img src="/christine.jpg" alt="Chat with Christine" className="w-full h-full object-cover" />
          }
        </button>
        {stage === 'closed' && unread && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white pointer-events-none" />
        )}
      </div>
    </>
  );
}
