import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  PawPrint, 
  Mail, 
  Lock, 
  User, 
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  Phone,
  ArrowLeft
} from 'lucide-react';

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: ''
  });
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      if (response.ok) {
        setIsOtpSent(true);
        // Show OTP in alert for demo purposes
        alert(`Mã OTP của bạn là: ${data.demoOtp}`);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Đã có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, otp }),
      });
      
      const data = await response.json();
      if (response.ok) {
        alert('Đăng ký thành công!');
        navigate('/login');
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Lỗi xác thực OTP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-stretch bg-white">
      {/* Left Decoration */}
      <div className="hidden lg:flex w-1/2 bg-primary relative items-center justify-center overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-20 w-80 h-80 border-4 border-on-primary rounded-full"></div>
          <div className="absolute bottom-20 right-20 w-64 h-64 border-4 border-on-primary rounded-full"></div>
        </div>
        
        <div className="relative z-10 text-center px-12">
          <Link to="/" className="inline-flex items-center gap-4 bg-on-primary p-3 rounded-[24px] mb-12 shadow-2xl rotate-3">
            <PawPrint className="text-primary w-12 h-12" />
            <span className="text-3xl font-black text-primary tracking-tighter pr-4">PAW Home</span>
          </Link>
          <h1 className="text-5xl font-bold text-on-primary mb-8 leading-tight tracking-tighter">Bắt đầu cứu hộ hôm nay</h1>
          <p className="text-lg text-on-primary/80 max-w-sm mx-auto leading-relaxed">Gia nhập cộng đồng yêu thú cưng lớn nhất Việt Nam và tìm kiến hạnh phúc mới.</p>
        </div>
      </div>

      {/* Right Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-20 bg-surface-container-lowest">
        <div className="w-full max-w-md">
          <div className="mb-12">
            <h2 className="text-4xl font-bold text-on-surface mb-2">
              {isOtpSent ? 'Xác nhận OTP' : 'Đăng ký'}
            </h2>
            <p className="text-on-surface-variant font-medium">
              {isOtpSent ? `Mã OTP đã được gửi tới ${formData.email}` : 'Chỉ mất 2 phút để tạo tài khoản mới'}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-error-container text-on-error-container rounded-2xl text-sm font-bold">
              {error}
            </div>
          )}

          {!isOtpSent ? (
            <form onSubmit={handleRegister} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-on-surface ml-2">Họ và tên</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      required
                      className="w-full bg-surface border border-outline-variant rounded-2xl px-12 py-4 focus:ring-2 focus:ring-primary outline-none transition-all" 
                      placeholder="Nguyễn Văn A" 
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                    />
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-on-surface ml-2">Số điện thoại</label>
                  <div className="relative">
                    <input 
                      type="tel" 
                      required
                      className="w-full bg-surface border border-outline-variant rounded-2xl px-12 py-4 focus:ring-2 focus:ring-primary outline-none transition-all" 
                      placeholder="098xxxxxxxx" 
                      value={formData.phone}
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                    />
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-on-surface ml-2">Email</label>
                  <div className="relative">
                    <input 
                      type="email" 
                      required
                      className="w-full bg-surface border border-outline-variant rounded-2xl px-12 py-4 focus:ring-2 focus:ring-primary outline-none transition-all" 
                      placeholder="name@email.com" 
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                    />
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-on-surface ml-2">Mật khẩu</label>
                  <div className="relative">
                    <input 
                      type="password"
                      required
                      className="w-full bg-surface border border-outline-variant rounded-2xl px-12 py-4 focus:ring-2 focus:ring-primary outline-none transition-all" 
                      placeholder="••••••••" 
                      value={formData.password}
                      onChange={e => setFormData({...formData, password: e.target.value})}
                    />
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-surface-container-low rounded-2xl">
                  <div className="mt-1">
                    <ShieldCheck className="w-5 h-5 text-primary" />
                  </div>
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    Bằng cách nhấn Đăng ký, bạn đồng ý với các <span className="font-bold text-primary cursor-pointer hover:underline">Điều khoản dịch vụ</span>.
                  </p>
                </div>

                <button 
                  disabled={loading}
                  className="w-full bg-primary text-on-primary py-5 rounded-[24px] font-bold text-lg shadow-xl shadow-primary/30 flex items-center justify-center gap-3 hover:translate-y-[-2px] transition-all disabled:opacity-50"
                >
                  {loading ? 'Đang xử lý...' : 'Tạo tài khoản'}
                  <CheckCircle className="w-6 h-6" />
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-on-surface ml-2">Mã OTP (6 chữ số)</label>
                  <input 
                    type="text" 
                    required
                    maxLength={6}
                    className="w-full bg-surface border border-outline-variant rounded-2xl px-6 py-4 text-center text-2xl font-bold tracking-[1em] focus:ring-2 focus:ring-primary outline-none transition-all" 
                    placeholder="000000" 
                    value={otp}
                    onChange={e => setOtp(e.target.value)}
                  />
                </div>
                
                <button 
                  disabled={loading}
                  className="w-full bg-primary text-on-primary py-5 rounded-[24px] font-bold text-lg shadow-xl shadow-primary/30 flex items-center justify-center gap-3 transition-all disabled:opacity-50"
                >
                  {loading ? 'Đang xác nhận...' : 'Xác nhận OTP'}
                  <ArrowRight className="w-6 h-6" />
                </button>

                <button 
                  type="button"
                  onClick={() => setIsOtpSent(false)}
                  className="w-full flex items-center justify-center gap-2 text-sm font-bold text-on-surface-variant hover:text-primary transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Quay lại đăng ký
                </button>
              </div>
            </form>
          )}

          <div className="text-center mt-8">
            <p className="text-sm text-on-surface-variant">
              Bạn đã có tài khoản? <Link to="/login" className="font-bold text-primary hover:underline">Đăng nhập ngay</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
