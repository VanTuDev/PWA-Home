import React, { useState } from 'react';
import { Heart, PawPrint } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from '../utils/toast';

const BE_URL = (import.meta as any).env?.DEV ? 'http://localhost:5000' : 'https://pwa-home-be.onrender.com';

const PRESET_AMOUNTS = [50_000, 100_000, 200_000, 500_000];

const fmtMoney = (n: number) => n.toLocaleString('vi-VN') + 'đ';

export const DonatePage: React.FC = () => {
  const { user } = useAuth();
  const token = localStorage.getItem('paw_token') || '';

  const [selectedPreset, setSelectedPreset] = useState<number | null>(100_000);
  const [customAmount,   setCustomAmount]   = useState('');
  const [message,        setMessage]        = useState('');
  const [donorName,      setDonorName]      = useState(user?.name || '');
  const [anonymous,      setAnonymous]      = useState(false);
  const [loading,        setLoading]        = useState(false);
  const [waitingPayment, setWaitingPayment] = useState(false);

  const amount = customAmount ? Number(customAmount) : (selectedPreset ?? 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || amount < 5000) {
      toast.warning('Số tiền ủng hộ tối thiểu là 5.000đ.');
      return;
    }

    setLoading(true);
    try {
      const finalName = anonymous ? 'Mạnh thường quân ẩn danh' : (donorName.trim() || undefined);
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${BE_URL}/api/donations/system`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ amount, message: message.trim(), donorName: finalName }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || 'Có lỗi xảy ra.');
        return;
      }

      if (data.checkoutUrl) {
        window.open(data.checkoutUrl, '_blank', 'noopener,noreferrer');
        setWaitingPayment(true);
      } else {
        // Dev mode — paid immediately
        toast.success('Cảm ơn tấm lòng của bạn! Ủng hộ thành công 🐾');
      }
    } catch {
      toast.error('Không thể kết nối máy chủ. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleDonePayment = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-surface-container-low py-12 px-4">
      {/* Hero */}
      <div className="max-w-2xl mx-auto text-center mb-10">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center shadow-lg">
            <PawPrint className="w-8 h-8 text-on-primary" />
          </div>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-on-surface mb-3 tracking-tight">
          Ủng hộ PAW Home
        </h1>
        <p className="text-on-surface-variant text-base sm:text-lg leading-relaxed max-w-xl mx-auto">
          Mỗi đóng góp của bạn giúp chúng tôi chăm sóc và tìm mái ấm cho những bé thú cưng
          đang chờ được yêu thương tại PAW Home Đà Nẵng.
        </p>
      </div>

      {/* Card */}
      <div className="max-w-xl mx-auto bg-white rounded-[32px] border border-outline-variant shadow-sm p-6 sm:p-8">
        {waitingPayment ? (
          <div className="text-center py-8 space-y-5">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto">
              <Heart className="w-8 h-8 text-amber-500 animate-pulse" />
            </div>
            <div>
              <p className="font-bold text-lg text-on-surface mb-1">
                Đang chờ xác nhận thanh toán...
              </p>
              <p className="text-on-surface-variant text-sm">
                Vui lòng hoàn tất thanh toán trong tab PayOS vừa mở.
              </p>
            </div>
            <button
              onClick={handleDonePayment}
              className="w-full py-3 px-6 bg-primary text-on-primary rounded-2xl font-bold text-base hover:opacity-90 active:scale-95 transition-all duration-150"
            >
              Tôi đã thanh toán xong
            </button>
            <button
              onClick={() => setWaitingPayment(false)}
              className="text-sm text-on-surface-variant underline"
            >
              Quay lại
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Pre-set amounts */}
            <div>
              <p className="text-sm font-semibold text-on-surface-variant mb-3">Chọn mức ủng hộ</p>
              <div className="grid grid-cols-4 gap-2">
                {PRESET_AMOUNTS.map(amt => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => { setSelectedPreset(amt); setCustomAmount(''); }}
                    className={`py-2.5 rounded-2xl text-sm font-bold border transition-all duration-150 active:scale-95 ${
                      selectedPreset === amt && !customAmount
                        ? 'bg-primary text-on-primary border-primary shadow-md'
                        : 'bg-surface-container-low text-on-surface border-outline-variant hover:border-primary hover:text-primary'
                    }`}
                  >
                    {amt >= 1_000_000 ? `${amt / 1_000_000}M` : `${amt / 1_000}K`}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom amount */}
            <div>
              <label className="block text-sm font-semibold text-on-surface-variant mb-1.5">
                Hoặc nhập số tiền khác (tối thiểu 5.000đ)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={5000}
                  step={1000}
                  value={customAmount}
                  onChange={e => { setCustomAmount(e.target.value); setSelectedPreset(null); }}
                  placeholder="Ví dụ: 150000"
                  className="w-full border border-outline-variant rounded-2xl px-4 py-3 text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm font-medium">đ</span>
              </div>
              {amount >= 5000 && (
                <p className="text-xs text-primary font-semibold mt-1.5 ml-1">
                  = {fmtMoney(amount)}
                </p>
              )}
            </div>

            {/* Donor name */}
            <div>
              <label className="block text-sm font-semibold text-on-surface-variant mb-1.5">
                Tên người ủng hộ
              </label>
              <input
                type="text"
                value={anonymous ? 'Mạnh thường quân ẩn danh' : donorName}
                onChange={e => setDonorName(e.target.value)}
                disabled={anonymous}
                placeholder="Tên của bạn (tùy chọn)"
                className="w-full border border-outline-variant rounded-2xl px-4 py-3 text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition disabled:bg-surface-container-low disabled:text-on-surface-variant/60"
              />
              <label className="flex items-center gap-2 mt-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={anonymous}
                  onChange={e => setAnonymous(e.target.checked)}
                  className="w-4 h-4 accent-primary"
                />
                <span className="text-sm text-on-surface-variant">Ủng hộ ẩn danh</span>
              </label>
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-semibold text-on-surface-variant mb-1.5">
                Lời nhắn (tùy chọn)
              </label>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                rows={3}
                placeholder="Gửi lời động viên đến các bé..."
                className="w-full border border-outline-variant rounded-2xl px-4 py-3 text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition resize-none"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || amount < 5000}
              className="w-full py-4 bg-primary text-on-primary rounded-2xl font-extrabold text-base shadow-md hover:opacity-90 active:scale-95 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Heart className="w-5 h-5" />
              {loading
                ? 'Đang xử lý...'
                : `Ủng hộ ${amount >= 5000 ? fmtMoney(amount) : '...'} qua PayOS`}
            </button>
          </form>
        )}
      </div>

      {/* Decorative footnote */}
      <p className="text-center text-xs text-on-surface-variant/60 mt-8 max-w-md mx-auto">
        Thanh toán được xử lý an toàn qua PayOS. PAW Home cam kết sử dụng 100% đóng góp cho hoạt động cứu trợ và chăm sóc thú cưng.
      </p>
    </div>
  );
};
