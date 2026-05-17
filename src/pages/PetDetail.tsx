import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  Heart,
  MapPin,
  Sparkles,
  CheckCircle,
  Calendar,
  Mars as Male,
  Venus as Female,
  Stethoscope,
  ShieldCheck,
  Gift,
  Share2,
  ChevronLeft,
  ArrowRight,
  Info
} from 'lucide-react';
import { PETS } from '../constants';

export const PetDetail: React.FC = () => {
  const { id } = useParams();
  const pet = PETS.find(p => p.id === id) || PETS[0];

  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-8">
        {/* Breadcrumb */}
        <Link to="/" className="inline-flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors mb-8 group">
          <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Quay lại danh sách
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Gallery */}
            <div className="grid grid-cols-4 grid-rows-2 gap-4 h-[500px]">
              <div className="col-span-3 row-span-2 rounded-[32px] overflow-hidden">
                <img src={pet.image} className="w-full h-full object-cover" alt={pet.name} />
              </div>
              <div className="rounded-2xl overflow-hidden">
                <img src="https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&q=80&w=400" className="w-full h-full object-cover" alt="Detail 1" />
              </div>
              <div className="rounded-2xl overflow-hidden relative">
                <img src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=80&w=400" className="w-full h-full object-cover" alt="Detail 2" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white font-bold">+5</div>
              </div>
            </div>

            {/* AI Evaluation */}
            <div className="bg-primary-fixed p-8 rounded-[32px] border border-primary-container/20 flex flex-col md:flex-row gap-8 items-center">
              <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-12 h-12 text-on-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-primary font-bold text-xl">Đánh giá từ PAW Intelligence</span>
                  <div className="bg-primary text-on-primary text-xs px-2 py-1 rounded-full font-bold uppercase">Pro</div>
                </div>
                <p className="text-on-primary-fixed/80 leading-relaxed mb-4">
                  Dựa trên hồ sơ của bạn, {pet.name} phù hợp <span className="text-primary font-bold">{pet.aiMatching}%</span> với lối sống căn hộ và thích vận động vừa phải.
                </p>
                <div className="flex gap-4">
                  <div className="flex items-center gap-1 text-primary text-sm font-bold">
                    <CheckCircle className="w-4 h-4" />
                    Tương thích không gian
                  </div>
                  <div className="flex items-center gap-1 text-primary text-sm font-bold">
                    <CheckCircle className="w-4 h-4" />
                    Thân thiện trẻ em
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white p-8 rounded-[32px] border border-outline-variant shadow-sm">
              <h2 className="text-2xl font-bold text-on-surface mb-6">Câu chuyện của {pet.name}</h2>
              <p className="text-on-surface-variant leading-loose mb-8">
                {pet.story}
              </p>

              <h3 className="text-lg font-bold text-on-surface mb-4 flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-primary" />
                Tình trạng sức khỏe
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Tiêm phòng", value: pet.healthInfo?.vaccinated ? "Đã tiêm" : "Chưa tiêm", status: true },
                  { label: "Triệt sản", value: pet.healthInfo?.neutered ? "Đã triệt sản" : "Chưa triệt sản", status: true },
                  { label: "Gắn chip", value: pet.healthInfo?.microchipped ? "Đã gắn" : "Chưa gắn", status: true },
                  { label: "Tẩy giun", value: "Định kỳ", status: true }
                ].map((item, i) => (
                  <div key={i} className="bg-surface-container-low p-4 rounded-2xl flex flex-col items-center text-center">
                    <span className="text-xs text-on-surface-variant mb-1">{item.label}</span>
                    <span className="font-bold text-primary text-sm">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Map */}
            <div className="h-[300px] rounded-[32px] overflow-hidden bg-surface-container relative">
              <img src="" className="w-full h-full object-cover" alt="Map" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="w-12 h-12 bg-primary rounded-full border-4 border-white shadow-xl flex items-center justify-center">
                  <MapPin className="text-white w-6 h-6" />
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="sticky top-24">
              <div className="bg-white rounded-[32px] border border-outline-variant p-8 shadow-sm space-y-6">
                <div>
                  <h1 className="text-4xl font-bold text-on-surface mb-2">{pet.name}</h1>
                  <p className="text-primary font-medium">{pet.breed} • {pet.age}</p>
                </div>

                <div className="flex gap-4">
                  <div className="flex-1 bg-surface-container p-4 rounded-2xl text-center">
                    {pet.gender === 'Male' ? <Male className="w-6 h-6 mx-auto text-blue-500" /> : <Female className="w-6 h-6 mx-auto text-pink-500" />}
                    <span className="text-xs text-on-surface-variant mt-2 block">{pet.gender === 'Male' ? 'Đực' : 'Cái'}</span>
                  </div>
                  <div className="flex-1 bg-surface-container p-4 rounded-2xl text-center">
                    <Calendar className="w-6 h-6 mx-auto text-primary" />
                    <span className="text-xs text-on-surface-variant mt-2 block">{pet.age}</span>
                  </div>
                  <div className="flex-1 bg-surface-container p-4 rounded-2xl text-center">
                    <ShieldCheck className="w-6 h-6 mx-auto text-status-ready" />
                    <span className="text-xs text-on-surface-variant mt-2 block">Xác minh</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <Link to={`/apply/${pet.id}`} className="w-full bg-primary text-on-primary py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-primary-container transition-all">
                    Đăng ký nhận nuôi
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                  <button className="w-full bg-tertiary-fixed text-on-tertiary-fixed py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all">
                    <Gift className="w-5 h-5" />
                    Quyên góp hỗ trợ
                  </button>
                </div>

                <div className="pt-6 border-t border-outline-variant flex items-center justify-between">
                  <button className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors text-sm font-medium">
                    <Heart className="w-5 h-5" />
                    Yêu thích
                  </button>
                  <button className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors text-sm font-medium">
                    <Share2 className="w-5 h-5" />
                    Chia sẻ
                  </button>
                </div>
              </div>

              {/* Rescue Contact */}
              <div className="mt-6 bg-surface-container-high rounded-[32px] p-6 flex items-center gap-4 border border-outline-variant">
                <div className="w-14 h-14 rounded-full overflow-hidden bg-primary/10">
                  <img src="https://i.pravatar.cc/100?u=rescue" alt="Rescue" />
                </div>
                <div>
                  <h4 className="font-bold text-on-surface truncate max-w-[150px]">{pet.rescuePartner}</h4>
                  <p className="text-xs text-on-surface-variant">Thành viên từ 2021</p>
                </div>
                <div className="ml-auto flex gap-2">
                  <button className="p-2 bg-white rounded-full text-primary border border-outline-variant hover:bg-primary hover:text-on-primary transition-all">
                    <Info className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
