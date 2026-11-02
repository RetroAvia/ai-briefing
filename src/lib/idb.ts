import { openDB, type IDBPDatabase } from 'idb';
import type { CachedBriefing, DailyBriefing, Article, UserPreferences } from '@/types';

const DB_NAME = 'ai-briefing-db';
const DB_VERSION = 3;
const STORE_BRIEFINGS = 'briefings';
const STORE_BOOKMARKS = 'bookmarks';
const STORE_PREFERENCES = 'preferences';

export const DEFAULT_PREFERENCES: UserPreferences = {
  density: 'magazine',
  theme: 'midnight',
  fontSize: 'normal',
  autoPlayAudio: false,
  hasCompletedOnboarding: false,
  userRole: 'Ingegnere Aerospaziale',
  categoryPreferences: {
    'Aerospazio & Aviazione': {
      interest: 'top',
      pushAlerts: true,
      favoriteSubtopics: ['Aerei a Idrogeno & SAF', 'Lanciatori Starship & Falcon', 'Missioni Lunari Artemis'],
    },
    'Tech & AI': {
      interest: 'high',
      pushAlerts: true,
      favoriteSubtopics: ['Modelli LLM & Reasoning', 'Acceleratori Neurali a 2nm'],
    },
    'Cybersecurity': {
      interest: 'high',
      pushAlerts: false,
      favoriteSubtopics: ['Crittografia Post-Quantistica', 'Difesa Reti Satellitari'],
    },
    'Energia & Sostenibilità': {
      interest: 'high',
      pushAlerts: false,
      favoriteSubtopics: ['Fusione Nucleare Magnetica', 'Batterie a Stato Solido'],
    },
    'Scienza': {
      interest: 'medium',
    },
    'Mercati & Economia': {
      interest: 'medium',
    },
    'Geopolitica': {
      interest: 'medium',
    },
    'Italia': {
      interest: 'medium',
    },
    'Altro': {
      interest: 'low',
    },
  },
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
      title: 'Nuova generazione di aerei a idrogeno: conclusi con successo i test di volo in quota',
      category: 'Aerospazio & Aviazione',
      source: 'FlightGlobal & ESA',
      sourceUrl: 'https://www.esa.int',
      readingTimeMinutes: 3,
      impactScore: 96,
      summary: 'Completata la prima campagna di collaudo del prototipo di velivolo commerciale a celle a combustibile a idrogeno liquido e ala a flusso laminare naturale ad alta efficienza aerodinamica.',
      keyPoints: [
        'Zero emissioni dirette di CO2 e abbattimento dell\'80% del rumore acustico al decollo',
        'Autonomia confermata di oltre 1.800 km a Mach 0.78 con pieno carico utile di passeggeri',
        'Certificazione EASA prevista entro il 2028 per le prime rotte continentali a zero emissioni',
      ],
      whyCounts: 'Rappresenta la svolta ingegneristica più attesa dell\'aviazione civile: prova la fattibilità della propulsione pulita criogenica senza sacrificare prestazioni di crociera.',
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
      title: 'Lanciatori orbitali a recupero totale: successo storico per il test a combustione stadiata metano-LOX',
      category: 'Aerospazio & Aviazione',
      source: 'SpaceNews',
      sourceUrl: 'https://spacenews.com',
      readingTimeMinutes: 3,
      impactScore: 94,
      summary: 'Completato con atterraggio di precisione millimetrica il volo suborbitale del nuovo stadio propulsivo riutilizzabile, aprendo all\'accesso economico a orbite LEO e GEO.',
      keyPoints: [
        'Propulsori a ciclo chiuso con efficienza di impulso specifico (Isp) record a livello del mare',
        'Costo per chilogrammo in orbita ridotto del 70% rispetto ai vettori tradizionali sacrificabili',
        'Accordo siglato con agenzie spaziali europee per il trasporto cargo verso moduli scientifici',
      ],
      whyCounts: 'La riutilizzabilità rapida dei razzi è la chiave della new space economy: rende sostenibili stazioni orbitali commerciali ed esplorazione profonda del sistema solare.',
    },
    {
      id: 'art-10',
      title: 'Cybersecurity: direttiva globale per la crittografia post-quantistica',
      category: 'Cybersecurity',
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
    {
      id: 'art-11',
      title: 'Batterie a stato solido con elettrolita ceramico: triplicata l\'autonomia e ricarica in 8 minuti',
      category: 'Energia & Sostenibilità',
      source: 'ANSA Scienza & Tech',
      sourceUrl: 'https://www.ansa.it/canale_tecnologia',
      readingTimeMinutes: 2,
      impactScore: 94,
      summary: 'I laboratori europei completano i test di ciclo vitale sulla nuova cella litio-metallo con densità energetica gravimetrica superiore a 500 Wh/kg senza rischio di incendio.',
      keyPoints: [
        'Degrado inferiore al 5% dopo oltre 1.500 cicli completi di carica e scarica rapida',
        'Integrazione prevista su aerei ibridi a corto raggio e veicoli pesanti da trasporto',
        'Eliminazione totale del cobalto e uso ridotto di materie prime rare',
      ],
      whyCounts: 'Sblocca l\'elettrificazione del trasporto pesante e dell\'aviazione regionale, rendendo obsoleti i combustibili fossili per le medie distanze.',
    },
    {
      id: 'art-12',
      title: 'Scudo satellitare europeo: operativa la costellazione IRIS² per comunicazioni governative sicure',
      category: 'Cybersecurity',
      source: 'BBC World News',
      sourceUrl: 'https://www.bbc.com',
      readingTimeMinutes: 3,
      impactScore: 95,
      summary: 'L\'Unione Europea lancia i primi nodi orbitali per la rete crittografata quantistica indipendente che proteggerà comandi militari, diplomazia e reti energetiche.',
      keyPoints: [
        'Distribuzione quantistica delle chiavi (QKD) direttamente dallo spazio senza intercettabilità fisica',
        'Copertura continua del continente europeo, bacino del Mediterraneo e rotte artiche',
        'Piena interoperabilità con le stazioni di terra e le industrie aerospaziali europee',
      ],
      whyCounts: 'Fornisce sovranità digitale totale all\'Europa, garantendo comunicazioni invulnerabili anche in scenari di black-out o guerra elettronica.',
    },
  ],
};

