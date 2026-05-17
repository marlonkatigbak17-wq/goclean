'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingBag, User, MapPin, LogOut, CheckCircle, Clock, Truck, Wrench, CalendarCheck } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

type UserData = { id: string; name: string; email: string; phone: string; createdAt: string };
type AddressData = { street: string; city: string; province: string } | null;
type OrderItem = { name: string; amount: number; quantity: number };
type Order = {
  id: string;
  sessionId: string;
  customerName: string;
  items: OrderItem[];
  total: number;
  status: string;
  address: string;
  createdAt: string;
};

type Booking = {
  id: string;
  service: string;
  preferredDate: string;
  address: string;
  notes: string;
  status: string;
  createdAt: string;
};

const services = [
  'Aircon Cleaning',
  'Aircon Repair',
  'Aircon Installation',
  'Preventive Maintenance',
  'Refrigerant Recharge',
  'Aircon Check-up',
];

const bookingStatusColor: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-gray-100 text-gray-500',
};

const statusColor: Record<string, string> = {
  paid: 'bg-green-100 text-green-700',
  processing: 'bg-blue-100 text-blue-700',
  delivered: 'bg-gray-100 text-gray-600',
};

const statusIcon: Record<string, React.ReactNode> = {
  paid: <CheckCircle size={13} />,
  processing: <Clock size={13} />,
  delivered: <Truck size={13} />,
};

