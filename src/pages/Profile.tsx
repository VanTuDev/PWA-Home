import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Camera, User, Phone, MapPin, Briefcase, DollarSign, FileText, Save, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AVATAR_PLACEHOLDER = 'https://placehold.co/120x120/f5f0eb/553722?text=👤';
const COVER_PLACEHOLDER  = 'https://placehold.co/1200x300/553722/ffffff?text=PAW+Home';

export const Profile: React.FC = () => {
  const { user, token, updateUser } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name:    user?.name    ?? '',
    phone:   user?.phone   ?? '',
    address: user?.address ?? '',
    job:     user?.job     ?? '',
    salary:  user?.salary  ?? '',
    bio:     user?.bio     ?? '',
  });

  const [avatarPreview,    setAvatarPreview]    = useState(user?.avatar     || '');
  const [coverPreview,     setCoverPreview]     = useState(user?.coverPhoto || '');
  const [avatarFile,       setAvatarFile]       = useState<File | null>(null);
  const [coverFile,        setCoverFile]        = useState<File | null>(null);

  const [loading,  setLoading]  = useState(false);
  const [saved,    setSaved]    = useState(false);
  const [error,    setError]    = useState('');

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef  = useRef<HTMLInputElement>(null);

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleImagePick = (type: 'avatar' | 'cover') => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    if (type === 'avatar') { setAvatarFile(file); setAvatarPreview(url); }
    else                   { setCoverFile(file);  setCoverPreview(url); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(''); setSaved(false);

    try {
      const fd = new FormData();
      fd.append('name',    form.name);
      fd.append('phone',   form.phone);
      fd.append('address', form.address);
      fd.append('job',     form.job);
      fd.append('salary',  form.salary);
      fd.append('bio',     form.bio);
      if (avatarFile) fd.append('avatar',     avatarFile);
      if (coverFile)  fd.append('coverPhoto', coverFile);

      const res  = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message); return; }

      updateUser(data.user);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError('Không thể kết nối máy chủ. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface pb-16">
      {/* Cover Photo */}
      <div className="relative h-56 md:h-72 bg-primary/20 overflow-hidden group">
        <img
          src={coverPreview || COVER_PLACEHOLDER}
          alt="Ảnh bìa"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/20" />

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 z-10 p-2.5 bg-black/30 hover:bg-black/50 backdrop-blur-sm rounded-full text-white transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* Change cover button */}
        <button
          type="button"
          onClick={() => coverInputRef.current?.click()}
          className="absolute bottom-4 right-4 flex items-center gap-2 bg-black/40 hover:bg-black/60 backdrop-blur-sm text-white text-xs font-bold px-4 py-2 rounded-full transition-all"
        >
          <Camera className="w-4 h-4" /> Đổi ảnh bìa
        </button>
        <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={handleImagePick('cover')} />
      </div>

      <div className="max-w-2xl mx-auto px-4">
        {/* Avatar */}
        <div className="relative -mt-16 mb-6 flex items-end gap-4">
          <div className="relative">
            <img
              src={avatarPreview || AVATAR_PLACEHOLDER}
              alt="Avatar"
              className="w-32 h-32 rounded-[28px] border-4 border-white shadow-xl object-cover bg-surface-container"
              onError={e => { (e.target as HTMLImageElement).src = AVATAR_PLACEHOLDER; }}
            />
            <button
              type="button"
              onClick={() => avatarInputRef.current?.click()}
              className="absolute -bottom-2 -right-2 w-9 h-9 bg-primary text-on-primary rounded-xl flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
            >
              <Camera className="w-4 h-4" />
            </button>
            <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleImagePick('avatar')} />
          </div>
          <div className="pb-2">
            <h1 className="text-xl font-black text-on-surface">{user.name}</h1>
            <p className="text-sm text-on-surface-variant font-medium">{user.email}</p>
          </div>
        </div>

        {/* Form */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-5"
        >
          {error && (
            <div className="p-4 bg-error-container text-on-error-container rounded-2xl text-sm font-semibold">{error}</div>
          )}

          {saved && (
            <div className="p-4 bg-green-50 border border-green-200 text-green-800 rounded-2xl text-sm font-semibold flex items-center gap-2">
              <CheckCircle className="w-4 h-4" /> Cập nhật hồ sơ thành công!
            </div>
          )}

          {/* Họ tên */}
          <Field icon={<User className="w-4 h-4" />} label="Họ và tên">
            <input
              type="text" required
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              className="input-field"
              placeholder="Nguyễn Văn A"
            />
          </Field>

          {/* SĐT */}
          <Field icon={<Phone className="w-4 h-4" />} label="Số điện thoại">
            <input
              type="tel"
              value={form.phone}
              onChange={e => setForm({ ...form, phone: e.target.value })}
              className="input-field"
              placeholder="09xx xxx xxx"
            />
          </Field>

          {/* Địa chỉ */}
          <Field icon={<MapPin className="w-4 h-4" />} label="Địa chỉ">
            <input
              type="text"
              value={form.address}
              onChange={e => setForm({ ...form, address: e.target.value })}
              className="input-field"
              placeholder="Quận Hải Châu, Đà Nẵng"
            />
          </Field>

          {/* Nghề nghiệp + Thu nhập */}
          <div className="grid grid-cols-2 gap-4">
            <Field icon={<Briefcase className="w-4 h-4" />} label="Nghề nghiệp">
              <input
                type="text"
                value={form.job}
                onChange={e => setForm({ ...form, job: e.target.value })}
                className="input-field"
                placeholder="Kỹ sư phần mềm"
              />
            </Field>
            <Field icon={<DollarSign className="w-4 h-4" />} label="Thu nhập">
              <input
                type="text"
                value={form.salary}
                onChange={e => setForm({ ...form, salary: e.target.value })}
                className="input-field"
                placeholder="10 - 20 triệu"
              />
            </Field>
          </div>

          {/* Bio */}
          <Field icon={<FileText className="w-4 h-4" />} label={`Giới thiệu bản thân (${form.bio.length}/300)`}>
            <textarea
              rows={4}
              maxLength={300}
              value={form.bio}
              onChange={e => setForm({ ...form, bio: e.target.value })}
              className="input-field resize-none"
              placeholder="Chia sẻ đôi điều về bản thân và tình yêu với thú cưng..."
            />
          </Field>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-on-primary py-4 rounded-[20px] font-bold text-base shadow-xl shadow-primary/20 flex items-center justify-center gap-2 hover:translate-y-[-2px] active:scale-95 transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            {loading ? 'Đang lưu...' : 'Lưu hồ sơ'}
          </button>
        </motion.form>
      </div>

      <style>{`
        .input-field {
          width: 100%;
          background: white;
          border: 1px solid var(--md-sys-color-outline-variant, #e0e0e0);
          border-radius: 16px;
          padding: 12px 16px;
          font-size: 14px;
          font-weight: 600;
          outline: none;
          transition: box-shadow 0.2s;
        }
        .input-field:focus {
          box-shadow: 0 0 0 4px color-mix(in srgb, var(--md-sys-color-primary, #553722) 10%, transparent);
        }
      `}</style>
    </div>
  );
};

const Field: React.FC<{ icon: React.ReactNode; label: string; children: React.ReactNode }> = ({ icon, label, children }) => (
  <div className="space-y-1.5">
    <label className="flex items-center gap-1.5 text-xs font-black text-on-surface-variant uppercase tracking-wider ml-1">
      {icon} {label}
    </label>
    {children}
  </div>
);
