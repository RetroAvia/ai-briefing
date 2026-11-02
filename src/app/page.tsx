'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { RefreshCw } from 'lucide-react';
import Header from '@/components/Header';
import NewsCard from '@/components/NewsCard';
import CategoryFilter from '@/components/CategoryFilter';
import SearchBar from '@/components/SearchBar';
import SkeletonCard from '@/components/SkeletonCard';
import EmptyState from '@/components/EmptyState';
import { createClient } from '@/lib/supabase/client';
import { saveBriefing, getLatestBriefing } from '@/lib/idb';
import {
  getNotificationStatus,
  requestNotificationPermission,
  subscribeToNotifications,
  unsubscribeFromNotifications,
} from '@/lib/push';
import type { Article, Category, DailyBriefing } from '@/types';
import { ALL_CATEGORIES } from '@/types';

type FilterCategory = Category | 'Tutti';

export default function Home() {
  const [briefing, setBriefing] = useState<DailyBriefing | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<FilterCategory>('Tutti');
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [source, setSource] = useState<'remote' | 'cache' | null>(null);

  // --- Service Worker Registration ---
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .catch((err) => console.warn('[SW] Registration failed:', err));
    }
  }, []);

  // --- Online/Offline Detection ---
  useEffect(() => {
    const updateOnline = () => setIsOnline(navigator.onLine);
    updateOnline();
    window.addEventListener('online', updateOnline);
    window.addEventListener('offline', updateOnline);
    return () => {
      window.removeEventListener('online', updateOnline);
      window.removeEventListener('offline', updateOnline);
    };
  }, []);

  // --- Notification Status ---
  useEffect(() => {
    getNotificationStatus().then(({ subscribed }) => {
      setNotificationsEnabled(subscribed);
    });
  }, []);

  // --- Load Briefing ---
  const loadBriefing = useCallback(async (forceRemote = false) => {
    setIsLoading(true);
    try {
      // Try remote first if online
      if (navigator.onLine || forceRemote) {
        try {
          const supabase = createClient();
          const today = new Date().toISOString().split('T')[0];
          const { data, error } = await supabase
            .from('daily_briefings')
            .select('*')
            .eq('date', today)
            .single();

          if (!error && data) {
            const typedData = data as DailyBriefing;
            setBriefing(typedData);
            setSource('remote');
            // Cache to IndexedDB
            await saveBriefing(typedData).catch(() => {});
            setIsLoading(false);
            return;
          }

          // No briefing for today - try yesterday
          const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
          const { data: yData, error: yError } = await supabase
            .from('daily_briefings')
            .select('*')
            .eq('date', yesterday)
            .single();

          if (!yError && yData) {
            const typedData = yData as DailyBriefing;
            setBriefing(typedData);
            setSource('remote');
            await saveBriefing(typedData).catch(() => {});
            setIsLoading(false);
            return;
          }
        } catch {
          // Fall through to cache
        }
      }

      // Fallback: IndexedDB cache
      const cached = await getLatestBriefing();
      if (cached) {
        setBriefing(cached);
        setSource('cache');
      } else {
        setBriefing(null);
        setSource(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBriefing();
  }, [loadBriefing]);

  // --- Refresh Handler ---
  const handleRefresh = useCallback(async () => {
    if (!navigator.onLine) return;
    setIsRefreshing(true);
    await loadBriefing(true);
    setIsRefreshing(false);
  }, [loadBriefing]);

  // --- Notification Toggle ---
  const handleToggleNotifications = useCallback(async () => {
    if (notificationsEnabled) {
      const success = await unsubscribeFromNotifications();
      if (success) setNotificationsEnabled(false);
    } else {
      const permission = await requestNotificationPermission();
      if (permission === 'granted') {
        const success = await subscribeToNotifications();
        if (success) setNotificationsEnabled(true);
      }
    }
  }, [notificationsEnabled]);

  // --- Filtered Articles ---
  const filteredArticles = useMemo<Article[]>(() => {
    if (!briefing?.articles) return [];
    let articles = briefing.articles;

    if (selectedCategory !== 'Tutti') {
      articles = articles.filter((a) => a.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      articles = articles.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.category.toLowerCase().includes(q) ||
          a.summary.toLowerCase().includes(q) ||
          a.source.toLowerCase().includes(q)
      );
    }

    return articles;
  }, [briefing, selectedCategory, searchQuery]);

  // --- Category Counts ---
  const categoryCounts = useMemo<Record<string, number>>(() => {
    if (!briefing?.articles) return { Tutti: 0 };
    const counts: Record<string, number> = { Tutti: briefing.articles.length };
    for (const cat of ALL_CATEGORIES) {
      counts[cat] = briefing.articles.filter((a) => a.category === cat).length;
    }
    return counts;
  }, [briefing]);

  // --- Determine Empty State ---
  const emptyVariant = useMemo(() => {
    if (searchQuery && filteredArticles.length === 0) return 'no-results';
    if (!isOnline && !briefing) return 'offline';
    return 'no-news';
  }, [searchQuery, filteredArticles.length, isOnline, briefing]);

  const showEmpty = !isLoading && filteredArticles.length === 0;

  return (
    <div className="min-h-dvh bg-primary">
      {/* Background gradient orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-40 -left-40 w-96 h-96 rounded-full opacity-[0.06]"
          style={{ background: 'radial-gradient(circle, #7c3aed, transparent)' }}
        />
        <div
          className="absolute -bottom-40 -right-20 w-80 h-80 rounded-full opacity-[0.05]"
          style={{ background: 'radial-gradient(circle, #06b6d4, transparent)' }}
        />
      </div>

      {/* Header */}
      <Header
        isOnline={isOnline}
        notificationsEnabled={notificationsEnabled}
        onToggleNotifications={handleToggleNotifications}
      />

      {/* Main Content */}
      <main className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Search + Filters Row */}
        <div className="space-y-3 mb-6">
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
          <CategoryFilter
            selected={selectedCategory}
            onSelect={setSelectedCategory}
            counts={categoryCounts}
          />
        </div>

        {/* Source indicator + Refresh */}
        {!isLoading && briefing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-between mb-4"
          >
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-600">
                {filteredArticles.length} notizie
                {selectedCategory !== 'Tutti' && ` in ${selectedCategory}`}
              </span>
              {source === 'cache' && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600">
                  dalla cache
                </span>
              )}
              {briefing.date && (
                <span className="text-[10px] text-slate-700">
                  {new Intl.DateTimeFormat('it-IT', { day: 'numeric', month: 'short' }).format(new Date(briefing.date + 'T00:00:00'))}
                </span>
              )}
            </div>

            {isOnline && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-400 transition-colors disabled:opacity-50"
              >
                <motion.div animate={isRefreshing ? { rotate: 360 } : { rotate: 0 }} transition={{ duration: 0.8, repeat: isRefreshing ? Infinity : 0, ease: 'linear' }}>
                  <RefreshCw className="w-3 h-3" />
                </motion.div>
                {isRefreshing ? 'Aggiornamento...' : 'Aggiorna'}
              </motion.button>
            )}
          </motion.div>
        )}

        {/* Content */}
        {isLoading ? (
          // Skeleton loading
          <div className="grid gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <SkeletonCard key={i} index={i} />
            ))}
          </div>
        ) : showEmpty ? (
          <EmptyState variant={emptyVariant} searchQuery={searchQuery} />
        ) : (
          // Articles grid
          <motion.div
            className="grid gap-4"
            layout
          >
            <AnimatePresence mode="popLayout">
              {filteredArticles.map((article, i) => (
                <NewsCard
                  key={article.id}
                  article={article}
                  index={i}
                  isOnline={isOnline}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Bottom padding for safe area */}
        <div className="h-8" />
      </main>
    </div>
  );
}
