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

// Category display config con tinte ufficiali Apple HIG (iOS Dark Mode)
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
    color: 'text-[#2997ff]',
    bgColor: 'bg-[#2997ff]/10',
    borderColor: 'border-[#2997ff]/30',
    accentHex: '#2997ff',
    badgeGlow: 'rgba(41, 151, 255, 0.3)',
  },
  'Mercati & Economia': {
    label: 'Mercati & Economia',
    color: 'text-[#30d158]',
    bgColor: 'bg-[#30d158]/10',
    borderColor: 'border-[#30d158]/30',
    accentHex: '#30d158',
    badgeGlow: 'rgba(48, 209, 88, 0.3)',
  },
  'Geopolitica': {
    label: 'Geopolitica',
    color: 'text-[#ff375f]',
    bgColor: 'bg-[#ff375f]/10',
    borderColor: 'border-[#ff375f]/30',
    accentHex: '#ff375f',
    badgeGlow: 'rgba(255, 55, 95, 0.3)',
  },
  'Scienza': {
    label: 'Scienza',
    color: 'text-[#bf5af2]',
    bgColor: 'bg-[#bf5af2]/10',
    borderColor: 'border-[#bf5af2]/30',
    accentHex: '#bf5af2',
    badgeGlow: 'rgba(191, 90, 242, 0.3)',
  },
  'Italia': {
    label: 'Italia',
    color: 'text-[#ff9f0a]',
    bgColor: 'bg-[#ff9f0a]/10',
    borderColor: 'border-[#ff9f0a]/30',
    accentHex: '#ff9f0a',
    badgeGlow: 'rgba(255, 159, 10, 0.3)',
  },
  'Altro': {
    label: 'Altro',
    color: 'text-[#98989d]',
    bgColor: 'bg-[#98989d]/10',
    borderColor: 'border-[#98989d]/30',
    accentHex: '#98989d',
    badgeGlow: 'rgba(152, 152, 157, 0.25)',
  },
};
