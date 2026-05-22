'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Wrench, CalendarDays, CheckCircle2, Clock, LogOut } from 'lucide-react';

type Job = {
  id: string; name: string; phone: string; service: string;
  address: string; preferredDate: string; status: string; notes: string;
  unitModel: string;
};

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-600',
};

export default function TechnicianDashboard() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('active');

  useEffect(() => {
    fetch('/api/technician/jobs')
      .then(r => {
        if (r.status === 401) { router.push('/technician/login'); return null; }
        return r.json();
      })
      .then(d => { if (d) setJobs(Array.isArray(d) ? d : []); })
      .finally(() => setLoading(false));
  }, [router]);

  async function handleLogout() {
    await fetch('/api/technician/logout', { method: 'POST' });
    router.push('/technician/login');
  }

  const activeJobs = jobs.filter(j => j.status !== 'completed' && j.status !== 'cancelled');
  const completedJobs = jobs.filter(j => j.status === 'completed');
  const displayed = filter === 'active' ? activeJobs : completedJobs;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#1e3a5f] text-white px-5 py-4">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center"><Wrench size={18} /></div>
            <div>
              <div className="font-extrabold">GoClean Technician</div>
              <div className="text-xs text-blue-300">My Jobs</div>
            </div>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-1.5 text-xs text-blue-300 hover:text-white"><LogOut size={14} /> Logout</button>
        </div>
      </div>

      <div className="max-w-lg mx-auto p-4">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { label: 'Total', value: jobs.length, icon: CalendarDays },
            { label: 'Active', value: activeJobs.length, icon: Clock },
            { label: 'Done', value: completedJobs.length, icon: CheckCircle2 },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="bg-white rounded-2xl p-4 text-center border">
              <Icon size={18} className="text-[#1e3a5f] mx-auto mb-1" />
              <div className="text-2xl font-extrabold text-[#1e3a5f]">{value}</div>
              <div className="text-xs text-gray-400">{label}</div>
            </div>
          ))}
        </div>

        {/* Filter */}
        <div className="flex gap-2 mb-4">
          {['active', 'completed'].map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`px-4 py-1.5 rounded-full text-xs font-bold capitalize transition-colors ${filter === f ? 'bg-[#1e3a5f] text-white' : 'bg-white text-gray-600 border hover:border-[#1e3a5f]'}`}>
              {f} ({f === 'active' ? activeJobs.length : completedJobs.length})
            </button>
          ))}
        </div>

        {loading ? <div className="text-center py-16 text-gray-400">Loading jobs...</div> : (
          <div className="space-y-3">
            {displayed.map(j => (
              <Link key={j.id} href={`/technician/jobs/${j.id}`}
                className="block bg-white border rounded-2xl p-4 hover:shadow-sm transition-all active:scale-[0.99]">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="font-bold text-[#1e3a5f]">{j.name}</div>
                    <div className="text-xs text-gray-400">{j.phone}</div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold capitalize ${STATUS_COLORS[j.status] ?? 'bg-gray-100 text-gray-500'}`}>{j.status}</span>
                </div>
                <div className="text-sm font-semibold text-gray-700 mb-1">{j.service}</div>
                <div className="text-xs text-gray-500">{j.address}</div>
                <div className="flex items-center gap-1 mt-2 text-xs text-gray-400"><CalendarDays size={12} /> {j.preferredDate}</div>
                {j.unitModel && <div className="mt-1 text-xs text-blue-500">Unit: {j.unitModel}</div>}
              </Link>
            ))}
            {displayed.length === 0 && <div className="text-center py-16 text-gray-400">No {filter} jobs</div>}
          </div>
        )}
      </div>
    </div>
  );
}
