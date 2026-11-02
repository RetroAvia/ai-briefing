'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { RefreshCw, Download, Sparkles } from 'lucide-react';
import Header from '@/components/Header';
import NewsCard from '@/components/NewsCard';
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
  SEED_BRIEFING,
  getBookmarks,
  saveBookmark,
  removeBookmark,
} from '@/lib/idb';
import {
  getNotificationStatus,
  requestNotificationPermission,
  subscribeToNotifications,
  unsubscribeFromNotifications,
} from '@/lib/push';
import { triggerHaptic } from '@/lib/export';
import type { Article, DailyBriefing } from '@/types';
import { ALL_CATEGORIES } from '@/types';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
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
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .then(() => {
          console.log('[SW] Service Worker registrato con successo.');
        })
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

  // --- 3. Notifiche Status ---
  useEffect(() => {
    getNotificationStatus().then(({ subscribed }) => {
      setNotificationsEnabled(subscribed);
    });
  }, []);

  // --- 4. Caricamento Bookmarks da IndexedDB ---
  useEffect(() => {
    getBookmarks().then((saved) => setBookmarks(saved));
  }, []);

  // --- 5. Stale-While-Revalidate Offline-First Loader ---
  const loadBriefing = useCallback(
    async (forceRemote = false) => {
      if (forceRemote) setIsRefreshing(true);

      // FASE 1: Idratazione ISTANTANEA da IndexedDB (0ms latenza offline)
      try {
        const cached = await getLatestBriefing();
        if (cached && cached.articles && cached.articles.length > 0) {
          setBriefing(cached);
          setSource('cache');
          setIsLoading(false);
        } else if (!briefing) {
          // Primo avvio in assoluto: pre-carica con seed dimostrativo
          setBriefing(SEED_BRIEFING);
          setSource('seed');
          await saveBriefing(SEED_BRIEFING).catch(() => {});
          setIsLoading(false);
        }
      } catch (err) {
        console.warn('[IDB] Errore lettura cache:', err);
      }

      // FASE 2: Revalidazione remota in background (se online)
      if (navigator.onLine || forceRemote) {
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

  return (
    <div className="min-h-dvh bg-primary text-white flex flex-col selection:bg-violet-500/30 selection:text-white">
      {/* Background ambient lighting */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div
          className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-[0.08] blur-3xl"
          style={{ background: 'radial-gradient(circle, #7c3aed, transparent 70%)' }}
        />
        <div
          className="absolute top-1/3 -right-32 w-80 h-80 rounded-full opacity-[0.07] blur-3xl"
          style={{ background: 'radial-gradient(circle, #06b6d4, transparent 70%)' }}
        />
        <div
          className="absolute -bottom-32 left-1/4 w-96 h-96 rounded-full opacity-[0.06] blur-3xl"
          style={{ background: 'radial-gradient(circle, #10b981, transparent 70%)' }}
        />
      </div>

      {/* Header Sticky con salute mattutino e status badges */}
      <Header
        isOnline={isOnline}
        notificationsEnabled={notificationsEnabled}
        onToggleNotifications={handleToggleNotifications}
        canInstallPwa={canInstallPwa}
        onInstallPwa={handleInstallPwa}
        onStartAudioBriefing={handleStartFullAudio}
      />

      {/* Main Container */}
      <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-5 w-full flex-1 pb-24">
        {/* Banner installazione PWA per dispositivi mobili */}
        {canInstallPwa && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="sm:hidden mb-4 p-3 rounded-2xl border border-cyan-500/35 bg-cyan-950/25 backdrop-blur-md flex items-center justify-between gap-3 shadow-[0_0_15px_rgba(6,182,212,0.15)]"
          >
            <div className="flex items-center gap-2 min-w-0">
              <Download className="w-4 h-4 text-cyan-400 flex-shrink-0" />
              <p className="text-xs text-cyan-200 font-semibold truncate">
                Installa la PWA per lettura offline in metropolitana
              </p>
            </div>
            <button
              onClick={handleInstallPwa}
              className="px-3 py-1 rounded-xl text-xs font-bold text-white bg-cyan-600 hover:bg-cyan-500 transition-colors flex-shrink-0 shadow-md"
            >
              Installa
            </button>
          </motion.div>
        )}

        {/* Executive Pulse Dashboard (Statistiche, Stories CTA, Mappa AI, Export) */}
        {!isLoading && briefing && (
          <ExecutivePulse
            briefing={briefing}
            onOpenStories={() => handleOpenStoriesAtIndex(0)}
            onOpenKnowledgeGraph={() => setIsKnowledgeGraphOpen(true)}
            onExport={() => setIsExportModalOpen(true)}
            isOnline={isOnline}
          />
        )}

        {/* Barra di Ricerca Client-Side Istantanea */}
        <div className="space-y-3 mb-5">
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
          <CategoryFilter
            selected={selectedCategory}
            onSelect={setSelectedCategory}
            counts={categoryCounts}
            bookmarkCount={bookmarks.length}
          />
        </div>

        {/* Status Bar: Conteggio articoli, sorgente dati, pulsante refresh */}
        {!isLoading && briefing && (
          <div className="flex items-center justify-between gap-2 mb-4 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-slate-400 font-semibold">
                {filteredArticles.length} {filteredArticles.length === 1 ? 'notizia' : 'notizie'}
                {selectedCategory !== 'Tutti' && ` • ${selectedCategory}`}
              </span>

              {source === 'cache' && (
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-bold">
                  ⚡ Copia locale (Offline)
                </span>
              )}

              {source === 'seed' && (
                <span className="px-2.5 py-0.5 rounded-full bg-violet-500/15 border border-violet-500/30 text-violet-300 text-[10px] font-bold flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-cyan-400" /> Briefing iniziale
                </span>
              )}

              {briefing.date && (
                <span className="text-slate-500 text-[11px] font-medium">
                  {new Intl.DateTimeFormat('it-IT', { day: 'numeric', month: 'short' }).format(
                    new Date(briefing.date + 'T00:00:00')
                  )}
                </span>
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
                className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors disabled:opacity-50"
                title="Aggiorna briefing da Supabase"
              >
                <motion.div
                  animate={isRefreshing ? { rotate: 360 } : { rotate: 0 }}
                  transition={{ duration: 0.8, repeat: isRefreshing ? Infinity : 0, ease: 'linear' }}
                >
                  <RefreshCw className="w-3.5 h-3.5 text-violet-400" />
                </motion.div>
                <span className="hidden sm:inline font-bold">
                  {isRefreshing ? 'Sincronizzazione...' : 'Sincronizza'}
                </span>
              </motion.button>
            )}
          </div>
        )}

        {/* Contenuto Notizie o Loading Skeleton */}
        {isLoading ? (
          <div className="grid gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonCard key={i} index={i} />
            ))}
          </div>
        ) : filteredArticles.length === 0 ? (
          <EmptyState variant={emptyVariant} searchQuery={searchQuery} />
        ) : (
          <motion.div className="grid gap-4" layout>
            <AnimatePresence mode="popLayout">
              {filteredArticles.map((article, i) => (
                <NewsCard
                  key={article.id}
                  article={article}
                  index={i}
                  isOnline={isOnline}
                  isBookmarked={bookmarkedIds.has(article.id)}
                  onToggleBookmark={handleToggleBookmark}
                  onPlaySingleArticle={handlePlaySingleArticle}
                  onShowToast={addToast}
                  onOpenStoriesAtIndex={handleOpenStoriesAtIndex}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </main>

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
              const idx = briefing.articles.findIndex((a) => a.id === art.id);
              if (idx !== -1) handleOpenStoriesAtIndex(idx);
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
