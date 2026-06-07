import React, { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  PawPrint, Heart, MapPin, Search, SlidersHorizontal, X,
  Mars as Male, Venus as Female, ShieldCheck, Syringe, Scissors,
  Loader2, AlertCircle, ArrowRight, Gift, Sparkles, RefreshCw,
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
  id: string; _id: string; name: string; breed: string; age: string;
  gender: 'Male' | 'Female'; image: string; rescuePartner: string;
  description: string; story: string;
  status: 'Ready' | 'Treatment' | 'Adopted';
  tags: string[]; aiMatching: number; donationAmount: number;
  healthInfo: { vaccinated: boolean; neutered: boolean; microchipped: boolean };
}

const STATUS_OPTS = [
  { value: '', label: 'Tất cả' },
  { value: 'Ready', label: 'Sẵn sàng' },
  { value: 'Treatment', label: 'Đang điều trị' },
  { value: 'Adopted', label: 'Đã nhận nuôi' },
];

const GENDER_OPTS = [
  { value: '', label: 'Tất cả' },
  { value: 'Male', label: 'Đực' },
  { value: 'Female', label: 'Cái' },
];

const SORT_OPTS = [
  { value: 'newest', label: 'Mới nhất' },
  { value: 'name', label: 'Tên A–Z' },
  { value: 'match', label: 'Độ tương thích' },
];

