'use client';

import { motion } from 'framer-motion';
import { Sparkles, Clock, Volume2, ArrowRight, Bookmark, Share2 } from 'lucide-react';
import type { Article } from '@/types';
import { CATEGORY_CONFIG } from '@/types';
import { triggerHaptic } from '@/lib/export';

interface HeroStoryProps {
  article: Article;
  isBookmarked: boolean;
  onToggleBookmark: (article: Article) => void;
  onOpenArticle: (article: Article) => void;
  onPlayAudio: (article: Article) => void;
  onShowToast: (text: string, type?: 'success' | 'info' | 'error') => void;
}

export default function HeroStory({
  article,
  isBookmarked,
  onToggleBookmark,
  onOpenArticle,
  onPlayAudio,
  onShowToast,
}: HeroStoryProps) {
  const config = CATEGORY_CONFIG[article.category] || CATEGORY_CONFIG['Altro'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="relative mb-6 rounded-3xl overflow-hidden border cursor-pointer group"
      onClick={() => {
        triggerHaptic(15);
        onOpenArticle(article);
      }}
      style={{
        background: 'linear-gradient(145deg, rgba(20, 24, 38, 0.95) 0%, rgba(10, 12, 18, 0.98) 100%)',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 35px rgba(124, 58, 237, 0.15)',
      }}
    >
      {/* Dynamic ambient highlight based on category */}
      <div
        className="absolute -top-24 -right-24 w-80 h-80 rounded-full opacity-20 pointer-events-none blur-3xl transition-opacity duration-500 group-hover:opacity-35"
        style={{ background: `radial-gradient(circle, ${config.accentHex}, transparent 70%)` }}
      />
      <div
        className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full opacity-15 pointer-events-none blur-3xl"
        style={{ background: 'radial-gradient(circle, #7c3aed, transparent 70%)' }}
      />

      {/* Specular border glow line */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px]"
        style={{
          background: `linear-gradient(90deg, transparent 0%, ${config.accentHex} 50%, transparent 100%)`,
        }}
      />

      <div className="relative p-5 sm:p-7 md:p-8 flex flex-col justify-between gap-5">
        {/* Top Badges Row */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider text-white shadow-lg"
              style={{
                background: 'linear-gradient(135deg, #7c3aed 0%, #06b6d4 100%)',
                boxShadow: '0 0 15px rgba(124, 58, 237, 0.4)',
              }}
            >
              <Sparkles className="w-3 h-3" /> Notizia di Copertina
            </span>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${config.bgColor} ${config.borderColor} ${config.color}`}
            >
              {article.category}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-slate-400 text-xs font-semibold">
              <Clock className="w-3.5 h-3.5" />
              <span>{article.readingTimeMinutes} min</span>
            </div>
            {/* Bookmark button */}
            <motion.button
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.85 }}
              onClick={(e) => {
                e.stopPropagation();
                triggerHaptic(20);
                onToggleBookmark(article);
              }}
              className={`p-2 rounded-xl transition-all ${
                isBookmarked
                  ? 'text-amber-400 bg-amber-400/20 border border-amber-400/40 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                  : 'text-slate-400 hover:text-white bg-white/5 border border-white/10 hover:bg-white/10'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-amber-400' : ''}`} />
            </motion.button>
          </div>
        </div>

        {/* Hero Title with Silver Gradient & Impeccable Typography */}
        <div className="space-y-3">
          <span className="text-xs uppercase tracking-widest text-slate-400 font-extrabold block">
            {article.source} • In Primo Piano Oggi
          </span>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white leading-tight tracking-tight group-hover:text-cyan-200 transition-colors">
            {article.title}
          </h2>
          <p className="text-sm sm:text-base text-slate-200 leading-relaxed max-w-3xl font-normal line-clamp-3">
            {article.summary}
          </p>
        </div>

        {/* Strategic Takeaway Card (Perché conta) */}
        <div
          className="p-4 sm:p-5 rounded-2xl border"
          style={{
            background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.12) 0%, rgba(6, 182, 212, 0.08) 100%)',
            borderColor: 'rgba(124, 58, 237, 0.3)',
          }}
        >
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-violet-300 mb-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Takeaway Strategico Chiave</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-100 leading-relaxed font-medium">
            {article.whyCounts}
          </p>
        </div>

        {/* Hero Actions Bar */}
        <div className="flex items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.stopPropagation();
                triggerHaptic(15);
                onPlayAudio(article);
              }}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-cyan-300 bg-cyan-950/40 hover:bg-cyan-900/40 border border-cyan-500/35 transition-all shadow-md"
            >
              <Volume2 className="w-4 h-4 text-cyan-400" />
              <span>Ascolta Notizia</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={async (e) => {
                e.stopPropagation();
                triggerHaptic(15);
                if (navigator.share) {
                  try {
                    await navigator.share({
                      title: article.title,
                      text: article.summary,
                      url: article.sourceUrl,
                    });
                  } catch {}
                } else if (navigator.clipboard) {
                  await navigator.clipboard.writeText(`${article.title}\n${article.sourceUrl}`);
                  onShowToast('Link copiato negli appunti!', 'success');
                }
              }}
              className="p-2 rounded-xl text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
              title="Condividi"
            >
              <Share2 className="w-4 h-4" />
            </motion.button>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-bold text-violet-300 group-hover:text-cyan-300 transition-colors">
            <span>Leggi Analisi Completa</span>
            <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
