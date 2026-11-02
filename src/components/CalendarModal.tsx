'use client';

import { motion } from 'framer-motion';
import { X, Calendar as CalendarIcon, CheckCircle2, ChevronRight, Sparkles } from 'lucide-react';
import { triggerHaptic } from '@/lib/export';

interface CalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableDates: string[];
  currentDate: string;
  onSelectDate: (date: string) => void;
}

export default function CalendarModal({
  isOpen,
  onClose,
  availableDates,
  currentDate,
  onSelectDate,
}: CalendarModalProps) {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-[#06070a]/90 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto"
    >
      <motion.div
        initial={{ scale: 0.95, y: 15 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 15 }}
        className="w-full max-w-md rounded-3xl p-5 sm:p-6 border relative overflow-hidden flex flex-col gap-4 shadow-2xl"
        style={{
          background: 'rgba(17, 19, 28, 0.98)',
          borderColor: 'rgba(255, 255, 255, 0.1)',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8), 0 0 35px rgba(124, 58, 237, 0.2)',
        }}
      >
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-violet-500/15 border border-violet-500/35 flex items-center justify-center">
              <CalendarIcon className="w-4 h-4 text-violet-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                Archivio Storico Briefing <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              </h3>
              <p className="text-[11px] text-slate-400">
                Consulta le rassegne stampa dei giorni precedenti
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              triggerHaptic(15);
              onClose();
            }}
            className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Elenco date disponibili */}
        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {availableDates.length === 0 ? (
            <div className="text-center py-6 text-xs text-slate-500">
              Nessun briefing passato salvato in archivio locale.
            </div>
          ) : (
            availableDates.map((dateStr) => {
              const isSelected = dateStr === currentDate;
              let formattedDate = dateStr;
              try {
                formattedDate = new Intl.DateTimeFormat('it-IT', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                }).format(new Date(dateStr + 'T00:00:00'));
              } catch {
                formattedDate = dateStr;
              }

              return (
                <button
                  key={dateStr}
                  onClick={() => {
                    triggerHaptic(20);
                    onSelectDate(dateStr);
                    onClose();
                  }}
                  className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
                    isSelected
                      ? 'bg-violet-600/25 border-violet-500/60 text-white shadow-lg shadow-violet-500/10'
                      : 'bg-black/30 border-white/5 text-slate-300 hover:border-white/20 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-2.5 h-2.5 rounded-full ${
                        isSelected ? 'bg-cyan-400 animate-pulse' : 'bg-slate-600'
                      }`}
                    />
                    <div>
                      <p className="text-xs font-bold capitalize">{formattedDate}</p>
                      <p className="text-[10px] text-slate-500">{dateStr} • Disponibile in locale</p>
                    </div>
                  </div>

                  {isSelected ? (
                    <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-slate-600" />
                  )}
                </button>
              );
            })
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
