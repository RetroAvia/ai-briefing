'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Sparkles,
  Check,
  Flame,
  Star,
  BookOpen,
  Moon,
  Rocket,
  Cpu,
  ShieldCheck,
  Zap,
  TrendingUp,
  Globe,
  Atom,
  Flag,
  Layers,
  ArrowRight,
  User,
  Sliders,
} from 'lucide-react';
import { useState, useMemo, useCallback } from 'react';
import type {
  Category,
  InterestLevel,
  CategoryPreference,
  UserPreferences,
} from '@/types';
import { ALL_CATEGORIES, CATEGORY_CONFIG, CATEGORY_SUBTOPICS } from '@/types';
import { triggerHaptic } from '@/lib/export';

interface WelcomePreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
  preferences: UserPreferences;
  onSavePreferences: (updated: UserPreferences) => void;
  onTriggerGeneration?: () => void;
  isOnboarding?: boolean;
}

const CATEGORY_ICONS: Record<Category, typeof Rocket> = {
  'Aerospazio & Aviazione': Rocket,
  'Tech & AI': Cpu,
  'Cybersecurity': ShieldCheck,
  'Energia & Sostenibilità': Zap,
  'Mercati & Economia': TrendingUp,
  'Geopolitica': Globe,
  'Scienza': Atom,
  'Italia': Flag,
  'Altro': Layers,
};

const INTEREST_LEVELS: {
  id: InterestLevel;
  label: string;
  icon: typeof Flame;
  color: string;
  badgeBg: string;
}[] = [
  { id: 'top', label: 'Top', icon: Flame, color: 'text-[#ff375f]', badgeBg: 'bg-[#ff375f]/20 border-[#ff375f]/40' },
  { id: 'high', label: 'Alta', icon: Star, color: 'text-[#ff9f0a]', badgeBg: 'bg-[#ff9f0a]/20 border-[#ff9f0a]/40' },
  { id: 'medium', label: 'Media', icon: BookOpen, color: 'text-[#2997ff]', badgeBg: 'bg-[#2997ff]/20 border-[#2997ff]/40' },
  { id: 'low', label: 'Bassa', icon: Moon, color: 'text-[#86868b]', badgeBg: 'bg-white/10 border-white/20' },
];

const PRESET_ROLES = [
  { role: 'Ingegnere Aerospaziale', icon: '🚀' },
  { role: 'AI & Software Engineer', icon: '🧠' },
  { role: 'Cyber & Defense Analyst', icon: '🛡️' },
  { role: 'Energy & Green Specialist', icon: '⚡' },
  { role: 'Executive & Finanza', icon: '📈' },
  { role: 'Studente Universitario', icon: '🎓' },
];

