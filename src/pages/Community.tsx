import React from 'react';
import { motion } from 'motion/react';
import { 
  MessageSquare, 
  Heart, 
  Share2, 
  Bookmark, 
  MoreHorizontal, 
  TrendingUp, 
  Trophy, 
  Compass, 
  BookOpen, 
  Users,
  Image as ImageIcon,
  Send,
  CheckCircle,
  Brain
} from 'lucide-react';
import { POSTS } from '../constants';

export const Community: React.FC = () => {
  return (
    <div className="min-h-screen bg-surface-container-low">
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar */}
          <aside className="hidden lg:block space-y-4">
            <div className="bg-white rounded-[32px] border border-outline-variant p-6 shadow-sm overflow-hidden relative group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12 group-hover:scale-125 transition-transform duration-700"></div>
              <div className="relative z-10">
                <nav className="space-y-1">
                  {[
                    { label: 'Khám phá', icon: Compass, active: true },
                    { label: 'Đang theo dõi', icon: Users },
                    { label: 'Hot Topics', icon: TrendingUp },
                    { label: 'Cẩm nang', icon: BookOpen },
                    { label: 'Thủ lĩnh PAW', icon: Trophy },
                  ].map((item) => (
                    <button 
                      key={item.label}
                      className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
                        item.active ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:bg-surface-container'
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      {item.label}
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            <div className="bg-primary-fixed p-6 rounded-[32px] border border-primary-container/20">
              <h4 className="font-bold text-primary mb-2 flex items-center gap-2">
                <Brain className="w-5 h-5" />
                Hỏi AI Chuyên Gia
              </h4>
              <p className="text-xs text-on-primary-fixed/80 mb-4 leading-relaxed">Nhận lời khuyên từ trí tuệ nhân tạo được huấn luyện bởi các BSTY hàng đầu.</p>
              <button className="w-full bg-primary text-on-primary py-2 rounded-xl text-xs font-bold shadow-lg shadow-primary/20">Trò chuyện ngay</button>
            </div>
          </aside>

          {/* Main Feed */}
          <main className="lg:col-span-2 space-y-6">
            {/* Create Post */}
            <div className="bg-white rounded-[32px] border border-outline-variant p-6 shadow-sm">
              <div className="flex gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-primary/10 overflow-hidden flex-shrink-0">
                  <img src="https://i.pravatar.cc/100?u=me" alt="Me" />
                </div>
                <button className="flex-1 bg-surface-container-low text-on-surface-variant px-6 py-3 rounded-2xl text-left hover:bg-surface-container transition-colors text-sm font-medium">
                  Hôm nay bé cưng của bạn thế nào?
                </button>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-outline-variant">
                <div className="flex gap-2">
                  <button className="flex items-center gap-2 px-4 py-2 hover:bg-surface-container rounded-xl transition-colors text-xs font-bold text-on-surface-variant">
                    <ImageIcon className="w-4 h-4 text-primary" />
                    Hình ảnh
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 hover:bg-surface-container rounded-xl transition-colors text-xs font-bold text-on-surface-variant">
                    <MessageSquare className="w-4 h-4 text-secondary" />
                    Thảo luận
                  </button>
                </div>
                <button className="bg-primary text-on-primary p-3 rounded-xl hover:bg-primary-container transition-all">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Posts List */}
            {POSTS.map((post) => (
              <motion.div 
                key={post.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-[40px] border border-outline-variant shadow-sm overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex gap-3">
                      <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-md">
                        <img src={post.author.avatar} alt={post.author.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1">
                          <h4 className="font-bold text-on-surface">{post.author.name}</h4>
                          {post.author.isExpert && <CheckCircle className="w-4 h-4 text-primary fill-current" />}
                        </div>
                        <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">{post.time}</p>
                      </div>
                    </div>
                    <button className="p-2 text-on-surface-variant hover:bg-surface-container rounded-xl"><MoreHorizontal className="w-5 h-5" /></button>
                  </div>
                  
                  <p className="text-on-surface text-sm leading-relaxed mb-6 px-2">{post.content}</p>
                  
                  {post.image && (
                    <div className="rounded-[32px] overflow-hidden mb-6 border border-outline-variant">
                      <img src={post.image} className="w-full h-auto" alt="Post" />
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-6 border-t border-outline-variant">
                    <div className="flex gap-4">
                      <button className="flex items-center gap-2 text-sm font-bold text-on-surface-variant hover:text-error transition-colors px-4 py-2 rounded-xl hover:bg-error/5 group">
                        <Heart className="w-5 h-5 group-hover:fill-current" />
                        {post.likes}
                      </button>
                      <button className="flex items-center gap-2 text-sm font-bold text-on-surface-variant hover:text-primary transition-colors px-4 py-2 rounded-xl hover:bg-primary/5">
                        <MessageSquare className="w-5 h-5" />
                        {post.comments}
                      </button>
                    </div>
                    <div className="flex gap-2">
                       <button className="p-2 text-on-surface-variant hover:bg-surface-container rounded-xl"><Share2 className="w-5 h-5" /></button>
                       <button className="p-2 text-on-surface-variant hover:bg-surface-container rounded-xl"><Bookmark className="w-5 h-5" /></button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </main>

          {/* Right Sidebar */}
          <aside className="hidden lg:block space-y-8">
            <div className="bg-white rounded-[32px] border border-outline-variant p-6 shadow-sm">
              <h3 className="font-bold text-on-surface mb-6 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Chủ đề đang hot
              </h3>
              <div className="space-y-6">
                {[
                  { tag: '#ReviewHạtMới', count: '1.2k posts' },
                  { tag: '#CứuHộBắcGiang', count: '850 posts' },
                  { tag: '#MẹoDạyChóCon', count: '640 posts' },
                  { tag: '#VaccineNhắcLại', count: '420 posts' }
                ].map((topic) => (
                  <div key={topic.tag} className="flex justify-between items-center group cursor-pointer">
                    <div>
                      <p className="text-sm font-bold text-on-surface group-hover:text-primary transition-colors">{topic.tag}</p>
                      <p className="text-[10px] text-on-surface-variant uppercase font-bold">{topic.count}</p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                       <Compass className="w-4 h-4 text-primary" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-tertiary-fixed rounded-[32px] p-6 border border-outline-variant">
              <div className="flex justify-between items-start mb-6">
                 <div>
                    <h4 className="font-bold text-on-tertiary-fixed mb-1">Thống kê PAW</h4>
                    <p className="text-[10px] text-on-tertiary-fixed/60 uppercase font-bold tracking-widest">Live Updates</p>
                 </div>
                 <div className="w-3 h-3 bg-status-ready rounded-full animate-pulse"></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/40 backdrop-blur-md p-4 rounded-2xl">
                  <p className="text-2xl font-bold text-on-tertiary-fixed">12k+</p>
                  <p className="text-[10px] font-bold text-on-tertiary-fixed/60 uppercase">Thành viên</p>
                </div>
                <div className="bg-white/40 backdrop-blur-md p-4 rounded-2xl">
                  <p className="text-2xl font-bold text-on-tertiary-fixed">450</p>
                  <p className="text-[10px] font-bold text-on-tertiary-fixed/60 uppercase">Câu chuyện</p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};
