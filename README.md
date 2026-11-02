# AI Briefing PWA ☀️

Un'applicazione Progressive Web App (PWA) moderna, offline-first, per la consultazione quotidiana di notizie sintetizzate dall'intelligenza artificiale, distribuibile su Vercel con Supabase come database PostgreSQL.

---

## 🌟 Caratteristiche Principali

- **Offline-First Reale (Stale-While-Revalidate)**: Navigazione istantanea in metropolitana o senza connessione grazie a IndexedDB (`idb`) e Service Worker con cache dinamica.
- **Interfaccia Dark Glassmorphism**: Palette immersiva (`#08090d`, pannelli `#11131c`), gradienti neon (viola, ciano, smeraldo), micro-animazioni con Framer Motion.
- **Audio Briefing Vocale (100% Offline)**: Ascolto delle notizie tramite la Web Speech API nativa, senza richiedere streaming o connessione dati.
- **Segnalibri Locali**: Salva le notizie preferite nel database locale per leggerle con calma in mobilità.
- **Automazione Cron (06:30 ogni mattina)**: Vercel Cron invoca `/api/cron/briefing` per recuperare i feed RSS, richiedere all'LLM l'elaborazione con Structured Outputs rigorosi e inviare notifiche Web Push agli abbonati.
- **Installabile come App Nativa**: File `manifest.json` completo con icone PNG/SVG (72px → 512px con supporto maskable) e supporto al prompt di installazione PWA.

---

## 🚀 Setup e Avvio Rapido

### 1. Configurazione del Database su Supabase
Accedi alla tua dashboard Supabase, apri l'**SQL Editor** ed esegui lo script [`supabase/setup.sql`](./supabase/setup.sql).

### 2. Generazione Chiavi VAPID
Nel terminale esegui:
```bash
npx web-push generate-vapid-keys
```

### 3. Variabili d'Ambiente
Copia `.env.example` in `.env.local` e inserisci le chiavi:
```env
NEXT_PUBLIC_SUPABASE_URL="https://tuo-progetto.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="tua-anon-key"
SUPABASE_SERVICE_ROLE_KEY="tua-service-role-key"

NEXT_PUBLIC_VAPID_PUBLIC_KEY="tua-chiave-pubblica-vapid"
VAPID_PRIVATE_KEY="tua-chiave-privata-vapid"
VAPID_SUBJECT="mailto:tua-email@example.com"

CRON_SECRET="tua-stringa-segreta-casuale"
LLM_API_KEY="tua-chiave-api-openai"
LLM_BASE_URL="https://api.openai.com/v1"
LLM_MODEL="gpt-4o-mini"
```

### 4. Avvio in Sviluppo
```bash
npm run dev
```
Apri [http://localhost:3000](http://localhost:3000).

### 5. Verifica del Build di Produzione
```bash
npm run build
```

---

## 📱 Test Offline in Metropolitana

1. Apri l'app la prima volta mentre sei online: le notizie vengono salvate istantaneamente in IndexedDB.
2. Disattiva la connessione WiFi/dati o imposta la modalità aereo negli Strumenti per sviluppatori (scheda Network -> Offline).
3. Ricarica la pagina: l'interfaccia si carica istantaneamente mostrando il badge ambra **Offline**, con tutte le notizie leggibili, ricercabili e riproducibili via sintesi vocale.
