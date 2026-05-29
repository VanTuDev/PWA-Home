import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, ArrowRight, PawPrint, CheckCircle } from 'lucide-react';

export const ForgotPassword: React.FC = () => {
  const [email, setEmail]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [sent, setSent]         = useState(false);
  const [error, setError]       = useState('');
  const [demoUrl, setDemoUrl]   = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');

    try {
      const res  = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message); return; }

      setSent(true);
      if (data.demoResetUrl) setDemoUrl(data.demoResetUrl);
    } catch {
      setError('Không thể kết nối máy chủ. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-surface">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1559592442-7e18ad73d63b?auto=format&fit=crop&q=80&w=2000"
          className="w-full h-full object-cover scale-110 blur-[4px] opacity-30"
          alt=""
        />
        <div className="absolute inset-0 bg-auth-overlay" />
      </div>

      <Link to="/login"
        className="absolute top-6 left-6 z-50 p-3 bg-white/50 backdrop-blur-md rounded-full text-primary hover:bg-white transition-all shadow-lg">
        <ArrowLeft className="w-6 h-6" />
      </Link>

      <div className="relative z-10 w-full max-w-md px-4">
        <AnimatePresence mode="wait">
          {!sent ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="auth-glass rounded-[40px] overflow-hidden shadow-2xl"
            >
              {/* Header */}
              <div className="bg-primary px-10 pt-10 pb-8 text-center text-on-primary">
                <Link to="/" className="inline-flex items-center gap-3 bg-on-primary px-4 py-2.5 rounded-2xl mb-8 shadow-xl rotate-1 hover:rotate-0 transition-transform">
                  <PawPrint className="text-primary w-6 h-6" />
                  <span className="font-black text-primary tracking-tighter">PAW Home</span>
                </Link>
                <h1 className="text-3xl font-black tracking-tighter mb-2">Quên mật khẩu?</h1>
                <p className="text-on-primary/70 text-sm font-medium">
                  Nhập email tài khoản — chúng tôi sẽ gửi liên kết đặt lại mật khẩu.
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
                  <div className="space-y-1">
                    <label className="text-xs font-black text-on-surface-variant ml-2 uppercase tracking-wider">
                      Địa chỉ Email
                    </label>
                    <div className="relative">
                      <input
                        type="email" required
                        autoFocus
                        placeholder="your@email.com"
                        value={email}
                        onChange={e => { setEmail(e.target.value); setError(''); }}
                        className="w-full bg-white border border-outline-variant rounded-2xl px-10 py-4 focus:ring-4 focus:ring-primary/10 outline-none transition-all text-sm font-bold"
                      />
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
                    </div>
                  </div>

                  <button
                    type="submit" disabled={loading}
                    className="w-full bg-primary text-on-primary py-4 rounded-[20px] font-bold text-base shadow-xl shadow-primary/20 flex items-center justify-center gap-2 hover:translate-y-[-2px] active:scale-95 transition-all disabled:opacity-50"
                  >
                    {loading ? 'Đang gửi...' : 'Gửi liên kết đặt lại'}
                    {!loading && <ArrowRight className="w-5 h-5" />}
                  </button>
                </form>

                <div className="mt-6 text-center">
                  <Link to="/login" className="text-sm font-bold text-on-surface-variant hover:text-primary transition-colors">
                    ← Quay lại đăng nhập
                  </Link>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="auth-glass rounded-[40px] overflow-hidden shadow-2xl text-center"
            >
              <div className="bg-white/80 backdrop-blur-sm px-10 py-12">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                <h2 className="text-2xl font-black text-on-surface mb-3">Kiểm tra email của bạn!</h2>
                <p className="text-on-surface-variant text-sm font-medium leading-relaxed mb-2">
                  Nếu <strong>{email}</strong> tồn tại trong hệ thống, bạn sẽ nhận được email với liên kết đặt lại mật khẩu.
                </p>
                <p className="text-on-surface-variant text-xs font-medium mb-6">
                  Liên kết có hiệu lực trong <strong>1 giờ</strong>. Kiểm tra cả thư mục Spam.
                </p>

                {/* Demo mode — hiện link trực tiếp khi chưa cấu hình email */}
                {demoUrl && (
                  <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl text-left">
                    <p className="text-xs font-black text-amber-700 uppercase tracking-wider mb-2">
                      🛠 Demo mode — Click link bên dưới để test:
                    </p>
                    <a href={demoUrl}
                      className="text-xs font-bold text-primary break-all hover:underline">
                      {demoUrl}
                    </a>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => { setSent(false); setDemoUrl(''); }}
                    className="flex-1 py-3 border border-outline-variant rounded-2xl text-sm font-bold text-on-surface-variant hover:bg-surface-container transition-all">
                    Gửi lại
                  </button>
                  <Link to="/login"
                    className="flex-1 py-3 bg-primary text-on-primary rounded-2xl text-sm font-bold text-center shadow-lg shadow-primary/20 hover:scale-[1.01] transition-all">
                    Về đăng nhập
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
