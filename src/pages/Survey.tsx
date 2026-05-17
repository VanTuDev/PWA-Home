import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  ChevronRight, 
  ChevronLeft, 
  Home, 
  Clock, 
  Users, 
  Heart, 
  CheckCircle,
  Brain
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Survey: React.FC = () => {
  const [step, setStep] = useState(1);
  const totalSteps = 4;
  const navigate = useNavigate();

  const questions = [
    {
      id: 1,
      title: "Không gian sống của bạn?",
      options: [
        { label: "Căn hộ nhỏ", icon: "🏢" },
        { label: "Nhà phố có lầu", icon: "🏠" },
        { label: "Nhà vườn rộng", icon: "🌳" },
        { label: "Khác", icon: "🏘️" }
      ]
    },
    {
      id: 2,
      title: "Bạn có bao nhiêu thời gian cho bé mỗi ngày?",
      options: [
        { label: "Dưới 1 tiếng", icon: "⌚" },
        { label: "1 - 3 tiếng", icon: "🚶" },
        { label: "Trên 3 tiếng", icon: "🐕" },
        { label: "Cả ngày (làm tại nhà)", icon: "💻" }
      ]
    },
    {
      id: 3,
      title: "Bạn tìm kiếm tính cách như thế nào?",
      options: [
        { label: "Năng động, hướng ngoại", icon: "🚀" },
        { label: "Điềm tĩnh, tình cảm", icon: "🧘" },
        { label: "Thông minh, dễ dạy bảo", icon: "🎓" },
        { label: "Sống độc lập", icon: "🐱" }
      ]
    },
    {
       id: 4,
       title: "Gia đình bạn có trẻ nhỏ không?",
       options: [
         { label: "Có trẻ nhỏ dưới 5 tuổi", icon: "👶" },
         { label: "Có trẻ em trên 5 tuổi", icon: "👧" },
         { label: "Chỉ người lớn", icon: "🧑" },
         { label: "Ông bà cao tuổi", icon: "👴" }
       ]
    }
  ];

  return (
    <div className="min-h-screen bg-surface py-12 px-margin-mobile md:px-margin-desktop">
      <div className="max-w-3xl mx-auto">
        <header className="text-center mb-12">
          <div className="bg-primary-fixed inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold text-primary mb-6 animate-bounce">
            <Brain className="w-4 h-4" />
            AI Intelligence Processing
          </div>
          <h1 className="text-4xl font-bold text-on-surface mb-2">Tìm kiếm người bạn lý tưởng</h1>
          <p className="text-on-surface-variant font-medium">Trả lời {totalSteps} câu hỏi để AI phân tích độ tương thích.</p>
        </header>

        <div className="bg-white rounded-[40px] border border-outline-variant p-8 md:p-12 shadow-sm relative overflow-hidden">
           {/* Progress Line */}
           <div className="absolute top-0 left-0 w-full h-2 bg-surface-container-high">
              <motion.div 
                className="h-full bg-primary"
                initial={{ width: 0 }}
                animate={{ width: `${(step / totalSteps) * 100}%` }}
              />
           </div>

           <AnimatePresence mode="wait">
             <motion.div
               key={step}
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               exit={{ opacity: 0, x: -20 }}
               className="py-8"
             >
               <span className="text-xs font-black text-primary uppercase tracking-widest mb-4 block">Câu hỏi {step}/{totalSteps}</span>
               <h2 className="text-2xl md:text-3xl font-bold text-on-surface mb-10">{questions[step-1].title}</h2>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {questions[step-1].options.map((opt) => (
                    <button 
                      key={opt.label} 
                      onClick={() => step < totalSteps ? setStep(step + 1) : null}
                      className="group p-6 bg-surface-container-low border border-outline-variant rounded-3xl flex items-center gap-6 hover:bg-primary hover:border-primary hover:translate-y-[-4px] transition-all"
                    >
                      <span className="text-4xl grayscale group-hover:grayscale-0 transition-all">{opt.icon}</span>
                      <span className="text-lg font-bold text-on-surface group-hover:text-on-primary transition-colors">{opt.label}</span>
                    </button>
                  ))}
               </div>
             </motion.div>
           </AnimatePresence>

           <footer className="pt-12 flex justify-between items-center mt-12 border-t border-outline-variant">
              <button 
                onClick={() => step > 1 && setStep(step - 1)}
                className={`flex items-center gap-2 font-bold text-on-surface-variant hover:text-primary transition-colors ${step === 1 && 'opacity-0'}`}
              >
                <ChevronLeft className="w-5 h-5" />
                Quay lại
              </button>

              {step === totalSteps && (
                <button 
                  onClick={() => navigate('/')}
                  className="bg-primary text-on-primary px-10 py-4 rounded-2xl font-bold flex items-center gap-2 shadow-xl shadow-primary/20 hover:bg-primary-container transition-all"
                >
                  Duyệt kết quả AI
                  <Sparkles className="w-5 h-5" />
                </button>
              )}
           </footer>
        </div>
      </div>
    </div>
  );
};
