import React from 'react';
import {
  ComposedChart, Bar, Line, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, TooltipProps,
} from 'recharts';

interface DayPoint {
  date: string;
  newUsers: number;
  visits: number;
  petViews: number;
  adoptClicks: number;
  bounces: number;
  adoptionRate: number;
}

interface Props { data: DayPoint[] }

const fmtDate = (iso: string) => {
  const [, m, d] = iso.split('-');
  return `${d}/${m}`;
};

const COLORS = {
  petViews:   '#e08a3e',
  newUsers:   '#2f6f4f',
  rate:       '#c2356b',
  bounceRate: '#d64545',
};

const PERCENT_KEYS = new Set(['adoptionRate', 'bounceRate']);

const CustomTooltip: React.FC<TooltipProps<number, string>> = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white rounded-2xl shadow-xl border border-outline-variant px-4 py-3 min-w-[160px]">
      <p className="text-xs font-black text-on-surface mb-2">Ngày {label}</p>
      <div className="space-y-1">
        {payload.map(p => (
          <div key={p.dataKey as string} className="flex items-center justify-between gap-4 text-xs">
            <span className="flex items-center gap-1.5 text-on-surface-variant font-semibold">
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: p.color }} />
              {p.name}
            </span>
            <span className="font-black text-on-surface">
              {p.value}{PERCENT_KEYS.has(p.dataKey as string) ? '%' : ''}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const TimeSeriesChart: React.FC<Props> = ({ data }) => {
  if (data.length === 0) {
    return <p className="text-sm text-on-surface-variant text-center py-16">Chưa có dữ liệu.</p>;
  }

  const chartData = data.map(p => ({
    ...p,
    dateLabel: fmtDate(p.date),
    bounceRate: p.visits > 0 ? Math.min(100, Math.round((p.bounces / p.visits) * 1000) / 10) : 0,
  }));

  return (
    <ResponsiveContainer width="100%" height={360}>
      <ComposedChart data={chartData} margin={{ top: 8, right: 8, left: -18, bottom: 0 }} barGap={4}>
        <defs>
          <linearGradient id="gradPetViews" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor={COLORS.petViews} stopOpacity={0.55} />
            <stop offset="95%" stopColor={COLORS.petViews} stopOpacity={0.03} />
          </linearGradient>
        </defs>

        <CartesianGrid strokeDasharray="3 6" vertical={false} stroke="#e7e0d8" />

        <XAxis dataKey="dateLabel" tick={{ fontSize: 11, fill: '#8a7c6e', fontWeight: 700 }}
          axisLine={false} tickLine={false} />
        <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#8a7c6e' }}
          axisLine={false} tickLine={false} width={30} allowDecimals={false} />
        <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#8a7c6e' }}
          axisLine={false} tickLine={false} width={38} unit="%" domain={[0, 100]} />

        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(85,55,34,0.06)' }} />
        <Legend wrapperStyle={{ fontSize: 12, fontWeight: 700, paddingTop: 12 }} iconType="circle" iconSize={8} />

        <Area yAxisId="left" type="monotone" dataKey="petViews" name="Lượt xem thú cưng"
          stroke={COLORS.petViews} strokeWidth={2} fill="url(#gradPetViews)"
          animationDuration={900} />

        <Bar yAxisId="left" dataKey="newUsers" name="Tài khoản mới"
          fill={COLORS.newUsers} radius={[6, 6, 0, 0]} barSize={14}
          animationDuration={900} />

        <Line yAxisId="right" type="monotone" dataKey="adoptionRate" name="Tỉ lệ nhận nuôi"
          stroke={COLORS.rate} strokeWidth={3}
          dot={{ r: 3, fill: COLORS.rate, strokeWidth: 0 }} activeDot={{ r: 6 }}
          animationDuration={900} />

        <Line yAxisId="right" type="monotone" dataKey="bounceRate" name="Tỉ lệ rời đi"
          stroke={COLORS.bounceRate} strokeWidth={2} strokeDasharray="5 4"
          dot={{ r: 2.5, fill: COLORS.bounceRate, strokeWidth: 0 }} activeDot={{ r: 5 }}
          animationDuration={900} />
      </ComposedChart>
    </ResponsiveContainer>
  );
};
