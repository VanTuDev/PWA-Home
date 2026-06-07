import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Loader2, PawPrint, Sparkles, ChevronDown, MessageCircle, Bot } from 'lucide-react';
import { ask, hasApiKey } from '../lib/gemini';
import { connectSocket, getSocket } from '../lib/socket';
import { useAuth } from '../context/AuthContext';

interface Message {
  role: 'user' | 'bot' | 'admin';
  content: string;
  loading?: boolean;
  senderName?: string;
}

const QUICK_QUESTIONS = [
  'Tôi nên nhận nuôi thú cưng nào?',
  'Chi phí nuôi hàng tháng là bao nhiêu?',
  'Lịch tiêm phòng cho chó mèo?',
  'Chế độ ăn cho chó con mèo con?',
];

const SYSTEM_CONTEXT = `Bạn là chuyên gia tư vấn thú cưng của PAW Home — nền tảng cứu hộ và nhận nuôi thú cưng tại Đà Nẵng, Việt Nam.
Nhiệm vụ: Trả lời các câu hỏi về chăm sóc, sức khỏe, nuôi dưỡng, hành vi thú cưng. Phong cách: Thân thiện, ngắn gọn. Dùng tiếng Việt.`;

type Tab = 'ai' | 'admin';

export const AIChatBot: React.FC = () => {
  const { user, token }     = useAuth();
  const [open, setOpen]     = useState(false);
  const [tab, setTab]       = useState<Tab>('ai');

  const [aiMessages, setAiMessages]   = useState<Message[]>([]);
  const [input, setInput]             = useState('');
  const [thinking, setThinking]       = useState(false);

  const [adminMessages, setAdminMessages] = useState<Message[]>([]);
  const [adminInput, setAdminInput]       = useState('');
  const [unreadAdmin, setUnreadAdmin]     = useState(0);

  const bottomRef      = useRef<HTMLDivElement>(null);
  const adminBottomRef = useRef<HTMLDivElement>(null);
  const inputRef       = useRef<HTMLInputElement>(null);
  const adminInputRef  = useRef<HTMLInputElement>(null);
  const historyLoaded  = useRef(false);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [aiMessages]);
  useEffect(() => { adminBottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [adminMessages]);

  // AI greeting
  useEffect(() => {
    if (open && aiMessages.length === 0) {
      setAiMessages([{ role: 'bot', content: 'Xin chào! Tôi là trợ lý AI của PAW Home 🐾\nBạn cần tư vấn gì về thú cưng hôm nay?' }]);
    }
    if (open && tab === 'ai') setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  useEffect(() => {
    if (open && tab === 'admin') setTimeout(() => adminInputRef.current?.focus(), 100);
  }, [tab, open]);

  // Socket: connect khi mở chat, join room
  const setupSocket = useCallback(() => {
    if (!user) return;
    const socket = connectSocket();
    socket.emit('join_user_chat', { userId: user.id });

    const onMsg = (msg: any) => {
      if (msg.isFromAdmin) {
        setAdminMessages(prev => [...prev, {
          role: 'admin', content: msg.content, senderName: msg.adminName || 'Admin PAW',
        }]);
        setUnreadAdmin(n => n + 1);
      }
    };

    socket.off('new_message').on('new_message', onMsg);
    return () => { socket.off('new_message', onMsg); };
  }, [user]);

  useEffect(() => {
    if (!open) return;
    return setupSocket();
  }, [open, setupSocket]);

  // Load history khi mở tab admin lần đầu
  useEffect(() => {
    if (tab !== 'admin' || !open || !user || !token || historyLoaded.current) return;
    historyLoaded.current = true;
    setUnreadAdmin(0);

    fetch(`/api/chat/${user.id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : [])
      .then((msgs: any[]) => {
        setAdminMessages(msgs.map(m => ({
          role:       m.isFromAdmin ? 'admin' as const : 'user' as const,
          content:    m.content,
          senderName: m.isFromAdmin ? 'Admin PAW' : user.name,
        })));
      })
      .catch(() => {});
  }, [tab, open, user, token]);

  // AI send
  const sendAI = async (text: string) => {
    if (!text.trim() || thinking) return;
    setAiMessages(m => [...m, { role: 'user', content: text.trim() }, { role: 'bot', content: '', loading: true }]);
    setInput('');
    setThinking(true);
    try {
      if (!hasApiKey()) throw new Error('no_key');
      const history = aiMessages.filter(m => !m.loading).slice(-6)
        .map(m => `${m.role === 'user' ? 'Người dùng' : 'Trợ lý'}: ${m.content}`).join('\n');
      const reply = await ask(`${SYSTEM_CONTEXT}\n\n${history ? `Lịch sử:\n${history}\n` : ''}Người dùng: ${text.trim()}\nTrợ lý:`);
      setAiMessages(m => m.slice(0, -1).concat([{ role: 'bot', content: reply }]));
    } catch (err: any) {
      const msg = err.message === 'no_key'
        ? 'Tính năng AI chưa được kích hoạt 🐾'
        : 'Xin lỗi, tôi đang gặp sự cố. Thử lại sau nhé! 🙏';
      setAiMessages(m => m.slice(0, -1).concat([{ role: 'bot', content: msg }]));
    } finally {
      setThinking(false);
    }
  };

  // Admin send
  const sendAdmin = (text: string) => {
    if (!text.trim() || !user) return;
    getSocket().emit('user_message', { content: text.trim() });
    setAdminMessages(prev => [...prev, { role: 'user', content: text.trim() }]);
    setAdminInput('');
  };

  return (
    <>
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-primary text-on-primary rounded-full shadow-2xl shadow-primary/40 flex items-center justify-center hover:scale-110 active:scale-95 transition-transform"
          >
            <PawPrint className="w-7 h-7" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse" />
            {unreadAdmin > 0 && (
              <span className="absolute -top-2 -left-2 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center">{unreadAdmin}</span>
            )}
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="fixed bottom-6 right-6 z-50 w-[360px] bg-white rounded-[28px] shadow-2xl border border-outline-variant flex flex-col overflow-hidden"
            style={{ height: 'min(560px, calc(100vh - 48px))' }}
          >
            {/* Header */}
            <div className="bg-primary px-4 py-3 flex items-center justify-between flex-shrink-0">
              <div className="flex gap-1">
                <button onClick={() => setTab('ai')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all ${tab === 'ai' ? 'bg-on-primary/20 text-on-primary' : 'text-on-primary/50 hover:text-on-primary/80'}`}>
                  <Bot className="w-3.5 h-3.5" /> Trợ lý AI
                </button>
                <button onClick={() => { setTab('admin'); setUnreadAdmin(0); }}
                  className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all ${tab === 'admin' ? 'bg-on-primary/20 text-on-primary' : 'text-on-primary/50 hover:text-on-primary/80'}`}>
                  <MessageCircle className="w-3.5 h-3.5" /> Chat Admin
                  {unreadAdmin > 0 && tab !== 'admin' && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center">{unreadAdmin}</span>
                  )}
                </button>
              </div>
              <button onClick={() => setOpen(false)} className="p-1.5 hover:bg-on-primary/20 rounded-xl transition-colors text-on-primary">
                <ChevronDown className="w-5 h-5" />
              </button>
            </div>

            {/* AI Tab */}
            {tab === 'ai' && (
              <>
                <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-surface-container-lowest">
                  {aiMessages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      {msg.role === 'bot' && (
                        <div className="w-7 h-7 rounded-xl bg-primary flex items-center justify-center flex-shrink-0 mr-2 self-end">
                          <Sparkles className="w-3.5 h-3.5 text-on-primary" />
                        </div>
                      )}
                      <div className={`max-w-[78%] px-3.5 py-2.5 rounded-[16px] text-sm leading-relaxed ${
                        msg.role === 'user' ? 'bg-primary text-on-primary rounded-br-sm' : 'bg-white border border-outline-variant text-on-surface rounded-bl-sm shadow-sm'
                      }`}>
                        {msg.loading ? (
                          <div className="flex items-center gap-2 text-on-surface-variant">
                            <Loader2 className="w-3.5 h-3.5 animate-spin" /><span className="text-xs">Đang suy nghĩ...</span>
                          </div>
                        ) : <p className="whitespace-pre-wrap">{msg.content}</p>}
                      </div>
                    </div>
                  ))}
                  <div ref={bottomRef} />
                </div>

                {aiMessages.length <= 1 && (
                  <div className="px-3 py-2 border-t border-outline-variant flex-shrink-0 bg-white">
                    <div className="flex flex-wrap gap-1">
                      {QUICK_QUESTIONS.map(q => (
                        <button key={q} onClick={() => sendAI(q)}
                          className="text-[10px] font-bold px-2.5 py-1 bg-surface-container hover:bg-primary/10 hover:text-primary text-on-surface-variant rounded-full border border-outline-variant transition-colors">
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <form onSubmit={e => { e.preventDefault(); sendAI(input); }}
                  className="flex gap-2 px-3 py-3 border-t border-outline-variant flex-shrink-0 bg-white">
                  <input ref={inputRef} type="text" placeholder="Hỏi về thú cưng..."
                    value={input} onChange={e => setInput(e.target.value)} disabled={thinking}
                    className="flex-1 bg-surface-container-low rounded-2xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 border border-outline-variant disabled:opacity-50" />
                  <button type="submit" disabled={!input.trim() || thinking}
                    className="w-9 h-9 bg-primary text-on-primary rounded-xl flex items-center justify-center disabled:opacity-40 hover:scale-105 active:scale-95 transition-all flex-shrink-0">
                    {thinking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </button>
                </form>
              </>
            )}

            {/* Admin Chat Tab */}
            {tab === 'admin' && (
              <>
                <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-surface-container-lowest">
                  {adminMessages.length === 0 && (
                    <div className="text-center py-10 text-on-surface-variant">
                      <MessageCircle className="w-10 h-10 mx-auto mb-3 opacity-30" />
                      <p className="text-sm font-bold">Chat với nhân viên PAW Home</p>
                      <p className="text-xs mt-1 opacity-60">Gửi tin nhắn để được hỗ trợ trực tiếp</p>
                    </div>
                  )}
                  {adminMessages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      {msg.role === 'admin' && (
                        <div className="w-7 h-7 rounded-xl bg-green-500 flex items-center justify-center flex-shrink-0 mr-2 self-end text-white text-[10px] font-black">A</div>
                      )}
                      <div className={`max-w-[78%] px-3.5 py-2.5 rounded-[16px] text-sm leading-relaxed ${
                        msg.role === 'user' ? 'bg-primary text-on-primary rounded-br-sm' : 'bg-white border border-green-100 text-on-surface rounded-bl-sm shadow-sm'
                      }`}>
                        {msg.role === 'admin' && <p className="text-[10px] font-black text-green-600 mb-0.5">{msg.senderName}</p>}
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      </div>
                    </div>
                  ))}
                  <div ref={adminBottomRef} />
                </div>

                {!user && (
                  <div className="px-4 py-2 bg-amber-50 text-amber-700 text-xs font-bold text-center border-t border-outline-variant">
                    Vui lòng đăng nhập để chat với admin
                  </div>
                )}

                <form onSubmit={e => { e.preventDefault(); sendAdmin(adminInput); }}
                  className="flex gap-2 px-3 py-3 border-t border-outline-variant flex-shrink-0 bg-white">
                  <input ref={adminInputRef} type="text" placeholder="Nhắn tin cho admin..."
                    value={adminInput} onChange={e => setAdminInput(e.target.value)} disabled={!user}
                    className="flex-1 bg-surface-container-low rounded-2xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 border border-outline-variant disabled:opacity-50" />
                  <button type="submit" disabled={!adminInput.trim() || !user}
                    className="w-9 h-9 bg-green-500 text-white rounded-xl flex items-center justify-center disabled:opacity-40 hover:scale-105 active:scale-95 transition-all flex-shrink-0">
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
