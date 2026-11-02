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
    { id: 'minimal', label: 'Minimo', icon: AlignJustify },
  ];

  return (
    <div className="flex items-center gap-0.5 p-1 rounded-full bg-white/[0.06] border border-white/[0.08] backdrop-blur-xl">
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
            className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
              isActive ? 'text-white' : 'text-[#86868b] hover:text-[#d2d2d7]'
            }`}
          >
            {isActive && (
              <motion.div
                layoutId="activeDensityApple"
                className="absolute inset-0 rounded-full bg-white/15 border border-white/20 shadow-sm"
                transition={{ type: 'spring', damping: 28, stiffness: 400 }}
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
