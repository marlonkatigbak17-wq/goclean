'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, Sparkles, Send, X, ImageIcon, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

const POST_TYPES = [
  { value: 'promo',        label: 'Promo / Discount',    emoji: '🎉' },
  { value: 'service',      label: 'Service Feature',      emoji: '🔧' },
  { value: 'product',      label: 'Product Showcase',     emoji: '❄️' },
  { value: 'tips',         label: 'Tips & Maintenance',   emoji: '💡' },
  { value: 'before-after', label: 'Before & After',       emoji: '✨' },
  { value: 'announcement', label: 'Announcement',         emoji: '📢' },
];

export default function SocialMediaPage() {
  const [image, setImage]           = useState<File | null>(null);
  const [preview, setPreview]       = useState<string>('');
  const [postType, setPostType]     = useState('service');
  const [notes, setNotes]           = useState('');
  const [caption, setCaption]       = useState('');
  const [hashtags, setHashtags]     = useState('');
  const [generating, setGenerating] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [toast, setToast]           = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [dragging, setDragging]     = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function showToast(type: 'success' | 'error', msg: string) {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 5000);
  }

  function handleFile(file: File) {
    if (!file.type.startsWith('image/')) { showToast('error', 'Image files lang po ang pwede.'); return; }
    if (file.size > 10 * 1024 * 1024) { showToast('error', 'Maximum 10MB lang ang image.'); return; }
    setImage(file);
    setPreview(URL.createObjectURL(file));
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }, []);

  function removeImage() {
    setImage(null);
    setPreview('');
    if (fileRef.current) fileRef.current.value = '';
  }

  async function generate() {
    setGenerating(true);
    setCaption('');
    setHashtags('');
    try {
      const fd = new FormData();
      if (image) fd.append('image', image);
      fd.append('postType', postType);
      fd.append('notes', notes);

      const res  = await fetch('/api/admin/social/generate', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Generation failed');
      setCaption(data.caption);
      setHashtags(data.hashtags);
    } catch (e: unknown) {
      showToast('error', e instanceof Error ? e.message : 'Hindi nagawa ang post. Subukan ulit.');
    } finally {
      setGenerating(false);
    }
  }

  async function publish() {
    if (!caption.trim()) { showToast('error', 'Walang caption. I-generate muna ang post.'); return; }
    setPublishing(true);
    try {
      const fd = new FormData();
      if (image) fd.append('image', image);
      fd.append('caption', `${caption}\n\n${hashtags}`.trim());

      const res  = await fetch('/api/admin/social/publish', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Publish failed');
      showToast('success', 'Nai-post na sa Facebook page ninyo!');
      setCaption('');
      setHashtags('');
      removeImage();
      setNotes('');
    } catch (e: unknown) {
      showToast('error', e instanceof Error ? e.message : 'Hindi nai-post. Subukan ulit.');
    } finally {
      setPublishing(false);
    }
  }

  const charCount = `${caption}\n\n${hashtags}`.trim().length;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Social Media Manager</h1>
        <p className="text-gray-500 text-sm mt-1">Mag-upload ng photo, piliin ang post type, at hayaan si AI gumawa ng post para sa inyong Facebook page.</p>
      </div>

      {toast && (
        <div className={`fixed top-20 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium transition-all ${toast.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
          {toast.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {toast.msg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* LEFT — Upload & Configure */}
        <div className="space-y-5">

          {/* Image Upload */}
          <div className="bg-white rounded-2xl shadow-sm border p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2"><ImageIcon size={16} /> Upload Photo</h2>

            {preview ? (
              <div className="relative rounded-xl overflow-hidden">
                <img src={preview} alt="Preview" className="w-full max-h-64 object-cover rounded-xl" />
                <button onClick={removeImage} className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 hover:bg-black/80">
                  <X size={14} />
                </button>
              </div>
            ) : (
              <div
                onDragOver={e => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
                onClick={() => fileRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${dragging ? 'border-blue-400 bg-blue-50' : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'}`}
              >
                <Upload size={28} className="mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">Drag & drop o <span className="text-blue-600 font-medium">i-click para pumili</span></p>
                <p className="text-xs text-gray-400 mt-1">JPG, PNG, WEBP — max 10MB</p>
              </div>
            )}
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFileChange} />
          </div>

          {/* Post Type */}
          <div className="bg-white rounded-2xl shadow-sm border p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">Uri ng Post</h2>
            <div className="grid grid-cols-2 gap-2">
              {POST_TYPES.map(t => (
                <button
                  key={t.value}
                  onClick={() => setPostType(t.value)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all ${postType === t.value ? 'bg-[#0f1f5c] text-white border-[#0f1f5c]' : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-blue-300 hover:bg-blue-50'}`}
                >
                  <span>{t.emoji}</span> {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white rounded-2xl shadow-sm border p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">Dagdag na Impormasyon <span className="text-gray-400 font-normal">(optional)</span></h2>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={3}
              placeholder="Hal. 'Split type chemical cleaning, customer sa Binan, bago palinis' o 'Carrier 1HP inverter unit on sale'"
              className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-blue-200 placeholder-gray-400"
            />
          </div>

          {/* Generate Button */}
          <button
            onClick={generate}
            disabled={generating}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#0f1f5c] text-white rounded-xl font-semibold hover:bg-[#1a2f7a] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {generating ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
            {generating ? 'Ginagawa ng AI ang post...' : 'Gumawa ng Post'}
          </button>
        </div>

        {/* RIGHT — Preview & Publish */}
        <div className="space-y-5">
          <div className="bg-white rounded-2xl shadow-sm border p-5 h-full flex flex-col">
            <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2"><Send size={16} /> Generated Post</h2>

            {!caption && !generating && (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-12 text-gray-400">
                <Sparkles size={36} className="mb-3 opacity-30" />
                <p className="text-sm">I-upload ang photo, piliin ang post type,<br />tapos pindutin ang "Gumawa ng Post".</p>
              </div>
            )}

            {generating && (
              <div className="flex-1 flex flex-col items-center justify-center py-12 text-gray-400">
                <Loader2 size={32} className="animate-spin mb-3" />
                <p className="text-sm">Ginagawa ng AI ang inyong post...</p>
              </div>
            )}

            {caption && !generating && (
              <div className="flex-1 flex flex-col gap-4">
                {/* Facebook-like preview header */}
                <div className="bg-gray-50 rounded-xl p-4 border">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-full bg-[#0f1f5c] flex items-center justify-center text-white text-xs font-bold">GC</div>
                    <div>
                      <p className="text-xs font-semibold text-gray-800">GoClean Aircon</p>
                      <p className="text-[10px] text-gray-400">Just now · Facebook</p>
                    </div>
                  </div>
                  {preview && <img src={preview} alt="" className="w-full rounded-lg mb-3 max-h-48 object-cover" />}
                  <p className="text-xs text-gray-700 whitespace-pre-wrap">{caption}</p>
                  {hashtags && <p className="text-xs text-blue-600 mt-1">{hashtags}</p>}
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Caption</label>
                  <textarea
                    value={caption}
                    onChange={e => setCaption(e.target.value)}
                    rows={5}
                    className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-blue-200"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Hashtags</label>
                  <textarea
                    value={hashtags}
                    onChange={e => setHashtags(e.target.value)}
                    rows={2}
                    className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-blue-200 text-blue-600"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className={`text-xs ${charCount > 500 ? 'text-orange-500' : 'text-gray-400'}`}>
                    {charCount} characters
                  </span>
                  <button
                    onClick={generate}
                    className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                  >
                    <Sparkles size={12} /> I-regenerate
                  </button>
                </div>

                <button
                  onClick={publish}
                  disabled={publishing}
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#1877F2] text-white rounded-xl font-semibold hover:bg-[#166fe5] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                >
                  {publishing ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                  {publishing ? 'Nagpo-post sa Facebook...' : 'I-post sa Facebook Page'}
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
