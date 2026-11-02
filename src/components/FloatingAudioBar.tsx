'use client';

import { motion } from 'framer-motion';
import { Play, Pause, SkipForward, SkipBack, X, Volume2, Gauge } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import type { Article } from '@/types';
import { triggerHaptic } from '@/lib/export';

interface FloatingAudioBarProps {
  articles: Article[];
  currentArticleId: string | null;
  onClose: () => void;
  onArticleChange: (articleId: string) => void;
}

export default function FloatingAudioBar({
  articles,
  currentArticleId,
  onClose,
  onArticleChange,
}: FloatingAudioBarProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState<number>(1.1);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Trova indice iniziale
  useEffect(() => {
    if (currentArticleId) {
      const idx = articles.findIndex((a) => a.id === currentArticleId);
      if (idx !== -1) setCurrentIndex(idx);
    }
  }, [currentArticleId, articles]);

  const currentArticle = articles[currentIndex] || articles[0];

  const speak = useCallback(
    (index: number, currentSpeed: number) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
      window.speechSynthesis.cancel();

      if (index >= articles.length || index < 0) {
        setIsPlaying(false);
        return;
      }

      const art = articles[index];
      if (!art) return;

      onArticleChange(art.id);

      const text = `Notizia ${index + 1}. ${art.category}. ${art.title}. Sintesi: ${art.summary}. Punti chiave: ${art.keyPoints.join('. ')}. Perché conta: ${art.whyCounts}.`;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'it-IT';
      utterance.rate = currentSpeed;
      utterance.pitch = 1.0;

      const voices = window.speechSynthesis.getVoices();
      const itVoice = voices.find((v) => v.lang.startsWith('it') || v.lang === 'it_IT');
      if (itVoice) utterance.voice = itVoice;

      utterance.onend = () => {
        if (index + 1 < articles.length) {
          setCurrentIndex(index + 1);
          speak(index + 1, currentSpeed);
        } else {
          setIsPlaying(false);
        }
      };

      utterance.onerror = () => setIsPlaying(false);

      window.speechSynthesis.speak(utterance);
      setIsPlaying(true);
    },
    [articles, onArticleChange]
  );

  const togglePlay = () => {
    triggerHaptic(15);
    if (isPlaying) {
      window.speechSynthesis.pause();
      setIsPlaying(false);
    } else {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
        setIsPlaying(true);
      } else {
        speak(currentIndex, speed);
      }
    }
  };

  const nextArticle = () => {
    triggerHaptic(15);
    if (currentIndex < articles.length - 1) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      if (isPlaying) speak(nextIdx, speed);
      else onArticleChange(articles[nextIdx]?.id || '');
    }
  };

  const prevArticle = () => {
    triggerHaptic(15);
    if (currentIndex > 0) {
      const prevIdx = currentIndex - 1;
      setCurrentIndex(prevIdx);
      if (isPlaying) speak(prevIdx, speed);
      else onArticleChange(articles[prevIdx]?.id || '');
    }
  };

  const cycleSpeed = () => {
    triggerHaptic(10);
    const speeds = [1.0, 1.25, 1.5, 1.8];
    const curIdx = speeds.indexOf(speed);
    const nextSpeed = speeds[(curIdx + 1) % speeds.length] ?? 1.0;
    setSpeed(nextSpeed);
    if (isPlaying) {
      speak(currentIndex, nextSpeed);
    }
  };

  const stopAndClose = () => {
    triggerHaptic(15);
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    onClose();
  };

  if (!currentArticle) return null;

  return (
    <motion.div
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 80, opacity: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="fixed bottom-3 sm:bottom-5 left-3 right-3 sm:left-auto sm:right-5 sm:max-w-lg w-auto z-40 p-3 sm:p-3.5 rounded-2xl border backdrop-blur-2xl shadow-2xl"
      style={{
        background: 'rgba(15, 18, 28, 0.92)',
        borderColor: 'rgba(124, 58, 237, 0.35)',
        boxShadow: '0 15px 40px rgba(0, 0, 0, 0.7), 0 0 25px rgba(124, 58, 237, 0.25)',
      }}
    >
      <div className="flex items-center justify-between gap-3">
        {/* Left: Animated Icon + Title */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, #7c3aed 0%, #06b6d4 100%)',
              boxShadow: '0 0 12px rgba(124, 58, 237, 0.5)',
            }}
          >
            <Volume2 className="w-4 h-4 text-white" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-cyan-400">
                Sintesi Vocale ({currentIndex + 1}/{articles.length})
              </span>
              {isPlaying && (
                <div className="flex items-center gap-0.5 ml-1">
                  {[0.5, 1, 0.6, 0.9].map((h, i) => (
                    <motion.div
                      key={i}
                      animate={{ height: ['3px', `${Math.round(h * 12)}px`, '3px'] }}
                      transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.1 }}
                      className="w-0.5 bg-cyan-400 rounded-full"
                    />
                  ))}
                </div>
              )}
            </div>
            <p className="text-xs font-bold text-white truncate">{currentArticle.title}</p>
          </div>
        </div>

        {/* Right: Controls (Prev, Play, Next, Speed, Close) */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={prevArticle}
            disabled={currentIndex === 0}
            className="p-1 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Notizia precedente"
          >
            <SkipBack className="w-3.5 h-3.5" />
          </button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={togglePlay}
            className="w-7 h-7 rounded-full flex items-center justify-center text-white transition-all shadow-md"
            style={{
              background: isPlaying
                ? 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)'
                : 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
            }}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5 fill-white" /> : <Play className="w-3.5 h-3.5 fill-white" />}
          </motion.button>

          <button
            onClick={nextArticle}
            disabled={currentIndex === articles.length - 1}
            className="p-1 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Notizia successiva"
          >
            <SkipForward className="w-3.5 h-3.5" />
          </button>

          {/* Speed Toggle */}
          <button
            onClick={cycleSpeed}
            className="px-1.5 py-0.5 rounded text-[10px] font-bold text-slate-300 bg-white/5 hover:bg-white/10 border border-white/10 transition-colors ml-1"
            title="Velocità di riproduzione"
          >
            {speed}x
          </button>

          {/* Close */}
          <button
            onClick={stopAndClose}
            className="p-1 text-slate-500 hover:text-white transition-colors ml-1"
            title="Chiudi lettore"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
