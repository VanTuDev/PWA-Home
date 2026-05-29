import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Lock, ArrowRight, Eye, EyeOff, CheckCircle, AlertCircle, PawPrint } from 'lucide-react';

export const ResetPassword: React.FC = () => {
  const [params]   = useSearchParams();
  const navigate   = useNavigate();
  const token      = params.get('token') || '';

  const [form, setForm]           = useState({ newPassword: '', confirmPassword: '' });
  const [show, setShow]           = useState({ new: false, confirm: false });
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState(false);
  const [countdown, setCountdown] = useState(5);

  // Countdown sau khi đặt lại thành công
  useEffect(() => {
    if (!success) return;
    const t = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) { clearInterval(t); navigate('/login'); }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [success, navigate]);

  const passwordStrength = (pwd: string) => {
    if (pwd.length === 0) return null;
    if (pwd.length < 6)  return { level: 'weak',   label: 'Quá ngắn',   color: 'bg-red-400',    w: 'w-1/4' };
    if (pwd.length < 8)  return { level: 'fair',   label: 'Yếu',        color: 'bg-amber-400',  w: 'w-2/4' };
    if (!/[0-9]/.test(pwd) || !/[A-Za-z]/.test(pwd))
                         return { level: 'good',   label: 'Khá',        color: 'bg-yellow-400', w: 'w-3/4' };
    return               { level: 'strong', label: 'Mạnh 💪', color: 'bg-green-500',  w: 'w-full' };
  };

  const strength = passwordStrength(form.newPassword);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!token) { setError('Liên kết không hợp lệ.'); return; }
    if (form.newPassword !== form.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.'); return;
    }
    if (form.newPassword.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự.'); return;
    }

    setLoading(true);
    try {
      const res  = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: form.newPassword })
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

  // Token trống → báo lỗi ngay
  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface px-4">
        <div className="text-center max-w-sm">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-black text-on-surface mb-2">Liên kết không hợp lệ</h2>
          <p className="text-on-surface-variant text-sm mb-6">Liên kết đặt lại mật khẩu bị thiếu hoặc đã bị hỏng.</p>
          <Link to="/forgot-password" className="bg-primary text-on-primary px-6 py-3 rounded-2xl font-bold text-sm">
            Yêu cầu liên kết mới
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-surface">
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1559592442-7e18ad73d63b?auto=format&fit=crop&q=80&w=2000"
          className="w-full h-full object-cover scale-110 blur-[4px] opacity-30" alt="" />
        <div className="absolute inset-0 bg-auth-overlay" />
      </div>

      <div className="relative z-10 w-full max-w-md px-4">
        <AnimatePresence mode="wait">
          {success ? (
            <motion.div key="ok" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="bg-white/80 backdrop-blur-xl rounded-[40px] px-10 py-12 shadow-2xl text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-black text-on-surface mb-3">Mật khẩu đã được đặt lại!</h2>
              <p className="text-on-surface-variant text-sm font-medium mb-6">
                Mật khẩu mới của bạn đã được lưu thành công. Chuyển sang đăng nhập sau <strong className="text-primary">{countdown}s</strong>...
              </p>
              <Link to="/login"
                className="inline-flex items-center gap-2 bg-primary text-on-primary px-8 py-3 rounded-2xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all">
                Đăng nhập ngay <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          ) : (
            <motion.div key="form" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="auth-glass rounded-[40px] overflow-hidden shadow-2xl">
              {/* Header */}
              <div className="bg-primary px-10 pt-10 pb-8 text-center text-on-primary">
                <Link to="/" className="inline-flex items-center gap-3 bg-on-primary px-4 py-2.5 rounded-2xl mb-8 shadow-xl rotate-1 hover:rotate-0 transition-transform">
                  <PawPrint className="text-primary w-6 h-6" />
                  <span className="font-black text-primary tracking-tighter">PAW Home</span>
                </Link>
                <h1 className="text-3xl font-black tracking-tighter mb-2">Đặt lại mật khẩu</h1>
                <p className="text-on-primary/70 text-sm font-medium">
                  Tạo mật khẩu mới cho tài khoản của bạn.
                </p>
              </div>

              {/* Form */}
              <div className="bg-white/70 backdrop-blur-sm px-10 py-8">
                {error && (
                  <div className="mb-5 p-4 bg-error-container text-on-error-container rounded-2xl text-xs font-bold">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* New password */}
                  <div className="space-y-2">
                    <label className="text-xs font-black text-on-surface-variant ml-2 uppercase tracking-wider">
                      Mật khẩu mới
                    </label>
                    <div className="relative">
                      <input
                        type={show.new ? 'text' : 'password'} required
                        autoFocus placeholder="Tối thiểu 6 ký tự"
                        value={form.newPassword}
                        onChange={e => { setForm(f => ({ ...f, newPassword: e.target.value })); setError(''); }}
                        className="w-full bg-white border border-outline-variant rounded-2xl px-10 py-4 focus:ring-4 focus:ring-primary/10 outline-none transition-all text-sm font-bold pr-12"
                      />
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
                      <button type="button" onClick={() => setShow(s => ({ ...s, new: !s.new }))}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary">
                        {show.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {/* Strength bar */}
                    {strength && (
                      <div className="ml-2 space-y-1">
                        <div className="h-1.5 bg-outline-variant rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all duration-300 ${strength.color} ${strength.w}`} />
                        </div>
                        <p className={`text-[10px] font-bold ${
                          strength.level === 'strong' ? 'text-green-600' :
                          strength.level === 'good' ? 'text-yellow-600' :
                          strength.level === 'fair' ? 'text-amber-600' : 'text-red-500'
                        }`}>
                          {strength.label}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Confirm password */}
                  <div className="space-y-1">
                    <label className="text-xs font-black text-on-surface-variant ml-2 uppercase tracking-wider">
                      Xác nhận mật khẩu
                    </label>
                    <div className="relative">
                      <input
                        type={show.confirm ? 'text' : 'password'} required
                        placeholder="Nhập lại mật khẩu mới"
                        value={form.confirmPassword}
                        onChange={e => { setForm(f => ({ ...f, confirmPassword: e.target.value })); setError(''); }}
                        className={`w-full bg-white border rounded-2xl px-10 py-4 focus:ring-4 focus:ring-primary/10 outline-none transition-all text-sm font-bold pr-12 ${
                          form.confirmPassword && form.newPassword !== form.confirmPassword
                            ? 'border-red-300 bg-red-50/50'
                            : form.confirmPassword && form.newPassword === form.confirmPassword
                              ? 'border-green-300'
                              : 'border-outline-variant'
                        }`}
                      />
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
                      <button type="button" onClick={() => setShow(s => ({ ...s, confirm: !s.confirm }))}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary">
                        {show.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {form.confirmPassword && form.newPassword !== form.confirmPassword && (
                      <p className="text-[10px] font-bold text-red-500 ml-2">Mật khẩu không khớp</p>
                    )}
                    {form.confirmPassword && form.newPassword === form.confirmPassword && (
                      <p className="text-[10px] font-bold text-green-600 ml-2">✓ Mật khẩu khớp</p>
                    )}
                  </div>

                  <button type="submit" disabled={loading}
                    className="w-full bg-primary text-on-primary py-4 rounded-[20px] font-bold text-base shadow-xl shadow-primary/20 flex items-center justify-center gap-2 hover:translate-y-[-2px] active:scale-95 transition-all disabled:opacity-50 mt-2">
                    {loading ? 'Đang xử lý...' : 'Xác nhận mật khẩu mới'}
                    {!loading && <ArrowRight className="w-5 h-5" />}
                  </button>
                </form>

                <div className="mt-5 text-center">
                  <Link to="/forgot-password" className="text-xs font-bold text-on-surface-variant hover:text-primary transition-colors">
                    Yêu cầu liên kết mới
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
