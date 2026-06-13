import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { ToastItem, subscribeToast } from '../utils/toast';

const ICON = {
  success: <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />,
  error:   <XCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />,
  warning: <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />,
  info:    <Info className="w-5 h-5 text-blue-500 flex-shrink-0" />,
};

const BG = {
  success: 'bg-emerald-50 border-emerald-200',
  error:   'bg-rose-50 border-rose-200',
  warning: 'bg-amber-50 border-amber-200',
  info:    'bg-blue-50 border-blue-200',
};

const TEXT = {
  success: 'text-emerald-800',
  error:   'text-rose-800',
  warning: 'text-amber-800',
  info:    'text-blue-800',
};

export const ToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => subscribeToast(setToasts), []);

  if (!toasts.length) return null;

  return (
    <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-2 pointer-events-none" style={{ maxWidth: 'min(380px, calc(100vw - 2rem))' }}>
      {toasts.map(t => (
        <div key={t.id}
          className={`flex items-start gap-3 px-4 py-3 rounded-2xl border shadow-lg pointer-events-auto ${BG[t.type]}`}
          style={{ animation: 'slideInRight 0.25s ease-out' }}>
          {ICON[t.type]}
          <p className={`text-sm font-semibold leading-snug flex-1 ${TEXT[t.type]}`}>{t.message}</p>
        </div>
      ))}
    </div>
  );
};
