'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { RefreshCw, Download, Sparkles } from 'lucide-react';
import Header from '@/components/Header';
import HeroStory from '@/components/HeroStory';
import NewsCard from '@/components/NewsCard';
import ArticleDrawer from '@/components/ArticleDrawer';
import CalendarModal from '@/components/CalendarModal';
import ViewDensityToggle from '@/components/ViewDensityToggle';
import CategoryFilter, { type FilterOption } from '@/components/CategoryFilter';
import SearchBar from '@/components/SearchBar';
import SkeletonCard from '@/components/SkeletonCard';
import EmptyState from '@/components/EmptyState';
import ExecutivePulse from '@/components/ExecutivePulse';
import StoryModeModal from '@/components/StoryModeModal';
import KnowledgeGraphModal from '@/components/KnowledgeGraphModal';
import ExportModal from '@/components/ExportModal';
import FloatingAudioBar from '@/components/FloatingAudioBar';
import WelcomePreferencesModal from '@/components/WelcomePreferencesModal';
import GenerationModal from '@/components/GenerationModal';
import ScenarioSimulatorModal from '@/components/ScenarioSimulatorModal';
import KeyboardShortcutsModal from '@/components/KeyboardShortcutsModal';
import ToastContainer, { type ToastMessage } from '@/components/Toast';
import { createClient } from '@/lib/supabase/client';
import {
  saveBriefing,
  getLatestBriefing,
  getBriefingByDate,
  getAvailableBriefingDates,
  SEED_BRIEFING,
  getBookmarks,
  saveBookmark,
  removeBookmark,
  getPreferences,
  savePreferences,
  DEFAULT_PREFERENCES,
} from '@/lib/idb';
import {
  getNotificationStatus,
  requestNotificationPermission,
  subscribeToNotifications,
  unsubscribeFromNotifications,
} from '@/lib/push';
import { triggerHaptic } from '@/lib/export';
import { playSoftClick, playCyberChime, playRadarScan } from '@/lib/sound';
import type {
  Article,
  DailyBriefing,
  DisplayDensity,
  Category,
  InterestLevel,
  CategoryPreference,
  UserPreferences,
} from '@/types';
import { ALL_CATEGORIES } from '@/types';

