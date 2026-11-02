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
        {/* Backdrop glass con blur */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => {
            triggerHaptic(15);
            onClose();
          }}
          className="fixed inset-0 bg-[#06070a]/80 backdrop-blur-md transition-opacity"
        />

        {/* Drawer scorrevole laterale su desktop, da sotto su mobile */}
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className="relative w-full max-w-2xl bg-[#0d0f18] border-l border-white/10 h-full overflow-y-auto flex flex-col z-10 shadow-2xl p-5 sm:p-8"
          style={{
            boxShadow: '-20px 0 50px rgba(0, 0, 0, 0.8), 0 0 40px rgba(124, 58, 237, 0.2)',
          }}
        >
          {/* Top Sticky Bar */}
          <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-6 sticky top-0 bg-[#0d0f18]/90 backdrop-blur-xl z-20 -mx-5 px-5 sm:-mx-8 sm:px-8">
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${config.bgColor} ${config.borderColor} ${config.color}`}
              >
                {article.category}
              </span>
              <span className="text-xs text-slate-400 font-semibold tracking-wider uppercase">
                {article.source}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Font Size Toggle */}
              <button
                onClick={cycleFontSize}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all text-xs font-bold flex items-center gap-1"
                title="Cambia dimensione testo"
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
                className={`p-2 rounded-xl border transition-all ${
                  isBookmarked
                    ? 'text-amber-400 bg-amber-400/20 border-amber-400/40 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                    : 'text-slate-400 hover:text-white bg-white/5 border-white/10 hover:bg-white/10'
                }`}
                title={isBookmarked ? 'Rimuovi dai salvati' : 'Salva offline'}
              >
                <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-amber-400' : ''}`} />
              </button>

              {/* Close */}
              <button
                onClick={() => {
                  triggerHaptic(15);
                  onClose();
                }}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white transition-colors"
                title="Chiudi"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Article Header */}
          <div className="space-y-4 mb-6">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Clock className="w-3.5 h-3.5" />
              <span>{article.readingTimeMinutes} minuti di lettura</span>
              <span>•</span>
              <span className="text-emerald-400">100% Disponibile Offline</span>
            </div>

            <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white leading-tight tracking-tight">
              {article.title}
            </h1>

            {/* AI Perspective Switcher */}
            <div className="flex items-center gap-2 pt-2 pb-1 overflow-x-auto scrollbar-hide">
              <button
                onClick={() => {
                  triggerHaptic(10);
                  setPerspective('standard');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 flex-shrink-0 ${
                  perspective === 'standard'
                    ? 'bg-violet-600/30 border border-violet-500/60 text-violet-200 shadow-md'
                    : 'bg-white/5 border border-white/10 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sparkles className="w-3 h-3 text-cyan-400" />
                <span>Analisi Strategica</span>
              </button>

              <button
                onClick={() => {
                  triggerHaptic(10);
                  setPerspective('investor');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 flex-shrink-0 ${
                  perspective === 'investor'
                    ? 'bg-emerald-600/30 border border-emerald-500/60 text-emerald-200 shadow-md'
                    : 'bg-white/5 border border-white/10 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Briefcase className="w-3 h-3 text-emerald-400" />
                <span>Impatto Mercati</span>
              </button>

              <button
                onClick={() => {
                  triggerHaptic(10);
                  setPerspective('fast');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 flex-shrink-0 ${
                  perspective === 'fast'
                    ? 'bg-cyan-600/30 border border-cyan-500/60 text-cyan-200 shadow-md'
                    : 'bg-white/5 border border-white/10 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Zap className="w-3 h-3 text-cyan-400" />
                <span>Flash 30s (Metro)</span>
              </button>
            </div>
          </div>

          {/* Perspective Dynamic Content */}
          <div className="space-y-6 flex-1">
            {perspective === 'standard' && (
              <>
                <div className="p-4 sm:p-5 rounded-2xl bg-black/40 border border-white/5">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-2">
                    Sintesi Editoriale
                  </h3>
                  <p className={`text-slate-100 ${getFontSizeClass()}`}>{article.summary}</p>
                </div>

                {/* 3 Key Points */}
                <div className="p-5 rounded-2xl bg-black/30 border border-white/5 space-y-3">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-cyan-300">
                    I Tre Pilastri Fondamentali
                  </h3>
                  {article.keyPoints.map((point, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 mt-0.5 ${config.bgColor} ${config.color}`}
                      >
                        {i + 1}
                      </span>
                      <p className={`text-slate-200 ${getFontSizeClass()}`}>{point}</p>
                    </div>
                  ))}
                </div>

                {/* Strategic Why it Counts */}
                <div
                  className="p-5 rounded-2xl border"
                  style={{
                    background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.12) 0%, rgba(6, 182, 212, 0.08) 100%)',
                    borderColor: 'rgba(124, 58, 237, 0.35)',
                  }}
                >
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-violet-300 mb-2 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Perché è un fattore critico di lungo termine
                  </h3>
                  <p className={`text-slate-100 font-medium ${getFontSizeClass()}`}>
                    {article.whyCounts}
                  </p>
                </div>
              </>
            )}

            {perspective === 'investor' && (
              <div className="p-5 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-4">
                <div className="flex items-center gap-2 text-emerald-300 text-xs font-extrabold uppercase tracking-wider">
                  <Briefcase className="w-4 h-4 text-emerald-400" />
                  <span>Implicazioni Economiche e per Investitori</span>
                </div>
                <p className={`text-slate-100 ${getFontSizeClass()}`}>
                  Questa notizia incide direttamente sulle valutazioni settoriali di{' '}
                  <strong className="text-emerald-300">{article.category}</strong>. L&apos;adozione
                  su larga scala di questa innovazione riduce i costi di infrastruttura e apre
                  nuovi canali di revenue per gli early adopter.
                </p>
                <div className="p-3.5 rounded-xl bg-black/40 border border-emerald-500/20 text-xs text-slate-300">
                  <strong className="text-white block mb-1">Riflesso di mercato:</strong>
                  {article.whyCounts}
                </div>
              </div>
            )}

            {perspective === 'fast' && (
              <div className="p-5 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 space-y-4">
                <div className="flex items-center gap-2 text-cyan-300 text-xs font-extrabold uppercase tracking-wider">
                  <Zap className="w-4 h-4 text-cyan-400" />
                  <span>Cosa devi sapere prima della prossima fermata</span>
                </div>
                <p className={`text-white font-semibold ${getFontSizeClass()}`}>
                  {article.summary}
                </p>
                <ul className="list-disc pl-5 space-y-2 text-xs text-slate-300">
                  {article.keyPoints.map((p, idx) => (
                    <li key={idx}>{p}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Bottom Floating Bar in Drawer */}
          <div className="pt-6 mt-6 border-t border-white/10 flex items-center justify-between gap-3 sticky bottom-0 bg-[#0d0f18]/95 backdrop-blur-xl -mx-5 px-5 sm:-mx-8 sm:px-8 pb-3">
            <button
              onClick={() => {
                triggerHaptic(15);
                onPlayAudio(article);
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 transition-all shadow-lg"
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
                    onShowToast('Link copiato!', 'success');
                  }
                }}
                className="p-2.5 rounded-xl text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                title="Condividi"
              >
                <Share2 className="w-4 h-4" />
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
                className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                  isOnline
                    ? 'text-white bg-slate-800 hover:bg-slate-700 border-slate-700'
                    : 'text-slate-600 bg-slate-900 border-slate-800 cursor-not-allowed'
                }`}
                title={isOnline ? 'Apri articolo originale' : 'Non disponibile offline'}
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>{isOnline ? 'Fonte Originale' : 'Offline'}</span>
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
