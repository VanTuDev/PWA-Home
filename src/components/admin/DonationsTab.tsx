import React, { useEffect, useState, useMemo } from 'react';
import {
  Heart, Search, X, ZoomIn, Receipt, ChevronDown,
  TrendingUp, Calendar, PawPrint, Users,
} from 'lucide-react';

const BE_URL = (import.meta as any).env?.DEV ? 'http://localhost:5000' : 'https://pwa-home-be.onrender.com';
const getToken = () => localStorage.getItem('paw_token') || '';
const authH   = () => ({ Authorization: `Bearer ${getToken()}` });

const imgSrc = (img?: string) => {
  if (!img) return '';
  if (img.startsWith('http')) return img;
  return `${BE_URL}${img.startsWith('/') ? img : `/${img}`}`;
};

const fmtDate = (d: string) =>
  new Date(d).toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

const fmtMoney = (n: number) => n.toLocaleString('vi-VN') + 'đ';

interface DonationData {
  _id: string;
  amount: number;
  status: string;
  type: string;
  createdAt: string;
  donorName: string;
  donorEmail: string;
  message?: string;
  billImage?: string;
  petId?: { name: string; image: string; breed: string } | null;
  userId?: { name: string; email: string; avatar?: string } | null;
}

const STATUS_STYLE: Record<string, string> = {
  paid:    'bg-emerald-100 text-emerald-700',
  pending: 'bg-amber-100 text-amber-700',
  failed:  'bg-rose-100 text-rose-700',
};
const STATUS_TEXT: Record<string, string> = {
  paid: 'Đã thanh toán', pending: 'Chờ xử lý', failed: 'Thất bại',
};
const TYPE_STYLE: Record<string, string> = {
  general:  'bg-sky-100 text-sky-700',
  adoption: 'bg-violet-100 text-violet-700',
};
const TYPE_TEXT: Record<string, string> = {
  general:  'Ủng hộ',
  adoption: 'Nhận nuôi',
};

const ITEMS_PER_PAGE = 7;

const Avatar: React.FC<{ name: string; avatar?: string; size?: number }> = ({ name, avatar, size = 40 }) => {
  const initials = name?.slice(0, 2).toUpperCase() || '??';
  if (avatar) {
    return (
      <img
        src={imgSrc(avatar)}
        alt={name}
        style={{ width: size, height: size }}
        className="rounded-full object-cover flex-shrink-0"
      />
    );
  }
  return (
    <div
      style={{ width: size, height: size }}
      className="rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0"
    >
      <span className="text-primary font-bold text-xs">{initials}</span>
    </div>
  );
};

