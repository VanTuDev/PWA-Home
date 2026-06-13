import React, { useState, useEffect } from 'react';
import { ClipboardList, Check, X, ShieldAlert, Phone, Eye, Calendar, MapPin, Briefcase, DollarSign, Home, Heart, Award, ArrowUpRight, User, Truck, FileText, CreditCard, Camera, AlertTriangle, Bell, RefreshCw, Loader2 } from 'lucide-react';
import { toast } from '../../utils/toast';
import { confirm } from '../ConfirmDialog';

interface Pet {
  id: string;
  name: string;
  breed: string;
  image: string;
  status: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
}

interface TrackingReport {
  weekNumber: number;
  image: string;
  comment: string;
  submittedAt: string;
}

interface AdoptionApplication {
  id: string;
  petId: Pet;
  userId: User;
  fullName: string;
  phone: string;
  facebookLink?: string;
  job: string;
  monthlyIncome: string;
  address: string;
  housingType: string;
  experience: string;
  reason: string;
  idCardFront?: string;
  idCardBack?: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'FollowUp';
  deliveryOption: 'pickup' | 'shipping';
  submittedAt: string;
  trackingReports?: TrackingReport[];
}

const STATUS_STYLE: Record<string, string> = {
  Pending:  'bg-amber-50 text-amber-700 border-amber-100',
  Approved: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  Rejected: 'bg-rose-50 text-rose-700 border-rose-100',
  FollowUp: 'bg-sky-50 text-sky-700 border-sky-100'
};

const STATUS_TEXT: Record<string, string> = {
  Pending:  'Chờ duyệt',
  Approved: 'Đã duyệt',
  Rejected: 'Từ chối',
  FollowUp: 'Theo dõi'
};

const getToken = () => localStorage.getItem('paw_token') || '';
const authHeader = () => ({
  Authorization: `Bearer ${getToken()}`,
  'Content-Type': 'application/json'
});

const BE_URL = (import.meta as any).env?.DEV ? 'http://localhost:5000' : 'https://pwa-home-be.onrender.com';
const imgSrcA = (img?: string) => {
  if (!img) return '';
  if (img.startsWith('http')) return img;
  return `${BE_URL}${img.startsWith('/') ? img : `/${img}`}`;
};

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

