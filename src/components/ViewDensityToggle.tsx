'use client';

import { motion } from 'framer-motion';
import { LayoutGrid, List, AlignJustify } from 'lucide-react';
import type { DisplayDensity } from '@/types';
import { triggerHaptic } from '@/lib/export';

interface ViewDensityToggleProps {
  density: DisplayDensity;
  onChange: (density: DisplayDensity) => void;
}

export default function ViewDensityToggle({ density, onChange }: ViewDensityToggleProps) {
  const options: { id: DisplayDensity; label: string; icon: typeof LayoutGrid }[] = [
    { id: 'magazine', label: 'Rivista', icon: LayoutGrid },
    { id: 'compact', label: 'Compatto', icon: List },
    { id: 'minimal', label: 'Minimale', icon: AlignJustify },
  ];

  return (
    <div className="flex items-center gap-1 p-1 rounded-2xl bg-black/40 border border-white/5 backdrop-blur-md">
      {options.map((opt) => {
        const Icon = opt.icon;
        const isActive = density === opt.id;

        return (
          <button
            key={opt.id}
            onClick={() => {
              triggerHaptic(10);
              onChange(opt.id);
            }}
            className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              isActive ? 'text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {isActive && (
              <motion.div
                layoutId="activeDensity"
                className="absolute inset-0 rounded-xl bg-violet-600/40 border border-violet-500/50 shadow-[0_0_12px_rgba(124,58,237,0.3)]"
                transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              <Icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{opt.label}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
