import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Heart, MessageSquare, Share2, Bookmark, MoreHorizontal,
  Send, Image as ImageIcon, X, Edit2, Trash2, CheckCircle,
  TrendingUp, Loader2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

// ─── Types ───────────────────────────────────────────────────────────────────
interface Comment {
  _id: string;
  userId: string;
  authorName: string;
  content: string;
  createdAt: string;
}

interface Post {
  _id: string;
  userId: string;
  authorName: string;
  authorAvatar: string;
  authorIsExpert: boolean;
  content: string;
  image?: string;
  likeCount: number;
  commentCount: number;
  shares: number;
  commentList: Comment[];
  isLiked: boolean;
  isSaved: boolean;
  isOwner: boolean;
  createdAt: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
const BE_URL = (import.meta as any).env?.DEV ? 'http://localhost:5000' : 'https://pwa-home-be.onrender.com';
const imgSrc = (img: string) => {
  if (!img) return '';
  if (img.startsWith('http')) return img;
  const path = img.startsWith('/') ? img : `/${img}`;
  return `${BE_URL}${path}`;
};

const timeAgo = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)   return 'Vừa xong';
  if (m < 60)  return `${m} phút trước`;
  const h = Math.floor(m / 60);
  if (h < 24)  return `${h} giờ trước`;
  const d = Math.floor(h / 24);
  if (d < 7)   return `${d} ngày trước`;
  return new Date(iso).toLocaleDateString('vi-VN');
};

const authHeader = (token: string | null) =>
  token ? { Authorization: `Bearer ${token}` } : {};

