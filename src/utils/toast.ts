type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
}

type Listener = (toasts: ToastItem[]) => void;

let _id = 0;
let _toasts: ToastItem[] = [];
const _listeners: Listener[] = [];

const notify = () => _listeners.forEach(fn => fn([..._toasts]));

const add = (message: string, type: ToastType) => {
  const id = ++_id;
  _toasts = [..._toasts, { id, message, type }];
  notify();
  setTimeout(() => remove(id), 4000);
};

const remove = (id: number) => {
  _toasts = _toasts.filter(t => t.id !== id);
  notify();
};

export const toast = {
  success: (msg: string) => add(msg, 'success'),
  error:   (msg: string) => add(msg, 'error'),
  warning: (msg: string) => add(msg, 'warning'),
  info:    (msg: string) => add(msg, 'info'),
};

export const subscribeToast = (fn: Listener) => {
  _listeners.push(fn);
  return () => { const i = _listeners.indexOf(fn); if (i > -1) _listeners.splice(i, 1); };
};
