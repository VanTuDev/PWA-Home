import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { PawPrint, User, ShoppingBag, MessageSquare, LayoutDashboard, Search, Bell, Menu, LogOut, UserCircle, Heart, ListTodo, X, Gift, Mail, Phone, MapPin, Facebook, Instagram } from 'lucide-react';
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
    { name: 'Ủng hộ', path: '/donate', icon: Gift },
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
    <footer className="bg-gradient-to-b from-surface-container/40 to-surface-container-high border-t border-outline-variant pt-16 pb-8 px-margin-mobile md:px-margin-desktop relative overflow-hidden">
      {/* Decorative subtle background shapes */}
      <div className="absolute -top-24 -left-24 w-48 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-container-max mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-10 mb-16 relative z-10">
        {/* ── PAW Home brand ───────────────────────────── */}
        <div className="col-span-1 md:col-span-3 flex flex-col justify-between">
          <div>
            <Link to="/" className="flex items-center gap-3 mb-6 group w-fit">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-md shadow-primary/20 group-hover:scale-105 group-hover:rotate-6 transition-all duration-300">
                <PawPrint className="text-on-primary w-5.5 h-5.5" />
              </div>
              <span className="text-xl font-black text-primary tracking-tight">PAW Home</span>
            </Link>
            <p className="text-sm text-on-surface-variant mb-6 leading-relaxed">
              Nền tảng cứu hộ &amp; nhận nuôi thú cưng thông minh tại Việt Nam. Chúng tôi kết hợp công nghệ AI để kết nối những tấm lòng nhân ái, giúp mỗi bé chó mèo bị bỏ rơi tìm lại mái ấm hạnh phúc.
            </p>
          </div>
          {/* Social Icons */}
          <div className="flex items-center gap-3 mt-2">
            <a href="https://www.facebook.com/profile.php?id=61577990248702" target="_blank" rel="noopener noreferrer" aria-label="Facebook PAW Home"
              className="w-9 h-9 rounded-full bg-surface-container-high border border-outline-variant/30 flex items-center justify-center text-on-surface-variant hover:text-white hover:bg-[#1877F2] hover:border-transparent hover:-translate-y-1 transition-all duration-300">
              <Facebook className="w-4 h-4" />
            </a>
            <a href="https://www.threads.com/@pawhome_abcd?hl=vi" target="_blank" rel="noopener noreferrer" aria-label="Threads PAW Home"
              className="w-9 h-9 rounded-full bg-surface-container-high border border-outline-variant/30 flex items-center justify-center text-on-surface-variant hover:text-white hover:bg-black hover:border-transparent hover:-translate-y-1 transition-all duration-300">
              <svg viewBox="0 0 192 192" className="w-4 h-4" fill="currentColor">
                <path d="M141.537 88.988c-.88-.415-1.78-.811-2.698-1.187-.484-18.175-9.71-28.579-25.845-28.679h-.246c-9.756 0-17.857 4.16-22.864 11.726l10.637 7.282c3.706-5.622 9.527-6.824 12.228-6.824h.167c4.724.031 8.288 1.402 10.59 4.073 1.681 1.962 2.806 4.667 3.361 8.083-4.193-.712-8.711-.93-13.527-.652-13.604.784-22.351 8.733-21.777 19.768.29 5.581 3.104 10.382 7.924 13.518 4.083 2.627 9.347 3.914 14.816 3.621 7.227-.393 12.892-3.148 16.835-8.195 3.019-3.849 4.927-8.832 5.782-15.121 3.467 2.093 6.033 4.862 7.435 8.217 2.3 5.52 2.433 14.593-4.751 21.766-6.266 6.255-13.796 8.963-25.172 9.042-12.63-.088-22.181-4.148-28.386-12.068-5.791-7.397-8.762-18.086-8.84-31.77.079-13.685 3.048-24.373 8.84-31.769 6.205-7.921 15.756-11.98 28.386-12.069 12.74.089 22.545 4.169 29.147 12.124 3.238 3.882 5.674 8.773 7.252 14.496l12.371-3.302c-1.967-7.256-5.069-13.576-9.252-18.835-8.865-11.013-21.908-16.641-38.768-16.74h-.236c-16.786.099-29.629 5.741-38.174 16.763C70.508 71.257 66.984 83.986 66.9 99.987c.084 16.002 3.608 28.731 10.478 37.84 8.545 11.022 21.388 16.664 38.174 16.763h.236c14.976-.088 25.552-4.038 34.272-12.745 11.453-11.439 11.104-25.759 7.332-34.576-2.667-6.404-7.747-11.56-15.855-15.281zM105.682 117.39c-5.965.343-12.168-2.339-12.455-8.105-.217-4.407 3.135-9.328 13.275-9.936 1.163-.067 2.305-.1 3.427-.1 3.522 0 6.822.342 9.833.991-1.118 13.95-8.267 16.768-14.08 17.15z"/>
              </svg>
            </a>
          </div>
        </div>

        {/* ── PAWs for Compassion (ngay cạnh PAW Home) ── */}
        <div className="col-span-1 md:col-span-3 flex flex-col justify-between">
          <div>
            {/* Logo */}
            <a href="https://www.facebook.com/pawsforcompassion" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 mb-6 group w-fit">
              <img src="/paws-logo.png" alt="PAWs for Compassion Da Nang"
                className="h-10 w-auto object-contain group-hover:scale-105 transition-transform duration-300" />
            </a>
            <p className="text-sm text-on-surface-variant mb-6 leading-relaxed">
              Tổ chức cứu hộ thú cưng đồng hành cùng PAW Home trong sứ mệnh tìm mái ấm cho các bé tại Đà Nẵng và các tỉnh lân cận.
            </p>
          </div>
          {/* Social Icons — giống PAW Home */}
          <div className="flex items-center gap-3 mt-2">
            <a href="https://www.facebook.com/pawsforcompassion" target="_blank" rel="noopener noreferrer" aria-label="Facebook PAWs for Compassion"
              className="w-9 h-9 rounded-full bg-surface-container-high border border-outline-variant/30 flex items-center justify-center text-on-surface-variant hover:text-white hover:bg-[#1877F2] hover:border-transparent hover:-translate-y-1 transition-all duration-300">
              <Facebook className="w-4 h-4" />
            </a>
            <a href="https://www.instagram.com/pawsforcompassion.vn" target="_blank" rel="noopener noreferrer" aria-label="Instagram PAWs for Compassion"
              className="w-9 h-9 rounded-full bg-surface-container-high border border-outline-variant/30 flex items-center justify-center text-on-surface-variant hover:text-white hover:border-transparent hover:-translate-y-1 transition-all duration-300"
              style={{ background: 'none' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'linear-gradient(45deg,#f9ce34,#ee2a7b,#6228d7)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'none')}>
              <Instagram className="w-4 h-4" />
            </a>
          </div>
        </div>
        
        {/* Support */}
        <div className="col-span-1 md:col-span-2">
          <h4 className="relative font-bold text-on-surface mb-6 text-base tracking-wide after:content-[''] after:absolute after:bottom-[-8px] after:left-0 after:w-8 after:h-0.5 after:bg-primary/60">
            Hỗ trợ & Hướng dẫn
          </h4>
          <ul className="space-y-3.5 text-sm text-on-surface-variant mt-8">
            <li>
              <a href="#" className="group flex items-center gap-1.5 hover:text-primary transition-all duration-300 hover:translate-x-1.5 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-primary/40 group-hover:bg-primary transition-all duration-300" />
                Hướng dẫn nhận nuôi
              </a>
            </li>
            <li>
              <a href="#" className="group flex items-center gap-1.5 hover:text-primary transition-all duration-300 hover:translate-x-1.5 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-primary/40 group-hover:bg-primary transition-all duration-300" />
                Quy trình cứu trợ
              </a>
            </li>
            <li>
              <a href="#" className="group flex items-center gap-1.5 hover:text-primary transition-all duration-300 hover:translate-x-1.5 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-primary/40 group-hover:bg-primary transition-all duration-300" />
                Chính sách bảo mật
              </a>
            </li>
            <li>
              <Link to="/survey" className="group flex items-center gap-1.5 hover:text-primary transition-all duration-300 hover:translate-x-1.5 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-primary/40 group-hover:bg-primary transition-all duration-300" />
                Khảo sát nhận nuôi
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact Info */}
        <div className="col-span-1 md:col-span-4">
          <h4 className="relative font-bold text-on-surface mb-6 text-base tracking-wide after:content-[''] after:absolute after:bottom-[-8px] after:left-0 after:w-8 after:h-0.5 after:bg-primary/60">
            Liên hệ với chúng tôi
          </h4>
          <ul className="space-y-4 text-sm text-on-surface-variant mt-8">
            <li className="flex items-center gap-3.5 group">
              <div className="w-9 h-9 rounded-xl bg-primary/8 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-all duration-300 shadow-sm shadow-primary/5">
                <Mail className="w-4.5 h-4.5" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-on-surface-variant/60 font-semibold uppercase tracking-wider">Email</span>
                <a href="mailto:pawhome16@gmail.com" className="hover:text-primary transition-colors text-sm break-all font-bold text-on-surface/90">
                  pawhome16@gmail.com
                </a>
              </div>
            </li>
            <li className="flex items-center gap-3.5 group">
              <div className="w-9 h-9 rounded-xl bg-primary/8 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-all duration-300 shadow-sm shadow-primary/5">
                <Phone className="w-4.5 h-4.5" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-on-surface-variant/60 font-semibold uppercase tracking-wider">Hotline</span>
                <a href="tel:0375710464" className="hover:text-primary transition-colors text-sm font-bold text-on-surface/90">
                  037 571 0464
                </a>
              </div>
            </li>
            <li className="flex items-center gap-3.5 group">
              <div className="w-9 h-9 rounded-xl bg-primary/8 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-all duration-300 shadow-sm shadow-primary/5">
                <MapPin className="w-4.5 h-4.5" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-on-surface-variant/60 font-semibold uppercase tracking-wider">Địa chỉ</span>
                <span className="text-sm font-bold text-on-surface/90">
                  Đà Nẵng, Việt Nam
                </span>
              </div>
            </li>
          </ul>

          <div className="mt-8 pt-6 border-t border-outline-variant/30">
            <h5 className="font-bold text-on-surface mb-3.5 text-xs uppercase tracking-wider opacity-85">Tải ứng dụng PAW Home</h5>
            <div className="flex gap-3">
              <a href="#" className="flex-1 bg-black text-white px-3 py-2 rounded-xl flex items-center justify-center gap-2.5 hover:bg-neutral-900 hover:-translate-y-0.5 transition-all duration-300 border border-neutral-800/80 shadow-md">
                <img src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Apple_logo_black.svg" className="w-4 h-4 invert" alt="Apple" />
                <div className="text-left">
                  <p className="text-[8px] leading-none opacity-60">Download on the</p>
                  <p className="text-xs font-bold leading-none mt-1">App Store</p>
                </div>
              </a>
              <a href="#" className="flex-1 bg-black text-white px-3 py-2 rounded-xl flex items-center justify-center gap-2.5 hover:bg-neutral-900 hover:-translate-y-0.5 transition-all duration-300 border border-neutral-800/80 shadow-md">
                <img src="https://upload.wikimedia.org/wikipedia/commons/d/d7/Google_Play_Store_badge_EN.svg" className="w-4 h-4" alt="Google Play" />
                <div className="text-left">
                  <p className="text-[8px] leading-none opacity-60">GET IT ON</p>
                  <p className="text-xs font-bold leading-none mt-1">Google Play</p>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-container-max mx-auto pt-8 border-t border-outline-variant/60 flex flex-col sm:flex-row justify-between items-center gap-4 relative z-10">
        <p className="text-xs text-on-surface-variant/70 font-medium">
          © {new Date().getFullYear()} PAW Home. Bảo lưu mọi quyền.
        </p>
        <div className="flex items-center gap-6 text-xs text-on-surface-variant/70">
          <a href="#" className="hover:text-primary transition-colors">Điều khoản sử dụng</a>
          <span className="w-1 h-1 rounded-full bg-outline-variant/40" />
          <a href="#" className="hover:text-primary transition-colors">Chính sách bảo mật</a>
          <span className="w-1 h-1 rounded-full bg-outline-variant/40" />
          <a href="#" className="hover:text-primary transition-colors">Cookies</a>
        </div>
      </div>
    </footer>
  );
};
