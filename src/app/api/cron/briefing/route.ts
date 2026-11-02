import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { fetchRecentArticles } from '@/lib/rss';
import OpenAI from 'openai';
import webpush from 'web-push';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// Configurazione lazy di Web Push per evitare errori a build-time
let vapidConfigured = false;
function configureVapid() {
  if (vapidConfigured) return;
  const subject = process.env.VAPID_SUBJECT;
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  if (!subject || !publicKey || !privateKey) {
    throw new Error('Variabili d\'ambiente VAPID mancanti (VAPID_SUBJECT, NEXT_PUBLIC_VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY)');
  }
  webpush.setVapidDetails(subject, publicKey, privateKey);
  vapidConfigured = true;
}

// Strict JSON Schema per OpenAI Structured Outputs
// NOTA IMPORTANTE: Per strict: true, additionalProperties: false è OBBLIGATORIO su ogni schema 'object'
const ARTICLES_SCHEMA = {
  type: 'object',
  properties: {
    articles: {
      type: 'array',
      items: {
        type: 'object',
        required: [
          'id',
          'title',
          'category',
          'source',
          'sourceUrl',
          'readingTimeMinutes',
          'keyPoints',
          'whyCounts',
          'summary',
          'impactScore',
        ],
        properties: {
          id: { type: 'string', description: 'Identificativo univoco progressivo (es. article-1)' },
          title: { type: 'string', description: 'Titolo incisivo in italiano (max 120 caratteri)' },
          category: {
            type: 'string',
            enum: [
              'Tech & AI',
              'Aerospazio & Aviazione',
              'Mercati & Economia',
              'Geopolitica',
              'Scienza',
              'Energia & Sostenibilità',
              'Cybersecurity',
              'Italia',
              'Altro',
            ],
          },
          source: { type: 'string', description: 'Nome della testata sorgente' },
          sourceUrl: { type: 'string', description: 'URL dell\'articolo originale' },
          readingTimeMinutes: { type: 'number', description: 'Tempo di lettura stimato tra 1 e 5 minuti' },
          impactScore: { type: 'number', description: 'Punteggio di impatto strategico da 1 a 100' },
          keyPoints: {
            type: 'array',
            items: { type: 'string' },
            description: 'Esattamente 3 punti chiave essenziali da scansionare visivamente',
          },
          whyCounts: { type: 'string', description: 'Takeaway strategico: perché questa notizia conta nel lungo termine' },
          summary: { type: 'string', description: 'Sintesi chiara e fluida di 2-3 frasi' },
        },
        additionalProperties: false,
      },
    },
  },
  required: ['articles'],
  additionalProperties: false,
};

