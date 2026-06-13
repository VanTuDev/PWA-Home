import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { PawPrint, User, ShoppingBag, MessageSquare, LayoutDashboard, Search, Bell, Menu, LogOut, UserCircle, Heart, ListTodo, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { MissionPanel } from './MissionPanel';
import { confirm } from './ConfirmDialog';

const BE_URL = (import.meta as any).env?.DEV ? 'http://localhost:5000' : 'https://pwa-home-be.onrender.com';
const imgSrc = (img?: string) => {
  if (!img) return '';
  if (img.startsWith('http')) return img;
  const path = img.startsWith('/') ? img : `/${img}`;
  return `${BE_URL}${path}`;
};

export const Navbar: React.FC = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [bellOpen, setBellOpen]               = useState(false);
  const [bellTab,  setBellTab]                = useState<'notifications' | 'missions'>('notifications');
  const [missionRefresh, setMissionRefresh]   = useState(0);
  const [mobileOpen, setMobileOpen]           = useState(false);
  const [notifications, setNotifications]     = useState<any[]>([]);
  const bellRef = useRef<HTMLDivElement>(null);

  const token = localStorage.getItem('paw_token');

  const loadNotifications = async () => {
    if (!token) return;
    try {
      const r = await fetch('/api/notifications', { headers: { Authorization: `Bearer ${token}` } });
      if (r.ok) setNotifications(await r.json());
    } catch { /* silent */ }
  };

  useEffect(() => {
    loadNotifications();
  }, [token]);

  useEffect(() => {
    if (bellOpen && bellTab === 'notifications') loadNotifications();
  }, [bellOpen, bellTab]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) {
        setBellOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = async () => {
    if (!token || unreadCount === 0) return;
    await fetch('/api/notifications/read-all', { method: 'PUT', headers: { Authorization: `Bearer ${token}` } });
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const markOneRead = async (id: string) => {
    if (!token) return;
    await fetch(`/api/notifications/${id}/read`, { method: 'PUT', headers: { Authorization: `Bearer ${token}` } });
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const isStaff = ['admin', 'manager', 'staff'].includes(user?.role ?? '');

  const navItems = [
    { name: 'Nhận nuôi', path: '/', icon: PawPrint },
    { name: 'Thú cưng', path: '/pets', icon: Heart },
    { name: 'Cộng đồng', path: '/community', icon: MessageSquare },
    { name: 'Cửa hàng', path: '/shop', icon: ShoppingBag },
    ...(isStaff ? [{ name: 'Quản trị', path: '/admin', icon: LayoutDashboard }] : []),
  ];

  const handleLogout = async () => {
    const ok = await confirm({ message: 'Bạn có chắc chắn muốn đăng xuất?', confirmText: 'Đăng xuất', danger: true });
    if (ok) logout();
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
          {/* Bell + dropdown */}
          <div ref={bellRef} className="relative">
            <button
              onClick={() => setBellOpen(o => !o)}
              className="p-2 text-on-surface-variant hover:bg-surface-container rounded-full transition-colors relative"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 min-w-[16px] h-4 px-0.5 bg-error text-white text-[9px] font-black rounded-full flex items-center justify-center border border-surface">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {bellOpen && (
              <div className="absolute right-0 top-full mt-2 w-[min(340px,calc(100vw-2rem))] bg-white rounded-3xl shadow-2xl border border-outline-variant overflow-hidden z-50">
                {/* Tabs */}
                <div className="flex border-b border-outline-variant">
                  <button
                    onClick={() => setBellTab('notifications')}
                    className={`flex-1 py-3 text-xs font-black uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 ${
                      bellTab === 'notifications' ? 'text-primary border-b-2 border-primary' : 'text-on-surface-variant'
                    }`}
                  >
                    <Bell className="w-3.5 h-3.5" /> Thông báo
                  </button>
                  <button
                    onClick={() => { setBellTab('missions'); setMissionRefresh(k => k + 1); }}
                    className={`flex-1 py-3 text-xs font-black uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 ${
                      bellTab === 'missions' ? 'text-primary border-b-2 border-primary' : 'text-on-surface-variant'
                    }`}
                  >
                    <ListTodo className="w-3.5 h-3.5" /> Nhiệm vụ
                  </button>
                </div>

                {/* Content */}
                <div className="max-h-[420px] overflow-y-auto">
                  {bellTab === 'notifications' ? (
                    <div>
                      {notifications.length > 0 && unreadCount > 0 && (
                        <div className="flex justify-end px-4 pt-3">
                          <button onClick={markAllRead}
                            className="text-[10px] font-bold text-primary hover:underline">
                            Đánh dấu tất cả đã đọc
                          </button>
                        </div>
                      )}
                      {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                          <Bell className="w-10 h-10 text-on-surface-variant opacity-20 mb-2" />
                          <p className="text-sm font-bold text-on-surface-variant">Chưa có thông báo</p>
                        </div>
                      ) : (
                        <div className="divide-y divide-outline-variant/30">
                          {notifications.map(n => (
                            <a key={n.id} href={n.link || '#'}
                              onClick={() => markOneRead(n.id)}
                              className={`flex gap-3 px-4 py-3.5 hover:bg-surface-container-low transition-colors cursor-pointer ${!n.read ? 'bg-primary/3' : ''}`}>
                              <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${!n.read ? 'bg-primary' : 'bg-transparent'}`} />
                              <div className="flex-1 min-w-0">
                                <p className={`text-sm leading-snug ${!n.read ? 'font-bold text-on-surface' : 'font-medium text-on-surface-variant'}`}>
                                  {n.title}
                                </p>
                                {n.body && <p className="text-xs text-on-surface-variant mt-0.5 line-clamp-2">{n.body}</p>}
                                <p className="text-[10px] text-on-surface-variant/60 mt-1">
                                  {new Date(n.createdAt).toLocaleString('vi-VN', { day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit' })}
                                </p>
                              </div>
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <MissionPanel token={token} refreshKey={missionRefresh} />
                  )}
                </div>
              </div>
            )}
          </div>
          
          {user ? (
            <div className="flex items-center gap-2">
              <Link
                to="/profile"
                className="flex items-center gap-2 text-xs font-bold text-on-surface-variant bg-surface-container hover:bg-primary/10 hover:text-primary px-3 py-1.5 rounded-full border border-outline-variant/30 transition-all"
              >
                {user.avatar
                  ? <img src={imgSrc(user.avatar)} alt="" className="w-5 h-5 rounded-full object-cover" />
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
          
          <button className="md:hidden p-2 text-on-surface-variant" onClick={() => setMobileOpen(o => !o)}>
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>
      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t border-outline-variant bg-surface/95 backdrop-blur-md px-4 py-4 space-y-1">
          {navItems.map(item => (
            <Link key={item.path} to={item.path}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-colors ${
                location.pathname === item.path
                  ? 'bg-primary/10 text-primary'
                  : 'text-on-surface-variant hover:bg-surface-container hover:text-primary'
              }`}>
              <item.icon className="w-4 h-4" />
              {item.name}
            </Link>
          ))}
          {user ? (
            <div className="pt-3 border-t border-outline-variant flex items-center gap-3 px-4 py-2">
              <Link to="/profile" onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 flex-1 text-sm font-bold text-on-surface-variant">
                {user.avatar
                  ? <img src={imgSrc(user.avatar)} alt="" className="w-7 h-7 rounded-full object-cover" />
                  : <UserCircle className="w-5 h-5" />
                }
                {user.name}
              </Link>
              <button onClick={() => { handleLogout(); setMobileOpen(false); }}
                className="p-2 text-on-surface-variant hover:text-error rounded-full hover:bg-red-50 transition-all">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link to="/login" onClick={() => setMobileOpen(false)}
              className="flex items-center justify-center gap-2 bg-primary text-on-primary px-4 py-3 rounded-2xl text-sm font-bold mt-2">
              <User className="w-4 h-4" /> Đăng nhập
            </Link>
          )}
        </div>
      )}
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
