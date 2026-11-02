'use client';

import { motion } from 'framer-motion';

export default function SkeletonCard({ index = 0 }: { index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: index * 0.05 }}
      className="rounded-2xl p-4 sm:p-5 space-y-3 overflow-hidden relative"
      style={{
        background: 'rgba(17,19,28,0.8)',
        border: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* Shimmer overlay */}
      <motion.div
        className="absolute inset-0 -translate-x-full"
        animate={{ translateX: ['-100%', '200%'] }}
        transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut', repeatDelay: 0.3 }}
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.03), transparent)',
        }}
      />
      <div className="flex items-center gap-2">
        <div className="h-5 w-16 rounded-md bg-slate-800/80" />
        <div className="h-4 w-20 rounded-md bg-slate-800/50" />
      </div>
      <div className="h-5 w-full rounded-md bg-slate-800/70" />
      <div className="h-4 w-4/5 rounded-md bg-slate-800/50" />
      <div className="space-y-2 pt-1">
        <div className="h-3 w-full rounded bg-slate-800/40" />
        <div className="h-3 w-11/12 rounded bg-slate-800/40" />
        <div className="h-3 w-4/5 rounded bg-slate-800/40" />
      </div>
    </motion.div>
  );
}
