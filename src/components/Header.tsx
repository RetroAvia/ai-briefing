'use client';

import { motion } from 'framer-motion';
import { Bell, BellOff, Wifi, WifiOff } from 'lucide-react';
import { useEffect, useState } from 'react';

interface HeaderProps {
  isOnline: boolean;
  notificationsEnabled: boolean;
  onToggleNotifications: () => void;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Buongiorno';
  if (hour < 18) return 'Buon pomeriggio';
  return 'Buonasera';
}

function getItalianDate(): string {
  return new Intl.DateTimeFormat('it-IT', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date());
}

export default function Header({ isOnline, notificationsEnabled, onToggleNotifications }: HeaderProps) {
  const [greeting, setGreeting] = useState('');
  const [date, setDate] = useState('');

  useEffect(() => {
    setGreeting(getGreeting());
    setDate(getItalianDate());
  }, []);

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="sticky top-0 z-50 w-full"
    >
      {/* Glassmorphism backdrop */}
      <div className="relative px-4 py-4 sm:px-6 lg:px-8"
        style={{
          background: 'rgba(8,9,13,0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}>
        
        {/* Gradient glow line at top */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-violet-500/50 to-transparent" />

        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          {/* Left: Logo + Greeting */}
          <div className="flex-1 min-w-0">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-2 mb-0.5"
            >
              {/* Logo mark */}
              <div className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, #7c3aed 0%, #06b6d4 100%)',
                  boxShadow: '0 0 12px rgba(124,58,237,0.4)',
                }}>
                <span className="text-white text-xs font-bold">AI</span>
              </div>
              <span className="text-xs font-semibold tracking-widest uppercase text-slate-500">
                Briefing
              </span>
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="text-lg sm:text-xl font-bold text-white truncate"
            >
              {greeting} 👋
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-xs text-slate-500 capitalize truncate"
            >
              {date}
            </motion.p>
          </div>

          {/* Right: Status badges */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Connectivity badge */}
            <motion.div
              key={isOnline ? 'online' : 'offline'}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                isOnline
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
              }`}
            >
              {isOnline ? (
                <>
                  <Wifi className="w-3 h-3" />
                  <span className="hidden sm:inline">Online</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3 h-3" />
                  <span className="hidden sm:inline">Offline</span>
                </>
              )}
              {isOnline && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              )}
            </motion.div>

            {/* Notification toggle */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onToggleNotifications}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all duration-200 ${
                notificationsEnabled
                  ? 'bg-violet-500/15 border-violet-500/40 text-violet-300 hover:bg-violet-500/25'
                  : 'bg-slate-800/60 border-slate-700/50 text-slate-500 hover:bg-slate-700/60'
              }`}
              title={notificationsEnabled ? 'Disattiva notifiche' : 'Attiva notifiche mattutine'}
            >
              {notificationsEnabled ? (
                <Bell className="w-3.5 h-3.5" />
              ) : (
                <BellOff className="w-3.5 h-3.5" />
              )}
              <span className="hidden sm:inline">
                {notificationsEnabled ? 'Notifiche attive' : 'Notifiche off'}
              </span>
            </motion.button>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
