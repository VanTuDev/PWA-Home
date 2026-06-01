import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  PawPrint,
  Mail,
  Lock,
  User,
  ArrowRight,
  CheckCircle,
  Phone,
  ArrowLeft,
  Eye,
  EyeOff,
  RefreshCw
} from 'lucide-react';

const DANANG_DISTRICTS = [
  'Hải Châu', 'Thanh Khê', 'Sơn Trà',
  'Ngũ Hành Sơn', 'Liên Chiểu', 'Cẩm Lệ', 'Hòa Vang'
];

export const Auth: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [isLogin, setIsLogin] = useState(location.pathname === '/login');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [emailTaken, setEmailTaken] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [otp, setOtp] = useState('');
  const [regStep, setRegStep] = useState(1); // 1: thông tin, 2: email, 3: OTP

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    district: DANANG_DISTRICTS[0]
  });

  useEffect(() => {
    setIsLogin(location.pathname === '/login');
    setRegStep(1);
    setError('');
    setSuccessMsg('');
    setOtp('');
  }, [location.pathname]);

  // ── Đăng nhập ─────────────────────────────────────────────────────────────
  const handleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, password: formData.password })
      });
      const data = await res.json();

      if (!res.ok) {
        // Fallback localStorage cho admin/staff chưa connect BE
        if (res.status >= 500 || res.status === 0) throw new Error(data.message);
        setError(data.message);
        return;
      }

      login(data.user, data.token);
      navigate(data.user.role === 'admin' || data.user.role === 'manager' || data.user.role === 'staff'
        ? '/admin'
        : '/');
    } catch (err: any) {
      // Fallback sang localStorage nếu server không kết nối được
      const users = JSON.parse(localStorage.getItem('paw_users') || '[]');
      const localUser = users.find(
        (u: any) => u.email === formData.email && u.password === formData.password
      );
      if (localUser) {
        login(localUser);
        navigate(localUser.role === 'admin' ? '/admin' : '/');
      } else {
        setError('Không thể kết nối máy chủ. Vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Gửi OTP (bước 2 đăng ký) ───────────────────────────────────────────────
  const handleSendOtp = async () => {
    setLoading(true);
    setError('');
    setEmailTaken(false);
    setSuccessMsg('');
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone
        })
      });
      const data = await res.json();

      if (!res.ok) {
        if (res.status === 400 && data.message?.includes('đã được sử dụng')) {
          setEmailTaken(true);
        } else {
          setError(data.message);
        }
        return;
      }

      setRegStep(3);

      if (data.demoOtp) {
        // Demo mode: hiển thị OTP trực tiếp
        setSuccessMsg(`Demo mode — mã OTP của bạn là: ${data.demoOtp}`);
      } else {
        setSuccessMsg(`Mã xác thực đã gửi tới ${formData.email}`);
      }
    } catch {
      setError('Không thể kết nối máy chủ. Vui lòng kiểm tra backend đang chạy.');
    } finally {
      setLoading(false);
    }
  };

  // ── Gửi lại OTP ────────────────────────────────────────────────────────────
  const handleResendOtp = async () => {
    setResending(true);
    setError('');
    setSuccessMsg('');
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone
        })
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message);
        return;
      }

      if (data.demoOtp) {
        setSuccessMsg(`Mã OTP mới: ${data.demoOtp}`);
      } else {
        setSuccessMsg('Mã OTP mới đã được gửi tới email của bạn.');
      }
    } catch {
      setError('Không thể gửi lại mã. Vui lòng thử lại.');
    } finally {
      setResending(false);
    }
  };

  // ── Xác nhận OTP ───────────────────────────────────────────────────────────
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, otp })
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message);
        return;
      }

      // Xác thực thành công → tự động đăng nhập
      login(data.user, data.token);
      navigate('/');
    } catch {
      setError('Không thể kết nối máy chủ. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  // ── Submit form tổng hợp ───────────────────────────────────────────────────
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      await handleLogin();
    } else if (regStep === 1) {
      setRegStep(2);
    } else if (regStep === 2) {
      await handleSendOtp();
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-surface">
      {/* Back Button */}
      <button
        onClick={() => navigate('/')}
        className="absolute top-6 left-6 z-50 p-3 bg-white/50 lg:bg-white/20 backdrop-blur-md rounded-full text-primary lg:text-white hover:bg-white hover:text-primary transition-all shadow-lg"
      >
        <ArrowLeft className="w-6 h-6" />
      </button>

      {/* Background */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1559592442-7e18ad73d63b?auto=format&fit=crop&q=80&w=2000"
          className="w-full h-full object-cover scale-110 blur-[4px] opacity-40"
          alt="Background"
        />
        <div className="absolute inset-0 bg-auth-overlay"></div>
      </div>

      <div className="relative z-10 w-full max-w-5xl lg:h-[85vh] flex items-stretch px-4 md:px-8 lg:px-0 py-8 lg:py-0">
        <div className="w-full flex flex-col lg:flex-row auth-glass rounded-[32px] lg:rounded-[48px] overflow-hidden shadow-2xl min-h-[600px]">

          {/* Left: Branding */}
          <div className="hidden lg:flex w-5/12 bg-primary relative items-center justify-center p-16 text-on-primary overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-10">
              <div className="absolute top-[-10%] left-[-10%] w-64 h-64 border-4 border-white rounded-full"></div>
              <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 border-[40px] border-white rounded-full"></div>
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

          {/* Right: Forms */}
          <div className="flex-1 bg-white/60 backdrop-blur-sm p-8 md:p-16 overflow-y-auto custom-scrollbar">
            <AnimatePresence mode="wait">

              {/* ── Bước 3: Nhập OTP ── */}
              {!isLogin && regStep === 3 ? (
                <motion.div
                  key="otp"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="h-full flex flex-col justify-center"
                >
                  <div className="mb-8">
                    <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                      <CheckCircle className="w-7 h-7 text-primary" />
                    </div>
                    <h2 className="text-3xl font-black text-on-surface mb-2">Xác nhận OTP</h2>
                    <p className="text-on-surface-variant font-medium text-sm">
                      Mã 6 chữ số đã được gửi tới <strong>{formData.email}</strong>
                    </p>
                  </div>

                  {/* Demo / Success Message */}
                  {successMsg && (
                    <div className="mb-5 p-4 bg-green-50 border border-green-200 text-green-800 rounded-2xl text-sm font-semibold">
                      ✅ {successMsg}
                    </div>
                  )}

                  {error && (
                    <div className="mb-5 p-4 bg-error-container text-on-error-container rounded-2xl text-xs font-bold">
                      {error}
                    </div>
                  )}

                  <form onSubmit={handleVerifyOtp} className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-on-surface ml-2">Nhập mã OTP</label>
                      <input
                        type="text"
                        required
                        maxLength={6}
                        inputMode="numeric"
                        pattern="[0-9]{6}"
                        className="w-full bg-white border border-outline-variant rounded-3xl px-6 py-5 text-center text-3xl font-black tracking-[1em] focus:ring-4 focus:ring-primary/10 outline-none transition-all shadow-sm"
                        placeholder="000000"
                        value={otp}
                        onChange={e => { setOtp(e.target.value.replace(/\D/g, '')); setError(''); }}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading || otp.length < 6}
                      className="w-full bg-primary text-on-primary py-5 rounded-[24px] font-bold text-lg shadow-xl shadow-primary/20 flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50"
                    >
                      {loading ? 'Đang xác thực...' : 'Hoàn tất Đăng ký'}
                      <ArrowRight className="w-6 h-6" />
                    </button>

                    <button
                      type="button"
                      disabled={resending}
                      onClick={handleResendOtp}
                      className="w-full text-sm font-bold text-on-surface-variant hover:text-primary flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                    >
                      <RefreshCw className={`w-4 h-4 ${resending ? 'animate-spin' : ''}`} />
                      {resending ? 'Đang gửi lại...' : 'Gửi lại mã'}
                    </button>
                  </form>
                </motion.div>

              ) : (
                /* ── Login / Bước 1 & 2 Đăng ký ── */
                <motion.div
                  key={isLogin ? 'login' : `reg-step-${regStep}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="h-full flex flex-col"
                >
                  <div className="mb-10 flex items-center justify-between">
                    <div>
                      <h2 className="text-4xl font-black text-on-surface tracking-tighter mb-1">
                        {isLogin ? 'Đăng nhập' : (regStep === 1 ? 'Đăng ký' : 'Xác thực Email')}
                      </h2>
                      <p className="text-on-surface-variant font-medium">
                        {isLogin ? 'Dành cho thành viên PAW Home' : `Bước ${regStep} trên 2`}
                      </p>
                    </div>
                    {isLogin && (
                      <Link to="/register" className="text-xs font-black text-primary bg-primary-fixed px-4 py-2 rounded-xl hover:bg-primary-container transition-all">
                        Đăng ký
                      </Link>
                    )}
                  </div>

                  {emailTaken && (
                    <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
                      <p className="text-sm font-black text-amber-800 mb-1">Email này đã có tài khoản!</p>
                      <p className="text-xs text-amber-700 mb-3">Bạn đã đăng ký với email <strong>{formData.email}</strong>. Hãy đăng nhập thay vì tạo tài khoản mới.</p>
                      <button
                        type="button"
                        onClick={() => { setEmailTaken(false); setIsLogin(true); setRegStep(1); setError(''); }}
                        className="w-full bg-amber-600 text-white py-2.5 rounded-xl text-sm font-bold hover:bg-amber-700 transition-colors"
                      >
                        Chuyển sang Đăng nhập
                      </button>
                    </div>
                  )}

                  {error && (
                    <div className="mb-6 p-4 bg-error-container text-on-error-container rounded-2xl text-xs font-bold">
                      {error}
                    </div>
                  )}

                  <form onSubmit={handleAuth} className="space-y-5">
                    {isLogin ? (
                      <>
                        <div className="space-y-1">
                          <label className="text-xs font-black text-on-surface-variant ml-2 uppercase tracking-wider">Email</label>
                          <div className="relative">
                            <input
                              type="email" required
                              className="w-full bg-white border border-outline-variant rounded-2xl px-10 py-4 focus:ring-4 focus:ring-primary/10 outline-none transition-all text-sm font-bold"
                              placeholder="email@example.com"
                              value={formData.email}
                              onChange={e => setFormData({ ...formData, email: e.target.value })}
                            />
                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between ml-2 mr-1">
                            <label className="text-xs font-black text-on-surface-variant uppercase tracking-wider">Mật khẩu</label>
                            <Link to="/forgot-password" className="text-[10px] font-bold text-primary hover:underline">
                              Quên mật khẩu?
                            </Link>
                          </div>
                          <div className="relative">
                            <input
                              type={showPassword ? 'text' : 'password'} required
                              className="w-full bg-white border border-outline-variant rounded-2xl px-10 py-4 focus:ring-4 focus:ring-primary/10 outline-none transition-all text-sm font-bold"
                              placeholder="••••••••"
                              value={formData.password}
                              onChange={e => setFormData({ ...formData, password: e.target.value })}
                            />
                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant">
                              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                      </>
                    ) : regStep === 1 ? (
                      <>
                        <div className="space-y-1">
                          <label className="text-xs font-black text-on-surface-variant ml-2 uppercase tracking-wider">Họ và tên</label>
                          <div className="relative">
                            <input
                              type="text" required
                              className="w-full bg-white border border-outline-variant rounded-2xl px-10 py-4 focus:ring-4 focus:ring-primary/10 outline-none transition-all text-sm font-bold"
                              placeholder="Nguyễn Văn A"
                              value={formData.name}
                              onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-black text-on-surface-variant ml-2 uppercase tracking-wider">Số điện thoại</label>
                          <div className="relative">
                            <input
                              type="tel" required
                              className="w-full bg-white border border-outline-variant rounded-2xl px-10 py-4 focus:ring-4 focus:ring-primary/10 outline-none transition-all text-sm font-bold"
                              placeholder="09xx xxx xxx"
                              value={formData.phone}
                              onChange={e => setFormData({ ...formData, phone: e.target.value })}
                            />
                            <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-black text-on-surface-variant ml-2 uppercase tracking-wider">Mật khẩu</label>
                          <div className="relative">
                            <input
                              type={showPassword ? 'text' : 'password'} required minLength={6}
                              className="w-full bg-white border border-outline-variant rounded-2xl px-10 py-4 focus:ring-4 focus:ring-primary/10 outline-none transition-all text-sm font-bold"
                              placeholder="Tối thiểu 6 ký tự"
                              value={formData.password}
                              onChange={e => setFormData({ ...formData, password: e.target.value })}
                            />
                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant">
                              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="space-y-1">
                        <label className="text-xs font-black text-on-surface-variant ml-2 uppercase tracking-wider">Email nhận mã OTP</label>
                        <div className="relative">
                          <input
                            type="email" required
                            className="w-full bg-white border border-outline-variant rounded-2xl px-10 py-4 focus:ring-4 focus:ring-primary/10 outline-none transition-all text-sm font-bold"
                            placeholder="name@email.com"
                            value={formData.email}
                            onChange={e => { setFormData({ ...formData, email: e.target.value }); setEmailTaken(false); setError(''); }}
                          />
                          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
                        </div>
                        <p className="text-xs text-on-surface-variant ml-2 mt-1">
                          Mã OTP 6 chữ số sẽ được gửi tới địa chỉ này
                        </p>
                      </div>
                    )}

                    <div className="pt-4">
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary text-on-primary py-5 rounded-[24px] font-bold text-lg shadow-xl shadow-primary/20 flex items-center justify-center gap-3 hover:translate-y-[-2px] active:scale-95 transition-all disabled:opacity-50"
                      >
                        {loading ? 'Đang xử lý...' : (
                          isLogin ? 'Đăng nhập' :
                          regStep === 1 ? 'Tiếp tục' :
                          'Gửi mã xác nhận'
                        )}
                        <ArrowRight className="w-6 h-6" />
                      </button>
                    </div>

                    {!isLogin && regStep > 1 && (
                      <button
                        type="button"
                        onClick={() => { setRegStep(regStep - 1); setError(''); }}
                        className="w-full text-xs font-bold text-on-surface-variant flex items-center justify-center gap-2 hover:text-primary transition-colors"
                      >
                        <ArrowLeft className="w-4 h-4" /> Quay lại
                      </button>
                    )}
                  </form>

                  <div className="mt-auto pt-8 flex items-center gap-4">
                    <div className="h-px bg-outline-variant flex-1"></div>
                    <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em]">
                      {isLogin ? 'Chưa có tài khoản?' : 'Đã có tài khoản?'}
                      <button
                        onClick={() => { setIsLogin(!isLogin); setRegStep(1); setError(''); setSuccessMsg(''); }}
                        className="ml-2 text-primary hover:underline"
                      >
                        {isLogin ? 'Đăng ký ngay' : 'Đăng nhập'}
                      </button>
                    </p>
                    <div className="h-px bg-outline-variant flex-1"></div>
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
