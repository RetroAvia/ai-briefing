'use client';

import { motion } from 'framer-motion';
import { Bookmark } from 'lucide-react';
import { type Category, ALL_CATEGORIES, CATEGORY_CONFIG } from '@/types';
import { triggerHaptic } from '@/lib/export';

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
    <div
      className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide pt-1 select-none"
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
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.02 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              triggerHaptic(10);
              onSelect(cat);
            }}
            className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
              isActive
                ? isBookmark
                  ? 'bg-[#ff9f0a]/20 border border-[#ff9f0a]/50 text-[#ff9f0a]'
                  : cat === 'Tutti'
                  ? 'bg-white text-black font-bold shadow-md'
                  : `${config?.bgColor} ${config?.borderColor} ${config?.color} font-bold`
                : 'bg-white/[0.05] border border-white/[0.08] text-[#86868b] hover:text-[#f5f5f7] hover:bg-white/[0.09]'
            }`}
          >
            {isBookmark && <Bookmark className="w-3 h-3 fill-current" />}
            <span>{cat}</span>
            {count > 0 && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  isActive
                    ? cat === 'Tutti'
                      ? 'bg-black/20 text-black'
                      : 'bg-white/20 text-white'
                    : 'bg-white/10 text-[#86868b]'
                }`}
              >
                {count}
              </span>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
