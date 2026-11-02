'use client';

import { motion } from 'framer-motion';
import { Bookmark, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useRef, useEffect, useCallback } from 'react';
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
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeBtnRef = useRef<HTMLButtonElement | null>(null);

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const isMouseDown = useRef(false);
  const startX = useRef(0);
  const scrollStart = useRef(0);
  const isDragging = useRef(false);

  // Calcola e aggiorna lo stato dei controlli di scorrimento orizzontale
  const updateScrollButtons = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    const hasOverflow = scrollWidth > clientWidth + 4;
    setCanScrollLeft(hasOverflow && scrollLeft > 6);
    setCanScrollRight(hasOverflow && scrollLeft < scrollWidth - clientWidth - 6);
  }, []);

  useEffect(() => {
    updateScrollButtons();
    const el = scrollRef.current;
    if (!el) return;

    window.addEventListener('resize', updateScrollButtons);
    el.addEventListener('scroll', updateScrollButtons, { passive: true });

    // Supporto rotella del mouse: su PC con mouse standard, lo scroll verticale viene convertito in orizzontale
    const handleWheel = (e: WheelEvent) => {
      if (el.scrollWidth > el.clientWidth) {
        if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
          e.preventDefault();
          el.scrollLeft += e.deltaY;
          updateScrollButtons();
        }
      }
    };

    el.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      window.removeEventListener('resize', updateScrollButtons);
      el.removeEventListener('scroll', updateScrollButtons);
      el.removeEventListener('wheel', handleWheel);
    };
  }, [updateScrollButtons]);

  // Centra automaticamente la categoria selezionata nel viewport
  useEffect(() => {
    if (activeBtnRef.current && scrollRef.current) {
      activeBtnRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
      setTimeout(updateScrollButtons, 320);
    }
  }, [selected, updateScrollButtons]);

  const scrollByAmount = (amount: number) => {
    triggerHaptic(10);
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  // Drag-to-scroll per mouse su PC
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    isMouseDown.current = true;
    isDragging.current = false;
    startX.current = e.pageX - scrollRef.current.offsetLeft;
    scrollStart.current = scrollRef.current.scrollLeft;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isMouseDown.current || !scrollRef.current) return;
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.4;
    if (Math.abs(walk) > 4) {
      isDragging.current = true;
    }
    scrollRef.current.scrollLeft = scrollStart.current - walk;
    updateScrollButtons();
  };

  const handleMouseUpOrLeave = () => {
    isMouseDown.current = false;
    setTimeout(() => {
      isDragging.current = false;
    }, 50);
  };

  return (
    <div className="relative group/filter w-full flex items-center">
      {/* Freccia sinistra per scorrimento (presente sia su PC con finestra ridotta che su mobile con overflow) */}
      {canScrollLeft && (
        <button
          type="button"
          onClick={() => scrollByAmount(-220)}
          className="absolute -left-2 sm:-left-3 z-30 w-7 h-7 rounded-full bg-[#1c1c24]/95 border border-white/20 text-white flex items-center justify-center shadow-xl hover:bg-[#2c2c38] hover:scale-110 active:scale-95 transition-all"
          title="Scorri categorie a sinistra"
          aria-label="Scorri categorie a sinistra"
        >
          <ChevronLeft className="w-4 h-4 text-white" />
        </button>
      )}

      {/* Sfumatura di fade a sinistra per evidenziare contenuto oltre il bordo */}
      {canScrollLeft && (
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#000000] via-[#000000]/85 to-transparent pointer-events-none z-10" />
      )}

      {/* Container Categorie Differenziato:
          - Su PC (md:): le categorie avvolgono in modo naturale (md:flex-wrap), rendendole TUTTE visibili a colpo d'occhio senza dover scorrere
          - Su Mobile/Tablet (<md): carosello orizzontale swipeabile e controllabile con frecce, rotella e drag */}
      <div
        ref={scrollRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        onMouseLeave={handleMouseUpOrLeave}
        className="flex items-center gap-1.5 overflow-x-auto md:overflow-visible md:flex-wrap pb-1 scrollbar-hide pt-1 select-none w-full scroll-smooth cursor-grab active:cursor-grabbing md:cursor-default"
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
              ref={isActive ? (el) => { activeBtnRef.current = el; } : null}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.015 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                if (isDragging.current) return;
                triggerHaptic(10);
                onSelect(cat);
              }}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                isActive
                  ? isBookmark
                    ? 'bg-[#ff9f0a]/20 border border-[#ff9f0a]/50 text-[#ff9f0a] shadow-sm ring-1 ring-[#ff9f0a]/30'
                    : cat === 'Tutti'
                    ? 'bg-white text-black font-bold shadow-md ring-1 ring-white/50'
                    : `${config?.bgColor} ${config?.borderColor} ${config?.color} font-bold shadow-sm ring-1 ring-white/20`
                  : 'bg-white/[0.05] border border-white/[0.08] text-[#86868b] hover:text-[#f5f5f7] hover:bg-white/[0.1] hover:border-white/15'
              }`}
            >
              {isBookmark && <Bookmark className="w-3 h-3 fill-current" />}
              <span>{cat}</span>
              {count > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold transition-colors ${
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

      {/* Sfumatura di fade a destra */}
      {canScrollRight && (
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#000000] via-[#000000]/85 to-transparent pointer-events-none z-10" />
      )}

      {/* Freccia destra per scorrimento (presente quando ci sono categorie oltre il bordo destro) */}
      {canScrollRight && (
        <button
          type="button"
          onClick={() => scrollByAmount(220)}
          className="absolute -right-2 sm:-right-3 z-30 w-7 h-7 rounded-full bg-[#1c1c24]/95 border border-white/20 text-white flex items-center justify-center shadow-xl hover:bg-[#2c2c38] hover:scale-110 active:scale-95 transition-all"
          title="Scorri categorie a destra"
          aria-label="Scorri categorie a destra"
        >
          <ChevronRight className="w-4 h-4 text-white" />
        </button>
      )}
    </div>
  );
}