// Fallback in memoria per browser mobile con IndexedDB disabilitato o in modalità anonima
const memoryStore = new Map<string, unknown>();

function isIndexedDBSupported(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return 'indexedDB' in window && window.indexedDB !== null && typeof window.indexedDB !== 'undefined';
  } catch {
    return false;
  }
}

let dbInstance: IDBPDatabase | null = null;
let dbPromise: Promise<IDBPDatabase | null> | null = null;

async function getDB(): Promise<IDBPDatabase | null> {
  if (!isIndexedDBSupported()) return null;
  if (dbInstance) return dbInstance;
  if (dbPromise) return dbPromise;

  dbPromise = (async () => {
    try {
      // Timeout rigido di 800ms: su iOS Safari, se un upgrade IndexedDB è bloccato da un'altra scheda,
      // openDB rimane appeso all'infinito. Il timeout garantisce che l'app NON si blocchi mai!
      const openPromise = openDB(DB_NAME, DB_VERSION, {
        upgrade(db) {
          try {
            if (!db.objectStoreNames.contains(STORE_BRIEFINGS)) {
              db.createObjectStore(STORE_BRIEFINGS, { keyPath: 'date' });
            }
            if (!db.objectStoreNames.contains(STORE_BOOKMARKS)) {
              db.createObjectStore(STORE_BOOKMARKS, { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains(STORE_PREFERENCES)) {
              db.createObjectStore(STORE_PREFERENCES);
            }
          } catch (e) {
            console.warn('[IDB] Errore upgrade schema:', e);
          }
        },
        blocked() {
          console.warn('[IDB] Upgrade bloccato su iOS');
        },
        blocking(currentVersion, blockedVersion, event) {
          // Chiude la connessione vecchia per consentire l'upgrade su iOS Safari
          try {
            const target = event.target as unknown as { result?: IDBDatabase };
            if (target && target.result && typeof target.result.close === 'function') {
              target.result.close();
            }
          } catch {}
        },
      });

      const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 800));
      const result = await Promise.race([openPromise, timeoutPromise]);

      if (result) {
        dbInstance = result;
        return dbInstance;
      }
      return null;
    } catch (err) {
      console.warn('[IDB] Inizializzazione fallita, uso fallback memoria/localStorage:', err);
      return null;
    } finally {
      dbPromise = null;
    }
  })();

  return dbPromise;
}

// Salva o aggiorna un briefing giornaliero in IndexedDB con fallback localStorage
export async function saveBriefing(briefing: DailyBriefing): Promise<void> {
  if (!briefing || !briefing.date) return;
  try {
    const cached: CachedBriefing = {
      date: briefing.date,
      briefing,
      cachedAt: Date.now(),
    };

    const db = await getDB();
    if (db) {
      await db.put(STORE_BRIEFINGS, cached);
    } else {
      // Fallback localStorage immediato per iPhone
      if (typeof window !== 'undefined' && window.localStorage) {
        try {
          window.localStorage.setItem(`briefing_${briefing.date}`, JSON.stringify(cached));
          window.localStorage.setItem('latest_briefing_date', briefing.date);
        } catch {}
      }
      memoryStore.set(`briefing_${briefing.date}`, cached);
    }
  } catch (err) {
    console.warn('[IDB] Errore salvataggio briefing:', err);
  }
}

