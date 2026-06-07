import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PawPrint, Mail, Lock, User, ArrowRight, ShieldCheck, CheckCircle, Phone, ArrowLeft, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Register: React.FC = () => {
  const navigate  = useNavigate();
  const { login: authLogin } = useAuth();

  const [step, setStep]       = useState<'form' | 'otp'>('form');
  const [form, setForm]       = useState({ name: '', email: '', password: '', phone: '' });
  const [otp, setOtp]         = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');
  const [countdown, setCountdown] = useState(0);
  const otpRef = useRef<HTMLInputElement>(null);

  // Countdown để resend OTP
  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  useEffect(() => {
    if (step === 'otp') setTimeout(() => otpRef.current?.focus(), 100);
  }, [step]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res  = await fetch('/api/auth/register', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        // Email đã được đăng ký
        if (data.code === 'EMAIL_ALREADY_REGISTERED') {
          setError('');
          // Hiển thị thông báo riêng với link đến login
          setError('__EMAIL_REGISTERED__');
        } else {
          setError(data.message || 'Đã có lỗi xảy ra.');
        }
        return;
      }

      // Demo mode: hiển thị OTP trực tiếp thay vì alert
      if (data.demoOtp) {
        setSuccess(`[Demo] Mã OTP của bạn: ${data.demoOtp}`);
      } else {
        setSuccess('');
      }
      setCountdown(60);
      setStep('otp');
    } catch {
      setError('Không thể kết nối đến server. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0 || resending) return;
    setResending(true);
    setError('');
    setSuccess('');
    try {
      const res  = await fetch('/api/auth/register', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setCountdown(60);
        if (data.demoOtp) {
          setSuccess(`[Demo] Mã OTP mới: ${data.demoOtp}`);
        } else {
          setSuccess('Đã gửi lại mã OTP. Kiểm tra hộp thư (kể cả Spam).');
        }
      } else {
        setError(data.message || 'Không thể gửi lại mã.');
      }
    } catch {
      setError('Lỗi kết nối.');
    } finally {
      setResending(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res  = await fetch('/api/auth/verify-otp', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email: form.email, otp }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Mã OTP không chính xác.');
        return;
      }

      // Auto-login sau khi verify
      if (data.token && data.user) {
        authLogin(data.user, data.token);
        navigate('/');
      } else {
        navigate('/login');
      }
    } catch {
      setError('Lỗi xác thực OTP. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full bg-surface border border-outline-variant rounded-2xl px-12 py-4 focus:ring-2 focus:ring-primary outline-none transition-all text-sm";

  return (
    <div className="min-h-screen flex items-stretch bg-white">
      {/* Left Decoration */}
      <div className="hidden lg:flex w-1/2 bg-primary relative items-center justify-center overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-20 w-80 h-80 border-4 border-on-primary rounded-full" />
          <div className="absolute bottom-20 right-20 w-64 h-64 border-4 border-on-primary rounded-full" />
        </div>
        <div className="relative z-10 text-center px-12">
          <Link to="/" className="inline-flex items-center gap-4 bg-on-primary p-3 rounded-[24px] mb-12 shadow-2xl rotate-3">
            <PawPrint className="text-primary w-12 h-12" />
            <span className="text-3xl font-black text-primary tracking-tighter pr-4">PAW Home</span>
          </Link>
          <h1 className="text-5xl font-bold text-on-primary mb-8 leading-tight tracking-tighter">Bắt đầu cứu hộ hôm nay</h1>
          <p className="text-lg text-on-primary/80 max-w-sm mx-auto leading-relaxed">Gia nhập cộng đồng yêu thú cưng lớn nhất Việt Nam và tìm kiếm hạnh phúc mới.</p>
        </div>
      </div>

      {/* Right Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-20 bg-surface-container-lowest">
        <div className="w-full max-w-md">
          <div className="mb-10">
            <h2 className="text-4xl font-bold text-on-surface mb-2">
              {step === 'otp' ? 'Nhập mã OTP' : 'Đăng ký'}
            </h2>
            <p className="text-on-surface-variant font-medium text-sm">
              {step === 'otp'
                ? `Mã xác thực đã gửi tới ${form.email}`
                : 'Chỉ mất 2 phút để tạo tài khoản mới'}
            </p>
          </div>

          {/* Error */}
          {error && error !== '__EMAIL_REGISTERED__' && (
            <div className="mb-5 p-4 bg-red-50 text-red-700 rounded-2xl text-sm font-semibold border border-red-100">
              {error}
            </div>
          )}

          {/* Email đã đăng ký — special state */}
          {error === '__EMAIL_REGISTERED__' && (
            <div className="mb-5 p-4 bg-amber-50 border border-amber-200 rounded-2xl text-sm">
              <p className="font-bold text-amber-800 mb-1">Email này đã được đăng ký</p>
              <p className="text-amber-700">
                Bạn có thể{' '}
                <Link to="/login" className="font-black text-primary underline">đăng nhập ngay</Link>{' '}
                hoặc{' '}
                <Link to="/forgot-password" className="font-black text-primary underline">lấy lại mật khẩu</Link>.
              </p>
            </div>
          )}

          {/* Success / demo OTP */}
          {success && (
            <div className="mb-5 p-4 bg-green-50 text-green-700 rounded-2xl text-sm font-semibold border border-green-100">
              {success}
            </div>
          )}

          {step === 'form' ? (
            <form onSubmit={handleRegister} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-bold text-on-surface ml-1">Họ và tên</label>
                <div className="relative">
                  <input type="text" required className={inputCls} placeholder="Nguyễn Văn A"
                    value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-on-surface ml-1">Số điện thoại</label>
                <div className="relative">
                  <input type="tel" required className={inputCls} placeholder="098xxxxxxxx"
                    value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-on-surface ml-1">Email</label>
                <div className="relative">
                  <input type="email" required className={inputCls} placeholder="name@email.com"
                    value={form.email} onChange={e => { setForm({ ...form, email: e.target.value }); setError(''); }} />
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-on-surface ml-1">Mật khẩu</label>
                <div className="relative">
                  <input type="password" required minLength={6} className={inputCls} placeholder="Tối thiểu 6 ký tự"
                    value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-surface-container-low rounded-2xl">
                <ShieldCheck className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Bằng cách nhấn Đăng ký, bạn đồng ý với{' '}
                  <span className="font-bold text-primary cursor-pointer hover:underline">Điều khoản dịch vụ</span> của PAW Home.
                </p>
              </div>

              <button disabled={loading}
                className="w-full bg-primary text-on-primary py-4 rounded-[24px] font-bold text-base shadow-xl shadow-primary/30 flex items-center justify-center gap-3 hover:-translate-y-0.5 transition-all disabled:opacity-50">
                {loading ? 'Đang gửi mã OTP...' : 'Tạo tài khoản'}
                <CheckCircle className="w-5 h-5" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              {/* OTP info */}
              <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl text-sm text-blue-700">
                Kiểm tra hộp thư <strong>{form.email}</strong> (kể cả thư mục <strong>Spam / Junk</strong>).
                Email có thể mất 1–2 phút.
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-on-surface ml-1">Mã xác thực (6 chữ số)</label>
                <input ref={otpRef} type="text" inputMode="numeric" pattern="[0-9]*" required maxLength={6}
                  className="w-full bg-surface border border-outline-variant rounded-2xl px-6 py-5 text-center text-3xl font-black tracking-[0.6em] focus:ring-2 focus:ring-primary outline-none transition-all"
                  placeholder="——————"
                  value={otp} onChange={e => { setOtp(e.target.value.replace(/\D/g, '')); setError(''); }} />
              </div>

              <button disabled={loading || otp.length !== 6}
                className="w-full bg-primary text-on-primary py-4 rounded-[24px] font-bold text-base shadow-xl shadow-primary/30 flex items-center justify-center gap-3 transition-all disabled:opacity-50">
                {loading ? 'Đang xác nhận...' : 'Xác nhận OTP'}
                <ArrowRight className="w-5 h-5" />
              </button>

              {/* Resend */}
              <button type="button" onClick={handleResend}
                disabled={countdown > 0 || resending}
                className="w-full flex items-center justify-center gap-2 text-sm font-bold text-on-surface-variant hover:text-primary transition-colors disabled:opacity-40">
                <RefreshCw className={`w-4 h-4 ${resending ? 'animate-spin' : ''}`} />
                {countdown > 0 ? `Gửi lại sau ${countdown}s` : resending ? 'Đang gửi...' : 'Gửi lại mã OTP'}
              </button>

              <button type="button" onClick={() => { setStep('form'); setError(''); setSuccess(''); setOtp(''); }}
                className="w-full flex items-center justify-center gap-2 text-sm font-bold text-on-surface-variant hover:text-primary transition-colors">
                <ArrowLeft className="w-4 h-4" /> Sửa thông tin đăng ký
              </button>
            </form>
          )}

          <p className="text-center mt-8 text-sm text-on-surface-variant">
            Đã có tài khoản?{' '}
            <Link to="/login" className="font-bold text-primary hover:underline">Đăng nhập ngay</Link>
          </p>
        </div>
      </div>
    </div>
  );
};
