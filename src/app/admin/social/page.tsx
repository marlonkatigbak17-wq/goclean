'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Upload, Sparkles, Send, X, CheckCircle, AlertCircle, Loader2, Plus, Clock, Calendar, Trash2, Film } from 'lucide-react';

const POST_TYPES = [
  { value: 'promo',        label: 'Promo / Discount',  emoji: '🎉' },
  { value: 'service',      label: 'Service Feature',    emoji: '🔧' },
  { value: 'product',      label: 'Product Showcase',   emoji: '❄️' },
  { value: 'tips',         label: 'Tips & Maintenance', emoji: '💡' },
  { value: 'before-after', label: 'Before & After',     emoji: '✨' },
  { value: 'announcement', label: 'Announcement',       emoji: '📢' },
];

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface MediaItem { file: File; preview: string; isVideo: boolean; }
interface ScheduledPost { id: string; caption: string; hashtags: string; postType: string; scheduledAt: string; status: string; mediaUrls: string[]; }

function getWeekDays(anchor: Date): Date[] {
  const start = new Date(anchor);
  start.setDate(anchor.getDate() - anchor.getDay());
  return Array.from({ length: 7 }, (_, i) => { const d = new Date(start); d.setDate(start.getDate() + i); return d; });
}

export default function SocialMediaPage() {
  const [media, setMedia]           = useState<MediaItem[]>([]);
  const [postType, setPostType]     = useState('service');
  const [notes, setNotes]           = useState('');
  const [caption, setCaption]       = useState('');
  const [hashtags, setHashtags]     = useState('');
  const [generating, setGenerating] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [scheduling, setScheduling] = useState(false);
  const [mode, setMode]             = useState<'now' | 'schedule'>('now');
  const [scheduledAt, setScheduledAt] = useState('');
  const [toast, setToast]           = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [dragging, setDragging]     = useState(false);
  const [fbDiag, setFbDiag]         = useState<string | null>(null);
  const [weekAnchor, setWeekAnchor] = useState(new Date());
  const [scheduled, setScheduled]   = useState<ScheduledPost[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const weekDays = getWeekDays(weekAnchor);

  function showToast(type: 'success' | 'error', msg: string) {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 5000);
  }

  useEffect(() => {
    loadScheduled();
  }, [weekAnchor]);

  async function loadScheduled() {
    const from = weekDays[0].toISOString();
    const to   = weekDays[6].toISOString();
    const res  = await fetch(`/api/admin/social/schedule?from=${from}&to=${to}`);
    const data = await res.json();
    if (data.posts) setScheduled(data.posts);
  }

  function addFiles(files: FileList | File[]) {
    const arr = Array.from(files);
    const valid = arr.filter(f => {
      if (!f.type.startsWith('image/') && !f.type.startsWith('video/')) { showToast('error', `${f.name} is not a supported file type.`); return false; }
      if (f.size > 100 * 1024 * 1024) { showToast('error', `${f.name} exceeds 100MB limit.`); return false; }
      return true;
    });
    const newItems: MediaItem[] = valid.map(f => ({
      file: f,
      preview: URL.createObjectURL(f),
      isVideo: f.type.startsWith('video/'),
    }));
    setMedia(prev => [...prev, ...newItems].slice(0, 10));
  }

  function removeMedia(index: number) {
    setMedia(prev => { URL.revokeObjectURL(prev[index].preview); return prev.filter((_, i) => i !== index); });
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files);
  }, []);

  async function generate() {
    setGenerating(true); setCaption(''); setHashtags('');
    try {
      const fd = new FormData();
      const videoCount = media.filter(m => m.isVideo).length;
      media.forEach((m, i) => fd.append(`media_${i}`, m.file));
      fd.append('postType', postType);
      fd.append('notes', videoCount > 0 ? `${notes} (includes ${videoCount} video${videoCount > 1 ? 's' : ''})` : notes);

      const res  = await fetch('/api/admin/social/generate', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Generation failed');
      setCaption(data.caption); setHashtags(data.hashtags);
    } catch (e: unknown) {
      showToast('error', e instanceof Error ? e.message : 'Failed to generate. Please try again.');
    } finally { setGenerating(false); }
  }

  async function publishNow() {
    if (!caption.trim()) { showToast('error', 'No caption. Please generate a post first.'); return; }
    setPublishing(true);
    try {
      const fd = new FormData();
      media.forEach((m, i) => fd.append(`media_${i}`, m.file));
      fd.append('caption', `${caption}\n\n${hashtags}`.trim());

      const res  = await fetch('/api/admin/social/publish', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Publish failed');
      showToast('success', 'Successfully posted to your Facebook page!');
      resetForm();
    } catch (e: unknown) {
      showToast('error', e instanceof Error ? e.message : 'Failed to publish.');
    } finally { setPublishing(false); }
  }

  async function schedulePost() {
    if (!caption.trim())   { showToast('error', 'No caption. Please generate a post first.'); return; }
    if (!scheduledAt)      { showToast('error', 'Please pick a date and time.'); return; }
    if (new Date(scheduledAt) <= new Date()) { showToast('error', 'Scheduled time must be in the future.'); return; }
    setScheduling(true);
    try {
      const fd = new FormData();
      media.forEach((m, i) => fd.append(`media_${i}`, m.file));
      fd.append('caption', caption);
      fd.append('hashtags', hashtags);
      fd.append('postType', postType);
      fd.append('notes', notes);
      fd.append('scheduledAt', new Date(scheduledAt).toISOString());

      const res  = await fetch('/api/admin/social/schedule', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Schedule failed');
      showToast('success', `Post scheduled for ${new Date(scheduledAt).toLocaleString()}!`);
      resetForm();
      loadScheduled();
    } catch (e: unknown) {
      showToast('error', e instanceof Error ? e.message : 'Failed to schedule.');
    } finally { setScheduling(false); }
  }

  async function cancelPost(id: string) {
    await fetch(`/api/admin/social/schedule/${id}`, { method: 'DELETE' });
    loadScheduled();
  }

  async function testConnection() {
    const res  = await fetch('/api/admin/social/test');
    const data = await res.json();
    setFbDiag(JSON.stringify(data, null, 2));
  }

  function resetForm() {
    setCaption(''); setHashtags(''); setMedia([]); setNotes(''); setScheduledAt('');
  }

  function shiftWeek(n: number) {
    setWeekAnchor(prev => { const d = new Date(prev); d.setDate(d.getDate() + n * 7); return d; });
  }

  const postsOnDay = (day: Date) =>
    scheduled.filter(p => {
      const d = new Date(p.scheduledAt);
      return d.getFullYear() === day.getFullYear() && d.getMonth() === day.getMonth() && d.getDate() === day.getDate();
    });

  const charCount = `${caption}\n\n${hashtags}`.trim().length;
  const today     = new Date();

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Social Media Manager</h1>
          <p className="text-gray-500 text-sm mt-1">Upload photos or videos, let AI write your post, then publish now or schedule for later.</p>
        </div>
        <button onClick={testConnection} className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition-colors">
          Test FB Connection
        </button>
      </div>

      {fbDiag && (
        <div className={`rounded-xl border p-4 text-xs font-mono whitespace-pre-wrap ${fbDiag.includes('"error"') ? 'bg-red-50 border-red-200 text-red-800' : 'bg-green-50 border-green-200 text-green-800'}`}>
          {fbDiag}
          <button onClick={() => setFbDiag(null)} className="block mt-2 text-gray-400 hover:text-gray-600">Close</button>
        </div>
      )}

      {toast && (
        <div className={`fixed top-20 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium ${toast.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
          {toast.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {toast.msg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT */}
        <div className="space-y-5">
          {/* Media Upload */}
          <div className="bg-white rounded-2xl shadow-sm border p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-gray-700">Photos & Videos</h2>
              <span className="text-xs text-gray-400">{media.length}/10 files</span>
            </div>
            {media.length > 0 && (
              <div className="grid grid-cols-4 gap-2 mb-3">
                {media.map((m, i) => (
                  <div key={i} className="relative group aspect-square">
                    {m.isVideo
                      ? <div className="w-full h-full bg-gray-900 rounded-lg flex flex-col items-center justify-center text-white gap-1"><Film size={20} /><span className="text-[9px] truncate max-w-[50px]">{m.file.name}</span></div>
                      : <img src={m.preview} alt="" className="w-full h-full object-cover rounded-lg" />
                    }
                    <button onClick={() => removeMedia(i)} className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"><X size={12} /></button>
                  </div>
                ))}
                {media.length < 10 && (
                  <button onClick={() => fileRef.current?.click()} className="aspect-square border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:border-blue-300 hover:bg-blue-50 transition-colors">
                    <Plus size={18} /><span className="text-[10px] mt-0.5">Add</span>
                  </button>
                )}
              </div>
            )}
            {media.length === 0 && (
              <div
                onDragOver={e => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
                onClick={() => fileRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${dragging ? 'border-blue-400 bg-blue-50' : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'}`}
              >
                <Upload size={28} className="mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">Drag & drop or <span className="text-blue-600 font-medium">click to select</span></p>
                <p className="text-xs text-gray-400 mt-1">Photos (JPG/PNG) or Videos (MP4/MOV) · Up to 10 files</p>
              </div>
            )}
            <input ref={fileRef} type="file" accept="image/*,video/*" multiple className="hidden" onChange={e => { if (e.target.files) addFiles(e.target.files); e.target.value = ''; }} />
          </div>

          {/* Post Type */}
          <div className="bg-white rounded-2xl shadow-sm border p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">Post Type</h2>
            <div className="grid grid-cols-2 gap-2">
              {POST_TYPES.map(t => (
                <button key={t.value} onClick={() => setPostType(t.value)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all ${postType === t.value ? 'bg-[#0f1f5c] text-white border-[#0f1f5c]' : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-blue-300 hover:bg-blue-50'}`}>
                  <span>{t.emoji}</span> {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white rounded-2xl shadow-sm border p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">Additional Notes <span className="text-gray-400 font-normal">(optional)</span></h2>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
              placeholder="e.g. 'Chemical cleaning before/after, Binan customer' or 'Carrier 1HP on sale this week'"
              className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-blue-200 placeholder-gray-400" />
          </div>

          <button onClick={generate} disabled={generating}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#0f1f5c] text-white rounded-xl font-semibold hover:bg-[#1a2f7a] disabled:opacity-60 disabled:cursor-not-allowed transition-colors">
            {generating ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
            {generating ? 'AI is writing your post...' : 'Generate Post'}
          </button>
        </div>

        {/* RIGHT */}
        <div className="bg-white rounded-2xl shadow-sm border p-5 flex flex-col">
          <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2"><Send size={16} /> Preview & Publish</h2>

          {!caption && !generating && (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-12 text-gray-400">
              <Sparkles size={36} className="mb-3 opacity-30" />
              <p className="text-sm">Upload media, choose a post type,<br />then click "Generate Post".</p>
            </div>
          )}

          {generating && (
            <div className="flex-1 flex flex-col items-center justify-center py-12 text-gray-400">
              <Loader2 size={32} className="animate-spin mb-3" />
              <p className="text-sm">AI is writing your post...</p>
            </div>
          )}

          {caption && !generating && (
            <div className="flex-1 flex flex-col gap-4">
              {/* FB preview */}
              <div className="bg-gray-50 rounded-xl p-4 border">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-full bg-[#0f1f5c] flex items-center justify-center text-white text-xs font-bold">GC</div>
                  <div><p className="text-xs font-semibold text-gray-800">GoClean Aircon</p><p className="text-[10px] text-gray-400">Just now · Facebook</p></div>
                </div>
                {media.length > 0 && (
                  <div className={`grid gap-1 mb-3 rounded-lg overflow-hidden ${media.length === 1 ? 'grid-cols-1' : media.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
                    {media.slice(0, 6).map((m, i) => (
                      <div key={i} className="relative">
                        {m.isVideo
                          ? <div className="w-full h-24 bg-gray-800 flex items-center justify-center rounded"><Film size={24} className="text-white" /></div>
                          : <img src={m.preview} alt="" className="w-full h-24 object-cover" />
                        }
                        {i === 5 && media.length > 6 && <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-bold text-lg">+{media.length - 6}</div>}
                      </div>
                    ))}
                  </div>
                )}
                <p className="text-xs text-gray-700 whitespace-pre-wrap">{caption}</p>
                {hashtags && <p className="text-xs text-blue-600 mt-1">{hashtags}</p>}
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Caption</label>
                <textarea value={caption} onChange={e => setCaption(e.target.value)} rows={4}
                  className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-blue-200" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Hashtags</label>
                <textarea value={hashtags} onChange={e => setHashtags(e.target.value)} rows={2}
                  className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-blue-200 text-blue-600" />
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-xs ${charCount > 500 ? 'text-orange-500' : 'text-gray-400'}`}>{charCount} chars</span>
                <button onClick={generate} className="text-xs text-blue-600 hover:underline flex items-center gap-1"><Sparkles size={12} /> Regenerate</button>
              </div>

              {/* Post now vs schedule toggle */}
              <div className="flex rounded-xl border overflow-hidden">
                <button onClick={() => setMode('now')} className={`flex-1 py-2 text-sm font-medium flex items-center justify-center gap-1.5 transition-colors ${mode === 'now' ? 'bg-[#1877F2] text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}>
                  <Send size={14} /> Post Now
                </button>
                <button onClick={() => setMode('schedule')} className={`flex-1 py-2 text-sm font-medium flex items-center justify-center gap-1.5 transition-colors ${mode === 'schedule' ? 'bg-green-600 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}>
                  <Clock size={14} /> Schedule
                </button>
              </div>

              {mode === 'schedule' && (
                <input type="datetime-local" value={scheduledAt} onChange={e => setScheduledAt(e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                  className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-200" />
              )}

              {mode === 'now'
                ? <button onClick={publishNow} disabled={publishing} className="w-full flex items-center justify-center gap-2 py-3 bg-[#1877F2] text-white rounded-xl font-semibold hover:bg-[#166fe5] disabled:opacity-60 disabled:cursor-not-allowed transition-colors">
                    {publishing ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                    {publishing ? 'Posting...' : `Post to Facebook${media.length > 1 ? ` (${media.length} files)` : ''}`}
                  </button>
                : <button onClick={schedulePost} disabled={scheduling} className="w-full flex items-center justify-center gap-2 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors">
                    {scheduling ? <Loader2 size={18} className="animate-spin" /> : <Clock size={18} />}
                    {scheduling ? 'Scheduling...' : 'Schedule Post'}
                  </button>
              }
            </div>
          )}
        </div>
      </div>

      {/* Weekly Calendar */}
      <div className="bg-white rounded-2xl shadow-sm border p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2"><Calendar size={16} /> Scheduled Posts</h2>
          <div className="flex items-center gap-2">
            <button onClick={() => shiftWeek(-1)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 text-sm">←</button>
            <span className="text-xs text-gray-600 font-medium w-40 text-center">
              {weekDays[0].toLocaleDateString('en', { month: 'short', day: 'numeric' })} – {weekDays[6].toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
            <button onClick={() => shiftWeek(1)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 text-sm">→</button>
            <button onClick={() => setWeekAnchor(new Date())} className="px-2.5 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-600">Today</button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((day, i) => {
            const isToday  = day.toDateString() === today.toDateString();
            const dayPosts = postsOnDay(day);
            return (
              <div key={i} className={`rounded-xl border p-2 min-h-[100px] ${isToday ? 'border-blue-300 bg-blue-50' : 'border-gray-100 bg-gray-50'}`}>
                <div className="text-center mb-2">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide">{DAYS[day.getDay()]}</p>
                  <p className={`text-sm font-bold ${isToday ? 'text-blue-600' : 'text-gray-700'}`}>{day.getDate()}</p>
                </div>
                <div className="space-y-1">
                  {dayPosts.map(p => (
                    <div key={p.id} className={`rounded-lg p-1.5 text-[10px] relative group ${p.status === 'published' ? 'bg-green-100 text-green-800' : p.status === 'failed' ? 'bg-red-100 text-red-700' : 'bg-white border border-gray-200 text-gray-700'}`}>
                      <p className="font-medium truncate">{new Date(p.scheduledAt).toLocaleTimeString('en', { hour: 'numeric', minute: '2-digit' })}</p>
                      <p className="truncate leading-tight">{p.caption.slice(0, 30)}…</p>
                      {p.status === 'scheduled' && (
                        <button onClick={() => cancelPost(p.id)} className="absolute top-0.5 right-0.5 opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-600">
                          <Trash2 size={10} />
                        </button>
                      )}
                    </div>
                  ))}
                  {dayPosts.length === 0 && <p className="text-[10px] text-gray-300 text-center pt-2">—</p>}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center gap-4 mt-3 text-[10px] text-gray-500">
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-white border border-gray-200 inline-block" /> Scheduled</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-green-100 inline-block" /> Published</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-red-100 inline-block" /> Failed</span>
        </div>
      </div>
    </div>
  );
}
