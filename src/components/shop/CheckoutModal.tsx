import React, { useState } from 'react';
import { X, ShoppingBag, Truck, CreditCard, QrCode, ChevronRight, Minus, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface Product {
  _id: string;
  name: string;
  image: string;
  price: number;
  stock: number;
  category: string;
}

interface Props {
  product: Product;
  onClose: () => void;
}

const imgSrc = (img: string) =>
  img?.startsWith('/uploads') ? `http://localhost:5000${img}` : img;

export const CheckoutModal: React.FC<Props> = ({ product, onClose }) => {
  const { user, token } = useAuth();
  const navigate         = useNavigate();

  const [qty, setQty]         = useState(1);
  const [step, setStep]       = useState<'info' | 'payment'>('info');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [method, setMethod]   = useState<'cod' | 'online'>('cod');

  const [form, setForm] = useState({
    name:    user?.name    || '',
    phone:   user?.phone   || '',
    address: '',
    city:    'Đà Nẵng',
    note:    ''
  });

  const subtotal = product.price * qty;
  const discount = method === 'online' ? Math.round(subtotal * 0.1) : 0;
  const total    = subtotal - discount;

  const handleSubmit = async () => {
    if (!form.name || !form.phone || !form.address) {
      setError('Vui lòng điền đầy đủ họ tên, số điện thoại và địa chỉ.'); return;
    }
    setLoading(true); setError('');

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization:  `Bearer ${token}`
        },
        body: JSON.stringify({
          items: [{ productId: product._id, quantity: qty }],
          shippingInfo: {
            name:    form.name,
            phone:   form.phone,
            address: form.address,
            city:    form.city
          },
          paymentMethod: method,
          note: form.note
        })
      });

      const data = await res.json();
      if (!res.ok) { setError(data.message); return; }

      if (method === 'online' && data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        onClose();
        navigate('/payment/result?status=success&orderId=' + data.order._id);
      }
    } catch {
      setError('Không thể kết nối máy chủ. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full border border-outline-variant rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 font-medium bg-white";

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-lg rounded-t-[32px] sm:rounded-[32px] max-h-[92vh] flex flex-col shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-outline-variant flex-shrink-0">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-black text-on-surface">Đặt hàng nhanh</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-surface-container rounded-xl transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

          {/* Product summary */}
          <div className="flex gap-4 p-4 bg-surface-container-low rounded-2xl">
            <img src={imgSrc(product.image)} alt={product.name}
              className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
              onError={e => { (e.target as HTMLImageElement).src = 'https://placehold.co/64x64?text=🛍'; }}
            />
            <div className="flex-1 min-w-0">
              <p className="font-bold text-on-surface text-sm leading-tight truncate">{product.name}</p>
              <p className="text-xs text-on-surface-variant mt-0.5">{product.category}</p>
              <p className="text-primary font-black text-base mt-1">{product.price.toLocaleString()}đ</p>
            </div>
            {/* Quantity */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <button onClick={() => setQty(q => Math.max(1, q - 1))}
                className="w-8 h-8 rounded-xl bg-surface-container flex items-center justify-center hover:bg-primary/10 transition-colors">
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-6 text-center font-black text-sm">{qty}</span>
              <button onClick={() => setQty(q => Math.min(product.stock, q + 1))}
                className="w-8 h-8 rounded-xl bg-surface-container flex items-center justify-center hover:bg-primary/10 transition-colors">
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded-2xl text-sm font-semibold">{error}</div>
          )}

          {step === 'info' ? (
            <>
              {/* Shipping info */}
              <div className="space-y-3">
                <p className="text-xs font-black text-on-surface-variant uppercase tracking-wider flex items-center gap-2">
                  <Truck className="w-4 h-4" /> Thông tin giao hàng
                </p>
                <input className={inputCls} placeholder="Họ và tên người nhận *"
                  value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                <input className={inputCls} placeholder="Số điện thoại *" type="tel"
                  value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
                <input className={inputCls} placeholder="Địa chỉ nhận hàng (số nhà, đường, phường) *"
                  value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
                <input className={inputCls} placeholder="Thành phố / Tỉnh"
                  value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} />
                <textarea className={`${inputCls} resize-none`} rows={2}
                  placeholder="Ghi chú cho đơn hàng (không bắt buộc)"
                  value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} />
              </div>
            </>
          ) : (
            <>
              {/* Payment method */}
              <div className="space-y-3">
                <p className="text-xs font-black text-on-surface-variant uppercase tracking-wider flex items-center gap-2">
                  <CreditCard className="w-4 h-4" /> Phương thức thanh toán
                </p>

                {/* COD */}
                <button onClick={() => setMethod('cod')}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${method === 'cod' ? 'border-primary bg-primary/5' : 'border-outline-variant hover:border-primary/30'}`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${method === 'cod' ? 'bg-primary text-on-primary' : 'bg-surface-container'}`}>
                    💵
                  </div>
                  <div>
                    <p className="font-bold text-sm text-on-surface">Thanh toán khi nhận hàng (COD)</p>
                    <p className="text-xs text-on-surface-variant">Trả tiền mặt khi shipper giao hàng</p>
                  </div>
                  {method === 'cod' && <div className="ml-auto w-5 h-5 rounded-full bg-primary flex items-center justify-center"><div className="w-2 h-2 rounded-full bg-white" /></div>}
                </button>

                {/* Online */}
                <button onClick={() => setMethod('online')}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${method === 'online' ? 'border-primary bg-primary/5' : 'border-outline-variant hover:border-primary/30'}`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${method === 'online' ? 'bg-primary text-on-primary' : 'bg-surface-container'}`}>
                    <QrCode className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-sm text-on-surface">Thanh toán PayOS / VietQR</p>
                      <span className="text-[10px] font-black bg-green-100 text-green-700 px-2 py-0.5 rounded-full">-10%</span>
                    </div>
                    <p className="text-xs text-on-surface-variant">Quét mã QR VietQR, chuyển khoản — giảm ngay 10%</p>
                  </div>
                  {method === 'online' && <div className="ml-auto w-5 h-5 rounded-full bg-primary flex items-center justify-center"><div className="w-2 h-2 rounded-full bg-white" /></div>}
                </button>
              </div>

              {/* Order summary */}
              <div className="bg-surface-container-low rounded-2xl p-4 space-y-2">
                <p className="text-xs font-black text-on-surface-variant uppercase tracking-wider mb-3">Tóm tắt đơn hàng</p>
                <div className="flex justify-between text-sm">
                  <span className="text-on-surface-variant">Tạm tính ({qty} sản phẩm)</span>
                  <span className="font-bold">{subtotal.toLocaleString()}đ</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm text-green-700">
                    <span>Giảm giá thanh toán online (-10%)</span>
                    <span className="font-bold">-{discount.toLocaleString()}đ</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-on-surface-variant">Phí vận chuyển</span>
                  <span className="font-bold text-green-700">Miễn phí</span>
                </div>
                <div className="border-t border-outline-variant pt-2 flex justify-between">
                  <span className="font-black text-on-surface">Tổng thanh toán</span>
                  <span className="font-black text-primary text-lg">{total.toLocaleString()}đ</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 pt-4 border-t border-outline-variant flex-shrink-0">
          {step === 'info' ? (
            <button onClick={() => { setError(''); setStep('payment'); }}
              className="w-full py-4 bg-primary text-on-primary rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.01] transition-all">
              Tiếp tục <ChevronRight className="w-5 h-5" />
            </button>
          ) : (
            <div className="flex gap-3">
              <button onClick={() => setStep('info')}
                className="flex-1 py-4 border border-outline-variant rounded-2xl font-bold text-on-surface-variant hover:bg-surface-container transition-all">
                Quay lại
              </button>
              <button onClick={handleSubmit} disabled={loading}
                className="flex-[2] py-4 bg-primary text-on-primary rounded-2xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-95 transition-all disabled:opacity-50">
                {loading ? 'Đang xử lý...' : method === 'online' ? 'Thanh toán PayOS →' : 'Đặt hàng ngay'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
