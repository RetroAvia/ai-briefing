'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, Share2, Clock, ChevronDown, ChevronUp, Bookmark, Volume2, Check } from 'lucide-react';
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

  // MODALITÀ COMPATTA (Per scorrimento ultra-rapido in metro)
  if (density === 'compact') {
    return (
      <motion.article
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: Math.min(index * 0.03, 0.25) }}
        onClick={() => {
          triggerHaptic(10);
          onOpenArticle?.(article);
        }}
        className="p-3 sm:p-4 rounded-2xl border bg-[#11131c]/90 hover:bg-[#141724] border-white/5 hover:border-violet-500/30 transition-all cursor-pointer flex items-center justify-between gap-3 group shadow-md"
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <span
            className={`w-2 h-2 rounded-full flex-shrink-0 ${
              article.category === 'Tech & AI'
                ? 'bg-cyan-400'
                : article.category === 'Mercati & Economia'
                ? 'bg-emerald-400'
                : article.category === 'Scienza'
                ? 'bg-violet-400'
                : 'bg-amber-400'
            }`}
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {article.source}
              </span>
              <span className="text-[10px] text-slate-600">•</span>
              <span className="text-[10px] text-slate-400">{article.readingTimeMinutes} min</span>
            </div>
            <h3 className="text-xs sm:text-sm font-bold text-white truncate group-hover:text-cyan-200 transition-colors">
              {article.title}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={handlePlayClick}
            className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 transition-colors"
            title="Ascolta"
          >
            <Volume2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleBookmarkClick}
            className={`p-1.5 rounded-lg transition-colors ${
              isBookmarked ? 'text-amber-400' : 'text-slate-500 hover:text-white'
            }`}
            title="Bookmark"
          >
            <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-amber-400' : ''}`} />
          </button>
        </div>
      </motion.article>
    );
  }

  // MODALITÀ RIVISTA (MAGAZINE) / MINIMALE
  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.04, 0.3), ease: [0.16, 1, 0.3, 1] }}
      layout
      className="relative group rounded-3xl overflow-hidden cursor-pointer transition-all duration-300 border"
      onClick={() => {
        triggerHaptic(10);
        onOpenArticle?.(article);
      }}
      style={{
        background: 'rgba(17, 19, 28, 0.9)',
        borderColor: 'rgba(255, 255, 255, 0.08)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        boxShadow: '0 8px 30px -10px rgba(0, 0, 0, 0.5)',
      }}
    >
      {/* Specular border glow line */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px]"
        style={{
          background: `linear-gradient(90deg, transparent 0%, ${config.accentHex} 50%, transparent 100%)`,
        }}
      />

      <div className="relative p-5 sm:p-6">
        {/* Header row: Categoria, Fonte, Tempo di lettura, Bookmark */}
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-[11px] font-bold border tracking-wide ${config.bgColor} ${config.borderColor} ${config.color}`}
            >
              {article.category}
            </span>
            <span className="text-[11px] text-slate-400 font-semibold tracking-wider uppercase">
              {article.source}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-slate-400 text-xs font-medium">
              <Clock className="w-3 h-3" />
              <span>{article.readingTimeMinutes} min</span>
            </div>

            {/* Bookmark button */}
            <motion.button
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.85 }}
              onClick={handleBookmarkClick}
              className={`p-1.5 rounded-xl transition-all ${
                isBookmarked
                  ? 'text-amber-400 bg-amber-400/15 border border-amber-400/35 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                  : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
              title={isBookmarked ? 'Rimuovi dai salvati' : 'Salva per lettura offline'}
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-amber-400' : ''}`} />
            </motion.button>
          </div>
        </div>

        {/* Titolo principale */}
        <h2 className="text-base sm:text-lg font-black text-white leading-snug mb-2 group-hover:text-cyan-200 transition-colors tracking-tight">
          {article.title}
        </h2>

        {/* Sommario Sintetico (in modalità magazine) */}
        {density === 'magazine' && article.summary && (
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-4 font-normal">
            {article.summary}
          </p>
        )}

        {/* Punti Chiave (Key Points) */}
        <div className="space-y-1.5 mb-4 bg-black/35 p-3 sm:p-3.5 rounded-2xl border border-white/5">
          <span className="text-[10px] font-extrabold tracking-wider uppercase text-slate-400 block mb-1">
            Punti Chiave
          </span>
          {article.keyPoints.map((point, i) => (
            <div key={i} className="flex items-start gap-2.5">
              <span
                className={`flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-extrabold mt-0.5 ${config.bgColor} ${config.color}`}
              >
                {i + 1}
              </span>
              <p className="text-xs text-slate-200 leading-relaxed">{point}</p>
            </div>
          ))}
        </div>

        {/* Expand / Collapse Button per Takeaway rapido */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <button
            className="flex items-center gap-1.5 text-xs font-bold text-violet-400 hover:text-violet-300 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              triggerHaptic(10);
              setExpanded((x) => !x);
            }}
          >
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            <span>{expanded ? 'Chiudi takeaway' : '✦ Perché conta (Takeaway strategico)'}</span>
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
              className="overflow-hidden"
            >
              <div
                className="mb-4 p-4 rounded-2xl border"
                style={{
                  background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.1) 0%, rgba(6, 182, 212, 0.06) 100%)',
                  borderColor: 'rgba(124, 58, 237, 0.3)',
                }}
              >
                <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-violet-300 mb-1.5 uppercase tracking-wider">
                  <span>✦ Perché conta nel lungo termine</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-100 leading-relaxed font-normal">
                  {article.whyCounts}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Barra delle Azioni Footer */}
        <div
          className="flex items-center justify-between gap-2 pt-3 border-t border-white/5"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-1.5">
            {/* Audio speech button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handlePlayClick}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-cyan-300 hover:bg-cyan-500/10 border border-white/5 hover:border-cyan-500/30 transition-all duration-200"
              title="Ascolta questa notizia"
            >
              <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>Ascolta</span>
            </motion.button>

            {/* Share button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/5 border border-white/5 hover:border-white/15 transition-all duration-200"
              title="Condividi notizia"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
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
                onShowToast?.('Connessione assente: le pagine web esterne richiedono rete.', 'info');
              }
            }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all duration-200 ${
              isOnline
                ? 'text-slate-200 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border-slate-700/70 shadow-sm'
                : 'text-slate-600 bg-slate-900/40 border-slate-800/40 cursor-not-allowed'
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
