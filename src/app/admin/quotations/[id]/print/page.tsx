'use client';
import { useEffect, useState, use } from 'react';

type QuotationItem = { description: string; qty: number; price: number };
type Quotation = {
  id: string; customerName: string; customerEmail: string; customerPhone: string;
  items: QuotationItem[]; subtotal: number; discount: number; total: number;
  status: string; notes: string; validUntil: string | null; createdAt: string;
  lead?: { name: string } | null;
};

export default function PrintQuotationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [q, setQ] = useState<Quotation | null>(null);

  useEffect(() => {
    fetch(`/api/admin/quotations/${id}`)
      .then(r => r.json())
      .then(data => {
        setQ(data);
        setTimeout(() => window.print(), 800);
      });
  }, [id]);

  if (!q) return (
    <div className="flex items-center justify-center min-h-screen text-gray-400">Loading quotation...</div>
  );

  const quoteNo = q.id.slice(-8).toUpperCase();
  const createdDate = new Date(q.createdAt).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' });
  const validDate = q.validUntil ? new Date(q.validUntil).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' }) : null;

  return (
    <>
      <style>{`
        @media print {
          body { margin: 0; }
          .no-print { display: none !important; }
          @page { size: A4; margin: 20mm; }
        }
      `}</style>

      {/* Print button — hidden when printing */}
      <div className="no-print flex gap-3 justify-center p-4 bg-gray-100">
        <button onClick={() => window.print()} className="px-6 py-2.5 bg-[#0f1f5c] text-white font-bold rounded-xl text-sm hover:bg-[#152d4a]">
          Download / Print PDF
        </button>
        <button onClick={() => window.close()} className="px-6 py-2.5 border border-gray-300 text-gray-600 font-semibold rounded-xl text-sm hover:bg-gray-50">
          Close
        </button>
      </div>

      {/* Invoice */}
      <div className="max-w-2xl mx-auto bg-white p-10 min-h-screen">

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <div className="text-2xl font-extrabold text-[#0f1f5c]">GoClean Aircon</div>
            <div className="text-sm text-gray-500 mt-1">Supplies & Services</div>
            <div className="text-sm text-gray-500">Biñan, Laguna · Metro Manila</div>
            <div className="text-sm text-gray-500">0917 823 7205 · gocleanair.co</div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-extrabold text-[#0f1f5c] uppercase tracking-wide">Quotation</div>
            <div className="text-sm text-gray-500 mt-1">No. <span className="font-bold text-gray-700">#{quoteNo}</span></div>
            <div className="text-sm text-gray-500">Date: <span className="font-medium text-gray-700">{createdDate}</span></div>
            {validDate && <div className="text-sm text-gray-500">Valid Until: <span className="font-medium text-gray-700">{validDate}</span></div>}
            <span className={`inline-block mt-2 px-3 py-0.5 rounded-full text-xs font-bold capitalize ${
              q.status === 'accepted' ? 'bg-green-100 text-green-700' :
              q.status === 'sent' ? 'bg-blue-100 text-blue-700' :
              q.status === 'declined' ? 'bg-red-100 text-red-600' :
              'bg-gray-100 text-gray-600'
            }`}>{q.status}</span>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t-2 border-[#0f1f5c] mb-6" />

        {/* Bill to */}
        <div className="mb-6">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Bill To</div>
          <div className="text-lg font-bold text-[#0f1f5c]">{q.customerName}</div>
          {q.customerPhone && <div className="text-sm text-gray-600">{q.customerPhone}</div>}
          {q.customerEmail && <div className="text-sm text-gray-600">{q.customerEmail}</div>}
        </div>

        {/* Items table */}
        <table className="w-full mb-6 text-sm">
          <thead>
            <tr className="bg-[#0f1f5c] text-white">
              <th className="text-left px-4 py-2.5 rounded-tl-lg font-semibold">Description</th>
              <th className="text-center px-4 py-2.5 font-semibold w-16">Qty</th>
              <th className="text-right px-4 py-2.5 font-semibold w-28">Unit Price</th>
              <th className="text-right px-4 py-2.5 rounded-tr-lg font-semibold w-28">Amount</th>
            </tr>
          </thead>
          <tbody>
            {(q.items as QuotationItem[]).map((item, i) => (
              <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-4 py-2.5 text-gray-700">{item.description}</td>
                <td className="px-4 py-2.5 text-center text-gray-600">{item.qty}</td>
                <td className="px-4 py-2.5 text-right text-gray-600">₱{item.price.toLocaleString()}</td>
                <td className="px-4 py-2.5 text-right font-medium text-gray-700">₱{(item.qty * item.price).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end mb-6">
          <div className="w-64 space-y-1.5">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Subtotal</span><span>₱{q.subtotal.toLocaleString()}</span>
            </div>
            {q.discount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Discount</span><span>- ₱{q.discount.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-extrabold text-[#0f1f5c] pt-2 border-t-2 border-[#0f1f5c]">
              <span>TOTAL</span><span>₱{q.total.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        {q.notes && (
          <div className="mb-6 p-4 bg-blue-50 rounded-xl">
            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Notes / Terms</div>
            <div className="text-sm text-gray-600 whitespace-pre-line">{q.notes}</div>
          </div>
        )}

        {/* Footer */}
        <div className="border-t pt-5 mt-8 text-center text-xs text-gray-400">
          <div>Thank you for considering GoClean Aircon Supplies & Services</div>
          <div className="mt-1">TESDA NC III Certified · Authorized Daikin Dealer · gocleanair.co</div>
        </div>
      </div>
    </>
  );
}
