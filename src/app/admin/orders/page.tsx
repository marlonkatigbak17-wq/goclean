import { formatPrice } from '@/lib/utils';

const orders = [
  { id: 'ORD-001', customer: 'Maria Santos', phone: '+63 912 345 6789', product: 'Daikin 1.5HP Inverter + Installation', total: 43000, payment: 'GCash', status: 'Pending', date: 'May 15, 2026', address: 'Makati City' },
  { id: 'ORD-002', customer: 'Juan Dela Cruz', phone: '+63 917 654 3210', product: 'LG 1.5HP Dual Inverter + Installation', total: 47000, payment: 'Maya', status: 'Confirmed', date: 'May 14, 2026', address: 'Quezon City' },
  { id: 'ORD-003', customer: 'Ana Reyes', phone: '+63 918 111 2222', product: 'Copper Tube 1/4" ×3', total: 3600, payment: 'Bank Transfer', status: 'Delivered', date: 'May 13, 2026', address: 'Pasig City' },
  { id: 'ORD-004', customer: 'Carlo Mendoza', phone: '+63 919 333 4444', product: 'Carrier 1HP Split Type', total: 22000, payment: 'Credit Card', status: 'Pending', date: 'May 12, 2026', address: 'Mandaluyong' },
];

const statusColors: Record<string, string> = {
  Pending: 'bg-yellow-100 text-yellow-700',
  Confirmed: 'bg-blue-100 text-blue-700',
  Delivered: 'bg-green-100 text-green-700',
  Cancelled: 'bg-red-100 text-red-700',
};

const statusFlow = ['Pending', 'Confirmed', 'Delivered'];

export default function AdminOrdersPage() {
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1e3a5f]">Orders</h1>
          <p className="text-gray-500 text-sm">{orders.length} orders total</p>
        </div>
        <div className="flex gap-2">
          {['All', 'Pending', 'Confirmed', 'Delivered'].map((f) => (
            <button key={f} className={`px-3 py-1.5 text-xs rounded-lg border font-medium transition-colors ${f === 'All' ? 'bg-[#1e3a5f] text-white border-[#1e3a5f]' : 'text-gray-600 border-gray-200 hover:border-[#1e3a5f]'}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {orders.map((o) => (
          <div key={o.id} className="bg-white border rounded-xl p-5 hover:shadow-sm transition-all">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <span className="font-bold text-[#1e3a5f]">{o.id}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[o.status]}`}>{o.status}</span>
                </div>
                <div className="font-medium text-gray-700">{o.customer}</div>
                <div className="text-xs text-gray-400">{o.phone} · {o.address}</div>
              </div>
              <div className="text-right">
                <div className="text-xl font-extrabold text-[#1e3a5f]">{formatPrice(o.total)}</div>
                <div className="text-xs text-gray-400">{o.payment} · {o.date}</div>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t text-sm text-gray-600">
              <span className="font-medium">Product:</span> {o.product}
            </div>
            <div className="mt-3 flex gap-2">
              {statusFlow.map((s) => (
                <button
                  key={s}
                  className={`px-3 py-1.5 text-xs rounded-lg font-medium border transition-colors ${
                    o.status === s
                      ? 'bg-[#1e3a5f] text-white border-[#1e3a5f]'
                      : 'text-gray-500 border-gray-200 hover:border-gray-400'
                  }`}
                >
                  {s}
                </button>
              ))}
              <button className="ml-auto px-3 py-1.5 text-xs rounded-lg font-medium border border-red-200 text-red-500 hover:bg-red-50 transition-colors">
                Cancel
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
