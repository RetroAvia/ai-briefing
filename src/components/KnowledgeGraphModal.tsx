'use client';

import { motion } from 'framer-motion';
import { X, Network, Sparkles, ArrowRight, Orbit, Cpu, Zap, Shield, Rocket } from 'lucide-react';
import { useState, useMemo } from 'react';
import type { Article, Category } from '@/types';
import { CATEGORY_CONFIG, ALL_CATEGORIES } from '@/types';
import { triggerHaptic } from '@/lib/export';
import { playSoftClick } from '@/lib/sound';

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
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('Tutti');

  const filteredArticles = useMemo(() => {
    if (selectedCategoryFilter === 'Tutti') return articles;
    return articles.filter((a) => a.category === selectedCategoryFilter);
  }, [articles, selectedCategoryFilter]);

  if (!isOpen || articles.length === 0) return null;

  // Geometry: Calculate harmonious orbital positions
  const centerX = 250;
  const centerY = 210;
  const radius = 145;

  const displayArticles = filteredArticles.length > 0 ? filteredArticles.slice(0, 10) : articles.slice(0, 10);

  const nodes = displayArticles.map((art, index) => {
    const total = Math.max(displayArticles.length, 1);
    const angle = (index / total) * 2 * Math.PI - Math.PI / 2;
    const x = Math.round(centerX + radius * Math.cos(angle));
    const y = Math.round(centerY + radius * Math.sin(angle));
    return {
      ...art,
      x,
      y,
      index,
    };
  });

  const selectedArticle =
    articles.find((a) => a.id === selectedNodeId) || displayArticles[0] || articles[0];
  const config = selectedArticle ? CATEGORY_CONFIG[selectedArticle.category] : CATEGORY_CONFIG['Altro'];

  // Categories present in articles for filter chips
  const presentCategories = Array.from(new Set(articles.map((a) => a.category)));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-[#000000]/85 backdrop-blur-2xl flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
    >
      <motion.div
        initial={{ scale: 0.94, y: 16 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.94, y: 16 }}
        transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
        className="w-full max-w-3xl rounded-[30px] p-5 sm:p-7 border relative overflow-hidden flex flex-col gap-4 shadow-2xl"
        style={{
          background: 'rgba(18, 18, 24, 0.96)',
          backdropFilter: 'blur(40px) saturate(200%)',
          WebkitBackdropFilter: 'blur(40px) saturate(200%)',
          borderColor: 'rgba(255, 255, 255, 0.12)',
          boxShadow: '0 30px 80px rgba(0, 0, 0, 0.95), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
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
                Quantum Knowledge Nexus 3000 <Sparkles className="w-3.5 h-3.5 text-[#2997ff]" />
              </h3>
              <p className="text-xs text-[#86868b]">
                Mappa orbitale delle risonanze strategiche cross-settoriali
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              playSoftClick(500);
              triggerHaptic(15);
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-white/[0.08] hover:bg-white/[0.15] text-[#86868b] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Sector Cluster Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={() => {
              playSoftClick(750);
              triggerHaptic(10);
              setSelectedCategoryFilter('Tutti');
            }}
            className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategoryFilter === 'Tutti'
                ? 'bg-white text-black font-bold shadow-md'
                : 'bg-white/[0.05] text-[#86868b] hover:text-white border border-white/[0.08]'
            }`}
          >
            Tutti i Cluster ({articles.length})
          </button>
          {presentCategories.map((cat) => {
            const isCatActive = selectedCategoryFilter === cat;
            return (
              <button
                key={cat}
                onClick={() => {
                  playSoftClick(850);
                  triggerHaptic(10);
                  setSelectedCategoryFilter(cat);
                  const firstInCat = articles.find((a) => a.category === cat);
                  if (firstInCat) setSelectedNodeId(firstInCat.id);
                }}
                className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all cursor-pointer border ${
                  isCatActive
                    ? 'bg-[#2997ff]/20 border-[#2997ff]/50 text-white font-bold'
                    : 'bg-white/[0.04] border-white/[0.06] text-[#86868b] hover:text-white'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Visual Graph View (SVG Orbital Simulation) */}
        <div className="relative w-full h-[280px] sm:h-[330px] bg-black/50 rounded-2xl border border-white/[0.06] overflow-hidden flex items-center justify-center">
          <svg viewBox="0 0 500 420" className="w-full h-full select-none">
            <defs>
              <linearGradient id="orbitGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#bf5af2" stopOpacity="0.5" />
                <stop offset="50%" stopColor="#2997ff" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#64d2ff" stopOpacity="0.5" />
              </linearGradient>
              <filter id="glowNexus" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#64d2ff" floodOpacity="0.85" />
              </filter>
            </defs>

            {/* Orbital Rings */}
            <circle cx={centerX} cy={centerY} r={radius} fill="none" stroke="rgba(255, 255, 255, 0.06)" strokeDasharray="4 4" />
            <circle cx={centerX} cy={centerY} r={radius * 0.55} fill="none" stroke="rgba(255, 255, 255, 0.04)" strokeDasharray="3 3" />

            {/* Resonance Beams between central hub and nodes */}
            {nodes.map((node, i) => {
              const isSelected = selectedNodeId === node.id;
              return (
                <motion.line
                  key={`line-${node.id}`}
                  x1={centerX}
                  y1={centerY}
                  x2={node.x}
                  y2={node.y}
                  stroke={isSelected ? '#64d2ff' : 'url(#orbitGrad)'}
                  strokeWidth={isSelected ? 2.5 : 1}
                  strokeDasharray={isSelected ? 'none' : '3 3'}
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.6, delay: i * 0.03 }}
                />
              );
            })}

            {/* Perimeter Connections */}
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

            {/* Central Intelligence Core */}
            <circle cx={centerX} cy={centerY} r="28" fill="#121218" stroke="#bf5af2" strokeWidth="2.5" />
            <circle cx={centerX} cy={centerY} r="18" fill="url(#orbitGrad)" opacity="0.75" />
            <text
              x={centerX}
              y={centerY}
              fill="#ffffff"
              fontSize="9"
              fontWeight="bold"
              textAnchor="middle"
              dominantBaseline="central"
            >
              NEXUS
            </text>

            {/* Peripheral Resonance Nodes */}
            {nodes.map((node) => {
              const isSelected = selectedNodeId === node.id;
              return (
                <g
                  key={node.id}
                  onClick={() => {
                    playSoftClick(850);
                    triggerHaptic(15);
                    setSelectedNodeId(node.id);
                  }}
                  className="cursor-pointer"
                >
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={isSelected ? 18 : 13}
                    fill={isSelected ? '#64d2ff' : '#14141c'}
                    stroke={isSelected ? '#ffffff' : '#bf5af2'}
                    strokeWidth={isSelected ? 2.5 : 1.5}
                    filter={isSelected ? 'url(#glowNexus)' : 'none'}
                    className="transition-all duration-200"
                  />
                  <text
                    x={node.x}
                    y={node.y}
                    fill={isSelected ? '#000000' : '#ffffff'}
                    fontSize="9.5"
                    fontWeight="bold"
                    textAnchor="middle"
                    dominantBaseline="central"
                  >
                    {node.index + 1}
                  </text>
                  <text
                    x={node.x}
                    y={node.y + 24}
                    fill={isSelected ? '#64d2ff' : '#86868b'}
                    fontSize="8"
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

        {/* Selected Node Details Card with Impact Shockwave */}
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
                {selectedArticle.impactScore && (
                  <span className="text-[10px] text-[#bf5af2] font-bold">
                    Score: {selectedArticle.impactScore}/100
                  </span>
                )}
              </div>
              <h4 className="text-sm font-bold text-white truncate mb-1">
                {selectedArticle.title}
              </h4>
              <p className="text-xs text-[#a1a1a6] line-clamp-1">{selectedArticle.summary}</p>
            </div>

            <button
              onClick={() => {
                playSoftClick(900);
                triggerHaptic(20);
                onSelectArticle(selectedArticle);
                onClose();
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold text-white shadow-md transition-all flex-shrink-0 cursor-pointer"
              style={{
                background: 'linear-gradient(135deg, #0071e3 0%, #2997ff 100%)',
              }}
            >
              <span>Apri nel Reader</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
