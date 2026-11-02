# ☀️ AI Briefing PWA — Rassegna Quotidiana Intelligente

> **Progressive Web App (PWA) Offline-First** per la consultazione quotidiana di notizie sintetizzate dall'intelligenza artificiale, progettata secondo i principi degli **Human Interface Guidelines (HIG) di Apple** (iOS 18, macOS Sonoma e VisionOS).

---

## 💎 Caratteristiche Principali

- **Offline-First Reale**: Architettura con doppio livello di persistenza locale (IndexedDB `idb` + fallback su `localStorage`) e Service Worker con cache dinamica. Funziona al 100% in metropolitana o senza connessione internet.
- **Interfaccia Apple Dark Elegance**:
  - Palette nero profondo OLED (`#000000`) con bagliori cosmici ambientali.
  - Materiali satinati VisionOS con sfocatura dinamica (`backdrop-filter: blur(35px) saturate(190%)`).
  - Raggi di curvatura squircle morbidi e bordi sub-pixel (`border-white/[0.08]`).
  - Contrasti certificati WCAG AAA e tipografia ad altissima leggibilità.
- **Layout Responsivo Avanzato (PC Desktop vs Smartphone)**:
  - **Desktop (PC / Mac)**: Griglia editoriale bilanciata a 2 colonne in modalità *Rivista*, Hero Story Spotlight a 12 colonne con Takeaway affiancato, ricerca in stile Spotlight con scorciatoia rapida da tastiera (`⌘K` / `Ctrl K`).
  - **Smartphone**: Flusso a pollice singolo, swipe touch fluido, pulsanti conformi a target minimi di 44px e player vocale flottante stile *Dynamic Island*.
- **3 Livelli di Densità Visiva**:
  - *Rivista (Magazine)*: Esperienza ricca con Hero Story e card complete.
  - *Compatto (Compact)*: Vista a riga singola in stile elenco iOS.
  - *Minimo (Minimal)*: Scansione a schede essenziali su 3 colonne per lettura ultrarapida.
- **Zen Reader (Cassetto Immersivo)**:
  - 3 prospettive di analisi AI al volo (*Analisi Strategica*, *Impatto Mercati*, *Flash 30s per la metro*).
  - Regolazione dinamica della dimensione del testo (`Normale`, `Grande`, `Molto Grande`).