// Recupera il briefing più recente salvato in locale (con garanzia di risposta istantanea)
export async function getLatestBriefing(): Promise<DailyBriefing | null> {
  try {
    const db = await getDB();
    if (db) {
      const all = await db.getAll(STORE_BRIEFINGS);
      if (all && all.length > 0) {
        const sorted = (all as CachedBriefing[]).sort((a, b) =>
          b.date.localeCompare(a.date)
        );
        return sorted[0]?.briefing ?? null;
      }
    }

    // Fallback localStorage per iPhone
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const latestDate = window.localStorage.getItem('latest_briefing_date');
        if (latestDate) {
          const raw = window.localStorage.getItem(`briefing_${latestDate}`);
          if (raw) {
            const parsed = JSON.parse(raw) as CachedBriefing;
            if (parsed && parsed.briefing) return parsed.briefing;
          }
        }
      } catch {}
    }

    return null;
  } catch (err) {
    console.warn('[IDB] Errore recupero ultimo briefing:', err);
    return null;
  }
}

// Recupera briefing per data specifica (Archivio Storico)
export async function getBriefingByDate(date: string): Promise<DailyBriefing | null> {
  if (!date) return null;
  try {
    const db = await getDB();
    if (db) {
      const cached = (await db.get(STORE_BRIEFINGS, date)) as CachedBriefing | undefined;
      return cached?.briefing ?? null;
    }

    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const raw = window.localStorage.getItem(`briefing_${date}`);
        if (raw) {
          const parsed = JSON.parse(raw) as CachedBriefing;
          return parsed.briefing || null;
        }
      } catch {}
    }
    return null;
  } catch {
    return null;
  }
}

// Restituisce tutte le date disponibili nei briefing memorizzati
export async function getAvailableBriefingDates(): Promise<string[]> {
  try {
    const db = await getDB();
    if (db) {
      const all = await db.getAllKeys(STORE_BRIEFINGS);
      return (all as string[]).sort((a, b) => b.localeCompare(a));
    }

    const dates: string[] = [];
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        for (let i = 0; i < window.localStorage.length; i++) {
          const key = window.localStorage.key(i);
          if (key && key.startsWith('briefing_')) {
            dates.push(key.replace('briefing_', ''));
          }
        }
      } catch {}
    }
    return dates.sort((a, b) => b.localeCompare(a));
  } catch {
    return [];
  }
}

// Segnalibri (Bookmarks) salvati localmente per lettura offline
export async function saveBookmark(article: Article): Promise<void> {
  if (!article || !article.id) return;
  try {
    const db = await getDB();
    if (db) {
      await db.put(STORE_BOOKMARKS, { ...article, savedAt: Date.now() });
    } else if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const current = await getBookmarks();
        const updated = [article, ...current.filter((b) => b.id !== article.id)];
        window.localStorage.setItem('user_bookmarks', JSON.stringify(updated));
      } catch {}
    }
  } catch (err) {
    console.warn('[IDB] Errore salvataggio bookmark:', err);
  }
}

export async function removeBookmark(articleId: string): Promise<void> {
  if (!articleId) return;
  try {
    const db = await getDB();
    if (db) {
      await db.delete(STORE_BOOKMARKS, articleId);
    } else if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const current = await getBookmarks();
        const updated = current.filter((b) => b.id !== articleId);
        window.localStorage.setItem('user_bookmarks', JSON.stringify(updated));
      } catch {}
    }
  } catch (err) {
    console.warn('[IDB] Errore rimozione bookmark:', err);
  }
}

export async function getBookmarks(): Promise<Article[]> {
  try {
    const db = await getDB();
    if (db) {
      const all = await db.getAll(STORE_BOOKMARKS);
      return (all as Article[]).sort(
        (a, b) =>
          ((b as { savedAt?: number }).savedAt || 0) - ((a as { savedAt?: number }).savedAt || 0)
      );
    }

    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const raw = window.localStorage.getItem('user_bookmarks');
        if (raw) return JSON.parse(raw);
      } catch {}
    }
    return [];
  } catch (err) {
    console.warn('[IDB] Errore recupero bookmarks:', err);
    return [];
  }
}

// Preferenze Utente (Densità, Tema, Font Size)
export async function getPreferences(): Promise<UserPreferences> {
  try {
    const db = await getDB();
    if (db) {
      const prefs = (await db.get(STORE_PREFERENCES, 'user_prefs')) as UserPreferences | undefined;
      return prefs || DEFAULT_PREFERENCES;
    }

    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const raw = window.localStorage.getItem('user_preferences');
        if (raw) return JSON.parse(raw);
      } catch {}
    }
    return DEFAULT_PREFERENCES;
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export async function savePreferences(prefs: UserPreferences): Promise<void> {
  try {
    const db = await getDB();
    if (db) {
      await db.put(STORE_PREFERENCES, prefs, 'user_prefs');
    }
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.setItem('user_preferences', JSON.stringify(prefs));
      } catch {}
    }
  } catch (err) {
    console.warn('[IDB] Errore salvataggio preferenze:', err);
  }
}
