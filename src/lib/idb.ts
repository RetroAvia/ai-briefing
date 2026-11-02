import { openDB, type IDBPDatabase } from 'idb';
import type { CachedBriefing, DailyBriefing, Article, UserPreferences } from '@/types';

const DB_NAME = 'ai-briefing-db';
const DB_VERSION = 3; // Aggiornato per preferenze utente e archivio storico
const STORE_BRIEFINGS = 'briefings';
const STORE_BOOKMARKS = 'bookmarks';
const STORE_PREFERENCES = 'preferences';

export const DEFAULT_PREFERENCES: UserPreferences = {
  density: 'magazine',
  theme: 'midnight',
  fontSize: 'normal',
  autoPlayAudio: false,
};

// Briefing dimostrativo iniziale di altissima caratura editoriale
export const SEED_BRIEFING: DailyBriefing = {
  id: 'seed-briefing-001',
  date: new Date().toISOString().split('T')[0]!,
  created_at: new Date().toISOString(),
  curatorNotes: 'Il briefing odierno evidenzia una forte accelerazione sull\'autonomia algoritmica edge e stabilità dei mercati tecnologici continentali.',
  articles: [
    {
      id: 'art-1',
      title: 'Nuova generazione di chip neurali a 2nm: l\'AI entra a bordo degli smartphone',
      category: 'Tech & AI',
      source: 'ANSA Tech',
      sourceUrl: 'https://www.ansa.it/canale_tecnologia',
      readingTimeMinutes: 2,
      impactScore: 98,
      summary: 'I nuovi processori integrano accelerator neurale dedicato con efficienza quadruplicata, consentendo l\'esecuzione di LLM complessi interamente in locale senza connessione cloud.',
      keyPoints: [
        'Consumo energetico ridotto del 55% a parità di throughput matematico',
        'Elaborazione vocale e visiva in locale con latenza inferiore a 10ms',
        'Distribuzione sui dispositivi flagship prevista entro il primo trimestre',
      ],
      whyCounts: 'Sposta il baricentro dell\'intelligenza artificiale dai data center al dispositivo personale, risolvendo alla radice i problemi di privacy e connettività in mobilità.',
    },
    {
      id: 'art-2',
      title: 'Mercati europei solidi: il piano transizione energetica attira capitali globali',
      category: 'Mercati & Economia',
      source: 'Il Sole 24 Ore',
      sourceUrl: 'https://www.ilsole24ore.com/finanza',
      readingTimeMinutes: 3,
      impactScore: 92,
      summary: 'Gli indici continentali chiudono in territorio positivo grazie alla spinta delle utility e dell\'industria dei semiconduttori, con afflussi record sui fondi sostenibili.',
      keyPoints: [
        'Spread in contrazione e rendimenti obbligazionari stabili sui mercati sovrani',
        'Crescita a doppia cifra per le aziende ad alto contenuto tecnologico',
        'Previsti nuovi incentivi europei per l\'ammodernamento delle infrastrutture',
      ],
      whyCounts: 'La stabilità dei mercati crea una finestra favorevole per gli investimenti a lungo termine nelle tecnologie strategiche per la sovranità europea.',
    },
    {
      id: 'art-3',
      title: 'Vertice sul futuro dell\'infrastruttura aerospaziale: accordo tra 14 Paesi',
      category: 'Geopolitica',
      source: 'BBC World News',
      sourceUrl: 'https://www.bbc.com/news',
      readingTimeMinutes: 3,
      impactScore: 89,
      summary: 'Siglato a Ginevra il protocollo d\'intesa per la sicurezza delle comunicazioni orbitali e la condivisione tempestiva dei dati meteo-satellitari critici.',
      keyPoints: [
        'Rete di monitoraggio condivisa per prevenire interferenze e detriti spaziali',
        'Standard aperto per le comunicazioni di emergenza civili',
        'Creazione di un fondo di cooperazione per le nazioni emergenti',
      ],
      whyCounts: 'La cooperazione sulle infrastrutture satellitari garantisce la continuità delle reti di telecomunicazione critiche in caso di crisi geopolitiche terrestri.',
    },
    {
      id: 'art-4',
      title: 'Fusione nucleare a confinamento magnetico: superato il record di confinamento di plasma',
      category: 'Scienza',
      source: 'ANSA Scienza',
      sourceUrl: 'https://www.ansa.it/canale_scienza_tecnica',
      readingTimeMinutes: 4,
      impactScore: 95,
      summary: 'I fisici dell\'esperimento congiunto sono riusciti a mantenere stabile per oltre 12 minuti una colonna di plasma a 100 milioni di gradi centigradi.',
      keyPoints: [
        'Materiali in carburo di silicio avanzato impiegati con successo per le pareti',
        'Bilancio energetico netto positivo registrato per la seconda volta consecutiva',
        'Nuova roadmap industriale verso il primo impianto prototipo commerciale',
      ],
      whyCounts: 'Rappresenta il passo più concreto verso una fonte di energia illimitata, pulita e indipendente dalle riserve geopolitiche di idrocarburi.',
    },
    {
      id: 'art-5',
      title: 'Italia polo dell\'innovazione: via al polo nazionale per il cloud e la sicurezza dei dati',
      category: 'Italia',
      source: 'Il Sole 24 Ore',
      sourceUrl: 'https://www.ilsole24ore.com',
      readingTimeMinutes: 2,
      impactScore: 88,
      summary: 'Inaugurato il nuovo data center federato che ospiterà i servizi strategici della pubblica amministrazione e delle filiere manifatturiere d\'eccellenza.',
      keyPoints: [
        'Infrastruttura alimentata al 100% da fonti rinnovabili geotermiche e solari',
        'Ridondanza geografica su tre poli dislocati tra Nord, Centro e Mezzogiorno',
        'Coinvolgimento attivo di oltre 200 PMI e startup nazionali specializzate',
      ],
      whyCounts: 'Preserva la sovranità sui dati nazionali e riduce drasticamente i costi di gestione della PA garantendo protezione contro attacchi ransomware.',
    },
    {
      id: 'art-6',
      title: 'Agenti autonomi collaborativi: il nuovo paradigma del lavoro cognitivo',
      category: 'Tech & AI',
      source: 'TechCrunch',
      sourceUrl: 'https://techcrunch.com',
      readingTimeMinutes: 3,
      impactScore: 94,
      summary: 'La transizione dai semplici chatbot di testo a swarm di agenti intelligenti capaci di pianificare, testare ed eseguire flussi software complessi in autonomia.',
      keyPoints: [
        'Integrazione profonda con repository di codice, database e pipeline CI/CD',
        'Diminuzione dei tempi di rilascio del software fino al 60%',
        'Crescente richiesta di competenze ingegneristiche nel coordinamento di agenti',
      ],
      whyCounts: 'Ridefinisce la produttività aziendale: i team non scrivono più ogni riga di codice manualmente, ma orchestrano e supervisionano agenti autonomi.',
    },
    {
      id: 'art-7',
      title: 'Report OCSE: l\'Italia accelera sulle esportazioni ad alto contenuto tecnologico',
      category: 'Mercati & Economia',
      source: 'Corriere Economia',
      sourceUrl: 'https://www.corriere.it/economia',
      readingTimeMinutes: 2,
      impactScore: 87,
      summary: 'L\'export manifatturiero e dei macchinari di precisione segna un incremento dell\'8,4%, confermando la solidità delle filiere specializzate nel Nord e Centro Italia.',
      keyPoints: [
        'Robotica industriale e automazione guidano la domanda dai mercati esteri',
        'Rafforzamento dei canali commerciali verso il Nord America e il Far East',
        'Forte propensione delle aziende a reinvestire gli utili in ricerca e sviluppo',
      ],
      whyCounts: 'Testimonia la resilienza del tessuto industriale italiano anche in uno scenario macroeconomico internazionale di tassi elevati.',
    },
    {
      id: 'art-8',
      title: 'Nuova terapia genica mirata riceve il via libera dalle autorità sanitarie europee',
      category: 'Scienza',
      source: 'ANSA Scienza',
      sourceUrl: 'https://www.ansa.it/canale_scienza_tecnica',
      readingTimeMinutes: 3,
      impactScore: 91,
      summary: 'Approvato il primo trattamento CRISPR di seconda generazione capace di correggere con precisione millimetrica le mutazioni responsabili di patologie rare del sangue.',
      keyPoints: [
        'Efficacia clinica dimostrata superiore al 92% nei trial di fase III',
        'Somministrazione in singola seduta ospedaliera con follow-up a lungo termine',
        'Accordo di rimborso basato sui risultati terapeutici effettivi',
      ],
      whyCounts: 'Apre una nuova era per la medicina personalizzata dove la causa genetica della malattia viene corretta invece di limitarsi a curare i sintomi cronici.',
    },
    {
      id: 'art-9',
      title: 'Città intelligenti e mobilità dolce: finanziati 45 nuovi progetti metropolitani',
      category: 'Italia',
      source: 'ANSA',
      sourceUrl: 'https://www.ansa.it',
      readingTimeMinutes: 2,
      impactScore: 85,
      summary: 'Stanziati fondi per prolungamenti di linee metropolitane, corsie preferenziali protette e semaforizzazione intelligente per abbattere i tempi di pendolarismo.',
      keyPoints: [
        'Priorità ai collegamenti periferia-centro nelle grandi aree urbane',
        'Integrazione tariffaria unica via app per tutti i mezzi pubblici',
        'Installazione di nuove pensiline intelligenti con monitoraggio in tempo reale',
      ],
      whyCounts: 'Migliora la qualità della vita quotidiana di milioni di lavoratori riducendo congestione e inquinamento atmosferico nelle città.',
    },
    {
      id: 'art-10',
      title: 'Cybersecurity: direttiva globale per la crittografia post-quantistica',
      category: 'Tech & AI',
      source: 'The Verge',
      sourceUrl: 'https://www.theverge.com',
      readingTimeMinutes: 3,
      impactScore: 93,
      summary: 'I consorzi internazionali di standardizzazione rilasciano gli algoritmi definitivi per proteggere le comunicazioni crittografate prima dell\'avvento dei computer quantistici.',
      keyPoints: [
        'Quattro nuovi standard crittografici basati su reticoli matematici multidimensionali',
        'Obbligo di transizione per banche, telecomunicazioni e infrastrutture critiche entro 36 mesi',
        'Nessun calo percettibile delle prestazioni sui moderni smartphone e browser',
      ],
      whyCounts: 'Previene il fenomeno dell\'intercettazione oggi per decifrare domani, blindando la sicurezza dei dati sensibili per i prossimi decenni.',
    },
  ],
};

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDB(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion) {
        if (!db.objectStoreNames.contains(STORE_BRIEFINGS)) {
          db.createObjectStore(STORE_BRIEFINGS, { keyPath: 'date' });
        }
        if (!db.objectStoreNames.contains(STORE_BOOKMARKS)) {
          db.createObjectStore(STORE_BOOKMARKS, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(STORE_PREFERENCES)) {
          db.createObjectStore(STORE_PREFERENCES);
        }
      },
    });
  }
  return dbPromise;
}

