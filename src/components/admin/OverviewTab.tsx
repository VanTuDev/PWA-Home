import React, { useEffect, useState } from 'react';
import {
  PawPrint, ClipboardList, TrendingUp, Clock,
  CheckCircle, AlertCircle, Loader2, Camera, Calendar, X, ZoomIn,
  Receipt, ChevronDown,
} from 'lucide-react';

const getToken = () => localStorage.getItem('paw_token') || '';
const authH   = () => ({ Authorization: `Bearer ${getToken()}` });

const BE_URL = (import.meta as any).env?.DEV ? 'http://localhost:5000' : 'https://pwa-home-be.onrender.com';
const imgSrc = (img?: string) => {
  if (!img) return '';
  if (img.startsWith('http')) return img;
  return `${BE_URL}${img.startsWith('/') ? img : `/${img}`}`;
};

const fmt = (d: string) =>
  new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

const fmtMoney = (n: number) =>
  n >= 1_000_000
    ? `${(n / 1_000_000).toFixed(1)}M`
    : n >= 1_000 ? `${(n / 1_000).toFixed(0)}K` : String(n);

interface PetData   { id: string; name: string; image: string; status: string; breed: string }
interface UserData  { name: string; email: string; avatar?: string }
interface AdoptionData {
  id: string; status: string; submittedAt: string; fullName: string;
  petId?: PetData; userId?: UserData;
  trackingReports?: { weekNumber: number; image: string; comment: string; submittedAt: string }[];
}
interface DonationData {
  id: string; amount: number; status: string; createdAt: string;
  donorName: string; donorEmail: string; message: string; type: string;
  billImage?: string;
  petId?: { name: string; image: string; breed: string } | null;
  userId?: { name: string; email: string; avatar?: string } | null;
}

const STATUS_STYLE: Record<string, string> = {
  Pending:  'bg-amber-100 text-amber-700',
  Approved: 'bg-emerald-100 text-emerald-700',
  Rejected: 'bg-rose-100 text-rose-700',
  FollowUp: 'bg-sky-100 text-sky-700',
};
const STATUS_TEXT: Record<string, string> = {
  Pending: 'Chờ duyệt', Approved: 'Đã duyệt', Rejected: 'Từ chối', FollowUp: 'Theo dõi',
};

