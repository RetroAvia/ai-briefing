'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Volume2,
  Bookmark,
  Share2,
  ExternalLink,
  Sparkles,
  Clock,
  Type,
  Briefcase,
  Zap,
  Check,
} from 'lucide-react';
import { useState } from 'react';
import type { Article, FontSize } from '@/types';
import { CATEGORY_CONFIG } from '@/types';
import { triggerHaptic } from '@/lib/export';

interface ArticleDrawerProps {
  article: Article | null;
  isOpen: boolean;
  onClose: () => void;
  isBookmarked: boolean;
  onToggleBookmark: (article: Article) => void;
  onPlayAudio: (article: Article) => void;
  onShowToast: (text: string, type?: 'success' | 'info' | 'error') => void;
  isOnline: boolean;
}

type AnalysisPerspective = 'standard' | 'investor' | 'fast';

export default function ArticleDrawer({
  article,
  isOpen,
  onClose,
  isBookmarked,
  onToggleBookmark,
  onPlayAudio,
  onShowToast,
  isOnline,
}: ArticleDrawerProps) {
  const [fontSize, setFontSize] = useState<FontSize>('normal');
  const [perspective, setPerspective] = useState<AnalysisPerspective>('standard');
  const [copied, setCopied] = useState(false);

  if (!isOpen || !article) return null;

  const config = CATEGORY_CONFIG[article.category] || CATEGORY_CONFIG['Altro'];

  const cycleFontSize = () => {
    triggerHaptic(10);
    const sizes: FontSize[] = ['normal', 'large', 'xlarge'];
    const next = sizes[(sizes.indexOf(fontSize) + 1) % sizes.length] ?? 'normal';
    setFontSize(next);
  };

  const getFontSizeClass = () => {
    if (fontSize === 'large') return 'text-base sm:text-lg leading-relaxed';
    if (fontSize === 'xlarge') return 'text-lg sm:text-xl leading-relaxed';
    return 'text-sm sm:text-base leading-relaxed';
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
        {/* Apple Frosted Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => {
            triggerHaptic(15);
            onClose();
          }}
          className="fixed inset-0 bg-[#000000]/75 backdrop-blur-xl transition-opacity"
        />

        {/* Sliding Drawer Container */}
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 32, stiffness: 350 }}
          className="relative w-full max-w-2xl bg-[#141418]/95 backdrop-blur-3xl border-l border-white/[0.1] h-full overflow-y-auto flex flex-col z-10 shadow-2xl p-6 sm:p-8"
          style={{
            boxShadow: '-25px 0 60px rgba(0, 0, 0, 0.85), inset 1px 0 0 rgba(255, 255, 255, 0.08)',
          }}
        >
          {/* Top Sticky Bar */}
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-4 mb-6 sticky top-0 bg-[#141418]/95 backdrop-blur-2xl z-20 -mx-6 px-6 sm:-mx-8 sm:px-8">
            <div className="flex items-center gap-2.5 min-w-0">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border tracking-wide ${config.bgColor} ${config.borderColor} ${config.color}`}
              >
                {article.category}
              </span>
              <span className="text-xs text-[#86868b] font-semibold tracking-wider uppercase truncate">
                {article.source}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Font Size Toggle */}
              <button
                onClick={cycleFontSize}
                className="px-2.5 py-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.08] text-[#86868b] hover:text-white transition-all text-xs font-bold flex items-center gap-1.5"
                title="Dimensione testo"
              >
                <Type className="w-3.5 h-3.5" />
                <span className="text-[10px] uppercase">{fontSize}</span>
              </button>

              {/* Bookmark */}
              <button
                onClick={() => {
                  triggerHaptic(20);
                  onToggleBookmark(article);
                }}
                className={`p-2 rounded-full border transition-all ${
                  isBookmarked
                    ? 'text-[#ff9f0a] bg-[#ff9f0a]/20 border-[#ff9f0a]/40 shadow-sm'
                    : 'text-[#86868b] hover:text-white bg-white/[0.06] border-white/[0.08] hover:bg-white/[0.12]'
                }`}
                title={isBookmarked ? 'Rimuovi dai salvati' : 'Salva offline'}
              >
                <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
              </button>

              {/* Close */}
              <button
                onClick={() => {
                  triggerHaptic(15);
                  onClose();
                }}
                className="w-8 h-8 rounded-full bg-white/[0.08] hover:bg-white/[0.15] text-[#86868b] hover:text-white flex items-center justify-center transition-colors"
                title="Chiudi"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Article Header */}
          <div className="space-y-4 mb-6">
            <div className="flex items-center gap-2 text-xs text-[#86868b]">
              <Clock className="w-3.5 h-3.5" />
              <span>{article.readingTimeMinutes} minuti di lettura</span>
              <span>•</span>
              <span className="text-[#30d158] font-semibold">100% Offline (IndexedDB)</span>
            </div>

            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white leading-tight tracking-[-0.025em]">
              {article.title}
            </h1>

            {/* AI Perspective Switcher (Segmented Control Apple Style) */}
            <div className="p-1 rounded-2xl bg-white/[0.05] border border-white/[0.08] flex items-center gap-1">
              <button
                onClick={() => {
                  triggerHaptic(10);
                  setPerspective('standard');
                }}
                className={`relative flex-1 py-1.5 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  perspective === 'standard' ? 'text-white' : 'text-[#86868b] hover:text-[#d2d2d7]'
                }`}
              >
                {perspective === 'standard' && (
                  <motion.div
                    layoutId="activePerspective"
                    className="absolute inset-0 rounded-xl bg-white/[0.12] border border-white/[0.16] shadow-sm"
                    transition={{ type: 'spring', damping: 28, stiffness: 400 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-[#2997ff]" />
                  <span>Strategica</span>
                </span>
              </button>

              <button
                onClick={() => {
                  triggerHaptic(10);
                  setPerspective('investor');
                }}
                className={`relative flex-1 py-1.5 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  perspective === 'investor' ? 'text-white' : 'text-[#86868b] hover:text-[#d2d2d7]'
                }`}
              >
                {perspective === 'investor' && (
                  <motion.div
                    layoutId="activePerspective"
                    className="absolute inset-0 rounded-xl bg-white/[0.12] border border-white/[0.16] shadow-sm"
                    transition={{ type: 'spring', damping: 28, stiffness: 400 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  <Briefcase className="w-3 h-3 text-[#30d158]" />
                  <span>Mercati</span>
                </span>
              </button>

              <button
                onClick={() => {
                  triggerHaptic(10);
                  setPerspective('fast');
                }}
                className={`relative flex-1 py-1.5 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  perspective === 'fast' ? 'text-white' : 'text-[#86868b] hover:text-[#d2d2d7]'
                }`}
              >
                {perspective === 'fast' && (
                  <motion.div
                    layoutId="activePerspective"
                    className="absolute inset-0 rounded-xl bg-white/[0.12] border border-white/[0.16] shadow-sm"
                    transition={{ type: 'spring', damping: 28, stiffness: 400 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  <Zap className="w-3 h-3 text-[#ff9f0a]" />
                  <span>Flash 30s</span>
                </span>
              </button>
            </div>
          </div>

          {/* Perspective Dynamic Content */}
          <div className="space-y-6 flex-1">
            {perspective === 'standard' && (
              <>
                <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#86868b] mb-2.5">
                    Sintesi Editoriale
                  </h3>
                  <p className={`text-[#e5e5ea] font-normal leading-relaxed ${getFontSizeClass()}`}>
                    {article.summary}
                  </p>
                </div>

                {/* 3 Key Points */}
                <div className="p-5 sm:p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-3.5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#2997ff]">
                    I Tre Pilastri Fondamentali
                  </h3>
                  {(article.keyPoints || []).map((point, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <span
                        className="w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0 mt-0.5 bg-white/[0.08] text-white"
                      >
                        {i + 1}
                      </span>
                      <p className={`text-[#d2d2d7] leading-relaxed ${getFontSizeClass()}`}>
                        {point}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Strategic Why it Counts */}
                <div
                  className="p-5 sm:p-6 rounded-2xl border"
                  style={{
                    background: 'rgba(41, 151, 255, 0.06)',
                    borderColor: 'rgba(41, 151, 255, 0.25)',
                  }}
                >
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#2997ff] mb-2 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#2997ff]" /> Perché è un fattore critico di lungo termine
                  </h3>
                  <p className={`text-[#f5f5f7] font-medium leading-relaxed ${getFontSizeClass()}`}>
                    {article.whyCounts}
                  </p>
                </div>
              </>
            )}

            {perspective === 'investor' && (
              <div
                className="p-5 sm:p-6 rounded-2xl border space-y-4"
                style={{
                  background: 'rgba(48, 209, 88, 0.05)',
                  borderColor: 'rgba(48, 209, 88, 0.25)',
                }}
              >
                <div className="flex items-center gap-2 text-[#30d158] text-xs font-bold uppercase tracking-wider">
                  <Briefcase className="w-4 h-4 text-[#30d158]" />
                  <span>Implicazioni Economiche e per Investitori</span>
                </div>
                <p className={`text-[#e5e5ea] leading-relaxed ${getFontSizeClass()}`}>
                  Questa notizia incide direttamente sulle valutazioni settoriali di{' '}
                  <strong className="text-white">{article.category}</strong>. L&apos;adozione
                  su larga scala di questa tecnologia crea barriere competitive per gli incumbent e apre
                  nuovi canali di revenue per i first-mover.
                </p>
                <div className="p-4 rounded-xl bg-black/40 border border-[#30d158]/20 text-xs text-[#d2d2d7]">
                  <strong className="text-white block mb-1">Takeaway Strategico:</strong>
                  {article.whyCounts}
                </div>
              </div>
            )}

            {perspective === 'fast' && (
              <div
                className="p-5 sm:p-6 rounded-2xl border space-y-4"
                style={{
                  background: 'rgba(255, 159, 10, 0.05)',
                  borderColor: 'rgba(255, 159, 10, 0.25)',
                }}
              >
                <div className="flex items-center gap-2 text-[#ff9f0a] text-xs font-bold uppercase tracking-wider">
                  <Zap className="w-4 h-4 text-[#ff9f0a]" />
                  <span>Cosa devi sapere in 30 secondi</span>
                </div>
                <p className={`text-[#f5f5f7] font-semibold leading-relaxed ${getFontSizeClass()}`}>
                  {article.summary}
                </p>
                <ul className="space-y-2 text-xs text-[#d2d2d7]">
                  {(article.keyPoints || []).map((p, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#ff9f0a] flex-shrink-0 mt-1.5" />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Bottom Floating Bar in Drawer */}
          <div className="pt-5 mt-6 border-t border-white/[0.08] flex items-center justify-between gap-3 sticky bottom-0 bg-[#141418]/95 backdrop-blur-2xl -mx-6 px-6 sm:-mx-8 sm:px-8 pb-3">
            <button
              onClick={() => {
                triggerHaptic(15);
                onPlayAudio(article);
              }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold text-white shadow-lg transition-all"
              style={{
                background: 'linear-gradient(135deg, #0071e3 0%, #2997ff 100%)',
              }}
            >
              <Volume2 className="w-4 h-4" />
              <span>Ascolta con Sintesi Vocale</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={async () => {
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
                    setCopied(true);
                    onShowToast('Link copiato!', 'success');
                    setTimeout(() => setCopied(false), 2000);
                  }
                }}
                className="w-9 h-9 rounded-full text-[#86868b] hover:text-white bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.08] flex items-center justify-center transition-colors"
                title="Condividi"
              >
                {copied ? <Check className="w-4 h-4 text-[#30d158]" /> : <Share2 className="w-4 h-4" />}
              </button>

              <a
                href={article.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => {
                  if (!isOnline) {
                    e.preventDefault();
                    triggerHaptic(20);
                    onShowToast('Sei offline: la pagina web originale richiede connessione.', 'info');
                  }
                }}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold border transition-all ${
                  isOnline
                    ? 'text-white bg-white/[0.08] hover:bg-white/[0.15] border-white/[0.1]'
                    : 'text-[#666] bg-transparent border-transparent cursor-not-allowed'
                }`}
                title={isOnline ? 'Apri articolo originale' : 'Non disponibile offline'}
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>{isOnline ? 'Fonte' : 'Offline'}</span>
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
