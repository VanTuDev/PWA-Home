import React, { useEffect, useState, useMemo } from 'react';
import {
  Heart, Search, X, ZoomIn, Receipt, ChevronDown,
  TrendingUp, Calendar, PawPrint, CheckCircle, Clock, AlertCircle,
  Building2, ChevronUp, Save, Loader2,
} from 'lucide-react';
import { confirm } from '../ConfirmDialog';
import { toast } from '../../utils/toast';

interface BankInfo {
  bankName: string;
  accountNo: string;
  accountName: string;
  branch: string;
  transferContent: string;
}

const BankInfoEditor: React.FC = () => {
  const [open,    setOpen]    = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving,  setSaving]  = useState(false);
  const [form,    setForm]    = useState<BankInfo>({
    bankName: '', accountNo: '', accountName: '', branch: '', transferContent: '',
  });

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    fetch('/api/settings/bank-info')
      .then(r => r.json())
      .then(data => setForm({ bankName: '', accountNo: '', accountName: '', branch: '', transferContent: '', ...data }))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [open]);

  const handleSave = async () => {
    if (!form.bankName || !form.accountNo || !form.accountName) {
      toast.warning('Vui lòng điền đủ tên ngân hàng, số tài khoản và tên chủ tài khoản.'); return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/settings/bank-info', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) { toast.success('Đã cập nhật thông tin chuyển khoản!'); setOpen(false); }
      else toast.error(data.message || 'Lỗi khi lưu.');
    } catch { toast.error('Không thể kết nối máy chủ.'); }
    finally { setSaving(false); }
  };

  const inputCls = "w-full border border-outline-variant rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium transition-all";

  return (
    <div className="bg-white rounded-[28px] border border-outline-variant shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-surface-container-low transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-sky-100 rounded-xl flex items-center justify-center">
            <Building2 className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-left">
            <p className="font-bold text-on-surface text-sm">Thông tin chuyển khoản</p>
            <p className="text-xs text-on-surface-variant">Tùy chỉnh tài khoản ngân hàng hiển thị cho người dùng</p>
          </div>
        </div>
        {open ? <ChevronUp className="w-5 h-5 text-on-surface-variant" /> : <ChevronDown className="w-5 h-5 text-on-surface-variant" />}
      </button>

      {open && (
        <div className="px-6 pb-6 pt-1 border-t border-outline-variant space-y-4">
          {loading ? (
            <div className="py-6 flex justify-center"><Loader2 className="w-6 h-6 text-primary animate-spin" /></div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-on-surface-variant mb-1 block">Tên ngân hàng *</label>
                  <input className={inputCls} placeholder="Vietcombank"
                    value={form.bankName} onChange={e => setForm(f => ({ ...f, bankName: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs font-bold text-on-surface-variant mb-1 block">Số tài khoản *</label>
                  <input className={inputCls} placeholder="1234567890"
                    value={form.accountNo} onChange={e => setForm(f => ({ ...f, accountNo: e.target.value }))} />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-on-surface-variant mb-1 block">Tên chủ tài khoản *</label>
                  <input className={inputCls} placeholder="TRUNG TAM CUU HO THU CUNG PAW HOME"
                    value={form.accountName} onChange={e => setForm(f => ({ ...f, accountName: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs font-bold text-on-surface-variant mb-1 block">Chi nhánh</label>
                  <input className={inputCls} placeholder="Chi nhánh Đà Nẵng"
                    value={form.branch} onChange={e => setForm(f => ({ ...f, branch: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs font-bold text-on-surface-variant mb-1 block">Nội dung chuyển khoản (prefix)</label>
                  <input className={inputCls} placeholder="UNGHOPAW"
                    value={form.transferContent} onChange={e => setForm(f => ({ ...f, transferContent: e.target.value }))} />
                </div>
              </div>
              <button
                onClick={handleSave} disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary rounded-xl text-sm font-bold hover:opacity-90 transition-all shadow-md shadow-primary/20 disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

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
  paid: 'Đã duyệt', pending: 'Chờ duyệt', failed: 'Thất bại',
};
const TYPE_STYLE: Record<string, string> = {
  general:  'bg-sky-100 text-sky-700',
  adoption: 'bg-violet-100 text-violet-700',
};
const TYPE_TEXT: Record<string, string> = {
  general:  'Ủng hộ',
  adoption: 'Nhận nuôi',
};

type StatusFilter = 'all' | 'pending' | 'paid' | 'failed';
const ITEMS_PER_PAGE = 10;

const Avatar: React.FC<{ name: string; avatar?: string; size?: number }> = ({ name, avatar, size = 40 }) => {
  const initials = name?.slice(0, 2).toUpperCase() || '??';
  if (avatar) return (
    <img src={imgSrc(avatar)} alt={name}
      style={{ width: size, height: size }}
      className="rounded-full object-cover flex-shrink-0" />
  );
  return (
    <div style={{ width: size, height: size }}
      className="rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
      <span className="text-primary font-bold text-xs">{initials}</span>
    </div>
  );
};

export const DonationsTab: React.FC = () => {
  const [donations,    setDonations]    = useState<DonationData[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [page,         setPage]         = useState(1);
  const [selected,     setSelected]     = useState<DonationData | null>(null);
  const [enlargedImg,  setEnlargedImg]  = useState<string | null>(null);
  const [approving,    setApproving]    = useState(false);

  const load = () => {
    setLoading(true);
    fetch('/api/donations', { headers: authH() })
      .then(r => r.json())
      .then(d => setDonations(Array.isArray(d) ? d : []))
      .catch(() => setDonations([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleApprove = async (donation: DonationData) => {
    const ok = await confirm({
      message: `Duyệt khoản ủng hộ ${fmtMoney(donation.amount)} từ ${donation.donorName}?`,
      confirmText: 'Duyệt',
      danger: false,
    });
    if (!ok) return;
    setApproving(true);
    try {
      const res = await fetch(`/api/donations/${donation._id}/approve`, {
        method: 'PATCH',
        headers: authH(),
      });
      if (res.ok) {
        setDonations(prev => prev.map(d => d._id === donation._id ? { ...d, status: 'paid' } : d));
        setSelected(prev => prev?._id === donation._id ? { ...prev, status: 'paid' } : prev);
        toast.success('Đã duyệt khoản ủng hộ thành công!');
      } else {
        const data = await res.json();
        toast.error(data.message || 'Lỗi khi duyệt.');
      }
    } catch {
      toast.error('Không thể kết nối máy chủ.');
    } finally {
      setApproving(false);
    }
  };

  const filtered = useMemo(() => {
    let list = donations;
    if (statusFilter !== 'all') list = list.filter(d => d.status === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(d =>
        d.donorName?.toLowerCase().includes(q) ||
        d.donorEmail?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [donations, search, statusFilter]);

  const paged   = filtered.slice(0, page * ITEMS_PER_PAGE);
  const hasMore = paged.length < filtered.length;

  // Stats
  const now         = new Date();
  const monthStart  = new Date(now.getFullYear(), now.getMonth(), 1);
  const totalPaid   = donations.filter(d => d.status === 'paid').reduce((s, d) => s + d.amount, 0);
  const monthPaid   = donations
    .filter(d => d.status === 'paid' && new Date(d.createdAt) >= monthStart)
    .reduce((s, d) => s + d.amount, 0);
  const pendingCount  = donations.filter(d => d.status === 'pending').length;
  const adoptionCount = donations.filter(d => d.type === 'adoption').length;

  const FILTER_TABS: { key: StatusFilter; label: string; count?: number }[] = [
    { key: 'all',     label: 'Tất cả',    count: donations.length },
    { key: 'pending', label: 'Chờ duyệt', count: pendingCount },
    { key: 'paid',    label: 'Đã duyệt' },
    { key: 'failed',  label: 'Thất bại' },
  ];

  return (
    <div className="space-y-6">
      {/* Bank info editor */}
      <BankInfoEditor />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<TrendingUp className="w-5 h-5 text-emerald-600" />} label="Tổng đã duyệt" value={fmtMoney(totalPaid)} bg="bg-emerald-50" />
        <StatCard icon={<Calendar className="w-5 h-5 text-sky-600" />}      label="Tháng này"    value={fmtMoney(monthPaid)} bg="bg-sky-50" />
        <StatCard
          icon={<Clock className="w-5 h-5 text-amber-600" />}
          label="Chờ duyệt"
          value={`${pendingCount} giao dịch`}
          bg={pendingCount > 0 ? 'bg-amber-50' : 'bg-gray-50'}
          highlight={pendingCount > 0}
        />
        <StatCard icon={<PawPrint className="w-5 h-5 text-violet-600" />}   label="Nhận nuôi"   value={`${adoptionCount} giao dịch`} bg="bg-violet-50" />
      </div>

      {/* Table card */}
      <div className="bg-white rounded-[32px] border border-outline-variant shadow-sm p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
          <h2 className="text-lg font-extrabold text-on-surface flex items-center gap-2">
            <Heart className="w-5 h-5 text-primary" />
            Danh sách ủng hộ
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

        {/* Filter tabs */}
        <div className="flex gap-2 flex-wrap mb-5">
          {FILTER_TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => { setStatusFilter(tab.key); setPage(1); }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold border transition-all ${
                statusFilter === tab.key
                  ? 'bg-primary text-on-primary border-primary shadow-md shadow-primary/20'
                  : 'bg-surface-container-low text-on-surface-variant border-outline-variant hover:border-primary/40 hover:text-primary'
              }`}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                  statusFilter === tab.key ? 'bg-white/20' : 'bg-surface-container text-on-surface'
                }`}>
                  {tab.count}
                </span>
              )}
              {tab.key === 'pending' && pendingCount > 0 && statusFilter !== 'pending' && (
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              )}
            </button>
          ))}
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
              <div
                key={d._id}
                className={`flex items-center gap-4 p-4 rounded-2xl border transition-all duration-150 cursor-pointer group hover:shadow-sm ${
                  d.status === 'pending'
                    ? 'border-amber-200 bg-amber-50/40 hover:border-amber-400'
                    : 'border-outline-variant hover:border-primary'
                }`}
                onClick={() => setSelected(d)}
              >
                <Avatar name={d.donorName} avatar={d.userId?.avatar} size={44} />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-on-surface text-sm truncate group-hover:text-primary transition-colors">
                    {d.donorName}
                  </p>
                  <p className="text-xs text-on-surface-variant truncate">{d.donorEmail || 'Ẩn danh'}</p>
                  {d.message && (
                    <p className="text-xs text-on-surface-variant/70 italic truncate mt-0.5">"{d.message}"</p>
                  )}
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
                {d.billImage && <Receipt className="w-4 h-4 text-sky-500 flex-shrink-0" />}
                {/* Quick approve button */}
                {d.status === 'pending' && (
                  <button
                    onClick={e => { e.stopPropagation(); handleApprove(d); }}
                    disabled={approving}
                    className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl transition-all hover:scale-105 active:scale-95 disabled:opacity-50 shadow-sm"
                    title="Duyệt ngay"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    Duyệt
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

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
            onClick={e => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between p-6 pb-4 border-b border-outline-variant">
              <h3 className="font-extrabold text-on-surface text-lg">Chi tiết ủng hộ</h3>
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

              {/* Amount + status */}
              <div className="bg-emerald-50 rounded-2xl p-4 text-center">
                <p className="text-3xl font-extrabold text-emerald-600">{fmtMoney(selected.amount)}</p>
                <span className={`mt-2 inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full ${STATUS_STYLE[selected.status] || ''}`}>
                  {selected.status === 'pending' && <Clock className="w-3 h-3" />}
                  {selected.status === 'paid' && <CheckCircle className="w-3 h-3" />}
                  {selected.status === 'failed' && <AlertCircle className="w-3 h-3" />}
                  {STATUS_TEXT[selected.status] || selected.status}
                </span>
              </div>

              {/* Details grid */}
              <div className="grid grid-cols-2 gap-3">
                <InfoRow label="Thời gian" value={fmtDate(selected.createdAt)} />
                <InfoRow label="Loại" value={
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${TYPE_STYLE[selected.type] || ''}`}>
                    {TYPE_TEXT[selected.type] || selected.type}
                  </span>
                } />
                {selected.petId && (
                  <InfoRow label="Thú cưng" value={selected.petId.name} />
                )}
              </div>

              {/* Message */}
              {selected.message && (
                <div>
                  <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide mb-1.5">Lời nhắn / Lý do</p>
                  <p className="text-sm text-on-surface bg-surface-container-low rounded-2xl px-4 py-3 italic">
                    "{selected.message}"
                  </p>
                </div>
              )}

              {/* Bill image */}
              <div>
                <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide mb-2 flex items-center gap-1.5">
                  <Receipt className="w-3.5 h-3.5" />
                  Ảnh bill xác nhận
                </p>
                {selected.billImage ? (
                  <div
                    className="relative group cursor-pointer rounded-2xl overflow-hidden border border-outline-variant"
                    onClick={() => setEnlargedImg(selected.billImage!.startsWith('http') ? selected.billImage! : imgSrc(selected.billImage))}
                  >
                    <img
                      src={selected.billImage.startsWith('data:') ? selected.billImage : imgSrc(selected.billImage)}
                      alt="Bill"
                      className="w-full object-cover max-h-64"
                    />
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

              {/* Approve action */}
              {selected.status === 'pending' && (
                <div className="pt-2 border-t border-outline-variant space-y-2">
                  <p className="text-xs text-on-surface-variant font-medium">Sau khi xác minh bill, bấm duyệt để ghi nhận khoản ủng hộ.</p>
                  <button
                    onClick={() => handleApprove(selected)}
                    disabled={approving}
                    className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                  >
                    <CheckCircle className="w-5 h-5" />
                    {approving ? 'Đang duyệt...' : 'Duyệt khoản ủng hộ này'}
                  </button>
                </div>
              )}
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

const StatCard: React.FC<{
  icon: React.ReactNode; label: string; value: string; bg: string; highlight?: boolean;
}> = ({ icon, label, value, bg, highlight }) => (
  <div className={`${bg} rounded-[24px] p-4 flex items-center gap-3 ${highlight ? 'ring-2 ring-amber-400/40' : ''}`}>
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
