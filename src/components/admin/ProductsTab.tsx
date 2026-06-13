import React, { useState, useEffect, useRef } from 'react';
import { Plus, Edit2, Trash2, X, Upload, Star } from 'lucide-react';
import { toast } from '../../utils/toast';
import { confirm } from '../ConfirmDialog';

interface Product {
  _id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  image: string;
  stock: number;
  isNew: boolean;
  rating: number;
  soldCount: number;
}

const CATEGORIES = ['Thức ăn', 'Đồ chơi', 'Phụ kiện', 'Vệ sinh', 'Khác'];

const defaultForm = {
  name: '', description: '', category: 'Thức ăn',
  price: '', stock: '', rating: '5', soldCount: '0',
  isNew: false, imageUrl: ''
};

const getToken = () => localStorage.getItem('paw_token') || '';
const BE_URL = (import.meta as any).env?.DEV ? 'http://localhost:5000' : 'https://pwa-home-be.onrender.com';
const imgSrc = (img: string) => {
  if (!img) return '';
  if (img.startsWith('http')) return img;
  const path = img.startsWith('/') ? img : `/${img}`;
  return `${BE_URL}${path}`;
};

// Defined outside component so they're stable across renders
const inputCls = "w-full border border-outline-variant rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 font-medium bg-white";
const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="space-y-1">
    <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-wider">{label}</label>
    {children}
  </div>
);

