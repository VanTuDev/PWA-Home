import React, { useEffect, useState } from 'react';
import { Users, Globe, Eye, MousePointerClick, LogOut, Loader2, AlertCircle, BarChart3 } from 'lucide-react';
import { TimeSeriesChart } from './TimeSeriesChart';

const getToken = () => localStorage.getItem('paw_token') || '';
const authH   = () => ({ Authorization: `Bearer ${getToken()}` });

interface DayPoint {
  date: string;
  newUsers: number;
  visits: number;
  petViews: number;
  adoptClicks: number;
  bounces: number;
  adoptionRate: number;
}

interface AnalyticsData {
  totalUsers: number;
  newUsers: number;
  newUserRate: number;
  visitors: number;
  visits: number;
  petViews: number;
  adoptClicks: number;
  adoptedUsers: number;
  adoptionRate: number;
  bounces: number;
  bounceRate: number;
  series: DayPoint[];
}

const RANGE_OPTIONS: { value: string; label: string }[] = [
  { value: '7',  label: '7 ngày' },
  { value: '30', label: '30 ngày' },
  { value: '90', label: '90 ngày' },
];

export const AnalyticsTab: React.FC = () => {
  const [range,   setRange]   = useState('30');
  const [data,    setData]    = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(false);

  useEffect(() => {
    setLoading(true); setError(false);
    fetch(`/api/admin/analytics?range=${range}`, { headers: authH() })
      .then(r => { if (!r.ok) throw new Error('failed'); return r.json(); })
      .then(setData)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [range]);

  const statCards = [
    {
      label: 'Tài khoản mới',
      value: data ? String(data.newUsers) : '—',
      icon: Users,
      color: 'bg-blue-50 text-blue-600',
    },
    {
      label: 'Người dùng vào web',
      value: data ? String(data.visitors) : '—',
      icon: Globe,
      color: 'bg-emerald-50 text-emerald-600',
    },
    {
      label: 'Lượt xem thú cưng',
      value: data ? String(data.petViews) : '—',
      icon: Eye,
      color: 'bg-orange-50 text-orange-600',
    },
    {
      label: 'Tỉ lệ nhấn nhận nuôi',
      value: data ? `${data.adoptionRate}%` : '—',
      icon: MousePointerClick,
      color: 'bg-rose-50 text-rose-600',
    },
    {
      label: 'Tỉ lệ rời đi',
      value: data ? `${data.bounceRate}%` : '—',
      icon: LogOut,
      color: 'bg-red-50 text-red-600',
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-on-surface mb-1 tracking-tighter">Phân tích hành vi người dùng</h1>
          <p className="text-on-surface-variant text-sm font-medium">Số liệu tổng hợp từ sự kiện gửi lên từ trình duyệt.</p>
        </div>
        <div className="flex gap-2">
          {RANGE_OPTIONS.map(o => (
            <button key={o.value} onClick={() => setRange(o.value)}
              className={`px-4 py-2 rounded-2xl text-sm font-bold transition-all ${
                range === o.value
                  ? 'bg-primary text-on-primary shadow-md'
                  : 'bg-white border border-outline-variant text-on-surface-variant hover:bg-surface-container-low'
              }`}>
              {o.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-32 gap-3 bg-white rounded-[32px] border border-outline-variant shadow-sm text-on-surface-variant">
          <AlertCircle className="w-8 h-8" />
          <p className="font-bold">Không lấy được dữ liệu phân tích.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {statCards.map(s => (
              <div key={s.label} className="bg-white p-6 rounded-[32px] border border-outline-variant shadow-sm hover:shadow-md hover:scale-[1.01] transition-all">
                <div className={`p-3 rounded-2xl inline-flex mb-4 ${s.color}`}>
                  <s.icon className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-on-surface-variant mb-1">{s.label}</h3>
                <p className="text-2xl sm:text-3xl font-black text-on-surface tracking-tighter">{s.value}</p>
              </div>
            ))}
          </div>

          {/* ── Biểu đồ kết hợp theo thời gian ── */}
          <div className="bg-white rounded-[32px] border border-outline-variant shadow-sm p-6 overflow-hidden relative">
            <div className="absolute -top-16 -right-16 w-56 h-56 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2 relative">
              <div>
                <h2 className="font-black text-xl tracking-tight flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" /> Xu hướng theo thời gian
                </h2>
                <p className="text-xs text-on-surface-variant font-medium mt-1">
                  Biểu đồ kết hợp — cột (tài khoản mới), vùng (lượt xem) và đường (tỉ lệ nhận nuôi, tỉ lệ rời đi)
                </p>
              </div>
            </div>
            <TimeSeriesChart data={data?.series ?? []} />
          </div>
        </>
      )}
    </div>
  );
};
