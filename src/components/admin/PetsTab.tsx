import React, { useState, useEffect, useRef } from 'react';
import { Plus, Edit2, Trash2, X, Upload } from 'lucide-react';
import { NumberInput } from '../NumberInput';

interface Pet {
  _id: string;
  name: string;
  breed: string;
  age: string;
  gender: 'Male' | 'Female';
  image: string;
  rescuePartner: string;
  description: string;
  status: 'Ready' | 'Treatment' | 'Adopted';
  tags: string[];
  story: string;
  healthInfo: { vaccinated: boolean; neutered: boolean; microchipped: boolean };
  donationAmount?: number;
}

const defaultForm = {
  name: '', breed: '', age: '', gender: 'Male' as 'Male' | 'Female',
  description: '', rescuePartner: '', story: '',
  status: 'Ready' as 'Ready' | 'Treatment' | 'Adopted',
  tags: '', imageUrl: '',
  vaccinated: false, neutered: false, microchipped: false,
  donationAmount: 0
};

const STATUS_STYLE = {
  Ready:     'bg-green-100 text-green-700',
  Treatment: 'bg-amber-100 text-amber-700',
  Adopted:   'bg-blue-100  text-blue-700'
};
const STATUS_LABEL = { Ready: 'Sẵn sàng', Treatment: 'Điều trị', Adopted: 'Đã nhận' };

const getToken = () => localStorage.getItem('paw_token') || '';
const BE_URL = (import.meta as any).env?.DEV ? 'http://localhost:5000' : 'https://pwa-home-be.onrender.com';
const imgSrc = (img: string) => {
  if (!img) return '';
  if (img.startsWith('http')) return img;
  const path = img.startsWith('/') ? img : `/${img}`;
  return `${BE_URL}${path}`;
};