export const ProductsTab: React.FC = () => {
  const [products, setProducts]         = useState<Product[]>([]);
  const [loading, setLoading]           = useState(true);
  const [saving, setSaving]             = useState(false);
  const [showForm, setShowForm]         = useState(false);
  const [editing, setEditing]           = useState<Product | null>(null);
  const [form, setForm]                 = useState(defaultForm);
  const [imageFile, setImageFile]       = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [error, setError]               = useState('');
  const fileRef                         = useRef<HTMLInputElement>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/products');
      setProducts(await res.json());
    } catch { setError('Không thể tải sản phẩm.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => {
    setEditing(null); setForm(defaultForm);
    setImageFile(null); setImagePreview(''); setError('');
    setShowForm(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({
      name: p.name, description: p.description, category: p.category,
      price: String(p.price), stock: String(p.stock), rating: String(p.rating),
      soldCount: String(p.soldCount ?? 0),
      isNew: p.isNew, imageUrl: p.image?.startsWith('http') ? p.image : ''
    });
    setImagePreview(imgSrc(p.image));
    setImageFile(null); setError('');
    setShowForm(true);
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setForm(f => ({ ...f, imageUrl: '' }));
  };

  const handleSave = async () => {
    if (!form.name || !form.price) { setError('Tên và giá là bắt buộc.'); return; }
    if (!imageFile && !form.imageUrl && !editing?.image) { setError('Vui lòng chọn ảnh hoặc nhập URL.'); return; }

    setSaving(true); setError('');
    const fd = new FormData();
    fd.append('name',        form.name);
    fd.append('description', form.description);
    fd.append('category',    form.category);
    fd.append('price',       form.price);
    fd.append('stock',       form.stock || '0');
    fd.append('rating',      form.rating || '5');
    fd.append('soldCount',   form.soldCount || '0');
    fd.append('isNew',       String(form.isNew));
    if (imageFile)           fd.append('image', imageFile);
    else if (form.imageUrl)  fd.append('image', form.imageUrl);

    try {
      const url    = editing ? `/api/products/${editing._id}` : '/api/products';
      const method = editing ? 'PUT' : 'POST';
      const res    = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${getToken()}` },
        body: fd
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message); return; }
      await load();
      setShowForm(false);
    } catch { setError('Không thể lưu. Kiểm tra kết nối server.'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (p: Product) => {
    const ok = await confirm({ message: `Xóa sản phẩm "${p.name}"?`, danger: true, confirmText: 'Xóa' });
    if (!ok) return;
    const res = await fetch(`/api/products/${p._id}`, {
      method: 'DELETE', headers: { Authorization: `Bearer ${getToken()}` }
    });
    if (res.ok) load();
    else { const d = await res.json(); toast.error(d.message); }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl sm:text-3xl font-black text-on-surface tracking-tighter">Quản lý sản phẩm</h1>
          <p className="text-sm text-on-surface-variant font-medium mt-1">
            {loading ? '...' : `${products.length} sản phẩm trong shop`}
          </p>
        </div>
        <button onClick={openAdd}
          className="bg-primary text-on-primary px-6 py-3 rounded-[20px] font-bold flex items-center gap-2 hover:scale-[1.02] shadow-lg shadow-primary/20 transition-all">
          <Plus className="w-5 h-5" /> Thêm sản phẩm
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-[32px] border border-outline-variant shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-on-surface-variant font-medium animate-pulse">Đang tải...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-surface-container-low text-[10px] uppercase font-black text-on-surface-variant tracking-[0.2em] border-b border-outline-variant">
                  <th className="px-6 py-5 text-left">Sản phẩm</th>
                  <th className="px-6 py-5 text-left">Danh mục</th>
                  <th className="px-6 py-5 text-right">Giá</th>
                  <th className="px-6 py-5 text-right">Tồn kho</th>
                  <th className="px-6 py-5 text-right">Đã bán</th>
                  <th className="px-6 py-5 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {products.map(p => (
                  <tr key={p._id} className="hover:bg-surface-container-lowest transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img src={imgSrc(p.image)} alt={p.name}
                          className="w-12 h-12 rounded-xl object-cover shadow-sm flex-shrink-0"
                          onError={e => { (e.target as HTMLImageElement).src = 'https://placehold.co/48x48/f5f0eb/553722?text=🛍'; }}
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-on-surface text-sm">{p.name}</p>
                            {p.isNew && <span className="text-[9px] font-black bg-tertiary/20 text-tertiary px-2 py-0.5 rounded-full uppercase">Mới</span>}
                          </div>
                          <div className="flex items-center gap-0.5 mt-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`w-2.5 h-2.5 ${i < Math.floor(p.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200 fill-gray-200'}`} />
                            ))}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold px-3 py-1 bg-surface-container rounded-full text-on-surface-variant">
                        {p.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-black text-primary">{p.price.toLocaleString()}đ</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`font-bold text-sm ${p.stock === 0 ? 'text-red-600' : p.stock < 10 ? 'text-amber-600' : 'text-green-600'}`}>
                        {p.stock}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium text-on-surface-variant">{p.soldCount}</td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => openEdit(p)}
                          className="p-2 hover:bg-blue-50 rounded-xl text-blue-600 transition-colors"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(p)}
                          className="p-2 hover:bg-red-50 rounded-xl text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {products.length === 0 && (
              <div className="py-16 text-center text-on-surface-variant font-medium">
                Chưa có sản phẩm. Nhấn "Thêm sản phẩm" để bắt đầu.
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Modal Form ── */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[32px] w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">
            <div className="flex justify-between items-center px-8 pt-7 pb-5 border-b border-outline-variant flex-shrink-0">
              <h2 className="text-2xl font-black text-on-surface">
                {editing ? `Sửa: ${editing.name}` : 'Thêm sản phẩm mới'}
              </h2>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-surface-container rounded-xl transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-8 py-6 space-y-5">
              {error && <div className="p-4 bg-red-50 text-red-700 rounded-2xl text-sm font-semibold">{error}</div>}

              {/* Image */}
              <Field label="Ảnh sản phẩm *">
                <div className="flex gap-4 items-start">
                  {imagePreview && (
                    <img src={imagePreview} alt="preview"
                      className="w-20 h-20 object-cover rounded-2xl shadow-sm flex-shrink-0"
                      onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  )}
                  <div className="flex-1 space-y-2">
                    <button type="button" onClick={() => fileRef.current?.click()}
                      className="w-full border-2 border-dashed border-outline-variant rounded-2xl py-3 px-4 text-sm font-bold text-on-surface-variant hover:border-primary hover:text-primary transition-all flex items-center justify-center gap-2">
                      <Upload className="w-4 h-4" /> Tải ảnh từ máy tính
                    </button>
                    <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
                    <input type="text" placeholder="hoặc nhập URL ảnh..." className={inputCls}
                      value={form.imageUrl}
                      onChange={e => {
                        setForm(f => ({ ...f, imageUrl: e.target.value }));
                        if (e.target.value) { setImagePreview(e.target.value); setImageFile(null); }
                      }}
                    />
                  </div>
                </div>
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Tên sản phẩm *">
                  <input className={inputCls} placeholder="Royal Canin Medium..."
                    value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                </Field>
                <Field label="Danh mục">
                  <select className={inputCls} value={form.category}
                    onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </Field>
                <Field label="Giá bán (đ) *">
                  <input className={inputCls} placeholder="150000" inputMode="numeric"
                    value={form.price}
                    onChange={e => setForm(f => ({ ...f, price: e.target.value.replace(/\D/g, '') }))} />
                </Field>
                <Field label="Tồn kho">
                  <input className={inputCls} placeholder="100" inputMode="numeric"
                    value={form.stock}
                    onChange={e => setForm(f => ({ ...f, stock: e.target.value.replace(/\D/g, '') }))} />
                </Field>
                <Field label="Đánh giá (1-5)">
                  <input className={inputCls} placeholder="4.8"
                    value={form.rating}
                    onChange={e => {
                      const v = e.target.value;
                      if (/^\d*\.?\d*$/.test(v)) setForm(f => ({ ...f, rating: v }));
                    }} />
                </Field>
                <Field label="Số lượng đã bán">
                  <input className={inputCls} placeholder="0" inputMode="numeric"
                    value={form.soldCount}
                    onChange={e => setForm(f => ({ ...f, soldCount: e.target.value.replace(/\D/g, '') }))} />
                </Field>
                <Field label="Trạng thái">
                  <label className="flex items-center gap-3 cursor-pointer h-[42px]">
                    <input type="checkbox" className="w-4 h-4 accent-primary"
                      checked={form.isNew} onChange={e => setForm(f => ({ ...f, isNew: e.target.checked }))} />
                    <span className="text-sm font-medium text-on-surface">Đánh dấu là hàng Mới</span>
                  </label>
                </Field>
              </div>

              <Field label="Mô tả sản phẩm">
                <textarea rows={3} className={`${inputCls} resize-none`}
                  placeholder="Mô tả chi tiết sản phẩm..."
                  value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </Field>
            </div>

            <div className="flex gap-3 px-8 py-5 border-t border-outline-variant flex-shrink-0">
              <button onClick={() => setShowForm(false)}
                className="flex-1 py-3 rounded-2xl border border-outline-variant font-bold text-on-surface-variant hover:bg-surface-container transition-all">
                Huỷ
              </button>
              <button onClick={handleSave} disabled={saving}
                className="flex-1 py-3 rounded-2xl bg-primary text-on-primary font-bold shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-95 transition-all disabled:opacity-50">
                {saving ? 'Đang lưu...' : editing ? 'Cập nhật' : 'Thêm mới'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