// Salva o aggiorna un briefing giornaliero in IndexedDB
export async function saveBriefing(briefing: DailyBriefing): Promise<void> {
  try {
    const db = await getDB();
    const cached: CachedBriefing = {
      date: briefing.date,
      briefing,
      cachedAt: Date.now(),
    };
    await db.put(STORE_BRIEFINGS, cached);
  } catch (err) {
    console.warn('[IDB] Errore salvataggio briefing:', err);
  }
}

// Recupera il briefing più recente salvato in locale
export async function getLatestBriefing(): Promise<DailyBriefing | null> {
  try {
    const db = await getDB();
    const all = await db.getAll(STORE_BRIEFINGS);
    if (all.length === 0) return null;

    const sorted = (all as CachedBriefing[]).sort((a, b) =>
      b.date.localeCompare(a.date)
    );
    return sorted[0]?.briefing ?? null;
  } catch (err) {
    console.warn('[IDB] Errore recupero ultimo briefing:', err);
    return null;
  }
}

// Recupera briefing per data specifica (Archivio Storico)
export async function getBriefingByDate(date: string): Promise<DailyBriefing | null> {
  try {
    const db = await getDB();
    const cached = (await db.get(STORE_BRIEFINGS, date)) as CachedBriefing | undefined;
    return cached?.briefing ?? null;
  } catch {
    return null;
  }
}

