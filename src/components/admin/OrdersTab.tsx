import React, { useState, useEffect } from 'react';
import { ChevronDown, Package, RefreshCw } from 'lucide-react';

interface OrderItem { name: string; price: number; quantity: number; image: string; }
interface Order {
  _id: string;
  userId: { name: string; email: string; phone?: string } | null;
  items: OrderItem[];
  shippingInfo: { name: string; phone: string; address: string; city: string };
  paymentMethod: 'cod' | 'online';
  paymentStatus: 'pending' | 'paid' | 'failed';
  orderStatus: 'pending' | 'confirmed' | 'shipping' | 'delivered' | 'cancelled';
  subtotal: number;
  discount: number;
  total: number;
  note: string;
  createdAt: string;
}

const ORDER_STATUS: Record<string, { label: string; color: string }> = {
  pending:   { label: 'Chờ xác nhận', color: 'bg-amber-100  text-amber-700'  },
  confirmed: { label: 'Đã xác nhận',  color: 'bg-blue-100   text-blue-700'   },
  shipping:  { label: 'Đang giao',    color: 'bg-purple-100 text-purple-700' },
  delivered: { label: 'Đã giao',      color: 'bg-green-100  text-green-700'  },
  cancelled: { label: 'Đã huỷ',       color: 'bg-red-100    text-red-600'    }
};
const PAYMENT_STATUS: Record<string, { label: string; color: string }> = {
  pending: { label: 'Chưa TT',    color: 'bg-gray-100  text-gray-600'  },
  paid:    { label: 'Đã TT',      color: 'bg-green-100 text-green-700' },
  failed:  { label: 'TT lỗi',     color: 'bg-red-100   text-red-600'   }
};

const getToken = () => localStorage.getItem('paw_token') || '';

export const OrdersTab: React.FC = () => {
  const [orders, setOrders]     = useState<Order[]>([]);
  const [loading, setLoading]   = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/orders', {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdating(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderStatus: newStatus })
      });
      if (res.ok) setOrders(o => o.map(x => x._id === orderId ? { ...x, orderStatus: newStatus as any } : x));
    } catch { /* silent */ }
    finally { setUpdating(null); }
  };

  const pending = orders.filter(o => o.orderStatus === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-black text-on-surface tracking-tighter">Đơn hàng</h1>
            {pending > 0 && (
              <span className="px-2.5 py-0.5 bg-red-100 text-red-700 text-xs font-black rounded-full animate-pulse">
                {pending} chờ duyệt
              </span>
            )}
          </div>
          <p className="text-sm text-on-surface-variant font-medium mt-1">
            {loading ? '...' : `${orders.length} đơn hàng tổng cộng`}
          </p>
        </div>
        <button onClick={load} disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 border border-outline-variant rounded-xl text-sm font-bold text-on-surface hover:bg-surface-container transition-all disabled:opacity-50">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Làm mới
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-[32px] border border-outline-variant shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-on-surface-variant font-medium animate-pulse">Đang tải...</div>
        ) : orders.length === 0 ? (
          <div className="py-20 text-center text-on-surface-variant">
            <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-bold">Chưa có đơn hàng nào</p>
          </div>
        ) : (
          <div className="divide-y divide-outline-variant">
            {orders.map(order => {
              const os = ORDER_STATUS[order.orderStatus] || ORDER_STATUS.pending;
              const ps = PAYMENT_STATUS[order.paymentStatus] || PAYMENT_STATUS.pending;
              const isOpen = expanded === order._id;

              return (
                <div key={order._id}>
                  {/* Row */}
                  <div className="px-6 py-4 hover:bg-surface-container-lowest transition-colors">
                    <div className="flex items-center gap-4 flex-wrap">
                      {/* Order ID + Date */}
                      <div className="w-28 flex-shrink-0">
                        <p className="font-black text-primary text-xs">#{order._id.slice(-8).toUpperCase()}</p>
                        <p className="text-[10px] text-on-surface-variant mt-0.5">
                          {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                        </p>
                      </div>

                      {/* Customer */}
                      <div className="flex-1 min-w-[120px]">
                        <p className="font-bold text-sm text-on-surface truncate">
                          {order.shippingInfo.name}
                        </p>
                        <p className="text-[10px] text-on-surface-variant">{order.shippingInfo.phone}</p>
                      </div>

                      {/* Total */}
                      <div className="text-right flex-shrink-0">
                        <p className="font-black text-primary">{order.total.toLocaleString()}đ</p>
                        {order.discount > 0 && (
                          <p className="text-[10px] text-green-600 font-bold">-{order.discount.toLocaleString()}đ</p>
                        )}
                      </div>

                      {/* Payment */}
                      <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider flex-shrink-0 ${ps.color}`}>
                        {ps.label} · {order.paymentMethod === 'online' ? 'PayOS' : 'COD'}
                      </span>

                      {/* Order status dropdown */}
                      <div className="flex-shrink-0">
                        <div className="relative">
                          <select
                            value={order.orderStatus}
                            disabled={updating === order._id}
                            onChange={e => handleStatusChange(order._id, e.target.value)}
                            className={`text-[10px] font-black pl-3 pr-7 py-1.5 rounded-xl border-2 uppercase tracking-wider outline-none cursor-pointer appearance-none ${os.color.replace('bg-', 'bg-').replace('text-', 'border-').split(' ')[0]} border-current/20`}
                            style={{ backgroundColor: '', borderColor: 'transparent' }}
                          >
                            {Object.entries(ORDER_STATUS).map(([v, cfg]) => (
                              <option key={v} value={v}>{cfg.label}</option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none opacity-60" />
                        </div>
                      </div>

                      {/* Expand toggle */}
                      <button onClick={() => setExpanded(isOpen ? null : order._id)}
                        className="flex-shrink-0 p-1.5 hover:bg-surface-container rounded-lg transition-colors">
                        <ChevronDown className={`w-4 h-4 text-on-surface-variant transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                      </button>
                    </div>
                  </div>

                  {/* Expanded detail */}
                  {isOpen && (
                    <div className="px-6 pb-5 bg-surface-container-lowest border-t border-outline-variant">
                      <div className="grid md:grid-cols-2 gap-6 pt-4">
                        {/* Items */}
                        <div>
                          <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-wider mb-3">Sản phẩm</p>
                          <div className="space-y-2">
                            {order.items.map((item, idx) => (
                              <div key={idx} className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-lg flex-shrink-0">
                                  🛍
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-bold text-on-surface truncate">{item.name}</p>
                                  <p className="text-xs text-on-surface-variant">x{item.quantity} · {item.price.toLocaleString()}đ</p>
                                </div>
                                <p className="font-bold text-sm text-primary flex-shrink-0">
                                  {(item.price * item.quantity).toLocaleString()}đ
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Shipping */}
                        <div>
                          <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-wider mb-3">Giao hàng</p>
                          <div className="space-y-1.5 text-sm">
                            <p><span className="text-on-surface-variant">Người nhận:</span> <strong>{order.shippingInfo.name}</strong></p>
                            <p><span className="text-on-surface-variant">SĐT:</span> <strong>{order.shippingInfo.phone}</strong></p>
                            <p><span className="text-on-surface-variant">Địa chỉ:</span> <strong>{order.shippingInfo.address}, {order.shippingInfo.city}</strong></p>
                            {order.note && <p><span className="text-on-surface-variant">Ghi chú:</span> {order.note}</p>}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
