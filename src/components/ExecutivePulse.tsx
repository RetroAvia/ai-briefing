'use client';

import { motion } from 'framer-motion';
import {
  Layers,
  Network,
  Clock,
  Share2,
  Sparkles,
  HardDrive,
  CheckCircle2,
  Sliders,
  Orbit,
  Cpu,
  Activity,
} from 'lucide-react';
import { useMemo } from 'react';
import type { DailyBriefing } from '@/types';
import { triggerHaptic } from '@/lib/export';
import { playSoftClick } from '@/lib/sound';

interface ExecutivePulseProps {
  briefing: DailyBriefing;
  onOpenStories: () => void;
  onOpenKnowledgeGraph: () => void;
  onExport: () => void;
  isOnline: boolean;
  onTriggerGenerate?: () => void;
  onOpenPreferences?: () => void;
  onOpenScenarioSimulator?: () => void;
}

export default function ExecutivePulse({
  briefing,
  onOpenStories,
  onOpenKnowledgeGraph,
  onExport,
  isOnline,
  onTriggerGenerate,
  onOpenPreferences,
  onOpenScenarioSimulator,
}: ExecutivePulseProps) {
  const articles = useMemo(
    () => (Array.isArray(briefing?.articles) ? briefing.articles : []),
    [briefing]
  );
  const totalMinutes = articles.reduce((acc, a) => acc + (a.readingTimeMinutes || 2), 0);

  const topTopic = useMemo(() => {
    if (!articles.length) return 'Varie';
    const counts: Record<string, number> = {};
    for (const a of articles) {
      counts[a.category] = (counts[a.category] || 0) + 1;
    }
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    return sorted[0]?.[0] || 'Tech & AI';
  }, [articles]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
      className="mb-6 rounded-[26px] p-5 sm:p-6 border relative overflow-hidden"
      style={{
        background: 'rgba(18, 18, 24, 0.92)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderColor: 'rgba(255, 255, 255, 0.09)',
        boxShadow: '0 12px 35px -10px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
      }}
    >
      {/* Top Bar dell'Executive Pulse */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold tracking-[0.08em] uppercase text-[#2997ff] flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-[#2997ff]" /> Neural Executive Radar 3000
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-[#30d158]/10 border border-[#30d158]/25 text-[10px] text-[#30d158] font-bold flex items-center gap-1">
              <CheckCircle2 className="w-2.5 h-2.5" /> 100% Offline IndexedDB
            </span>
          </div>
          <h2 className="text-base sm:text-lg font-extrabold text-white tracking-[-0.02em]">
            I 10 Fatti Chiave di Oggi
          </h2>
        </div>

        {/* Action Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* On-demand Generate AI CTA */}
          {onTriggerGenerate && (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                playSoftClick(850);
                triggerHaptic(20);
                onTriggerGenerate();
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold text-white shadow-md transition-all cursor-pointer"
              style={{
                background: 'linear-gradient(135deg, #0071e3 0%, #64d2ff 100%)',
              }}
              title="Genera subito notizie fresche per tutte le categorie"
            >
              <Sparkles className="w-3.5 h-3.5 text-white animate-pulse" />
              <span>Genera Notizie AI</span>
            </motion.button>
          )}

          {/* Scenario 2050 Simulator CTA */}
          {onOpenScenarioSimulator && (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                playSoftClick(950);
                triggerHaptic(15);
                onOpenScenarioSimulator();
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold text-[#bf5af2] bg-[#bf5af2]/15 hover:bg-[#bf5af2]/25 border border-[#bf5af2]/35 transition-all cursor-pointer"
              title="Simulatore di Scenario 2030-2050"
            >
              <Orbit className="w-3.5 h-3.5 text-[#bf5af2]" />
              <span className="hidden xs:inline">Scenario 2050</span>
            </motion.button>
          )}

          {/* Preferences CTA */}
          {onOpenPreferences && (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                playSoftClick(750);
                triggerHaptic(15);
                onOpenPreferences();
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold text-[#64d2ff] bg-[#64d2ff]/10 hover:bg-[#64d2ff]/20 border border-[#64d2ff]/30 transition-all cursor-pointer"
              title="Personalizza le tue categorie preferite e priorità"
            >
              <Sliders className="w-3.5 h-3.5 text-[#64d2ff]" />
              <span className="hidden xs:inline">Personalizza Radar</span>
            </motion.button>
          )}

          {/* Stories Mode CTA */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              playSoftClick(800);
              triggerHaptic(20);
              onOpenStories();
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold text-white shadow-md transition-all cursor-pointer"
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
              playSoftClick(850);
              triggerHaptic(20);
              onOpenKnowledgeGraph();
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold text-white bg-white/[0.08] hover:bg-white/[0.14] border border-white/[0.08] transition-all cursor-pointer"
            title="Mappa concettuale orbitale delle notizie"
          >
            <Network className="w-3.5 h-3.5 text-[#bf5af2]" />
            <span className="hidden xs:inline">Mappa AI</span>
          </motion.button>

          {/* Export CTA */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              playSoftClick(700);
              triggerHaptic(15);
              onExport();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-[#86868b] hover:text-white bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.08] transition-all cursor-pointer"
            title="Esporta in Markdown o PDF"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Esporta</span>
          </motion.button>
        </div>
      </div>

      {/* 3 Bento Stat Widgets Apple Style with Telemetry */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {/* Widget 1 */}
        <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.05] flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#2997ff]/10 border border-[#2997ff]/20 flex items-center justify-center flex-shrink-0">
            <Clock className="w-4 h-4 text-[#2997ff]" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] uppercase font-bold text-[#86868b] tracking-[0.06em]">Tempo di Lettura</p>
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
            <p className="text-[10px] uppercase font-bold text-[#86868b] tracking-[0.06em]">Cluster Primario</p>
            <p className="text-xs font-bold text-[#f5f5f7] truncate">
              {topTopic}
            </p>
          </div>
        </div>

        {/* Widget 3 */}
        <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.05] flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#30d158]/10 border border-[#30d158]/20 flex items-center justify-center flex-shrink-0">
            <Activity className="w-4 h-4 text-[#30d158]" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] uppercase font-bold text-[#86868b] tracking-[0.06em]">Indice Accelerazione</p>
            <p className="text-xs font-bold text-[#30d158] truncate font-mono">
              98.4% • Telemetria Attiva
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
