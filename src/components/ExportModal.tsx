'use client';

import { motion } from 'framer-motion';
import { X, Copy, Download, Printer, Check, Sparkles, FileText } from 'lucide-react';
import { useState } from 'react';
import type { DailyBriefing } from '@/types';
import { copyBriefingToClipboard, downloadBriefingMarkdown, triggerHaptic } from '@/lib/export';

interface ExportModalProps {
  briefing: DailyBriefing;
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (text: string, type?: 'success' | 'info' | 'error') => void;
}

export default function ExportModal({ briefing, isOpen, onClose, onShowToast }: ExportModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = async () => {
    triggerHaptic(20);
    const success = await copyBriefingToClipboard(briefing);
    if (success) {
      setCopied(true);
      onShowToast('Rassegna stampa copiata negli appunti in formato Markdown!', 'success');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    triggerHaptic(20);
    downloadBriefingMarkdown(briefing);
    onShowToast(`Briefing ${briefing.date} scaricato con successo!`, 'success');
  };

  const handlePrint = () => {
    triggerHaptic(15);
    window.print();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-[#06070a]/90 backdrop-blur-xl flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
    >
      <motion.div
        initial={{ scale: 0.95, y: 15 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 15 }}
        className="w-full max-w-lg rounded-3xl p-5 sm:p-6 border relative overflow-hidden flex flex-col gap-4 shadow-2xl"
        style={{
          background: 'rgba(17, 19, 28, 0.98)',
          borderColor: 'rgba(255, 255, 255, 0.1)',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8), 0 0 35px rgba(124, 58, 237, 0.2)',
        }}
      >
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-violet-500/15 border border-violet-500/35 flex items-center justify-center">
              <FileText className="w-4 h-4 text-violet-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                Esporta Rassegna Quotidiana <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              </h3>
              <p className="text-[11px] text-slate-400">
                Condividi o archivia le 10 notizie del giorno
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

        {/* Action Options */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Copy Button */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleCopy}
            className="p-4 rounded-2xl bg-black/30 border border-white/5 hover:border-violet-500/40 flex flex-col items-center justify-center text-center gap-2 transition-all group"
          >
            <div className="w-9 h-9 rounded-xl bg-violet-500/10 group-hover:bg-violet-500/20 text-violet-400 flex items-center justify-center transition-colors">
              {copied ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
            </div>
            <span className="text-xs font-bold text-white">
              {copied ? 'Copiato!' : 'Copia Testo'}
            </span>
            <span className="text-[10px] text-slate-500">Per Slack / Notion</span>
          </motion.button>

          {/* Download Button */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleDownload}
            className="p-4 rounded-2xl bg-black/30 border border-white/5 hover:border-cyan-500/40 flex flex-col items-center justify-center text-center gap-2 transition-all group"
          >
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 group-hover:bg-cyan-500/20 text-cyan-400 flex items-center justify-center transition-colors">
              <Download className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-white">Scarica .MD</span>
            <span className="text-[10px] text-slate-500">File Markdown</span>
          </motion.button>

          {/* Print / PDF Button */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handlePrint}
            className="p-4 rounded-2xl bg-black/30 border border-white/5 hover:border-emerald-500/40 flex flex-col items-center justify-center text-center gap-2 transition-all group"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 group-hover:bg-emerald-500/20 text-emerald-400 flex items-center justify-center transition-colors">
              <Printer className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-white">Salva in PDF</span>
            <span className="text-[10px] text-slate-500">Stampa o salva</span>
          </motion.button>
        </div>

        {/* Anteprima sintetica del testo */}
        <div className="mt-1 p-3 rounded-xl bg-black/40 border border-white/5 text-[11px] text-slate-400 max-h-36 overflow-y-auto font-mono leading-relaxed select-all">
          <p className="font-bold text-slate-200 mb-1">Anteprima contenuto:</p>
          <p># AI Daily Briefing — {briefing.date}</p>
          {briefing.articles.slice(0, 3).map((a, i) => (
            <p key={a.id} className="truncate">
              {i + 1}. [{a.category}] {a.title}
            </p>
          ))}
          <p className="text-slate-600">... e altri {briefing.articles.length - 3} articoli inclusi.</p>
        </div>
      </motion.div>
    </motion.div>
  );
}
