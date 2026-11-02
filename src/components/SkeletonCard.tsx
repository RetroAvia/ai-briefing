'use client';

import { motion } from 'framer-motion';

export default function SkeletonCard({ index = 0 }: { index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: Math.min(index * 0.05, 0.3) }}
      className="rounded-[24px] p-5 sm:p-6 space-y-4 overflow-hidden relative border"
      style={{
        background: 'rgba(20, 20, 28, 0.65)',
        backdropFilter: 'blur(25px) saturate(180%)',
        borderColor: 'rgba(255, 255, 255, 0.06)',
      }}
    >
      {/* Apple Subtle Shimmer Wave */}
      <motion.div
        className="absolute inset-0 -translate-x-full pointer-events-none"
        animate={{ translateX: ['-100%', '200%'] }}
        transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut', repeatDelay: 0.2 }}
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.04), transparent)',
        }}
      />

      {/* Top Tag & Time */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="h-5 w-20 rounded-full bg-white/[0.08]" />
          <div className="h-4 w-16 rounded-md bg-white/[0.05]" />
        </div>
        <div className="h-4 w-12 rounded-md bg-white/[0.05]" />
      </div>

      {/* Headline & Body */}
      <div className="space-y-2 pt-1">
        <div className="h-5 w-11/12 rounded-lg bg-white/[0.09]" />
        <div className="h-5 w-3/4 rounded-lg bg-white/[0.09]" />
      </div>

      <div className="space-y-1.5 pt-1">
        <div className="h-3.5 w-full rounded bg-white/[0.04]" />
        <div className="h-3.5 w-5/6 rounded bg-white/[0.04]" />
      </div>

      {/* Key Points Box */}
      <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.04] space-y-2">
        <div className="h-3 w-24 rounded bg-white/[0.06]" />
        <div className="h-3 w-full rounded bg-white/[0.04]" />
        <div className="h-3 w-4/5 rounded bg-white/[0.04]" />
      </div>

      {/* Bottom Actions */}
      <div className="flex items-center justify-between pt-2 border-t border-white/[0.05]">
        <div className="flex items-center gap-2">
          <div className="h-7 w-20 rounded-full bg-white/[0.06]" />
          <div className="h-7 w-20 rounded-full bg-white/[0.06]" />
        </div>
        <div className="h-7 w-16 rounded-full bg-white/[0.06]" />
      </div>
    </motion.div>
  );
}