export default function WelcomePreferencesModal({
  isOpen,
  onClose,
  preferences,
  onSavePreferences,
  onTriggerGeneration,
  isOnboarding = false,
}: WelcomePreferencesModalProps) {
  const [userRole, setUserRole] = useState(preferences.userRole || 'Ingegnere Aerospaziale');
  const [userName, setUserName] = useState(preferences.userName || '');

  // Mappa delle preferenze per categoria
  const [catPrefs, setCatPrefs] = useState<Partial<Record<Category, CategoryPreference>>>(() => {
    return preferences.categoryPreferences || {};
  });

  // Livello di interesse corrente per una determinata categoria
  const getInterest = useCallback(
    (cat: Category): InterestLevel => {
      if (catPrefs[cat]?.interest) return catPrefs[cat]!.interest;
      if (cat === 'Aerospazio & Aviazione') return 'top';
      if (cat === 'Tech & AI' || cat === 'Cybersecurity' || cat === 'Energia & Sostenibilità') return 'high';
      if (cat === 'Altro') return 'low';
      return 'medium';
    },
    [catPrefs]
  );

  const setInterest = (cat: Category, interest: InterestLevel) => {
    triggerHaptic(10);
    setCatPrefs((prev) => ({
      ...prev,
      [cat]: {
        ...(prev[cat] || {}),
        interest,
      },
    }));
  };

  const toggleSubtopic = (cat: Category, subtopic: string) => {
    triggerHaptic(10);
    setCatPrefs((prev) => {
      const current = prev[cat]?.favoriteSubtopics || [];
      const updated = current.includes(subtopic)
        ? current.filter((s) => s !== subtopic)
        : [...current, subtopic];
      return {
        ...prev,
        [cat]: {
          ...(prev[cat] || { interest: getInterest(cat) }),
          favoriteSubtopics: updated,
        },
      };
    });
  };

  // Calcolo ordine live stimato del feed
  const liveFeedOrder = useMemo(() => {
    const priorityScore: Record<InterestLevel, number> = {
      top: 4,
      high: 3,
      medium: 2,
      low: 1,
    };

    return [...ALL_CATEGORIES].sort((a, b) => {
      const scoreA = priorityScore[getInterest(a)];
      const scoreB = priorityScore[getInterest(b)];
      return scoreB - scoreA;
    });
  }, [getInterest]);

  const handleSave = () => {
    triggerHaptic(20);
    const updated: UserPreferences = {
      ...preferences,
      userRole,
      userName: userName.trim() || undefined,
      categoryPreferences: catPrefs,
      hasCompletedOnboarding: true,
    };
    onSavePreferences(updated);
    onClose();
  };

  const handleSaveAndGenerate = () => {
    handleSave();
    if (onTriggerGeneration) {
      setTimeout(onTriggerGeneration, 300);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
        {/* Backdrop Apple Glass */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-[#000000]/80 backdrop-blur-2xl transition-opacity"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
          className="relative w-full max-w-3xl rounded-[30px] p-6 sm:p-8 border border-white/10 z-10 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
          style={{
            background: 'rgba(16, 16, 22, 0.97)',
            boxShadow: '0 30px 90px rgba(0, 0, 0, 0.95), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
          }}
        >
          {/* Ambient Glow */}
          <div
            className="absolute -top-32 -left-32 w-72 h-72 rounded-full pointer-events-none opacity-20"
            style={{
              background: 'radial-gradient(circle, #64d2ff 0%, #2997ff 60%, transparent 70%)',
            }}
          />

          {/* Close button */}
          <button
            onClick={() => {
              triggerHaptic(10);
              onClose();
            }}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-[#86868b] hover:text-white flex items-center justify-center transition-colors z-20"
            title="Chiudi"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Modal Header */}
          <div className="flex items-start gap-4 mb-5 flex-shrink-0">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#0071e3] to-[#64d2ff] flex items-center justify-center flex-shrink-0 shadow-lg shadow-[#0071e3]/30">
              <Sliders className="w-6 h-6 text-white" />
            </div>
            <div className="min-w-0 pr-8">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#64d2ff]">
                  {isOnboarding ? 'Benvenuto nel tuo AI Briefing' : 'Personalizzazione Radar AI'}
                </span>
                <span className="px-2 py-0.2 rounded-full bg-[#64d2ff]/15 text-[#64d2ff] text-[10px] font-extrabold">
                  Algoritmo Priorità
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                Imposta i Tuoi Interessi
              </h2>
              <p className="text-xs text-[#a1a1a6] mt-1 leading-relaxed">
                Le categorie con priorità <span className="text-[#ff375f] font-bold">Top</span> e{' '}
                <span className="text-[#ff9f0a] font-bold">Alta</span> guideranno la notizia di copertina e
                appariranno per prime nel feed; seguiranno poi i temi generali per una visione d&apos;insieme completa.
              </p>
            </div>
          </div>

          {/* Scrollable Form Body */}
          <div className="overflow-y-auto space-y-6 pr-1 flex-1 py-1 scrollbar-hide">
            {/* Sezione 1: Ruolo e Saluto */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
              <div className="flex items-center gap-2 mb-2 text-xs font-bold text-white uppercase tracking-wider">
                <User className="w-3.5 h-3.5 text-[#2997ff]" />
                <span>Il Tuo Profilo & Saluto Mattutino</span>
              </div>
              <p className="text-[11px] text-[#86868b] mb-3">
                Scegli come preferisci che l&apos;AI ti saluti nell&apos;intestazione ogni mattina:
              </p>
              <div className="flex flex-wrap gap-2">
                {PRESET_ROLES.map((preset) => (
                  <button
                    key={preset.role}
                    type="button"
                    onClick={() => {
                      triggerHaptic(10);
                      setUserRole(preset.role);
                    }}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      userRole === preset.role
                        ? 'bg-white text-black font-bold shadow-md'
                        : 'bg-white/[0.05] border border-white/[0.08] text-[#86868b] hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <span>{preset.icon}</span>
                    <span>{preset.role}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Sezione 2: Categorie e Priorità */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-[#64d2ff]" />
                  <span>Priorità delle Categorie ({ALL_CATEGORIES.length})</span>
                </div>
                <span className="text-[10px] text-[#86868b]">Regola ogni argomento</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {ALL_CATEGORIES.map((cat) => {
                  const config = CATEGORY_CONFIG[cat] || CATEGORY_CONFIG['Altro'];
                  const Icon = CATEGORY_ICONS[cat] || Layers;
                  const currentLevel = getInterest(cat);
                  const subtopics = CATEGORY_SUBTOPICS[cat] || [];
                  const selectedSubtopics = catPrefs[cat]?.favoriteSubtopics || [];

                  return (
                    <div
                      key={cat}
                      className="p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 bg-white/[0.025] hover:bg-white/[0.04] border-white/[0.07]"
                    >
                      {/* Top: Icon + Title */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 border"
                            style={{
                              backgroundColor: `${config.accentHex}15`,
                              borderColor: `${config.accentHex}40`,
                              color: config.accentHex,
                            }}
                          >
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-white truncate">{cat}</h4>
                            <span className="text-[10px] text-[#86868b]">
                              {currentLevel === 'top'
                                ? 'Priorità Massima (Feed Hero)'
                                : currentLevel === 'high'
                                ? 'Molto Interessato'
                                : currentLevel === 'medium'
                                ? 'Generale'
                                : 'Bassa priorità'}
                            </span>
                          </div>
                        </div>

                        {/* Indicatore visivo attuale */}
                        <span
                          className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                            currentLevel === 'top'
                              ? 'bg-[#ff375f]/20 border-[#ff375f]/40 text-[#ff375f]'
                              : currentLevel === 'high'
                              ? 'bg-[#ff9f0a]/20 border-[#ff9f0a]/40 text-[#ff9f0a]'
                              : currentLevel === 'medium'
                              ? 'bg-[#2997ff]/20 border-[#2997ff]/40 text-[#2997ff]'
                              : 'bg-white/10 border-white/20 text-[#86868b]'
                          }`}
                        >
                          {currentLevel.toUpperCase()}
                        </span>
                      </div>

                      {/* 4-Way Segmented Selector */}
                      <div className="grid grid-cols-4 gap-1 p-1 rounded-xl bg-white/[0.04] border border-white/[0.06]">
                        {INTEREST_LEVELS.map((level) => {
                          const isSelected = currentLevel === level.id;
                          const LIcon = level.icon;

                          return (
                            <button
                              key={level.id}
                              type="button"
                              onClick={() => setInterest(cat, level.id)}
                              className={`py-1.5 px-2 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 transition-all ${
                                isSelected
                                  ? 'bg-white text-black shadow-sm font-extrabold'
                                  : 'text-[#86868b] hover:text-white hover:bg-white/[0.06]'
                              }`}
                            >
                              <LIcon className={`w-3 h-3 ${isSelected ? 'text-black' : level.color}`} />
                              <span>{level.label}</span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Sotto-temi interattivi */}
                      {subtopics.length > 0 && (
                        <div>
                          <p className="text-[10px] font-semibold text-[#86868b] mb-1.5 uppercase tracking-wide">
                            Focus di approfondimento:
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {subtopics.map((sub) => {
                              const isSubActive = selectedSubtopics.includes(sub);
                              return (
                                <button
                                  key={sub}
                                  type="button"
                                  onClick={() => toggleSubtopic(cat, sub)}
                                  className={`text-[10px] px-2 py-0.5 rounded-full border transition-all ${
                                    isSubActive
                                      ? 'bg-white/20 border-white/40 text-white font-bold'
                                      : 'bg-white/[0.03] border-white/[0.06] text-[#86868b] hover:text-[#d2d2d7]'
                                  }`}
                                >
                                  {isSubActive && '✓ '}
                                  {sub}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Sezione 3: Live Preview Ordine Feed */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-white/[0.04] to-white/[0.02] border border-white/[0.07]">
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[11px] font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-[#30d158]" /> Ordine di Priorità nel Tuo Feed
                </span>
                <span className="text-[10px] text-[#86868b]">Aggiornato in tempo reale</span>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                {liveFeedOrder.map((cat, idx) => {
                  const cfg = CATEGORY_CONFIG[cat];
                  return (
                    <span
                      key={cat}
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border"
                      style={{
                        backgroundColor: `${cfg.accentHex}15`,
                        borderColor: `${cfg.accentHex}40`,
                        color: cfg.accentHex,
                      }}
                    >
                      <span className="text-[#86868b]">{idx + 1}°</span>
                      <span>{cat}</span>
                    </span>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div className="flex items-center justify-between gap-3 pt-4 border-t border-white/[0.08] flex-shrink-0 mt-3">
            <button
              type="button"
              onClick={() => {
                triggerHaptic(10);
                // Reset a default
                setCatPrefs(preferences.categoryPreferences || {});
                onClose();
              }}
              className="px-4 py-2 rounded-full text-xs font-semibold text-[#86868b] hover:text-white transition-colors"
            >
              Annulla
            </button>

            <div className="flex items-center gap-2">
              {onTriggerGeneration && (
                <button
                  type="button"
                  onClick={handleSaveAndGenerate}
                  className="px-4 py-2 rounded-full text-xs font-bold text-[#64d2ff] bg-[#64d2ff]/10 hover:bg-[#64d2ff]/20 border border-[#64d2ff]/30 transition-all flex items-center gap-1.5 shadow-sm"
                  title="Salva le preferenze e genera subito un nuovo briefing aggiornato"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#64d2ff]" />
                  <span className="hidden sm:inline">Salva & Genera AI</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleSave}
                className="px-5 py-2.5 rounded-full text-xs font-bold text-white bg-[#0071e3] hover:bg-[#0077ed] transition-all flex items-center gap-1.5 shadow-lg shadow-[#0071e3]/30"
              >
                <span>Applica al Feed</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
