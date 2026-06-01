import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, Loader2, PawPrint, Sparkles, ChevronDown } from 'lucide-react';
import { ask, hasApiKey } from '../lib/gemini';

interface Message {
  role: 'user' | 'bot';
  content: string;
  loading?: boolean;
}

const QUICK_QUESTIONS = [
  'Thú cưng của tôi bị bệnh phải làm gì?',
  'Tôi nên nhận nuôi thú cưng nào?',
  'Chi phí nuôi thú cưng hàng tháng là bao nhiêu?',
  'Làm sao để thú cưng mới quen với nhà?',
  'Lịch tiêm phòng cho chó mèo như thế nào?',
  'Chế độ ăn cho chó con và mèo con?',
];

const SYSTEM_CONTEXT = `Bạn là chuyên gia tư vấn thú cưng của PAW Home — nền tảng cứu hộ và nhận nuôi thú cưng tại Đà Nẵng, Việt Nam.
Nhiệm vụ: Trả lời các câu hỏi về chăm sóc, sức khỏe, nuôi dưỡng, hành vi thú cưng.
Phong cách: Thân thiện, ngắn gọn, thực tế. Dùng tiếng Việt.
Giới hạn: Không tư vấn y tế chuyên sâu (khuyên đến bác sĩ thú y). Không nói về chủ đề ngoài thú cưng.
Kết thúc câu trả lời bằng emoji phù hợp.`;

export const AIChatBot: React.FC = () => {
  const [open, setOpen]         = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput]       = useState('');
  const [thinking, setThinking] = useState(false);
  const bottomRef               = useRef<HTMLDivElement>(null);
  const inputRef                = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{
        role: 'bot',
        content: 'Xin chào! Tôi là trợ lý AI của PAW Home 🐾\nBạn cần tư vấn gì về thú cưng hôm nay?'
      }]);
    }
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || thinking) return;

    const userMsg: Message = { role: 'user', content: text.trim() };
    const loadingMsg: Message = { role: 'bot', content: '', loading: true };

    setMessages(m => [...m, userMsg, loadingMsg]);
    setInput('');
    setThinking(true);

    try {
      if (!hasApiKey()) throw new Error('no_key');

      // Build conversation context
      const history = messages
        .filter(m => !m.loading)
        .slice(-6)
        .map(m => `${m.role === 'user' ? 'Người dùng' : 'Trợ lý'}: ${m.content}`)
        .join('\n');

      const prompt = `${SYSTEM_CONTEXT}

${history ? `Lịch sử hội thoại:\n${history}\n` : ''}
Người dùng: ${text.trim()}
Trợ lý:`;

      const reply = await ask(prompt);
      setMessages(m => m.slice(0, -1).concat([{ role: 'bot', content: reply }]));
    } catch (err: any) {
      const msg = err.message === 'no_key'
        ? 'Tính năng AI chưa được kích hoạt. Vui lòng liên hệ PAW Home để được hỗ trợ 🐾'
        : 'Xin lỗi, tôi đang gặp sự cố. Vui lòng thử lại sau nhé! 🙏';
      setMessages(m => m.slice(0, -1).concat([{ role: 'bot', content: msg }]));
    } finally {
      setThinking(false);
    }
  };

  return (
    <>
      {/* Floating button */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-primary text-on-primary rounded-full shadow-2xl shadow-primary/40 flex items-center justify-center hover:scale-110 active:scale-95 transition-transform"
            title="Chat với AI chuyên gia thú cưng"
          >
            <PawPrint className="w-7 h-7" />
            {/* Pulse indicator */}
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="fixed bottom-6 right-6 z-50 w-[360px] max-h-[600px] bg-white rounded-[28px] shadow-2xl border border-outline-variant flex flex-col overflow-hidden"
            style={{ maxHeight: 'min(600px, calc(100vh - 48px))' }}
          >
            {/* Header */}
            <div className="bg-primary px-5 py-4 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-on-primary/20 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-on-primary" />
                </div>
                <div>
                  <p className="font-black text-on-primary text-sm">AI PAW Home</p>
                  <p className="text-[10px] text-on-primary/60 font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block" /> Trực tuyến
                  </p>
                </div>
              </div>
              <button onClick={() => setOpen(false)}
                className="p-1.5 hover:bg-on-primary/20 rounded-xl transition-colors text-on-primary">
                <ChevronDown className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-surface-container-lowest">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'bot' && (
                    <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center flex-shrink-0 mr-2 self-end">
                      <PawPrint className="w-4 h-4 text-on-primary" />
                    </div>
                  )}
                  <div className={`max-w-[75%] px-4 py-3 rounded-[18px] text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-primary text-on-primary rounded-br-sm'
                      : 'bg-white border border-outline-variant text-on-surface rounded-bl-sm shadow-sm'
                  }`}>
                    {msg.loading ? (
                      <div className="flex items-center gap-2 text-on-surface-variant">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-xs">Đang suy nghĩ...</span>
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    )}
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            {/* Quick questions — chỉ hiện khi ít tin nhắn */}
            {messages.length <= 1 && (
              <div className="px-4 py-3 border-t border-outline-variant flex-shrink-0 bg-white">
                <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-wider mb-2">
                  Câu hỏi thường gặp
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_QUESTIONS.map(q => (
                    <button key={q} onClick={() => sendMessage(q)}
                      className="text-[10px] font-bold px-3 py-1.5 bg-surface-container hover:bg-primary/10 hover:text-primary text-on-surface-variant rounded-full border border-outline-variant transition-colors">
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <form
              onSubmit={e => { e.preventDefault(); sendMessage(input); }}
              className="flex items-center gap-2 px-4 py-3 border-t border-outline-variant flex-shrink-0 bg-white"
            >
              <input
                ref={inputRef}
                type="text"
                placeholder="Nhập câu hỏi về thú cưng..."
                value={input}
                onChange={e => setInput(e.target.value)}
                disabled={thinking}
                className="flex-1 bg-surface-container-low rounded-2xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 border border-outline-variant disabled:opacity-50"
              />
              <button type="submit" disabled={!input.trim() || thinking}
                className="w-10 h-10 bg-primary text-on-primary rounded-xl flex items-center justify-center disabled:opacity-40 flex-shrink-0 hover:scale-105 active:scale-95 transition-all">
                {thinking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
