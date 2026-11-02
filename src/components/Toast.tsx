'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  text: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export default function ToastContainer({ toasts, onDismiss }: ToastProps) {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full px-4 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => {
          const isSuccess = toast.type === 'success';
          const isError = toast.type === 'error';

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.25 }}
              className="pointer-events-auto flex items-center justify-between gap-3 p-3.5 rounded-xl border backdrop-blur-xl shadow-2xl text-xs font-medium"
              style={{
                background: isSuccess
                  ? 'rgba(16, 185, 129, 0.15)'
                  : isError
                  ? 'rgba(239, 68, 68, 0.15)'
                  : 'rgba(124, 58, 237, 0.15)',
                borderColor: isSuccess
                  ? 'rgba(16, 185, 129, 0.35)'
                  : isError
                  ? 'rgba(239, 68, 68, 0.35)'
                  : 'rgba(124, 58, 237, 0.35)',
                boxShadow: isSuccess
                  ? '0 0 20px rgba(16, 185, 129, 0.2)'
                  : isError
                  ? '0 0 20px rgba(239, 68, 68, 0.2)'
                  : '0 0 20px rgba(124, 58, 237, 0.2)',
              }}
            >
              <div className="flex items-center gap-2.5 text-white">
                {isSuccess && <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />}
                {isError && <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />}
                {!isSuccess && !isError && <Info className="w-4 h-4 text-violet-400 flex-shrink-0" />}
                <span className="leading-snug">{toast.text}</span>
              </div>
              <button
                onClick={() => onDismiss(toast.id)}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors flex-shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
