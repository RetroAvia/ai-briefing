'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, CheckCircle2, AlertCircle, RefreshCw, X, Radio, Cpu, Layers } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { DailyBriefing, Category } from '@/types';
import { triggerHaptic } from '@/lib/export';

interface GenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (newBriefing: DailyBriefing) => void;
  preferredCategories?: Category[];
  isOnline: boolean;
}

const STEPS = [
  {
    title: 'Scansione Fonti RSS Globali',
    desc: 'Recupero feed di aerospazio, tecnologia, mercati e geopolitica in tempo reale',
    icon: Radio,
  },
  {
    title: 'Sintesi Neurale e Structured Outputs',
    desc: 'Elaborazione dei takeaway strategici e dei 3 punti chiave per ogni fatto',
    icon: Cpu,
  },
  {
    title: 'Bilanciamento e Prioritizzazione',
    desc: 'Assicurazione che nessuna categoria resti vuota e ordinamento per preferenze',
    icon: Layers,
  },
];

export default function GenerationModal({
  isOpen,
  onClose,
  onComplete,
  preferredCategories = [],
  isOnline,
}: GenerationModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [status, setStatus] = useState<'idle' | 'running' | 'success' | 'error'>('idle');
  const [errorText, setErrorText] = useState('');
  const [resultBriefing, setResultBriefing] = useState<DailyBriefing | null>(null);

  // Avvia automaticamente la pipeline di generazione all'apertura del modal
  useEffect(() => {
    if (!isOpen) {
      setStatus('idle');
      setCurrentStep(0);
      setErrorText('');
      setResultBriefing(null);
      return;
    }

    let isMounted = true;

    async function runGeneration() {
      setStatus('running');
      setCurrentStep(0);
      triggerHaptic(15);

      // Step 1: Scansione
      await new Promise((r) => setTimeout(r, 600));
      if (!isMounted) return;
      setCurrentStep(1);
      triggerHaptic(15);

      try {
        const response = await fetch('/api/briefing/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ preferredCategories }),
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error || `Errore HTTP ${response.status}`);
        }

        const data = await response.json();
        if (!data.success || !data.briefing) {
          throw new Error(data.error || 'Dati del briefing non validi');
        }

        // Step 2 completato, passa a Step 3
        if (!isMounted) return;
        setCurrentStep(2);
        triggerHaptic(20);

        await new Promise((r) => setTimeout(r, 600));
        if (!isMounted) return;

        setResultBriefing(data.briefing);
        setStatus('success');
        triggerHaptic(25);

        // Notifica completamento al genitore dopo 700ms
        setTimeout(() => {
          if (isMounted) {
            onComplete(data.briefing);
            onClose();
          }
        }, 900);
      } catch (err: unknown) {
        console.warn('[GENERATE MODAL] Errore:', err);
        if (isMounted) {
          setStatus('error');
          setErrorText(err instanceof Error ? err.message : 'Impossibile generare il briefing');
          triggerHaptic(30);
        }
      }
    }

    runGeneration();

    return () => {
      isMounted = false;
    };
  }, [isOpen, preferredCategories, onComplete, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop Apple Frosted */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => {
            if (status !== 'running') onClose();
          }}
          className="fixed inset-0 bg-[#000000]/85 backdrop-blur-2xl transition-opacity"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
          className="relative w-full max-w-lg rounded-[28px] p-6 sm:p-8 border border-white/10 z-10 shadow-2xl overflow-hidden"
          style={{
            background: 'rgba(18, 18, 24, 0.96)',
            boxShadow: '0 30px 80px rgba(0, 0, 0, 0.9), inset 0 1px 0 rgba(255, 255, 255, 0.12)',
          }}
        >
          {/* Subtle Ambient Cosmic Glow */}
          <div
            className="absolute -top-24 -right-24 w-60 h-60 rounded-full pointer-events-none opacity-20"
            style={{
              background: 'radial-gradient(circle, #2997ff 0%, #64d2ff 50%, transparent 70%)',
            }}
          />

          {/* Close button (visibile solo se non in esecuzione) */}
          {status !== 'running' && (
            <button
              onClick={() => {
                triggerHaptic(10);
                onClose();
              }}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-[#86868b] hover:text-white flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* Header */}
          <div className="flex items-center gap-3.5 mb-6">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#0071e3] to-[#64d2ff] flex items-center justify-center flex-shrink-0 shadow-lg shadow-[#0071e3]/30">
              <Sparkles className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#64d2ff]">
                Generazione On-Demand
              </span>
              <h3 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
                Nuovo Briefing AI
              </h3>
            </div>
          </div>

          <p className="text-xs text-[#a1a1a6] leading-relaxed mb-6">
            L&apos;intelligenza artificiale scandaglia le ultime fonti, sintetizza i fatti chiave e
            garantisce che tutte le categorie di tuo interesse siano ricche di notizie fresche.
          </p>

          {/* Steps Sequence */}
          <div className="space-y-3.5 mb-6">
            {STEPS.map((step, idx) => {
              const Icon = step.icon;
              const isDone = status === 'success' || currentStep > idx;
              const isCurrent = status === 'running' && currentStep === idx;
              const isPending = currentStep < idx && status !== 'success';

              return (
                <div
                  key={step.title}
                  className={`p-3.5 rounded-2xl border transition-all flex items-start gap-3.5 ${
                    isCurrent
                      ? 'bg-[#2997ff]/10 border-[#2997ff]/40 shadow-sm'
                      : isDone
                      ? 'bg-white/[0.04] border-white/10 text-[#d2d2d7]'
                      : 'bg-white/[0.02] border-white/[0.04] opacity-50'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                      isDone
                        ? 'bg-[#30d158]/20 text-[#30d158]'
                        : isCurrent
                        ? 'bg-[#2997ff]/20 text-[#2997ff]'
                        : 'bg-white/5 text-[#86868b]'
                    }`}
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4 text-[#30d158]" />
                    ) : isCurrent ? (
                      <RefreshCw className="w-4 h-4 text-[#2997ff] animate-spin" />
                    ) : (
                      <Icon className="w-4 h-4" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-xs font-bold ${
                        isCurrent ? 'text-white' : isDone ? 'text-[#f5f5f7]' : 'text-[#86868b]'
                      }`}
                    >
                      {step.title}
                    </p>
                    <p className="text-[11px] text-[#86868b] leading-tight mt-0.5">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Error View */}
          {status === 'error' && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3.5 rounded-2xl bg-[#ff453a]/10 border border-[#ff453a]/30 mb-5 flex items-center gap-3 text-xs text-[#ff453a]"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <p className="font-semibold">{errorText || 'Errore durante la generazione'}</p>
            </motion.div>
          )}

          {/* Success Banner */}
          {status === 'success' && resultBriefing && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3.5 rounded-2xl bg-[#30d158]/10 border border-[#30d158]/30 mb-5 flex items-center gap-3 text-xs text-[#30d158]"
            >
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <p className="font-bold">
                {resultBriefing.articles.length} notizie create e salvate in locale per la lettura offline!
              </p>
            </motion.div>
          )}

          {/* Bottom Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            {status === 'running' ? (
              <span className="text-xs font-semibold text-[#86868b] flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#64d2ff]" />
                Generazione in corso...
              </span>
            ) : status === 'error' ? (
              <>
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-full text-xs font-semibold text-[#86868b] hover:text-white transition-colors"
                >
                  Annulla
                </button>
                <button
                  onClick={() => {
                    setStatus('idle');
                    setCurrentStep(0);
                  }}
                  className="px-5 py-2 rounded-full text-xs font-bold text-white bg-[#0071e3] hover:bg-[#0077ed] transition-colors shadow-md"
                >
                  Riprova
                </button>
              </>
            ) : status === 'success' ? (
              <button
                onClick={() => {
                  if (resultBriefing) onComplete(resultBriefing);
                  onClose();
                }}
                className="px-5 py-2 rounded-full text-xs font-bold text-white bg-[#30d158] hover:bg-[#34c759] transition-colors shadow-md"
              >
                Visualizza Briefing
              </button>
            ) : null}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