export const ApplicationsTab: React.FC = () => {
  const [applications, setApplications] = useState<AdoptionApplication[]>([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');
  const [selectedApp, setSelectedApp]   = useState<AdoptionApplication | null>(null);
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null);
  const [actioning, setActioning]       = useState(false);
  const [activeTab, setActiveTab]       = useState<'applications' | 'tracking' | 'warnings'>('applications');
  const [overdueList,  setOverdueList]  = useState<any[]>([]);
  const [overdueLoading, setOverdueLoading] = useState(false);
  const [warningSending, setWarningSending] = useState(false);

  const loadApplications = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/adoptions', { headers: authHeader() });
      const data = await res.json();
      if (res.ok) {
        setApplications(Array.isArray(data) ? data : []);
      } else {
        setError(data.message || 'Lỗi tải danh sách hồ sơ nhận nuôi.');
      }
    } catch {
      setError('Không thể kết nối máy chủ.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, []);

  const loadOverdue = async () => {
    setOverdueLoading(true);
    try {
      const r = await fetch('/api/adoptions/overdue', { headers: authHeader() });
      if (r.ok) setOverdueList(await r.json());
    } catch { /* silent */ }
    finally { setOverdueLoading(false); }
  };

  useEffect(() => {
    if (activeTab === 'warnings') loadOverdue();
  }, [activeTab]);

  const sendWarnings = async () => {
    setWarningSending(true);
    try {
      const r = await fetch('/api/adoptions/warn-overdue', { method: 'POST', headers: authHeader() });
      const d = await r.json();
      toast.success(d.message || 'Đã gửi cảnh báo thành công.');
      loadOverdue();
    } catch { toast.error('Lỗi kết nối.'); }
    finally { setWarningSending(false); }
  };

  const handleUpdateStatus = async (appId: string, newStatus: 'Approved' | 'Rejected' | 'FollowUp') => {
    const ok = await confirm({ message: `Xác nhận cập nhật trạng thái đơn thành "${STATUS_TEXT[newStatus]}"?` });
    if (!ok) return;
    setActioning(true);
    try {
      const res = await fetch(`/api/adoptions/${appId}/status`, {
        method: 'PUT',
        headers: authHeader(),
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (res.ok) {
        // Update local status
        setApplications(prev => prev.map(app => app.id === appId ? { ...app, status: newStatus } : app));
        if (selectedApp?.id === appId) {
          setSelectedApp(prev => prev ? { ...prev, status: newStatus } : null);
        }
        toast.success('Cập nhật trạng thái hồ sơ thành công!');
      } else {
        toast.error(data.message || 'Thao tác cập nhật thất bại.');
      }
    } catch {
      toast.error('Lỗi kết nối máy chủ khi duyệt hồ sơ.');
    } finally {
      setActioning(false);
    }
  };

  const imgSrc = imgSrcA;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl sm:text-3xl font-black text-on-surface tracking-tighter">Đơn đăng ký nhận nuôi</h1>
          <p className="text-sm text-on-surface-variant font-medium mt-1">
            {loading ? '...' : `${applications.length} hồ sơ · ${applications.filter(a => a.status === 'Approved').length} đã duyệt · ${applications.filter(a => a.status === 'Pending').length} chờ duyệt`}
          </p>
        </div>
        {/* Tab switcher */}
        <div className="flex gap-2 bg-surface-container rounded-2xl p-1.5 flex-wrap">
          <button onClick={() => setActiveTab('applications')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all ${activeTab === 'applications' ? 'bg-white text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}>
            <ClipboardList className="w-4 h-4" /> Tất cả đơn
          </button>
          <button onClick={() => setActiveTab('tracking')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all ${activeTab === 'tracking' ? 'bg-white text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}>
            <Camera className="w-4 h-4" /> Theo dõi
            {applications.filter(a => a.status === 'Approved' || a.status === 'FollowUp').length > 0 && (
              <span className="bg-primary text-on-primary text-[10px] font-black px-1.5 py-0.5 rounded-full">
                {applications.filter(a => a.status === 'Approved' || a.status === 'FollowUp').length}
              </span>
            )}
          </button>
          <button onClick={() => setActiveTab('warnings')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all ${activeTab === 'warnings' ? 'bg-white text-error shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}>
            <AlertTriangle className="w-4 h-4" /> Cảnh báo
            {overdueList.length > 0 && (
              <span className="bg-error text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">
                {overdueList.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-sm font-semibold flex items-center gap-2">
          <ShieldAlert className="w-5 h-5" /> {error}
        </div>
      )}

      {/* ── Tracking Tab ── */}
      {activeTab === 'tracking' && (
        <TrackingView
          applications={applications.filter(a => a.status === 'Approved' || a.status === 'FollowUp')}
          imgSrc={imgSrc}
          onEnlarge={setEnlargedImage}
        />
      )}

      {/* ── Warnings Tab ── */}
      {activeTab === 'warnings' && (
        <div className="space-y-4">
          {/* Header */}
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 flex items-start gap-4">
            <AlertTriangle className="w-6 h-6 text-rose-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold text-rose-700">Người dùng chưa hoàn thành nhiệm vụ theo dõi</p>
              <p className="text-sm text-rose-600 mt-0.5">
                Danh sách người dùng có đơn được duyệt nhưng chưa đăng ảnh cập nhật hàng tuần đúng hạn (trễ ≥ 3 ngày).
                Cron tự động gửi cảnh báo lúc 9:00 sáng mỗi ngày.
              </p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button onClick={loadOverdue} disabled={overdueLoading}
                className="flex items-center gap-1.5 px-3 py-2 bg-white border border-rose-200 text-rose-600 rounded-xl text-xs font-bold hover:bg-rose-50 transition-all">
                {overdueLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                Làm mới
              </button>
              <button onClick={sendWarnings} disabled={warningSending || overdueList.length === 0}
                className="flex items-center gap-1.5 px-4 py-2 bg-rose-500 text-white rounded-xl text-xs font-bold hover:bg-rose-600 disabled:opacity-40 transition-all">
                {warningSending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Bell className="w-3.5 h-3.5" />}
                Gửi cảnh báo ngay
              </button>
            </div>
          </div>

          {overdueLoading ? (
            <div className="py-16 text-center"><Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" /></div>
          ) : overdueList.length === 0 ? (
            <div className="py-16 text-center text-on-surface-variant">
              <Check className="w-12 h-12 mx-auto mb-3 text-emerald-400" />
              <p className="font-bold">Tất cả người dùng đều đang hoàn thành nhiệm vụ đúng hạn!</p>
            </div>
          ) : (
            <div className="bg-white rounded-[28px] border border-outline-variant overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-rose-50 text-[10px] uppercase font-black text-rose-600 tracking-[0.15em] border-b border-rose-100">
                      <th className="px-6 py-4">Người dùng</th>
                      <th className="px-6 py-4">Thú cưng</th>
                      <th className="px-6 py-4">Tuần kỳ vọng</th>
                      <th className="px-6 py-4">Đã hoàn thành</th>
                      <th className="px-6 py-4">Tuần thiếu</th>
                      <th className="px-6 py-4">Trễ (ngày)</th>
                      <th className="px-6 py-4">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant">
                    {overdueList.map(item => (
                      <tr key={item.adoptionId} className="hover:bg-rose-50/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {item.user?.avatar ? (
                              <img src={imgSrc(item.user.avatar)} className="w-9 h-9 rounded-xl object-cover flex-shrink-0"
                                onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} alt="" />
                            ) : (
                              <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center font-black text-sm flex-shrink-0">
                                {(item.user?.name || '?').charAt(0)}
                              </div>
                            )}
                            <div>
                              <p className="font-bold text-sm text-on-surface">{item.user?.name || 'N/A'}</p>
                              <p className="text-[10px] text-on-surface-variant">{item.user?.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {item.pet?.image && (
                              <img src={imgSrc(item.pet.image)} className="w-8 h-8 rounded-lg object-cover"
                                onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} alt="" />
                            )}
                            <div>
                              <p className="font-semibold text-sm">{item.pet?.name || 'N/A'}</p>
                              <p className="text-[10px] text-on-surface-variant">{item.pet?.breed}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-black text-sm text-on-surface">Tuần {item.expectedWeek}</span>
                          <p className="text-[10px] text-on-surface-variant">{item.daysSince} ngày từ khi duyệt</p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5">
                            <span className="font-black text-lg text-emerald-600">{item.completedCount}</span>
                            <span className="text-on-surface-variant text-sm">/4 tuần</span>
                          </div>
                          <div className="h-1.5 w-16 bg-surface-container rounded-full mt-1 overflow-hidden">
                            <div className="h-full bg-emerald-400 rounded-full"
                              style={{ width: `${(item.completedCount / 4) * 100}%` }} />
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-1 flex-wrap">
                            {item.missingWeeks.map((w: number) => (
                              <span key={w} className="bg-rose-100 text-rose-700 text-[10px] font-black px-2 py-0.5 rounded-full">
                                Tuần {w}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`font-black text-sm ${item.daysOverdue >= 7 ? 'text-rose-600' : 'text-amber-600'}`}>
                            {item.daysOverdue} ngày
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider ${STATUS_STYLE[item.status]}`}>
                            {STATUS_TEXT[item.status]}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Applications Table ── */}
      {activeTab === 'applications' && (
      <div className="bg-white rounded-[32px] border border-outline-variant shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-on-surface-variant font-medium animate-pulse">Đang tải danh sách hồ sơ...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-surface-container-low text-[10px] uppercase font-black text-on-surface-variant tracking-[0.2em] border-b border-outline-variant">
                  <th className="px-8 py-5 text-left">Người đăng ký</th>
                  <th className="px-8 py-5 text-left">Thú cưng</th>
                  <th className="px-8 py-5 text-left">Thông tin liên hệ</th>
                  <th className="px-8 py-5 text-left">Ngày gửi</th>
                  <th className="px-8 py-5 text-left">Hình thức</th>
                  <th className="px-8 py-5 text-left">Trạng thái</th>
                  <th className="px-8 py-5 text-center">Chi tiết</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {applications.map(app => (
                  <tr key={app.id} className="hover:bg-surface-container-lowest transition-colors">
                    <td className="px-8 py-5">
                      <p className="font-bold text-on-surface">{app.fullName}</p>
                      <p className="text-xs text-on-surface-variant mt-0.5">{app.job}</p>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl overflow-hidden shadow-sm flex-shrink-0">
                          <img src={imgSrc(app.petId?.image)} className="w-full h-full object-cover" alt={app.petId?.name} />
                        </div>
                        <div>
                          <p className="font-bold text-on-surface">{app.petId?.name || 'Bé cũ'}</p>
                          <p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider">{app.petId?.breed || 'Thú cưng'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <p className="text-sm font-bold text-on-surface flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-on-surface-variant" />
                        {app.phone}
                      </p>
                      {app.facebookLink && (
                        <a href={app.facebookLink} target="_blank" rel="noreferrer" className="text-xs text-primary font-bold hover:underline flex items-center gap-0.5 mt-0.5">
                          Facebook <ArrowUpRight className="w-3 h-3" />
                        </a>
                      )}
                    </td>
                    <td className="px-8 py-5 text-sm font-medium text-on-surface-variant">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(app.submittedAt).toLocaleDateString('vi-VN')}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-xs font-bold text-on-surface-variant bg-surface-container-high px-2.5 py-1 rounded-xl">
                        {app.deliveryOption === 'pickup' ? 'Nhận tại trạm' : 'Ship tận nơi'}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`text-[10px] font-black px-2.5 py-1.5 rounded-xl uppercase tracking-widest border border-current ${STATUS_STYLE[app.status]}`}>
                        {STATUS_TEXT[app.status]}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <button 
                        onClick={() => setSelectedApp(app)}
                        className="p-2.5 hover:bg-primary-fixed rounded-xl text-primary hover:text-on-primary-fixed transition-colors"
                        title="Xem hồ sơ chi tiết"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!loading && applications.length === 0 && (
              <div className="py-20 text-center text-on-surface-variant font-medium">
                Chưa có hồ sơ nhận nuôi nào được gửi lên hệ thống.
              </div>
            )}
          </div>
        )}
      </div>
      )} {/* end activeTab === 'applications' */}

      {/* ── Details Expansion Drawer / Modal ───────────────────────────────── */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/40 backdrop-blur-sm p-0 md:p-4">
          <div className="bg-white w-full max-w-2xl h-full md:h-[95vh] md:rounded-[40px] shadow-2xl flex flex-col overflow-hidden animate-slide-in">
            {/* Header */}
            <div className="px-8 pt-7 pb-5 border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
              <div>
                <h2 className="text-xl font-black text-on-surface flex items-center gap-2">
                  <ClipboardList className="w-5.5 h-5.5 text-primary" /> Hồ sơ ứng tuyển nhận nuôi
                </h2>
                <p className="text-xs text-on-surface-variant mt-0.5">Mã hồ sơ: {selectedApp.id}</p>
              </div>
              <button 
                onClick={() => setSelectedApp(null)}
                className="p-2 hover:bg-surface-container rounded-xl transition-colors"
              >
                <X className="w-5.5 h-5.5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
              {/* Pet Info Banner */}
              <div className="bg-primary/5 rounded-[28px] border border-primary/10 p-5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-sm flex-shrink-0">
                    <img src={imgSrc(selectedApp.petId?.image)} className="w-full h-full object-cover" alt={selectedApp.petId?.name} />
                  </div>
                  <div>
                    <h3 className="font-black text-primary text-lg">{selectedApp.petId?.name || 'Bé cưng'}</h3>
                    <p className="text-sm text-on-surface-variant font-bold flex items-center gap-1.5 mt-0.5">
                      <Award className="w-4 h-4" /> {selectedApp.petId?.breed || 'Thú cưng'} • {selectedApp.petId?.status === 'Adopted' ? 'Đã được nhận' : 'Chờ về nhà mới'}
                    </p>
                  </div>
                </div>
                <span className={`text-[10px] font-black px-3 py-1.5 rounded-xl uppercase tracking-widest border border-current ${STATUS_STYLE[selectedApp.status]}`}>
                  {STATUS_TEXT[selectedApp.status]}
                </span>
              </div>

              {/* Grid 2 Column Personal Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-surface-container-low rounded-2xl p-5 space-y-3.5 border border-outline-variant">
                  <h4 className="text-[10px] font-black text-on-surface-variant uppercase tracking-wider mb-2">Thông tin cá nhân</h4>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center flex-shrink-0 text-primary border border-outline-variant">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-on-surface-variant uppercase">Họ và tên</p>
                      <p className="text-sm font-black text-on-surface mt-0.5">{selectedApp.fullName}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center flex-shrink-0 text-primary border border-outline-variant">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-on-surface-variant uppercase">Số điện thoại</p>
                      <p className="text-sm font-black text-on-surface mt-0.5">{selectedApp.phone}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center flex-shrink-0 text-primary border border-outline-variant">
                      <Briefcase className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-on-surface-variant uppercase">Công việc</p>
                      <p className="text-sm font-black text-on-surface mt-0.5">{selectedApp.job}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center flex-shrink-0 text-primary border border-outline-variant">
                      <DollarSign className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-on-surface-variant uppercase">Thu nhập tháng</p>
                      <p className="text-sm font-black text-on-surface mt-0.5">{selectedApp.monthlyIncome}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-surface-container-low rounded-2xl p-5 space-y-3.5 border border-outline-variant">
                  <h4 className="text-[10px] font-black text-on-surface-variant uppercase tracking-wider mb-2">Môi trường sống</h4>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center flex-shrink-0 text-primary border border-outline-variant">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-on-surface-variant uppercase">Địa chỉ thường trú</p>
                      <p className="text-sm font-black text-on-surface mt-0.5 leading-relaxed">{selectedApp.address}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center flex-shrink-0 text-primary border border-outline-variant">
                      <Home className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-on-surface-variant uppercase">Loại hình nhà ở</p>
                      <p className="text-sm font-black text-on-surface mt-0.5">{selectedApp.housingType}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center flex-shrink-0 text-primary border border-outline-variant">
                      <Heart className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-on-surface-variant uppercase">Kinh nghiệm nuôi</p>
                      <p className="text-sm font-black text-on-surface mt-0.5">{selectedApp.experience}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center flex-shrink-0 text-primary border border-outline-variant">
                      <Truck className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-on-surface-variant uppercase">Hình thức nhận bé</p>
                      <p className="text-sm font-black text-on-surface mt-0.5">{selectedApp.deliveryOption === 'pickup' ? 'Nhận tại trạm' : 'Vận chuyển (Ship)'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Reason box */}
              <div className="bg-surface-container-low rounded-2xl p-5 border border-outline-variant space-y-2">
                <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-4 h-4" /> Lý do muốn nhận nuôi
                </p>
                <p className="text-sm font-medium text-on-surface leading-relaxed p-3 bg-white rounded-xl border border-outline-variant/60 whitespace-pre-line italic">
                  "{selectedApp.reason || 'Không cung cấp lý do chi tiết.'}"
                </p>
              </div>

              {/* ID Cards front/back verification images */}
              <div className="space-y-4">
                <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-wider flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4" /> Bản scan CMND / CCCD xác minh danh tính
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {selectedApp.idCardFront ? (
                    <div 
                      onClick={() => setEnlargedImage(imgSrc(selectedApp.idCardFront!))}
                      className="group aspect-[1.6/1] bg-surface rounded-2xl overflow-hidden border border-outline-variant shadow-sm relative cursor-zoom-in"
                    >
                      <img src={imgSrc(selectedApp.idCardFront)} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" alt="CMND trước" />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold gap-1.5 transition-opacity">
                        <Eye className="w-4 h-4" /> Nhấn để phóng to
                      </div>
                    </div>
                  ) : (
                    <div className="aspect-[1.6/1] bg-surface rounded-2xl border border-outline-variant flex items-center justify-center text-xs font-medium text-on-surface-variant italic">
                      Chưa tải lên mặt trước
                    </div>
                  )}

                  {selectedApp.idCardBack ? (
                    <div 
                      onClick={() => setEnlargedImage(imgSrc(selectedApp.idCardBack!))}
                      className="group aspect-[1.6/1] bg-surface rounded-2xl overflow-hidden border border-outline-variant shadow-sm relative cursor-zoom-in"
                    >
                      <img src={imgSrc(selectedApp.idCardBack)} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" alt="CMND sau" />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold gap-1.5 transition-opacity">
                        <Eye className="w-4 h-4" /> Nhấn để phóng to
                      </div>
                    </div>
                  ) : (
                    <div className="aspect-[1.6/1] bg-surface rounded-2xl border border-outline-variant flex items-center justify-center text-xs font-medium text-on-surface-variant italic">
                      Chưa tải lên mặt sau
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Actions Footer */}
            {selectedApp.status === 'Pending' && (
              <div className="px-8 py-6 bg-surface-container-low border-t border-outline-variant flex gap-4">
                <button
                  onClick={() => handleUpdateStatus(selectedApp.id, 'Rejected')}
                  disabled={actioning}
                  className="flex-1 py-4 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-2xl font-bold flex items-center justify-center gap-2 border border-rose-200 transition-all disabled:opacity-50"
                >
                  <X className="w-5 h-5" /> Từ chối hồ sơ
                </button>
                <button
                  onClick={() => handleUpdateStatus(selectedApp.id, 'FollowUp')}
                  disabled={actioning}
                  className="py-4 px-6 border border-outline-variant hover:bg-surface-container-high rounded-2xl font-bold text-on-surface-variant transition-all disabled:opacity-50"
                >
                  Cần theo dõi thêm
                </button>
                <button
                  onClick={() => handleUpdateStatus(selectedApp.id, 'Approved')}
                  disabled={actioning}
                  className="flex-1 py-4 bg-emerald-600 text-white hover:bg-emerald-700 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all disabled:opacity-50"
                >
                  <Check className="w-5 h-5" /> Phê duyệt nhận nuôi
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Enlarged Image Overlay ────────────────────────────────────────── */}
      {enlargedImage && (
        <div 
          onClick={() => setEnlargedImage(null)}
          className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 cursor-zoom-out animate-fade-in"
        >
          <div className="max-w-4xl max-h-[90vh] relative">
            <img src={enlargedImage} className="w-full h-auto max-h-[90vh] object-contain rounded-2xl shadow-2xl" alt="Enlarged Scan" />
            <button 
              onClick={() => setEnlargedImage(null)}
              className="absolute -top-4 -right-4 bg-white/10 hover:bg-white/20 p-2.5 rounded-full text-white backdrop-blur-md transition-all shadow-md"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Tracking View Component ────────────────────────────────────────────────
const TrackingView: React.FC<{
  applications: AdoptionApplication[];
  imgSrc: (s?: string) => string;
  onEnlarge: (url: string) => void;
}> = ({ applications, imgSrc, onEnlarge }) => {
  const [detail, setDetail] = React.useState<AdoptionApplication | null>(null);

  if (applications.length === 0) {
    return (
      <div className="bg-white rounded-[32px] border border-outline-variant p-16 text-center shadow-sm">
        <Camera className="w-12 h-12 mx-auto mb-3 text-on-surface-variant opacity-30" />
        <p className="font-bold text-on-surface-variant">Chưa có ca nào đang theo dõi</p>
        <p className="text-sm text-on-surface-variant mt-1 opacity-60">Các đơn được duyệt sẽ xuất hiện ở đây.</p>
      </div>
    );
  }

  return (
    <>
    <div className="space-y-6">
      {applications.map(app => {
        const reports = app.trackingReports ?? [];
        const pct = Math.min(100, Math.round((reports.length / 4) * 100));
        return (
          <div key={app.id} className="bg-white rounded-[32px] border border-outline-variant shadow-sm overflow-hidden">
            {/* Header — clickable */}
            <div className="p-6 border-b border-outline-variant bg-surface-container-lowest flex items-center gap-4 cursor-pointer hover:bg-primary/5 transition-colors"
              onClick={() => setDetail(app)}>
              {app.petId?.image ? (
                <img src={imgSrc(app.petId.image)} className="w-14 h-14 rounded-2xl object-cover flex-shrink-0"
                  onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} alt="" />
              ) : (
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Camera className="w-6 h-6 text-primary opacity-40" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-black text-on-surface">{app.fullName || 'N/A'}</h3>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border border-current ${STATUS_STYLE[app.status]}`}>
                    {STATUS_TEXT[app.status]}
                  </span>
                </div>
                <p className="text-sm text-on-surface-variant mt-0.5">
                  {app.petId ? `Bé ${app.petId.name} (${app.petId.breed})` : 'N/A'} · Ngày duyệt: {app.submittedAt ? new Date(app.submittedAt).toLocaleDateString('vi-VN') : 'N/A'}
                </p>
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex-1 h-1.5 bg-surface-container rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs font-bold text-primary whitespace-nowrap">{reports.length}/4 tuần · {pct}%</span>
                </div>
              </div>
              <Eye className="w-5 h-5 text-primary opacity-60 flex-shrink-0" title="Xem lịch sử nhiệm vụ" />
            </div>

            {/* Reports grid */}
            {reports.length === 0 ? (
              <p className="text-center py-8 text-sm text-on-surface-variant italic">Chủ nuôi chưa gửi báo cáo tuần nào.</p>
            ) : (
              <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                {reports
                  .slice()
                  .sort((a, b) => a.weekNumber - b.weekNumber)
                  .map(r => (
                    <div key={r.weekNumber} className="space-y-2">
                      <div className="relative group cursor-zoom-in rounded-2xl overflow-hidden aspect-square bg-surface-container"
                        onClick={() => r.image && onEnlarge(imgSrc(r.image))}>
                        {r.image ? (
                          <img src={imgSrc(r.image)} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" alt={`Tuần ${r.weekNumber}`}
                            onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Camera className="w-8 h-8 text-on-surface-variant opacity-30" />
                          </div>
                        )}
                        <div className="absolute top-2 left-2 bg-black/60 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                          Tuần {r.weekNumber}
                        </div>
                      </div>
                      <p className="text-xs text-on-surface-variant leading-relaxed">
                        {r.comment || <span className="italic opacity-50">Không có ghi chú</span>}
                      </p>
                      <p className="text-[10px] text-on-surface-variant opacity-60">
                        {r.submittedAt ? new Date(r.submittedAt).toLocaleDateString('vi-VN') : ''}
                      </p>
                    </div>
                  ))}
                {/* Empty slots */}
                {Array.from({ length: Math.max(0, 4 - reports.length) }).map((_, i) => (
                  <div key={`empty-${i}`} className="aspect-square rounded-2xl border-2 border-dashed border-outline-variant flex items-center justify-center">
                    <span className="text-xs text-on-surface-variant opacity-40">Tuần {reports.length + i + 1}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>

    {/* ── Task History Modal ── */}
    {detail && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)' }}
        onClick={() => setDetail(null)}>
        <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
          onClick={e => e.stopPropagation()}>
          {/* Modal header */}
          <div className="p-6 border-b border-outline-variant bg-surface-container-lowest flex items-center gap-4">
            {detail.petId?.image ? (
              <img src={imgSrc(detail.petId.image)} className="w-14 h-14 rounded-2xl object-cover flex-shrink-0" alt="" />
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Camera className="w-6 h-6 text-primary opacity-40" />
              </div>
            )}
            <div className="flex-1">
              <h3 className="font-black text-on-surface text-lg">{detail.fullName}</h3>
              <p className="text-sm text-on-surface-variant">
                {detail.petId ? `Bé ${detail.petId.name} (${detail.petId.breed})` : 'N/A'} · {detail.phone}
              </p>
            </div>
            <button onClick={() => setDetail(null)} className="p-2 hover:bg-surface-container rounded-xl transition-colors">
              <X className="w-5 h-5 text-on-surface-variant" />
            </button>
          </div>
          {/* Timeline */}
          <div className="p-6 overflow-y-auto space-y-5">
            <div className="grid grid-cols-4 gap-1 mb-4">
              {[1,2,3,4].map(w => {
                const done = (detail.trackingReports ?? []).some(r => r.weekNumber === w);
                return (
                  <div key={w} className={`text-center py-2 rounded-xl text-xs font-black ${done ? 'bg-emerald-100 text-emerald-700' : 'bg-surface-container text-on-surface-variant'}`}>
                    Tuần {w}{done ? ' ✓' : ''}
                  </div>
                );
              })}
            </div>
            {(detail.trackingReports ?? []).length === 0 ? (
              <p className="text-center py-12 text-on-surface-variant italic text-sm">Chưa có báo cáo nào.</p>
            ) : (
              [...(detail.trackingReports ?? [])].sort((a,b) => a.weekNumber - b.weekNumber).map(r => (
                <div key={r.weekNumber} className="flex gap-4 p-4 bg-surface-container-low rounded-2xl">
                  {r.image ? (
                    <img src={imgSrc(r.image)} className="w-28 h-28 rounded-xl object-cover flex-shrink-0 cursor-zoom-in"
                      onClick={() => onEnlarge(imgSrc(r.image))} alt={`Tuần ${r.weekNumber}`}
                      onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  ) : (
                    <div className="w-28 h-28 rounded-xl bg-surface-container flex items-center justify-center flex-shrink-0">
                      <Camera className="w-8 h-8 text-on-surface-variant opacity-30" />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-primary text-on-primary text-xs font-black px-2.5 py-1 rounded-full">Tuần {r.weekNumber}</span>
                      <span className="text-xs text-on-surface-variant">{r.submittedAt ? new Date(r.submittedAt).toLocaleDateString('vi-VN', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' }) : ''}</span>
                    </div>
                    <p className="text-sm text-on-surface leading-relaxed">
                      {r.comment || <span className="italic text-on-surface-variant opacity-60">Không có ghi chú</span>}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    )}
    </>
  );
};
