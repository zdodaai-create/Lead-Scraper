import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const Toast = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [message, onClose]);

  if (!message) return null;

  const icons = {
    success: <CheckCircle2 class="w-4 h-4 text-emerald-400 shrink-0" />,
    error: <AlertCircle class="w-4 h-4 text-rose-400 shrink-0" />,
    info: <Info class="w-4 h-4 text-blue-400 shrink-0" />,
  };

  const borders = {
    success: 'border-emerald-500/30 bg-slate-900/90 text-emerald-300',
    error: 'border-rose-500/30 bg-slate-900/90 text-rose-300',
    info: 'border-blue-500/30 bg-slate-900/90 text-blue-300',
  };

  return (
    <div class="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 duration-200">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-xl backdrop-blur-md text-xs font-medium ${borders[type]}`}>
        {icons[type]}
        <span>{message}</span>
        <button onClick={onClose} class="text-slate-400 hover:text-white ml-2">
          <X class="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export default Toast;
