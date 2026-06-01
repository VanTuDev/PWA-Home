import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ChevronLeft, Brain, PawPrint, ArrowRight, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Pet {
  _id: string; name: string; breed: string; age: string;
  gender: string; image: string; status: string;
  description: string; tags: string[]; aiMatching?: number;
}

interface Question {
  id: number; title: string; subtitle?: string;
  options: { label: string; icon: string; value: string }[];
}

// ─── Questions ────────────────────────────────────────────────────────────────
const QUESTIONS: Question[] = [
  {
    id: 1,
    title: 'Bạn muốn nuôi loại thú cưng nào?',
    subtitle: 'Lựa chọn này giúp AI lọc đúng đối tượng',
    options: [
      { label: 'Chó', icon: '🐶', value: 'chó' },
      { label: 'Mèo', icon: '🐱', value: 'mèo' },
      { label: 'Cả chó lẫn mèo', icon: '🐾', value: 'chó hoặc mèo' },
      { label: 'Linh hoạt, AI quyết', icon: '✨', value: 'linh hoạt' }
    ]
  },
  {
    id: 2,
    title: 'Không gian sống của bạn?',
    subtitle: 'Ảnh hưởng trực tiếp đến giống thú cưng phù hợp',
    options: [
      { label: 'Căn hộ nhỏ (< 50m²)', icon: '🏢', value: 'căn hộ nhỏ' },
      { label: 'Chung cư lớn (> 50m²)', icon: '🏬', value: 'chung cư lớn' },
      { label: 'Nhà phố có sân nhỏ', icon: '🏠', value: 'nhà phố' },
      { label: 'Nhà vườn rộng rãi', icon: '🌳', value: 'nhà vườn rộng' }
    ]
  },
  {
    id: 3,
    title: 'Bạn có bao nhiêu thời gian mỗi ngày?',
    options: [
      { label: 'Dưới 1 tiếng', icon: '⌚', value: 'ít hơn 1 giờ mỗi ngày' },
      { label: '1 – 2 tiếng', icon: '🚶', value: '1-2 giờ mỗi ngày' },
      { label: '3 – 5 tiếng', icon: '🐕', value: '3-5 giờ mỗi ngày' },
      { label: 'Làm tại nhà / cả ngày', icon: '💻', value: 'cả ngày ở nhà' }
    ]
  },
  {
    id: 4,
    title: 'Tính cách bé bạn mong muốn?',
    options: [
      { label: 'Năng động, ham chạy nhảy', icon: '🚀', value: 'năng động, thích vận động' },
      { label: 'Điềm tĩnh, thích ôm ấp', icon: '🧘', value: 'điềm tĩnh, tình cảm' },
      { label: 'Thông minh, dễ dạy bảo', icon: '🎓', value: 'thông minh, dễ huấn luyện' },
      { label: 'Độc lập, ít quấy phá', icon: '😎', value: 'độc lập, ít đòi hỏi' }
    ]
  },
  {
    id: 5,
    title: 'Kinh nghiệm nuôi thú cưng của bạn?',
    options: [
      { label: 'Chưa từng nuôi', icon: '🌱', value: 'chưa có kinh nghiệm' },
      { label: 'Đã nuôi vài năm', icon: '🐾', value: 'có ít kinh nghiệm' },
      { label: 'Có nhiều kinh nghiệm', icon: '⭐', value: 'có nhiều kinh nghiệm' },
      { label: 'Chuyên gia / yêu thú cưng', icon: '🏆', value: 'chuyên gia' }
    ]
  },
  {
    id: 6,
    title: 'Thành viên trong gia đình bạn?',
    options: [
      { label: 'Chỉ sống một mình', icon: '🧑', value: 'sống một mình' },
      { label: 'Có trẻ nhỏ dưới 5 tuổi', icon: '👶', value: 'có trẻ nhỏ dưới 5 tuổi' },
      { label: 'Gia đình có trẻ lớn', icon: '👨‍👩‍👧', value: 'gia đình có trẻ em' },
      { label: 'Chỉ người lớn / ông bà', icon: '👴', value: 'người lớn tuổi' }
    ]
  }
];