export const DonationsTab: React.FC = () => {
  const [donations,  setDonations]  = useState<DonationData[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState('');
  const [page,       setPage]       = useState(1);
  const [selected,   setSelected]   = useState<DonationData | null>(null);
  const [enlargedImg, setEnlargedImg] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/donations', { headers: authH() })
      .then(r => r.json())
      .then(d => setDonations(Array.isArray(d) ? d : []))
      .catch(() => setDonations([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return donations;
    const q = search.toLowerCase();
    return donations.filter(d =>
      d.donorName?.toLowerCase().includes(q) ||
      d.donorEmail?.toLowerCase().includes(q)
    );
  }, [donations, search]);

  const paged = filtered.slice(0, page * ITEMS_PER_PAGE);
  const hasMore = paged.length < filtered.length;

  // Stats
  const now        = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const totalPaid  = donations.filter(d => d.status === 'paid').reduce((s, d) => s + d.amount, 0);
  const monthPaid  = donations
    .filter(d => d.status === 'paid' && new Date(d.createdAt) >= monthStart)
    .reduce((s, d) => s + d.amount, 0);
  const adoptionCount = donations.filter(d => d.type === 'adoption').length;
  const generalCount  = donations.filter(d => d.type === 'general').length;

  return (
    <div className="space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<TrendingUp className="w-5 h-5 text-emerald-600" />} label="Tổng đã nhận" value={fmtMoney(totalPaid)} bg="bg-emerald-50" />
        <StatCard icon={<Calendar className="w-5 h-5 text-sky-600" />} label="Tháng này" value={fmtMoney(monthPaid)} bg="bg-sky-50" />
        <StatCard icon={<PawPrint className="w-5 h-5 text-violet-600" />} label="Nhận nuôi" value={`${adoptionCount} giao dịch`} bg="bg-violet-50" />
        <StatCard icon={<Heart className="w-5 h-5 text-rose-500" />} label="Ủng hộ chung" value={`${generalCount} giao dịch`} bg="bg-rose-50" />
      </div>

      {/* Table card */}
      <div className="bg-white rounded-[32px] border border-outline-variant shadow-sm p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h2 className="text-lg font-extrabold text-on-surface flex items-center gap-2">
            <Heart className="w-5 h-5 text-primary" />
            Quyên góp
            <span className="text-sm font-semibold text-on-surface-variant">({filtered.length})</span>
          </h2>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/60" />
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Tìm theo tên người ủng hộ..."
              className="w-full pl-9 pr-4 py-2.5 rounded-2xl border border-outline-variant text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>
        </div>

        {/* List */}
        {loading ? (
          <div className="text-center py-16 text-on-surface-variant text-sm">Đang tải...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-on-surface-variant text-sm italic">
            Không có giao dịch nào.
          </div>
        ) : (
          <div className="space-y-3">
            {paged.map(d => (
              <button
                key={d._id}
                onClick={() => setSelected(d)}
                className="w-full flex items-center gap-4 p-4 rounded-2xl border border-outline-variant hover:border-primary hover:shadow-sm transition-all duration-150 text-left group"
              >
                <Avatar
                  name={d.donorName}
                  avatar={d.userId?.avatar}
                  size={44}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-on-surface text-sm truncate group-hover:text-primary transition-colors">
                    {d.donorName}
                  </p>
                  <p className="text-xs text-on-surface-variant truncate">{d.donorEmail || '—'}</p>
                </div>
                <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${TYPE_STYLE[d.type] || 'bg-gray-100 text-gray-600'}`}>
                    {TYPE_TEXT[d.type] || d.type}
                  </span>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLE[d.status] || 'bg-gray-100 text-gray-600'}`}>
                    {STATUS_TEXT[d.status] || d.status}
                  </span>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-extrabold text-emerald-600 text-sm">{fmtMoney(d.amount)}</p>
                  <p className="text-xs text-on-surface-variant">{fmtDate(d.createdAt).split(',')[0]}</p>
                </div>
                {d.billImage && (
                  <Receipt className="w-4 h-4 text-sky-500 flex-shrink-0" />
                )}
              </button>
            ))}
          </div>
        )}

        {/* Load more */}
        {hasMore && (
          <div className="flex justify-center mt-6">
            <button
              onClick={() => setPage(p => p + 1)}
              className="flex items-center gap-2 px-6 py-2.5 rounded-2xl border border-outline-variant text-sm font-semibold text-on-surface hover:bg-surface-container-low transition-all"
            >
              <ChevronDown className="w-4 h-4" />
              Tải thêm ({filtered.length - paged.length})
            </button>
          </div>
        )}
      </div>

      {/* Detail modal */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white rounded-[32px] shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            style={{ animation: 'scaleIn 0.18s ease-out' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between p-6 pb-4 border-b border-outline-variant">
              <h3 className="font-extrabold text-on-surface text-lg">Chi tiết quyên góp</h3>
              <button
                onClick={() => setSelected(null)}
                className="p-2 rounded-xl hover:bg-surface-container-low transition-colors"
              >
                <X className="w-5 h-5 text-on-surface-variant" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Donor info */}
              <div className="flex items-center gap-4">
                <Avatar name={selected.donorName} avatar={selected.userId?.avatar} size={56} />
                <div>
                  <p className="font-bold text-on-surface text-base">{selected.donorName}</p>
                  <p className="text-sm text-on-surface-variant">{selected.donorEmail || 'Ẩn danh'}</p>
                </div>
              </div>

              {/* Amount */}
              <div className="bg-emerald-50 rounded-2xl p-4 text-center">
                <p className="text-3xl font-extrabold text-emerald-600">{fmtMoney(selected.amount)}</p>
              </div>

              {/* Details grid */}
              <div className="grid grid-cols-2 gap-3">
                <InfoRow label="Thời gian" value={fmtDate(selected.createdAt)} />
                <InfoRow label="Loại" value={
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${TYPE_STYLE[selected.type] || ''}`}>
                    {TYPE_TEXT[selected.type] || selected.type}
                  </span>
                } />
                <InfoRow label="Trạng thái" value={
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_STYLE[selected.status] || ''}`}>
                    {STATUS_TEXT[selected.status] || selected.status}
                  </span>
                } />
                {selected.petId && (
                  <InfoRow label="Thú cưng" value={selected.petId.name} />
                )}
              </div>

              {/* Message */}
              {selected.message && (
                <div>
                  <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide mb-1.5">Lời nhắn</p>
                  <p className="text-sm text-on-surface bg-surface-container-low rounded-2xl px-4 py-3 italic">
                    "{selected.message}"
                  </p>
                </div>
              )}

              {/* Bill image */}
              <div>
                <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide mb-2 flex items-center gap-1.5">
                  <Receipt className="w-3.5 h-3.5" />
                  Ảnh bill
                </p>
                {selected.billImage ? (
                  <div className="relative group cursor-pointer rounded-2xl overflow-hidden border border-outline-variant"
                    onClick={() => setEnlargedImg(imgSrc(selected.billImage!))}>
                    <img src={imgSrc(selected.billImage)} alt="Bill" className="w-full object-cover max-h-64" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                ) : (
                  <div className="bg-surface-container-low rounded-2xl px-4 py-6 text-center text-on-surface-variant text-sm italic">
                    Chưa có ảnh bill
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox */}
      {enlargedImg && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setEnlargedImg(null)}
        >
          <img src={enlargedImg} alt="Bill phóng to" className="max-w-full max-h-full rounded-2xl shadow-2xl" />
          <button
            className="absolute top-4 right-4 p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
            onClick={() => setEnlargedImg(null)}
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>
      )}
    </div>
  );
};

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: string; bg: string }> = ({ icon, label, value, bg }) => (
  <div className={`${bg} rounded-[24px] p-4 flex items-center gap-3`}>
    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm flex-shrink-0">
      {icon}
    </div>
    <div className="min-w-0">
      <p className="text-xs font-semibold text-on-surface-variant truncate">{label}</p>
      <p className="font-extrabold text-on-surface text-sm truncate">{value}</p>
    </div>
  </div>
);

const InfoRow: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div>
    <p className="text-xs text-on-surface-variant font-semibold mb-0.5">{label}</p>
    <div className="text-sm font-medium text-on-surface">{value}</div>
  </div>
);
