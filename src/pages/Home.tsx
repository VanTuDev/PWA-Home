import React from 'react';
import { motion } from 'motion/react';
import { 
  ArrowRight, 
  ShieldCheck, 
  Heart, 
  MapPin, 
  Star, 
  Award,
  Zap,
  CheckCircle2,
  Users2,
  HandHeart
} from 'lucide-react';
import { PETS } from '../constants';
import { Link } from 'react-router-dom';

export const Home: React.FC = () => {
  // Duplicate pets for infinite marquee
  const marqueePets = [...PETS, ...PETS, ...PETS];

  return (
    <div className="min-h-screen bg-surface overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center pt-20 pb-32 overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1450778869180-41d0601e046e?auto=format&fit=crop&q=80&w=2000" 
            className="w-full h-full object-cover"
            alt="Hero background"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-surface via-surface/90 to-transparent"></div>
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px] floating"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-tertiary/5 rounded-full blur-[100px] floating" style={{ animationDelay: '-2s' }}></div>
        </div>

        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop relative z-10 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-20 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
            >
              <div className="inline-flex items-center gap-2 bg-white/50 backdrop-blur-md border border-white px-4 py-2 rounded-full text-xs font-bold text-primary mb-8 shadow-sm">
                <Star className="w-4 h-4 fill-primary" />
                <span className="uppercase tracking-widest">Hệ thống cứu hộ thông minh</span>
              </div>
              
              <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-primary mb-6 md:mb-8 leading-[1.05] tracking-tighter">
                Nơi tình yêu <br /> 
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary-container to-secondary">tìm thấy tổ ấm</span>
              </h1>
              
              <p className="text-xl text-on-surface-variant mb-12 leading-relaxed max-w-lg font-medium opacity-80">
               Chúng tôi tự hào đồng hành cùng đơn vị{' '}
               <strong className="text-primary font-black">Paws for Compassion Đà Nẵng</strong>{' '}
               trong sứ mệnh kết nối những trái tim nhân hậu với những người bạn nhỏ đang tìm kiếm mái ấm. Sự hợp tác này giúp lan tỏa nhận thức về nhận nuôi thú cưng, tạo thêm nhiều cơ hội để các bé được giải cứu tìm thấy gia đình yêu thương và bắt đầu một cuộc sống mới tốt đẹp hơn. Trải nghiệm hành trình nhận nuôi đầy ý nghĩa và trở thành một phần của cộng đồng lan tỏa yêu thương đến động vật.
              </p>
              
              <div className="flex flex-wrap gap-3 md:gap-6">
                <Link to="/survey" className="bg-primary text-on-primary px-6 md:px-10 py-4 md:py-5 rounded-[24px] font-bold flex items-center gap-3 hover:bg-primary-container transition-all hover:scale-105 shadow-xl shadow-primary/20 group text-sm md:text-base">
                  Khám phá độ tương thích
                  <Zap className="w-4 h-4 md:w-5 md:h-5 group-hover:rotate-12 transition-transform" />
                </Link>
                <button className="bg-white text-primary border border-outline-variant px-6 md:px-10 py-4 md:py-5 rounded-[24px] font-bold hover:bg-surface-container-low transition-all hover:border-primary/30 text-sm md:text-base">
                  Tìm hiểu thêm
                </button>
              </div>

              <div className="mt-16 flex items-center gap-8">
                <div className="flex -space-x-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="w-12 h-12 rounded-full border-4 border-white overflow-hidden shadow-md">
                      <img src={`https://i.pravatar.cc/100?u=${i+10}`} alt="User" />
                    </div>
                  ))}
                </div>
                <div>
                  <p className="text-sm font-black text-primary">+2,000</p>
                  <p className="text-xs text-on-surface-variant font-bold uppercase tracking-wider">Bé đã tìm thấy chủ</p>
                </div>
              </div>
            </motion.div>

            {/* Right side left empty to showcase the beautiful background banner image */}
            <div className="hidden lg:block"></div>
          </div>
        </div>
      </section>

      {/* Marquee Featured Pets */}
      <section className="py-32 bg-white overflow-hidden">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop mb-20">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-[0.3em] text-xs mb-4">
                <div className="w-8 h-[2px] bg-primary"></div>
                Thú cưng chờ bạn
              </div>
              <h2 className="text-4xl md:text-6xl font-black text-on-surface tracking-tighter">
                Gặp gỡ những thiên thần nhỏ
              </h2>
            </motion.div>
            <Link to="/shop" className="group flex items-center gap-3 font-bold text-primary hover:text-primary-container transition-colors">
              Xem toàn bộ danh sách
              <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Marquee Content */}
        <div className="relative">
          <div className="animate-marquee py-10 flex gap-8">
            {marqueePets.map((pet, index) => (
              <div
                key={`${pet.id}-${index}`}
                className="w-[300px] flex-shrink-0 group cursor-pointer"
              >
                <div className="rounded-[32px] overflow-hidden border border-outline-variant/60 shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 bg-white">
                  {/* Image with overlay */}
                  <div className="relative h-56 overflow-hidden">
                    <img
                      src={pet.image}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      alt={pet.name}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />

                    {/* Status */}
                    <div className="absolute top-3 left-3">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-white shadow-lg ${
                        pet.status === 'Ready' ? 'bg-emerald-500' : 'bg-amber-500'
                      }`}>
                        {pet.status === 'Ready' ? 'Sẵn sàng' : 'Điều trị'}
                      </span>
                    </div>
                    <button className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/25 backdrop-blur-md text-white hover:bg-red-500 transition-all flex items-center justify-center">
                      <Heart className="w-4 h-4" />
                    </button>

                    {/* Name overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="text-white font-black text-xl leading-tight truncate group-hover:text-yellow-200 transition-colors">{pet.name}</h3>
                      <p className="text-white/70 text-xs font-semibold">{pet.breed} · {pet.age}</p>
                    </div>
                  </div>

                  {/* Bottom info */}
                  <div className="p-4">
                    <div className="flex items-center gap-1 mb-3 text-on-surface-variant">
                      <MapPin className="w-3 h-3" />
                      <span className="text-[10px] font-medium truncate">{pet.rescuePartner}</span>
                    </div>
                    {pet.status === 'Ready' ? (
                      <Link
                        to={`/apply/${pet.id}`}
                        className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-emerald-200 transition-all"
                      >
                        Nhận nuôi ngay <ArrowRight className="w-4 h-4" />
                      </Link>
                    ) : (
                      <button className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white py-3 rounded-2xl font-bold text-sm hover:shadow-lg hover:shadow-amber-200 transition-all">
                        Ủng hộ điều trị
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Gradient Edges for Marquee */}
          <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"></div>
          <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"></div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-32 bg-surface-container-low px-margin-mobile md:px-margin-desktop relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full opacity-5 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, var(--color-primary) 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
        </div>

        <div className="max-w-container-max mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <div className="relative order-2 lg:order-1">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-6 pt-12">
                   <div className="bg-white p-8 rounded-[40px] shadow-xl shadow-primary/5 border border-outline-variant hover:border-primary/20 transition-all">
                      <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                        <ShieldCheck className="w-8 h-8 text-primary" />
                      </div>
                      <h4 className="text-xl font-black mb-2 text-on-surface">Minh bạch</h4>
                      <p className="text-sm text-on-surface-variant leading-relaxed font-medium">Mọi thông tin y tế và cứu hộ đều được công khai.</p>
                   </div>
                   <div className="bg-white p-8 rounded-[40px] shadow-xl shadow-primary/5 border border-outline-variant hover:border-primary/20 transition-all">
                      <div className="w-14 h-14 bg-secondary/10 rounded-2xl flex items-center justify-center mb-6">
                        <Users2 className="w-8 h-8 text-secondary" />
                      </div>
                      <h4 className="text-xl font-black mb-2 text-on-surface">Cộng đồng</h4>
                      <p className="text-sm text-on-surface-variant leading-relaxed font-medium">Kết nối với hàng ngàn người yêu thú cưng.</p>
                   </div>
                </div>
                <div className="space-y-6">
                   <div className="bg-white p-8 rounded-[40px] shadow-xl shadow-primary/5 border border-outline-variant hover:border-primary/20 transition-all">
                      <div className="w-14 h-14 bg-tertiary/10 rounded-2xl flex items-center justify-center mb-6">
                        <Award className="w-8 h-8 text-tertiary" />
                      </div>
                      <h4 className="text-xl font-black mb-2 text-on-surface">Tin cậy</h4>
                      <p className="text-sm text-on-surface-variant leading-relaxed font-medium">Đối tác tin cậy của các trung tâm cứu hộ lớn.</p>
                   </div>
                   <div className="bg-primary text-on-primary p-8 rounded-[40px] shadow-2xl shadow-primary/30">
                      <h4 className="text-3xl font-black mb-4 tracking-tighter leading-none">Tham gia cùng chúng tôi</h4>
                      <p className="text-sm text-on-primary/70 mb-6 font-medium">Bắt đầu hành trình ý nghĩa ngay hôm nay.</p>
                      <Link to="/register" className="inline-flex items-center gap-2 font-bold hover:gap-4 transition-all">
                        Đăng ký ngay <ArrowRight className="w-5 h-5" />
                      </Link>
                   </div>
                </div>
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-[0.3em] text-xs mb-4">
                <div className="w-8 h-[2px] bg-primary"></div>
                Tại sao chọn PAW Home
              </div>
              <h2 className="text-4xl md:text-6xl font-black text-on-surface tracking-tighter mb-8 leading-[1.1]">
                Nền tảng cứu hộ <br /> tiêu chuẩn 5 sao
              </h2>
              <div className="space-y-8">
                {[
                  "Hệ thống so khớp thông minh dựa trên lối sống.",
                  "Hỗ trợ tư vấn chăm sóc trọn đời sau nhận nuôi.",
                  "Mạng lưới trạm cứu hộ phủ khắp các tỉnh thành."
                ].map((text, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-start gap-4"
                  >
                    <div className="mt-1">
                      <CheckCircle2 className="w-6 h-6 text-status-ready" />
                    </div>
                    <p className="text-lg font-bold text-on-surface-variant">{text}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
