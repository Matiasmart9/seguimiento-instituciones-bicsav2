/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';

const ToastContext = createContext(null);

const STYLES = {
  error: 'bg-red-600',
  success: 'bg-green-600',
  info: 'bg-blue-600',
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const nextId = useRef(0);

  const dismiss = useCallback((id) => setToasts((prev) => prev.filter((t) => t.id !== id)), []);

  const show = useCallback(
    (message, type = 'info', duration = 4000) => {
      const id = nextId.current++;
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => dismiss(id), duration);
    },
    [dismiss]
  );

  const api = useMemo(
    () => ({
      error: (msg) => show(msg, 'error', 6000),
      success: (msg) => show(msg, 'success'),
      info: (msg) => show(msg, 'info'),
    }),
    [show]
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="fixed bottom-4 right-4 flex flex-col gap-2" style={{ zIndex: 20000 }} role="status" aria-live="polite">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`${STYLES[t.type]} text-white px-4 py-3 rounded-lg shadow-lg flex items-start gap-3 max-w-sm`}
          >
            <span className="flex-1 text-sm">{t.message}</span>
            <button onClick={() => dismiss(t.id)} aria-label="Cerrar" className="font-bold opacity-80 hover:opacity-100">
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast debe usarse dentro de <ToastProvider>');
  return ctx;
}
