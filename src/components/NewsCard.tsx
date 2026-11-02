'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, Share2, Clock, ChevronDown, ChevronUp, Bookmark, Volume2, Check, Sparkles } from 'lucide-react';
import { useState } from 'react';
import type { Article, DisplayDensity } from '@/types';
import { CATEGORY_CONFIG } from '@/types';
import { triggerHaptic } from '@/lib/export';

interface NewsCardProps {
  article: Article;
  index: number;
  isOnline: boolean;
  density?: DisplayDensity;
  isBookmarked?: boolean;
  onToggleBookmark?: (article: Article) => void;
  onPlaySingleArticle?: (article: Article) => void;
  onShowToast?: (text: string, type?: 'success' | 'info' | 'error') => void;
  onOpenArticle?: (article: Article) => void;
}

export default function NewsCard({
  article,
  index,
  isOnline,
  density = 'magazine',
  isBookmarked = false,
  onToggleBookmark,
  onPlaySingleArticle,
  onShowToast,
  onOpenArticle,
}: NewsCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const config = CATEGORY_CONFIG[article.category] || CATEGORY_CONFIG['Altro'];

  async function handleShare(e: React.MouseEvent) {
    e.stopPropagation();
    triggerHaptic(15);
    const shareData = {
      title: article.title,
      text: `${article.title}\n\n${article.summary}`,
      url: article.sourceUrl,
    };

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {}
    } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(`${article.title}\n${article.sourceUrl}`);
      setCopied(true);
      onShowToast?.('Link copiato negli appunti!', 'success');
      setTimeout(() => setCopied(false), 2000);
    }
  }

  function handleBookmarkClick(e: React.MouseEvent) {
    e.stopPropagation();
    triggerHaptic(20);
    onToggleBookmark?.(article);
  }

  function handlePlayClick(e: React.MouseEvent) {
    e.stopPropagation();
    triggerHaptic(15);
    onPlaySingleArticle?.(article);
  }

  // 1. MODALITÀ COMPATTA APPLE (Stile iOS List Row)
  if (density === 'compact') {
    return (
      <motion.article
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: Math.min(index * 0.03, 0.25) }}
        onClick={() => {
          triggerHaptic(10);
          onOpenArticle?.(article);
        }}
        className="p-3.5 sm:p-4 rounded-2xl border transition-[border-color,background-color] duration-200 cursor-pointer flex items-center justify-between gap-3 group shadow-sm hover:scale-[1.008]"
        style={{
          background: 'rgba(20, 20, 28, 0.88)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderColor: 'rgba(255, 255, 255, 0.08)',
        }}
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <span
            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: config.accentHex }}
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[10px] font-bold text-[#86868b] uppercase tracking-[0.06em]">
                {article.source}
              </span>
              <span className="text-[#555]">•</span>
              <span className="text-[10px] text-[#86868b]">{article.readingTimeMinutes} min</span>
            </div>
            <h3 className="text-xs sm:text-sm font-bold text-[#f5f5f7] truncate group-hover:text-white transition-colors">
              {article.title}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={handlePlayClick}
            className="p-1.5 rounded-full text-[#86868b] hover:text-[#2997ff] hover:bg-white/5 transition-colors"
            title="Ascolta"
          >
            <Volume2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleBookmarkClick}
            className={`p-1.5 rounded-full transition-colors ${
              isBookmarked ? 'text-[#ff9f0a]' : 'text-[#86868b] hover:text-white hover:bg-white/5'
            }`}
            title="Bookmark"
          >
            <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
          </button>
        </div>
      </motion.article>
    );
  }

  // 2. MODALITÀ MINIMA (Stile Apple Ticker Card per scanning rapido)
  if (density === 'minimal') {
    return (
      <motion.article
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: Math.min(index * 0.03, 0.25) }}
        onClick={() => {
          triggerHaptic(10);
          onOpenArticle?.(article);
        }}
        className="p-4 sm:p-5 rounded-[22px] border transition-[border-color,background-color,box-shadow] duration-200 cursor-pointer flex flex-col justify-between gap-3 group h-full shadow-sm hover:scale-[1.01]"
        style={{
          background: 'rgba(20, 20, 28, 0.88)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderColor: 'rgba(255, 255, 255, 0.08)',
        }}
      >
        <div>
          <div className="flex items-center justify-between gap-2 mb-2">
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border tracking-wide ${config.bgColor} ${config.borderColor} ${config.color}`}
            >
              {article.category}
            </span>
            <span className="text-[10px] text-[#86868b]">{article.readingTimeMinutes} min</span>
          </div>

          <h3 className="text-sm font-bold text-[#f5f5f7] leading-snug group-hover:text-white transition-colors line-clamp-2 mb-2">
            {article.title}
          </h3>

          <p className="text-xs text-[#a1a1a6] leading-relaxed line-clamp-2">
            {article.whyCounts}
          </p>
        </div>

        <div
          className="flex items-center justify-between pt-2 border-t border-white/[0.06]"
          onClick={(e) => e.stopPropagation()}
        >
          <span className="text-[10px] font-semibold text-[#86868b] uppercase tracking-wider">
            {article.source}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={handlePlayClick}
              className="p-1 rounded-full text-[#86868b] hover:text-[#2997ff] transition-colors"
            >
              <Volume2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleBookmarkClick}
              className={`p-1 rounded-full transition-colors ${
                isBookmarked ? 'text-[#ff9f0a]' : 'text-[#86868b] hover:text-white'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>
      </motion.article>
    );
  }

  // 3. MODALITÀ RIVISTA (MAGAZINE) APPLE CARD
  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.04, 0.3), ease: [0.32, 0.72, 0, 1] }}
      className="relative group rounded-[26px] overflow-hidden cursor-pointer transition-[border-color,background-color,box-shadow] duration-200 border hover:scale-[1.008] flex flex-col justify-between h-full"
      onClick={() => {
        triggerHaptic(10);
        onOpenArticle?.(article);
      }}
      style={{
        background: 'rgba(20, 20, 28, 0.88)',
        borderColor: 'rgba(255, 255, 255, 0.08)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        boxShadow: '0 12px 35px -10px rgba(0, 0, 0, 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.06)',
      }}
    >
      <div className="p-5 sm:p-6 flex flex-col justify-between flex-1">
        <div>
          {/* Header row: Categoria, Fonte, Tempo di lettura, Bookmark */}
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border tracking-wide ${config.bgColor} ${config.borderColor} ${config.color}`}
              >
                {article.category}
              </span>
              <span className="text-[11px] text-[#86868b] font-semibold tracking-[0.06em] uppercase">
                {article.source}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-[#86868b] text-xs font-medium">
                <Clock className="w-3.5 h-3.5" />
                <span>{article.readingTimeMinutes} min</span>
              </div>

              {/* Bookmark button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleBookmarkClick}
                className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                  isBookmarked
                    ? 'text-[#ff9f0a] bg-[#ff9f0a]/20 border border-[#ff9f0a]/40 shadow-sm'
                    : 'text-[#86868b] hover:text-white bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.08]'
                }`}
                title={isBookmarked ? 'Rimuovi dai salvati' : 'Salva per lettura offline'}
              >
                <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
              </motion.button>
            </div>
          </div>

          {/* Titolo principale Apple Headline */}
          <h2 className="text-base sm:text-lg font-bold text-[#f5f5f7] leading-snug mb-2.5 group-hover:text-white transition-colors tracking-[-0.02em]">
            {article.title}
          </h2>

          {/* Sommario Sintetico */}
          {article.summary && (
            <p className="text-xs sm:text-sm text-[#a1a1a6] leading-relaxed mb-4 font-normal line-clamp-3">
              {article.summary}
            </p>
          )}

          {/* Punti Chiave Apple Style */}
          <div className="space-y-2 mb-4 bg-white/[0.03] p-3.5 sm:p-4 rounded-2xl border border-white/[0.05]">
            <span className="text-[10px] font-bold tracking-[0.08em] uppercase text-[#86868b] block mb-1">
              Punti Salienti
            </span>
            {(article.keyPoints || []).map((point, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <span
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5"
                  style={{ backgroundColor: config.accentHex }}
                />
                <p className="text-xs text-[#d2d2d7] leading-relaxed">{point}</p>
              </div>
            ))}
          </div>

          {/* Expand / Collapse Button per Takeaway rapido */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <button
              className="flex items-center gap-1.5 text-xs font-semibold text-[#2997ff] hover:text-[#59adc4] transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                triggerHaptic(10);
                setExpanded((x) => !x);
              }}
            >
              {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              <span>{expanded ? 'Chiudi takeaway' : '✦ Perché conta'}</span>
            </button>
          </div>

          {/* Box Perché Conta (Espandibile) */}
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden mb-3"
              >
                <div
                  className="p-4 rounded-2xl border"
                  style={{
                    background: 'rgba(41, 151, 255, 0.05)',
                    borderColor: 'rgba(41, 151, 255, 0.2)',
                  }}
                >
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#2997ff] mb-1.5 uppercase tracking-[0.06em]">
                    <Sparkles className="w-3 h-3 text-[#2997ff]" />
                    <span>Takeaway Strategico</span>
                  </div>
                  <p className="text-xs sm:text-sm text-[#f5f5f7] leading-relaxed font-normal">
                    {article.whyCounts}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Barra delle Azioni Footer */}
        <div
          className="flex items-center justify-between gap-2 pt-3 border-t border-white/[0.06] mt-2"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-1.5">
            {/* Audio speech button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handlePlayClick}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-[#86868b] hover:text-white bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.06] transition-all"
              title="Ascolta notizia con sintesi vocale"
            >
              <Volume2 className="w-3.5 h-3.5 text-[#2997ff]" />
              <span>Ascolta</span>
            </motion.button>

            {/* Share button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-[#86868b] hover:text-white bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.06] transition-all"
              title="Condividi notizia"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#30d158]" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copiato' : 'Condividi'}</span>
            </motion.button>
          </div>

          {/* Fonte originale */}
          <motion.a
            href={article.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={(e) => {
              if (!isOnline) {
                e.preventDefault();
                triggerHaptic(20);
                onShowToast?.('Connessione assente: le pagine esterne richiedono rete.', 'info');
              }
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              isOnline
                ? 'text-[#f5f5f7] bg-white/[0.08] hover:bg-white/[0.15] border-white/[0.1]'
                : 'text-[#666] bg-transparent border-transparent cursor-not-allowed'
            }`}
            title={isOnline ? 'Apri l\'articolo originale' : 'Non disponibile offline'}
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>{isOnline ? 'Fonte' : 'Offline'}</span>
          </motion.a>
        </div>
      </div>
    </motion.article>
  );
}
