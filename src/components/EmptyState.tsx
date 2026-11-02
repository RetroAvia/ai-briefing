'use client';

import { motion } from 'framer-motion';
import { Newspaper, WifiOff, SearchX, RotateCcw } from 'lucide-react';
import { triggerHaptic } from '@/lib/export';

type EmptyStateVariant = 'no-news' | 'offline' | 'no-results';

interface EmptyStateProps {
  variant: EmptyStateVariant;
  searchQuery?: string;
  onResetSearch?: () => void;
}

const CONFIG = {
  'no-news': {
    icon: Newspaper,
    title: 'Nessun briefing disponibile',
    description: 'Il briefing di oggi non è ancora stato generato. Torna più tardi o attendi la notifica mattutina delle 06:30.',
    accentColor: '#2997ff',
    badgeBg: 'bg-[#2997ff]/10',
    borderColor: 'border-[#2997ff]/25',
    iconColor: 'text-[#2997ff]',
  },
  'offline': {
    icon: WifiOff,
    title: 'Dispositivo Offline',
    description: 'Nessun briefing archiviato in memoria locale. Connettiti una volta alla rete per sincronizzare le notizie e leggerle senza interruzioni.',
    accentColor: '#ff9f0a',
    badgeBg: 'bg-[#ff9f0a]/10',
    borderColor: 'border-[#ff9f0a]/25',
    iconColor: 'text-[#ff9f0a]',
  },
  'no-results': {
    icon: SearchX,
    title: 'Nessun risultato trovato',
    description: 'Nessuna notizia corrisponde ai criteri di ricerca impostati. Prova con termini diversi o reimposta i filtri.',
    accentColor: '#bf5af2',
    badgeBg: 'bg-[#bf5af2]/10',
    borderColor: 'border-[#bf5af2]/25',
    iconColor: 'text-[#bf5af2]',
  },
};

export default function EmptyState({ variant, searchQuery, onResetSearch }: EmptyStateProps) {
  const current = CONFIG[variant];
  const Icon = current.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
      className="flex flex-col items-center justify-center py-20 px-6 text-center max-w-md mx-auto"
    >
      {/* Apple Squircle Icon with Ambient Glow */}
      <div className="relative mb-5">
        <div
          className="absolute inset-0 rounded-[24px] blur-xl opacity-30"
          style={{ background: current.accentColor }}
        />
        <div
          className={`relative w-20 h-20 rounded-[24px] flex items-center justify-center border shadow-xl ${current.badgeBg} ${current.borderColor}`}
          style={{
            backdropFilter: 'blur(20px)',
          }}
        >
          <Icon className={`w-9 h-9 ${current.iconColor}`} />
        </div>
      </div>

      <h3 className="text-lg font-extrabold text-white mb-2 tracking-[-0.02em]">
        {current.title}
      </h3>
      <p className="text-sm text-[#86868b] leading-relaxed mb-4">
        {current.description}
      </p>

      {searchQuery && (
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.06] border border-white/[0.08] text-xs text-[#d2d2d7] mb-5">
          <span>Ricerca:</span>
          <span className="font-bold text-white">&quot;{searchQuery}&quot;</span>
        </div>
      )}

      {onResetSearch && searchQuery && (
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => {
            triggerHaptic(15);
            onResetSearch();
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold text-white bg-white/10 hover:bg-white/15 border border-white/10 transition-all shadow-sm"
        >
          <RotateCcw className="w-3.5 h-3.5 text-[#2997ff]" />
          <span>Reimposta Filtri</span>
        </motion.button>
      )}
    </motion.div>
  );
}
