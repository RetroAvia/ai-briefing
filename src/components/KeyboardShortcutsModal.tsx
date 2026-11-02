'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Command, Sparkles, Keyboard } from 'lucide-react';
import { triggerHaptic } from '@/lib/export';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SHORTCUTS = [
  { key: 'K', label: 'Cmd / Ctrl + K', desc: 'Attiva Spotlight Search istantanea' },
  { key: 'Space', label: 'Spazio', desc: 'Riproduci / Metti in pausa rassegna vocale' },
  { key: 'S', label: 'S', desc: 'Modalità Stories Digest a schermo intero' },
  { key: 'G', label: 'G', desc: 'Mappa Neurale & Knowledge Graph' },
  { key: 'P', label: 'P', desc: 'Centro Preferenze & Radar AI' },
  { key: 'R', label: 'R', desc: 'Genera Nuovo Briefing AI on-demand' },
  { key: 'E', label: 'E', desc: 'Esporta rassegna stampa (Markdown/PDF)' },
  { key: 'C', label: 'C', desc: 'Apri archivio date storiche' },
  { key: 'Esc', label: 'Esc', desc: 'Chiudi qualsiasi finestra o modale' },
];

export default function KeyboardShortcutsModal({
  isOpen,
  onClose,
}: KeyboardShortcutsModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => {
            triggerHaptic(10);
            onClose();
          }}
          className="fixed inset-0 bg-black/80 backdrop-blur-2xl transition-opacity"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
          className="relative w-full max-w-lg rounded-[28px] p-6 sm:p-7 border border-white/10 z-10 shadow-2xl overflow-hidden"
          style={{
            background: 'rgba(16, 16, 22, 0.97)',
            boxShadow: '0 30px 90px rgba(0, 0, 0, 0.95), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/[0.08]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#2997ff]/15 border border-[#2997ff]/30 flex items-center justify-center flex-shrink-0 text-[#2997ff]">
                <Keyboard className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                  Scorciatoie di Tastiera <Sparkles className="w-3.5 h-3.5 text-[#64d2ff]" />
                </h3>
                <p className="text-xs text-[#86868b]">Controllo rapido da desktop e laptop</p>
              </div>
            </div>

            <button
              onClick={() => {
                triggerHaptic(10);
                onClose();
              }}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-[#86868b] hover:text-white flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* List */}
          <div className="space-y-2">
            {SHORTCUTS.map((s) => (
              <div
                key={s.key}
                className="flex items-center justify-between py-2 px-3 rounded-xl bg-white/[0.03] border border-white/[0.05]"
              >
                <span className="text-xs text-[#d2d2d7] font-medium">{s.desc}</span>
                <kbd className="px-2.5 py-1 rounded-lg bg-white/10 border border-white/15 text-[11px] font-mono font-bold text-[#64d2ff] shadow-inner select-none">
                  {s.label}
                </kbd>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="mt-5 pt-3 border-t border-white/[0.06] text-center">
            <p className="text-[11px] text-[#86868b]">
              Premi <kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono text-[10px]">?</kbd> in
              qualsiasi momento per visualizzare questo pannello.
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
