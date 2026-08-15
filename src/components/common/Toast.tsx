import React from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useEcommerce } from '../../context/EcommerceContext';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useEcommerce();

  if (toasts.length === 0) return null;

  return (
    <div
      id="toast-container"
      className="fixed bottom-6 right-6 z-50 flex flex-col space-y-3 max-w-sm w-full pointer-events-none"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          id={`toast-${toast.id}`}
          className="pointer-events-auto bg-stone-900 text-stone-50 rounded-xl p-4 shadow-xl border border-stone-800 flex items-start gap-3 transform transition-all duration-300 animate-in fade-in slide-in-from-bottom-5"
        >
          <div className="mt-0.5 shrink-0">
            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
            {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-400" />}
            {toast.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-400" />}
            {toast.type === 'info' && <Info className="w-5 h-5 text-sky-400" />}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-stone-100">{toast.title}</h4>
            <p className="text-xs text-stone-300 mt-0.5 leading-relaxed">{toast.message}</p>
          </div>
          <button
            id={`toast-close-${toast.id}`}
            onClick={() => removeToast(toast.id)}
            className="text-stone-400 hover:text-stone-100 transition-colors p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