export const OverviewTab: React.FC = () => {
  const [pets,      setPets]      = useState<PetData[]>([]);
  const [adoptions, setAdoptions] = useState<AdoptionData[]>([]);
  const [donations, setDonations] = useState<DonationData[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [errors,    setErrors]    = useState<string[]>([]);
  const [selectedTracking, setSelectedTracking] = useState<AdoptionData | null>(null);
  const [selectedDonation, setSelectedDonation] = useState<DonationData | null>(null);
  const [donationPage,     setDonationPage]     = useState(1);
  const [enlargedImg,      setEnlargedImg]      = useState<string | null>(null);
  const DONATIONS_PER_PAGE = 7;

  useEffect(() => {
    const errs: string[] = [];
    Promise.allSettled([
      fetch('/api/pets', { headers: authH() }).then(r => r.json()).then(setPets).catch(() => errs.push('pets')),
      fetch('/api/adoptions', { headers: authH() }).then(r => r.json()).then(d => setAdoptions(Array.isArray(d) ? d : [])).catch(() => errs.push('adoptions')),
      fetch('/api/donations', { headers: authH() }).then(r => r.json()).then(d => setDonations(Array.isArray(d) ? d : [])).catch(() => errs.push('donations')),
    ]).then(() => { setErrors(errs); setLoading(false); });
  }, []);

  // ── Computed stats ─────────────────────────────────────────────────────────
  const totalPets    = pets.length;
  const readyPets    = pets.filter(p => p.status === 'Ready').length;
  const adoptedPets  = pets.filter(p => p.status === 'Adopted').length;
  const pendingApps  = adoptions.filter(a => a.status === 'Pending').length;
  const followUpApps = adoptions.filter(a => a.status === 'FollowUp').length;

  const now        = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthlyDonation = donations
    .filter(d => d.status === 'paid' && new Date(d.createdAt) >= monthStart)
    .reduce((s, d) => s + d.amount, 0);

  const recentAdoptions = [...adoptions]
    .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
    .slice(0, 5);

  // Approved/FollowUp có trackingReports
  const trackingAdoptions = adoptions
    .filter(a => (a.status === 'Approved' || a.status === 'FollowUp') && a.petId)
    .sort((a, b) => (b.trackingReports?.length ?? 0) - (a.trackingReports?.length ?? 0))
    .slice(0, 6);

  const statCards = [
    {
      label: 'Tổng thú cưng',
      value: loading ? '—' : totalPets > 0 ? String(totalPets) : 'N/A',
      sub: loading ? '' : `${readyPets} sẵn sàng · ${adoptedPets} đã nhận`,
      icon: PawPrint,
      color: 'bg-blue-50 text-blue-600',
      err: errors.includes('pets'),
    },
    {
      label: 'Đơn chờ duyệt',
      value: loading ? '—' : errors.includes('adoptions') ? 'N/A' : String(pendingApps),
      sub: loading ? '' : errors.includes('adoptions') ? '' : `${followUpApps} cần theo dõi thêm`,
      icon: ClipboardList,
      color: 'bg-orange-50 text-orange-600',
      err: errors.includes('adoptions'),
    },
    {
      label: 'Quyên góp tháng này',
      value: loading ? '—' : errors.includes('donations') ? 'N/A' : (monthlyDonation > 0 ? fmtMoney(monthlyDonation) + 'đ' : '0đ'),
      sub: loading ? '' : errors.includes('donations') ? '' : `Tổng ${donations.filter(d => d.status === 'paid').length} giao dịch`,
      icon: TrendingUp,
      color: 'bg-green-50 text-green-600',
      err: errors.includes('donations'),
    },
    {
      label: 'Theo dõi sau nhận nuôi',
      value: loading ? '—' : errors.includes('adoptions') ? 'N/A' : String(trackingAdoptions.length),
      sub: loading ? '' : errors.includes('adoptions') ? '' : 'ca đang được theo dõi',
      icon: Clock,
      color: 'bg-purple-50 text-purple-600',
      err: false,
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-on-surface mb-1 tracking-tighter">Bảng điều khiển tổng quan</h1>
        <p className="text-on-surface-variant text-sm font-medium">
          {pendingApps > 0 ? `Có ${pendingApps} đơn đăng ký đang chờ phê duyệt.` : 'Không có đơn nào đang chờ.'}
        </p>
      </div>

      {/* ── Stats Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map(s => (
          <div key={s.label} className="bg-white p-6 rounded-[32px] border border-outline-variant shadow-sm hover:shadow-md hover:scale-[1.01] transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-2xl ${s.color}`}>
                <s.icon className="w-6 h-6" />
              </div>
              {s.err && <AlertCircle className="w-4 h-4 text-amber-400" title="Không lấy được dữ liệu" />}
            </div>
            <h3 className="text-sm font-bold text-on-surface-variant mb-1">{s.label}</h3>
            <p className="text-xl sm:text-3xl font-black text-on-surface tracking-tighter">{s.value}</p>
            {s.sub && <p className="text-xs text-on-surface-variant mt-1">{s.sub}</p>}
          </div>
        ))}
      </div>

      {/* ── Main grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Đơn gần đây */}
        <div className="lg:col-span-2 bg-white rounded-[32px] border border-outline-variant shadow-sm overflow-hidden">
          <div className="p-6 border-b border-outline-variant bg-surface-container-lowest">
            <h2 className="font-black text-xl tracking-tight">Đơn đăng ký gần nhất</h2>
          </div>
          {errors.includes('adoptions') ? (
            <p className="text-center py-10 text-on-surface-variant text-sm">N/A — không lấy được dữ liệu</p>
          ) : recentAdoptions.length === 0 ? (
            <p className="text-center py-10 text-on-surface-variant text-sm">Chưa có đơn nào.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-surface-container-low text-[10px] uppercase font-black text-on-surface-variant tracking-[0.2em] border-b border-outline-variant">
                    <th className="px-6 py-4">Người đăng ký</th>
                    <th className="px-6 py-4">Thú cưng</th>
                    <th className="px-6 py-4">Ngày gửi</th>
                    <th className="px-6 py-4">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {recentAdoptions.map(app => (
                    <tr key={app.id} className="hover:bg-surface-container-lowest transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {app.userId?.avatar ? (
                            <img src={imgSrc(app.userId.avatar)} className="w-8 h-8 rounded-xl object-cover flex-shrink-0"
                              onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} alt="" />
                          ) : (
                            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-xs font-black flex-shrink-0">
                              {(app.fullName || app.userId?.name || '?').charAt(0)}
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-bold">{app.fullName || app.userId?.name || 'N/A'}</p>
                            {app.userId?.email && <p className="text-[10px] text-on-surface-variant">{app.userId.email}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {app.petId?.image && (
                            <img src={imgSrc(app.petId.image)} className="w-7 h-7 rounded-lg object-cover"
                              onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} alt="" />
                          )}
                          <span className="text-sm font-bold text-on-surface-variant">
                            {app.petId ? `${app.petId.name} (${app.petId.breed})` : 'N/A'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-on-surface-variant">
                        <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{fmt(app.submittedAt)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider ${STATUS_STYLE[app.status] || 'bg-gray-100 text-gray-600'}`}>
                          {STATUS_TEXT[app.status] || app.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Theo dõi sau nhận nuôi */}
        <div className="bg-white rounded-[32px] border border-outline-variant p-6 shadow-sm">
          <h3 className="font-black text-lg mb-5 flex items-center gap-2 tracking-tight">
            <Clock className="w-5 h-5 text-primary" />
            Theo dõi sau nhận nuôi
          </h3>

          {errors.includes('adoptions') ? (
            <p className="text-sm text-on-surface-variant text-center py-8">N/A</p>
          ) : trackingAdoptions.length === 0 ? (
            <div className="text-center py-8 text-on-surface-variant">
              <CheckCircle className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Chưa có ca nào đang theo dõi</p>
            </div>
          ) : (
            <div className="space-y-4">
              {trackingAdoptions.map(a => {
                const reports = a.trackingReports ?? [];
                const weeks   = reports.length;
                const pct     = Math.min(100, Math.round((weeks / 4) * 100));
                const lastImg = reports[reports.length - 1]?.image;
                return (
                  <div key={a.id}
                    className="p-4 rounded-2xl border border-outline-variant hover:bg-surface-container-low hover:border-primary/30 transition-colors space-y-2 cursor-pointer"
                    onClick={() => setSelectedTracking(a)}>
                    <div className="flex items-center gap-3">
                      {lastImg ? (
                        <img src={imgSrc(lastImg)} className="w-10 h-10 rounded-xl object-cover flex-shrink-0"
                          onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} alt="" />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Camera className="w-5 h-5 text-primary opacity-40" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-on-surface truncate">{a.fullName || 'N/A'}</p>
                        <p className="text-xs text-on-surface-variant truncate">
                          {a.petId ? `Bé ${a.petId.name}` : 'N/A'} · {weeks}/4 tuần
                        </p>
                      </div>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${STATUS_STYLE[a.status]}`}>
                        {STATUS_TEXT[a.status]}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-surface-container rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full transition-all duration-700"
                        style={{ width: `${pct}%` }} />
                    </div>
                    <p className="text-[10px] text-on-surface-variant text-right">{pct}% hoàn thành</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Lịch sử thu nhập ── */}
      {(() => {
        const paidDonations = [...donations]
          .filter(d => d.status === 'paid')
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        const visibleDonations = paidDonations.slice(0, donationPage * DONATIONS_PER_PAGE);
        const hasMore = visibleDonations.length < paidDonations.length;
        return (
          <div className="bg-white rounded-[32px] border border-outline-variant shadow-sm overflow-hidden">
            <div className="p-6 border-b border-outline-variant bg-surface-container-lowest flex items-center justify-between">
              <h2 className="font-black text-xl tracking-tight flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                Lịch sử thu nhập (Quyên góp)
              </h2>
              <span className="text-xs font-bold text-on-surface-variant bg-surface-container px-3 py-1 rounded-full">
                {paidDonations.length} giao dịch
              </span>
            </div>
            {errors.includes('donations') ? (
              <p className="text-center py-10 text-on-surface-variant text-sm">N/A — không lấy được dữ liệu</p>
            ) : paidDonations.length === 0 ? (
              <p className="text-center py-10 text-on-surface-variant text-sm">Chưa có giao dịch nào.</p>
            ) : (
              <div className="p-6 space-y-3">
                {visibleDonations.map(d => {
                  const donor  = d.userId?.name || d.donorName || 'Ẩn danh';
                  const avatar = d.userId?.avatar;
                  const fmtDateTime = new Date(d.createdAt).toLocaleString('vi-VN', {
                    day: '2-digit', month: '2-digit', year: 'numeric',
                    hour: '2-digit', minute: '2-digit',
                  });
                  return (
                    <div key={d.id}
                      className="flex items-center gap-4 p-4 rounded-2xl border border-outline-variant hover:bg-surface-container-low hover:border-green-300 hover:shadow-sm cursor-pointer transition-all group"
                      onClick={() => setSelectedDonation(d)}>
                      {/* Avatar */}
                      {avatar ? (
                        <img src={imgSrc(avatar)} className="w-10 h-10 rounded-2xl object-cover flex-shrink-0"
                          onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} alt="" />
                      ) : (
                        <div className="w-10 h-10 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center text-sm font-black flex-shrink-0">
                          {donor.charAt(0)}
                        </div>
                      )}
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-bold text-on-surface">{donor}</p>
                          <span className="text-[10px] font-bold text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-full">
                            {d.type === 'adoption' ? 'Điều kiện nhận nuôi' : 'Quyên góp chung'}
                          </span>
                        </div>
                        <p className="text-xs text-on-surface-variant mt-0.5 flex items-center gap-1 truncate">
                          <Calendar className="w-3 h-3 flex-shrink-0" />
                          {fmtDateTime}
                          {d.petId && <span className="ml-1 truncate">· Bé {d.petId.name}</span>}
                        </p>
                      </div>
                      {/* Amount + bill indicator */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {d.billImage && (
                          <Receipt className="w-4 h-4 text-green-500 opacity-70 group-hover:opacity-100 transition-opacity" />
                        )}
                        <span className="text-sm font-black text-green-700">+{d.amount.toLocaleString('vi-VN')}đ</span>
                      </div>
                    </div>
                  );
                })}
                {/* Load more */}
                {hasMore && (
                  <div className="pt-2 flex justify-center">
                    <button
                      onClick={() => setDonationPage(p => p + 1)}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-2xl border border-outline-variant text-sm font-bold text-on-surface-variant hover:bg-surface-container-low hover:border-green-300 hover:text-green-700 transition-all">
                      <ChevronDown className="w-4 h-4" />
                      Tải thêm ({paidDonations.length - visibleDonations.length} giao dịch còn lại)
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })()}

      {/* ── Donation Detail Modal ── */}
      {selectedDonation && (() => {
        const d = selectedDonation;
        const donor  = d.userId?.name || d.donorName || 'Ẩn danh';
        const avatar = d.userId?.avatar;
        const email  = d.userId?.email || d.donorEmail || '';
        const fmtFull = new Date(d.createdAt).toLocaleString('vi-VN', {
          weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric',
          hour: '2-digit', minute: '2-digit', second: '2-digit',
        });
        const statusStyle = d.status === 'paid' ? 'bg-green-100 text-green-700' : d.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700';
        const statusText  = d.status === 'paid' ? 'Giao dịch thành công' : d.status === 'pending' ? 'Đang chờ' : 'Thất bại';
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)' }}
            onClick={() => setSelectedDonation(null)}>
            <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden"
              style={{ animation: 'scaleIn 0.18s ease-out' }}
              onClick={e => e.stopPropagation()}>

              {/* Header */}
              <div className="p-5 border-b border-outline-variant bg-surface-container-lowest flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-green-50 rounded-2xl">
                    <Receipt className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-black text-on-surface">Chi tiết giao dịch</h3>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${statusStyle}`}>{statusText}</span>
                  </div>
                </div>
                <button onClick={() => setSelectedDonation(null)}
                  className="p-2 hover:bg-surface-container rounded-xl transition-colors">
                  <X className="w-5 h-5 text-on-surface-variant" />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-5 space-y-5">
                {/* Donor info */}
                <div className="flex items-center gap-3 p-4 bg-surface-container-low rounded-2xl">
                  {avatar ? (
                    <img src={imgSrc(avatar)} className="w-12 h-12 rounded-2xl object-cover flex-shrink-0"
                      onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} alt="" />
                  ) : (
                    <div className="w-12 h-12 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center text-base font-black flex-shrink-0">
                      {donor.charAt(0)}
                    </div>
                  )}
                  <div>
                    <p className="font-bold text-on-surface">{donor}</p>
                    {email && <p className="text-xs text-on-surface-variant">{email}</p>}
                  </div>
                </div>

                {/* Amount + time */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 bg-green-50 rounded-2xl text-center">
                    <p className="text-xs font-bold text-green-600 mb-1">Số tiền</p>
                    <p className="text-xl font-black text-green-700">+{d.amount.toLocaleString('vi-VN')}đ</p>
                  </div>
                  <div className="p-4 bg-surface-container-low rounded-2xl text-center">
                    <p className="text-xs font-bold text-on-surface-variant mb-1">Loại</p>
                    <p className="text-sm font-black text-on-surface leading-tight">
                      {d.type === 'adoption' ? 'Điều kiện nhận nuôi' : 'Quyên góp chung'}
                    </p>
                  </div>
                </div>

                {/* Transaction time */}
                <div className="p-4 border border-outline-variant rounded-2xl">
                  <p className="text-xs font-bold text-on-surface-variant mb-1.5 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> Thời gian thực hiện giao dịch
                  </p>
                  <p className="text-sm font-bold text-on-surface">{fmtFull}</p>
                </div>

                {/* Pet info */}
                {d.petId && (
                  <div className="flex items-center gap-3 p-4 border border-outline-variant rounded-2xl">
                    {d.petId.image && (
                      <img src={imgSrc(d.petId.image)} className="w-10 h-10 rounded-xl object-cover flex-shrink-0"
                        onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} alt="" />
                    )}
                    <div>
                      <p className="text-xs font-bold text-on-surface-variant mb-0.5">Thú cưng liên quan</p>
                      <p className="text-sm font-bold text-on-surface">{d.petId.name} <span className="font-normal text-on-surface-variant">· {d.petId.breed}</span></p>
                    </div>
                  </div>
                )}

                {/* Message */}
                {d.message && (
                  <div className="p-4 bg-surface-container-low rounded-2xl">
                    <p className="text-xs font-bold text-on-surface-variant mb-1.5">Lời nhắn</p>
                    <p className="text-sm text-on-surface italic">"{d.message}"</p>
                  </div>
                )}

                {/* Bill image */}
                {d.billImage ? (
                  <div>
                    <p className="text-xs font-bold text-on-surface-variant mb-2 flex items-center gap-1">
                      <Receipt className="w-3.5 h-3.5" /> Ảnh bill chuyển khoản
                    </p>
                    <div className="relative group cursor-zoom-in rounded-2xl overflow-hidden border border-outline-variant"
                      onClick={() => setEnlargedImg(imgSrc(d.billImage!))}>
                      <img src={imgSrc(d.billImage)} className="w-full object-contain max-h-64 group-hover:brightness-90 transition-all" alt="Bill chuyển khoản" />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <ZoomIn className="w-8 h-8 text-white drop-shadow-lg" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 border-2 border-dashed border-outline-variant rounded-2xl text-center text-on-surface-variant">
                    <Receipt className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm font-bold opacity-50">Chưa có ảnh bill chuyển khoản</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── Tracking Detail Modal ── */}
      {selectedTracking && (() => {
        const a = selectedTracking;
        const reports = [...(a.trackingReports ?? [])].sort((x, y) => x.weekNumber - y.weekNumber);
        const weeks   = reports.length;
        const pct     = Math.min(100, Math.round((weeks / 4) * 100));
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)' }}
            onClick={() => setSelectedTracking(null)}>
            <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
              style={{ animation: 'scaleIn 0.18s ease-out' }}
              onClick={e => e.stopPropagation()}>

              {/* Modal header */}
              <div className="p-5 border-b border-outline-variant bg-surface-container-lowest flex items-center gap-4 flex-shrink-0">
                {a.petId?.image ? (
                  <img src={imgSrc(a.petId.image)} className="w-14 h-14 rounded-2xl object-cover flex-shrink-0" alt="" />
                ) : (
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Camera className="w-6 h-6 text-primary opacity-40" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-black text-on-surface text-lg">{a.fullName || 'N/A'}</h3>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${STATUS_STYLE[a.status]}`}>
                      {STATUS_TEXT[a.status]}
                    </span>
                  </div>
                  <p className="text-sm text-on-surface-variant mt-0.5 truncate">
                    {a.petId ? `Bé ${a.petId.name} · ${a.petId.breed}` : 'N/A'}
                    {a.userId?.email && ` · ${a.userId.email}`}
                  </p>
                  {/* Progress bar */}
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex-1 h-1.5 bg-surface-container rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs font-bold text-primary whitespace-nowrap">{weeks}/4 tuần · {pct}%</span>
                  </div>
                </div>
                <button onClick={() => setSelectedTracking(null)}
                  className="p-2 hover:bg-surface-container rounded-xl transition-colors flex-shrink-0">
                  <X className="w-5 h-5 text-on-surface-variant" />
                </button>
              </div>

              {/* Week summary chips */}
              <div className="px-5 pt-4 grid grid-cols-4 gap-2 flex-shrink-0">
                {[1,2,3,4].map(w => {
                  const done = reports.some(r => r.weekNumber === w);
                  return (
                    <div key={w} className={`text-center py-2 rounded-xl text-xs font-black transition-all ${done ? 'bg-emerald-100 text-emerald-700' : 'bg-surface-container text-on-surface-variant opacity-60'}`}>
                      Tuần {w}{done ? ' ✓' : ''}
                    </div>
                  );
                })}
              </div>

              {/* Reports list */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {reports.length === 0 ? (
                  <div className="text-center py-16 text-on-surface-variant">
                    <Camera className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p className="font-bold">Chưa có bài đăng nào</p>
                    <p className="text-sm opacity-60 mt-1">Người nuôi chưa gửi ảnh cập nhật tuần nào.</p>
                  </div>
                ) : (
                  reports.map(r => (
                    <div key={r.weekNumber} className="flex gap-4 bg-surface-container-low rounded-2xl p-4">
                      {/* Image */}
                      {r.image ? (
                        <div className="relative flex-shrink-0 cursor-zoom-in group"
                          onClick={() => setEnlargedImg(imgSrc(r.image))}>
                          <img src={imgSrc(r.image)}
                            className="w-28 h-28 rounded-xl object-cover group-hover:brightness-90 transition-all"
                            onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} alt={`Tuần ${r.weekNumber}`} />
                          <div className="absolute inset-0 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <ZoomIn className="w-6 h-6 text-white drop-shadow-lg" />
                          </div>
                        </div>
                      ) : (
                        <div className="w-28 h-28 rounded-xl bg-surface-container flex items-center justify-center flex-shrink-0">
                          <Camera className="w-8 h-8 text-on-surface-variant opacity-30" />
                        </div>
                      )}
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="bg-primary text-on-primary text-xs font-black px-2.5 py-1 rounded-full">Tuần {r.weekNumber}</span>
                          {r.submittedAt && (
                            <span className="text-xs text-on-surface-variant flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(r.submittedAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-on-surface leading-relaxed">
                          {r.comment || <span className="italic text-on-surface-variant opacity-50">Không có ghi chú</span>}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── Image lightbox ── */}
      {enlargedImg && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80"
          onClick={() => setEnlargedImg(null)}>
          <img src={enlargedImg} className="max-w-full max-h-full rounded-2xl shadow-2xl object-contain" alt="Phóng to" />
          <button onClick={() => setEnlargedImg(null)}
            className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-xl transition-colors">
            <X className="w-6 h-6 text-white" />
          </button>
        </div>
      )}

      {/* ── Phân bổ thú cưng ── */}
      {!errors.includes('pets') && pets.length > 0 && (
        <div className="bg-white rounded-[32px] border border-outline-variant p-6 shadow-sm">
          <h3 className="font-black text-lg mb-5 tracking-tight">Phân bổ thú cưng theo trạng thái</h3>
          <div className="flex gap-4 flex-wrap">
            {[
              { label: 'Sẵn sàng nhận nuôi', count: readyPets,                                    bar: 'bg-green-500' },
              { label: 'Đang điều trị',       count: pets.filter(p => p.status === 'Treatment').length, bar: 'bg-amber-400' },
              { label: 'Đã nhận nuôi',        count: adoptedPets,                                 bar: 'bg-blue-500' },
            ].map(s => (
              <div key={s.label} className="flex-1 min-w-[160px]">
                <div className="flex justify-between text-xs font-bold mb-1.5">
                  <span className="text-on-surface-variant">{s.label}</span>
                  <span className="text-on-surface">{totalPets > 0 ? Math.round((s.count / totalPets) * 100) : 0}%</span>
                </div>
                <div className="h-2 bg-surface-container rounded-full overflow-hidden">
                  <div className={`h-full ${s.bar} rounded-full`}
                    style={{ width: totalPets > 0 ? `${(s.count / totalPets) * 100}%` : '0%' }} />
                </div>
                <p className="text-xs text-on-surface-variant mt-1">{s.count} bé</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
