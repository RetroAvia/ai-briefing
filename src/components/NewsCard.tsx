'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, Share2, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import type { Article } from '@/types';
import { CATEGORY_CONFIG } from '@/types';

interface NewsCardProps {
  article: Article;
  index: number;
  isOnline: boolean;
}

export default function NewsCard({ article, index, isOnline }: NewsCardProps) {
  const [expanded, setExpanded] = useState(false);
  const config = CATEGORY_CONFIG[article.category];

  async function handleShare() {
    const shareData = {
      title: article.title,
      text: article.summary,
      url: article.sourceUrl,
    };
    if (navigator.share) {
      try { await navigator.share(shareData); } catch { /* user cancelled */ }
    } else {
      await navigator.clipboard.writeText(article.sourceUrl);
    }
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.07, ease: 'easeOut' }}
      layout
      className="relative group rounded-2xl overflow-hidden cursor-pointer"
      onClick={() => setExpanded((e) => !e)}
      style={{
        background: 'rgba(17,19,28,0.8)',
        border: '1px solid rgba(255,255,255,0.06)',
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* Hover gradient border effect */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{
          background: `linear-gradient(135deg, rgba(124,58,237,0.08) 0%, rgba(6,182,212,0.06) 100%)`,
          border: '1px solid rgba(124,58,237,0.25)',
        }}
      />

      {/* Top accent line - category color */}
      <div className={`absolute top-0 left-0 right-0 h-[2px] opacity-60 ${config.bgColor.replace('bg-', 'bg-').replace('/10', '/60')}`}
        style={{ background: `linear-gradient(90deg, transparent, currentColor, transparent)` }}
      />

      <div className="relative p-4 sm:p-5">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex flex-wrap items-center gap-2">
            {/* Category tag */}
            <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold border ${config.bgColor} ${config.borderColor} ${config.color}`}>
              {article.category}
            </span>
            {/* Source */}
            <span className="text-[11px] text-slate-600 font-medium">{article.source}</span>
          </div>
          {/* Reading time */}
          <div className="flex items-center gap-1 text-slate-600 text-[11px] flex-shrink-0">
            <Clock className="w-3 h-3" />
            <span>{article.readingTimeMinutes} min</span>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-sm sm:text-base font-bold text-white leading-snug mb-3 group-hover:text-slate-100 transition-colors">
          {article.title}
        </h2>

        {/* Key Points */}
        <div className="space-y-1.5 mb-3">
          {article.keyPoints.map((point, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className={`flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold mt-0.5 ${config.bgColor} ${config.color}`}>
                {i + 1}
              </span>
              <p className="text-xs text-slate-400 leading-relaxed">{point}</p>
            </div>
          ))}
        </div>

        {/* Expand/Collapse toggle */}
        <button
          className="flex items-center gap-1 text-[11px] text-slate-600 hover:text-slate-400 transition-colors mb-3"
          onClick={(e) => { e.stopPropagation(); setExpanded((x) => !x); }}
        >
          {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          {expanded ? 'Meno dettagli' : 'Perché conta'}
        </button>

        {/* Why It Counts - expandable */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="mb-4 p-3 rounded-xl"
                style={{
                  background: 'rgba(124,58,237,0.06)',
                  border: '1px solid rgba(124,58,237,0.2)',
                }}>
                <p className="text-[11px] font-semibold text-violet-400 mb-1.5 uppercase tracking-wide">
                  ✦ Perché conta
                </p>
                <p className="text-xs text-slate-300 leading-relaxed">{article.whyCounts}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action row */}
        <div className="flex items-center gap-2 pt-2 border-t border-white/5" onClick={(e) => e.stopPropagation()}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleShare}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-slate-500 hover:text-slate-300 hover:bg-white/5 border border-transparent hover:border-white/10 transition-all duration-200"
          >
            <Share2 className="w-3 h-3" />
            Condividi
          </motion.button>

          <motion.a
            href={article.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => {
              if (!isOnline) {
                e.preventDefault();
              }
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium border transition-all duration-200 ml-auto ${
              isOnline
                ? 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border-transparent hover:border-white/10'
                : 'text-slate-700 border-transparent cursor-not-allowed'
            }`}
            title={isOnline ? 'Apri fonte' : 'Non disponibile offline'}
          >
            <ExternalLink className="w-3 h-3" />
            {isOnline ? 'Fonte' : 'Offline'}
          </motion.a>
        </div>
      </div>
    </motion.article>
  );
}
