// Article from LLM structured output
export interface Article {
  id: string;
  title: string;
  category: Category;
  source: string;
  sourceUrl: string;
  readingTimeMinutes: number;
  keyPoints: [string, string, string]; // exactly 3
  whyCounts: string;
  summary: string;
  impactScore?: number; // 1-100 punteggio di impatto strategico
}

export type Category =
  | 'Tech & AI'
  | 'Mercati & Economia'
  | 'Geopolitica'
  | 'Scienza'
  | 'Italia'
  | 'Altro';

export const ALL_CATEGORIES: Category[] = [
  'Tech & AI',
  'Mercati & Economia',
  'Geopolitica',
  'Scienza',
  'Italia',
  'Altro',
];

// Daily Briefing from Supabase
export interface DailyBriefing {
  id: string;
  date: string; // YYYY-MM-DD
  created_at: string;
  articles: Article[];
  curatorNotes?: string;
}

// Push subscription stored in Supabase
export interface PushSubscriptionRecord {
  id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  created_at: string;
}

// IndexedDB stored briefing
export interface CachedBriefing {
  date: string;
  briefing: DailyBriefing;
  cachedAt: number;
}

// Visual layout options
export type DisplayDensity = 'magazine' | 'compact' | 'minimal';
export type AppTheme = 'midnight' | 'oled' | 'cyber';
export type FontSize = 'normal' | 'large' | 'xlarge';

export interface UserPreferences {
  density: DisplayDensity;
  theme: AppTheme;
  fontSize: FontSize;
  autoPlayAudio: boolean;
}

// Category display config
export interface CategoryConfig {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  accentHex: string;
  badgeGlow: string;
}

export const CATEGORY_CONFIG: Record<Category, CategoryConfig> = {
  'Tech & AI': {
    label: 'Tech & AI',
    color: 'text-cyan-300',
    bgColor: 'bg-cyan-500/10',
    borderColor: 'border-cyan-500/30',
    accentHex: '#06b6d4',
    badgeGlow: 'rgba(6, 182, 212, 0.4)',
  },
  'Mercati & Economia': {
    label: 'Mercati & Economia',
    color: 'text-emerald-300',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
    accentHex: '#10b981',
    badgeGlow: 'rgba(16, 185, 129, 0.4)',
  },
  'Geopolitica': {
    label: 'Geopolitica',
    color: 'text-rose-300',
    bgColor: 'bg-rose-500/10',
    borderColor: 'border-rose-500/30',
    accentHex: '#f43f5e',
    badgeGlow: 'rgba(244, 63, 94, 0.4)',
  },
  'Scienza': {
    label: 'Scienza',
    color: 'text-violet-300',
    bgColor: 'bg-violet-500/10',
    borderColor: 'border-violet-500/30',
    accentHex: '#8b5cf6',
    badgeGlow: 'rgba(139, 92, 246, 0.4)',
  },
  'Italia': {
    label: 'Italia',
    color: 'text-amber-300',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
    accentHex: '#f59e0b',
    badgeGlow: 'rgba(245, 158, 11, 0.4)',
  },
  'Altro': {
    label: 'Altro',
    color: 'text-slate-300',
    bgColor: 'bg-slate-500/10',
    borderColor: 'border-slate-500/30',
    accentHex: '#94a3b8',
    badgeGlow: 'rgba(148, 163, 184, 0.3)',
  },
};
