import { posts } from '@/lib/blog';
import Link from 'next/link';
import { BookOpen, Clock } from 'lucide-react';

export const metadata = {
  title: 'Aircon Tips & Guides | GoClean Aircon Blog',
  description: 'Expert tips on aircon cleaning, maintenance, repair, and buying guides for Philippine homeowners.',
};

const categoryColors: Record<string, string> = {
  'Maintenance': 'bg-blue-100 text-blue-700',
  'Repair': 'bg-red-100 text-red-700',
  'Buying Guide': 'bg-green-100 text-green-700',
  'Tips': 'bg-yellow-100 text-yellow-700',
};

export default function BlogPage() {
  return (
    <div className="py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-[#0f1f5c] rounded-full mb-4">
            <BookOpen size={24} className="text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-[#1e3a5f] mb-2">Aircon Tips & Guides</h1>
          <p className="text-gray-500">Expert advice for Philippine homeowners — keep your aircon running efficiently</p>
        </div>

        <div className="space-y-5">
          {posts.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="block group">
              <div className="bg-white border rounded-2xl p-6 hover:shadow-md transition-all hover:border-[#1e3a5f]/30">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${categoryColors[post.category] ?? 'bg-gray-100 text-gray-600'}`}>
                    {post.category}
                  </span>
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Clock size={11} /> {post.readTime}
                  </span>
                  <span className="text-xs text-gray-400">{post.date}</span>
                </div>
                <h2 className="text-lg font-extrabold text-[#1e3a5f] mb-2 group-hover:underline">{post.title}</h2>
                <p className="text-sm text-gray-600">{post.description}</p>
                <div className="mt-3 text-sm text-[#1e3a5f] font-semibold">Read more →</div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-10 bg-blue-50 border border-blue-200 rounded-2xl p-6 text-center">
          <h3 className="font-bold text-[#1e3a5f] mb-2">Need your aircon serviced?</h3>
          <p className="text-sm text-gray-500 mb-4">We cover Laguna, Cavite, Metro Manila, and Rizal</p>
          <Link href="/book" className="inline-block px-6 py-2.5 bg-[#1e3a5f] text-white font-bold rounded-lg text-sm hover:bg-[#152d4a] transition-colors">
            Book a Service
          </Link>
        </div>
      </div>
    </div>
  );
}
