import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, Loader2, RefreshCw, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { connectSocket } from '../../lib/socket';

const BE_URL = (import.meta as any).env?.DEV ? 'http://localhost:5000' : 'https://pwa-home-be.onrender.com';
const imgSrc = (img?: string) => {
  if (!img) return '';
  if (img.startsWith('http')) return img;
  const path = img.startsWith('/') ? img : `/${img}`;
  return `${BE_URL}${path}`;
};

interface Room {
  userId:   string;
  user:     { name: string; email: string; avatar?: string };
  lastMessage:   string;
  lastAt:        string;
  lastFromAdmin: boolean;
  unread:        number;
}

interface Msg {
  id?: string;
  content:     string;
  isFromAdmin: boolean;
  adminName?:  string;
  createdAt?:  string;
}

export const ChatTab: React.FC = () => {
  const { user, token } = useAuth();
  const [rooms,     setRooms]     = useState<Room[]>([]);
  const [selected,  setSelected]  = useState<Room | null>(null);
  const [messages,  setMessages]  = useState<Msg[]>([]);
  const [input,     setInput]     = useState('');
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [loadingMsgs,  setLoadingMsgs]  = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const loadRooms = async () => {
    setLoadingRooms(true);
    try {
      const res = await fetch('/api/chat/rooms', { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setRooms(await res.json());
    } finally { setLoadingRooms(false); }
  };

  useEffect(() => { loadRooms(); }, []);

  // Socket: join admin room
  useEffect(() => {
    if (!user) return;
    const socket = connectSocket();
    socket.emit('join_admin');

    const onUserMsg = ({ userId }: any) => {
      // Cập nhật unread count cho room
      setRooms(prev => prev.map(r => r.userId === userId ? { ...r, unread: r.unread + 1 } : r));
      // Nếu đang xem room này thì append tin nhắn
      setSelected(sel => {
        if (sel?.userId === userId) {
          // Reload messages của room này
          fetch(`/api/chat/${userId}`, { headers: { Authorization: `Bearer ${token}` } })
            .then(r => r.ok ? r.json() : [])
            .then((msgs: Msg[]) => setMessages(msgs));
        }
        return sel;
      });
    };

    // Nhận tin nhắn mới trong phòng đang mở
    const onNewMsg = (msg: Msg) => {
      setMessages(prev => [...prev, msg]);
    };

    socket.off('user_new_message').on('user_new_message', onUserMsg);
    socket.off('new_message').on('new_message', onNewMsg);

    return () => {
      socket.off('user_new_message', onUserMsg);
      socket.off('new_message', onNewMsg);
    };
  }, [user, token]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const openRoom = async (room: Room) => {
    setSelected(room);
    setLoadingMsgs(true);
    setMessages([]);

    // Join room qua socket
    const socket = connectSocket();
    socket.emit('admin_open_chat', { userId: room.userId });

    // Load messages
    try {
      const res = await fetch(`/api/chat/${room.userId}`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setMessages(await res.json());
    } finally { setLoadingMsgs(false); }

    // Mark read
    fetch(`/api/chat/${room.userId}/read`, { method: 'PUT', headers: { Authorization: `Bearer ${token}` } });
    setRooms(prev => prev.map(r => r.userId === room.userId ? { ...r, unread: 0 } : r));
  };

  const sendReply = () => {
    if (!input.trim() || !selected || !user) return;
    const socket = connectSocket();
    socket.emit('admin_message', {
      userId:    selected.userId,
      content:   input.trim(),
      adminId:   user.id,
      adminName: user.name,
    });
    setMessages(prev => [...prev, { content: input.trim(), isFromAdmin: true, adminName: user.name }]);
    setInput('');
  };

  const totalUnread = rooms.reduce((s, r) => s + r.unread, 0);

  return (
    <div className="flex h-[calc(100vh-160px)] bg-white rounded-[32px] border border-outline-variant overflow-hidden shadow-sm">
      {/* Sidebar rooms */}
      <div className="w-72 border-r border-outline-variant flex flex-col flex-shrink-0">
        <div className="p-5 border-b border-outline-variant flex items-center justify-between">
          <div>
            <h2 className="font-black text-on-surface">Chat hỗ trợ</h2>
            {totalUnread > 0 && (
              <p className="text-xs text-primary font-bold mt-0.5">{totalUnread} tin chưa đọc</p>
            )}
          </div>
          <button onClick={loadRooms} className="p-2 hover:bg-surface-container rounded-xl transition-colors">
            <RefreshCw className="w-4 h-4 text-on-surface-variant" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loadingRooms ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : rooms.length === 0 ? (
            <div className="text-center py-12 text-on-surface-variant">
              <MessageCircle className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm font-bold">Chưa có tin nhắn</p>
            </div>
          ) : (
            rooms.map(room => (
              <button key={room.userId} onClick={() => openRoom(room)}
                className={`w-full px-4 py-3.5 flex items-center gap-3 hover:bg-surface-container-low transition-colors text-left border-b border-outline-variant/30 ${selected?.userId === room.userId ? 'bg-primary/5' : ''}`}>
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black flex-shrink-0">
                  {room.user?.avatar
                    ? <img src={imgSrc(room.user.avatar)} alt="" className="w-full h-full rounded-full object-cover" />
                    : <User className="w-5 h-5" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-sm text-on-surface truncate">{room.user?.name || 'Người dùng'}</p>
                    {room.unread > 0 && (
                      <span className="w-5 h-5 bg-primary text-on-primary text-[10px] font-black rounded-full flex items-center justify-center flex-shrink-0 ml-1">{room.unread}</span>
                    )}
                  </div>
                  <p className="text-xs text-on-surface-variant truncate mt-0.5">
                    {room.lastFromAdmin ? '← ' : ''}{room.lastMessage}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col">
        {!selected ? (
          <div className="flex-1 flex items-center justify-center text-on-surface-variant">
            <div className="text-center">
              <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <p className="font-bold text-lg">Chọn cuộc trò chuyện</p>
              <p className="text-sm opacity-60 mt-1">Chọn một khách hàng từ danh sách bên trái</p>
            </div>
          </div>
        ) : (
          <>
            {/* Chat header */}
            <div className="px-6 py-4 border-b border-outline-variant flex items-center gap-3 flex-shrink-0">
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-bold text-sm text-on-surface">{selected.user?.name}</p>
                <p className="text-xs text-on-surface-variant">{selected.user?.email}</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
              {loadingMsgs ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-12 text-on-surface-variant opacity-50">
                  <p className="text-sm">Chưa có tin nhắn</p>
                </div>
              ) : (
                messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.isFromAdmin ? 'justify-end' : 'justify-start'}`}>
                    {!msg.isFromAdmin && (
                      <div className="w-7 h-7 rounded-xl bg-surface-container flex items-center justify-center flex-shrink-0 mr-2 self-end">
                        <User className="w-4 h-4 text-on-surface-variant" />
                      </div>
                    )}
                    <div className={`max-w-[70%] px-4 py-2.5 rounded-[16px] text-sm leading-relaxed ${
                      msg.isFromAdmin
                        ? 'bg-primary text-on-primary rounded-br-sm'
                        : 'bg-surface-container-low border border-outline-variant text-on-surface rounded-bl-sm'
                    }`}>
                      {msg.isFromAdmin && <p className="text-[10px] font-black text-on-primary/70 mb-0.5">{msg.adminName}</p>}
                      <p>{msg.content}</p>
                    </div>
                  </div>
                ))
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="px-6 py-4 border-t border-outline-variant flex gap-3 flex-shrink-0">
              <input
                type="text"
                placeholder={`Trả lời ${selected.user?.name}...`}
                value={input} onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendReply())}
                className="flex-1 bg-surface-container-low rounded-2xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 border border-outline-variant"
              />
              <button onClick={sendReply} disabled={!input.trim()}
                className="px-5 py-2.5 bg-primary text-on-primary rounded-2xl font-bold text-sm flex items-center gap-2 disabled:opacity-40 hover:scale-[1.02] transition-all">
                <Send className="w-4 h-4" /> Gửi
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
