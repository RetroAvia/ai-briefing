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
    onShowToast(`Briefing del ${briefing.date} scaricato con successo!`, 'success');
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
      className="fixed inset-0 z-50 bg-[#000000]/80 backdrop-blur-2xl flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
    >
      <motion.div
        initial={{ scale: 0.94, y: 16 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.94, y: 16 }}
        transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
        className="w-full max-w-lg rounded-[28px] p-6 sm:p-7 border relative overflow-hidden flex flex-col gap-5 shadow-2xl"
        style={{
          background: 'rgba(28, 28, 36, 0.92)',
          backdropFilter: 'blur(40px) saturate(200%)',
          WebkitBackdropFilter: 'blur(40px) saturate(200%)',
          borderColor: 'rgba(255, 255, 255, 0.12)',
          boxShadow: '0 30px 70px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        }}
      >
        {/* Header Stile macOS Sheet */}
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#bf5af2]/15 border border-[#bf5af2]/30 flex items-center justify-center flex-shrink-0">
              <FileText className="w-5 h-5 text-[#bf5af2]" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-1.5 tracking-tight">
                Esporta Rassegna <Sparkles className="w-3.5 h-3.5 text-[#2997ff]" />
              </h3>
              <p className="text-xs text-[#86868b]">
                Condividi o archivia i 10 fatti salienti di oggi
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              triggerHaptic(15);
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-white/[0.08] hover:bg-white/[0.15] text-[#86868b] hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 3 Action Buttons Stile Apple Control */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Copy Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleCopy}
            className="p-4 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] hover:border-[#bf5af2]/40 flex flex-col items-center justify-center text-center gap-2.5 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-[#bf5af2]/15 text-[#bf5af2] flex items-center justify-center transition-transform group-hover:scale-105">
              {copied ? <Check className="w-5 h-5 text-[#30d158]" /> : <Copy className="w-5 h-5" />}
            </div>
            <span className="text-xs font-bold text-white">
              {copied ? 'Copiato!' : 'Copia Testo'}
            </span>
            <span className="text-[10px] text-[#86868b]">Per Slack & Notion</span>
          </motion.button>

          {/* Download Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleDownload}
            className="p-4 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] hover:border-[#2997ff]/40 flex flex-col items-center justify-center text-center gap-2.5 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-[#2997ff]/15 text-[#2997ff] flex items-center justify-center transition-transform group-hover:scale-105">
              <Download className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-white">Scarica .MD</span>
            <span className="text-[10px] text-[#86868b]">File Markdown</span>
          </motion.button>

          {/* Print / PDF Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handlePrint}
            className="p-4 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] hover:border-[#30d158]/40 flex flex-col items-center justify-center text-center gap-2.5 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-[#30d158]/15 text-[#30d158] flex items-center justify-center transition-transform group-hover:scale-105">
              <Printer className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-white">Salva in PDF</span>
            <span className="text-[10px] text-[#86868b]">Stampa o PDF</span>
          </motion.button>
        </div>

        {/* Preview Snippet */}
        <div className="p-3.5 rounded-2xl bg-black/40 border border-white/[0.06] text-xs text-[#a1a1a6] max-h-36 overflow-y-auto font-mono leading-relaxed select-all">
          <p className="font-bold text-[#f5f5f7] mb-1.5">Anteprima documento:</p>
          <p className="text-[#2997ff]"># AI Daily Briefing — {briefing.date}</p>
          {briefing.articles.slice(0, 3).map((a, i) => (
            <p key={a.id} className="truncate text-[#d2d2d7]">
              {i + 1}. [{a.category}] {a.title}
            </p>
          ))}
          <p className="text-[#86868b] mt-1">... e altri {Math.max(0, briefing.articles.length - 3)} articoli inclusi.</p>
        </div>
      </motion.div>
    </motion.div>
  );
}
