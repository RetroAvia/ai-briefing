'use client';

import { motion } from 'framer-motion';
import { Bell, BellOff, Wifi, WifiOff, Download, Volume2 } from 'lucide-react';
import { useEffect, useState } from 'react';

interface HeaderProps {
  isOnline: boolean;
  notificationsEnabled: boolean;
  onToggleNotifications: () => void;
  canInstallPwa?: boolean;
  onInstallPwa?: () => void;
  onStartAudioBriefing?: () => void;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 5) return 'Buonanotte';
  if (hour < 12) return 'Buongiorno';
  if (hour < 18) return 'Buon pomeriggio';
  return 'Buonasera';
}

function getItalianDate(): string {
  try {
    return new Intl.DateTimeFormat('it-IT', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date());
  } catch {
    return 'Oggi';
  }
}

export default function Header({
  isOnline,
  notificationsEnabled,
  onToggleNotifications,
  canInstallPwa = false,
  onInstallPwa,
  onStartAudioBriefing,
}: HeaderProps) {
  const [greeting, setGreeting] = useState('Buongiorno');
  const [date, setDate] = useState('');

  useEffect(() => {
    setGreeting(getGreeting());
    setDate(getItalianDate());
  }, []);

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="sticky top-0 z-50 w-full"
    >
      {/* Glassmorphism backdrop */}
      <div
        className="relative px-4 py-3.5 sm:px-6 lg:px-8 border-b"
        style={{
          background: 'rgba(8, 9, 13, 0.88)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderColor: 'rgba(255, 255, 255, 0.08)',
        }}
      >
        {/* Glow line superiore con gradiente neon */}
        <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-violet-500/70 to-transparent shadow-[0_0_12px_rgba(124,58,237,0.5)]" />

        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          {/* Logo & Greeting */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{
                  background: 'linear-gradient(135deg, #7c3aed 0%, #06b6d4 100%)',
                  boxShadow: '0 0 14px rgba(124, 58, 237, 0.5)',
                }}
              >
                <span className="text-white text-xs font-black tracking-tight">AI</span>
              </div>
              <span className="text-[11px] font-bold tracking-widest uppercase text-slate-400">
                Briefing Quotidiano
              </span>
            </div>

            <h1 className="text-base sm:text-lg font-extrabold text-white truncate tracking-tight">
              {greeting} 👋
            </h1>
            <p className="text-[11px] text-slate-400 capitalize truncate font-medium">
              {date || 'Caricamento data...'}
            </p>
          </div>

          {/* Action buttons & Badges */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            {/* Install PWA button (se disponibile prompt nativo) */}
            {canInstallPwa && (
              <motion.button
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onInstallPwa}
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold text-cyan-300 bg-cyan-500/15 border border-cyan-500/35 hover:bg-cyan-500/25 transition-all shadow-[0_0_12px_rgba(6,182,212,0.25)]"
                title="Installa l'app sulla schermata home"
              >
                <Download className="w-3 h-3" />
                <span>Installa PWA</span>
              </motion.button>
            )}

            {/* Quick Audio Briefing button */}
            {onStartAudioBriefing && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onStartAudioBriefing}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium text-slate-300 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 transition-all"
                title="Ascolta il briefing vocale"
              >
                <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden md:inline">Audio</span>
              </motion.button>
            )}

            {/* Online/Offline status badge */}
            <motion.div
              key={isOnline ? 'online' : 'offline'}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                isOnline
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                  : 'bg-amber-500/15 border-amber-500/40 text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
              }`}
            >
              {isOnline ? (
                <>
                  <Wifi className="w-3 h-3" />
                  <span className="hidden xs:inline sm:inline">Online</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                </>
              ) : (
                <>
                  <WifiOff className="w-3 h-3" />
                  <span>Offline</span>
                </>
              )}
            </motion.div>

            {/* Push Notifications Toggle */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onToggleNotifications}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all ${
                notificationsEnabled
                  ? 'bg-violet-500/20 border-violet-500/50 text-violet-300 hover:bg-violet-500/30 shadow-[0_0_12px_rgba(124,58,237,0.3)]'
                  : 'bg-slate-900/80 border-slate-700/60 text-slate-400 hover:bg-slate-800/80'
              }`}
              title={notificationsEnabled ? 'Disattiva notifiche del mattino' : 'Attiva notifiche delle 06:30'}
            >
              {notificationsEnabled ? (
                <Bell className="w-3.5 h-3.5 fill-violet-400" />
              ) : (
                <BellOff className="w-3.5 h-3.5" />
              )}
              <span className="hidden sm:inline">
                {notificationsEnabled ? 'Notifiche On' : 'Notifiche Off'}
              </span>
            </motion.button>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