- **Sintesi Vocale Offline (Web Speech API)**: Ascolto delle notizie letto da voce italiana nativa senza consumo di traffico dati.
- **Stories Mode Fullscreen (Metro Digest)**: Scorrimento a schede con barre di progresso segmentate stile Apple.
- **AI Knowledge Graph**: Mappa SVG interattiva delle interconnessioni tematiche della giornata.
- **Automazione Vercel Cron (06:30 ogni mattina)**: Esecuzione schedulata del Route Handler `/api/cron/briefing` per recuperare i feed RSS, interrogare l'LLM con Structured Outputs rigidi, aggiornare il database Supabase e inviare notifiche native Web Push.
- **Installabile su Schermata Home**: PWA completa di `manifest.json`, icone ad alta risoluzione (72px → 512px anche maskable) e supporto al prompt d'installazione.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 15 (App Router)](https://nextjs.org/) con TypeScript Strict
- **Database & Backend**: [Supabase PostgreSQL](https://supabase.com/) con Row Level Security (RLS)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/), [Lucide React](https://lucide.dev/), [Framer Motion](https://www.framer.com/motion/)
- **Offline Storage**: IndexedDB (libreria [`idb`](https://github.com/jakearchibald/idb)) con fallback trasparente
- **Web Push**: Web Push API nativa + pacchetto [`web-push`](https://github.com/web-push-libs/web-push)
- **Ingestion & AI**: [`rss-parser`](https://github.com/rbren/rss-parser) + SDK OpenAI-compatible (Groq / OpenAI) con Structured Outputs (`json_schema` strict)
- **Schedulazione**: [Vercel Cron](https://vercel.com/docs/cron-jobs)

---

## 📁 Struttura del Progetto

```
ai-briefing-pwa/
├── public/
│   ├── icons/                 # Suite completa icone PWA (PNG e SVG da 72 a 512px)
│   ├── manifest.json          # W3C Web App Manifest
│   ├── offline.html           # Schermata di riserva offline
│   └── sw.js                  # Service Worker (stale-while-revalidate e push handler)
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── cron/briefing/ # Schedulazione Vercel Cron (06:30)
│   │   │   └── push/          # Endpoints subscribe e unsubscribe push
│   │   ├── error.tsx          # Error Boundary globale con recupero rapido
│   │   ├── globals.css        # Materiali Apple Vibrancy, stili print e typography
│   │   ├── layout.tsx         # Root layout con metadata PWA e font Inter
│   │   └── page.tsx           # Dashboard principale client-side offline-first
│   ├── components/            # Componenti UI modulari rifiniti
│   ├── lib/
│   │   ├── export.ts          # Generazione Markdown, copia appunti e haptic feedback
│   │   ├── idb.ts             # Storage IndexedDB resiliente con seed e fallback
│   │   ├── push.ts            # Client manager notifiche Web Push
│   │   ├── rss.ts             # Fetcher multi-feed RSS con fallback
│   │   └── supabase/          # Client pubblico browser e service role protetto
│   └── types/                 # Tipi TypeScript strict per l'intera applicazione
├── supabase/
│   └── setup.sql              # Script SQL per creazione tabelle, indici e policy RLS
├── .env.example               # Template documentato variabili d'ambiente
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── vercel.json                # Configurazione Vercel Cron
```

---

## 🚀 Guida di Installazione e Setup

### 1. Clona il Repository e Installa le Dipendenze
```bash
git clone https://github.com/tuo-username/ai-briefing-pwa.git
cd ai-briefing-pwa
npm install
```

### 2. Configura il Database su Supabase
1. Accedi alla console di [Supabase](https://supabase.com) e crea un nuovo progetto.
2. Apri la sezione **SQL Editor**.
3. Incolla ed esegui il contenuto del file [`supabase/setup.sql`](./supabase/setup.sql).
   - Crea le tabelle `public.daily_briefings` e `public.push_subscriptions`.
   - Imposta la policy di Row Level Security (RLS) per consentire la lettura pubblica anonima dei briefing.

### 3. Genera le Chiavi VAPID per le Notifiche Web Push
Nel tuo terminale esegui:
```bash
npx web-push generate-vapid-keys
```
Otterrai una **Public Key** e una **Private Key**.

### 4. Configura le Variabili d'Ambiente
Copia il file di esempio `.env.example` in `.env.local`:
```bash
cp .env.example .env.local
```
Compila i campi:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://tuo-progetto.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="tua-anon-key"
SUPABASE_SERVICE_ROLE_KEY="tua-service-role-key"

# Web Push VAPID Keys
NEXT_PUBLIC_VAPID_PUBLIC_KEY="tua-chiave-pubblica-vapid"
VAPID_PRIVATE_KEY="tua-chiave-privata-vapid"
VAPID_SUBJECT="mailto:tua-email@example.com"

# Cron Security
CRON_SECRET="stringa-segreta-casuale"

# Provider LLM (Groq gratuito o OpenAI)
LLM_API_KEY="tua-chiave-api-ia"
LLM_BASE_URL="https://api.groq.com/openai/v1"   # oppure https://api.openai.com/v1
LLM_MODEL="llama-3.3-70b-versatile"             # oppure gpt-4o-mini
```

### 5. Avvia in Modalità di Sviluppo
```bash
npm run dev
```
- Da PC: apri [http://localhost:3000](http://localhost:3000).
- Da smartphone (stesso Wi-Fi): apri `http://<IP-LOCALE-DEL-PC>:3000`.

### 6. Verifica Build di Produzione
```bash
npm run build
```

---

## 🚢 Distribuzione su Vercel e GitHub

1. **Inizializza e invia il codice su GitHub**:
   ```bash
   git add .
   git commit -m "feat: AI Briefing PWA Offline-First con Apple HIG Design System"
   git branch -M main
   git remote add origin https://github.com/tuo-username/ai-briefing-pwa.git
   git push -u origin main
   ```

2. **Importa il progetto su Vercel**:
   - Collega il tuo repository GitHub su [vercel.com](https://vercel.com).
   - Inserisci nella sezione **Environment Variables** tutte le variabili presenti nel tuo `.env.local`.
   - Premi **Deploy**.

3. **Vercel Cron**:
   - Il file `vercel.json` pianifica in automatico la generazione del briefing ogni mattina alle **06:30 UTC**:
     ```json
     {
       "crons": [
         {
           "path": "/api/cron/briefing",
           "schedule": "30 6 * * *"
         }
       ]
     }
     ```
   - Vercel invierà automaticamente l'header `Authorization: Bearer ${CRON_SECRET}` configurato nelle impostazioni di progetto.

---

## 📱 Test della Funzionalità Offline (Metro Test)

1. Apri l'app la prima volta mentre sei online: le notizie vengono memorizzate istantaneamente nel database IndexedDB locale.
2. Disattiva il Wi-Fi e la connessione dati (oppure attiva la modalità aereo / simula `Offline` nei DevTools di Chrome/Safari).
3. Ricarica la pagina: l'applicazione si aprirà istantaneamente senza schermate di errore o caricamenti bloccati, visualizzando il badge **⚡ Copia locale (Offline)**.
4. Sarà possibile leggere gli articoli, alternare le 3 prospettive AI, filtrare per categoria, cercare parole chiave e ascoltare la rassegna vocale.

---

## 📄 Licenza

Distribuito sotto licenza MIT. Libero per utilizzi personali e commerciali.