const imgSrc = (img: string) =>
  img?.startsWith('/uploads') ? `http://localhost:5000${img}` : img;

// ─── Main Component ───────────────────────────────────────────────────────────
export const Survey: React.FC = () => {
  const [step, setStep]         = useState(0);       // 0 = intro
  const [answers, setAnswers]   = useState<string[]>([]);
  const [loading, setLoading]   = useState(false);
  const [results, setResults]   = useState<{ pet: Pet; score: number; reason: string }[]>([]);
  const [error, setError]       = useState('');

  const total = QUESTIONS.length;

  const handleAnswer = async (value: string) => {
    const newAnswers = [...answers, value];
    setAnswers(newAnswers);

    if (step < total) {
      setStep(step + 1);
    }

    if (newAnswers.length === total) {
      await analyzeMatch(newAnswers);
    }
  };

  const analyzeMatch = async (ans: string[]) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/pets/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: ans }),
      });

      if (!res.ok) throw new Error('Server error');

      const data: { pet: Pet; score: number; reason: string }[] = await res.json();
      setResults(data);
    } catch (err: any) {
      console.error(err);
      setError('Không thể phân tích lúc này. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setStep(0); setAnswers([]); setResults([]); setError('');
  };

  // ── Intro ──────────────────────────────────────────────────────────────────
  if (step === 0) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-lg w-full text-center"
        >
          <div className="w-24 h-24 bg-primary/10 rounded-[32px] flex items-center justify-center mx-auto mb-8 shadow-xl shadow-primary/10">
            <Brain className="w-12 h-12 text-primary" />
          </div>
          <h1 className="text-4xl font-black text-on-surface tracking-tight mb-4">
            Khám phá độ tương thích
          </h1>
          <p className="text-on-surface-variant font-medium leading-relaxed mb-8">
            Trả lời {total} câu hỏi đơn giản — AI sẽ phân tích và đề xuất những người bạn lông xù phù hợp nhất với lối sống của bạn.
          </p>
          <button
            onClick={() => setStep(1)}
            className="bg-primary text-on-primary px-10 py-4 rounded-[24px] font-bold text-lg shadow-xl shadow-primary/20 flex items-center gap-3 mx-auto hover:scale-[1.02] active:scale-95 transition-all"
          >
            Bắt đầu khảo sát <Sparkles className="w-5 h-5" />
          </button>
          <p className="text-xs text-on-surface-variant mt-6">Chỉ mất khoảng 2 phút</p>
        </motion.div>
      </div>
    );
  }

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
            className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full mx-auto mb-6"
          />
          <h2 className="text-xl font-black text-on-surface mb-2">AI đang phân tích...</h2>
          <p className="text-sm text-on-surface-variant">Đang tìm kiếm người bạn phù hợp nhất</p>
        </div>
      </div>
    );
  }

  // ── Results ────────────────────────────────────────────────────────────────
  if (answers.length === total && !loading) {
    return (
      <div className="min-h-screen bg-surface py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider mb-4">
              <Sparkles className="w-4 h-4" /> Kết quả phân tích AI
            </div>
            <h1 className="text-3xl font-black text-on-surface tracking-tight">
              {results.length > 0 ? `Tìm thấy ${results.length} bé phù hợp!` : 'Chưa tìm thấy bé phù hợp'}
            </h1>
            <p className="text-on-surface-variant mt-2 text-sm">
              {results.length > 0 ? 'Dựa trên câu trả lời của bạn, đây là những người bạn lông xù lý tưởng nhất.' : 'Hãy thử thay đổi tiêu chí tìm kiếm.'}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-2xl text-sm font-semibold text-center">{error}</div>
          )}

          <div className="space-y-4">
            {results.map(({ pet, score, reason }, i) => (
              <motion.div
                key={pet._id}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-[28px] border border-outline-variant shadow-sm overflow-hidden flex gap-4 p-4 hover:shadow-md transition-shadow"
              >
                <img
                  src={imgSrc(pet.image)}
                  alt={pet.name}
                  className="w-24 h-24 rounded-[20px] object-cover flex-shrink-0"
                  onError={e => { (e.target as HTMLImageElement).src = 'https://placehold.co/96x96/f5f0eb/553722?text=🐾'; }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-black text-on-surface">{pet.name}</h3>
                      <p className="text-xs text-on-surface-variant font-medium">{pet.breed} · {pet.age}</p>
                    </div>
                    {/* Score badge */}
                    <div className={`flex-shrink-0 w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-black shadow-sm ${
                      score >= 85 ? 'bg-green-100 text-green-700' :
                      score >= 70 ? 'bg-amber-100 text-amber-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      <span className="text-xl leading-none">{score}</span>
                      <span className="text-[9px] uppercase tracking-widest">%</span>
                    </div>
                  </div>
                  <p className="text-xs text-on-surface-variant mt-2 leading-relaxed line-clamp-2">{reason}</p>
                  <Link
                    to={`/pet/${pet._id}`}
                    className="inline-flex items-center gap-1.5 mt-3 text-xs font-bold text-primary hover:underline"
                  >
                    Xem hồ sơ <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="flex gap-3 mt-8">
            <button onClick={reset}
              className="flex-1 flex items-center justify-center gap-2 py-4 border border-outline-variant rounded-[20px] font-bold text-on-surface-variant hover:bg-surface-container transition-all">
              <RefreshCw className="w-5 h-5" /> Làm lại
            </button>
            <Link to="/"
              className="flex-1 flex items-center justify-center gap-2 py-4 bg-primary text-on-primary rounded-[20px] font-bold shadow-xl shadow-primary/20 hover:scale-[1.01] transition-all">
              <PawPrint className="w-5 h-5" /> Xem tất cả
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Questions ──────────────────────────────────────────────────────────────
  const q = QUESTIONS[step - 1];

  return (
    <div className="min-h-screen bg-surface py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <button
            onClick={() => step === 1 ? setStep(0) : setStep(step - 1)}
            className="flex items-center gap-2 text-sm font-bold text-on-surface-variant hover:text-primary transition-colors"
          >
            <ChevronLeft className="w-5 h-5" /> Quay lại
          </button>
          <span className="text-xs font-black text-on-surface-variant uppercase tracking-widest">
            {step} / {total}
          </span>
        </div>

        {/* Progress */}
        <div className="h-1.5 bg-surface-container-high rounded-full mb-10 overflow-hidden">
          <motion.div
            className="h-full bg-primary rounded-full"
            animate={{ width: `${(step / total) * 100}%` }}
            transition={{ type: 'spring', stiffness: 300 }}
          />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <div className="mb-8">
              <span className="text-xs font-black text-primary uppercase tracking-widest mb-3 block">
                Câu hỏi {step}
              </span>
              <h2 className="text-2xl md:text-3xl font-black text-on-surface mb-2">{q.title}</h2>
              {q.subtitle && <p className="text-sm text-on-surface-variant font-medium">{q.subtitle}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {q.options.map(opt => (
                <motion.button
                  key={opt.value}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleAnswer(opt.value)}
                  className="group flex items-center gap-5 p-5 bg-white border-2 border-outline-variant rounded-[24px] text-left hover:border-primary hover:bg-primary/5 transition-all shadow-sm"
                >
                  <span className="text-3xl flex-shrink-0">{opt.icon}</span>
                  <span className="font-bold text-on-surface group-hover:text-primary transition-colors text-sm">
                    {opt.label}
                  </span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
