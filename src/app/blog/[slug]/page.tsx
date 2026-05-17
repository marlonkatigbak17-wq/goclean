import { notFound } from 'next/navigation';
import { posts, getPostBySlug } from '@/lib/blog';
import Link from 'next/link';
import { Clock, ArrowLeft, BookOpen } from 'lucide-react';

export async function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};
  return {
    title: `${post.title} | GoClean Aircon Blog`,
    description: post.description,
  };
}

function renderMarkdown(content: string) {
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith('## ')) {
      elements.push(<h2 key={i} className="text-xl font-extrabold text-[#1e3a5f] mt-8 mb-3">{line.slice(3)}</h2>);
    } else if (line.startsWith('**') && line.endsWith('**')) {
      elements.push(<p key={i} className="font-bold text-[#1e3a5f] mt-3 mb-1">{line.slice(2, -2)}</p>);
    } else if (line.startsWith('- ')) {
      const listItems: string[] = [];
      while (i < lines.length && lines[i].startsWith('- ')) {
        listItems.push(lines[i].slice(2));
        i++;
      }
      elements.push(
        <ul key={i} className="list-disc list-inside space-y-1 my-3 text-gray-700 text-sm">
          {listItems.map((item, j) => <li key={j} dangerouslySetInnerHTML={{ __html: item.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />)}
        </ul>
      );
      continue;
    } else if (line.startsWith('| ')) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].startsWith('| ')) {
        if (!lines[i].includes('---')) tableLines.push(lines[i]);
        i++;
      }
      if (tableLines.length > 0) {
        const [header, ...rows] = tableLines;
        const headers = header.split('|').filter(Boolean).map(h => h.trim());
        elements.push(
          <div key={i} className="overflow-x-auto my-4">
            <table className="w-full text-sm border-collapse">
              <thead><tr className="bg-gray-100">
                {headers.map((h, j) => <th key={j} className="px-4 py-2 text-left font-semibold text-[#1e3a5f] border border-gray-200">{h}</th>)}
              </tr></thead>
              <tbody>
                {rows.map((row, ri) => (
                  <tr key={ri} className="border-b border-gray-100">
                    {row.split('|').filter(Boolean).map((cell, ci) => (
                      <td key={ci} className="px-4 py-2 text-gray-700 border border-gray-200">{cell.trim()}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }
      continue;
    } else if (line.trim() === '') {
      elements.push(<div key={i} className="h-2" />);
    } else {
      const html = line
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/_(.*?)_/g, '<em>$1</em>');
      elements.push(<p key={i} className="text-gray-700 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: html }} />);
    }
    i++;
  }
  return elements;
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const otherPosts = posts.filter((p) => p.slug !== slug).slice(0, 3);

  return (
    <div className="py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <Link href="/blog" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#1e3a5f] mb-6 transition-colors">
          <ArrowLeft size={14} /> Back to Blog
        </Link>

        <div className="mb-6">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-semibold">{post.category}</span>
            <span className="text-xs text-gray-400 flex items-center gap-1"><Clock size={11} /> {post.readTime}</span>
            <span className="text-xs text-gray-400">{post.date}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#1e3a5f] mb-3">{post.title}</h1>
          <p className="text-gray-500">{post.description}</p>
        </div>

        <div className="bg-white border rounded-2xl p-6 md:p-8 mb-8">
          {renderMarkdown(post.content)}
        </div>

        {/* CTA */}
        <div className="bg-[#0f1f5c] text-white rounded-2xl p-6 text-center mb-8">
          <BookOpen size={24} className="mx-auto mb-2 text-blue-300" />
          <h3 className="font-extrabold text-lg mb-2">Need professional aircon service?</h3>
          <p className="text-blue-200 text-sm mb-4">GoClean serves Laguna, Cavite, Metro Manila, and Rizal</p>
          <div className="flex justify-center gap-3 flex-wrap">
            <Link href="/book" className="px-5 py-2.5 bg-[#f0a500] text-[#1e3a5f] font-bold rounded-lg text-sm hover:bg-yellow-400 transition-colors">
              Book a Service
            </Link>
            <Link href="/shop" className="px-5 py-2.5 bg-white/10 text-white font-bold rounded-lg text-sm hover:bg-white/20 transition-colors">
              Shop Aircons
            </Link>
          </div>
        </div>

        {/* Related posts */}
        {otherPosts.length > 0 && (
          <div>
            <h2 className="font-extrabold text-[#1e3a5f] mb-4">More Articles</h2>
            <div className="space-y-3">
              {otherPosts.map((p) => (
                <Link key={p.slug} href={`/blog/${p.slug}`} className="block bg-white border rounded-xl p-4 hover:shadow-sm transition-all hover:border-[#1e3a5f]/30 group">
                  <div className="font-semibold text-[#1e3a5f] group-hover:underline text-sm">{p.title}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{p.description}</div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
