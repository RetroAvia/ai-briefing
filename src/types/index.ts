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
  | 'Aerospazio & Aviazione'
  | 'Energia & Sostenibilità'
  | 'Cybersecurity'
  | 'Italia'
  | 'Altro';

export const ALL_CATEGORIES: Category[] = [
  'Tech & AI',
  'Aerospazio & Aviazione',
  'Mercati & Economia',
  'Geopolitica',
  'Scienza',
  'Energia & Sostenibilità',
  'Cybersecurity',
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

// Livelli di gradimento / priorità per ciascuna categoria
export type InterestLevel = 'top' | 'high' | 'medium' | 'low';

export interface CategoryPreference {
  interest: InterestLevel;
  favoriteSubtopics?: string[];
  pushAlerts?: boolean;
}

export interface UserPreferences {
  density: DisplayDensity;
  theme: AppTheme;
  fontSize: FontSize;
  autoPlayAudio: boolean;
  categoryPreferences?: Partial<Record<Category, CategoryPreference>>;
  hasCompletedOnboarding?: boolean;
  userName?: string;
  userRole?: string; // es. "Ingegnere Aerospaziale"
}

// Category display config con tinte ufficiali Apple HIG (iOS Dark Mode)
export interface CategoryConfig {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  accentHex: string;
  badgeGlow: string;
  iconName?: string;
}

export const CATEGORY_CONFIG: Record<Category, CategoryConfig> = {
  'Tech & AI': {
    label: 'Tech & AI',
    color: 'text-[#2997ff]',
    bgColor: 'bg-[#2997ff]/10',
    borderColor: 'border-[#2997ff]/30',
    accentHex: '#2997ff',
    badgeGlow: 'rgba(41, 151, 255, 0.3)',
    iconName: 'Cpu',
  },
  'Aerospazio & Aviazione': {
    label: 'Aerospazio & Aviazione',
    color: 'text-[#64d2ff]',
    bgColor: 'bg-[#64d2ff]/10',
    borderColor: 'border-[#64d2ff]/30',
    accentHex: '#64d2ff',
    badgeGlow: 'rgba(100, 210, 255, 0.35)',
    iconName: 'Rocket',
  },
  'Mercati & Economia': {
    label: 'Mercati & Economia',
    color: 'text-[#30d158]',
    bgColor: 'bg-[#30d158]/10',
    borderColor: 'border-[#30d158]/30',
    accentHex: '#30d158',
    badgeGlow: 'rgba(48, 209, 88, 0.3)',
    iconName: 'TrendingUp',
  },
  'Geopolitica': {
    label: 'Geopolitica',
    color: 'text-[#ff375f]',
    bgColor: 'bg-[#ff375f]/10',
    borderColor: 'border-[#ff375f]/30',
    accentHex: '#ff375f',
    badgeGlow: 'rgba(255, 55, 95, 0.3)',
    iconName: 'Globe',
  },
  'Scienza': {
    label: 'Scienza',
    color: 'text-[#bf5af2]',
    bgColor: 'bg-[#bf5af2]/10',
    borderColor: 'border-[#bf5af2]/30',
    accentHex: '#bf5af2',
    badgeGlow: 'rgba(191, 90, 242, 0.3)',
    iconName: 'Atom',
  },
  'Energia & Sostenibilità': {
    label: 'Energia & Sostenibilità',
    color: 'text-[#34c759]',
    bgColor: 'bg-[#34c759]/10',
    borderColor: 'border-[#34c759]/30',
    accentHex: '#34c759',
    badgeGlow: 'rgba(52, 199, 89, 0.35)',
    iconName: 'Zap',
  },
  'Cybersecurity': {
    label: 'Cybersecurity',
    color: 'text-[#ffd60a]',
    bgColor: 'bg-[#ffd60a]/10',
    borderColor: 'border-[#ffd60a]/30',
    accentHex: '#ffd60a',
    badgeGlow: 'rgba(255, 214, 10, 0.35)',
    iconName: 'ShieldCheck',
  },
  'Italia': {
    label: 'Italia',
    color: 'text-[#ff9f0a]',
    bgColor: 'bg-[#ff9f0a]/10',
    borderColor: 'border-[#ff9f0a]/30',
    accentHex: '#ff9f0a',
    badgeGlow: 'rgba(255, 159, 10, 0.3)',
    iconName: 'Flag',
  },
  'Altro': {
    label: 'Altro',
    color: 'text-[#98989d]',
    bgColor: 'bg-[#98989d]/10',
    borderColor: 'border-[#98989d]/30',
    accentHex: '#98989d',
    badgeGlow: 'rgba(152, 152, 157, 0.25)',
    iconName: 'Layers',
  },
};

// Sotto-temi predefiniti selezionabili nel Forum di personalizzazione
export const CATEGORY_SUBTOPICS: Record<Category, string[]> = {
  'Aerospazio & Aviazione': [
    'Aerei a Idrogeno & SAF',
    'Lanciatori Starship & Falcon',
    'Propulsione Orbitale Criogenica',
    'Missioni Lunari Artemis',
    'Costellazioni Satellitari LEO',
    'Aerodinamica Computazionale',
  ],
  'Tech & AI': [
    'Modelli LLM & Reasoning',
    'Agenti Autonomi Multi-Ruolo',
    'Acceleratori Neurali a 2nm',
    'Quantum Computing',
    'Robotica Umanoide',
  ],
  'Cybersecurity': [
    'Crittografia Post-Quantistica',
    'Difesa Reti Satellitari',
    'Architetture Zero-Trust',
    'Intelligence sulle Minacce',
    'Sovranità Digitale Europea',
  ],
  'Energia & Sostenibilità': [
    'Fusione Nucleare Magnetica',
    'Batterie a Stato Solido',
    'Idrogeno Pulito',
    'Cattura e Stoccaggio CO2',
    'Reti Smart Grid Continentali',
  ],
  'Mercati & Economia': [
    'Borse Europee & Indici',
    'Finanziamenti DeepTech & Spazio',
    'Politica Monetaria & Tassi',
    'Materie Prime e Semiconduttori',
    'Fondi Sovrani & Sostenibilità',
  ],
  'Scienza': [
    'Fisica dei Plasmi',
    'Editing Genomico CRISPR',
    'Astrofisica & Buchi Neri',
    'Materiali Compositi Avanzati',
    'Neuroscienze Computazionali',
  ],
  'Geopolitica': [
    'Accordi Spaziali Internazionali',
    'Autonomia Strategica Europea',
    'Trattati Orbitali e Spazio Civile',
    'Sicurezza delle Rotte Globali',
    'Cooperazione Scientifica Globale',
  ],
  'Italia': [
    'Distretti Aerospaziali Nazionali',
    'Infrastrutture Cloud Sovrane',
    'Centri di Ricerca & Politecnici',
    'Export Tecnologico & Meccanica',
    'Modernizzazione dei Servizi PA',
  ],
  'Altro': ['Innovazione di Frontiera', 'Design & Architettura', 'Trend Macroeconomici'],
};
