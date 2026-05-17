import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserCog, Lock, Mail, ArrowRight, Eye, EyeOff, ClipboardCheck } from 'lucide-react';

export const StaffLogin: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    setTimeout(() => {
      const users = JSON.parse(localStorage.getItem('paw_users') || '[]');
      const user = users.find(u => u.email === formData.email && u.password === formData.password);
      
      if (user) {
        if (user.role === 'staff' || user.role === 'manager' || user.role === 'admin') {
          login(user);
          // Staff might go to a different dashboard, but for now we'll use the same admin dash or home
          navigate('/admin'); 
        } else {
          setError('Tài khoản của bạn không có quyền truy cập cổng Nhân viên.');
        }
      } else {
        setError('Email hoặc mật khẩu không chính xác.');
      }
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 relative overflow-hidden">
      {/* Professional Soft Background */}
      <div className="absolute inset-0 z-0">
         <div className="absolute top-0 right-0 w-1/2 h-full bg-blue-600/5 -skew-x-12 transform translate-x-20"></div>
         <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-indigo-600/5 skew-y-12 transform -translate-x-20"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 w-full max-w-lg p-6"
      >
        <div className="bg-white rounded-[48px] shadow-2xl shadow-blue-900/10 border border-blue-100 overflow-hidden flex flex-col md:flex-row">
          <div className="w-full p-10 md:p-12">
            <div className="flex items-center gap-3 mb-10">
              <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/30">
                <ClipboardCheck className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-black text-slate-900 tracking-tighter">PAW STAFF</h1>
                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Operations Portal</p>
              </div>
            </div>

            <div className="mb-8">
               <h2 className="text-2xl font-black text-slate-800 mb-2">Đăng nhập Nhân viên</h2>
               <p className="text-slate-500 text-sm font-medium">Vui lòng sử dụng tài khoản nội bộ đã được cấp.</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl text-xs font-bold border border-red-100">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-1">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Email nội bộ</label>
                <div className="relative">
                  <input 
                    type="email" required
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-12 py-4 text-slate-900 focus:ring-4 focus:ring-blue-600/10 outline-none transition-all font-bold"
                    placeholder="name@pawhome.vn"
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                  />
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Mật khẩu</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} required
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-12 py-4 text-slate-900 focus:ring-4 focus:ring-blue-600/10 outline-none transition-all font-bold"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={e => setFormData({...formData, password: e.target.value})}
                  />
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="pt-4">
                <button 
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-5 rounded-[24px] font-black text-lg shadow-xl shadow-blue-600/20 flex items-center justify-center gap-3 hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50"
                >
                  {loading ? "ĐANG ĐĂNG NHẬP..." : "VÀO HỆ THỐNG"}
                  <ArrowRight className="w-6 h-6" />
                </button>
              </div>
            </form>

            <div className="mt-10 text-center">
               <Link to="/" className="text-slate-400 text-xs font-bold hover:text-blue-600 transition-colors uppercase tracking-widest">Trang chủ PAW Home</Link>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
