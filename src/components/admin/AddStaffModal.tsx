import React, { useState } from 'react';
import { X, User as UserIcon, Mail, ShieldCheck, Lock, Phone } from 'lucide-react';

interface AddStaffModalProps {
  onClose: () => void;
  onSubmit: (newUser: any) => void;
}

export const AddStaffModal: React.FC<AddStaffModalProps> = ({ 
  onClose, 
  onSubmit 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'staff' as 'admin' | 'manager' | 'staff' | 'user'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    // Reset form
    setFormData({ name: '', email: '', phone: '', password: '', role: 'staff' });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-on-surface/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      ></div>
      
      {/* Modal Container */}
      <div className="relative bg-white w-full max-w-lg rounded-[40px] shadow-2xl p-10 overflow-hidden border border-outline-variant/30 animate-scale-up">
         {/* Close Button */}
         <div className="absolute top-0 right-0 p-8">
            <button 
              onClick={onClose} 
              className="p-2 hover:bg-surface-container rounded-full transition-colors cursor-pointer text-on-surface-variant hover:text-on-surface"
            >
               <X className="w-6 h-6" />
            </button>
         </div>
         
         {/* Header */}
         <div className="mb-8">
            <h2 className="text-3xl font-black tracking-tighter">Thêm nhân viên mới</h2>
            <p className="text-sm font-medium text-on-surface-variant mt-1">Cấp quyền truy cập hệ thống PAW Portal.</p>
         </div>

         {/* Form */}
         <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name */}
            <div className="space-y-1">
               <label className="text-xs font-black text-on-surface-variant ml-2 uppercase tracking-widest">Tên nhân viên</label>
               <div className="relative">
                  <input 
                    type="text" 
                    required
                    className="w-full bg-surface-container-low border border-outline-variant rounded-2xl px-12 py-4 focus:ring-4 focus:ring-primary/10 outline-none transition-all font-bold text-sm"
                    placeholder="Nguyễn Văn A"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
               </div>
            </div>

            {/* Email and Role */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="space-y-1">
                  <label className="text-xs font-black text-on-surface-variant ml-2 uppercase tracking-widest">Email</label>
                  <div className="relative">
                    <input 
                      type="email" 
                      required
                      className="w-full bg-surface-container-low border border-outline-variant rounded-2xl px-12 py-4 focus:ring-4 focus:ring-primary/10 outline-none transition-all font-bold text-sm"
                      placeholder="nv.a@pawhome.vn"
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                    />
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
                  </div>
               </div>

               <div className="space-y-1">
                  <label className="text-xs font-black text-on-surface-variant ml-2 uppercase tracking-widest">Vai trò</label>
                  <div className="relative">
                    <select 
                      className="w-full bg-surface-container-low border border-outline-variant rounded-2xl px-12 py-4 focus:ring-4 focus:ring-primary/10 outline-none transition-all font-bold text-sm appearance-none cursor-pointer"
                      value={formData.role}
                      onChange={e => setFormData({...formData, role: e.target.value as any})}
                    >
                       <option value="staff">Staff (Nhân viên)</option>
                       <option value="manager">Manager (Quản lý)</option>
                       <option value="admin">Admin (Quản trị)</option>
                    </select>
                    <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" />
                  </div>
               </div>
            </div>

            {/* Phone */}
            <div className="space-y-1">
               <label className="text-xs font-black text-on-surface-variant ml-2 uppercase tracking-widest">Số điện thoại</label>
               <div className="relative">
                  <input 
                    type="tel" 
                    className="w-full bg-surface-container-low border border-outline-variant rounded-2xl px-12 py-4 focus:ring-4 focus:ring-primary/10 outline-none transition-all font-bold text-sm"
                    placeholder="09xx xxx xxx"
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                  />
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
               </div>
            </div>

            {/* Initial Password */}
            <div className="space-y-1">
               <label className="text-xs font-black text-on-surface-variant ml-2 uppercase tracking-widest">Mật khẩu khởi tạo</label>
               <div className="relative">
                  <input 
                    type="password" 
                    required
                    className="w-full bg-surface-container-low border border-outline-variant rounded-2xl px-12 py-4 focus:ring-4 focus:ring-primary/10 outline-none transition-all font-bold text-sm"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={e => setFormData({...formData, password: e.target.value})}
                  />
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
               </div>
            </div>

            {/* Submit Action */}
            <div className="pt-4">
               <button 
                 type="submit" 
                 className="w-full bg-primary text-on-primary py-4 rounded-[24px] font-bold text-base shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
               >
                  Tạo tài khoản ngay
               </button>
            </div>
         </form>
      </div>
    </div>
  );
};
