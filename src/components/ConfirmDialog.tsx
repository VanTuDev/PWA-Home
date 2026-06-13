import React, { useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';

interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
}

type ResolveFunc = (ok: boolean) => void;

let _resolve: ResolveFunc | null = null;
let _setVisible: ((opts: ConfirmOptions | null) => void) | null = null;

export const confirm = (opts: ConfirmOptions | string): Promise<boolean> => {
  const options: ConfirmOptions = typeof opts === 'string' ? { message: opts } : opts;
  return new Promise(resolve => {
    _resolve = resolve;
    _setVisible?.(options);
  });
};

export const ConfirmDialog: React.FC = () => {
  const [opts, setOpts] = useState<ConfirmOptions | null>(null);

  useEffect(() => {
    _setVisible = setOpts;
    return () => { _setVisible = null; };
  }, []);

  if (!opts) return null;

  const handle = (ok: boolean) => {
    setOpts(null);
    _resolve?.(ok);
    _resolve = null;
  };

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}>
      <div className="bg-surface rounded-[28px] shadow-2xl p-7 max-w-sm w-full"
        style={{ animation: 'scaleIn 0.18s ease-out' }}>
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${opts.danger ? 'bg-rose-100' : 'bg-amber-100'}`}>
            <AlertTriangle className={`w-5 h-5 ${opts.danger ? 'text-rose-500' : 'text-amber-500'}`} />
          </div>
          <h3 className="font-black text-on-surface text-base">{opts.title || 'Xác nhận'}</h3>
        </div>
        <p className="text-sm text-on-surface-variant leading-relaxed mb-6">{opts.message}</p>
        <div className="flex gap-3 justify-end">
          <button onClick={() => handle(false)}
            className="px-5 py-2.5 rounded-2xl border border-outline-variant text-on-surface-variant text-sm font-bold hover:bg-surface-container transition-all">
            {opts.cancelText || 'Hủy'}
          </button>
          <button onClick={() => handle(true)}
            className={`px-5 py-2.5 rounded-2xl text-white text-sm font-bold transition-all ${opts.danger ? 'bg-rose-500 hover:bg-rose-600' : 'bg-primary hover:bg-primary/90'}`}>
            {opts.confirmText || 'Xác nhận'}
          </button>
        </div>
      </div>
    </div>
  );
};
