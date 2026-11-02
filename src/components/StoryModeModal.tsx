'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Bookmark, Share2, Volume2, Sparkles, Clock } from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import type { Article } from '@/types';
import { CATEGORY_CONFIG } from '@/types';
import { triggerHaptic } from '@/lib/export';

interface StoryModeModalProps {
  articles: Article[];
  initialIndex?: number;
  isOpen: boolean;
  onClose: () => void;
  isBookmarked: (id: string) => boolean;
  onToggleBookmark: (article: Article) => void;
  onShowToast: (text: string, type?: 'success' | 'info' | 'error') => void;
  onPlayArticleAudio: (article: Article) => void;
}

export default function StoryModeModal({
  articles,
  initialIndex = 0,
  isOpen,
  onClose,
  isBookmarked,
  onToggleBookmark,
  onShowToast,
  onPlayArticleAudio,
}: StoryModeModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  // Gestione tastiera frecce e ESC
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight' || e.key === ' ') {
        goToNext();
      }
      if (e.key === 'ArrowLeft') {
        goToPrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  const goToNext = useCallback(() => {
    if (currentIndex < articles.length - 1) {
      triggerHaptic(15);
      setDirection(1);
      setCurrentIndex((prev) => prev + 1);
    } else {
      onClose();
    }
  }, [currentIndex, articles.length, onClose]);

  const goToPrev = useCallback(() => {
    if (currentIndex > 0) {
      triggerHaptic(15);
      setDirection(-1);
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex]);

  if (!isOpen || articles.length === 0) return null;

  const currentArticle = articles[currentIndex] || articles[0];
  const config = CATEGORY_CONFIG[currentArticle.category] || CATEGORY_CONFIG['Altro'];
  const bookmarked = isBookmarked(currentArticle.id);

  const variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 300 : -300,
      opacity: 0,
      scale: 0.95,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: { duration: 0.3, ease: 'easeOut' },
    },
    exit: (dir: number) => ({
      x: dir < 0 ? 300 : -300,
      opacity: 0,
      scale: 0.95,
      transition: { duration: 0.25, ease: 'easeIn' },
    }),
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-[#06070a]/95 backdrop-blur-2xl flex flex-col items-center justify-between p-3 sm:p-6 overflow-hidden selection:bg-violet-500/30"
    >
      {/* Background ambient lighting */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute -top-32 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full opacity-15 blur-3xl"
          style={{
            background:
              currentArticle.category === 'Tech & AI'
                ? 'radial-gradient(circle, #06b6d4, transparent)'
                : currentArticle.category === 'Mercati & Economia'
                ? 'radial-gradient(circle, #10b981, transparent)'
                : currentArticle.category === 'Scienza'
                ? 'radial-gradient(circle, #a855f7, transparent)'
                : 'radial-gradient(circle, #7c3aed, transparent)',
          }}
        />
      </div>

      {/* Top Bar: Segmented Progress Bar + Close */}
      <div className="w-full max-w-xl mx-auto pt-2 z-20">
        <div className="flex items-center gap-1.5 mb-3">
          {articles.map((_, i) => (
            <div key={i} className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  i < currentIndex
                    ? 'w-full bg-white'
                    : i === currentIndex
                    ? 'w-full bg-gradient-to-r from-violet-400 to-cyan-400'
                    : 'w-0'
                }`}
              />
            </div>
          ))}
        </div>

        {/* Header con indice e tasto chiudi */}
        <div className="flex items-center justify-between text-white pb-2">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-widest text-violet-300 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-cyan-400" /> Metro Digest
            </span>
            <span className="text-xs text-slate-500 font-semibold">
              {currentIndex + 1} di {articles.length}
            </span>
          </div>

          <button
            onClick={() => {
              triggerHaptic(15);
              onClose();
            }}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
            title="Esci da Stories"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Story Container with Swipe / Drag */}
      <div className="relative w-full max-w-xl mx-auto flex-1 flex flex-col justify-center my-auto z-10 py-2">
        <AnimatePresence custom={direction} mode="wait">
          <motion.div
            key={currentArticle.id}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={(_, info) => {
              if (info.offset.x < -60) goToNext();
              else if (info.offset.x > 60) goToPrev();
            }}
            className="rounded-3xl p-5 sm:p-7 border backdrop-blur-2xl shadow-2xl overflow-y-auto max-h-[75vh]"
            style={{
              background: 'rgba(17, 19, 28, 0.95)',
              borderColor: 'rgba(255, 255, 255, 0.12)',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8), 0 0 30px rgba(124, 58, 237, 0.15)',
            }}
          >
            {/* Categoria + Fonte + Tempo */}
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold border ${config.bgColor} ${config.borderColor} ${config.color}`}
                >
                  {currentArticle.category}
                </span>
                <span className="text-xs text-slate-400 font-medium">{currentArticle.source}</span>
              </div>
              <div className="flex items-center gap-1 text-slate-400 text-xs">
                <Clock className="w-3.5 h-3.5" />
                <span>{currentArticle.readingTimeMinutes} min</span>
              </div>
            </div>

            {/* Titolo Principale Incisivo */}
            <h2 className="text-lg sm:text-2xl font-black text-white leading-tight mb-4 tracking-tight">
              {currentArticle.title}
            </h2>

            {/* Sintesi Chiara */}
            <p className="text-sm text-slate-200 leading-relaxed mb-5 font-normal">
              {currentArticle.summary}
            </p>

            {/* Box 3 Punti Chiave */}
            <div className="space-y-2.5 mb-5 p-4 rounded-2xl bg-black/40 border border-white/5">
              <span className="text-[10px] font-extrabold tracking-wider uppercase text-slate-400 block mb-1">
                Punti Salienti
              </span>
              {currentArticle.keyPoints.map((point, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <span
                    className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black mt-0.5 ${config.bgColor} ${config.color}`}
                  >
                    {i + 1}
                  </span>
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">{point}</p>
                </div>
              ))}
            </div>

            {/* Takeaway Perché Conta */}
            <div
              className="p-4 rounded-2xl border"
              style={{
                background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.12) 0%, rgba(6, 182, 212, 0.08) 100%)',
                borderColor: 'rgba(124, 58, 237, 0.3)',
              }}
            >
              <p className="text-[11px] font-bold text-violet-300 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-cyan-400" /> Perché conta nel lungo periodo
              </p>
              <p className="text-xs sm:text-sm text-slate-100 leading-relaxed">
                {currentArticle.whyCounts}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Floating Navigation & Actions Bar */}
      <div className="w-full max-w-xl mx-auto flex items-center justify-between gap-3 pt-2 pb-4 z-20">
        <button
          onClick={goToPrev}
          disabled={currentIndex === 0}
          className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Precedente</span>
        </button>

        {/* Center Quick Actions: Audio, Bookmark, Share */}
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              triggerHaptic(15);
              onPlayArticleAudio(currentArticle);
            }}
            className="p-2.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30 transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)]"
            title="Ascolta sintesi vocale"
          >
            <Volume2 className="w-4 h-4" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              triggerHaptic(20);
              onToggleBookmark(currentArticle);
            }}
            className={`p-2.5 rounded-full border transition-all ${
              bookmarked
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
            }`}
            title={bookmarked ? 'Rimuovi dai salvati' : 'Salva per dopo'}
          >
            <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-amber-400' : ''}`} />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={async () => {
              triggerHaptic(15);
              if (navigator.share) {
                try {
                  await navigator.share({
                    title: currentArticle.title,
                    text: currentArticle.summary,
                    url: currentArticle.sourceUrl,
                  });
                } catch {}
              } else if (navigator.clipboard) {
                await navigator.clipboard.writeText(`${currentArticle.title}\n${currentArticle.sourceUrl}`);
                onShowToast('Link copiato negli appunti!', 'success');
              }
            }}
            className="p-2.5 rounded-full bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10 transition-all"
            title="Condividi"
          >
            <Share2 className="w-4 h-4" />
          </motion.button>
        </div>

        <button
          onClick={goToNext}
          className="flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 transition-all shadow-[0_0_15px_rgba(124,58,237,0.3)]"
        >
          <span>{currentIndex === articles.length - 1 ? 'Fine' : 'Prossima'}</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}