export const PetsTab: React.FC = () => {
  const [pets, setPets]               = useState<Pet[]>([]);
  const [loading, setLoading]         = useState(true);
  const [saving, setSaving]           = useState(false);
  const [showForm, setShowForm]       = useState(false);
  const [editing, setEditing]         = useState<Pet | null>(null);
  const [form, setForm]               = useState(defaultForm);
  const [imageFile, setImageFile]     = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [error, setError]             = useState('');
  const fileRef                       = useRef<HTMLInputElement>(null);

  const loadPets = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/pets');
      setPets(await res.json());
    } catch { setError('Không thể tải dữ liệu.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadPets(); }, []);

  const openAdd = () => {
    setEditing(null);
    setForm(defaultForm);
    setImageFile(null);
    setImagePreview('');
    setError('');
    setShowForm(true);
  };

  const openEdit = (pet: Pet) => {
    setEditing(pet);
    setForm({
      name: pet.name, breed: pet.breed, age: pet.age, gender: pet.gender,
      description: pet.description, rescuePartner: pet.rescuePartner || '',
      story: pet.story || '', status: pet.status,
      tags: (pet.tags || []).join(', '),
      imageUrl: pet.image?.startsWith('http') ? pet.image : '',
      donationAmount: pet.donationAmount || 0,
      vaccinated:   pet.healthInfo?.vaccinated   || false,
      neutered:     pet.healthInfo?.neutered     || false,
      microchipped: pet.healthInfo?.microchipped || false
    });
    setImagePreview(imgSrc(pet.image));
    setImageFile(null);
    setError('');
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
    if (!form.name || !form.breed || !form.age || !form.description) {
      setError('Vui lòng điền Tên, Giống, Tuổi và Mô tả.'); return;
    }
    if (!imageFile && !form.imageUrl && !editing?.image) {
      setError('Vui lòng chọn ảnh hoặc nhập URL ảnh.'); return;
    }

    setSaving(true); setError('');
    const fd = new FormData();
    fd.append('name',          form.name);
    fd.append('breed',         form.breed);
    fd.append('age',           form.age);
    fd.append('gender',        form.gender);
    fd.append('description',   form.description);
    fd.append('rescuePartner', form.rescuePartner);
    fd.append('story',         form.story);
    fd.append('status',        form.status);
    fd.append('tags', JSON.stringify(
      form.tags.split(',').map(t => t.trim()).filter(Boolean)
    ));
    fd.append('vaccinated',     String(form.vaccinated));
    fd.append('neutered',       String(form.neutered));
    fd.append('microchipped',   String(form.microchipped));
    fd.append('donationAmount', String(form.donationAmount || 0));
    if (imageFile) fd.append('image', imageFile);
    else if (form.imageUrl) fd.append('image', form.imageUrl);

    try {
      const url    = editing ? `/api/pets/${editing._id}` : '/api/pets';
      const method = editing ? 'PUT' : 'POST';
      const res    = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${getToken()}` },
        body: fd
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message); return; }
      await loadPets();
      setShowForm(false);
    } catch { setError('Không thể lưu. Kiểm tra kết nối server.'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (pet: Pet) => {
    if (!window.confirm(`Xóa bé ${pet.name}?`)) return;
    const res = await fetch(`/api/pets/${pet._id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${getToken()}` }
    });
    if (res.ok) loadPets();
    else { const d = await res.json(); alert(d.message); }
  };

  const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div className="space-y-1">
      <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-wider">{label}</label>
      {children}
    </div>
  );

  const inputCls = "w-full border border-outline-variant rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 font-medium";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-on-surface tracking-tighter">Quản lý thú cưng</h1>
          <p className="text-sm text-on-surface-variant font-medium mt-1">
            {loading ? '...' : `${pets.length} bé trong hệ thống`}
          </p>
        </div>
        <button onClick={openAdd}
          className="bg-primary text-on-primary px-6 py-3 rounded-[20px] font-bold flex items-center gap-2 hover:scale-[1.02] shadow-lg shadow-primary/20 transition-all">
          <Plus className="w-5 h-5" /> Thêm thú cưng
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
                  <th className="px-6 py-5 text-left">Thú cưng</th>
                  <th className="px-6 py-5 text-left">Giống / Tuổi</th>
                  <th className="px-6 py-5 text-left">Trạng thái</th>
                  <th className="px-6 py-5 text-left">Sức khoẻ</th>
                  <th className="px-6 py-5 text-left">Đóng góp</th>
                  <th className="px-6 py-5 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {pets.map(pet => (
                  <tr key={pet._id} className="hover:bg-surface-container-lowest transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img src={imgSrc(pet.image)} alt={pet.name}
                          className="w-14 h-14 rounded-2xl object-cover shadow-sm flex-shrink-0"
                          onError={e => { (e.target as HTMLImageElement).src = 'https://placehold.co/56x56/f5f0eb/553722?text=🐾'; }}
                        />
                        <div>
                          <p className="font-bold text-on-surface">{pet.name}</p>
                          <p className="text-xs text-on-surface-variant mt-0.5">
                            {pet.gender === 'Male' ? '♂ Đực' : '♀ Cái'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-sm text-on-surface">{pet.breed}</p>
                      <p className="text-xs text-on-surface-variant mt-0.5">{pet.age}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider ${STATUS_STYLE[pet.status]}`}>
                        {STATUS_LABEL[pet.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {[
                          { key: 'vaccinated',   label: 'Tiêm' },
                          { key: 'neutered',     label: 'Triệt' },
                          { key: 'microchipped', label: 'Chip' }
                        ].map(({ key, label }) => (
                          <span key={key}
                            className={`text-[9px] font-black px-2 py-0.5 rounded-lg uppercase ${
                              (pet.healthInfo as any)?.[key]
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-400 line-through'
                            }`}>
                            {label}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {pet.donationAmount ? (
                        <span className="text-xs font-black text-amber-600 bg-amber-50 px-2 py-1 rounded-lg">
                          {pet.donationAmount.toLocaleString('vi-VN')}đ
                        </span>
                      ) : (
                        <span className="text-xs text-on-surface-variant opacity-40">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => openEdit(pet)}
                          className="p-2 hover:bg-blue-50 rounded-xl text-blue-600 transition-colors" title="Chỉnh sửa">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(pet)}
                          className="p-2 hover:bg-red-50 rounded-xl text-red-500 transition-colors" title="Xóa">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {pets.length === 0 && (
              <div className="py-16 text-center text-on-surface-variant font-medium">
                Chưa có thú cưng nào. Nhấn "Thêm thú cưng" để bắt đầu.
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Modal Form ─────────────────────────────────────────────────── */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[32px] w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">
            {/* Modal Header */}
            <div className="flex justify-between items-center px-8 pt-7 pb-5 border-b border-outline-variant flex-shrink-0">
              <h2 className="text-2xl font-black text-on-surface">
                {editing ? `Sửa: ${editing.name}` : 'Thêm thú cưng mới'}
              </h2>
              <button onClick={() => setShowForm(false)}
                className="p-2 hover:bg-surface-container rounded-xl transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body - scrollable */}
            <div className="flex-1 overflow-y-auto px-8 py-6 space-y-5">
              {error && (
                <div className="p-4 bg-red-50 text-red-700 rounded-2xl text-sm font-semibold">{error}</div>
              )}

              {/* Image Upload */}
              <Field label="Ảnh thú cưng *">
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
                    <div className="flex items-center gap-2">
                      <div className="h-px bg-outline-variant flex-1" />
                      <span className="text-xs text-on-surface-variant font-medium">hoặc URL</span>
                      <div className="h-px bg-outline-variant flex-1" />
                    </div>
                    <input type="text" placeholder="https://example.com/image.jpg"
                      className={inputCls}
                      value={form.imageUrl}
                      onChange={e => {
                        setForm(f => ({ ...f, imageUrl: e.target.value }));
                        if (e.target.value) { setImagePreview(e.target.value); setImageFile(null); }
                      }}
                    />
                  </div>
                </div>
              </Field>

              {/* 2-col fields */}
              <div className="grid grid-cols-2 gap-4">
                <Field label="Tên *">
                  <input className={inputCls} placeholder="Milo"
                    value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                </Field>
                <Field label="Giống *">
                  <input className={inputCls} placeholder="Golden Retriever"
                    value={form.breed} onChange={e => setForm(f => ({ ...f, breed: e.target.value }))} />
                </Field>
                <Field label="Tuổi *">
                  <input className={inputCls} placeholder="2 tuổi"
                    value={form.age} onChange={e => setForm(f => ({ ...f, age: e.target.value }))} />
                </Field>
                <Field label="Giới tính">
                  <select className={inputCls} value={form.gender}
                    onChange={e => setForm(f => ({ ...f, gender: e.target.value as any }))}>
                    <option value="Male">♂ Đực</option>
                    <option value="Female">♀ Cái</option>
                  </select>
                </Field>
                <Field label="Trạng thái">
                  <select className={inputCls} value={form.status}
                    onChange={e => setForm(f => ({ ...f, status: e.target.value as any }))}>
                    <option value="Ready">Sẵn sàng nhận nuôi</option>
                    <option value="Treatment">Đang điều trị</option>
                    <option value="Adopted">Đã nhận nuôi</option>
                  </select>
                </Field>
                <Field label="Đơn vị cứu hộ">
                  <input className={inputCls} placeholder="PAW Home Rescue"
                    value={form.rescuePartner} onChange={e => setForm(f => ({ ...f, rescuePartner: e.target.value }))} />
                </Field>
              </div>

              <Field label="Mô tả ngắn *">
                <textarea rows={2} className={`${inputCls} resize-none`}
                  placeholder="Tính cách, đặc điểm nổi bật..."
                  value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </Field>

              <Field label="Câu chuyện">
                <textarea rows={3} className={`${inputCls} resize-none`}
                  placeholder="Câu chuyện của bé, hoàn cảnh được cứu hộ..."
                  value={form.story} onChange={e => setForm(f => ({ ...f, story: e.target.value }))} />
              </Field>

              <Field label="Tags (phân cách bằng dấu phẩy)">
                <input className={inputCls} placeholder="Thân thiện, Năng động, Đã tiêm phòng"
                  value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} />
              </Field>

              <Field label="Đóng góp bắt buộc trước nhận nuôi (VNĐ)">
                <div className="flex items-center gap-3">
                  <NumberInput min={0} step={10000} placeholder="0 = không yêu cầu"
                    value={String(form.donationAmount || 0)}
                    onChange={v => setForm(f => ({ ...f, donationAmount: Number(v) || 0 }))} />
                  <span className="text-xs text-on-surface-variant font-bold whitespace-nowrap">VNĐ</span>
                </div>
                <p className="text-[10px] text-on-surface-variant mt-1">Để 0 nếu không yêu cầu đóng góp trước khi nhận nuôi.</p>
              </Field>

              <Field label="Sức khoẻ">
                <div className="flex gap-6">
                  {[
                    { key: 'vaccinated',   label: 'Đã tiêm phòng' },
                    { key: 'neutered',     label: 'Đã triệt sản' },
                    { key: 'microchipped', label: 'Có chip GPS' }
                  ].map(({ key, label }) => (
                    <label key={key} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="w-4 h-4 accent-primary"
                        checked={(form as any)[key]}
                        onChange={e => setForm(f => ({ ...f, [key]: e.target.checked }))} />
                      <span className="text-sm font-medium text-on-surface">{label}</span>
                    </label>
                  ))}
                </div>
              </Field>
            </div>

            {/* Modal Footer */}
            <div className="flex gap-3 px-8 py-5 border-t border-outline-variant flex-shrink-0">
              <button onClick={() => setShowForm(false)}
                className="flex-1 py-3 rounded-2xl border border-outline-variant font-bold text-on-surface-variant hover:bg-surface-container transition-all">
                Huỷ
              </button>
              <button onClick={handleSave} disabled={saving}
                className="flex-1 py-3 rounded-2xl bg-primary text-on-primary font-bold shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-95 transition-all disabled:opacity-50">
                {saving ? 'Đang lưu...' : (editing ? 'Cập nhật' : 'Thêm mới')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
