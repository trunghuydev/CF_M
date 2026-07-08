import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: number;
  type: ToastType;
  message: string;
}

interface ToastContextType {
  toast: (type: ToastType, message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};

const icons = {
  success: <CheckCircle size={18} className="text-emerald-500 flex-shrink-0" />,
  error:   <XCircle    size={18} className="text-red-500 flex-shrink-0" />,
  info:    <AlertCircle size={18} className="text-amber-500 flex-shrink-0" />,
};

const colors = {
  success: 'border-l-4 border-emerald-500 bg-white dark:bg-zinc-900',
  error:   'border-l-4 border-red-500 bg-white dark:bg-zinc-900',
  info:    'border-l-4 border-amber-500 bg-white dark:bg-zinc-900',
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  let counter = 0;

  const toast = useCallback((type: ToastType, message: string) => {
    const id = ++counter;
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  }, []);

  const remove = (id: number) => setToasts(prev => prev.filter(t => t.id !== id));

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* Toast Container */}
      <div className="fixed bottom-20 md:bottom-6 right-4 z-[100] flex flex-col gap-2 w-[calc(100%-2rem)] max-w-sm pointer-events-none">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg pointer-events-auto
              animate-in slide-in-from-right-5 fade-in duration-200
              ${colors[t.type]}`}
          >
            {icons[t.type]}
            <p className="flex-1 text-sm font-medium text-zinc-800 dark:text-zinc-100">{t.message}</p>
            <button onClick={() => remove(t.id)} className="ml-1 text-zinc-400 hover:text-zinc-600">
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
