'use client';

import { motion } from 'framer-motion';
import { X, Network, Sparkles, ArrowRight } from 'lucide-react';
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
      className="fixed inset-0 z-50 bg-[#000000]/80 backdrop-blur-2xl flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
    >
      <motion.div
        initial={{ scale: 0.94, y: 16 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.94, y: 16 }}
        transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
        className="w-full max-w-3xl rounded-[28px] p-6 sm:p-7 border relative overflow-hidden flex flex-col gap-5 shadow-2xl"
        style={{
          background: 'rgba(24, 24, 30, 0.95)',
          backdropFilter: 'blur(40px) saturate(200%)',
          WebkitBackdropFilter: 'blur(40px) saturate(200%)',
          borderColor: 'rgba(255, 255, 255, 0.12)',
          boxShadow: '0 30px 70px rgba(0, 0, 0, 0.85), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        }}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#bf5af2]/15 border border-[#bf5af2]/30 flex items-center justify-center flex-shrink-0">
              <Network className="w-5 h-5 text-[#bf5af2]" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-1.5 tracking-tight">
                AI Knowledge Graph <Sparkles className="w-3.5 h-3.5 text-[#2997ff]" />
              </h3>
              <p className="text-xs text-[#86868b]">
                Mappa delle interconnessioni strategiche tra le notizie di oggi
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              triggerHaptic(15);
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-white/[0.08] hover:bg-white/[0.15] text-[#86868b] hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Visual Graph View (SVG Interattivo) */}
        <div className="relative w-full h-[300px] sm:h-[350px] bg-black/40 rounded-2xl border border-white/[0.06] overflow-hidden flex items-center justify-center">
          <svg viewBox="0 0 500 440" className="w-full h-full">
            <defs>
              <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#bf5af2" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#2997ff" stopOpacity="0.45" />
              </linearGradient>
              <filter id="glowNode" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#2997ff" floodOpacity="0.8" />
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
                stroke={selectedNodeId === node.id ? '#2997ff' : 'url(#lineGrad)'}
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
            <circle cx={centerX} cy={centerY} r="26" fill="#141418" stroke="#bf5af2" strokeWidth="2" />
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
                    fill={isSelected ? '#2997ff' : '#141418'}
                    stroke={isSelected ? '#ffffff' : '#bf5af2'}
                    strokeWidth={isSelected ? 2.5 : 1.5}
                    filter={isSelected ? 'url(#glowNode)' : 'none'}
                    className="transition-all duration-200"
                  />
                  <text
                    x={node.x}
                    y={node.y}
                    fill={isSelected ? '#ffffff' : '#f5f5f7'}
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
                    fill={isSelected ? '#2997ff' : '#86868b'}
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
          <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${config?.bgColor} ${config?.borderColor} ${config?.color}`}
                >
                  {selectedArticle.category}
                </span>
                <span className="text-xs text-[#86868b]">{selectedArticle.source}</span>
              </div>
              <h4 className="text-sm font-bold text-white truncate mb-1">
                {selectedArticle.title}
              </h4>
              <p className="text-xs text-[#a1a1a6] line-clamp-1">{selectedArticle.summary}</p>
            </div>

            <button
              onClick={() => {
                triggerHaptic(20);
                onSelectArticle(selectedArticle);
                onClose();
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold text-white shadow-md transition-all flex-shrink-0"
              style={{
                background: 'linear-gradient(135deg, #0071e3 0%, #2997ff 100%)',
              }}
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
