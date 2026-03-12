'use client';

import { create } from 'zustand';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface ToastStore {
  toasts: Toast[];
  addToast: (message: string, type: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
}

export const useToast = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (message, type) => {
    const id = Math.random().toString(36).substr(2, 9);
    set((state) => ({ toasts: [...state.toasts, { id, message, type }] }));
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, 3000);
  },
  removeToast: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));

import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ToastContainer() {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed bottom-6 right-6 z-[999] flex flex-col gap-3">
      {toasts.map((toast) => (
        <div 
          key={toast.id}
          className={cn(
            "flex items-center gap-3 p-4 rounded-xl shadow-2xl min-w-[300px] text-white animate-in slide-in-from-right",
            toast.type === 'success' && "bg-[#0f1f3d] border-l-4 border-green-500",
            toast.type === 'error' && "bg-[#0f1f3d] border-l-4 border-red-500",
            toast.type === 'info' && "bg-[#0f1f3d] border-l-4 border-blue-500"
          )}
        >
          {toast.type === 'success' && <CheckCircle size={20} className="text-green-500" />}
          {toast.type === 'error' && <AlertCircle size={20} className="text-red-500" />}
          {toast.type === 'info' && <Info size={20} className="text-blue-500" />}
          <span className="flex-1 text-sm font-medium">{toast.message}</span>
          <button onClick={() => removeToast(toast.id)} className="text-white/20 hover:text-white">
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