export async function GET(req: NextRequest): Promise<NextResponse> {
  // Verifica token di autenticazione Bearer CRON_SECRET o query parameter ?key=
  const authHeader = req.headers.get('authorization');
  const searchParams = req.nextUrl.searchParams;
  const querySecret = searchParams.get('key');
  const expectedToken = process.env.CRON_SECRET;

  if (!expectedToken) {
    return NextResponse.json(
      { error: 'CRON_SECRET non configurato nelle variabili d\'ambiente' },
      { status: 500 }
    );
  }

  const isBearerValid = authHeader === `Bearer ${expectedToken}`;
  const isQueryValid = querySecret === expectedToken;

  if (!isBearerValid && !isQueryValid) {
    return NextResponse.json(
      { error: 'Non autorizzato: token Bearer o ?key errato o mancante' },
      { status: 401 }
    );
  }

  try {
    const today = new Date().toISOString().split('T')[0]!;

    // 1. Recupero notizie dai feed RSS affidabili
    console.log('[CRON] Avvio recupero articoli RSS...');
    const rawArticles = await fetchRecentArticles();

    if (rawArticles.length === 0) {
      return NextResponse.json(
        { error: 'Nessun articolo recuperato dalle fonti RSS' },
        { status: 422 }
      );
    }
    console.log(`[CRON] ${rawArticles.length} articoli recuperati con successo dalle fonti.`);

    // 2. Preparazione prompt per il modello LLM
    const articlesText = rawArticles
      .slice(0, 35)
      .map(
        (a, i) =>
          `[Notizia ${i + 1}]\nTitolo: ${a.title}\nFonte: ${a.source}\nURL: ${a.link}\nData: ${a.pubDate}\nEstratto: ${a.contentSnippet}`
      )
      .join('\n\n---\n\n');

    const systemPrompt = `Sei un Senior Editor e Giornalista d'intelligence esperto.
Il tuo obiettivo è sintetizzare le 10 notizie più cruciali della giornata per un professionista in movimento (lettura mattutina in metropolitana, offline-first).

Requisiti:
- Seleziona esattamente 10-12 notizie bilanciando con cura tutte le categorie: Tech & AI, Aerospazio & Aviazione, Mercati & Economia, Geopolitica, Scienza, Energia & Sostenibilità, Cybersecurity, Italia. Assicurati che ogni categoria sia rappresentata da notizie di alto valore.
- Scrivi in italiano impeccabile, chiaro e autorevole.
- Per ogni articolo fornisci:
  * id univoco: "article-1", "article-2", ...
  * titolo breve e potente (max 120 caratteri)
  * categoria rigorosamente scelta tra quelle consentite
  * esattamente 3 bullet point (keyPoints) chiari e non ridondanti
  * 'whyCounts': takeaway strategico (il "Perché conta")
  * 'summary': sintesi fluida (2-3 frasi)
  * 'readingTimeMinutes': 1-4 minuti
  * preserva 'source' e 'sourceUrl' dall'articolo sorgente corrispondente.`;

    const userPrompt = `Ecco le notizie più recenti estratte dai feed:\n\n${articlesText}\n\nGenera il briefing giornaliero delle 10 notizie fondamentali.`;

    // 3. Chiamata OpenAI con Structured Outputs rigido
    if (!process.env.LLM_API_KEY) {
      throw new Error('LLM_API_KEY non configurata nelle variabili d\'ambiente');
    }

    const openai = new OpenAI({
      apiKey: process.env.LLM_API_KEY,
      baseURL: process.env.LLM_BASE_URL || 'https://api.openai.com/v1',
    });

    console.log('[CRON] Invio richiesta all\'LLM con Structured Outputs...');
    const completion = await openai.chat.completions.create({
      model: process.env.LLM_MODEL || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'daily_briefing',
          strict: true,
          schema: ARTICLES_SCHEMA,
        },
      },
      temperature: 0.2,
      max_tokens: 4000,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) throw new Error('Risposta vuota ricevuta dal modello di intelligenza artificiale');

    const parsed = JSON.parse(content) as { articles: unknown[] };
    console.log(`[CRON] ${parsed.articles.length} articoli generati e validati con successo.`);

    // 4. Upsert nel database Supabase
    const supabase = createServiceClient();
    const { error: upsertError } = await supabase
      .from('daily_briefings')
      .upsert(
        {
          date: today,
          articles: parsed.articles,
        },
        { onConflict: 'date' }
      );

    if (upsertError) {
      throw new Error(`Errore durante il salvataggio su Supabase: ${upsertError.message}`);
    }
    console.log(`[CRON] Briefing per la data ${today} salvato su Supabase.`);

    // 5. Invio notifiche Web Push a tutti gli abbonati
    let notificationsSent = 0;
    let notificationsFailed = 0;

    try {
      configureVapid();
      const { data: subscriptions, error: subError } = await supabase
        .from('push_subscriptions')
        .select('endpoint, p256dh, auth');

      if (!subError && subscriptions && subscriptions.length > 0) {
        console.log(`[CRON] Invio notifiche a ${subscriptions.length} abbonati...`);
        const payload = JSON.stringify({
          title: '☀️ Il tuo Briefing di Oggi è pronto',
          body: `Scopri le ${parsed.articles.length} notizie essenziali selezionate dall'AI.`,
          icon: '/icons/icon-192x192.png',
          badge: '/icons/icon-96x96.png',
          tag: 'daily-briefing',
          url: '/',
        });

        await Promise.allSettled(
          subscriptions.map(async (sub) => {
            try {
              await webpush.sendNotification(
                {
                  endpoint: sub.endpoint as string,
                  keys: {
                    p256dh: sub.p256dh as string,
                    auth: sub.auth as string,
                  },
                },
                payload
              );
              notificationsSent++;
            } catch (err: unknown) {
              notificationsFailed++;
              // Rimozione automatica delle sottoscrizioni scadute o revocate (HTTP 410 Gone / 404)
              if (
                err instanceof Error &&
                'statusCode' in err &&
                ((err as { statusCode: number }).statusCode === 410 ||
                  (err as { statusCode: number }).statusCode === 404)
              ) {
                await supabase
                  .from('push_subscriptions')
                  .delete()
                  .eq('endpoint', sub.endpoint as string);
              }
            }
          })
        );
      }
    } catch (pushErr: unknown) {
      console.warn('[CRON] Web push saltate o parziali:', pushErr instanceof Error ? pushErr.message : pushErr);
    }

    return NextResponse.json({
      success: true,
      date: today,
      articlesCount: parsed.articles.length,
      notificationsSent,
      notificationsFailed,
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Errore interno del server';
    console.error('[CRON] Fallimento esecuzione briefing:', error);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
