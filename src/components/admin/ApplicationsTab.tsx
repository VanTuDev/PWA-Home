import React, { useState, useEffect } from 'react';
import { ClipboardList, Check, X, ShieldAlert, Phone, Eye, Calendar, MapPin, Briefcase, DollarSign, Home, Heart, Award, ArrowUpRight, User, Truck, FileText, CreditCard } from 'lucide-react';

interface Pet {
  id: string;
  name: string;
  breed: string;
  image: string;
  status: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
}

interface AdoptionApplication {
  id: string;
  petId: Pet;
  userId: User;
  fullName: string;
  phone: string;
  facebookLink?: string;
  job: string;
  monthlyIncome: string;
  address: string;
  housingType: string;
  experience: string;
  reason: string;
  idCardFront?: string;
  idCardBack?: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'FollowUp';
  deliveryOption: 'pickup' | 'shipping';
  submittedAt: string;
}

const STATUS_STYLE: Record<string, string> = {
  Pending:  'bg-amber-50 text-amber-700 border-amber-100',
  Approved: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  Rejected: 'bg-rose-50 text-rose-700 border-rose-100',
  FollowUp: 'bg-sky-50 text-sky-700 border-sky-100'
};

const STATUS_TEXT: Record<string, string> = {
  Pending:  'Chờ duyệt',
  Approved: 'Đã duyệt',
  Rejected: 'Từ chối',
  FollowUp: 'Theo dõi'
};

const getToken = () => localStorage.getItem('paw_token') || '';
const authHeader = () => ({
  Authorization: `Bearer ${getToken()}`,
  'Content-Type': 'application/json'
});

