import React, { useEffect, useState, useCallback } from 'react';
import { CheckCircle, Circle, PawPrint, Camera, ChevronRight, Loader2, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';

const BE_URL = (import.meta as any).env?.DEV ? 'http://localhost:5000' : 'https://pwa-home-be.onrender.com';
const imgSrc = (img?: string) => {
  if (!img) return '';
  if (img.startsWith('http')) return img;
  return `${BE_URL}${img.startsWith('/') ? img : `/${img}`}`;
};

interface Week { weekNumber: number; done: boolean; report: { image: string; comment: string; submittedAt: string } | null }
interface Task {
  adoptionId: string;
  pet: { id: string; name: string; image: string; breed: string } | null;
  status: string;
  weeks: Week[];
  currentWeek: number | null;
  completedCount: number;
}

interface Props {
  token: string | null;
  /** gọi từ ngoài để force re-fetch sau khi đăng bài */
  refreshKey?: number;
}

export const MissionPanel: React.FC<Props> = ({ token, refreshKey }) => {
  const [tasks,   setTasks]   = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!token) { setLoading(false); return; }
    setLoading(true);
    try {
      const r = await fetch('/api/adoptions/my-tasks', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (r.ok) setTasks(await r.json());
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { load(); }, [load, refreshKey]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
      </div>
    );
  }

  if (!token) {
    return (
      <div className="text-center py-10 px-4">
        <PawPrint className="w-10 h-10 mx-auto mb-2 text-on-surface-variant opacity-30" />
        <p className="text-sm text-on-surface-variant">Đăng nhập để xem nhiệm vụ.</p>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-10 px-4">
        <Trophy className="w-10 h-10 mx-auto mb-2 text-on-surface-variant opacity-30" />
        <p className="text-sm font-bold text-on-surface-variant">Chưa có nhiệm vụ</p>
        <p className="text-xs text-on-surface-variant opacity-70 mt-1">Bạn sẽ nhận nhiệm vụ sau khi nhận nuôi thành công.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      <p className="text-xs text-on-surface-variant font-bold uppercase tracking-wider px-1">
        Nhiệm vụ theo dõi — đăng bài có ảnh lên Cộng đồng để hoàn thành
      </p>

      {tasks.map(task => (
        <div key={task.adoptionId} className="bg-surface-container-low rounded-2xl border border-outline-variant overflow-hidden">
          {/* Pet header */}
          <div className="flex items-center gap-3 p-3 border-b border-outline-variant bg-white">
            {task.pet?.image ? (
              <img src={imgSrc(task.pet.image)} className="w-10 h-10 rounded-xl object-cover flex-shrink-0"
                onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} alt="" />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <PawPrint className="w-5 h-5 text-primary" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm text-on-surface truncate">
                Bé {task.pet?.name ?? 'N/A'}
              </p>
              <p className="text-xs text-on-surface-variant truncate">{task.pet?.breed ?? ''}</p>
            </div>
            <span className="text-xs font-black text-primary bg-primary/10 px-2 py-0.5 rounded-full whitespace-nowrap">
              {task.completedCount}/4 tuần
            </span>
          </div>

          {/* Week tasks */}
          <div className="p-3 space-y-2">
            {task.weeks.map(w => (
              <div key={w.weekNumber}
                className={`flex items-center gap-3 p-2.5 rounded-xl transition-colors ${
                  w.done ? 'bg-green-50' : w.weekNumber === task.currentWeek ? 'bg-amber-50 border border-amber-200' : 'opacity-50'
                }`}>
                {w.done
                  ? <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  : <Circle className={`w-5 h-5 flex-shrink-0 ${w.weekNumber === task.currentWeek ? 'text-amber-500' : 'text-outline-variant'}`} />
                }
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-bold ${w.done ? 'text-green-700' : w.weekNumber === task.currentWeek ? 'text-amber-700' : 'text-on-surface-variant'}`}>
                    Tuần {w.weekNumber} — Đăng ảnh cập nhật
                  </p>
                  {w.done && w.report && (
                    <p className="text-[10px] text-green-600 mt-0.5 truncate">
                      ✓ {new Date(w.report.submittedAt).toLocaleDateString('vi-VN')}
                      {w.report.comment && ` · "${w.report.comment.slice(0, 40)}..."`}
                    </p>
                  )}
                  {!w.done && w.weekNumber === task.currentWeek && (
                    <p className="text-[10px] text-amber-600 mt-0.5">Đang chờ — đăng bài có ảnh để hoàn thành</p>
                  )}
                </div>
                {!w.done && w.weekNumber === task.currentWeek && (
                  <Link to="/community"
                    className="flex-shrink-0 flex items-center gap-1 text-[10px] font-black text-amber-700 bg-amber-100 px-2 py-1 rounded-lg hover:bg-amber-200 transition-colors">
                    <Camera className="w-3 h-3" /> Đăng
                  </Link>
                )}
              </div>
            ))}
          </div>

          {task.completedCount === 4 && (
            <div className="mx-3 mb-3 p-3 bg-green-100 rounded-xl flex items-center gap-2">
              <Trophy className="w-5 h-5 text-green-600" />
              <p className="text-sm font-bold text-green-700">Hoàn thành! Cảm ơn bạn đã cập nhật đầy đủ 4 tuần 🎉</p>
            </div>
          )}
        </div>
      ))}

      <Link to="/community"
        className="flex items-center justify-center gap-2 w-full py-3 border-2 border-dashed border-outline-variant rounded-2xl text-sm font-bold text-on-surface-variant hover:border-primary hover:text-primary transition-all">
        <Camera className="w-4 h-4" /> Đăng bài lên Cộng đồng
        <ChevronRight className="w-4 h-4" />
      </Link>
    </div>
  );
};
