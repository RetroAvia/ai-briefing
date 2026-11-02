import { openDB, type IDBPDatabase } from 'idb';
import type { CachedBriefing, DailyBriefing } from '@/types';

const DB_NAME = 'ai-briefing-db';
const DB_VERSION = 1;
const STORE_NAME = 'briefings';

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDB(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'date' });
        }
      },
    });
  }
  return dbPromise;
}

export async function saveBriefing(briefing: DailyBriefing): Promise<void> {
  const db = await getDB();
  const cached: CachedBriefing = {
    date: briefing.date,
    briefing,
    cachedAt: Date.now(),
  };
  await db.put(STORE_NAME, cached);
}

export async function getLatestBriefing(): Promise<DailyBriefing | null> {
  const db = await getDB();
  const all = await db.getAll(STORE_NAME);
  if (all.length === 0) return null;
  // Sort by date descending
  const sorted = (all as CachedBriefing[]).sort((a, b) =>
    b.date.localeCompare(a.date)
  );
  return sorted[0].briefing;
}

export async function getBriefingByDate(date: string): Promise<DailyBriefing | null> {
  const db = await getDB();
  const cached = await db.get(STORE_NAME, date) as CachedBriefing | undefined;
  return cached?.briefing ?? null;
}
