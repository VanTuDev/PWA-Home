import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Lock, Mail, ArrowRight, Eye, EyeOff, ShieldAlert, PawPrint } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState('');
  const [formData, setFormData]         = useState({ email: '', password: '' });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res  = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Thông tin đăng nhập không chính xác.');
        return;
      }

      const allowedRoles = ['admin', 'manager', 'staff'];
      if (!allowedRoles.includes(data.user?.role)) {
        setError('Truy cập bị từ chối. Cổng này chỉ dành cho quản trị viên hệ thống.');
        return;
      }

      login(data.user, data.token);
      navigate('/admin');
    } catch {
      setError('Không thể kết nối máy chủ. Hãy đảm bảo backend đang chạy.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#0a0f1e] relative overflow-hidden">

      {/* Animated background blobs */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute inset-0 opacity-[0.025]"
          style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 0)', backgroundSize: '36px 36px' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-[420px] px-4"
      >
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-[28px] mb-5 bg-gradient-to-br from-primary/30 to-primary/10 border border-primary/30 shadow-[0_0_40px_rgba(85,55,34,0.3)]">
            <ShieldCheck className="w-9 h-9 text-primary" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight mb-1">PAW Admin Portal</h1>
          <p className="text-slate-500 text-sm font-medium">Hệ thống quản trị trung tâm PAW Home</p>
        </div>

        {/* Error banner */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-5 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3 text-red-400 text-xs font-semibold"
          >
            <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </motion.div>
        )}

        {/* Card */}
        <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/10 rounded-[36px] p-8 shadow-2xl">
          <form onSubmit={handleLogin} className="space-y-5">

            {/* Email */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">
                Email quản trị
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="Vantu.dev@gmail.com"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white placeholder-slate-600 focus:ring-2 focus:ring-primary/50 focus:border-primary/40 outline-none transition-all font-medium text-sm"
                />
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">
                Mật khẩu
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••••••"
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-12 py-4 text-white placeholder-slate-600 focus:ring-2 focus:ring-primary/50 focus:border-primary/40 outline-none transition-all font-medium text-sm"
                />
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-2xl font-black text-sm tracking-wider bg-primary text-on-primary shadow-lg shadow-primary/20 flex items-center justify-center gap-3 hover:bg-primary/90 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    ĐANG XÁC THỰC...
                  </>
                ) : (
                  <>XÁC NHẬN TRUY CẬP <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </div>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">hoặc</span>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          {/* Back to public login */}
          <Link to="/login"
            className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl border border-white/10 text-slate-400 text-sm font-bold hover:bg-white/5 hover:text-white transition-all"
          >
            <PawPrint className="w-4 h-4" />
            Đăng nhập tài khoản thường
          </Link>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <Link to="/" className="text-slate-600 text-xs font-bold hover:text-slate-300 transition-colors">
            ← Quay lại trang chủ PAW Home
          </Link>
        </div>
      </motion.div>
    </div>
  );
};
