import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, 
  MapPin, 
  Building, 
  Home, 
  ShieldCheck, 
  IdCard, 
  Camera, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle,
  FileText,
  Smartphone,
  PawPrint
} from 'lucide-react';

export const ApplyForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const totalSteps = 3;

  const steps = [
    { id: 1, title: 'Thông tin cá nhân', icon: User },
    { id: 2, title: 'Xác minh danh tính', icon: IdCard },
    { id: 3, title: 'Môi trường sống', icon: Home },
  ];

  const nextStep = () => step < totalSteps && setStep(step + 1);
  const prevStep = () => step > 1 && setStep(step - 1);

  return (
    <div className="min-h-screen bg-surface py-12 px-margin-mobile md:px-margin-desktop">
      <div className="max-w-3xl mx-auto">
        <header className="text-center mb-12">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg rotate-3">
            <PawPrint className="text-on-primary w-10 h-10" />
          </div>
          <h1 className="text-3xl font-bold text-on-surface mb-2">Đơn đăng ký nhận nuôi</h1>
          <p className="text-on-surface-variant">Hãy cung cấp thông tin trung thực để chúng tôi có thể đánh giá tốt nhất.</p>
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

        <div className="bg-white rounded-[40px] border border-outline-variant p-8 md:p-12 shadow-sm min-h-[500px] flex flex-col">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1"
            >
              {step === 1 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-on-surface">Họ và tên</label>
                      <input type="text" className="w-full bg-surface-container-low border border-outline-variant rounded-2xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none" placeholder="VD: Nguyễn Văn A" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-on-surface">Số điện thoại</label>
                      <input type="tel" className="w-full bg-surface-container-low border border-outline-variant rounded-2xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none" placeholder="VD: 0987xxx" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-on-surface">Link Facebook cá nhân</label>
                      <input type="url" className="w-full bg-surface-container-low border border-outline-variant rounded-2xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none" placeholder="facebook.com/username" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-on-surface">Công việc</label>
                      <select className="w-full bg-surface-container-low border border-outline-variant rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary appearance-none">
                        <option>Sinh viên</option>
                        <option>Đi làm</option>
                        <option>Khác (Others)</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-on-surface">Thu nhập hàng tháng</label>
                    <select className="w-full bg-surface-container-low border border-outline-variant rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary appearance-none">
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
                      <p className="text-sm font-bold text-on-surface">Mặt trước CMND/CCCD</p>
                      <div className="aspect-[1.6/1] bg-surface-container-low border-2 border-dashed border-outline-variant rounded-3xl flex flex-col items-center justify-center gap-4 hover:bg-surface-container-high transition-colors cursor-pointer">
                        <Camera className="w-10 h-10 text-on-surface-variant" />
                        <span className="text-sm text-on-surface-variant font-medium">Chọn ảnh hoặc chụp ngay</span>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <p className="text-sm font-bold text-on-surface">Mặt sau CMND/CCCD</p>
                      <div className="aspect-[1.6/1] bg-surface-container-low border-2 border-dashed border-outline-variant rounded-3xl flex flex-col items-center justify-center gap-4 hover:bg-surface-container-high transition-colors cursor-pointer">
                        <Camera className="w-10 h-10 text-on-surface-variant" />
                        <span className="text-sm text-on-surface-variant font-medium">Chọn ảnh hoặc chụp ngay</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-8">
                  <div className="space-y-4">
                    <label className="text-sm font-bold text-on-surface">Địa chỉ sinh sống</label>
                    <textarea className="w-full bg-surface-container-low border border-outline-variant rounded-2xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none h-20" placeholder="Ghi rõ số nhà, tên đường, phường/xã..."></textarea>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <label className="text-sm font-bold text-on-surface">Kinh nghiệm nuôi thú cưng</label>
                      <select className="w-full bg-surface-container-low border border-outline-variant rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary appearance-none">
                        <option>Chưa từng nuôi</option>
                        <option>Đã từng nuôi (đã mất/tặng)</option>
                        <option>Đang nuôi ít nhất 1 bạn</option>
                      </select>
                    </div>
                    <div className="space-y-4">
                      <label className="text-sm font-bold text-on-surface">Loại hình nhà ở</label>
                      <select className="w-full bg-surface-container-low border border-outline-variant rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary appearance-none">
                        <option>Căn hộ</option>
                        <option>Nhà phố</option>
                        <option>Sân vườn</option>
                        <option>Phòng trọ</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-sm font-bold text-on-surface">Lý do muốn nhận nuôi</label>
                    <textarea className="w-full bg-surface-container-low border border-outline-variant rounded-2xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none h-24" placeholder="Chia sẻ thêm về mong muốn của bạn..."></textarea>
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
                onClick={() => navigate('/')}
                className="flex items-center gap-2 px-12 py-3 bg-status-ready text-white rounded-2xl font-bold hover:opacity-90 transition-all shadow-lg"
              >
                Gửi đơn đăng ký
                <CheckCircle className="w-5 h-5" />
              </button>
            )}
          </footer>
        </div>
      </div>
    </div>
  );
};

const PlusIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
  </svg>
);
