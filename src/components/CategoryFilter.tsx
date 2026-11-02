'use client';

import { motion } from 'framer-motion';
import { Bookmark } from 'lucide-react';
import { type Category, ALL_CATEGORIES, CATEGORY_CONFIG } from '@/types';

export type FilterOption = Category | 'Tutti' | 'Salvati';

interface CategoryFilterProps {
  selected: FilterOption;
  onSelect: (cat: FilterOption) => void;
  counts: Record<string, number>;
  bookmarkCount?: number;
}

export default function CategoryFilter({
  selected,
  onSelect,
  counts,
  bookmarkCount = 0,
}: CategoryFilterProps) {
  const options: FilterOption[] = ['Tutti', 'Salvati', ...ALL_CATEGORIES];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-hide pt-1"
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
    >
      {options.map((cat, i) => {
        const isActive = selected === cat;
        const isBookmark = cat === 'Salvati';
        const count = isBookmark ? bookmarkCount : counts[cat] ?? 0;
        const config = !isBookmark && cat !== 'Tutti' ? CATEGORY_CONFIG[cat as Category] : null;

        return (
          <motion.button
            key={cat}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.05 + i * 0.03 }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => onSelect(cat)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 ${
              isActive
                ? isBookmark
                  ? 'bg-amber-500/20 border-amber-500/60 text-amber-300 shadow-[0_0_14px_rgba(245,158,11,0.25)]'
                  : cat === 'Tutti'
                  ? 'bg-violet-600/30 border-violet-500/70 text-violet-200 shadow-[0_0_14px_rgba(124,58,237,0.3)]'
                  : `${config?.bgColor} ${config?.borderColor} ${config?.color} shadow-[0_0_12px_rgba(124,58,237,0.15)]`
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
            }`}
          >
            {isBookmark && <Bookmark className="w-3 h-3 fill-current" />}
            <span>{cat}</span>
            {count > 0 && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {count}
              </span>
            )}
          </motion.button>
        );
      })}
    </motion.div>
  );
}
