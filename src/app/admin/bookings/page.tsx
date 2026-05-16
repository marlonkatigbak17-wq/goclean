const bookings = [
  { id: 'BK-001', name: 'Carlo Mendoza', phone: '+63 912 111 2222', email: 'carlo@email.com', service: 'Aircon Cleaning', address: 'Pasig City', date: 'May 16, 2026', notes: '2 units, 1.5HP each', status: 'Confirmed' },
  { id: 'BK-002', name: 'Liza Bautista', phone: '+63 917 333 4444', email: 'liza@email.com', service: 'Aircon Repair', address: 'Makati City', date: 'May 17, 2026', notes: 'Not cooling, possible gas leak', status: 'Pending' },
  { id: 'BK-003', name: 'Ramon Garcia', phone: '+63 918 555 6666', email: 'ramon@email.com', service: 'Installation', address: 'Taguig City', date: 'May 18, 2026', notes: 'New Daikin 1.5HP, 2nd floor', status: 'Pending' },
  { id: 'BK-004', name: 'Susan Torres', phone: '+63 919 777 8888', email: 'susan@email.com', service: 'Preventive Maintenance', address: 'Quezon City', date: 'May 20, 2026', notes: '3 units, office building', status: 'Confirmed' },
  { id: 'BK-005', name: 'Andres Reyes', phone: '+63 920 999 0000', email: 'andres@email.com', service: 'Commercial HVAC', address: 'Mandaluyong', date: 'May 22, 2026', notes: 'Assessment for 5-unit office', status: 'Pending' },
];

const statusColors: Record<string, string> = {
  Pending: 'bg-yellow-100 text-yellow-700',
  Confirmed: 'bg-blue-100 text-blue-700',
  Completed: 'bg-green-100 text-green-700',
  Cancelled: 'bg-red-100 text-red-700',
};

export default function AdminBookingsPage() {
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1e3a5f]">Service Bookings</h1>
          <p className="text-gray-500 text-sm">{bookings.length} bookings total</p>
        </div>
        <div className="flex gap-2">
          {['All', 'Pending', 'Confirmed', 'Completed'].map((f) => (
            <button key={f} className={`px-3 py-1.5 text-xs rounded-lg border font-medium transition-colors ${f === 'All' ? 'bg-[#1e3a5f] text-white border-[#1e3a5f]' : 'text-gray-600 border-gray-200 hover:border-[#1e3a5f]'}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-5 py-3 font-semibold text-gray-600">ID</th>
              <th className="text-left px-5 py-3 font-semibold text-gray-600">Customer</th>
              <th className="text-left px-5 py-3 font-semibold text-gray-600">Service</th>
              <th className="text-left px-5 py-3 font-semibold text-gray-600">Date</th>
              <th className="text-left px-5 py-3 font-semibold text-gray-600">Location</th>
              <th className="text-left px-5 py-3 font-semibold text-gray-600">Status</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {bookings.map((b) => (
              <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-3 font-mono text-xs text-gray-500">{b.id}</td>
                <td className="px-5 py-3">
                  <div className="font-medium text-[#1e3a5f]">{b.name}</div>
                  <div className="text-xs text-gray-400">{b.phone}</div>
                </td>
                <td className="px-5 py-3 text-gray-600">{b.service}</td>
                <td className="px-5 py-3 text-gray-600">{b.date}</td>
                <td className="px-5 py-3 text-gray-600">{b.address}</td>
                <td className="px-5 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[b.status]}`}>{b.status}</span>
                </td>
                <td className="px-5 py-3">
                  <div className="flex gap-1">
                    <button className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded font-medium hover:bg-blue-200 transition-colors">Confirm</button>
                    <button className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded font-medium hover:bg-green-200 transition-colors">Done</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
