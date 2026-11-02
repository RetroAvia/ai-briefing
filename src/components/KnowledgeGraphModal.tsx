'use client';

import { motion } from 'framer-motion';
import { X, Network, ExternalLink, Sparkles, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import type { Article } from '@/types';
import { CATEGORY_CONFIG } from '@/types';
import { triggerHaptic } from '@/lib/export';

interface KnowledgeGraphModalProps {
  articles: Article[];
  isOpen: boolean;
  onClose: () => void;
  onSelectArticle: (article: Article) => void;
}

export default function KnowledgeGraphModal({
  articles,
  isOpen,
  onClose,
  onSelectArticle,
}: KnowledgeGraphModalProps) {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(articles[0]?.id || null);

  if (!isOpen || articles.length === 0) return null;

  // Calcola posizioni dei nodi in un cerchio radiale armonico
  const centerX = 250;
  const centerY = 220;
  const radius = 150;

  const nodes = articles.slice(0, 10).map((art, index) => {
    const angle = (index / Math.min(articles.length, 10)) * 2 * Math.PI - Math.PI / 2;
    const x = Math.round(centerX + radius * Math.cos(angle));
    const y = Math.round(centerY + radius * Math.sin(angle));
    return {
      ...art,
      x,
      y,
      index,
    };
  });

  const selectedArticle = articles.find((a) => a.id === selectedNodeId) || articles[0];
  const config = selectedArticle ? CATEGORY_CONFIG[selectedArticle.category] : CATEGORY_CONFIG['Altro'];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-[#06070a]/90 backdrop-blur-xl flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-3xl rounded-3xl p-5 sm:p-7 border relative overflow-hidden flex flex-col gap-5 shadow-2xl"
        style={{
          background: 'linear-gradient(135deg, rgba(17, 19, 28, 0.98) 0%, rgba(10, 12, 18, 0.95) 100%)',
          borderColor: 'rgba(255, 255, 255, 0.1)',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8), 0 0 35px rgba(124, 58, 237, 0.2)',
        }}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-500/35 flex items-center justify-center">
              <Network className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                AI Knowledge Graph <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              </h3>
              <p className="text-[11px] text-slate-400">
                Mappa delle interconnessioni strategiche tra le notizie di oggi
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              triggerHaptic(15);
              onClose();
            }}
            className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Visual Graph View (SVG Interattivo) */}
        <div className="relative w-full h-[300px] sm:h-[350px] bg-black/40 rounded-2xl border border-white/5 overflow-hidden flex items-center justify-center">
          <svg viewBox="0 0 500 440" className="w-full h-full">
            <defs>
              <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.4" />
              </linearGradient>
              <filter id="glowNode" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#7c3aed" floodOpacity="0.8" />
              </filter>
            </defs>

            {/* Linee di collegamento verso il nodo centrale */}
            {nodes.map((node, i) => (
              <motion.line
                key={`line-${node.id}`}
                x1={centerX}
                y1={centerY}
                x2={node.x}
                y2={node.y}
                stroke={selectedNodeId === node.id ? '#06b6d4' : 'url(#lineGrad)'}
                strokeWidth={selectedNodeId === node.id ? 2.5 : 1}
                strokeDasharray={selectedNodeId === node.id ? 'none' : '4 3'}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.6, delay: i * 0.04 }}
              />
            ))}

            {/* Linee perimetrali tra nodi adiacenti */}
            {nodes.map((node, i) => {
              const nextNode = nodes[(i + 1) % nodes.length];
              return (
                <line
                  key={`adj-${node.id}`}
                  x1={node.x}
                  y1={node.y}
                  x2={nextNode?.x ?? 0}
                  y2={nextNode?.y ?? 0}
                  stroke="rgba(255, 255, 255, 0.08)"
                  strokeWidth="1"
                />
              );
            })}

            {/* Nodo Centrale "Intelligence Hub" */}
            <circle cx={centerX} cy={centerY} r="26" fill="#11131c" stroke="#7c3aed" strokeWidth="2" />
            <circle cx={centerX} cy={centerY} r="18" fill="url(#lineGrad)" opacity="0.6" />
            <text
              x={centerX}
              y={centerY}
              fill="#ffffff"
              fontSize="10"
              fontWeight="bold"
              textAnchor="middle"
              dominantBaseline="central"
            >
              AI HUB
            </text>

            {/* Nodi Articolo Periferici */}
            {nodes.map((node) => {
              const isSelected = selectedNodeId === node.id;
              return (
                <g
                  key={node.id}
                  onClick={() => {
                    triggerHaptic(15);
                    setSelectedNodeId(node.id);
                  }}
                  className="cursor-pointer"
                >
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={isSelected ? 18 : 13}
                    fill={isSelected ? '#06b6d4' : '#11131c'}
                    stroke={isSelected ? '#ffffff' : '#7c3aed'}
                    strokeWidth={isSelected ? 2.5 : 1.5}
                    filter={isSelected ? 'url(#glowNode)' : 'none'}
                    className="transition-all duration-200"
                  />
                  <text
                    x={node.x}
                    y={node.y}
                    fill={isSelected ? '#000000' : '#ffffff'}
                    fontSize="9"
                    fontWeight="bold"
                    textAnchor="middle"
                    dominantBaseline="central"
                  >
                    {node.index + 1}
                  </text>
                  <text
                    x={node.x}
                    y={node.y + 24}
                    fill={isSelected ? '#38bdf8' : '#94a3b8'}
                    fontSize="8.5"
                    fontWeight={isSelected ? 'bold' : 'normal'}
                    textAnchor="middle"
                    className="select-none pointer-events-none"
                  >
                    {node.category.split(' ')[0]}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Selected Node Details Card */}
        {selectedArticle && (
          <div className="p-4 rounded-2xl bg-black/30 border border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${config?.bgColor} ${config?.borderColor} ${config?.color}`}
                >
                  {selectedArticle.category}
                </span>
                <span className="text-[11px] text-slate-400">{selectedArticle.source}</span>
              </div>
              <h4 className="text-sm font-bold text-white truncate mb-1">
                {selectedArticle.title}
              </h4>
              <p className="text-xs text-slate-300 line-clamp-1">{selectedArticle.summary}</p>
            </div>

            <button
              onClick={() => {
                triggerHaptic(20);
                onSelectArticle(selectedArticle);
                onClose();
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 transition-all flex-shrink-0 shadow-[0_0_12px_rgba(124,58,237,0.3)]"
            >
              <span>Vedi Notizia</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