// Algoritmo di ranking basato sul profilo preferenze dell'utente
function sortArticlesByPreferences(
  articles: Article[],
  categoryPreferences?: Partial<Record<Category, CategoryPreference>>
): Article[] {
  if (!categoryPreferences || Object.keys(categoryPreferences).length === 0) {
    return articles;
  }

  const weightMap: Record<InterestLevel, number> = {
    top: 1000,
    high: 500,
    medium: 100,
    low: 10,
  };

  return [...articles].sort((a, b) => {
    const prefA = categoryPreferences[a.category];
    const prefB = categoryPreferences[b.category];

    const weightA = prefA?.interest ? weightMap[prefA.interest] : 100;
    const weightB = prefB?.interest ? weightMap[prefB.interest] : 100;

    const subtopicsA = prefA?.favoriteSubtopics || [];
    const subtopicsB = prefB?.favoriteSubtopics || [];

    const subBonusA = subtopicsA.some(
      (s) =>
        a.title.toLowerCase().includes(s.toLowerCase()) ||
        a.summary.toLowerCase().includes(s.toLowerCase())
    )
      ? 60
      : 0;

    const subBonusB = subtopicsB.some(
      (s) =>
        b.title.toLowerCase().includes(s.toLowerCase()) ||
        b.summary.toLowerCase().includes(s.toLowerCase())
    )
      ? 60
      : 0;

    const totalScoreA = weightA + subBonusA + (a.impactScore || 50) * 0.1;
    const totalScoreB = weightB + subBonusB + (b.impactScore || 50) * 0.1;

    return totalScoreB - totalScoreA;
  });
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

function formatSafeDate(dateStr: string): string {
  if (!dateStr) return '';
  try {
    const parts = dateStr.split('T')[0]?.split('-');
    if (parts && parts.length === 3) {
      const year = parseInt(parts[0]!, 10);
      const month = parseInt(parts[1]!, 10) - 1;
      const day = parseInt(parts[2]!, 10);
      const d = new Date(year, month, day);
      if (!isNaN(d.getTime())) {
        return new Intl.DateTimeFormat('it-IT', { day: 'numeric', month: 'long', year: 'numeric' }).format(d);
      }
    }
    const fallback = new Date(dateStr);
    if (!isNaN(fallback.getTime())) {
      return new Intl.DateTimeFormat('it-IT', { day: 'numeric', month: 'long', year: 'numeric' }).format(fallback);
    }
    return dateStr;
  } catch {
    return dateStr;
  }
}

export default function Home() {
  const [briefing, setBriefing] = useState<DailyBriefing | null>(null);
  const [bookmarks, setBookmarks] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<FilterOption>('Tutti');
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [source, setSource] = useState<'remote' | 'cache' | 'seed' | null>(null);

  // Preferenze utente, Profilo Radar & Forum di Benvenuto
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);
  const [isOnboarding, setIsOnboarding] = useState(false);

  // Generatore On-Demand Notizie AI
  const [isGeneratingOpen, setIsGeneratingOpen] = useState(false);

  // Vision 3000: Simulatore Scenari Futuri 2030-2050 & Scorciatoie da Tastiera
  const [isScenarioOpen, setIsScenarioOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

  // Layout & Densità visiva
  const [density, setDensity] = useState<DisplayDensity>('magazine');

  // Drawer lettura immersiva
  const [selectedArticleForDrawer, setSelectedArticleForDrawer] = useState<Article | null>(null);

  // Archivio Storico / Calendario
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [availableDates, setAvailableDates] = useState<string[]>([]);

  // Modalità innovative
  const [isStoriesOpen, setIsStoriesOpen] = useState(false);
  const [storyInitialIndex, setStoryInitialIndex] = useState(0);
  const [isKnowledgeGraphOpen, setIsKnowledgeGraphOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Audio Bar persistente
  const [activeAudioArticleId, setActiveAudioArticleId] = useState<string | null>(null);
  const [isAudioBarVisible, setIsAudioBarVisible] = useState(false);

  // Toast notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // PWA Install prompt
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [canInstallPwa, setCanInstallPwa] = useState(false);

  const addToast = useCallback((text: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // --- 1. Service Worker & PWA Install Listener ---
  useEffect(() => {
    const isSecureContext =
      typeof window !== 'undefined' &&
      (window.location.protocol === 'https:' ||
        window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1');

    if ('serviceWorker' in navigator && isSecureContext) {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .catch((err) => console.warn('[SW] Registrazione SW fallita:', err));
    }

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
      setCanInstallPwa(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  // --- 2. Online / Offline Listener ---
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      playRadarScan();
      addToast('Connessione ripristinata: modalità Online attiva', 'success');
    };
    const handleOffline = () => {
      setIsOnline(false);
      playSoftClick(400);
      addToast('Dispositivo offline: modalità metropolitana attiva', 'info');
    };

    setIsOnline(navigator.onLine);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [addToast]);

  // --- 3. Caricamento Preferenze Utente & Notifiche ---
  useEffect(() => {
    getPreferences().then((prefs) => {
      setPreferences(prefs);
      setDensity(prefs.density || 'magazine');
      if (prefs.hasCompletedOnboarding === false) {
        setIsOnboarding(true);
        setIsPreferencesOpen(true);
      }
    });

    getNotificationStatus().then(({ subscribed }) => {
      setNotificationsEnabled(subscribed);
    });

    getAvailableBriefingDates().then((dates) => {
      setAvailableDates(dates);
    });
  }, []);

  // --- 4. Caricamento Bookmarks da IndexedDB ---
  useEffect(() => {
    getBookmarks().then((saved) => setBookmarks(saved));
  }, []);

  // --- 5. Algoritmo di Caricamento Briefing Multi-Tier Robusto ---
  const loadBriefing = useCallback(
    async (forceRemote = false) => {
      setIsLoading(true);
      if (forceRemote) setIsRefreshing(true);

      const todayStr = new Date().toISOString().split('T')[0];

      // TIER 1: IndexedDB Cache Locale (Zero latenza)
      if (!forceRemote) {
        try {
          const cached = await getLatestBriefing();
          if (cached && Array.isArray(cached.articles) && cached.articles.length > 0) {
            setBriefing(cached);
            setSource('cache');
            setIsLoading(false);
          }
        } catch (err) {
          console.warn('[IDB] Errore lettura cache:', err);
        }
      }

      // TIER 2: Supabase Cloud Database (Se online)
      if (navigator.onLine) {
        try {
          const supabase = createClient();
          const { data, error } = await supabase
            .from('daily_briefings')
            .select('*')
            .order('date', { ascending: false })
            .limit(1)
            .single();

          if (!error && data) {
            const row = data as unknown as { id: string; date: string; articles: Article[]; created_at: string };
            if (Array.isArray(row.articles) && row.articles.length > 0) {
              const remoteBriefing: DailyBriefing = {
                id: row.id,
                date: row.date,
                articles: row.articles,
                created_at: row.created_at,
              };

              setBriefing(remoteBriefing);
              setSource('remote');
              await saveBriefing(remoteBriefing);

              if (forceRemote) {
                playCyberChime();
                addToast('Briefing aggiornato con successo dal cloud!', 'success');
              }
              setIsLoading(false);
              setIsRefreshing(false);
              return;
            }
          }
        } catch (supabaseErr) {
          console.warn('[Supabase] Fetch remoto non disponibile:', supabaseErr);
        }
      }

      // TIER 3: Fallback Instantaneo su SEED_BRIEFING
      setBriefing((prev) => {
        if (prev && Array.isArray(prev.articles) && prev.articles.length > 0) {
          return prev;
        }
        setSource('seed');
        const seedWithToday: DailyBriefing = {
          ...SEED_BRIEFING,
          date: todayStr || SEED_BRIEFING.date,
        };
        saveBriefing(seedWithToday).catch(() => {});
        return seedWithToday;
      });

      setIsLoading(false);
      setIsRefreshing(false);
    },
    [addToast]
  );

  useEffect(() => {
    loadBriefing();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Cambio Densità con Salvataggio Preferenze ---
  const handleDensityChange = (newDensity: DisplayDensity) => {
    playSoftClick(750);
    setDensity(newDensity);
    const updated = {
      ...preferences,
      density: newDensity,
    };
    setPreferences(updated);
    savePreferences(updated);
  };

  // --- Salvataggio Profilo & Preferenze dal Forum di Benvenuto ---
  const handleSavePreferences = useCallback(
    (updated: UserPreferences) => {
      playCyberChime();
      setPreferences(updated);
      savePreferences(updated);
      addToast('Preferenze e priorità degli argomenti aggiornate!', 'success');
    },
    [addToast]
  );

  // --- Completamento Generazione On-Demand Notizie AI ---
  const handleGenerationComplete = useCallback(
    (newBriefing: DailyBriefing) => {
      playCyberChime();
      setBriefing(newBriefing);
      setSource('remote');
      saveBriefing(newBriefing).catch(() => {});
      addToast('Nuovo briefing AI generato con successo!', 'success');
    },
    [addToast]
  );

  // --- Toggle Notifiche con Feedback Toast ---
  const handleToggleNotifications = useCallback(async () => {
    triggerHaptic(15);
    if (notificationsEnabled) {
      const res = await unsubscribeFromNotifications();
      if (res.success) {
        setNotificationsEnabled(false);
        addToast('Notifiche mattutine disattivate.', 'info');
      } else {
        addToast(res.error || 'Errore disattivazione notifiche', 'error');
      }
    } else {
      const permission = await requestNotificationPermission();
      if (permission === 'granted') {
        const res = await subscribeToNotifications();
        if (res.success) {
          setNotificationsEnabled(true);
          playCyberChime();
          addToast('Notifiche attivate! Riceverai il briefing alle 06:30.', 'success');
        } else {
          addToast(res.error || 'Errore configurazione notifiche push.', 'error');
        }
      } else if (permission === 'denied') {
        addToast('Permesso notifiche negato nel browser. Abilitalo dalle impostazioni sito.', 'error');
      }
    }
  }, [notificationsEnabled, addToast]);

  // --- Toggle Bookmark (Salva per dopo) ---
  const handleToggleBookmark = useCallback(
    async (article: Article) => {
      const isAlreadySaved = bookmarks.some((b) => b.id === article.id);
      if (isAlreadySaved) {
        playSoftClick(400);
        await removeBookmark(article.id);
        setBookmarks((prev) => prev.filter((b) => b.id !== article.id));
        addToast('Notizia rimossa dai salvati.', 'info');
      } else {
        playCyberChime();
        await saveBookmark(article);
        setBookmarks((prev) => [article, ...prev]);
        addToast('Notizia salvata nei preferiti per la lettura offline!', 'success');
      }
    },
    [bookmarks, addToast]
  );

  // --- Gestione Installazione PWA ---
  const handleInstallPwa = useCallback(async () => {
    triggerHaptic(20);
    if (!installPrompt) return;
    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    if (choice.outcome === 'accepted') {
      playCyberChime();
      addToast('App installata con successo sulla schermata home!', 'success');
      setCanInstallPwa(false);
      setInstallPrompt(null);
    }
  }, [installPrompt, addToast]);

  // --- Gestione Audio Bar Persistente ---
  const handlePlaySingleArticle = useCallback((article: Article) => {
    playSoftClick(800);
    setActiveAudioArticleId(article.id);
    setIsAudioBarVisible(true);
  }, []);

  const handleStartFullAudio = useCallback(() => {
    playSoftClick(850);
    if (briefing && briefing.articles.length > 0) {
      setActiveAudioArticleId(briefing.articles[0]?.id || null);
      setIsAudioBarVisible(true);
    }
  }, [briefing]);

  // --- Gestione Stories Mode ---
  const handleOpenStoriesAtIndex = useCallback((index: number) => {
    playSoftClick(800);
    setStoryInitialIndex(index);
    setIsStoriesOpen(true);
  }, []);

  // --- Gestione Selezione Data Storica dal Calendario ---
  const handleSelectDate = useCallback(
    async (dateStr: string) => {
      setIsLoading(true);
      playSoftClick(750);
      try {
        const local = await getBriefingByDate(dateStr);
        if (local) {
          setBriefing(local);
          setSource('cache');
          setIsLoading(false);
          addToast(`Caricato briefing del ${formatSafeDate(dateStr)}`, 'info');
          return;
        }

        if (navigator.onLine) {
          const supabase = createClient();
          const { data, error } = await supabase
            .from('daily_briefings')
            .select('*')
            .eq('date', dateStr)
            .single();

          if (!error && data) {
            const row = data as unknown as { id: string; date: string; articles: Article[]; created_at: string };
            if (Array.isArray(row.articles)) {
              const histBriefing: DailyBriefing = {
                id: row.id,
                date: row.date,
                articles: row.articles,
                created_at: row.created_at,
              };
              setBriefing(histBriefing);
              setSource('remote');
              await saveBriefing(histBriefing);
              setIsLoading(false);
              addToast(`Caricato briefing del ${formatSafeDate(dateStr)}`, 'info');
              return;
            }
          }
        }

        addToast(`Nessun briefing disponibile per il ${formatSafeDate(dateStr)}`, 'info');
      } catch (err) {
        console.warn('Errore recupero data:', err);
        addToast('Errore durante il caricamento della data selezionata', 'error');
      } finally {
        setIsLoading(false);
      }
    },
    [addToast]
  );

  // --- 6. Global Keyboard Shortcuts Listener VisionOS Style ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }

      // Cmd / Ctrl + K: Focus Spotlight Search
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        playSoftClick(900);
        const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement | null;
        searchInput?.focus();
        return;
      }

      // ? or H: Toggle Keyboard Shortcuts Modal
      if (e.key === '?' || (e.shiftKey && e.key === '/') || e.key.toLowerCase() === 'h') {
        e.preventDefault();
        playSoftClick(700);
        setIsShortcutsOpen((prev) => !prev);
        return;
      }

      // S: Toggle Scenario Simulator 2050
      if (e.key.toLowerCase() === 's') {
        e.preventDefault();
        playSoftClick(850);
        setIsScenarioOpen((prev) => !prev);
        return;
      }

      // G: Toggle AI Knowledge Graph
      if (e.key.toLowerCase() === 'g') {
        e.preventDefault();
        playSoftClick(850);
        setIsKnowledgeGraphOpen((prev) => !prev);
        return;
      }

      // P: Toggle Radar Preferences
      if (e.key.toLowerCase() === 'p') {
        e.preventDefault();
        playSoftClick(750);
        setIsPreferencesOpen((prev) => !prev);
        return;
      }

      // R: Trigger On-Demand AI Generation
      if (e.key.toLowerCase() === 'r') {
        e.preventDefault();
        playSoftClick(850);
        setIsGeneratingOpen((prev) => !prev);
        return;
      }

      // E: Open Export Modal
      if (e.key.toLowerCase() === 'e') {
        e.preventDefault();
        playSoftClick(750);
        setIsExportModalOpen((prev) => !prev);
        return;
      }

      // C: Open Calendar
      if (e.key.toLowerCase() === 'c') {
        e.preventDefault();
        playSoftClick(750);
        setIsCalendarOpen((prev) => !prev);
        return;
      }

      // Space: Toggle Audio Bar Playback
      if (e.code === 'Space') {
        e.preventDefault();
        playSoftClick(800);
        if (isAudioBarVisible) {
          setIsAudioBarVisible(false);
        } else {
          handleStartFullAudio();
        }
        return;
      }

      // Esc: Close any active modal
      if (e.key === 'Escape') {
        setSelectedArticleForDrawer(null);
        setIsCalendarOpen(false);
        setIsStoriesOpen(false);
        setIsKnowledgeGraphOpen(false);
        setIsExportModalOpen(false);
        setIsPreferencesOpen(false);
        setIsGeneratingOpen(false);
        setIsScenarioOpen(false);
        setIsShortcutsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAudioBarVisible, handleStartFullAudio]);

  // --- Filtro Notizie con Algoritmo di Ranking Personale ---
  const filteredArticles = useMemo(() => {
    let list: Article[] = [];

    if (selectedCategory === 'Salvati') {
      list = [...bookmarks];
    } else if (briefing?.articles) {
      list = [...briefing.articles];
    }

    if (selectedCategory !== 'Tutti' && selectedCategory !== 'Salvati') {
      list = list.filter((a) => a.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.summary.toLowerCase().includes(q) ||
          a.category.toLowerCase().includes(q) ||
          a.source.toLowerCase().includes(q) ||
          a.keyPoints.some((p) => p.toLowerCase().includes(q)) ||
          a.whyCounts.toLowerCase().includes(q)
      );
    }

    if (selectedCategory === 'Tutti' && !searchQuery.trim()) {
      list = sortArticlesByPreferences(list, preferences.categoryPreferences);
    }

    return list;
  }, [briefing, bookmarks, selectedCategory, searchQuery, preferences.categoryPreferences]);

  // Articolo Hero (Copertina): il primo articolo nei risultati se non c'è ricerca attiva
  const heroArticle = useMemo<Article | null>(() => {
    if (searchQuery.trim() || selectedCategory === 'Salvati' || density === 'compact') {
      return null;
    }
    return filteredArticles[0] || null;
  }, [filteredArticles, searchQuery, selectedCategory, density]);

  // Articoli secondari (escluso l'Hero se presente)
  const feedArticles = useMemo<Article[]>(() => {
    if (heroArticle) {
      return filteredArticles.slice(1);
    }
    return filteredArticles;
  }, [filteredArticles, heroArticle]);

  // --- Conteggio Categorie ---
  const categoryCounts = useMemo<Record<string, number>>(() => {
    if (!briefing?.articles) return { Tutti: 0 };
    const counts: Record<string, number> = { Tutti: briefing.articles.length };
    for (const cat of ALL_CATEGORIES) {
      counts[cat] = briefing.articles.filter((a) => a.category === cat).length;
    }
    return counts;
  }, [briefing]);

  const emptyVariant = useMemo(() => {
    if (searchQuery && filteredArticles.length === 0) return 'no-results';
    if (selectedCategory === 'Salvati' && bookmarks.length === 0) return 'no-news';
    if (!isOnline && !briefing) return 'offline';
    return 'no-news';
  }, [searchQuery, filteredArticles.length, selectedCategory, bookmarks.length, isOnline, briefing]);

  const bookmarkedIds = useMemo(() => new Set(bookmarks.map((b) => b.id)), [bookmarks]);

  // Calcolo classe griglia articoli
  const feedGridClass = useMemo(() => {
    if (density === 'magazine') {
      return 'grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-6';
    }
    if (density === 'minimal') {
      return 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4';
    }
    return 'grid grid-cols-1 gap-2.5 max-w-4xl mx-auto';
  }, [density]);

  return (
    <div className="min-h-dvh bg-[#000000] text-white flex flex-col selection:bg-[#2997ff]/30 selection:text-white font-sans antialiased">
      {/* Background ambient cosmic mesh glow - Ottimizzato GPU per iPhone WebKit */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div
          className="absolute -top-40 -left-40 w-[32rem] h-[32rem] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(41, 151, 255, 0.08) 0%, transparent 70%)' }}
        />
        <div
          className="absolute top-1/3 -right-40 w-[30rem] h-[30rem] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(191, 90, 242, 0.06) 0%, transparent 70%)' }}
        />
        <div
          className="absolute -bottom-40 left-1/4 w-[36rem] h-[36rem] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(100, 210, 255, 0.05) 0%, transparent 70%)' }}
        />
      </div>

      {/* Header Bar Sticky Apple Stile */}
      <Header
        isOnline={isOnline}
        notificationsEnabled={notificationsEnabled}
        onToggleNotifications={handleToggleNotifications}
        canInstallPwa={canInstallPwa}
        onInstallPwa={handleInstallPwa}
        onStartAudioBriefing={handleStartFullAudio}
        onOpenCalendar={() => setIsCalendarOpen(true)}
        onOpenPreferences={() => {
          setIsOnboarding(false);
          setIsPreferencesOpen(true);
        }}
        onTriggerGenerate={() => setIsGeneratingOpen(true)}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        onOpenScenario={() => setIsScenarioOpen(true)}
        userRole={preferences.userRole}
        userName={preferences.userName}
      />

      {/* Main Container - Ottimizzato Desktop e Mobile */}
      <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-7 w-full flex-1 pb-32">
        {/* Banner installazione PWA per smartphone */}
        {canInstallPwa && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="sm:hidden mb-4 p-3.5 rounded-2xl border border-[#2997ff]/30 bg-[#2997ff]/10 backdrop-blur-xl flex items-center justify-between gap-3 shadow-lg"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <Download className="w-4 h-4 text-[#2997ff] flex-shrink-0" />
              <p className="text-xs text-[#d2d2d7] font-semibold truncate">
                Installa per la lettura offline in metro
              </p>
            </div>
            <button
              onClick={handleInstallPwa}
              className="px-3.5 py-1.5 rounded-full text-xs font-bold text-white bg-[#0071e3] hover:bg-[#0077ed] transition-colors flex-shrink-0 shadow-md cursor-pointer"
            >
              Installa
            </button>
          </motion.div>
        )}

        {/* Executive Pulse Dashboard (Metriche, Stories CTA, Mappa AI, Export, Genera AI, Scenario 2050) */}
        {!isLoading && briefing && (
          <ExecutivePulse
            briefing={briefing}
            onOpenStories={() => handleOpenStoriesAtIndex(0)}
            onOpenKnowledgeGraph={() => setIsKnowledgeGraphOpen(true)}
            onExport={() => setIsExportModalOpen(true)}
            isOnline={isOnline}
            onTriggerGenerate={() => setIsGeneratingOpen(true)}
            onOpenPreferences={() => {
              setIsOnboarding(false);
              setIsPreferencesOpen(true);
            }}
            onOpenScenarioSimulator={() => setIsScenarioOpen(true)}
          />
        )}

        {/* Barra di Ricerca Client-Side Istantanea Apple Spotlight Style & Filtri Categorie */}
        <div className="space-y-3.5 mb-6">
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <CategoryFilter
                selected={selectedCategory}
                onSelect={(cat) => {
                  playSoftClick(700);
                  setSelectedCategory(cat);
                }}
                counts={categoryCounts}
                bookmarkCount={bookmarks.length}
              />
            </div>
            <div className="flex items-center justify-between sm:justify-end gap-2 flex-shrink-0 pt-1 md:pt-0 border-t border-white/[0.06] md:border-t-0">
              <span className="text-[11px] font-semibold text-[#86868b] uppercase tracking-wider md:hidden">
                Layout
              </span>
              <ViewDensityToggle density={density} onChange={handleDensityChange} />
            </div>
          </div>
        </div>

        {/* Status Bar: Conteggio articoli, sorgente dati, pulsante refresh */}
        {!isLoading && briefing && (
          <div className="flex items-center justify-between gap-2 mb-4 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[#86868b] font-semibold">
                {filteredArticles.length} {filteredArticles.length === 1 ? 'notizia' : 'notizie'}
                {selectedCategory !== 'Tutti' && ` • ${selectedCategory}`}
              </span>

              {source === 'cache' && (
                <span className="px-2.5 py-0.5 rounded-full bg-[#ff9f0a]/10 border border-[#ff9f0a]/30 text-[#ff9f0a] text-[10px] font-bold tracking-wide">
                  ⚡ Copia locale (Offline)
                </span>
              )}

              {source === 'seed' && (
                <span className="px-2.5 py-0.5 rounded-full bg-[#bf5af2]/15 border border-[#bf5af2]/30 text-[#bf5af2] text-[10px] font-bold flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" /> Briefing iniziale
                </span>
              )}

              {briefing.date && (
                <button
                  onClick={() => {
                    playSoftClick(750);
                    setIsCalendarOpen(true);
                  }}
                  className="text-[#86868b] hover:text-white transition-colors text-[11px] font-medium underline decoration-dotted cursor-pointer"
                  title="Cambia data"
                >
                  {formatSafeDate(briefing.date)}
                </button>
              )}
            </div>

            {isOnline && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  playSoftClick(850);
                  triggerHaptic(15);
                  loadBriefing(true);
                }}
                disabled={isRefreshing}
                className="flex items-center gap-1.5 text-[#86868b] hover:text-white transition-colors disabled:opacity-50 cursor-pointer"
                title="Sincronizza briefing con Supabase"
              >
                <motion.div
                  animate={isRefreshing ? { rotate: 360 } : { rotate: 0 }}
                  transition={{ duration: 0.8, repeat: isRefreshing ? Infinity : 0, ease: 'linear' }}
                >
                  <RefreshCw className="w-3.5 h-3.5 text-[#2997ff]" />
                </motion.div>
                <span className="hidden sm:inline font-semibold">
                  {isRefreshing ? 'Sincronizzazione...' : 'Sincronizza'}
                </span>
              </motion.button>
            )}
          </div>
        )}

        {/* Notizia di Copertina Hero (Solo in modalità Rivista e senza filtri restrittivi) */}
        {!isLoading && heroArticle && (
          <HeroStory
            article={heroArticle}
            isBookmarked={bookmarkedIds.has(heroArticle.id)}
            onToggleBookmark={handleToggleBookmark}
            onOpenArticle={(art) => {
              playSoftClick(800);
              setSelectedArticleForDrawer(art);
            }}
            onPlayAudio={handlePlaySingleArticle}
            onShowToast={addToast}
          />
        )}

        {/* Contenuto Notizie o Loading Skeleton in Griglia Responsiva */}
        {isLoading ? (
          <div className={feedGridClass}>
            {Array.from({ length: density === 'magazine' ? 4 : 6 }).map((_, i) => (
              <SkeletonCard key={i} index={i} />
            ))}
          </div>
        ) : filteredArticles.length === 0 ? (
          <EmptyState
            variant={emptyVariant}
            searchQuery={searchQuery}
            onResetSearch={() => {
              playSoftClick(750);
              setSearchQuery('');
              setSelectedCategory('Tutti');
            }}
          />
        ) : (
          <motion.div className={feedGridClass}>
            <AnimatePresence mode="popLayout">
              {feedArticles.map((article, i) => (
                <NewsCard
                  key={article.id}
                  article={article}
                  index={i}
                  isOnline={isOnline}
                  density={density}
                  isBookmarked={bookmarkedIds.has(article.id)}
                  onToggleBookmark={handleToggleBookmark}
                  onPlaySingleArticle={handlePlaySingleArticle}
                  onShowToast={addToast}
                  onOpenArticle={(art) => {
                    playSoftClick(800);
                    setSelectedArticleForDrawer(art);
                  }}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </main>

      {/* Drawer Lettura Immersiva Zen con 4 Lenti Cognitive & Neural Copilot 3000 */}
      <ArticleDrawer
        article={selectedArticleForDrawer}
        isOpen={selectedArticleForDrawer !== null}
        onClose={() => setSelectedArticleForDrawer(null)}
        isBookmarked={selectedArticleForDrawer ? bookmarkedIds.has(selectedArticleForDrawer.id) : false}
        onToggleBookmark={handleToggleBookmark}
        onPlayAudio={handlePlaySingleArticle}
        onShowToast={addToast}
        isOnline={isOnline}
      />

      {/* Modale Calendario Storico */}
      <CalendarModal
        isOpen={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
        availableDates={availableDates}
        currentDate={briefing?.date || ''}
        onSelectDate={handleSelectDate}
      />

      {/* Mini-Player Vocale Fluttuante Persistente con 432Hz Deep Space Drone */}
      <AnimatePresence>
        {isAudioBarVisible && briefing && (
          <FloatingAudioBar
            articles={filteredArticles.length > 0 ? filteredArticles : briefing.articles}
            currentArticleId={activeAudioArticleId}
            onClose={() => setIsAudioBarVisible(false)}
            onArticleChange={(newId) => setActiveAudioArticleId(newId)}
          />
        )}
      </AnimatePresence>

      {/* Modalità Stories Fullscreen (Metro Digest) */}
      <AnimatePresence>
        {isStoriesOpen && briefing && (
          <StoryModeModal
            articles={filteredArticles.length > 0 ? filteredArticles : briefing.articles}
            initialIndex={storyInitialIndex}
            isOpen={isStoriesOpen}
            onClose={() => setIsStoriesOpen(false)}
            isBookmarked={(id) => bookmarkedIds.has(id)}
            onToggleBookmark={handleToggleBookmark}
            onShowToast={addToast}
            onPlayArticleAudio={handlePlaySingleArticle}
          />
        )}
      </AnimatePresence>

      {/* Quantum Knowledge Nexus 3000 */}
      <AnimatePresence>
        {isKnowledgeGraphOpen && briefing && (
          <KnowledgeGraphModal
            articles={briefing.articles}
            isOpen={isKnowledgeGraphOpen}
            onClose={() => setIsKnowledgeGraphOpen(false)}
            onSelectArticle={(art) => {
              playSoftClick(850);
              setSelectedArticleForDrawer(art);
            }}
          />
        )}
      </AnimatePresence>

      {/* Modale Esporta Rassegna Stampa */}
      <AnimatePresence>
        {isExportModalOpen && briefing && (
          <ExportModal
            briefing={briefing}
            isOpen={isExportModalOpen}
            onClose={() => setIsExportModalOpen(false)}
            onShowToast={addToast}
          />
        )}
      </AnimatePresence>

      {/* Vision 3000: Simulatore di Scenari Predittivi 2030-2050 */}
      <AnimatePresence>
        {isScenarioOpen && briefing && (
          <ScenarioSimulatorModal
            isOpen={isScenarioOpen}
            onClose={() => setIsScenarioOpen(false)}
            briefing={briefing}
          />
        )}
      </AnimatePresence>

      {/* Vision 3000: VisionOS Keyboard Shortcuts HUD */}
      <AnimatePresence>
        {isShortcutsOpen && (
          <KeyboardShortcutsModal
            isOpen={isShortcutsOpen}
            onClose={() => setIsShortcutsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Forum di Benvenuto & Gestione Preferenze Radar */}
      <WelcomePreferencesModal
        isOpen={isPreferencesOpen}
        onClose={() => setIsPreferencesOpen(false)}
        preferences={preferences}
        onSavePreferences={handleSavePreferences}
        onTriggerGeneration={() => setIsGeneratingOpen(true)}
        isOnboarding={isOnboarding}
      />

      {/* Modale Generazione Notizie AI On-Demand */}
      <GenerationModal
        isOpen={isGeneratingOpen}
        onClose={() => setIsGeneratingOpen(false)}
        onComplete={handleGenerationComplete}
        preferredCategories={
          preferences.categoryPreferences
            ? (Object.entries(preferences.categoryPreferences)
                .filter(([_, pref]) => pref?.interest === 'top' || pref?.interest === 'high')
                .map(([cat]) => cat) as Category[])
            : ['Aerospazio & Aviazione', 'Tech & AI', 'Energia & Sostenibilità', 'Cybersecurity']
        }
        isOnline={isOnline}
      />

      {/* Toast Notifications Globali */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
