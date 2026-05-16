'use client';
import { useToastStore } from '@/store/toastStore';
import { CheckCircle, X } from 'lucide-react';

export default function Toast() {
  const { message, visible, hide } = useToastStore();

  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
      }`}
    >
      <div className="flex items-center gap-3 bg-[#1e3a5f] text-white px-5 py-3 rounded-xl shadow-xl min-w-[240px]">
        <CheckCircle size={18} className="text-green-400 shrink-0" />
        <span className="text-sm font-medium flex-1">{message}</span>
        <button onClick={hide} className="text-white/60 hover:text-white">
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
