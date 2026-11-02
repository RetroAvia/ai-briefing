'use client';

import { motion } from 'framer-motion';
import { Play, Pause, Square, Volume2, Sparkles } from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import type { Article } from '@/types';

interface AudioPlayerProps {
  articles: Article[];
  currentArticleId?: string | null;
  onClose?: () => void;
}

export default function AudioPlayer({ articles, currentArticleId }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setIsSupported(true);
    }
  }, []);

  // Se viene passato un articolo specifico, imposta quell'indice
  useEffect(() => {
    if (currentArticleId) {
      const idx = articles.findIndex((a) => a.id === currentArticleId);
      if (idx !== -1) {
        setCurrentIndex(idx);
      }
    }
  }, [currentArticleId, articles]);

  const speakArticle = useCallback(
    (index: number) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

      window.speechSynthesis.cancel();

      if (index >= articles.length) {
        setIsPlaying(false);
        return;
      }

      const article = articles[index];
      if (!article) return;

      const textToRead = `Notizia ${index + 1}. Categoria: ${article.category}. Titolo: ${article.title}. Sintesi: ${article.summary}. Punti chiave: ${article.keyPoints.join('. ')}. Perché conta: ${article.whyCounts}.`;

      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.lang = 'it-IT';
      utterance.rate = 1.05;
      utterance.pitch = 1.0;

      // Trova la voce italiana se disponibile
      const voices = window.speechSynthesis.getVoices();
      const italianVoice = voices.find((v) => v.lang.startsWith('it') || v.lang === 'it_IT');
      if (italianVoice) {
        utterance.voice = italianVoice;
      }

      utterance.onend = () => {
        if (index + 1 < articles.length) {
          setCurrentIndex(index + 1);
          speakArticle(index + 1);
        } else {
          setIsPlaying(false);
          setCurrentIndex(0);
        }
      };

      utterance.onerror = () => {
        setIsPlaying(false);
      };

      window.speechSynthesis.speak(utterance);
      setIsPlaying(true);
    },
    [articles]
  );

  const togglePlay = () => {
    if (!isSupported) return;

    if (isPlaying) {
      window.speechSynthesis.pause();
      setIsPlaying(false);
    } else {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
        setIsPlaying(true);
      } else {
        speakArticle(currentIndex);
      }
    }
  };

  const stopAudio = () => {
    if (!isSupported) return;
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setCurrentIndex(0);
  };

  if (!isSupported || articles.length === 0) return null;

  const currentArticle = articles[currentIndex] || articles[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-3 sm:p-4 rounded-2xl border backdrop-blur-xl mb-6 relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.12) 0%, rgba(6, 182, 212, 0.08) 100%)',
        borderColor: 'rgba(124, 58, 237, 0.25)',
      }}
    >
      <div className="flex items-center justify-between gap-3">
        {/* Left: Info */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, #7c3aed 0%, #06b6d4 100%)',
              boxShadow: '0 0 14px rgba(124, 58, 237, 0.4)',
            }}
          >
            <Volume2 className="w-4 h-4 text-white" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="text-[10px] font-bold tracking-wider uppercase text-cyan-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Audio Briefing Vocale (100% Offline)
              </span>
              <span className="text-[10px] text-slate-500">• Notizia {currentIndex + 1} di {articles.length}</span>
            </div>
            <p className="text-xs font-semibold text-white truncate">
              {currentArticle?.title || 'Ascolta le notizie del giorno'}
            </p>
          </div>
        </div>

        {/* Right: Controls */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={togglePlay}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-white transition-all shadow-lg"
            style={{
              background: isPlaying
                ? 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)'
                : 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
            }}
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-white" />
                <span>Pausa</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Ascolta</span>
              </>
            )}
          </motion.button>

          {isPlaying && (
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={stopAudio}
              className="p-1.5 rounded-full text-slate-400 hover:text-white bg-slate-800/80 border border-slate-700/60"
              title="Ferma audio"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
            </motion.button>
          )}
        </div>
      </div>

      {/* Animated Sound Wave Indicator */}
      {isPlaying && (
        <div className="flex items-center gap-1 pt-2.5 mt-2.5 border-t border-white/5">
          <div className="flex items-center gap-0.5">
            {[0.4, 0.8, 0.5, 1, 0.6, 0.9, 0.4, 0.7].map((height, i) => (
              <motion.div
                key={i}
                animate={{ height: ['4px', `${Math.round(height * 16)}px`, '4px'] }}
                transition={{
                  repeat: Infinity,
                  duration: 0.8,
                  delay: i * 0.1,
                  ease: 'easeInOut',
                }}
                className="w-1 bg-cyan-400 rounded-full"
              />
            ))}
          </div>
          <span className="text-[10px] text-cyan-300 ml-2 font-medium">Riproduzione vocale in corso...</span>
        </div>
      )}
    </motion.div>
  );
}
