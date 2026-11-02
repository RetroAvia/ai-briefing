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
  const articles = Array.isArray(briefing?.articles) ? briefing.articles : [];
  const totalMinutes = articles.reduce((acc, a) => acc + (a.readingTimeMinutes || 2), 0);
  const techCount = articles.filter((a) => a.category === 'Tech & AI').length;
  const ecoCount = articles.filter((a) => a.category === 'Mercati & Economia').length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
      className="mb-6 rounded-[24px] p-5 sm:p-6 border relative overflow-hidden"
      style={{
        background: 'rgba(20, 20, 26, 0.65)',
        backdropFilter: 'blur(25px) saturate(180%)',
        WebkitBackdropFilter: 'blur(25px) saturate(180%)',
        borderColor: 'rgba(255, 255, 255, 0.08)',
        boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
      }}
    >
      {/* Header bar dell'Executive Pulse stile Apple */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold tracking-[0.08em] uppercase text-[#2997ff] flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-[#2997ff]" /> Executive Daily Radar
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-[#30d158]/10 border border-[#30d158]/25 text-[10px] text-[#30d158] font-bold flex items-center gap-1">
              <CheckCircle2 className="w-2.5 h-2.5" /> 100% Offline
            </span>
          </div>
          <h2 className="text-base sm:text-lg font-extrabold text-white tracking-[-0.02em]">
            I 10 Fatti Chiave di Oggi
          </h2>
        </div>

        {/* Action Pills Stile iOS */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Stories Mode CTA */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              triggerHaptic(20);
              onOpenStories();
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold text-white shadow-md transition-all"
            style={{
              background: 'linear-gradient(135deg, #0071e3 0%, #2997ff 100%)',
            }}
            title="Apri le notizie in formato Stories a schermo intero"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Stories Digest</span>
          </motion.button>

          {/* Knowledge Graph CTA */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              triggerHaptic(20);
              onOpenKnowledgeGraph();
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold text-white bg-white/[0.08] hover:bg-white/[0.14] border border-white/[0.08] transition-all"
            title="Mappa concettuale delle notizie"
          >
            <Network className="w-3.5 h-3.5 text-[#bf5af2]" />
            <span className="hidden xs:inline">Mappa AI</span>
          </motion.button>

          {/* Export CTA */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              triggerHaptic(15);
              onExport();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-[#86868b] hover:text-white bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.08] transition-all"
            title="Esporta in Markdown o PDF"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Esporta</span>
          </motion.button>
        </div>
      </div>

      {/* 3 Bento Stat Widgets Apple Style */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {/* Widget 1 */}
        <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.05] flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#2997ff]/10 border border-[#2997ff]/20 flex items-center justify-center flex-shrink-0">
            <Clock className="w-4 h-4 text-[#2997ff]" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] uppercase font-bold text-[#86868b] tracking-[0.06em]">Tempo Totale</p>
            <p className="text-xs font-bold text-[#f5f5f7] truncate">
              {totalMinutes} min • {briefing.articles.length} notizie
            </p>
          </div>
        </div>

        {/* Widget 2 */}
        <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.05] flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#bf5af2]/10 border border-[#bf5af2]/20 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-4 h-4 text-[#bf5af2]" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] uppercase font-bold text-[#86868b] tracking-[0.06em]">Topic Prevalente</p>
            <p className="text-xs font-bold text-[#f5f5f7] truncate">
              {techCount >= ecoCount ? 'Tech & Intelligenza Artificiale' : 'Finanza & Mercati Globali'}
            </p>
          </div>
        </div>

        {/* Widget 3 */}
        <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.05] flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#30d158]/10 border border-[#30d158]/20 flex items-center justify-center flex-shrink-0">
            <HardDrive className="w-4 h-4 text-[#30d158]" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] uppercase font-bold text-[#86868b] tracking-[0.06em]">Stato Cache</p>
            <p className="text-xs font-bold text-[#f5f5f7] truncate">
              {isOnline ? 'Online Synced' : 'Offline Mode (Metro)'}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