export const Pets: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [pets, setPets]         = useState<Pet[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [liked, setLiked]       = useState<Set<string>>(new Set());
  const [showFilter, setShowFilter] = useState(false);

  // Filters
  const [search, setSearch]     = useState('');
  const [status, setStatus]     = useState('');
  const [gender, setGender]     = useState('');
  const [sort, setSort]         = useState('newest');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/pets?limit=100');
        if (!res.ok) throw new Error('fetch failed');
        const data = await res.json();
        setPets(Array.isArray(data) ? data : (data.pets ?? []));
      } catch {
        setError('Không thể tải danh sách thú cưng.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    let list = [...pets];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.breed.toLowerCase().includes(q) ||
        p.tags?.some(t => t.toLowerCase().includes(q))
      );
    }
    if (status) list = list.filter(p => p.status === status);
    if (gender) list = list.filter(p => p.gender === gender);
    if (sort === 'name')  list.sort((a, b) => a.name.localeCompare(b.name));
    if (sort === 'match') list.sort((a, b) => (b.aiMatching || 0) - (a.aiMatching || 0));
    return list;
  }, [pets, search, status, gender, sort]);

  const toggleLike = (id: string) => {
    if (!user) { navigate('/login'); return; }
    setLiked(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const activeFilters = [status, gender].filter(Boolean).length;

  const StatusBadge = ({ s }: { s: Pet['status'] }) => {
    const map = {
      Ready:     { label: 'Sẵn sàng',      cls: 'bg-green-100 text-green-700 border-green-200' },
      Treatment: { label: 'Đang điều trị', cls: 'bg-amber-100 text-amber-700 border-amber-200' },
      Adopted:   { label: 'Đã nhận nuôi',  cls: 'bg-blue-100  text-blue-700  border-blue-200' },
    };
    const { label, cls } = map[s] ?? map.Ready;
    return <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${cls}`}>{label}</span>;
  };

  return (
    <div className="min-h-screen bg-surface">
      {/* ── Header ── */}
      <section className="relative bg-gradient-to-br from-primary/5 via-surface to-secondary/5 pt-16 pb-12 px-margin-mobile md:px-margin-desktop overflow-hidden">
        <div className="absolute inset-0 opacity-5 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, var(--color-primary) 1px, transparent 0)', backgroundSize: '32px 32px' }} />
        <div className="max-w-container-max mx-auto relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-[0.3em] text-xs mb-4">
              <div className="w-8 h-[2px] bg-primary" />
              PAW Home
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-on-surface tracking-tighter mb-4">
              Thú cưng <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">cần gia đình</span>
            </h1>
            <p className="text-on-surface-variant text-lg font-medium max-w-xl">
              Mỗi bé đều có một câu chuyện — hãy là người viết tiếp chương đẹp nhất của cuộc đời chúng.
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="flex flex-wrap gap-6 mt-10"
          >
            {[
              { label: 'Tổng số bé', value: pets.length },
              { label: 'Sẵn sàng nhận nuôi', value: pets.filter(p => p.status === 'Ready').length },
              { label: 'Đang điều trị', value: pets.filter(p => p.status === 'Treatment').length },
              { label: 'Đã tìm được nhà', value: pets.filter(p => p.status === 'Adopted').length },
            ].map(s => (
              <div key={s.label} className="bg-white/70 backdrop-blur-sm border border-outline-variant rounded-2xl px-5 py-3 shadow-sm">
                <p className="text-2xl font-black text-primary">{s.value}</p>
                <p className="text-xs text-on-surface-variant font-bold mt-0.5">{s.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Toolbar ── */}
      <div className="sticky top-[73px] z-30 bg-surface/90 backdrop-blur-md border-b border-outline-variant px-margin-mobile md:px-margin-desktop py-3 shadow-sm">
        <div className="max-w-container-max mx-auto flex items-center gap-3 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Tìm tên, giống, tag..."
              className="w-full pl-9 pr-4 py-2.5 bg-surface-container rounded-2xl text-sm border border-outline-variant focus:outline-none focus:border-primary/50 transition-colors"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filter toggle */}
          <button
            onClick={() => setShowFilter(v => !v)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-bold border transition-all ${
              showFilter || activeFilters > 0
                ? 'bg-primary text-on-primary border-primary shadow-lg shadow-primary/20'
                : 'bg-surface-container text-on-surface-variant border-outline-variant hover:border-primary/30'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Bộ lọc
            {activeFilters > 0 && (
              <span className="w-5 h-5 bg-white/30 rounded-full text-[10px] font-black flex items-center justify-center">{activeFilters}</span>
            )}
          </button>

          {/* Sort */}
          <select
            value={sort} onChange={e => setSort(e.target.value)}
            className="px-4 py-2.5 bg-surface-container rounded-2xl text-sm font-medium border border-outline-variant focus:outline-none focus:border-primary/50 text-on-surface cursor-pointer"
          >
            {SORT_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>

          <span className="text-sm text-on-surface-variant font-medium ml-auto hidden sm:block">
            {filtered.length} kết quả
          </span>
        </div>

        {/* Expanded filter panel */}
        <AnimatePresence>
          {showFilter && (
            <motion.div
              initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="max-w-container-max mx-auto py-3 flex flex-wrap gap-6">
                {/* Status */}
                <div>
                  <p className="text-xs font-black text-on-surface-variant uppercase tracking-wider mb-2">Tình trạng</p>
                  <div className="flex gap-2 flex-wrap">
                    {STATUS_OPTS.map(o => (
                      <button key={o.value} onClick={() => setStatus(o.value)}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                          status === o.value
                            ? 'bg-primary text-on-primary border-primary'
                            : 'bg-surface border-outline-variant text-on-surface-variant hover:border-primary/30'
                        }`}
                      >{o.label}</button>
                    ))}
                  </div>
                </div>
                {/* Gender */}
                <div>
                  <p className="text-xs font-black text-on-surface-variant uppercase tracking-wider mb-2">Giới tính</p>
                  <div className="flex gap-2">
                    {GENDER_OPTS.map(o => (
                      <button key={o.value} onClick={() => setGender(o.value)}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                          gender === o.value
                            ? 'bg-primary text-on-primary border-primary'
                            : 'bg-surface border-outline-variant text-on-surface-variant hover:border-primary/30'
                        }`}
                      >{o.label}</button>
                    ))}
                  </div>
                </div>
                {(status || gender) && (
                  <button
                    onClick={() => { setStatus(''); setGender(''); }}
                    className="flex items-center gap-1 text-xs text-error font-bold self-end mb-0.5 hover:underline"
                  >
                    <RefreshCw className="w-3 h-3" /> Xoá bộ lọc
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Content ── */}
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-10">
        {loading && (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <p className="text-on-surface-variant font-medium">Đang tải danh sách thú cưng...</p>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center justify-center py-32 gap-4 text-on-surface-variant">
            <AlertCircle className="w-12 h-12 text-error" />
            <p className="font-bold">{error}</p>
            <button onClick={() => window.location.reload()} className="text-primary font-bold underline">Thử lại</button>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-32 gap-4 text-on-surface-variant">
            <PawPrint className="w-16 h-16 opacity-20" />
            <p className="text-xl font-black text-on-surface">Không tìm thấy kết quả</p>
            <p className="text-sm">Thử thay đổi bộ lọc hoặc từ khoá tìm kiếm.</p>
            <button onClick={() => { setSearch(''); setStatus(''); setGender(''); }}
              className="flex items-center gap-2 text-primary font-bold hover:underline text-sm">
              <RefreshCw className="w-4 h-4" /> Xem tất cả thú cưng
            </button>
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {filtered.map((pet, i) => (
              <motion.div
                key={pet.id || pet._id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.04, 0.3) }}
                className="group bg-white rounded-[32px] border border-outline-variant overflow-hidden hover:shadow-2xl hover:shadow-primary/8 hover:-translate-y-1 transition-all duration-300"
              >
                {/* Image */}
                <div className="relative h-52 overflow-hidden">
                  <img
                    src={imgSrc(pet.image)}
                    alt={pet.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    onError={e => { (e.target as HTMLImageElement).src = 'https://placehold.co/400x300/f5f0eb/553722?text=🐾'; }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                  {/* Status badge */}
                  <div className="absolute top-3 left-3">
                    <StatusBadge s={pet.status} />
                  </div>

                  {/* Like button */}
                  <button
                    onClick={() => toggleLike(pet.id || pet._id)}
                    className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-sm transition-all ${
                      liked.has(pet.id || pet._id)
                        ? 'bg-red-500 text-white shadow-lg'
                        : 'bg-white/80 text-on-surface-variant hover:bg-white hover:text-red-500'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${liked.has(pet.id || pet._id) ? 'fill-current' : ''}`} />
                  </button>

                  {/* AI match */}
                  {pet.aiMatching > 0 && (
                    <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-black/60 backdrop-blur-sm text-white px-2.5 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                      <Sparkles className="w-3 h-3 text-yellow-400" />
                      <span className="text-[10px] font-black">{pet.aiMatching}% phù hợp</span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-lg font-black text-on-surface group-hover:text-primary transition-colors">{pet.name}</h3>
                      <p className="text-xs text-on-surface-variant font-medium">{pet.breed}</p>
                    </div>
                    <div className="flex items-center gap-1 text-on-surface-variant">
                      {pet.gender === 'Male'
                        ? <Male className="w-4 h-4 text-blue-500" />
                        : <Female className="w-4 h-4 text-pink-500" />
                      }
                      <span className="text-xs font-bold text-on-surface-variant">{pet.age}</span>
                    </div>
                  </div>

                  {/* Health icons */}
                  <div className="flex gap-2 mb-3">
                    {pet.healthInfo?.vaccinated && (
                      <span title="Đã tiêm phòng" className="flex items-center gap-1 bg-green-50 text-green-700 px-2 py-0.5 rounded-full text-[10px] font-bold border border-green-100">
                        <Syringe className="w-2.5 h-2.5" /> Tiêm phòng
                      </span>
                    )}
                    {pet.healthInfo?.neutered && (
                      <span title="Đã triệt sản" className="flex items-center gap-1 bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full text-[10px] font-bold border border-purple-100">
                        <Scissors className="w-2.5 h-2.5" /> Triệt sản
                      </span>
                    )}
                    {pet.healthInfo?.microchipped && (
                      <span title="Đã gắn chip" className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full text-[10px] font-bold border border-blue-100">
                        <ShieldCheck className="w-2.5 h-2.5" /> Chip
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-on-surface-variant line-clamp-2 mb-3 leading-relaxed">{pet.description}</p>

                  {/* Tags */}
                  {pet.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {pet.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="px-2 py-0.5 bg-primary/8 text-primary text-[10px] font-bold rounded-full">{tag}</span>
                      ))}
                    </div>
                  )}

                  {/* Rescue partner */}
                  <div className="flex items-center gap-1.5 mb-4 text-on-surface-variant">
                    <MapPin className="w-3 h-3 flex-shrink-0" />
                    <span className="text-[10px] font-medium truncate">{pet.rescuePartner || 'PAW Home'}</span>
                  </div>

                  {/* Donation badge */}
                  {pet.donationAmount > 0 && (
                    <div className="flex items-center gap-2 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2 mb-3">
                      <Gift className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                      <span className="text-[10px] text-amber-700 font-bold">
                        Đóng góp {pet.donationAmount.toLocaleString('vi-VN')}đ để nhận nuôi
                      </span>
                    </div>
                  )}

                  {/* CTA */}
                  <Link
                    to={`/pet/${pet.id || pet._id}`}
                    className={`w-full py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all hover:gap-3 ${
                      pet.status === 'Adopted'
                        ? 'bg-surface-container text-on-surface-variant cursor-default'
                        : 'bg-primary text-on-primary hover:bg-primary-container shadow-sm shadow-primary/20'
                    }`}
                  >
                    {pet.status === 'Adopted' ? 'Đã có gia đình 🎉' : (
                      <><span>Xem chi tiết</span><ArrowRight className="w-4 h-4" /></>
                    )}
                  </Link>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};
