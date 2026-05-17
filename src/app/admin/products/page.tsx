'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Plus, Pencil, Trash2, Upload, X, Check, PackageX, Package, FileSpreadsheet, Download } from 'lucide-react';

type ProductSpecs = {
  horsepower?: string;
  coolingCapacity?: string;
  energyEfficiency?: string;
  warranty?: string;
};

type Product = {
  id: string;
  slug: string;
  name: string;
  brand: string;
  category: string;
  subcategory: string;
  price: number;
  priceWithInstallation?: number;
  images: string[];
  specs: ProductSpecs;
  inStock: boolean;
  badge?: string;
  description: string;
};

const emptyProduct = (): Omit<Product, 'id'> => ({
  slug: '',
  name: '',
  brand: '',
  category: 'residential',
  subcategory: 'Split Type',
  price: 0,
  priceWithInstallation: undefined,
  images: [],
  specs: { horsepower: '', coolingCapacity: '', energyEfficiency: '', warranty: '' },
  inStock: true,
  badge: '',
  description: '',
});

const brands = ['Daikin', 'Carrier', 'Midea', 'Panasonic', 'LG', 'AUX', 'Generic', 'Other'];
const categories = ['residential', 'commercial', 'hvac-supplies', 'tools'];
const subcategories = ['Split Type', 'Window Type', 'Cassette', 'Copper Tube', 'Vacuum Pump', 'Other'];
const badges = ['', 'Best Seller', 'New', 'Sale'];

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [toast, setToast] = useState('');
  const [importing, setImporting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const importRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    setLoading(true);
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Failed to load products:', e);
      setProducts([]);
    }
    setLoading(false);
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  }

  function openNew() {
    setEditProduct({ id: '', ...emptyProduct() });
    setIsNew(true);
    setImagePreview('');
    setImageFile(null);
  }

  function openEdit(p: Product) {
    setEditProduct({ ...p, specs: { ...p.specs } });
    setIsNew(false);
    setImagePreview(p.images?.[0] || '');
    setImageFile(null);
  }

  function closePanel() {
    setEditProduct(null);
    setImagePreview('');
    setImageFile(null);
  }

  function handleImagePick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  async function uploadImage(slug: string): Promise<string | null> {
    if (!imageFile) return null;
    const fd = new FormData();
    fd.append('file', imageFile);
    fd.append('slug', slug);
    const res = await fetch('/api/upload', { method: 'POST', body: fd });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.pending) {
      showToast('Photo saved — will appear on site in ~2 minutes after deploy');
    }
    return data.url;
  }

  async function handleSave() {
    if (!editProduct) return;
    setSaving(true);
    try {
      const slug = editProduct.slug ||
        editProduct.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

      let imageUrl: string | null = null;
      if (imageFile) {
        imageUrl = await uploadImage(slug);
      }

      const payload = {
        ...editProduct,
        slug,
        price: Number(editProduct.price) || 0,
        priceWithInstallation: editProduct.priceWithInstallation
          ? Number(editProduct.priceWithInstallation)
          : undefined,
        badge: editProduct.badge || undefined,
        images: imageUrl ? [imageUrl] : editProduct.images,
      };

      const url = isNew ? '/api/products' : `/api/products/${editProduct.id}`;
      const method = isNew ? 'POST' : 'PUT';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        await fetchProducts();
        closePanel();
        showToast(isNew ? 'Product added!' : 'Product updated!');
      } else {
        const err = await res.json().catch(() => ({}));
        showToast(`Error: ${err.error || res.statusText}`);
      }
    } catch (e) {
      console.error('Save failed:', e);
      showToast('Save failed — check console');
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
    if (res.ok) {
      await fetchProducts();
      setDeleteConfirm(null);
      showToast('Product deleted');
    }
  }

  async function toggleStock(p: Product) {
    await fetch(`/api/products/${p.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ inStock: !p.inStock }),
    });
    await fetchProducts();
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    const fd = new FormData();
    fd.append('file', file);
    try {
      const res = await fetch('/api/admin/import-products', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) {
        showToast(`Import failed: ${data.error}`);
      } else {
        await fetchProducts();
        const msg = `Imported: ${data.created} added, ${data.updated} updated${data.errors.length ? `, ${data.errors.length} errors` : ''}`;
        showToast(msg);
      }
    } catch {
      showToast('Import failed — check your file');
    }
    setImporting(false);
    e.target.value = '';
  }

  function updateSpec(key: keyof ProductSpecs, value: string) {
    if (!editProduct) return;
    setEditProduct({ ...editProduct, specs: { ...editProduct.specs, [key]: value } });
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1e3a5f]">Products</h1>
          <p className="text-sm text-gray-400 mt-0.5">{products.length} products in database</p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="/api/admin/product-template"
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-600 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download size={15} /> Template
          </a>
          <button
            onClick={() => importRef.current?.click()}
            disabled={importing}
            className="flex items-center gap-2 px-4 py-2 border border-[#1e3a5f] text-[#1e3a5f] text-sm font-semibold rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-50"
          >
            <FileSpreadsheet size={15} /> {importing ? 'Importing...' : 'Import Excel'}
          </button>
          <input ref={importRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleImport} />
          <button
            onClick={openNew}
            className="flex items-center gap-2 px-4 py-2 bg-[#1e3a5f] text-white text-sm font-bold rounded-lg hover:bg-[#152d4a] transition-colors"
          >
            <Plus size={16} /> Add Product
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">Loading...</div>
      ) : (
        <div className="bg-white rounded-2xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide w-16">Photo</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Product</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Brand</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Price</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Specs</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Stock</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="w-12 h-12 relative rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                      <span className="text-xl absolute">❄️</span>
                      {p.images?.[0] && (
                        <Image
                          src={p.images[0]}
                          alt={p.name}
                          fill
                          className="object-contain relative"
                          unoptimized
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-[#1e3a5f] leading-tight">{p.name}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{p.subcategory}</div>
                    {p.badge && (
                      <span className={`inline-block text-xs px-1.5 py-0.5 rounded-full font-bold mt-1 ${
                        p.badge === 'Best Seller' ? 'bg-yellow-100 text-yellow-800' :
                        p.badge === 'New' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>{p.badge}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{p.brand}</td>
                  <td className="px-4 py-3">
                    <div className="font-bold text-[#1e3a5f]">₱{p.price.toLocaleString()}</div>
                    {p.priceWithInstallation && (
                      <div className="text-xs text-gray-400">₱{p.priceWithInstallation.toLocaleString()} w/ install</div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {p.specs.horsepower && <div>{p.specs.horsepower}</div>}
                    {p.specs.coolingCapacity && <div>{p.specs.coolingCapacity}</div>}
                    {p.specs.energyEfficiency && <div className="truncate max-w-[120px]">{p.specs.energyEfficiency}</div>}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleStock(p)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-colors ${
                        p.inStock
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-red-100 text-red-600 hover:bg-red-200'
                      }`}
                    >
                      {p.inStock ? <><Package size={11} /> In Stock</> : <><PackageX size={11} /> Out</>}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEdit(p)}
                        className="p-1.5 text-gray-400 hover:text-[#1e3a5f] hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Pencil size={14} />
                      </button>
                      {deleteConfirm === p.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleDelete(p.id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Confirm delete"
                          >
                            <Check size={14} />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirm(p.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit / Add Panel */}
      {editProduct && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40" onClick={closePanel} />
          <div className="relative ml-auto w-full max-w-xl bg-white h-full overflow-y-auto shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-white z-10">
              <h2 className="text-lg font-extrabold text-[#1e3a5f]">
                {isNew ? 'Add New Product' : 'Edit Product'}
              </h2>
              <button onClick={closePanel} className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100">
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 px-6 py-5 space-y-5">
              {/* Image upload */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Product Photo</label>
                <div
                  className="relative border-2 border-dashed border-gray-200 rounded-xl overflow-hidden cursor-pointer hover:border-[#1e3a5f] transition-colors group bg-gray-50"
                  style={{ height: 180 }}
                  onClick={() => fileRef.current?.click()}
                >
                  {imagePreview ? (
                    <Image src={imagePreview} alt="Preview" fill className="object-contain p-2" unoptimized />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-300">
                      <Upload size={28} />
                      <span className="text-xs mt-2">Click to upload photo</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#1e3a5f] flex items-center gap-1.5">
                      <Upload size={12} /> Change Photo
                    </div>
                  </div>
                </div>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImagePick} />
                {imageFile && <p className="text-xs text-green-600 mt-1">{imageFile.name} — ready to upload</p>}
              </div>

              {/* Name */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Product Name *</label>
                <input
                  type="text"
                  value={editProduct.name}
                  onChange={(e) => setEditProduct({ ...editProduct, name: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1e3a5f]"
                  placeholder="e.g. Daikin 1.5HP Inverter"
                />
              </div>

              {/* Slug */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Slug (URL)</label>
                <input
                  type="text"
                  value={editProduct.slug}
                  onChange={(e) => setEditProduct({ ...editProduct, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1e3a5f] font-mono"
                  placeholder="auto-generated from name if blank"
                />
              </div>

              {/* Brand + Category */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Brand</label>
                  <select
                    value={editProduct.brand}
                    onChange={(e) => setEditProduct({ ...editProduct, brand: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1e3a5f] bg-white"
                  >
                    <option value="">Select...</option>
                    {brands.map((b) => <option key={b}>{b}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Category</label>
                  <select
                    value={editProduct.category}
                    onChange={(e) => setEditProduct({ ...editProduct, category: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1e3a5f] bg-white"
                  >
                    {categories.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              {/* Subcategory + Badge */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Subcategory</label>
                  <select
                    value={editProduct.subcategory}
                    onChange={(e) => setEditProduct({ ...editProduct, subcategory: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1e3a5f] bg-white"
                  >
                    {subcategories.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Badge</label>
                  <select
                    value={editProduct.badge || ''}
                    onChange={(e) => setEditProduct({ ...editProduct, badge: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1e3a5f] bg-white"
                  >
                    {badges.map((b) => <option key={b} value={b}>{b || 'None'}</option>)}
                  </select>
                </div>
              </div>

              {/* Price */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Price (₱) *</label>
                  <input
                    type="number"
                    value={editProduct.price || ''}
                    onChange={(e) => setEditProduct({ ...editProduct, price: Number(e.target.value) })}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1e3a5f]"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">With Installation (₱)</label>
                  <input
                    type="number"
                    value={editProduct.priceWithInstallation || ''}
                    onChange={(e) => setEditProduct({ ...editProduct, priceWithInstallation: e.target.value ? Number(e.target.value) : undefined })}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1e3a5f]"
                    placeholder="Optional"
                  />
                </div>
              </div>

              {/* Specs */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Specifications</label>
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Horsepower</label>
                      <input
                        type="text"
                        value={editProduct.specs.horsepower || ''}
                        onChange={(e) => updateSpec('horsepower', e.target.value)}
                        className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1e3a5f]"
                        placeholder="e.g. 1.5HP"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Cooling Capacity</label>
                      <input
                        type="text"
                        value={editProduct.specs.coolingCapacity || ''}
                        onChange={(e) => updateSpec('coolingCapacity', e.target.value)}
                        className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1e3a5f]"
                        placeholder="e.g. 5.0 kW"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Energy Efficiency</label>
                    <input
                      type="text"
                      value={editProduct.specs.energyEfficiency || ''}
                      onChange={(e) => updateSpec('energyEfficiency', e.target.value)}
                      className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1e3a5f]"
                      placeholder="e.g. 5-Star Inverter"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Warranty</label>
                    <input
                      type="text"
                      value={editProduct.specs.warranty || ''}
                      onChange={(e) => updateSpec('warranty', e.target.value)}
                      className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1e3a5f]"
                      placeholder="e.g. 5 years compressor"
                    />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Description</label>
                <textarea
                  rows={4}
                  value={editProduct.description}
                  onChange={(e) => setEditProduct({ ...editProduct, description: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1e3a5f] resize-none"
                  placeholder="Product description..."
                />
              </div>

              {/* Stock toggle */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setEditProduct({ ...editProduct, inStock: !editProduct.inStock })}
                  className={`relative inline-flex w-11 h-6 rounded-full transition-colors ${
                    editProduct.inStock ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                >
                  <span className={`inline-block w-5 h-5 bg-white rounded-full shadow transform transition-transform mt-0.5 ${
                    editProduct.inStock ? 'translate-x-5' : 'translate-x-0.5'
                  }`} />
                </button>
                <span className="text-sm font-medium text-gray-700">
                  {editProduct.inStock ? 'In Stock' : 'Out of Stock'}
                </span>
              </div>
            </div>

            <div className="px-6 py-4 border-t bg-gray-50 flex gap-3 sticky bottom-0">
              <button
                onClick={closePanel}
                className="flex-1 py-2.5 border border-gray-300 text-gray-600 text-sm font-semibold rounded-lg hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !editProduct.name.trim()}
                className="flex-1 py-2.5 bg-[#1e3a5f] text-white text-sm font-bold rounded-lg hover:bg-[#152d4a] transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving...' : isNew ? 'Add Product' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 right-6 z-[100] bg-[#1e3a5f] text-white px-5 py-3 rounded-xl shadow-lg text-sm font-medium flex items-center gap-2">
          <Check size={14} className="text-green-400" /> {toast}
        </div>
      )}
    </div>
  );
}