export const ApplicationsTab: React.FC = () => {
  const [applications, setApplications] = useState<AdoptionApplication[]>([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');
  const [selectedApp, setSelectedApp]   = useState<AdoptionApplication | null>(null);
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null);
  const [actioning, setActioning]       = useState(false);

  const loadApplications = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/adoptions', { headers: authHeader() });
      const data = await res.json();
      if (res.ok) {
        setApplications(Array.isArray(data) ? data : []);
      } else {
        setError(data.message || 'Lỗi tải danh sách hồ sơ nhận nuôi.');
      }
    } catch {
      setError('Không thể kết nối máy chủ.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, []);

  const handleUpdateStatus = async (appId: string, newStatus: 'Approved' | 'Rejected' | 'FollowUp') => {
    if (!window.confirm(`Xác nhận cập nhật trạng thái đơn thành [${STATUS_TEXT[newStatus].toUpperCase()}]?`)) return;
    setActioning(true);
    try {
      const res = await fetch(`/api/adoptions/${appId}/status`, {
        method: 'PUT',
        headers: authHeader(),
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (res.ok) {
        // Update local status
        setApplications(prev => prev.map(app => app.id === appId ? { ...app, status: newStatus } : app));
        if (selectedApp?.id === appId) {
          setSelectedApp(prev => prev ? { ...prev, status: newStatus } : null);
        }
        alert('Cập nhật trạng thái hồ sơ thành công!');
      } else {
        alert(data.message || 'Thao tác cập nhật thất bại.');
      }
    } catch {
      alert('Lỗi kết nối máy chủ khi duyệt hồ sơ.');
    } finally {
      setActioning(false);
    }
  };

  const imgSrc = (img: string) => {
    if (!img) return 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=400';
    return img.startsWith('/uploads') ? `http://localhost:5000${img}` : img;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-on-surface tracking-tighter">Đơn đăng ký nhận nuôi</h1>
        <p className="text-sm text-on-surface-variant font-medium mt-1">
          {loading ? '...' : `${applications.length} hồ sơ đăng ký nhận nuôi thú cưng`}
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-sm font-semibold flex items-center gap-2">
          <ShieldAlert className="w-5 h-5" /> {error}
        </div>
      )}

      {/* Main Table */}
      <div className="bg-white rounded-[32px] border border-outline-variant shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-on-surface-variant font-medium animate-pulse">Đang tải danh sách hồ sơ...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-surface-container-low text-[10px] uppercase font-black text-on-surface-variant tracking-[0.2em] border-b border-outline-variant">
                  <th className="px-8 py-5 text-left">Người đăng ký</th>
                  <th className="px-8 py-5 text-left">Thú cưng</th>
                  <th className="px-8 py-5 text-left">Thông tin liên hệ</th>
                  <th className="px-8 py-5 text-left">Ngày gửi</th>
                  <th className="px-8 py-5 text-left">Hình thức</th>
                  <th className="px-8 py-5 text-left">Trạng thái</th>
                  <th className="px-8 py-5 text-center">Chi tiết</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {applications.map(app => (
                  <tr key={app.id} className="hover:bg-surface-container-lowest transition-colors">
                    <td className="px-8 py-5">
                      <p className="font-bold text-on-surface">{app.fullName}</p>
                      <p className="text-xs text-on-surface-variant mt-0.5">{app.job}</p>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl overflow-hidden shadow-sm flex-shrink-0">
                          <img src={imgSrc(app.petId?.image)} className="w-full h-full object-cover" alt={app.petId?.name} />
                        </div>
                        <div>
                          <p className="font-bold text-on-surface">{app.petId?.name || 'Bé cũ'}</p>
                          <p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider">{app.petId?.breed || 'Thú cưng'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <p className="text-sm font-bold text-on-surface flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-on-surface-variant" />
                        {app.phone}
                      </p>
                      {app.facebookLink && (
                        <a href={app.facebookLink} target="_blank" rel="noreferrer" className="text-xs text-primary font-bold hover:underline flex items-center gap-0.5 mt-0.5">
                          Facebook <ArrowUpRight className="w-3 h-3" />
                        </a>
                      )}
                    </td>
                    <td className="px-8 py-5 text-sm font-medium text-on-surface-variant">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(app.submittedAt).toLocaleDateString('vi-VN')}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-xs font-bold text-on-surface-variant bg-surface-container-high px-2.5 py-1 rounded-xl">
                        {app.deliveryOption === 'pickup' ? 'Nhận tại trạm' : 'Ship tận nơi'}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`text-[10px] font-black px-2.5 py-1.5 rounded-xl uppercase tracking-widest border border-current ${STATUS_STYLE[app.status]}`}>
                        {STATUS_TEXT[app.status]}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <button 
                        onClick={() => setSelectedApp(app)}
                        className="p-2.5 hover:bg-primary-fixed rounded-xl text-primary hover:text-on-primary-fixed transition-colors"
                        title="Xem hồ sơ chi tiết"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!loading && applications.length === 0 && (
              <div className="py-20 text-center text-on-surface-variant font-medium">
                Chưa có hồ sơ nhận nuôi nào được gửi lên hệ thống.
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Details Expansion Drawer / Modal ───────────────────────────────── */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/40 backdrop-blur-sm p-0 md:p-4">
          <div className="bg-white w-full max-w-2xl h-full md:h-[95vh] md:rounded-[40px] shadow-2xl flex flex-col overflow-hidden animate-slide-in">
            {/* Header */}
            <div className="px-8 pt-7 pb-5 border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
              <div>
                <h2 className="text-xl font-black text-on-surface flex items-center gap-2">
                  <ClipboardList className="w-5.5 h-5.5 text-primary" /> Hồ sơ ứng tuyển nhận nuôi
                </h2>
                <p className="text-xs text-on-surface-variant mt-0.5">Mã hồ sơ: {selectedApp.id}</p>
              </div>
              <button 
                onClick={() => setSelectedApp(null)}
                className="p-2 hover:bg-surface-container rounded-xl transition-colors"
              >
                <X className="w-5.5 h-5.5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
              {/* Pet Info Banner */}
              <div className="bg-primary/5 rounded-[28px] border border-primary/10 p-5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-sm flex-shrink-0">
                    <img src={imgSrc(selectedApp.petId?.image)} className="w-full h-full object-cover" alt={selectedApp.petId?.name} />
                  </div>
                  <div>
                    <h3 className="font-black text-primary text-lg">{selectedApp.petId?.name || 'Bé cưng'}</h3>
                    <p className="text-sm text-on-surface-variant font-bold flex items-center gap-1.5 mt-0.5">
                      <Award className="w-4 h-4" /> {selectedApp.petId?.breed || 'Thú cưng'} • {selectedApp.petId?.status === 'Adopted' ? 'Đã được nhận' : 'Chờ về nhà mới'}
                    </p>
                  </div>
                </div>
                <span className={`text-[10px] font-black px-3 py-1.5 rounded-xl uppercase tracking-widest border border-current ${STATUS_STYLE[selectedApp.status]}`}>
                  {STATUS_TEXT[selectedApp.status]}
                </span>
              </div>

              {/* Grid 2 Column Personal Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-surface-container-low rounded-2xl p-5 space-y-3.5 border border-outline-variant">
                  <h4 className="text-[10px] font-black text-on-surface-variant uppercase tracking-wider mb-2">Thông tin cá nhân</h4>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center flex-shrink-0 text-primary border border-outline-variant">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-on-surface-variant uppercase">Họ và tên</p>
                      <p className="text-sm font-black text-on-surface mt-0.5">{selectedApp.fullName}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center flex-shrink-0 text-primary border border-outline-variant">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-on-surface-variant uppercase">Số điện thoại</p>
                      <p className="text-sm font-black text-on-surface mt-0.5">{selectedApp.phone}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center flex-shrink-0 text-primary border border-outline-variant">
                      <Briefcase className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-on-surface-variant uppercase">Công việc</p>
                      <p className="text-sm font-black text-on-surface mt-0.5">{selectedApp.job}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center flex-shrink-0 text-primary border border-outline-variant">
                      <DollarSign className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-on-surface-variant uppercase">Thu nhập tháng</p>
                      <p className="text-sm font-black text-on-surface mt-0.5">{selectedApp.monthlyIncome}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-surface-container-low rounded-2xl p-5 space-y-3.5 border border-outline-variant">
                  <h4 className="text-[10px] font-black text-on-surface-variant uppercase tracking-wider mb-2">Môi trường sống</h4>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center flex-shrink-0 text-primary border border-outline-variant">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-on-surface-variant uppercase">Địa chỉ thường trú</p>
                      <p className="text-sm font-black text-on-surface mt-0.5 leading-relaxed">{selectedApp.address}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center flex-shrink-0 text-primary border border-outline-variant">
                      <Home className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-on-surface-variant uppercase">Loại hình nhà ở</p>
                      <p className="text-sm font-black text-on-surface mt-0.5">{selectedApp.housingType}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center flex-shrink-0 text-primary border border-outline-variant">
                      <Heart className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-on-surface-variant uppercase">Kinh nghiệm nuôi</p>
                      <p className="text-sm font-black text-on-surface mt-0.5">{selectedApp.experience}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center flex-shrink-0 text-primary border border-outline-variant">
                      <Truck className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-on-surface-variant uppercase">Hình thức nhận bé</p>
                      <p className="text-sm font-black text-on-surface mt-0.5">{selectedApp.deliveryOption === 'pickup' ? 'Nhận tại trạm' : 'Vận chuyển (Ship)'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Reason box */}
              <div className="bg-surface-container-low rounded-2xl p-5 border border-outline-variant space-y-2">
                <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-4 h-4" /> Lý do muốn nhận nuôi
                </p>
                <p className="text-sm font-medium text-on-surface leading-relaxed p-3 bg-white rounded-xl border border-outline-variant/60 whitespace-pre-line italic">
                  "{selectedApp.reason || 'Không cung cấp lý do chi tiết.'}"
                </p>
              </div>

              {/* ID Cards front/back verification images */}
              <div className="space-y-4">
                <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-wider flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4" /> Bản scan CMND / CCCD xác minh danh tính
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {selectedApp.idCardFront ? (
                    <div 
                      onClick={() => setEnlargedImage(imgSrc(selectedApp.idCardFront!))}
                      className="group aspect-[1.6/1] bg-surface rounded-2xl overflow-hidden border border-outline-variant shadow-sm relative cursor-zoom-in"
                    >
                      <img src={imgSrc(selectedApp.idCardFront)} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" alt="CMND trước" />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold gap-1.5 transition-opacity">
                        <Eye className="w-4 h-4" /> Nhấn để phóng to
                      </div>
                    </div>
                  ) : (
                    <div className="aspect-[1.6/1] bg-surface rounded-2xl border border-outline-variant flex items-center justify-center text-xs font-medium text-on-surface-variant italic">
                      Chưa tải lên mặt trước
                    </div>
                  )}

                  {selectedApp.idCardBack ? (
                    <div 
                      onClick={() => setEnlargedImage(imgSrc(selectedApp.idCardBack!))}
                      className="group aspect-[1.6/1] bg-surface rounded-2xl overflow-hidden border border-outline-variant shadow-sm relative cursor-zoom-in"
                    >
                      <img src={imgSrc(selectedApp.idCardBack)} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" alt="CMND sau" />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold gap-1.5 transition-opacity">
                        <Eye className="w-4 h-4" /> Nhấn để phóng to
                      </div>
                    </div>
                  ) : (
                    <div className="aspect-[1.6/1] bg-surface rounded-2xl border border-outline-variant flex items-center justify-center text-xs font-medium text-on-surface-variant italic">
                      Chưa tải lên mặt sau
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Actions Footer */}
            {selectedApp.status === 'Pending' && (
              <div className="px-8 py-6 bg-surface-container-low border-t border-outline-variant flex gap-4">
                <button
                  onClick={() => handleUpdateStatus(selectedApp.id, 'Rejected')}
                  disabled={actioning}
                  className="flex-1 py-4 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-2xl font-bold flex items-center justify-center gap-2 border border-rose-200 transition-all disabled:opacity-50"
                >
                  <X className="w-5 h-5" /> Từ chối hồ sơ
                </button>
                <button
                  onClick={() => handleUpdateStatus(selectedApp.id, 'FollowUp')}
                  disabled={actioning}
                  className="py-4 px-6 border border-outline-variant hover:bg-surface-container-high rounded-2xl font-bold text-on-surface-variant transition-all disabled:opacity-50"
                >
                  Cần theo dõi thêm
                </button>
                <button
                  onClick={() => handleUpdateStatus(selectedApp.id, 'Approved')}
                  disabled={actioning}
                  className="flex-1 py-4 bg-emerald-600 text-white hover:bg-emerald-700 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all disabled:opacity-50"
                >
                  <Check className="w-5 h-5" /> Phê duyệt nhận nuôi
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Enlarged Image Overlay ────────────────────────────────────────── */}
      {enlargedImage && (
        <div 
          onClick={() => setEnlargedImage(null)}
          className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 cursor-zoom-out animate-fade-in"
        >
          <div className="max-w-4xl max-h-[90vh] relative">
            <img src={enlargedImage} className="w-full h-auto max-h-[90vh] object-contain rounded-2xl shadow-2xl" alt="Enlarged Scan" />
            <button 
              onClick={() => setEnlargedImage(null)}
              className="absolute -top-4 -right-4 bg-white/10 hover:bg-white/20 p-2.5 rounded-full text-white backdrop-blur-md transition-all shadow-md"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
