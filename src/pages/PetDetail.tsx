import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  Heart, MapPin, Sparkles, CheckCircle, Calendar,
  Mars as Male, Venus as Female, Stethoscope, ShieldCheck,
  Gift, Share2, ChevronLeft, ArrowRight, Loader2, AlertCircle,
  Banknote, QrCode, Clock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const BE_URL = (import.meta as any).env?.DEV ? 'http://localhost:5000' : 'https://pwa-home-be.onrender.com';
const imgSrc = (img: string) => {
  if (!img) return '';
  if (img.startsWith('http')) return img;
  const path = img.startsWith('/') ? img : `/${img}`;
  return `${BE_URL}${path}`;
};

interface Pet {
  id: string; _id: string; name: string; breed: string; age: string; gender: 'Male' | 'Female';
  image: string; rescuePartner: string; description: string; story: string;
  status: 'Ready' | 'Treatment' | 'Adopted';
  tags: string[]; aiMatching: number; donationAmount: number;
  healthInfo: { vaccinated: boolean; neutered: boolean; microchipped: boolean };
}

export const PetDetail: React.FC = () => {
  const { id }            = useParams<{ id: string }>();
  const { user, token }   = useAuth();
  const navigate          = useNavigate();

  const [pet,     setPet]     = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  const [donated,        setDonated]        = useState(false);
  const [cashPending,    setCashPending]    = useState(false);
  const [donating,       setDonating]       = useState(false);
  const [donationError,  setDonationError]  = useState('');
  const [showModal,      setShowModal]      = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/pets/${id}`);
        if (!res.ok) throw new Error('not found');
        const data: Pet = await res.json();
        setPet(data);
        if (token && data.donationAmount > 0) {
          const petId = data.id || data._id;
          const dr = await fetch(`/api/donations/check?petId=${petId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (dr.ok) {
            const dj = await dr.json();
            setDonated(dj.donated);
            if (dj.cashPending) setCashPending(true);
          }
        }
      } catch {
        setError('Không thể tải thông tin thú cưng.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, token]);

  const handleDonate = async (paymentMethod: 'online' | 'cash') => {
    if (!user) { navigate('/login'); return; }
    setDonating(true); setDonationError('');
    try {
      const res = await fetch('/api/donations/adoption', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ petId: pet!.id || pet!._id, paymentMethod }),
      });
      const data = await res.json();
      if (!res.ok) { setDonationError(data.message); return; }
      if (data.alreadyDonated) { setDonated(true); setCashPending(false); setShowModal(false); return; }
      if (data.cashPending) { setDonated(true); setCashPending(true); setShowModal(false); return; }
      if (data.checkoutUrl) window.open(data.checkoutUrl, '_blank', 'noopener,noreferrer');
    } catch {
      setDonationError('Không thể kết nối máy chủ.');
    } finally {
      setDonating(false);
    }
  };

  const handleApply = () => {
    if (!user) { navigate('/login'); return; }
    if (pet!.donationAmount > 0 && !donated) { setShowModal(true); return; }
    navigate(`/apply/${pet!.id || pet!._id}`);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-10 h-10 text-primary animate-spin" />
    </div>
  );

  if (error || !pet) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-on-surface-variant">
      <AlertCircle className="w-12 h-12" />
      <p className="font-bold">{error || 'Không tìm thấy thú cưng.'}</p>
      <Link to="/" className="text-primary font-bold underline">Quay lại trang chủ</Link>
    </div>
  );

  const needsDonation = pet.donationAmount > 0;

  return (
    <div className="min-h-screen bg-surface">
      {/* ── Donation Modal ─────────────────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-[32px] p-8 max-w-md w-full shadow-2xl"
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-amber-100 rounded-[20px] flex items-center justify-center mx-auto mb-4">
                <Gift className="w-8 h-8 text-amber-600" />
              </div>
              <h2 className="text-xl font-black text-on-surface mb-2">Đóng góp để nhận nuôi</h2>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Để nhận nuôi bé <strong>{pet.name}</strong>, bạn cần đóng góp{' '}
                <strong className="text-primary text-base">{pet.donationAmount.toLocaleString('vi-VN')}đ</strong>{' '}
                cho trạm cứu hộ. Khoản này giúp trang trải chi phí chăm sóc và cứu hộ các bé khác.
              </p>
            </div>

            {donationError && (
              <div className="p-3 bg-red-50 text-red-700 rounded-2xl text-sm font-semibold mb-4">{donationError}</div>
            )}

            <div className="bg-amber-50 rounded-2xl p-4 mb-5 flex justify-between items-center border border-amber-100">
              <span className="text-sm font-bold text-amber-800">Khoản đóng góp</span>
              <span className="text-xl font-black text-amber-700">{pet.donationAmount.toLocaleString('vi-VN')}đ</span>
            </div>

            <p className="text-xs text-on-surface-variant font-semibold mb-3 text-center">Chọn hình thức thanh toán</p>

            <div className="flex flex-col gap-3 mb-4">
              <button
                onClick={() => handleDonate('online')} disabled={donating}
                className="w-full py-3 bg-amber-500 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-amber-600 disabled:opacity-50 shadow-lg shadow-amber-200 transition-all"
              >
                {donating ? <Loader2 className="w-4 h-4 animate-spin" /> : <QrCode className="w-4 h-4" />}
                {donating ? 'Đang xử lý...' : 'Thanh toán qua QR (PayOS)'}
              </button>
              <button
                onClick={() => handleDonate('cash')} disabled={donating}
                className="w-full py-3 bg-emerald-500 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-600 disabled:opacity-50 shadow-lg shadow-emerald-200 transition-all"
              >
                {donating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Banknote className="w-4 h-4" />}
                {donating ? 'Đang xử lý...' : 'Thanh toán tiền mặt'}
              </button>
            </div>

            <p className="text-[10px] text-on-surface-variant text-center leading-relaxed mb-3">
              Thanh toán tiền mặt: mang tiền đến trạm cứu hộ, admin sẽ xác nhận và cho phép hoàn tất nhận nuôi.
            </p>

            <button
              onClick={() => { setShowModal(false); setDonationError(''); }}
              className="w-full py-2.5 border border-outline-variant rounded-2xl font-bold text-on-surface-variant hover:bg-surface-container transition-all text-sm"
            >
              Để sau
            </button>
          </motion.div>
        </div>
      )}

      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-8">
        <Link to="/" className="inline-flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors mb-8 group">
          <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Quay lại danh sách
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-12">
          {/* ── Main ──────────────────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-8">
            <div className="rounded-[32px] overflow-hidden h-[260px] sm:h-[360px] md:h-[480px]">
              <img src={imgSrc(pet.image)} alt={pet.name} className="w-full h-full object-cover"
                onError={e => { (e.target as HTMLImageElement).src = 'https://placehold.co/800x500/f5f0eb/553722?text=🐾'; }} />
            </div>

            {/* AI badge */}
            <div className="bg-primary-fixed p-8 rounded-[32px] flex flex-col md:flex-row gap-6 items-center">
              <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-10 h-10 text-on-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-primary font-bold text-lg">PAW Intelligence</span>
                  <span className="bg-primary text-on-primary text-[10px] px-2 py-0.5 rounded-full font-black uppercase">AI</span>
                </div>
                <p className="text-on-primary-fixed/80 text-sm leading-relaxed mb-3">
                  Dựa trên hồ sơ của bạn, {pet.name} phù hợp{' '}
                  <strong className="text-primary">{pet.aiMatching}%</strong> với lối sống của bạn.
                </p>
                <div className="flex gap-4 flex-wrap">
                  <span className="flex items-center gap-1 text-primary text-xs font-bold"><CheckCircle className="w-3.5 h-3.5" /> Tương thích không gian</span>
                  <span className="flex items-center gap-1 text-primary text-xs font-bold"><CheckCircle className="w-3.5 h-3.5" /> Thân thiện trẻ em</span>
                </div>
              </div>
            </div>

            {/* Story */}
            <div className="bg-white p-8 rounded-[32px] border border-outline-variant shadow-sm">
              <h2 className="text-2xl font-bold text-on-surface mb-4">Câu chuyện của {pet.name}</h2>
              <p className="text-on-surface-variant leading-loose mb-8">{pet.story || pet.description}</p>

              <h3 className="text-lg font-bold text-on-surface mb-4 flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-primary" /> Tình trạng sức khỏe
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Tiêm phòng', value: pet.healthInfo?.vaccinated   ? 'Đã tiêm'      : 'Chưa tiêm' },
                  { label: 'Triệt sản',  value: pet.healthInfo?.neutered     ? 'Đã triệt sản' : 'Chưa triệt' },
                  { label: 'Gắn chip',   value: pet.healthInfo?.microchipped ? 'Đã gắn'       : 'Chưa gắn' },
                  { label: 'Tẩy giun',   value: 'Định kỳ' },
                ].map((item, i) => (
                  <div key={i} className="bg-surface-container-low p-4 rounded-2xl text-center">
                    <span className="text-xs text-on-surface-variant">{item.label}</span>
                    <p className="font-bold text-primary text-sm mt-1">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {pet.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {pet.tags.map(tag => (
                  <span key={tag} className="px-3 py-1.5 bg-primary/10 text-primary text-xs font-bold rounded-full">{tag}</span>
                ))}
              </div>
            )}
          </div>

          {/* ── Sidebar ────────────────────────────────────────────────── */}
          <div>
            <div className="lg:sticky lg:top-24 space-y-6">
              <div className="bg-white rounded-[32px] border border-outline-variant p-8 shadow-sm space-y-6">
                <div>
                  <h1 className="text-4xl font-black text-on-surface mb-1">{pet.name}</h1>
                  <p className="text-primary font-medium">{pet.breed} • {pet.age}</p>
                  <span className={`mt-2 inline-block text-xs font-black px-3 py-1 rounded-full ${
                    pet.status === 'Ready'     ? 'bg-green-100 text-green-700' :
                    pet.status === 'Treatment' ? 'bg-amber-100 text-amber-700' :
                                                 'bg-blue-100  text-blue-700'
                  }`}>
                    {pet.status === 'Ready' ? 'Sẵn sàng nhận nuôi' : pet.status === 'Treatment' ? 'Đang điều trị' : 'Đã có gia đình'}
                  </span>
                </div>

                <div className="flex gap-3">
                  <div className="flex-1 bg-surface-container p-3 rounded-2xl text-center">
                    {pet.gender === 'Male' ? <Male className="w-5 h-5 mx-auto text-blue-500" /> : <Female className="w-5 h-5 mx-auto text-pink-500" />}
                    <span className="text-xs text-on-surface-variant mt-1 block">{pet.gender === 'Male' ? 'Đực' : 'Cái'}</span>
                  </div>
                  <div className="flex-1 bg-surface-container p-3 rounded-2xl text-center">
                    <Calendar className="w-5 h-5 mx-auto text-primary" />
                    <span className="text-xs text-on-surface-variant mt-1 block">{pet.age}</span>
                  </div>
                  <div className="flex-1 bg-surface-container p-3 rounded-2xl text-center">
                    <ShieldCheck className="w-5 h-5 mx-auto text-green-600" />
                    <span className="text-xs text-on-surface-variant mt-1 block">Xác minh</span>
                  </div>
                </div>

                {/* Donation badge */}
                {needsDonation && (
                  <div className={`rounded-2xl p-4 flex items-center gap-3 border ${
                    donated && !cashPending ? 'bg-green-50 border-green-200' :
                    cashPending            ? 'bg-sky-50   border-sky-200'   :
                                             'bg-amber-50 border-amber-200'
                  }`}>
                    {cashPending
                      ? <Clock className="w-5 h-5 shrink-0 text-sky-600" />
                      : <Gift  className={`w-5 h-5 shrink-0 ${donated ? 'text-green-600' : 'text-amber-600'}`} />
                    }
                    <div>
                      <p className={`text-[10px] font-black uppercase tracking-wider ${
                        donated && !cashPending ? 'text-green-600' :
                        cashPending            ? 'text-sky-600'   :
                                                 'text-amber-600'
                      }`}>
                        {donated && !cashPending ? '✓ Đã đóng góp' :
                         cashPending            ? '⏳ Chờ xác nhận tiền mặt' :
                                                  'Yêu cầu đóng góp'}
                      </p>
                      <p className={`font-black ${
                        donated && !cashPending ? 'text-green-800' :
                        cashPending            ? 'text-sky-800'   :
                                                 'text-amber-800'
                      }`}>
                        {pet.donationAmount.toLocaleString('vi-VN')}đ
                      </p>
                    </div>
                  </div>
                )}

                {/* CTA */}
                <div className="space-y-3">
                  {pet.status === 'Adopted' ? (
                    <div className="w-full py-4 bg-blue-50 text-blue-700 rounded-2xl font-bold text-center text-sm">
                      Bé này đã có gia đình mới 🎉
                    </div>
                  ) : (
                    <button onClick={handleApply}
                      className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] ${
                        needsDonation && !donated
                          ? 'bg-amber-500 text-white shadow-amber-200 hover:bg-amber-600'
                          : 'bg-primary text-on-primary shadow-primary/20'
                      }`}
                    >
                      {needsDonation && !donated
                        ? <><Gift className="w-5 h-5" /> Đóng góp & Nhận nuôi</>
                        : <><ArrowRight className="w-5 h-5" /> Đăng ký nhận nuôi</>
                      }
                    </button>
                  )}
                </div>

                <div className="pt-4 border-t border-outline-variant flex items-center justify-between">
                  <button className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors text-sm font-medium">
                    <Heart className="w-5 h-5" /> Yêu thích
                  </button>
                  <button
                    onClick={() => navigator.share?.({ title: `${pet.name} – PAW Home`, url: location.href })}
                    className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors text-sm font-medium"
                  >
                    <Share2 className="w-5 h-5" /> Chia sẻ
                  </button>
                </div>
              </div>

              <div className="bg-surface-container-high rounded-[32px] p-5 flex items-center gap-4 border border-outline-variant">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-xl flex-shrink-0">🏠</div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-on-surface text-sm truncate">{pet.rescuePartner}</p>
                  <p className="text-xs text-on-surface-variant">Đối tác cứu hộ</p>
                </div>
                <MapPin className="w-5 h-5 text-primary flex-shrink-0" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
