import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  User, MapPin, Home as HomeIcon, ShieldCheck, IdCard, Camera,
  ChevronRight, ChevronLeft, CheckCircle, PawPrint, Truck,
  Building, UserCheck, Gift, Loader2, AlertCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from '../utils/toast';

const BE_URL = (import.meta as any).env?.DEV ? 'http://localhost:5000' : 'https://pwa-home-be.onrender.com';
const imgSrc = (img: string) => {
  if (!img) return '';
  if (img.startsWith('http')) return img;
  const path = img.startsWith('/') ? img : `/${img}`;
  return `${BE_URL}${path}`;
};

export const ApplyForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [step, setStep] = useState(1);
  const totalSteps = 3;

  const [pet, setPet]               = useState<any>(null);
  const [loadingPet, setLoadingPet] = useState(true);
  const [petError, setPetError]     = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState('');

  // Payment gate state
  const [donated, setDonated]         = useState(false);
  const [donating, setDonating]       = useState(false);
  const [donateError, setDonateError] = useState('');

  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '',
    facebookLink: '',
    job: 'Đi làm',
    monthlyIncome: '5 - 10 triệu',
    idCardFront: '',
    idCardBack: '',
    address: user?.address !== 'Chưa cập nhật' ? user?.address || '' : '',
    experience: 'Chưa từng nuôi',
    housingType: 'Nhà phố',
    reason: '',
    deliveryOption: 'pickup',
  });

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/pets/${id}`);
        if (!res.ok) throw new Error('not found');
        const data = await res.json();
        setPet(data);
        // Check donation status if pet requires it
        if (token && data.donationAmount > 0) {
          const petRealId = data.id || data._id;
          const dr = await fetch(`/api/donations/check?petId=${petRealId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (dr.ok) { const dj = await dr.json(); setDonated(dj.donated); }
        }
      } catch { setPetError('Không thể tải thông tin thú cưng.'); }
      finally  { setLoadingPet(false); }
    };
    if (id) load();
  }, [id, token]);


  const handleDonate = async () => {
    if (!user) { navigate('/login'); return; }
    setDonating(true); setDonateError('');
    try {
      const res = await fetch('/api/donations/adoption', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ petId: pet.id || pet._id }),
      });
      const data = await res.json();
      if (!res.ok) { setDonateError(data.message); return; }
      if (data.alreadyDonated) { setDonated(true); return; }
      if (data.checkoutUrl) window.open(data.checkoutUrl, '_blank', 'noopener,noreferrer');
    } catch { setDonateError('Không thể kết nối máy chủ.'); }
    finally { setDonating(false); }
  };

  const steps = [
    { id: 1, title: 'Thông tin cá nhân', icon: User },
    { id: 2, title: 'Xác minh danh tính', icon: IdCard },
    { id: 3, title: 'Môi trường sống',    icon: HomeIcon },
  ];

  const handleUploadCard = (side: 'front' | 'back') => {
    const input = document.createElement('input');
    input.type = 'file'; input.accept = 'image/*';
    input.onchange = (e: any) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onloadend = () => setFormData(prev => ({
        ...prev,
        [side === 'front' ? 'idCardFront' : 'idCardBack']: reader.result as string,
      }));
      reader.readAsDataURL(file);
    };
    input.click();
  };

  const nextStep = () => {
    if (step === 1 && (!formData.fullName || !formData.phone)) {
      toast.warning('Vui lòng điền Họ tên và Số điện thoại liên hệ.'); return;
    }
    if (step === 2 && (!formData.idCardFront || !formData.idCardBack)) {
      toast.warning('Vui lòng tải lên cả hai mặt CMND/CCCD.'); return;
    }
    step < totalSteps && setStep(step + 1);
  };
  const prevStep = () => step > 1 && setStep(step - 1);

  const handleSubmit = async () => {
    if (!formData.address) { toast.warning('Vui lòng cung cấp địa chỉ sinh sống.'); return; }
    setSubmitting(true); setError('');
    try {
      const res = await fetch('/api/adoptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token || localStorage.getItem('paw_token') || ''}` },
        body: JSON.stringify({ petId: pet?.id || pet?._id || id, ...formData }),
      });
      const data = await res.json();
      if (res.ok) { toast.success('Đơn đăng ký đã được gửi thành công! Admin sẽ sớm liên hệ với bạn.'); navigate('/'); }
      else setError(data.message || 'Lỗi gửi đơn nhận nuôi.');
    } catch { setError('Không thể kết nối máy chủ. Vui lòng thử lại sau.'); }
    finally { setSubmitting(false); }
  };

  // ── Not logged in ──────────────────────────────────────────────────────────
  if (!user) {
    return (
      <div className="min-h-screen bg-surface py-20 px-margin-mobile flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-[40px] border border-outline-variant p-10 text-center shadow-xl">
          <div className="w-20 h-20 bg-primary/10 rounded-[28px] flex items-center justify-center mx-auto mb-6">
            <UserCheck className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-2xl font-black text-on-surface mb-3">Yêu cầu đăng nhập</h2>
          <p className="text-on-surface-variant text-sm leading-relaxed mb-8">Bạn cần đăng nhập để đăng ký nhận nuôi.</p>
          <Link to="/login" className="block w-full bg-primary text-on-primary py-4 rounded-[20px] font-bold text-sm shadow-lg shadow-primary/20 transition-all hover:scale-[1.02]">
            Đăng nhập ngay
          </Link>
        </div>
      </div>
    );
  }

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loadingPet) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  if (petError || !pet) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-on-surface-variant">
        <AlertCircle className="w-12 h-12 text-error" />
        <p className="font-bold">{petError || 'Không tìm thấy thú cưng.'}</p>
        <Link to="/pets" className="text-primary font-bold underline">Xem danh sách thú cưng</Link>
      </div>
    );
  }

  const needsDonation = pet.donationAmount > 0;

  // ── Payment Gate ───────────────────────────────────────────────────────────
  if (needsDonation && !donated) {
    return (
      <div className="min-h-screen bg-surface py-12 px-margin-mobile flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="max-w-lg w-full"
        >
          {/* Pet card */}
          <div className="bg-white rounded-[32px] border border-outline-variant shadow-sm overflow-hidden mb-6">
            <div className="relative h-52">
              <img src={imgSrc(pet.image)} alt={pet.name}
                className="w-full h-full object-cover"
                onError={e => { (e.target as HTMLImageElement).src = 'https://placehold.co/600x300/f5f0eb/553722?text=🐾'; }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-4 left-5 text-white">
                <h2 className="text-2xl font-black">{pet.name}</h2>
                <p className="text-sm opacity-80">{pet.breed} • {pet.age}</p>
              </div>
            </div>
            <div className="p-6">
              <p className="text-sm text-on-surface-variant leading-relaxed">{pet.description}</p>
            </div>
          </div>

          {/* Payment required */}
          <div className="bg-white rounded-[32px] border-2 border-amber-200 shadow-lg p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                <Gift className="w-7 h-7 text-amber-600" />
              </div>
              <div>
                <h2 className="text-xl font-black text-on-surface">Đóng góp bắt buộc</h2>
                <p className="text-sm text-on-surface-variant">Hoàn thành thanh toán để tiếp tục đăng ký</p>
              </div>
            </div>

            <div className="bg-amber-50 rounded-2xl p-5 mb-6 border border-amber-100">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-bold text-amber-800">Khoản đóng góp cho bé {pet.name}</span>
                <span className="text-xl font-black text-amber-700">{pet.donationAmount.toLocaleString('vi-VN')}đ</span>
              </div>
              <p className="text-xs text-amber-700 leading-relaxed">
                Khoản này giúp trang trải chi phí y tế, thức ăn và chăm sóc cho các bé đang chờ nhận nuôi tại PAW Home.
              </p>
            </div>

            {donateError && (
              <div className="p-3 bg-red-50 text-red-700 rounded-2xl text-sm font-semibold mb-4">{donateError}</div>
            )}

            <button
              onClick={handleDonate} disabled={donating}
              className="w-full py-4 bg-amber-500 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-amber-600 disabled:opacity-50 shadow-lg shadow-amber-200 transition-all hover:scale-[1.02]"
            >
              {donating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Gift className="w-5 h-5" />}
              {donating ? 'Đang xử lý...' : `Thanh toán ${pet.donationAmount.toLocaleString('vi-VN')}đ qua PayOS`}
            </button>

            <Link to={`/pet/${pet.id || pet._id}`}
              className="mt-3 w-full py-3 border border-outline-variant rounded-2xl font-bold text-on-surface-variant text-sm flex items-center justify-center hover:bg-surface-container transition-all">
              Quay lại trang thú cưng
            </Link>
          </div>

          <p className="text-center text-xs text-on-surface-variant mt-4">
            🔒 Thanh toán bảo mật qua PayOS — PAW Home không lưu thông tin thẻ
          </p>
        </motion.div>
      </div>
    );
  }

  // ── Main Form ──────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-surface py-12 px-margin-mobile md:px-margin-desktop">
      <div className="max-w-3xl mx-auto">
        <header className="text-center mb-12">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg rotate-3">
            <PawPrint className="text-on-primary w-10 h-10" />
          </div>
          <h1 className="text-3xl font-bold text-on-surface mb-2">Đơn đăng ký nhận nuôi</h1>
          {pet && (
            <div className="flex items-center justify-center gap-2 mt-1">
              {needsDonation && donated && (
                <span className="flex items-center gap-1 text-xs font-bold text-green-700 bg-green-100 px-3 py-1 rounded-full">
                  <CheckCircle className="w-3.5 h-3.5" /> Đã hoàn thành đóng góp
                </span>
              )}
              <p className="text-primary font-bold">Bé: <span className="underline font-black">{pet.name} ({pet.breed})</span></p>
            </div>
          )}
        </header>

        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-12 relative">
          <div className="absolute top-1/2 left-0 w-full h-1 bg-surface-container-high -translate-y-1/2 z-0" />
          <div className="absolute top-1/2 left-0 h-1 bg-primary -translate-y-1/2 z-1 transition-all duration-500"
            style={{ width: `${((step - 1) / (totalSteps - 1)) * 100}%` }} />
          {steps.map(s => (
            <div key={s.id} className="relative z-10">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                step >= s.id ? 'bg-primary border-primary text-on-primary' : 'bg-surface border-outline-variant text-on-surface-variant'
              }`}>
                {step > s.id ? <CheckCircle className="w-6 h-6" /> : <s.icon className="w-5 h-5" />}
              </div>
              <span className={`absolute top-14 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-bold uppercase tracking-widest ${
                step >= s.id ? 'text-primary' : 'text-on-surface-variant'
              }`}>{s.title}</span>
            </div>
          ))}
        </div>

        {error && (
          <div className="mb-6 p-4 bg-error-container text-on-error-container rounded-2xl text-sm font-bold">⚠️ {error}</div>
        )}

        <div className="bg-white rounded-[40px] border border-outline-variant p-8 md:p-12 shadow-sm min-h-[500px] flex flex-col">
          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex-1">

              {/* ── Step 1 ── */}
              {step === 1 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-on-surface">Họ và tên *</label>
                      <input type="text" className="w-full bg-surface-container-low border border-outline-variant rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary text-sm font-bold"
                        placeholder="Nguyễn Văn A"
                        value={formData.fullName} onChange={e => setFormData({ ...formData, fullName: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-on-surface">Số điện thoại *</label>
                      <input type="tel" className="w-full bg-surface-container-low border border-outline-variant rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary text-sm font-bold"
                        placeholder="0987xxx"
                        value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-on-surface">Link Facebook cá nhân</label>
                      <input type="text" className="w-full bg-surface-container-low border border-outline-variant rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary text-sm font-bold"
                        placeholder="facebook.com/username"
                        value={formData.facebookLink} onChange={e => setFormData({ ...formData, facebookLink: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-on-surface">Công việc</label>
                      <select className="w-full bg-surface-container-low border border-outline-variant rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary text-sm font-bold"
                        value={formData.job} onChange={e => setFormData({ ...formData, job: e.target.value })}>
                        <option>Sinh viên</option>
                        <option>Đi làm</option>
                        <option>Khác</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-on-surface">Thu nhập hàng tháng</label>
                    <select className="w-full bg-surface-container-low border border-outline-variant rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary text-sm font-bold"
                      value={formData.monthlyIncome} onChange={e => setFormData({ ...formData, monthlyIncome: e.target.value })}>
                      <option>Dưới 5 triệu</option>
                      <option>5 - 10 triệu</option>
                      <option>10 - 20 triệu</option>
                      <option>Trên 20 triệu</option>
                    </select>
                  </div>
                </div>
              )}

              {/* ── Step 2 ── */}
              {step === 2 && (
                <div className="space-y-8">
                  <div className="p-6 bg-primary-fixed rounded-3xl border border-primary-container/20 flex gap-4">
                    <ShieldCheck className="w-10 h-10 text-primary flex-shrink-0" />
                    <div>
                      <h4 className="font-bold text-primary mb-1">Quy định bảo mật</h4>
                      <p className="text-on-primary-fixed/80 text-sm">Thông tin định danh chỉ dùng để ký hợp đồng và được mã hóa an toàn.</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {(['front', 'back'] as const).map(side => (
                      <div key={side} className="space-y-4">
                        <p className="text-sm font-bold text-on-surface">
                          {side === 'front' ? 'Mặt trước' : 'Mặt sau'} CMND/CCCD *
                        </p>
                        <div onClick={() => handleUploadCard(side)}
                          className="aspect-[1.6/1] bg-surface-container-low border-2 border-dashed border-outline-variant rounded-3xl flex flex-col items-center justify-center gap-4 hover:bg-surface-container-high transition-colors cursor-pointer overflow-hidden">
                          {(side === 'front' ? formData.idCardFront : formData.idCardBack) ? (
                            <img src={side === 'front' ? formData.idCardFront : formData.idCardBack}
                              className="w-full h-full object-cover" alt="" />
                          ) : (
                            <>
                              <Camera className="w-10 h-10 text-on-surface-variant" />
                              <span className="text-sm text-on-surface-variant font-medium">
                                Chọn ảnh mặt {side === 'front' ? 'trước' : 'sau'}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Step 3 ── */}
              {step === 3 && (
                <div className="space-y-8">
                  <div className="space-y-4">
                    <label className="text-sm font-bold text-on-surface">Địa chỉ sinh sống *</label>
                    <textarea className="w-full bg-surface-container-low border border-outline-variant rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary h-20 text-sm font-bold resize-none"
                      placeholder="Số nhà, tên đường, phường/xã, quận/huyện..."
                      value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <label className="text-sm font-bold text-on-surface">Kinh nghiệm nuôi thú cưng</label>
                      <select className="w-full bg-surface-container-low border border-outline-variant rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary text-sm font-bold"
                        value={formData.experience} onChange={e => setFormData({ ...formData, experience: e.target.value })}>
                        <option>Chưa từng nuôi</option>
                        <option>Đã từng nuôi (đã mất/tặng)</option>
                        <option>Đang nuôi ít nhất 1 bạn</option>
                      </select>
                    </div>
                    <div className="space-y-4">
                      <label className="text-sm font-bold text-on-surface">Loại hình nhà ở</label>
                      <select className="w-full bg-surface-container-low border border-outline-variant rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary text-sm font-bold"
                        value={formData.housingType} onChange={e => setFormData({ ...formData, housingType: e.target.value })}>
                        <option>Căn hộ</option>
                        <option>Nhà phố</option>
                        <option>Sân vườn</option>
                        <option>Phòng trọ</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <label className="text-sm font-bold text-on-surface">Hình thức nhận thú cưng</label>
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { val: 'pickup',   icon: Building, label: 'Nhận tại trạm cứu hộ' },
                        { val: 'shipping', icon: Truck,    label: 'Vận chuyển tận nơi' },
                      ].map(({ val, icon: Icon, label }) => (
                        <button key={val} type="button" onClick={() => setFormData({ ...formData, deliveryOption: val })}
                          className={`flex items-center justify-center gap-3 p-4 rounded-2xl border-2 transition-all font-bold text-sm ${
                            formData.deliveryOption === val
                              ? 'border-primary bg-primary/5 text-primary'
                              : 'border-outline-variant hover:bg-surface-container text-on-surface-variant'
                          }`}>
                          <Icon className="w-5 h-5" /> {label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <label className="text-sm font-bold text-on-surface">Lý do muốn nhận nuôi</label>
                    <textarea className="w-full bg-surface-container-low border border-outline-variant rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary h-24 text-sm font-bold resize-none"
                      placeholder="Chia sẻ thêm về mong muốn của bạn..."
                      value={formData.reason} onChange={e => setFormData({ ...formData, reason: e.target.value })} />
                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>

          <footer className="pt-12 flex justify-between gap-4 border-t border-outline-variant mt-12">
            <button onClick={prevStep}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all ${
                step === 1 ? 'opacity-0 pointer-events-none' : 'bg-surface-container-high text-primary hover:bg-surface-container-highest'
              }`}>
              <ChevronLeft className="w-5 h-5" /> Quay lại
            </button>
            {step < totalSteps ? (
              <button onClick={nextStep}
                className="flex items-center gap-2 px-8 py-3 bg-primary text-on-primary rounded-2xl font-bold hover:bg-primary-container transition-all">
                Tiếp tục <ChevronRight className="w-5 h-5" />
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={submitting}
                className="flex items-center gap-2 px-12 py-3 bg-status-ready text-white rounded-2xl font-bold hover:opacity-90 transition-all shadow-lg disabled:opacity-50">
                {submitting ? 'Đang gửi...' : 'Gửi đơn đăng ký'} <CheckCircle className="w-5 h-5" />
              </button>
            )}
          </footer>
        </div>
      </div>
    </div>
  );
};
