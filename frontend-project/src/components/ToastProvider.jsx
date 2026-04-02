import { createContext, useContext, useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, LoaderCircle, X } from 'lucide-react';

const ToastContext = createContext(null);

const toastThemes = {
  loading: {
    container: 'border-blue-400/30 bg-slate-950/95 text-blue-50 shadow-blue-950/40',
    badge: 'bg-blue-500/15 text-blue-200',
    icon: <LoaderCircle size={18} className="animate-spin" />,
    title: 'Loading'
  },
  success: {
    container: 'border-emerald-400/30 bg-slate-950/95 text-emerald-50 shadow-emerald-950/40',
    badge: 'bg-emerald-500/15 text-emerald-200',
    icon: <CheckCircle2 size={18} />,
    title: 'Success'
  },
  error: {
    container: 'border-rose-400/30 bg-slate-950/95 text-rose-50 shadow-rose-950/40',
    badge: 'bg-rose-500/15 text-rose-200',
    icon: <AlertCircle size={18} />,
    title: 'Error'
  }
};

export const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!toast || toast.type === 'loading') {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setToast((currentToast) => (currentToast?.id === toast.id ? null : currentToast));
    }, toast.duration ?? 3200);

    return () => window.clearTimeout(timeoutId);
  }, [toast]);

  const showToast = (type, message, options = {}) => {
    setToast({
      id: Date.now(),
      type,
      message,
      duration: options.duration
    });
  };

  const value = {
    showLoading(message = 'Processing your request...') {
      showToast('loading', message, { duration: 0 });
    },
    showSuccess(message = 'Action completed successfully.', options = {}) {
      showToast('success', message, options);
    },
    showError(message = 'Something went wrong.', options = {}) {
      showToast('error', message, { duration: 4200, ...options });
    },
    clearToast() {
      setToast(null);
    }
  };

  const activeTheme = toast ? toastThemes[toast.type] : null;

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed left-4 top-4 z-[100] w-[calc(100vw-2rem)] max-w-sm">
        {toast && activeTheme && (
          <div
            role="status"
            aria-live={toast.type === 'error' ? 'assertive' : 'polite'}
            className={`pointer-events-auto rounded-2xl border px-4 py-3 shadow-2xl backdrop-blur-xl transition-all duration-300 ${activeTheme.container}`}
          >
            <div className="flex items-start gap-3">
              <div className={`mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl ${activeTheme.badge}`}>
                {activeTheme.icon}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-black uppercase tracking-[0.28em] opacity-80">
                  {activeTheme.title}
                </p>
                <p className="mt-1 text-sm font-semibold leading-5">
                  {toast.message}
                </p>
              </div>
              {toast.type !== 'loading' && (
                <button
                  type="button"
                  onClick={() => setToast(null)}
                  className="rounded-lg p-1 text-white/60 transition hover:bg-white/10 hover:text-white"
                  aria-label="Dismiss notification"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error('useToast must be used within ToastProvider.');
  }

  return context;
};
