import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  PawPrint, Mail, Lock, User, ArrowRight, Phone,
  ArrowLeft, Eye, EyeOff, Upload, CheckCircle, IdCard,
} from 'lucide-react';

export const Auth: React.FC = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { login } = useAuth();

  const [isLogin,      setIsLogin]      = useState(location.pathname === '/login');
  const [showPassword, setShowPassword] = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState('');
  const [emailTaken,   setEmailTaken]   = useState(false);
  const [regStep,      setRegStep]      = useState(1); // 1: thông tin, 2: CCCD

  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });

  // CCCD files
  const [cccdFront,        setCccdFront]        = useState<File | null>(null);
  const [cccdBack,         setCccdBack]          = useState<File | null>(null);
  const [cccdFrontPreview, setCccdFrontPreview] = useState('');
  const [cccdBackPreview,  setCccdBackPreview]  = useState('');
  const frontRef = useRef<HTMLInputElement>(null);
  const backRef  = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsLogin(location.pathname === '/login');
    setRegStep(1);
    setError('');
  }, [location.pathname]);

  const fetchWithTimeout = (url: string, options: RequestInit, ms = 25000) => {
    const ctrl = new AbortController();
    const id   = setTimeout(() => ctrl.abort(), ms);
    return fetch(url, { ...options, signal: ctrl.signal }).finally(() => clearTimeout(id));
  };

  // ── Đăng nhập ──────────────────────────────────────────────────────────────
  const handleLogin = async () => {
    setLoading(true); setError('');
    try {
      const res  = await fetchWithTimeout('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, password: form.password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message); return; }
      login(data.user, data.token);
      navigate(['admin','manager','staff'].includes(data.user.role) ? '/admin' : '/');
    } catch (err: any) {
      setError(err?.name === 'AbortError'
        ? 'Server đang khởi động, vui lòng thử lại sau 30 giây.'
        : 'Không thể kết nối máy chủ.');
    } finally { setLoading(false); }
  };

  // ── Đăng ký bước 2: gửi FormData với CCCD ─────────────────────────────────
  const handleRegister = async () => {
    setLoading(true); setError('');
    try {
      const fd = new FormData();
      fd.append('name',     form.name);
      fd.append('email',    form.email);
      fd.append('password', form.password);
      fd.append('phone',    form.phone);
      if (cccdFront) fd.append('cccdFront', cccdFront);
      if (cccdBack)  fd.append('cccdBack',  cccdBack);

      const res  = await fetchWithTimeout('/api/auth/register', { method: 'POST', body: fd });
      const data = await res.json();

      if (!res.ok) {
        if (data.code === 'EMAIL_ALREADY_REGISTERED') setEmailTaken(true);
        else setError(data.message || 'Đã có lỗi xảy ra.');
        return;
      }

      login(data.user, data.token);
      navigate('/');
    } catch (err: any) {
      setError(err?.name === 'AbortError'
        ? 'Server timeout. Vui lòng thử lại.'
        : 'Không thể kết nối máy chủ.');
    } finally { setLoading(false); }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) return handleLogin();
    if (regStep === 1) return setRegStep(2);
    return handleRegister();
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setSrc: (f: File) => void,
    setPreview: (s: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSrc(file);
    setPreview(URL.createObjectURL(file));
  };

  const inputCls = "w-full bg-white border border-outline-variant rounded-2xl px-10 py-4 focus:ring-4 focus:ring-primary/10 outline-none transition-all text-sm font-bold";
  const labelCls = "text-xs font-black text-on-surface-variant ml-2 uppercase tracking-wider";

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-surface">
      {/* Back */}
      <button onClick={() => navigate('/')}
        className="absolute top-6 left-6 z-50 p-3 bg-white/50 lg:bg-white/20 backdrop-blur-md rounded-full text-primary lg:text-white hover:bg-white hover:text-primary transition-all shadow-lg">
        <ArrowLeft className="w-6 h-6" />
      </button>

      {/* Background */}
      <div className="absolute inset-0 z-0">
        <img src="https://images.unsplash.com/photo-1559592442-7e18ad73d63b?auto=format&fit=crop&q=80&w=2000"
          className="w-full h-full object-cover scale-110 blur-[4px] opacity-40" alt="" />
        <div className="absolute inset-0 bg-auth-overlay" />
      </div>

      <div className="relative z-10 w-full max-w-5xl lg:h-[85vh] flex items-stretch px-4 md:px-8 lg:px-0 py-8 lg:py-0">
        <div className="w-full flex flex-col lg:flex-row auth-glass rounded-[32px] lg:rounded-[48px] overflow-hidden shadow-2xl min-h-[600px]">

          {/* Left */}
          <div className="hidden lg:flex w-5/12 bg-primary relative items-center justify-center p-16 text-on-primary overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-[-10%] left-[-10%] w-64 h-64 border-4 border-white rounded-full" />
              <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 border-[40px] border-white rounded-full" />
            </div>
            <div className="relative z-10 text-center">
              <Link to="/" className="inline-flex items-center gap-4 bg-on-primary p-4 rounded-[32px] mb-12 shadow-2xl rotate-3 hover:rotate-0 transition-transform">
                <PawPrint className="text-primary w-10 h-10" />
                <span className="text-2xl font-black text-primary tracking-tighter">PAW Home</span>
              </Link>
              <h1 className="text-4xl font-black mb-6 leading-tight tracking-tighter">
                {isLogin ? 'Chào mừng trở lại!' : 'Hành trình mới bắt đầu'}
              </h1>
              <p className="text-on-primary/70 font-medium leading-relaxed">
                {isLogin
                  ? 'Tiếp tục sứ mệnh cứu hộ và tìm kiếm tổ ấm cho những người bạn nhỏ tại Đà Nẵng.'
                  : 'Chỉ vài bước đơn giản để trở thành một phần của cộng đồng cứu hộ thú cưng lớn nhất.'}
              </p>
            </div>
          </div>

          {/* Right */}
          <div className="flex-1 bg-white/60 backdrop-blur-sm p-8 md:p-12 overflow-y-auto">
            <AnimatePresence mode="wait">

              {/* ── Bước 2: Upload CCCD ── */}
              {!isLogin && regStep === 2 ? (
                <motion.div key="cccd" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <div className="mb-8">
                    <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                      <IdCard className="w-7 h-7 text-primary" />
                    </div>
                    <h2 className="text-3xl font-black text-on-surface mb-1">Xác minh danh tính</h2>
                    <p className="text-on-surface-variant text-sm font-medium">
                      Bước 2/2 — Upload ảnh CCCD/CMND để hoàn tất đăng ký
                    </p>
                  </div>

                  {emailTaken && (
                    <div className="mb-5 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
                      <p className="text-sm font-black text-amber-800 mb-1">Email này đã có tài khoản!</p>
                      <button type="button" onClick={() => { setEmailTaken(false); setIsLogin(true); setRegStep(1); setError(''); }}
                        className="w-full bg-amber-600 text-white py-2.5 rounded-xl text-sm font-bold hover:bg-amber-700 transition-colors mt-2">
                        Chuyển sang Đăng nhập
                      </button>
                    </div>
                  )}

                  {error && (
                    <div className="mb-5 p-4 bg-red-50 text-red-700 rounded-2xl text-sm font-semibold">{error}</div>
                  )}

                  <form onSubmit={handleAuth} className="space-y-5">
                    {/* CCCD Front */}
                    <div className="space-y-2">
                      <label className={labelCls}>Mặt trước CCCD / CMND</label>
                      <div
                        onClick={() => frontRef.current?.click()}
                        className="relative w-full h-36 border-2 border-dashed border-outline-variant rounded-2xl overflow-hidden cursor-pointer hover:border-primary transition-colors group">
                        {cccdFrontPreview
                          ? <img src={cccdFrontPreview} className="w-full h-full object-cover" alt="front" />
                          : (
                            <div className="flex flex-col items-center justify-center h-full gap-2 text-on-surface-variant group-hover:text-primary transition-colors">
                              <Upload className="w-8 h-8" />
                              <span className="text-xs font-bold">Nhấn để chọn ảnh</span>
                            </div>
                          )}
                        {cccdFrontPreview && (
                          <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1">
                            <CheckCircle className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                      <input ref={frontRef} type="file" accept="image/*" className="hidden"
                        onChange={e => handleFileChange(e, setCccdFront, setCccdFrontPreview)} />
                    </div>

                    {/* CCCD Back */}
                    <div className="space-y-2">
                      <label className={labelCls}>Mặt sau CCCD / CMND</label>
                      <div
                        onClick={() => backRef.current?.click()}
                        className="relative w-full h-36 border-2 border-dashed border-outline-variant rounded-2xl overflow-hidden cursor-pointer hover:border-primary transition-colors group">
                        {cccdBackPreview
                          ? <img src={cccdBackPreview} className="w-full h-full object-cover" alt="back" />
                          : (
                            <div className="flex flex-col items-center justify-center h-full gap-2 text-on-surface-variant group-hover:text-primary transition-colors">
                              <Upload className="w-8 h-8" />
                              <span className="text-xs font-bold">Nhấn để chọn ảnh</span>
                            </div>
                          )}
                        {cccdBackPreview && (
                          <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1">
                            <CheckCircle className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                      <input ref={backRef} type="file" accept="image/*" className="hidden"
                        onChange={e => handleFileChange(e, setCccdBack, setCccdBackPreview)} />
                    </div>

                    <p className="text-[11px] text-on-surface-variant bg-surface-container-low rounded-xl p-3">
                      🔒 Ảnh CCCD chỉ dùng để xác minh danh tính và được bảo mật an toàn. Có thể bỏ qua nếu chưa có.
                    </p>

                    <button type="submit" disabled={loading}
                      className="w-full bg-primary text-on-primary py-4 rounded-[24px] font-bold text-base shadow-xl shadow-primary/20 flex items-center justify-center gap-3 hover:-translate-y-0.5 active:scale-95 transition-all disabled:opacity-50">
                      {loading ? 'Đang tạo tài khoản...' : 'Hoàn tất đăng ký'}
                      <ArrowRight className="w-5 h-5" />
                    </button>

                    <button type="button" onClick={() => { setRegStep(1); setError(''); }}
                      className="w-full text-xs font-bold text-on-surface-variant flex items-center justify-center gap-2 hover:text-primary transition-colors">
                      <ArrowLeft className="w-4 h-4" /> Quay lại
                    </button>
                  </form>
                </motion.div>

              ) : (
                /* ── Login / Bước 1 Đăng ký ── */
                <motion.div key={isLogin ? 'login' : 'reg-1'} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                  className="h-full flex flex-col">

                  <div className="mb-8 flex items-center justify-between">
                    <div>
                      <h2 className="text-4xl font-black text-on-surface tracking-tighter mb-1">
                        {isLogin ? 'Đăng nhập' : 'Đăng ký'}
                      </h2>
                      <p className="text-on-surface-variant font-medium text-sm">
                        {isLogin ? 'Dành cho thành viên PAW Home' : 'Bước 1/2 — Thông tin cơ bản'}
                      </p>
                    </div>
                    {isLogin && (
                      <Link to="/register" className="text-xs font-black text-primary bg-primary/10 px-4 py-2 rounded-xl hover:bg-primary/20 transition-all">
                        Đăng ký
                      </Link>
                    )}
                  </div>

                  {error && (
                    <div className="mb-5 p-4 bg-red-50 text-red-700 rounded-2xl text-sm font-semibold">{error}</div>
                  )}

                  <form onSubmit={handleAuth} className="space-y-4">
                    {!isLogin && (
                      <>
                        <div className="space-y-1">
                          <label className={labelCls}>Họ và tên</label>
                          <div className="relative">
                            <input type="text" required className={inputCls} placeholder="Nguyễn Minh Tuấn"
                              value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <label className={labelCls}>Số điện thoại</label>
                          <div className="relative">
                            <input type="tel" required className={inputCls} placeholder="09xx xxx xxx"
                              value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                            <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
                          </div>
                        </div>
                      </>
                    )}

                    <div className="space-y-1">
                      <label className={labelCls}>Email</label>
                      <div className="relative">
                        <input type="email" required className={inputCls} placeholder="email@example.com"
                          value={form.email} onChange={e => { setForm({ ...form, email: e.target.value }); setError(''); setEmailTaken(false); }} />
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between ml-2 mr-1">
                        <label className={labelCls}>Mật khẩu</label>
                        {isLogin && (
                          <Link to="/forgot-password" className="text-[10px] font-bold text-primary hover:underline">
                            Quên mật khẩu?
                          </Link>
                        )}
                      </div>
                      <div className="relative">
                        <input type={showPassword ? 'text' : 'password'} required minLength={6}
                          className={inputCls} placeholder={isLogin ? '••••••••' : 'Tối thiểu 6 ký tự'}
                          value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
                        <button type="button" onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant">
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="pt-3">
                      <button type="submit" disabled={loading}
                        className="w-full bg-primary text-on-primary py-4 rounded-[24px] font-bold text-base shadow-xl shadow-primary/20 flex items-center justify-center gap-3 hover:-translate-y-0.5 active:scale-95 transition-all disabled:opacity-50">
                        {loading ? 'Đang xử lý...' : (isLogin ? 'Đăng nhập' : 'Tiếp tục')}
                        <ArrowRight className="w-5 h-5" />
                      </button>
                    </div>
                  </form>

                  <div className="mt-auto pt-8 flex items-center gap-4">
                    <div className="h-px bg-outline-variant flex-1" />
                    <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em]">
                      {isLogin ? 'Chưa có tài khoản?' : 'Đã có tài khoản?'}
                      <button onClick={() => { setIsLogin(!isLogin); setRegStep(1); setError(''); }}
                        className="ml-2 text-primary hover:underline">
                        {isLogin ? 'Đăng ký ngay' : 'Đăng nhập'}
                      </button>
                    </p>
                    <div className="h-px bg-outline-variant flex-1" />
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};
