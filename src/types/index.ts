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

// Category display config
export interface CategoryConfig {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

export const CATEGORY_CONFIG: Record<Category, CategoryConfig> = {
  'Tech & AI': {
    label: 'Tech & AI',
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/10',
    borderColor: 'border-cyan-500/30',
  },
  'Mercati & Economia': {
    label: 'Mercati & Economia',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
  },
  'Geopolitica': {
    label: 'Geopolitica',
    color: 'text-red-400',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/30',
  },
  'Scienza': {
    label: 'Scienza',
    color: 'text-violet-400',
    bgColor: 'bg-violet-500/10',
    borderColor: 'border-violet-500/30',
  },
  'Italia': {
    label: 'Italia',
    color: 'text-green-400',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/30',
  },
  'Altro': {
    label: 'Altro',
    color: 'text-slate-400',
    bgColor: 'bg-slate-500/10',
    borderColor: 'border-slate-500/30',
  },
};
