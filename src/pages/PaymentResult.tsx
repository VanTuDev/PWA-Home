import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, XCircle, AlertCircle, ShoppingBag, Home, Gift, PawPrint } from 'lucide-react';
import { motion } from 'motion/react';

export const PaymentResult: React.FC = () => {
  const [params]  = useSearchParams();
  const status    = params.get('status');   // success | failed | error | cancelled
  const orderId   = params.get('orderId');
  const type      = params.get('type');     // 'donation' | null (shop order)
  const petId     = params.get('petId');
  const isDonation = type === 'donation';
  const [countdown, setCountdown] = useState(isDonation ? 0 : 8); // donation không auto-redirect

  useEffect(() => {
    if (isDonation || !countdown) return; // donation không auto-redirect
    const t = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) { clearInterval(t); window.location.href = '/'; }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [isDonation]);

  // Config cho shop order
  const shopConfig = {
    success:   { icon: <CheckCircle className="w-20 h-20 text-green-500" />,  title: 'Thanh toán thành công! 🎉',  message: 'Cảm ơn bạn đã mua sắm tại PAW Shop. Đơn hàng đã được xác nhận và sẽ giao sớm nhất.', bg: 'from-green-50 to-emerald-50', border: 'border-green-200' },
    failed:    { icon: <XCircle className="w-20 h-20 text-red-500" />,         title: 'Thanh toán thất bại',        message: 'Giao dịch không thành công. Đơn hàng vẫn được giữ — bạn có thể thử lại hoặc chọn COD.', bg: 'from-red-50 to-rose-50', border: 'border-red-200' },
    cancelled: { icon: <XCircle className="w-20 h-20 text-orange-500" />,      title: 'Đã huỷ thanh toán',          message: 'Bạn đã huỷ giao dịch. Đơn hàng vẫn được giữ, bạn có thể thanh toán lại sau.', bg: 'from-orange-50 to-amber-50', border: 'border-orange-200' },
    error:     { icon: <AlertCircle className="w-20 h-20 text-amber-500" />,   title: 'Có lỗi xảy ra',              message: 'Đã có lỗi trong quá trình xử lý. Vui lòng liên hệ hỗ trợ nếu tiền đã bị trừ.', bg: 'from-amber-50 to-yellow-50', border: 'border-amber-200' },
  };

  // Config cho donation
  const donationConfig = {
    success:   { icon: <Gift className="w-20 h-20 text-green-500" />,          title: 'Đóng góp thành công! 🐾',   message: 'Cảm ơn tấm lòng của bạn! Khoản đóng góp đã được ghi nhận. Bạn có thể tiếp tục đăng ký nhận nuôi ngay bây giờ.', bg: 'from-green-50 to-emerald-50', border: 'border-green-200' },
    failed:    { icon: <XCircle className="w-20 h-20 text-red-500" />,          title: 'Thanh toán thất bại',        message: 'Giao dịch không thành công. Bạn cần hoàn thành khoản đóng góp để tiếp tục đăng ký nhận nuôi.', bg: 'from-red-50 to-rose-50', border: 'border-red-200' },
    cancelled: { icon: <XCircle className="w-20 h-20 text-orange-500" />,       title: 'Đã huỷ thanh toán',          message: 'Bạn đã huỷ khoản đóng góp. Bạn có thể thực hiện lại khi muốn nhận nuôi bé.', bg: 'from-orange-50 to-amber-50', border: 'border-orange-200' },
    error:     { icon: <AlertCircle className="w-20 h-20 text-amber-500" />,    title: 'Có lỗi xảy ra',              message: 'Đã có lỗi trong quá trình xử lý. Vui lòng liên hệ hỗ trợ.', bg: 'from-amber-50 to-yellow-50', border: 'border-amber-200' },
  };

  const pool = isDonation ? donationConfig : shopConfig;
  const cfg  = pool[status as keyof typeof pool] || pool.error;

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`w-full max-w-lg bg-gradient-to-br ${cfg.bg} border ${cfg.border} rounded-[40px] p-10 text-center shadow-2xl`}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.2 }}
          className="flex justify-center mb-6"
        >
          {cfg.icon}
        </motion.div>

        <h1 className="text-2xl font-black text-on-surface mb-3">{cfg.title}</h1>
        <p className="text-on-surface-variant text-sm font-medium leading-relaxed mb-6">{cfg.message}</p>

        {orderId && (
          <div className="bg-white/70 rounded-2xl px-6 py-3 mb-6 inline-block">
            <p className="text-xs text-on-surface-variant font-bold uppercase tracking-wider">Mã đơn hàng</p>
            <p className="font-black text-primary text-lg">#{orderId.slice(-8).toUpperCase()}</p>
          </div>
        )}

        <div className="flex gap-3 justify-center flex-wrap">
          <Link to="/"
            className="flex items-center gap-2 px-6 py-3 bg-white border border-outline-variant rounded-2xl text-sm font-bold text-on-surface hover:bg-surface-container transition-all">
            <Home className="w-4 h-4" /> Trang chủ
          </Link>
          {isDonation ? (
            status === 'success' && petId ? (
              <Link to={`/apply/${petId}`}
                className="flex items-center gap-2 px-6 py-3 bg-primary text-on-primary rounded-2xl text-sm font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all">
                <PawPrint className="w-4 h-4" /> Tiếp tục đăng ký nhận nuôi
              </Link>
            ) : petId ? (
              <Link to={`/pet/${petId}`}
                className="flex items-center gap-2 px-6 py-3 bg-primary text-on-primary rounded-2xl text-sm font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all">
                <PawPrint className="w-4 h-4" /> Xem lại thú cưng
              </Link>
            ) : null
          ) : (
            <Link to="/shop"
              className="flex items-center gap-2 px-6 py-3 bg-primary text-on-primary rounded-2xl text-sm font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all">
              <ShoppingBag className="w-4 h-4" /> Tiếp tục mua sắm
            </Link>
          )}
        </div>

        {!isDonation && countdown > 0 && (
          <p className="mt-6 text-xs text-on-surface-variant font-medium">
            Tự động chuyển về trang chủ sau <span className="font-black text-primary">{countdown}s</span>
          </p>
        )}
      </motion.div>
    </div>
  );
};
