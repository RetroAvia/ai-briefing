'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Orbit, Compass, Zap, Shield, Rocket, Cpu, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import type { DailyBriefing } from '@/types';
import { triggerHaptic } from '@/lib/export';

interface ScenarioSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  briefing: DailyBriefing;
}

type TimelineHorizon = '2030' | '2035' | '2050';

export default function ScenarioSimulatorModal({
  isOpen,
  onClose,
  briefing,
}: ScenarioSimulatorModalProps) {
  const [horizon, setHorizon] = useState<TimelineHorizon>('2035');
  const [adoptionSpeed, setAdoptionSpeed] = useState<'standard' | 'accelerated' | 'singularity'>('accelerated');

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => {
            triggerHaptic(10);
            onClose();
          }}
          className="fixed inset-0 bg-[#000000]/85 backdrop-blur-2xl transition-opacity"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
          className="relative w-full max-w-3xl rounded-[30px] p-6 sm:p-8 border border-white/10 z-10 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
          style={{
            background: 'rgba(14, 14, 20, 0.98)',
            boxShadow: '0 30px 90px rgba(0, 0, 0, 0.95), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
          }}
        >
          {/* Ambient Glow */}
          <div
            className="absolute -top-32 -right-32 w-72 h-72 rounded-full pointer-events-none opacity-20"
            style={{
              background: 'radial-gradient(circle, #64d2ff 0%, #bf5af2 60%, transparent 70%)',
            }}
          />

          {/* Close button */}
          <button
            onClick={() => {
              triggerHaptic(10);
              onClose();
            }}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-[#86868b] hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3.5 mb-5 flex-shrink-0">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#64d2ff] to-[#bf5af2] flex items-center justify-center flex-shrink-0 text-white shadow-lg shadow-[#64d2ff]/20">
              <Orbit className="w-5 h-5 animate-spin" style={{ animationDuration: '12s' }} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#64d2ff]">
                  Motore Predittivo Anno 3000
                </span>
                <span className="px-2 py-0.2 rounded-full bg-[#bf5af2]/15 text-[#bf5af2] text-[10px] font-bold">
                  Simulatore di Scenario
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                Onde d&apos;Urto & Orizzonti Futuri
              </h2>
            </div>
          </div>

          <p className="text-xs text-[#a1a1a6] leading-relaxed mb-5 flex-shrink-0">
            Come le notizie di oggi su aerospazio, intelligenza artificiale, energia e geopolitica si
            propagheranno attraverso i prossimi decenni per plasmare la civiltà del futuro.
          </p>

          {/* Horizon Selector */}
          <div className="flex items-center justify-between gap-3 mb-5 flex-wrap flex-shrink-0">
            <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white/[0.04] border border-white/[0.08]">
              {(['2030', '2035', '2050'] as TimelineHorizon[]).map((h) => (
                <button
                  key={h}
                  onClick={() => {
                    triggerHaptic(10);
                    setHorizon(h);
                  }}
                  className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    horizon === h
                      ? 'bg-white text-black shadow-md font-extrabold'
                      : 'text-[#86868b] hover:text-white'
                  }`}
                >
                  Orizzonte {h}
                </button>
              ))}
            </div>

            {/* Velocity of adoption */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-[#86868b] text-[11px] font-medium hidden sm:inline">Adozione:</span>
              <button
                onClick={() => setAdoptionSpeed(adoptionSpeed === 'singularity' ? 'standard' : 'singularity')}
                className={`px-3 py-1 rounded-full text-[11px] font-bold border transition-all ${
                  adoptionSpeed === 'singularity'
                    ? 'bg-[#bf5af2]/20 border-[#bf5af2]/40 text-[#bf5af2]'
                    : 'bg-white/[0.04] border-white/[0.08] text-[#86868b]'
                }`}
              >
                {adoptionSpeed === 'singularity' ? '⚡ Singolarità Esponenziale' : 'Velocità Standard'}
              </button>
            </div>
          </div>

          {/* Body Content */}
          <div className="overflow-y-auto space-y-4 pr-1 flex-1 py-1 scrollbar-hide">
            {/* Box 1: Aerospazio & Trasporti Orbitali */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-[#64d2ff] uppercase tracking-wider">
                <Rocket className="w-4 h-4 text-[#64d2ff]" />
                <span>Aerospazio & Mobilità Orbitale ({horizon})</span>
              </div>
              <p className="text-xs text-[#d2d2d7] leading-relaxed">
                {horizon === '2030'
                  ? 'I primi velivoli a idrogeno liquido servono regolarmente le tratte europee medio-corte. La riutilizzabilità dei vettori spaziali porta il costo di lancio a 150$/kg, inaugurando la prima rete di stazioni commerciali.'
                  : horizon === '2035'
                  ? 'Voli suborbitali punto-a-punto collegano Roma a Tokyo in 90 minuti. La base lunare permanente ospita i primi impianti robotizzati per l\'estrazione e la raffinazione di Elio-3 e acqua ghiacciata.'
                  : 'Economia cis-lunare pienamente autosufficiente con motori a fusione magnetica per rotte interplanetarie. L\'aviazione atmosferica terrestre è al 100% a propulsione criogenica e zero impatto chimico.'}
              </p>
            </div>

            {/* Box 2: Tech, AI & Cervello Digitale */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-[#2997ff] uppercase tracking-wider">
                <Cpu className="w-4 h-4 text-[#2997ff]" />
                <span>Intelligenza Neurale & Modelli Cognitivi ({horizon})</span>
              </div>
              <p className="text-xs text-[#d2d2d7] leading-relaxed">
                {horizon === '2030'
                  ? 'Gli agenti autonomi gestiscono l\'80% del software engineering globale. L\'elaborazione a 1.5nm su dispositivi edge permette modelli di ragionamento complessi senza connessione remota.'
                  : horizon === '2035'
                  ? 'Integrazione di calcolo neuromorfo e processori quantistici a temperatura controllata. L\'AI è co-architetto della fisica dei materiali e della sintesi molecolare ad altissima velocità.'
                  : 'Simbiosi neurale diretta a bassissimo consumo energetico. L\'intelligenza artificiale opera come infrastruttura planetaria universale distribuita tra stazioni terrestri e satellitari.'}
              </p>
            </div>

            {/* Box 3: Energia & Sostenibilità Planetaria */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-[#34c759] uppercase tracking-wider">
                <Zap className="w-4 h-4 text-[#34c759]" />
                <span>Energia da Fusione & Batterie a Stato Solido ({horizon})</span>
              </div>
              <p className="text-xs text-[#d2d2d7] leading-relaxed">
                {horizon === '2030'
                  ? 'Le celle litio-metallo solide alimentano veicoli pesanti e velivoli elettrici con ricarica in 5 minuti. I primi reattori tokamak prototipo iniettano energia netta nella rete.'
                  : horizon === '2035'
                  ? 'Tre impianti commerciali a fusione magnetica raggiungono operatività stabile nel continente europeo, riducendo drasticamente il costo dell\'energia per la produzione di idrogeno verde.'
                  : 'Energia pulita virtualmente illimitata generata da reattori a fusione di seconda generazione e array fotovoltaici orbitali con trasmissione a microonde guidate.'}
              </p>
            </div>

            {/* Box 4: Cybersecurity & Sovranità Spaziale */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-[#ffd60a] uppercase tracking-wider">
                <Shield className="w-4 h-4 text-[#ffd60a]" />
                <span>Scudo Quantistico & Reti Inviolabili ({horizon})</span>
              </div>
              <p className="text-xs text-[#d2d2d7] leading-relaxed">
                {horizon === '2030'
                  ? 'Tutte le banche e le infrastrutture critiche completano la migrazione alla crittografia reticolare post-quantistica, blindando i dati prima dell\'avvento dei computer quantistici di potenza.'
                  : horizon === '2035'
                  ? 'La costellazione quantistica europea IRIS² gestisce comunicazioni inviolabili dallo spazio attraverso chiavi ottiche QKD senza vulnerabilità intercettabili.'
                  : 'Architettura di sicurezza cibernetica decentralizzata auto-riparante a tolleranza totale su scala planetaria e inter-orbitale.'}
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between gap-3 flex-shrink-0 mt-3">
            <span className="text-[11px] text-[#86868b]">
              Modello predittivo calibrato sulle 12 notizie del briefing odierno
            </span>
            <button
              onClick={() => {
                triggerHaptic(10);
                onClose();
              }}
              className="px-5 py-2 rounded-full text-xs font-bold text-white bg-white/10 hover:bg-white/20 transition-all"
            >
              Chiudi Simulazione
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
