# AI Briefing PWA

Un'app di notizie offline-first con IA, notifiche push e design glassmorphism.

## Tech Stack

- **Framework**: Next.js 15 (App Router, TypeScript strict)
- **Database**: Supabase (PostgreSQL + RLS)
- **Styling**: Tailwind CSS + Framer Motion
- **Offline**: IndexedDB (`idb`) + Service Worker
- **Notifiche**: Web Push API + `web-push`
- **Automazione**: Vercel Cron Jobs
- **IA**: OpenAI SDK con Structured Outputs

---

## Setup rapido

### 1. Clona e installa le dipendenze

```bash
git clone https://github.com/tuo-username/ai-briefing-pwa
cd ai-briefing-pwa
pnpm install  # oppure npm install
```

### 2. Configura Supabase

1. Vai su [supabase.com](https://supabase.com) e crea un nuovo progetto
2. Apri l'**SQL Editor** ed esegui il contenuto di [`supabase/setup.sql`](./supabase/setup.sql)

### 3. Genera le chiavi VAPID

```bash
npx web-push generate-vapid-keys
```

Salva la **chiave pubblica** e la **chiave privata** mostrate nell'output.

### 4. Configura le variabili d'ambiente

Copia `.env.example` in `.env.local` e compila tutti i valori:

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL="https://xxxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJ..."
SUPABASE_SERVICE_ROLE_KEY="eyJ..."

NEXT_PUBLIC_VAPID_PUBLIC_KEY="BNtB..."
VAPID_PRIVATE_KEY="abc..."
VAPID_SUBJECT="mailto:tu@esempio.it"

CRON_SECRET="stringa-casuale-sicura-32-caratteri"

LLM_API_KEY="sk-..."
LLM_BASE_URL="https://api.openai.com/v1"
LLM_MODEL="gpt-4o-mini"
```

### 5. Genera le icone PWA (opzionale)

```bash
# Icone SVG (già incluse, funzionano direttamente)
node scripts/generate-svg-icons.mjs

# Per icone PNG (richiede il pacchetto canvas)
npm install canvas --save-dev
node scripts/generate-icons.mjs
```

> **Nota**: Il `manifest.json` è già configurato per le icone SVG. Per la produzione, usa PNG.

### 6. Avvia in sviluppo

```bash
pnpm dev
```

Apri [http://localhost:3000](http://localhost:3000)

---

## Deploy su Vercel

### 1. Collega il repository GitHub a Vercel

```bash
# Prima pusha su GitHub
git init && git add . && git commit -m "feat: initial AI Briefing PWA"
git remote add origin https://github.com/tuo-username/ai-briefing-pwa
git push -u origin main
```

### 2. Importa su Vercel

1. Vai su [vercel.com/new](https://vercel.com/new)
2. Importa il repository GitHub
3. Aggiungi **tutte le variabili d'ambiente** dalla sezione Environment Variables

### 3. Il Vercel Cron è già configurato

Il file `vercel.json` schedula automaticamente `/api/cron/briefing` alle **06:30 ogni mattina**.

Per testare manualmente il cron:
```bash
curl -H "Authorization: Bearer IL-TUO-CRON-SECRET" \
  https://tua-app.vercel.app/api/cron/briefing
```

---

## Struttura del progetto

```
ai-briefing-pwa/
├── public/
│   ├── icons/          # Icone PWA (SVG/PNG)
│   ├── sw.js           # Service Worker
│   ├── manifest.json   # PWA Manifest
│   └── offline.html    # Pagina offline fallback
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout con metadata PWA
│   │   ├── page.tsx            # Homepage (offline-first logic)
│   │   ├── globals.css         # Stili globali + utility classi
│   │   └── api/
│   │       ├── cron/briefing/  # Cron job RSS → LLM → Supabase
│   │       └── push/           # Subscribe/Unsubscribe endpoints
│   ├── components/
│   │   ├── Header.tsx          # Greeting + connectivity + notifications
│   │   ├── NewsCard.tsx        # Card notizia con glassmorphism
│   │   ├── CategoryFilter.tsx  # Chip filtri categoria
│   │   ├── SearchBar.tsx       # Ricerca istantanea
│   │   ├── SkeletonCard.tsx    # Loading skeleton
│   │   └── EmptyState.tsx      # Stati vuoti/errore
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts       # Browser client (pubblico)
│   │   │   └── server.ts       # Server client (service role)
│   │   ├── idb.ts              # IndexedDB wrapper
│   │   ├── push.ts             # Push notification helpers
│   │   └── rss.ts              # RSS feed fetcher
│   └── types/
│       └── index.ts            # TypeScript types + category config
├── scripts/
│   └── generate-icons.mjs      # Script generazione icone
├── supabase/
│   └── setup.sql               # Script SQL setup database
├── .env.example
├── vercel.json                 # Cron job configuration
└── next.config.ts
```

---

## Funzionalità offline

L'app utilizza una strategia **offline-first** a doppio livello:

1. **IndexedDB**: Ogni volta che l'app carica un briefing da Supabase, lo salva automaticamente in IndexedDB
2. **Service Worker**: Cachea la shell dell'app (HTML, CSS, JS) per il caricamento immediato senza rete

In metropolitana o senza connessione → l'app mostra l'ultimo briefing scaricato senza interruzioni.

---

## RSS Feed configurati

| Fonte | Categoria |
|-------|-----------|
| ANSA Tecnologia | Tech & AI |
| TechCrunch | Tech & AI |
| Reuters Tech | Tech & AI |
| Corriere Economia | Mercati & Economia |
| Bloomberg Markets | Mercati & Economia |
| Il Sole 24 Ore Mondo | Geopolitica |
| ANSA Scienza | Scienza |
| Corriere Italia | Italia |

---

## Licenza

MIT
