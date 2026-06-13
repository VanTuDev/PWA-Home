import React from 'react';
import { Search, Bell, LogOut, Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { confirm } from '../ConfirmDialog';

interface AdminHeaderProps {
  onMenuClick: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    const ok = await confirm({ message: 'Bạn có chắc chắn muốn đăng xuất khỏi hệ thống?', confirmText: 'Đăng xuất', danger: true });
    if (ok) { logout(); navigate('/'); }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':   return 'Super Admin';
      case 'manager': return 'Manager';
      case 'staff':   return 'Operations Staff';
      default:        return 'User';
    }
  };

  const getInitials = (name: string) =>
    name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <header className="px-4 sm:px-8 py-4 sm:py-6 flex justify-between items-center bg-white border-b border-outline-variant sticky top-0 z-10 shadow-sm gap-3">
      {/* Hamburger — mobile only */}
      <button onClick={onMenuClick}
        className="lg:hidden p-2.5 rounded-xl hover:bg-surface-container transition-colors text-on-surface-variant flex-shrink-0">
        <Menu className="w-5 h-5" />
      </button>

      {/* Search — desktop only */}
      <div className="hidden md:flex bg-surface-container-low px-4 py-2.5 rounded-xl items-center gap-3 w-80 border border-outline-variant/30 flex-shrink-0">
        <Search className="w-4 h-4 text-on-surface-variant" />
        <input type="text" placeholder="Tìm kiếm hệ thống..."
          className="bg-transparent text-sm outline-none w-full font-medium placeholder:text-on-surface-variant/40" />
      </div>

      {/* Right section */}
      <div className="flex items-center gap-3 sm:gap-6 ml-auto">
        {/* Bell */}
        <button className="relative p-2.5 text-on-surface-variant hover:bg-surface-container rounded-full transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full border-2 border-white" />
        </button>

        {/* Profile + Logout */}
        <div className="flex items-center gap-3 sm:gap-5 border-l pl-3 sm:pl-6 border-outline-variant/70">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-on-surface leading-tight">{user?.name || 'Guest'}</p>
            <p className="text-[9px] text-primary font-black uppercase tracking-wider mt-0.5">
              {getRoleBadge(user?.role || '')}
            </p>
          </div>

          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold shadow-md text-sm">
            {user ? getInitials(user.name) : 'G'}
          </div>

          <button onClick={handleLogout} title="Đăng xuất"
            className="p-2.5 text-on-surface-variant hover:text-error hover:bg-red-50 rounded-full transition-all border border-transparent hover:border-red-100">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