// Restituisce tutte le date disponibili nei briefing memorizzati
export async function getAvailableBriefingDates(): Promise<string[]> {
  try {
    const db = await getDB();
    const all = await db.getAllKeys(STORE_BRIEFINGS);
    return (all as string[]).sort((a, b) => b.localeCompare(a));
  } catch {
    return [];
  }
}

// Segnalibri (Bookmarks) salvati localmente per lettura offline
export async function saveBookmark(article: Article): Promise<void> {
  try {
    const db = await getDB();
    await db.put(STORE_BOOKMARKS, { ...article, savedAt: Date.now() });
  } catch (err) {
    console.warn('[IDB] Errore salvataggio bookmark:', err);
  }
}

export async function removeBookmark(articleId: string): Promise<void> {
  try {
    const db = await getDB();
    await db.delete(STORE_BOOKMARKS, articleId);
  } catch (err) {
    console.warn('[IDB] Errore rimozione bookmark:', err);
  }
}

export async function getBookmarks(): Promise<Article[]> {
  try {
    const db = await getDB();
    const all = await db.getAll(STORE_BOOKMARKS);
    return (all as Article[]).sort(
      (a, b) =>
        ((b as { savedAt?: number }).savedAt || 0) - ((a as { savedAt?: number }).savedAt || 0)
    );
  } catch (err) {
    console.warn('[IDB] Errore recupero bookmarks:', err);
    return [];
  }
}

// Preferenze Utente (Densità, Tema, Font Size)
export async function getPreferences(): Promise<UserPreferences> {
  try {
    const db = await getDB();
    const prefs = (await db.get(STORE_PREFERENCES, 'user_prefs')) as UserPreferences | undefined;
    return prefs || DEFAULT_PREFERENCES;
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export async function savePreferences(prefs: UserPreferences): Promise<void> {
  try {
    const db = await getDB();
    await db.put(STORE_PREFERENCES, prefs, 'user_prefs');
  } catch (err) {
    console.warn('[IDB] Errore salvataggio preferenze:', err);
  }
}
