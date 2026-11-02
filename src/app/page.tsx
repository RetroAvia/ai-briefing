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
} from '@/lib/idb';
import {
  getNotificationStatus,
  requestNotificationPermission,
  subscribeToNotifications,
  unsubscribeFromNotifications,
} from '@/lib/push';
import { triggerHaptic } from '@/lib/export';
import type { Article, DailyBriefing, DisplayDensity } from '@/types';
import { ALL_CATEGORIES } from '@/types';

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

  // Preferenze utente & Layout
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
      addToast('Connessione ripristinata: modalità Online attiva', 'success');
    };
    const handleOffline = () => {
      setIsOnline(false);
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
      setDensity(prefs.density || 'magazine');
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

  // --- 5. Stale-While-Revalidate Offline-First Loader ---
  const loadBriefing = useCallback(
    async (forceRemote = false, specificDate?: string) => {
      if (forceRemote) setIsRefreshing(true);

      // FASE 1: Idratazione ISTANTANEA da IndexedDB (0ms latenza offline)
      try {
        let cached: DailyBriefing | null = null;
        if (specificDate) {
          cached = await getBriefingByDate(specificDate);
        } else {
          cached = await getLatestBriefing();
        }

        if (cached && cached.articles && cached.articles.length > 0) {
          setBriefing(cached);
          setSource('cache');
          setIsLoading(false);
        } else if (!briefing && !specificDate) {
          // Primo avvio in assoluto: pre-carica con seed dimostrativo
          setBriefing(SEED_BRIEFING);
          setSource('seed');
          await saveBriefing(SEED_BRIEFING).catch(() => {});
          setIsLoading(false);
        }
      } catch (err) {
        console.warn('[IDB] Errore lettura cache:', err);
      }

      // FASE 2: Revalidazione remota in background (se online e non data passata statica)
      if ((navigator.onLine || forceRemote) && !specificDate) {
        try {
          const supabase = createClient();
          const { data, error } = await supabase
            .from('daily_briefings')
            .select('*')
            .order('date', { ascending: false })
            .limit(1)
            .maybeSingle();

          const remoteRow = data as unknown as DailyBriefing | null;
          if (!error && remoteRow && Array.isArray(remoteRow.articles)) {
            setBriefing(remoteRow);
            setSource('remote');
            await saveBriefing(remoteRow).catch(() => {});
            getAvailableBriefingDates().then((dates) => setAvailableDates(dates));
            if (forceRemote) {
              addToast('Briefing aggiornato con le ultime notizie!', 'success');
            }
          }
        } catch (remoteErr) {
          console.warn('[SUPABASE] Errore sincronizzazione remota:', remoteErr);
          if (forceRemote) {
            addToast('Impossibile sincronizzare con Supabase. Uso copia locale.', 'info');
          }
        }
      }

      setIsLoading(false);
      setIsRefreshing(false);
    },
    [addToast, briefing]
  );

  useEffect(() => {
    loadBriefing();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Cambio Densità con Salvataggio Preferenze ---
  const handleDensityChange = (newDensity: DisplayDensity) => {
    setDensity(newDensity);
    savePreferences({
      density: newDensity,
      theme: 'midnight',
      fontSize: 'normal',
      autoPlayAudio: false,
    });
  };

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
        await removeBookmark(article.id);
        setBookmarks((prev) => prev.filter((b) => b.id !== article.id));
        addToast('Notizia rimossa dai salvati.', 'info');
      } else {
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
      addToast('App installata con successo sulla schermata home!', 'success');
      setCanInstallPwa(false);
      setInstallPrompt(null);
    }
  }, [installPrompt, addToast]);

  // --- Gestione Audio Bar Persistente ---
  const handlePlaySingleArticle = useCallback((article: Article) => {
    setActiveAudioArticleId(article.id);
    setIsAudioBarVisible(true);
  }, []);

  const handleStartFullAudio = useCallback(() => {
    if (briefing && briefing.articles.length > 0) {
      setActiveAudioArticleId(briefing.articles[0]?.id || null);
      setIsAudioBarVisible(true);
    }
  }, [briefing]);

  // --- Gestione Stories Mode ---
  const handleOpenStoriesAtIndex = useCallback((index: number) => {
    setStoryInitialIndex(index);
    setIsStoriesOpen(true);
  }, []);

  // --- Selezione Data dal Calendario ---
  const handleSelectDate = useCallback(
    (dateStr: string) => {
      loadBriefing(false, dateStr);
      addToast(`Caricato briefing del ${dateStr}`, 'info');
    },
    [loadBriefing, addToast]
  );

  // --- Articoli Filtrati ---
  const filteredArticles = useMemo<Article[]>(() => {
    let list: Article[] = [];

    if (selectedCategory === 'Salvati') {
      list = bookmarks;
    } else if (briefing?.articles) {
      list = briefing.articles;
      if (selectedCategory !== 'Tutti') {
        list = list.filter((a) => a.category === selectedCategory);
      }
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.category.toLowerCase().includes(q) ||
          a.summary.toLowerCase().includes(q) ||
          a.source.toLowerCase().includes(q) ||
          a.keyPoints.some((p) => p.toLowerCase().includes(q)) ||
          a.whyCounts.toLowerCase().includes(q)
      );
    }

    return list;
  }, [briefing, bookmarks, selectedCategory, searchQuery]);

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
      {/* Background ambient cosmic mesh glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div
          className="absolute -top-40 -left-40 w-[32rem] h-[32rem] rounded-full opacity-[0.07] blur-[120px]"
          style={{ background: 'radial-gradient(circle, #2997ff 0%, transparent 70%)' }}
        />
        <div
          className="absolute top-1/3 -right-40 w-[30rem] h-[30rem] rounded-full opacity-[0.06] blur-[120px]"
          style={{ background: 'radial-gradient(circle, #bf5af2 0%, transparent 70%)' }}
        />
        <div
          className="absolute -bottom-40 left-1/4 w-[34rem] h-[34rem] rounded-full opacity-[0.05] blur-[120px]"
          style={{ background: 'radial-gradient(circle, #30d158 0%, transparent 70%)' }}
        />
      </div>

      {/* Header Sticky con salute mattutino, data e controlli */}
      <Header
        isOnline={isOnline}
        notificationsEnabled={notificationsEnabled}
        onToggleNotifications={handleToggleNotifications}
        canInstallPwa={canInstallPwa}
        onInstallPwa={handleInstallPwa}
        onStartAudioBriefing={handleStartFullAudio}
        onOpenCalendar={() => setIsCalendarOpen(true)}
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
              className="px-3.5 py-1.5 rounded-full text-xs font-bold text-white bg-[#0071e3] hover:bg-[#0077ed] transition-colors flex-shrink-0 shadow-md"
            >
              Installa
            </button>
          </motion.div>
        )}

        {/* Executive Pulse Dashboard (Metriche, Stories CTA, Mappa AI, Export) */}
        {!isLoading && briefing && (
          <ExecutivePulse
            briefing={briefing}
            onOpenStories={() => handleOpenStoriesAtIndex(0)}
            onOpenKnowledgeGraph={() => setIsKnowledgeGraphOpen(true)}
            onExport={() => setIsExportModalOpen(true)}
            isOnline={isOnline}
          />
        )}

        {/* Barra di Ricerca Client-Side Istantanea Apple Spotlight Style */}
        <div className="space-y-3.5 mb-6">
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
          <div className="flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
            <div className="flex-1 min-w-0">
              <CategoryFilter
                selected={selectedCategory}
                onSelect={setSelectedCategory}
                counts={categoryCounts}
                bookmarkCount={bookmarks.length}
              />
            </div>
            <div className="flex-shrink-0">
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
                  onClick={() => setIsCalendarOpen(true)}
                  className="text-[#86868b] hover:text-white transition-colors text-[11px] font-medium underline decoration-dotted"
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
                  triggerHaptic(15);
                  loadBriefing(true);
                }}
                disabled={isRefreshing}
                className="flex items-center gap-1.5 text-[#86868b] hover:text-white transition-colors disabled:opacity-50"
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
            onOpenArticle={(art) => setSelectedArticleForDrawer(art)}
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
              setSearchQuery('');
              setSelectedCategory('Tutti');
            }}
          />
        ) : (
          <motion.div className={feedGridClass} layout>
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
                  onOpenArticle={(art) => setSelectedArticleForDrawer(art)}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </main>

      {/* Drawer Lettura Immersiva Zen */}
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

      {/* Mini-Player Vocale Fluttuante Persistente */}
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

      {/* Modale AI Knowledge Graph */}
      <AnimatePresence>
        {isKnowledgeGraphOpen && briefing && (
          <KnowledgeGraphModal
            articles={briefing.articles}
            isOpen={isKnowledgeGraphOpen}
            onClose={() => setIsKnowledgeGraphOpen(false)}
            onSelectArticle={(art) => {
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

      {/* Toast Notifications Globali */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
