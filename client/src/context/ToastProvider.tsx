import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react';
import { CheckIcon, CloseIcon, AlertIcon } from '../components/ui/icons';
import { ToastContext, type ToastApi } from './toastContext';

interface Toast {
  id: number;
  kind: 'success' | 'error';
  message: string;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  const push = useCallback(
    (kind: Toast['kind'], message: string) => {
      const id = nextId.current++;
      setToasts((t) => [...t.slice(-3), { id, kind, message }]);
      window.setTimeout(() => dismiss(id), kind === 'error' ? 6000 : 3500);
    },
    [dismiss],
  );

  const api = useMemo<ToastApi>(
    () => ({ success: (m) => push('success', m), error: (m) => push('error', m) }),
    [push],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-20 z-[60] flex flex-col items-center gap-2 px-4 md:bottom-auto md:left-auto md:right-6 md:top-6 md:items-end"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role={t.kind === 'error' ? 'alert' : 'status'}
            className="toast-in pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-[10px] bg-white p-3.5 text-sm shadow-lg ring-1 ring-slate-200"
          >
            <span
              className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full text-white ${
                t.kind === 'success' ? 'bg-success' : 'bg-danger'
              }`}
            >
              {t.kind === 'success' ? <CheckIcon className="size-3.5" /> : <AlertIcon className="size-3.5" />}
            </span>
            <p className="flex-1 text-ink">{t.message}</p>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              className="text-muted hover:text-ink"
              aria-label="Dismiss notification"
            >
              <CloseIcon className="size-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
