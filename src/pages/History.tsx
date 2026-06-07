import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  History as HistoryIcon, CreditCard, PawPrint,
  CheckCircle, Clock, XCircle, AlertCircle,
  Loader2, ChevronRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const BE_URL = (import.meta as any).env?.DEV ? 'http://localhost:5000' : 'https://pwa-home-be.onrender.com';
const imgSrc = (img: string) => {
  if (!img) return '';
  if (img.startsWith('http')) return img;
  const path = img.startsWith('/') ? img : `/${img}`;
  return `${BE_URL}${path}`;
};

const fmt = (d: string) =>
  new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

const fmtMoney = (n: number) => n?.toLocaleString('vi-VN') + 'đ';

interface Donation {
  _id: string; amount: number; type: string; status: string;
  createdAt: string; message?: string;
  petId?: { _id: string; name: string; image: string; breed: string; };
  donorName?: string;
}

interface Adoption {
  _id: string; status: string; createdAt: string; deliveryOption?: string;
  petId?: { _id: string; name: string; image: string; breed: string; age?: string; };
}

const DonationStatusBadge = ({ status }: { status: string }) => {
  const map: Record<string, { label: string; cls: string; icon: React.ElementType }> = {
    paid:    { label: 'Đã thanh toán', cls: 'bg-green-100 text-green-700',  icon: CheckCircle },
    pending: { label: 'Đang chờ',      cls: 'bg-amber-100 text-amber-700',  icon: Clock },
    failed:  { label: 'Thất bại',      cls: 'bg-red-100 text-red-700',      icon: XCircle },
  };
  const s = map[status] || { label: status, cls: 'bg-gray-100 text-gray-600', icon: AlertCircle };
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${s.cls}`}>
      <s.icon className="w-3.5 h-3.5" /> {s.label}
    </span>
  );
};

const AdoptionStatusBadge = ({ status }: { status: string }) => {
  const map: Record<string, { label: string; cls: string }> = {
    Pending:    { label: 'Chờ duyệt',    cls: 'bg-amber-100 text-amber-700' },
    Approved:   { label: 'Đã duyệt',     cls: 'bg-green-100 text-green-700' },
    Rejected:   { label: 'Từ chối',      cls: 'bg-red-100 text-red-700' },
    FollowUp:   { label: 'Đang theo dõi', cls: 'bg-blue-100 text-blue-700' },
  };
  const s = map[status] || { label: status, cls: 'bg-gray-100 text-gray-600' };
  return <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${s.cls}`}>{s.label}</span>;
};

