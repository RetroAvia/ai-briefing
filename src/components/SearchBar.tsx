'use client';

import { motion } from 'framer-motion';
import { Search, X, Command } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { triggerHaptic } from '@/lib/export';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export default function SearchBar({ value, onChange }: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        setIsMac(/(Mac|iPhone|iPod|iPad)/i.test(navigator.platform || navigator.userAgent || ''));
      } catch {
        setIsMac(false);
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!e || !e.key) return;

      const isSearchShortcut =
        ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') ||
        (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA');

      if (isSearchShortcut) {
        e.preventDefault();
        inputRef.current?.focus();
        triggerHaptic(10);
      } else if (e.key === 'Escape' && document.activeElement === inputRef.current) {
        inputRef.current?.blur();
        if (value) {
          onChange('');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [value, onChange]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
      className="relative group w-full"
    >
      {/* Search Icon Apple SF Style */}
      <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-[#86868b] group-focus-within:text-[#2997ff] transition-colors duration-200">
        <Search className="w-4 h-4" />
      </div>

      {/* Apple Spotlight Search Input */}
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Cerca per tema, titolo, parola chiave o fonte..."
        className="w-full pl-11 pr-24 py-3 text-sm font-medium rounded-2xl text-white placeholder-[#86868b] outline-none transition-all duration-200 border shadow-sm"
        style={{
          background: 'rgba(28, 28, 36, 0.88)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderColor: 'rgba(255, 255, 255, 0.09)',
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = 'rgba(41, 151, 255, 0.55)';
          e.currentTarget.style.boxShadow = '0 0 0 3px rgba(41, 151, 255, 0.18)';
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.09)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      />

      {/* Right Controls: Keyboard shortcut badge or Clear button */}
      <div className="absolute inset-y-0 right-3.5 flex items-center gap-1.5">
        {value ? (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => {
              triggerHaptic(10);
              onChange('');
              inputRef.current?.focus();
            }}
            className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 text-[#86868b] hover:text-white flex items-center justify-center transition-all"
            title="Cancella ricerca (Esc)"
          >
            <X className="w-3.5 h-3.5" />
          </motion.button>
        ) : (
          <div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-lg bg-white/[0.06] border border-white/[0.08] text-[10px] font-semibold text-[#86868b] pointer-events-none select-none">
            {isMac ? (
              <>
                <Command className="w-2.5 h-2.5" />
                <span>K</span>
              </>
            ) : (
              <span>Ctrl K</span>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
