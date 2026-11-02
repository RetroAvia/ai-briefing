'use client';

import { motion } from 'framer-motion';
import { Newspaper, WifiOff, SearchX } from 'lucide-react';

type EmptyStateVariant = 'no-news' | 'offline' | 'no-results';

interface EmptyStateProps {
  variant: EmptyStateVariant;
  searchQuery?: string;
}

const CONFIG = {
  'no-news': {
    icon: Newspaper,
    title: 'Nessun briefing disponibile',
    description: 'Il briefing di oggi non è ancora stato generato. Torna più tardi o attendi la notifica mattutina.',
    color: 'text-violet-400',
  },
  'offline': {
    icon: WifiOff,
    title: 'Sei offline',
    description: 'Nessun briefing in cache. Connettiti una volta per scaricare le notizie e leggerle offline.',
    color: 'text-amber-400',
  },
  'no-results': {
    icon: SearchX,
    title: 'Nessun risultato',
    description: 'Nessuna notizia corrisponde alla tua ricerca. Prova con termini diversi.',
    color: 'text-slate-400',
  },
};

export default function EmptyState({ variant, searchQuery }: EmptyStateProps) {
  const { icon: Icon, title, description, color } = CONFIG[variant];
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-16 px-6 text-center"
    >
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
        className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ${color} bg-current/10`}
        style={{ background: 'rgba(124,58,237,0.08)' }}
      >
        <Icon className={`w-8 h-8 ${color}`} />
      </motion.div>
      <h3 className="text-base font-bold text-white mb-2">{title}</h3>
      <p className="text-sm text-slate-500 max-w-xs leading-relaxed">{description}</p>
      {searchQuery && (
        <p className="mt-2 text-xs text-slate-600">
          Ricerca: &quot;{searchQuery}&quot;
        </p>
      )}
    </motion.div>
  );
}
