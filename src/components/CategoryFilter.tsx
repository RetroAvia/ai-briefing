'use client';

import { motion } from 'framer-motion';
import { type Category, ALL_CATEGORIES, CATEGORY_CONFIG } from '@/types';

interface CategoryFilterProps {
  selected: Category | 'Tutti';
  onSelect: (cat: Category | 'Tutti') => void;
  counts: Record<string, number>;
}

type FilterOption = Category | 'Tutti';

export default function CategoryFilter({ selected, onSelect, counts }: CategoryFilterProps) {
  const options: FilterOption[] = ['Tutti', ...ALL_CATEGORIES];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide"
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
    >
      {options.map((cat, i) => {
        const isActive = selected === cat;
        const count = counts[cat] ?? 0;
        const config = cat !== 'Tutti' ? CATEGORY_CONFIG[cat as Category] : null;

        return (
          <motion.button
            key={cat}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 + i * 0.04 }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => onSelect(cat)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 ${
              isActive
                ? cat === 'Tutti'
                  ? 'bg-violet-600/30 border-violet-500/60 text-violet-300'
                  : `${config?.bgColor} ${config?.borderColor} ${config?.color}`
                : 'bg-slate-800/40 border-slate-700/30 text-slate-500 hover:border-slate-600/50 hover:text-slate-400'
            }`}
          >
            <span>{cat}</span>
            {count > 0 && (
              <span className={`text-[10px] px-1 rounded-full ${
                isActive ? 'bg-white/15' : 'bg-slate-700/50'
              }`}>
                {count}
              </span>
            )}
          </motion.button>
        );
      })}
    </motion.div>
  );
}
