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
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.32, 0.72, 0, 1] }}
      className="relative mb-6 sm:mb-8 rounded-[28px] sm:rounded-[32px] overflow-hidden cursor-pointer group transition-all duration-300"
      onClick={() => {
        triggerHaptic(15);
        onOpenArticle(article);
      }}
      style={{
        background: 'linear-gradient(160deg, rgba(28, 28, 36, 0.78) 0%, rgba(14, 14, 18, 0.9) 100%)',
        backdropFilter: 'blur(35px) saturate(190%)',
        WebkitBackdropFilter: 'blur(35px) saturate(190%)',
        border: '1px solid rgba(255, 255, 255, 0.11)',
        boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.75), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
      }}
    >
      {/* Apple Ambient Glow with category accent */}
      <div
        className="absolute -top-32 -right-32 w-80 h-80 rounded-full opacity-20 pointer-events-none blur-3xl transition-opacity duration-500 group-hover:opacity-30"
        style={{ background: `radial-gradient(circle, ${config.accentHex}, transparent 70%)` }}
      />

      <div className="relative p-6 sm:p-8 lg:p-9 flex flex-col justify-between gap-6">
        {/* Top Badges (Stile Apple News Spotlight) */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-[0.06em] text-white shadow-sm"
              style={{
                background: 'linear-gradient(135deg, #0071e3 0%, #2997ff 100%)',
              }}
            >
              <Sparkles className="w-3 h-3" /> In Primo Piano
            </span>
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border tracking-wide ${config.bgColor} ${config.borderColor} ${config.color}`}
            >
              {article.category}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-[#86868b] text-xs font-semibold">
              <Clock className="w-3.5 h-3.5" />
              <span>{article.readingTimeMinutes} min</span>
            </div>

            {/* Bookmark button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                triggerHaptic(20);
                onToggleBookmark(article);
              }}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                isBookmarked
                  ? 'text-[#ff9f0a] bg-[#ff9f0a]/20 border border-[#ff9f0a]/40 shadow-sm'
                  : 'text-[#86868b] hover:text-white bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.08]'
              }`}
              title="Salva nei segnalibri"
            >
              <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
            </motion.button>
          </div>
        </div>

        {/* Responsive Content Grid: On Desktop (lg), headline on left, Takeaway on right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Headline & Summary */}
          <div className="lg:col-span-7 space-y-3">
            <span className="text-[11px] uppercase tracking-[0.08em] text-[#86868b] font-bold block">
              {article.source} • Copertina del Giorno
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-[-0.03em] leading-tight group-hover:text-slate-100 transition-colors">
              {article.title}
            </h2>
            <p className="text-sm sm:text-base text-[#d2d2d7] leading-relaxed font-normal line-clamp-3">
              {article.summary}
            </p>
          </div>

          {/* Frosted VisionOS Takeaway Pill on Desktop */}
          <div className="lg:col-span-5">
            <div
              className="p-5 sm:p-6 rounded-2xl border"
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                backdropFilter: 'blur(20px)',
                borderColor: 'rgba(255, 255, 255, 0.09)',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
              }}
            >
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.06em] text-[#2997ff] mb-2">
                <Sparkles className="w-3.5 h-3.5 text-[#2997ff]" />
                <span>Takeaway Strategico</span>
              </div>
              <p className="text-xs sm:text-sm text-[#f5f5f7] leading-relaxed font-medium">
                {article.whyCounts}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Actions Row */}
        <div className="flex items-center justify-between gap-3 pt-2 border-t border-white/[0.06]">
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={(e) => {
                e.stopPropagation();
                triggerHaptic(15);
                onPlayAudio(article);
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold text-white bg-white/10 hover:bg-white/15 border border-white/10 transition-all shadow-sm"
            >
              <Volume2 className="w-3.5 h-3.5 text-[#2997ff]" />
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
              className="w-8 h-8 rounded-full flex items-center justify-center text-[#86868b] hover:text-white bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.08] transition-all"
              title="Condividi"
            >
              <Share2 className="w-3.5 h-3.5" />
            </motion.button>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-bold text-[#2997ff] group-hover:translate-x-1 transition-transform">
            <span>Leggi Analisi Completa</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