// ─── PostCard ─────────────────────────────────────────────────────────────────
const PostCard: React.FC<{
  post: Post;
  token: string | null;
  onUpdated: (updated: Post) => void;
  onDeleted: (id: string) => void;
}> = ({ post, token, onUpdated, onDeleted }) => {
  const [showComments, setShowComments]   = useState(false);
  const [commentInput, setCommentInput]   = useState('');
  const [sendingComment, setSending]      = useState(false);
  const [showMenu, setShowMenu]           = useState(false);
  const [editMode, setEditMode]           = useState(false);
  const [editContent, setEditContent]     = useState(post.content);
  const [editImage, setEditImage]         = useState(post.image || '');
  const [editFile, setEditFile]           = useState<File | null>(null);
  const [saving, setSaving]               = useState(false);
  const fileEditRef                       = useRef<HTMLInputElement>(null);

  const like = async () => {
    if (!token) return;
    const res  = await fetch(`/api/posts/${post._id}/like`, { method: 'PUT', headers: authHeader(token) });
    if (res.ok) {
      const d = await res.json();
      onUpdated({ ...post, likeCount: d.likeCount, isLiked: d.isLiked });
    }
  };

  const share = async () => {
    await fetch(`/api/posts/${post._id}/share`, { method: 'PUT' });
    onUpdated({ ...post, shares: post.shares + 1 });
  };

  const save = async () => {
    if (!token) return;
    const res = await fetch(`/api/posts/${post._id}/save`, { method: 'PUT', headers: authHeader(token) });
    if (res.ok) {
      const d = await res.json();
      onUpdated({ ...post, isSaved: d.isSaved });
    }
  };

  const submitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim() || !token) return;
    setSending(true);
    const res  = await fetch(`/api/posts/${post._id}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeader(token) },
      body: JSON.stringify({ content: commentInput })
    });
    if (res.ok) {
      const d = await res.json();
      onUpdated({ ...post, commentList: [...post.commentList, d.comment], commentCount: d.commentCount });
      setCommentInput('');
    }
    setSending(false);
  };

  const deleteComment = async (commentId: string) => {
    const res = await fetch(`/api/posts/${post._id}/comments/${commentId}`, {
      method: 'DELETE', headers: authHeader(token)
    });
    if (res.ok) {
      const d = await res.json();
      onUpdated({ ...post, commentList: post.commentList.filter(c => c._id !== commentId), commentCount: d.commentCount });
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Xóa bài viết này?')) return;
    const res = await fetch(`/api/posts/${post._id}`, { method: 'DELETE', headers: authHeader(token) });
    if (res.ok) onDeleted(post._id);
  };

  const handleEdit = async () => {
    setSaving(true);
    const fd = new FormData();
    fd.append('content', editContent);
    if (editFile) fd.append('image', editFile);
    else fd.append('image', editImage);
    const res = await fetch(`/api/posts/${post._id}`, {
      method: 'PUT',
      headers: authHeader(token),
      body: fd
    });
    if (res.ok) {
      const updated = await res.json();
      onUpdated(updated);
      setEditMode(false);
    }
    setSaving(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className="bg-white rounded-[32px] border border-outline-variant shadow-sm overflow-hidden"
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl overflow-hidden bg-primary/10 flex-shrink-0">
              <img
                src={imgSrc(post.authorAvatar) || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(post.authorName)}`}
                alt={post.authorName}
                className="w-full h-full object-cover"
                onError={e => { (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(post.authorName)}`; }}
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-on-surface text-sm">{post.authorName}</span>
                {post.authorIsExpert && <CheckCircle className="w-4 h-4 text-primary fill-current" />}
              </div>
              <p className="text-[10px] text-on-surface-variant font-medium">{timeAgo(post.createdAt)}</p>
            </div>
          </div>

          {/* Menu chủ bài */}
          {post.isOwner && (
            <div className="relative">
              <button onClick={() => setShowMenu(!showMenu)}
                className="p-2 text-on-surface-variant hover:bg-surface-container rounded-xl transition-colors">
                <MoreHorizontal className="w-5 h-5" />
              </button>
              {showMenu && (
                <div className="absolute right-0 top-10 bg-white border border-outline-variant rounded-2xl shadow-xl z-20 overflow-hidden w-40">
                  <button
                    onClick={() => { setEditMode(true); setShowMenu(false); setEditContent(post.content); setEditImage(post.image || ''); }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-on-surface hover:bg-surface-container transition-colors">
                    <Edit2 className="w-4 h-4" /> Chỉnh sửa
                  </button>
                  <button onClick={handleDelete}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors">
                    <Trash2 className="w-4 h-4" /> Xóa bài
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Edit mode */}
        {editMode ? (
          <div className="space-y-3 mb-4">
            <textarea
              className="w-full border border-outline-variant rounded-2xl px-4 py-3 text-sm resize-none outline-none focus:ring-2 focus:ring-primary/20"
              rows={4}
              value={editContent}
              onChange={e => setEditContent(e.target.value)}
            />
            {(editImage || editFile) && (
              <div className="relative inline-block">
                <img
                  src={editFile ? URL.createObjectURL(editFile) : imgSrc(editImage)}
                  className="h-24 rounded-xl object-cover"
                  alt="preview"
                />
                <button onClick={() => { setEditImage(''); setEditFile(null); }}
                  className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs">
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
            <div className="flex gap-2">
              <button onClick={() => fileEditRef.current?.click()}
                className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-on-surface-variant border border-outline-variant rounded-xl hover:bg-surface-container transition-colors">
                <ImageIcon className="w-4 h-4" /> Thay ảnh
              </button>
              <input ref={fileEditRef} type="file" accept="image/*" className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) { setEditFile(f); setEditImage(''); } }} />
              <button onClick={handleEdit} disabled={saving}
                className="flex items-center gap-2 px-4 py-2 text-xs font-bold bg-primary text-on-primary rounded-xl disabled:opacity-50">
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Lưu'}
              </button>
              <button onClick={() => setEditMode(false)}
                className="px-3 py-2 text-xs font-bold text-on-surface-variant hover:bg-surface-container rounded-xl transition-colors">
                Huỷ
              </button>
            </div>
          </div>
        ) : (
          <>
            <p className="text-on-surface text-sm leading-relaxed mb-4 whitespace-pre-wrap">{post.content}</p>
            {post.image && (
              <div className="rounded-[24px] overflow-hidden mb-4 border border-outline-variant">
                <img src={imgSrc(post.image)} className="w-full h-auto max-h-[400px] object-cover" alt="Post" />
              </div>
            )}
          </>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-outline-variant">
          <div className="flex gap-1">
            <button onClick={like}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold transition-all ${
                post.isLiked ? 'text-red-500 bg-red-50' : 'text-on-surface-variant hover:bg-surface-container hover:text-red-500'
              }`}>
              <Heart className={`w-4 h-4 ${post.isLiked ? 'fill-current' : ''}`} />
              {post.likeCount > 0 && <span>{post.likeCount}</span>}
            </button>
            <button onClick={() => setShowComments(!showComments)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold transition-all ${
                showComments ? 'text-primary bg-primary/5' : 'text-on-surface-variant hover:bg-surface-container hover:text-primary'
              }`}>
              <MessageSquare className="w-4 h-4" />
              {post.commentCount > 0 && <span>{post.commentCount}</span>}
            </button>
            <button onClick={share}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold text-on-surface-variant hover:bg-surface-container hover:text-primary transition-all">
              <Share2 className="w-4 h-4" />
              {post.shares > 0 && <span>{post.shares}</span>}
            </button>
          </div>
          <button onClick={save}
            className={`p-2 rounded-xl transition-all ${
              post.isSaved ? 'text-primary bg-primary/10' : 'text-on-surface-variant hover:bg-surface-container hover:text-primary'
            }`}>
            <Bookmark className={`w-5 h-5 ${post.isSaved ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Comments section */}
        <AnimatePresence>
          {showComments && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="pt-4 space-y-3 border-t border-outline-variant mt-4">
                {post.commentList.length === 0 && (
                  <p className="text-xs text-on-surface-variant text-center py-2">Chưa có bình luận nào</p>
                )}
                {post.commentList.map(c => (
                  <div key={c._id} className="flex gap-3 group">
                    <div className="w-8 h-8 rounded-xl bg-primary/10 flex-shrink-0 overflow-hidden">
                      <img
                        src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(c.authorName)}`}
                        alt={c.authorName} className="w-full h-full"
                      />
                    </div>
                    <div className="flex-1 bg-surface-container-low rounded-2xl px-4 py-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-on-surface">{c.authorName}</span>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-[10px] text-on-surface-variant">{timeAgo(c.createdAt)}</span>
                          {(c.userId === post.userId || post.isOwner) && (
                            <button onClick={() => deleteComment(c._id)}
                              className="text-red-400 hover:text-red-600 p-0.5">
                              <X className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-on-surface mt-0.5 leading-relaxed">{c.content}</p>
                    </div>
                  </div>
                ))}

                {/* Add comment */}
                {token && (
                  <form onSubmit={submitComment} className="flex gap-2 pt-1">
                    <input
                      className="flex-1 bg-surface-container-low rounded-2xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 border border-outline-variant"
                      placeholder="Viết bình luận..."
                      value={commentInput}
                      onChange={e => setCommentInput(e.target.value)}
                    />
                    <button type="submit" disabled={!commentInput.trim() || sendingComment}
                      className="w-10 h-10 bg-primary text-on-primary rounded-xl flex items-center justify-center disabled:opacity-40 flex-shrink-0">
                      {sendingComment ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </button>
                  </form>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

// ─── Main Community Page ──────────────────────────────────────────────────────
export const Community: React.FC = () => {
  const { user, token } = useAuth();
  const navigate         = useNavigate();

  const [tab, setTab]           = useState<'all' | 'saved'>('all');
  const [posts, setPosts]       = useState<Post[]>([]);
  const [loading, setLoading]   = useState(true);
  const [content, setContent]   = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [posting, setPosting]   = useState(false);
  const [expanded, setExpanded] = useState(false);
  const fileRef                  = useRef<HTMLInputElement>(null);

  const loadPosts = async () => {
    setLoading(true);
    try {
      const params = tab === 'saved' ? '?tab=saved' : '';
      const res    = await fetch(`/api/posts${params}`, {
        headers: authHeader(token)
      });
      if (res.ok) setPosts(await res.json());
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  useEffect(() => { loadPosts(); }, [tab]);

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !imageFile) return;
    if (!token) { navigate('/login'); return; }

    setPosting(true);
    const fd = new FormData();
    fd.append('content', content);
    if (imageFile) fd.append('image', imageFile);

    const res = await fetch('/api/posts', {
      method: 'POST',
      headers: authHeader(token),
      body: fd
    });
    if (res.ok) {
      const newPost = await res.json();
      setPosts(p => [newPost, ...p]);
      setContent(''); setImageFile(null); setImagePreview(''); setExpanded(false);
    }
    setPosting(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setImageFile(f);
    setImagePreview(URL.createObjectURL(f));
  };

  return (
    <div className="min-h-screen bg-surface-container-low">
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-5">

        {/* Tabs */}
        <div className="flex gap-2 bg-white rounded-2xl border border-outline-variant p-1.5 shadow-sm">
          {[
            { key: 'all',   label: 'Tất cả bài viết' },
            { key: 'saved', label: '🔖 Đã lưu' }
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key as any)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
                tab === t.key
                  ? 'bg-primary text-on-primary shadow-md shadow-primary/20'
                  : 'text-on-surface-variant hover:bg-surface-container'
              }`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Create Post */}
        {user && tab === 'all' && (
          <div className="bg-white rounded-[32px] border border-outline-variant p-5 shadow-sm">
            <form onSubmit={handlePost}>
              <div className="flex gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 overflow-hidden flex-shrink-0">
                  <img
                    src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}`}
                    alt={user.name} className="w-full h-full"
                  />
                </div>
                <textarea
                  className="flex-1 bg-surface-container-low border border-outline-variant rounded-2xl px-4 py-3 text-sm resize-none outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  placeholder={`Hôm nay bé cưng của bạn thế nào, ${user.name.split(' ').pop()}?`}
                  rows={expanded ? 4 : 2}
                  value={content}
                  onFocus={() => setExpanded(true)}
                  onChange={e => setContent(e.target.value)}
                />
              </div>

              {imagePreview && (
                <div className="relative inline-block mb-3 ml-13">
                  <img src={imagePreview} className="h-32 rounded-2xl object-cover" alt="preview" />
                  <button type="button" onClick={() => { setImageFile(null); setImagePreview(''); }}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              <AnimatePresence>
                {expanded && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="flex items-center justify-between pt-3 border-t border-outline-variant">
                    <div className="flex gap-2">
                      <button type="button" onClick={() => fileRef.current?.click()}
                        className="flex items-center gap-2 px-3 py-2 hover:bg-surface-container rounded-xl text-xs font-bold text-on-surface-variant transition-colors">
                        <ImageIcon className="w-4 h-4 text-primary" /> Thêm ảnh
                      </button>
                      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
                    </div>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => { setExpanded(false); setContent(''); setImageFile(null); setImagePreview(''); }}
                        className="px-4 py-2 text-xs font-bold text-on-surface-variant hover:bg-surface-container rounded-xl transition-colors">
                        Huỷ
                      </button>
                      <button type="submit" disabled={posting || (!content.trim() && !imageFile)}
                        className="flex items-center gap-2 px-5 py-2 bg-primary text-on-primary rounded-xl text-xs font-bold shadow-md shadow-primary/20 disabled:opacity-40 transition-all">
                        {posting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        {posting ? 'Đang đăng...' : 'Đăng bài'}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </div>
        )}

        {/* Feed */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-[32px] border border-outline-variant p-6 animate-pulse">
                <div className="flex gap-3 mb-4">
                  <div className="w-11 h-11 bg-surface-container rounded-2xl flex-shrink-0" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-surface-container rounded-full w-1/3" />
                    <div className="h-3 bg-surface-container rounded-full w-1/4" />
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="h-4 bg-surface-container rounded-full" />
                  <div className="h-4 bg-surface-container rounded-full w-4/5" />
                </div>
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 text-on-surface-variant">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-bold">
              {tab === 'saved' ? 'Bạn chưa lưu bài viết nào' : 'Chưa có bài viết nào'}
            </p>
            {tab === 'all' && user && (
              <button onClick={() => setExpanded(true)}
                className="mt-4 text-primary text-sm font-bold hover:underline">
                Đăng bài đầu tiên →
              </button>
            )}
          </div>
        ) : (
          <AnimatePresence>
            {posts.map(post => (
              <PostCard
                key={post._id}
                post={post}
                token={token}
                onUpdated={updated => setPosts(p => p.map(x => x._id === updated._id ? updated : x))}
                onDeleted={id => setPosts(p => p.filter(x => x._id !== id))}
              />
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Trending sidebar (desktop) */}
      <div className="hidden xl:block fixed right-8 top-24 w-64 space-y-4">
        <div className="bg-white rounded-[24px] border border-outline-variant p-5 shadow-sm">
          <h3 className="font-bold text-on-surface text-sm mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" /> Chủ đề hot
          </h3>
          <div className="space-y-3">
            {['#ReviewHạtMới', '#CứuHộĐàNẵng', '#MẹoDạyChó', '#VaccineNhắcLại'].map(tag => (
              <div key={tag} className="text-sm font-bold text-on-surface-variant hover:text-primary cursor-pointer transition-colors">
                {tag}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
