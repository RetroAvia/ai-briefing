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
      if (!e || !e.key) return;
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
      x: dir > 0 ? 250 : -250,
      opacity: 0,
      scale: 0.96,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: { duration: 0.3, ease: [0.32, 0.72, 0, 1] },
    },
    exit: (dir: number) => ({
      x: dir < 0 ? 250 : -250,
      opacity: 0,
      scale: 0.96,
      transition: { duration: 0.25, ease: 'easeIn' },
    }),
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-[#000000]/90 backdrop-blur-2xl flex flex-col items-center justify-between p-4 sm:p-6 overflow-hidden selection:bg-[#2997ff]/30"
    >
      {/* Background ambient lighting */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute -top-32 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full opacity-20 blur-3xl transition-all duration-500"
          style={{ background: `radial-gradient(circle, ${config.accentHex}, transparent 70%)` }}
        />
      </div>

      {/* Top Bar: Progress Bar + Close */}
      <div className="w-full max-w-xl mx-auto pt-2 z-20">
        <div className="flex items-center gap-1.5 mb-3">
          {articles.map((_, i) => (
            <div key={i} className="flex-1 h-1.5 rounded-full bg-white/15 overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  i < currentIndex
                    ? 'w-full bg-white'
                    : i === currentIndex
                    ? 'w-full bg-[#2997ff]'
                    : 'w-0'
                }`}
              />
            </div>
          ))}
        </div>

        {/* Header con indice e tasto chiudi */}
        <div className="flex items-center justify-between text-white pb-2">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#2997ff] flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#2997ff]" /> Metro Digest
            </span>
            <span className="text-xs text-[#86868b] font-semibold">
              {currentIndex + 1} di {articles.length}
            </span>
          </div>

          <button
            onClick={() => {
              triggerHaptic(15);
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-[#86868b] hover:text-white flex items-center justify-center transition-colors"
            title="Esci da Stories"
          >
            <X className="w-4 h-4" />
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
            className="rounded-[28px] p-6 sm:p-7 border backdrop-blur-3xl shadow-2xl overflow-y-auto max-h-[75vh]"
            style={{
              background: 'rgba(24, 24, 30, 0.95)',
              borderColor: 'rgba(255, 255, 255, 0.12)',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
            }}
          >
            {/* Categoria + Fonte + Tempo */}
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border tracking-wide ${config.bgColor} ${config.borderColor} ${config.color}`}
                >
                  {currentArticle.category}
                </span>
                <span className="text-xs text-[#86868b] font-semibold uppercase tracking-wider">
                  {currentArticle.source}
                </span>
              </div>
              <div className="flex items-center gap-1 text-[#86868b] text-xs font-medium">
                <Clock className="w-3.5 h-3.5" />
                <span>{currentArticle.readingTimeMinutes} min</span>
              </div>
            </div>

            {/* Titolo Principale Incisivo */}
            <h2 className="text-xl sm:text-2xl font-extrabold text-white leading-tight mb-3.5 tracking-[-0.025em]">
              {currentArticle.title}
            </h2>

            {/* Sintesi Chiara */}
            <p className="text-sm sm:text-base text-[#d2d2d7] leading-relaxed mb-5 font-normal">
              {currentArticle.summary}
            </p>

            {/* Box 3 Punti Chiave */}
            <div className="space-y-2.5 mb-5 p-4 rounded-2xl bg-white/[0.04] border border-white/[0.06]">
              <span className="text-[10px] font-bold tracking-[0.08em] uppercase text-[#86868b] block mb-1">
                Punti Salienti
              </span>
              {(currentArticle.keyPoints || []).map((point, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <span
                    className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold mt-0.5 bg-white/[0.08] text-white"
                  >
                    {i + 1}
                  </span>
                  <p className="text-xs sm:text-sm text-[#d2d2d7] leading-relaxed">{point}</p>
                </div>
              ))}
            </div>

            {/* Takeaway Perché Conta */}
            <div
              className="p-4 sm:p-5 rounded-2xl border"
              style={{
                background: 'rgba(41, 151, 255, 0.06)',
                borderColor: 'rgba(41, 151, 255, 0.22)',
              }}
            >
              <p className="text-[11px] font-bold text-[#2997ff] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#2997ff]" /> Perché conta nel lungo periodo
              </p>
              <p className="text-xs sm:text-sm text-[#f5f5f7] leading-relaxed font-medium">
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
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold text-[#86868b] hover:text-white bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.08] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
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
            className="w-10 h-10 rounded-full bg-[#2997ff]/15 text-[#2997ff] border border-[#2997ff]/30 hover:bg-[#2997ff]/25 flex items-center justify-center transition-all shadow-sm"
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
            className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all ${
              bookmarked
                ? 'bg-[#ff9f0a]/20 text-[#ff9f0a] border-[#ff9f0a]/40 shadow-sm'
                : 'bg-white/[0.06] text-[#86868b] border-white/[0.08] hover:bg-white/[0.12] hover:text-white'
            }`}
            title={bookmarked ? 'Rimuovi dai salvati' : 'Salva per dopo'}
          >
            <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-current' : ''}`} />
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
            className="w-10 h-10 rounded-full bg-white/[0.06] text-[#86868b] border border-white/[0.08] hover:bg-white/[0.12] hover:text-white flex items-center justify-center transition-all"
            title="Condividi"
          >
            <Share2 className="w-4 h-4" />
          </motion.button>
        </div>

        <button
          onClick={goToNext}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold text-white shadow-md transition-all"
          style={{
            background: 'linear-gradient(135deg, #0071e3 0%, #2997ff 100%)',
          }}
        >
          <span>{currentIndex === articles.length - 1 ? 'Fine' : 'Prossima'}</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}
