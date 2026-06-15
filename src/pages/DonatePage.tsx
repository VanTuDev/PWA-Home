import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Heart, Gift, CheckCircle, Camera, X, Copy, Building2,
  AlertCircle, ChevronDown, ChevronUp, Loader2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from '../utils/toast';

const PRESET_AMOUNTS = [50_000, 100_000, 200_000, 500_000, 1_000_000];
const fmtMoney = (n: number) => n.toLocaleString('vi-VN') + 'đ';

interface BankInfo {
  bankName: string;
  accountNo: string;
  accountName: string;
  branch: string;
  transferContent: string;
}

const DEFAULT_BANK_INFO: BankInfo = {
  bankName:        'Vietcombank',
  accountNo:       '1234567890',
  accountName:     'TRUNG TAM CUU HO THU CUNG PAW HOME',
  branch:          'Chi nhánh Đà Nẵng',
  transferContent: 'UNGHOPAW',
};

export const DonatePage: React.FC = () => {
  const { user } = useAuth();
  const token = localStorage.getItem('paw_token') || '';
  const fileRef = useRef<HTMLInputElement>(null);

  const [bankInfo,       setBankInfo]       = useState<BankInfo>(DEFAULT_BANK_INFO);
  const [bankLoading,    setBankLoading]    = useState(true);
  const [selectedPreset, setSelectedPreset] = useState<number | null>(100_000);
  const [customAmount,   setCustomAmount]   = useState('');
  const [message,        setMessage]        = useState('');
  const [donorName,      setDonorName]      = useState(user?.name || '');
  const [donorEmail,     setDonorEmail]     = useState(user?.email || '');
  const [anonymous,      setAnonymous]      = useState(false);
  const [billPreview,    setBillPreview]    = useState<string | null>(null);
  const [billBase64,     setBillBase64]     = useState<string | null>(null);
  const [loading,        setLoading]        = useState(false);
  const [success,        setSuccess]        = useState(false);
  const [showBankDetail, setShowBankDetail] = useState(true);

  useEffect(() => {
    fetch('/api/settings/bank-info')
      .then(r => r.json())
      .then(data => setBankInfo({ ...DEFAULT_BANK_INFO, ...data }))
      .catch(() => {})
      .finally(() => setBankLoading(false));
  }, []);

  const amount = customAmount ? Number(customAmount) : (selectedPreset ?? 0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Ảnh quá lớn. Vui lòng chọn ảnh dưới 5MB.'); return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setBillBase64(result);
      setBillPreview(result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveBill = () => {
    setBillBase64(null);
    setBillPreview(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => toast.success(`Đã sao chép ${label}!`));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || amount < 5000) {
      toast.warning('Số tiền ủng hộ tối thiểu là 5.000đ.'); return;
    }
    if (!billBase64) {
      toast.warning('Vui lòng chụp/tải lên ảnh bill chuyển khoản.'); return;
    }

    setLoading(true);
    try {
      const finalName = anonymous ? 'Mạnh thường quân ẩn danh' : (donorName.trim() || 'Không rõ tên');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/donations', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          amount,
          donorName:  finalName,
          donorEmail: anonymous ? '' : donorEmail.trim(),
          message:    message.trim(),
          billImage:  billBase64,
        }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.message || 'Có lỗi xảy ra.'); return; }
      setSuccess(true);
    } catch {
      toast.error('Không thể kết nối máy chủ. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-white rounded-[40px] border border-outline-variant shadow-2xl p-10 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle className="w-12 h-12 text-green-500" />
          </motion.div>
          <h1 className="text-2xl font-black text-on-surface mb-3">Cảm ơn bạn! 🐾</h1>
          <p className="text-on-surface-variant text-sm leading-relaxed mb-8">
            Ủng hộ <span className="font-black text-primary">{fmtMoney(amount)}</span> đã được ghi nhận.
            <br />Chúng tôi sẽ xác nhận bill và cập nhật trạng thái sớm nhất.
          </p>
          <button
            onClick={() => {
              setSuccess(false);
              setSelectedPreset(100_000);
              setCustomAmount('');
              setMessage('');
              setBillBase64(null);
              setBillPreview(null);
            }}
            className="w-full py-4 bg-primary text-on-primary rounded-2xl font-bold hover:opacity-90 transition-all"
          >
            Ủng hộ thêm
          </button>
          <a href="/" className="mt-3 block text-sm font-bold text-on-surface-variant hover:text-primary transition-colors">
            Về trang chủ
          </a>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface pb-20">
      {/* Hero */}
      <div className="bg-gradient-to-br from-primary/10 to-secondary/10 border-b border-outline-variant px-4 py-12 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/20">
            <Heart className="w-8 h-8 text-on-primary" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-on-surface mb-3 tracking-tight">Ủng hộ PAW Home</h1>
          <p className="text-on-surface-variant text-base leading-relaxed max-w-xl mx-auto">
            Mỗi đóng góp của bạn giúp chúng tôi chăm sóc và tìm mái ấm cho những bé thú cưng đang chờ được yêu thương tại Đà Nẵng.
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-10 space-y-6">

        {/* Bank info */}
        <div className="bg-white rounded-[28px] border border-outline-variant overflow-hidden shadow-sm">
          <button
            onClick={() => setShowBankDetail(v => !v)}
            className="w-full flex items-center justify-between px-6 py-4 hover:bg-surface-container-low transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-sky-100 rounded-xl flex items-center justify-center">
                {bankLoading
                  ? <Loader2 className="w-5 h-5 text-sky-400 animate-spin" />
                  : <Building2 className="w-5 h-5 text-sky-600" />
                }
              </div>
              <div className="text-left">
                <p className="font-bold text-on-surface text-sm">Thông tin chuyển khoản</p>
                <p className="text-xs text-on-surface-variant">{bankInfo.bankName} · {bankInfo.accountNo}</p>
              </div>
            </div>
            {showBankDetail ? <ChevronUp className="w-5 h-5 text-on-surface-variant" /> : <ChevronDown className="w-5 h-5 text-on-surface-variant" />}
          </button>

          <AnimatePresence initial={false}>
            {showBankDetail && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="px-6 pb-6 pt-1 space-y-3 border-t border-outline-variant">
                  <BankRow label="Ngân hàng"             value={bankInfo.bankName} />
                  <BankRow label="Số tài khoản"          value={bankInfo.accountNo}
                    onCopy={() => handleCopy(bankInfo.accountNo, 'số tài khoản')} />
                  <BankRow label="Chủ tài khoản"         value={bankInfo.accountName} />
                  {bankInfo.branch && <BankRow label="Chi nhánh" value={bankInfo.branch} />}
                  <BankRow
                    label="Nội dung chuyển khoản"
                    value={`${bankInfo.transferContent} [SỐ TIỀN]`}
                    onCopy={() => handleCopy(bankInfo.transferContent, 'nội dung')}
                  />
                  <div className="mt-3 p-3 bg-amber-50 rounded-2xl border border-amber-100 text-xs text-amber-800 leading-relaxed">
                    💡 Sau khi chuyển khoản, vui lòng chụp màn hình bill và điền form bên dưới để xác nhận.
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-[28px] border border-outline-variant shadow-sm p-6 sm:p-8 space-y-6">

          {/* Amount */}
          <div>
            <p className="text-xs font-black text-on-surface-variant uppercase tracking-wider mb-3">Số tiền ủng hộ</p>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-3">
              {PRESET_AMOUNTS.map(amt => (
                <button
                  key={amt} type="button"
                  onClick={() => { setSelectedPreset(amt); setCustomAmount(''); }}
                  className={`py-2.5 rounded-2xl text-xs font-bold border transition-all active:scale-95 ${
                    selectedPreset === amt && !customAmount
                      ? 'bg-primary text-on-primary border-primary shadow-md shadow-primary/20'
                      : 'bg-surface-container-low text-on-surface border-outline-variant hover:border-primary hover:text-primary'
                  }`}
                >
                  {amt >= 1_000_000 ? `${amt / 1_000_000}M` : `${amt / 1_000}K`}
                </button>
              ))}
            </div>
            <div className="relative">
              <input
                type="number" min={5000} step={1000}
                value={customAmount}
                onChange={e => { setCustomAmount(e.target.value); setSelectedPreset(null); }}
                placeholder="Hoặc nhập số tiền khác..."
                className="w-full border border-outline-variant rounded-2xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium transition-all"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm font-bold">đ</span>
            </div>
            {amount >= 5000 && (
              <p className="text-xs text-primary font-bold mt-1.5 ml-1">= {fmtMoney(amount)}</p>
            )}
          </div>

          {/* Donor info */}
          <div className="space-y-3">
            <p className="text-xs font-black text-on-surface-variant uppercase tracking-wider">Thông tin người ủng hộ</p>
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox" checked={anonymous}
                onChange={e => setAnonymous(e.target.checked)}
                className="w-4 h-4 accent-primary"
              />
              <span className="text-sm font-medium text-on-surface-variant">Ủng hộ ẩn danh</span>
            </label>
            {!anonymous && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={donorName}
                  onChange={e => setDonorName(e.target.value)}
                  placeholder="Họ và tên"
                  className="border border-outline-variant rounded-2xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium transition-all"
                />
                <input
                  type="email"
                  value={donorEmail}
                  onChange={e => setDonorEmail(e.target.value)}
                  placeholder="Email (tuỳ chọn)"
                  className="border border-outline-variant rounded-2xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium transition-all"
                />
              </div>
            )}
          </div>

          {/* Message */}
          <div>
            <p className="text-xs font-black text-on-surface-variant uppercase tracking-wider mb-2">Lời nhắn / Lý do ủng hộ</p>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              rows={3}
              maxLength={300}
              placeholder="Chia sẻ lý do hoặc lời nhắn tới PAW Home..."
              className="w-full border border-outline-variant rounded-2xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium transition-all resize-none"
            />
            <p className="text-right text-xs text-on-surface-variant mt-1">{message.length}/300</p>
          </div>

          {/* Bill upload */}
          <div>
            <p className="text-xs font-black text-on-surface-variant uppercase tracking-wider mb-2">
              Ảnh xác nhận chuyển khoản <span className="text-error normal-case font-bold">*</span>
            </p>
            <input
              ref={fileRef}
              type="file" accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            {billPreview ? (
              <div className="relative group rounded-2xl overflow-hidden border border-outline-variant">
                <img src={billPreview} alt="Bill" className="w-full object-cover max-h-64" />
                <button
                  type="button"
                  onClick={handleRemoveBill}
                  className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="w-full border-2 border-dashed border-outline-variant rounded-2xl py-8 flex flex-col items-center gap-3 hover:border-primary hover:bg-primary/3 transition-all group"
              >
                <div className="w-12 h-12 bg-surface-container rounded-xl flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                  <Camera className="w-6 h-6 text-on-surface-variant group-hover:text-primary transition-colors" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-on-surface group-hover:text-primary transition-colors">Tải ảnh bill lên</p>
                  <p className="text-xs text-on-surface-variant mt-0.5">Chụp màn hình sau khi chuyển khoản (tối đa 5MB)</p>
                </div>
              </button>
            )}
          </div>

          {/* Tip */}
          <div className="flex items-start gap-3 p-4 bg-sky-50 rounded-2xl border border-sky-100">
            <AlertCircle className="w-5 h-5 text-sky-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-sky-800 leading-relaxed">
              Khoản ủng hộ sẽ được admin xét duyệt sau khi kiểm tra bill. Quá trình thường hoàn tất trong vòng <strong>24 giờ</strong>.
            </p>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || amount < 5000 || !billBase64}
            className="w-full py-4 bg-primary text-on-primary rounded-2xl font-extrabold text-base shadow-lg shadow-primary/20 hover:opacity-90 active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Gift className="w-5 h-5" />
            {loading ? 'Đang gửi...' : `Gửi xác nhận ủng hộ ${amount >= 5000 ? fmtMoney(amount) : ''}`}
          </button>

          <p className="text-center text-xs text-on-surface-variant">
            🔒 PAW Home cam kết sử dụng 100% đóng góp cho hoạt động cứu trợ và chăm sóc thú cưng.
          </p>
        </form>
      </div>
    </div>
  );
};

const BankRow: React.FC<{ label: string; value: string; onCopy?: () => void }> = ({ label, value, onCopy }) => (
  <div className="flex items-center justify-between gap-3">
    <span className="text-xs text-on-surface-variant font-medium flex-shrink-0">{label}</span>
    <div className="flex items-center gap-1.5 min-w-0">
      <span className="text-sm font-bold text-on-surface truncate">{value}</span>
      {onCopy && (
        <button
          type="button"
          onClick={onCopy}
          className="p-1 rounded-lg hover:bg-surface-container transition-colors flex-shrink-0"
          title="Sao chép"
        >
          <Copy className="w-3.5 h-3.5 text-primary" />
        </button>
      )}
    </div>
  </div>
);
