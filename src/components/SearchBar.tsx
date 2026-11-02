'use client';

import { motion } from 'framer-motion';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export default function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="relative group"
    >
      <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none">
        <Search className="w-4 h-4 text-slate-500 group-focus-within:text-violet-400 transition-colors duration-200" />
      </div>
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Cerca tra titoli, categorie e riassunti..."
        className="w-full pl-10 pr-10 py-2.5 text-sm rounded-xl text-white placeholder-slate-600 outline-none transition-all duration-200 focus:ring-1"
        style={{
          background: 'rgba(17,19,28,0.8)',
          border: '1px solid rgba(255,255,255,0.08)',
          '--tw-ring-color': 'rgba(124,58,237,0.5)',
        } as React.CSSProperties}
        onFocus={(e) => {
          e.target.style.borderColor = 'rgba(124,58,237,0.4)';
        }}
        onBlur={(e) => {
          e.target.style.borderColor = 'rgba(255,255,255,0.08)';
        }}
      />
      {value && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          onClick={() => onChange('')}
          className="absolute inset-y-0 right-3 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
        >
          <X className="w-4 h-4" />
        </motion.button>
      )}
    </motion.div>
  );
}
