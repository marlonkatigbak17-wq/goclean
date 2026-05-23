'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, Sparkles, Send, X, ImageIcon, CheckCircle, AlertCircle, Loader2, Plus } from 'lucide-react';

const POST_TYPES = [
  { value: 'promo',          label: 'Promo / Discount',  emoji: '🎉' },
  { value: 'service',        label: 'Service Feature',    emoji: '🔧' },
  { value: 'product',        label: 'Product Showcase',   emoji: '❄️' },
  { value: 'tips',           label: 'Tips & Maintenance', emoji: '💡' },
  { value: 'before-after',   label: 'Before & After',     emoji: '✨' },
  { value: 'announcement',   label: 'Announcement',       emoji: '📢' },
];

interface ImageItem { file: File; preview: string; }

export default function SocialMediaPage() {
  const [images, setImages]         = useState<ImageItem[]>([]);
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

  function addFiles(files: FileList | File[]) {
    const arr = Array.from(files);
    const valid = arr.filter(f => {
      if (!f.type.startsWith('image/')) { showToast('error', `${f.name} is not an image file.`); return false; }
      if (f.size > 10 * 1024 * 1024)   { showToast('error', `${f.name} exceeds 10MB limit.`);   return false; }
      return true;
    });
    const newItems: ImageItem[] = valid.map(f => ({ file: f, preview: URL.createObjectURL(f) }));
    setImages(prev => {
      const combined = [...prev, ...newItems];
      return combined.slice(0, 10); // max 10 photos
    });
  }

  function removeImage(index: number) {
    setImages(prev => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    addFiles(e.dataTransfer.files);
  }, []);

  async function generate() {
    setGenerating(true);
    setCaption('');
    setHashtags('');
    try {
      const fd = new FormData();
      images.forEach((img, i) => fd.append(`image_${i}`, img.file));
      fd.append('postType', postType);
      fd.append('notes', notes);

      const res  = await fetch('/api/admin/social/generate', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Generation failed');
      setCaption(data.caption);
      setHashtags(data.hashtags);
    } catch (e: unknown) {
      showToast('error', e instanceof Error ? e.message : 'Failed to generate. Please try again.');
    } finally {
      setGenerating(false);
    }
  }

  async function publish() {
    if (!caption.trim()) { showToast('error', 'No caption yet. Please generate a post first.'); return; }
    setPublishing(true);
    try {
      const fd = new FormData();
      images.forEach((img, i) => fd.append(`image_${i}`, img.file));
      fd.append('caption', `${caption}\n\n${hashtags}`.trim());

      const res  = await fetch('/api/admin/social/publish', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Publish failed');
      showToast('success', 'Successfully posted to your Facebook page!');
      setCaption('');
      setHashtags('');
      setImages([]);
      setNotes('');
    } catch (e: unknown) {
      showToast('error', e instanceof Error ? e.message : 'Failed to publish. Please try again.');
    } finally {
      setPublishing(false);
    }
  }

  const charCount = `${caption}\n\n${hashtags}`.trim().length;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Social Media Manager</h1>
        <p className="text-gray-500 text-sm mt-1">Upload up to 10 photos, choose a post type, and let AI write your Facebook post.</p>
      </div>

      {toast && (
        <div className={`fixed top-20 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium ${toast.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
          {toast.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {toast.msg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* LEFT */}
        <div className="space-y-5">

          {/* Photo Upload */}
          <div className="bg-white rounded-2xl shadow-sm border p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2"><ImageIcon size={16} /> Photos</h2>
              <span className="text-xs text-gray-400">{images.length}/10 photos</span>
            </div>

            {/* Thumbnail grid */}
            {images.length > 0 && (
              <div className="grid grid-cols-4 gap-2 mb-3">
                {images.map((img, i) => (
                  <div key={i} className="relative group aspect-square">
                    <img src={img.preview} alt="" className="w-full h-full object-cover rounded-lg" />
                    <button
                      onClick={() => removeImage(i)}
                      className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}

                {/* Add more button inside grid */}
                {images.length < 10 && (
                  <button
                    onClick={() => fileRef.current?.click()}
                    className="aspect-square border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                  >
                    <Plus size={18} />
                    <span className="text-[10px] mt-0.5">Add</span>
                  </button>
                )}
              </div>
            )}

            {/* Drop zone (shown when no images or as add-more area) */}
            {images.length === 0 && (
              <div
                onDragOver={e => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
                onClick={() => fileRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${dragging ? 'border-blue-400 bg-blue-50' : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'}`}
              >
                <Upload size={28} className="mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">Drag & drop or <span className="text-blue-600 font-medium">click to select</span></p>
                <p className="text-xs text-gray-400 mt-1">Up to 10 photos · JPG, PNG, WEBP · Max 10MB each</p>
              </div>
            )}

            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={e => { if (e.target.files) addFiles(e.target.files); e.target.value = ''; }}
            />
          </div>

          {/* Post Type */}
          <div className="bg-white rounded-2xl shadow-sm border p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">Post Type</h2>
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
            <h2 className="text-sm font-semibold text-gray-700 mb-3">Additional Notes <span className="text-gray-400 font-normal">(optional)</span></h2>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={3}
              placeholder="e.g. 'Chemical cleaning, before and after photos, unit in Binan' or 'Carrier 1HP inverter on sale this week'"
              className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-blue-200 placeholder-gray-400"
            />
          </div>

          <button
            onClick={generate}
            disabled={generating}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#0f1f5c] text-white rounded-xl font-semibold hover:bg-[#1a2f7a] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {generating ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
            {generating ? 'AI is writing your post...' : 'Generate Post'}
          </button>
        </div>

        {/* RIGHT */}
        <div className="space-y-5">
          <div className="bg-white rounded-2xl shadow-sm border p-5 h-full flex flex-col">
            <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2"><Send size={16} /> Preview & Publish</h2>

            {!caption && !generating && (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-12 text-gray-400">
                <Sparkles size={36} className="mb-3 opacity-30" />
                <p className="text-sm">Upload photos, choose a post type,<br />then click "Generate Post".</p>
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
                {/* Facebook preview */}
                <div className="bg-gray-50 rounded-xl p-4 border">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-full bg-[#0f1f5c] flex items-center justify-center text-white text-xs font-bold">GC</div>
                    <div>
                      <p className="text-xs font-semibold text-gray-800">GoClean Aircon</p>
                      <p className="text-[10px] text-gray-400">Just now · Facebook</p>
                    </div>
                  </div>
                  {images.length > 0 && (
                    <div className={`grid gap-1 mb-3 rounded-lg overflow-hidden ${images.length === 1 ? 'grid-cols-1' : images.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
                      {images.slice(0, 6).map((img, i) => (
                        <div key={i} className="relative">
                          <img src={img.preview} alt="" className="w-full h-24 object-cover" />
                          {i === 5 && images.length > 6 && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-bold text-lg">+{images.length - 6}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-gray-700 whitespace-pre-wrap">{caption}</p>
                  {hashtags && <p className="text-xs text-blue-600 mt-1">{hashtags}</p>}
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Caption</label>
                  <textarea value={caption} onChange={e => setCaption(e.target.value)} rows={5}
                    className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-blue-200" />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Hashtags</label>
                  <textarea value={hashtags} onChange={e => setHashtags(e.target.value)} rows={2}
                    className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-blue-200 text-blue-600" />
                </div>

                <div className="flex items-center justify-between">
                  <span className={`text-xs ${charCount > 500 ? 'text-orange-500' : 'text-gray-400'}`}>{charCount} characters</span>
                  <button onClick={generate} className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                    <Sparkles size={12} /> Regenerate
                  </button>
                </div>

                <button
                  onClick={publish}
                  disabled={publishing}
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#1877F2] text-white rounded-xl font-semibold hover:bg-[#166fe5] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                >
                  {publishing ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                  {publishing ? 'Posting to Facebook...' : `Post to Facebook Page${images.length > 1 ? ` (${images.length} photos)` : ''}`}
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
