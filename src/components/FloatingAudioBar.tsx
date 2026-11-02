'use client';

import { motion } from 'framer-motion';
import { Play, Pause, SkipForward, SkipBack, X, Volume2, Sparkles, Waves } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import type { Article } from '@/types';
import { triggerHaptic } from '@/lib/export';
import { playSoftClick, toggleDeepSpaceAmbient, isAmbientSoundPlaying } from '@/lib/sound';

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
  const [isAmbientActive, setIsAmbientActive] = useState(false);

  useEffect(() => {
    if (currentArticleId) {
      const idx = articles.findIndex((a) => a.id === currentArticleId);
      if (idx !== -1) setCurrentIndex(idx);
    }
  }, [currentArticleId, articles]);

  useEffect(() => {
    setIsAmbientActive(isAmbientSoundPlaying());
  }, []);

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
    playSoftClick(850);
    triggerHaptic(15);
    if (typeof window === 'undefined' || !('speechSynthesis' in window) || !window.speechSynthesis) return;

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
    playSoftClick(750);
    triggerHaptic(15);
    if (currentIndex < articles.length - 1) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      if (isPlaying) speak(nextIdx, speed);
      else onArticleChange(articles[nextIdx]?.id || '');
    }
  };

  const prevArticle = () => {
    playSoftClick(650);
    triggerHaptic(15);
    if (currentIndex > 0) {
      const prevIdx = currentIndex - 1;
      setCurrentIndex(prevIdx);
      if (isPlaying) speak(prevIdx, speed);
      else onArticleChange(articles[prevIdx]?.id || '');
    }
  };

  const cycleSpeed = () => {
    playSoftClick(950);
    triggerHaptic(10);
    const speeds = [1.0, 1.25, 1.5, 1.8];
    const curIdx = speeds.indexOf(speed);
    const nextSpeed = speeds[(curIdx + 1) % speeds.length] ?? 1.0;
    setSpeed(nextSpeed);
    if (isPlaying) {
      speak(currentIndex, nextSpeed);
    }
  };

  const handleToggleAmbient = () => {
    playSoftClick(550);
    triggerHaptic(20);
    const newState = !isAmbientActive;
    toggleDeepSpaceAmbient(newState);
    setIsAmbientActive(newState);
  };

  const stopAndClose = () => {
    playSoftClick(400);
    triggerHaptic(15);
    if (typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    toggleDeepSpaceAmbient(false);
    setIsAmbientActive(false);
    setIsPlaying(false);
    onClose();
  };

  if (!currentArticle) return null;

  return (
    <motion.div
      initial={{ y: 50, opacity: 0, scale: 0.95 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      exit={{ y: 50, opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
      className="fixed bottom-4 sm:bottom-6 left-3 right-3 sm:left-auto sm:right-6 sm:w-[460px] z-50 p-3 sm:p-3.5 rounded-full border shadow-2xl"
      style={{
        background: 'rgba(12, 12, 18, 0.94)',
        backdropFilter: 'blur(35px) saturate(200%)',
        WebkitBackdropFilter: 'blur(35px) saturate(200%)',
        borderColor: 'rgba(255, 255, 255, 0.14)',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.9), 0 0 1px 1px rgba(255, 255, 255, 0.1)',
      }}
    >
      <div className="flex items-center justify-between gap-2.5 px-1">
        {/* Left: Waveform Icon + Info */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="w-8 h-8 rounded-full bg-[#2997ff]/15 border border-[#2997ff]/30 flex items-center justify-center flex-shrink-0 text-[#2997ff]">
            <Volume2 className="w-4 h-4" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.06em] text-[#2997ff]">
                Vocal Synthesis ({currentIndex + 1}/{articles.length})
              </span>
              {/* Futuristic Waveform Bars */}
              {isPlaying && (
                <div className="flex items-center gap-0.5">
                  {[0.3, 0.9, 0.5, 1, 0.4, 0.8, 0.6].map((h, i) => (
                    <motion.div
                      key={i}
                      animate={{ height: ['3px', `${Math.round(h * 13)}px`, '3px'] }}
                      transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.08 }}
                      className="w-0.5 bg-gradient-to-t from-[#0071e3] to-[#64d2ff] rounded-full"
                    />
                  ))}
                </div>
              )}
            </div>
            <p className="text-xs font-bold text-white truncate tracking-[-0.01em]">
              {currentArticle.title}
            </p>
          </div>
        </div>

        {/* Right: Controls */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {/* Deep Space 432Hz Drone Focus Button */}
          <button
            onClick={handleToggleAmbient}
            className={`p-1.5 rounded-full transition-all cursor-pointer ${
              isAmbientActive
                ? 'bg-[#bf5af2]/30 border border-[#bf5af2]/50 text-[#bf5af2] shadow-[0_0_12px_rgba(191,90,242,0.4)]'
                : 'text-[#86868b] hover:text-white bg-white/[0.04]'
            }`}
            title={isAmbientActive ? 'Disattiva Deep Space Drone (432Hz)' : 'Attiva 432Hz Deep Space Ambient Focus'}
          >
            <Waves className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={prevArticle}
            disabled={currentIndex === 0}
            className="p-1.5 text-[#86868b] hover:text-white disabled:opacity-25 transition-colors cursor-pointer"
            title="Precedente"
          >
            <SkipBack className="w-3.5 h-3.5" />
          </button>

          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={togglePlay}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-white text-black font-bold shadow-md transition-all cursor-pointer"
          >
            {isPlaying ? (
              <Pause className="w-3.5 h-3.5 fill-black" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-black ml-0.5" />
            )}
          </motion.button>

          <button
            onClick={nextArticle}
            disabled={currentIndex === articles.length - 1}
            className="p-1.5 text-[#86868b] hover:text-white disabled:opacity-25 transition-colors cursor-pointer"
            title="Successiva"
          >
            <SkipForward className="w-3.5 h-3.5" />
          </button>

          {/* Speed Pill */}
          <button
            onClick={cycleSpeed}
            className="px-2 py-0.5 rounded-full text-[10px] font-bold text-[#f5f5f7] bg-white/10 hover:bg-white/20 transition-colors ml-0.5 cursor-pointer"
            title="Velocità sintesi vocale"
          >
            {speed}x
          </button>

          <button
            onClick={stopAndClose}
            className="p-1 text-[#86868b] hover:text-white transition-colors ml-0.5 cursor-pointer"
            title="Chiudi"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
