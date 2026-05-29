import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Eye, EyeOff, ArrowLeft, CheckCircle, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const ChangePassword: React.FC = () => {
  const { user, token } = useAuth();
  const navigate        = useNavigate();

  const [form, setForm]       = useState({ current: '', newPwd: '', confirm: '' });
  const [show, setShow]       = useState({ current: false, new: false, confirm: false });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState(false);

  const passwordStrength = (pwd: string) => {
    if (!pwd) return null;
    if (pwd.length < 6) return { label: 'Quá ngắn', color: 'bg-red-400',    w: 'w-1/4' };
    if (pwd.length < 8) return { label: 'Yếu',      color: 'bg-amber-400',  w: 'w-2/4' };
    if (!/[0-9]/.test(pwd) || !/[A-Za-z]/.test(pwd))
                        return { label: 'Khá',       color: 'bg-yellow-400', w: 'w-3/4' };
    return              { label: 'Mạnh 💪',          color: 'bg-green-500',  w: 'w-full' };
  };

  const strength = passwordStrength(form.newPwd);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (form.newPwd !== form.confirm) { setError('Mật khẩu xác nhận không khớp.'); return; }
    if (form.newPwd.length < 6)       { setError('Mật khẩu mới phải có ít nhất 6 ký tự.'); return; }
    if (form.current === form.newPwd)  { setError('Mật khẩu mới phải khác mật khẩu hiện tại.'); return; }

    setLoading(true);
    try {
      const res  = await fetch('/api/auth/change-password', {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body:    JSON.stringify({ currentPassword: form.current, newPassword: form.newPwd })
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message); return; }
      setSuccess(true);
    } catch {
      setError('Không thể kết nối máy chủ. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const inputBase = "w-full bg-white border rounded-2xl px-10 py-4 focus:ring-4 focus:ring-primary/10 outline-none transition-all text-sm font-bold pr-12";

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4 py-10">
      {/* Back */}
      <button onClick={() => navigate(-1)}
        className="absolute top-6 left-6 p-3 bg-white border border-outline-variant rounded-full text-on-surface hover:bg-surface-container transition-all shadow-sm">
        <ArrowLeft className="w-5 h-5" />
      </button>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {success ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-[40px] border border-outline-variant shadow-2xl p-10 text-center"
          >
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-black text-on-surface mb-3">Đổi mật khẩu thành công!</h2>
            <p className="text-on-surface-variant text-sm font-medium mb-8">
              Mật khẩu mới của bạn đã được lưu. Vui lòng sử dụng mật khẩu mới cho lần đăng nhập tiếp theo.
            </p>
            <div className="flex gap-3">
              <button onClick={() => navigate(-1)}
                className="flex-1 py-3 border border-outline-variant rounded-2xl text-sm font-bold text-on-surface-variant hover:bg-surface-container transition-all">
                Quay lại
              </button>
              <Link to="/"
                className="flex-1 py-3 bg-primary text-on-primary rounded-2xl text-sm font-bold text-center shadow-lg shadow-primary/20 hover:scale-[1.01] transition-all">
                Trang chủ
              </Link>
            </div>
          </motion.div>
        ) : (
          <div className="bg-white rounded-[40px] border border-outline-variant shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-primary px-10 pt-10 pb-8 text-on-primary">
              <div className="w-14 h-14 bg-on-primary/20 rounded-2xl flex items-center justify-center mb-5">
                <Shield className="w-7 h-7" />
              </div>
              <h1 className="text-2xl font-black tracking-tighter mb-1">Đổi mật khẩu</h1>
              <p className="text-on-primary/70 text-sm font-medium">
                {user?.name} · {user?.email}
              </p>
            </div>

            {/* Form */}
            <div className="px-10 py-8 space-y-5">
              {error && (
                <div className="p-4 bg-error-container text-on-error-container rounded-2xl text-xs font-bold">
                  {error}
                </div>
              )}

              {/* Current password */}
              <div className="space-y-1">
                <label className="text-xs font-black text-on-surface-variant ml-2 uppercase tracking-wider">
                  Mật khẩu hiện tại
                </label>
                <div className="relative">
                  <input
                    type={show.current ? 'text' : 'password'} required autoFocus
                    placeholder="Mật khẩu đang dùng"
                    value={form.current}
                    onChange={e => { setForm(f => ({ ...f, current: e.target.value })); setError(''); }}
                    className={`${inputBase} border-outline-variant`}
                  />
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
                  <button type="button" onClick={() => setShow(s => ({ ...s, current: !s.current }))}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary">
                    {show.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <Link to="/forgot-password"
                  className="block text-right text-[10px] font-bold text-primary hover:underline mt-1 mr-1">
                  Quên mật khẩu hiện tại?
                </Link>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-outline-variant" />
                <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Mật khẩu mới</span>
                <div className="h-px flex-1 bg-outline-variant" />
              </div>

              {/* New password */}
              <div className="space-y-2">
                <label className="text-xs font-black text-on-surface-variant ml-2 uppercase tracking-wider">
                  Mật khẩu mới
                </label>
                <div className="relative">
                  <input
                    type={show.new ? 'text' : 'password'} required
                    placeholder="Tối thiểu 6 ký tự"
                    value={form.newPwd}
                    onChange={e => { setForm(f => ({ ...f, newPwd: e.target.value })); setError(''); }}
                    className={`${inputBase} border-outline-variant`}
                  />
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
                  <button type="button" onClick={() => setShow(s => ({ ...s, new: !s.new }))}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary">
                    {show.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {strength && (
                  <div className="ml-2 space-y-1">
                    <div className="h-1.5 bg-outline-variant rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-300 ${strength.color} ${strength.w}`} />
                    </div>
                    <p className="text-[10px] font-bold text-on-surface-variant">{strength.label}</p>
                  </div>
                )}
              </div>

              {/* Confirm */}
              <div className="space-y-1">
                <label className="text-xs font-black text-on-surface-variant ml-2 uppercase tracking-wider">
                  Xác nhận mật khẩu mới
                </label>
                <div className="relative">
                  <input
                    type={show.confirm ? 'text' : 'password'} required
                    placeholder="Nhập lại mật khẩu mới"
                    value={form.confirm}
                    onChange={e => { setForm(f => ({ ...f, confirm: e.target.value })); setError(''); }}
                    className={`${inputBase} ${
                      form.confirm && form.newPwd !== form.confirm
                        ? 'border-red-300'
                        : form.confirm && form.newPwd === form.confirm
                          ? 'border-green-400'
                          : 'border-outline-variant'
                    }`}
                  />
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
                  <button type="button" onClick={() => setShow(s => ({ ...s, confirm: !s.confirm }))}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary">
                    {show.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {form.confirm && form.newPwd !== form.confirm && (
                  <p className="text-[10px] font-bold text-red-500 ml-2">Không khớp</p>
                )}
                {form.confirm && form.newPwd === form.confirm && form.newPwd.length >= 6 && (
                  <p className="text-[10px] font-bold text-green-600 ml-2">✓ Khớp</p>
                )}
              </div>

              <button
                onClick={handleSubmit} disabled={loading}
                className="w-full bg-primary text-on-primary py-4 rounded-[20px] font-bold text-base shadow-xl shadow-primary/20 flex items-center justify-center gap-2 hover:translate-y-[-2px] active:scale-95 transition-all disabled:opacity-50 mt-2"
              >
                {loading ? 'Đang lưu...' : 'Cập nhật mật khẩu'}
                {!loading && <CheckCircle className="w-5 h-5" />}
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
