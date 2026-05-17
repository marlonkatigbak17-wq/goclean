'use client';

import { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';

const chatOptions = [
  {
    label: 'Viber',
    href: 'viber://chat?number=%2B639178237205',
    bg: 'bg-[#7360f2]',
    hover: 'hover:bg-[#5f4dd0]',
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white shrink-0" xmlns="http://www.w3.org/2000/svg">
        <path d="M11.4 0C5.5.3.9 4.8.6 10.7c-.2 3 .7 5.8 2.4 8L2 22.5c-.1.4.3.8.7.6l4-1.5c2 1.2 4.3 1.8 6.7 1.7 5.9-.3 10.5-4.8 10.8-10.7C24.5 5.5 18.6-.3 11.4 0zm5.3 16.7c-.5.5-1 .8-1.7.9-.2 0-.4 0-.6-.1-1.3-.4-2.5-1-3.5-1.9-1-1-1.8-2.1-2.4-3.4-.3-.7-.5-1.3-.5-2 0-.7.2-1.3.7-1.8l.5-.5c.3-.3.6-.4.9-.4.1 0 .2 0 .3.1.3.1.5.3.7.6l1.1 1.6c.2.3.2.5.1.8-.1.2-.2.4-.4.5l-.5.5c-.1.1-.1.2 0 .3.4.7.9 1.4 1.5 1.9.5.5 1.1.9 1.8 1.2.1.1.2 0 .3 0l.5-.5c.2-.2.4-.3.6-.3h.2c.3.1.6.3.8.5l1.5 1.2c.3.2.4.5.4.8-.1.3-.2.6-.3.9z"/>
      </svg>
    ),
  },
  {
    label: 'Messenger',
    href: 'https://m.me/gocleanaircon',
    bg: 'bg-[#0084ff]',
    hover: 'hover:bg-[#006fd4]',
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white shrink-0" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 0C5.4 0 0 5 0 11.2c0 3.5 1.7 6.7 4.5 8.8V24l4-2.2c1.1.3 2.3.5 3.5.5 6.6 0 12-5 12-11.2S18.6 0 12 0zm1.2 15.1l-3-3.2-5.9 3.2L10.6 8l3.1 3.2L19.4 8l-6.2 7.1z"/>
      </svg>
    ),
  },
  {
    label: 'WhatsApp',
    href: 'https://wa.me/639178237205',
    bg: 'bg-[#25d366]',
    hover: 'hover:bg-[#1db954]',
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white shrink-0" xmlns="http://www.w3.org/2000/svg">
        <path d="M17.5 14.4c-.3-.1-1.7-.8-1.9-.9-.3-.1-.5-.1-.7.1-.2.3-.8.9-.9 1.1-.2.2-.3.2-.6.1-1.6-.8-2.7-1.4-3.7-3.1-.3-.5.3-.4.8-1.5.1-.2 0-.4-.1-.5-.1-.1-.7-1.7-1-2.3-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.4s1 2.8 1.2 3c.1.1 2 3.1 4.9 4.3 1.8.8 2.5.8 3.4.7.5-.1 1.7-.7 1.9-1.4.2-.6.2-1.2.1-1.3l-.3-.2zM12 0C5.4 0 0 5.4 0 12c0 2.1.6 4.2 1.6 6L0 24l6.3-1.6c1.7.9 3.7 1.4 5.7 1.4 6.6 0 12-5.4 12-12S18.6 0 12 0zm0 21.8c-1.8 0-3.6-.5-5.1-1.4l-.4-.2-3.7.9.9-3.6-.2-.4C2.4 15.5 2 13.8 2 12 2 6.5 6.5 2 12 2s10 4.5 10 10-4.5 9.8-10 9.8z"/>
      </svg>
    ),
  },
];

export default function FloatingChat() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-6 left-6 z-50 flex flex-col items-start gap-3">
      {/* Chat panel */}
      <div
        className={`transition-all duration-300 origin-bottom-left ${
          open ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'
        }`}
      >
        <div className="bg-white rounded-2xl shadow-2xl border w-64 overflow-hidden">
          <div className="bg-[#1e3a5f] px-4 py-3 flex items-center justify-between">
            <span className="text-white font-bold text-sm">Chat with us</span>
            <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white">
              <X size={16} />
            </button>
          </div>
          <div className="p-4">
            <p className="text-xs text-gray-500 mb-4">Chat our Online Personal Shopper</p>
            <div className="flex flex-col gap-2">
              {chatOptions.map((opt) => (
                <a
                  key={opt.label}
                  href={opt.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-3 ${opt.bg} ${opt.hover} text-white font-semibold text-sm px-4 py-2.5 rounded-full transition-colors`}
                >
                  {opt.icon}
                  {opt.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        {/* WhatsApp standalone button */}
        <a
          href="https://wa.me/639178237205"
          target="_blank"
          rel="noopener noreferrer"
          className="w-14 h-14 rounded-full bg-[#25d366] text-white shadow-lg hover:bg-[#1db954] transition-all flex items-center justify-center"
          aria-label="Chat on WhatsApp"
        >
          <svg viewBox="0 0 24 24" className="w-7 h-7 fill-white" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.5 14.4c-.3-.1-1.7-.8-1.9-.9-.3-.1-.5-.1-.7.1-.2.3-.8.9-.9 1.1-.2.2-.3.2-.6.1-1.6-.8-2.7-1.4-3.7-3.1-.3-.5.3-.4.8-1.5.1-.2 0-.4-.1-.5-.1-.1-.7-1.7-1-2.3-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.4s1 2.8 1.2 3c.1.1 2 3.1 4.9 4.3 1.8.8 2.5.8 3.4.7.5-.1 1.7-.7 1.9-1.4.2-.6.2-1.2.1-1.3l-.3-.2zM12 0C5.4 0 0 5.4 0 12c0 2.1.6 4.2 1.6 6L0 24l6.3-1.6c1.7.9 3.7 1.4 5.7 1.4 6.6 0 12-5.4 12-12S18.6 0 12 0zm0 21.8c-1.8 0-3.6-.5-5.1-1.4l-.4-.2-3.7.9.9-3.6-.2-.4C2.4 15.5 2 13.8 2 12 2 6.5 6.5 2 12 2s10 4.5 10 10-4.5 9.8-10 9.8z"/>
          </svg>
        </a>

        {/* Toggle button */}
        <button
          onClick={() => setOpen((v) => !v)}
          className="w-14 h-14 rounded-full bg-[#1e3a5f] text-white shadow-lg hover:bg-[#152d4a] transition-all flex items-center justify-center"
          aria-label="Chat with us"
        >
          {open ? <X size={22} /> : <MessageCircle size={22} />}
        </button>
      </div>
    </div>
  );
}
