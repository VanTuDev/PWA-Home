import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  PawPrint, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight,
  Globe,
  Smartphone
} from 'lucide-react';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('user', JSON.stringify(data.user));
        alert('Đăng nhập thành công!');
        navigate(data.user.role === 'admin' ? '/admin' : '/');
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Lỗi kết nối server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-stretch bg-white">
      {/* Left Decoration */}
      <div className="hidden lg:flex w-1/2 bg-primary relative items-center justify-center overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-20 w-64 h-64 border-4 border-on-primary rounded-full"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 border-[40px] border-on-primary rounded-full"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary-container rounded-full blur-[120px]"></div>
        </div>
        
        <div className="relative z-10 text-center px-12">
          <Link to="/" className="inline-flex items-center gap-4 bg-on-primary p-3 rounded-[24px] mb-12 shadow-2xl rotate-3 hover:rotate-0 transition-transform">
            <PawPrint className="text-primary w-12 h-12" />
            <span className="text-3xl font-black text-primary tracking-tighter pr-4">PAW Home</span>
          </Link>
          <h1 className="text-6xl font-bold text-on-primary mb-8 leading-[1.1] tracking-tighter">Chào mừng bạn quay trở lại!</h1>
          <p className="text-xl text-on-primary/80 max-w-md mx-auto leading-relaxed">Tiếp tục hành trình tìm kiếm và hỗ trợ những người bạn bốn chân của chúng ta.</p>
        </div>

        <div className="absolute bottom-12 left-12 flex gap-4">
           <div className="flex -space-x-4">
              {[1,2,3,4].map(i => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-primary bg-surface-container overflow-hidden">
                  <img src={`https://i.pravatar.cc/100?u=${i}`} alt="Avatar" />
                </div>
              ))}
           </div>
           <p className="text-on-primary/60 text-xs font-medium self-center">+2.4k thành viên đang online</p>
        </div>
      </div>

      {/* Right Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-24 bg-surface-container-lowest">
        <div className="w-full max-w-md">
          <div className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-4xl font-bold text-on-surface mb-2">Đăng nhập</h2>
              <p className="text-on-surface-variant font-medium">Nhập thông tin tài khoản của bạn</p>
            </div>
            <Link to="/register" className="text-sm font-bold text-primary bg-primary-fixed px-4 py-2 rounded-xl hover:bg-primary-container hover:text-on-primary transition-all">Tạo tài khoản</Link>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-error-container text-on-error-container rounded-2xl text-sm font-bold">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
             <button type="button" className="w-full flex items-center justify-center gap-3 bg-white border border-outline-variant py-4 rounded-2xl font-bold hover:bg-surface-container transition-all">
                <Globe className="w-5 h-5 text-red-500" />
                Đăng nhập với Google
             </button>
             <button type="button" className="w-full flex items-center justify-center gap-3 bg-white border border-outline-variant py-4 rounded-2xl font-bold hover:bg-surface-container transition-all">
                <Smartphone className="w-5 h-5 text-on-surface" />
                Đăng nhập với Apple
             </button>

             <div className="flex items-center gap-4 py-4">
                <div className="h-px bg-outline-variant flex-1"></div>
                <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Hoặc bằng Email</span>
                <div className="h-px bg-outline-variant flex-1"></div>
             </div>

             <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-on-surface ml-2">Email</label>
                  <div className="relative">
                    <input 
                      type="email" 
                      required
                      className="w-full bg-surface border border-outline-variant rounded-2xl px-12 py-4 focus:ring-2 focus:ring-primary outline-none transition-all placeholder:text-on-surface-variant/40" 
                      placeholder="name@company.com" 
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
                      type={showPassword ? "text" : "password"}
                      required
                      className="w-full bg-surface border border-outline-variant rounded-2xl px-12 py-4 focus:ring-2 focus:ring-primary outline-none transition-all placeholder:text-on-surface-variant/40" 
                      placeholder="••••••••" 
                      value={formData.password}
                      onChange={e => setFormData({...formData, password: e.target.value})}
                    />
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="flex justify-end">
                   <button type="button" className="text-xs font-bold text-primary hover:underline">Quên mật khẩu?</button>
                </div>

                <button 
                  disabled={loading}
                  className="w-full bg-primary text-on-primary py-5 rounded-[24px] font-bold text-lg shadow-xl shadow-primary/30 flex items-center justify-center gap-3 hover:translate-y-[-2px] hover:shadow-2xl transition-all active:scale-[0.98] disabled:opacity-50"
                >
                   {loading ? 'Đang đăng nhập...' : 'Bắt đầu ngay'}
                   <ArrowRight className="w-6 h-6" />
                </button>
             </div>
          </form>
        </div>
      </div>
    </div>
  );
};
