'use client';

import { motion } from 'framer-motion';
import { Layers, Network, Clock, Share2, Sparkles, HardDrive, CheckCircle2 } from 'lucide-react';
import type { DailyBriefing } from '@/types';
import { triggerHaptic } from '@/lib/export';

interface ExecutivePulseProps {
  briefing: DailyBriefing;
  onOpenStories: () => void;
  onOpenKnowledgeGraph: () => void;
  onExport: () => void;
  isOnline: boolean;
}

export default function ExecutivePulse({
  briefing,
  onOpenStories,
  onOpenKnowledgeGraph,
  onExport,
  isOnline,
}: ExecutivePulseProps) {
  const totalMinutes = briefing.articles.reduce((acc, a) => acc + (a.readingTimeMinutes || 2), 0);
  const techCount = briefing.articles.filter((a) => a.category === 'Tech & AI').length;
  const ecoCount = briefing.articles.filter((a) => a.category === 'Mercati & Economia').length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mb-6 rounded-2xl p-4 sm:p-5 border relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, rgba(17, 19, 28, 0.95) 0%, rgba(15, 23, 42, 0.85) 100%)',
        borderColor: 'rgba(255, 255, 255, 0.08)',
        boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
      }}
    >
      {/* Background neon ambient highlight */}
      <div
        className="absolute top-0 right-0 w-72 h-72 rounded-full opacity-10 pointer-events-none blur-3xl"
        style={{ background: 'radial-gradient(circle, #7c3aed 0%, transparent 70%)' }}
      />

      {/* Header bar dell'Executive Pulse */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-extrabold tracking-widest uppercase text-violet-400 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-cyan-400" /> Executive Daily Radar
            </span>
            <span className="px-2 py-0.2 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-2.5 h-2.5" /> 100% Offline Ready
            </span>
          </div>
          <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
            I 10 Takeaway Strategici di Oggi
          </h2>
        </div>

        {/* Action Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Stories Mode CTA */}
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => {
              triggerHaptic(20);
              onOpenStories();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white shadow-lg transition-all"
            style={{
              background: 'linear-gradient(135deg, #7c3aed 0%, #06b6d4 100%)',
              boxShadow: '0 0 20px rgba(124, 58, 237, 0.35)',
            }}
            title="Apri il digest visivo full-screen a scorrimento rapido"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Modalità Stories</span>
          </motion.button>

          {/* Knowledge Graph CTA */}
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => {
              triggerHaptic(20);
              onOpenKnowledgeGraph();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-cyan-300 bg-cyan-950/40 hover:bg-cyan-900/40 border border-cyan-500/30 transition-all"
            title="Visualizza la mappa concettuale interattiva tra le notizie"
          >
            <Network className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden xs:inline">Mappa AI</span>
          </motion.button>

          {/* Export / Share CTA */}
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => {
              triggerHaptic(15);
              onExport();
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-300 bg-slate-800/60 hover:bg-slate-700/60 border border-white/10 transition-all"
            title="Esporta o condividi la rassegna stampa in Markdown o PDF"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Esporta</span>
          </motion.button>
        </div>
      </div>

      {/* 3 Stat Cards in Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {/* Stat 1: Time */}
        <div className="p-3 rounded-xl bg-black/25 border border-white/5 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-violet-500/15 border border-violet-500/30 flex items-center justify-center flex-shrink-0">
            <Clock className="w-4 h-4 text-violet-400" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Lettura Completa</p>
            <p className="text-xs font-bold text-white truncate">
              {totalMinutes} minuti • {briefing.articles.length} notizie
            </p>
          </div>
        </div>

        {/* Stat 2: Trend Focus */}
        <div className="p-3 rounded-xl bg-black/25 border border-white/5 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Focus Prevalente</p>
            <p className="text-xs font-bold text-white truncate">
              {techCount >= ecoCount ? 'Tech & Intelligenza Artificiale' : 'Finanza & Mercati Globali'}
            </p>
          </div>
        </div>

        {/* Stat 3: Storage */}
        <div className="p-3 rounded-xl bg-black/25 border border-white/5 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
            <HardDrive className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Archivio Locale</p>
            <p className="text-xs font-bold text-white truncate">
              IndexedDB Attivo ({isOnline ? 'Online Synced' : 'Offline Mode'})
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