export default function AccountPage() {
  const [tab, setTab] = useState<'orders' | 'bookings' | 'profile' | 'address'>('orders');
  const [user, setUser] = useState<UserData | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [address, setAddress] = useState<AddressData>(null);
  const [profileForm, setProfileForm] = useState({ name: '', phone: '' });
  const [addressForm, setAddressForm] = useState({ street: '', city: '', province: '' });
  const [bookingForm, setBookingForm] = useState({ service: services[0], date: '', address: '', notes: '' });
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((d) => {
        if (!d.user) { router.push('/account/login'); return; }
        setUser(d.user);
        setProfileForm({ name: d.user.name, phone: d.user.phone });
      });
    fetch('/api/account/orders').then((r) => r.json()).then((d) => setOrders(d.orders ?? []));
    fetch('/api/account/bookings').then((r) => r.json()).then((d) => setBookings(d.bookings ?? []));
    fetch('/api/account/address').then((r) => r.json()).then((d) => {
      if (d.address) {
        setAddress(d.address);
        setAddressForm({ street: d.address.street, city: d.address.city, province: d.address.province });
        setBookingForm((f) => ({ ...f, address: `${d.address.street}, ${d.address.city}${d.address.province ? ', ' + d.address.province : ''}` }));
      }
    });
  }, [router]);

  async function submitBooking(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    const res = await fetch('/api/booking', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: bookingForm.address,
        service: bookingForm.service,
        date: bookingForm.date,
        notes: bookingForm.notes,
      }),
    });
    setSaving(false);
    if (res.ok) {
      setBookingSuccess(true);
      setBookingForm((f) => ({ ...f, date: '', notes: '' }));
      fetch('/api/account/bookings').then((r) => r.json()).then((d) => setBookings(d.bookings ?? []));
      setTimeout(() => setBookingSuccess(false), 4000);
    }
  }

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch('/api/account/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profileForm),
    });
    const data = await res.json();
    if (res.ok) { setUser((u) => u ? { ...u, ...data.user } : u); setSaved('profile'); }
    setSaving(false);
    setTimeout(() => setSaved(''), 2000);
  }

  async function saveAddress(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch('/api/account/address', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(addressForm),
    });
    const data = await res.json();
    if (res.ok) { setAddress(data.address); setSaved('address'); }
    setSaving(false);
    setTimeout(() => setSaved(''), 2000);
  }

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
    router.refresh();
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        <div className="animate-pulse text-center">
          <div className="text-3xl mb-2">❄️</div>
          <div>Loading your account...</div>
        </div>
      </div>
    );
  }

  const inputClass = 'w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300';

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="bg-[#0f1f5c] rounded-2xl p-6 text-white mb-6 flex items-center justify-between">
          <div>
            <div className="text-xl font-extrabold">{user.name}</div>
            <div className="text-blue-300 text-sm mt-0.5">{user.email}</div>
            <div className="text-blue-400 text-xs mt-1">
              Member since {new Date(user.createdAt).toLocaleDateString('en-PH', { month: 'long', year: 'numeric' })}
            </div>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-red-300 hover:text-red-100 transition-colors">
            <LogOut size={16} /> Sign out
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {([
            { key: 'orders', label: 'My Orders', icon: <ShoppingBag size={16} /> },
            { key: 'bookings', label: 'Maintenance', icon: <Wrench size={16} /> },
            { key: 'profile', label: 'Profile', icon: <User size={16} /> },
            { key: 'address', label: 'Address', icon: <MapPin size={16} /> },
          ] as const).map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                tab === t.key ? 'bg-[#0f1f5c] text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border'
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* Orders tab */}
        {tab === 'orders' && (
          <div className="space-y-4">
            {orders.length === 0 ? (
              <div className="bg-white rounded-2xl border p-12 text-center text-gray-400">
                <ShoppingBag size={40} className="mx-auto mb-3 opacity-30" />
                <div className="font-medium">No orders yet</div>
                <a href="/shop" className="mt-3 inline-block text-sm text-[#0f1f5c] font-semibold hover:underline">
                  Start shopping →
                </a>
              </div>
            ) : (
              orders.map((order) => (
                <div key={order.id} className="bg-white border rounded-2xl p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="font-bold text-[#0f1f5c] text-sm">
                        Order #{order.id.slice(-8).toUpperCase()}
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        {new Date(order.createdAt).toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </div>
                    </div>
                    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${statusColor[order.status] ?? 'bg-gray-100 text-gray-600'}`}>
                      {statusIcon[order.status]} {order.status}
                    </span>
                  </div>
                  <div className="space-y-1 text-sm text-gray-600 border-t pt-3">
                    {(order.items as OrderItem[]).map((item, i) => (
                      <div key={i} className="flex justify-between">
                        <span>{item.name} ×{item.quantity}</span>
                        <span>{formatPrice((item.amount * item.quantity) / 100)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t mt-3 pt-3 flex justify-between items-center">
                    <div className="text-xs text-gray-400">{order.address}</div>
                    <div className="font-extrabold text-[#0f1f5c]">{formatPrice(order.total)}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Bookings tab */}
        {tab === 'bookings' && (
          <div className="space-y-6">
            {/* Book new service */}
            <div className="bg-white border rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-5">
                <CalendarCheck size={20} className="text-[#0f1f5c]" />
                <h2 className="font-bold text-[#0f1f5c]">Book a Maintenance Service</h2>
              </div>

              {bookingSuccess && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm font-medium flex items-center gap-2">
                  <CheckCircle size={16} /> Booking submitted! We will contact you to confirm the schedule.
                </div>
              )}

              <form onSubmit={submitBooking} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Service Type</label>
                  <select
                    required
                    value={bookingForm.service}
                    onChange={(e) => setBookingForm((f) => ({ ...f, service: e.target.value }))}
                    className={inputClass}
                  >
                    {services.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Date</label>
                  <input
                    required
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={bookingForm.date}
                    onChange={(e) => setBookingForm((f) => ({ ...f, date: e.target.value }))}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Service Address</label>
                  <input
                    required
                    type="text"
                    placeholder="Where should we go?"
                    value={bookingForm.address}
                    onChange={(e) => setBookingForm((f) => ({ ...f, address: e.target.value }))}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. 2 units, 3rd floor, gate code 1234..."
                    value={bookingForm.notes}
                    onChange={(e) => setBookingForm((f) => ({ ...f, notes: e.target.value }))}
                    className={inputClass}
                  />
                </div>
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full py-3 bg-[#f0a500] text-[#0f1f5c] font-extrabold rounded-lg hover:bg-yellow-400 transition-colors disabled:opacity-60"
                >
                  {saving ? 'Submitting...' : 'Book Now'}
                </button>
              </form>
            </div>

            {/* Booking history */}
            <div>
              <h3 className="font-bold text-[#0f1f5c] mb-3">Booking History</h3>
              {bookings.length === 0 ? (
                <div className="bg-white border rounded-2xl p-10 text-center text-gray-400">
                  <Wrench size={36} className="mx-auto mb-3 opacity-30" />
                  <div className="font-medium">No bookings yet</div>
                </div>
              ) : (
                <div className="space-y-3">
                  {bookings.map((b) => (
                    <div key={b.id} className="bg-white border rounded-2xl p-4 flex items-start justify-between gap-4">
                      <div>
                        <div className="font-bold text-[#0f1f5c] text-sm">{b.service}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{b.preferredDate} · {b.address}</div>
                        {b.notes && <div className="text-xs text-gray-400 mt-0.5">{b.notes}</div>}
                        <div className="text-xs text-gray-300 mt-1">
                          Submitted {new Date(b.createdAt).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                      </div>
                      <span className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${bookingStatusColor[b.status] ?? 'bg-gray-100 text-gray-500'}`}>
                        {b.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Profile tab */}
        {tab === 'profile' && (
          <div className="bg-white border rounded-2xl p-6">
            <h2 className="font-bold text-[#0f1f5c] mb-5">Personal Information</h2>
            <form onSubmit={saveProfile} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  required
                  type="text"
                  className={inputClass}
                  value={profileForm.name}
                  onChange={(e) => setProfileForm((f) => ({ ...f, name: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" className={`${inputClass} bg-gray-50 text-gray-400`} value={user.email} disabled />
                <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  className={inputClass}
                  placeholder="09XX XXX XXXX"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm((f) => ({ ...f, phone: e.target.value }))}
                />
              </div>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 bg-[#0f1f5c] text-white font-bold rounded-lg hover:bg-[#0a1440] transition-colors disabled:opacity-60"
              >
                {saving ? 'Saving...' : saved === 'profile' ? 'Saved!' : 'Save Changes'}
              </button>
            </form>
          </div>
        )}

        {/* Address tab */}
        {tab === 'address' && (
          <div className="bg-white border rounded-2xl p-6">
            <h2 className="font-bold text-[#0f1f5c] mb-1">Delivery Address</h2>
            <p className="text-sm text-gray-400 mb-5">This will be pre-filled at checkout</p>
            <form onSubmit={saveAddress} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                <input
                  type="text"
                  className={inputClass}
                  placeholder="Unit/House No., Street, Barangay"
                  value={addressForm.street}
                  onChange={(e) => setAddressForm((f) => ({ ...f, street: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input
                    type="text"
                    className={inputClass}
                    placeholder="Santa Rosa"
                    value={addressForm.city}
                    onChange={(e) => setAddressForm((f) => ({ ...f, city: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Province</label>
                  <input
                    type="text"
                    className={inputClass}
                    placeholder="Laguna"
                    value={addressForm.province}
                    onChange={(e) => setAddressForm((f) => ({ ...f, province: e.target.value }))}
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 bg-[#0f1f5c] text-white font-bold rounded-lg hover:bg-[#0a1440] transition-colors disabled:opacity-60"
              >
                {saving ? 'Saving...' : saved === 'address' ? 'Saved!' : 'Save Address'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
