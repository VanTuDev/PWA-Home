import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { PawPrint, User, ShoppingBag, MessageSquare, LayoutDashboard, Search, Bell, Menu, LogOut, UserCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  
  const isStaff = ['admin', 'manager', 'staff'].includes(user?.role ?? '');

  const navItems = [
    { name: 'Nhận nuôi', path: '/', icon: PawPrint },
    { name: 'Cộng đồng', path: '/community', icon: MessageSquare },
    { name: 'Cửa hàng', path: '/shop', icon: ShoppingBag },
    ...(isStaff ? [{ name: 'Quản trị', path: '/admin', icon: LayoutDashboard }] : []),
  ];

  const handleLogout = () => {
    if (window.confirm('Bạn có chắc chắn muốn đăng xuất?')) {
      logout();
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-surface/80 backdrop-blur-md border-b border-outline-variant px-margin-mobile md:px-margin-desktop py-4">
      <div className="max-w-container-max mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
            <PawPrint className="text-on-primary w-6 h-6" />
          </div>
          <span className="text-xl font-bold text-primary tracking-tight">PAW Home</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                location.pathname === item.path ? 'text-primary' : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.name}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <button className="p-2 text-on-surface-variant hover:bg-surface-container rounded-full transition-colors">
            <Search className="w-5 h-5" />
          </button>
          <button className="p-2 text-on-surface-variant hover:bg-surface-container rounded-full transition-colors relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full border-2 border-surface"></span>
          </button>
          
          {user ? (
            <div className="flex items-center gap-2">
              <Link
                to="/profile"
                className="flex items-center gap-2 text-xs font-bold text-on-surface-variant bg-surface-container hover:bg-primary/10 hover:text-primary px-3 py-1.5 rounded-full border border-outline-variant/30 transition-all"
              >
                {user.avatar
                  ? <img src={user.avatar} alt="" className="w-5 h-5 rounded-full object-cover" />
                  : <UserCircle className="w-4 h-4" />
                }
                <span className="hidden lg:inline">{user.name.split(' ')[0]}</span>
              </Link>
              <button
                onClick={handleLogout}
                title="Đăng xuất"
                className="p-2.5 text-on-surface-variant hover:text-error hover:bg-red-50 rounded-full transition-all border border-transparent hover:border-red-100 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link to="/login" className="hidden lg:flex items-center gap-2 bg-primary text-on-primary px-4 py-2 rounded-full text-sm font-medium hover:bg-primary-container transition-colors">
              <User className="w-4 h-4" />
              Đăng nhập
            </Link>
          )}
          
          <button className="md:hidden p-2 text-on-surface-variant">
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>
    </nav>
  );
};

export const Footer: React.FC = () => {
  return (
    <footer className="bg-surface-container-high border-t border-outline-variant pt-16 pb-8 px-margin-mobile md:px-margin-desktop">
      <div className="max-w-container-max mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
        <div className="col-span-1 md:col-span-1">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <PawPrint className="text-on-primary w-5 h-5" />
            </div>
            <span className="text-lg font-bold text-primary">PAW Home</span>
          </div>
          <p className="text-sm text-on-surface-variant mb-6 leading-relaxed">
            Nền tảng kết nối cứu hộ và nhận nuôi thú cưng thông minh bằng AI. Chúng tôi tin rằng mỗi bé thú cưng đều xứng đáng có một tổ ấm yêu thương.
          </p>
        </div>
        
        <div>
          <h4 className="font-bold text-on-surface mb-6">Liên kết nhanh</h4>
          <ul className="space-y-4 text-sm text-on-surface-variant">
            <li><Link to="/" className="hover:text-primary">Tìm thú cưng</Link></li>
            <li><Link to="/community" className="hover:text-primary">Cộng đồng</Link></li>
            <li><Link to="/shop" className="hover:text-primary">Cửa hàng</Link></li>
            <li><Link to="/admin/login" className="hover:text-primary">Dành cho trung tâm</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-on-surface mb-6">Hỗ trợ</h4>
          <ul className="space-y-4 text-sm text-on-surface-variant">
            <li><a href="#" className="hover:text-primary">Hướng dẫn nhận nuôi</a></li>
            <li><a href="#" className="hover:text-primary">Quy định cộng đồng</a></li>
            <li><a href="#" className="hover:text-primary">Chính sách bảo mật</a></li>
            <li><a href="#" className="hover:text-primary">Liên hệ</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-on-surface mb-6">Liên hệ</h4>
          <ul className="space-y-4 text-sm text-on-surface-variant">
            <li className="flex items-center gap-3">
              <MessageSquare className="w-4 h-4 text-primary" />
              contact@pawhome.vn
            </li>
            <li className="flex items-center gap-3">
              <User className="w-4 h-4 text-primary" />
              0123 456 789
            </li>
          </ul>
          <div className="mt-8">
            <h4 className="font-bold text-on-surface mb-4 text-sm">Tải ứng dụng</h4>
            <div className="flex flex-col gap-3">
              <a href="#" className="bg-black text-white px-4 py-2 rounded-xl flex items-center gap-3 hover:bg-gray-900 transition-all border border-gray-800">
                <img src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Apple_logo_black.svg" className="w-5 h-5 invert" alt="Apple" />
                <div className="text-left">
                  <p className="text-[10px] leading-none opacity-60">Download on the</p>
                  <p className="text-sm font-bold leading-none">App Store</p>
                </div>
              </a>
              <a href="#" className="bg-black text-white px-4 py-2 rounded-xl flex items-center gap-3 hover:bg-gray-900 transition-all border border-gray-800">
                <img src="https://upload.wikimedia.org/wikipedia/commons/d/d7/Google_Play_Store_badge_EN.svg" className="w-5 h-5" alt="Google Play" />
                <div className="text-left">
                  <p className="text-[10px] leading-none opacity-60">GET IT ON</p>
                  <p className="text-sm font-bold leading-none">Google Play</p>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-container-max mx-auto pt-8 border-t border-outline-variant flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-xs text-on-surface-variant">
          © 2024 PAW Home. All rights reserved.
        </p>
        <div className="flex items-center gap-6">
          <a href="#" className="text-on-surface-variant hover:text-primary text-xs">Facebook</a>
          <a href="#" className="text-on-surface-variant hover:text-primary text-xs">Instagram</a>
          <a href="#" className="text-on-surface-variant hover:text-primary text-xs">Twitter</a>
        </div>
      </div>
    </footer>
  );
};
