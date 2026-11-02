'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, RotateCcw, Home } from 'lucide-react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[App Crash Error]:', error);
  }, [error]);

  const handleClearCacheAndReload = () => {
    try {
      if (typeof window !== 'undefined') {
        if ('caches' in window) {
          caches.keys().then((keys) => {
            keys.forEach((key) => caches.delete(key));
          });
        }
        if (window.localStorage) {
          window.localStorage.clear();
        }
      }
    } catch {}
    window.location.href = '/';
  };

  return (
    <div className="min-h-dvh bg-[#000000] text-white flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md p-6 sm:p-8 rounded-[28px] border text-center flex flex-col items-center shadow-2xl"
        style={{
          background: 'rgba(24, 24, 30, 0.95)',
          backdropFilter: 'blur(30px)',
          borderColor: 'rgba(255, 255, 255, 0.1)',
        }}
      >
        <div className="w-16 h-16 rounded-2xl bg-[#ff375f]/15 border border-[#ff375f]/30 flex items-center justify-center mb-5">
          <AlertCircle className="w-8 h-8 text-[#ff375f]" />
        </div>

        <h2 className="text-xl font-extrabold text-white mb-2 tracking-tight">
          Si è verificato un errore
        </h2>
        <p className="text-sm text-[#86868b] leading-relaxed mb-6">
          L&apos;applicazione ha riscontrato un problema imprevisto durante il caricamento delle notizie.
        </p>

        {error?.message && (
          <div className="w-full p-3 mb-6 rounded-xl bg-black/40 border border-white/5 text-[11px] text-[#ff375f] font-mono text-left truncate">
            {error.message}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
          <button
            onClick={() => reset()}
            className="w-full py-2.5 px-4 rounded-full text-xs font-bold text-white bg-[#0071e3] hover:bg-[#0077ed] transition-colors flex items-center justify-center gap-2 shadow-md"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Riprova</span>
          </button>

          <button
            onClick={handleClearCacheAndReload}
            className="w-full py-2.5 px-4 rounded-full text-xs font-semibold text-[#86868b] hover:text-white bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.08] transition-colors flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            <span>Ripristina Cache</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
