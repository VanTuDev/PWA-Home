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
  ShieldCheck,
  CheckCircle,
  Phone,
  ArrowLeft,
  MapPin,
  Eye,
  EyeOff
} from 'lucide-react';

const DANANG_DISTRICTS = [
  'Hải Châu',
  'Thanh Khê',
  'Sơn Trà',
  'Ngũ Hành Sơn',
  'Liên Chiểu',
  'Cẩm Lệ',
  'Hòa Vang'
];

export const Auth: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [isLogin, setIsLogin] = useState(location.pathname === '/login');
  const [showPassword, setShowPassword] = useState(false);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [otp, setOtp] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    district: DANANG_DISTRICTS[0]
  });

  useEffect(() => {
    setIsLogin(location.pathname === '/login');
    setIsOtpSent(false);
    setError('');
  }, [location.pathname]);

  const [regStep, setRegStep] = useState(1); // 1: Basic, 2: Email, 3: OTP

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    setTimeout(() => {
      if (isLogin) {
        const users = JSON.parse(localStorage.getItem('paw_users') || '[]');
        const user = users.find(u => u.email === formData.email && u.password === formData.password);
        
        if (user) {
          login(user);
          alert('Đăng nhập thành công!');
          navigate(user.role === 'admin' ? '/admin' : '/');
        } else {
          setError('Email hoặc mật khẩu không chính xác (admin@pawhome.vn / admin123)');
        }
        setLoading(false);
      } else {
        // Registration steps
        if (regStep === 1) {
          setRegStep(2);
        } else if (regStep === 2) {
          setIsOtpSent(true);
          setRegStep(3);
          console.log("Mock OTP sent to:", formData.email, "Code: 123456");
        }
        setLoading(false);
      }
    }, 600);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    setTimeout(() => {
      if (otp === '123456') {
        const users = JSON.parse(localStorage.getItem('paw_users') || '[]');
        const newUser = {
          id: Date.now().toString(),
          ...formData,
          role: 'user',
          createdAt: new Date().toISOString()
        };
        
        users.push(newUser);
        localStorage.setItem('paw_users', JSON.stringify(users));
        login(newUser);
        
        alert('Đăng ký thành công! Chào mừng bạn gia nhập PAW Home.');
        navigate('/');
      } else {
        setError('Mã OTP không chính xác. Hãy thử: 123456');
      }
      setLoading(false);
    }, 800);
  };

  // Note: Default admin initialization is now handled centrally in AuthContext

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-surface">
      {/* Mobile Back Button */}
      <button 
        onClick={() => navigate('/')} 
        className="absolute top-6 left-6 z-50 p-3 bg-white/50 lg:bg-white/20 backdrop-blur-md rounded-full text-primary lg:text-white hover:bg-white hover:text-primary transition-all shadow-lg"
      >
        <ArrowLeft className="w-6 h-6" />
      </button>

      {/* Hidden Image Background */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1559592442-7e18ad73d63b?auto=format&fit=crop&q=80&w=2000" 
          className="w-full h-full object-cover scale-110 blur-[4px] opacity-40"
          alt="Da Nang Background"
        />
        <div className="absolute inset-0 bg-auth-overlay"></div>
      </div>

      <div className="relative z-10 w-full max-w-5xl lg:h-[85vh] flex items-stretch px-4 md:px-8 lg:px-0 py-8 lg:py-0">
        <div className="w-full flex flex-col lg:flex-row auth-glass rounded-[32px] lg:rounded-[48px] overflow-hidden shadow-2xl min-h-[600px]">
          
          {/* Left Side: Branding (Hidden on mobile, shown on large screens) */}
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
                {isLogin ? "Chào mừng trở lại!" : "Hành trình mới bắt đầu"}
              </h1>
              <p className="text-on-primary/70 font-medium leading-relaxed">
                {isLogin 
                  ? "Tiếp tục sứ mệnh cứu hộ và tìm kiếm tổ ấm cho những người bạn nhỏ tại Đà Nẵng." 
                  : "Chỉ vài bước đơn giản để trở thành một phần của cộng đồng cứu hộ thú cưng lớn nhất."}
              </p>
            </div>
          </div>

          {/* Right Side: Forms */}
          <div className="flex-1 bg-white/60 backdrop-blur-sm p-8 md:p-16 overflow-y-auto custom-scrollbar">
            <AnimatePresence mode="wait">
              {regStep === 3 ? (
                <motion.div
                  key="otp"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="h-full flex flex-col justify-center"
                >
                  <div className="mb-10">
                    <h2 className="text-3xl font-black text-on-surface mb-2">Xác nhận OTP</h2>
                    <p className="text-on-surface-variant font-medium">Mã 6 chữ số đã được gửi tới {formData.email}</p>
                  </div>
                  <form onSubmit={handleVerifyOtp} className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-on-surface ml-2">Nhập mã OTP</label>
                      <input 
                        type="text" 
                        required
                        maxLength={6}
                        className="w-full bg-white border border-outline-variant rounded-3xl px-6 py-5 text-center text-3xl font-black tracking-[1em] focus:ring-4 focus:ring-primary/10 outline-none transition-all shadow-sm" 
                        placeholder="000000" 
                        value={otp}
                        onChange={e => setOtp(e.target.value)}
                      />
                    </div>
                    <button 
                      disabled={loading}
                      className="w-full bg-primary text-on-primary py-5 rounded-[24px] font-bold text-lg shadow-xl shadow-primary/20 flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50"
                    >
                      {loading ? 'Đang xác thực...' : 'Hoàn tất Đăng ký'}
                      <ArrowRight className="w-6 h-6" />
                    </button>
                    <button type="button" onClick={() => setRegStep(2)} className="w-full text-sm font-bold text-on-surface-variant hover:text-primary">Gửi lại mã</button>
                  </form>
                </motion.div>
              ) : (
                <motion.div
                  key={isLogin ? 'login' : `reg-${regStep}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="h-full flex flex-col"
                >
                  <div className="mb-10 flex items-center justify-between">
                    <div>
                      <h2 className="text-4xl font-black text-on-surface tracking-tighter mb-1">
                        {isLogin ? "Đăng nhập" : (regStep === 1 ? "Đăng ký" : "Xác thực Email")}
                      </h2>
                      <p className="text-on-surface-variant font-medium">
                        {isLogin ? "Dành cho thành viên PAW Home" : `Bước ${regStep} trên 2`}
                      </p>
                    </div>
                    {isLogin && (
                      <Link to="/register" className="text-xs font-black text-primary bg-primary-fixed px-4 py-2 rounded-xl hover:bg-primary-container transition-all">Đăng ký</Link>
                    )}
                  </div>

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
                              placeholder="admin@pawhome.vn" 
                              value={formData.email}
                              onChange={e => setFormData({...formData, email: e.target.value})}
                            />
                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-black text-on-surface-variant ml-2 uppercase tracking-wider">Mật khẩu</label>
                          <div className="relative">
                            <input 
                              type={showPassword ? "text" : "password"} required
                              className="w-full bg-white border border-outline-variant rounded-2xl px-10 py-4 focus:ring-4 focus:ring-primary/10 outline-none transition-all text-sm font-bold" 
                              placeholder="••••••••" 
                              value={formData.password}
                              onChange={e => setFormData({...formData, password: e.target.value})}
                            />
                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant">
                              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        {regStep === 1 ? (
                          <>
                            <div className="space-y-1">
                              <label className="text-xs font-black text-on-surface-variant ml-2 uppercase tracking-wider">Họ và tên</label>
                              <div className="relative">
                                <input 
                                  type="text" required
                                  className="w-full bg-white border border-outline-variant rounded-2xl px-10 py-4 focus:ring-4 focus:ring-primary/10 outline-none transition-all text-sm font-bold" 
                                  placeholder="Nguyễn Văn A" 
                                  value={formData.name}
                                  onChange={e => setFormData({...formData, name: e.target.value})}
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
                                  onChange={e => setFormData({...formData, phone: e.target.value})}
                                />
                                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
                              </div>
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs font-black text-on-surface-variant ml-2 uppercase tracking-wider">Mật khẩu</label>
                              <div className="relative">
                                <input 
                                  type="password" required
                                  className="w-full bg-white border border-outline-variant rounded-2xl px-10 py-4 focus:ring-4 focus:ring-primary/10 outline-none transition-all text-sm font-bold" 
                                  placeholder="••••••••" 
                                  value={formData.password}
                                  onChange={e => setFormData({...formData, password: e.target.value})}
                                />
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
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
                                onChange={e => setFormData({...formData, email: e.target.value})}
                              />
                              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
                            </div>
                          </div>
                        )}
                      </>
                    )}

                    <div className="pt-4">
                      <button 
                        disabled={loading}
                        className="w-full bg-primary text-on-primary py-5 rounded-[24px] font-bold text-lg shadow-xl shadow-primary/20 flex items-center justify-center gap-3 hover:translate-y-[-2px] active:scale-95 transition-all disabled:opacity-50"
                      >
                        {loading ? 'Đang xử lý...' : (isLogin ? 'Đăng nhập' : (regStep === 1 ? 'Tiếp tục' : 'Gửi mã xác nhận'))}
                        <ArrowRight className="w-6 h-6" />
                      </button>
                    </div>

                    {!isLogin && regStep > 1 && (
                       <button type="button" onClick={() => setRegStep(regStep - 1)} className="w-full text-xs font-bold text-on-surface-variant flex items-center justify-center gap-2">
                          <ArrowLeft className="w-4 h-4" /> Quay lại
                       </button>
                    )}
                  </form>

                  <div className="mt-auto pt-8 flex items-center gap-4">
                     <div className="h-px bg-outline-variant flex-1"></div>
                     <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em]">
                       {isLogin ? "Chưa có tài khoản?" : "Đã có tài khoản?"}
                       <button onClick={() => { setIsLogin(!isLogin); setRegStep(1); }} className="ml-2 text-primary hover:underline">
                         {isLogin ? "Đăng ký ngay" : "Đăng nhập"}
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