export const History: React.FC = () => {
  const { token } = useAuth();
  const [tab, setTab] = useState<'donations' | 'adoptions'>('donations');
  const [donations, setDonations]   = useState<Donation[]>([]);
  const [adoptions, setAdoptions]   = useState<Adoption[]>([]);
  const [loadingD, setLoadingD]     = useState(true);
  const [loadingA, setLoadingA]     = useState(true);
  const [errorD, setErrorD]         = useState('');
  const [errorA, setErrorA]         = useState('');

  useEffect(() => {
    if (!token) return;
    setLoadingD(true);
    fetch('/api/donations/my', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(setDonations).catch(() => setErrorD('Không thể tải lịch sử.'))
      .finally(() => setLoadingD(false));
  }, [token]);

  useEffect(() => {
    if (!token) return;
    setLoadingA(true);
    fetch('/api/adoptions', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(data => setAdoptions(Array.isArray(data) ? data : data.adoptions || []))
      .catch(() => setErrorA('Không thể tải lịch sử.'))
      .finally(() => setLoadingA(false));
  }, [token]);

  return (
    <div className="min-h-screen bg-surface py-12 px-margin-mobile md:px-margin-desktop">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-10">
          <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center">
            <HistoryIcon className="w-7 h-7 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-on-surface tracking-tight">Lịch sử của bạn</h1>
            <p className="text-sm text-on-surface-variant mt-0.5">Theo dõi thanh toán và đơn nhận nuôi</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 bg-surface-container rounded-2xl p-1.5 w-fit">
          {([
            { id: 'donations', label: 'Lịch sử thanh toán', icon: CreditCard },
            { id: 'adoptions', label: 'Lịch sử nhận nuôi',  icon: PawPrint  },
          ] as const).map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
                tab === t.id
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}>
              <t.icon className="w-4 h-4" /> {t.label}
            </button>
          ))}
        </div>

        {/* ── Donations Tab ── */}
        {tab === 'donations' && (
          <motion.div key="donations" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            {loadingD ? (
              <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>
            ) : errorD ? (
              <p className="text-center text-red-500 font-bold py-16">{errorD}</p>
            ) : donations.length === 0 ? (
              <EmptyState icon={CreditCard} msg="Bạn chưa có giao dịch nào." />
            ) : (
              <div className="space-y-4">
                {donations.map(d => (
                  <div key={d._id} className="bg-white rounded-[24px] border border-outline-variant p-5 flex gap-4 shadow-sm">
                    {d.petId ? (
                      <img src={imgSrc(d.petId.image)} alt={d.petId.name}
                        className="w-16 h-16 rounded-2xl object-cover flex-shrink-0"
                        onError={e => { (e.target as HTMLImageElement).src = 'https://placehold.co/64x64/f5f0eb/553722?text=🐾'; }}
                      />
                    ) : (
                      <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                        <CreditCard className="w-7 h-7 text-primary" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-bold text-on-surface">
                            {d.petId ? `Đóng góp cho bé ${d.petId.name}` : 'Quyên góp chung'}
                          </p>
                          {d.petId && (
                            <p className="text-xs text-on-surface-variant">{d.petId.breed}</p>
                          )}
                        </div>
                        <DonationStatusBadge status={d.status} />
                      </div>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-lg font-black text-primary">{fmtMoney(d.amount)}</span>
                        <span className="text-xs text-on-surface-variant">{fmt(d.createdAt)}</span>
                        <span className="text-xs font-bold px-2 py-0.5 bg-surface-container rounded-full text-on-surface-variant">
                          {d.type === 'adoption' ? 'Nhận nuôi' : 'Quyên góp'}
                        </span>
                      </div>
                      {d.message && <p className="text-xs text-on-surface-variant mt-1 italic">"{d.message}"</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* ── Adoptions Tab ── */}
        {tab === 'adoptions' && (
          <motion.div key="adoptions" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            {loadingA ? (
              <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>
            ) : errorA ? (
              <p className="text-center text-red-500 font-bold py-16">{errorA}</p>
            ) : adoptions.length === 0 ? (
              <EmptyState icon={PawPrint} msg="Bạn chưa gửi đơn nhận nuôi nào."
                cta={{ label: 'Xem các bé cần nhà', to: '/pets' }} />
            ) : (
              <div className="space-y-4">
                {adoptions.map(a => (
                  <div key={a._id} className="bg-white rounded-[24px] border border-outline-variant p-5 flex gap-4 shadow-sm">
                    {a.petId ? (
                      <img src={imgSrc(a.petId.image)} alt={a.petId.name}
                        className="w-16 h-16 rounded-2xl object-cover flex-shrink-0"
                        onError={e => { (e.target as HTMLImageElement).src = 'https://placehold.co/64x64/f5f0eb/553722?text=🐾'; }}
                      />
                    ) : (
                      <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                        <PawPrint className="w-7 h-7 text-primary" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-bold text-on-surface">
                            {a.petId ? `Đơn nhận nuôi bé ${a.petId.name}` : 'Đơn nhận nuôi'}
                          </p>
                          {a.petId && (
                            <p className="text-xs text-on-surface-variant">{a.petId.breed}{a.petId.age ? ` • ${a.petId.age}` : ''}</p>
                          )}
                        </div>
                        <AdoptionStatusBadge status={a.status} />
                      </div>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-xs text-on-surface-variant">{fmt(a.createdAt)}</span>
                        {a.deliveryOption && (
                          <span className="text-xs font-bold px-2 py-0.5 bg-surface-container rounded-full text-on-surface-variant">
                            {a.deliveryOption === 'pickup' ? 'Nhận tại trạm' : 'Giao tận nơi'}
                          </span>
                        )}
                      </div>
                    </div>
                    {a.petId && (
                      <Link to={`/pet/${a.petId._id}`}
                        className="flex-shrink-0 p-2 rounded-xl text-on-surface-variant hover:bg-surface-container transition-colors self-center">
                        <ChevronRight className="w-5 h-5" />
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

const EmptyState = ({
  icon: Icon, msg, cta,
}: { icon: React.ElementType; msg: string; cta?: { label: string; to: string } }) => (
  <div className="flex flex-col items-center py-24 gap-4 text-on-surface-variant">
    <div className="w-20 h-20 bg-surface-container rounded-3xl flex items-center justify-center">
      <Icon className="w-10 h-10 opacity-40" />
    </div>
    <p className="font-bold text-center">{msg}</p>
    {cta && (
      <Link to={cta.to}
        className="mt-2 px-6 py-2.5 bg-primary text-on-primary rounded-2xl font-bold text-sm shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all">
        {cta.label}
      </Link>
    )}
  </div>
);
