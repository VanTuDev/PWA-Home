import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Mail, ArrowLeft, ArrowRight, PawPrint,
  CheckCircle, Lock, Eye, EyeOff, KeyRound,
} from 'lucide-react';

type Step = 'email' | 'new-password' | 'done';

export const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('email');

  /* ── Step 1: email ── */
  const [email, setEmail]         = useState('');
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailError, setEmailError]     = useState('');
  const [resetToken, setResetToken]     = useState('');

  /* ── Step 2: new password ── */
  const [newPwd, setNewPwd]         = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [showNew, setShowNew]       = useState(false);
  const [showCfm, setShowCfm]       = useState(false);
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdError, setPwdError]     = useState('');
  const [countdown, setCountdown]   = useState(5);

  /* ── Password strength ── */
  const strength = (pwd: string) => {
    if (!pwd) return null;
    if (pwd.length < 6)  return { label: 'Quá ngắn',  color: 'bg-red-400',    w: 'w-1/4',  cls: 'text-red-500' };
    if (pwd.length < 8)  return { label: 'Yếu',       color: 'bg-amber-400',  w: 'w-2/4',  cls: 'text-amber-500' };
    if (!/[0-9]/.test(pwd) || !/[A-Za-z]/.test(pwd))
                         return { label: 'Khá',       color: 'bg-yellow-400', w: 'w-3/4',  cls: 'text-yellow-600' };
    return               { label: 'Mạnh 💪', color: 'bg-green-500',  w: 'w-full', cls: 'text-green-600' };
  };
  const str = strength(newPwd);

  /* ── Step 1 submit ── */
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailLoading(true); setEmailError('');
    try {
      const res  = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) { setEmailError(data.message); return; }
      setResetToken(data.token);
      setStep('new-password');
    } catch {
      setEmailError('Không thể kết nối máy chủ. Vui lòng thử lại.');
    } finally {
      setEmailLoading(false);
    }
  };

  /* ── Step 2 submit ── */
  const handlePwdSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdError('');
    if (newPwd !== confirmPwd)  { setPwdError('Mật khẩu xác nhận không khớp.'); return; }
    if (newPwd.length < 6)      { setPwdError('Mật khẩu phải có ít nhất 6 ký tự.'); return; }

    setPwdLoading(true);
    try {
      const res  = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: resetToken, newPassword: newPwd }),
      });
      const data = await res.json();
      if (!res.ok) { setPwdError(data.message); return; }

      setStep('done');
      let c = 5;
      const t = setInterval(() => {
        c--;
        setCountdown(c);
        if (c <= 0) { clearInterval(t); navigate('/login'); }
      }, 1000);
    } catch {
      setPwdError('Không thể kết nối máy chủ. Vui lòng thử lại.');
    } finally {
      setPwdLoading(false);
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

      <Link
        to="/login"
        className="absolute top-6 left-6 z-50 p-3 bg-white/50 backdrop-blur-md rounded-full text-primary hover:bg-white transition-all shadow-lg"
      >
        <ArrowLeft className="w-6 h-6" />
      </Link>

      <div className="relative z-10 w-full max-w-md px-4">
        <AnimatePresence mode="wait">

          {/* ── Step 1: Nhập email ─────────────────────────────── */}
          {step === 'email' && (
            <motion.div
              key="email"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="auth-glass rounded-[40px] overflow-hidden shadow-2xl"
            >
              <div className="bg-primary px-10 pt-10 pb-8 text-center text-on-primary">
                <Link to="/" className="inline-flex items-center gap-3 bg-on-primary px-4 py-2.5 rounded-2xl mb-8 shadow-xl rotate-1 hover:rotate-0 transition-transform">
                  <PawPrint className="text-primary w-6 h-6" />
                  <span className="font-black text-primary tracking-tighter">PAW Home</span>
                </Link>
                <h1 className="text-3xl font-black tracking-tighter mb-2">Quên mật khẩu?</h1>
                <p className="text-on-primary/70 text-sm font-medium">
                  Nhập email tài khoản của bạn để đặt lại mật khẩu.
                </p>
              </div>

              <div className="bg-white/70 backdrop-blur-sm px-10 py-8">
                {emailError && (
                  <div className="mb-5 p-4 bg-error-container text-on-error-container rounded-2xl text-xs font-bold">
                    {emailError}
                  </div>
                )}
                <form onSubmit={handleEmailSubmit} className="space-y-5">
                  <div className="space-y-1">
                    <label className="text-xs font-black text-on-surface-variant ml-2 uppercase tracking-wider">
                      Địa chỉ Email
                    </label>
                    <div className="relative">
                      <input
                        type="email" required autoFocus
                        placeholder="your@email.com"
                        value={email}
                        onChange={e => { setEmail(e.target.value); setEmailError(''); }}
                        className="w-full bg-white border border-outline-variant rounded-2xl px-10 py-4 focus:ring-4 focus:ring-primary/10 outline-none transition-all text-sm font-bold"
                      />
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
                    </div>
                  </div>

                  <button
                    type="submit" disabled={emailLoading}
                    className="w-full bg-primary text-on-primary py-4 rounded-[20px] font-bold text-base shadow-xl shadow-primary/20 flex items-center justify-center gap-2 hover:-translate-y-0.5 active:scale-95 transition-all disabled:opacity-50"
                  >
                    {emailLoading ? 'Đang kiểm tra...' : 'Tiếp tục'}
                    {!emailLoading && <ArrowRight className="w-5 h-5" />}
                  </button>
                </form>

                <div className="mt-6 text-center">
                  <Link to="/login" className="text-sm font-bold text-on-surface-variant hover:text-primary transition-colors">
                    ← Quay lại đăng nhập
                  </Link>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Step 2: Đặt mật khẩu mới ──────────────────────── */}
          {step === 'new-password' && (
            <motion.div
              key="new-password"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              className="auth-glass rounded-[40px] overflow-hidden shadow-2xl"
            >
              <div className="bg-primary px-10 pt-10 pb-8 text-center text-on-primary">
                <div className="w-14 h-14 bg-on-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-5">
                  <KeyRound className="w-7 h-7 text-on-primary" />
                </div>
                <h1 className="text-3xl font-black tracking-tighter mb-2">Mật khẩu mới</h1>
                <p className="text-on-primary/70 text-sm font-medium">
                  Tài khoản: <strong>{email}</strong>
                </p>
              </div>

              <div className="bg-white/70 backdrop-blur-sm px-10 py-8">
                {pwdError && (
                  <div className="mb-5 p-4 bg-error-container text-on-error-container rounded-2xl text-xs font-bold">
                    {pwdError}
                  </div>
                )}
                <form onSubmit={handlePwdSubmit} className="space-y-5">
                  {/* New password */}
                  <div className="space-y-2">
                    <label className="text-xs font-black text-on-surface-variant ml-2 uppercase tracking-wider">
                      Mật khẩu mới
                    </label>
                    <div className="relative">
                      <input
                        type={showNew ? 'text' : 'password'} required autoFocus
                        placeholder="Tối thiểu 6 ký tự"
                        value={newPwd}
                        onChange={e => { setNewPwd(e.target.value); setPwdError(''); }}
                        className="w-full bg-white border border-outline-variant rounded-2xl px-10 py-4 focus:ring-4 focus:ring-primary/10 outline-none transition-all text-sm font-bold pr-12"
                      />
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
                      <button type="button" onClick={() => setShowNew(s => !s)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary">
                        {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {str && (
                      <div className="ml-2 space-y-1">
                        <div className="h-1.5 bg-outline-variant rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all duration-300 ${str.color} ${str.w}`} />
                        </div>
                        <p className={`text-[10px] font-bold ${str.cls}`}>{str.label}</p>
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
                        type={showCfm ? 'text' : 'password'} required
                        placeholder="Nhập lại mật khẩu mới"
                        value={confirmPwd}
                        onChange={e => { setConfirmPwd(e.target.value); setPwdError(''); }}
                        className={`w-full bg-white border rounded-2xl px-10 py-4 focus:ring-4 focus:ring-primary/10 outline-none transition-all text-sm font-bold pr-12 ${
                          confirmPwd && newPwd !== confirmPwd
                            ? 'border-red-300 bg-red-50/50'
                            : confirmPwd && newPwd === confirmPwd
                              ? 'border-green-300'
                              : 'border-outline-variant'
                        }`}
                      />
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
                      <button type="button" onClick={() => setShowCfm(s => !s)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary">
                        {showCfm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {confirmPwd && newPwd !== confirmPwd && (
                      <p className="text-[10px] font-bold text-red-500 ml-2">Mật khẩu không khớp</p>
                    )}
                    {confirmPwd && newPwd === confirmPwd && (
                      <p className="text-[10px] font-bold text-green-600 ml-2">✓ Mật khẩu khớp</p>
                    )}
                  </div>

                  <button type="submit" disabled={pwdLoading}
                    className="w-full bg-primary text-on-primary py-4 rounded-[20px] font-bold text-base shadow-xl shadow-primary/20 flex items-center justify-center gap-2 hover:-translate-y-0.5 active:scale-95 transition-all disabled:opacity-50 mt-2">
                    {pwdLoading ? 'Đang lưu...' : 'Đặt mật khẩu mới'}
                    {!pwdLoading && <ArrowRight className="w-5 h-5" />}
                  </button>
                </form>

                <div className="mt-5 text-center">
                  <button
                    onClick={() => { setStep('email'); setPwdError(''); setNewPwd(''); setConfirmPwd(''); }}
                    className="text-xs font-bold text-on-surface-variant hover:text-primary transition-colors"
                  >
                    ← Nhập lại email
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Step 3: Thành công ─────────────────────────────── */}
          {step === 'done' && (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white/80 backdrop-blur-xl rounded-[40px] px-10 py-12 shadow-2xl text-center"
            >
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-black text-on-surface mb-3">Đổi mật khẩu thành công!</h2>
              <p className="text-on-surface-variant text-sm font-medium mb-8">
                Mật khẩu mới đã được lưu. Tự chuyển đến đăng nhập sau{' '}
                <strong className="text-primary">{countdown}s</strong>...
              </p>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 bg-primary text-on-primary px-8 py-3 rounded-2xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all"
              >
                Đăng nhập ngay <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
};
