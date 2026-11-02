'use client';

import { motion } from 'framer-motion';
import { Bell, BellOff, Wifi, WifiOff, Download, Volume2, Calendar } from 'lucide-react';
import { useEffect, useState } from 'react';
import { triggerHaptic } from '@/lib/export';

interface HeaderProps {
  isOnline: boolean;
  notificationsEnabled: boolean;
  onToggleNotifications: () => void;
  canInstallPwa?: boolean;
  onInstallPwa?: () => void;
  onStartAudioBriefing?: () => void;
  onOpenCalendar?: () => void;
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
      day: 'numeric',
      month: 'long',
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
  onOpenCalendar,
}: HeaderProps) {
  const [greeting, setGreeting] = useState('Buongiorno');
  const [date, setDate] = useState('');

  useEffect(() => {
    setGreeting(getGreeting());
    setDate(getItalianDate());
  }, []);

  return (
    <motion.header
      initial={{ opacity: 0, y: -15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
      className="sticky top-0 z-40 w-full"
    >
      <div
        className="px-4 py-3 sm:px-6 lg:px-8 border-b"
        style={{
          background: 'rgba(10, 10, 14, 0.88)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderColor: 'rgba(255, 255, 255, 0.08)',
        }}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          {/* Logo & Greeting (Stile Apple News) */}
          <div className="flex items-center gap-3 min-w-0">
            {/* Apple Squircle Icon */}
            <div
              className="w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg"
              style={{
                background: 'linear-gradient(145deg, #1d1d24 0%, #111116 100%)',
                border: '1px solid rgba(255, 255, 255, 0.14)',
                boxShadow: '0 4px 14px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
              }}
            >
              <span className="text-white text-xs font-black tracking-tight bg-gradient-to-br from-white to-slate-400 bg-clip-text text-transparent">
                AI
              </span>
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold tracking-[0.08em] uppercase text-[#86868b]">
                  {date || 'Oggi'}
                </span>
                <span className="text-[#555]">•</span>
                <span className="text-[10px] font-semibold text-[#86868b] hidden xs:inline">
                  Briefing del Giorno
                </span>
              </div>
              <h1 className="text-base sm:text-lg font-extrabold text-white tracking-[-0.02em] leading-tight truncate">
                {greeting}
              </h1>
            </div>
          </div>

          {/* Action buttons (Stile iOS Control Center) */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            {/* Install PWA Button */}
            {canInstallPwa && (
              <motion.button
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={onInstallPwa}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-white bg-white/10 hover:bg-white/15 border border-white/10 transition-all"
                title="Aggiungi alla schermata Home"
              >
                <Download className="w-3.5 h-3.5 text-[#2997ff]" />
                <span>Installa</span>
              </motion.button>
            )}

            {/* Calendario Storico */}
            {onOpenCalendar && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  triggerHaptic(15);
                  onOpenCalendar();
                }}
                className="w-9 h-9 rounded-full flex items-center justify-center text-slate-300 hover:text-white bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.08] transition-all"
                title="Archivio date precedenti"
              >
                <Calendar className="w-4 h-4 text-[#bf5af2]" />
              </motion.button>
            )}

            {/* Quick Audio Briefing */}
            {onStartAudioBriefing && (
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => {
                  triggerHaptic(15);
                  onStartAudioBriefing();
                }}
                className="hidden xs:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-white bg-white/[0.07] hover:bg-white/[0.14] border border-white/[0.08] transition-all"
                title="Ascolta rassegna stampa"
              >
                <Volume2 className="w-3.5 h-3.5 text-[#2997ff]" />
                <span className="hidden sm:inline">Ascolta</span>
              </motion.button>
            )}

            {/* Connectivity Badge Apple Style */}
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                isOnline
                  ? 'bg-[#30d158]/10 border-[#30d158]/25 text-[#30d158]'
                  : 'bg-[#ff9f0a]/10 border-[#ff9f0a]/25 text-[#ff9f0a]'
              }`}
            >
              {isOnline ? (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#30d158] animate-pulse" />
                  <span className="hidden sm:inline">Online</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3 h-3 text-[#ff9f0a]" />
                  <span>Offline</span>
                </>
              )}
            </div>

            {/* Push Notifications Toggle Apple Style */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onToggleNotifications}
              className={`w-9 h-9 rounded-full flex items-center justify-center border transition-all ${
                notificationsEnabled
                  ? 'bg-[#2997ff]/20 border-[#2997ff]/40 text-[#2997ff] shadow-[0_0_15px_rgba(41,151,255,0.25)]'
                  : 'bg-white/[0.06] border-white/[0.08] text-[#86868b] hover:text-white hover:bg-white/[0.12]'
              }`}
              title={notificationsEnabled ? 'Notifiche 06:30 attive' : 'Attiva notifiche del mattino'}
            >
              {notificationsEnabled ? (
                <Bell className="w-4 h-4 fill-current" />
              ) : (
                <BellOff className="w-4 h-4" />
              )}
            </motion.button>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
