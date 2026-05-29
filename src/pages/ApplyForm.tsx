import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, 
  MapPin, 
  Home as HomeIcon, 
  ShieldCheck, 
  IdCard, 
  Camera, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle,
  FileText,
  Smartphone,
  PawPrint,
  Truck,
  Building,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const ApplyForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [step, setStep] = useState(1);
  const totalSteps = 3;

  const [pet, setPet] = useState<any>(null);
  const [loadingPet, setLoadingPet] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

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
    deliveryOption: 'pickup' // pickup | shipping
  });

  // Load target pet details on init
  useEffect(() => {
    const loadPetDetails = async () => {
      try {
        const res = await fetch(`/api/pets/${id}`);
        if (res.ok) {
          const data = await res.json();
          setPet(data);
        }
      } catch (err) {
        console.error('Failed to load pet details', err);
      } finally {
        setLoadingPet(false);
      }
    };
    if (id) loadPetDetails();
  }, [id]);

  const steps = [
    { id: 1, title: 'Thông tin cá nhân', icon: User },
    { id: 2, title: 'Xác minh danh tính', icon: IdCard },
    { id: 3, title: 'Môi trường sống', icon: HomeIcon },
  ];

  const handleUploadCard = (side: 'front' | 'back') => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e: any) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFormData(prev => ({
            ...prev,
            [side === 'front' ? 'idCardFront' : 'idCardBack']: reader.result as string
          }));
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const nextStep = () => {
    if (step === 1) {
      if (!formData.fullName || !formData.phone) {
        alert('Vui lòng điền Họ tên và Số điện thoại liên hệ.');
        return;
      }
    }
    if (step === 2) {
      if (!formData.idCardFront || !formData.idCardBack) {
        alert('Vui lòng tải lên cả hai mặt trước và sau của CMND/CCCD để xác minh danh tính.');
        return;
      }
    }
    step < totalSteps && setStep(step + 1);
  };

  const prevStep = () => step > 1 && setStep(step - 1);

  const handleSubmit = async () => {
    if (!formData.address) {
      alert('Vui lòng cung cấp địa chỉ sinh sống.');
      return;
    }
    setSubmitting(true);
    setError('');

    try {
      const activeToken = token || localStorage.getItem('paw_token') || '';
      const res = await fetch('/api/adoptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${activeToken}`
        },
        body: JSON.stringify({
          petId: id,
          ...formData
        })
      });

      const data = await res.json();
      if (res.ok) {
        alert('Đơn đăng ký nhận nuôi của bạn đã được gửi thành công! Hãy chờ admin phê duyệt.');
        navigate('/');
      } else {
        setError(data.message || 'Lỗi gửi đơn nhận nuôi.');
      }
    } catch {
      setError('Không thể kết nối máy chủ. Vui lòng thử lại sau.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-surface py-20 px-margin-mobile md:px-margin-desktop flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-[40px] border border-outline-variant p-10 text-center shadow-xl shadow-primary/5">
          <div className="w-20 h-20 bg-primary/10 rounded-[28px] flex items-center justify-center mx-auto mb-6">
            <UserCheck className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-2xl font-black text-on-surface mb-3">Yêu cầu đăng nhập</h2>
          <p className="text-on-surface-variant font-medium text-sm leading-relaxed mb-8">
            Bạn cần đăng nhập tài khoản thành viên để đăng ký nhận nuôi các bé tại PAW Home.
          </p>
          <div className="space-y-3">
            <Link to="/login" className="block w-full bg-primary text-on-primary py-4 rounded-[20px] font-bold text-sm hover:scale-[1.02] shadow-lg shadow-primary/20 transition-all">
              Đăng nhập ngay
            </Link>
            <Link to="/" className="block w-full bg-surface-container-high text-on-surface-variant py-4 rounded-[20px] font-bold text-sm hover:bg-surface-container-highest transition-all">
              Quay lại Trang chủ
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface py-12 px-margin-mobile md:px-margin-desktop">
      <div className="max-w-3xl mx-auto">
        <header className="text-center mb-12">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg rotate-3">
            <PawPrint className="text-on-primary w-10 h-10" />
          </div>
          <h1 className="text-3xl font-bold text-on-surface mb-2">Đơn đăng ký nhận nuôi</h1>
          {pet ? (
            <p className="text-primary font-bold">Ứng tuyển nhận nuôi bé: <span className="underline font-black">{pet.name} ({pet.breed})</span></p>
          ) : (
            <p className="text-on-surface-variant">Hãy cung cấp thông tin trung thực để chúng tôi có thể đánh giá tốt nhất.</p>
          )}
        </header>

        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-12 relative">
          <div className="absolute top-1/2 left-0 w-full h-1 bg-surface-container-high -translate-y-1/2 z-0"></div>
          <div 
            className="absolute top-1/2 left-0 h-1 bg-primary -translate-y-1/2 z-1 transition-all duration-500 ease-in-out"
            style={{ width: `${((step - 1) / (totalSteps - 1)) * 100}%` }}
          ></div>
          
          {steps.map((s) => (
            <div key={s.id} className="relative z-10">
              <div 
                className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                  step >= s.id ? 'bg-primary border-primary text-on-primary' : 'bg-surface border-outline-variant text-on-surface-variant'
                }`}
              >
                {step > s.id ? (
                  <CheckCircle className="w-6 h-6" />
                ) : (
                  <s.icon className="w-5 h-5" />
                )}
              </div>
              <span className={`absolute top-14 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-bold uppercase tracking-widest ${
                step >= s.id ? 'text-primary' : 'text-on-surface-variant'
              }`}>
                {s.title}
              </span>
            </div>
          ))}
        </div>

        {error && (
          <div className="mb-6 p-4 bg-error-container text-on-error-container rounded-2xl text-sm font-bold">
            ⚠️ {error}
          </div>
        )}

        <div className="bg-white rounded-[40px] border border-outline-variant p-8 md:p-12 shadow-sm min-h-[500px] flex flex-col">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 animate-fade-in"
            >
              {step === 1 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-on-surface">Họ và tên *</label>
                      <input 
                        type="text" 
                        required
                        className="w-full bg-surface-container-low border border-outline-variant rounded-2xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none text-sm font-bold" 
                        placeholder="VD: Nguyễn Văn A"
                        value={formData.fullName}
                        onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-on-surface">Số điện thoại *</label>
                      <input 
                        type="tel" 
                        required
                        className="w-full bg-surface-container-low border border-outline-variant rounded-2xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none text-sm font-bold" 
                        placeholder="VD: 0987xxx" 
                        value={formData.phone}
                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-on-surface">Link Facebook cá nhân</label>
                      <input 
                        type="url" 
                        className="w-full bg-surface-container-low border border-outline-variant rounded-2xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none text-sm font-bold" 
                        placeholder="facebook.com/username" 
                        value={formData.facebookLink}
                        onChange={e => setFormData({ ...formData, facebookLink: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-on-surface">Công việc</label>
                      <select 
                        className="w-full bg-surface-container-low border border-outline-variant rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary text-sm font-bold cursor-pointer"
                        value={formData.job}
                        onChange={e => setFormData({ ...formData, job: e.target.value })}
                      >
                        <option>Sinh viên</option>
                        <option>Đi làm</option>
                        <option>Khác (Others)</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-on-surface">Thu nhập hàng tháng</label>
                    <select 
                      className="w-full bg-surface-container-low border border-outline-variant rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary text-sm font-bold cursor-pointer"
                      value={formData.monthlyIncome}
                      onChange={e => setFormData({ ...formData, monthlyIncome: e.target.value })}
                    >
                      <option>Dưới 5 triệu</option>
                      <option>5 - 10 triệu</option>
                      <option>10 - 20 triệu</option>
                      <option>Trên 20 triệu</option>
                    </select>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-8">
                  <div className="p-6 bg-primary-fixed rounded-3xl border border-primary-container/20 flex gap-4">
                    <ShieldCheck className="w-10 h-10 text-primary flex-shrink-0" />
                    <div>
                      <h4 className="font-bold text-primary mb-1">Quy định bảo mật</h4>
                      <p className="text-on-primary-fixed/80 text-sm">Thông tin định danh của bạn chỉ được dùng cho mục đích ký kết hợp đồng nhận nuôi và sẽ được mã hóa an toàn.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <p className="text-sm font-bold text-on-surface">Mặt trước CMND/CCCD *</p>
                      <div 
                        onClick={() => handleUploadCard('front')}
                        className="aspect-[1.6/1] bg-surface-container-low border-2 border-dashed border-outline-variant rounded-3xl flex flex-col items-center justify-center gap-4 hover:bg-surface-container-high transition-colors cursor-pointer overflow-hidden relative"
                      >
                        {formData.idCardFront ? (
                          <img src={formData.idCardFront} className="w-full h-full object-cover" alt="Mặt trước" />
                        ) : (
                          <>
                            <Camera className="w-10 h-10 text-on-surface-variant" />
                            <span className="text-sm text-on-surface-variant font-medium">Chọn ảnh mặt trước</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="space-y-4">
                      <p className="text-sm font-bold text-on-surface">Mặt sau CMND/CCCD *</p>
                      <div 
                        onClick={() => handleUploadCard('back')}
                        className="aspect-[1.6/1] bg-surface-container-low border-2 border-dashed border-outline-variant rounded-3xl flex flex-col items-center justify-center gap-4 hover:bg-surface-container-high transition-colors cursor-pointer overflow-hidden relative"
                      >
                        {formData.idCardBack ? (
                          <img src={formData.idCardBack} className="w-full h-full object-cover" alt="Mặt sau" />
                        ) : (
                          <>
                            <Camera className="w-10 h-10 text-on-surface-variant" />
                            <span className="text-sm text-on-surface-variant font-medium">Chọn ảnh mặt sau</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-8">
                  <div className="space-y-4">
                    <label className="text-sm font-bold text-on-surface">Địa chỉ sinh sống *</label>
                    <textarea 
                      className="w-full bg-surface-container-low border border-outline-variant rounded-2xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none h-20 text-sm font-bold" 
                      placeholder="Ghi rõ số nhà, tên đường, phường/xã, quận/huyện..."
                      value={formData.address}
                      onChange={e => setFormData({ ...formData, address: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <label className="text-sm font-bold text-on-surface">Kinh nghiệm nuôi thú cưng</label>
                      <select 
                        className="w-full bg-surface-container-low border border-outline-variant rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary text-sm font-bold cursor-pointer"
                        value={formData.experience}
                        onChange={e => setFormData({ ...formData, experience: e.target.value })}
                      >
                        <option>Chưa từng nuôi</option>
                        <option>Đã từng nuôi (đã mất/tặng)</option>
                        <option>Đang nuôi ít nhất 1 bạn</option>
                      </select>
                    </div>
                    <div className="space-y-4">
                      <label className="text-sm font-bold text-on-surface">Loại hình nhà ở</label>
                      <select 
                        className="w-full bg-surface-container-low border border-outline-variant rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary text-sm font-bold cursor-pointer"
                        value={formData.housingType}
                        onChange={e => setFormData({ ...formData, housingType: e.target.value })}
                      >
                        <option>Căn hộ</option>
                        <option>Nhà phố</option>
                        <option>Sân vườn</option>
                        <option>Phòng trọ</option>
                      </select>
                    </div>
                  </div>

                  {/* Delivery Option */}
                  <div className="space-y-4">
                    <label className="text-sm font-bold text-on-surface">Hình thức nhận thú cưng</label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, deliveryOption: 'pickup' })}
                        className={`flex items-center justify-center gap-3 p-4 rounded-2xl border-2 transition-all font-bold ${
                          formData.deliveryOption === 'pickup' 
                            ? 'border-primary bg-primary/5 text-primary' 
                            : 'border-outline-variant hover:bg-surface-container'
                        }`}
                      >
                        <Building className="w-5 h-5" />
                        Nhận tại trạm cứu hộ
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, deliveryOption: 'shipping' })}
                        className={`flex items-center justify-center gap-3 p-4 rounded-2xl border-2 transition-all font-bold ${
                          formData.deliveryOption === 'shipping' 
                            ? 'border-primary bg-primary/5 text-primary' 
                            : 'border-outline-variant hover:bg-surface-container'
                        }`}
                      >
                        <Truck className="w-5 h-5" />
                        Vận chuyển tận nơi (Ship)
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-sm font-bold text-on-surface">Lý do muốn nhận nuôi</label>
                    <textarea 
                      className="w-full bg-surface-container-low border border-outline-variant rounded-2xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none h-24 text-sm font-bold" 
                      placeholder="Chia sẻ thêm về mong muốn của bạn..."
                      value={formData.reason}
                      onChange={e => setFormData({ ...formData, reason: e.target.value })}
                    />
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <footer className="pt-12 flex justify-between gap-4 border-t border-outline-variant mt-12">
            <button 
              onClick={prevStep}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all ${
                step === 1 ? 'opacity-0 pointer-events-none' : 'bg-surface-container-high text-primary hover:bg-surface-container-highest'
              }`}
            >
              <ChevronLeft className="w-5 h-5" />
              Quay lại
            </button>
            
            {step < totalSteps ? (
              <button 
                onClick={nextStep}
                className="flex items-center gap-2 px-8 py-3 bg-primary text-on-primary rounded-2xl font-bold hover:bg-primary-container transition-all"
              >
                Tiếp tục
                <ChevronRight className="w-5 h-5" />
              </button>
            ) : (
              <button 
                onClick={handleSubmit}
                disabled={submitting}
                className="flex items-center gap-2 px-12 py-3 bg-status-ready text-white rounded-2xl font-bold hover:opacity-90 transition-all shadow-lg disabled:opacity-50"
              >
                {submitting ? 'Đang gửi...' : 'Gửi đơn đăng ký'}
                <CheckCircle className="w-5 h-5" />
              </button>
            )}
          </footer>
        </div>
      </div>
    </div>
  );
};
