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
  Send,
  MessageSquare,
  Bot,
  Orbit,
  Cpu,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { useState, useRef, useEffect, useMemo } from 'react';
import type { Article, FontSize } from '@/types';
import { CATEGORY_CONFIG } from '@/types';
import { triggerHaptic } from '@/lib/export';
import { playSoftClick } from '@/lib/sound';

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

type CognitiveLens = 'engineering' | 'future2050' | 'investor' | 'fast';

interface CopilotMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

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
  const [lens, setLens] = useState<CognitiveLens>('engineering');
  const [copied, setCopied] = useState(false);

  // Client-Side Neural Copilot State
  const [copilotMessages, setCopilotMessages] = useState<CopilotMessage[]>([]);
  const [copilotInput, setCopilotInput] = useState('');
  const [isCopilotTyping, setIsCopilotTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Reset copilot conversation when article changes
  useEffect(() => {
    if (article) {
      setCopilotMessages([
        {
          id: 'welcome',
          sender: 'assistant',
          text: `Neural Copilot 3000 online per "${article.title}". Puoi interrogarmi sui risvolti ingegneristici, implicazioni al 2050 o vincoli termodinamici.`,
          timestamp: 'Now',
        },
      ]);
    }
  }, [article]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [copilotMessages, isCopilotTyping]);

  if (!isOpen || !article) return null;

  const config = CATEGORY_CONFIG[article.category] || CATEGORY_CONFIG['Altro'];

  const cycleFontSize = () => {
    playSoftClick(700);
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

  // Heuristic engine answering offline questions directly on the article
  const generateCopilotAnswer = (question: string): string => {
    const qLower = question.toLowerCase();
    const isAerospace =
      article.category === 'Aerospazio & Aviazione' ||
      article.title.toLowerCase().includes('spazio') ||
      article.title.toLowerCase().includes('volo') ||
      article.title.toLowerCase().includes('razzo') ||
      article.title.toLowerCase().includes('orbita');

    if (qLower.includes('innovazion') || qLower.includes('tecnolog') || qLower.includes('ingegner')) {
      return `Sul piano ingegneristico, ${article.title} introduce un cambio di paradigma: la convergenza tra architetture scalabili e automazione predittiva. ${
        isAerospace
          ? 'In ambito aerospaziale, ottimizza il payload mass fraction, i cicli di spinta e la tolleranza al rientro atmosferico.'
          : 'Elimina le inefficienze dei workflow tradizionali grazie all’integrazione nativa di modelli deep-tech.'
      } L'effetto moltiplicatore è evidente nel primo pilastro: "${article.keyPoints[0] || article.summary}".`;
    }

    if (qLower.includes('nazioni') || qLower.includes('colossi') || qLower.includes('competitor') || qLower.includes('mercato')) {
      return `L'ecosistema dominante attorno a questa tecnologia vede in prima linea gli hub di Silicon Valley, i laboratori ESA/NASA e i consorzi deep-tech europei. La competizione globale si concentra sull'accesso proprietario all'infrastruttura di calcolo, ai brevetti sui nuovi materiali e alle catene di fornitura aerospaziale a ciclo chiuso.`;
    }

    if (qLower.includes('colli') || qLower.includes('bottiglia') || qLower.includes('rischi') || qLower.includes('limiti') || qLower.includes('fisic')) {
      return `I vincoli primari sono due: la densità energetica e la dissipazione termica dei sistemi avanzati. Come evidenziato nell'analisi strategica ("${article.whyCounts}"), superare questa barriera richiede test strutturali estremi e un quadro regolatorio in grado di assorbire l'accelerazione tecnologica senza compromettere la safety.`;
    }

    if (qLower.includes('2050') || qLower.includes('futuro') || qLower.includes('singolarità')) {
      return `Proiettando questo trend all'orizzonte 2050: la standardizzazione di questo principio renderà completamente autonome le operazioni complesse. Per ${article.category}, ciò implica una riduzione dei costi operativi dell'80% e una capacità di scalare senza attriti fisici convenzionali.`;
    }

    return `Analizzando i dati integrati di "${article.title}": la correlazione chiave risiede in "${article.whyCounts}". Gli elementi portanti (${article.keyPoints.slice(0, 2).join(' e ')}) confermano una traiettoria di adozione rapida con impatto diretto sul settore ${article.category}.`;
  };

  const handleAskQuestion = (q: string) => {
    if (!q.trim()) return;
    playSoftClick(850);
    triggerHaptic(15);

    const userMsg: CopilotMessage = {
      id: Math.random().toString(36).substring(2, 9),
      sender: 'user',
      text: q.trim(),
      timestamp: 'Now',
    };

    setCopilotMessages((prev) => [...prev, userMsg]);
    setCopilotInput('');
    setIsCopilotTyping(true);

    setTimeout(() => {
      const answer = generateCopilotAnswer(q);
      const assistantMsg: CopilotMessage = {
        id: Math.random().toString(36).substring(2, 9),
        sender: 'assistant',
        text: answer,
        timestamp: 'Now',
      };
      setCopilotMessages((prev) => [...prev, assistantMsg]);
      setIsCopilotTyping(false);
      playSoftClick(600);
      triggerHaptic(10);
    }, 450);
  };

  const quickPrompts = [
    { label: 'Innovazioni ingegneristiche', q: 'Quali innovazioni ingegneristiche abilita questa svolta?' },
    { label: 'Competitor & Nazioni', q: 'Quali nazioni e colossi industriali dominano questo stack?' },
    { label: 'Colli di bottiglia fisici', q: 'Quali sono i colli di bottiglia fisici, termici o energetici?' },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
        {/* Apple Frosted Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => {
            playSoftClick(500);
            triggerHaptic(15);
            onClose();
          }}
          className="fixed inset-0 bg-[#000000]/80 backdrop-blur-xl transition-opacity"
        />

        {/* Sliding Drawer Container */}
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 32, stiffness: 350 }}
          className="relative w-full max-w-2xl bg-[#121217]/95 backdrop-blur-3xl border-l border-white/[0.1] h-full overflow-y-auto flex flex-col z-10 shadow-2xl p-5 sm:p-8"
          style={{
            boxShadow: '-25px 0 60px rgba(0, 0, 0, 0.85), inset 1px 0 0 rgba(255, 255, 255, 0.08)',
          }}
        >
          {/* Top Sticky Bar */}
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-4 mb-5 sticky top-0 bg-[#121217]/95 backdrop-blur-2xl z-20 -mx-5 px-5 sm:-mx-8 sm:px-8">
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
                className="px-2.5 py-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.08] text-[#86868b] hover:text-white transition-all text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                title="Dimensione testo"
              >
                <Type className="w-3.5 h-3.5" />
                <span className="text-[10px] uppercase">{fontSize}</span>
              </button>

              {/* Bookmark */}
              <button
                onClick={() => {
                  playSoftClick(900);
                  triggerHaptic(20);
                  onToggleBookmark(article);
                }}
                className={`p-2 rounded-full border transition-all cursor-pointer ${
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
                  playSoftClick(500);
                  triggerHaptic(15);
                  onClose();
                }}
                className="w-8 h-8 rounded-full bg-white/[0.08] hover:bg-white/[0.15] text-[#86868b] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                title="Chiudi"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Article Header */}
          <div className="space-y-4 mb-5">
            <div className="flex items-center gap-2 text-xs text-[#86868b]">
              <Clock className="w-3.5 h-3.5 text-[#2997ff]" />
              <span>{article.readingTimeMinutes} min lettura</span>
              <span>•</span>
              <span className="text-[#30d158] font-semibold">100% Offline IndexedDB</span>
              {article.impactScore && (
                <>
                  <span>•</span>
                  <span className="text-[#bf5af2] font-bold">Impatto {article.impactScore}/100</span>
                </>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white leading-tight tracking-[-0.025em]">
              {article.title}
            </h1>

            {/* Futuristic 4-Perspective Cognitive Switcher */}
            <div className="p-1 rounded-2xl bg-white/[0.04] border border-white/[0.08] grid grid-cols-2 sm:grid-cols-4 gap-1">
              {/* Engineering Lens */}
              <button
                onClick={() => {
                  playSoftClick(750);
                  triggerHaptic(10);
                  setLens('engineering');
                }}
                className={`relative py-2 px-2 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  lens === 'engineering' ? 'text-white' : 'text-[#86868b] hover:text-[#d2d2d7]'
                }`}
              >
                {lens === 'engineering' && (
                  <motion.div
                    layoutId="activeLens"
                    className="absolute inset-0 rounded-xl bg-[#64d2ff]/20 border border-[#64d2ff]/40 shadow-sm"
                    transition={{ type: 'spring', damping: 28, stiffness: 400 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-[#64d2ff]" />
                  <span>Ingegneria</span>
                </span>
              </button>

              {/* Scenario 2050 Lens */}
              <button
                onClick={() => {
                  playSoftClick(850);
                  triggerHaptic(10);
                  setLens('future2050');
                }}
                className={`relative py-2 px-2 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  lens === 'future2050' ? 'text-white' : 'text-[#86868b] hover:text-[#d2d2d7]'
                }`}
              >
                {lens === 'future2050' && (
                  <motion.div
                    layoutId="activeLens"
                    className="absolute inset-0 rounded-xl bg-[#bf5af2]/20 border border-[#bf5af2]/40 shadow-sm"
                    transition={{ type: 'spring', damping: 28, stiffness: 400 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  <Orbit className="w-3.5 h-3.5 text-[#bf5af2]" />
                  <span>Vision 2050</span>
                </span>
              </button>

              {/* Market Investor Lens */}
              <button
                onClick={() => {
                  playSoftClick(950);
                  triggerHaptic(10);
                  setLens('investor');
                }}
                className={`relative py-2 px-2 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  lens === 'investor' ? 'text-white' : 'text-[#86868b] hover:text-[#d2d2d7]'
                }`}
              >
                {lens === 'investor' && (
                  <motion.div
                    layoutId="activeLens"
                    className="absolute inset-0 rounded-xl bg-[#30d158]/20 border border-[#30d158]/40 shadow-sm"
                    transition={{ type: 'spring', damping: 28, stiffness: 400 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-[#30d158]" />
                  <span>Mercati</span>
                </span>
              </button>

              {/* Flash 30s Lens */}
              <button
                onClick={() => {
                  playSoftClick(1050);
                  triggerHaptic(10);
                  setLens('fast');
                }}
                className={`relative py-2 px-2 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  lens === 'fast' ? 'text-white' : 'text-[#86868b] hover:text-[#d2d2d7]'
                }`}
              >
                {lens === 'fast' && (
                  <motion.div
                    layoutId="activeLens"
                    className="absolute inset-0 rounded-xl bg-[#ff9f0a]/20 border border-[#ff9f0a]/40 shadow-sm"
                    transition={{ type: 'spring', damping: 28, stiffness: 400 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-[#ff9f0a]" />
                  <span>Flash 30s</span>
                </span>
              </button>
            </div>
          </div>

          {/* Perspective Dynamic Content */}
          <div className="space-y-5 flex-1">
            {/* LENS 1: DEEP-TECH INGEGNERIA */}
            {lens === 'engineering' && (
              <div className="space-y-4">
                <div
                  className="p-5 rounded-2xl border"
                  style={{
                    background: 'rgba(100, 210, 255, 0.05)',
                    borderColor: 'rgba(100, 210, 255, 0.25)',
                  }}
                >
                  <div className="flex items-center gap-2 text-[#64d2ff] text-xs font-bold uppercase tracking-wider mb-2">
                    <Cpu className="w-4 h-4 text-[#64d2ff]" />
                    <span>Analisi Deep-Tech & Architettura di Sistema</span>
                  </div>
                  <p className={`text-[#e5e5ea] leading-relaxed ${getFontSizeClass()}`}>
                    {article.summary}
                  </p>
                </div>

                {/* 3 Pilastri Ingegneristici */}
                <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-3.5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#64d2ff] flex items-center gap-2">
                    <Layers className="w-3.5 h-3.5 text-[#64d2ff]" />
                    Specifiche Chiave & Parametri Operativi
                  </h3>
                  {(article.keyPoints || []).map((point, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5 bg-[#64d2ff]/15 text-[#64d2ff] border border-[#64d2ff]/30">
                        {i + 1}
                      </span>
                      <p className={`text-[#d2d2d7] leading-relaxed ${getFontSizeClass()}`}>
                        {point}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Colli di bottiglia e fisica */}
                <div
                  className="p-4 rounded-xl border text-xs"
                  style={{
                    background: 'rgba(255, 69, 58, 0.05)',
                    borderColor: 'rgba(255, 69, 58, 0.2)',
                  }}
                >
                  <strong className="text-[#ff453a] block mb-1 uppercase tracking-wide">
                    Fattore Critico di Scalabilità:
                  </strong>
                  <p className="text-[#f5f5f7] leading-relaxed">{article.whyCounts}</p>
                </div>
              </div>
            )}

            {/* LENS 2: SCENARIO 2050 */}
            {lens === 'future2050' && (
              <div
                className="p-5 sm:p-6 rounded-2xl border space-y-4"
                style={{
                  background: 'rgba(191, 90, 242, 0.05)',
                  borderColor: 'rgba(191, 90, 242, 0.25)',
                }}
              >
                <div className="flex items-center gap-2 text-[#bf5af2] text-xs font-bold uppercase tracking-wider">
                  <Orbit className="w-4 h-4 text-[#bf5af2]" />
                  <span>Proiezione Orizzonte 2050 & Singolarità</span>
                </div>
                <p className={`text-[#f5f5f7] leading-relaxed ${getFontSizeClass()}`}>
                  Questa svolta in <strong className="text-white">{article.category}</strong>{' '}
                  innesca un effetto valanga a 25 anni. Nella seconda derivata di adozione, le
                  architetture legacy verranno rimpiazzate da sistemi auto-evolutivi a densità
                  massima.
                </p>
                <div className="p-4 rounded-xl bg-black/40 border border-[#bf5af2]/20 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#bf5af2] font-bold">Impatto di Secondo Ordine (2035):</span>
                    <span className="text-[#30d158] font-mono">Disruption 85%</span>
                  </div>
                  <p className="text-xs text-[#a1a1a6]">
                    Integrazione con cluster computazionali a fusione o satellitari in orbita LEO.
                  </p>
                  <div className="flex items-center justify-between text-xs pt-2 border-t border-white/[0.06]">
                    <span className="text-[#bf5af2] font-bold">Orizzonte 2050:</span>
                    <span className="text-[#64d2ff] font-mono">Post-Scarsità</span>
                  </div>
                  <p className="text-xs text-[#d2d2d7]">{article.whyCounts}</p>
                </div>
              </div>
            )}

            {/* LENS 3: INVESTOR & MERCATI */}
            {lens === 'investor' && (
              <div
                className="p-5 sm:p-6 rounded-2xl border space-y-4"
                style={{
                  background: 'rgba(48, 209, 88, 0.05)',
                  borderColor: 'rgba(48, 209, 88, 0.25)',
                }}
              >
                <div className="flex items-center gap-2 text-[#30d158] text-xs font-bold uppercase tracking-wider">
                  <Briefcase className="w-4 h-4 text-[#30d158]" />
                  <span>Implicazioni Economiche e Valutazioni</span>
                </div>
                <p className={`text-[#e5e5ea] leading-relaxed ${getFontSizeClass()}`}>
                  Questa notizia incide direttamente sui multipli settoriali di{' '}
                  <strong className="text-white">{article.category}</strong>. L&apos;adozione su
                  larga scala crea forti barriere d&apos;ingresso (moat tecnologico) per i first-mover.
                </p>
                <div className="p-4 rounded-xl bg-black/40 border border-[#30d158]/20 text-xs text-[#d2d2d7]">
                  <strong className="text-white block mb-1">Takeaway Finanziario:</strong>
                  {article.whyCounts}
                </div>
              </div>
            )}

            {/* LENS 4: FLASH 30s */}
            {lens === 'fast' && (
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

            {/* NEURAL COPILOT 3000 (Apple VisionOS Glass Q&A Panel) */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-[#2997ff]/20 border border-[#2997ff]/40 flex items-center justify-center">
                    <Bot className="w-3.5 h-3.5 text-[#2997ff]" />
                  </div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                    Neural Copilot <Sparkles className="w-3 h-3 text-[#2997ff]" />
                  </h3>
                </div>
                <span className="text-[10px] text-[#30d158] font-mono bg-[#30d158]/10 px-2 py-0.5 rounded-full border border-[#30d158]/20">
                  Ready • 0ms Latency
                </span>
              </div>

              {/* Quick Prompt Pills */}
              <div className="flex flex-wrap gap-1.5">
                {quickPrompts.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAskQuestion(p.q)}
                    className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-white/[0.05] hover:bg-white/[0.12] border border-white/[0.08] text-[#a1a1a6] hover:text-white transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <span>{p.label}</span>
                    <ArrowRight className="w-2.5 h-2.5 text-[#2997ff]" />
                  </button>
                ))}
              </div>

              {/* Chat Thread */}
              <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                {copilotMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-[#0071e3] text-white font-medium rounded-tr-none'
                          : 'bg-white/[0.06] text-[#e5e5ea] border border-white/[0.08] rounded-tl-none'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
                {isCopilotTyping && (
                  <div className="flex justify-start">
                    <div className="bg-white/[0.06] border border-white/[0.08] rounded-2xl rounded-tl-none px-3.5 py-2.5 text-xs text-[#86868b] flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#2997ff] animate-ping" />
                      <span>Elaborazione neurale in corso...</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Prompt Input Box */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  value={copilotInput}
                  onChange={(e) => setCopilotInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAskQuestion(copilotInput);
                    }
                  }}
                  placeholder="Fai una domanda sull'articolo..."
                  className="flex-1 bg-black/40 border border-white/[0.1] rounded-full px-3.5 py-2 text-xs text-white placeholder-[#86868b] focus:outline-none focus:border-[#2997ff] transition-all"
                />
                <button
                  onClick={() => handleAskQuestion(copilotInput)}
                  disabled={!copilotInput.trim()}
                  className="w-8 h-8 rounded-full bg-[#2997ff] disabled:opacity-30 text-white flex items-center justify-center transition-all cursor-pointer flex-shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Floating Bar in Drawer */}
          <div className="pt-4 mt-5 border-t border-white/[0.08] flex items-center justify-between gap-3 sticky bottom-0 bg-[#121217]/95 backdrop-blur-2xl -mx-5 px-5 sm:-mx-8 sm:px-8 pb-2">
            <button
              onClick={() => {
                playSoftClick(800);
                triggerHaptic(15);
                onPlayAudio(article);
              }}
              className="flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-full text-xs font-bold text-white shadow-lg transition-all cursor-pointer"
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
                  playSoftClick(900);
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
                className="w-9 h-9 rounded-full text-[#86868b] hover:text-white bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.08] flex items-center justify-center transition-colors cursor-pointer"
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
                    playSoftClick(400);
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
