import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Lock, Mail, ArrowRight, Eye, EyeOff, ShieldAlert } from 'lucide-react';

export const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
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
        if (user.role === 'admin') {
          localStorage.setItem('user', JSON.stringify(user));
          navigate('/admin');
        } else {
          setError('Truy cập bị từ chối. Cổng này chỉ dành cho Quản trị viên hệ thống.');
        }
      } else {
        setError('Thông tin đăng nhập không chính xác.');
      }
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#0f172a] relative overflow-hidden">
      {/* Tech-inspired background */}
      <div className="absolute inset-0 z-0">
         <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(30,58,138,0.2),transparent)]"></div>
         <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md p-8"
      >
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/20 rounded-3xl mb-6 border border-primary/30">
            <ShieldCheck className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tighter mb-2">PAW ADMIN PORTAL</h1>
          <p className="text-slate-400 text-sm font-medium">Hệ thống quản trị trung tâm PAW Home</p>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-400 text-xs font-bold"
          >
            <ShieldAlert className="w-5 h-5 flex-shrink-0" />
            {error}
          </motion.div>
        )}

        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-8 rounded-[40px] shadow-2xl">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Email quản trị</label>
              <div className="relative">
                <input 
                  type="email" required
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-12 py-4 text-white focus:ring-2 focus:ring-primary outline-none transition-all font-bold"
                  placeholder="admin@pawhome.vn"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                />
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Mật khẩu hệ thống</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} required
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-12 py-4 text-white focus:ring-2 focus:ring-primary outline-none transition-all font-bold"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                />
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600" />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button 
              disabled={loading}
              className="w-full bg-primary text-on-primary py-5 rounded-[24px] font-black text-lg shadow-xl shadow-primary/20 flex items-center justify-center gap-3 hover:bg-primary-container transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? "ĐANG XÁC THỰC..." : "XÁC NHẬN TRUY CẬP"}
              <ArrowRight className="w-6 h-6" />
            </button>
          </form>
        </div>

        <div className="mt-10 text-center">
           <Link to="/" className="text-slate-500 text-sm font-bold hover:text-white transition-colors">Quay lại trang chủ</Link>
        </div>
      </motion.div>
    </div>
  );
};
