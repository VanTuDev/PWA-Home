import React, { useEffect, useState, useCallback } from 'react';
import {
  CheckCircle, Circle, PawPrint, Camera, Loader2, Trophy, ChevronRight,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const BE_URL = (import.meta as any).env?.DEV ? 'http://localhost:5000' : 'https://pwa-home-be.onrender.com';
const imgSrc = (img?: string) => {
  if (!img) return '';
  if (img.startsWith('http')) return img;
  return `${BE_URL}${img.startsWith('/') ? img : `/${img}`}`;
};

interface Week {
  weekNumber: number;
  done: boolean;
  report: { image: string; comment: string; submittedAt: string } | null;
}
interface Task {
  adoptionId: string;
  pet: { id: string; name: string; image: string; breed: string } | null;
  status: string;
  weeks: Week[];
  currentWeek: number | null;
  expectedWeek: number;
  completedCount: number;
}

interface Props {
  token: string | null;
  refreshKey?: number;
}

export const MissionPanel: React.FC<Props> = ({ token, refreshKey }) => {
  const navigate              = useNavigate();
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

  // Click vào tuần → chuyển sang trang Cộng đồng để đăng ảnh
  const goPost = (weekNumber: number, petName: string) => {
    navigate('/community', {
      state: {
        openPost:    true,
        missionWeek: weekNumber,
        petName,
      },
    });
  };

  /* ── Empty states ── */
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
        <Trophy className="w-10 h-10 mx-auto mb-3 text-on-surface-variant opacity-25" />
        <p className="text-sm font-bold text-on-surface-variant">Chưa có nhiệm vụ</p>
        <p className="text-xs text-on-surface-variant opacity-70 mt-1 leading-relaxed">
          Bạn sẽ nhận nhiệm vụ chụp ảnh<br />sau khi nhận nuôi được phê duyệt.
        </p>
        <button
          onClick={() => navigate('/')}
          className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-full hover:bg-primary/20 transition-colors"
        >
          <PawPrint className="w-3.5 h-3.5" /> Xem thú cưng <ChevronRight className="w-3 h-3" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-3">
      <p className="text-xs text-on-surface-variant font-bold uppercase tracking-wider px-1">
        Nhiệm vụ theo dõi — đăng ảnh lên Cộng đồng mỗi tuần
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
            {task.weeks.map(w => {
              const isActive = w.weekNumber === task.currentWeek;
              const isFuture = !w.done && w.weekNumber > (task.expectedWeek ?? 4);

              return (
                <button
                  key={w.weekNumber}
                  disabled={w.done || isFuture}
                  onClick={() => goPost(w.weekNumber, task.pet?.name ?? 'bé cưng')}
                  className={`w-full flex items-center gap-3 p-2.5 rounded-xl transition-all text-left ${
                    w.done
                      ? 'bg-green-50 cursor-default'
                      : isActive
                        ? 'bg-amber-50 border border-amber-200 hover:bg-amber-100 active:scale-[0.99]'
                        : isFuture
                          ? 'opacity-40 cursor-not-allowed'
                          : 'opacity-60 hover:bg-surface-container cursor-pointer'
                  }`}
                >
                  {/* Status icon */}
                  {w.done
                    ? <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    : <Circle className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-amber-500' : 'text-outline-variant'}`} />
                  }

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-bold ${
                      w.done ? 'text-green-700' : isActive ? 'text-amber-700' : 'text-on-surface-variant'
                    }`}>
                      Tuần {w.weekNumber} — Đăng ảnh cập nhật
                    </p>
                    {w.done && w.report && (
                      <p className="text-[10px] text-green-600 mt-0.5 truncate">
                        ✓ {new Date(w.report.submittedAt).toLocaleDateString('vi-VN')}
                        {w.report.comment && ` · "${w.report.comment.slice(0, 40)}"`}
                      </p>
                    )}
                    {isActive && !w.done && (
                      <p className="text-[10px] text-amber-600 mt-0.5">
                        Nhấn để đăng ảnh lên Cộng đồng →
                      </p>
                    )}
                    {isFuture && (
                      <p className="text-[10px] text-on-surface-variant/50 mt-0.5">Sẽ mở sau</p>
                    )}
                  </div>

                  {/* Thumbnail nếu đã xong */}
                  {w.done && w.report?.image && (
                    <img
                      src={imgSrc(w.report.image)}
                      className="w-8 h-8 rounded-lg object-cover flex-shrink-0 border border-green-200"
                      alt=""
                    />
                  )}

                  {/* Camera icon for active */}
                  {isActive && !w.done && (
                    <Camera className="w-4 h-4 text-amber-500 flex-shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* All done */}
          {task.completedCount === 4 && (
            <div className="mx-3 mb-3 p-3 bg-green-100 rounded-xl flex items-center gap-2">
              <Trophy className="w-5 h-5 text-green-600 flex-shrink-0" />
              <p className="text-sm font-bold text-green-700">Hoàn thành! Cảm ơn bạn đã cập nhật đầy đủ 4 tuần 🎉</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
